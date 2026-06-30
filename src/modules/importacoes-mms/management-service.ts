import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseClient } from "../../lib/supabase";
import type {
  ManagementCursor,
  ManagementError,
  ManagementErrorCode,
  PaginatedResult,
} from "./types";

const KNOWN_CODES = new Set<ManagementErrorCode>([
  "acesso_negado",
  "analise_desatualizada",
  "chave_idempotencia_conflitante",
  "correcao_desatualizada",
  "correcao_invalida",
  "cursor_invalido",
  "filtros_invalidos",
  "operacao_em_andamento",
  "tratamento_incompleto",
  "falha_temporaria",
]);

export function managementError(error: PostgrestError | Error): ManagementError {
  const candidate = [...KNOWN_CODES].find((code) => error.message.includes(code));
  const code = candidate ?? (error.message.includes("JWT") ? "acesso_negado" : "falha_temporaria");
  const mapped = new Error(
    code === "acesso_negado"
      ? "Você não possui acesso a este lote."
      : code === "falha_temporaria"
        ? "Não foi possível concluir a operação. Tente novamente."
        : error.message,
  ) as ManagementError;
  mapped.code = code;
  mapped.retryable = code === "falha_temporaria" || code === "operacao_em_andamento";
  return mapped;
}

export function validateCursor(cursor?: ManagementCursor | null): ManagementCursor | null {
  if (!cursor) return null;
  if (
    !cursor.id ||
    Number.isNaN(Date.parse(cursor.created_at)) ||
    !/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(cursor.id)
  ) {
    throw managementError(new Error("cursor_invalido"));
  }
  return cursor;
}

export function mapPage<T>(value: unknown): PaginatedResult<T> {
  const payload = (value ?? {}) as { itens?: T[]; proximo_cursor?: ManagementCursor | null };
  return {
    itens: Array.isArray(payload.itens) ? payload.itens : [],
    proximo_cursor: payload.proximo_cursor ? validateCursor(payload.proximo_cursor) : null,
  };
}

export async function rpc<T>(
  name: string,
  args: Record<string, unknown>,
  client: SupabaseClient = getSupabaseClient(),
): Promise<T> {
  const { data, error } = await client.rpc(name, args);
  if (error) throw managementError(error);
  return data as T;
}

export function createManagementClient(client?: SupabaseClient) {
  return client ?? getSupabaseClient();
}
