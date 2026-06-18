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

## Scenario 6: Soft delete

Expected:
- Soft-deleted users, postos, links and cargos/funcoes are hidden from default operational queries.
- Soft delete does not physically remove records.
- Soft delete generates `historico_auditoria`.

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
