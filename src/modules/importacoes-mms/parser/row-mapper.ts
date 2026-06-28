import {
  MmsParserError,
  type JsonSafeValue,
  type MmsFileExtension,
  type ParsedMmsFile,
  type ParsedMmsRow,
} from "./types";

export const MAX_MMS_FILE_SIZE = 25 * 1024 * 1024;
export const REQUIRED_MMS_HEADERS = [
  "Data",
  "Área de Trabalho",
  "Número da Assistência",
  "Parte do Conjunto",
  "Tipo de Atividade",
  "Status da Atividade",
] as const;

const ALLOWED_MIME_TYPES: Record<MmsFileExtension, string[]> = {
  csv: ["text/csv", "application/csv", "application/vnd.ms-excel", ""],
  xlsx: ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", ""],
};

export function normalizeHeader(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLocaleLowerCase("pt-BR")
    .replace(/\s+/g, " ");
}

export function detectFileExtension(name: string): MmsFileExtension {
  const extension = name.split(".").pop()?.toLowerCase();
  if (extension !== "csv" && extension !== "xlsx") {
    throw new MmsParserError("arquivo_incompativel", "Selecione um arquivo CSV ou XLSX.");
  }
  return extension;
}

export function validateFileMetadata(file: File): MmsFileExtension {
  const extension = detectFileExtension(file.name);
  if (file.size <= 0) {
    throw new MmsParserError("arquivo_vazio", "O arquivo selecionado está vazio.");
  }
  if (file.size > MAX_MMS_FILE_SIZE) {
    throw new MmsParserError("arquivo_muito_grande", "O arquivo deve ter no máximo 25 MiB.");
  }
  if (!ALLOWED_MIME_TYPES[extension].includes(file.type)) {
    throw new MmsParserError(
      "arquivo_incompativel",
      "A extensão e o tipo do arquivo não correspondem.",
    );
  }
  return extension;
}

export function validateHeaders(headers: JsonSafeValue[]): string[] {
  const original = headers.map((header) => String(header ?? ""));
  const normalized = original.map(normalizeHeader);
  if (normalized.some((header) => !header)) {
    throw new MmsParserError("estrutura_incompativel", "Existem cabeçalhos vazios.");
  }
  if (new Set(normalized).size !== normalized.length) {
    throw new MmsParserError("cabecalho_duplicado", "Existem cabeçalhos duplicados.");
  }
  const missing = REQUIRED_MMS_HEADERS.filter(
    (required) => !normalized.includes(normalizeHeader(required)),
  );
  if (missing.length > 0) {
    throw new MmsParserError(
      "coluna_obrigatoria_ausente",
      `Colunas obrigatórias ausentes: ${missing.join(", ")}.`,
    );
  }
  return original;
}

export function toJsonSafeCell(value: unknown): JsonSafeValue {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value;
  }
  return String(value);
}

function isEmptyRow(row: JsonSafeValue[]): boolean {
  return row.every((value) => value === null || String(value).trim() === "");
}

export function mapTabularRows(
  rows: unknown[][],
  file: File,
  extension: MmsFileExtension,
): ParsedMmsFile {
  const safeRows = rows.map((row) => row.map(toJsonSafeCell));
  const firstNonEmpty = safeRows.findIndex((row) => !isEmptyRow(row));
  if (firstNonEmpty < 0) {
    throw new MmsParserError("arquivo_vazio", "O arquivo não contém dados.");
  }
  const headers = validateHeaders(safeRows[firstNonEmpty]);
  const bodyRows = safeRows.slice(firstNonEmpty + 1);
  const parsedRows: ParsedMmsRow[] = bodyRows.flatMap((values, index) => {
    if (isEmptyRow(values)) return [];
    const rawValuesByOriginalHeader = Object.fromEntries(
      headers.map((header, columnIndex) => [header, values[columnIndex] ?? null]),
    );
    return [{
      sourceRowNumber: firstNonEmpty + index + 2,
      rawValuesByOriginalHeader,
    }];
  });
  if (parsedRows.length === 0) {
    throw new MmsParserError("arquivo_vazio", "O arquivo não contém linhas de dados.");
  }

  const headerByCanonical = new Map(
    headers.map((header) => [normalizeHeader(header), header] as const),
  );
  const areaHeader = headerByCanonical.get(normalizeHeader("Área de Trabalho"))!;
  const dateHeader = headerByCanonical.get(normalizeHeader("Data"))!;
  const areas = new Set(
    parsedRows
      .map((row) => String(row.rawValuesByOriginalHeader[areaHeader] ?? "").trim())
      .filter(Boolean),
  );
  if (areas.size !== 1) {
    throw new MmsParserError(
      "multiplas_areas_trabalho",
      "O arquivo deve conter uma única Área de Trabalho.",
    );
  }
  const dates = new Set(
    parsedRows
      .map((row) => normalizeDate(row.rawValuesByOriginalHeader[dateHeader]))
      .filter((value): value is string => Boolean(value)),
  );
  if (dates.size !== 1) {
    throw new MmsParserError("multiplas_datas", "O arquivo deve conter uma única data válida.");
  }

  return {
    file,
    extension,
    mimeType: file.type,
    originalName: file.name,
    sizeBytes: file.size,
    headersOriginal: headers,
    rows: parsedRows,
    totalDataRows: parsedRows.length,
    areaTrabalhoOriginal: [...areas][0],
    dataAtividade: [...dates][0],
  };
}

export function normalizeDate(value: unknown): string | null {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  const text = String(value ?? "").trim();
  const br = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(text);
  const iso = /^(\d{4})-(\d{2})-(\d{2})(?:T.*)?$/.exec(text);
  const parts = br ? [br[3], br[2], br[1]] : iso ? [iso[1], iso[2], iso[3]] : null;
  if (!parts) return null;
  const candidate = `${parts[0]}-${parts[1]}-${parts[2]}`;
  const parsed = new Date(`${candidate}T00:00:00Z`);
  return Number.isNaN(parsed.valueOf()) || parsed.toISOString().slice(0, 10) !== candidate
    ? null
    : candidate;
}
