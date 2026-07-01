import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseClient } from "../../lib/supabase";
import type {
  AssistanceCursor,
  AssistanceDetail,
  AssistanceError,
  AssistanceErrorCode,
  AssistanceFilters,
  AssistanceHistoryEvent,
  AssistanceListItem,
  CorrectionInput,
  CorrectionResult,
  HistoryCursor,
  PaginatedResult,
} from "./types";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const KNOWN_CODES = new Set<AssistanceErrorCode>([
  "acesso_negado",
  "campo_nao_corrigivel",
  "correcao_desatualizada",
  "cursor_invalido",
  "falha_temporaria",
  "filtros_invalidos",
  "justificativa_obrigatoria",
  "registro_removido",
  "valor_invalido",
  "vinculo_somente_consulta",
]);

const MESSAGES: Record<AssistanceErrorCode, string> = {
  acesso_negado: "Você não possui acesso a esta assistência.",
  campo_nao_corrigivel: "Este campo não permite correção.",
  correcao_desatualizada: "A assistência foi alterada. Recarregue e revise antes de salvar.",
  cursor_invalido: "Não foi possível continuar a paginação.",
  falha_temporaria: "Não foi possível concluir a operação. Tente novamente.",
  filtros_invalidos: "Revise os filtros informados.",
  justificativa_obrigatoria: "Informe uma justificativa para a correção.",
  registro_removido: "Registros removidos não podem ser corrigidos.",
  valor_invalido: "Informe um valor válido.",
  vinculo_somente_consulta: "Seu vínculo permite somente consulta neste posto.",
};

export function mapAssistanceError(error: PostgrestError | Error): AssistanceError {
  const code =
    [...KNOWN_CODES].find((candidate) => error.message.includes(candidate)) ??
    (error.message.includes("JWT") ? "acesso_negado" : "falha_temporaria");
  const mapped = new Error(MESSAGES[code]) as AssistanceError;
  mapped.code = code;
  mapped.retryable = code === "falha_temporaria";
  return mapped;
}

function validUuid(value: string): boolean {
  return UUID.test(value);
}

export function validateAssistanceCursor(
  cursor?: AssistanceCursor | null,
): AssistanceCursor | null {
  if (!cursor) return null;
  if (!validUuid(cursor.id) || Number.isNaN(Date.parse(`${cursor.data_atividade}T00:00:00Z`))) {
    throw mapAssistanceError(new Error("cursor_invalido"));
  }
  return cursor;
}

export function validateHistoryCursor(cursor?: HistoryCursor | null): HistoryCursor | null {
  if (!cursor) return null;
  if (!validUuid(cursor.id) || Number.isNaN(Date.parse(cursor.created_at))) {
    throw mapAssistanceError(new Error("cursor_invalido"));
  }
  return cursor;
}

async function rpc<T>(
  client: SupabaseClient,
  name: string,
  args: Record<string, unknown>,
): Promise<T> {
  const { data, error } = await client.rpc(name, args);
  if (error) throw mapAssistanceError(error);
  return data as T;
}

export interface AssistanceService {
  list(
    filters?: AssistanceFilters,
    cursor?: AssistanceCursor | null,
    limit?: number,
  ): Promise<PaginatedResult<AssistanceListItem, AssistanceCursor>>;
  detail(assistanceId: string, includeRemovedParts?: boolean): Promise<AssistanceDetail>;
  correctField(input: CorrectionInput): Promise<CorrectionResult>;
  history(
    assistanceId: string,
    cursor?: HistoryCursor | null,
    limit?: number,
  ): Promise<PaginatedResult<AssistanceHistoryEvent, HistoryCursor>>;
}

export function createAssistanceService(
  client: SupabaseClient = getSupabaseClient(),
): AssistanceService {
  return {
    async list(filters = {}, cursor = null, limit = 50) {
      const safeCursor = validateAssistanceCursor(cursor);
      return rpc<PaginatedResult<AssistanceListItem, AssistanceCursor>>(
        client,
        "listar_assistencias_mms",
        {
          p_filtros: filters,
          p_cursor_data_atividade: safeCursor?.data_atividade ?? null,
          p_cursor_id: safeCursor?.id ?? null,
          p_limite: Math.min(Math.max(limit, 1), 100),
        },
      );
    },
    detail(assistanceId, includeRemovedParts = false) {
      return rpc<AssistanceDetail>(client, "obter_detalhe_assistencia_mms", {
        p_assistencia_id: assistanceId,
        p_incluir_partes_removidas: includeRemovedParts,
      });
    },
    correctField(input) {
      return rpc<CorrectionResult>(client, "corrigir_campo_assistencia_mms", {
        p_tipo_entidade: input.tipo_entidade,
        p_entidade_id: input.entidade_id,
        p_campo: input.campo,
        p_valor_corrigido: input.valor_corrigido,
        p_justificativa: input.justificativa,
        p_versao_esperada: input.versao_esperada,
      });
    },
    async history(assistanceId, cursor = null, limit = 50) {
      const safeCursor = validateHistoryCursor(cursor);
      return rpc<PaginatedResult<AssistanceHistoryEvent, HistoryCursor>>(
        client,
        "listar_historico_assistencia_mms",
        {
          p_assistencia_id: assistanceId,
          p_cursor_created_at: safeCursor?.created_at ?? null,
          p_cursor_id: safeCursor?.id ?? null,
          p_limite: Math.min(Math.max(limit, 1), 100),
        },
      );
    },
  };
}
