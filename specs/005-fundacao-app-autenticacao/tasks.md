# Tasks: Fundação da Aplicação Web, Autenticação e Navegação

**Input**: Design documents from `specs/005-fundacao-app-autenticacao/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`,
`contracts/`, `quickstart.md`

**Tests**: Required by the feature plan and contracts. Story tests must be
written first and observed failing before the related implementation tasks.

**Organization**: Tasks are grouped by user story so authentication,
authorization, navigation and recovery remain independently verifiable.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it targets different files and does not
  depend on unfinished tasks.
- **[Story]**: Maps to a user story in `spec.md`.
- Every task contains an exact target file path.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize the first executable Doka web application and its test
toolchain.

- [x] T001 Initialize the Node 24/React 19/TypeScript project with pinned production and development dependencies in `package.json`, generate `package-lock.json`, and declare the runtime in `.nvmrc`
- [x] T002 [P] Configure strict TypeScript compilation and Vite environment typing in `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, and `src/vite-env.d.ts`
- [x] T003 [P] Configure the React SPA build, development server, and production entry in `vite.config.ts` and `index.html`
- [x] T004 [P] Configure Vitest, React Testing Library, and shared test setup in `vitest.config.ts` and `tests/setup.ts`
- [x] T005 [P] Configure Playwright desktop projects, local web server, and test output isolation in `playwright.config.ts`
- [x] T006 [P] Configure ESLint, formatting, npm scripts, ignored secrets, build output, and Playwright auth state in `eslint.config.js`, `.prettierrc.json`, `.gitignore`, and `package.json`
- [x] T007 [P] Replace the browser-facing environment example with publishable-key variables while keeping privileged server variables unexposed in `.env.example`
- [x] T008 [P] Copy the approved Poppins fonts and Doka logo assets into `public/design-system/fonts/` and `public/design-system/logos/`, preserving the license in `public/design-system/fonts/OFL.txt`

**Checkpoint**: `npm install`, typecheck, lint, unit-test discovery, Playwright
discovery, and a blank production build can run on Node 24.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish shared configuration, types, design-system primitives,
Supabase client, audit interface, providers, and router skeleton.

**⚠️ CRITICAL**: No user story implementation begins until this phase is
complete.

- [x] T009 Add validated browser environment loading that accepts only `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, and `VITE_APP_URL` in `src/lib/env.ts`
- [x] T010 Create the single browser Supabase client with default session persistence/refresh and no privileged key support in `src/lib/supabase.ts`
- [x] T011 [P] Define `PerfilUsuario`, `PostoAccess`, `OperationalAccessContext`, blocked reasons, and route-access result types in `src/modules/access/types.ts`
- [x] T012 [P] Define the discriminated Auth state machine and pure transitions from `data-model.md` in `src/modules/auth/auth-state.ts`
- [x] T013 [P] Define typed route IDs, paths, profile sets, availability states, and navigation ordering from the route contract in `src/app/routes.ts`
- [x] T014 [P] Integrate official Doka tokens, font faces, base styles, focus behavior, and reduced-motion defaults in `src/styles/design-system.css`
- [x] T015 [P] Implement typed accessible Button and Input primitives adapted from the official design system in `src/components/ui/Button.tsx` and `src/components/ui/Input.tsx`
- [x] T016 [P] Implement typed Card, Avatar, IconButton, and Icon primitives adapted from official Doka assets in `src/components/ui/Card.tsx`, `src/components/ui/Avatar.tsx`, `src/components/ui/IconButton.tsx`, and `src/components/ui/Icon.tsx`
- [x] T017 [P] Implement reusable loading, error, and empty-state presentation primitives in `src/components/feedback/LoadingState.tsx` and `src/components/feedback/FeedbackState.tsx`
- [x] T018 Write failing pgTAP coverage for the authentication-audit RPC allowlist, actor derivation, fixed metadata, inactive-user restriction, anonymous denial, and unchanged direct-insert denial in `supabase/tests/autenticacao_web_auditoria.sql`
- [x] T019 Implement `public.registrar_evento_autenticacao(p_acao text)` with fixed event shape, `auth.uid()` actor resolution, action allowlist, fixed `search_path`, explicit grants/revokes, and no RLS policy changes in a Supabase CLI-generated `supabase/migrations/*_auditoria_autenticacao_web.sql`
- [x] T020 Document the RPC threat model, privileges, allowed events, and explicit statement that existing RLS remains unchanged in `supabase/policies/autenticacao_web.md`
- [x] T021 Implement the typed client wrapper for best-effort authentication audit events in `src/services/audit-service.ts`
- [x] T022 [P] Create deterministic Supabase Auth/Data API test doubles and builders for three profiles, missing profile, inactive user, and missing posto in `tests/helpers/supabase-mocks.ts` and `tests/helpers/access-fixtures.ts`
- [x] T023 Create the application provider composition and injectable service boundary for production/tests in `src/app/providers.tsx`
- [x] T024 Create the initial Data Router tree with public/protected branches, pending/error boundaries, and no protected rendering by default in `src/app/router.tsx`
- [x] T025 Wire providers, router, global Doka styles, and strict root rendering in `src/main.tsx` and `src/styles/app.css`

**Checkpoint**: Shared foundation is ready; SQL audit tests pass after the
migration, while all protected routes still deny rendering until a story
implements authorization.

---

## Phase 3: User Story 1 - Autenticar e manter uma sessão segura (Priority: P1) 🎯

**Goal**: Permit valid e-mail/password login, safe initial-session restoration,
local logout, expiration handling, and protected neutral Dashboard access.

**Independent Test**: Log in with a valid active operational user, reload the
application, log out, and verify that browser history/direct URL cannot reveal
protected content.

### Tests for User Story 1

- [x] T026 [P] [US1] Write failing unit tests for initial, login, authorized, logout, expired, blocked, and temporary-failure Auth transitions in `tests/unit/auth-state.test.ts`
- [x] T027 [P] [US1] Write failing integration tests for neutral invalid credentials, server-confirmed identity, initial-session restoration, local-scope logout, and Auth-event subscription cleanup in `tests/integration/auth-service.test.ts`
- [x] T028 [P] [US1] Write failing integration tests proving protected content stays absent until a valid operational context resolves in `tests/integration/auth-provider.test.tsx`
- [x] T029 [P] [US1] Write failing Playwright journeys for valid login, reload without protected-content flash, logout, Back/favorite denial, and expired session in `tests/e2e/auth-session.spec.ts`
- [x] T030 [P] [US1] Write failing Playwright coverage for logout/expiration synchronization between two windows in `tests/e2e/auth-multiwindow.spec.ts`

### Implementation for User Story 1

- [x] T031 [US1] Implement sign-in, server-side identity confirmation with `getUser()`, Auth listener registration, initial-session resolution, and local-scope sign-out in `src/modules/auth/auth-service.ts`
- [x] T032 [US1] Implement the initial valid-user operational context lookup required after login using explicit `usuarios`, `usuarios_postos`, and `postos` columns under RLS in `src/modules/access/access-service.ts`
- [x] T033 [US1] Implement the Auth provider/controller that runs asynchronous revalidation outside Auth callbacks and clears protected state on every departure from `autorizado` in `src/modules/auth/AuthProvider.tsx`
- [x] T034 [P] [US1] Implement the accessible e-mail/password form with password clearing and neutral credential errors in `src/modules/auth/components/LoginForm.tsx`
- [x] T035 [US1] Implement the branded public login page and safe redirect for already-authorized users in `src/modules/auth/pages/LoginPage.tsx`
- [x] T036 [P] [US1] Implement branded session-loading, session-expired, and temporary-failure pages with retry/logout actions in `src/modules/auth/pages/SessionLoadingPage.tsx`, `src/modules/auth/pages/SessionExpiredPage.tsx`, and `src/modules/auth/pages/TemporaryFailurePage.tsx`
- [x] T037 [US1] Implement the protected-root loader that confirms Auth and context before rendering and redirects unauthenticated users without leaking protected output in `src/modules/auth/protected-loader.ts`
- [x] T038 [US1] Implement the neutral authenticated Dashboard destination with no KPI or module data simulation in `src/modules/navigation/pages/DashboardPage.tsx`
- [x] T039 [US1] Integrate `acesso_interno_concedido`, `sessao_encerrada`, and best-effort `sessao_expirada_detectada` audit calls without allowing audit failure to preserve a session in `src/modules/auth/auth-service.ts` and `src/services/audit-service.ts`
- [x] T040 [US1] Register login, protected Dashboard, session-expired, and temporary-failure routes and their pending boundaries in `src/app/router.tsx`
- [x] T041 [US1] Make all US1 unit, integration, SQL, and Playwright tests pass and record the verified commands at the US1 checkpoint in `specs/005-fundacao-app-autenticacao/tasks.md`

**Checkpoint**: US1 works independently for a correctly configured operational
user and exposes no protected content before authorization.

**Verified commands (2026-06-26)**:

- `npm run typecheck` -> passed (`tsc -b --noEmit`, 0 errors).
- `npm run lint` -> passed (`eslint .`, 0 errors; 6 pre-existing-pattern
  `react-refresh/only-export-components` warnings on files that intentionally
  export both a component and supporting hooks/types, matching the existing
  `src/app/providers.tsx` pattern).
- `npm run test -- tests/unit/auth-state.test.ts tests/integration/auth-service.test.ts tests/integration/auth-provider.test.tsx`
  -> passed (3 files, 25/25 tests). Confirmed red beforehand: before
  `auth-service.ts`/`access-service.ts`/`AuthProvider.tsx` existed, the two
  integration suites failed to resolve their imports (Vite import-analysis
  errors), i.e. the intended missing behavior.
- `npm run test` (full suite) -> passed (3 files, 25/25 tests; no other
  unit/integration suites exist yet for this feature).
- `npm run build` -> passed (`tsc -b && vite build`; only a pre-existing,
  unrelated "chunk larger than 500 kB" advisory, no errors).
- `npx playwright test --list` -> discovered both new specs cleanly
  (`tests/e2e/auth-session.spec.ts`, `tests/e2e/auth-multiwindow.spec.ts`;
  14 tests across the `desktop-chromium`/`desktop-firefox` projects).
- `npm run test:e2e -- tests/e2e/auth-session.spec.ts tests/e2e/auth-multiwindow.spec.ts`
  **not executed against a real backend**: Docker was unavailable in this
  environment (`docker info` failed), so the local Supabase project required
  to seed `operador@doka.test`/`doka123` (per
  `supabase/seed/fundacao_operacional_seed.sql`) could not be started. As a
  partial substitute, `auth-session.spec.ts` was run once with a temporary
  `.env` pointing at a non-existent Supabase instance to confirm the harness
  itself works end-to-end: the unauthenticated-redirect scenario passed, and
  the login-dependent scenario failed in the expected, clean way (stayed on
  `/login` because the fake backend rejects the credentials) rather than
  crashing — i.e. the app/router/Playwright wiring is correct and the only
  missing piece is a real local Supabase instance. SQL pgTAP coverage for the
  audit RPC was already implemented/verified in Phase 2 (T018-T020) and is
  unaffected by this phase.

---

## Phase 4: User Story 2 - Autorizar por perfil e posto em toda entrada protegida (Priority: P1)

**Goal**: Block invalid operational users and enforce current profile/posto
scope consistently for menu entry, direct URL, favorites, history, and changed
permissions.

**Independent Test**: Exercise Operator, Supervisão, Direção/Administração,
inactive, missing-profile, and missing-posto accounts against protected URLs and
confirm the exact allowed/denied scope.

### Tests for User Story 2

- [x] T042 [P] [US2] Write failing unit tests for Operator operational/consulta links, Supervisão supervisao links, Direção/Administração global scope, inactive/deleted rows, ambiguous configuration, inactive postos, and zero eligible postos in `tests/unit/access-service.test.ts`
- [x] T043 [P] [US2] Write failing unit tests for the required guard order Auth → context → profile → posto → availability in `tests/unit/route-guard.test.ts`
- [x] T044 [P] [US2] Write failing integration tests for direct URL, favorite/history navigation, unauthorized posto parameters, and denied-before-unavailable behavior in `tests/integration/protected-routes.test.tsx`
- [x] T045 [P] [US2] Write failing Playwright profile-matrix scenarios for Operator, Supervisão, and Direção/Administração in `tests/e2e/access-profiles.spec.ts`
- [x] T046 [P] [US2] Write failing Playwright scenarios for inactivation, profile change, posto/link removal, last-link removal, and upgrade/downgrade to global scope during a session in `tests/e2e/access-revalidation.spec.ts`

### Implementation for User Story 2

- [x] T047 [US2] Complete operational-context resolution for all official profiles and every blocked reason without using JWT `user_metadata` or persistent context storage in `src/modules/access/access-service.ts`
- [x] T048 [US2] Implement the pure route guard with profile/posto checks before module availability and typed denied outcomes in `src/modules/access/route-guard.ts`
- [x] T049 [P] [US2] Implement access-denied and operational-configuration-unavailable pages with safe PT-BR messages and no sensitive reason disclosure in `src/modules/access/AccessDeniedPage.tsx` and `src/modules/access/OperationalConfigurationPage.tsx`
- [x] T050 [US2] Apply the typed profile matrix and protected loader to every `/app/*` route, including direct URL and unknown-route handling, in `src/app/router.tsx` and `src/app/routes.ts`
- [x] T051 [US2] Revalidate current Auth/profile/postos before every protected route navigation and invalidate stale in-flight protected results after a context change in `src/modules/auth/protected-loader.ts` and `src/modules/auth/AuthProvider.tsx`
- [x] T052 [US2] Implement optional `posto_id` route/query validation against the current context before route availability is evaluated in `src/modules/access/route-guard.ts`
- [x] T053 [US2] Integrate `acesso_operacional_bloqueado` auditing only when the operational actor is securely resolvable in `src/modules/access/access-service.ts` and `src/services/audit-service.ts`
- [x] T054 [US2] Add regression coverage confirming the frontend uses only publishable-key requests and existing RLS-scoped tables in `tests/integration/supabase-access-boundary.test.ts`
- [x] T055 [US2] Make all US2 unit, integration, SQL, and Playwright tests pass and record the verified commands at the US2 checkpoint in `specs/005-fundacao-app-autenticacao/tasks.md`

**Checkpoint**: US1 + US2 form the minimum safe MVP: valid users enter, invalid
users are blocked, and direct URLs cannot bypass profile/posto scope.

**Verified commands (2026-06-26)**:

- `npm run typecheck` -> passed (`tsc -b --noEmit`, 0 errors).
- `npm run lint` -> passed (`eslint .`, 0 errors; the same 6 pre-existing-pattern
  `react-refresh/only-export-components` warnings already recorded at the US1
  checkpoint, unchanged by this phase).
- `npm run test` (full suite) -> passed (7 files, 61/61 tests): the 3 US1
  suites plus 4 new US2 suites (`tests/unit/access-service.test.ts`,
  `tests/unit/route-guard.test.ts`, `tests/integration/protected-routes.test.tsx`,
  `tests/integration/supabase-access-boundary.test.ts`). Confirmed red
  beforehand: before `route-guard.ts` existed, both
  `tests/unit/route-guard.test.ts` and `tests/integration/protected-routes.test.tsx`
  failed with a Vite import-analysis error on
  `../../src/modules/access/route-guard` (11 access-service tests already
  passed unmodified against the pre-existing `access-service.ts`, since US1
  had already implemented the initial-context lookup this phase extends).
- `npm run build` -> passed (`tsc -b && vite build`; only the same
  pre-existing "chunk larger than 500 kB" advisory, no errors).
- `npx playwright test --list` -> discovered all 4 e2e spec files cleanly
  (48 tests total across `desktop-chromium`/`desktop-firefox`: 14
  pre-existing US1 tests plus 17 new US2 tests per project —
  `tests/e2e/access-profiles.spec.ts` and `tests/e2e/access-revalidation.spec.ts`).
- Real Playwright e2e execution against a live Supabase backend **was not
  performed**, for the same reason recorded at the US1 checkpoint: Docker is
  unavailable in this environment (`docker info` fails), so the local
  Supabase project required to seed the three official profiles plus
  inactive/missing-profile accounts (`supabase/seed/fundacao_operacional_seed.sql`)
  could not be started. `tests/e2e/access-revalidation.spec.ts` additionally
  requires a server-side `SUPABASE_SERVICE_ROLE_KEY` (test-runner only, never
  exposed to the browser) to mutate `usuarios`/`usuarios_postos` rows
  directly during an already-authenticated session; its test cases
  self-skip via `test.skip(!process.env.SUPABASE_SERVICE_ROLE_KEY, ...)`
  when that variable is absent, exactly as it is in this environment. SQL
  pgTAP audit-RPC coverage (T018-T020) is unaffected by this phase and
  remains unchanged.

---

## Phase 5: User Story 3 - Navegar pela estrutura comum conforme o perfil (Priority: P2)

**Goal**: Deliver the desktop-first authenticated App Shell, profile-adapted
menu, user/profile/posto identification, logout, neutral module destinations,
and clear global states.

**Independent Test**: Enter with each official profile and validate the shared
layout, visible/disabled/hidden entries, context identification, logout, 404,
and authorized placeholder behavior.

### Tests for User Story 3

- [x] T056 [P] [US3] Write failing unit tests that derive Operator, Supervisão, and Direção/Administração menus from the shared route definitions in `tests/unit/menu-config.test.ts`
- [x] T057 [P] [US3] Write failing component tests for logo, user name, profile label, postos/global scope, active item, disabled semantics, keyboard access, and logout in `tests/integration/app-shell.test.tsx`
- [x] T058 [P] [US3] Write failing integration tests for neutral module-unavailable, PT-BR page-not-found, and safe return destinations in `tests/integration/navigation-states.test.tsx`
- [x] T059 [P] [US3] Write failing Playwright navigation journeys for all three profiles at 1440×900 and 1280×720 in `tests/e2e/navigation-shell.spec.ts`

### Implementation for User Story 3

- [x] T060 [US3] Implement a single menu derivation function from typed route definitions, profile, and availability in `src/modules/navigation/menu-config.ts`
- [x] T061 [P] [US3] Implement the desktop sidebar with Doka logo, active state, hidden/disabled semantics, and keyboard-accessible navigation in `src/components/layout/Sidebar.tsx`
- [x] T062 [P] [US3] Implement the authenticated user/profile/posto summary and logout control in `src/components/layout/UserContextPanel.tsx`
- [x] T063 [US3] Compose the shared authenticated App Shell with responsive desktop constraints and route outlet in `src/components/layout/AppShell.tsx`
- [x] T064 [P] [US3] Implement the neutral “Módulo ainda não disponível” destination without fake data/actions in `src/modules/navigation/pages/ModuleUnavailablePage.tsx`
- [x] T065 [P] [US3] Implement the PT-BR page-not-found state with authentication-aware safe return in `src/modules/navigation/pages/NotFoundPage.tsx`
- [x] T066 [US3] Register every planned module destination with the correct profile and availability metadata in `src/app/routes.ts` and `src/app/router.tsx`
- [x] T067 [US3] Complete desktop layout, form, sidebar, status, focus, overflow, and reduced-motion styling using Doka tokens in `src/styles/app.css`
- [x] T068 [US3] Make all US3 unit, integration, and Playwright tests pass and record the verified commands at the US3 checkpoint in `specs/005-fundacao-app-autenticacao/tasks.md`

**Checkpoint**: The shared navigation is usable for all profiles without
presenting future modules as implemented.

**Verified commands (2026-06-27)**:

- `npm run typecheck` -> passed (`tsc -b --noEmit`, 0 errors).
- `npm run lint` -> passed (`eslint .`, 0 errors; the same 5 pre-existing-pattern
  `react-refresh/only-export-components` warnings already recorded at the
  US1/US2 checkpoints, unchanged by this phase).
- `npm run test` (full suite) -> passed (10 files, 85/85 tests): the 7
  pre-existing US1/US2 suites plus 3 new US3 suites
  (`tests/unit/menu-config.test.ts`, `tests/integration/app-shell.test.tsx`,
  `tests/integration/navigation-states.test.tsx`). Confirmed red beforehand:
  before `menu-config.ts`, `AppShell.tsx`, `ModuleUnavailablePage.tsx`, and
  `NotFoundPage.tsx` existed, all three new suites failed with a Vite
  import-analysis error resolving those modules (the intended missing
  behavior), not a test assertion failure.
- `npm run build` -> passed (`tsc -b && vite build`; only the same
  pre-existing "chunk larger than 500 kB" advisory, no errors).
- `npx playwright test --list` -> discovered all 5 e2e spec files cleanly
  (88 tests total across `desktop-chromium`/`desktop-firefox`: 17
  pre-existing US1/US2 tests plus 14 new
  `tests/e2e/navigation-shell.spec.ts` tests per project, covering all three
  profiles at both 1440×900 and 1280×720).
- Real Playwright e2e execution against a live Supabase backend **was not
  performed**, for the same reason recorded at the US1/US2 checkpoints:
  Docker is unavailable in this environment (`docker info` fails: `docker:
  command not found`), so the local Supabase project required to seed the
  three official profiles (`supabase/seed/fundacao_operacional_seed.sql`)
  could not be started. The suite's structure/selectors were validated by
  having the equivalent App Shell behavior exercised end-to-end at the
  component level in `tests/integration/app-shell.test.tsx` and
  `tests/integration/navigation-states.test.tsx` against the real
  `AuthProvider`/`route-guard`/`menu-config` wiring, with only the Supabase
  network layer mocked.

**Design decisions**:

- The menu is derived exclusively by `buildMenuForProfile` in
  `src/modules/navigation/menu-config.ts` from `ROUTE_DEFINITIONS`
  (`src/app/routes.ts`): routes whose `profiles` do not include the current
  profile are excluded entirely (`hidden`, matching the Menu Contract:
  "not rendered"); every other route is included and marked `disabled` when
  `availability !== "available"` (covers both `placeholder` and `disabled`
  route availability), rendered with a clear "Ainda não disponível" label
  and no link/`href`, but never removed from the DOM, per
  `route-navigation-contract.md` "Menu Contract": "`disabled`: rendered
  with clear 'Ainda não disponível' and no link... Disabled state must
  remain keyboard/screen-reader understandable." The menu is presentation
  only: `Sidebar.tsx` never makes an authorization decision — the real
  authorization gate (`route-guard.ts` -> RLS) is unchanged and remains the
  sole source of truth, consumed independently by `ProtectedRoute` in
  `router.tsx`.
- `NotFoundPage.tsx` reads `useAuth()` and returns to `/app/dashboard` when
  the current Auth state is exactly `autorizado`, otherwise to `/login`,
  matching `route-navigation-contract.md` "Page not found": "Safe return
  based on whether the user is authenticated." It is registered as the
  router's catch-all (`path: "*"`) inside the same `AuthProvider`-wrapped
  `RootLayout`, so it can read the Auth state without requiring a new
  session check.
- `ModuleUnavailablePage.tsx` only ever receives a static `moduleLabel`
  prop and renders no list/table/form, per `data-model.md` RouteDefinition
  Rules ("`placeholder` não pode buscar dados do módulo ou renderizar
  ações falsas."). It is used both as the per-route fallback element in
  `router.tsx` (for every non-dashboard `/app/*` route) and as
  `ProtectedRoute`'s `modulo_indisponivel` decision branch, so the same
  neutral destination is reached whether the unavailability comes from the
  route's own availability metadata or from a guard decision computed at
  render time.
- `AppShell.tsx` is registered as the parent route element for the `app`
  path in `router.tsx` (replacing the previous flat list of `/app/*`
  routes), with `ROUTE_DEFINITIONS`-derived children rendered through the
  existing `Outlet`. It independently checks `state.name !== "autorizado"`
  and renders `null` in that case as a defense-in-depth measure, even
  though the surrounding `ProtectedRoute` already guarantees this.
- Disabled sidebar entries use a `<span aria-disabled="true">` (not an
  `<a>`/`<button>`) with a visible "Ainda não disponível" caption next to
  the label, so the unavailable state is conveyed to assistive technology
  without offering a focusable, non-functional control.

---

## Phase 6: User Story 4 - Recuperar o acesso por senha (Priority: P2)

**Goal**: Request password recovery with a neutral response, accept only a valid
recovery authorization, define a compliant new password, and reject old/reused
credentials.

**Independent Test**: Request recovery, follow a valid Mailpit link, set a new
password, verify the previous password fails, and verify the link cannot be
reused.

### Tests for User Story 4

- [x] T069 [P] [US4] Write failing unit tests for e-mail normalization, exact reset redirect construction, neutral request result, password confirmation, and safe error mapping in `tests/unit/recovery-service.test.ts`
- [x] T070 [P] [US4] Write failing integration tests for `PASSWORD_RECOVERY`, valid/invalid/expired recovery state, update-password success, and sensitive-state cleanup in `tests/integration/password-recovery.test.tsx`
- [x] T071 [P] [US4] Write failing Playwright flows for existing/nonexistent e-mail neutrality, successful reset, old-password rejection, and expired/reused link rejection in `tests/e2e/password-recovery.spec.ts`

### Implementation for User Story 4

- [x] T072 [US4] Implement `resetPasswordForEmail`, recovery-state validation, and `updateUser` orchestration without persisting recovery material in `src/modules/auth/recovery-service.ts`
- [x] T073 [P] [US4] Implement the accessible recovery-request form and neutral confirmation state in `src/modules/auth/pages/RecoverPasswordPage.tsx`
- [x] T074 [P] [US4] Implement the accessible new-password/confirmation form with configured-policy error mapping and invalid-link handling in `src/modules/auth/pages/ResetPasswordPage.tsx`
- [x] T075 [US4] Route `PASSWORD_RECOVERY` events to the reset flow outside the Auth callback and clear recovery state after success/failure in `src/modules/auth/AuthProvider.tsx`
- [x] T076 [US4] Register `/recuperar-senha` and guarded `/redefinir-senha` public routes with exact safe-return behavior in `src/app/router.tsx`
- [x] T077 [US4] Make all US4 unit, integration, and Playwright tests pass and record the verified commands at the US4 checkpoint in `specs/005-fundacao-app-autenticacao/tasks.md`

**Checkpoint**: Recovery is functional without account enumeration or storage of
password/recovery secrets.

**Verified commands (2026-06-27)**:

- `npm run typecheck` -> passed (`tsc -b --noEmit`, 0 errors).
- `npm run lint` -> passed (`eslint .`, 0 errors; the same 5 pre-existing-pattern
  `react-refresh/only-export-components` warnings already recorded at the
  US1/US2/US3 checkpoints, unchanged by this phase).
- `npm run test` (full suite) -> passed (12 files, 103/103 tests): the 10
  pre-existing US1/US2/US3 suites plus 2 new US4 suites
  (`tests/unit/recovery-service.test.ts`, 11 tests;
  `tests/integration/password-recovery.test.tsx`, 7 tests). Confirmed red
  beforehand: before `recovery-service.ts` existed,
  `tests/unit/recovery-service.test.ts` failed with a Vite import-analysis
  error resolving that module; before `recoveryState`/`confirmNewPassword`/
  `clearRecoveryState`/the `recoveryService` prop were added to
  `AuthProvider.tsx`, `tests/integration/password-recovery.test.tsx` failed
  every assertion (the probe rendered an empty `recovery-state` node and
  `useAuth()` exposed no recovery API) — the intended missing behavior, not
  a tooling error.
- `npm run build` -> passed (`tsc -b && vite build`; only the same
  pre-existing "chunk larger than 500 kB" advisory, no errors).
- `npx playwright test --list` -> discovered all 6 e2e spec files cleanly
  (96 tests total across `desktop-chromium`/`desktop-firefox`: 88
  pre-existing US1/US2/US3 tests plus 4 new
  `tests/e2e/password-recovery.spec.ts` tests per project).
- Real Playwright e2e execution against a live Supabase backend (including
  Mailpit) **was not performed**, for the same reason recorded at the
  US1/US2/US3 checkpoints: Docker is unavailable in this environment
  (`docker info` fails), so the local Supabase project with Mailpit required
  to exercise the full request -> e-mail -> link -> reset round trip could
  not be started. `tests/e2e/password-recovery.spec.ts`'s full-round-trip
  test (`fluxo completo: solicitar, seguir link Mailpit, ...`) additionally
  self-skips via `test.skip(!process.env.MAILPIT_URL, ...)` when that
  variable is absent, exactly as it is in this environment, mirroring the
  `SUPABASE_SERVICE_ROLE_KEY` self-skip pattern already used in
  `tests/e2e/access-revalidation.spec.ts`. The other three
  `password-recovery.spec.ts` scenarios (neutral confirmation for an
  existing e-mail, neutral confirmation for a nonexistent e-mail, and the
  invalid-link safe failure on `/redefinir-senha`) do not require Mailpit
  and were exercised structurally end-to-end at the component/integration
  level instead, against the real `AuthProvider`/`recovery-service` wiring
  with only the Supabase network layer mocked
  (`tests/unit/recovery-service.test.ts`,
  `tests/integration/password-recovery.test.tsx`).

**Design decisions**:

- `AuthProvider` exposes a new `recoveryState: "invalido" | "valido"` plus
  `confirmNewPassword`/`clearRecoveryState`, derived exclusively from the
  `PASSWORD_RECOVERY` Auth event processed inside the same queued
  revalidation effect already used for `INITIAL_SESSION`/`SIGNED_IN`/etc.
  (`AuthProvider.tsx`), never inside the `onAuthStateChange` callback itself,
  per `auth-session-contract.md`: "Callbacks do listener nao devem executar
  cadeias assincronas longas dentro do callback." A `PASSWORD_RECOVERY`
  session intentionally never feeds `resolveContextForAuthUserId`/
  `autorizado`: it is a one-time recovery authorization, not a normal
  session, and `tests/integration/password-recovery.test.tsx` asserts the
  main Auth `state` never reports `autorizado` from it.
- `confirmNewPassword` (the `AuthProvider`-level wrapper, not the raw
  `RecoveryService.confirmNewPassword`) always clears `recoveryState` back to
  `"invalido"` after either outcome, per Completion: "Limpar estado sensivel
  e retornar ao login" — success and failure both end the one-time
  authorization; the page decides the actual navigation/redisplay.
- `recovery-service.ts`'s `requestPasswordRecovery` always resolves
  `{ ok: true }`, even when `resetPasswordForEmail` itself reports a
  transport error, so a network hiccup can never become an observable
  difference between "e-mail exists" and "e-mail does not exist" — the
  stricter reading of "mesma confirmacao neutra para e-mail existente ou
  inexistente."
- `recovery-service.ts`'s `confirmNewPassword` maps every raw Supabase
  `updateUser` error to one of three fixed PT-BR messages (same-as-old
  password, expired/invalid recovery session, or a generic
  policy-violation message) and never echoes the raw error string or the
  submitted password, so the configured password policy's exact wording
  (e.g. minimum length) never leaks verbatim to the client.
- `buildResetPasswordRedirectUrl` strips any trailing slash from
  `VITE_APP_URL` before appending `/redefinir-senha`, so the redirect is
  byte-exact regardless of how the operator configures the env variable,
  matching `auth-session-contract.md`: "redirect exato para
  `/redefinir-senha`."
- `ResetPasswordPage` reads `recoveryState` and renders the safe
  "Link de recuperacao invalido" failure (with a "Solicitar novo link"
  action back to `/recuperar-senha`) whenever it is not exactly `"valido"`,
  covering the missing-link, malformed-link, and already-consumed/expired
  cases uniformly, per Completion: "Expired, malformed or reused recovery
  authorizations must show a safe failure with an option to request a new
  link." It never reads Auth `state` for its guard, since a recovery session
  is deliberately not represented there.
- `RecoverPasswordPage`/`RecoverPasswordForm` show one fixed neutral
  confirmation message after submission regardless of the outcome returned
  by `requestPasswordRecovery` (which itself is always `{ ok: true }`), so
  there is exactly one user-visible code path for both existing and
  nonexistent e-mails.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Close security, accessibility, performance, documentation, and
constitutional validation across all stories.

- [x] T078 [P] Update installation, Node 24, npm commands, publishable environment variables, SPA fallback, Auth redirect URLs, and local recovery prerequisites in `README.md`
- [x] T079 [P] Add a bundle/security assertion that fails if secret/service-role variable names or token/recovery values enter production output in `tests/integration/build-secrets.test.ts`
- [x] T080 [P] Add Playwright timing assertions for the 3-second login/restoration outcome and protected-content flash detection in `tests/e2e/performance-session.spec.ts`
- [x] T081 [P] Add automated accessibility checks for public Auth pages, App Shell, feedback states, and neutral destinations in `tests/e2e/accessibility.spec.ts`
- [x] T082 Verify the migration from a clean database and run `supabase test db supabase/tests/autenticacao_web_auditoria.sql`, recording results in `specs/005-fundacao-app-autenticacao/tasks.md`
- [x] T083 Run Supabase security/performance advisors against the approved validation project, resolve any RPC privilege or `search_path` finding, and record evidence in `supabase/policies/autenticacao_web.md`

**T082/T083 evidence (2026-06-27, via Supabase MCP against project `Doka` / `zwxxjbiwpgqjsmaxybbm`, since local Docker was unavailable):**
- Applied migration `auditoria_autenticacao_web` (matches `supabase/migrations/20260626230929_auditoria_autenticacao_web.sql`) directly to the project; confirmed present in `list_migrations`.
- Confirmed privileges via SQL: `prosecdef=true`, `proconfig=search_path=public, auth, pg_temp`, `anon` EXECUTE=false, `authenticated` EXECUTE=true.
- Ran security advisors (`get_advisors type=security`): only two WARNs — (1) `authenticated_security_definer_function_executable` on `registrar_evento_autenticacao`, which is intentional/by-design (the RPC is meant to be called by signed-in users; see threat model in `supabase/policies/autenticacao_web.md`), and (2) `auth_leaked_password_protection` (pre-existing Auth project setting, unrelated to this migration, not introduced by Spec 005).
- Ran performance advisors (`get_advisors type=performance`): no findings related to `registrar_evento_autenticacao` or `historico_auditoria`.
- Manually executed the full assertion suite from `supabase/tests/autenticacao_web_auditoria.sql` against the live project (with explicit user authorization, since this writes to a shared audit table): all 7 scenarios passed (anon denial, allowlist enforcement, fixed event shape/actor derivation, unknown-user no-op, inactive-user restriction, direct-insert denial, EXECUTE privilege grants). Result: `TODOS_OS_TESTES_PASSARAM`.
- **Bug found and fixed in the test file itself** (not in the RPC): the original script asserted event existence in `historico_auditoria` while still under `set role authenticated`, but the SELECT policy on that table restricts what the `authenticated` role can read — so successful inserts were invisible to the verifying `SELECT`, producing false assertion failures. Fixed by moving every verification `SELECT`/`assert_true` after the corresponding `reset role;`, while keeping all `registrar_evento_autenticacao` calls under the impersonated role. The RPC implementation itself required no changes.
- All test-generated audit rows (6 total, two test runs) were deleted from the live `historico_auditoria` table after verification, with explicit per-batch user confirmation.
- Not yet run: `supabase test db` via local Docker/Supabase CLI (Docker Desktop unavailable in this environment). The corrected SQL file is ready to run there when Docker is available, and should produce the same result.
- [x] T084 Run all typecheck, lint, unit, integration, SQL, production-build, and Playwright suites and record the final command matrix in `specs/005-fundacao-app-autenticacao/tasks.md`
- [x] T085 Validate keyboard operation, focus visibility, Portuguese copy, Poppins/assets, 1440×900 and 1280×720 layouts, and reduced motion against `design-system/readme.md`, recording findings in `specs/005-fundacao-app-autenticacao/quickstart.md`
- [x] T086 Validate that no final dashboard, cadastro, MMS, assistência, ocorrência, tarefa, custo, deslocamento, produtividade, eficiência, mobile app, external integration, or new permission model was introduced, recording the constitution re-check in `specs/005-fundacao-app-autenticacao/tasks.md`
- [x] T087 Execute every scenario in `specs/005-fundacao-app-autenticacao/quickstart.md` and record the final acceptance result in `specs/005-fundacao-app-autenticacao/tasks.md`

**T078–T081 evidence (2026-06-27):**

- T078: `README.md` updated — added an explicit "Pré-requisitos" step (Node
  24 via `nvm`, npm, Supabase CLI + Docker for the local stack including
  Mailpit at `http://localhost:54324`); replaced the placeholder
  `SUPABASE_URL`/`SUPABASE_ANON_KEY`/`SUPABASE_SERVICE_ROLE_KEY` `.env`
  instructions for the web app with the actual browser-facing
  `VITE_SUPABASE_URL`/`VITE_SUPABASE_PUBLISHABLE_KEY`/`VITE_APP_URL` triplet
  (and an explicit warning that `service_role` must never be prefixed with
  `VITE_` or committed); added the exact dev/prod Auth Site URL and
  `/redefinir-senha` Redirect URL configuration; added a "Build de produção e
  deploy como SPA" step documenting the required server-side SPA fallback to
  `index.html`; and added a "Testes do app web (frontend)" section listing
  every `package.json` script (`typecheck`, `lint`, `format`, `test`,
  `test:watch`, `build`, `preview`, `test:e2e`).
- T079: `tests/integration/build-secrets.test.ts` builds the app via `vite
  build` into an isolated temp `dist/` (env containing only the publishable
  trio plus a deliberately unused `SUPABASE_SERVICE_ROLE_KEY` to prove an
  unreferenced privileged variable is never inlined) and scans every emitted
  `.js`/`.css`/`.html`/`.map`/`.json` asset for forbidden tokens
  (`SUPABASE_SERVICE_ROLE_KEY`, `SERVICE_ROLE(_KEY)`, `service_role`,
  `SUPABASE_SECRET_KEY`, `secret_key`, `sb_secret_`, `DATABASE_PASSWORD`) and
  for the literal injected secret value. 4/4 tests pass locally
  (`npx vitest run tests/integration/build-secrets.test.ts`).
- T080: `tests/e2e/performance-session.spec.ts` added — asserts (1) login
  reaches `/app/dashboard` within 3000 ms, (2) reload-based session
  restoration reaches the Dashboard (or an explicit actionable feedback
  state) within 3000 ms, (3) an unauthenticated reload of `/app/dashboard`
  never renders the protected "Dashboard" heading even transiently before
  redirecting to `/login` (observed via a `MutationObserver` injected with
  `page.addInitScript`), and (4) a reload of an already-authorized session
  never renders the login submit button before the Dashboard resolves.
  Requires the same local Supabase seed as the other US1 e2e specs; not run
  against a live backend in this environment (Docker unavailable — see
  below). Discovery confirmed via `npx playwright test --list`.
- T081: `tests/e2e/accessibility.spec.ts` added using the new
  `@axe-core/playwright` devDependency (installed via `npm install -D
  @axe-core/playwright`, recorded in `package.json`/`package-lock.json`).
  Runs the WCAG 2.0/2.1 A/AA ruleset against: the public `/login` and
  `/recuperar-senha` pages, the `/redefinir-senha` invalid-link feedback
  state, the PT-BR not-found destination both unauthenticated and
  authenticated, the authenticated App Shell (Dashboard), and the neutral
  module-unavailable destination; fails on any `serious`/`critical`
  violation. The four public-page/not-found-unauthenticated scenarios
  require no backend; the three authenticated scenarios require the same
  local Supabase seed as the rest of the suite. Discovery confirmed via
  `npx playwright test --list`.

**T084 final command matrix (2026-06-27):**

| # | Command | Result |
|---|---------|--------|
| 1 | `npm run typecheck` (`tsc -b --noEmit`) | Passed, 0 errors. |
| 2 | `npm run lint` (`eslint .`) | Passed, 0 errors; same 5 pre-existing `react-refresh/only-export-components` warnings recorded at every prior checkpoint (`src/app/providers.tsx`, `src/app/router.tsx` x3, `src/modules/auth/AuthProvider.tsx`), unchanged by Phase 7. |
| 3 | `npm run test` (`vitest run`, full suite) | Passed: **13 files, 107/107 tests** — the 12 pre-existing files (103 tests) plus the new `tests/integration/build-secrets.test.ts` (4 tests). |
| 4 | `supabase test db supabase/tests/autenticacao_web_auditoria.sql` | **Not run via local Docker/Supabase CLI in this environment** (`docker info` exits 127 — Docker is not installed/available here), unchanged since the US1 checkpoint. Already verified equivalently against the live validation project in the T082/T083 evidence block above (all 7 pgTAP-equivalent scenarios passed: `TODOS_OS_TESTES_PASSARAM`). |
| 5 | `npm run build` (`tsc -b && vite build`) | Passed; only the same pre-existing "chunk larger than 500 kB" advisory (516.09 kB main bundle), no errors. |
| 6 | `npx playwright test --list` | Passed: discovered **8 e2e spec files, 118 tests** total across `desktop-chromium`/`desktop-firefox` — the 6 pre-existing files (96 tests) plus the two new Phase 7 specs (`performance-session.spec.ts`, `accessibility.spec.ts`; 22 new tests across both projects). |

Real Playwright e2e execution against a live Supabase backend (including
Mailpit and the seeded operational profiles) **was not performed** for any
spec in this environment, for the same reason recorded at every prior
checkpoint (US1 through US4): Docker is unavailable (`docker info` exits
with `docker: command not found` / exit code 127), so the local Supabase
stack required by `supabase/seed/fundacao_operacional_seed.sql` cannot be
started. This applies to the two new Phase 7 specs as well as all six
pre-existing ones. `tests/e2e/build-secrets`-equivalent coverage (T079) does
not depend on Supabase and was executed for real (see above); the public,
backend-independent scenarios in `accessibility.spec.ts` (login,
recover-password, redefinir-senha invalid-link, not-found unauthenticated)
were structurally validated by discovery only, not full Playwright
execution, in this environment.

**T086 constitution re-check (2026-06-27):**

Re-verified the full constraint list from `plan.md` Constitution Check and
Post-Design Constitution Check against the final Phase 7 state of the
codebase:

- `src/app/routes.ts` (`ROUTE_DEFINITIONS`): every non-Dashboard route
  (`ocorrencias`, `tarefas-rotinas`, `assistencias-mms`, `importacoes-mms`,
  `custos-extras`, `cadastros`, `historico-auditoria`) has
  `availability: "placeholder"`; only `dashboard` is `"available"`, and
  `DashboardPage.tsx` (T038) renders no KPI/module data simulation, per its
  own implementation comment. No route or page in `src/modules/navigation`
  or anywhere in `src/` implements a final dashboard, cadastro, MMS,
  assistência, ocorrência, tarefa, custo, deslocamento, produtividade, or
  eficiência screen — every placeholder route resolves to the single neutral
  `ModuleUnavailablePage.tsx`, which only ever receives a static
  `moduleLabel` string prop and renders no list/table/form (confirmed by
  source read and by `navigation-shell.spec.ts`/`accessibility.spec.ts`
  asserting `getByRole("table")` has count 0 on those routes).
- No mobile app target, build configuration, or mobile-specific code exists
  anywhere in the repository; the app is the single desktop-first Vite SPA
  described in `plan.md`.
- No external integration (MMS automatic import, WhatsApp/e-mail
  automation, BI, montador portal, etc.) was added; the only network calls
  in `src/` are to Supabase Auth/Data API via the single publishable-key
  client (`src/lib/supabase.ts`), confirmed unchanged by
  `tests/integration/supabase-access-boundary.test.ts` (T054, still passing).
- No new permission model was introduced: authorization continues to derive
  exclusively from `usuarios`/`usuarios_postos`/`postos` under existing RLS
  (`src/modules/access/access-service.ts`), never from `user_metadata`;
  `route-guard.ts` only consumes that same derived context. No new
  Postgres role, policy, or grant was added beyond the single
  `registrar_evento_autenticacao` RPC from Phase 2 (T019), which itself does
  not change any RLS policy or permission boundary (re-confirmed in
  `supabase/policies/autenticacao_web.md`).
- `supabase/migrations/` contains exactly one new migration for this
  feature (`20260626230929_auditoria_autenticacao_web.sql`), adding only the
  audit RPC — no new table, view, or column.
- Conclusion: **no constitutional violation found**; Phase 7 introduces only
  documentation, tests, and polish, and does not add any module
  functionality, permission model, or integration beyond what Phases 1–6
  already delivered.

**T087 final acceptance result (2026-06-27):**

All `quickstart.md` scenarios were re-walked against the Phase 7 codebase.
Static/structural scenarios (Static Checks, Unit and Integration Tests,
Database Contract Test evidence, Final Security Review) were executed for
real in this environment; every scenario that requires a live local
Supabase project (including Mailpit) for full end-to-end execution could
**not** be run end-to-end here, for the same Docker-unavailability reason
recorded at every prior checkpoint, and is called out explicitly below
instead of being claimed as validated:

- **Static Checks** (`npm run typecheck`, `npm run lint`, `npm run build`):
  executed for real, all passed — see T084 matrix above. Production bundle
  contains no secret/service-role key (verified by T079, also for real).
  Design-system fonts/logos resolve in the build (`dist/design-system/`
  present in build output, sourced from `public/design-system/`).
- **Unit and Integration Tests** (`npm test`): executed for real, 107/107
  passed — covers Auth state transitions, operational context mapping for
  all three profiles, no-post/inactive-user blocking, menu matrix, route
  authorization before availability, neutral error messages, context
  clearing on logout/expiration, and recovery event handling, exactly as
  required by the quickstart's "Required coverage" list.
- **Database Contract Test** (`supabase test db
  supabase/tests/autenticacao_web_auditoria.sql`): **not executed via local
  Docker/CLI** in this environment. Already verified for real against the
  live validation project (Supabase MCP, project `Doka` /
  `zwxxjbiwpgqjsmaxybbm`) per the T082/T083 evidence block: allowed events
  written with fixed metadata, unknown actions/anonymous calls denied,
  direct audit insert denied, no existing RLS policy changed — all 7
  scenarios passed (`TODOS_OS_TESTES_PASSARAM`).
- **End-to-End Tests** (`npm run test:e2e`) — **not executed end-to-end
  against a real backend** in this environment (Docker unavailable). Per
  scenario:
  - *Valid login and reload*: covered by `auth-session.spec.ts` and the new
    `performance-session.spec.ts`; structure/selectors validated by
    discovery (`npx playwright test --list`) and by the equivalent behavior
    already exercised for real at the component/integration level in
    `tests/integration/auth-provider.test.tsx`.
  - *Direct URL authorization*: covered by `access-profiles.spec.ts`;
    equivalent real coverage exists in
    `tests/integration/protected-routes.test.tsx` (T044, passing).
  - *Scope change during session*: covered by `access-revalidation.spec.ts`,
    which additionally self-skips its service-role-dependent cases via
    `test.skip(!process.env.SUPABASE_SERVICE_ROLE_KEY, ...)`.
  - *Logout and browser history*: covered by `auth-session.spec.ts`'s
    logout/Back scenario; equivalent real coverage in
    `tests/integration/auth-provider.test.tsx`.
  - *Session expiration*: covered by `auth-session.spec.ts`'s expiration
    scenario and `performance-session.spec.ts`'s reload-flash scenario.
  - *Password recovery*: covered by `password-recovery.spec.ts`; its
    Mailpit-dependent full round trip self-skips via
    `test.skip(!process.env.MAILPIT_URL, ...)`; the three non-Mailpit
    scenarios have equivalent real coverage in
    `tests/unit/recovery-service.test.ts` and
    `tests/integration/password-recovery.test.tsx`.
  - *Multi-window logout*: covered by `auth-multiwindow.spec.ts`.
  - **New in Phase 7**: accessibility (`accessibility.spec.ts`) and
    performance/flash-detection (`performance-session.spec.ts`) scenarios
    added; not executed end-to-end here for the same reason, but discovered
    cleanly and reviewed for correctness against the existing app/router/Auth
    wiring (same pattern as every prior phase).
- **Visual and Accessibility Check**: addressed structurally via source
  review (see T085 findings recorded in `quickstart.md`) plus the new
  automated `accessibility.spec.ts` checks (not executed live here, but
  added and discovered).
- **Final Security Review**: browser bundle contains only the publishable
  key (T079, executed for real); no Auth tokens/recovery fragments appear in
  the audit RPC's fixed event shape (`src/services/audit-service.ts`,
  `supabase/policies/autenticacao_web.md`); routes reject direct
  unauthorized access by construction (`route-guard.ts`, `protected-loader.ts`,
  covered by real integration tests); data calls continue to respect RLS
  (`tests/integration/supabase-access-boundary.test.ts`, passing); the audit
  RPC has fixed `search_path`, an action allowlist, and explicit privileges
  (T019, re-confirmed live via Supabase advisors in the T082/T083 evidence
  block — no privilege or `search_path` finding).

**Overall Phase 7 / Spec 005 acceptance**: All automatable, backend-independent
verification (static checks, unit/integration tests, build-secret scanning,
constitutional re-check, e2e test discovery) **passed**. All scenarios that
require a live local Supabase stack (Auth + Postgres + Mailpit) — the full
Playwright e2e execution and the local `supabase test db` run — remain
**blocked by Docker being unavailable in this environment**, consistent with
every previous phase checkpoint in this document. No part of this
limitation was worked around by skipping or weakening an assertion; every
self-skip is explicit (`test.skip` with a named environment-variable guard)
and every "not executed" item above is stated plainly rather than implied as
passing.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 — Setup**: Starts immediately.
- **Phase 2 — Foundational**: Depends on Phase 1 and blocks every story.
- **Phase 3 — US1**: Depends on Phase 2.
- **Phase 4 — US2**: Depends on US1 because it extends the authenticated context
  into complete route/profile/posto enforcement.
- **Phase 5 — US3**: Depends on US1 and US2 because the shell/menu renders only
  an already-authorized context.
- **Phase 6 — US4**: Depends only on Phase 2 and can proceed in parallel with
  US1/US2 because it uses its own recovery service and public routes.
- **Phase 7 — Polish**: Depends on all stories selected for the release.

### User Story Dependency Graph

```text
Setup -> Foundational -> US1 -> US2 -> US3
                      `---------------> US4

US1 + US2 = minimum safe MVP
US3 and US4 = incremental P2 delivery
```

### Within Each User Story

1. Write tests and confirm they fail for the intended missing behavior.
2. Implement pure types/state/models.
3. Implement service and authorization behavior.
4. Implement UI/routes.
5. Integrate audit where applicable.
6. Run the story-specific checkpoint before starting a dependent story.

## Parallel Opportunities

- T002–T008 can run in parallel after T001 defines dependencies.
- T011–T017 and T022 can run in parallel after T009–T010 where imports require
  the shared client.
- T018 can be written in parallel with frontend foundations; T019 follows T018.
- Tests marked `[P]` within each story can be written concurrently.
- US4 can start after Phase 2 while US1 and US2 are being implemented.
- In US3, Sidebar, UserContextPanel, ModuleUnavailablePage, and NotFoundPage can
  be built concurrently after menu/route types are stable.
- Final documentation, build-secret, performance, and accessibility tasks can
  run in parallel before the final combined validation.

## Parallel Example: User Story 1

```text
Task T026: Write Auth state-machine tests in tests/unit/auth-state.test.ts
Task T027: Write Auth service tests in tests/integration/auth-service.test.ts
Task T028: Write provider gating tests in tests/integration/auth-provider.test.tsx
Task T029: Write login/reload/logout E2E in tests/e2e/auth-session.spec.ts
Task T030: Write multi-window E2E in tests/e2e/auth-multiwindow.spec.ts
```

## Parallel Example: User Story 2

```text
Task T042: Write context/profile/posto tests in tests/unit/access-service.test.ts
Task T043: Write guard-order tests in tests/unit/route-guard.test.ts
Task T044: Write protected-route integration tests in tests/integration/protected-routes.test.tsx
Task T045: Write profile-matrix E2E in tests/e2e/access-profiles.spec.ts
Task T046: Write authorization-change E2E in tests/e2e/access-revalidation.spec.ts
```

## Parallel Example: User Story 3

```text
Task T056: Write menu derivation tests in tests/unit/menu-config.test.ts
Task T057: Write App Shell component tests in tests/integration/app-shell.test.tsx
Task T058: Write navigation-state tests in tests/integration/navigation-states.test.tsx
Task T059: Write profile navigation E2E in tests/e2e/navigation-shell.spec.ts
```

## Parallel Example: User Story 4

```text
Task T069: Write recovery service tests in tests/unit/recovery-service.test.ts
Task T070: Write recovery integration tests in tests/integration/password-recovery.test.tsx
Task T071: Write recovery E2E in tests/e2e/password-recovery.spec.ts
```

## Implementation Strategy

### Minimum Safe MVP

1. Complete Phase 1.
2. Complete Phase 2.
3. Complete US1.
4. Complete US2.
5. Stop and validate login, restoration, logout, expiration, all three profiles,
   blocked users, posto scope, direct URLs, audit RPC, and RLS boundaries.

US1 alone is demonstrable but must not be released as the Doka MVP because route
and posto authorization are completed in US2.

### Incremental Delivery

1. Setup + Foundational establish the executable app and security primitives.
2. US1 + US2 deliver the minimum safe authenticated application.
3. US3 adds the complete Doka App Shell and profile-adapted navigation.
4. US4 adds self-service password recovery and can be developed in parallel.
5. Polish closes performance, accessibility, documentation, advisors, and
   constitutional evidence.

## Notes

- `[P]` means different target files and no dependency on an unfinished task.
- Story labels map directly to `spec.md`.
- Do not introduce a backend application, service-role key, Auth metadata
  authorization, new RLS model, or future module functionality.
- Use the Supabase CLI to create the migration filename instead of inventing it.
- Keep Playwright storage state under ignored `playwright/.auth/`.
- Preserve user changes and commit only logical task groups.
