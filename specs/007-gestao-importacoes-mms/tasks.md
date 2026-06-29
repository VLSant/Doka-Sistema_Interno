# Tasks: Gestão de Importações MMS

**Input**: Design documents from `specs/007-gestao-importacoes-mms/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`,
`contracts/`, `quickstart.md`

**Tests**: Required by the feature success criteria and contracts. Test tasks
must be written first and observed failing before the corresponding
implementation task.

**Organization**: Tasks are grouped by user story. US1–US4 form the minimum MVP
defined by the specification; US5 is the P2 desfazer increment.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it targets different files and has no
  dependency on another incomplete task in the same group.
- **[Story]**: Maps the task to US1, US2, US3, US4 or US5.
- Every task names the file or generated migration path it changes or validates.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare feature-owned files without changing runtime behavior.

- [ ] T001 Run `npx supabase migration new gestao_importacoes_mms` and retain the CLI-generated file as `supabase/migrations/*_gestao_importacoes_mms.sql`
- [ ] T002 [P] Create the policy design skeleton and capability matrix in `supabase/policies/gestao_importacoes_mms.md`
- [ ] T003 [P] Create deterministic multi-profile, multi-posto, correction, reprocessing and undo seed scenarios in `supabase/seed/gestao_importacoes_mms.sql`
- [ ] T004 [P] Add reusable list/detail/correction/operation fixtures and RPC mocks in `tests/helpers/importacao-mms-management-fixtures.ts`
- [ ] T005 [P] Add empty feature test suites with setup helpers in `tests/integration/importacoes-mms/management-test-utils.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish shared schema, authorization, auditing, types and route
boundaries required by every story.

**⚠️ CRITICAL**: No user-story implementation begins until this phase passes.

### Tests first

- [ ] T006 [P] Write failing schema/constraint/backfill tests for lot, line, error, `mms_correcoes_importacao` and `mms_operacoes_lote` in `supabase/tests/gestao_importacoes_mms_schema.sql`
- [ ] T007 [P] Write failing baseline tests for `anon`, inactive users, direct writes, private helpers, RLS and grants in `supabase/tests/gestao_importacoes_mms_consulta_rls.sql`
- [ ] T008 [P] Write failing centralized-audit tests covering safe payloads and absence of false success in `supabase/tests/gestao_importacoes_mms_auditoria.sql`

### Shared implementation

- [ ] T009 Implement enums, entity extensions, `mms_correcoes_importacao`, `mms_operacoes_lote`, constraints, indexes and compatible backfills in `supabase/migrations/*_gestao_importacoes_mms.sql`
- [ ] T010 Implement shared actor/profile/posto coverage helpers, correction allowlist, version checks and `json_efetivo` projection without mutating evidence in `supabase/migrations/*_gestao_importacoes_mms.sql`
- [ ] T011 Implement RLS policies, explicit grants/revokes, private-function isolation and multi-posto child access hardening in `supabase/migrations/*_gestao_importacoes_mms.sql`
- [ ] T012 Implement audit triggers/helpers for corrections, treatment and operation state while excluding secrets and full `raw_json` in `supabase/migrations/*_gestao_importacoes_mms.sql`
- [ ] T013 [P] Define paginated summaries, detail collections, corrections, capabilities, operations and error-code TypeScript models in `src/modules/importacoes-mms/types.ts`
- [ ] T014 [P] Create the shared authenticated RPC adapter, cursor validation and safe error mapping in `src/modules/importacoes-mms/management-service.ts`
- [ ] T015 Move the existing Spec 006 page boundary to `/app/importacoes-mms/nova` while preserving its behavior in `src/app/router.tsx`

**Checkpoint**: Shared schema, RLS, audit, types and new-import route are ready.

---

## Phase 3: User Story 1 — Consultar lotes autorizados (Priority: P1)

**Goal**: Deliver a filtered, cursor-paginated central showing only authorized
lot/post projections and clear operational states.

**Independent Test**: Sign in as each profile, combine every filter, paginate,
and confirm that rows/totals reflect only authorized postos while empty,
no-result, denied and temporary-failure states remain distinct.

### Tests for User Story 1

- [ ] T016 [P] [US1] Write failing SQL contract tests for filtered cursor pagination, partial multi-posto totals and capability projection in `supabase/tests/gestao_importacoes_mms_consulta_rls.sql`
- [ ] T017 [P] [US1] Write failing service tests for filter payloads, cursor mapping and safe error states in `tests/integration/importacoes-mms/lot-list-service.test.ts`
- [ ] T018 [P] [US1] Write failing UI tests for loading, empty, no-result, filtered and paginated list states in `tests/integration/importacoes-mms/lot-list.test.tsx`

### Implementation for User Story 1

- [ ] T019 [US1] Implement `public.listar_lotes_importacao_mms` with indexed cursor pagination, authorized aggregates and capability flags in `supabase/migrations/*_gestao_importacoes_mms.sql`
- [ ] T020 [US1] Implement list request/response mapping and cursor recovery in `src/modules/importacoes-mms/lot-service.ts`
- [ ] T021 [P] [US1] Implement combined accessible filters in `src/modules/importacoes-mms/components/LotFilters.tsx`
- [ ] T022 [P] [US1] Implement the desktop-first status/total/action table in `src/modules/importacoes-mms/components/LotsTable.tsx`
- [ ] T023 [US1] Compose loading, empty, no-result, failure and pagination states in `src/modules/importacoes-mms/pages/ImportListPage.tsx`
- [ ] T024 [US1] Add list/table/filter design-system styles and 1280×720 overflow behavior in `src/modules/importacoes-mms/pages/ImportListPage.css`
- [ ] T025 [US1] Route `/app/importacoes-mms` to the central and keep Nova importação linked to `/app/importacoes-mms/nova` in `src/app/router.tsx`

**Checkpoint**: US1 is independently deployable as a read-only operational
central.

---

## Phase 4: User Story 2 — Auditar o detalhe de um lote (Priority: P1)

**Goal**: Show an authorized lot summary, paginated operational collections,
result, failures, history and original-file access without cross-posto leakage.

**Independent Test**: Open valid, warning, error, failed and cancelled lots by
navigation and direct URL; verify totals, collections, technical-data rules and
full-scope file access for every profile.

### Tests for User Story 2

- [ ] T026 [P] [US2] Write failing SQL tests for authorized detail projection, paginated collections and inaccessible-ID neutrality in `supabase/tests/gestao_importacoes_mms_detalhe.sql`
- [ ] T027 [P] [US2] Write failing Storage/RLS tests proving partial-scope users cannot obtain the original file in `supabase/tests/gestao_importacoes_mms_consulta_rls.sql`
- [ ] T028 [P] [US2] Write failing page tests for summary, tabs, result, failure, cancellation and direct-URL denial in `tests/integration/importacoes-mms/lot-detail.test.tsx`

### Implementation for User Story 2

- [ ] T029 [US2] Implement `public.obter_detalhe_lote_importacao_mms` and `public.listar_itens_lote_importacao_mms` with safe collection projections in `supabase/migrations/*_gestao_importacoes_mms.sql`
- [ ] T030 [US2] Enforce full-lot posto coverage for Storage object select/download without weakening Spec 006 uploads in `supabase/migrations/*_gestao_importacoes_mms.sql`
- [ ] T031 [US2] Implement detail, collection pagination and original-file download methods in `src/modules/importacoes-mms/lot-service.ts`
- [ ] T032 [P] [US2] Implement lot origin, status, totals, capabilities and result summary in `src/modules/importacoes-mms/components/LotSummary.tsx`
- [ ] T033 [P] [US2] Implement lazy paginated tabs for lines, errors, alerts, corrections, operations and audit in `src/modules/importacoes-mms/components/LotItemsTabs.tsx`
- [ ] T034 [US2] Compose accessible detail/download/denied/failure states in `src/modules/importacoes-mms/pages/ImportDetailPage.tsx`
- [ ] T035 [US2] Register `/app/importacoes-mms/:loteId` under the existing protected route boundary in `src/app/router.tsx`

**Checkpoint**: US2 independently explains and audits any authorized lot.

---

## Phase 5: User Story 3 — Tratar erros preservando evidência (Priority: P1)

**Goal**: Save versioned field corrections, revalidate deterministic rules and
resolve/reopen errors without altering original evidence or losing concurrent
changes.

**Independent Test**: Correct allowed and forbidden fields under every
profile/vínculo, race two versions, and prove that only valid current corrections
affect line/error state while `raw_json` and `json_normalizado` remain identical.

### Tests for User Story 3

- [ ] T036 [P] [US3] Write failing SQL tests for append-only corrections, allowlist validators, error resolution/reopen and evidence immutability in `supabase/tests/gestao_importacoes_mms_correcao.sql`
- [ ] T037 [P] [US3] Write failing SQL race tests for expected versions, row locks and stale-write rejection in `supabase/tests/gestao_importacoes_mms_concorrencia.sql`
- [ ] T038 [P] [US3] Write failing permission tests for Operador `consulta`, Operador `operacional`, Supervisão and Direção/Administração in `supabase/tests/gestao_importacoes_mms_consulta_rls.sql`
- [ ] T039 [P] [US3] Write failing UI/service tests for valid, invalid and stale correction responses in `tests/integration/importacoes-mms/correction-flow.test.tsx`

### Implementation for User Story 3

- [ ] T040 [US3] Implement per-field deterministic validation and error recalculation over `json_efetivo` in `supabase/migrations/*_gestao_importacoes_mms.sql`
- [ ] T041 [US3] Implement `public.salvar_correcao_importacao_mms` with lot/line locks, expected version, append-only history and conclusion invalidation in `supabase/migrations/*_gestao_importacoes_mms.sql`
- [ ] T042 [US3] Add correction/error audit events and block direct mutation or false-success events in `supabase/migrations/*_gestao_importacoes_mms.sql`
- [ ] T043 [US3] Implement correction/history RPC mapping and stale-version recovery in `src/modules/importacoes-mms/treatment-service.ts`
- [ ] T044 [US3] Implement the field editor with original/normalized/current values and deterministic suggestions in `src/modules/importacoes-mms/components/CorrectionEditor.tsx`
- [ ] T045 [US3] Compose grouped errors, pending counts, correction history and profile capabilities in `src/modules/importacoes-mms/pages/ImportTreatmentPage.tsx`
- [ ] T046 [US3] Register `/app/importacoes-mms/:loteId/tratamento` and preserve typed direct-URL guards in `src/app/router.tsx`

**Checkpoint**: US3 independently allows safe treatment; Operador still cannot
conclude or reprocess.

---

## Phase 6: User Story 4 — Revalidar e reprocessar com segurança (Priority: P1)

**Goal**: Conclude a current treatment version and atomically reprocess it once,
with persisted results and recovery from uncertain responses.

**Independent Test**: Conclude eligible/ineligible lots, repeat one idempotency
key three times, simulate a mid-processing failure and reconcile every mirror
counter without partial effects.

### Tests for User Story 4

- [ ] T047 [P] [US4] Write failing SQL tests for full revalidation, role coverage, treatment-version invalidation and completion status in `supabase/tests/gestao_importacoes_mms_reprocessamento.sql`
- [ ] T048 [US4] Write failing SQL tests for operation-ledger idempotency, conflicting keys, uncertain-response lookup and retry after failure in `supabase/tests/gestao_importacoes_mms_reprocessamento.sql`
- [ ] T049 [P] [US4] Write failing fault-injection tests proving subtransaction rollback and no false success in `supabase/tests/gestao_importacoes_mms_atomicidade.sql`
- [ ] T050 [P] [US4] Write failing UI/service tests for impact confirmation, repeated click, stored result and uncertain response in `tests/integration/importacoes-mms/reprocess-flow.test.tsx`

### Implementation for User Story 4

- [ ] T051 [US4] Implement `public.concluir_tratamento_importacao_mms` with integral scope/evidence/error revalidation and version sealing in `supabase/migrations/*_gestao_importacoes_mms.sql`
- [ ] T052 [US4] Refactor the private Spec 004/006 processor to consume `json_efetivo` while preserving key, `removido`, reactivation and raw evidence in `supabase/migrations/*_gestao_importacoes_mms.sql`
- [ ] T053 [US4] Implement idempotency-key resolution, `public.reprocessar_lote_importacao_mms` and `public.obter_operacao_lote_mms` in `supabase/migrations/*_gestao_importacoes_mms.sql`
- [ ] T054 [US4] Implement treatment completion, impact, reprocess and operation-status methods in `src/modules/importacoes-mms/treatment-service.ts`
- [ ] T055 [US4] Implement accessible impact confirmation and uncertain-response recovery in `src/modules/importacoes-mms/components/ReprocessDialog.tsx`
- [ ] T056 [US4] Integrate conclusion/reprocess capabilities and reconciled result refresh into `src/modules/importacoes-mms/pages/ImportTreatmentPage.tsx`

**Checkpoint**: US1–US4 satisfy the minimum MVP explicitly defined by the spec.

---

## Phase 7: User Story 5 — Analisar e desfazer importação elegível (Priority: P2)

**Goal**: Analyze blockers and atomically undo only the effective latest lot,
restoring each posto/date predecessor without deleting evidence.

**Independent Test**: Analyze eligible/blocked multi-posto lots, introduce a
dependency after analysis, restore different predecessors per scope, inject a
failure in the final scope and repeat the idempotency key.

### Tests for User Story 5

- [ ] T057 [P] [US5] Write failing eligibility tests for latest-effective lot, complete scope, manual edits and stable blocker codes in `supabase/tests/gestao_importacoes_mms_desfazer.sql`
- [ ] T058 [US5] Write failing reconstruction tests for different predecessors and no-predecessor removal without physical delete in `supabase/tests/gestao_importacoes_mms_desfazer.sql`
- [ ] T059 [US5] Write failing stale-analysis, dependency, idempotency and second-undo tests in `supabase/tests/gestao_importacoes_mms_desfazer.sql`
- [ ] T060 [P] [US5] Extend fault-injection tests to prove failure in one scope rolls back every scope and preserves lot status in `supabase/tests/gestao_importacoes_mms_atomicidade.sql`
- [ ] T061 [P] [US5] Write failing UI/service tests for blocked reasons, justification, stale analysis and final result in `tests/integration/importacoes-mms/undo-flow.test.tsx`

### Implementation for User Story 5

- [ ] T062 [US5] Implement latest-effective/predecessor selection and dependency blocker helpers per posto/data in `supabase/migrations/*_gestao_importacoes_mms.sql`
- [ ] T063 [US5] Implement `public.analisar_desfazer_importacao_mms` with safe blocker aggregation, impact and opaque state signature in `supabase/migrations/*_gestao_importacoes_mms.sql`
- [ ] T064 [US5] Implement `app_private.mms_reconstruir_espelho_escopo` for predecessor replay or no-predecessor withdrawal without delete in `supabase/migrations/*_gestao_importacoes_mms.sql`
- [ ] T065 [US5] Implement `public.desfazer_importacao_mms` with deterministic locks, full revalidation, idempotent ledger, atomic cancellation and audit in `supabase/migrations/*_gestao_importacoes_mms.sql`
- [ ] T066 [US5] Implement analyze/execute/status response mapping in `src/modules/importacoes-mms/treatment-service.ts`
- [ ] T067 [US5] Implement accessible blocker, impact, justification, confirmation and stale-analysis flows in `src/modules/importacoes-mms/components/UndoImportDialog.tsx`
- [ ] T068 [US5] Integrate analyze/desfazer capabilities and Cancelado result refresh into `src/modules/importacoes-mms/pages/ImportDetailPage.tsx`

**Checkpoint**: US5 adds the approved P2 reversal journey without weakening the
MVP.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Validate the integrated feature, documentation, performance,
security and constitutional gates.

- [ ] T069 [P] Document the manual browser acceptance matrix for protected direct URLs, keyboard, focus, profiles, destructive dialogs and desktop layouts in `specs/007-gestao-importacoes-mms/quickstart.md`
- [ ] T070 [P] Add 10,000-line cursor/query mapping performance coverage in `tests/unit/importacoes-mms/management-performance.test.ts`
- [ ] T071 [P] Finalize RLS, RPC, grants, audit events and future occurrence/cost dependency notes in `supabase/policies/gestao_importacoes_mms.md`
- [ ] T072 [P] Finalize deterministic acceptance data and document cleanup order in `supabase/seed/gestao_importacoes_mms.sql`
- [ ] T073 Run all SQL files transactionally against the approved remote development project and record evidence in `specs/007-gestao-importacoes-mms/quickstart.md`
- [ ] T074 Run Supabase lint/advisors, inspect query plans for list/detail/undo and resolve findings in `supabase/migrations/*_gestao_importacoes_mms.sql`
- [ ] T075 Run `npm run typecheck`, `npm run lint`, `npm test` and `npm run build`, recording outcomes in `specs/007-gestao-importacoes-mms/quickstart.md`
- [ ] T076 Validate Constitution gates for RLS/profile/posto, no physical delete, centralized audit, evidence immutability, MMS key/`removido`, dependency blockers and desktop-first UI in `specs/007-gestao-importacoes-mms/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 — Setup**: no dependencies.
- **Phase 2 — Foundational**: depends on Phase 1 and blocks all stories.
- **Phase 3 — US1**: depends on Phase 2.
- **Phase 4 — US2**: depends on shared foundation; UI integrates naturally after
  US1, but detail RPC/page can be tested by direct URL independently.
- **Phase 5 — US3**: depends on Phase 2 and the US2 collection contract for its
  full UI; database correction behavior is independently testable.
- **Phase 6 — US4**: depends on US3 because it processes a concluded correction
  version.
- **Phase 7 — US5**: depends on US2 and US4 because it analyzes processed results
  and operation-ledger state.
- **Phase 8 — Polish**: depends on all stories selected for release.

### User Story Dependency Graph

```text
Setup -> Foundation -> US1
                    -> US2 -> US3 -> US4 -> US5
                         \---------------> US5
```

- US1 is the first independently demonstrable increment.
- US2 can start in parallel with US1 after Foundation using direct URLs/mocks.
- US3 database work can start after Foundation; its final page composition uses
  US2 collections.
- US4 strictly follows US3.
- US5 strictly follows US4 and uses US2 detail.

### Within Each User Story

1. Write contract/SQL/UI tests and confirm the relevant tests fail.
2. Implement database contracts and security.
3. Implement TypeScript service mappings.
4. Implement components/pages/routes.
5. Run the story-specific tests and verify the independent checkpoint.

## Parallel Opportunities

- T002–T005 can run in parallel after T001.
- T006–T008 can run in parallel before T009–T012.
- T013 and T014 can run in parallel with database foundation after contracts are
  fixed.
- Tests marked `[P]` within each story target separate files or independent
  scenarios.
- US1 and US2 can be developed in parallel after Foundation.
- In US1, T021 and T022 can run in parallel.
- In US2, T032 and T033 can run in parallel.
- Cross-cutting T069–T072 can run in parallel after all selected stories.

## Parallel Example: User Story 1

```text
Task T016: SQL pagination and partial-scope contract tests
Task T017: list service mapping tests
Task T018: list UI state tests

After T020:
Task T021: LotFilters component
Task T022: LotsTable component
```

## Parallel Example: User Story 2

```text
Task T026: detail RPC/collection SQL tests
Task T027: Storage full-scope tests
Task T028: detail page tests

After T031:
Task T032: LotSummary component
Task T033: LotItemsTabs component
```

## Parallel Example: User Story 3

```text
Task T036: correction/evidence SQL tests
Task T037: concurrency SQL tests
Task T038: correction permission tests
Task T039: correction UI/service tests
```

## Parallel Example: User Story 4

```text
Task T047 then T048: sequential sections in the reprocessing SQL test file
Task T049: reprocessing atomicity tests
Task T050: reprocessing UI/service tests
```

## Parallel Example: User Story 5

```text
Task T057 then T058 then T059: sequential sections in the undo SQL test file
Task T060: cross-scope atomicity tests
Task T061: undo UI/service tests
```

## Implementation Strategy

### Increment 1 — Read-only central

1. Complete Setup and Foundational phases.
2. Complete US1.
3. Validate filters, partial scope, states and performance.
4. Demonstrate the central without enabling any mutation.

### Increment 2 — Audit detail

1. Complete US2.
2. Validate direct URL, paginated collections and original-file protection.
3. Demonstrate US1 and US2 independently.

### Minimum MVP from the specification

1. Complete US3 correction handling.
2. Complete US4 conclusion/reprocessing.
3. Run all US1–US4 SQL, frontend and acceptance checks.
4. Release only when RLS, evidence preservation, concurrency and atomicity pass.

### P2 increment

1. Complete US5 after the minimum MVP is stable.
2. Validate predecessor reconstruction and every blocker.
3. Require atomicity/fault-injection evidence before enabling Desfazer.

## Notes

- `[P]` means different files or safely independent test work.
- Story labels provide traceability to `spec.md`.
- The generated migration path is established by T001 and reused by every task
  referencing `supabase/migrations/*_gestao_importacoes_mms.sql`.
- Never invent a migration timestamp; always use the CLI-generated file.
- Never apply migrations or destructive fixtures to production.
- Do not implement occurrence/cost creation; only dependency blockers belong to
  this feature.
- Stop on any unresolved conflict with Specs 001–006 or the Constitution.
