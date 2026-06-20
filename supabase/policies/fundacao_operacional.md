# Policies / RLS - Fundacao Operacional

## Escopo

Arquivos principais:
- `supabase/migrations/202606180001_fundacao_operacional.sql`
- `supabase/seed/fundacao_operacional_seed.sql`
- `supabase/tests/fundacao_operacional_rls.sql`
- `supabase/tests/fundacao_operacional_auditoria.sql`

## Tabelas cobertas

- `usuarios`
- `postos`
- `usuarios_postos`
- `cargos_funcoes`
- `historico_auditoria`

Todas as tabelas acima habilitam Row Level Security.

## Funcoes auxiliares

As funcoes ficam em `app_private`, com `security definer` e `search_path` fixo:

- `app_private.usuario_atual_id()`
- `app_private.usuario_tem_perfil(perfil_usuario)`
- `app_private.usuario_e_direcao_admin()`
- `app_private.usuario_e_supervisao()`
- `app_private.usuario_tem_acesso_posto(uuid)`

Nenhuma decisao de autorizacao usa `raw_user_meta_data` ou metadado editavel pelo
usuario. O escopo operacional vem de `usuarios` e `usuarios_postos`.

## Matriz de acesso

| Perfil | Usuarios | Postos | Usuarios postos | Cargos/funcoes | Historico |
| --- | --- | --- | --- | --- | --- |
| Sem perfil ativo | Sem acesso operacional | Sem acesso | Sem acesso | Sem acesso | Sem acesso |
| Operador | Proprio perfil | Postos vinculados ativos | Proprios vinculos ativos | Consulta ativa | Sem listagem geral |
| Supervisao | Usuarios em escopo quando autorizado | Postos sob supervisao | Vinculos em escopo | Consulta ativa | Historico em escopo quando houver metadata |
| Direcao/Admin | Gerencia todos | Gerencia todos | Gerencia todos | Gerencia todos | Consulta completa |

## Policies criadas

- `cargos_funcoes_select_operacional`
- `cargos_funcoes_admin_select`
- `cargos_funcoes_admin_insert`
- `cargos_funcoes_admin_update`
- `usuarios_select_proprio`
- `usuarios_admin_select`
- `usuarios_admin_insert`
- `usuarios_admin_update`
- `postos_select_por_escopo`
- `postos_admin_select`
- `postos_admin_insert`
- `postos_admin_update`
- `postos_supervisao_update`
- `usuarios_postos_select_por_escopo`
- `usuarios_postos_admin_select`
- `usuarios_postos_admin_insert`
- `usuarios_postos_admin_update`
- `usuarios_postos_supervisao_update`
- `historico_auditoria_select_admin_supervisao`

## Auditoria

Eventos registrados por trigger:

- `criado`
- `atualizado`
- `perfil_alterado`
- `ativado`
- `inativado`
- `vinculo_posto_criado`
- `vinculo_posto_removido`
- `excluido_logicamente`

Formato esperado:

- `entidade_tipo`
- `entidade_id`
- `acao`
- `valor_anterior`
- `valor_novo`
- `metadata`
- `usuario_id`
- `created_at`

## Soft delete

Registros operacionais usam:

- `deleted_at`
- `deleted_by`
- `delete_reason`

Quando `deleted_at` e preenchido, `deleted_by` e `delete_reason` tambem devem ser
preenchidos. Registros deletados logicamente ficam fora das leituras operacionais
padrao.

## Grants

- `anon` nao recebe acesso operacional.
- `authenticated` recebe grants minimos para que RLS possa decidir acesso.
- `historico_auditoria` permite `select` via RLS e nao concede `insert`, `update`
  `delete`, `truncate`, `references` ou `trigger` para uso operacional comum.

## Security review

Revisao em 2026-06-19:

- MCP Supabase confirmou o projeto remoto `Doka` ativo em `zwxxjbiwpgqjsmaxybbm`.
- A migration da fundacao e as migrations corretivas foram aplicadas no projeto
  remoto Doka.
- T051 (`fundacao_operacional_rls.sql`) passou via MCP Supabase.
- T052 (`fundacao_operacional_auditoria.sql`) passou via MCP Supabase.
- Revisao estatica confirmou que nenhuma decisao de autorizacao usa
  `raw_user_meta_data`, `user_metadata` ou claims editaveis pelo usuario.
- MCP confirmou RLS habilitado em `cargos_funcoes`, `usuarios`, `postos`,
  `usuarios_postos` e `historico_auditoria`.
- Revisao estatica e migration corretiva confirmaram revokes explicitos para `anon`
  e remocao de `delete`, `truncate`, `references` e `trigger` operacionais de
  `authenticated`.
- Advisor de seguranca apos aplicacao nao retornou lints de RLS. Permanece apenas
  o aviso de configuracao Auth `auth_leaked_password_protection`, que deve ser
  tratado no painel Supabase.

Revisao complementar em 2026-06-20:

- Migration `restringir_historico_auditoria_privilegios` aplicada no projeto remoto
  Doka.
- `authenticated` ficou apenas com `SELECT` em `public.historico_auditoria`.
- `anon` permanece sem privilegios em `public.historico_auditoria`.
- `fundacao_operacional_auditoria.sql` passou novamente via MCP cobrindo
  `criado`, `atualizado`, `perfil_alterado`, `ativado`, `inativado`,
  `vinculo_posto_criado`, `vinculo_posto_removido`, `excluido_logicamente`,
  auditoria de `cargos_funcoes` e bloqueio de privilegios operacionais no
  historico.
