import type { SupabaseClient } from "@supabase/supabase-js";
import { vi } from "vitest";
import type {
  AssistanceDetail,
  AssistanceHistoryEvent,
  AssistanceListItem,
  CorrectionResult,
  PaginatedResult,
} from "../../src/modules/assistencias-mms/types";

export const assistanceItem: AssistanceListItem = {
  assistencia_id: "81000000-0000-4000-8000-000000000001",
  numero_assistencia: "ASS-008",
  posto: { id: "40000000-0000-4000-8000-000000000001", nome: "Posto A" },
  data_atividade: "2026-06-30",
  cliente: "Cliente corrigido",
  tipo: "MONTAGEM",
  status: "CONCLUÍDA",
  situacao: "ativo",
  total_partes_ativas: 1,
  total_partes: 2,
  versao_registro: 4,
};

export const assistanceDetail: AssistanceDetail = {
  ...assistanceItem,
  tipo_original: "Montagem",
  cliente: {
    importado: "Cliente MMS",
    corrigido: "Cliente corrigido",
    vigente: "Cliente corrigido",
    origem_vigente: "correcao",
  },
  endereco: {
    importado: "Rua MMS",
    corrigido: null,
    vigente: "Rua MMS",
    origem_vigente: "importacao",
  },
  origem: {
    lote_criacao_id: "82000000-0000-4000-8000-000000000001",
    linha_criacao_id: "83000000-0000-4000-8000-000000000001",
    lote_ultimo_id: "82000000-0000-4000-8000-000000000002",
    linha_ultima_id: "83000000-0000-4000-8000-000000000002",
  },
  capacidades: { corrigir_assistencia: true, consultar_historico: true },
  partes_removidas_ocultas: 1,
  partes: [
    {
      parte_id: "84000000-0000-4000-8000-000000000001",
      parte_conjunto: "ARMÁRIO",
      situacao: "ativo",
      status: "CONCLUÍDA",
      tipo_original: "Montagem",
      tipo: "MONTAGEM",
      descricao_mercadoria: {
        importado: "Armário",
        corrigido: null,
        vigente: "Armário",
        origem_vigente: "importacao",
      },
      recurso: {
        importado: "Montador A",
        corrigido: "Montador B",
        vigente: "Montador B",
        origem_vigente: "correcao",
      },
      origem: {
        lote_criacao_id: "82000000-0000-4000-8000-000000000001",
        linha_criacao_id: "83000000-0000-4000-8000-000000000001",
        lote_ultimo_id: "82000000-0000-4000-8000-000000000002",
        linha_ultima_id: "83000000-0000-4000-8000-000000000002",
      },
      versao_registro: 2,
      pode_corrigir: true,
    },
  ],
};

export const correctionResult: CorrectionResult = {
  tipo_entidade: "assistencia",
  entidade_id: assistanceItem.assistencia_id,
  campo: "cliente_nome",
  importado: "Cliente MMS",
  corrigido: "Cliente novo",
  vigente: "Cliente novo",
  origem_vigente: "correcao",
  versao_registro: 5,
  corrigido_em: "2026-06-30T15:00:00Z",
  corrigido_por: { id: "30000000-0000-4000-8000-000000000001", nome: "Operador" },
};

export const historyEvent: AssistanceHistoryEvent = {
  evento_id: "85000000-0000-4000-8000-000000000001",
  created_at: "2026-06-30T15:00:00Z",
  tipo: "correcao",
  acao: "corrigido",
  entidade: "assistencia",
  entidade_id: assistanceItem.assistencia_id,
  parte_conjunto: null,
  campo: "cliente_nome",
  valor_anterior: "Cliente MMS",
  valor_novo: "Cliente novo",
  justificativa: "Correção confirmada.",
  ator: { id: "30000000-0000-4000-8000-000000000001", nome: "Operador" },
  origem: {
    lote_id: "82000000-0000-4000-8000-000000000002",
    linha_id: "83000000-0000-4000-8000-000000000002",
    pode_abrir_lote: true,
  },
};

export function assistancePage<T>(itens: T[]): PaginatedResult<T, never> {
  return { itens, proximo_cursor: null };
}

export function assistanceRpcClient(responses: Record<string, unknown>) {
  const rpc = vi.fn(async (name: string) => {
    const response = responses[name];
    if (response instanceof Error) {
      return {
        data: null,
        error: { message: response.message, details: "", hint: "", code: "P0001" },
      };
    }
    return { data: response, error: null };
  });
  return { client: { rpc } as unknown as SupabaseClient, rpc };
}
