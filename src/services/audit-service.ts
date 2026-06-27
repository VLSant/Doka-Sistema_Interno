/**
 * Typed client-side wrapper for `public.registrar_evento_autenticacao`.
 *
 * Audit calls are always best-effort: a failure here must never block or
 * alter the Auth/access flow (`audit-contract.md` Client Behavior).
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseClient } from "../lib/supabase";

/** Allowlisted actions accepted by the RPC (`audit-contract.md`). */
export type AuditAction =
  | "acesso_interno_concedido"
  | "sessao_encerrada"
  | "sessao_expirada_detectada"
  | "acesso_operacional_bloqueado";

export interface AuditService {
  registrarEvento(acao: AuditAction): Promise<void>;
}

/**
 * Creates an audit service bound to a Supabase client. Defaults to the
 * shared browser client but accepts an injected client for tests.
 */
export function createAuditService(client?: SupabaseClient): AuditService {
  const resolvedClient = client ?? getSupabaseClient();
  return {
    async registrarEvento(acao: AuditAction): Promise<void> {
      try {
        await resolvedClient.rpc("registrar_evento_autenticacao", { p_acao: acao });
      } catch {
        // Best-effort: audit failures never propagate to the caller and
        // never affect the Auth/access flow.
      }
    },
  };
}

let defaultAuditService: AuditService | undefined;

/** Lazily-created default audit service bound to the shared browser client. */
export function getAuditService(): AuditService {
  if (!defaultAuditService) {
    defaultAuditService = createAuditService();
  }
  return defaultAuditService;
}
