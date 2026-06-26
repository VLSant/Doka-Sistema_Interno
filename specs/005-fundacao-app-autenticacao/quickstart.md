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

## Final Security Review

- Browser bundle contains only the publishable key.
- No Auth tokens or recovery fragments appear in logs/audit.
- Routes reject direct unauthorized access.
- Data calls continue to respect RLS.
- New RPC has fixed `search_path`, action allowlist and explicit privileges.
- Run Supabase security advisors against the validation project before closing
  implementation.
