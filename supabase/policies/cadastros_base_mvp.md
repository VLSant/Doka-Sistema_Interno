# Cadastros Base MVP - Policies

## Escopo

Esta documentacao cobre `prioridades`, `tipos_ocorrencia` e
`metas_eficiencia`. A feature nao cria importacao MMS, assistencias, ocorrencias
reais, tarefas, rotinas, custos extras, dashboard final ou telas finais.

## Dependencias da Spec 01

As policies usam as funcoes auxiliares da fundacao operacional:

- `app_private.usuario_atual_id()`
- `app_private.usuario_e_direcao_admin()`
- `app_private.usuario_e_supervisao()`
- `app_private.usuario_tem_acesso_posto(uuid)`

Autorizacao vem das tabelas operacionais `usuarios` e `usuarios_postos`, nunca de
`raw_user_meta_data`.

## Funcoes novas

- `app_private.normalizar_texto_operacional(text)`: normaliza texto para
  comparacao sem espacos extras, sem diferenca de caixa e com tratamento de
  acentos via `extensions.unaccent`.
- `app_private.campo_soft_delete_valido(timestamptz, uuid, text)`: padroniza a
  exigencia de `deleted_by` e `delete_reason` quando `deleted_at` estiver
  preenchido.
- `app_private.auditar_cadastro_base()`: registra `criado`, `atualizado`,
  `ativado`, `inativado` e `excluido_logicamente` em `historico_auditoria`.
- `app_private.validar_meta_eficiencia()`: normaliza tipo de atividade e bloqueia
  meta ativa para posto inativo ou removido logicamente.

Funcoes de trigger ficam sem grants publicos diretos. A funcao de normalizacao e
exposta a `authenticated` para permitir debug e validacoes operacionais. As
extensoes de suporte ficam no schema `extensions`.

## Grants

- `anon`: sem privilegios nas tres tabelas.
- `authenticated`: `select`, `insert` e `update` nas tres tabelas, sempre
  governados por RLS.
- `authenticated`: sem `delete`, `truncate`, `references` ou `trigger` nas tres
  tabelas.

## Prioridades

`prioridades` e global.

| Perfil | Select | Insert | Update | Delete fisico |
| --- | --- | --- | --- | --- |
| Sem perfil ativo | Bloqueado | Bloqueado | Bloqueado | Bloqueado |
| Operador | Ativos nao removidos | Bloqueado | Bloqueado | Bloqueado |
| Supervisao | Ativos nao removidos | Bloqueado | Bloqueado | Bloqueado |
| Direcao/Admin | Global pela policy consolidada | Permitido | Permitido | Bloqueado |

Validacoes:

- `nome` obrigatorio e normalizado em `nome_normalizado`.
- `nivel` inteiro positivo.
- `cor` em token Doka `doka.*` ou hexadecimal `#RRGGBB`.
- Indice unico parcial para `nome_normalizado` ativo.
- Indice unico parcial para `nivel` ativo.
- Soft delete exige `deleted_at`, `deleted_by` e `delete_reason`.

Auditoria:

- `criado`
- `atualizado`
- `ativado`
- `inativado`
- `excluido_logicamente`

## Tipos de ocorrencia

`tipos_ocorrencia` e global e prepara classificacao futura. Esta feature nao cria
ocorrencias reais.

| Perfil | Select | Insert | Update | Delete fisico |
| --- | --- | --- | --- | --- |
| Sem perfil ativo | Bloqueado | Bloqueado | Bloqueado | Bloqueado |
| Operador | Ativos nao removidos | Bloqueado | Bloqueado | Bloqueado |
| Supervisao | Ativos nao removidos | Bloqueado | Bloqueado | Bloqueado |
| Direcao/Admin | Global pela policy consolidada | Permitido | Permitido | Bloqueado |

Validacoes:

- `nome` obrigatorio e normalizado em `nome_normalizado`.
- Indice unico parcial para `nome_normalizado` ativo.
- Soft delete exige `deleted_at`, `deleted_by` e `delete_reason`.

Auditoria:

- `criado`
- `atualizado`
- `ativado`
- `inativado`
- `excluido_logicamente`

## Metas de eficiencia

`metas_eficiencia` e scoped por `posto_id`.

| Perfil | Select | Insert | Update | Delete fisico |
| --- | --- | --- | --- | --- |
| Sem perfil ativo | Bloqueado | Bloqueado | Bloqueado | Bloqueado |
| Operador | Ativas do escopo | Bloqueado | Bloqueado | Bloqueado |
| Supervisao | Ativas do escopo | Permitido no escopo pela policy consolidada | Permitido no escopo pela policy consolidada | Bloqueado |
| Direcao/Admin | Global pela policy consolidada | Permitido pela policy consolidada | Permitido pela policy consolidada | Bloqueado |

Validacoes:

- `posto_id` deve existir em `postos`.
- Meta ativa exige posto ativo e nao removido.
- `tipo_atividade_normalizado` obrigatorio.
- `meta_percentual` maior que zero e ate `100`.
- `vigencia_fim` deve ser maior ou igual a `vigencia_inicio`.
- Constraint de exclusao impede vigencias ativas sobrepostas por
  `posto_id + tipo_atividade_normalizado`.
- Soft delete exige `deleted_at`, `deleted_by` e `delete_reason`.

Auditoria:

- `criado`
- `atualizado`
- `ativado`
- `inativado`
- `excluido_logicamente`

Eventos de metas incluem `posto_id` em `metadata` para apoiar leitura futura por
escopo.
