import { describe, expect, it } from "vitest";
import {
  mapTabularRows,
  normalizeHeader,
  toJsonSafeCell,
} from "../../../src/modules/importacoes-mms/parser/row-mapper";

const header = ["Data", "Área de Trabalho", "Número da Assistência", "Parte do Conjunto", "Tipo de Atividade", "Status da Atividade"];

describe("MMS row mapper", () => {
  it("canonicalizes headers only for matching and keeps original raw keys", () => {
    expect(normalizeHeader("  ÁREA de Trabalho ")).toBe("area de trabalho");
    const file = new File(["x"], "mms.csv", { type: "text/csv" });
    const parsed = mapTabularRows(
      [header, ["27/06/2026", "Posto A", "AST-1", "P-1", "Montagem em Conjunto", "Concluído"]],
      file,
      "csv",
    );
    expect(parsed.rows[0].sourceRowNumber).toBe(2);
    expect(parsed.rows[0].rawValuesByOriginalHeader["Área de Trabalho"]).toBe("Posto A");
  });

  it("converts Date values deterministically and ignores fully blank rows", () => {
    expect(toJsonSafeCell(new Date("2026-06-27T00:00:00Z"))).toBe("2026-06-27T00:00:00.000Z");
    const file = new File(["x"], "mms.xlsx", {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const parsed = mapTabularRows(
      [[], header, ["2026-06-27", "Posto A", "AST-1", "P-1", "Montagem em Conjunto", "Concluído"], []],
      file,
      "xlsx",
    );
    expect(parsed.totalDataRows).toBe(1);
    expect(parsed.rows[0].sourceRowNumber).toBe(3);
  });
});
