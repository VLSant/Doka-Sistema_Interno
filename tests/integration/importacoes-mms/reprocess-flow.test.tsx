import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ReprocessDialog } from "../../../src/modules/importacoes-mms/components/ReprocessDialog";
import { lotDetail, operationResult } from "../../helpers/importacao-mms-management-fixtures";

describe("reprocess flow", () => {
  it("requires impact confirmation and keeps one idempotency key", async () => {
    const reprocess = vi.fn().mockResolvedValue(operationResult);
    const onComplete = vi.fn();
    render(<ReprocessDialog lotId={lotDetail.lote_id} version={1}
      service={{ reprocess, operation: vi.fn() } as never} onComplete={onComplete} />);
    await userEvent.click(screen.getByRole("button", { name: "Reprocessar" }));
    expect(screen.getByRole("dialog")).toHaveTextContent("atomicamente");
    await userEvent.dblClick(screen.getByRole("button", { name: "Confirmar reprocessamento" }));
    expect(reprocess).toHaveBeenCalled();
    const keys = reprocess.mock.calls.map((call) => call[2]);
    expect(new Set(keys).size).toBe(1);
    expect(onComplete).toHaveBeenCalled();
  });

  it("recovers a completed result after an uncertain response", async () => {
    const onComplete = vi.fn();
    render(<ReprocessDialog lotId={lotDetail.lote_id} version={1} service={{
      reprocess: vi.fn().mockRejectedValue(new Error("network")),
      operation: vi.fn().mockResolvedValue(operationResult),
    } as never} onComplete={onComplete} />);
    await userEvent.click(screen.getByRole("button", { name: "Reprocessar" }));
    await userEvent.click(screen.getByRole("button", { name: "Confirmar reprocessamento" }));
    expect(onComplete).toHaveBeenCalled();
    expect(screen.queryByText(/Resposta incerta/)).not.toBeInTheDocument();
  });
});
