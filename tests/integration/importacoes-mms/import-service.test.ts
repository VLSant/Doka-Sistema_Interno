import { describe, expect, it } from "vitest";
import {
  chunkStagingRows,
  findUnavailableMmsAreas,
} from "../../../src/modules/importacoes-mms/import-service";

describe("MMS staging orchestration", () => {
  it("splits 10.000 rows into authoritative blocks of at most 250", () => {
    const rows = Array.from({ length: 10_000 }, (_, index) => index + 1);
    const chunks = chunkStagingRows(rows);
    expect(chunks).toHaveLength(40);
    expect(chunks.every((chunk) => chunk.length <= 250)).toBe(true);
    expect(chunks.flat()).toEqual(rows);
  });

  it("rejects block sizes outside the RPC contract", () => {
    expect(() => chunkStagingRows([1], 0)).toThrow();
    expect(() => chunkStagingRows([1], 251)).toThrow();
  });

  it("preflights every partition against postos visible under RLS", () => {
    const groups = [
      { areaTrabalhoOriginal: "CARPINA - 845", rows: [], totalDataRows: 0 },
      { areaTrabalhoOriginal: "KING-RECIFE - 847", rows: [], totalDataRows: 0 },
    ];
    expect(findUnavailableMmsAreas(groups, [
      { nome: "Carpina - 845", codigo: "CARPINA" },
    ])).toEqual(["KING-RECIFE - 847"]);
  });
});
