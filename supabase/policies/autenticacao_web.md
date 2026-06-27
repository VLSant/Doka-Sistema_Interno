# Policies / RPC - Autenticacao Web (Spec 005)

## Escopo

Arquivos principais:
- `supabase/migrations/20260626230929_auditoria_autenticacao_web.sql`
- `supabase/tests/autenticacao_web_auditoria.sql`

Esta feature nao cria tabelas, perfis, niveis de acesso ou policies de RLS
novas. A unica mudanca de banco e a funcao
`public.registrar_evento_autenticacao(p_acao text)`.

## RLS existente nao e alterada

Nenhuma policy criada nas Specs 001-004 e modificada, removida ou substituida
por esta migration. `historico_auditoria` continua com:

- `select` permitido via policy `historico_auditoria_select_admin_supervisao`
  (Direcao/Admin global; Supervisao em escopo).
- Nenhum `insert`/`update`/`delete`/`truncate`/`references`/`trigger`
  operacional para `authenticated` (ver
  `supabase/migrations/202606200001_restringir_historico_auditoria_privilegios.sql`).
- `anon` permanece sem qualquer privilegio na tabela.

A RPC nao reabre escrita direta na tabela: ela e o unico caminho de escrita
adicional, e roda sob seus proprios privilegios controlados.

## Threat model da RPC

`public.registrar_evento_autenticacao(p_acao text) returns void`

- **`SECURITY DEFINER`** e justificado apenas porque `authenticated` nao tem
  `insert` em `historico_auditoria`. A funcao nao expõe nenhum outro
  privilegio elevado.
- **`search_path` fixo** (`public, auth, pg_temp`) elimina risco de sequestro
  de schema.
- **Sem SQL dinamico**: toda a logica usa SQL estatico/PL/pgSQL parametrizado.
- **Ator nunca vem do cliente**: a funcao deriva o usuario operacional
  exclusivamente de `auth.uid()` e da linha correspondente em `usuarios`
  (`auth_user_id = auth.uid()` e `deleted_at is null`). O cliente nao envia
  `usuario_id`, `entidade_id` nem `metadata`.
- **Allowlist fixa de acoes**: qualquer valor de `p_acao` fora da lista abaixo
  e rejeitado com excecao controlada, sem gravar nada.
- **Metadata fixa**: sempre
  `{"origem": "aplicacao_web", "contrato": "spec_005"}`. Nenhum dado livre do
  chamador entra em `metadata`, `valor_anterior` ou `valor_novo` (ambos
  permanecem `null`).
- **Privilegios explicitos**: `REVOKE ALL ... FROM PUBLIC`,
  `REVOKE ALL ... FROM anon`, `GRANT EXECUTE ... TO authenticated`.

## Eventos permitidos (allowlist)

| Acao | Quando | Restricao de usuario |
| --- | --- | --- |
| `acesso_interno_concedido` | Auth e contexto operacional validados | Requer usuario ativo |
| `sessao_encerrada` | Usuario solicitou logout, antes da revogacao | Requer usuario ativo |
| `sessao_expirada_detectada` | Expiracao detectada com ator ainda resolvivel com seguranca | Requer usuario ativo |
| `acesso_operacional_bloqueado` | Identidade Auth valida mapeia para usuario operacional identificavel e bloqueado | Permite usuario inativo (nao removido) |

Comportamento de resolucao do ator:

1. Exige `auth.uid()` nao nulo (camada Auth recusa token invalido/expirado
   antes de chegar na funcao).
2. Localiza linhas em `usuarios` por `auth_user_id = auth.uid()` e
   `deleted_at is null`.
3. Zero linhas: retorna sem gravar evento de sucesso (nenhum evento
   fabricado).
4. Mais de uma linha: rejeita a chamada com excecao controlada; nada e
   gravado.
5. Exatamente uma linha: usa o `id` resolvido como `entidade_id` e
   `usuario_id`.
6. Usuario inativo (mas nao removido) so pode gravar
   `acesso_operacional_bloqueado`; qualquer outra acao retorna sem gravar.

## Formato fixo do evento

```text
entidade_tipo: 'usuarios'
entidade_id: usuarios.id resolvido
acao: acao permitida da allowlist
valor_anterior: null
valor_novo: null
metadata: {"origem": "aplicacao_web", "contrato": "spec_005"}
usuario_id: usuarios.id resolvido
created_at: timestamp do banco (default da tabela)
```

Nenhuma senha, token de acesso/atualizacao, codigo/token de recuperacao,
chave publicavel/secreta, payload de erro sensivel do Auth, snapshot de
armazenamento do navegador ou metadata livre do chamador e gravada por esta
funcao ou pelo cliente.

## Cliente (frontend)

O wrapper em `src/services/audit-service.ts` chama a RPC de forma
best-effort:

- Falha na auditoria nunca bloqueia nem altera o fluxo de autenticacao.
- O evento de login so e solicitado depois que o contexto operacional for
  validado com sucesso.
- O evento de bloqueio so e solicitado apos o Auth confirmar identidade e a
  RPC poder resolver o usuario operacional com seguranca.
- O logout solicita a auditoria antes do `signOut`, mas a sessao e sempre
  limpa mesmo se a auditoria falhar.
- A auditoria de expiracao e best-effort e nunca usa token expirado, segredo
  enfileirado ou chave privilegiada para forcar a chamada.

## Security review

Revisao em 2026-06-26 (implementacao da Fase 2 da Spec 005):

- Revisao estatica confirma que a migration
  `20260626230929_auditoria_autenticacao_web.sql` nao altera nenhuma policy
  de RLS existente nem cria nova tabela.
- Revisao estatica confirma `search_path` fixo, ausencia de SQL dinamico e
  resolucao de ator exclusivamente via `auth.uid()`.
- Revisao estatica confirma `REVOKE ALL ... FROM PUBLIC`,
  `REVOKE ALL ... FROM anon` e `GRANT EXECUTE ... TO authenticated`
  explicitos na propria migration.
- Pendente: aplicacao da migration em projeto Supabase real e execucao do
  Security/Performance Advisor (T083 do `tasks.md`), a ser registrada nesta
  secao quando a Fase 7 (Polish) for executada. Sem ambiente Supabase
  local/remoto disponivel neste momento para validar via MCP/CLI.
