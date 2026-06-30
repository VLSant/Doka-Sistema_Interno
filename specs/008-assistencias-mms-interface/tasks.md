# Tasks: Assistências MMS — Consulta, Detalhe e Correção Controlada

**Input**: Design documents from `specs/008-assistencias-mms-interface/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`,
`contracts/`, `quickstart.md`

**Tests**: A especificação exige cobertura de RLS, concorrência, evidência,
histórico, estados de interface, acessibilidade e desempenho. As tarefas de
teste devem ser escritas e falhar antes da implementação correspondente.

**Organization**: As tarefas são agrupadas por história para permitir
implementação e validação incremental.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode executar em paralelo por atuar em arquivo independente.
- **[Story]**: História correspondente (`US1` a `US5`).
- Todas as tarefas incluem caminho de arquivo ou diretório explícito.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Preparar migration, módulo e fixtures sem alterar comportamento.

- [X] T001 Gerar a migration `interface_assistencias_mms` com `npx supabase migration new interface_assistencias_mms` em `supabase/migrations/`
- [X] T002 Criar o esqueleto do módulo com exports mínimos em `src/modules/assistencias-mms/types.ts`, `src/modules/assistencias-mms/assistance-service.ts` e `src/modules/assistencias-mms/assistance-state.ts`
- [X] T003 [P] Criar builders de respostas e clientes Supabase mockados em `tests/helpers/assistencias-mms-fixtures.ts`
- [X] T004 [P] Criar dados determinísticos para dois postos, múltiplas partes, removidos, correções e lotes em `supabase/seed/interface_assistencias_mms.sql`
- [X] T005 [P] Criar o documento-base de policies e invariantes em `supabase/policies/interface_assistencias_mms.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Estabelecer versão, autorização estrita, grants e modelos
compartilhados que bloqueiam todas as histórias.

**⚠️ CRITICAL**: Nenhuma história deve começar antes desta fase.

- [X] T006 Escrever testes SQL inicialmente falhos para colunas de versão, triggers, RLS e grants em `supabase/tests/assistencias_mms_interface_schema.sql`
- [X] T007 Adicionar `pg_trgm`, `versao_registro` e triggers monotônicos em assistência e parte na migration criada em `supabase/migrations/`
- [X] T008 Implementar helper privado de correção por perfil, nível de vínculo e posto e revogar `EXECUTE` autenticado das funções legadas na migration criada em `supabase/migrations/`
- [X] T009 Implementar helpers privados compartilhados para normalização, valor vigente, cursores e respostas neutras na migration criada em `supabase/migrations/`
- [X] T010 [P] Definir filtros, cursores, valores efetivos, capacidades, entidades e erros estáveis em `src/modules/assistencias-mms/types.ts`
- [X] T011 Implementar cliente RPC compartilhado e mapeamento de erros em `src/modules/assistencias-mms/assistance-service.ts`
- [X] T012 Implementar parsing/serialização de filtros, cursores e estados discriminados em `src/modules/assistencias-mms/assistance-state.ts`
- [X] T013 [P] Completar fixtures frontend para perfis, vínculos, lista, detalhe, conflito e histórico em `tests/helpers/assistencias-mms-fixtures.ts`
- [X] T014 [P] Criar testes unitários inicialmente falhos para filtros, cursores e transições de estado em `tests/unit/assistencias-mms/assistance-state.test.ts`
- [X] T015 Executar os testes fundacionais e registrar o resultado inicial em `specs/008-assistencias-mms-interface/quickstart.md`

**Checkpoint**: Versão, grants, autorização e modelos compartilhados prontos.

---

## Phase 3: User Story 1 — Localizar assistências autorizadas (Priority: P1) 🎯 MVP

**Goal**: Entregar lista protegida, filtros combináveis, busca, paginação e
`removido` oculto por padrão.

**Independent Test**: Acessar a lista com cada perfil, combinar todos os
filtros, buscar números e confirmar escopo, ordem, cursor e removidos.

### Tests for User Story 1

- [X] T016 [P] [US1] Escrever testes SQL falhos para RLS, filtros, busca, cursor, ordem e `removido` em `supabase/tests/assistencias_mms_interface_consulta_rls.sql`
- [X] T017 [P] [US1] Escrever teste SQL falho para plano e volume de 10.000 registros em `supabase/tests/assistencias_mms_interface_desempenho.sql`
- [X] T018 [P] [US1] Escrever testes falhos do serviço de lista, argumentos RPC, cursores e erros em `tests/integration/assistencias-mms/assistance-service.test.ts`
- [X] T019 [P] [US1] Escrever testes falhos da jornada de filtros, busca, carregar mais e vazios em `tests/integration/assistencias-mms/assistance-list.test.tsx`

### Implementation for User Story 1

- [X] T020 [US1] Implementar `public.listar_assistencias_mms` com escopo, filtros, cursor e totais de partes na migration criada em `supabase/migrations/`
- [X] T021 [US1] Implementar tipos e validações da resposta de lista em `src/modules/assistencias-mms/types.ts`
- [X] T022 [US1] Implementar `list` e normalização de parâmetros/resultado em `src/modules/assistencias-mms/assistance-service.ts`
- [X] T023 [P] [US1] Implementar controles acessíveis e query string em `src/modules/assistencias-mms/components/AssistanceFilters.tsx`
- [X] T024 [P] [US1] Implementar tabela acessível, situação textual e carregar mais em `src/modules/assistencias-mms/components/AssistanceTable.tsx`
- [X] T025 [US1] Implementar estados loading/refreshing/empty/error/access denied na página em `src/modules/assistencias-mms/pages/AssistanceListPage.tsx`
- [X] T026 [P] [US1] Implementar layout desktop e rolagem contida em `src/modules/assistencias-mms/pages/AssistanceListPage.css`
- [X] T027 [US1] Tornar `assistencias-mms` disponível e carregar a lista lazy em `src/app/routes.ts` e `src/app/router.tsx`
- [X] T028 [US1] Executar testes SQL e frontend da US1 e registrar resultados em `specs/008-assistencias-mms-interface/quickstart.md`

**Checkpoint**: Lista funciona isoladamente e constitui o MVP navegável.

---

## Phase 4: User Story 2 — Compreender o detalhe e suas partes (Priority: P1)

**Goal**: Exibir uma assistência principal com todas as partes autorizadas,
origem e inclusão explícita de removidos.

**Independent Test**: Abrir por navegação e URL direta assistências com uma e
várias partes, incluindo removidas, e confirmar agrupamento e proteção.

### Tests for User Story 2

- [X] T029 [US2] Acrescentar testes SQL falhos de detalhe, agrupamento, partes removidas e resposta neutra em `supabase/tests/assistencias_mms_interface_consulta_rls.sql`
- [X] T030 [P] [US2] Escrever testes falhos do serviço de detalhe e parâmetros de removidos em `tests/integration/assistencias-mms/assistance-detail-service.test.ts`
- [X] T031 [P] [US2] Escrever testes falhos de resumo, partes, toggle, URL direta e estados em `tests/integration/assistencias-mms/assistance-detail.test.tsx`

### Implementation for User Story 2

- [X] T032 [US2] Implementar `public.obter_detalhe_assistencia_mms` com projeção agrupada e capacidades na migration criada em `supabase/migrations/`
- [X] T033 [US2] Implementar tipos e validação de detalhe, parte e origem em `src/modules/assistencias-mms/types.ts`
- [X] T034 [US2] Implementar `detail` com inclusão opcional de removidos em `src/modules/assistencias-mms/assistance-service.ts`
- [X] T035 [P] [US2] Implementar cabeçalho/resumo da assistência em `src/modules/assistencias-mms/components/AssistanceSummary.tsx`
- [X] T036 [P] [US2] Implementar agrupamento, contagem e toggle de partes removidas em `src/modules/assistencias-mms/components/AssistanceParts.tsx`
- [X] T037 [US2] Implementar carregamento, erro neutro e composição do detalhe em `src/modules/assistencias-mms/pages/AssistanceDetailPage.tsx`
- [X] T038 [P] [US2] Implementar layout desktop do detalhe e conjunto em `src/modules/assistencias-mms/pages/AssistanceDetailPage.css`
- [X] T039 [US2] Registrar a rota protegida `/app/assistencias-mms/:assistenciaId` em `src/app/router.tsx`
- [X] T040 [US2] Executar testes SQL e frontend da US2 e registrar resultados em `specs/008-assistencias-mms-interface/quickstart.md`

**Checkpoint**: Detalhe em dois níveis funciona sem depender de correção ou
histórico.

---

## Phase 5: User Story 3 — Distinguir origem, correção e valor vigente (Priority: P1)

**Goal**: Tornar importado, corrigido e vigente inequívocos nos quatro campos.

**Independent Test**: Consultar campos sem correção, com correção e após nova
importação, confirmando precedência e origem.

### Tests for User Story 3

- [X] T041 [P] [US3] Escrever testes SQL falhos para precedência e nova importação preservando correção em `supabase/tests/assistencias_mms_interface_valores.sql`
- [X] T042 [P] [US3] Escrever testes falhos de apresentação, origem ausente/importada/corrigida e acessibilidade em `tests/integration/assistencias-mms/effective-value.test.tsx`

### Implementation for User Story 3

- [X] T043 [US3] Garantir projeções `{importado,corrigido,vigente,origem_vigente}` no detalhe da migration criada em `supabase/migrations/`
- [X] T044 [US3] Implementar componente reutilizável de valor e origem em `src/modules/assistencias-mms/components/EffectiveValue.tsx`
- [X] T045 [US3] Integrar valores efetivos de cliente/endereço no resumo em `src/modules/assistencias-mms/components/AssistanceSummary.tsx`
- [X] T046 [US3] Integrar descrição/recurso importados e corrigidos nas partes em `src/modules/assistencias-mms/components/AssistanceParts.tsx`
- [X] T047 [US3] Executar testes de precedência SQL/UI e registrar resultados em `specs/008-assistencias-mms-interface/quickstart.md`

**Checkpoint**: A origem de cada valor é compreensível sem habilitar edição.

---

## Phase 6: User Story 4 — Corrigir campos permitidos com controle (Priority: P1)

**Goal**: Corrigir os quatro campos da allowlist com vínculo estrito, versão,
auditoria e preservação da evidência.

**Independent Test**: Corrigir cada campo com perfis autorizados, tentar campos
e postos proibidos, simular concorrência e comparar evidência antes/depois.

### Tests for User Story 4

- [X] T048 [P] [US4] Escrever testes SQL falhos para allowlist, perfis, vínculos, removido, evidência e auditoria em `supabase/tests/assistencias_mms_interface_correcao.sql`
- [X] T049 [P] [US4] Escrever testes SQL falhos para lock, versão, repetição e importação concorrente em `supabase/tests/assistencias_mms_interface_concorrencia.sql`
- [X] T050 [P] [US4] Escrever testes falhos do serviço de correção e erros estáveis em `tests/integration/assistencias-mms/assistance-correction-service.test.ts`
- [X] T051 [P] [US4] Escrever testes falhos do diálogo, confirmação, foco, sucesso e conflito em `tests/integration/assistencias-mms/assistance-correction.test.tsx`

### Implementation for User Story 4

- [X] T052 [US4] Implementar `public.corrigir_campo_assistencia_mms` com lock, versão e autorização estrita na migration criada em `supabase/migrations/`
- [X] T053 [US4] Ajustar trigger/auditoria para registrar campo, valores, justificativa, ator e origem na migration criada em `supabase/migrations/`
- [X] T054 [US4] Implementar tipos de entrada/resultado e códigos de conflito em `src/modules/assistencias-mms/types.ts`
- [X] T055 [US4] Implementar `correctField` e mapeamento de erros em `src/modules/assistencias-mms/assistance-service.ts`
- [X] T056 [P] [US4] Implementar diálogo acessível com valor, justificativa e confirmação em `src/modules/assistencias-mms/components/AssistanceCorrectionDialog.tsx`
- [X] T057 [US4] Integrar correção de cliente/endereço por capacidade em `src/modules/assistencias-mms/components/AssistanceSummary.tsx`
- [X] T058 [US4] Integrar correção de descrição/recurso na parte correta em `src/modules/assistencias-mms/components/AssistanceParts.tsx`
- [X] T059 [US4] Implementar saving/conflict, preservação de rascunho e recarga explícita em `src/modules/assistencias-mms/pages/AssistanceDetailPage.tsx`
- [X] T060 [US4] Executar testes de correção/concorrência e registrar evidência inalterada em `specs/008-assistencias-mms-interface/quickstart.md`

**Checkpoint**: Correção controlada funciona e o caminho legado não é executável
pela SPA.

---

## Phase 7: User Story 5 — Auditar importações, correções e origem (Priority: P2)

**Goal**: Exibir linha temporal unificada e navegar ao lote sem ampliar acesso.

**Independent Test**: Abrir assistência com múltiplos lotes/correções, paginar
eventos e testar lote autorizado e bloqueado.

### Tests for User Story 5

- [X] T061 [P] [US5] Escrever testes SQL falhos de escopo, eventos, minimização, cursor e lote em `supabase/tests/assistencias_mms_interface_historico.sql`
- [X] T062 [P] [US5] Escrever testes falhos do serviço de histórico, cursor e erros em `tests/integration/assistencias-mms/assistance-history-service.test.ts`
- [X] T063 [P] [US5] Escrever testes falhos da linha temporal, paginação e link de lote em `tests/integration/assistencias-mms/assistance-history.test.tsx`

### Implementation for User Story 5

- [X] T064 [US5] Implementar `public.listar_historico_assistencia_mms` com projeção mínima e cursor na migration criada em `supabase/migrations/`
- [X] T065 [US5] Implementar tipos de evento, origem e cursor em `src/modules/assistencias-mms/types.ts`
- [X] T066 [US5] Implementar `history` e normalização de eventos em `src/modules/assistencias-mms/assistance-service.ts`
- [X] T067 [US5] Implementar linha temporal acessível e carregar mais em `src/modules/assistencias-mms/components/AssistanceHistory.tsx`
- [X] T068 [US5] Integrar histórico sob demanda ao detalhe em `src/modules/assistencias-mms/pages/AssistanceDetailPage.tsx`
- [X] T069 [US5] Implementar link para `/app/importacoes-mms/:loteId` sem transportar autorização em `src/modules/assistencias-mms/components/AssistanceHistory.tsx`
- [X] T070 [US5] Executar testes de histórico/origem e registrar resultados em `specs/008-assistencias-mms-interface/quickstart.md`

**Checkpoint**: Auditoria operacional e origem ficam consultáveis sem histórico
paralelo nem vazamento.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Consolidar segurança, documentação, acessibilidade, desempenho e
evidências de entrega.

- [X] T071 [P] Finalizar matriz de RLS, grants, RPCs, soft delete e `removido` em `supabase/policies/interface_assistencias_mms.md`
- [X] T072 [P] Completar seed de aceite com 10.000 assistências e casos de concorrência em `supabase/seed/interface_assistencias_mms.sql`
- [ ] T073 Executar manualmente rotas, filtros, detalhe, correção, histórico e perfis e registrar cada resultado em `specs/008-assistencias-mms-interface/quickstart.md`
- [ ] T074 Executar manualmente teclado, foco, nomes acessíveis e layouts 1280×720/1440×900 e registrar cada resultado em `specs/008-assistencias-mms-interface/quickstart.md`
- [X] T075 Executar `npm run typecheck`, `npm run lint`, `npm test` e `npm run build` e registrar resultados em `specs/008-assistencias-mms-interface/quickstart.md`
- [X] T076 Executar todos os testes `assistencias_mms_interface_*.sql` com rollback no projeto remoto de desenvolvimento e registrar em `specs/008-assistencias-mms-interface/quickstart.md`
- [ ] T077 Executar lint do schema e advisors Supabase de segurança/desempenho e registrar em `specs/008-assistencias-mms-interface/quickstart.md`
- [X] T078 Executar `EXPLAIN (ANALYZE, BUFFERS)` da lista/busca com 10.000 registros e registrar índices usados em `specs/008-assistencias-mms-interface/quickstart.md`
- [X] T079 Revisar migration final para RLS, `search_path`, grants mínimos, revogação legada, chave MMS e evidência imutável em `supabase/migrations/`
- [ ] T080 Consolidar as evidências E2E informadas pelo usuário e registrar pendências ou aceite final em `specs/008-assistencias-mms-interface/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependências.
- **Foundational (Phase 2)**: depende de Setup e bloqueia todas as histórias.
- **US1 (Phase 3)**: depende de Foundational.
- **US2 (Phase 4)**: depende de Foundational; integra navegação da US1, mas pode
  ser testada diretamente por URL.
- **US3 (Phase 5)**: depende da projeção de detalhe da US2.
- **US4 (Phase 6)**: backend depende de Foundational; jornada completa depende
  de US2 e US3.
- **US5 (Phase 7)**: backend depende de Foundational; integração visual depende
  de US2.
- **Polish (Phase 8)**: depende das histórias escolhidas para entrega.

### User Story Dependencies

```text
Foundational
|-- US1 Lista (MVP)
|-- US2 Detalhe
|     |-- US3 Valores
|     |     `-- US4 Correção UI
|     `-- US5 Histórico UI
|-- US4 Correção backend
`-- US5 Histórico backend
```

### Within Each User Story

- Escrever testes e confirmar falha antes da implementação.
- Implementar contrato SQL antes do serviço que o consome.
- Implementar tipos/serviço antes da página.
- Implementar componentes antes da integração final.
- Executar o checkpoint antes de avançar.

### Parallel Opportunities

- T003–T005 podem executar em paralelo.
- T010, T013 e T014 podem executar em paralelo após o modelo SQL definido.
- T016–T019 podem ser escritos em paralelo.
- T023 e T024 podem executar em paralelo.
- T030 e T031 podem executar em paralelo; T035 e T036 também.
- T041 e T042 podem executar em paralelo.
- T048–T051 podem executar em paralelo.
- T061–T063 podem executar em paralelo.
- Após Foundational, os backends de US1, US2, US4 e US5 podem ser desenvolvidos
  em paralelo, coordenando alterações no único arquivo de migration.
- T071 e T072 podem executar em paralelo; T073 e T074 são gates manuais do
  usuário após a aplicação estar disponível.

---

## Parallel Examples

### User Story 1

```text
Task T016: testes SQL de lista/RLS
Task T017: teste SQL de desempenho
Task T018: testes do serviço de lista
Task T019: testes da página de lista
```

### User Story 2

```text
Task T030: testes do serviço de detalhe
Task T031: testes da interface de detalhe
Task T035: componente de resumo
Task T036: componente de partes
```

### User Story 4

```text
Task T048: testes SQL de correção
Task T049: testes SQL de concorrência
Task T050: testes do serviço
Task T051: testes do diálogo
```

### User Story 5

```text
Task T061: testes SQL de histórico
Task T062: testes do serviço
Task T063: testes da interface
```

---

## Implementation Strategy

### MVP First

1. Concluir Setup.
2. Concluir Foundational.
3. Implementar US1.
4. Parar e validar lista, filtros, busca, cursor e RLS.
5. Demonstrar o MVP navegável antes de ampliar o detalhe.

### Incremental Delivery

1. Setup + Foundational → barreira de segurança e contratos prontos.
2. US1 → lista pesquisável.
3. US2 → detalhe agrupado.
4. US3 → origem dos valores.
5. US4 → correção controlada.
6. US5 → histórico e lote.
7. Polish → validação integral.

### Recommended Execution

Embora backends possam avançar em paralelo, a sequência recomendada para um
único executor é US1 → US2 → US3 → US4 → US5, reduzindo retrabalho na página de
detalhe e no arquivo único de migration.

## Notes

- `[P]` indica arquivo independente e ausência de dependência incompleta.
- Tasks de história sempre carregam `[USn]`.
- Migration deve ser criada pelo CLI; não inventar timestamp.
- Funções privilegiadas exigem `search_path = ''`, nomes qualificados e grants
  mínimos.
- Não usar `user_metadata`, `service_role` ou autorização apenas no frontend.
- Não alterar `raw_json`, chave MMS ou regra de `removido`.
- Operador `consulta` nunca corrige.
- Commit recomendado após cada checkpoint ou grupo lógico.
