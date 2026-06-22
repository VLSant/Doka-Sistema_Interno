# Tasks: Cadastros Base MVP

**Input**: Design documents from `specs/002-cadastros-base-mvp/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**: Required by the spec success criteria. SQL validation tasks must be created before implementation tasks for the behavior they verify.

**Organization**: Tasks are grouped by user story to keep each story independently implementable and testable.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it touches different files or does not depend on incomplete tasks.
- **[Story]**: User story label from `spec.md`.
- Every task includes the target file path.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare the feature files and preserve the database-first structure defined in the plan.

- [X] T001 Create placeholder migration file `supabase/migrations/202606200002_cadastros_base_mvp.sql`
- [X] T002 [P] Create seed file `supabase/seed/cadastros_base_mvp.sql`
- [X] T003 [P] Create RLS validation file `supabase/tests/cadastros_base_rls.sql`
- [X] T004 [P] Create validation constraints test file `supabase/tests/cadastros_base_validacoes.sql`
- [X] T005 [P] Create audit validation file `supabase/tests/cadastros_base_auditoria.sql`
- [X] T006 [P] Create policies documentation file `supabase/policies/cadastros_base_mvp.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build shared database primitives required by all cadastros before user stories are implemented.

**CRITICAL**: No user story work can begin until this phase is complete.

- [X] T007 Inspect Spec 01 helpers and audit trigger patterns in `supabase/migrations/202606180001_fundacao_operacional.sql`
- [X] T008 Add extension setup for accent-insensitive normalization and optional `btree_gist` support in `supabase/migrations/202606200002_cadastros_base_mvp.sql`
- [X] T009 Add `app_private.normalizar_texto_operacional(text)` helper with fixed `search_path` in `supabase/migrations/202606200002_cadastros_base_mvp.sql`
- [X] T010 Add shared `app_private.validar_soft_delete_campos(timestamptz, uuid, text)` helper or equivalent check pattern in `supabase/migrations/202606200002_cadastros_base_mvp.sql`
- [X] T011 Add shared updated-at trigger function reuse or trigger wiring plan for all new tables in `supabase/migrations/202606200002_cadastros_base_mvp.sql`
- [X] T012 Add shared audit trigger function for cadastros base actions `criado`, `atualizado`, `ativado`, `inativado` and `excluido_logicamente` in `supabase/migrations/202606200002_cadastros_base_mvp.sql`
- [X] T013 Define baseline grants revoking anonymous table access and limiting authenticated access to RLS-governed operations in `supabase/migrations/202606200002_cadastros_base_mvp.sql`
- [X] T014 [P] Document shared helper and grant decisions in `supabase/policies/cadastros_base_mvp.md`
- [X] T015 [P] Add shared seed references to existing Spec 01 users and postos in `supabase/seed/cadastros_base_mvp.sql`

**Checkpoint**: Shared normalization, soft-delete, audit and grants are ready for the cadastro tables.

---

## Phase 3: User Story 1 - Manter prioridades operacionais globais (Priority: P1) MVP

**Goal**: Direcao/Admin manages global priorities; Operador and Supervisao only consult active priorities.

**Independent Test**: Create, edit, activate, inactivate and soft-delete priorities as Direcao/Admin; verify Operador/Supervisao see only active priorities and cannot manage them.

### Tests for User Story 1

- [X] T016 [P] [US1] Add priority validation cases for required `nome`, positive `nivel`, valid `cor`, duplicate active `nome_normalizado` and duplicate active `nivel` in `supabase/tests/cadastros_base_validacoes.sql`
- [X] T017 [P] [US1] Add priority RLS cases for Direcao/Admin management and Operador/Supervisao read-only active access in `supabase/tests/cadastros_base_rls.sql`
- [X] T018 [P] [US1] Add priority audit assertions for `criado`, `atualizado`, `ativado`, `inativado` and `excluido_logicamente` in `supabase/tests/cadastros_base_auditoria.sql`

### Implementation for User Story 1

- [X] T019 [US1] Create `public.prioridades` table with Portuguese `snake_case` fields, PK `id`, control fields and soft-delete fields in `supabase/migrations/202606200002_cadastros_base_mvp.sql`
- [X] T020 [US1] Add check constraints for `prioridades.nome`, `prioridades.nivel`, `prioridades.cor` and soft-delete required fields in `supabase/migrations/202606200002_cadastros_base_mvp.sql`
- [X] T021 [US1] Add trigger to maintain `prioridades.nome_normalizado` and `updated_at` in `supabase/migrations/202606200002_cadastros_base_mvp.sql`
- [X] T022 [US1] Add unique partial indexes for active `prioridades.nome_normalizado` and active `prioridades.nivel` in `supabase/migrations/202606200002_cadastros_base_mvp.sql`
- [X] T023 [US1] Add FK and query-support indexes for `prioridades.created_by`, `prioridades.updated_by`, `prioridades.deleted_by`, `ativo` and `deleted_at` in `supabase/migrations/202606200002_cadastros_base_mvp.sql`
- [X] T024 [US1] Enable RLS and create select/insert/update policies for `prioridades` according to `contracts/rls-access-contract.md` in `supabase/migrations/202606200002_cadastros_base_mvp.sql`
- [X] T025 [US1] Attach audit trigger to `public.prioridades` in `supabase/migrations/202606200002_cadastros_base_mvp.sql`
- [X] T026 [US1] Add priority seed data covering active, inactive and soft-deleted examples in `supabase/seed/cadastros_base_mvp.sql`
- [X] T027 [US1] Document `prioridades` policies, validations and audit behavior in `supabase/policies/cadastros_base_mvp.md`

**Checkpoint**: US1 is complete when its validation, RLS and audit tests prove priorities work independently.

---

## Phase 4: User Story 2 - Manter tipos de ocorrencia globais (Priority: P1)

**Goal**: Direcao/Admin manages global occurrence types; Operador and Supervisao only consult active types.

**Independent Test**: Create, edit, activate, inactivate and soft-delete occurrence types; validate active-name duplication and active-only operational consultation.

### Tests for User Story 2

- [X] T028 [P] [US2] Add `tipos_ocorrencia` validation cases for required `nome`, normalization and duplicate active `nome_normalizado` in `supabase/tests/cadastros_base_validacoes.sql`
- [X] T029 [P] [US2] Add `tipos_ocorrencia` RLS cases for Direcao/Admin management and Operador/Supervisao read-only active access in `supabase/tests/cadastros_base_rls.sql`
- [X] T030 [P] [US2] Add `tipos_ocorrencia` audit assertions for `criado`, `atualizado`, `ativado`, `inativado` and `excluido_logicamente` in `supabase/tests/cadastros_base_auditoria.sql`

### Implementation for User Story 2

- [X] T031 [US2] Create `public.tipos_ocorrencia` table with Portuguese `snake_case` fields, PK `id`, optional `descricao`, control fields and soft-delete fields in `supabase/migrations/202606200002_cadastros_base_mvp.sql`
- [X] T032 [US2] Add check constraints for `tipos_ocorrencia.nome` and soft-delete required fields in `supabase/migrations/202606200002_cadastros_base_mvp.sql`
- [X] T033 [US2] Add trigger to maintain `tipos_ocorrencia.nome_normalizado` and `updated_at` in `supabase/migrations/202606200002_cadastros_base_mvp.sql`
- [X] T034 [US2] Add unique partial index for active `tipos_ocorrencia.nome_normalizado` in `supabase/migrations/202606200002_cadastros_base_mvp.sql`
- [X] T035 [US2] Add FK and query-support indexes for `tipos_ocorrencia.created_by`, `tipos_ocorrencia.updated_by`, `tipos_ocorrencia.deleted_by`, `ativo` and `deleted_at` in `supabase/migrations/202606200002_cadastros_base_mvp.sql`
- [X] T036 [US2] Enable RLS and create select/insert/update policies for `tipos_ocorrencia` according to `contracts/rls-access-contract.md` in `supabase/migrations/202606200002_cadastros_base_mvp.sql`
- [X] T037 [US2] Attach audit trigger to `public.tipos_ocorrencia` in `supabase/migrations/202606200002_cadastros_base_mvp.sql`
- [X] T038 [US2] Add occurrence type seed data covering active, inactive and soft-deleted examples in `supabase/seed/cadastros_base_mvp.sql`
- [X] T039 [US2] Document `tipos_ocorrencia` policies, validations and audit behavior in `supabase/policies/cadastros_base_mvp.md`

**Checkpoint**: US2 is complete when its validation, RLS and audit tests prove occurrence types work independently.

---

## Phase 5: User Story 3 - Manter metas de eficiencia por posto (Priority: P1)

**Goal**: Direcao/Admin manages all efficiency goals; Supervisao manages only goals for scoped postos; Operador only consults active goals for scoped postos.

**Independent Test**: Create goals for active postos, reject invalid percentages and overlapping validity, and prove visibility/management respects posto scope.

### Tests for User Story 3

- [X] T040 [P] [US3] Add `metas_eficiencia` validation cases for existing active `posto_id`, required `tipo_atividade_normalizado`, `meta_percentual`, validity dates and overlapping intervals in `supabase/tests/cadastros_base_validacoes.sql`
- [X] T041 [P] [US3] Add `metas_eficiencia` RLS cases for Operador scoped select, Supervisao scoped management and Direcao/Admin global management in `supabase/tests/cadastros_base_rls.sql`
- [X] T042 [P] [US3] Add `metas_eficiencia` audit assertions for `criado`, `atualizado`, `ativado`, `inativado` and `excluido_logicamente` in `supabase/tests/cadastros_base_auditoria.sql`

### Implementation for User Story 3

- [X] T043 [US3] Create `public.metas_eficiencia` table with `posto_id`, `tipo_atividade_normalizado`, `meta_percentual`, `vigencia_inicio`, `vigencia_fim`, control fields and soft-delete fields in `supabase/migrations/202606200002_cadastros_base_mvp.sql`
- [X] T044 [US3] Add FK from `metas_eficiencia.posto_id` to `postos.id` and FKs for control fields to `usuarios.id` in `supabase/migrations/202606200002_cadastros_base_mvp.sql`
- [X] T045 [US3] Add check constraints for `tipo_atividade_normalizado`, `meta_percentual`, `vigencia_inicio`, `vigencia_fim` and soft-delete required fields in `supabase/migrations/202606200002_cadastros_base_mvp.sql`
- [X] T046 [US3] Add trigger to maintain normalized activity text, reject inactive or soft-deleted postos on create/reactivate and update `updated_at` in `supabase/migrations/202606200002_cadastros_base_mvp.sql`
- [X] T047 [US3] Add exclusion constraint or equivalent concurrency-safe constraint preventing overlapping active validity for the same `posto_id` and `tipo_atividade_normalizado` in `supabase/migrations/202606200002_cadastros_base_mvp.sql`
- [X] T048 [US3] Add FK and query-support indexes for `metas_eficiencia.posto_id`, control FKs, active scoped queries and validity lookups in `supabase/migrations/202606200002_cadastros_base_mvp.sql`
- [X] T049 [US3] Enable RLS and create scoped select/insert/update policies for `metas_eficiencia` according to `contracts/rls-access-contract.md` in `supabase/migrations/202606200002_cadastros_base_mvp.sql`
- [X] T050 [US3] Attach audit trigger to `public.metas_eficiencia` in `supabase/migrations/202606200002_cadastros_base_mvp.sql`
- [X] T051 [US3] Add efficiency goal seed data for linked, unlinked, inactive and soft-deleted posto scenarios in `supabase/seed/cadastros_base_mvp.sql`
- [X] T052 [US3] Document `metas_eficiencia` policies, validations, indexes and audit behavior in `supabase/policies/cadastros_base_mvp.md`

**Checkpoint**: US3 is complete when scoped RLS, validation and audit tests prove efficiency goals work independently.

---

## Phase 6: User Story 4 - Consultar cadastros base conforme perfil operacional (Priority: P2)

**Goal**: Prove cross-cadastro consultation behavior for active profiles, scoped postos and users without active operational profile.

**Independent Test**: Use the three operational profiles plus a user without active profile, linked and unlinked postos, and active/inactive/soft-deleted records.

### Tests for User Story 4

- [X] T053 [P] [US4] Add cross-table RLS test for user without active operational profile across `prioridades`, `tipos_ocorrencia` and `metas_eficiencia` in `supabase/tests/cadastros_base_rls.sql`
- [X] T054 [P] [US4] Add cross-table operational consultation test proving inactive and soft-deleted records are hidden from Operador and Supervisao in `supabase/tests/cadastros_base_rls.sql`
- [X] T055 [P] [US4] Add Direcao/Admin administrative review test for inactive and soft-deleted records across all cadastros in `supabase/tests/cadastros_base_rls.sql`

### Implementation for User Story 4

- [X] T056 [US4] Refine RLS policies across all three tables to ensure users without active operational profile cannot access any cadastro in `supabase/migrations/202606200002_cadastros_base_mvp.sql`
- [X] T057 [US4] Refine RLS policies across all three tables so Direcao/Admin can inspect inactive and soft-deleted records for administrative review in `supabase/migrations/202606200002_cadastros_base_mvp.sql`
- [X] T058 [US4] Add consolidated access matrix notes for all profiles and cadastros in `supabase/policies/cadastros_base_mvp.md`

**Checkpoint**: US4 is complete when one RLS test run proves the full permission matrix across all cadastros.

---

## Phase 7: User Story 5 - Auditar acoes criticas dos cadastros base (Priority: P2)

**Goal**: Prove centralized audit coverage for all critical actions and absence of misleading success events for blocked operations.

**Independent Test**: Execute create, update, activate, inactivate and logical delete on each cadastro and verify `historico_auditoria` rows.

### Tests for User Story 5

- [X] T059 [P] [US5] Add consolidated audit count and payload assertions for all three cadastros in `supabase/tests/cadastros_base_auditoria.sql`
- [X] T060 [P] [US5] Add blocked-operation audit assertions for Operador and out-of-scope Supervisao attempts in `supabase/tests/cadastros_base_auditoria.sql`

### Implementation for User Story 5

- [X] T061 [US5] Refine cadastro audit trigger function to populate entity type, entity id, action, actor, previous values and new values consistently in `supabase/migrations/202606200002_cadastros_base_mvp.sql`
- [X] T062 [US5] Ensure ordinary authenticated roles cannot physically delete rows from `prioridades`, `tipos_ocorrencia` or `metas_eficiencia` in `supabase/migrations/202606200002_cadastros_base_mvp.sql`
- [X] T063 [US5] Document audit event contract and physical-delete restrictions in `supabase/policies/cadastros_base_mvp.md`

**Checkpoint**: US5 is complete when audit tests cover all required actions for all three cadastros.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Validate the feature as a whole and update operational documentation.

- [X] T064 [P] Update `supabase/migrations/README.md` with the Cadastros Base MVP migration order and purpose
- [X] T065 [P] Update `supabase/seed/README.md` with the Cadastros Base MVP seed usage
- [X] T066 [P] Update `supabase/policies/README.md` to reference `supabase/policies/cadastros_base_mvp.md`
- [X] T067 Run `supabase db reset` locally and record the result in `specs/002-cadastros-base-mvp/quickstart.md`
- [X] T068 Run `supabase db query --local --file supabase/seed/cadastros_base_mvp.sql` and record the result in `specs/002-cadastros-base-mvp/quickstart.md`
- [X] T069 Run `supabase db query --local --file supabase/tests/cadastros_base_validacoes.sql` and record the result in `specs/002-cadastros-base-mvp/quickstart.md`
- [X] T070 Run `supabase db query --local --file supabase/tests/cadastros_base_rls.sql` and record the result in `specs/002-cadastros-base-mvp/quickstart.md`
- [X] T071 Run `supabase db query --local --file supabase/tests/cadastros_base_auditoria.sql` and record the result in `specs/002-cadastros-base-mvp/quickstart.md`
- [X] T072 If local Docker/psql is unavailable, validate the migration and tests against the Supabase project Doka via MCP and record the result in `specs/002-cadastros-base-mvp/quickstart.md`
- [X] T073 Run Supabase security and performance advisors for project Doka and document any residual alerts in `specs/002-cadastros-base-mvp/quickstart.md`
- [X] T074 Validate Doka constitution gates for no MMS scope, no out-of-MVP modules, Supabase/RLS, Portuguese `snake_case`, soft delete and `historico_auditoria` in `specs/002-cadastros-base-mvp/tasks.md`
- [X] T075 Confirm no final frontend screens, importacao MMS, assistencias, ocorrencias reais, tarefas, rotinas, custos_extras or dashboard files were introduced outside the approved scope in `specs/002-cadastros-base-mvp/tasks.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all user stories.
- **User Stories (Phases 3-7)**: Depend on Foundational completion.
- **Polish (Phase 8)**: Depends on all selected user stories.

### User Story Dependencies

- **US1 (P1)**: Can start after Foundational; no dependency on other stories.
- **US2 (P1)**: Can start after Foundational; no dependency on other stories.
- **US3 (P1)**: Can start after Foundational; depends only on existing Spec 01 `postos` and shared helpers.
- **US4 (P2)**: Depends on US1, US2 and US3 because it validates the complete cross-table permission matrix.
- **US5 (P2)**: Depends on US1, US2 and US3 because it validates audit coverage for all cadastros.

### Within Each User Story

- Test tasks precede implementation tasks.
- Table definitions precede constraints, indexes, policies and triggers.
- Policies depend on tables and helper functions.
- Audit trigger attachment depends on table creation and shared audit function.
- Seed data depends on table creation and constraints.

## Parallel Opportunities

- T002-T006 can run in parallel after T001.
- T014 and T015 can run in parallel with helper implementation review after T007.
- US1 test tasks T016-T018 can run in parallel.
- US2 test tasks T028-T030 can run in parallel.
- US3 test tasks T040-T042 can run in parallel.
- US4 test tasks T053-T055 can run in parallel.
- US5 test tasks T059-T060 can run in parallel.
- Documentation polish tasks T064-T066 can run in parallel.

## Parallel Example: User Story 1

```text
Task: "T016 Add priority validation cases in supabase/tests/cadastros_base_validacoes.sql"
Task: "T017 Add priority RLS cases in supabase/tests/cadastros_base_rls.sql"
Task: "T018 Add priority audit assertions in supabase/tests/cadastros_base_auditoria.sql"
```

## Parallel Example: User Story 3

```text
Task: "T040 Add metas_eficiencia validation cases in supabase/tests/cadastros_base_validacoes.sql"
Task: "T041 Add metas_eficiencia RLS cases in supabase/tests/cadastros_base_rls.sql"
Task: "T042 Add metas_eficiencia audit assertions in supabase/tests/cadastros_base_auditoria.sql"
```

## Implementation Strategy

### MVP First

1. Complete Phase 1 and Phase 2.
2. Complete US1, US2 and US3 because all three are P1 cadastros base required by the feature.
3. Validate each P1 story independently before moving to cross-table P2 checks.

### Incremental Delivery

1. Foundation ready: helpers, grants and audit primitives.
2. Add `prioridades` and validate independently.
3. Add `tipos_ocorrencia` and validate independently.
4. Add `metas_eficiencia` and validate independently.
5. Add cross-table RLS and audit validation.

### Final Validation

1. Run local Supabase validation when available.
2. Use MCP Supabase project Doka when local validation is unavailable.
3. Run advisors and document any residual warnings.
4. Confirm no out-of-scope modules were added.

## Task Count Summary

- Total tasks: 75
- Setup: 6
- Foundational: 9
- US1: 12
- US2: 12
- US3: 13
- US4: 6
- US5: 5
- Polish: 12

## Implementation Notes

- Todas as tasks foram executadas em 2026-06-20.
- A Supabase CLI nao esta instalada no PATH desta maquina; por isso os comandos
  locais `supabase db reset` e `supabase db query --local --file ...` foram
  registrados como indisponiveis em `quickstart.md`.
- A validacao equivalente foi executada no projeto Supabase remoto Doka via MCP.
- Migrations remotas aplicadas para esta spec: `cadastros_base_mvp`,
  `ajustar_validacao_metas_eficiencia`,
  `liberar_funcao_soft_delete_cadastros` e
  `refinar_cadastros_base_advisors`.
- Seeds, validacoes de constraints, RLS, auditoria e checagem curta
  pos-hardening passaram no remoto.
- Nenhum arquivo de frontend, importacao MMS, assistencias, ocorrencias reais,
  tarefas, rotinas, custos extras ou dashboard foi criado por esta spec.
