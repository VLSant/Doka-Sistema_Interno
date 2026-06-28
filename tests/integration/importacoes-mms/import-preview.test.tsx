import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ImportPreview } from "../../../src/modules/importacoes-mms/components/ImportPreview";
import { buildImportPreview } from "../../helpers/importacao-mms-fixtures";

describe("ImportPreview", () => {
  it("shows authoritative totals and confirmation eligibility", () => {
    render(<ImportPreview preview={buildImportPreview()} />);
    expect(screen.getByText("Posto A")).toBeInTheDocument();
    expect(screen.getByText(/Pronta para confirmação/)).toBeInTheDocument();
    expect(screen.getByText("Assistências")).toBeInTheDocument();
  });

  it("shows blocking issues and disables eligibility semantics", () => {
    render(<ImportPreview preview={buildImportPreview({
      status: "erro",
      podeConfirmar: false,
      totalErros: 1,
      linhasInvalidas: 1,
      erros: [{ codigo: "data_invalida", mensagem: "Data inválida.", linha: 2, campo: "Data" }],
    })} />);
    expect(screen.getByText(/Confirmação bloqueada/)).toBeInTheDocument();
    expect(screen.getByText("Data inválida.")).toBeInTheDocument();
  });
});
