/**
 * Auth service: sign-in, server-confirmed identity, Auth listener
 * registration, initial-session resolution, and local-scope sign-out.
 *
 * Follows `auth-session-contract.md` and `audit-contract.md`. Audit calls
 * are best-effort and never affect the Auth flow.
 */
import type { AuthChangeEvent, Session, SupabaseClient, User } from "@supabase/supabase-js";
import { getSupabaseClient } from "../../lib/supabase";
import { createAuditService, type AuditService } from "../../services/audit-service";

export interface SignInCredentials {
  email: string;
  password: string;
}

export type SignInResult = { ok: true; user: User } | { ok: false; message: string };

export interface InitialSessionResult {
  user: User | null;
  session: Session | null;
}

/** Neutral PT-BR message: never reveals whether the e-mail or password was wrong. */
const NEUTRAL_CREDENTIALS_ERROR_MESSAGE = "Nao foi possivel confirmar suas credenciais. Verifique os dados informados e tente novamente.";

export type AuthListener = (event: AuthChangeEvent, session: Session | null) => void;

export interface AuthService {
  signIn(credentials: SignInCredentials): Promise<SignInResult>;
  resolveInitialSession(): Promise<InitialSessionResult>;
  signOut(): Promise<void>;
  onAuthStateChange(listener: AuthListener): () => void;
}

/**
 * Creates the Auth service bound to a Supabase client. Defaults to the
 * shared browser client but accepts an injected client/audit service for
 * tests.
 */
export function createAuthService(
  client?: SupabaseClient,
  audit?: AuditService,
): AuthService {
  const resolvedClient = client ?? getSupabaseClient();
  const resolvedAudit = audit ?? createAuditService(resolvedClient);
  return {
    async signIn({ email, password }: SignInCredentials): Promise<SignInResult> {
      const normalizedEmail = email.trim();
      const { data, error } = await resolvedClient.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (error || !data.user) {
        return { ok: false, message: NEUTRAL_CREDENTIALS_ERROR_MESSAGE };
      }

      // Confirm identity with the server (never trust only the local sign-in
      // response) before treating the user as authenticated.
      const { data: confirmedData, error: confirmedError } = await resolvedClient.auth.getUser();
      if (confirmedError || !confirmedData.user) {
        return { ok: false, message: NEUTRAL_CREDENTIALS_ERROR_MESSAGE };
      }

      return { ok: true, user: confirmedData.user };
    },

    async resolveInitialSession(): Promise<InitialSessionResult> {
      const { data, error } = await resolvedClient.auth.getUser();
      if (error || !data.user) {
        return { user: null, session: null };
      }
      return { user: data.user, session: null };
    },

    async signOut(): Promise<void> {
      // Audit before revocation, but never let an audit failure prevent the
      // session from being cleared (`audit-contract.md` Client Behavior).
      try {
        await resolvedAudit.registrarEvento("sessao_encerrada");
      } catch {
        // best-effort
      }

      try {
        await resolvedClient.auth.signOut({ scope: "local" });
      } catch {
        // Logout must still be considered "completed" locally even if the
        // network call fails; the caller clears local state regardless.
      }
    },

    onAuthStateChange(listener: AuthListener): () => void {
      const { data } = resolvedClient.auth.onAuthStateChange(listener);
      return () => {
        data.subscription.unsubscribe();
      };
    },
  };
}

let defaultAuthService: AuthService | undefined;

/** Lazily-created default Auth service bound to the shared browser client. */
export function getAuthService(): AuthService {
  if (!defaultAuthService) {
    defaultAuthService = createAuthService();
  }
  return defaultAuthService;
}
