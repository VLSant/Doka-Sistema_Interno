# Implementation Plan: Importacao MMS - Lotes, Staging e Validacao Bruta

**Branch**: `003-importacao-mms-staging` | **Date**: 2026-06-22 | **Spec**: `specs/003-importacao-mms-staging/spec.md`

**Input**: Feature specification from `specs/003-importacao-mms-staging/spec.md`

## Summary

Criar a base database-first para importacao manual de planilhas MMS no MVP do
Doka, restrita a lotes, staging de linhas, preservacao de `raw_json`, campos
candidatos para assistencias futuras, erros, alertas, status oficiais e auditoria.

A implementacao deve criar as entidades `mms_lotes_importacao`,
`mms_linhas_importacao`, `mms_erros_importacao` e `mms_alertas_importacao`,
reaproveitando a fundacao operacional da Spec 01 para Auth, usuarios, postos,
vinculos usuario/posto, RLS e `historico_auditoria`. Esta feature nao cria
assistencias finais, nao aplica upsert/idempotencia final, nao marca registros
como `removido` e nao cria frontend, parser completo ou integracao automatica MMS.

## Technical Context

**Language/Version**: SQL PostgreSQL e PL/pgSQL em Supabase; TypeScript/React
fora do escopo desta feature.

**Primary Dependencies**: Supabase, PostgreSQL, Supabase Auth, Row Level Security,
funcoes auxiliares e `historico_auditoria` criados na Spec 01; convenções
database-first e validacoes SQL usadas na Spec 02.

**Storage**: Supabase/PostgreSQL no schema `public`, com funcoes privadas ou
internas para validacao, recalc de totais, bloqueio de `raw_json` e auditoria
quando necessario.

**Testing**: Validacoes SQL via Supabase CLI quando Docker/psql estiverem
disponiveis; validacao remota via MCP Supabase no projeto Doka quando necessario.
Os testes devem cobrir RLS, auditoria, soft delete, `raw_json`, status oficiais,
campos candidatos, erros, alertas e totais por lote.

**Target Platform**: Plataforma interna web desktop-first no MVP, com esta feature
restrita a banco de dados, regras e contratos de acesso.

**Project Type**: Web app interno com backend Supabase/database-first para esta
feature.

**Performance Goals**: Consultas de lotes por `posto_id`, status oficial,
`estado_processamento`, `data_atividade`, `created_at` e `deleted_at` devem usar indices adequados.
Consultas de linhas, erros e alertas por lote devem evitar varreduras amplas.
Policies devem evitar joins repetidos desnecessarios alem das funcoes auxiliares
da Spec 01.

**Constraints**: Usar portugues em `snake_case`; chaves primarias `id`; FKs com
sufixo `_id`; soft delete apenas por `deleted_at`, `deleted_by` e
`delete_reason`; auditoria em `historico_auditoria`; autorizacao por Supabase
Auth, perfil e posto; `raw_json` obrigatorio, jsonb, nao nulo, nao vazio e
imutavel apos criacao; status oficiais de lote nulos ate conclusao da validacao
bruta quando aplicavel e, quando preenchidos, limitados a `importado`,
`importado_com_alertas`, `erro` e `cancelado`; `estado_processamento` cobre
`recebido`, `processando` e `validado`; sem funcionalidades fora do MVP sem
aprovacao.

**Scale/Scope**: MVP com importacoes manuais por posto/data, volume inicial baixo
a moderado, mas preparado para multiplas tentativas no mesmo dia e crescimento de
historico de linhas, erros e alertas.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- PASS: A feature nao faz o Doka substituir a MMS; apenas preserva dados
  importados de planilhas MMS em staging auditavel.
- PASS: O escopo permanece controlado: nao cria assistencias finais, ocorrencias,
  tarefas, custos extras, dashboard, telas finais, parser completo ou integracao
  automatica MMS.
- PASS: Persistencia e autorizacao usam Supabase/PostgreSQL/Supabase Auth/RLS,
  reaproveitando a fundacao operacional da Spec 01.
- PASS: As entidades previstas usam portugues `snake_case`, PK `id`, FKs com
  sufixo `_id`, soft delete por campos proprios e historico centralizado.
- PASS: Permissoes sao expressas por perfil e posto: Operador e Supervisao
  respeitam escopo de `posto_id`; Direcao/Admin tem visao global.
- PASS: A feature toca importacao MMS e preserva `raw_json`; tambem persiste os
  campos candidatos `posto_id`, `data_atividade`, `numero_assistencia` e
  `parte_conjunto`.
- PASS COM RECORTE: A constituicao define a chave operacional MMS e marcacao
  `removido` para a importacao final. Esta Spec 03 prepara os campos candidatos,
  mas nao aplica upsert final nem marcacao `removido`; essa regra fica
  explicitamente delegada a Spec seguinte de assistencias finais/espelho MMS.
- PASS: A feature nao toca ocorrencias nem custos extras; portanto nao altera as
  regras de assistencia obrigatoria desses modulos.
- PASS: Nao ha frontend nesta etapa; qualquer tela futura devera seguir o design
  system Doka e o comportamento desktop-first.
- PASS: Nenhum conflito identificado entre README/docs/constituicao para esta
  feature.

## Project Structure

### Documentation (this feature)

```text
specs/003-importacao-mms-staging/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   |-- rls-access-contract.md
|   |-- validation-contract.md
|   |-- audit-contract.md
|   `-- staging-status-contract.md
`-- tasks.md
```

### Source Code (repository root)

```text
supabase/
|-- migrations/
|   `-- [timestamp]_importacao_mms_staging.sql
|-- seed/
|   `-- importacao_mms_staging.sql
|-- tests/
|   |-- importacao_mms_rls.sql
|   |-- importacao_mms_validacoes.sql
|   |-- importacao_mms_auditoria.sql
|   `-- importacao_mms_raw_json_totais.sql
`-- policies/
    `-- importacao_mms_staging.md
```

**Structure Decision**: Esta feature segue o padrao database-first das Specs 01 e
02. O plano nao cria frontend nem servicos de aplicacao; as tasks devem produzir
migration, seed, policies documentadas e testes SQL focados no banco.

## Phase 0: Research

Pesquisa consolidada em `specs/003-importacao-mms-staging/research.md`.

Principais decisoes:

- Usar quatro entidades oficiais: `mms_lotes_importacao`,
  `mms_linhas_importacao`, `mms_erros_importacao` e
  `mms_alertas_importacao`.
- Usar status oficial somente em `mms_lotes_importacao.status`, permitindo nulo
  antes da conclusao da validacao bruta e limitando valores preenchidos a
  `importado`, `importado_com_alertas`, `erro` e `cancelado`.
- Usar `estado_processamento` para o ciclo interno inicial `recebido`,
  `processando` e `validado`, sem expandir status oficial.
- Preservar `raw_json` obrigatorio, jsonb, nao nulo, nao vazio e imutavel em
  `mms_linhas_importacao`.
- Persistir campos candidatos para a Spec seguinte:
  `posto_id`, `data_atividade`, `numero_assistencia` e `parte_conjunto`.
- Modelar erros e alertas em tabelas separadas para rastreabilidade e contagem.
- Usar triggers/funcoes de banco para auditoria, protecao de `raw_json`,
  consistencia de totais e regras de soft delete quando declarativo nao bastar.

## Phase 1: Design

Artefatos de design gerados:

- `specs/003-importacao-mms-staging/data-model.md`
- `specs/003-importacao-mms-staging/contracts/rls-access-contract.md`
- `specs/003-importacao-mms-staging/contracts/validation-contract.md`
- `specs/003-importacao-mms-staging/contracts/audit-contract.md`
- `specs/003-importacao-mms-staging/contracts/staging-status-contract.md`
- `specs/003-importacao-mms-staging/quickstart.md`

## Post-Design Constitution Check

- PASS: O data model mantem escopo em staging MMS e nao cria assistencias finais,
  ocorrencias, tarefas, custos, dashboard, telas finais, parser completo ou
  integracao automatica.
- PASS: Os contratos de RLS preservam perfil e posto conforme Spec 01.
- PASS: Os contratos de validacao exigem status oficial nulo ate conclusao,
  `estado_processamento`, `raw_json` obrigatorio/nao vazio/imutavel, campos
  candidatos, erros, alertas e totais consistentes.
- PASS: Os contratos de auditoria exigem `historico_auditoria` e bloqueiam evento
  de sucesso para operacoes rejeitadas.
- PASS: Soft delete permanece separado de status oficial e exige `deleted_at`,
  `deleted_by` e `delete_reason`.
- PASS COM RECORTE: A chave operacional MMS completa e usada como preparo
  (`posto_id + data_atividade + numero_assistencia + parte_conjunto`), mas upsert
  final e marcacao `removido` ficam para a Spec seguinte.

## Complexity Tracking

Nenhuma violacao constitucional identificada. O recorte de nao aplicar upsert
final nem `removido` nesta feature e uma delimitacao explicita da Spec 03, nao uma
excecao tecnica.
