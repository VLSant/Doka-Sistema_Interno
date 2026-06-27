/**
 * Password-recovery service: request (neutral result, exact redirect) and
 * completion (`updateUser` orchestration).
 *
 * Follows `auth-session-contract.md` Password Recovery and `research.md`
 * #7 (official Supabase client-side SPA recovery flow, exact redirect
 * allowlist entry, no recovery material persisted by Doka). Errors are
 * always mapped to a fixed PT-BR message: the raw Supabase error string is
 * never surfaced, since it could otherwise be used to enumerate accounts or
 * leak password-policy implementation details verbatim.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseClient } from "../../lib/supabase";
import { loadAppEnv } from "../../lib/env";

export type RequestRecoveryResult = { ok: true };

export type ConfirmPasswordResult = { ok: true } | { ok: false; message: string };

export interface RecoveryService {
  /**
   * Always resolves with the same neutral `{ ok: true }` result regardless
   * of whether the e-mail is registered (`auth-session-contract.md`:
   * "Mostrar a mesma confirmacao neutra para e-mail existente ou
   * inexistente"). Never throws.
   */
  requestPasswordRecovery(email: string): Promise<RequestRecoveryResult>;
  /** Orchestrates `updateUser` for the active recovery session. */
  confirmNewPassword(newPassword: string): Promise<ConfirmPasswordResult>;
}

const GENERIC_PASSWORD_ERROR_MESSAGE =
  "Nao foi possivel definir a nova senha. Verifique se ela atende aos requisitos minimos e tente novamente.";

const SAME_PASSWORD_ERROR_MESSAGE = "A nova senha deve ser diferente da senha atual.";

const EXPIRED_SESSION_ERROR_MESSAGE =
  "Este link de recuperacao nao e mais valido. Solicite um novo link para continuar.";

/**
 * Maps a raw Supabase `updateUser` error to a fixed, safe PT-BR message.
 * Never echoes the raw error text or the submitted password.
 */
function mapUpdatePasswordError(rawMessage: string | undefined): string {
  const message = (rawMessage ?? "").toLowerCase();

  if (message.includes("different from the old password") || message.includes("should be different")) {
    return SAME_PASSWORD_ERROR_MESSAGE;
  }

  if (
    message.includes("session missing") ||
    message.includes("expired") ||
    message.includes("invalid") ||
    message.includes("jwt")
  ) {
    return EXPIRED_SESSION_ERROR_MESSAGE;
  }

  return GENERIC_PASSWORD_ERROR_MESSAGE;
}

/**
 * Builds the exact `/redefinir-senha` redirect URL from the validated
 * `VITE_APP_URL`, regardless of a trailing slash
 * (`auth-session-contract.md`: "redirect exato para `/redefinir-senha`").
 */
export function buildResetPasswordRedirectUrl(appUrl: string): string {
  const normalizedBase = appUrl.replace(/\/+$/, "");
  return `${normalizedBase}/redefinir-senha`;
}

export interface RecoveryServiceOptions {
  appUrl?: string;
}

/**
 * Creates the recovery service bound to a Supabase client. Defaults to the
 * shared browser client/validated env but accepts injected overrides for
 * tests.
 */
export function createRecoveryService(
  client?: SupabaseClient,
  options: RecoveryServiceOptions = {},
): RecoveryService {
  const resolvedClient = client ?? getSupabaseClient();

  return {
    async requestPasswordRecovery(email: string): Promise<RequestRecoveryResult> {
      const normalizedEmail = email.trim();
      const appUrl = options.appUrl ?? loadAppEnv().appUrl;
      const redirectTo = buildResetPasswordRedirectUrl(appUrl);

      try {
        await resolvedClient.auth.resetPasswordForEmail(normalizedEmail, { redirectTo });
      } catch {
        // Never let a transport/network failure change the neutral result
        // observable by the caller (no account enumeration signal).
      }

      return { ok: true };
    },

    async confirmNewPassword(newPassword: string): Promise<ConfirmPasswordResult> {
      try {
        const { error } = await resolvedClient.auth.updateUser({ password: newPassword });
        if (error) {
          return { ok: false, message: mapUpdatePasswordError(error.message) };
        }
        return { ok: true };
      } catch {
        return { ok: false, message: GENERIC_PASSWORD_ERROR_MESSAGE };
      }
    },
  };
}

let defaultRecoveryService: RecoveryService | undefined;

/** Lazily-created default recovery service bound to the shared browser client. */
export function getRecoveryService(): RecoveryService {
  if (!defaultRecoveryService) {
    defaultRecoveryService = createRecoveryService();
  }
  return defaultRecoveryService;
}
