import { describe, expect, it } from "vitest";
import { mapPage } from "../../../src/modules/importacoes-mms/management-service";

describe("management cursor mapping performance", () => {
  it("maps a 10,000-row RPC payload without offset or quadratic work", () => {
    const itens = Array.from({ length: 10_000 }, (_, index) => ({
      lote_id: crypto.randomUUID(), total_linhas: index,
    }));
    const started = performance.now();
    const mapped = mapPage({ itens, proximo_cursor: null });
    const duration = performance.now() - started;
    expect(mapped.itens).toHaveLength(10_000);
    expect(mapped.itens[9_999]).toBe(itens[9_999]);
    expect(duration).toBeLessThan(100);
  });
});
