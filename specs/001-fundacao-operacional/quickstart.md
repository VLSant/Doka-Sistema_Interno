# Quickstart: Fundacao Operacional

## Prerequisites

- Supabase CLI installed.
- Local Supabase stack available.
- `.env` filled from `.env.example` with Supabase project values.
- Feature artifacts reviewed:
  - [spec.md](./spec.md)
  - [plan.md](./plan.md)
  - [data-model.md](./data-model.md)
  - [contracts/rls-access-contract.md](./contracts/rls-access-contract.md)
  - [contracts/audit-contract.md](./contracts/audit-contract.md)

## Setup

```bash
supabase --version
supabase start
supabase db reset
```

If the Supabase CLI version does not support a required command, check
`supabase --help` and the current Supabase CLI docs before changing the workflow.

Feature files created by implementation:

- `supabase/migrations/202606180001_fundacao_operacional.sql`
- `supabase/seed/fundacao_operacional_seed.sql`
- `supabase/tests/fundacao_operacional_rls.sql`
- `supabase/tests/fundacao_operacional_auditoria.sql`
- `supabase/policies/fundacao_operacional.md`

Validation sequence:

```bash
supabase db reset
psql "$SUPABASE_DB_URL" -f supabase/seed/fundacao_operacional_seed.sql
psql "$SUPABASE_DB_URL" -f supabase/tests/fundacao_operacional_rls.sql
psql "$SUPABASE_DB_URL" -f supabase/tests/fundacao_operacional_auditoria.sql
```

## Validation Data

Create or seed:
- 3 postos: Posto A, Posto B, Posto C.
- 1 Operador linked only to Posto A.
- 1 Supervisao linked to Postos A and B with supervision access.
- 1 Direcao/Admin without posto links.
- 1 authenticated user without active `usuarios`.
- At least one inactive or soft-deleted user/link/posto.

## Scenario 1: Authenticated user resolves operational profile

Expected:
- Active user with `usuarios.auth_user_id = auth.uid()` resolves to a profile.
- User without active profile cannot access internal operational data.
- Inactive or soft-deleted profile cannot access internal operational data.

Covered by:
- `supabase/tests/fundacao_operacional_rls.sql`

## Scenario 2: Operator scope

Expected:
- Operador sees Posto A.
- Operador does not see Posto B or C.
- Operador cannot create, update or soft-delete scoped records outside Posto A.
- Removed links no longer grant access.

## Scenario 3: Supervisao scope

Expected:
- Supervisao sees Postos A and B.
- Supervisao does not see Posto C.
- Supervisao access depends on active supervision-scope links.

## Scenario 4: Direcao/Admin global scope

Expected:
- Direcao/Admin sees all non-deleted postos, users and links.
- Direcao/Admin can manage cadastros base and inspect full audit history.
- Direcao/Admin does not require `usuarios_postos` links for global access.

## Scenario 5: Unique active links

Expected:
- Creating a duplicate active `usuarios_postos` row for the same user/posto fails.
- After soft delete of a link, creating a new active link for the same user/posto is allowed if the business flow requires it.

Covered by:
- `supabase/tests/fundacao_operacional_rls.sql`

## Scenario 6: Soft delete

Expected:
- Soft-deleted users, postos, links and cargos/funcoes are hidden from default operational queries.
- Soft delete does not physically remove records.
- Soft delete generates `historico_auditoria`.

Covered by:
- `supabase/tests/fundacao_operacional_rls.sql`
- `supabase/tests/fundacao_operacional_auditoria.sql`

## Scenario 7: Audit

Expected:
- Creating, updating, changing profile, activating, inactivating, linking, unlinking and soft-deleting records creates audit entries.
- Audit contains entity, action, actor, previous value and new value when applicable.
- Failed operations do not create success audit events.

## Scenario 8: Advisors and security checks

Expected before completion:
- RLS enabled on all in-scope public tables.
- No operational table exposed to `anon`.
- Grants for `authenticated` are intentional if Data API access is required.
- Advisors do not report unresolved high-risk RLS/security issues for this feature.

## Implementation Validation Status - 2026-06-19

Commands executed in this workspace:

```text
npx supabase --version
2.107.0

npx supabase db reset
failed to inspect service: Docker Desktop is a prerequisite for local development

npx supabase db lint
failed to connect to postgres while connecting to local database

docker --version
command not found

psql --version
command not found
```

MCP Supabase checks for project `Doka` (`zwxxjbiwpgqjsmaxybbm`):

```text
applied migrations:
- fundacao_operacional
- ajustar_policies_admin_soft_delete
- corrigir_auditoria_cadastros
- ajustar_update_admin_soft_delete
- ajustar_select_admin_soft_delete
- refinar_check_update_admin
- restringir_historico_auditoria_privilegios

public tables with RLS:
- cargos_funcoes
- usuarios
- postos
- usuarios_postos
- historico_auditoria

T051 fundacao_operacional_rls.sql: PASS
T052 fundacao_operacional_auditoria.sql: PASS

security advisors after validation:
- auth_leaked_password_protection WARN, project Auth setting outside this migration

post-validation cleanup:
- validation rows and `@doka.test` auth users removed from remote project
- schema and migrations remain applied
```

Complementary validation on 2026-06-20:

```text
T052 expanded audit assertions: PASS

covered audit actions:
- criado
- atualizado
- perfil_alterado
- ativado
- inativado
- vinculo_posto_criado
- vinculo_posto_removido
- excluido_logicamente
- cargos_funcoes criado/atualizado

historico_auditoria privileges for authenticated:
- SELECT only

historico_auditoria privileges for anon:
- none

security advisors:
- auth_leaked_password_protection WARN, project Auth setting outside this migration

post-validation cleanup:
- validation rows and `@doka.test` auth users removed from remote project
- schema and migrations remain applied
```

The feature was applied and validated in the remote Supabase project `Doka` via
MCP. Local Docker/psql validation remains unavailable in this workstation.
