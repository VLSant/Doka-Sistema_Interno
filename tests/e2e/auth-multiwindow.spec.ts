/**
 * Playwright coverage for logout/expiration synchronization between two
 * windows (T030), per `auth-session-contract.md` Logout/Session Expiration
 * ("Historico, favorito ou URL direta devem exigir novo login.").
 *
 * Requires a local Supabase project seeded with
 * `supabase/seed/fundacao_operacional_seed.sql` and a `.env` configured per
 * `.env.example`. See `specs/005-fundacao-app-autenticacao/tasks.md` Phase 3
 * checkpoint for the current local-execution status of this suite.
 */
import { test, expect, type BrowserContext } from "@playwright/test";

const VALID_EMAIL = "operador@doka.test";
const VALID_PASSWORD = "doka123";

async function loginInNewPage(context: BrowserContext) {
  const page = await context.newPage();
  await page.goto("/login");
  await page.getByLabel("E-mail").fill(VALID_EMAIL);
  await page.getByLabel("Senha").fill(VALID_PASSWORD);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/app\/dashboard$/);
  return page;
}

test.describe("Sincronizacao entre janelas", () => {
  test("logout em uma janela encerra a sessao tambem na outra", async ({ context }) => {
    const pageA = await loginInNewPage(context);
    const pageB = await context.newPage();
    await pageB.goto("/app/dashboard");
    await expect(pageB).toHaveURL(/\/app\/dashboard$/);

    await pageA.getByRole("button", { name: /sair/i }).click();
    await expect(pageA).toHaveURL(/\/login$/);

    // Storage events propagate the local sign-out to other open tabs; the
    // second window must also lose access to protected content.
    await pageB.reload();
    await expect(pageB).toHaveURL(/\/login$/);
  });

  test("sessao expirada em uma janela reflete na outra ao navegar", async ({ context }) => {
    const pageA = await loginInNewPage(context);
    const pageB = await context.newPage();
    await pageB.goto("/app/dashboard");
    await expect(pageB).toHaveURL(/\/app\/dashboard$/);

    await pageA.evaluate(() => {
      for (const key of Object.keys(window.localStorage)) {
        if (key.startsWith("sb-")) {
          window.localStorage.removeItem(key);
        }
      }
    });
    await pageA.reload();

    await pageB.reload();
    await expect(pageB).toHaveURL(/\/(login|sessao-expirada)$/);
  });
});
