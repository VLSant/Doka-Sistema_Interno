import type { SupabaseClient } from "@supabase/supabase-js";
import { rpc } from "./management-service";
import type {
  CorrectionInput,
  CorrectionResult,
  OperationResult,
  UndoAnalysis,
} from "./types";

export interface TreatmentService {
  saveCorrection(input: CorrectionInput): Promise<CorrectionResult>;
  conclude(lotId: string, expectedVersion: number): Promise<Record<string, unknown>>;
  reprocess(lotId: string, expectedVersion: number, idempotencyKey: string): Promise<OperationResult>;
  operation(lotId: string, idempotencyKey: string): Promise<OperationResult>;
  analyzeUndo(lotId: string): Promise<UndoAnalysis>;
  undo(lotId: string, signature: string, reason: string, idempotencyKey: string): Promise<OperationResult>;
}

export function createTreatmentService(client?: SupabaseClient): TreatmentService {
  return {
    saveCorrection(input) {
      return rpc("salvar_correcao_importacao_mms", {
        p_lote_id: input.lote_id,
        p_linha_id: input.linha_id,
        p_campo: input.campo,
        p_valor: input.valor,
        p_versao_esperada: input.versao_esperada,
        p_justificativa: input.justificativa ?? null,
      }, client);
    },
    conclude(lotId, expectedVersion) {
      return rpc("concluir_tratamento_importacao_mms", {
        p_lote_id: lotId,
        p_versao_esperada: expectedVersion,
      }, client);
    },
    reprocess(lotId, expectedVersion, idempotencyKey) {
      return rpc("reprocessar_lote_importacao_mms", {
        p_lote_id: lotId,
        p_versao_esperada: expectedVersion,
        p_chave_idempotencia: idempotencyKey,
      }, client);
    },
    operation(lotId, idempotencyKey) {
      return rpc("obter_operacao_lote_mms", {
        p_lote_id: lotId,
        p_chave_idempotencia: idempotencyKey,
      }, client);
    },
    analyzeUndo(lotId) {
      return rpc("analisar_desfazer_importacao_mms", { p_lote_id: lotId }, client);
    },
    undo(lotId, signature, reason, idempotencyKey) {
      return rpc("desfazer_importacao_mms", {
        p_lote_id: lotId,
        p_assinatura_analise: signature,
        p_justificativa: reason,
        p_chave_idempotencia: idempotencyKey,
      }, client);
    },
  };
}
