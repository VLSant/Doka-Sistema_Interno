/**
 * Integration tests for neutral navigation states (T058).
 *
 * Verifies the neutral "Modulo ainda nao disponivel" destination (no fake
 * data/actions, safe return to Dashboard), the PT-BR page-not-found state,
 * and authentication-aware safe return destinations, per
 * `route-navigation-contract.md` "Module unavailable" / "Page not found".
 */
import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import type { SupabaseClient } from "@supabase/supabase-js";
import { buildMockAuthUser, buildMockSession, createMockSupabaseClient } from "../helpers/supabase-mocks";
import { operadorResult } from "../helpers/access-fixtures";
import { AuthProvider } from "../../src/modules/auth/AuthProvider";
import type { AccessService } from "../../src/modules/access/access-service";
import { ModuleUnavailablePage } from "../../src/modules/navigation/pages/ModuleUnavailablePage";
import { NotFoundPage } from "../../src/modules/navigation/pages/NotFoundPage";

function asClient(mock: ReturnType<typeof createMockSupabaseClient>): SupabaseClient {
  return mock as unknown as SupabaseClient;
}

function buildAccessService(result: Awaited<ReturnType<AccessService["resolveInitialContext"]>>): AccessService {
  return { resolveInitialContext: vi.fn().mockResolvedValue(result) };
}

describe("ModuleUnavailablePage", () => {
  it('shows the module name and a neutral "ainda nao disponivel" message without fake data/actions', () => {
    render(
      <MemoryRouter>
        <ModuleUnavailablePage moduleLabel="Ocorrências" />
      </MemoryRouter>,
    );

    expect(screen.getByText(/ocorr[eê]ncias/i)).toBeInTheDocument();
    expect(screen.getByText(/ainda n[aã]o dispon[ií]vel/i)).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("offers a safe return to the Dashboard", async () => {
    const userEventSession = userEvent.setup();
    render(
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<ModuleUnavailablePage moduleLabel="Ocorrências" />} />
          <Route path="/app/dashboard" element={<div data-testid="dashboard">Dashboard</div>} />
        </Routes>
      </MemoryRouter>,
    );

    await userEventSession.click(screen.getByRole("button", { name: /dashboard/i }));
    await waitFor(() => expect(screen.getByTestId("dashboard")).toBeInTheDocument());
  });
});

describe("NotFoundPage", () => {
  it("shows a PT-BR not-found message for an unauthenticated visitor and offers a return to login", async () => {
    const mock = createMockSupabaseClient({ initialUser: null, initialSession: null });
    const access = buildAccessService(operadorResult);

    render(
      <MemoryRouter initialEntries={["/rota-desconhecida"]}>
        <AuthProvider supabase={asClient(mock)} accessService={access}>
          <Routes>
            <Route path="*" element={<NotFoundPage />} />
            <Route path="/login" element={<div data-testid="login-page">Login</div>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText(/p[aá]gina n[aã]o encontrada/i)).toBeInTheDocument());

    const userEventSession = userEvent.setup();
    await userEventSession.click(screen.getByRole("button", { name: /entrar|login/i }));
    await waitFor(() => expect(screen.getByTestId("login-page")).toBeInTheDocument());
  });

  it("offers a return to the Dashboard for an authenticated/authorized visitor", async () => {
    const user = buildMockAuthUser();
    const session = buildMockSession({ user });
    const mock = createMockSupabaseClient({ initialUser: user, initialSession: session });
    const access = buildAccessService(operadorResult);

    render(
      <MemoryRouter initialEntries={["/rota-desconhecida"]}>
        <AuthProvider supabase={asClient(mock)} accessService={access}>
          <Routes>
            <Route path="*" element={<NotFoundPage />} />
            <Route path="/app/dashboard" element={<div data-testid="dashboard-page">Dashboard</div>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText(/p[aá]gina n[aã]o encontrada/i)).toBeInTheDocument());

    const userEventSession = userEvent.setup();
    await waitFor(() => expect(screen.getByRole("button", { name: /dashboard/i })).toBeInTheDocument());
    await userEventSession.click(screen.getByRole("button", { name: /dashboard/i }));
    await waitFor(() => expect(screen.getByTestId("dashboard-page")).toBeInTheDocument());
  });
});
