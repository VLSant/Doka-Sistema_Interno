# Future Consumer Contract: Assistencias MMS

## Purpose

Este contrato prepara specs futuras sem criar ocorrencias, reclamacoes, tarefas,
custos extras, dashboard ou telas nesta feature.

## Principal Link Rule

Modulos futuros que dependem de assistencia devem vincular obrigatoriamente a
`mms_assistencias.id`.

Aplicavel a:

- ocorrencias;
- reclamacoes;
- custos extras;
- outros controles operacionais que precisem de assistencia principal.

## Optional Part Link

Quando o evento, reclamacao ou custo se aplicar a uma parte especifica, o modulo
futuro pode tambem armazenar referencia a `mms_partes_assistencia.id`.

A parte nunca substitui o vinculo obrigatorio com `mms_assistencias`.

## Consumer Expectations

Consumidores futuros podem esperar que:

- uma assistencia principal represente um unico servico por posto/data/numero;
- uma assistencia principal possua zero ou mais partes ativas ou removidas;
- partes preservem `raw_json` de linha;
- a assistencia principal preserve `raw_json_resumo`;
- `status_interno = removido` indique ausencia no espelho atual, nao exclusao
  fisica;
- RLS por posto seja aplicada a assistencias e partes;
- registros removidos continuem disponiveis para auditoria autorizada.

## Out of Scope

Esta feature nao cria:

- ocorrencias;
- reclamacoes;
- tarefas;
- custos extras;
- deslocamentos finais;
- dashboard;
- telas de consulta/detalhe;
- automacao de integracao MMS.
