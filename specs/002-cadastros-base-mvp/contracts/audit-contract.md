# Audit Contract: Cadastros Base MVP

## Goal

Registrar em `historico_auditoria` todas as acoes criticas dos cadastros base,
sem criar tabelas paralelas de historico.

## Audited Entities

- `prioridades`
- `tipos_ocorrencia`
- `metas_eficiencia`

## Required Actions

Cada entidade deve gerar historico para:

- `criado`
- `atualizado`
- `ativado`
- `inativado`
- `excluido_logicamente`

## Event Data

Cada evento deve identificar, conforme o padrao da Spec 01:

- Entidade auditada.
- `entidade_id`.
- Acao.
- Usuario responsavel.
- Valores anteriores quando aplicavel.
- Valores novos quando aplicavel.
- Data/hora do evento.

## Rules

- Operacoes bloqueadas por RLS ou validacao nao devem criar evento de sucesso.
- Delete fisico nao faz parte do fluxo operacional comum.
- Soft delete deve gerar `excluido_logicamente`.
- Mudanca de `ativo = false` deve gerar `inativado`.
- Mudanca de `ativo = true` partindo de inativo deve gerar `ativado`.
- Demais updates relevantes devem gerar `atualizado`.
- Auditoria deve ser disparada pelo banco para nao depender de telas futuras.

## Required Test Scenarios

- Criar prioridade gera evento `criado`.
- Atualizar prioridade gera evento `atualizado`.
- Inativar prioridade gera evento `inativado`.
- Reativar prioridade gera evento `ativado`.
- Remover logicamente prioridade gera evento `excluido_logicamente`.
- Repetir a cobertura acima para `tipos_ocorrencia`.
- Repetir a cobertura acima para `metas_eficiencia`.
- Tentativa bloqueada de Operador para criar prioridade nao gera evento de
  sucesso.
- Tentativa bloqueada de Supervisao para alterar meta fora do escopo nao gera
  evento de sucesso.
