/**
 * Auth provider/controller.
 *
 * Owns the Auth state machine (`auth-state.ts`), registers the Supabase Auth
 * listener, and resolves the operational access context. Per
 * `auth-session-contract.md` ("Callbacks do listener nao devem executar
 * cadeias assincronas longas dentro do callback"), the listener callback
 * only updates a small piece of state/schedules work; the actual
 * asynchronous identity/context revalidation always runs in a separate
 * effect, never directly inside `onAuthStateChange`.
 *
 * Any transition leaving `autorizado` clears the operational context and
 * protected content immediately (`data-model.md`).
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { AuthChangeEvent, Session, SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseClient } from "../../lib/supabase";
import { createAuditService, type AuditService } from "../../services/audit-service";
import { createAccessService, type AccessService } from "../access/access-service";
import {
  createInitialAuthState,
  transitionAuthState,
  type AuthState,
} from "./auth-state";
import { createAuthService, type AuthService } from "./auth-service";
import { createRecoveryService, type RecoveryService } from "./recovery-service";

export interface AuthProviderProps {
  children: ReactNode;
  /** Overrides for tests; production renders without these props. */
  supabase?: SupabaseClient;
  authService?: AuthService;
  accessService?: AccessService;
  auditService?: AuditService;
  recoveryService?: RecoveryService;
}

/**
 * Password-recovery authorization state, derived exclusively from the
 * `PASSWORD_RECOVERY` Auth event (`auth-session-contract.md`: "Exigir
 * evento/sessao de recovery valida"). `valido` only while a session arrived
 * with that event; any other Auth event, sign-out, or explicit cleanup
 * returns it to `invalido`. Never persisted outside memory.
 */
export type RecoveryState = "invalido" | "valido";

export interface AuthContextValue {
  state: AuthState;
  /** Triggers sign-in; resolves once Auth + context are settled. */
  signIn: (credentials: { email: string; password: string }) => Promise<{ ok: boolean; message?: string }>;
  /** Local-scope sign-out; clears protected state regardless of audit outcome. */
  signOut: () => Promise<void>;
  /** Re-runs identity/context revalidation outside any Auth callback. */
  revalidate: () => Promise<void>;
  /** Whether a valid `PASSWORD_RECOVERY` authorization is currently active. */
  recoveryState: RecoveryState;
  /** Completes the active recovery authorization with a new password. */
  confirmNewPassword: (newPassword: string) => Promise<{ ok: boolean; message?: string }>;
  /** Clears recovery state without contacting Supabase (safe exit/cleanup). */
  clearRecoveryState: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/** Pending revalidation reasons, queued by the Auth listener for an effect to pick up. */
type PendingRevalidation =
  | { reason: "initial"; token: number }
  | { reason: "auth-event"; event: AuthChangeEvent; session: Session | null; token: number };
type PendingRevalidationInput =
  | { reason: "initial" }
  | { reason: "auth-event"; event: AuthChangeEvent; session: Session | null };

export function AuthProvider({
  children,
  supabase,
  authService,
  accessService,
  auditService,
  recoveryService,
}: AuthProviderProps) {
  const client = useMemo(() => supabase ?? getSupabaseClient(), [supabase]);
  const auth = useMemo(() => authService ?? createAuthService(client), [authService, client]);
  const access = useMemo(() => accessService ?? createAccessService(client), [accessService, client]);
  const audit = useMemo(() => auditService ?? createAuditService(client), [auditService, client]);
  const recovery = useMemo(() => recoveryService ?? createRecoveryService(client), [recoveryService, client]);

  const [state, setState] = useState<AuthState>(createInitialAuthState());
  const [recoveryState, setRecoveryState] = useState<RecoveryState>("invalido");
  const recoveryActiveRef = useRef(false);
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Increments on every revalidation request so an in-flight resolution that
  // is no longer current can be discarded instead of overwriting a newer
  // result (defends against stale async responses after a fast SIGNED_OUT).
  const revalidationTokenRef = useRef(0);
  const initialSessionStartedRef = useRef(false);
  const signInInFlightRef = useRef(false);
  const logoutPromiseRef = useRef<Promise<void> | null>(null);
  // Remains true after an explicit logout until a new login/session starts.
  // This lets late Supabase callbacks and protected-route revalidation
  // distinguish a voluntary logout from an unexpected session expiration.
  const voluntaryLogoutRef = useRef(false);

  // Revalidation requests are queued via a ref + a numeric "tick" state.
  // Queuing happens outside any Auth callback (`revalidate`, sign-in, the
  // listener-registration effect) and the consuming effect below reads the
  // ref instead of calling `setState` synchronously from within itself.
  const queueRef = useRef<PendingRevalidation[]>([{ reason: "initial", token: 0 }]);
  const [queueTick, setQueueTick] = useState(0);

  const enqueueRevalidation = useCallback((item: PendingRevalidationInput) => {
    const token = ++revalidationTokenRef.current;
    queueRef.current.push({ ...item, token } as PendingRevalidation);
    setQueueTick((tick) => tick + 1);
  }, []);

  const setRecoveryAuthorization = useCallback((value: RecoveryState) => {
    recoveryActiveRef.current = value === "valido";
    setRecoveryState(value);
  }, []);

  const resolveContextForAuthUserId = useCallback(
    async (authUserId: string, token: number) => {
      setState((current) => transitionAuthState(current, { type: "IDENTIDADE_CONFIRMADA" }));

      const result = await access.resolveInitialContext(authUserId);

      if (token !== revalidationTokenRef.current) {
        // A newer revalidation superseded this one; discard the stale result.
        return;
      }

      if (result.status === "autorizado") {
        setState((current) => transitionAuthState(current, { type: "CONTEXTO_RESOLVIDO", context: result.context }));
        try {
          await audit.registrarEvento("acesso_interno_concedido");
        } catch {
          // best-effort
        }
        return;
      }

      if (result.status === "bloqueado") {
        setState((current) => transitionAuthState(current, { type: "CONTEXTO_BLOQUEADO", reason: result.reason }));
        try {
          await audit.registrarEvento("acesso_operacional_bloqueado");
        } catch {
          // best-effort
        }
        return;
      }

      setState((current) => transitionAuthState(current, { type: "CONTEXTO_FALHOU" }));
    },
    [access, audit],
  );

  // Runs the actual async revalidation work outside the Auth callback. Reads
  // (and drains) the ref-based queue rather than calling `setState`
  // synchronously inside the effect body.
  useEffect(() => {
    const next = queueRef.current.shift();
    if (!next) {
      return;
    }
    const item: PendingRevalidation = next;

    const { token } = item;

    async function run() {
      if (token !== revalidationTokenRef.current) {
        return;
      }

      if (item.reason === "initial") {
        initialSessionStartedRef.current = true;
        const { user } = await auth.resolveInitialSession();
        if (token !== revalidationTokenRef.current) return;

        if (!user) {
          setState((current) => transitionAuthState(current, { type: "SESSAO_AUSENTE" }));
          return;
        }

        setState((current) => transitionAuthState(current, { type: "SESSAO_PRESENTE" }));
        await resolveContextForAuthUserId(user.id, token);
        return;
      }

      // reason === "auth-event"
      const { event, session } = item;

      if (event === "SIGNED_OUT") {
        voluntaryLogoutRef.current = true;
        setState((current) => transitionAuthState(current, { type: "LOGOUT" }));
        setRecoveryAuthorization("invalido");
        return;
      }

      if (event === "PASSWORD_RECOVERY") {
        // Routed entirely outside the `onAuthStateChange` callback
        // (`auth-session-contract.md`: callbacks "nao devem executar cadeias
        // assincronas longas"; this effect is the only place that reacts).
        // A `PASSWORD_RECOVERY` session is a one-time recovery authorization,
        // never a normal authorized session (data-model.md): it intentionally
        // does not feed `resolveContextForAuthUserId`/`autorizado`.
        setRecoveryAuthorization(session?.user ? "valido" : "invalido");
        return;
      }

      if (!session?.user) {
        if (
          event === "INITIAL_SESSION" ||
          voluntaryLogoutRef.current ||
          stateRef.current.name === "inicializando" ||
          stateRef.current.name === "nao_autenticado"
        ) {
          setState((current) => transitionAuthState(current, { type: "LOGOUT" }));
          return;
        }
        setState((current) => transitionAuthState(current, { type: "SESSAO_EXPIROU" }));
        try {
          await audit.registrarEvento("sessao_expirada_detectada");
        } catch {
          // best-effort
        }
        return;
      }

      if (event === "INITIAL_SESSION" || event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
        voluntaryLogoutRef.current = false;
        // Confirm identity with the server before trusting the cached event.
        const { data, error } = await client.auth.getUser();
        if (token !== revalidationTokenRef.current) return;

        if (error || !data.user) {
          setState((current) => transitionAuthState(current, { type: "SESSAO_EXPIROU" }));
          try {
            await audit.registrarEvento("sessao_expirada_detectada");
          } catch {
            // best-effort
          }
          return;
        }

        setState((current) => transitionAuthState(current, { type: "SESSAO_PRESENTE" }));
        await resolveContextForAuthUserId(data.user.id, token);
      }
    }

    void run().finally(() => {
      // React may batch multiple enqueue ticks into one render. Ensure the
      // remaining queue is drained instead of stranding a later Auth event.
      if (queueRef.current.length > 0) {
        setQueueTick((tick) => tick + 1);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queueTick, setRecoveryAuthorization]);

  // Registers the Auth listener once. The callback itself never awaits
  // anything: it only queues a revalidation reason for the effect above.
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChange((event, session) => {
      // The explicit initial resolver above is the single source of truth for
      // startup. A late INITIAL_SESSION (especially null) must not supersede
      // a password login that has already started.
      if (event === "INITIAL_SESSION" && initialSessionStartedRef.current) {
        return;
      }
      // updateUser() emits USER_UPDATED during password recovery. That event
      // belongs to the one-time recovery flow and cannot promote the recovery
      // session into a regular operational session.
      if (event === "USER_UPDATED" && recoveryActiveRef.current) {
        return;
      }
      // signIn() confirms the returned identity and resolves the operational
      // context itself. Supabase emits SIGNED_IN/TOKEN_REFRESHED during that
      // same promise; processing those callbacks concurrently can supersede
      // the authoritative resolution and strand the UI in `autenticando`.
      if (
        signInInFlightRef.current &&
        (event === "SIGNED_IN" || event === "TOKEN_REFRESHED")
      ) {
        return;
      }
      if (stateRef.current.name === "autorizado") {
        setState((current) => transitionAuthState(current, { type: "REVALIDAR_CONTEXTO" }));
      }
      enqueueRevalidation({ reason: "auth-event", event, session });
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signIn = useCallback(
    async (credentials: { email: string; password: string }) => {
      initialSessionStartedRef.current = true;
      voluntaryLogoutRef.current = false;
      signInInFlightRef.current = true;
      // Supersede a possibly in-flight startup getUser() immediately. If its
      // null result were allowed to land during this request, it could move
      // `autenticando` back to `nao_autenticado` before context resolution.
      const token = ++revalidationTokenRef.current;
      setState((current) => transitionAuthState(current, { type: "LOGIN_INICIADO" }));
      try {
        const result = await auth.signIn(credentials);

        if (!result.ok) {
          setState((current) => transitionAuthState(current, { type: "LOGIN_FALHOU" }));
          return { ok: false, message: result.message };
        }

        await resolveContextForAuthUserId(result.user.id, token);
        return { ok: true };
      } finally {
        signInInFlightRef.current = false;
      }
    },
    [auth, resolveContextForAuthUserId],
  );

  const signOut = useCallback(async () => {
    voluntaryLogoutRef.current = true;
    // Hide protected content immediately, but keep the protected route in a
    // loading state until Supabase has actually removed the local session.
    // Redirecting to /login before that point would allow an immediate hard
    // navigation back to /app to restore the not-yet-cleared session.
    revalidationTokenRef.current += 1;
    setState((current) =>
      current.name === "autorizado"
        ? transitionAuthState(current, { type: "REVALIDAR_CONTEXTO" })
        : transitionAuthState(current, { type: "LOGOUT" }),
    );
    setRecoveryAuthorization("invalido");
    const logoutPromise = auth.signOut();
    logoutPromiseRef.current = logoutPromise;
    try {
      await logoutPromise;
    } finally {
      if (logoutPromiseRef.current === logoutPromise) {
        logoutPromiseRef.current = null;
      }
      setState((current) => transitionAuthState(current, { type: "LOGOUT" }));
    }
  }, [auth, setRecoveryAuthorization]);

  const revalidate = useCallback(async () => {
    const token = ++revalidationTokenRef.current;
    setState((current) => transitionAuthState(current, { type: "REVALIDAR_CONTEXTO" }));

    // A protected URL may be entered as soon as local state redirects away
    // from the shell. Wait for the corresponding Supabase local revocation
    // before checking getUser(), otherwise the just-closed session can be
    // restored for one navigation.
    await logoutPromiseRef.current;
    if (token !== revalidationTokenRef.current) return;

    const { data, error } = await client.auth.getUser();
    if (token !== revalidationTokenRef.current) return;

    if (error || !data.user) {
      const event =
        voluntaryLogoutRef.current ||
        stateRef.current.name === "inicializando" ||
        stateRef.current.name === "nao_autenticado"
          ? { type: "LOGOUT" as const }
          : { type: "SESSAO_EXPIROU" as const };
      setState((current) => transitionAuthState(current, event));
      return;
    }

    voluntaryLogoutRef.current = false;
    await resolveContextForAuthUserId(data.user.id, token);
  }, [client, resolveContextForAuthUserId]);

  const clearRecoveryState = useCallback(() => {
    setRecoveryAuthorization("invalido");
  }, [setRecoveryAuthorization]);

  const confirmNewPassword = useCallback(
    async (newPassword: string) => {
      const result = await recovery.confirmNewPassword(newPassword);

      if (result.ok) {
        // The password-recovery authorization is itself a Supabase session.
        // Clear it explicitly so reload/USER_UPDATED cannot grant operational
        // access without a fresh sign-in using the new password.
        setRecoveryAuthorization("invalido");
        try {
          await client.auth.signOut({ scope: "local" });
        } finally {
          revalidationTokenRef.current += 1;
          setState((current) => transitionAuthState(current, { type: "LOGOUT" }));
        }
      }
      // On failure (e.g. weak/reused password), keep the recovery
      // authorization valid so the user can correct the input and retry
      // without the link being treated as invalid/expired.
      return result;
    },
    [client, recovery, setRecoveryAuthorization],
  );

  const value = useMemo<AuthContextValue>(
    () => ({ state, signIn, signOut, revalidate, recoveryState, confirmNewPassword, clearRecoveryState }),
    [state, signIn, signOut, revalidate, recoveryState, confirmNewPassword, clearRecoveryState],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used within <AuthProvider>.");
  }
  return value;
}
