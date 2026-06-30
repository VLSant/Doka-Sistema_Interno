# Implementation Plan: Assistências MMS — Consulta, Detalhe e Correção Controlada

**Branch**: `codex/spec-008-assistencias-mms` | **Date**: 2026-06-30 | **Spec**: `specs/008-assistencias-mms-interface/spec.md`

**Input**: Feature specification from `specs/008-assistencias-mms-interface/spec.md`

## Summary

Transformar `/app/assistencias-mms` no acesso operacional ao espelho da Spec
004: lista paginada e filtrável, detalhe em dois níveis, valores importado,
corrigido e vigente, histórico e navegação ao lote de origem.

A SPA React ganhará um módulo próprio e consumirá RPCs PostgreSQL estreitas.
Uma migration estenderá assistências e partes com versão monotônica para
concorrência, criará índices de filtro/busca/cursor e exporá projeções seguras
para lista, detalhe, histórico e correção. Correções continuarão nas colunas
aprovadas da Spec 004 e no `historico_auditoria`; não será criada fonte paralela
de histórico nem alterado `raw_json`.

## Technical Context

**Language/Version**: TypeScript 5.9, React 19.2 e Node.js 24 LTS para SPA e
tooling; SQL PostgreSQL/PL/pgSQL no Supabase PostgreSQL 17.

**Primary Dependencies**: Vite 8.1, React Router 7.18,
`@supabase/supabase-js` 2.108.2 e componentes existentes do design system.
Nenhuma dependência runtime nova é necessária.

**Storage**: PostgreSQL existente para `mms_assistencias`,
`mms_partes_assistencia`, lotes, linhas, usuários, postos e
`historico_auditoria`. Não haverá tabela nova de domínio; a migration adicionará
controle de versão e índices.

**Testing**: Vitest 4.1 e React Testing Library para serviços/componentes;
testes SQL transacionais no projeto remoto de desenvolvimento; lint do schema e
advisors Supabase. Navegação E2E, teclado, foco e layouts serão validados
manualmente pelo usuário.

**Target Platform**: Navegadores desktop modernos em 1280×720 e 1440×900; SPA
estática conectada ao Supabase hospedado.

**Project Type**: Aplicação web SPA com backend transacional PostgreSQL exposto
por Data API/RPC autenticada.

**Performance Goals**: Listagem e filtros apresentam resultado ou progresso em
até 2 s em 95% das medições com 10.000 assistências; páginas de 50 itens, máximo
100; detalhe e histórico permanecem paginados quando a coleção cresce.

**Constraints**: `raw_json` e `raw_json_resumo` imutáveis; allowlist restrita a
quatro campos; sem Edge Function/backend separado; sem service role no
navegador; sem Docker local obrigatório; autorização no banco; `removido`
oculto por padrão e distinto de soft delete.

**Scale/Scope**: Duas rotas, um módulo frontend, uma migration, quatro RPCs
públicas, duas entidades existentes estendidas, quatro contratos e cobertura de
até 10.000 assistências por consulta operacional.

## Constitution Check

*GATE: aprovado antes da pesquisa e revalidado após o design.*

- PASS: A MMS continua fonte oficial; a interface apenas consulta o espelho e
  preserva valores importados e evidência original.
- PASS: Persistência, autenticação e autorização reutilizam Supabase Auth,
  PostgreSQL, RLS e RPCs autenticadas.
- PASS: Campos e funções novos usam português `snake_case`; correções continuam
  no `historico_auditoria` e nenhum histórico paralelo é criado.
- PASS: Leitura e correção são definidas por perfil, nível do vínculo e posto;
  Operador `consulta` não corrige e Operador `operacional` corrige apenas seu
  escopo.
- PASS: Ocorrências, reclamações, deslocamentos e custos extras não são tocados.
- PASS: Chave MMS, `raw_json`, `raw_json_resumo`, importação, `removido` e
  reativação são apenas consumidos, sem mudança de regra.
- PASS: A interface seguirá `design-system/readme.md`, PT-BR, acessibilidade e
  desktop-first.
- PASS: Não há conflito com constituição, README ou contratos das Specs 001–007.

## Project Structure

### Documentation (this feature)

```text
specs/008-assistencias-mms-interface/
|-- spec.md
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- checklists/
|   `-- requirements.md
`-- contracts/
    |-- query-contract.md
    |-- correction-contract.md
    |-- history-origin-contract.md
    `-- ui-security-contract.md
```

### Source Code (repository root)

```text
src/
|-- app/
|   |-- router.tsx
|   `-- routes.ts
`-- modules/
    `-- assistencias-mms/
        |-- components/
        |   |-- AssistanceFilters.tsx
        |   |-- AssistanceTable.tsx
        |   |-- AssistanceSummary.tsx
        |   |-- AssistanceParts.tsx
        |   |-- EffectiveValue.tsx
        |   |-- AssistanceHistory.tsx
        |   `-- AssistanceCorrectionDialog.tsx
        |-- pages/
        |   |-- AssistanceListPage.tsx
        |   `-- AssistanceDetailPage.tsx
        |-- assistance-service.ts
        |-- assistance-state.ts
        `-- types.ts

tests/
|-- integration/
|   `-- assistencias-mms/
|       |-- assistance-list.test.tsx
|       |-- assistance-detail.test.tsx
|       |-- assistance-correction.test.tsx
|       `-- assistance-service.test.ts
`-- unit/
    `-- assistencias-mms/
        `-- assistance-state.test.ts

supabase/
|-- migrations/
|   `-- <timestamp>_interface_assistencias_mms.sql
|-- policies/
|   `-- interface_assistencias_mms.md
|-- seed/
|   `-- interface_assistencias_mms.sql
`-- tests/
    |-- assistencias_mms_interface_consulta_rls.sql
    |-- assistencias_mms_interface_correcao.sql
    |-- assistencias_mms_interface_concorrencia.sql
    |-- assistencias_mms_interface_historico.sql
    `-- assistencias_mms_interface_desempenho.sql
```

**Structure Decision**: Manter a SPA única e criar
`src/modules/assistencias-mms` como módulo separado de importações. A rota
placeholder existente se torna disponível; o link de lote reutiliza
`/app/importacoes-mms/:loteId`. Consultas e mutações ficam em RPCs PostgreSQL,
sem backend ou Edge Function.

## Phase 0: Research

Pesquisa consolidada em `specs/008-assistencias-mms-interface/research.md`.

Decisões principais:

- RPCs públicas estreitas com ator derivado da sessão e escopo revalidado.
- Revogação do `EXECUTE` autenticado nas funções privadas antigas de correção;
  a nova RPC versionada será a única entrada pública de mutação.
- Reutilização das colunas corrigidas e do `historico_auditoria`.
- Versão monotônica + lock de linha para concorrência.
- Paginação por cursor `(data_atividade desc, id desc)`.
- Busca parcial normalizada com índice trigram.
- Histórico unificado projetado sem retornar `raw_json`.
- Filtros serializados na URL e estados explícitos no frontend.

## Phase 1: Design

Artefatos:

- `specs/008-assistencias-mms-interface/data-model.md`
- `specs/008-assistencias-mms-interface/contracts/query-contract.md`
- `specs/008-assistencias-mms-interface/contracts/correction-contract.md`
- `specs/008-assistencias-mms-interface/contracts/history-origin-contract.md`
- `specs/008-assistencias-mms-interface/contracts/ui-security-contract.md`
- `specs/008-assistencias-mms-interface/quickstart.md`

## Post-Design Constitution Check

- PASS: Projeções não alteram a fonte MMS nem expõem `raw_json` por padrão.
- PASS: A migration estende somente entidades existentes e não cria fonte
  oficial ou histórico paralelo.
- PASS: RPCs revalidam usuário, perfil, vínculo e posto; rotas e capacidades de
  UI não são tratadas como autorização.
- PASS: Funções privilegiadas têm `search_path` vazio, grants mínimos, ator
  derivado e resposta neutra para recurso inacessível.
- PASS: Correções usam allowlist, versão esperada, lock e auditoria central.
- PASS: Grants antigos que aceitavam o helper amplo de leitura serão removidos,
  fechando correção por vínculo somente de consulta.
- PASS: `removido`, soft delete e status de atividade permanecem conceitos
  distintos.
- PASS: Evidência original e chaves operacionais permanecem imutáveis.
- PASS: Interface é PT-BR, acessível, desktop-first e reutiliza o design system.
- PASS: Nenhuma violação constitucional ou `NEEDS CLARIFICATION` permanece.

## Complexity Tracking

Nenhuma violação constitucional requer justificativa.
