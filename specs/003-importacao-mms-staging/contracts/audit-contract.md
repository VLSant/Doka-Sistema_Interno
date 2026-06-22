# Audit Contract: Importacao MMS Staging

## Goal

Registrar em `historico_auditoria` as acoes criticas de importacao MMS, sem criar
tabelas paralelas de historico.

## Audited Entities

- `mms_lotes_importacao`
- `mms_linhas_importacao`
- `mms_erros_importacao`
- `mms_alertas_importacao`

## Required Batch Actions

`mms_lotes_importacao` deve gerar historico para:

- `criado`
- `processamento_iniciado`
- `validacao_concluida`
- `status_alterado`
- `erro`
- `cancelado`
- `atualizado`
- `soft_delete_registrado`

## Required Line Actions

`mms_linhas_importacao` deve gerar historico direto ou por resumo do lote para:

- `criada`
- `validada`
- `erro_registrado`
- `alerta_registrado`
- `atualizada`
- `soft_delete_registrado`

## Required Error and Alert Actions

`mms_erros_importacao` e `mms_alertas_importacao` devem gerar historico direto ou
por resumo do lote para:

- `criado`
- `atualizado`
- `soft_delete_registrado`

## Event Data

Cada evento deve identificar, conforme o padrao da Spec 01:

- Entidade auditada.
- `entidade_id`.
- Acao.
- Usuario responsavel.
- Valores anteriores quando aplicavel.
- Valores novos quando aplicavel.
- Contexto com `lote_importacao_id`, `linha_importacao_id` quando aplicavel,
  `posto_id`, `nome_origem` e status oficial quando relevante.
- Data/hora do evento.

## Rules

- Operacoes bloqueadas por RLS ou validacao nao devem criar evento de sucesso.
- Delete fisico nao faz parte do fluxo operacional comum.
- Soft delete deve gerar `soft_delete_registrado`.
- Mudanca de `status` deve gerar evento com valor anterior e novo.
- Criacao de erro ou alerta deve ser rastreavel ate lote e linha quando houver.
- Alteracao de `raw_json` deve ser bloqueada; tentativa bloqueada nao gera evento
  de sucesso.
- Auditoria deve ser disparada pelo banco para nao depender de telas futuras.

## Required Test Scenarios

- Criar lote gera evento `criado`.
- Iniciar processamento gera evento `processamento_iniciado`.
- Concluir validacao gera evento `validacao_concluida`.
- Mudar status para `importado`, `importado_com_alertas`, `erro` ou `cancelado`
  gera evento rastreavel.
- Criar linhas gera evidencia auditavel.
- Registrar erro gera evidencia auditavel.
- Registrar alerta gera evidencia auditavel.
- Soft delete de lote/linha/erro/alerta gera `soft_delete_registrado`.
- Tentativa bloqueada de Operador para acessar lote fora do escopo nao gera evento
  de sucesso.
- Tentativa de alterar `raw_json` nao gera evento de sucesso.
