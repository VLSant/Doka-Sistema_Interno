import { mapTabularRows, validateFileMetadata } from "./row-mapper";
import { MmsParserError, type ParsedMmsFile } from "./types";

export async function parseXlsxFile(file: File): Promise<ParsedMmsFile> {
  const extension = validateFileMetadata(file);
  if (extension !== "xlsx") {
    throw new MmsParserError("arquivo_incompativel", "O arquivo não é XLSX.");
  }
  try {
    const { default: readXlsxFile } = await import("read-excel-file/browser");
    const sheets = await readXlsxFile(file, { trim: false });
    const nonEmpty = sheets.filter((sheet) =>
      sheet.data.some((row) => row.some((cell) => cell !== null && String(cell) !== "")),
    );
    if (nonEmpty.length !== 1) {
      throw new MmsParserError(
        "estrutura_incompativel",
        "O XLSX deve conter uma única planilha não vazia.",
      );
    }
    return mapTabularRows(nonEmpty[0].data, file, "xlsx");
  } catch (error) {
    if (error instanceof MmsParserError) throw error;
    throw new MmsParserError(
      "arquivo_incompativel",
      "O XLSX está corrompido, protegido ou usa um formato incompatível.",
    );
  }
}

export async function parseMmsFile(file: File): Promise<ParsedMmsFile> {
  const extension = validateFileMetadata(file);
  if (extension === "xlsx") return parseXlsxFile(file);
  const { parseCsvFile } = await import("./csv-parser");
  return parseCsvFile(file);
}
