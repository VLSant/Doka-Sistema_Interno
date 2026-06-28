import { describe, expect, it } from "vitest";
import { mapImportResult } from "../../../src/modules/importacoes-mms/import-service";

describe("reimport result reconciliation", () => {
  it("preserves server counters without client recomputation", () => {
    const result = mapImportResult({
      lote_id: "lote-reimportado",
      processado: true,
      status: "importado",
      assistencias_preservadas: 2,
      assistencias_atualizadas: 1,
      partes_criadas: 1,
      partes_removidas: 1,
      partes_reativadas: 1,
    });
    expect(result).toMatchObject({
      assistenciasPreservadas: 2,
      assistenciasAtualizadas: 1,
      partesCriadas: 1,
      partesRemovidas: 1,
      partesReativadas: 1,
    });
  });
});
