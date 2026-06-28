# Contract: MMS Original File Storage

## Bucket

```text
id: mms-importacoes
public: false
file_size_limit: 26214400
```

Allowed MIME types:

- `text/csv`
- `application/csv`
- `application/vnd.ms-excel`
- `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

The bucket is created/configured by migration. It is never public.

## Object Path

```text
<auth_user_id>/<lote_id>/<random_uuid>.<csv|xlsx>
```

- The original filename is stored on the lot, not trusted as an object path.
- Each attempt gets a fresh random object name.
- `upsert` is always false.
- Move, overwrite and delete are outside this feature.

## Upload

- Use TUS resumable upload with direct Storage hostname.
- Chunk size is 6 MiB.
- Forward the current access token only as a Storage credential.
- Do not use the token for client-side authorization decisions.
- Show progress and retry transient failures.
- An expired session aborts the upload and clears protected UI state.
- A completed upload must be registered with the database before staging starts.

## Storage RLS

### Insert

Allowed only when:

- role is `authenticated`;
- `bucket_id = 'mms-importacoes'`;
- `owner_id = auth.uid()`;
- first folder equals `auth.uid()`;
- second folder is a UUID of an existing received lot;
- the lot belongs to the current operational actor;
- the lot is not cancelled, processed or soft-deleted;
- path, extension and planned metadata equal the reservation on the lot.

### Select

Allowed only when:

- role is `authenticated`;
- `bucket_id = 'mms-importacoes'`;
- the lot extracted from the second folder is accessible by
  `app_private.mms_lote_acessivel`;
- the lot is not soft-deleted for ordinary operational access.

### Update and Delete

Denied to `authenticated` in this feature. A future retention/admin workflow
must be separately specified.

## Object Verification

The database accepts `arquivo_armazenado_em` only if `storage.objects` contains
the reserved object and:

- bucket/path match;
- owner matches `auth.uid()`;
- size matches `tamanho_arquivo_bytes`;
- MIME/extension match an approved pair.

The object check is repeated at confirmation. Missing or mismatched objects make
the lot ineligible.

## Privacy and Exposure

- No public URL is generated.
- Signed download URL is outside the Nova Importação flow.
- Bucket listing is not granted broadly.
- File contents, JWTs and signed URLs never enter audit metadata.
- The browser never uses service role or secret key.

## Failure and Cancellation

- Upload failure leaves a received/incomplete lot that cannot be analyzed or
  confirmed.
- Cancellation preserves an already uploaded object as audit evidence.
- A reserved path with no completed object is harmless and remains ineligible.
- The feature does not garbage-collect abandoned reservations; retention is a
  future administrative concern.

## Required Tests

- Anonymous insert/select denied.
- Authenticated user cannot upload outside their reserved path.
- Operador and Supervisão can upload only the multi-posto lot they reserved.
- Importers cannot read/upload another user's multi-posto lot.
- Direção/Administração can review every authorized lot but cannot overwrite.
- MIME, extension, size and owner mismatch blocked.
- Second upload to same path fails.
- Cancelled/processed lot rejects upload.
- Ordinary user cannot update, move or delete object.
