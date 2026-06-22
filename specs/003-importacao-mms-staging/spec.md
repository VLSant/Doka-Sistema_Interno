# Feature Specification: Importacao MMS - Lotes, Staging e Validacao Bruta

**Feature Branch**: `003-importacao-mms-staging`

**Created**: 2026-06-20

**Status**: Draft

**Input**: User description: "Criar a especificacao da feature 'Importacao MMS - Lotes, Staging e Validacao Bruta' para o MVP do Doka. Objetivo: criar a base database-first para importar planilhas MMS de forma rastreavel, sem ainda criar assistencias finais. A feature deve registrar lotes de importacao, linhas importadas, dados originais em raw_json, erros, alertas, status do processamento e auditoria suficiente para rastrear cada tentativa de importacao."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Registrar lote de importacao MMS (Priority: P1)

Um usuario autorizado precisa registrar uma tentativa de importacao MMS como um lote rastreavel, contendo origem do arquivo, posto, data de atividade quando disponivel, usuario importador, status e totais de processamento.

**Why this priority**: Sem lote de importacao, a operacao nao consegue auditar quem importou, qual arquivo foi usado, para qual posto/data e qual foi o resultado geral da tentativa.

**Independent Test**: Criar lotes para postos diferentes e validar que cada lote registra origem, importador, status inicial, totais e escopo de posto sem criar assistencias finais.

**Acceptance Scenarios**:

1. **Given** um usuario autorizado com acesso ao posto, **When** ele registra uma tentativa de importacao MMS com nome de arquivo e posto, **Then** o sistema cria um lote com usuario importador, status inicial e dados de origem.
2. **Given** uma tentativa de importacao com data de atividade identificada, **When** o lote e registrado, **Then** a data de atividade fica associada ao lote.
3. **Given** uma tentativa de importacao sem data de atividade identificada no arquivo, **When** o lote e registrado, **Then** o lote permanece rastreavel e indica a ausencia desse dado como erro ou alerta conforme a severidade.
4. **Given** um usuario sem acesso ao posto, **When** tenta registrar lote para esse posto, **Then** a operacao e bloqueada.
5. **Given** uma tentativa de importacao registrada, **When** a operacao termina, **Then** o lote apresenta status final, totais de linhas, erros e alertas sem criar registros finais de assistencia.

---

### User Story 2 - Preservar linhas importadas com raw_json original (Priority: P1)

A operacao precisa preservar cada linha da planilha MMS em uma area de staging, incluindo os dados originais em `raw_json`, numero da linha, status da linha e qualquer informacao bruta necessaria para conferencia posterior.

**Why this priority**: `raw_json` e a evidencia primaria do que veio da MMS. Sem preservacao linha a linha, nao e possivel explicar divergencias, repetir validacoes ou auditar uma importacao malsucedida.

**Independent Test**: Importar um conjunto de linhas com conteudos validos, incompletos e inesperados; verificar que todas as linhas ficam associadas ao lote e preservam o dado original sem transformacao destrutiva.

**Acceptance Scenarios**:

1. **Given** um lote de importacao existente, **When** linhas MMS sao recebidas para staging, **Then** cada linha e registrada com vinculo ao lote, numero de linha e `raw_json` obrigatorio.
2. **Given** uma linha com campos MMS adicionais ou desconhecidos, **When** ela e preservada em staging, **Then** os campos originais permanecem em `raw_json`.
3. **Given** uma linha incompleta, **When** ela e registrada, **Then** o `raw_json` ainda e preservado e a linha recebe status e mensagens de validacao.
4. **Given** uma linha ja registrada em um lote, **When** alguem consulta a auditoria do lote, **Then** consegue identificar a origem bruta daquela linha.

---

### User Story 3 - Executar validacao bruta minima da MMS (Priority: P1)

O sistema precisa validar campos minimos das linhas MMS antes de qualquer transformacao final, classificando problemas como erros ou alertas e consolidando os totais no lote.

**Why this priority**: A validacao bruta permite separar arquivos utilizaveis de arquivos incompletos ou suspeitos sem criar assistencias finais prematuramente.

**Independent Test**: Processar linhas com campos obrigatorios presentes, ausentes, invalidos e inconsistentes; verificar status, erros, alertas e totais por lote e por linha.

**Acceptance Scenarios**:

1. **Given** uma linha com campos minimos presentes e coerentes, **When** a validacao bruta e executada, **Then** a linha fica marcada como valida para etapa futura de processamento.
2. **Given** uma linha sem posto identificavel, data de atividade ou numero de assistencia quando esses campos forem esperados na MMS, **When** a validacao bruta e executada, **Then** a linha recebe erro rastreavel.
3. **Given** uma linha com campo opcional ausente ou valor incomum que nao impede staging, **When** a validacao bruta e executada, **Then** a linha recebe alerta rastreavel.
4. **Given** um lote com linhas validas e invalidas, **When** a validacao termina, **Then** o lote consolida totais de linhas, validas, com erro e com alerta.
5. **Given** uma linha com erro, **When** a validacao termina, **Then** nenhuma assistencia final, ocorrencia, tarefa, custo ou dashboard e criado.

---

### User Story 4 - Consultar importacoes conforme perfil e posto (Priority: P2)

Operador, Supervisao e Direcao/Admin precisam consultar lotes e linhas de importacao conforme seus perfis e escopo de posto, preservando a regra operacional da fundacao do Doka.

**Why this priority**: Importacoes MMS contem dados operacionais por posto; o acesso precisa respeitar a mesma barreira de seguranca usada no restante do MVP.

**Independent Test**: Criar lotes para multiplos postos e usuarios dos tres perfis; validar que cada perfil visualiza somente o que seu escopo permite.

**Acceptance Scenarios**:

1. **Given** um Operador vinculado a um posto, **When** consulta lotes MMS, **Then** visualiza apenas lotes daquele posto dentro do seu escopo.
2. **Given** uma Supervisao com escopo em dois postos, **When** consulta lotes e linhas MMS, **Then** visualiza apenas importacoes desses postos.
3. **Given** Direcao/Admin, **When** consulta importacoes MMS, **Then** visualiza lotes e linhas de todos os postos.
4. **Given** usuario autenticado sem perfil operacional ativo, **When** tenta consultar lotes ou linhas MMS, **Then** o acesso e bloqueado.
5. **Given** um usuario com acesso a um lote, **When** consulta linhas desse lote, **Then** as linhas seguem o mesmo escopo do lote.

---

### User Story 5 - Auditar tentativas e acoes criticas de importacao (Priority: P2)

Direcao/Admin e Supervisao precisam rastrear criacao, processamento, falha, cancelamento, exclusao logica quando aplicavel e demais acoes criticas relacionadas a lotes e linhas de importacao MMS.

**Why this priority**: A importacao pode ser repetida varias vezes no dia; a auditoria centralizada e necessaria para explicar cada tentativa e evitar perda de evidencias.

**Independent Test**: Executar criacao, processamento, mudanca de status, registro de erro, cancelamento e exclusao logica quando aplicavel; verificar eventos correspondentes no historico centralizado.

**Acceptance Scenarios**:

1. **Given** um lote MMS criado, **When** a criacao e concluida, **Then** o historico registra entidade, acao, usuario responsavel e contexto da origem.
2. **Given** um lote em processamento, **When** seu status muda para concluido, concluido com erros, falho ou cancelado, **Then** a mudanca gera historico centralizado.
3. **Given** erros ou alertas relevantes sao registrados em linhas, **When** a validacao termina, **Then** o lote guarda totais e a auditoria permite rastrear a tentativa.
4. **Given** uma operacao bloqueada por RLS ou validacao, **When** ela falha, **Then** nenhum evento de sucesso enganoso e registrado.
5. **Given** uma exclusao logica aplicavel a lote ou linha de staging, **When** ela ocorre, **Then** os campos de soft delete e o historico centralizado registram a acao.

### Edge Cases

- Arquivo MMS sem nome de origem informado.
- Arquivo MMS com nome repetido para o mesmo posto e data de atividade.
- Lote criado para posto inexistente, inativo ou removido logicamente.
- Usuario importador autenticado sem perfil operacional ativo.
- Usuario importador sem vinculo com o posto do lote.
- Direcao/Admin importando para posto sem vinculo direto.
- Data de atividade ausente, invalida ou divergente entre lote e linhas.
- Linha sem numero de linha de origem.
- Linha com `raw_json` vazio, nulo ou nao representando os dados originais.
- Linha com campos MMS minimos ausentes.
- Linha com tipos ou formatos inesperados para data, numero de assistencia, posto ou parte/conjunto.
- Linhas duplicadas dentro do mesmo lote sem aplicar ainda a chave operacional MMS final.
- Lote sem linhas.
- Lote parcialmente processado apos falha.
- Reprocessamento de validacao bruta do mesmo lote.
- Cancelamento de lote ja concluido.
- Tentativa de alterar `raw_json` depois da linha registrada.
- Exclusao logica de lote com linhas associadas.
- Consulta direta a lote ou linha de outro posto por filtro manipulado.
- Erro tecnico durante processamento que nao deve apagar evidencias ja registradas.

## Requirements *(mandatory)*

### Constitution Alignment *(mandatory)*

- A feature permanece dentro do MVP e cria apenas a base de importacao MMS em lote, staging, validacao bruta, status, erros, alertas e auditoria.
- A feature trata a MMS como fonte operacional externa e deve preservar `raw_json` dos dados originais em todas as linhas importadas.
- A feature nao cria tabela final de assistencias, nao aplica a chave operacional MMS final, nao atualiza assistencias existentes e nao marca assistencias como `removido`.
- A feature nao cria ocorrencias, tarefas, custos extras, dashboard, telas finais ou integracao automatica com MMS.
- A feature depende da fundacao operacional da Spec 01 para `usuarios`, `postos`, vinculos usuario/posto, perfis, funcoes auxiliares de permissao, RLS e `historico_auditoria`.
- A feature usa tabelas e campos em portugues `snake_case`, chaves primarias `id` e chaves estrangeiras com sufixo `_id`.
- A feature define acesso por perfil e posto: Operador e Supervisao respeitam postos vinculados; Direcao/Admin tem visao global e capacidade administrativa conforme o MVP.
- A feature usa soft delete quando aplicavel com `deleted_at`, `deleted_by` e `delete_reason`.
- A feature registra acoes criticas em `historico_auditoria`.

### Scope Boundaries

- This feature includes only MMS import batches, MMS staging rows, raw data preservation, gross validation, statuses, errors, warnings, totals and audit evidence.
- This feature may identify candidate raw fields such as posto, data de atividade, numero de assistencia and parte/conjunto for validation evidence, but must not create the final operational assistance records.
- This feature does not implement final MMS idempotency behavior, final MMS operational key enforcement, missing-assistance removal, occurrence creation, task creation, extra cost creation, dashboard, final product screens or automatic MMS integration.
- Future transformation from staging into assistencias finais must be specified separately before implementation.

### Functional Requirements

- **FR-001**: The system MUST provide `lotes_importacao_mms` to represent each MMS import attempt.
- **FR-002**: Each import batch MUST record `nome_origem` or equivalent file/source identification, `posto_id`, optional `data_atividade`, importing user, status, totals, timestamps and control fields.
- **FR-003**: Each import batch MUST be linked to exactly one existing operational `posto` when the posto is known.
- **FR-004**: The system MUST reject creation of batches for missing, inactive or logically removed postos, except administrative historical review of existing records.
- **FR-005**: The system MUST identify the user who created or started the import batch.
- **FR-006**: Import batch status MUST distinguish at least draft/received, processing, validated, validated_with_errors, failed, cancelled and logically deleted states, using Portuguese operational values in implementation.
- **FR-007**: Import batch totals MUST include total rows, valid rows, rows with errors, rows with warnings and ignored rows when applicable.
- **FR-008**: Batch totals MUST remain consistent with the current validation state of the lines associated with the batch.
- **FR-009**: The system MUST preserve an auditable processing status and timestamps sufficient to understand when a batch was created, validated, completed, failed or cancelled.
- **FR-010**: The system MUST provide `linhas_importacao_mms` or equivalent staging lines linked to an import batch.
- **FR-011**: Each staging line MUST be linked to exactly one import batch.
- **FR-012**: Each staging line MUST preserve mandatory `raw_json` with the original MMS row data.
- **FR-013**: The system MUST reject staging lines without `raw_json`.
- **FR-014**: The system MUST preserve `raw_json` without destructive normalization of the original values.
- **FR-015**: The system MUST prevent ordinary operational updates from overwriting `raw_json` after the line is registered.
- **FR-016**: Each staging line MUST record source row order or row number when available.
- **FR-017**: Each staging line MUST record validation status.
- **FR-018**: Each staging line MUST be able to store one or more errors and one or more warnings.
- **FR-019**: Errors and warnings MUST be traceable to the batch and line that produced them.
- **FR-020**: Errors and warnings MUST include enough information for an operator or administrator to understand the affected field, issue and severity.
- **FR-021**: Gross MMS validation MUST check whether minimum expected MMS fields are present when available in the source format.
- **FR-022**: Gross MMS validation MUST check candidate `posto`, `data_atividade`, `numero_assistencia` and `parte_conjunto` fields when present in the MMS row data.
- **FR-023**: Gross MMS validation MUST classify blocking issues as errors and non-blocking suspicious conditions as warnings.
- **FR-024**: A line with blocking validation errors MUST NOT be treated as valid for future transformation.
- **FR-025**: A line with warnings and no errors MAY remain valid for future transformation.
- **FR-026**: A batch with any line errors MUST finish in a status that exposes the presence of errors.
- **FR-027**: A batch with no line errors and one or more warnings MUST expose the presence of warnings.
- **FR-028**: Validation MUST NOT create final assistencias.
- **FR-029**: Validation MUST NOT create ocorrencias, tarefas, custos extras or dashboard records.
- **FR-030**: Validation MUST NOT apply the final MMS operational key as the authoritative assistance identity in this feature.
- **FR-031**: Validation MUST NOT mark any final assistance as `removido`.
- **FR-032**: The system MUST allow re-running gross validation for a batch while preserving the original batch, original lines and `raw_json`.
- **FR-033**: Re-running validation MUST update validation statuses, errors, warnings and totals in a traceable way.
- **FR-034**: The system MUST prevent users without an active operational profile from accessing MMS import batches and lines.
- **FR-035**: Operador MUST be able to consult batches and lines only for postos in their active scope.
- **FR-036**: Supervisao MUST be able to consult batches and lines only for postos in their active scope.
- **FR-037**: Direcao/Admin MUST be able to consult batches and lines for all postos.
- **FR-038**: Creation of import batches MUST be allowed only for users authorized for the target posto or Direcao/Admin.
- **FR-039**: Management actions such as cancellation, status correction or logical deletion MUST be restricted to authorized profiles and posto scope.
- **FR-040**: Lines MUST inherit access control from their parent batch.
- **FR-041**: Operational default consultations MUST hide logically deleted batches and lines.
- **FR-042**: Direcao/Admin MAY inspect logically deleted batches and lines for audit support.
- **FR-043**: Soft delete, when applied to a batch or line, MUST fill `deleted_at`, `deleted_by` and `delete_reason`.
- **FR-044**: A logically deleted batch MUST not appear in ordinary operational import lists.
- **FR-045**: A logically deleted line MUST not be counted as an active operational staging line unless an administrative audit view explicitly includes it.
- **FR-046**: Creation, status changes, validation completion, failure, cancellation and logical deletion of a batch MUST generate centralized audit history.
- **FR-047**: Critical line-level actions, including line creation, validation status change and logical deletion, MUST be auditable directly or through batch-level summarized audit events.
- **FR-048**: Audit history MUST identify entity type, entity id, action, actor, previous values, new values and contextual information when applicable.
- **FR-049**: Failed or blocked operations MUST NOT create misleading success audit events.
- **FR-050**: The feature MUST provide SQL validation evidence for RLS by profile/posto, audit history, raw_json preservation, batch validation and line validation.
- **FR-051**: The feature MUST maintain Portuguese table and field naming in `snake_case`.
- **FR-052**: Primary keys MUST use `id`.
- **FR-053**: Foreign keys MUST use the `_id` suffix.
- **FR-054**: The feature MUST preserve compatibility with the Spec 01 operational foundation and Spec 002 cadastro conventions.
- **FR-055**: The feature MUST NOT introduce final assistance tables, final assistance mutation, occurrence records, task records, extra cost records, dashboards, final screens or automatic MMS integrations.

### Permission Rules

| Actor | Lotes importacao MMS | Linhas importacao MMS |
| --- | --- | --- |
| Sem perfil ativo | Sem acesso | Sem acesso |
| Operador | Consulta lotes dos postos do escopo; cria lote apenas quando autorizado para o posto | Consulta linhas dos lotes acessiveis |
| Supervisao | Consulta e gerencia lotes dos postos do escopo | Consulta e gerencia validacao dos lotes acessiveis |
| Direcao/Admin | Consulta e gerencia todos os lotes | Consulta e gerencia todas as linhas |

### Data Validation Rules

- `raw_json` MUST be mandatory for every staging line and must preserve original MMS values.
- Candidate fields extracted for validation MUST NOT replace `raw_json` as the audit source.
- Minimum MMS gross validation MUST check presence and basic consistency of posto, data de atividade, numero de assistencia and parte/conjunto when those fields are present or expected in the file pattern.
- Missing or invalid identifiers needed for future assistance matching MUST be recorded as errors, not silently ignored.
- Non-blocking anomalies such as optional fields missing, unusual text values or extra columns SHOULD be recorded as warnings.
- Batch totals MUST be derived from associated line statuses, errors and warnings.
- Revalidation MUST keep the same raw evidence and must not erase the fact that previous validation attempts occurred.
- Duplicate-looking lines inside the same batch MAY be warned about, but this feature MUST NOT enforce the final MMS operational key.

### Status Rules

- Batch statuses MUST represent the lifecycle from received or draft, through processing, to validated, validated with errors, failed, cancelled or logically deleted.
- Line statuses MUST represent at least pending validation, valid, valid with warning, invalid and ignored when applicable.
- A failed batch MUST retain any lines and raw evidence already stored before the failure.
- A cancelled batch MUST remain auditable and must not be physically removed by ordinary operation.

### Audit Events

- Import batches MUST emit audit events for criado, processamento_iniciado, validacao_concluida, falhou, cancelado, atualizado and excluido_logicamente when applicable.
- Staging lines MUST emit or be included in audit evidence for criada, validada, erro_registrado, alerta_registrado, atualizada and excluida_logicamente when applicable.
- Audit events MUST use the centralized audit history created in Spec 01.

### Key Entities *(include if feature involves data)*

- **Lote de Importacao MMS**: Represents one MMS import attempt for a source file or source payload. Key attributes: source name, posto, optional activity date, importing user, status, totals, processing timestamps, control fields and soft delete fields when applicable.
- **Linha de Importacao MMS**: Represents one raw MMS row stored in staging. Key attributes: batch, source row number, mandatory `raw_json`, validation status, candidate extracted fields, errors, warnings and control fields.
- **Erro de Importacao MMS**: Represents a blocking validation problem tied to a batch and usually to a specific line or field. It explains why the line or batch cannot proceed to future transformation.
- **Alerta de Importacao MMS**: Represents a non-blocking suspicious condition tied to a batch and usually to a line or field. It supports review without preventing all future processing.
- **Posto**: Existing operational entity from Spec 01 used as the main access and operational scope for import batches.
- **Usuario Operacional**: Existing entity from Spec 01 used to identify importer, actor profile and posto scope.
- **Historico de Auditoria**: Existing centralized audit entity from Spec 01 used for critical import action tracking.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of created import batches record source identification, importer, posto, status and totals fields required by this specification.
- **SC-002**: 100% of staging lines created in tests preserve non-empty `raw_json` linked to the correct batch.
- **SC-003**: 100% of tested attempts to create staging lines without `raw_json` are rejected.
- **SC-004**: 100% of tested gross validation errors are recorded with batch, line when applicable, severity and understandable message.
- **SC-005**: 100% of tested gross validation warnings are recorded without incorrectly making the line invalid when no blocking error exists.
- **SC-006**: 100% of tested batches consolidate total rows, valid rows, rows with errors and rows with warnings according to their lines.
- **SC-007**: 100% of tested users without active operational profile are blocked from MMS import batches and lines.
- **SC-008**: In tests with at least 3 postos and 3 profiles, Operador and Supervisao see 0 import batches or lines outside their authorized posto scope.
- **SC-009**: Direcao/Admin can inspect import batches and lines for all postos in 100% of administrative access tests.
- **SC-010**: 100% of tested critical batch actions generate centralized audit history.
- **SC-011**: 100% of tested `raw_json` preservation checks confirm that validation does not destructively overwrite original MMS row data.
- **SC-012**: No final assistance, occurrence, task, extra cost, dashboard or automatic MMS integration artifact is created by this feature.

## Assumptions

- Spec 01 is already available, including `usuarios`, `postos`, `usuarios_postos`, operational profiles, helper permission behavior, RLS conventions and `historico_auditoria`.
- Spec 002 conventions for database-first features, Portuguese naming, soft delete and SQL validation evidence are followed.
- MMS files are provided manually or by an upstream action outside this feature; this specification only covers persisted batch/staging records and gross validation evidence.
- `raw_json` is the authoritative evidence of each original MMS row for this feature.
- Extracted candidate fields support validation and review, but do not become the final assistance identity in this feature.
- The final transformation from staging into assistencias and the final MMS idempotency behavior will be specified later.
- Operational lists hide logically deleted records by default, while administrative audit review can include them when authorized.
