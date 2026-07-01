import type { SupabaseClient } from "@supabase/supabase-js";
import { mapPage, rpc, validateCursor } from "./management-service";
import type {
  LotCollection,
  LotDetail,
  LotFilters,
  LotItem,
  LotSummary,
  ManagementCursor,
  PaginatedResult,
} from "./types";

export interface LotService {
  list(filters?: LotFilters, cursor?: ManagementCursor | null, limit?: number): Promise<PaginatedResult<LotSummary>>;
  detail(lotId: string): Promise<LotDetail>;
  items(lotId: string, collection: LotCollection, cursor?: ManagementCursor | null, limit?: number): Promise<PaginatedResult<LotItem>>;
  downloadOriginal(lot: LotDetail): Promise<void>;
}

export function createLotService(client?: SupabaseClient): LotService {
  return {
    async list(filters = {}, cursor = null, limit = 50) {
      const safeCursor = validateCursor(cursor);
      const result = await rpc<unknown>("listar_lotes_importacao_mms", {
        p_filtros: filters,
        p_cursor_created_at: safeCursor?.created_at ?? null,
        p_cursor_id: safeCursor?.id ?? null,
        p_limite: Math.min(Math.max(limit, 1), 100),
      }, client);
      return mapPage<LotSummary>(result);
    },
    detail(lotId) {
      return rpc<LotDetail>("obter_detalhe_lote_importacao_mms", { p_lote_id: lotId }, client);
    },
    async items(lotId, collection, cursor = null, limit = 50) {
      const result = await rpc<unknown>("listar_itens_lote_importacao_mms", {
        p_lote_id: lotId,
        p_colecao: collection,
        p_filtros: {},
        p_cursor: validateCursor(cursor) ?? {},
        p_limite: Math.min(Math.max(limit, 1), 100),
      }, client);
      return mapPage<LotItem>(result);
    },
    async downloadOriginal(lot) {
      if (!lot.capacidades.baixar_arquivo || !lot.caminho_arquivo) {
        throw new Error("acesso_negado");
      }
      const supabase = client;
      if (!supabase) throw new Error("falha_temporaria");
      const { data, error } = await supabase.storage
        .from("mms-importacoes")
        .createSignedUrl(lot.caminho_arquivo, 60);
      if (error) throw error;
      window.location.assign(data.signedUrl);
    },
  };
}
