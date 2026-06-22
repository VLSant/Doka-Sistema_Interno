# Implementation Plan: Cadastros Base MVP

**Branch**: `002-cadastros-base-mvp` | **Date**: 2026-06-20 | **Spec**: `specs/002-cadastros-base-mvp/spec.md`

**Input**: Feature specification from `specs/002-cadastros-base-mvp/spec.md`

## Summary

Criar a base operacional de cadastros auxiliares do MVP do Doka: `prioridades`,
`tipos_ocorrencia` e `metas_eficiencia`. A implementacao e database-first em
Supabase/PostgreSQL, aproveitando a fundacao da Spec 01 para Auth, usuarios,
postos, vinculos usuario/posto, RLS, funcoes auxiliares de permissao e
`historico_auditoria`.

O escopo desta feature e criar migrations, policies, seeds e validacoes SQL para
manter os cadastros com soft delete, auditoria centralizada, duplicidade ativa
bloqueada e acesso por perfil/posto. Nenhuma tela final, importacao MMS,
assistencia, ocorrencia real, tarefa, rotina, custo extra ou dashboard sera criado
nesta etapa.

## Technical Context

**Language/Version**: SQL PostgreSQL e PL/pgSQL em Supabase; TypeScript/React
fora do escopo desta feature.

**Primary Dependencies**: Supabase, PostgreSQL, Supabase Auth, Row Level Security,
funcoes auxiliares e `historico_auditoria` criados na Spec 01.

**Storage**: Supabase/PostgreSQL no schema `public`, com funcoes privadas ou
internas reaproveitando o padrao existente da Spec 01.

**Testing**: Validacoes SQL via Supabase CLI quando Docker/psql estiverem
disponiveis; validacao remota via MCP Supabase no projeto Doka quando necessario.
Os testes devem cobrir RLS, duplicidades, soft delete, vinculo de posto e
auditoria.

**Target Platform**: Plataforma interna web desktop-first no MVP, com esta feature
restrita a banco de dados, regras e contratos de acesso.

**Project Type**: Web app interno com backend Supabase/database-first para esta
feature.

**Performance Goals**: Consultas operacionais dos cadastros devem usar indices
para registros ativos, nomes normalizados, `posto_id`, vigencias e colunas usadas
em RLS. Policies devem evitar varreduras desnecessarias em `metas_eficiencia`.

**Constraints**: Usar portugues em `snake_case`; chaves primarias `id`; FKs com
sufixo `_id`; soft delete obrigatorio quando aplicavel; auditoria em
`historico_auditoria`; autorizacao por Supabase Auth, perfil e posto; sem
funcionalidades fora do MVP sem aprovacao.

**Scale/Scope**: MVP com baixo volume inicial de cadastros, mas preparado para
multiplos postos, perfis operacionais e historico crescente.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- PASS: A feature nao faz o Doka substituir a MMS e nao cria importacao,
  integracao automatica, assistencias, ocorrencias reais, tarefas, custos extras,
  dashboard final ou telas finais.
- PASS: Persistencia e autorizacao usam Supabase/PostgreSQL/Supabase Auth/RLS,
  reaproveitando a fundacao operacional da Spec 01.
- PASS: As tabelas previstas usam nomes em portugues `snake_case`, PK `id`, FKs
  com sufixo `_id`, soft delete e historico centralizado.
- PASS: Permissoes sao expressas por perfil e posto: Operador consulta ativos,
  Supervisao respeita escopo em `metas_eficiencia`, Direcao/Admin tem gestao
  global.
- PASS: A feature nao toca assistencias, ocorrencias nem custos extras; portanto
  nao altera as regras de assistencia obrigatoria.
- PASS: A feature nao toca importacao MMS; portanto nao altera `raw_json`, chave
  operacional MMS ou marcacao como `removido`.
- PASS: Nao ha frontend nesta etapa; qualquer tela futura devera seguir o design
  system Doka e o comportamento desktop-first.
- PASS: Nenhum conflito identificado entre README/docs/constituicao para esta
  feature.

## Project Structure

### Documentation (this feature)

```text
specs/002-cadastros-base-mvp/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   |-- rls-access-contract.md
|   |-- validation-contract.md
|   `-- audit-contract.md
`-- tasks.md
```

### Source Code (repository root)

```text
supabase/
|-- migrations/
|   `-- [timestamp]_cadastros_base_mvp.sql
|-- seed/
|   `-- cadastros_base_mvp.sql
|-- tests/
|   |-- cadastros_base_rls.sql
|   |-- cadastros_base_validacoes.sql
|   `-- cadastros_base_auditoria.sql
`-- policies/
    `-- cadastros_base_mvp.md
```

**Structure Decision**: Esta feature deve seguir o padrao database-first ja usado
na Spec 01. O plano nao cria frontend nem servicos de aplicacao; as tasks devem
produzir migration, seed, policies documentadas e testes SQL focados no banco.

## Phase 0: Research

Pesquisa consolidada em `specs/002-cadastros-base-mvp/research.md`.

Principais decisoes:

- Usar migrations SQL Supabase/PostgreSQL para as tres entidades.
- Usar RLS em todas as tabelas novas, sem grants diretos para acesso anonimo.
- Reaproveitar as funcoes de perfil/posto da Spec 01 e adicionar auxiliares
  apenas quando necessario para normalizacao ou validacao declarativa.
- Usar colunas normalizadas explicitas e constraints/indices parciais para
  duplicidade ativa.
- Usar constraint declarativa para sobreposicao de vigencia de
  `metas_eficiencia`, preferencialmente com `btree_gist` quando aplicavel.
- Usar triggers de auditoria para criar eventos em `historico_auditoria`.

## Phase 1: Design

Artefatos de design gerados:

- `specs/002-cadastros-base-mvp/data-model.md`
- `specs/002-cadastros-base-mvp/contracts/rls-access-contract.md`
- `specs/002-cadastros-base-mvp/contracts/validation-contract.md`
- `specs/002-cadastros-base-mvp/contracts/audit-contract.md`
- `specs/002-cadastros-base-mvp/quickstart.md`

## Post-Design Constitution Check

- PASS: O data model mantem escopo em cadastros base e nao cria entidades MMS,
  assistencias, ocorrencias reais, tarefas, custos ou dashboard.
- PASS: Os contratos de RLS preservam perfil e posto conforme Spec 01.
- PASS: Os contratos de validacao e auditoria exigem soft delete, historico
  centralizado e nomes em portugues `snake_case`.
- PASS: O quickstart valida RLS, duplicidade, soft delete e auditoria antes de
  considerar a feature pronta.

## Complexity Tracking

Nenhuma violacao constitucional identificada. Nenhuma complexidade adicional
exige justificativa.
