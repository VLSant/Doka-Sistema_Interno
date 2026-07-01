# Implementation Plan: Gestão de Importações MMS

**Branch**: `main` | **Date**: 2026-06-28 | **Spec**: `specs/007-gestao-importacoes-mms/spec.md`

**Input**: Feature specification from `specs/007-gestao-importacoes-mms/spec.md`

## Summary

Transformar `/app/importacoes-mms` na central posterior à ingestão da Spec 006:
listagem filtrável, detalhe auditável, correções separadas da evidência,
conclusão/reprocessamento e desfazer seguro. A SPA React reutilizará o módulo
existente e consumirá RPCs PostgreSQL paginadas e transacionais.

A migration estenderá lotes, linhas e erros, criará
`mms_correcoes_importacao` para versões imutáveis e `mms_operacoes_lote` para
idempotência/retomada. `raw_json` e `json_normalizado` continuarão imutáveis; uma
projeção `json_efetivo` aplicará apenas correções vigentes de uma allowlist.
Locks de linha/lote e versões esperadas detectarão concorrência.

Reprocessamento reutilizará o espelho das Specs 004/006 por versão de tratamento.
Desfazer será permitido somente para o lote efetivo mais recente de todos os
escopos afetados e reconstruirá cada posto/data a partir de seu predecessor,
atomicamente e sem delete físico.

## Technical Context

**Language/Version**: TypeScript 5.9, React 19.2 e Node.js 24 LTS para SPA e
tooling; SQL PostgreSQL/PL/pgSQL no Supabase.

**Primary Dependencies**: Vite 8.1, React Router 7.18,
`@supabase/supabase-js` 2.108.2 e componentes existentes do design system.
Nenhuma dependência runtime nova é planejada.

**Storage**: PostgreSQL existente para lotes, linhas, erros, alertas,
assistências, partes e auditoria; bucket privado `mms-importacoes` preservado.
Novas tabelas: correções imutáveis e ledger operacional.

**Testing**: Vitest 4.1, React Testing Library, testes SQL transacionais no
projeto remoto de desenvolvimento, advisors Supabase e aceite manual das
jornadas no navegador.

**Target Platform**: navegadores desktop modernos; SPA estática conectada ao
Supabase hospedado.

**Project Type**: aplicação web SPA com backend transacional PostgreSQL exposto
por Data API/RPC autenticada.

**Performance Goals**: listagem/filtros exibem resposta ou progresso em até 2 s
em 95% das medições para lotes de até 10.000 linhas; coleções usam paginação de
até 100 itens; reprocessamento/desfazer preservam os limites operacionais de 60 s
da confirmação da Spec 006 no ambiente de aceite.

**Constraints**: `raw_json`, `json_normalizado` e arquivo imutáveis; lote inteiro
atômico; sem Edge Function/backend separado; sem Docker local; sem service role
no navegador; RLS e autorização no banco; Operador só corrige com vínculo
`operacional`; desfazer apenas o lote efetivo mais recente por posto/data.

**Scale/Scope**: quatro rotas de importação (central, nova, detalhe e
tratamento), cinco contratos, uma migration, duas tabelas novas, extensões em
três entidades existentes e lotes multi-posto de até 10.000 linhas.

## Constitution Check

*GATE: aprovado antes da pesquisa e revalidado após o design.*

- PASS: MMS continua fonte externa; arquivo e evidências originais são
  preservados.
- PASS: o escopo é o módulo de importação já aprovado e não cria ocorrência,
  custo, BI, parser, upload ou integração automática.
- PASS: persistência/autorização usam Supabase Auth, PostgreSQL, RLS e RPCs
  estreitas.
- PASS: tabelas/campos novos usam português `snake_case`; ações críticas usam
  `historico_auditoria`; status Cancelado não é soft delete.
- PASS: permissões são expressas por perfil, nível de vínculo e posto.
  Operador `operacional` corrige staging; não conclui, reprocessa ou desfaz.
- PASS: ocorrências e custos não são criados; vínculos existentes/futuros são
  apenas bloqueadores do desfazer.
- PASS: `raw_json`, `json_normalizado`, chave operacional, `removido` e
  reativação são reutilizados sem redefinição.
- PASS: interface segue `design-system/readme.md`, PT-BR, acessibilidade e
  desktop-first.
- PASS: os dois conflitos materiais foram resolvidos na especificação: Q1-B e
  Q2-A. Nenhum gate permanece aberto.

## Project Structure

### Documentation (this feature)

```text
specs/007-gestao-importacoes-mms/
|-- spec.md
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- checklists/
|   `-- requirements.md
`-- contracts/
    |-- query-contract.md
    |-- correction-reprocess-contract.md
    |-- undo-contract.md
    |-- security-audit-contract.md
    `-- ui-workflow-contract.md
```

### Source Code (repository root)

```text
src/
|-- app/
|   |-- router.tsx
|   `-- routes.ts
`-- modules/
    `-- importacoes-mms/
        |-- components/
        |   |-- LotFilters.tsx
        |   |-- LotsTable.tsx
        |   |-- LotSummary.tsx
        |   |-- LotItemsTabs.tsx
        |   |-- CorrectionEditor.tsx
        |   |-- ReprocessDialog.tsx
        |   `-- UndoImportDialog.tsx
        |-- pages/
        |   |-- ImportListPage.tsx
        |   |-- ImportDetailPage.tsx
        |   |-- ImportTreatmentPage.tsx
        |   `-- NewImportPage.tsx
        |-- lot-service.ts
        |-- treatment-service.ts
        |-- import-service.ts
        `-- types.ts

tests/
|-- integration/
|   `-- importacoes-mms/
|       |-- lot-list.test.tsx
|       |-- lot-detail.test.tsx
|       |-- correction-flow.test.tsx
|       |-- reprocess-flow.test.tsx
|       `-- undo-flow.test.tsx
`-- unit/
    `-- importacoes-mms/

supabase/
|-- migrations/
|   `-- <timestamp>_gestao_importacoes_mms.sql
|-- policies/
|   `-- gestao_importacoes_mms.md
|-- seed/
|   `-- gestao_importacoes_mms.sql
`-- tests/
    |-- gestao_importacoes_mms_consulta_rls.sql
    |-- gestao_importacoes_mms_correcao.sql
    |-- gestao_importacoes_mms_concorrencia.sql
    |-- gestao_importacoes_mms_reprocessamento.sql
    |-- gestao_importacoes_mms_desfazer.sql
    |-- gestao_importacoes_mms_atomicidade.sql
    `-- gestao_importacoes_mms_auditoria.sql
```

**Structure Decision**: manter a SPA única e estender o módulo
`importacoes-mms`. A rota atual vira central; o fluxo da Spec 006 passa para
`/nova`. Não criar backend/Edge Function. Consultas seguras e mutações atômicas
ficam em RPCs PostgreSQL, com funções auxiliares privadas e testes SQL remotos.

## Phase 0: Research

Pesquisa consolidada em `specs/007-gestao-importacoes-mms/research.md`.

Decisões principais:

- RPCs para projeções multi-posto, correção e operações críticas.
- Correções append-only com `json_efetivo` calculado.
- Versão esperada + `FOR UPDATE` para concorrência.
- Ledger operacional separado da auditoria para idempotência e retomada.
- Reprocessamento por versão de tratamento.
- Desfazer somente o lote efetivo mais recente, reconstruído por posto/data.
- Testes SQL transacionais no projeto remoto, sem Docker.

## Phase 1: Design

Artefatos:

- `specs/007-gestao-importacoes-mms/data-model.md`
- `specs/007-gestao-importacoes-mms/contracts/query-contract.md`
- `specs/007-gestao-importacoes-mms/contracts/correction-reprocess-contract.md`
- `specs/007-gestao-importacoes-mms/contracts/undo-contract.md`
- `specs/007-gestao-importacoes-mms/contracts/security-audit-contract.md`
- `specs/007-gestao-importacoes-mms/contracts/ui-workflow-contract.md`
- `specs/007-gestao-importacoes-mms/quickstart.md`

## Post-Design Constitution Check

- PASS: novas entidades guardam somente correções/estado operacional necessário;
  nenhuma fonte oficial paralela foi criada.
- PASS: projeção efetiva não altera arquivo, `raw_json` ou `json_normalizado`.
- PASS: RLS, projeções por RPC e cobertura integral do arquivo evitam vazamento
  em lotes multi-posto.
- PASS: funções privilegiadas têm ator derivado, `search_path` fixo e grants
  mínimos.
- PASS: concorrência, idempotência e subtransações evitam duplicidade ou estado
  parcial.
- PASS: desfazer restaura por posto/data, bloqueia dependências e não executa
  delete físico.
- PASS: auditoria central permanece única; ledger não é histórico paralelo.
- PASS: o desenho preserva a regra de `removido`, chave MMS e status oficiais.
- PASS: frontend reutiliza rotas, componentes e design system desktop-first.
- PASS: nenhuma violação constitucional ou `NEEDS CLARIFICATION` permanece.

## Complexity Tracking

Nenhuma violação constitucional requer justificativa.
