# Tasks: Importacao MMS - Lotes, Staging e Validacao Bruta

**Input**: Design documents from `specs/003-importacao-mms-staging/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**: Required by the spec success criteria. SQL validation tasks must be created before implementation tasks for the behavior they verify.

**Organization**: Tasks are grouped by user story to keep each story independently implementable and testable.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it touches different files or does not depend on incomplete tasks.
- **[Story]**: User story label from `spec.md`.
- Every task includes the target file path.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare the database-first feature files defined in the implementation plan.

- [ ] T001 Create Supabase migration with `supabase migration new importacao_mms_staging` for `supabase/migrations/*_importacao_mms_staging.sql`
- [ ] T002 [P] Create seed file `supabase/seed/importacao_mms_staging.sql`
- [ ] T003 [P] Create RLS validation file `supabase/tests/importacao_mms_rls.sql`
- [ ] T004 [P] Create validation constraints file `supabase/tests/importacao_mms_validacoes.sql`
- [ ] T005 [P] Create audit validation file `supabase/tests/importacao_mms_auditoria.sql`
- [ ] T006 [P] Create raw_json and totals validation file `supabase/tests/importacao_mms_raw_json_totais.sql`
- [ ] T007 [P] Create policies documentation file `supabase/policies/importacao_mms_staging.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build shared database primitives required by all MMS import stories.

**CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T008 Inspect Spec 01 helper functions, RLS patterns and audit table behavior in `supabase/migrations/*_fundacao_operacional.sql`
- [ ] T009 Inspect Spec 02 database-first conventions, soft-delete helpers and policy style in `supabase/migrations/*_cadastros_base_mvp.sql`
- [ ] T010 Define official status domain or check constraint for `importado`, `importado_com_alertas`, `erro` and `cancelado` in `supabase/migrations/*_importacao_mms_staging.sql`
- [ ] T011 Define shared technical validation state values for staging lines in `supabase/migrations/*_importacao_mms_staging.sql`
- [ ] T012 Add shared helper or trigger pattern for soft delete requiring `deleted_at`, `deleted_by` and `delete_reason` in `supabase/migrations/*_importacao_mms_staging.sql`
- [ ] T013 Add shared helper or trigger pattern to block operational updates to `mms_linhas_importacao.raw_json` in `supabase/migrations/*_importacao_mms_staging.sql`
- [ ] T014 Add shared helper or function to recalculate MMS import totals by lote in `supabase/migrations/*_importacao_mms_staging.sql`
- [ ] T015 Add shared audit function or trigger wiring for MMS import actions in `supabase/migrations/*_importacao_mms_staging.sql`
- [ ] T016 Define baseline grants revoking anonymous table access and limiting authenticated access to RLS-governed operations in `supabase/migrations/*_importacao_mms_staging.sql`
- [ ] T017 [P] Document shared status, helper, grant and audit decisions in `supabase/policies/importacao_mms_staging.md`
- [ ] T018 [P] Add seed prerequisites referencing existing Spec 01 users and postos in `supabase/seed/importacao_mms_staging.sql`

**Checkpoint**: Shared status, RLS, soft-delete, raw_json, totals and audit primitives are ready.

---

## Phase 3: User Story 1 - Registrar lote de importacao MMS (Priority: P1) MVP

**Goal**: Authorized users can register auditable MMS import batches for permitted postos with official status and totals.

**Independent Test**: Create batches for different postos and verify source, importer, official status, totals and posto scope without creating final assistencias.

### Tests for User Story 1

- [ ] T019 [P] [US1] Add batch creation validation tests for required `nome_origem`, active `posto_id`, importer and official status in `supabase/tests/importacao_mms_validacoes.sql`
- [ ] T020 [P] [US1] Add batch RLS tests for authorized posto creation and blocked out-of-scope creation in `supabase/tests/importacao_mms_rls.sql`
- [ ] T021 [P] [US1] Add batch audit assertions for `criado`, processing timestamps and status changes in `supabase/tests/importacao_mms_auditoria.sql`

### Implementation for User Story 1

- [ ] T022 [US1] Create `public.mms_lotes_importacao` table with `id`, `nome_origem`, `posto_id`, optional `data_atividade`, importer, official `status`, technical state, totals, control fields and soft-delete fields in `supabase/migrations/*_importacao_mms_staging.sql`
- [ ] T023 [US1] Add FKs from `mms_lotes_importacao.posto_id` to `postos.id` and user-control fields to `usuarios.id` in `supabase/migrations/*_importacao_mms_staging.sql`
- [ ] T024 [US1] Add constraints for required `nome_origem`, official status list, non-negative totals and soft-delete required fields in `supabase/migrations/*_importacao_mms_staging.sql`
- [ ] T025 [US1] Add trigger or validation to reject creation of lots for missing, inactive or soft-deleted postos in `supabase/migrations/*_importacao_mms_staging.sql`
- [ ] T026 [US1] Add indexes for `mms_lotes_importacao.posto_id`, `status`, `data_atividade`, `created_at`, `deleted_at` and control FKs in `supabase/migrations/*_importacao_mms_staging.sql`
- [ ] T027 [US1] Enable RLS and create select/insert/update policies for `mms_lotes_importacao` according to `contracts/rls-access-contract.md` in `supabase/migrations/*_importacao_mms_staging.sql`
- [ ] T028 [US1] Attach audit trigger to `public.mms_lotes_importacao` for creation, status changes, cancellation and soft delete in `supabase/migrations/*_importacao_mms_staging.sql`
- [ ] T029 [US1] Add seed batches covering valid import, alert import, error import and cancelled examples in `supabase/seed/importacao_mms_staging.sql`
- [ ] T030 [US1] Document `mms_lotes_importacao` policies, official statuses, validations and audit behavior in `supabase/policies/importacao_mms_staging.md`

**Checkpoint**: US1 is complete when batch tests prove auditable lote creation and scoped access independently.

---

## Phase 4: User Story 2 - Preservar linhas importadas com raw_json original (Priority: P1)

**Goal**: Every imported MMS row is preserved in staging with mandatory immutable `raw_json` and candidate fields.

**Independent Test**: Insert valid, incomplete and unexpected lines and verify each remains linked to the lote with preserved raw evidence.

### Tests for User Story 2

- [ ] T031 [P] [US2] Add line validation tests for required `raw_json`, positive `numero_linha_origem` and lote linkage in `supabase/tests/importacao_mms_validacoes.sql`
- [ ] T032 [P] [US2] Add raw_json immutability tests for blocked updates after creation in `supabase/tests/importacao_mms_raw_json_totais.sql`
- [ ] T033 [P] [US2] Add line RLS tests proving lines inherit access from parent lote in `supabase/tests/importacao_mms_rls.sql`
- [ ] T034 [P] [US2] Add line audit assertions for creation and blocked raw_json update attempts in `supabase/tests/importacao_mms_auditoria.sql`

### Implementation for User Story 2

- [ ] T035 [US2] Create `public.mms_linhas_importacao` table with lote FK, source row number, mandatory `raw_json`, candidate fields, technical validation state, control fields and soft-delete fields in `supabase/migrations/*_importacao_mms_staging.sql`
- [ ] T036 [US2] Add FKs from `mms_linhas_importacao.lote_importacao_id` to `mms_lotes_importacao.id`, `posto_id` to `postos.id` and control fields to `usuarios.id` in `supabase/migrations/*_importacao_mms_staging.sql`
- [ ] T037 [US2] Add constraints for non-null `raw_json`, positive `numero_linha_origem`, allowed technical validation state and soft-delete required fields in `supabase/migrations/*_importacao_mms_staging.sql`
- [ ] T038 [US2] Add trigger to prevent operational updates to `mms_linhas_importacao.raw_json` after creation in `supabase/migrations/*_importacao_mms_staging.sql`
- [ ] T039 [US2] Add indexes for `mms_linhas_importacao.lote_importacao_id`, `numero_linha_origem`, `estado_validacao`, candidate fields, `deleted_at` and control FKs in `supabase/migrations/*_importacao_mms_staging.sql`
- [ ] T040 [US2] Enable RLS and create inherited lote-scope policies for `mms_linhas_importacao` according to `contracts/rls-access-contract.md` in `supabase/migrations/*_importacao_mms_staging.sql`
- [ ] T041 [US2] Attach audit trigger or batch-level audit summary for line creation, validation state changes and soft delete in `supabase/migrations/*_importacao_mms_staging.sql`
- [ ] T042 [US2] Add seed lines with complete candidates, missing candidates, extra MMS fields and malformed candidate examples in `supabase/seed/importacao_mms_staging.sql`
- [ ] T043 [US2] Document `mms_linhas_importacao`, `raw_json` immutability and candidate field behavior in `supabase/policies/importacao_mms_staging.md`

**Checkpoint**: US2 is complete when raw_json preservation, immutability and inherited access pass independently.

---

## Phase 5: User Story 3 - Executar validacao bruta minima da MMS (Priority: P1)

**Goal**: Gross validation records blocking errors and non-blocking alerts, persists candidate fields and keeps batch totals/status consistent.

**Independent Test**: Process rows with present, missing, invalid and suspicious fields; verify line state, errors, alerts and totals.

### Tests for User Story 3

- [ ] T044 [P] [US3] Add candidate field validation tests for `posto_id`, `data_atividade`, `numero_assistencia` and `parte_conjunto` in `supabase/tests/importacao_mms_validacoes.sql`
- [ ] T045 [P] [US3] Add error and alert validation tests for required `codigo`, `mensagem`, same-lote line linkage and soft delete fields in `supabase/tests/importacao_mms_validacoes.sql`
- [ ] T046 [P] [US3] Add status and totals tests for `erro`, `importado_com_alertas` and `importado` outcomes in `supabase/tests/importacao_mms_raw_json_totais.sql`
- [ ] T047 [P] [US3] Add validation audit assertions for `validacao_concluida`, `erro_registrado` and `alerta_registrado` in `supabase/tests/importacao_mms_auditoria.sql`

### Implementation for User Story 3

- [ ] T048 [US3] Create `public.mms_erros_importacao` table with lote FK, optional line FK, `campo`, `codigo`, `mensagem`, `contexto`, control fields and soft-delete fields in `supabase/migrations/*_importacao_mms_staging.sql`
- [ ] T049 [US3] Create `public.mms_alertas_importacao` table with lote FK, optional line FK, `campo`, `codigo`, `mensagem`, `contexto`, control fields and soft-delete fields in `supabase/migrations/*_importacao_mms_staging.sql`
- [ ] T050 [US3] Add constraints ensuring error and alert `codigo` and `mensagem` are not blank and soft-delete fields are complete in `supabase/migrations/*_importacao_mms_staging.sql`
- [ ] T051 [US3] Add trigger or constraint ensuring `linha_importacao_id` in errors and alerts belongs to the same `lote_importacao_id` in `supabase/migrations/*_importacao_mms_staging.sql`
- [ ] T052 [US3] Add validation helper or documented SQL function to persist/validate candidate fields without applying final MMS upsert in `supabase/migrations/*_importacao_mms_staging.sql`
- [ ] T053 [US3] Add totals recalculation trigger/function covering active lines, active errors, active alerts and ignored lines in `supabase/migrations/*_importacao_mms_staging.sql`
- [ ] T054 [US3] Add status mapping logic from validation results to `importado`, `importado_com_alertas` or `erro` without adding non-official status values in `supabase/migrations/*_importacao_mms_staging.sql`
- [ ] T055 [US3] Add indexes for error and alert lote, line, `codigo`, `campo`, `deleted_at` and control FKs in `supabase/migrations/*_importacao_mms_staging.sql`
- [ ] T056 [US3] Enable RLS and create inherited lote-scope policies for `mms_erros_importacao` and `mms_alertas_importacao` in `supabase/migrations/*_importacao_mms_staging.sql`
- [ ] T057 [US3] Attach audit trigger or batch-level audit summary for errors, alerts and validation completion in `supabase/migrations/*_importacao_mms_staging.sql`
- [ ] T058 [US3] Add seed errors and alerts for missing candidates, invalid dates, duplicate-looking lines and optional suspicious fields in `supabase/seed/importacao_mms_staging.sql`
- [ ] T059 [US3] Document validation rules, candidate fields, totals mapping and out-of-scope final key behavior in `supabase/policies/importacao_mms_staging.md`

**Checkpoint**: US3 is complete when validation, errors, alerts, totals and official status mapping pass independently.

---

## Phase 6: User Story 4 - Consultar importacoes conforme perfil e posto (Priority: P2)

**Goal**: Operador, Supervisao and Direcao/Admin consult import data according to active profile and posto scope.

**Independent Test**: Create lots for multiple postos and users for all profiles; confirm each profile sees exactly the permitted data.

### Tests for User Story 4

- [ ] T060 [P] [US4] Add cross-table RLS tests for user without active operational profile across all four MMS tables in `supabase/tests/importacao_mms_rls.sql`
- [ ] T061 [P] [US4] Add Operador scoped select tests for lots, lines, errors and alerts in `supabase/tests/importacao_mms_rls.sql`
- [ ] T062 [P] [US4] Add Supervisao scoped management tests for lots, validation data, errors and alerts in `supabase/tests/importacao_mms_rls.sql`
- [ ] T063 [P] [US4] Add Direcao/Admin global access tests and soft-deleted administrative review cases in `supabase/tests/importacao_mms_rls.sql`

### Implementation for User Story 4

- [ ] T064 [US4] Refine all MMS RLS policies to block users without active operational profile in `supabase/migrations/*_importacao_mms_staging.sql`
- [ ] T065 [US4] Refine all child-table policies to inherit scope from `mms_lotes_importacao.posto_id` in `supabase/migrations/*_importacao_mms_staging.sql`
- [ ] T066 [US4] Refine update policies to prevent moving lots or child records outside Supervisao posto scope in `supabase/migrations/*_importacao_mms_staging.sql`
- [ ] T067 [US4] Add administrative review behavior for Direcao/Admin to inspect soft-deleted MMS rows in `supabase/migrations/*_importacao_mms_staging.sql`
- [ ] T068 [US4] Document final MMS access matrix for all four tables in `supabase/policies/importacao_mms_staging.md`

**Checkpoint**: US4 is complete when one RLS test run proves the full permission matrix.

---

## Phase 7: User Story 5 - Auditar tentativas e acoes criticas de importacao (Priority: P2)

**Goal**: Critical import actions are traceable in `historico_auditoria` and blocked operations do not create misleading success events.

**Independent Test**: Execute creation, processing, status change, error/warning registration, cancellation and soft delete and verify audit events.

### Tests for User Story 5

- [ ] T069 [P] [US5] Add consolidated audit assertions for batch creation, processing, validation completion, status change and cancellation in `supabase/tests/importacao_mms_auditoria.sql`
- [ ] T070 [P] [US5] Add consolidated audit assertions for line creation, validation state changes, error registration and alert registration in `supabase/tests/importacao_mms_auditoria.sql`
- [ ] T071 [P] [US5] Add blocked-operation audit assertions for RLS denial and raw_json mutation attempts in `supabase/tests/importacao_mms_auditoria.sql`

### Implementation for User Story 5

- [ ] T072 [US5] Refine MMS audit trigger/function to populate entity type, entity id, action, actor, previous values, new values and context in `supabase/migrations/*_importacao_mms_staging.sql`
- [ ] T073 [US5] Ensure batch audit context includes `lote_importacao_id`, `posto_id`, `nome_origem` and official status in `supabase/migrations/*_importacao_mms_staging.sql`
- [ ] T074 [US5] Ensure line/error/alert audit context includes parent lote and line identifiers when applicable in `supabase/migrations/*_importacao_mms_staging.sql`
- [ ] T075 [US5] Ensure ordinary authenticated roles cannot physically delete rows from any MMS import table in `supabase/migrations/*_importacao_mms_staging.sql`
- [ ] T076 [US5] Document audit events and physical-delete restrictions in `supabase/policies/importacao_mms_staging.md`

**Checkpoint**: US5 is complete when audit tests cover required actions and blocked-operation behavior.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Validate the feature as a whole and update operational documentation.

- [ ] T077 [P] Update `supabase/migrations/README.md` with the Importacao MMS Staging migration order and purpose
- [ ] T078 [P] Update `supabase/seed/README.md` with `supabase/seed/importacao_mms_staging.sql` usage
- [ ] T079 [P] Update `supabase/policies/README.md` to reference `supabase/policies/importacao_mms_staging.md`
- [ ] T080 Run `supabase db reset` locally and record the result in `specs/003-importacao-mms-staging/quickstart.md`
- [ ] T081 Run `supabase db query --local --file supabase/seed/importacao_mms_staging.sql` and record the result in `specs/003-importacao-mms-staging/quickstart.md`
- [ ] T082 Run `supabase db query --local --file supabase/tests/importacao_mms_validacoes.sql` and record the result in `specs/003-importacao-mms-staging/quickstart.md`
- [ ] T083 Run `supabase db query --local --file supabase/tests/importacao_mms_raw_json_totais.sql` and record the result in `specs/003-importacao-mms-staging/quickstart.md`
- [ ] T084 Run `supabase db query --local --file supabase/tests/importacao_mms_rls.sql` and record the result in `specs/003-importacao-mms-staging/quickstart.md`
- [ ] T085 Run `supabase db query --local --file supabase/tests/importacao_mms_auditoria.sql` and record the result in `specs/003-importacao-mms-staging/quickstart.md`
- [ ] T086 If local Docker/psql is unavailable, validate the migration and tests against the Supabase project Doka via MCP and record the result in `specs/003-importacao-mms-staging/quickstart.md`
- [ ] T087 Run Supabase security and performance advisors for project Doka and document residual alerts in `specs/003-importacao-mms-staging/quickstart.md`
- [ ] T088 Validate Doka constitution gates for staging-only scope, RLS/profile/posto, soft delete, `historico_auditoria`, `raw_json` and candidate MMS key fields in `specs/003-importacao-mms-staging/tasks.md`
- [ ] T089 Confirm no final assistencias, final MMS upsert/idempotency, `removido` marking, ocorrencias, tarefas, custos extras, dashboard, final screens, complete parser or automatic MMS integration were introduced in `specs/003-importacao-mms-staging/tasks.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all user stories.
- **User Stories (Phases 3-7)**: Depend on Foundational completion.
- **Polish (Phase 8)**: Depends on all selected user stories.

### User Story Dependencies

- **US1 (P1)**: Can start after Foundational; no dependency on other stories.
- **US2 (P1)**: Depends on US1 lote table because lines require a parent lote.
- **US3 (P1)**: Depends on US1 and US2 because validation writes errors/alerts for lots and lines.
- **US4 (P2)**: Depends on US1, US2 and US3 because it validates the complete permission matrix.
- **US5 (P2)**: Depends on US1, US2 and US3 because it validates audit coverage for all MMS entities.

### Within Each User Story

- Test tasks precede implementation tasks.
- Table definitions precede constraints, indexes, policies and triggers.
- Policies depend on tables and helper functions.
- Audit trigger attachment depends on table creation and shared audit function.
- Seed data depends on table creation and constraints.

## Parallel Opportunities

- T002-T007 can run in parallel after T001.
- T017 and T018 can run in parallel with foundational helper implementation after T008-T016 are drafted.
- US1 test tasks T019-T021 can run in parallel.
- US2 test tasks T031-T034 can run in parallel.
- US3 test tasks T044-T047 can run in parallel.
- US4 test tasks T060-T063 can run in parallel.
- US5 test tasks T069-T071 can run in parallel.
- Documentation polish tasks T077-T079 can run in parallel.

## Parallel Example: User Story 2

```text
Task: "T031 Add line validation tests in supabase/tests/importacao_mms_validacoes.sql"
Task: "T032 Add raw_json immutability tests in supabase/tests/importacao_mms_raw_json_totais.sql"
Task: "T033 Add line RLS tests in supabase/tests/importacao_mms_rls.sql"
Task: "T034 Add line audit assertions in supabase/tests/importacao_mms_auditoria.sql"
```

## Parallel Example: User Story 3

```text
Task: "T044 Add candidate field validation tests in supabase/tests/importacao_mms_validacoes.sql"
Task: "T045 Add error and alert validation tests in supabase/tests/importacao_mms_validacoes.sql"
Task: "T046 Add status and totals tests in supabase/tests/importacao_mms_raw_json_totais.sql"
Task: "T047 Add validation audit assertions in supabase/tests/importacao_mms_auditoria.sql"
```

## Implementation Strategy

### MVP First

1. Complete Phase 1 and Phase 2.
2. Complete US1 for auditable lots.
3. Complete US2 for raw staging lines.
4. Complete US3 for gross validation, errors, alerts and totals.
5. Stop and validate that no final assistance behavior was introduced.

### Incremental Delivery

1. Foundation ready: status, soft delete, raw_json protection, totals and audit primitives.
2. Add `mms_lotes_importacao` and validate independently.
3. Add `mms_linhas_importacao` and validate raw evidence independently.
4. Add `mms_erros_importacao` and `mms_alertas_importacao` with gross validation and totals.
5. Add full RLS matrix and audit coverage.

### Final Validation

1. Run local Supabase validation when available.
2. Use MCP Supabase project Doka when local validation is unavailable.
3. Run advisors and document any residual warnings.
4. Confirm no out-of-scope modules were added.

## Task Count Summary

- Total tasks: 89
- Setup: 7
- Foundational: 11
- US1: 12
- US2: 13
- US3: 16
- US4: 9
- US5: 8
- Polish: 13
