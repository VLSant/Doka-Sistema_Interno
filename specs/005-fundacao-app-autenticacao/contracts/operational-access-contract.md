# Contract: Operational Access Context

## Purpose

Montar e revalidar a identidade operacional usando somente entidades e RLS da
Spec 001.

## Inputs

- Usuário confirmado pelo servidor de Auth.
- Cliente Supabase autenticado com chave publicável.

## Query Sequence

### 1. Own operational user

Consultar `usuarios` com colunas explícitas:

```text
id, auth_user_id, nome, email, perfil, ativo, deleted_at
```

Filter:

```text
auth_user_id = confirmed auth user id
```

Expected:

- Exactly one active, non-deleted row: continue.
- Zero rows: `sem_configuracao_operacional`.
- More than one row: `configuracao_ambigua`.

O filtro explícito é obrigatório mesmo para Direção/Administração, cujo RLS
permite leitura administrativa mais ampla.

### 2. Scoped links

Para `operador` e `supervisao`, consultar vínculos do próprio `usuario_id`,
somente não removidos, com os postos associados.

Required columns:

```text
usuarios_postos: usuario_id, posto_id, nivel_acesso, deleted_at
postos: id, nome, codigo, ativo, deleted_at
```

Eligibility:

- Operador: `nivel_acesso in ('operacional', 'consulta')`.
- Supervisão: `nivel_acesso = 'supervisao'`.
- Posto: `ativo = true` and `deleted_at is null`.

Zero eligible postos produces `sem_posto_autorizado`.

### 3. Global scope

For `direcao_admin`:

- `escopo_global = true`.
- Do not require a link.
- The App Shell may show “Escopo global”.
- Module data remains governed by each table's RLS.

## Output

Return an `OperationalAccessContext` only after every validation succeeds.

Blocked reason is an internal discriminated value:

- `sem_configuracao_operacional`
- `configuracao_ambigua`
- `perfil_invalido`
- `sem_posto_autorizado`

Usuário inativo ou removido é bloqueado pela própria consulta/RLS e, portanto,
produz `sem_configuracao_operacional`; o navegador não tenta distinguir a
existência de um cadastro que não pode visualizar.

The user-facing message groups sensitive reasons into “Configuração operacional
indisponível. Procure a administração”, except for temporary technical failure.

## Revalidation

Re-run before each protected route navigation. Future module services must also
accept current context and rely on RLS for their data operations.

When revalidation changes the result:

- Profile changed: rebuild route/menu access before rendering.
- Link added/removed: rebuild postos before rendering.
- Last posto removed: block Operator/Supervision.
- User/post inactive or removed: clear protected content.
- Direction/Admin assigned: set global scope.
- Direction/Admin removed: require valid scoped links for the new profile.

## Security Invariants

- Never use `user_metadata` for profile or posto.
- Never initialize the browser client with secret/service-role key.
- Never disable or bypass RLS to load context.
- Never keep context in local/session storage.
- Never infer data access from a visible menu item.
- Select only required columns.
- Treat a permission error as denied/blocked, not as empty authorized scope,
  unless the contract explicitly maps zero rows.
