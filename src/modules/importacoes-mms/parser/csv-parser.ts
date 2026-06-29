import Papa from "papaparse";
import { mapTabularRows, validateFileMetadata } from "./row-mapper";
import { MmsParserError, type ParsedMmsFile } from "./types";

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new MmsParserError("arquivo_incompativel", "Não foi possível ler o CSV."));
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.readAsText(file, "UTF-8");
  });
}

export function parseCsvText(text: string, file: File): ParsedMmsFile {
  const result = Papa.parse<string[]>(text.replace(/^\uFEFF/, ""), {
    header: false,
    dynamicTyping: false,
    skipEmptyLines: false,
    delimitersToGuess: [",", ";", "\t", "|"],
  });
  const blocking = result.errors.find((error) => error.type === "Quotes" || error.type === "Delimiter");
  if (blocking) {
    throw new MmsParserError("estrutura_incompativel", "O CSV está malformado ou usa delimitador incompatível.");
  }
  return mapTabularRows(result.data, file, "csv");
}

export async function parseCsvFile(file: File): Promise<ParsedMmsFile> {
  const extension = validateFileMetadata(file);
  if (extension !== "csv") {
    throw new MmsParserError("arquivo_incompativel", "O arquivo não é CSV.");
  }
  return parseCsvText(await readFileAsText(file), file);
}
