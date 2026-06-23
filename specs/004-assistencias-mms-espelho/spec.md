# Feature Specification: Assistencias MMS - Espelho Operacional Idempotente

**Feature Branch**: `004-assistencias-mms-espelho`

**Created**: 2026-06-20

**Status**: Draft

**Input**: User description: "Refinar a SPEC 04 Assistencias MMS - Espelho Operacional Idempotente para alinhar aos documentos base do Doka, modelando o espelho MMS em dois niveis: `mms_assistencias` como servico principal e `mms_partes_assistencia` como partes do conjunto, mantendo chave operacional completa nas partes, rastreabilidade, idempotencia, RLS, auditoria, `raw_json`, removido e contratos para specs futuras."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Montar espelho MMS em assistencia principal e partes (Priority: P1)

A operacao precisa transformar linhas validas e elegiveis da importacao MMS em um espelho operacional de dois niveis: uma assistencia principal por posto/data/numero de assistencia e uma ou mais partes do conjunto vinculadas a essa assistencia.

**Why this priority**: Os documentos base tratam o numero da assistencia como servico principal e a parte do conjunto como detalhe. Sem esse agrupamento, partes diferentes duplicariam a assistencia principal e quebrariam os vinculos futuros de ocorrencias, reclamacoes e custos.

**Independent Test**: Processar linhas validas de um mesmo posto/data com o mesmo `numero_assistencia` e diferentes `parte_conjunto`; verificar que existe uma unica assistencia principal e uma parte para cada chave operacional completa.

**Acceptance Scenarios**:

1. **Given** duas linhas elegiveis com mesmo `posto_id`, `data_atividade` e `numero_assistencia`, mas `parte_conjunto` diferente, **When** o espelho e atualizado, **Then** o sistema mantem uma unica `mms_assistencias` e cria ou atualiza duas `mms_partes_assistencia`.
2. **Given** uma linha elegivel com uma combinacao nova de `posto_id`, `data_atividade` e `numero_assistencia`, **When** o espelho e atualizado, **Then** o sistema cria a assistencia principal e a parte correspondente.
3. **Given** uma linha elegivel com chave operacional completa ja existente, **When** o espelho e atualizado, **Then** o sistema atualiza a parte existente sem criar duplicidade e atualiza o resumo da assistencia principal quando aplicavel.

---

### User Story 2 - Reimportar posto/data de forma idempotente (Priority: P1)

Operador, Supervisao e Direcao/Admin precisam importar novamente o mesmo posto/data ao longo do dia sem duplicar assistencias ou partes e sem marcar registros como removidos a partir de lotes incompletos, cancelados ou com erro impeditivo.

**Why this priority**: O Doka deve refletir o espelho atual da MMS, mas apenas quando a nova importacao for confiavel o suficiente para substituir o retrato anterior daquele posto/data.

**Independent Test**: Processar uma importacao elegivel inicial e depois uma nova importacao elegivel com partes iguais, alteradas, novas e ausentes; em seguida tentar o mesmo com lotes cancelados, parciais e com erro impeditivo.

**Acceptance Scenarios**:

1. **Given** uma parte existente com a mesma chave operacional completa, **When** uma nova linha elegivel chega em importacao posterior do mesmo posto/data, **Then** a parte e atualizada e nenhuma duplicidade e criada.
2. **Given** uma nova linha elegivel com chave operacional completa inexistente, **When** o espelho e atualizado, **Then** uma nova parte e criada e vinculada a assistencia principal correta.
3. **Given** uma parte existente no espelho anterior do posto/data, **When** uma nova importacao elegivel e completa para o mesmo posto/data nao contem sua chave operacional, **Then** a parte e marcada como `removido`.
4. **Given** uma parte marcada como `removido`, **When** ela reaparece em uma importacao elegivel posterior, **Then** a parte e reativada e atualizada com rastreabilidade do novo lote/linha.
5. **Given** um lote cancelado, com erro impeditivo, incompleto ou parcial, **When** ele e processado ou revisado, **Then** ele nao marca partes ausentes como `removido`.

---

### User Story 3 - Corrigir dados importados sem perder evidencia MMS (Priority: P1)

Usuarios autorizados precisam corrigir valores operacionais importados quando permitido pelo MVP, preservando o `raw_json` original, distinguindo valores importados de valores corrigidos e mantendo rastreabilidade de cada mudanca.

**Why this priority**: A MMS continua sendo a evidencia original, mas a operacao pode precisar corrigir dados no Doka. Sem separacao clara, uma correcao manual poderia apagar o que veio da MMS ou ser sobrescrita sem explicacao por nova importacao.

**Independent Test**: Corrigir um campo operacional importado, reimportar a mesma chave com valor MMS diferente e verificar que `raw_json`, valor importado, valor corrigido, valor visivel e historico permanecem distinguiveis.

**Acceptance Scenarios**:

1. **Given** uma parte importada com `raw_json`, **When** um usuario autorizado corrige um valor operacional, **Then** o `raw_json` permanece intacto e a correcao fica distinguivel do valor importado.
2. **Given** um campo com valor importado e valor corrigido ativo, **When** o registro e consultado em fluxo operacional, **Then** o valor visivel segue a precedencia definida nesta especificacao.
3. **Given** uma nova importacao para uma parte corrigida, **When** o valor importado muda, **Then** o sistema preserva historico da nova importacao e nao apaga a correcao sem rastreabilidade.

---

### User Story 4 - Consultar espelho por perfil e posto (Priority: P1)

Usuarios autenticados precisam acessar assistencias e partes MMS apenas conforme seu perfil operacional e escopo de postos.

**Why this priority**: Assistencias importadas contem dados operacionais e dados de cliente; RLS por perfil/posto e uma barreira constitucional do MVP.

**Independent Test**: Criar assistencias e partes para multiplos postos e validar que Operador, Supervisao, Direcao/Admin e usuarios sem perfil ativo veem exatamente o escopo permitido.

**Acceptance Scenarios**:

1. **Given** um Operador vinculado ao Posto A, **When** consulta `mms_assistencias` e `mms_partes_assistencia`, **Then** visualiza apenas registros do Posto A.
2. **Given** uma Supervisao com escopo nos Postos A e B, **When** consulta o espelho MMS, **Then** visualiza apenas assistencias e partes desses postos.
3. **Given** um usuario Direcao/Admin, **When** consulta o espelho MMS, **Then** visualiza assistencias e partes de todos os postos.
4. **Given** um usuario autenticado sem perfil operacional ativo, **When** tenta consultar o espelho MMS, **Then** o acesso e bloqueado.

---

### User Story 5 - Auditar mudancas do espelho MMS (Priority: P2)

Direcao/Admin e Supervisao precisam rastrear criacao, atualizacao por importacao, correcao manual, cancelamento aplicavel, marcacao como removido e reativacao por reaparecimento.

**Why this priority**: O espelho MMS sera base para ocorrencias, reclamacoes, custos e produtividade; toda mudanca precisa explicar origem, ator, lote, linha e valores alterados.

**Independent Test**: Executar criacao, atualizacao por reimportacao, correcao, marcacao como removido e reativacao, validando eventos correspondentes em `historico_auditoria`.

**Acceptance Scenarios**:

1. **Given** uma assistencia principal e parte criadas por importacao, **When** a criacao e concluida, **Then** o historico registra entidade, acao, lote, linha, usuario responsavel e valores novos.
2. **Given** uma parte atualizada por nova importacao, **When** algum valor rastreado muda, **Then** o historico registra valores anteriores, valores novos e lote/linha responsaveis.
3. **Given** uma correcao manual autorizada, **When** ela e salva, **Then** o historico registra valor anterior, valor corrigido, ator e contexto sem sobrescrever `raw_json`.
4. **Given** uma parte ausente em nova importacao elegivel e completa, **When** ela e marcada como `removido`, **Then** o historico registra a marcacao e o lote que causou a mudanca.

### Edge Cases

- Linha elegivel sem `posto_id`, `data_atividade`, `numero_assistencia` ou `parte_conjunto` nao pode atualizar o espelho.
- Duas linhas do mesmo lote possuem a mesma chave operacional completa.
- Um lote com status `erro` contem algumas linhas validas, mas nao pode marcar ausentes como `removido`.
- Lote `cancelado`, incompleto ou parcial tenta alterar o espelho atual.
- Parte removida reaparece em importacao elegivel posterior.
- Assistencia principal fica sem nenhuma parte ativa apos marcacoes como `removido`.
- Assistencia principal possui partes com status de atividade diferentes.
- Correcao manual existe e nova importacao traz valor MMS divergente.
- Linha referencia posto inexistente, inativo ou removido logicamente.
- Usuario tenta consultar ou corrigir registro fora do escopo de posto.
- `raw_json` contem campos que nao viram colunas proprias.
- Falha durante processamento nao deve deixar o espelho parcial considerado concluido.
- Ocorrencia, reclamacao ou custo futuro tenta vincular diretamente a uma parte sem assistencia principal.

## Requirements *(mandatory)*

### Constitution Alignment *(mandatory)*

- A feature permanece dentro do MVP e cria apenas o espelho operacional de assistencias importadas da MMS.
- A feature nao substitui a MMS; a MMS continua sendo a fonte oficial e o Doka reflete dados importados.
- A feature modela o espelho em dois niveis: `mms_assistencias` para o servico principal e `mms_partes_assistencia` para as partes do conjunto.
- A feature mantem a chave operacional MMS completa `posto_id + data_atividade + numero_assistencia + parte_conjunto` como chave idempotente das partes do conjunto.
- A feature nao cria uma assistencia principal duplicada para cada parte.
- A feature depende da Spec 01 para usuarios, postos, vinculos usuario/posto, perfis, RLS e `historico_auditoria`.
- A feature depende da Spec 03 refinada para `mms_lotes_importacao`, `mms_linhas_importacao`, `raw_json`, campos candidatos normalizados e status elegiveis de lote e linha.
- A feature define que apenas lotes e linhas validos e elegiveis podem atualizar o espelho operacional.
- A feature define que lotes cancelados, com erro impeditivo, incompletos ou parciais nao podem marcar registros ausentes como `removido`.
- A feature preserva `raw_json`, distingue valores importados de valores corrigidos e registra historico das mudancas.
- A feature define comportamento por perfil e posto: Operador e Supervisao acessam apenas seu escopo, Direcao/Admin tem visao global e usuario sem perfil ativo nao acessa.
- A feature usa portugues em `snake_case`, chaves primarias `id` e chaves estrangeiras com sufixo `_id`.
- A ausencia em nova importacao elegivel deve usar marcacao operacional `removido`, sem exclusao fisica.
- Soft delete so se aplica a exclusao logica excepcional e nao substitui `status_interno`.
- A feature registra acoes criticas em `historico_auditoria`.
- A feature nao cria parsing/upload de arquivo, tratamento de erro da importacao, ocorrencias, reclamacoes, tarefas, custos extras, dashboard, telas finais ou integracao automatica MMS.

### Scope Boundaries

- This feature includes `mms_assistencias`, `mms_partes_assistencia`, traceability to import batches and lines, idempotent mirror update rules, RLS behavior, audit expectations and SQL validation coverage.
- This feature consumes eligible import data from Spec 03; it does not parse files, upload files, treat import errors or decide final import eligibility outside the Spec 03 contract.
- This feature prepares contracts for future ocorrencias, reclamacoes and custos to link obligatorily to the principal assistance, with optional reference to a part when applicable.
- This feature does not create ocorrencias, reclamacoes, tarefas, custos extras, dashboards, final screens or automatic MMS integration.

### Functional Requirements

- **FR-001**: The system MUST maintain `mms_assistencias` as the principal imported MMS service record.
- **FR-002**: `mms_assistencias` MUST be grouped by `posto_id`, `data_atividade` and `numero_assistencia`.
- **FR-003**: The system MUST prevent duplicate active principal assistance records for the same `posto_id`, `data_atividade` and `numero_assistencia`.
- **FR-004**: The system MUST maintain `mms_partes_assistencia` as the set of parts linked to a principal assistance.
- **FR-005**: Each `mms_partes_assistencia` record MUST be linked to exactly one `mms_assistencias` record.
- **FR-006**: Each part MUST be identified by `parte_conjunto` within its principal assistance.
- **FR-007**: The complete MMS operational key `posto_id + data_atividade + numero_assistencia + parte_conjunto` MUST be enforced as the idempotent key for parts.
- **FR-008**: The complete MMS operational key MUST NOT create one principal assistance per part.
- **FR-009**: `mms_assistencias` MUST include at minimum `posto_id`, `data_atividade`, `numero_assistencia`, `status_interno`, `status_atividade`, `tipo_atividade_original` or principal source type when available, `tipo_atividade_normalizado`, creation lot/line reference, latest lot/line reference, `raw_json_resumo` and audit/control fields.
- **FR-010**: `mms_partes_assistencia` MUST include at minimum its assistance link, `parte_conjunto`, `status_interno`, `status_atividade`, `tipo_atividade_original`, `tipo_atividade_normalizado`, creation lot/line reference, latest lot/line reference, `raw_json` and audit/control fields.
- **FR-011**: `raw_json_resumo` in `mms_assistencias` MUST preserve enough original MMS evidence to explain the principal service summary without replacing part-level `raw_json`.
- **FR-012**: `raw_json` in `mms_partes_assistencia` MUST preserve the original MMS row data from the source import line.
- **FR-013**: The system MUST preserve traceability to the lote and linha that created each principal assistance when available.
- **FR-014**: The system MUST preserve traceability to the lote and linha that most recently updated each principal assistance when available.
- **FR-015**: The system MUST preserve traceability to the lote and linha that created each part.
- **FR-016**: The system MUST preserve traceability to the lote and linha that most recently updated each part.
- **FR-017**: Only import lots with eligible final status from Spec 03 MAY update the operational mirror.
- **FR-018**: Only import lines with eligible line state from Spec 03 MAY create or update principal assistances or parts.
- **FR-019**: Lots or lines that are canceled, have blocking errors, are incomplete or are partial MUST NOT update the current mirror.
- **FR-020**: Lots or lines that are canceled, have blocking errors, are incomplete or are partial MUST NOT mark missing assistances or parts as `removido`.
- **FR-020A**: A lot with official status `importado` MAY update the mirror and MAY mark absent records as `removido` when it is complete for the posto/data.
- **FR-020B**: A lot with official status `importado_com_alertas` MAY update the mirror and MAY mark absent records as `removido` only when alerts are non-blocking and the lot is complete for the posto/data.
- **FR-020C**: A lot with official status `erro` or `cancelado` MUST NOT update the mirror and MUST NOT mark absent records as `removido`.
- **FR-021**: Reprocessing the same eligible lot/line input MUST NOT create duplicate principal assistances.
- **FR-022**: Reprocessing the same eligible lot/line input MUST NOT create duplicate parts.
- **FR-023**: When an eligible line refers to an existing principal assistance, the system MUST reuse that principal assistance.
- **FR-024**: When an eligible line refers to a missing principal assistance, the system MUST create it before creating or updating the part.
- **FR-025**: When an eligible line has an existing complete operational key, the system MUST update the existing part.
- **FR-026**: When an eligible line has a new complete operational key, the system MUST create a new part linked to the correct principal assistance.
- **FR-027**: When a part existed in the previous mirror for a posto/data and its complete operational key is absent from a new eligible complete import for that same posto/data, the system MUST mark the part as `removido`.
- **FR-028**: When all parts of a principal assistance become `removido` because of an eligible complete import, the principal assistance MUST also reflect `status_interno = removido`.
- **FR-029**: When at least one part of a principal assistance remains active or reappears, the principal assistance MUST reflect the current mirror and not remain incorrectly `removido`.
- **FR-030**: If a previously `removido` part appears again in a later eligible import, the system MUST reactivate and update that part.
- **FR-031**: If a previously `removido` principal assistance receives an active or reactivated part, the system MUST reactivate or update the principal assistance.
- **FR-032**: Marking a principal assistance or part as `removido` MUST NOT physically delete it.
- **FR-033**: Operational default consultations MUST hide `removido` records unless the flow explicitly includes removed or audit records.
- **FR-034**: Administrative audit consultations MAY include `removido` records when authorized.
- **FR-035**: MMS `status_atividade` MUST remain separate from internal `status_interno`.
- **FR-036**: `status_interno` MUST support at least `ativo` and `removido`.
- **FR-037**: The system MUST NOT use soft delete to represent absence from a new MMS import.
- **FR-038**: Soft delete, when used for exceptional logical deletion, MUST use `deleted_at`, `deleted_by` and `delete_reason`.
- **FR-039**: Records with `deleted_at` filled MUST be hidden from operational default consultations.
- **FR-040**: The system MUST support authorized manual correction of imported operational fields without overwriting `raw_json` or `raw_json_resumo`.
- **FR-041**: Imported values and corrected values MUST be distinguishable for fields that support correction.
- **FR-042**: The visible operational value MUST use the corrected value when an active correction exists; otherwise it MUST use the latest eligible imported value.
- **FR-043**: A new eligible import MUST update latest imported values and traceability even when an active correction continues to define the visible value.
- **FR-044**: A new eligible import MUST NOT erase an active correction without audit history and an explicit correction-resolution action.
- **FR-045**: Manual correction MUST retain previous visible value, imported value when relevant, corrected value, actor, timestamp and reason or context.
- **FR-046**: Future ocorrencias, reclamacoes and custos MUST link obligatorily to the principal `mms_assistencias` record.
- **FR-047**: Future ocorrencias, reclamacoes and custos MAY also reference `mms_partes_assistencia` when the issue or cost applies to a specific part.
- **FR-048**: The assistance mirror contract MUST allow future consumers to find all parts for a principal assistance.
- **FR-049**: Operador MUST be able to consult assistances and parts only for linked postos.
- **FR-050**: Operador MAY correct imported assistance data only within linked postos when the MVP permission model allows editing of imported data.
- **FR-051**: Operador MUST NOT consult or correct assistances or parts outside linked postos.
- **FR-052**: Supervisao MUST be able to consult and correct assistances and parts only within its posto scope.
- **FR-053**: Supervisao MUST NOT consult or correct assistances or parts outside its posto scope.
- **FR-054**: Direcao/Admin MUST be able to consult, correct and audit assistances and parts across all postos.
- **FR-055**: Users without an active operational profile MUST NOT access assistances or parts.
- **FR-056**: The system MUST enforce profile and posto access at the data access level.
- **FR-057**: Creation of principal assistances and parts from MMS MUST generate centralized audit history.
- **FR-058**: Update of principal assistances and parts by new eligible import MUST generate centralized audit history when tracked values change.
- **FR-059**: Manual correction MUST generate centralized audit history.
- **FR-060**: Marking a principal assistance or part as `removido` MUST generate centralized audit history.
- **FR-061**: Reactivation by reappearance in an eligible import MUST generate centralized audit history.
- **FR-062**: Cancellation effects that change a mirrored record MUST generate centralized audit history.
- **FR-063**: Audit history MUST identify entity type, entity id, action, actor, timestamp, previous values, new values, import batch context and import line context when applicable.
- **FR-064**: Failed or blocked operations MUST NOT create misleading success audit events.
- **FR-065**: The feature MUST provide SQL validation coverage for idempotence of principal assistances.
- **FR-066**: The feature MUST provide SQL validation coverage for idempotence and duplicate prevention of parts by complete operational key.
- **FR-067**: The feature MUST provide SQL validation coverage for RLS by profile and posto.
- **FR-068**: The feature MUST provide SQL validation coverage for `raw_json` and `raw_json_resumo` preservation.
- **FR-069**: The feature MUST provide SQL validation coverage for `removido` marking, non-marking from ineligible lots and reactivation by reappearance.
- **FR-070**: The feature MUST provide SQL validation coverage for audit events.
- **FR-071**: The feature MUST NOT create parsing/upload of file, import error treatment, ocorrencias, reclamacoes, tarefas, custos extras, dashboard, final screens or automatic MMS integration.

### Permission Rules

| Actor | `mms_assistencias` | `mms_partes_assistencia` |
| --- | --- | --- |
| Sem perfil ativo | Sem acesso | Sem acesso |
| Operador | Consulta e correcao permitida apenas nos postos vinculados, conforme regra MVP de edicao de dados importados | Consulta e correcao permitida apenas nas partes das assistencias acessiveis |
| Supervisao | Consulta e correcao apenas nos postos do escopo operacional | Consulta e correcao apenas nas partes das assistencias do escopo |
| Direcao/Admin | Consulta, correcao e auditoria global | Consulta, correcao e auditoria global |

### Data Validation Rules

- `mms_assistencias` uses `posto_id + data_atividade + numero_assistencia` as the principal service identity.
- `mms_partes_assistencia` uses `posto_id + data_atividade + numero_assistencia + parte_conjunto` as the complete idempotent operational key, inherited through the linked assistance plus `parte_conjunto`.
- Eligible lots are `importado` and complete `importado_com_alertas`; ineligible lots include `erro`, `cancelado`, incomplete lots, partial lots and lots with unresolved blocking errors.
- Eligible lines must be valid for transformation according to Spec 03, have the normalized candidate fields required by the mirror and have no blocking error attached.
- `numero_assistencia` and `parte_conjunto` MUST be normalized enough to prevent duplicate keys caused only by leading/trailing spaces or inconsistent letter case.
- The system MUST reject or quarantine eligible mirror updates when required candidate fields from Spec 03 are missing.
- A new eligible complete import for a posto/data is the only event that can mark absent parts from that same posto/data as `removido`.
- Lotes and linhas with canceled, blocking-error, incomplete, partial or otherwise ineligible status MUST NOT update the current mirror and MUST NOT mark absent records as `removido`.
- `raw_json` MUST preserve original MMS column names and values received from the source import line.
- `raw_json_resumo` MUST be derived from imported evidence and remain auditable; it MUST NOT erase part-level `raw_json`.
- Corrected values MUST NOT replace preserved original `raw_json` or `raw_json_resumo`.
- The visible value precedence is: active corrected value first; otherwise latest eligible imported value.
- When a corrected field receives a new imported value, both the new imported value and the existing correction MUST remain traceable until an authorized action changes or resolves the correction.

### Audit Events

- `mms_assistencias` MUST emit audit events for `criado`, `atualizado_por_importacao`, `corrigido`, `marcado_removido`, `reativado_por_importacao`, `cancelado_quando_aplicavel` and `soft_delete_registrado` when applicable.
- `mms_partes_assistencia` MUST emit audit events for `criado`, `atualizado_por_importacao`, `corrigido`, `marcado_removido`, `reativado_por_importacao`, `cancelado_quando_aplicavel` and `soft_delete_registrado` when applicable.
- Audit events MUST use `historico_auditoria` from Spec 01.
- Audit events caused by import processing MUST include import batch and line context when available.

### Future Consumer Contract

- Future ocorrencias MUST reference `mms_assistencias` obligatorily.
- Future reclamacoes MUST reference `mms_assistencias` obligatorily.
- Future custos extras MUST reference `mms_assistencias` obligatorily.
- Future ocorrencias, reclamacoes and custos MAY reference `mms_partes_assistencia` when the event applies to a specific part of the service.
- Future consumers MUST NOT treat a part as a replacement for the principal assistance link.

### Key Entities *(include if feature involves data)*

- **mms_assistencias**: Principal MMS service imported into the Doka mirror. It represents one service by `posto_id`, `data_atividade` and `numero_assistencia`, stores current internal status, imported activity status/type summary, lot/line traceability, `raw_json_resumo`, correction visibility metadata when applicable and audit/control fields.
- **mms_partes_assistencia**: Part of a principal MMS assistance. It is linked to `mms_assistencias`, identified by `parte_conjunto`, and is idempotent by the complete MMS operational key. It stores imported values, corrected values when applicable, `raw_json`, lot/line traceability and audit/control fields.
- **mms_lotes_importacao**: Import batch from Spec 03. This feature consumes only lots whose status and completeness are eligible for mirror update.
- **mms_linhas_importacao**: Import line from Spec 03. This feature consumes only lines with eligible state and normalized candidate fields required for the mirror.
- **Posto**: Existing operational entity from Spec 01 used as the main access and mirror scope.
- **Usuario Operacional**: Existing entity from Spec 01 used to identify actor profile and posto scope.
- **Historico de Auditoria**: Existing centralized audit entity from Spec 01 used for critical action tracking.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In validation flows, 100% of eligible lines with the same `posto_id`, `data_atividade` and `numero_assistencia` create or update exactly one principal assistance.
- **SC-002**: In validation flows, 100% of eligible lines with distinct `parte_conjunto` create or update distinct parts under the same principal assistance.
- **SC-003**: Reprocessing the same eligible import input 3 times results in zero duplicate principal assistances and zero duplicate parts.
- **SC-004**: In a reimport test with unchanged, changed, new and missing parts, 100% of expected parts are respectively preserved, updated, created and marked `removido`.
- **SC-005**: 100% of tested canceled, blocking-error, incomplete or partial lots fail to mark absent records as `removido`.
- **SC-006**: 100% of tested removed parts that reappear in eligible imports are reactivated with updated traceability.
- **SC-007**: 100% of tested operational records preserve `raw_json` or `raw_json_resumo` and import batch/line traceability.
- **SC-008**: 100% of tested manual corrections preserve original raw evidence, distinguish imported and corrected values, and follow the visible-value precedence rule.
- **SC-009**: In RLS tests with at least 3 postos and 3 profiles, Operador and Supervisao see 0 assistances or parts outside their authorized posto scope.
- **SC-010**: Direcao/Admin can inspect current and removed assistances and parts across all postos in administrative audit validation.
- **SC-011**: 100% of users without active operational profile are blocked from assistance and part access.
- **SC-012**: 100% of tested creation, import update, correction, removal marking and reactivation actions produce centralized audit history when they succeed.
- **SC-013**: No out-of-scope module listed in this spec is introduced by the feature.

## Assumptions

- Spec 01 is already available, including `usuarios`, `postos`, `usuarios_postos`, permission helper functions, RLS conventions and centralized audit history.
- Spec 03 is already refined and provides `mms_lotes_importacao`, `mms_linhas_importacao`, preserved `raw_json`, normalized candidate fields and eligible lot/line status definitions.
- Import parsing, upload, invalid-line treatment and import error correction belong to Spec 03 or later import-specific workflows, not to this feature.
- This feature receives only lots and lines whose eligibility can be determined from Spec 03 contracts.
- The canonical operational mirror is scoped by one posto and one `data_atividade` at a time.
- `removido` means absent from the latest eligible and complete MMS import for the same posto/data; it is not a soft delete and is not the same as a canceled MMS activity status.
- Principal assistance status can be summarized from its parts, but the exact summary rule may be detailed in the implementation plan as long as it does not duplicate principal assistances or hide part-level evidence.
- Future occurrence, complaint, task, cost and dashboard specs will consume this assistance mirror through documented contracts, but those modules are outside this feature.
