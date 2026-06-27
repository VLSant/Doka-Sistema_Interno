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

export interface AuthProviderProps {
  children: ReactNode;
  /** Overrides for tests; production renders without these props. */
  supabase?: SupabaseClient;
  authService?: AuthService;
  accessService?: AccessService;
  auditService?: AuditService;
}

export interface AuthContextValue {
  state: AuthState;
  /** Triggers sign-in; resolves once Auth + context are settled. */
  signIn: (credentials: { email: string; password: string }) => Promise<{ ok: boolean; message?: string }>;
  /** Local-scope sign-out; clears protected state regardless of audit outcome. */
  signOut: () => Promise<void>;
  /** Re-runs identity/context revalidation outside any Auth callback. */
  revalidate: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/** Pending revalidation reasons, queued by the Auth listener for an effect to pick up. */
type PendingRevalidation = { reason: "initial" } | { reason: "auth-event"; event: AuthChangeEvent; session: Session | null };

export function AuthProvider({ children, supabase, authService, accessService, auditService }: AuthProviderProps) {
  const client = useMemo(() => supabase ?? getSupabaseClient(), [supabase]);
  const auth = useMemo(() => authService ?? createAuthService(client), [authService, client]);
  const access = useMemo(() => accessService ?? createAccessService(client), [accessService, client]);
  const audit = useMemo(() => auditService ?? createAuditService(client), [auditService, client]);

  const [state, setState] = useState<AuthState>(createInitialAuthState());
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Increments on every revalidation request so an in-flight resolution that
  // is no longer current can be discarded instead of overwriting a newer
  // result (defends against stale async responses after a fast SIGNED_OUT).
  const revalidationTokenRef = useRef(0);

  // Revalidation requests are queued via a ref + a numeric "tick" state.
  // Queuing happens outside any Auth callback (`revalidate`, sign-in, the
  // listener-registration effect) and the consuming effect below reads the
  // ref instead of calling `setState` synchronously from within itself.
  const queueRef = useRef<PendingRevalidation[]>([{ reason: "initial" }]);
  const [queueTick, setQueueTick] = useState(0);

  const enqueueRevalidation = useCallback((item: PendingRevalidation) => {
    queueRef.current.push(item);
    setQueueTick((tick) => tick + 1);
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

    const token = ++revalidationTokenRef.current;

    async function run() {
      if (item.reason === "initial") {
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
        setState((current) => transitionAuthState(current, { type: "LOGOUT" }));
        return;
      }

      if (!session?.user) {
        setState((current) => transitionAuthState(current, { type: "SESSAO_EXPIROU" }));
        try {
          await audit.registrarEvento("sessao_expirada_detectada");
        } catch {
          // best-effort
        }
        return;
      }

      if (event === "INITIAL_SESSION" || event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
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

    void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queueTick]);

  // Registers the Auth listener once. The callback itself never awaits
  // anything: it only queues a revalidation reason for the effect above.
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChange((event, session) => {
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
      setState((current) => transitionAuthState(current, { type: "LOGIN_INICIADO" }));
      const result = await auth.signIn(credentials);

      if (!result.ok) {
        setState((current) => transitionAuthState(current, { type: "LOGIN_FALHOU" }));
        return { ok: false, message: result.message };
      }

      const token = ++revalidationTokenRef.current;
      await resolveContextForAuthUserId(result.user.id, token);
      return { ok: true };
    },
    [auth, resolveContextForAuthUserId],
  );

  const signOut = useCallback(async () => {
    await auth.signOut();
    revalidationTokenRef.current += 1;
    setState((current) => transitionAuthState(current, { type: "LOGOUT" }));
  }, [auth]);

  const revalidate = useCallback(() => {
    enqueueRevalidation({ reason: "initial" });
  }, [enqueueRevalidation]);

  const value = useMemo<AuthContextValue>(() => ({ state, signIn, signOut, revalidate }), [state, signIn, signOut, revalidate]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used within <AuthProvider>.");
  }
  return value;
}
