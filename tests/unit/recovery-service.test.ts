/**
 * Unit tests for the password-recovery service (T069), per
 * `auth-session-contract.md` "Password Recovery" and `research.md` #7:
 * e-mail normalization, exact reset-redirect construction, neutral request
 * result (no account enumeration), password confirmation, and safe error
 * mapping (no raw Supabase error strings leaked).
 */
import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createRecoveryService } from "../../src/modules/auth/recovery-service";

function buildClientStub(overrides: {
  resetPasswordForEmail?: ReturnType<typeof vi.fn>;
  updateUser?: ReturnType<typeof vi.fn>;
} = {}) {
  return {
    auth: {
      resetPasswordForEmail:
        overrides.resetPasswordForEmail ??
        vi.fn().mockResolvedValue({ data: {}, error: null }),
      updateUser:
        overrides.updateUser ?? vi.fn().mockResolvedValue({ data: { user: {} }, error: null }),
    },
  } as unknown as SupabaseClient;
}

describe("recovery-service", () => {
  describe("requestPasswordRecovery", () => {
    it("normalizes the e-mail (trim) before calling Supabase", async () => {
      const resetPasswordForEmail = vi.fn().mockResolvedValue({ data: {}, error: null });
      const client = buildClientStub({ resetPasswordForEmail });
      const service = createRecoveryService(client, { appUrl: "https://app.doka.test" });

      await service.requestPasswordRecovery("  Operador@Doka.test  ");

      expect(resetPasswordForEmail).toHaveBeenCalledTimes(1);
      const [calledEmail] = resetPasswordForEmail.mock.calls[0] as [string, unknown];
      expect(calledEmail).toBe("Operador@Doka.test");
    });

    it("builds the exact reset redirect from VITE_APP_URL pointing to /redefinir-senha", async () => {
      const resetPasswordForEmail = vi.fn().mockResolvedValue({ data: {}, error: null });
      const client = buildClientStub({ resetPasswordForEmail });
      const service = createRecoveryService(client, { appUrl: "https://app.doka.test" });

      await service.requestPasswordRecovery("operador@doka.test");

      const [, options] = resetPasswordForEmail.mock.calls[0] as [string, { redirectTo: string }];
      expect(options.redirectTo).toBe("https://app.doka.test/redefinir-senha");
    });

    it("builds the exact reset redirect even when VITE_APP_URL has a trailing slash", async () => {
      const resetPasswordForEmail = vi.fn().mockResolvedValue({ data: {}, error: null });
      const client = buildClientStub({ resetPasswordForEmail });
      const service = createRecoveryService(client, { appUrl: "https://app.doka.test/" });

      await service.requestPasswordRecovery("operador@doka.test");

      const [, options] = resetPasswordForEmail.mock.calls[0] as [string, { redirectTo: string }];
      expect(options.redirectTo).toBe("https://app.doka.test/redefinir-senha");
    });

    it("returns a neutral ok result when the e-mail exists", async () => {
      const client = buildClientStub({
        resetPasswordForEmail: vi.fn().mockResolvedValue({ data: {}, error: null }),
      });
      const service = createRecoveryService(client, { appUrl: "https://app.doka.test" });

      const result = await service.requestPasswordRecovery("operador@doka.test");

      expect(result).toEqual({ ok: true });
    });

    it("returns the exact same neutral ok result when the e-mail does not exist", async () => {
      // Supabase intentionally returns no error for unknown e-mails to avoid
      // account enumeration; the service must not add its own divergence.
      const client = buildClientStub({
        resetPasswordForEmail: vi.fn().mockResolvedValue({ data: {}, error: null }),
      });
      const service = createRecoveryService(client, { appUrl: "https://app.doka.test" });

      const result = await service.requestPasswordRecovery("inexistente@doka.test");

      expect(result).toEqual({ ok: true });
    });

    it("returns the same neutral ok result even when Supabase reports a transport error", async () => {
      const client = buildClientStub({
        resetPasswordForEmail: vi.fn().mockResolvedValue({
          data: null,
          error: { message: "Network error" },
        }),
      });
      const service = createRecoveryService(client, { appUrl: "https://app.doka.test" });

      const result = await service.requestPasswordRecovery("operador@doka.test");

      // Even a transport failure must not reveal anything different to the
      // caller than success (auth-session-contract.md: "mesma confirmacao
      // neutra para e-mail existente ou inexistente").
      expect(result).toEqual({ ok: true });
    });
  });

  describe("confirmNewPassword", () => {
    it("calls updateUser with the new password and returns ok on success", async () => {
      const updateUser = vi.fn().mockResolvedValue({ data: { user: {} }, error: null });
      const client = buildClientStub({ updateUser });
      const service = createRecoveryService(client, { appUrl: "https://app.doka.test" });

      const result = await service.confirmNewPassword("NovaSenhaForte123");

      expect(updateUser).toHaveBeenCalledWith({ password: "NovaSenhaForte123" });
      expect(result).toEqual({ ok: true });
    });

    it("maps a weak/policy-violating password error to a safe PT-BR message", async () => {
      const updateUser = vi.fn().mockResolvedValue({
        data: null,
        error: { message: "Password should be at least 6 characters." },
      });
      const client = buildClientStub({ updateUser });
      const service = createRecoveryService(client, { appUrl: "https://app.doka.test" });

      const result = await service.confirmNewPassword("123");

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.message).not.toMatch(/characters/i);
        expect(result.message.length).toBeGreaterThan(0);
      }
    });

    it("maps a same-as-old-password rejection to a safe PT-BR message", async () => {
      const updateUser = vi.fn().mockResolvedValue({
        data: null,
        error: { message: "New password should be different from the old password." },
      });
      const client = buildClientStub({ updateUser });
      const service = createRecoveryService(client, { appUrl: "https://app.doka.test" });

      const result = await service.confirmNewPassword("SenhaAntiga123");

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.message).not.toMatch(/old password/i);
      }
    });

    it("maps an expired/invalid recovery session error to a safe PT-BR message", async () => {
      const updateUser = vi.fn().mockResolvedValue({
        data: null,
        error: { message: "Auth session missing!" },
      });
      const client = buildClientStub({ updateUser });
      const service = createRecoveryService(client, { appUrl: "https://app.doka.test" });

      const result = await service.confirmNewPassword("NovaSenhaForte123");

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.message).not.toMatch(/session missing/i);
      }
    });

    it("never includes the submitted password in the returned error message", async () => {
      const updateUser = vi.fn().mockResolvedValue({
        data: null,
        error: { message: "Password should be at least 6 characters." },
      });
      const client = buildClientStub({ updateUser });
      const service = createRecoveryService(client, { appUrl: "https://app.doka.test" });

      const result = await service.confirmNewPassword("segredo123");

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.message).not.toContain("segredo123");
      }
    });
  });
});
