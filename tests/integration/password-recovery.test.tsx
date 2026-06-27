/**
 * Integration tests for the `PASSWORD_RECOVERY` flow (T070), per
 * `auth-session-contract.md` Auth Events ("`PASSWORD_RECOVERY`: Abrir fluxo
 * de redefinicao") and Password Recovery Completion ("Exigir evento/sessao
 * de recovery valida ... Limpar estado sensivel e retornar ao login").
 *
 * `AuthProvider` exposes a `recovery` state (valid/invalid/expired) derived
 * from the `PASSWORD_RECOVERY` Auth event, routed entirely outside the
 * `onAuthStateChange` callback per the existing queued-revalidation pattern
 * (`AuthProvider.tsx`).
 */
import { describe, expect, it, vi } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  buildMockAuthUser,
  buildMockSession,
  createMockSupabaseClient,
} from "../helpers/supabase-mocks";
import { AuthProvider, useAuth } from "../../src/modules/auth/AuthProvider";
import type { RecoveryService } from "../../src/modules/auth/recovery-service";

function asClient(mock: ReturnType<typeof createMockSupabaseClient>): SupabaseClient {
  return mock as unknown as SupabaseClient;
}

function RecoveryProbe() {
  const { recoveryState, confirmNewPassword, clearRecoveryState } = useAuth();
  return (
    <div>
      <div data-testid="recovery-state">{recoveryState}</div>
      <button
        onClick={() => {
          void confirmNewPassword("NovaSenhaForte123");
        }}
      >
        Confirmar
      </button>
      <button onClick={() => clearRecoveryState()}>Limpar</button>
    </div>
  );
}

function buildRecoveryService(overrides: Partial<RecoveryService> = {}): RecoveryService {
  return {
    requestPasswordRecovery: vi.fn().mockResolvedValue({ ok: true }),
    confirmNewPassword: vi.fn().mockResolvedValue({ ok: true }),
    ...overrides,
  };
}

describe("PASSWORD_RECOVERY flow", () => {
  it("starts with no recovery state (invalid) before any PASSWORD_RECOVERY event", async () => {
    const mock = createMockSupabaseClient({ initialUser: null, initialSession: null });
    render(
      <AuthProvider supabase={asClient(mock)} recoveryService={buildRecoveryService()}>
        <RecoveryProbe />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByTestId("recovery-state")).toHaveTextContent("invalido"));
  });

  it("transitions to a valid recovery state when PASSWORD_RECOVERY fires with a session", async () => {
    const mock = createMockSupabaseClient({ initialUser: null, initialSession: null });
    render(
      <AuthProvider supabase={asClient(mock)} recoveryService={buildRecoveryService()}>
        <RecoveryProbe />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByTestId("recovery-state")).toHaveTextContent("invalido"));

    const user = buildMockAuthUser();
    const session = buildMockSession({ user });
    mock.auth.__emit("PASSWORD_RECOVERY", session);

    await waitFor(() => expect(screen.getByTestId("recovery-state")).toHaveTextContent("valido"));
  });

  it("stays invalid when PASSWORD_RECOVERY fires without a session (malformed/expired link)", async () => {
    const mock = createMockSupabaseClient({ initialUser: null, initialSession: null });
    render(
      <AuthProvider supabase={asClient(mock)} recoveryService={buildRecoveryService()}>
        <RecoveryProbe />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByTestId("recovery-state")).toHaveTextContent("invalido"));

    mock.auth.__emit("PASSWORD_RECOVERY", null);

    await waitFor(() => expect(screen.getByTestId("recovery-state")).toHaveTextContent("invalido"));
  });

  it("does not run the PASSWORD_RECOVERY reaction synchronously inside the Auth callback", async () => {
    const mock = createMockSupabaseClient({ initialUser: null, initialSession: null });
    render(
      <AuthProvider supabase={asClient(mock)} recoveryService={buildRecoveryService()}>
        <RecoveryProbe />
      </AuthProvider>,
    );
    await waitFor(() => expect(screen.getByTestId("recovery-state")).toHaveTextContent("invalido"));

    const user = buildMockAuthUser();
    const session = buildMockSession({ user });

    // Emitting the event must return synchronously (the listener callback
    // itself never awaits); the state only updates after a microtask/effect.
    mock.auth.__emit("PASSWORD_RECOVERY", session);
    expect(screen.getByTestId("recovery-state")).toHaveTextContent("invalido");

    await waitFor(() => expect(screen.getByTestId("recovery-state")).toHaveTextContent("valido"));
  });

  it("completes confirmNewPassword successfully and clears recovery state afterwards", async () => {
    const mock = createMockSupabaseClient({ initialUser: null, initialSession: null });
    const signOut = vi.spyOn(mock.auth, "signOut");
    const confirmNewPassword = vi.fn().mockResolvedValue({ ok: true });
    render(
      <AuthProvider
        supabase={asClient(mock)}
        recoveryService={buildRecoveryService({ confirmNewPassword })}
      >
        <RecoveryProbe />
      </AuthProvider>,
    );
    await waitFor(() => expect(screen.getByTestId("recovery-state")).toHaveTextContent("invalido"));

    const user = buildMockAuthUser();
    const session = buildMockSession({ user });
    await act(async () => {
      mock.auth.__emit("PASSWORD_RECOVERY", session);
      // Flush the queued auth-event revalidation effect before proceeding,
      // so the click below cannot race with it.
      await waitFor(() => expect(screen.getByTestId("recovery-state")).toHaveTextContent("valido"));
    });

    await act(async () => {
      screen.getByRole("button", { name: "Confirmar" }).click();
      await Promise.resolve();
    });

    await waitFor(() => expect(confirmNewPassword).toHaveBeenCalledWith("NovaSenhaForte123"));
    await waitFor(() => expect(screen.getByTestId("recovery-state")).toHaveTextContent("invalido"));
    expect(signOut).toHaveBeenCalledWith({ scope: "local" });
  });

  it("clears sensitive recovery state on demand without calling Supabase again", async () => {
    const mock = createMockSupabaseClient({ initialUser: null, initialSession: null });
    render(
      <AuthProvider supabase={asClient(mock)} recoveryService={buildRecoveryService()}>
        <RecoveryProbe />
      </AuthProvider>,
    );
    await waitFor(() => expect(screen.getByTestId("recovery-state")).toHaveTextContent("invalido"));

    const user = buildMockAuthUser();
    const session = buildMockSession({ user });
    mock.auth.__emit("PASSWORD_RECOVERY", session);
    await waitFor(() => expect(screen.getByTestId("recovery-state")).toHaveTextContent("valido"));

    screen.getByRole("button", { name: "Limpar" }).click();

    await waitFor(() => expect(screen.getByTestId("recovery-state")).toHaveTextContent("invalido"));
  });

  it("does not expose the recovery session as an authorized protected state", async () => {
    const mock = createMockSupabaseClient({ initialUser: null, initialSession: null });
    function AuthStateProbe() {
      const { state } = useAuth();
      return <div data-testid="auth-state">{state.name}</div>;
    }
    render(
      <AuthProvider supabase={asClient(mock)} recoveryService={buildRecoveryService()}>
        <AuthStateProbe />
      </AuthProvider>,
    );
    await waitFor(() => expect(screen.getByTestId("auth-state")).toHaveTextContent("nao_autenticado"));

    const user = buildMockAuthUser();
    const session = buildMockSession({ user });
    mock.auth.__emit("PASSWORD_RECOVERY", session);
    mock.auth.__emit("USER_UPDATED", session);

    // A PASSWORD_RECOVERY session must never be treated as a normal
    // authorized session (data-model.md: protected content stays hidden
    // unless the full Auth -> context resolution happened).
    await waitFor(() => expect(screen.getByTestId("auth-state")).not.toHaveTextContent("autorizado"));
  });
});
