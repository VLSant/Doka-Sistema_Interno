import { describe, expect, it } from "vitest";
import {
  mapTabularRows,
  normalizeDate,
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

  it("partitions one file into independent area groups", () => {
    const file = new File(["x"], "mms.csv", { type: "text/csv" });
    const parsed = mapTabularRows(
      [
        header,
        ["21/05/26", "Posto A", "AST-1", "P-1", "Montagem em Conjunto", "Concluído"],
        ["21/05/26", "Posto B", "AST-2", "P-2", "Montagem em Conjunto", "Concluído"],
        ["21/05/26", "Posto A", "AST-3", "P-3", "Montagem em Conjunto", "Concluído"],
      ],
      file,
      "csv",
    );

    expect(parsed.dataAtividade).toBe("2026-05-21");
    expect(parsed.areaGroups.map((group) => [group.areaTrabalhoOriginal, group.totalDataRows]))
      .toEqual([["Posto A", 2], ["Posto B", 1]]);
    expect(normalizeDate("21/05/26")).toBe("2026-05-21");
  });

  it("ignores auxiliary export rows without area, type and status", () => {
    const file = new File(["x"], "mms.csv", { type: "text/csv" });
    const parsed = mapTabularRows(
      [
        header,
        ["21/05/26", "Posto A", "AST-1", "P-1", "Montagem em Conjunto", "Concluído"],
        ["A - Sim", "", "A - Sim", "A - Não", "", ""],
      ],
      file,
      "csv",
    );
    expect(parsed.totalDataRows).toBe(1);
    expect(parsed.ignoredAuxiliarySourceRows).toEqual([3]);
  });

  it("reports source lines with activity content that cannot be assigned to an area", () => {
    const file = new File(["x"], "mms.csv", { type: "text/csv" });
    expect(() => mapTabularRows(
      [
        header,
        ["21/05/26", "", "AST-1", "P-1", "Montagem em Conjunto", "Concluído"],
      ],
      file,
      "csv",
    )).toThrow("Área de Trabalho ausente nas linhas: 2.");
  });
});
