# Tasks: Assistencias MMS - Espelho Operacional Idempotente

**Input**: Design documents from `specs/004-assistencias-mms-espelho/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**: Required by the feature specification. SQL tests must be written before implementation work for the related story and must cover idempotence, duplicate prevention, RLS, audit history, raw evidence, `removido` and reactivation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare feature files and shared documentation placeholders.

- [X] T001 Create empty migration file for the feature in `supabase/migrations/202606260001_assistencias_mms_espelho.sql`
- [X] T002 Create seed placeholder for assistance mirror validation data in `supabase/seed/assistencias_mms_espelho.sql`
- [X] T003 Create policies documentation placeholder in `supabase/policies/assistencias_mms_espelho.md`
- [X] T004 [P] Create idempotence SQL test file scaffold in `supabase/tests/assistencias_mms_idempotencia.sql`
- [X] T005 [P] Create RLS SQL test file scaffold in `supabase/tests/assistencias_mms_rls.sql`
- [X] T006 [P] Create audit SQL test file scaffold in `supabase/tests/assistencias_mms_auditoria.sql`
- [X] T007 [P] Create removed/raw-json SQL test file scaffold in `supabase/tests/assistencias_mms_removido_raw_json.sql`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared schema, helper functions and baseline contracts that must exist before any user story can be implemented.

**CRITICAL**: No user story work can begin until this phase is complete.

- [X] T008 Define `status_interno_mms` validation domain or check pattern for `ativo` and `removido` in `supabase/migrations/202606260001_assistencias_mms_espelho.sql`
- [X] T009 Define MMS normalization helper for `numero_assistencia` and `parte_conjunto` in `supabase/migrations/202606260001_assistencias_mms_espelho.sql`
- [X] T010 Define derived lot completeness helper using Spec 03 `estado_processamento = validado`, eligible status, resolved posto/data, active line total, consistent totals and no active blocking errors in `supabase/migrations/202606260001_assistencias_mms_espelho.sql`
- [X] T011 Define eligible line helper that accepts only Spec 03 `estado_validacao` values `valida` and `valida_com_alerta` with required candidate fields and no blocking errors in `supabase/migrations/202606260001_assistencias_mms_espelho.sql`
- [X] T012 Define shared visible-value helper or generated-field strategy for imported-vs-corrected precedence in `supabase/migrations/202606260001_assistencias_mms_espelho.sql`
- [X] T013 Define shared audit helper wrappers for assistance mirror events in `supabase/migrations/202606260001_assistencias_mms_espelho.sql`
- [X] T014 Define shared soft-delete validation helper for exceptional logical deletion in `supabase/migrations/202606260001_assistencias_mms_espelho.sql`
- [X] T015 Document shared eligibility, normalization and soft-delete assumptions in `supabase/policies/assistencias_mms_espelho.md`

**Checkpoint**: Foundation ready - user story implementation can now begin in priority order or in parallel where marked.

---

## Phase 3: User Story 1 - Montar espelho MMS em assistencia principal e partes (Priority: P1) MVP

**Goal**: Transform eligible MMS staging lines into one principal assistance per `posto_id + data_atividade + numero_assistencia` and one part per complete MMS operational key.

**Independent Test**: Process eligible lines with the same assistance number and different parts, then verify one `mms_assistencias` record and multiple `mms_partes_assistencia` records.

### Tests for User Story 1

- [X] T016 [P] [US1] Add SQL test for grouping multiple parts under one principal assistance in `supabase/tests/assistencias_mms_idempotencia.sql`
- [X] T017 [P] [US1] Add SQL test for duplicate principal assistance rejection by `posto_id`, `data_atividade` and normalized assistance number in `supabase/tests/assistencias_mms_idempotencia.sql`
- [X] T018 [P] [US1] Add SQL test for duplicate part rejection by full operational key in `supabase/tests/assistencias_mms_idempotencia.sql`
- [X] T019 [P] [US1] Add SQL test for required minimum fields on assistance and part records in `supabase/tests/assistencias_mms_removido_raw_json.sql`

### Implementation for User Story 1

- [X] T020 [US1] Create `mms_assistencias` table with principal identity, status, imported fields, correction fields, traceability fields, `raw_json_resumo` and control fields in `supabase/migrations/202606260001_assistencias_mms_espelho.sql`
- [X] T021 [US1] Create `mms_partes_assistencia` table with part identity, imported fields, correction fields, traceability fields, `raw_json` and control fields in `supabase/migrations/202606260001_assistencias_mms_espelho.sql`
- [X] T022 [US1] Add foreign keys from `mms_assistencias` to `postos`, `mms_lotes_importacao`, `mms_linhas_importacao` and `usuarios` in `supabase/migrations/202606260001_assistencias_mms_espelho.sql`
- [X] T023 [US1] Add foreign keys from `mms_partes_assistencia` to `mms_assistencias`, `mms_lotes_importacao`, `mms_linhas_importacao` and `usuarios` in `supabase/migrations/202606260001_assistencias_mms_espelho.sql`
- [X] T024 [US1] Add unique partial index for non-deleted principal assistance identity in `supabase/migrations/202606260001_assistencias_mms_espelho.sql`
- [X] T025 [US1] Add unique partial index for non-deleted part identity under an assistance in `supabase/migrations/202606260001_assistencias_mms_espelho.sql`
- [X] T026 [US1] Add operational indexes for assistance lookup by posto, date, number, status and type in `supabase/migrations/202606260001_assistencias_mms_espelho.sql`
- [X] T027 [US1] Add operational indexes for part lookup by assistance, part, status, type and latest lot/line in `supabase/migrations/202606260001_assistencias_mms_espelho.sql`
- [X] T028 [US1] Implement function to upsert one principal `mms_assistencias` record from an eligible staging line in `supabase/migrations/202606260001_assistencias_mms_espelho.sql`
- [X] T029 [US1] Implement function to upsert one `mms_partes_assistencia` record from an eligible staging line in `supabase/migrations/202606260001_assistencias_mms_espelho.sql`
- [X] T030 [US1] Implement batch processing function that iterates eligible lines and calls assistance/part upsert functions in `supabase/migrations/202606260001_assistencias_mms_espelho.sql`
- [X] T031 [US1] Seed minimal eligible lot and line examples for one assistance with multiple parts in `supabase/seed/assistencias_mms_espelho.sql`
- [X] T032 [US1] Document principal/part identity and lookup policy behavior in `supabase/policies/assistencias_mms_espelho.md`

**Checkpoint**: User Story 1 is independently testable with grouping and duplicate-prevention SQL tests.

---

## Phase 4: User Story 2 - Reimportar posto/data de forma idempotente (Priority: P1)

**Goal**: Reprocess eligible imports without duplicates, mark absent parts as `removido` only from eligible complete imports and reactivate records when they reappear.

**Independent Test**: Process an initial eligible import and then another eligible complete import with unchanged, changed, new and missing parts; also verify ineligible lots do not remove records.

### Tests for User Story 2

- [X] T033 [P] [US2] Add SQL test for reprocessing the same eligible input three times without duplicate assistances or parts in `supabase/tests/assistencias_mms_idempotencia.sql`
- [X] T034 [P] [US2] Add SQL test for update/create/remove behavior on a second eligible complete import in `supabase/tests/assistencias_mms_removido_raw_json.sql`
- [X] T035 [P] [US2] Add SQL test proving `erro` and `cancelado` lots do not update mirror records in `supabase/tests/assistencias_mms_removido_raw_json.sql`
- [X] T036 [P] [US2] Add SQL test proving incomplete or partial lots do not mark absent parts as `removido` in `supabase/tests/assistencias_mms_removido_raw_json.sql`
- [X] T037 [P] [US2] Add SQL test for reactivation of a removed part and principal assistance when the part reappears in `supabase/tests/assistencias_mms_removido_raw_json.sql`

### Implementation for User Story 2

- [X] T038 [US2] Extend batch processing function to compare previous mirror parts by posto/data against eligible complete import keys in `supabase/migrations/202606260001_assistencias_mms_espelho.sql`
- [X] T039 [US2] Implement part `status_interno = removido` marking with `removido_em` and `removido_lote_id` in `supabase/migrations/202606260001_assistencias_mms_espelho.sql`
- [X] T040 [US2] Implement principal assistance `status_interno = removido` when all parts are removed by eligible complete import in `supabase/migrations/202606260001_assistencias_mms_espelho.sql`
- [X] T041 [US2] Implement part reactivation when a previously removed complete operational key reappears in `supabase/migrations/202606260001_assistencias_mms_espelho.sql`
- [X] T042 [US2] Implement principal assistance reactivation when at least one active or reactivated part exists in `supabase/migrations/202606260001_assistencias_mms_espelho.sql`
- [X] T043 [US2] Block `removido` synchronization for lots with status `erro`, `cancelado`, incomplete markers, partial markers or blocking errors in `supabase/migrations/202606260001_assistencias_mms_espelho.sql`
- [X] T044 [US2] Update seed data with second eligible import, ineligible import and reappearance scenarios in `supabase/seed/assistencias_mms_espelho.sql`
- [X] T045 [US2] Document removed/reactivation eligibility rules in `supabase/policies/assistencias_mms_espelho.md`

**Checkpoint**: User Story 2 is independently testable with idempotence, removed, ineligible-lot and reactivation scenarios.

---

## Phase 5: User Story 3 - Corrigir dados importados sem perder evidencia MMS (Priority: P1)

**Goal**: Allow authorized corrections while preserving raw MMS evidence and maintaining visible-value precedence.

**Independent Test**: Correct an imported value, reimport a changed MMS value and verify raw evidence, imported value, corrected value and visible value remain distinguishable.

### Tests for User Story 3

- [X] T046 [P] [US3] Add SQL test proving part `raw_json` is preserved after correction and direct update attempts are blocked in `supabase/tests/assistencias_mms_removido_raw_json.sql`
- [X] T047 [P] [US3] Add SQL test proving assistance `raw_json_resumo` remains auditably populated after correction and direct update attempts are blocked in `supabase/tests/assistencias_mms_removido_raw_json.sql`
- [X] T048 [P] [US3] Add SQL test for visible-value precedence of corrected value over imported value in `supabase/tests/assistencias_mms_removido_raw_json.sql`
- [X] T049 [P] [US3] Add SQL test proving new import updates imported value without erasing active correction in `supabase/tests/assistencias_mms_removido_raw_json.sql`
- [X] T050 [P] [US3] Add SQL test for correction audit event with previous, imported and corrected values in `supabase/tests/assistencias_mms_auditoria.sql`
- [X] T051 [P] [US3] Add SQL test rejecting correction attempts for fields outside the v1 allowlist in `supabase/tests/assistencias_mms_removido_raw_json.sql`

### Implementation for User Story 3

- [X] T052 [US3] Add corrected-value columns and correction metadata only for v1 principal fields `cliente_nome` and `endereco` in `supabase/migrations/202606260001_assistencias_mms_espelho.sql`
- [X] T053 [US3] Add corrected-value columns and correction metadata only for v1 part fields `descricao_mercadoria` and `recurso` in `supabase/migrations/202606260001_assistencias_mms_espelho.sql`
- [X] T054 [US3] Implement correction function for `mms_assistencias` with allowed field identifier, corrected value, required reason and actor inferred from authenticated operational user in `supabase/migrations/202606260001_assistencias_mms_espelho.sql`
- [X] T055 [US3] Implement correction function for `mms_partes_assistencia` with allowed field identifier, corrected value, required reason and actor inferred from authenticated operational user in `supabase/migrations/202606260001_assistencias_mms_espelho.sql`
- [X] T056 [US3] Implement visible-value view with `WITH (security_invoker = true)` or RLS-preserving computed projection for `mms_assistencias` operational reads in `supabase/migrations/202606260001_assistencias_mms_espelho.sql`
- [X] T057 [US3] Implement visible-value view with `WITH (security_invoker = true)` or RLS-preserving computed projection for `mms_partes_assistencia` operational reads in `supabase/migrations/202606260001_assistencias_mms_espelho.sql`
- [X] T058 [US3] Protect `raw_json` and `raw_json_resumo` from direct updates outside approved import-processing routines in `supabase/migrations/202606260001_assistencias_mms_espelho.sql`
- [X] T059 [US3] Add seed scenario with imported value, corrected value and later changed import value in `supabase/seed/assistencias_mms_espelho.sql`
- [X] T060 [US3] Document correction allowlist, precedence, `security_invoker` requirement and raw evidence preservation in `supabase/policies/assistencias_mms_espelho.md`

**Checkpoint**: User Story 3 is independently testable with correction precedence and raw evidence preservation.

---

## Phase 6: User Story 4 - Consultar espelho por perfil e posto (Priority: P1)

**Goal**: Enforce access to assistances and parts by active operational profile and posto scope.

**Independent Test**: Create assistances and parts for multiple postos and validate access for no-profile, Operador, Supervisao and Direcao/Admin users.

### Tests for User Story 4

- [X] T061 [P] [US4] Add SQL test blocking users without active operational profile from `mms_assistencias` and `mms_partes_assistencia` in `supabase/tests/assistencias_mms_rls.sql`
- [X] T062 [P] [US4] Add SQL test ensuring Operador sees zero assistances or parts outside linked postos in `supabase/tests/assistencias_mms_rls.sql`
- [X] T063 [P] [US4] Add SQL test ensuring Supervisao sees zero assistances or parts outside its posto scope in `supabase/tests/assistencias_mms_rls.sql`
- [X] T064 [P] [US4] Add SQL test ensuring Direcao/Admin can inspect assistances and parts across all postos in `supabase/tests/assistencias_mms_rls.sql`
- [X] T065 [P] [US4] Add SQL test blocking correction attempts outside profile/posto scope in `supabase/tests/assistencias_mms_rls.sql`

### Implementation for User Story 4

- [X] T066 [US4] Enable RLS on `mms_assistencias` and `mms_partes_assistencia` in `supabase/migrations/202606260001_assistencias_mms_espelho.sql`
- [X] T067 [US4] Create select policies for `mms_assistencias` by profile and posto scope in `supabase/migrations/202606260001_assistencias_mms_espelho.sql`
- [X] T068 [US4] Create select policies for `mms_partes_assistencia` inheriting assistance scope in `supabase/migrations/202606260001_assistencias_mms_espelho.sql`
- [X] T069 [US4] Create insert/update policies for import processing functions scoped by authorized actor and posto in `supabase/migrations/202606260001_assistencias_mms_espelho.sql`
- [X] T070 [US4] Create correction update policies for Operador, Supervisao and Direcao/Admin according to scope in `supabase/migrations/202606260001_assistencias_mms_espelho.sql`
- [X] T071 [US4] Create audit/admin visibility behavior for removed and soft-deleted records where allowed in `supabase/migrations/202606260001_assistencias_mms_espelho.sql`
- [X] T072 [US4] Document RLS access matrix and direct part access inheritance in `supabase/policies/assistencias_mms_espelho.md`

**Checkpoint**: User Story 4 is independently testable with RLS by profile/posto.

---

## Phase 7: User Story 5 - Auditar mudancas do espelho MMS (Priority: P2)

**Goal**: Record centralized audit history for critical assistance and part changes.

**Independent Test**: Execute create, import update, correction, removed marking and reactivation flows and verify coherent `historico_auditoria` events.

### Tests for User Story 5

- [X] T073 [P] [US5] Add SQL test for creation audit events on assistance and part creation in `supabase/tests/assistencias_mms_auditoria.sql`
- [X] T074 [P] [US5] Add SQL test for update-by-import audit events when tracked values change in `supabase/tests/assistencias_mms_auditoria.sql`
- [X] T075 [P] [US5] Add SQL test for removed marking audit events with causing lot context in `supabase/tests/assistencias_mms_auditoria.sql`
- [X] T076 [P] [US5] Add SQL test for reactivation audit events with new lot/line context in `supabase/tests/assistencias_mms_auditoria.sql`
- [X] T077 [P] [US5] Add SQL test proving blocked operations do not create misleading success audit events in `supabase/tests/assistencias_mms_auditoria.sql`

### Implementation for User Story 5

- [X] T078 [US5] Implement audit trigger/function for `mms_assistencias` creation and import updates in `supabase/migrations/202606260001_assistencias_mms_espelho.sql`
- [X] T079 [US5] Implement audit trigger/function for `mms_partes_assistencia` creation and import updates in `supabase/migrations/202606260001_assistencias_mms_espelho.sql`
- [X] T080 [US5] Implement audit event generation for manual correction functions in `supabase/migrations/202606260001_assistencias_mms_espelho.sql`
- [X] T081 [US5] Implement audit event generation for `marcado_removido` and `reativado_por_importacao` in `supabase/migrations/202606260001_assistencias_mms_espelho.sql`
- [X] T082 [US5] Implement audit event generation for exceptional soft delete on assistances and parts in `supabase/migrations/202606260001_assistencias_mms_espelho.sql`
- [X] T083 [US5] Ensure audit context includes entity, posto, date, assistance number, part, actor, previous values, new values, lote and linha in `supabase/migrations/202606260001_assistencias_mms_espelho.sql`
- [X] T084 [US5] Document audit events and blocked-operation behavior in `supabase/policies/assistencias_mms_espelho.md`

**Checkpoint**: User Story 5 is independently testable with centralized audit coverage.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Validate integration, docs and constitutional gates across the whole feature.

- [X] T085 [P] Update `README.md` implementation status for Spec 04 assistance mirror scope if the project status section tracks completed specs
- [X] T086 [P] Review `specs/004-assistencias-mms-espelho/quickstart.md` against final file names, local commands and remote fallback guidance
- [X] T087 [P] Review `specs/004-assistencias-mms-espelho/contracts/future-consumer-contract.md` for mandatory principal assistance links before future specs consume it
- [ ] T088 Run `supabase db reset` validation for all Spec 04 migrations and seed files referenced in `specs/004-assistencias-mms-espelho/quickstart.md`
- [ ] T089 Run `supabase/tests/assistencias_mms_idempotencia.sql` and fix any failing assertions
- [ ] T090 Run `supabase/tests/assistencias_mms_rls.sql` and fix any failing assertions
- [ ] T091 Run `supabase/tests/assistencias_mms_auditoria.sql` and fix any failing assertions
- [ ] T092 Run `supabase/tests/assistencias_mms_removido_raw_json.sql` and fix any failing assertions
- [ ] T093 If local Supabase validation is unavailable, run equivalent remote validation through Supabase MCP and record which tests were executed remotely in `specs/004-assistencias-mms-espelho/quickstart.md`
- [ ] T094 Run Supabase advisors/log review after local or remote validation and record any required fixes in `specs/004-assistencias-mms-espelho/quickstart.md`
- [X] T095 Validate Doka constitution gates for RLS/profile/posto, Portuguese `snake_case`, soft delete separation, `historico_auditoria`, MMS `raw_json`, operational key, `removido` and mandatory future assistance links in `specs/004-assistencias-mms-espelho/tasks.md`
- [X] T096 Confirm no parsing/upload, import error treatment, ocorrencias, reclamacoes, tarefas, custos extras, dashboard, final screens or automatic MMS integration files were introduced outside approved scope in `specs/004-assistencias-mms-espelho/tasks.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 Setup**: No dependencies.
- **Phase 2 Foundational**: Depends on Phase 1 and blocks all user stories.
- **US1 Principal/parts mirror**: Depends on Phase 2.
- **US2 Idempotent reimport/removido/reactivation**: Depends on Phase 2 and uses US1 tables/functions.
- **US3 Manual correction/raw evidence**: Depends on Phase 2 and uses US1 tables.
- **US4 RLS by profile/posto**: Depends on Phase 2 and uses US1 tables.
- **US5 Audit history**: Depends on Phase 2 and integrates with US1, US2 and US3 events.
- **Polish**: Depends on the desired story set being complete.

### User Story Dependencies

- **US1 (P1)**: First MVP increment; establishes core tables and mirror upsert.
- **US2 (P1)**: Depends on US1 for tables and processing functions.
- **US3 (P1)**: Depends on US1 for correction targets; can proceed in parallel with US2 after core tables exist.
- **US4 (P1)**: Depends on US1 for RLS targets; can proceed in parallel with US2/US3 after core tables exist.
- **US5 (P2)**: Can start after audit helper foundation, but complete validation depends on US1/US2/US3 event paths.

### Parallel Opportunities

- T004-T007 can run in parallel.
- T016-T019 can be authored in parallel before US1 implementation.
- T033-T037 can be authored in parallel before US2 implementation.
- T046-T050 can be authored in parallel before US3 implementation.
- T061-T065 can be authored in parallel before US4 implementation.
- T073-T077 can be authored in parallel before US5 implementation.
- T085-T087 can run in parallel during polish.

---

## Parallel Example: User Story 1

```text
Task: "T016 [P] [US1] Add SQL test for grouping multiple parts under one principal assistance in supabase/tests/assistencias_mms_idempotencia.sql"
Task: "T019 [P] [US1] Add SQL test for required minimum fields on assistance and part records in supabase/tests/assistencias_mms_removido_raw_json.sql"
```

## Parallel Example: User Story 2

```text
Task: "T033 [P] [US2] Add SQL test for reprocessing the same eligible input three times without duplicate assistances or parts in supabase/tests/assistencias_mms_idempotencia.sql"
Task: "T036 [P] [US2] Add SQL test proving incomplete or partial lots do not mark absent parts as removido in supabase/tests/assistencias_mms_removido_raw_json.sql"
```

## Parallel Example: User Story 4

```text
Task: "T061 [P] [US4] Add SQL test blocking users without active operational profile from mms_assistencias and mms_partes_assistencia in supabase/tests/assistencias_mms_rls.sql"
Task: "T064 [P] [US4] Add SQL test ensuring Direcao/Admin can inspect assistances and parts across all postos in supabase/tests/assistencias_mms_rls.sql"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 setup.
2. Complete Phase 2 foundational helpers.
3. Complete US1 tables, constraints, indexes and upsert.
4. Validate US1 independently with grouping and duplicate-prevention tests.

### Incremental Delivery

1. US1 delivers the two-level mirror structure.
2. US2 adds reimport, `removido` and reactivation.
3. US3 adds manual correction without raw evidence loss.
4. US4 enforces RLS by profile/posto.
5. US5 completes audit coverage.
6. Polish validates quickstart, constitution and out-of-scope boundaries.

### Test-First Rule

For each story, create or update the SQL tests listed in that story before
implementing the migration behavior. Tests should fail before the corresponding
implementation is added.

---

## Notes

- `[P]` tasks use different files or are safe to author independently before implementation.
- `[US#]` labels map tasks to user stories in `specs/004-assistencias-mms-espelho/spec.md`.
- Keep `.specify/feature.json` pointed at `specs/004-assistencias-mms-espelho` while implementing this feature.
- Do not introduce frontend, parser/upload, import error treatment, ocorrencias, reclamacoes, tarefas, custos extras, dashboard or automatic MMS integration in this feature.
