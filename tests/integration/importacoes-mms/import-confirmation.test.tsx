import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";
import { AuthProvider } from "../../../src/modules/auth/AuthProvider";
import NewImportPage from "../../../src/modules/importacoes-mms/pages/NewImportPage";
import type { ImportService } from "../../../src/modules/importacoes-mms/import-service";
import { operadorResult } from "../../helpers/access-fixtures";
import { buildImportPreview, buildImportResult, buildParsedFile } from "../../helpers/importacao-mms-fixtures";
import { buildMockAuthUser, buildMockSession, createMockSupabaseClient } from "../../helpers/supabase-mocks";

function renderPage(service: ImportService) {
  const user = buildMockAuthUser();
  const session = buildMockSession({ user });
  const client = createMockSupabaseClient({ initialUser: user, initialSession: session });
  const accessService = { resolveInitialContext: vi.fn().mockResolvedValue(operadorResult) };
  render(
    <MemoryRouter>
      <AuthProvider
        supabase={client as unknown as SupabaseClient}
        accessService={accessService}
      >
        <NewImportPage service={service} />
      </AuthProvider>
    </MemoryRouter>,
  );
  return accessService;
}

describe("MMS confirmation flow", () => {
  it("requires explicit confirmation, suppresses repeated action, and renders the server result", async () => {
    const preview = buildImportPreview();
    const service: ImportService = {
      parse: vi.fn().mockResolvedValue(buildParsedFile()),
      prepare: vi.fn().mockResolvedValue([preview]),
      confirm: vi.fn().mockResolvedValue(buildImportResult()),
      cancel: vi.fn().mockResolvedValue(undefined),
    };
    const access = renderPage(service);
    await waitFor(() => expect(access.resolveInitialContext).toHaveBeenCalled());
    const user = userEvent.setup();
    await user.upload(screen.getByLabelText("Arquivo MMS"), new File(["x"], "mms.csv", { type: "text/csv" }));
    await screen.findByRole("button", { name: "Confirmar importação" });
    expect(service.confirm).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Confirmar importação" }));
    await screen.findByText("Importação concluída");
    expect(service.confirm).toHaveBeenCalledOnce();
  });

  it("keeps an ineligible preview without a confirmation action", async () => {
    const service: ImportService = {
      parse: vi.fn().mockResolvedValue(buildParsedFile()),
      prepare: vi.fn().mockResolvedValue([buildImportPreview({ podeConfirmar: false, status: "erro" })]),
      confirm: vi.fn(),
      cancel: vi.fn().mockResolvedValue(undefined),
    };
    const access = renderPage(service);
    await waitFor(() => expect(access.resolveInitialContext).toHaveBeenCalled());
    await userEvent.upload(screen.getByLabelText("Arquivo MMS"), new File(["x"], "mms.csv", { type: "text/csv" }));
    await screen.findByText(/Corrija o arquivo/);
    expect(screen.queryByRole("button", { name: "Confirmar importação" })).not.toBeInTheDocument();
  });

  it("shows and confirms one independent preview per area", async () => {
    const previews = [
      buildImportPreview(),
      buildImportPreview({
        loteId: "61000000-0000-0000-0000-000000000002",
        posto: { id: "posto-b", nome: "Posto B" },
      }),
    ];
    const service: ImportService = {
      parse: vi.fn().mockResolvedValue(buildParsedFile()),
      prepare: vi.fn().mockResolvedValue(previews),
      confirm: vi.fn()
        .mockResolvedValueOnce(buildImportResult())
        .mockResolvedValueOnce(buildImportResult({
          loteId: previews[1].loteId,
          posto: "Posto B",
        })),
      cancel: vi.fn().mockResolvedValue(undefined),
    };
    const access = renderPage(service);
    await waitFor(() => expect(access.resolveInitialContext).toHaveBeenCalled());

    await userEvent.upload(
      screen.getByLabelText("Arquivo MMS"),
      new File(["x"], "mms.csv", { type: "text/csv" }),
    );
    expect(await screen.findByText(/separado automaticamente em/)).toHaveTextContent("2 áreas");
    await userEvent.click(screen.getByRole("button", { name: "Confirmar 2 importações" }));
    await screen.findAllByText("Importação concluída");
    expect(service.confirm).toHaveBeenCalledTimes(2);
  });

  it("cancels every pending area from a batch preview", async () => {
    const service: ImportService = {
      parse: vi.fn().mockResolvedValue(buildParsedFile()),
      prepare: vi.fn().mockResolvedValue([
        buildImportPreview(),
        buildImportPreview({
          loteId: "61000000-0000-0000-0000-000000000002",
          posto: { id: "posto-b", nome: "Posto B" },
        }),
      ]),
      confirm: vi.fn(),
      cancel: vi.fn().mockResolvedValue(undefined),
    };
    const access = renderPage(service);
    await waitFor(() => expect(access.resolveInitialContext).toHaveBeenCalled());
    await userEvent.upload(
      screen.getByLabelText("Arquivo MMS"),
      new File(["x"], "mms.csv", { type: "text/csv" }),
    );

    await userEvent.click(await screen.findByRole("button", { name: "Cancelar" }));
    expect(service.cancel).toHaveBeenCalledWith();
    expect(await screen.findByText("Tentativa cancelada")).toBeInTheDocument();
  });

  it("shows successful and failed area results without false batch success", async () => {
    const previews = [
      buildImportPreview(),
      buildImportPreview({
        loteId: "61000000-0000-0000-0000-000000000002",
        posto: { id: "posto-b", nome: "Posto B" },
      }),
    ];
    const service: ImportService = {
      parse: vi.fn().mockResolvedValue(buildParsedFile()),
      prepare: vi.fn().mockResolvedValue(previews),
      confirm: vi.fn()
        .mockResolvedValueOnce(buildImportResult())
        .mockRejectedValueOnce(new Error("Falha temporária no Posto B.")),
      cancel: vi.fn().mockResolvedValue(undefined),
    };
    const access = renderPage(service);
    await waitFor(() => expect(access.resolveInitialContext).toHaveBeenCalled());
    await userEvent.upload(
      screen.getByLabelText("Arquivo MMS"),
      new File(["x"], "mms.csv", { type: "text/csv" }),
    );
    await userEvent.click(await screen.findByRole("button", { name: "Confirmar 2 importações" }));

    expect(await screen.findByText("Falha temporária no Posto B.")).toBeInTheDocument();
    expect(screen.getAllByText(/espelho atualizado:/i)[0].closest("p")).toHaveTextContent("Sim");
    expect(screen.getAllByText(/espelho atualizado:/i)[1].closest("p")).toHaveTextContent("Não");
  });
});
