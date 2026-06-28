import { describe, expect, it } from "vitest";
import {
  mapImportIssueRows,
  mapImportResult,
} from "../../../src/modules/importacoes-mms/import-service";

describe("mapImportResult", () => {
  it("maps the immutable server payload", () => {
    const result = mapImportResult({
      lote_id: "lote-1",
      processado: true,
      status: "importado",
      arquivo: "mms.csv",
      posto: "Posto A",
      data_atividade: "2026-06-27",
      partes_preservadas: 3,
      processado_em: "2026-06-27T12:00:00Z",
    });
    expect(result.partesPreservadas).toBe(3);
    expect(result.processado).toBe(true);
  });

  it("rejects malformed or negative counters", () => {
    expect(() => mapImportResult({ processado: true })).toThrow();
    expect(() => mapImportResult({ lote_id: "x", processado: true, partes_criadas: -1 })).toThrow();
  });

  it("maps source row numbers from PostgREST embedded relations", () => {
    expect(mapImportIssueRows([
      {
        id: "erro-1",
        codigo: "data_invalida",
        mensagem: "Data inválida.",
        campo: "Data",
        mms_linhas_importacao: { numero_linha_origem: 34 },
      },
      {
        id: "erro-2",
        codigo: "status_invalido",
        mensagem: "Status inválido.",
        campo: "Status",
        mms_linhas_importacao: [{ numero_linha_origem: 51 }],
      },
    ]).map((issue) => issue.linha)).toEqual([34, 51]);
  });
});
