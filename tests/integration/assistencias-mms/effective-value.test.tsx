import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EffectiveValue } from "../../../src/modules/assistencias-mms/components/EffectiveValue";

describe("effective value", () => {
  it("shows current value and correction origin without hiding imported evidence", () => {
    render(
      <EffectiveValue
        label="Cliente"
        value={{
          importado: "Cliente MMS",
          corrigido: "Cliente corrigido",
          vigente: "Cliente corrigido",
          origem_vigente: "correcao",
        }}
      />,
    );
    expect(screen.getAllByText("Cliente corrigido")[0]).toBeVisible();
    expect(screen.getByText("Valor corrigido")).toBeVisible();
    expect(screen.getByText("Cliente MMS")).toBeInTheDocument();
  });

  it("labels an absent value explicitly", () => {
    render(
      <EffectiveValue
        label="Endereço"
        value={{ importado: null, corrigido: null, vigente: null, origem_vigente: "ausente" }}
      />,
    );
    expect(screen.getByText("Sem valor")).toBeVisible();
    expect(screen.getAllByText("Não informado")[0]).toBeVisible();
  });
});
