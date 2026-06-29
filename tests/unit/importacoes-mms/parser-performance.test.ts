import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { parseCsvText } from "../../../src/modules/importacoes-mms/parser/csv-parser";

describe("MMS parser representative volume", () => {
  it("parses 10.000 CSV rows within the local 30 second budget", async () => {
    const text = await readFile(
      resolve(process.cwd(), "tests/fixtures/mms/performance-10000.csv"),
      "utf8",
    );
    const file = new File([text], "performance-10000.csv", { type: "text/csv" });
    const started = performance.now();
    const parsed = parseCsvText(text, file);
    const elapsed = performance.now() - started;
    expect(parsed.totalDataRows).toBe(10_000);
    expect(elapsed).toBeLessThan(30_000);
  });
});
