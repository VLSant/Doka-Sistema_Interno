import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AssistanceCorrectionDialog } from "../../../src/modules/assistencias-mms/components/AssistanceCorrectionDialog";
import { assistanceDetail, correctionResult } from "../../helpers/assistencias-mms-fixtures";

describe("assistance correction dialog", () => {
  it("requires reason and sends the expected version", async () => {
    const correctField = vi.fn().mockResolvedValue(correctionResult);
    const onSaved = vi.fn();
    render(
      <AssistanceCorrectionDialog
        target={{
          entityType: "assistencia",
          entityId: assistanceDetail.assistencia_id,
          field: "cliente_nome",
          label: "Cliente",
          value: assistanceDetail.cliente,
          version: 4,
        }}
        service={{ correctField } as never}
        onClose={vi.fn()}
        onSaved={onSaved}
      />,
    );
    await userEvent.clear(screen.getByLabelText("Novo valor"));
    await userEvent.type(screen.getByLabelText("Novo valor"), "Cliente novo");
    await userEvent.click(screen.getByRole("button", { name: "Confirmar correção" }));
    expect(screen.getByRole("alert")).toHaveTextContent("justificativa");
    await userEvent.type(screen.getByLabelText("Justificativa"), "Confirmado pela operação.");
    await userEvent.click(screen.getByRole("button", { name: "Confirmar correção" }));
    expect(correctField).toHaveBeenCalledWith(expect.objectContaining({ versao_esperada: 4 }));
    expect(onSaved).toHaveBeenCalledWith(correctionResult);
  });

  it("preserves typed text after a concurrent conflict", async () => {
    const error = Object.assign(new Error("Conflito"), { code: "correcao_desatualizada" });
    const correctField = vi.fn().mockRejectedValue(error);
    render(
      <AssistanceCorrectionDialog
        target={{
          entityType: "assistencia",
          entityId: assistanceDetail.assistencia_id,
          field: "cliente_nome",
          label: "Cliente",
          value: assistanceDetail.cliente,
          version: 4,
        }}
        service={{ correctField } as never}
        onClose={vi.fn()}
        onSaved={vi.fn()}
      />,
    );
    const input = screen.getByLabelText("Novo valor");
    await userEvent.clear(input);
    await userEvent.type(input, "Meu rascunho");
    await userEvent.type(screen.getByLabelText("Justificativa"), "Confirmado");
    await userEvent.click(screen.getByRole("button", { name: "Confirmar correção" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("outra pessoa");
    expect(input).toHaveValue("Meu rascunho");
  });

  it("supports Escape and restores focus to the trigger", async () => {
    const onClose = vi.fn();
    const trigger = document.createElement("button");
    document.body.appendChild(trigger);
    trigger.focus();
    const { unmount } = render(
      <AssistanceCorrectionDialog
        target={{
          entityType: "assistencia",
          entityId: assistanceDetail.assistencia_id,
          field: "cliente_nome",
          label: "Cliente",
          value: assistanceDetail.cliente,
          version: 4,
        }}
        service={{ correctField: vi.fn() } as never}
        onClose={onClose}
        onSaved={vi.fn()}
      />,
    );
    expect(screen.getByLabelText("Novo valor")).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledOnce();
    unmount();
    expect(trigger).toHaveFocus();
    trigger.remove();
  });
});
