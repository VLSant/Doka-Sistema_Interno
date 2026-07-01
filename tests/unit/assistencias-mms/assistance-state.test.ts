import { describe, expect, it } from "vitest";
import {
  emptyStateFor,
  hasActiveAssistanceFilters,
  parseAssistanceFilters,
  serializeAssistanceFilters,
} from "../../../src/modules/assistencias-mms/assistance-state";

describe("assistance state", () => {
  it("round-trips supported filters and omits the default active situation", () => {
    const filters = parseAssistanceFilters(
      new URLSearchParams("cliente=Doka&situacao=removido&data_de=2026-06-01"),
    );
    expect(filters).toEqual({
      cliente: "Doka",
      situacao: "removido",
      data_de: "2026-06-01",
    });
    expect(serializeAssistanceFilters({ situacao: "ativo" }).toString()).toBe("");
  });

  it("distinguishes an empty scope from filtered no-results", () => {
    expect(hasActiveAssistanceFilters({})).toBe(false);
    expect(emptyStateFor({})).toBe("empty_scope");
    expect(emptyStateFor({ numero_assistencia: "008" })).toBe("empty_filters");
  });
});
