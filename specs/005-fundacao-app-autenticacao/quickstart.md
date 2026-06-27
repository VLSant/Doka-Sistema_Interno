# Quickstart: Validar Fundação Web, Autenticação e Navegação

## Purpose

Executar os cenários end-to-end da Spec 005 após a implementação. Este guia não
substitui os contratos em `contracts/`.

## Prerequisites

- Node.js 24 LTS.
- npm incluído com o runtime.
- Supabase CLI disponível.
- Projeto Supabase de desenvolvimento com migrations das Specs 001–004.
- E-mail/senha habilitado no Supabase Auth.
- URL local e URL de produção configuradas na allowlist de redirects.
- Mailpit local ou entrega de e-mail configurada no projeto para recuperação.

O Node local encontrado durante o planejamento foi `v20.11.1`, abaixo do mínimo
do Vite 8. Atualize para Node 24 antes de instalar ou executar o frontend.

## Environment

Criar `.env.local` sem versioná-lo:

```env
VITE_SUPABASE_URL=https://PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_REPLACE_ME
VITE_APP_URL=http://localhost:5173
```

Do not expose:

```text
SUPABASE_SECRET_KEY
SUPABASE_SERVICE_ROLE_KEY
database password
```

## Auth URL Configuration

Development:

```text
Site URL: http://localhost:5173
Redirect URL: http://localhost:5173/redefinir-senha
```

Production must use the exact HTTPS origin and reset path. Avoid wildcard
redirects in production.

## Install and Run

```powershell
npm install
npm run dev
```

Expected local URL:

```text
http://localhost:5173
```

## Validation Data

Prepare disposable Auth users and matching operational records:

1. Operador linked only to Posto A with `nivel_acesso = operacional`.
2. Supervisão linked to Postos A/B with `nivel_acesso = supervisao`.
3. Direção/Administração without `usuarios_postos`.
4. Auth user without `usuarios`.
5. Inactive operational user.
6. Operator without an active posto.

Never commit test passwords or Playwright storage state.

## Static Checks

```powershell
npm run typecheck
npm run lint
npm run build
```

Expected:

- No TypeScript or lint errors.
- Production bundle contains no secret/service-role key.
- Design-system fonts and logos resolve in the built app.

## Unit and Integration Tests

```powershell
npm test
```

Required coverage:

- Auth state transitions.
- Operational context mapping for all three profiles.
- No-post and inactive-user blocking.
- Menu matrix.
- Route authorization before availability.
- Neutral error messages.
- Clearing context on logout/expiration.
- Recovery event handling.

## Database Contract Test

Discover the installed CLI commands before running:

```powershell
supabase --help
supabase test --help
```

With the local stack or approved development validation target available:

```powershell
supabase test db supabase/tests/autenticacao_web_auditoria.sql
```

Expected:

- Allowed events are written with fixed metadata.
- Unknown actions and anonymous calls fail.
- Direct audit insert remains denied.
- No existing RLS policy changes.

## End-to-End Tests

```powershell
npm run test:e2e
```

Required scenarios:

### Valid login and reload

1. Log in as Operador.
2. Confirm name, profile and Posto A.
3. Reload `/app/dashboard`.
4. Confirm no protected content flashes before resolution.

### Direct URL authorization

1. As Operador, open `/app/cadastros` directly.
2. Expect Access Denied.
3. As Direção/Administração, open the same URL.
4. Expect only the neutral unavailable destination.

### Scope change during session

1. Log in as Supervisão with Postos A/B.
2. Remove the Posto B link using an authorized test fixture.
3. Navigate to another protected route.
4. Confirm Posto B disappears before the route renders.
5. Remove the last eligible link and confirm access is blocked.

### Logout and browser history

1. Log in and open Dashboard.
2. Log out.
3. Use browser Back and open a protected favorite.
4. Confirm login is required and protected content is absent.

### Session expiration

1. Start in an authorized route.
2. Invalidate the test session.
3. Trigger a protected navigation.
4. Confirm session-expired state and immediate context cleanup.

### Password recovery

1. Request recovery for an existing and a nonexistent email.
2. Confirm both requests show the same neutral response.
3. Open the valid local Mailpit link.
4. Set a new accepted password.
5. Confirm old password fails and new password succeeds.
6. Reuse the link and confirm it is rejected.

### Multi-window logout

1. Open two windows with the same local session.
2. Log out in one.
3. Confirm the other removes protected content when the Auth event is observed
   or at its next protected interaction.

## Visual and Accessibility Check

Validate at 1440×900 and 1280×720:

- Login and recovery use Doka logo, Poppins and official colors.
- Focus is visible.
- Form fields have labels and associated errors.
- Sidebar, profile, postos and logout remain reachable.
- Disabled module items communicate “Ainda não disponível”.
- No fake module data appears.

## T085 Findings (2026-06-27): Visual/Accessibility Validation Against the Design System

Validated by reading the implemented CSS/components against
`design-system/readme.md`, `design-system/tokens/*`, and the contracts in
`contracts/route-navigation-contract.md`. Live browser capture with a real
authenticated session was **not** performed in this environment (no local
Supabase/Mailpit available — see the T084/T087 evidence in `tasks.md`); the
findings below are a structural/code-level validation, called out explicitly
as such rather than claimed as a live visual capture.

- **Keyboard operation**: `Sidebar.tsx` renders enabled entries as real
  `NavLink` anchors (focusable, `Enter`-activatable by default) and disabled
  entries as `<span aria-disabled="true">` with no `tabIndex`/`href`, so
  unavailable items are correctly excluded from the Tab sequence instead of
  being a focusable dead end (`src/components/layout/Sidebar.tsx`). Forms
  (`Button.tsx`/`Input.tsx` in `src/components/ui/`) reuse native
  `<button>`/`<input>` elements, preserving default keyboard semantics.
- **Focus visibility**: a single global `:focus-visible` rule in
  `src/styles/design-system.css` (`outline: none; box-shadow: var(--ring);`)
  applies to every interactive element app-wide — there is no component that
  removes `outline` without providing this replacement, so focus remains
  visible for keyboard users on links, buttons, and form fields throughout
  Auth pages, the App Shell, and feedback states.
- **Portuguese copy**: every page/component read in `src/modules/auth/pages`,
  `src/modules/navigation/pages`, `src/modules/access`, `src/components/layout`,
  and `src/app/routes.ts` (route `label`s) uses PT-BR text exclusively
  ("Entrar", "Sair", "Ainda não disponível", "Página não encontrada",
  "Dashboard", "Cadastros", "Histórico / Auditoria", etc.); no English UI
  string was found in the reviewed source.
- **Poppins/assets**: `src/styles/design-system.css` declares `@font-face`
  for all 8 official Poppins weights/styles, self-hosted from
  `/design-system/fonts/*.ttf` (copied from `design-system/assets/fonts/poppins/`
  into `public/design-system/fonts/` in Setup, T008); `--font-sans`/
  `--font-display` resolve to `"Poppins", ...` and are the only font stack
  used by `body`/headings. The production build (`npm run build`) emits
  `dist/design-system/fonts/*` and `dist/design-system/logos/*` verified
  present after the Phase 7 build, confirming the fonts/logo assets resolve
  in the built app, not just in dev.
- **1440×900 / 1280×720 layouts**: `AppShell.css` sets `min-width: 1280px`
  on `.doka-app-shell` (matching the global `body { min-width: 1280px;
  overflow-x: auto; }` rule in `src/styles/app.css`) and a fixed
  `--sidebar-w: 248px` sidebar column, so the App Shell never clips its two
  columns at either validation viewport; `tests/e2e/navigation-shell.spec.ts`
  (T059) already encodes both exact viewports (1440×900, 1280×720) per
  profile as Playwright assertions for visible logo/profile/logout/menu
  items without truncation — not executed live here (Docker unavailable),
  but the CSS constraints back the same claim structurally.
- **Reduced motion**: `src/styles/design-system.css` includes a global
  `@media (prefers-reduced-motion: reduce)` block forcing
  `animation-duration`/`transition-duration` to `0.001ms` and
  `scroll-behavior: auto` on every element (`*, *::before, *::after`), so all
  transition-based affordances (sidebar hover, focus ring transition, button
  press) degrade safely for users who request reduced motion, app-wide,
  with no component opting out of this default.
- **Manual acceptance update (2026-06-27)**: the user executed and approved
  the requested live-browser checklist for login/session restoration,
  logout/direct URL, all three profiles, unavailable module, blocked users,
  not-found, password recovery, visual layout and keyboard operation. This
  replaces the earlier structural-only limitation for T085. Automated
  Mailpit, service-role permission mutation, local pgTAP and the 3-second
  deployment performance budget remain separate environment-dependent
  checks, as recorded in `tasks.md`.

## Final Security Review

- Browser bundle contains only the publishable key.
- No Auth tokens or recovery fragments appear in logs/audit.
- Routes reject direct unauthorized access.
- Data calls continue to respect RLS.
- New RPC has fixed `search_path`, action allowlist and explicit privileges.
- Run Supabase security advisors against the validation project before closing
  implementation.
