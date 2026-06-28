import { describe, expect, it } from "vitest";
import { parseCsvText } from "../../../src/modules/importacoes-mms/parser/csv-parser";
import { MmsParserError } from "../../../src/modules/importacoes-mms/parser/types";

const headers = "Data;Área de Trabalho;Número da Assistência;Parte do Conjunto;Tipo de Atividade;Status da Atividade";

describe("CSV MMS parser", () => {
  it("preserves original headers and quoted values without dynamic typing", () => {
    const file = new File(["x"], "mms.csv", { type: "text/csv" });
    const parsed = parseCsvText(
      `\uFEFF${headers}\n27/06/2026;Posto A;000123;PARTE-A;Montagem em Conjunto;Concluído`,
      file,
    );
    expect(parsed.headersOriginal).toContain("Área de Trabalho");
    expect(parsed.rows[0].rawValuesByOriginalHeader["Número da Assistência"]).toBe("000123");
    expect(parsed.dataAtividade).toBe("2026-06-27");
  });

  it("accepts comma and tab delimiters with quoted separators", () => {
    const commaHeaders = headers.replaceAll(";", ",");
    const file = new File(["x"], "mms.csv", { type: "text/csv" });
    const parsed = parseCsvText(
      `${commaHeaders}\n27/06/2026,Posto A,AST-1,PARTE-A,Montagem em Conjunto,Concluído`,
      file,
    );
    expect(parsed.totalDataRows).toBe(1);
  });

  it("blocks duplicate required headers", () => {
    const file = new File(["x"], "mms.csv", { type: "text/csv" });
    expect(() =>
      parseCsvText(
        `${headers};Data\n27/06/2026;Posto A;AST-1;PARTE-A;Montagem em Conjunto;Concluído;27/06/2026`,
        file,
      ),
    ).toThrowError(MmsParserError);
  });

  it("accepts duplicate unused headers and preserves every original value", () => {
    const file = new File(["x"], "mms.csv", { type: "text/csv" });
    const parsed = parseCsvText(
      `${headers};Campo Extra;Campo Extra\n27/06/2026;Posto A;AST-1;PARTE-A;Montagem em Conjunto;Concluído;A;B`,
      file,
    );

    expect(parsed.headersOriginal.filter((header) => header === "Campo Extra")).toHaveLength(2);
    expect(parsed.rows[0].rawValuesByOriginalHeader["Campo Extra"]).toEqual(["A", "B"]);
  });

  it("blocks different aliases of the same consumed field", () => {
    const file = new File(["x"], "mms.csv", { type: "text/csv" });
    expect(() =>
      parseCsvText(
        `${headers};Recurso;Recurso / Montador\n27/06/2026;Posto A;AST-1;PARTE-A;Montagem em Conjunto;Concluído;A;B`,
        file,
      ),
    ).toThrowError(MmsParserError);
  });
});
