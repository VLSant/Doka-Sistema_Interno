/**
 * Integration tests proving protected content stays absent until a valid
 * operational context resolves (T028), per `auth-session-contract.md`
 * ("Conteudo protegido permanece oculto ate o estado `autorizado`.") and
 * `data-model.md` AuthState table.
 */
import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  buildMockAuthUser,
  buildMockSession,
  createMockSupabaseClient,
} from "../helpers/supabase-mocks";
import { operadorResult, semConfiguracaoOperacionalResult } from "../helpers/access-fixtures";
import { AuthProvider, useAuth } from "../../src/modules/auth/AuthProvider";
import type { AccessService } from "../../src/modules/access/access-service";

function asClient(mock: ReturnType<typeof createMockSupabaseClient>): SupabaseClient {
  return mock as unknown as SupabaseClient;
}

function ProtectedProbe() {
  const { state } = useAuth();
  if (state.name !== "autorizado") {
    return <div data-testid="no-protected-content">Sem conteudo protegido</div>;
  }
  return <div data-testid="protected-content">Conteudo protegido para {state.context.nome}</div>;
}

function buildAccessService(result: Awaited<ReturnType<AccessService["resolveInitialContext"]>>): AccessService {
  return {
    resolveInitialContext: vi.fn().mockResolvedValue(result),
  };
}

describe("AuthProvider gating", () => {
  it("never renders protected content while the initial session is resolving", async () => {
    const user = buildMockAuthUser();
    const session = buildMockSession({ user });
    const mock = createMockSupabaseClient({ initialUser: user, initialSession: session });
    const access = buildAccessService(operadorResult);

    render(
      <AuthProvider supabase={asClient(mock)} accessService={access}>
        <ProtectedProbe />
      </AuthProvider>,
    );

    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();

    await waitFor(() => expect(screen.getByTestId("protected-content")).toBeInTheDocument());
  });

  it("never shows protected content when there is no session", async () => {
    const mock = createMockSupabaseClient({ initialUser: null, initialSession: null });
    const access = buildAccessService(operadorResult);

    render(
      <AuthProvider supabase={asClient(mock)} accessService={access}>
        <ProtectedProbe />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByTestId("no-protected-content")).toBeInTheDocument());
    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
  });

  it("never shows protected content when the operational context is blocked", async () => {
    const user = buildMockAuthUser();
    const session = buildMockSession({ user });
    const mock = createMockSupabaseClient({ initialUser: user, initialSession: session });
    const access = buildAccessService(semConfiguracaoOperacionalResult);

    render(
      <AuthProvider supabase={asClient(mock)} accessService={access}>
        <ProtectedProbe />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByTestId("no-protected-content")).toBeInTheDocument());
    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
  });

  it("clears protected content immediately on SIGNED_OUT", async () => {
    const user = buildMockAuthUser();
    const session = buildMockSession({ user });
    const mock = createMockSupabaseClient({ initialUser: user, initialSession: session });
    const access = buildAccessService(operadorResult);

    render(
      <AuthProvider supabase={asClient(mock)} accessService={access}>
        <ProtectedProbe />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByTestId("protected-content")).toBeInTheDocument());

    mock.auth.__emit("SIGNED_OUT", null);

    await waitFor(() => expect(screen.getByTestId("no-protected-content")).toBeInTheDocument());
  });
});
