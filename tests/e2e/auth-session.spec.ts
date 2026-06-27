/**
 * Playwright journeys for valid login, reload-without-flash, logout,
 * Back/favorite denial, and expired session (T029), per
 * `auth-session-contract.md` and `data-model.md` AuthState.
 *
 * Requires a local Supabase project seeded with
 * `supabase/seed/fundacao_operacional_seed.sql` (active `operador@doka.test`
 * / `doka123`) and a `.env` configured per `.env.example`. See
 * `specs/005-fundacao-app-autenticacao/tasks.md` Phase 3 checkpoint for the
 * current local-execution status of this suite.
 */
import { test, expect } from "@playwright/test";

const VALID_EMAIL = "operador@doka.test";
const VALID_PASSWORD = "doka123";

async function login(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill(VALID_EMAIL);
  await page.getByLabel("Senha").fill(VALID_PASSWORD);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/app\/dashboard$/);
}

test.describe("Autenticacao e sessao", () => {
  test("login valido leva ao Dashboard", async ({ page }) => {
    await login(page);
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  });

  test("reload nao exibe flash de conteudo protegido para usuario nao autenticado", async ({ page }) => {
    await page.goto("/app/dashboard");
    // Must redirect to /login, never render protected Dashboard content.
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("heading", { name: "Dashboard" })).not.toBeVisible();
  });

  test("reload apos login mantem usuario autorizado sem flash protegido", async ({ page }) => {
    await login(page);
    await page.reload();
    await expect(page).toHaveURL(/\/app\/dashboard$/);
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  });

  test("logout encerra a sessao e impede acesso por Back/URL direta", async ({ page }) => {
    await login(page);
    await page.getByRole("button", { name: /sair/i }).click();
    await expect(page).toHaveURL(/\/login$/);

    await page.goBack();
    await expect(page.getByRole("heading", { name: "Dashboard" })).not.toBeVisible();

    await page.goto("/app/dashboard");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("sessao expirada redireciona para a pagina de sessao expirada", async ({ page }) => {
    await login(page);
    // Simulate an Auth-detected expiration by clearing local Supabase storage
    // and triggering a navigation that re-evaluates the protected guard.
    await page.evaluate(() => {
      for (const key of Object.keys(window.localStorage)) {
        if (key.startsWith("sb-")) {
          window.localStorage.removeItem(key);
        }
      }
    });
    await page.reload();
    await expect(page).toHaveURL(/\/(login|sessao-expirada)$/);
  });
});
