# Contract: RLS and Access Behavior

## Purpose

Define expected access behavior for the operational foundation. This contract is
used to validate policies, helper functions and app-level guards.

## Actors

- Unauthenticated user
- Authenticated user without active `usuarios`
- `operador`
- `supervisao`
- `direcao_admin`

## Tables in Scope

- `usuarios`
- `postos`
- `usuarios_postos`
- `cargos_funcoes`
- `historico_auditoria`

## Access Matrix

| Actor | usuarios | postos | usuarios_postos | cargos_funcoes | historico_auditoria |
| --- | --- | --- | --- | --- | --- |
| Unauthenticated | No access | No access | No access | No access | No access |
| Auth without active profile | No operational access | No access | No access | No access | No access |
| operador | Read own operational profile | Read linked active postos | Read own active links | Read active values needed for own profile | No general audit listing |
| supervisao | Read scoped users where allowed | Read scoped active postos | Read scoped links | Read active values needed for scope | Read scoped audit where allowed |
| direcao_admin | Read/manage all | Read/manage all | Read/manage all | Read/manage all | Read all |

## Required Helper Behavior

### `usuario_atual_id()`

- Returns the current active `usuarios.id` for `auth.uid()`.
- Returns null when there is no active operational profile.
- Ignores records with `deleted_at is not null` or `ativo = false`.

### `usuario_tem_perfil(perfil_usuario)`

- Returns true only when the current user has the requested active profile.
- Must not read user-editable metadata for authorization.

### `usuario_tem_acesso_posto(posto_id)`

- Returns true for `direcao_admin`.
- Returns true for `operador` only when an active `usuarios_postos` link exists
  for the posto.
- Returns true for `supervisao` only when the posto is in the active supervision
  scope.
- Returns false for inactive/deleted users, postos and links.

## Policy Acceptance Scenarios

1. Given an authenticated user without active operational profile, when querying
   operational tables, then zero operational rows are returned or access is denied.
2. Given an Operador linked only to Posto A, when querying postos, then Posto A is
   visible and Posto B is not.
3. Given an Operador linked only to Posto A, when trying to create or update data
   scoped to Posto B, then the operation is denied.
4. Given Supervisao linked to Postos A and B with supervision access, when querying
   scoped operational data, then only Postos A and B are visible.
5. Given Direcao/Admin, when querying postos and usuarios, then all non-deleted
   records are visible by default.
6. Given any soft-deleted record, when default operational lists are queried, then
   the record is hidden.

## Grants and Exposure

- If tables need Data API access, grant only the required privileges to
  `authenticated` and keep RLS enabled.
- Do not grant operational access to `anon`.
- Keep helper execution privileges scoped to the roles that need them.
