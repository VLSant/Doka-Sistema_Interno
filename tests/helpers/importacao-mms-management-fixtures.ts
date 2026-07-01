import { vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  CorrectionResult,
  LotDetail,
  LotSummary,
  OperationResult,
  PaginatedResult,
  UndoAnalysis,
} from "../../src/modules/importacoes-mms/types";

export const lotSummary: LotSummary = {
  lote_id: "70000000-0000-4000-8000-000000000002",
  importado_em: "2099-07-01T09:00:00.000Z",
  data_atividade: "2099-07-01",
  postos: [{ id: "10000000-0000-4000-8000-000000000001", nome: "Posto A" }],
  visibilidade_parcial: false,
  usuario_importador: { id: "20000000-0000-4000-8000-000000000001", nome: "Admin" },
  arquivo: "spec007.csv",
  status: "erro",
  estado_processamento: "validado",
  total_linhas: 2,
  total_assistencias: 1,
  total_partes: 1,
  total_erros_pendentes: 1,
  total_alertas: 0,
  precisa_tratamento: true,
  capacidades: {
    abrir: true, baixar_arquivo: true, corrigir: true,
    concluir_tratamento: true, reprocessar: false, analisar_desfazer: false,
  },
};

export const lotDetail: LotDetail = {
  ...lotSummary,
  versao_tratamento: 1,
  versao_processada: null,
  resultado_processamento: null,
  codigo_ultima_falha: null,
  caminho_arquivo: "user/lot/file.csv",
  tipo_cancelamento: null,
};

export const correctionResult: CorrectionResult = {
  correcao_id: "73000000-0000-4000-8000-000000000001",
  linha_id: "71000000-0000-4000-8000-000000000003",
  campo: "numero_assistencia",
  valor_efetivo: "AST-007-B",
  versao: 1,
  erros_pendentes: 0,
};

export const operationResult: OperationResult = {
  operacao_id: "74000000-0000-4000-8000-000000000001",
  lote_id: lotSummary.lote_id,
  tipo: "reprocessamento",
  estado: "concluida",
  chave_idempotencia: "75000000-0000-4000-8000-000000000001",
  resultado: { processado: true },
  codigo_falha: null,
};

export const undoAnalysis: UndoAnalysis = {
  lote_id: lotSummary.lote_id,
  elegivel: true,
  versao_tratamento: 1,
  assinatura_analise: "assinatura-opaca",
  analisado_em: "2099-07-01T11:00:00.000Z",
  escopos: [{
    posto_id: lotSummary.postos[0].id,
    data_atividade: "2099-07-01",
    lote_predecessor_id: "70000000-0000-4000-8000-000000000001",
  }],
  impacto: { assistencias_restauradas: 1, partes_restauradas: 1 },
  motivos_bloqueio: [],
};

export function page<T>(itens: T[]): PaginatedResult<T> {
  return { itens, proximo_cursor: null };
}

export function rpcClient(responses: Record<string, unknown>) {
  const rpc = vi.fn(async (name: string) => {
    const response = responses[name];
    if (response instanceof Error) {
      return { data: null, error: { message: response.message, details: "", hint: "", code: "P0001" } };
    }
    return { data: response, error: null };
  });
  const createSignedUrl = vi.fn(async () => ({ data: { signedUrl: "https://example.test/file" }, error: null }));
  return {
    client: {
      rpc,
      storage: { from: () => ({ createSignedUrl }) },
    } as unknown as SupabaseClient,
    rpc,
    createSignedUrl,
  };
}
