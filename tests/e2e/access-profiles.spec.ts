/**
 * Playwright profile-matrix scenarios for Operador, Supervisao, and
 * Direcao/Administracao (T045), per `route-navigation-contract.md` Route
 * Matrix and `operational-access-contract.md`.
 *
 * Requires a local Supabase project seeded with
 * `supabase/seed/fundacao_operacional_seed.sql` and a `.env` configured per
 * `.env.example`. See `specs/005-fundacao-app-autenticacao/tasks.md` Phase 4
 * checkpoint for the current local-execution status of this suite.
 */
import { test, expect, type Page } from "@playwright/test";

const PASSWORD = "doka123";

const PROFILES = {
  operador: { email: "operador@doka.test", canAccessAdminOnly: false },
  supervisao: { email: "supervisao@doka.test", canAccessAdminOnly: true },
  direcaoAdmin: { email: "direcao@doka.test", canAccessAdminOnly: true },
} as const;

async function login(page: Page, email: string) {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha").fill(PASSWORD);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/app\/dashboard$/);
}

for (const [profileName, profile] of Object.entries(PROFILES)) {
  test.describe(`Matriz de acesso: ${profileName}`, () => {
    test(`${profileName} acessa o Dashboard (disponivel a todos os perfis oficiais)`, async ({ page }) => {
      await login(page, profile.email);
      await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
    });

    test(`${profileName} acessa "Cadastros" somente se autorizado pelo perfil`, async ({ page }) => {
      await login(page, profile.email);
      await page.goto("/app/cadastros");

      if (profile.canAccessAdminOnly) {
        // Allowed by profile; the module itself is a placeholder for this
        // feature, so a neutral "unavailable" state (not a denial) is shown.
        await expect(page).toHaveURL(/\/app\/cadastros$/);
        await expect(page.getByRole("heading", { name: /acesso negado/i })).not.toBeVisible();
      } else {
        await expect(page.getByRole("heading", { name: /acesso negado/i })).toBeVisible();
      }
    });

    test(`${profileName} acessa "Historico / Auditoria" somente se autorizado pelo perfil`, async ({ page }) => {
      await login(page, profile.email);
      await page.goto("/app/historico-auditoria");

      if (profile.canAccessAdminOnly) {
        await expect(page).toHaveURL(/\/app\/historico-auditoria$/);
        await expect(page.getByRole("heading", { name: /acesso negado/i })).not.toBeVisible();
      } else {
        await expect(page.getByRole("heading", { name: /acesso negado/i })).toBeVisible();
      }
    });
  });
}

test.describe("Matriz de acesso: usuarios bloqueados", () => {
  test("usuario inativo nao acessa nenhuma rota protegida", async ({ page }) => {
    await login(page, "inativo@doka.test").catch(() => undefined);
    await page.goto("/app/dashboard");
    await expect(page).toHaveURL(/\/(login|acesso-negado|configuracao-operacional)/);
  });

  test("usuario sem perfil operacional nao acessa nenhuma rota protegida", async ({ page }) => {
    await login(page, "sem-perfil@doka.test").catch(() => undefined);
    await page.goto("/app/dashboard");
    await expect(page).toHaveURL(/\/(login|acesso-negado|configuracao-operacional)/);
  });
});
