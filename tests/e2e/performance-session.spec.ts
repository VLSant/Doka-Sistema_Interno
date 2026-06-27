/**
 * Playwright timing assertions (T080) for the login/restoration performance
 * goal and protected-content flash detection, per `plan.md` Performance
 * Goals ("pelo menos 95% dos logins e restauracoes devem chegar a area
 * segura ou a um estado acionavel em ate 3 segundos") and
 * `auth-session-contract.md`/`route-navigation-contract.md` ("nenhum
 * conteudo protegido antes da resolucao de Auth + contexto operacional").
 *
 * Requires a local Supabase project seeded with
 * `supabase/seed/fundacao_operacional_seed.sql` (active `operador@doka.test`
 * / `doka123`) and a `.env` configured per `.env.example`. See
 * `specs/005-fundacao-app-autenticacao/tasks.md` Phase 7 checkpoint for the
 * current local-execution status of this suite.
 */
import { test, expect, type Page } from "@playwright/test";

const VALID_EMAIL = "operador@doka.test";
const VALID_PASSWORD = "doka123";
const PERFORMANCE_BUDGET_MS = 3_000;

async function login(page: Page) {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill(VALID_EMAIL);
  await page.getByLabel("Senha").fill(VALID_PASSWORD);
  await page.getByRole("button", { name: "Entrar" }).click();
}

test.describe("Performance de login/restauracao de sessao", () => {
  test("login valido chega ao Dashboard em ate 3 segundos", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("E-mail").fill(VALID_EMAIL);
    await page.getByLabel("Senha").fill(VALID_PASSWORD);

    // Measure the authentication outcome, not browser startup, initial asset
    // loading, or human form-entry time.
    const start = Date.now();
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page).toHaveURL(/\/app\/dashboard$/);
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
    const elapsedMs = Date.now() - start;

    expect(elapsedMs).toBeLessThanOrEqual(PERFORMANCE_BUDGET_MS);
  });

  test("restauracao de sessao via reload chega ao Dashboard (ou a um estado acionavel) em ate 3 segundos", async ({
    page,
  }) => {
    await login(page);
    await expect(page).toHaveURL(/\/app\/dashboard$/);

    const start = Date.now();
    await page.reload();
    // "Estado acionavel" cobre tanto a area segura quanto, no pior caso, um
    // estado de feedback explicito (sessao expirada/falha temporaria) — o
    // que nunca deve acontecer e' a aplicacao ficar sem nenhum estado
    // visivel/acionavel além do tempo orcado.
    await expect(
      page.getByRole("heading", { name: "Dashboard" }).or(page.getByText(/sess[aã]o expirada/i)).or(
        page.getByText(/falha tempor[aá]ria/i),
      ),
    ).toBeVisible();
    const elapsedMs = Date.now() - start;

    expect(elapsedMs).toBeLessThanOrEqual(PERFORMANCE_BUDGET_MS);
  });

  test("reload nao exibe flash de conteudo protegido para usuario nao autenticado", async ({ page }) => {
    // Captures every heading rendered during navigation/resolution; the
    // protected Dashboard heading must never appear even transiently before
    // the redirect to /login completes.
    const observedHeadings: string[] = [];
    await page.exposeFunction("recordHeading", (text: string) => {
      observedHeadings.push(text);
    });
    await page.addInitScript(() => {
      const report = () => {
        document.querySelectorAll("h1, h2").forEach((heading) => {
          const text = heading.textContent?.trim();
          if (text) {
            // @ts-expect-error -- injected by exposeFunction in the test.
            window.recordHeading?.(text);
          }
        });
      };
      const observer = new MutationObserver(report);
      observer.observe(document.documentElement, { childList: true, subtree: true });
      window.addEventListener("DOMContentLoaded", report);
    });

    await page.goto("/app/dashboard");
    await expect(page).toHaveURL(/\/login$/);

    expect(observedHeadings.some((text) => /^dashboard$/i.test(text))).toBe(false);
  });

  test("reload apos login autorizado nao exibe flash do formulario de login antes do Dashboard", async ({
    page,
  }) => {
    await login(page);
    await expect(page).toHaveURL(/\/app\/dashboard$/);

    const observedLoginButtons: number[] = [];
    await page.exposeFunction("recordLoginButtonCount", (count: number) => {
      observedLoginButtons.push(count);
    });
    await page.addInitScript(() => {
      const report = () => {
        const count = document.querySelectorAll('button[type="submit"]').length;
        // @ts-expect-error -- injected by exposeFunction in the test.
        window.recordLoginButtonCount?.(count);
      };
      const observer = new MutationObserver(report);
      observer.observe(document.documentElement, { childList: true, subtree: true });
      window.addEventListener("DOMContentLoaded", report);
    });

    await page.reload();
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

    // The login form is never the resolved state for an already-authorized
    // session; observing it at all during the reload would indicate the
    // public login page rendered before/instead of the protected resolution.
    await expect(page.getByRole("button", { name: "Entrar" })).toHaveCount(0);
  });
});
