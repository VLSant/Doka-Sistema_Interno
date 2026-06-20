# Tasks: Fundacao Operacional

**Input**: Design documents from `/specs/001-fundacao-operacional/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: This feature has explicit access, soft delete and audit success criteria. Tasks include SQL validation scripts under `supabase/tests/` and quickstart validation.

**Organization**: Tasks are grouped by user story to enable independent implementation and validation.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the working files for the Supabase-first implementation.

- [X] T001 Create the primary migration file for this feature in `supabase/migrations/202606180001_fundacao_operacional.sql`
- [X] T002 [P] Create the validation seed file with placeholder-safe test data in `supabase/seed/fundacao_operacional_seed.sql`
- [X] T003 [P] Create the RLS validation script shell in `supabase/tests/fundacao_operacional_rls.sql`
- [X] T004 [P] Create the audit validation script shell in `supabase/tests/fundacao_operacional_auditoria.sql`
- [X] T005 [P] Document feature-specific policy intent in `supabase/policies/fundacao_operacional.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared database primitives that MUST be complete before any user story can be implemented.

**CRITICAL**: No user story work can begin until this phase is complete.

- [X] T006 Add required PostgreSQL extensions and the private helper schema in `supabase/migrations/202606180001_fundacao_operacional.sql`
- [X] T007 Define `perfil_usuario` and `nivel_acesso_posto` enums in `supabase/migrations/202606180001_fundacao_operacional.sql`
- [X] T008 Add shared timestamp and `updated_at` trigger helpers with fixed `search_path` in `supabase/migrations/202606180001_fundacao_operacional.sql`
- [X] T009 Add the baseline audit insert helper for later triggers in `supabase/migrations/202606180001_fundacao_operacional.sql`
- [X] T010 Add initial grants/revokes for `anon`, `authenticated` and helper execution in `supabase/migrations/202606180001_fundacao_operacional.sql`

**Checkpoint**: Migration primitives are ready for table, RLS and audit implementation.

---

## Phase 3: User Story 1 - Acessar area interna com perfil operacional (Priority: P1) MVP

**Goal**: An authenticated user can be resolved to one active Doka operational profile, and users without an active profile are blocked from internal operational access.

**Independent Test**: Seed active, inactive and missing-profile users; verify only active operational users resolve through `usuario_atual_id()` and can read their own profile.

### Implementation for User Story 1

- [X] T011 [US1] Create `cargos_funcoes` table with Portuguese `snake_case` fields, soft delete columns and active-name uniqueness in `supabase/migrations/202606180001_fundacao_operacional.sql`
- [X] T012 [US1] Create `usuarios` table referencing `auth.users`, including `perfil`, `cargo_funcao_id`, `ativo`, control fields and soft delete columns in `supabase/migrations/202606180001_fundacao_operacional.sql`
- [X] T013 [US1] Add partial unique index for one active `usuarios.auth_user_id` and supporting indexes for `perfil` and `cargo_funcao_id` in `supabase/migrations/202606180001_fundacao_operacional.sql`
- [X] T014 [US1] Implement `usuario_atual_id()` in a private schema so inactive or soft-deleted profiles return null in `supabase/migrations/202606180001_fundacao_operacional.sql`
- [X] T015 [US1] Implement `usuario_tem_perfil(perfil_usuario)`, `usuario_e_direcao_admin()` and `usuario_e_supervisao()` helpers in `supabase/migrations/202606180001_fundacao_operacional.sql`
- [X] T016 [US1] Enable RLS on `usuarios` and `cargos_funcoes` in `supabase/migrations/202606180001_fundacao_operacional.sql`
- [X] T017 [US1] Add RLS policies allowing users to read their own active `usuarios` row and Direcao/Admin to manage operational users in `supabase/migrations/202606180001_fundacao_operacional.sql`
- [X] T018 [US1] Add RLS policies for active `cargos_funcoes` lookup and Direcao/Admin management in `supabase/migrations/202606180001_fundacao_operacional.sql`
- [X] T019 [US1] Add seed rows for active, inactive and missing-profile validation users in `supabase/seed/fundacao_operacional_seed.sql`
- [X] T020 [US1] Add profile-resolution assertions for active, inactive, deleted and missing-profile users in `supabase/tests/fundacao_operacional_rls.sql`
- [X] T021 [US1] Update the profile-resolution scenario notes with expected commands and outcomes in `specs/001-fundacao-operacional/quickstart.md`

**Checkpoint**: User Story 1 is complete when only an active Supabase-authenticated user with active `usuarios` profile can resolve and access their own operational profile.

---

## Phase 4: User Story 2 - Restringir acesso por perfil e posto (Priority: P1)

**Goal**: Operador and Supervisao see only linked postos, while Direcao/Admin has global visibility.

**Independent Test**: Seed three postos and users for each profile; verify operator, supervision and admin access matrix from `contracts/rls-access-contract.md`.

### Implementation for User Story 2

- [X] T022 [US2] Create `postos` table with `nome`, `codigo`, `descricao`, `ativo`, control fields and soft delete columns in `supabase/migrations/202606180001_fundacao_operacional.sql`
- [X] T023 [US2] Create `usuarios_postos` table with `usuario_id`, `posto_id`, `nivel_acesso`, control fields and soft delete columns in `supabase/migrations/202606180001_fundacao_operacional.sql`
- [X] T024 [US2] Add partial unique index preventing duplicate active `(usuario_id, posto_id)` links in `supabase/migrations/202606180001_fundacao_operacional.sql`
- [X] T025 [US2] Add indexes for `postos.ativo`, `usuarios_postos.posto_id` and `(usuarios_postos.usuario_id, usuarios_postos.nivel_acesso)` in `supabase/migrations/202606180001_fundacao_operacional.sql`
- [X] T026 [US2] Implement `usuario_tem_acesso_posto(uuid)` with Direcao/Admin global access, Operador linked access and Supervisao scoped access in `supabase/migrations/202606180001_fundacao_operacional.sql`
- [X] T027 [US2] Enable RLS on `postos` and `usuarios_postos` in `supabase/migrations/202606180001_fundacao_operacional.sql`
- [X] T028 [US2] Add RLS policies for `postos` read/manage behavior by Operador, Supervisao and Direcao/Admin in `supabase/migrations/202606180001_fundacao_operacional.sql`
- [X] T029 [US2] Add RLS policies for `usuarios_postos` read/manage behavior by own scope, supervision scope and Direcao/Admin in `supabase/migrations/202606180001_fundacao_operacional.sql`
- [X] T030 [US2] Add grants for Data API access to in-scope tables only for `authenticated` in `supabase/migrations/202606180001_fundacao_operacional.sql`
- [X] T031 [US2] Add seed data for Posto A, Posto B, Posto C, one Operador, one Supervisao and one Direcao/Admin in `supabase/seed/fundacao_operacional_seed.sql`
- [X] T032 [US2] Add RLS assertions for no-profile, Operador, Supervisao and Direcao/Admin access scenarios in `supabase/tests/fundacao_operacional_rls.sql`
- [X] T033 [US2] Document the final access matrix and policy names in `supabase/policies/fundacao_operacional.md`

**Checkpoint**: User Story 2 is complete when the RLS validation script proves Operador and Supervisao cannot read postos outside scope and Direcao/Admin can read all non-deleted postos.

---

## Phase 5: User Story 3 - Gerenciar cadastros base de acesso (Priority: P2)

**Goal**: Direcao/Admin can maintain usuarios, postos, usuarios_postos and cargos_funcoes while active duplicate links are rejected and soft-deleted records leave default lists.

**Independent Test**: Create, update, inactivate and soft-delete cadastros; verify uniqueness, default visibility and re-link behavior after soft delete.

### Implementation for User Story 3

- [X] T034 [US3] Add check constraints and not-null defaults for `usuarios`, `postos`, `usuarios_postos` and `cargos_funcoes` in `supabase/migrations/202606180001_fundacao_operacional.sql`
- [X] T035 [US3] Add `updated_at` triggers for `usuarios`, `postos` and `cargos_funcoes` in `supabase/migrations/202606180001_fundacao_operacional.sql`
- [X] T036 [US3] Add soft-delete helper or documented update pattern requiring `deleted_at`, `deleted_by` and `delete_reason` where applicable in `supabase/migrations/202606180001_fundacao_operacional.sql`
- [X] T037 [US3] Add Direcao/Admin management policies for insert, update and soft delete on `usuarios`, `postos`, `usuarios_postos` and `cargos_funcoes` in `supabase/migrations/202606180001_fundacao_operacional.sql`
- [X] T038 [US3] Add scoped Supervisao read/manage policies only where authorized by the MVP for `usuarios`, `postos` and `usuarios_postos` in `supabase/migrations/202606180001_fundacao_operacional.sql`
- [X] T039 [US3] Add seed cases for duplicate active links, soft-deleted links and inactive postos in `supabase/seed/fundacao_operacional_seed.sql`
- [X] T040 [US3] Add uniqueness and soft-delete visibility assertions for cadastros in `supabase/tests/fundacao_operacional_rls.sql`
- [X] T041 [US3] Update `specs/001-fundacao-operacional/quickstart.md` with validation steps for duplicate active links and soft delete behavior

**Checkpoint**: User Story 3 is complete when cadastros can be managed by allowed profiles, duplicate active links fail, and soft-deleted records disappear from default operational reads.

---

## Phase 6: User Story 4 - Auditar acoes criticas da fundacao (Priority: P2)

**Goal**: Critical changes to users, postos, links and permissions are recorded in centralized audit history.

**Independent Test**: Execute create, update, profile change, activation/inactivation, link/unlink and soft-delete flows; verify `historico_auditoria` rows match `contracts/audit-contract.md`.

### Implementation for User Story 4

- [X] T042 [US4] Create `historico_auditoria` table with `entidade_tipo`, `entidade_id`, `acao`, JSON values, `metadata`, `usuario_id` and `created_at` in `supabase/migrations/202606180001_fundacao_operacional.sql`
- [X] T043 [US4] Add audit indexes for `(entidade_tipo, entidade_id)`, `usuario_id`, `created_at` and `acao` in `supabase/migrations/202606180001_fundacao_operacional.sql`
- [X] T044 [US4] Implement audit trigger functions for `usuarios`, `postos`, `usuarios_postos` and `cargos_funcoes` in `supabase/migrations/202606180001_fundacao_operacional.sql`
- [X] T045 [US4] Attach audit triggers for create, update, profile change, activation, inactivation, link creation, link removal and soft delete in `supabase/migrations/202606180001_fundacao_operacional.sql`
- [X] T046 [US4] Enable RLS on `historico_auditoria` and restrict general audit listing to Direcao/Admin with scoped Supervisao access where supported in `supabase/migrations/202606180001_fundacao_operacional.sql`
- [X] T047 [US4] Add explicit prevention of ordinary operational delete on `historico_auditoria` through privileges and policies in `supabase/migrations/202606180001_fundacao_operacional.sql`
- [X] T048 [US4] Add audit event assertions for all required actions in `supabase/tests/fundacao_operacional_auditoria.sql`
- [X] T049 [US4] Document audit action names and event shape in `supabase/policies/fundacao_operacional.md`

**Checkpoint**: User Story 4 is complete when all required audit events are created after successful operations and failed operations do not create misleading success events.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Validate security, constitution gates and feature readiness.

- [X] T050 Run `supabase db reset` and record any setup issues in `specs/001-fundacao-operacional/quickstart.md`
- [X] T051 Run `supabase/tests/fundacao_operacional_rls.sql` and fix any failed access assertion in `supabase/migrations/202606180001_fundacao_operacional.sql`
- [X] T052 Run `supabase/tests/fundacao_operacional_auditoria.sql` and fix any failed audit assertion in `supabase/migrations/202606180001_fundacao_operacional.sql`
- [X] T053 Run Supabase advisors or equivalent security review and document findings in `supabase/policies/fundacao_operacional.md`
- [X] T054 Verify no authorization decision uses user-editable metadata and document the result in `supabase/policies/fundacao_operacional.md`
- [X] T055 Verify all in-scope public tables have RLS enabled and no operational table grants access to `anon` in `supabase/policies/fundacao_operacional.md`
- [X] T056 Validate Doka constitution gates for RLS/profile/posto, Portuguese `snake_case`, soft delete and `historico_auditoria` in `specs/001-fundacao-operacional/tasks.md`
- [X] T057 Update `specs/001-fundacao-operacional/quickstart.md` with final command output summary after validation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational.
- **User Story 2 (Phase 4)**: Depends on Foundational and uses `usuarios` helpers from US1 for full validation.
- **User Story 3 (Phase 5)**: Depends on US1 and US2 because it manages their cadastros and links.
- **User Story 4 (Phase 6)**: Depends on the target tables from US1, US2 and US3.
- **Polish (Phase 7)**: Depends on all selected user stories.

### User Story Dependencies

- **US1**: MVP base for profile resolution.
- **US2**: Can be developed after Foundational, but final validation needs US1 helpers.
- **US3**: Requires US1 and US2 tables/policies.
- **US4**: Requires tables and flows from US1-US3 to attach and validate audit triggers.

### Within Each User Story

- Schema before helper functions.
- Helper functions before policies.
- Policies before seed validation.
- Seed data before validation scripts.
- Validation must pass before moving to the next dependent story.

---

## Parallel Opportunities

- T002, T003, T004 and T005 can run in parallel after T001.
- T011 and T012 should be sequential, but T019 and T020 can be prepared in parallel after US1 schema decisions are known.
- T022 and T023 should be sequential, but T031, T032 and T033 can be prepared in parallel after policy names are defined.
- T039, T040 and T041 can run in parallel after US3 policies are drafted.
- T048 and T049 can run in parallel after audit action names are final.

## Parallel Example: User Story 2

```bash
# After T022-T030 are drafted, work can split:
Task: "Add seed data for Posto A, Posto B, Posto C, one Operador, one Supervisao and one Direcao/Admin in supabase/seed/fundacao_operacional_seed.sql"
Task: "Add RLS assertions for no-profile, Operador, Supervisao and Direcao/Admin access scenarios in supabase/tests/fundacao_operacional_rls.sql"
Task: "Document the final access matrix and policy names in supabase/policies/fundacao_operacional.md"
```

## Implementation Strategy

### MVP First

1. Complete Phase 1 and Phase 2.
2. Complete US1 to prove authenticated users resolve to active operational profiles.
3. Complete US2 to prove profile + posto RLS.
4. Stop and validate before adding broader cadastro management and audit automation.

### Incremental Delivery

1. Deliver US1 profile resolution.
2. Add US2 access by posto.
3. Add US3 management constraints and soft delete behavior.
4. Add US4 centralized audit triggers and audit policies.
5. Run Phase 7 validation.

### Final Validation

Run the quickstart scenarios in `specs/001-fundacao-operacional/quickstart.md` and ensure the two SQL validation scripts pass before considering the feature ready for implementation review.

## Notes

- All table and field names must remain in Portuguese `snake_case`.
- Do not add MMS import, assistencias, ocorrencias, tarefas, custos extras or dashboard work in this feature.
- Keep security-definer helpers out of exposed schemas or fix `search_path` and grants explicitly.
- Do not use `raw_user_meta_data` or other user-editable metadata for authorization.
