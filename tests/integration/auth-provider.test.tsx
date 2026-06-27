/**
 * Integration tests proving protected content stays absent until a valid
 * operational context resolves (T028), per `auth-session-contract.md`
 * ("Conteudo protegido permanece oculto ate o estado `autorizado`.") and
 * `data-model.md` AuthState table.
 */
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  buildMockAuthUser,
  buildMockSession,
  createMockSupabaseClient,
} from "../helpers/supabase-mocks";
import { operadorResult, semConfiguracaoOperacionalResult } from "../helpers/access-fixtures";
import { AuthProvider, useAuth } from "../../src/modules/auth/AuthProvider";
import type { AccessService } from "../../src/modules/access/access-service";
import type { AuthListener, AuthService, SignInResult } from "../../src/modules/auth/auth-service";

function asClient(mock: ReturnType<typeof createMockSupabaseClient>): SupabaseClient {
  return mock as unknown as SupabaseClient;
}

function ProtectedProbe() {
  const { state, revalidate, signOut, signIn } = useAuth();
  const controls = (
    <>
      <button onClick={() => void revalidate()}>Revalidar</button>
      <button onClick={() => void signOut()}>Sair</button>
      <button onClick={() => void signIn({ email: "operador@doka.test", password: "doka123" })}>
        Entrar teste
      </button>
    </>
  );
  if (state.name !== "autorizado") {
    return (
      <>
        <div data-testid="auth-state">{state.name}</div>
        <div data-testid="no-protected-content">Sem conteudo protegido</div>
        {controls}
      </>
    );
  }
  return (
    <>
      <div data-testid="auth-state">{state.name}</div>
      <div data-testid="protected-content">Conteudo protegido para {state.context.nome}</div>
      {controls}
    </>
  );
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

  it("reloads the operational context and removes stale protected content on revalidation", async () => {
    const user = buildMockAuthUser();
    const mock = createMockSupabaseClient({ initialUser: user, initialSession: buildMockSession({ user }) });
    const resolveInitialContext = vi
      .fn()
      .mockResolvedValueOnce(operadorResult)
      .mockResolvedValueOnce(semConfiguracaoOperacionalResult);

    render(
      <AuthProvider
        supabase={asClient(mock)}
        accessService={{ resolveInitialContext }}
      >
        <ProtectedProbe />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByTestId("protected-content")).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "Revalidar" }));

    await waitFor(() => expect(screen.getByTestId("auth-state")).toHaveTextContent("bloqueado"));
    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
    expect(resolveInitialContext).toHaveBeenCalledTimes(2);
  });

  it("logout clears a blocked state instead of leaving the login flow stuck", async () => {
    const user = buildMockAuthUser();
    const mock = createMockSupabaseClient({ initialUser: user, initialSession: buildMockSession({ user }) });

    render(
      <AuthProvider
        supabase={asClient(mock)}
        accessService={buildAccessService(semConfiguracaoOperacionalResult)}
      >
        <ProtectedProbe />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByTestId("auth-state")).toHaveTextContent("bloqueado"));
    fireEvent.click(screen.getByRole("button", { name: "Sair" }));
    await waitFor(() => expect(screen.getByTestId("auth-state")).toHaveTextContent("nao_autenticado"));
  });

  it("ignores a late null INITIAL_SESSION instead of stranding a successful login in autenticando", async () => {
    const user = buildMockAuthUser();
    const mock = createMockSupabaseClient({ initialUser: null, initialSession: null });
    let listener: AuthListener | undefined;
    let resolveSignIn: ((result: SignInResult) => void) | undefined;
    const authService: AuthService = {
      resolveInitialSession: vi.fn().mockResolvedValue({ user: null, session: null }),
      signIn: vi.fn(
        () =>
          new Promise<SignInResult>((resolve) => {
            resolveSignIn = resolve;
          }),
      ),
      signOut: vi.fn().mockResolvedValue(undefined),
      onAuthStateChange: vi.fn((callback: AuthListener) => {
        listener = callback;
        return () => undefined;
      }),
    };

    render(
      <AuthProvider
        supabase={asClient(mock)}
        authService={authService}
        accessService={buildAccessService(operadorResult)}
      >
        <ProtectedProbe />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByTestId("auth-state")).toHaveTextContent("nao_autenticado"));
    fireEvent.click(screen.getByRole("button", { name: "Entrar teste" }));
    await waitFor(() => expect(screen.getByTestId("auth-state")).toHaveTextContent("autenticando"));

    listener?.("INITIAL_SESSION", null);
    resolveSignIn?.({ ok: true, user });

    await waitFor(() => expect(screen.getByTestId("auth-state")).toHaveTextContent("autorizado"));
  });
});
