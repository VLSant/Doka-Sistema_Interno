/**
 * Playwright journeys for password recovery (T071), per
 * `auth-session-contract.md` Password Recovery: neutrality for
 * existing/nonexistent e-mail, successful reset, old-password rejection,
 * and expired/reused link rejection.
 *
 * Requires a local Supabase project with Mailpit (per `research.md` #7) and
 * a seeded `operador@doka.test` / `doka123` account
 * (`supabase/seed/fundacao_operacional_seed.sql`). See
 * `specs/005-fundacao-app-autenticacao/tasks.md` Phase 6 checkpoint for the
 * current local-execution status of this suite (same Docker limitation
 * recorded at the US1/US2/US3 checkpoints).
 */
import { test, expect } from "@playwright/test";

const EXISTING_EMAIL = "operador@doka.test";
const NONEXISTENT_EMAIL = "nao-existe@doka.test";
const OLD_PASSWORD = "doka123";
const NEW_PASSWORD = "NovaSenhaForte123";

test.describe("Recuperacao de senha", () => {
  test("solicitar recuperacao com e-mail existente mostra confirmacao neutra", async ({ page }) => {
    await page.goto("/recuperar-senha");
    await page.getByLabel("E-mail").fill(EXISTING_EMAIL);
    await page.getByRole("button", { name: /enviar/i }).click();

    await expect(page.getByText(/se o e-mail informado estiver cadastrado/i)).toBeVisible();
  });

  test("solicitar recuperacao com e-mail inexistente mostra a mesma confirmacao neutra", async ({ page }) => {
    await page.goto("/recuperar-senha");
    await page.getByLabel("E-mail").fill(NONEXISTENT_EMAIL);
    await page.getByRole("button", { name: /enviar/i }).click();

    await expect(page.getByText(/se o e-mail informado estiver cadastrado/i)).toBeVisible();
  });

  test("redefinir senha sem link de recuperacao valido mostra falha segura", async ({ page }) => {
    await page.goto("/redefinir-senha");

    await expect(page.getByText(/link.*invalido|nao foi possivel confirmar/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /solicitar novo link/i })).toBeVisible();
  });

  test("fluxo completo: solicitar, seguir link Mailpit, definir nova senha, senha antiga rejeitada", async ({
    page,
  }) => {
    test.skip(
      !process.env.MAILPIT_URL,
      "Requires a local Supabase project with Mailpit running (Docker); see tasks.md Phase 6 checkpoint.",
    );

    await page.goto("/recuperar-senha");
    await page.getByLabel("E-mail").fill(EXISTING_EMAIL);
    await page.getByRole("button", { name: /enviar/i }).click();
    await expect(page.getByText(/se o e-mail informado estiver cadastrado/i)).toBeVisible();

    // Fetch the recovery link from the local Mailpit inbox.
    const mailpitResponse = await page.request.get(`${process.env.MAILPIT_URL}/api/v1/messages`);
    const mailpitBody = (await mailpitResponse.json()) as { messages: Array<{ ID: string }> };
    const latestMessageId = mailpitBody.messages[0]?.ID;
    const messageResponse = await page.request.get(
      `${process.env.MAILPIT_URL}/api/v1/message/${latestMessageId}`,
    );
    const messageBody = (await messageResponse.json()) as { Text: string };
    const recoveryLinkMatch = messageBody.Text.match(/https?:\/\/\S+/);
    const recoveryLink = recoveryLinkMatch?.[0];
    expect(recoveryLink).toBeTruthy();

    await page.goto(recoveryLink as string);
    await expect(page).toHaveURL(/\/redefinir-senha/);

    await page.getByLabel("Nova senha").fill(NEW_PASSWORD);
    await page.getByLabel("Confirmar nova senha").fill(NEW_PASSWORD);
    await page.getByRole("button", { name: /salvar|redefinir/i }).click();

    await expect(page).toHaveURL(/\/login$/);

    // Old password must now be rejected.
    await page.getByLabel("E-mail").fill(EXISTING_EMAIL);
    await page.getByLabel("Senha").fill(OLD_PASSWORD);
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page).toHaveURL(/\/login$/);

    // New password must work.
    await page.getByLabel("Senha").fill(NEW_PASSWORD);
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page).toHaveURL(/\/app\/dashboard$/);

    // Reusing the same recovery link a second time must fail safely.
    await page.goto(recoveryLink as string);
    await expect(page.getByText(/link.*invalido|expirad/i)).toBeVisible();
  });
});
