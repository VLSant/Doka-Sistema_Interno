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
      prepare: vi.fn().mockResolvedValue(preview),
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
      prepare: vi.fn().mockResolvedValue(buildImportPreview({ podeConfirmar: false, status: "erro" })),
      confirm: vi.fn(),
      cancel: vi.fn().mockResolvedValue(undefined),
    };
    const access = renderPage(service);
    await waitFor(() => expect(access.resolveInitialContext).toHaveBeenCalled());
    await userEvent.upload(screen.getByLabelText("Arquivo MMS"), new File(["x"], "mms.csv", { type: "text/csv" }));
    await screen.findByText(/Corrija o arquivo/);
    expect(screen.queryByRole("button", { name: "Confirmar importação" })).not.toBeInTheDocument();
  });
});
