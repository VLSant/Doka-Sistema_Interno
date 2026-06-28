# Tasks: Importação MMS — Upload, Parser, Validação e Processamento

**Input**: Design documents from `specs/006-importacao-mms-processamento/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`,
`contracts/`, `quickstart.md`

**Tests**: Required by the specification, plan, contracts and constitution.
Story tests must be written first and observed failing for the intended missing
behavior before implementation.

**Organization**: Tasks are grouped by user story so file selection, preview,
confirmation, reimportation, cancellation and result remain independently
verifiable.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it targets different files and does not
  depend on unfinished work.
- **[Story]**: Maps directly to a user story in `spec.md`.
- Every task includes its exact target file path or the Supabase CLI-generated
  migration path pattern.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add pinned parser/upload dependencies and deterministic MMS test
assets.

- [X] T001 Add exact versions of `papaparse`, `@types/papaparse`, `read-excel-file`, and `tus-js-client` to `package.json` and regenerate `package-lock.json`
- [X] T002 [P] Create deterministic CSV fixtures for valid, warning, invalid, malformed, duplicate-key, multi-date, multi-posto, and reimport scenarios in `tests/fixtures/mms/valido.csv`, `tests/fixtures/mms/alertas.csv`, `tests/fixtures/mms/invalido.csv`, `tests/fixtures/mms/malformado.csv`, `tests/fixtures/mms/chave-duplicada.csv`, `tests/fixtures/mms/multiplas-datas.csv`, `tests/fixtures/mms/multiplos-postos.csv`, and `tests/fixtures/mms/reimportacao.csv`
- [X] T003 [P] Create deterministic XLSX fixtures for valid, multiple-parts, multiple-sheet, corrupt, and protected/unsupported workbook scenarios in `tests/fixtures/mms/valido.xlsx`, `tests/fixtures/mms/multiplas-partes.xlsx`, `tests/fixtures/mms/multiplas-planilhas.xlsx`, `tests/fixtures/mms/corrompido.xlsx`, and `tests/fixtures/mms/protegido.xlsx`
- [X] T004 [P] Add import-processing seed data for three profiles, at least three postos, baseline mirror records, and reimport states in `supabase/seed/importacao_mms_processamento.sql`
- [X] T005 [P] Create shared import fixture builders, fake files, typed RPC responses, and Supabase Storage/RPC doubles in `tests/helpers/importacao-mms-fixtures.ts` and `tests/helpers/supabase-mocks.ts`

**Checkpoint**: Dependencies install reproducibly and fixtures can be loaded by
Vitest/jsdom and the remote SQL validation workflow.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish the database extensions, private Storage boundary,
canonical normalization, frontend types and state machine used by every story.

**⚠️ CRITICAL**: No user story implementation begins until this phase is
complete.

- [X] T006 [P] Write failing pgTAP coverage for lot/line extensions, legacy backfill, private bucket restrictions, Storage path policies, raw/normalized separation, direct-staging-write denial, and explicit grants in `supabase/tests/importacao_mms_processamento_rls_storage.sql`
- [X] T007 [P] Write failing unit tests for parsed-file types, preview/result types, every UI state, valid transitions, stale-attempt clearing, and invalid transition rejection in `tests/unit/importacoes-mms/import-machine.test.ts`
- [X] T008 Generate the feature migration with `supabase migration new importacao_mms_processamento` and establish the migration header/order in the resulting `supabase/migrations/*_importacao_mms_processamento.sql`
- [X] T009 Extend `mms_lotes_importacao` with original-area, private-file metadata, expected/assistance/part totals, confirmation, processing-result, safe-failure, and cancellation fields plus compatibility backfill/constraints in `supabase/migrations/*_importacao_mms_processamento.sql`
- [X] T010 Extend `mms_linhas_importacao` with immutable `json_normalizado`, required Spec 006 row numbering, unique active lot/row identity, legacy backfill, and raw/normalized consistency guards in `supabase/migrations/*_importacao_mms_processamento.sql`
- [X] T011 Create/configure the private `mms-importacoes` bucket, 25 MiB/MIME restrictions, immutable reserved-path helpers, object verification, and `storage.objects` RLS policies in `supabase/migrations/*_importacao_mms_processamento.sql`
- [X] T012 Implement private header lookup, Unicode/key normalization, strict date/status/type conversion, candidate extraction, complementary-field conversion, line classification, and stable error/alert code helpers in `supabase/migrations/*_importacao_mms_processamento.sql`
- [X] T013 Add centralized import workflow audit helpers, fixed/empty `search_path`, explicit function/table grants and revokes, and revoke generic authenticated staging writes while preserving RLS-scoped reads in `supabase/migrations/*_importacao_mms_processamento.sql`
- [X] T014 [P] Define parsed file/row, server preview, server result, stable error code, progress, and service boundary types in `src/modules/importacoes-mms/parser/types.ts` and `src/modules/importacoes-mms/types.ts`
- [X] T015 Implement the pure discriminated import state machine and stale-attempt cleanup rules in `src/modules/importacoes-mms/import-machine.ts`
- [X] T016 [P] Extend test doubles for abortable TUS upload, six import RPCs, paginated errors/alerts, session expiry, and duplicate responses in `tests/helpers/supabase-mocks.ts`
- [X] T017 Document bucket exposure, Storage RLS, RPC privilege model, staging grant reduction, actor derivation, audit events, and Spec 007 boundaries in `supabase/policies/importacao_mms_processamento.md`

**Checkpoint**: Schema migration applies from zero, foundational SQL/unit tests
pass, `raw_json` remains immutable/original, and all shared types compile.

---

## Phase 3: User Story 1 - Acessar e selecionar uma planilha MMS (Priority: P1) 🎯

**Goal**: Make Importações MMS functional for the three authorized profiles,
validate/select CSV/XLSX, create a scoped attempt and preserve the original file
without changing the mirror.

**Independent Test**: Enter with each profile, select supported/unsupported and
in/out-of-scope files, verify parser/upload feedback and confirm that staging
and mirror are unchanged until later phases.

### Tests for User Story 1

- [X] T018 [P] [US1] Write failing pgTAP tests for `iniciar_importacao_mms` and `registrar_arquivo_importacao_mms`, including actor resolution, exact posto matching, profile scope, metadata limits, reserved path, Storage verification, idempotent registration, and audit in `supabase/tests/importacao_mms_processamento_rpc.sql`
- [X] T019 [P] [US1] Write failing CSV parser tests for delimiter detection, BOM, quotes, accents, blank boundaries, malformed rows, duplicate headers, no dynamic typing, original header/value preservation, and 25 MiB rejection in `tests/unit/importacoes-mms/csv-parser.test.ts`
- [X] T020 [P] [US1] Write failing XLSX parser tests for valid typed cells, `trim: false`, all-sheet inspection, multiple logical tables, corruption, protected/unsupported workbook, original values, and 25 MiB rejection in `tests/unit/importacoes-mms/xlsx-parser.test.ts`
- [X] T021 [P] [US1] Write failing row-mapper tests for header canonicalization without posto equivalence, source row numbers, JSON-safe XLSX values, fully blank row handling, and raw object creation in `tests/unit/importacoes-mms/row-mapper.test.ts`
- [X] T022 [P] [US1] Write failing component/integration tests for click/drag selection, unsupported files, upload progress, retry, and no confirmation control in `tests/integration/importacoes-mms/file-selection.test.tsx`

### Implementation for User Story 1

- [X] T023 [US1] Implement `public.iniciar_importacao_mms` and `public.registrar_arquivo_importacao_mms` with locks, actor/posto checks, immutable reservation, Storage verification, stable responses, idempotency and audit in `supabase/migrations/*_importacao_mms_processamento.sql`
- [X] T024 [P] [US1] Implement worker/stream CSV parsing with `header: false`, `dynamicTyping: false`, delimiter detection and preserved source rows in `src/modules/importacoes-mms/parser/csv-parser.ts`
- [X] T025 [P] [US1] Implement browser-worker XLSX reading with `trim: false`, all-sheet validation and deterministic JSON-safe cells in `src/modules/importacoes-mms/parser/xlsx-parser.ts`
- [X] T026 [US1] Implement shared extension/MIME/size/header validation, row mapping, original-header objects, unique area/date extraction and parser dispatch in `src/modules/importacoes-mms/parser/row-mapper.ts`
- [X] T027 [P] [US1] Implement abortable TUS upload with direct Storage hostname, 6 MiB chunks, current access token forwarding, retries, progress and no upsert in `src/modules/importacoes-mms/storage-upload.ts`
- [X] T028 [US1] Implement the typed service flow for parse → start RPC → upload → register-file RPC with current-context revalidation and safe error mapping in `src/modules/importacoes-mms/import-service.ts`
- [X] T029 [P] [US1] Implement the accessible click/keyboard/drag file selector, metadata feedback and upload progress in `src/modules/importacoes-mms/components/FileDropzone.tsx` and `src/modules/importacoes-mms/components/FileDropzone.css`
- [X] T030 [US1] Implement the initial Nova Importação MMS page controller for idle/parsing/uploading/failure states without preview or confirmation behavior in `src/modules/importacoes-mms/pages/NewImportPage.tsx` and `src/modules/importacoes-mms/pages/NewImportPage.css`
- [X] T031 [US1] Change Importações MMS from placeholder to available, lazy-load the feature page and preserve the existing profile matrix/ProtectedRoute in `src/app/routes.ts` and `src/app/router.tsx`
- [X] T032 [US1] Make all US1 transaction-wrapped remote SQL, unit, and integration tests pass and record verified commands/results at the US1 checkpoint in `specs/006-importacao-mms-processamento/tasks.md`

**Checkpoint**: US1 independently proves secure access, parsing eligibility and
original-file preservation without any mirror update.

---

## Phase 4: User Story 2 - Analisar e revisar a prévia da importação (Priority: P1)

**Goal**: Persist raw rows in resumable blocks, normalize/validate them
authoritatively and show a true preview with eligibility, totals, errors and
warnings.

**Independent Test**: Submit valid, warning and invalid files and compare the
authoritative preview and paginated issues with fixture expectations while the
mirror remains unchanged.

### Tests for User Story 2

- [X] T033 [P] [US2] Write failing pgTAP tests for block shape/size, same-row retry, conflicting duplicate, canonical extraction, `json_normalizado`, line states, error/alert codes, expected-row completeness, totals and `concluir_analise_importacao_mms` in `supabase/tests/importacao_mms_processamento_rpc.sql`
- [X] T034 [P] [US2] Write failing service tests for 250-row chunking, retry/no-op accounting, progress, authoritative preview, paginated issues, incomplete block failure and server-over-client eligibility in `tests/integration/importacoes-mms/import-service.test.ts`
- [X] T035 [P] [US2] Write failing component tests for valid, warning and invalid summaries, original-versus-normalized values, all required totals, issue pagination and disabled confirmation in `tests/integration/importacoes-mms/import-preview.test.tsx`

### Implementation for User Story 2

- [X] T036 [US2] Implement `public.registrar_linhas_importacao_mms` with 1–250 row validation, server-side canonicalization, raw/normalized persistence, candidate fields, issue creation, block rollback, idempotent same-row retry and audit summary in `supabase/migrations/*_importacao_mms_processamento.sql`
- [X] T037 [US2] Implement `public.concluir_analise_importacao_mms` with Storage/scope revalidation, full-row completeness, duplicate identity checks, consistent totals, official status derivation and authoritative preview response in `supabase/migrations/*_importacao_mms_processamento.sql`
- [X] T038 [US2] Implement staging block orchestration, retry accounting, progress, preview retrieval and paginated RLS issue queries in `src/modules/importacoes-mms/import-service.ts`
- [X] T039 [P] [US2] Implement accessible counts, eligibility, blocking-error and warning presentation with icon/text semantics in `src/modules/importacoes-mms/components/ValidationSummary.tsx` and `src/modules/importacoes-mms/components/ValidationSummary.css`
- [X] T040 [P] [US2] Implement the preview header, file/posto/date summary, paginated issue tables and original/normalized comparison in `src/modules/importacoes-mms/components/ImportPreview.tsx` and `src/modules/importacoes-mms/components/ImportPreview.css`
- [X] T041 [US2] Integrate staging/progress/preview-ready states, server-authoritative confirmation availability and corrected-file guidance without an editor in `src/modules/importacoes-mms/pages/NewImportPage.tsx`
- [X] T042 [US2] Make all US2 transaction-wrapped remote SQL, service, and component tests pass and record verified commands/results at the US2 checkpoint in `specs/006-importacao-mms-processamento/tasks.md`

**Checkpoint**: US1 + US2 deliver a complete, independently testable analysis
flow; no preview state can alter the mirror.

---

## Phase 5: User Story 3 - Confirmar e atualizar o espelho operacional (Priority: P1)

**Goal**: Explicitly confirm one eligible preview and update the mirror exactly
once with atomic rollback, accurate result and centralized audit.

**Independent Test**: Confirm an eligible multi-part file, repeat/concurrently
send the confirmation, inject a mirror failure and verify one successful effect
or zero partial effect with truthful audit/result.

### Tests for User Story 3

- [X] T043 [P] [US3] Write failing pgTAP tests for confirmation `FOR UPDATE`, full revalidation, stored-result retry, concurrent semantics, warning eligibility, error/cancel denial, safe failure subtransaction, retry-after-failure and no false success audit in `supabase/tests/importacao_mms_processamento_atomicidade.sql`
- [X] T044 [P] [US3] Write failing pgTAP assertions that mirror upserts consume `json_normalizado` while preserving original part `raw_json` and assistance `raw_json_resumo` in `supabase/tests/importacao_mms_processamento_resultado.sql`
- [X] T045 [P] [US3] Write failing integration tests for explicit removal-impact confirmation, context revalidation, local double-click suppression, server stored-result retry, safe failure messaging and protected-data clearing in `tests/integration/importacoes-mms/import-confirmation.test.tsx`

### Implementation for User Story 3

- [X] T046 [US3] Update assistance/part upsert functions to consume canonical values from `mms_linhas_importacao.json_normalizado` while copying only original evidence from `raw_json` in `supabase/migrations/*_importacao_mms_processamento.sql`
- [X] T047 [US3] Extend mirror processing to calculate created, materially updated, preserved, removed and reactivated assistance/part counters without emitting fictitious material-change audit in `supabase/migrations/*_importacao_mms_processamento.sql`
- [X] T048 [US3] Implement `public.confirmar_importacao_mms` with lot lock, actor/posto/Storage/completeness revalidation, protected mirror subtransaction, immutable success result, safe persisted failure, retry semantics and explicit privileges in `supabase/migrations/*_importacao_mms_processamento.sql`
- [X] T049 [US3] Add typed confirmation/retry calls and server-result/error discrimination without inferring success from HTTP status in `src/modules/importacoes-mms/import-service.ts`
- [X] T050 [US3] Implement the explicit confirmation dialog/region naming posto/date and `removido` impact, with disabled repeated action and accessible progress in `src/modules/importacoes-mms/pages/NewImportPage.tsx`
- [X] T051 [US3] Add/verify workflow audit events for confirmation requested, mirror success, safe failure and unchanged retry while preserving existing Spec 004 entity events in `supabase/migrations/*_importacao_mms_processamento.sql` and `supabase/policies/importacao_mms_processamento.md`
- [X] T052 [US3] Make all US3 transaction-wrapped remote SQL and integration tests pass and record verified commands/results at the US3 checkpoint in `specs/006-importacao-mms-processamento/tasks.md`

**Checkpoint**: US1–US3 deliver one complete first import from file selection to
an atomic, truthful mirror result.

---

## Phase 6: User Story 4 - Reimportar o mesmo posto e data sem duplicidade (Priority: P1)

**Goal**: Reimport the same posto/date with identical, changed, new, absent and
reappearing keys without duplicates or unsafe removal.

**Independent Test**: Run the baseline and all reimport variants three times and
verify preserved/updated/created/removed/reactivated records, counters,
traceability and audit.

### Tests for User Story 4

- [X] T053 [P] [US4] Write failing pgTAP reimport tests for three identical runs, changed/new/absent/reappearing keys, principal grouping, complete-key uniqueness, ineligible-lot non-removal, counters, latest lot/line and audit in `supabase/tests/importacao_mms_processamento_resultado.sql`
- [X] T054 [P] [US4] Write failing service integration tests that reconcile stored reimport counters without client recomputation and preserve the previous successful result on retry in `tests/integration/importacoes-mms/import-reimportation.test.ts`

### Implementation for User Story 4

- [X] T055 [US4] Harden same-lot and same-posto/date processing so identical input is no-op, changed/new keys update/create, only complete eligible absence marks `removido`, and reappearance reactivates with accurate counters in `supabase/migrations/*_importacao_mms_processamento.sql`
- [X] T056 [US4] Expose persisted reimport traceability/counters through the existing typed result mapping without any client-derived business totals in `src/modules/importacoes-mms/import-service.ts`
- [X] T057 [US4] Make all US4 transaction-wrapped remote SQL and integration tests pass and record verified commands/results at the US4 checkpoint in `specs/006-importacao-mms-processamento/tasks.md`

**Checkpoint**: US1–US4 form the minimum safe operational import core required
by the MMS idempotency constitution.

---

## Phase 7: User Story 5 - Cancelar ou abandonar antes da confirmação (Priority: P2)

**Goal**: Let the user cancel selection or a persisted attempt without changing
the mirror, while preserving already stored evidence and handling session loss.

**Independent Test**: Cancel during local parsing, upload, staging and ready
preview; expire the session; verify no mirror effect, truthful cancelled state
and a clean new attempt.

### Tests for User Story 5

- [X] T058 [P] [US5] Write failing pgTAP tests for `cancelar_importacao_mms` before/after file/lines/preview, idempotent cancellation, processed-lot denial, evidence preservation, audit actor and blocked subsequent calls in `supabase/tests/importacao_mms_processamento_rpc.sql`
- [X] T059 [P] [US5] Write failing state/service integration tests for local selection cancel, TUS abort, persisted cancel RPC, session-expiry abort, protected-row clearing, no hidden resume and fresh-attempt reset in `tests/integration/importacoes-mms/import-cancellation.test.tsx`

### Implementation for User Story 5

- [X] T060 [US5] Implement `public.cancelar_importacao_mms` with lot lock, scope check, pre-success restriction, idempotent cancelled state, preserved evidence and centralized audit in `supabase/migrations/*_importacao_mms_processamento.sql`
- [X] T061 [P] [US5] Add explicit abort/dispose handling for active TUS uploads and retry timers in `src/modules/importacoes-mms/storage-upload.ts`
- [X] T062 [US5] Implement local cancel versus persisted cancel orchestration, request abortion, session-loss cleanup and fresh-attempt reset in `src/modules/importacoes-mms/import-service.ts` and `src/modules/importacoes-mms/import-machine.ts`
- [X] T063 [US5] Add Cancel/new-attempt controls and truthful cancelled/abandoned/session-expired presentation without exposing stale preview rows in `src/modules/importacoes-mms/pages/NewImportPage.tsx`
- [X] T064 [US5] Make all US5 transaction-wrapped remote SQL and integration tests pass and record verified commands/results at the US5 checkpoint in `specs/006-importacao-mms-processamento/tasks.md`

**Checkpoint**: Cancellation and abandonment are safe at every pre-confirmation
stage and never masquerade as a completed import.

---

## Phase 8: User Story 6 - Compreender o resultado final (Priority: P2)

**Goal**: Present a traceable PT-BR result that distinguishes success, warnings
and failure and reports the exact persisted impact.

**Independent Test**: Complete success, warning, unchanged and failure scenarios
and compare every displayed count/status with `resultado_processamento`.

### Tests for User Story 6

- [X] T065 [P] [US6] Write failing component tests for lot/file/posto/date/status, created/updated/preserved/removed/reactivated/invalid/warning counts, explicit mirror yes/no, warning distinction and safe failure copy in `tests/integration/importacoes-mms/import-result.test.tsx`
- [X] T066 [P] [US6] Write failing service tests that reject malformed/incomplete result payloads and render only the immutable server result in `tests/integration/importacoes-mms/import-service-result.test.ts`

### Implementation for User Story 6

- [X] T067 [P] [US6] Implement the accessible final result card/table with exact server totals, status semantics and explicit mirror update outcome in `src/modules/importacoes-mms/components/ImportResult.tsx` and `src/modules/importacoes-mms/components/ImportResult.css`
- [X] T068 [US6] Implement strict runtime validation/mapping of stored result payloads and safe fallback codes in `src/modules/importacoes-mms/import-service.ts`
- [X] T069 [US6] Integrate success, success-with-warnings and failure states plus Dashboard/fresh-attempt exits in `src/modules/importacoes-mms/pages/NewImportPage.tsx`
- [X] T070 [US6] Make all US6 component and service tests pass and record verified commands/results at the US6 checkpoint in `specs/006-importacao-mms-processamento/tasks.md`

**Checkpoint**: All six stories are independently verifiable and the user can
understand exactly whether and how the mirror changed.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Close performance, accessibility, security, documentation,
advisors and full quickstart evidence across the complete feature.

- [X] T071 [P] Generate deterministic 10.000-row CSV/XLSX performance fixtures and parser timing assertions in `tests/fixtures/mms/performance-10000.csv`, `tests/fixtures/mms/performance-10000.xlsx`, and `tests/unit/importacoes-mms/parser-performance.test.ts`
- [X] T072 Refine desktop layout, responsive overflow, Doka status colors, focus, reduced motion and non-color issue semantics across `src/modules/importacoes-mms/pages/NewImportPage.css`, `src/modules/importacoes-mms/components/FileDropzone.css`, `src/modules/importacoes-mms/components/ValidationSummary.css`, `src/modules/importacoes-mms/components/ImportPreview.css`, and `src/modules/importacoes-mms/components/ImportResult.css`
- [X] T073 Optimize route-level code splitting and parser lazy loading so XLSX/TUS dependencies do not inflate unrelated Auth/Dashboard startup in `src/app/router.tsx`, `src/modules/importacoes-mms/parser/xlsx-parser.ts`, and `vite.config.ts`
- [X] T074 [P] Update repository setup, Storage bucket, environment, test and import workflow documentation without exposing privileged keys in `README.md`, `.env.example`, and `supabase/policies/importacao_mms_processamento.md`
- [X] T075 [P] Extend build-boundary regression tests to reject service-role/secret keys, Edge Function dependency, public bucket URLs and direct staging writes in `tests/integration/build-secrets.test.ts` and `tests/integration/supabase-access-boundary.test.ts`
- [X] T076 Run typecheck, lint, Vitest unit/integration tests, and the production build and record exact results in `specs/006-importacao-mms-processamento/tasks.md`
- [X] T077 Inspect the approved remote Supabase development project, apply the reviewed migration through the approved remote workflow, execute every SQL test file inside `BEGIN`/`ROLLBACK` transactions, and review migrations, advisors, logs, grants, RLS, and function/Storage privileges; record evidence and unresolved environment limits in `specs/006-importacao-mms-processamento/tasks.md`
- [ ] T078 Re-check constitution gates for RLS/profile/posto, soft delete separation, audit, original `raw_json`, complete key, `removido`, desktop-first behavior and Spec 007 exclusions, then record the user-provided manual browser acceptance and final evidence in `specs/006-importacao-mms-processamento/tasks.md`

### Automated validation evidence — 2026-06-28

- `npm test`: 27 test files and 141 tests passed; the script is
  `vitest run` and no browser automation was invoked.
- `npm run typecheck`: passed.
- `npm run lint`: passed with 5 pre-existing Fast Refresh warnings and 0 errors.
- `npm run build`: passed; `NewImportPage`, CSV parser and XLSX parser emitted as lazy chunks.
- PostgreSQL 17 official parser (`libpg-query`, temporary non-persisted tool): migration parsed successfully with 52 statements.
- `npm audit`: 0 vulnerabilities after installing the pinned parser/upload dependencies.
- No Docker command is part of the Spec 006 validation workflow. A diagnostic
  `supabase status` was attempted once, confirmed Docker is unavailable, and
  was not used again.
- No Playwright/Cypress/Selenium/Puppeteer test was added or executed for Spec
  006. The repository's historical `test:e2e` script remains untouched and is
  not called by `npm test`.
- Remote project inspection: `Doka` (`zwxxjbiwpgqjsmaxybbm`) is `ACTIVE_HEALTHY`, PostgreSQL 17.6; existing migrations through Spec 005/assistências are present.
- Migrations `20260628001445_importacao_mms_processamento.sql` and
  `20260628005835_guard_cancelled_mms_analysis.sql` were applied to Doka and
  recorded as applied in the remote migration history.
- All five `importacao_mms_processamento_*.sql` suites passed remotely inside
  `BEGIN`/`ROLLBACK`: structure/RLS/Storage, RPC/cancellation, atomicity,
  result/reimportation, and end-to-end database workflow.
- Effective-state query passed: private bucket; RLS enabled on lots/lines;
  `authenticated` can invoke the narrow start RPC; `anon` cannot; direct
  staging insert and direct internal-processor execution are denied; terminal
  cancellation trigger is active.
- Remote workflow coverage passed for original/normalized separation,
  idempotent confirmation, unique operational effect, identical reimport,
  changed/new/absent/reappearing keys, removal/reactivation counters,
  cancellation idempotency, evidence preservation, and blocked continuation.
- PostgreSQL logs showed the migration/test activity without Spec 006 errors.
  Post-migration advisors reported the six intentional authenticated
  `SECURITY DEFINER` RPCs, newly unused indexes, one unrelated Auth
  leaked-password warning, and pre-existing performance notices. The accepted
  controls and rationale are documented in
  `supabase/policies/importacao_mms_processamento.md`.
- The project had a pre-existing local/remote migration-history divergence for
  migrations before Spec 006. It was not rewritten; both Spec 006 migration
  versions are aligned locally/remotely.
- Automated constitution gates passed for RLS/profile/posto, soft-delete
  separation, audit boundaries, original `raw_json`, complete operational key,
  `removido`/reactivation, desktop-first implementation and Spec 007
  exclusions. T078 remains open only for the user's manual browser acceptance.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 — Setup**: Starts immediately.
- **Phase 2 — Foundational**: Depends on Setup and blocks every story.
- **Phase 3 — US1**: Depends on Foundational.
- **Phase 4 — US2**: Depends on US1 because staging begins after file
  preservation.
- **Phase 5 — US3**: Depends on US2 because confirmation requires an
  authoritative eligible preview.
- **Phase 6 — US4**: Depends on US3 and exercises repeated confirmed imports.
- **Phase 7 — US5**: Depends on US1 for persisted attempts; its database work
  can proceed after Foundational while US2/US3 are developed.
- **Phase 8 — US6**: Depends on US3 for stored processing results.
- **Phase 9 — Polish**: Depends on all stories selected for the release.

### User Story Dependency Graph

```text
Setup -> Foundational -> US1 -> US2 -> US3 -> US4
                         |              |
                         +-> US5        +-> US6

US1                = first independently demonstrable increment
US1 + US2          = safe analysis-only increment
US1 + US2 + US3    = first complete import
US1 + US2 + US3 + US4 = minimum safe operational MMS core
US5 + US6          = complete Spec 006 user experience
```

### Within Each User Story

1. Write tests and confirm the intended missing behavior fails.
2. Implement database contracts before client calls that depend on them.
3. Implement pure parser/state/service behavior before UI integration.
4. Integrate route/page/components.
5. Run the story checkpoint before starting a dependent story.

## Parallel Opportunities

- T002–T005 can run in parallel after dependency choices in T001 are stable.
- T006 and T007 can run in parallel before the foundational implementation.
- US1 parser tests T019–T021 and component test T022 are independent.
- CSV parser T024, XLSX parser T025, uploader T027 and FileDropzone T029 target
  different files after shared types exist.
- US2 tests T033–T035 can be authored concurrently.
- ValidationSummary T039 and ImportPreview T040 can be built concurrently after
  preview types stabilize.
- US3 tests T043–T045 can be authored concurrently.
- US4 tests T053–T054 can be authored concurrently.
- US5 SQL and integration tests T058–T059 can be authored concurrently, and
  T061 does not touch the cancellation RPC.
- US6 tests T065–T066 and component T067 target distinct files.
- T071, T074 and T075 can proceed in parallel before final combined
  validation.

## Parallel Example: User Story 1

```text
Task T019: CSV parser tests in tests/unit/importacoes-mms/csv-parser.test.ts
Task T020: XLSX parser tests in tests/unit/importacoes-mms/xlsx-parser.test.ts
Task T021: Row mapper tests in tests/unit/importacoes-mms/row-mapper.test.ts
Task T022: File selection integration tests in tests/integration/importacoes-mms/file-selection.test.tsx
```

## Parallel Example: User Story 2

```text
Task T033: Validation/preview pgTAP in supabase/tests/importacao_mms_processamento_rpc.sql
Task T034: Chunking/service tests in tests/integration/importacoes-mms/import-service.test.ts
Task T035: Preview component tests in tests/integration/importacoes-mms/import-preview.test.tsx
```

## Parallel Example: User Story 3

```text
Task T043: Atomic confirmation pgTAP in supabase/tests/importacao_mms_processamento_atomicidade.sql
Task T044: raw_json/json_normalizado mirror pgTAP in supabase/tests/importacao_mms_processamento_resultado.sql
Task T045: Confirmation UI integration tests in tests/integration/importacoes-mms/import-confirmation.test.tsx
```

## Parallel Example: User Story 4

```text
Task T053: Reimport pgTAP in supabase/tests/importacao_mms_processamento_resultado.sql
Task T054: Reimport service tests in tests/integration/importacoes-mms/import-reimportation.test.ts
```

## Parallel Example: User Story 5

```text
Task T058: Cancellation pgTAP in supabase/tests/importacao_mms_processamento_rpc.sql
Task T059: Cancellation state/service tests in tests/integration/importacoes-mms/import-cancellation.test.tsx
```

## Parallel Example: User Story 6

```text
Task T065: Result component tests in tests/integration/importacoes-mms/import-result.test.tsx
Task T066: Result service tests in tests/integration/importacoes-mms/import-service-result.test.ts
Task T067: Result component in src/modules/importacoes-mms/components/ImportResult.tsx
```

## Implementation Strategy

### MVP First

1. Complete Phase 1.
2. Complete Phase 2.
3. Complete US1.
4. Stop and validate access, CSV/XLSX selection, parser behavior, private upload
   and no mirror effect.

US1 is the first demonstrable increment. It is not a production import release.

### Minimum Safe Operational Release

1. Complete US2 for authoritative staging/preview.
2. Complete US3 for atomic confirmation.
3. Complete US4 for constitutional same-posto/date idempotency,
   `removido` and reactivation.
4. Stop and validate all P1 stories before operational use.

### Complete Spec 006

1. Add US5 cancellation/abandonment safety.
2. Add US6 truthful final result.
3. Complete performance, accessibility, security, advisors and quickstart.

### Parallel Team Strategy

After Foundational:

- Database developer: RPCs/migration/pgTAP in story order.
- Frontend parser developer: US1 parsers/uploader, then US2 orchestration.
- Frontend UI developer: US1 selector, US2 preview, then US5/US6 components.
- Test developer: Vitest/jsdom fixtures and cross-cutting parser/performance
  checks after each story contract stabilizes.

## Notes

- `[P]` means different target files and no dependency on unfinished work.
- Story labels map directly to `spec.md`.
- Create the migration filename with Supabase CLI; do not invent it.
- Do not expose service role/secret keys, public bucket URLs or direct generic
  staging writes.
- Do not add Edge Functions, `file_hash`, posto equivalence, error editing,
  administrative reprocessing, undo, history list or any Spec 007+ module.
- Preserve original file and `raw_json`; canonical values live only in
  `json_normalizado` and candidate columns.
- Failed or blocked actions never produce success audit.
- Do not require Docker or a local Supabase stack. Execute database validation
  only on the approved remote development project, with each SQL test wrapped
  in `BEGIN`/`ROLLBACK`.
- Do not add or run Playwright, Cypress, Selenium or other browser automation
  for Spec 006. Navigation, responsive layout and browser accessibility are
  accepted manually by the user; historical E2E files from other specs remain
  untouched.
- Commit only logical task groups and preserve unrelated user changes.
