import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ImportResult } from "../../../src/modules/importacoes-mms/components/ImportResult";
import { buildImportResult } from "../../helpers/importacao-mms-fixtures";

describe("ImportResult", () => {
  it("renders only persisted server counters and explicit mirror outcome", () => {
    render(<ImportResult result={buildImportResult({ partesPreservadas: 4, partesRemovidas: 2 })} />);
    expect(screen.getByText(/espelho atualizado:/i).closest("p")).toHaveTextContent("Sim");
    expect(screen.getByText("Partes preservadas").nextSibling).toHaveTextContent("4");
    expect(screen.getByText("Partes removidas").nextSibling).toHaveTextContent("2");
  });

  it("never presents a safe failure as success", () => {
    render(<ImportResult result={buildImportResult({
      processado: false,
      status: "falha",
      processadoEm: null,
      mensagem: "Tente novamente.",
    })} />);
    expect(screen.getByText(/espelho atualizado:/i).closest("p")).toHaveTextContent("Não");
    expect(screen.getByText("Tente novamente.")).toBeInTheDocument();
  });
});
