# Contract: Nova Importação MMS UI Workflow

## Route

`/app/importacoes-mms` becomes available for all official profiles and renders
the Nova Importação MMS workflow. It remains inside the existing App Shell and
`ProtectedRoute`.

The menu visibility matrix from Spec 005 does not change.

## Screen Regions

- Title and concise instruction.
- File selection/drop area.
- Progress/state region announced to assistive technology.
- Identified file/posto/date summary.
- Validation totals.
- Paginated errors and warnings.
- Explicit Confirm and Cancel actions.
- Final result summary.

No lot history list, error editor or undo action appears.

## State Machine

### `idle`

- File input accepts `.csv,.xlsx`.
- No protected import data shown.

### `parsing`

- File metadata/content is checked locally.
- Cancel selection is available.
- Confirm is absent.

### `uploading`

- Lot/path has been reserved.
- Show percent and retrying state.
- A different file cannot replace the current attempt.

### `staging`

- Show current area, partition index and overall progress.
- Confirm is disabled.
- Session/context revalidation failure clears protected preview.

### `preview_ready`

- Show one authoritative database preview per identified area.
- Report auxiliary export rows ignored from staging.
- Confirm appears only when every preview has `pode_confirmar = true`.
- Invalid lot offers Cancel and select-a-corrected-file guidance, not editing.

### `confirming`

- Disable repeated action in UI.
- Keep an accessible progress announcement.
- Server idempotency remains authoritative.

### `success` / `success_with_warnings`

- Render the stored database result.
- Provide safe return to Dashboard and a new-attempt action.

### `cancelled`

- State that the mirror was not changed.
- Allow starting a fresh attempt.

### `session_expired`, `access_denied`, `failure`

- Reuse Spec 005 states where applicable.
- Never leave previous protected rows visible.
- Failure after confirmation explicitly states whether mirror processing
  completed; unknown/partial success wording is forbidden.

## Validation Summary

Must show:

- selected file;
- identified posto/date;
- total rows;
- main assistances;
- parts;
- valid rows;
- valid rows with warning;
- invalid rows;
- blocking errors;
- warnings;
- confirmation eligibility.

Errors and warnings are textual and icon-supported; color alone is insufficient.

## Confirmation

- Requires a deliberate button action after preview.
- Confirmation text names all postos, date and impact on each current mirror.
- Explain that absent records may become `removido`.
- All areas remain in one persisted lot; the UI performs one atomic
  confirmation and shows one aggregated result.
- Revalidation failure returns to a safe state.
- Double click is prevented locally but correctness relies on server lock/result.

## Result

Show:

- lot, filename, posto, date and final status;
- created, updated, preserved, removed and reactivated totals;
- invalid/warning totals;
- explicit `Espelho atualizado` yes/no.

Use server totals exactly. Do not infer success from HTTP 2xx alone.

## Design and Accessibility

- Reuse Doka `Button`, `Card`, feedback/loading patterns and tokens.
- Poppins only; orange primary CTA; purple used as depth/secondary.
- Rounded controls/cards and official status colors.
- Desktop layout optimized for 1440×900 and usable at 1280×720.
- Keyboard-operable file input and buttons.
- Visible focus and associated labels/errors.
- `aria-live` for progress/result without excessive row-by-row announcements.
- Respect reduced motion.
- All user-facing copy in PT-BR.

## Session and Navigation

- Protected loader revalidates before route render.
- Service revalidates current context before start and confirmation.
- Auth loss aborts pending requests/upload and clears local parsed rows.
- Browser back/refresh cannot auto-confirm.
- Refresh during an incomplete attempt does not resume a hidden draft in this
  feature; it presents a fresh screen while the prior attempt remains auditable.

## Required Tests

- Component rendering for file selection, progress, preview, confirmation,
  cancellation and result using Vitest/jsdom.
- Every state and allowed transition.
- Invalid/alert/valid previews.
- Confirmation description and removal warning.
- Double-click and retry.
- Session expiry during parsing/upload/staging/confirmation.
- Cancel before/after upload.
- Result counts and no false success.

## Manual Acceptance

The user validates without browser automation:

- route/menu and direct URL for all three profiles;
- click, keyboard and drag/drop file selection;
- visual layout at 1440×900 and 1280×720;
- visible focus, reduced motion and screen-reader announcements;
- navigation back to Dashboard and fresh-attempt flow;
- complete valid, warning, invalid, cancellation and result journeys.
