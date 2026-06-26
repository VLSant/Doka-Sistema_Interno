# Contract: Routes, Navigation and UI States

## Route Matrix

| Route | Label | Profiles | Availability in Spec 005 |
| --- | --- | --- | --- |
| `/app/dashboard` | Dashboard | All official profiles | Available neutral home |
| `/app/ocorrencias` | Ocorrências | All official profiles | Placeholder/disabled |
| `/app/tarefas-rotinas` | Tarefas e Rotinas | All official profiles | Placeholder/disabled |
| `/app/assistencias-mms` | Assistências / MMS | All official profiles | Placeholder/disabled |
| `/app/importacoes-mms` | Importações MMS | All official profiles | Placeholder/disabled |
| `/app/custos-extras` | Custos Extras | All official profiles | Placeholder/disabled |
| `/app/cadastros` | Cadastros | `supervisao`, `direcao_admin` | Placeholder/disabled |
| `/app/historico-auditoria` | Histórico / Auditoria | `supervisao`, `direcao_admin` | Placeholder/disabled |

“All official profiles” means `operador`, `supervisao`, `direcao_admin`.
Entity-specific contracts may be stricter and always prevail.

## Evaluation Order

For every protected route:

1. Confirm authenticated identity.
2. Resolve current operational context.
3. Check profile permission.
4. Check posto requested by route/query parameters, if any.
5. Check module availability.
6. Render the authorized destination.

This order prevents an unauthorized user from learning module availability or
protected resource details.

## Outcomes

| Condition | Outcome |
| --- | --- |
| No valid session | Redirect to `/login` |
| Session expired | Session-expired state, then login |
| Invalid operational context | Configuration-required state |
| Existing route, wrong profile/posto | Access denied |
| Authorized route, unavailable module | Neutral unavailable state |
| Unknown route | Page not found |
| Auth/context unavailable | Temporary failure |

## App Shell

Must show:

- Doka logo.
- Current user name.
- Profile display name.
- Accessible postos or “Escopo global”.
- Profile-adapted menu.
- Logout action.

Must not show:

- Fake KPI cards.
- Fake module records.
- Functional-looking forms for future modules.
- Administrative entries to Operator.
- General audit listing to Operator.

## Menu Contract

- Menu is generated from the same typed route definitions used by the router.
- `hidden`: not rendered.
- `disabled`: rendered with clear “Ainda não disponível” and no link.
- `placeholder`: navigable only after authorization.
- Active state follows current route.
- Disabled state must remain keyboard/screen-reader understandable.

## Required UI States

### Loading session

- No App Shell or protected content.
- Doka-branded progress indication.

### Invalid credentials

- Neutral message at login.
- E-mail may remain; password is cleared.

### Access denied

- Explain lack of permission without exposing resource data.
- Link back to dashboard or allowed destination.

### Operational configuration unavailable

- Explain that access needs administrative regularization.
- Offer logout.

### Session expired

- Explain that a new login is required.
- No protected content behind the state.

### Page not found

- PT-BR 404 state.
- Safe return based on whether the user is authenticated.

### Temporary failure

- No stale content.
- Retry action.
- Logout/login fallback.

### Module unavailable

- Module name and neutral availability message only.
- Safe return to Dashboard.

## Desktop Validation

Primary validation viewport: 1440×900.

Also validate:

- 1280×720 without clipped login or logout actions.
- Keyboard navigation through login, recovery and sidebar.
- Visible focus states from design tokens.
- Labels and error association on form controls.
- Reduced-motion preference for nonessential transitions.
