# Implementation Plan: Assistencias MMS - Espelho Operacional Idempotente

**Branch**: `004-assistencias-mms-espelho` | **Date**: 2026-06-23 | **Spec**: `specs/004-assistencias-mms-espelho/spec.md`

**Input**: Feature specification from `specs/004-assistencias-mms-espelho/spec.md`

## Summary

Criar o espelho operacional final das assistencias importadas da MMS em dois
niveis: `mms_assistencias` para o servico principal agrupado por
`posto_id + data_atividade + numero_assistencia`, e
`mms_partes_assistencia` para as partes do conjunto, idempotentes pela chave
completa `posto_id + data_atividade + numero_assistencia + parte_conjunto`.

A implementacao e database-first em Supabase/PostgreSQL, consumindo lotes e
linhas elegiveis da Spec 03 (`mms_lotes_importacao` e
`mms_linhas_importacao`). A feature deve preservar `raw_json`, manter
rastreabilidade por lote/linha, aplicar RLS por perfil/posto, registrar
auditoria em `historico_auditoria`, suportar correcao manual sem sobrescrever
evidencia MMS, marcar/remarcar `removido` somente a partir de importacoes
elegiveis completas e preparar contratos para specs futuras de ocorrencias,
reclamacoes e custos.

## Technical Context

**Language/Version**: SQL PostgreSQL e PL/pgSQL em Supabase; TypeScript/React
fora do escopo desta feature.

**Primary Dependencies**: Supabase, PostgreSQL, Supabase Auth, Row Level Security,
funcoes auxiliares e `historico_auditoria` da Spec 01; entidades de staging,
status oficiais, `estado_processamento`, `estado_validacao`, totais, campos
candidatos e `raw_json` da Spec 03.

**Storage**: Supabase/PostgreSQL no schema `public`, com tabelas finais
`mms_assistencias` e `mms_partes_assistencia`, funcoes internas para upsert
idempotente, completude derivada de lote, sincronizacao de `removido`,
precedencia de valores corrigidos, protecao de raw evidence e auditoria quando
necessario.

**Testing**: Validacoes SQL via Supabase CLI quando Docker/psql estiverem
disponiveis; validacao remota via MCP Supabase no projeto Doka quando necessario.
Os testes devem cobrir duplicidade, idempotencia, RLS, auditoria, preservacao de
`raw_json`, `raw_json_resumo`, correcao manual, marcacao/remarcacao `removido`,
reativacao por reaparecimento e bloqueio de lotes inelegiveis.

**Target Platform**: Plataforma interna web desktop-first no MVP, com esta
feature restrita a banco de dados, regras e contratos de acesso.

**Project Type**: Web app interno com backend Supabase/database-first para esta
feature.

**Performance Goals**: Consultas operacionais por `posto_id`, `data_atividade`,
`numero_assistencia`, `status_interno`, `status_atividade` e
`tipo_atividade_normalizado` devem usar indices adequados. Upsert de partes por
chave operacional completa deve evitar varreduras amplas em reimportacoes do
mesmo posto/data. Policies devem reaproveitar funcoes auxiliares da Spec 01 para
evitar joins repetidos desnecessarios.

**Constraints**: Usar portugues em `snake_case`; chaves primarias `id`; FKs com
sufixo `_id`; soft delete apenas quando aplicavel por `deleted_at`, `deleted_by`
e `delete_reason`; `status_interno` separado de soft delete; auditoria em
`historico_auditoria`; autorizacao por Supabase Auth, perfil e posto; `raw_json`
e `raw_json_resumo` preservados e protegidos contra update direto; apenas lotes
`importado` ou `importado_com_alertas` completos e sem erro bloqueante podem
atualizar o espelho ou marcar ausentes como `removido`; completude e derivada de
`estado_processamento = validado`, totais consistentes, posto/data resolvidos e
linhas `valida` ou `valida_com_alerta`; views de valor visivel devem usar
`security_invoker = true` ou alternativa sob RLS; sem frontend nem modulos fora
do MVP.

**Scale/Scope**: MVP com importacoes manuais por posto/data, volume inicial baixo
a moderado, preparado para multiplas importacoes no mesmo dia, assistencias com
multiplas partes e historico crescente de auditoria e reprocessamentos.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- PASS: A feature nao faz o Doka substituir a MMS; cria apenas o espelho interno
  de dados importados.
- PASS: O escopo permanece controlado: nao cria parsing/upload de arquivo,
  tratamento de erro da importacao, ocorrencias, reclamacoes, tarefas, custos
  extras, dashboard, telas finais ou integracao automatica MMS.
- PASS: Persistencia e autorizacao usam Supabase/PostgreSQL/Supabase Auth/RLS,
  reaproveitando a fundacao operacional da Spec 01.
- PASS: As entidades previstas usam portugues `snake_case`, PK `id`, FKs com
  sufixo `_id`, soft delete excepcional por campos proprios e historico
  centralizado.
- PASS: Permissoes sao expressas por perfil e posto: Operador e Supervisao
  respeitam escopo de `posto_id`; Direcao/Admin tem visao global.
- PASS: A feature toca assistencias importadas e preserva `raw_json`,
  `raw_json_resumo`, lote/linha de criacao, lote/linha mais recente e historico.
- PASS: A chave operacional MMS completa e aplicada como idempotencia das partes,
  sem duplicar `mms_assistencias` por parte.
- PASS: A marcacao `removido` ocorre somente para ausentes em nova importacao
  elegivel e completa do mesmo posto/data; lotes cancelados, com erro,
  incompletos ou parciais nao podem remover ausentes.
- PASS: A feature nao cria ocorrencias nem custos extras, mas define contrato
  futuro de vinculo obrigatorio com `mms_assistencias` e referencia opcional a
  `mms_partes_assistencia`.
- PASS: Nao ha frontend nesta etapa; qualquer tela futura devera seguir o design
  system Doka e o comportamento desktop-first.
- PASS: Nenhum conflito identificado entre README/docs/constituicao para esta
  feature.

## Project Structure

### Documentation (this feature)

```text
specs/004-assistencias-mms-espelho/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   |-- rls-access-contract.md
|   |-- validation-idempotency-contract.md
|   |-- audit-contract.md
|   `-- future-consumer-contract.md
`-- tasks.md
```

### Source Code (repository root)

```text
supabase/
|-- migrations/
|   `-- [timestamp]_assistencias_mms_espelho.sql
|-- seed/
|   `-- assistencias_mms_espelho.sql
|-- tests/
|   |-- assistencias_mms_idempotencia.sql
|   |-- assistencias_mms_rls.sql
|   |-- assistencias_mms_auditoria.sql
|   `-- assistencias_mms_removido_raw_json.sql
`-- policies/
    `-- assistencias_mms_espelho.md
```

**Structure Decision**: Esta feature segue o padrao database-first das Specs 01,
02 e 03. O plano nao cria frontend nem servicos de aplicacao; as tasks devem
produzir migration, seed, policies documentadas e testes SQL focados no banco.

## Phase 0: Research

Pesquisa consolidada em `specs/004-assistencias-mms-espelho/research.md`.

Principais decisoes:

- Modelar `mms_assistencias` como servico principal por
  `posto_id + data_atividade + numero_assistencia`.
- Modelar `mms_partes_assistencia` como detalhe idempotente pela chave completa
  MMS, vinculada a `mms_assistencias`.
- Consumir apenas lotes/linhas elegiveis da Spec 03; status `erro`,
  `cancelado`, lotes incompletos/parciais, totais inconsistentes, linhas
  `pendente`, `invalida` ou `ignorada`, ou linhas com erro bloqueante nao
  alteram o espelho nem marcam `removido`.
- Separar `status_atividade` MMS de `status_interno` (`ativo`, `removido`) e de
  soft delete.
- Preservar `raw_json` em partes e `raw_json_resumo` em assistencias principais.
- Representar correcoes manuais v1 somente para `cliente_nome`, `endereco`,
  `descricao_mercadoria` e `recurso`, com valores corrigidos distinguiveis dos
  valores importados e precedencia de valor corrigido ativo sobre valor
  importado.
- Proteger `raw_json` e `raw_json_resumo` contra update direto fora de rotinas de
  importacao aprovadas.
- Exigir `security_invoker = true` em views de valor visivel ou alternativa sob
  RLS.
- Usar constraints, indices parciais e funcoes SQL para idempotencia,
  reativacao, marcacao `removido`, auditoria e RLS.

## Phase 1: Design

Artefatos de design gerados:

- `specs/004-assistencias-mms-espelho/data-model.md`
- `specs/004-assistencias-mms-espelho/contracts/rls-access-contract.md`
- `specs/004-assistencias-mms-espelho/contracts/validation-idempotency-contract.md`
- `specs/004-assistencias-mms-espelho/contracts/audit-contract.md`
- `specs/004-assistencias-mms-espelho/contracts/future-consumer-contract.md`
- `specs/004-assistencias-mms-espelho/quickstart.md`

## Post-Design Constitution Check

- PASS: O data model mantem o espelho MMS em assistencias e partes sem criar
  ocorrencias, reclamacoes, tarefas, custos, dashboard, telas ou integracao
  automatica.
- PASS: Os contratos de RLS preservam perfil e posto conforme Spec 01.
- PASS: Os contratos de validacao exigem idempotencia por assistencia principal e
  por parte, elegibilidade de lote/linha, preservacao de raw evidence, correcao
  manual rastreavel e bloqueio de `removido` para lotes inelegiveis.
- PASS: A completude de lote e derivada explicitamente da Spec 03 e linhas
  elegiveis ficam restritas a `valida` e `valida_com_alerta`.
- PASS: Projecoes de valor visivel devem preservar RLS com `security_invoker` ou
  estrategia equivalente.
- PASS: Os contratos de auditoria exigem `historico_auditoria` para criacao,
  atualizacao por importacao, correcao, marcacao `removido`, reativacao e soft
  delete excepcional.
- PASS: Soft delete permanece separado de `status_interno`; ausencia em nova
  importacao usa `removido`.
- PASS: Os contratos futuros exigem assistencia principal obrigatoria para
  ocorrencias, reclamacoes e custos, com parte opcional quando aplicavel.

## Complexity Tracking

Nenhuma violacao constitucional identificada. A modelagem em dois niveis e uma
exigencia dos documentos base, nao complexidade adicional opcional.
