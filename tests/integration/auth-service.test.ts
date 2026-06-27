/**
 * Integration tests for `auth-service.ts` (T027).
 *
 * Covers: neutral invalid-credential errors, server-confirmed identity via
 * `getUser()`, initial-session restoration, local-scope logout, and
 * Auth-listener subscription cleanup. Uses the deterministic mocks from
 * `tests/helpers/supabase-mocks.ts` per `auth-session-contract.md`.
 */
import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  buildMockAuthUser,
  buildMockSession,
  createMockSupabaseClient,
} from "../helpers/supabase-mocks";
import { createAuthService } from "../../src/modules/auth/auth-service";

function asClient(mock: ReturnType<typeof createMockSupabaseClient>): SupabaseClient {
  return mock as unknown as SupabaseClient;
}

describe("auth-service", () => {
  it("returns a neutral error message on invalid credentials", async () => {
    const mock = createMockSupabaseClient({
      signInResult: { user: null, session: null, error: { message: "Invalid login credentials" } },
    });
    const service = createAuthService(asClient(mock));

    const result = await service.signIn({ email: "alguem@doka.test", password: "errada" });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).not.toMatch(/credentials/i);
      expect(result.message.length).toBeGreaterThan(0);
    }
  });

  it("does not reveal whether the e-mail or the password was wrong", async () => {
    const mock = createMockSupabaseClient({
      signInResult: { user: null, session: null, error: { message: "Invalid login credentials" } },
    });
    const service = createAuthService(asClient(mock));

    const result = await service.signIn({ email: "naoexiste@doka.test", password: "qualquer" });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).not.toMatch(/e-?mail/i);
      expect(result.message).not.toMatch(/senha/i);
    }
  });

  it("confirms identity with the server via getUser() after a successful sign-in", async () => {
    const user = buildMockAuthUser();
    const session = buildMockSession({ user });
    const mock = createMockSupabaseClient({
      signInResult: { user, session, error: null },
    });
    const getUserSpy = vi.spyOn(mock.auth, "getUser");
    const service = createAuthService(asClient(mock));

    const result = await service.signIn({ email: "operador@doka.test", password: "correta" });

    expect(result.ok).toBe(true);
    expect(getUserSpy).toHaveBeenCalled();
  });

  it("restores the initial session by confirming the user with getUser()", async () => {
    const user = buildMockAuthUser();
    const session = buildMockSession({ user });
    const mock = createMockSupabaseClient({ initialUser: user, initialSession: session });
    const getUserSpy = vi.spyOn(mock.auth, "getUser");
    const service = createAuthService(asClient(mock));

    const result = await service.resolveInitialSession();

    expect(getUserSpy).toHaveBeenCalled();
    expect(result.user).not.toBeNull();
  });

  it("reports no session when there is no initial user", async () => {
    const mock = createMockSupabaseClient({ initialUser: null, initialSession: null });
    const service = createAuthService(asClient(mock));

    const result = await service.resolveInitialSession();

    expect(result.user).toBeNull();
  });

  it("signs out using local scope", async () => {
    const mock = createMockSupabaseClient();
    const signOutSpy = vi.spyOn(mock.auth, "signOut");
    const service = createAuthService(asClient(mock));

    await service.signOut();

    expect(signOutSpy).toHaveBeenCalledWith({ scope: "local" });
  });

  it("clears the session even when audit fails during logout", async () => {
    const mock = createMockSupabaseClient({
      rpcImplementation: async () => ({ data: null, error: { message: "audit unavailable" } }),
    });
    const signOutSpy = vi.spyOn(mock.auth, "signOut");
    const service = createAuthService(asClient(mock));

    await expect(service.signOut()).resolves.not.toThrow();
    expect(signOutSpy).toHaveBeenCalled();
  });

  it("registers an Auth listener and returns an unsubscribe function that cleans it up", () => {
    const mock = createMockSupabaseClient();
    const service = createAuthService(asClient(mock));

    const unsubscribe = service.onAuthStateChange(() => {});
    expect(mock.auth.__listenerCount()).toBe(1);

    unsubscribe();
    expect(mock.auth.__listenerCount()).toBe(0);
  });

  it("invokes the listener callback when an Auth event is emitted", () => {
    const mock = createMockSupabaseClient();
    const service = createAuthService(asClient(mock));
    const callback = vi.fn();

    const unsubscribe = service.onAuthStateChange(callback);
    const session = buildMockSession();
    mock.auth.__emit("SIGNED_IN", session);

    expect(callback).toHaveBeenCalledWith("SIGNED_IN", session);
    unsubscribe();
  });
});
