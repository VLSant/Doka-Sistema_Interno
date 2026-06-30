import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { AssistanceDetailPage } from "../../../src/modules/assistencias-mms/pages/AssistanceDetailPage";
import { assistanceDetail, assistancePage } from "../../helpers/assistencias-mms-fixtures";

describe("assistance detail", () => {
  it("groups parts under one assistance and can request removed parts", async () => {
    const detail = vi.fn().mockResolvedValue(assistanceDetail);
    const service = {
      detail,
      history: vi.fn().mockResolvedValue(assistancePage([])),
      correctField: vi.fn(),
    };
    render(
      <MemoryRouter initialEntries={[`/app/assistencias-mms/${assistanceDetail.assistencia_id}`]}>
        <Routes>
          <Route
            path="/app/assistencias-mms/:assistenciaId"
            element={<AssistanceDetailPage service={service as never} />}
          />
        </Routes>
      </MemoryRouter>,
    );
    expect(await screen.findByText("ASS-008")).toBeVisible();
    expect(screen.getByRole("heading", { name: "Partes da assistência" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "ARMÁRIO" })).toBeVisible();
    await userEvent.click(screen.getByRole("button", { name: "Incluir removidas (1)" }));
    expect(detail).toHaveBeenLastCalledWith(assistanceDetail.assistencia_id, true);
  });

  it("uses a neutral unavailable state for a denied direct URL", async () => {
    const error = Object.assign(new Error("Você não possui acesso."), {
      code: "acesso_negado",
    });
    const service = { detail: vi.fn().mockRejectedValue(error) };
    render(
      <MemoryRouter initialEntries={[`/app/assistencias-mms/${assistanceDetail.assistencia_id}`]}>
        <Routes>
          <Route
            path="/app/assistencias-mms/:assistenciaId"
            element={<AssistanceDetailPage service={service as never} />}
          />
        </Routes>
      </MemoryRouter>,
    );
    expect(await screen.findByText("Acesso negado")).toBeVisible();
    expect(screen.queryByText("ASS-008")).not.toBeInTheDocument();
  });
});
