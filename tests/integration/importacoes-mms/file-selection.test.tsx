import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { FileDropzone } from "../../../src/modules/importacoes-mms/components/FileDropzone";

describe("FileDropzone", () => {
  it("accepts CSV/XLSX selection and reports progress without confirmation", async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    const { rerender } = render(<FileDropzone onSelect={onSelect} />);
    await user.upload(
      screen.getByLabelText("Arquivo MMS"),
      new File(["conteúdo"], "mms.csv", { type: "text/csv" }),
    );
    expect(onSelect).toHaveBeenCalledOnce();
    expect(screen.queryByRole("button", { name: /confirmar/i })).not.toBeInTheDocument();

    rerender(
      <FileDropzone
        disabled
        onSelect={onSelect}
        progress={{ phase: "uploading", current: 50, total: 100, percentage: 50, message: "Enviando arquivo..." }}
      />,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Enviando arquivo");
  });

  it("shows a retryable validation message", () => {
    render(<FileDropzone onSelect={vi.fn()} error="Selecione um arquivo CSV ou XLSX." />);
    expect(screen.getByRole("alert")).toHaveTextContent("CSV ou XLSX");
  });
});
