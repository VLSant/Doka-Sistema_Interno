import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CorrectionEditor } from "../../../src/modules/importacoes-mms/components/CorrectionEditor";
import { correctionResult, lotDetail } from "../../helpers/importacao-mms-management-fixtures";

describe("correction flow", () => {
  it("sends the expected version and refreshes after success", async () => {
    const saveCorrection = vi.fn().mockResolvedValue(correctionResult);
    const onSaved = vi.fn();
    render(<CorrectionEditor
      lotId={lotDetail.lote_id}
      lineId={correctionResult.linha_id}
      field="numero_assistencia"
      original=""
      normalized=""
      current=""
      version={0}
      service={{ saveCorrection } as never}
      onSaved={onSaved}
    />);
    await userEvent.type(screen.getByLabelText("Correção vigente"), "AST-007-B");
    await userEvent.click(screen.getByRole("button", { name: "Salvar correção" }));
    expect(saveCorrection).toHaveBeenCalledWith(expect.objectContaining({
      campo: "numero_assistencia", valor: "AST-007-B", versao_esperada: 0,
    }));
    expect(await screen.findByText("Correção salva.")).toBeVisible();
    expect(onSaved).toHaveBeenCalled();
  });

  it("preserves the typed value after a stale-version response", async () => {
    const stale = Object.assign(new Error("correcao_desatualizada"), { code: "correcao_desatualizada" });
    render(<CorrectionEditor
      lotId={lotDetail.lote_id} lineId={correctionResult.linha_id}
      field="numero_assistencia" original="" normalized="" current="" version={0}
      service={{ saveCorrection: vi.fn().mockRejectedValue(stale) } as never}
      onSaved={vi.fn()}
    />);
    const input = screen.getByLabelText("Correção vigente");
    await userEvent.type(input, "AST-MINHA-CORRECAO");
    await userEvent.click(screen.getByRole("button", { name: "Salvar correção" }));
    expect(await screen.findByText(/corrigida por outro usuário/i)).toBeVisible();
    expect(input).toHaveValue("AST-MINHA-CORRECAO");
  });
});
