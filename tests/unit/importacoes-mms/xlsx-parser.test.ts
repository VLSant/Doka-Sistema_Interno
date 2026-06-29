import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { parseXlsxFile } from "../../../src/modules/importacoes-mms/parser/xlsx-parser";

async function fixture(name: string): Promise<File> {
  const path = resolve(process.cwd(), "tests", "fixtures", "mms", name);
  const bytes = await readFile(path);
  return new File([bytes], name, {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

describe("XLSX MMS parser", () => {
  it("reads a valid workbook and keeps typed cells JSON-safe", async () => {
    const parsed = await parseXlsxFile(await fixture("valido.xlsx"));
    expect(parsed.totalDataRows).toBe(1);
    expect(parsed.areaTrabalhoOriginal).toBe("Posto A");
  });

  it("accepts multiple parts in one logical table", async () => {
    const parsed = await parseXlsxFile(await fixture("multiplas-partes.xlsx"));
    expect(parsed.totalDataRows).toBe(2);
  });

  it("rejects multiple non-empty sheets and corrupt workbooks", async () => {
    await expect(parseXlsxFile(await fixture("multiplas-planilhas.xlsx"))).rejects.toThrow();
    await expect(parseXlsxFile(await fixture("corrompido.xlsx"))).rejects.toThrow();
  });
});
