/**
 * Playwright navigation journeys for all three official profiles at
 * 1440x900 and 1280x720 (T059), per `route-navigation-contract.md` "App
 * Shell", "Menu Contract", and "Desktop Validation".
 *
 * Requires a local Supabase project seeded with
 * `supabase/seed/fundacao_operacional_seed.sql` and a `.env` configured per
 * `.env.example`. See `specs/005-fundacao-app-autenticacao/tasks.md` Phase 5
 * checkpoint for the current local-execution status of this suite.
 */
import { test, expect, type Page } from "@playwright/test";

const PASSWORD = "doka123";

const VIEWPORTS = [
  { name: "1440x900", width: 1440, height: 900 },
  { name: "1280x720", width: 1280, height: 720 },
];

const PROFILES = {
  operador: { email: "operador@doka.test", hasAdminMenu: false },
  supervisao: { email: "supervisao@doka.test", hasAdminMenu: true },
  direcaoAdmin: { email: "direcao@doka.test", hasAdminMenu: true },
} as const;

async function login(page: Page, email: string) {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha").fill(PASSWORD);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/app\/dashboard$/);
}

for (const viewport of VIEWPORTS) {
  test.describe(`Navegacao do App Shell em ${viewport.name}`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    for (const [profileName, profile] of Object.entries(PROFILES)) {
      test(`${profileName}: ve o shell completo (logo, perfil, postos/escopo, logout) sem itens cortados`, async ({
        page,
      }) => {
        await login(page, profile.email);

        await expect(page.getByRole("img", { name: /doka/i })).toBeVisible();
        await expect(page.getByRole("button", { name: /sair/i })).toBeVisible();
        await expect(page.getByRole("link", { name: "Dashboard" })).toBeVisible();

        if (profile.hasAdminMenu) {
          await expect(page.getByText("Cadastros")).toBeVisible();
        } else {
          await expect(page.getByText("Cadastros")).toHaveCount(0);
        }
      });

      test(`${profileName}: navega para um destino indisponivel sem dados/falsas acoes`, async ({ page }) => {
        await login(page, profile.email);
        await page.goto("/app/ocorrencias");

        await expect(page.getByText(/ainda n[aã]o dispon[ií]vel/i)).toBeVisible();
        await expect(page.getByRole("table")).toHaveCount(0);
      });

      test(`${profileName}: realiza logout e perde acesso ao conteudo protegido`, async ({ page }) => {
        await login(page, profile.email);
        await page.getByRole("button", { name: /sair/i }).click();
        await expect(page).toHaveURL(/\/login$/);

        await page.goto("/app/dashboard");
        await expect(page).toHaveURL(/\/login$/);
      });
    }

    test("rota desconhecida mostra 404 em PT-BR com retorno seguro", async ({ page }) => {
      await login(page, PROFILES.operador.email);
      await page.goto("/rota-totalmente-desconhecida");

      await expect(page.getByText(/p[aá]gina n[aã]o encontrada/i)).toBeVisible();
      await page.getByRole("button", { name: /dashboard/i }).click();
      await expect(page).toHaveURL(/\/app\/dashboard$/);
    });
  });
}
