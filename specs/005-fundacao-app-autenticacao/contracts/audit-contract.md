# Contract: Web Authentication Audit

## Purpose

Registrar eventos compatíveis de autenticação sem conceder inserção direta em
`historico_auditoria` e sem armazenar segredos.

## RPC

```text
public.registrar_evento_autenticacao(p_acao text) returns void
```

## Allowed Actions

| Action | When |
| --- | --- |
| `acesso_interno_concedido` | Auth and operational context were validated |
| `sessao_encerrada` | User requested logout, before revocation |
| `sessao_expirada_detectada` | Expiration detected while actor can still be securely resolved |
| `acesso_operacional_bloqueado` | Valid Auth identity maps to an identifiable operational user that is blocked |

Any other action must be rejected.

## Actor Resolution

1. Require `auth.uid()` not null.
2. Locate operational rows by `auth_user_id = auth.uid()` and
   `deleted_at is null`.
3. Zero rows: return without success event.
4. More than one row: raise controlled ambiguity error; write nothing.
5. Exactly one row: use its `id` as `entidade_id` and `usuario_id`.

The function may identify an inactive non-deleted operational user only for
`acesso_operacional_bloqueado`. Other actions require an active user.

## Fixed Event Shape

```text
entidade_tipo: usuarios
entidade_id: resolved usuarios.id
acao: allowed p_acao
valor_anterior: null
valor_novo: null
metadata:
  origem: aplicacao_web
  contrato: spec_005
usuario_id: resolved usuarios.id
created_at: database timestamp
```

No metadata is accepted from the browser.

## Function Security

- `SECURITY DEFINER` is justified only because ordinary authenticated users
  cannot insert into `historico_auditoria`.
- Fixed `search_path` includes only required schemas plus `pg_temp`.
- Owner must be a migration-controlled role.
- `REVOKE ALL ... FROM PUBLIC`.
- `REVOKE ALL ... FROM anon`.
- `GRANT EXECUTE ... TO authenticated`.
- Explicit Data API exposure/grant is required.
- No dynamic SQL.
- No user-supplied entity, actor, metadata or values.
- Existing RLS policies and table grants remain unchanged.

## Client Behavior

- Audit failure never grants access.
- Login audit occurs only after operational context succeeds.
- Block audit occurs only after Auth succeeds and the RPC can safely resolve the
  operational user.
- Logout attempts audit before `signOut`, but always clears the session even if
  audit fails.
- Expiration audit is best-effort; never use an expired token, queued secret or
  privileged key to force it.
- Invalid credentials are not written as success events.

## Forbidden Content

The RPC and client must never write:

- Password or previous password.
- Access/refresh token.
- Recovery token, code, verifier or URL fragment.
- Publishable or secret API key.
- Raw Auth error payload containing sensitive internals.
- Browser storage snapshot.
- Free-form metadata from the caller.

## Required SQL Tests

- Anonymous call is denied.
- Authenticated user with active operational record can write each allowed
  applicable action.
- Unknown action is rejected.
- Event actor/entity are derived from `auth.uid()`, not caller input.
- User without operational row creates no success event.
- Ambiguous mapping creates no event.
- Inactive user can only produce `acesso_operacional_bloqueado`.
- Metadata is exactly the fixed safe shape.
- Direct insert into `historico_auditoria` remains denied.
- Existing audit select RLS remains unchanged.
- Security/Advisor validation reports no function search-path or exposed-definer
  issue.
