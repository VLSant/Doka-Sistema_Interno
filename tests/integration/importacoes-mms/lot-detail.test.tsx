import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ImportDetailPage } from "../../../src/modules/importacoes-mms/pages/ImportDetailPage";
import { lotDetail, page } from "../../helpers/importacao-mms-management-fixtures";
import { renderManagementRoute } from "./management-test-utils";

describe("import lot detail", () => {
  it("loads summary and lazy collections from a direct URL", async () => {
    const lotService = {
      detail: vi.fn().mockResolvedValue(lotDetail),
      items: vi.fn().mockResolvedValue(page([])),
      downloadOriginal: vi.fn(),
    };
    renderManagementRoute(
      <ImportDetailPage lotService={lotService as never} />,
      `/app/importacoes-mms/${lotDetail.lote_id}`,
      "/app/importacoes-mms/:loteId",
    );
    expect(await screen.findByRole("heading", { name: "Detalhe da importação" })).toBeVisible();
    expect(screen.getByText("spec007.csv")).toBeVisible();
    expect(await screen.findByText("Nenhum registro nesta coleção.")).toBeVisible();
  });

  it("uses a neutral inaccessible state", async () => {
    const lotService = { detail: vi.fn().mockRejectedValue(new Error("Você não possui acesso a este lote.")) };
    renderManagementRoute(
      <ImportDetailPage lotService={lotService as never} />,
      "/app/importacoes-mms/inacessivel",
      "/app/importacoes-mms/:loteId",
    );
    expect(await screen.findByText("Lote indisponível")).toBeVisible();
    expect(screen.queryByText(/inacessivel/i)).not.toBeInTheDocument();
  });
});
