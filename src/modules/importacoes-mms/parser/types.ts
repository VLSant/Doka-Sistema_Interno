export type MmsFileExtension = "csv" | "xlsx";
export type JsonSafeValue = string | number | boolean | null;

export interface ParsedMmsRow {
  sourceRowNumber: number;
  rawValuesByOriginalHeader: Record<string, JsonSafeValue>;
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
