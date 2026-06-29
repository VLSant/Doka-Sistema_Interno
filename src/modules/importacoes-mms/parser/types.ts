export type MmsFileExtension = "csv" | "xlsx";
export type JsonSafeValue = string | number | boolean | null | JsonSafeValue[];

export interface ParsedMmsRow {
  sourceRowNumber: number;
  rawValuesByOriginalHeader: Record<string, JsonSafeValue>;
}

export interface ParsedMmsAreaGroup {
  areaTrabalhoOriginal: string;
  rows: ParsedMmsRow[];
  totalDataRows: number;
}

export interface ParsedMmsFile {
  file: File;
  extension: MmsFileExtension;
  mimeType: string;
  originalName: string;
  sizeBytes: number;
  headersOriginal: string[];
  rows: ParsedMmsRow[];
  totalDataRows: number;
  ignoredAuxiliarySourceRows: number[];
  areaGroups: ParsedMmsAreaGroup[];
  /** Compatibility value for single-area consumers; batch code uses areaGroups. */
  areaTrabalhoOriginal: string;
  dataAtividade: string;
}

export type ParserErrorCode =
  | "arquivo_incompativel"
  | "arquivo_vazio"
  | "arquivo_muito_grande"
  | "estrutura_incompativel"
  | "coluna_obrigatoria_ausente"
  | "cabecalho_duplicado"
  | "multiplas_datas"
  | "multiplas_areas_trabalho"
  | "area_trabalho_ausente"
  | "data_invalida";

export class MmsParserError extends Error {
  readonly code: ParserErrorCode;

  constructor(
    code: ParserErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "MmsParserError";
    this.code = code;
  }
}
