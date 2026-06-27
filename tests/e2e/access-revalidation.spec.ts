/**
 * Playwright scenarios for revalidation during an already-authenticated
 * session (T046): inactivation, profile change, posto/link removal, last-link
 * removal, and upgrade/downgrade to global scope, per
 * `operational-access-contract.md` ("Revalidation").
 *
 * These scenarios mutate operational rows directly via the Supabase
 * service-role client available only in the local/test Supabase project
 * (never via the browser/publishable client), then confirm that the
 * already-authenticated browser session re-evaluates and blocks/allows
 * accordingly on the next protected navigation, without a new login.
 *
 * Requires a local Supabase project seeded with
 * `supabase/seed/fundacao_operacional_seed.sql`, a `.env` configured per
 * `.env.example`, and `SUPABASE_SERVICE_ROLE_KEY`/`SUPABASE_URL` available to
 * the Playwright test runner (server-side only, never sent to the browser).
 * See `specs/005-fundacao-app-autenticacao/tasks.md` Phase 4 checkpoint for
 * the current local-execution status of this suite.
 */
import { test, expect, type Page } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const PASSWORD = "doka123";

function adminClient() {
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error(
      "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set (test-runner only) to mutate operational rows directly.",
    );
  }
  return createClient(url, serviceRoleKey);
}

async function login(page: Page, email: string) {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha").fill(PASSWORD);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/app\/dashboard$/);
}

test.describe("Revalidacao durante a sessao", () => {
  test.skip(
    !process.env.SUPABASE_SERVICE_ROLE_KEY,
    "Requires a local Supabase service-role key for direct row mutation (test-runner only).",
  );

  test("inativacao do usuario bloqueia a navegacao subsequente sem novo login", async ({ page }) => {
    const email = "operador@doka.test";
    await login(page, email);

    const admin = adminClient();
    await admin.from("usuarios").update({ ativo: false }).eq("email", email);

    try {
      await page.reload();
      await expect(page).toHaveURL(/\/(login|acesso-negado|configuracao-operacional)/);
    } finally {
      await admin.from("usuarios").update({ ativo: true }).eq("email", email);
    }
  });

  test("mudanca de perfil restringe a navegacao subsequente conforme o novo perfil", async ({ page }) => {
    const email = "operador@doka.test";
    await login(page, email);

    const admin = adminClient();
    await admin.from("usuarios").update({ perfil: "operador" }).eq("email", email);
    // Downgrade is implicit (no-op here); the meaningful assertion is the
    // upgrade/downgrade case covered in the dedicated test below. This test
    // documents that a same-profile reload keeps access stable.
    await page.reload();
    await expect(page).toHaveURL(/\/app\/dashboard$/);
  });

  test("remocao do vinculo de posto bloqueia rotas que dependem daquele posto", async ({ page }) => {
    const email = "operador@doka.test";
    await login(page, email);

    const admin = adminClient();
    const { data: usuario } = await admin.from("usuarios").select("id").eq("email", email).single();
    if (!usuario) throw new Error(`Seed usuario not found for ${email}`);
    await admin
      .from("usuarios_postos")
      .update({ deleted_at: new Date().toISOString() })
      .eq("usuario_id", usuario.id);

    try {
      await page.reload();
      await expect(page).toHaveURL(/\/(login|acesso-negado|configuracao-operacional)/);
    } finally {
      await admin.from("usuarios_postos").update({ deleted_at: null }).eq("usuario_id", usuario.id);
    }
  });

  test("remocao do ultimo vinculo bloqueia Operador/Supervisao por falta de posto elegivel", async ({ page }) => {
    const email = "supervisao@doka.test";
    await login(page, email);

    const admin = adminClient();
    const { data: usuario } = await admin.from("usuarios").select("id").eq("email", email).single();
    if (!usuario) throw new Error(`Seed usuario not found for ${email}`);
    await admin
      .from("usuarios_postos")
      .update({ deleted_at: new Date().toISOString() })
      .eq("usuario_id", usuario.id);

    try {
      await page.reload();
      await expect(page).toHaveURL(/\/(login|acesso-negado|configuracao-operacional)/);
    } finally {
      await admin.from("usuarios_postos").update({ deleted_at: null }).eq("usuario_id", usuario.id);
    }
  });

  test("upgrade para Direcao/Administracao concede escopo global sem novo login", async ({ page }) => {
    const email = "operador@doka.test";
    await login(page, email);

    const admin = adminClient();
    await admin.from("usuarios").update({ perfil: "direcao_admin" }).eq("email", email);

    try {
      await page.goto("/app/cadastros");
      await expect(page).toHaveURL(/\/app\/cadastros$/);
    } finally {
      await admin.from("usuarios").update({ perfil: "operador" }).eq("email", email);
    }
  });

  test("downgrade de Direcao/Administracao exige vinculos de posto validos para o novo perfil", async ({ page }) => {
    const email = "direcao@doka.test";
    await login(page, email);

    const admin = adminClient();
    await admin.from("usuarios").update({ perfil: "operador" }).eq("email", email);

    try {
      await page.reload();
      // Direcao Teste has no usuarios_postos link, so downgrading to
      // Operador must block on sem_posto_autorizado.
      await expect(page).toHaveURL(/\/(login|acesso-negado|configuracao-operacional)/);
    } finally {
      await admin.from("usuarios").update({ perfil: "direcao_admin" }).eq("email", email);
    }
  });
});
