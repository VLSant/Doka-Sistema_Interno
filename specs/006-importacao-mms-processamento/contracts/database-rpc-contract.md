# Contract: Import Workflow Database RPCs

## Shared Security Rules

All public functions:

- require a valid `auth.uid()`;
- resolve exactly one active operational user;
- revalidate active profile, lot ownership and active postos resolved per row;
- derive actor fields instead of accepting actor IDs;
- use explicit, fully qualified relations and fixed/empty `search_path`;
- reject unknown JSON keys and oversized arrays;
- revoke `EXECUTE` from `PUBLIC` and `anon`;
- grant `EXECUTE` only to `authenticated`;
- return stable codes and PT-BR-safe messages without SQL/internal details.

Direct `INSERT`/`UPDATE` grants on staging tables are revoked from
`authenticated`. Authorized reads remain under RLS for preview.

## `public.iniciar_importacao_mms`

### Input

```text
p_nome_origem text
p_extensao text
p_mime_type text
p_tamanho_bytes bigint
p_data_atividade date
p_total_linhas_esperadas integer
```

### Behavior

1. Validate file metadata and limits.
2. Create one multi-posto received lot with status null.
3. Associate the lot with the authenticated importer.
4. Defer authoritative posto resolution to row staging.
5. Reserve immutable bucket/path.
6. Audit `criado`.

### Output

```json
{
  "lote_id": "uuid",
  "bucket": "mms-importacoes",
  "caminho": "<auth_user_id>/<lote_id>/<uuid>.<ext>"
}
```

All three active profiles may reserve the global ingestion lot.

## `public.registrar_arquivo_importacao_mms`

### Input

```text
p_lote_id uuid
```

### Behavior

1. Lock lot.
2. Require received, unconfirmed, non-cancelled lot owned by current actor.
3. Verify reserved object in Storage.
4. Set `arquivo_armazenado_em` and transition to `processando`.
5. Audit `arquivo_armazenado`.

### Output

```json
{ "lote_id": "uuid", "arquivo_armazenado": true }
```

Repeated call after the same verified object is a no-op success.

## `public.registrar_linhas_importacao_mms`

### Input

```text
p_lote_id uuid
p_linhas jsonb
```

`p_linhas` is an array of 1–250 objects:

```json
{
  "numero_linha_origem": 2,
  "raw_json": {
    "Data": "27/06/2026",
    "Área de Trabalho": "Posto A"
  }
}
```

### Behavior

1. Require verified file and processable lot.
2. Validate payload shape and unique row numbers inside the block.
3. For each row, resolve canonical headers/values and one active posto from
   `Área de Trabalho`, without consulting user/post links.
4. Insert line with candidates, `json_normalizado` and final line state.
5. Insert errors/alerts with stable codes.
6. Recalculate totals.
7. Audit a block summary, not one free-form event per field.

### Idempotency

- Existing same lot/row with equal `raw_json`: return as preserved.
- Existing same lot/row with different `raw_json`: reject the full block with
  `linha_duplicada_conflitante`.
- Partial failure rolls back the current block only.

### Output

```json
{
  "lote_id": "uuid",
  "recebidas": 250,
  "criadas": 245,
  "preservadas": 5,
  "total_linhas_atual": 1000
}
```

## `public.concluir_analise_importacao_mms`

### Input

```text
p_lote_id uuid
```

### Behavior

1. Lock lot and revalidate actor/scope/object.
2. Require actual rows = expected rows and every active row final.
3. Detect file-level errors, duplicate identities and inconsistent totals.
4. Recalculate line, assistance and part totals.
5. Set `estado_processamento = validado`.
6. Set official status to `erro`, `importado_com_alertas` or `importado`.
7. Audit `validacao_concluida`.
8. Return authoritative preview.

### Preview Output

```json
{
  "lote_id": "uuid",
  "arquivo": "original.xlsx",
  "postos": [
    { "id": "uuid", "nome": "Posto A" },
    { "id": "uuid", "nome": "Posto B" }
  ],
  "data_atividade": "2026-06-27",
  "status": "importado",
  "total_linhas": 1000,
  "total_assistencias": 800,
  "total_partes": 1000,
  "linhas_validas": 1000,
  "linhas_com_alerta": 0,
  "linhas_invalidas": 0,
  "total_erros": 0,
  "total_alertas": 0,
  "pode_confirmar": true
}
```

The UI fetches paginated error/warning details under existing RLS.

## `public.cancelar_importacao_mms`

### Input

```text
p_lote_id uuid
```

### Behavior

- Lock and revalidate lot/scope.
- Allow only before successful mirror processing.
- Set status `cancelado`, `cancelado_em`, `cancelado_por`.
- Preserve file, rows, errors and warnings.
- Audit `cancelado`.
- Repeated cancellation returns the current cancelled state.

### Output

```json
{ "lote_id": "uuid", "cancelado": true }
```

## `public.confirmar_importacao_mms`

### Input

```text
p_lote_id uuid
```

### Behavior

1. Lock lot with `FOR UPDATE`.
2. If already processed, return the immutable stored result.
3. Revalidate Auth actor, lot ownership, every active posto, object, status, totals, candidates,
   line states and absence of active errors.
4. Record confirmation request.
5. Run `app_private.mms_processar_lote_assistencias` inside protected
   subtransaction.
6. On success, persist result and `espelho_processado_em`.
7. On internal failure, roll back all mirror changes from the subtransaction,
   persist only a safe failure code/timestamp and audit failure.

### Success Output

Uses the result shape from `data-model.md` with `processado = true`.

### Failure Output

```json
{
  "lote_id": "uuid",
  "processado": false,
  "codigo": "falha_processamento",
  "mensagem": "Não foi possível concluir a importação. Tente novamente."
}
```

An ineligible lot returns a stable validation/access error and never enters the
mirror subtransaction.

## Mirror Function Adjustments

`app_private.mms_processar_lote_assistencias`:

- reads canonical data from `json_normalizado`;
- maintains original evidence from `raw_json`;
- counts created, materially updated, preserved, removed and reactivated
  assistances/parts;
- processes every distinct posto in the lot atomically and applies removal only
  inside the posto/date scopes represented by that lot;
- does not emit material-update audit for identical reprocessing;
- remains inaccessible to `anon` and direct ordinary API calls.

## Required SQL Tests

- Every RPC denies anonymous and inactive/ambiguous operational users.
- Profile/posto matrix for all functions.
- Direct staging writes denied while RPC workflow succeeds.
- Row block size/shape and conflict validation.
- Preview totals equal tables.
- Error lot cannot confirm.
- Warning-only complete lot can confirm.
- Concurrent confirmation produces one effect.
- Retry after success returns stored result.
- Injected mirror failure leaves no partial changes and records no success.
- Retry after failure can succeed.
- Cancellation preserves evidence and blocks confirmation.
- Audit actor/context and no secret/free-form payload.
