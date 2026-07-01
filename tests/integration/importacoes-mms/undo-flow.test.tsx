import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { UndoImportDialog } from "../../../src/modules/importacoes-mms/components/UndoImportDialog";
import { lotDetail, operationResult, undoAnalysis } from "../../helpers/importacao-mms-management-fixtures";

describe("undo flow", () => {
  it("shows blockers without presenting destructive confirmation", async () => {
    render(<UndoImportDialog lotId={lotDetail.lote_id} service={{
      analyzeUndo: vi.fn().mockResolvedValue({
        ...undoAnalysis, elegivel: false, assinatura_analise: null,
        motivos_bloqueio: ["edicao_manual_posterior"],
      }),
    } as never} onComplete={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: "Analisar desfazer" }));
    expect(await screen.findByText("edicao_manual_posterior")).toBeVisible();
    expect(screen.queryByRole("button", { name: "Confirmar desfazer" })).not.toBeInTheDocument();
  });

  it("requires justification and executes the analyzed signature", async () => {
    const undo = vi.fn().mockResolvedValue({ ...operationResult, tipo: "desfazer" });
    const onComplete = vi.fn();
    render(<UndoImportDialog lotId={lotDetail.lote_id} service={{
      analyzeUndo: vi.fn().mockResolvedValue(undoAnalysis), undo,
    } as never} onComplete={onComplete} />);
    await userEvent.click(screen.getByRole("button", { name: "Analisar desfazer" }));
    await userEvent.type(await screen.findByLabelText("Justificativa"), "Arquivo importado na data errada.");
    await userEvent.click(screen.getByRole("button", { name: "Confirmar desfazer" }));
    expect(undo).toHaveBeenCalledWith(
      lotDetail.lote_id, undoAnalysis.assinatura_analise,
      "Arquivo importado na data errada.", expect.any(String),
    );
    expect(onComplete).toHaveBeenCalled();
  });

  it("closes stale confirmation and requires a new analysis", async () => {
    const stale = Object.assign(new Error("analise_desatualizada"), { code: "analise_desatualizada" });
    render(<UndoImportDialog lotId={lotDetail.lote_id} service={{
      analyzeUndo: vi.fn().mockResolvedValue(undoAnalysis),
      undo: vi.fn().mockRejectedValue(stale),
    } as never} onComplete={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: "Analisar desfazer" }));
    await userEvent.type(await screen.findByLabelText("Justificativa"), "Dependência criada depois da análise.");
    await userEvent.click(screen.getByRole("button", { name: "Confirmar desfazer" }));
    expect(await screen.findByText("analise_desatualizada")).toBeVisible();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
