import type {
  ImportPreview,
  ImportResult,
  ParsedMmsFile,
  ParsedMmsRow,
} from "../../src/modules/importacoes-mms/types";

export const MMS_HEADERS = [
  "Data",
  "Área de Trabalho",
  "Número da Assistência",
  "Parte do Conjunto",
  "Tipo de Atividade",
  "Status da Atividade",
] as const;

export function buildParsedRow(overrides: Partial<ParsedMmsRow> = {}): ParsedMmsRow {
  return {
    sourceRowNumber: 2,
    rawValuesByOriginalHeader: {
      Data: "27/06/2026",
      "Área de Trabalho": "Posto A",
      "Número da Assistência": "AST-001",
      "Parte do Conjunto": "PARTE-A",
      "Tipo de Atividade": "Montagem em Conjunto",
      "Status da Atividade": "Concluído",
    },
    ...overrides,
  };
}

export function buildFakeFile(
  contents = "Data;Área de Trabalho\n27/06/2026;Posto A",
  name = "valido.csv",
  type = "text/csv",
): File {
  return new File([contents], name, { type });
}

export function buildParsedFile(overrides: Partial<ParsedMmsFile> = {}): ParsedMmsFile {
  const file = buildFakeFile();
  return {
    file,
    extension: "csv",
    mimeType: "text/csv",
    originalName: file.name,
    sizeBytes: file.size,
    headersOriginal: [...MMS_HEADERS],
    rows: [buildParsedRow()],
    totalDataRows: 1,
    areaTrabalhoOriginal: "Posto A",
    dataAtividade: "2026-06-27",
    ...overrides,
  };
}

export function buildImportPreview(overrides: Partial<ImportPreview> = {}): ImportPreview {
  return {
    loteId: "61000000-0000-0000-0000-000000000001",
    arquivo: "valido.csv",
    posto: { id: "40000000-0000-0000-0000-000000000001", nome: "Posto A" },
    dataAtividade: "2026-06-27",
    status: "importado",
    totalLinhas: 1,
    totalAssistencias: 1,
    totalPartes: 1,
    linhasValidas: 1,
    linhasComAlerta: 0,
    linhasInvalidas: 0,
    totalErros: 0,
    totalAlertas: 0,
    podeConfirmar: true,
    erros: [],
    alertas: [],
    ...overrides,
  };
}

export function buildImportResult(overrides: Partial<ImportResult> = {}): ImportResult {
  return {
    loteId: "61000000-0000-0000-0000-000000000001",
    arquivo: "valido.csv",
    posto: "Posto A",
    dataAtividade: "2026-06-27",
    processado: true,
    status: "importado",
    assistenciasCriadas: 1,
    assistenciasAtualizadas: 0,
    assistenciasPreservadas: 0,
    assistenciasRemovidas: 0,
    assistenciasReativadas: 0,
    partesCriadas: 1,
    partesAtualizadas: 0,
    partesPreservadas: 0,
    partesRemovidas: 0,
    partesReativadas: 0,
    linhasInvalidas: 0,
    linhasComAlerta: 0,
    processadoEm: "2026-06-27T12:00:00.000Z",
    ...overrides,
  };
}
