# Policies: Importacao MMS Staging

## Escopo

Esta feature cria somente staging MMS: `mms_lotes_importacao`,
`mms_linhas_importacao`, `mms_erros_importacao` e
`mms_alertas_importacao`. Ela nao cria assistencias finais, ocorrencias, tarefas,
custos extras, dashboard, telas finais, parser completo ou integracao automatica.

## Status e Ciclo do Lote

- `mms_lotes_importacao.status` e o status oficial do lote.
- `status` pode ficar nulo enquanto `estado_processamento` for `recebido` ou
  `processando`.
- Quando preenchido, `status` aceita somente `importado`,
  `importado_com_alertas`, `erro` ou `cancelado`.
- `estado_processamento` registra o ciclo tecnico `recebido`, `processando` e
  `validado` sem expandir a lista de status oficiais.
- Lote `validado` deve ter status oficial preenchido, exceto quando cancelado.

## Raw JSON

- `mms_linhas_importacao.raw_json` e obrigatorio, `jsonb`, nao nulo e nao vazio.
- Objeto vazio `{}`, array vazio `[]`, JSON `null` e string vazia sao rejeitados.
- `raw_json` representa a linha MMS original e e bloqueado para update apos a
  criacao.
- Campos candidatos (`posto_id`, `data_atividade`, `numero_assistencia` e
  `parte_conjunto`) podem ser preenchidos sem substituir o dado bruto.

## RLS

Todas as quatro tabelas usam RLS.

| Perfil | Lotes | Linhas/erros/alertas |
| --- | --- | --- |
| Sem perfil ativo | Sem acesso | Sem acesso |
| Operador | Consulta e cria somente nos postos vinculados | Consulta filhos dos lotes acessiveis |
| Supervisao | Consulta e gerencia lotes dos postos vinculados | Gerencia validacao nos lotes acessiveis |
| Direcao/Admin | Acesso global, incluindo revisao de soft delete | Acesso global, incluindo revisao de soft delete |

As tabelas filhas herdam escopo do lote por `lote_importacao_id`.
Tabelas filhas soft-deleted podem ser revisadas por usuarios com permissao
gerencial sobre o lote pai para permitir soft delete auditavel sob RLS.

## Soft Delete

Soft delete usa somente `deleted_at`, `deleted_by` e `delete_reason`. Quando
`deleted_at` for preenchido, usuario e motivo sao obrigatorios. Delete fisico e
revogado de `authenticated` nas quatro tabelas. Linhas, erros e alertas possuem
policies explicitas para soft delete e revisao gerencial de registros ja
soft-deleted.

## Auditoria

Triggers gravam eventos em `historico_auditoria` para criacao, atualizacao,
mudanca de processamento, mudanca de status, cancelamento, validacao de linha,
registro de erros/alertas e soft delete. O metadata inclui, quando aplicavel,
`lote_importacao_id`, `linha_importacao_id`, `posto_id`, `nome_origem` e status
oficial.

Operacoes bloqueadas por RLS, constraints ou trigger nao devem gerar evento de
sucesso.

## Totais

A funcao `app_private.mms_recalcular_totais_lote(lote_uuid)` recalcula:

- `total_linhas`
- `total_linhas_validas`
- `total_linhas_com_erro`
- `total_linhas_com_alerta`
- `total_linhas_ignoradas`

A funcao `app_private.mms_concluir_validacao_lote(lote_uuid)` recalcula totais e
define o status oficial final: `erro`, `importado_com_alertas` ou `importado`.

## Campos Candidatos

A funcao `app_private.mms_atualizar_linha_candidatos(...)` permite persistir os
campos candidatos extraidos/resolvidos em uma linha de staging, respeitando o
escopo de gerenciamento do lote e sem aplicar upsert final de assistencias.
