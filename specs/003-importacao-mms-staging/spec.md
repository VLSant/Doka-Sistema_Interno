# Feature Specification: Importacao MMS - Lotes, Staging e Validacao Bruta

**Feature Branch**: `003-importacao-mms-staging`

**Created**: 2026-06-20

**Status**: Draft

**Input**: User description: "Refinar a SPEC 03 Importação MMS - Lotes, Staging e Validação Bruta para alinhar aos documentos oficiais do MVP Doka: entidades `mms_lotes_importacao`, `mms_linhas_importacao`, `mms_erros_importacao` e `mms_alertas_importacao`; status oficiais de lote apenas `importado`, `importado_com_alertas`, `erro` e `cancelado`; soft delete apenas por `deleted_at`, `deleted_by` e `delete_reason`; staging e validacao bruta sem assistencias finais; persistencia e validacao dos campos candidatos `posto_id`, `data_atividade`, `numero_assistencia` e `parte_conjunto`; preparacao da proxima spec de assistencias finais/espelho MMS."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Registrar lote de importacao MMS (Priority: P1)

Um usuario autorizado precisa registrar uma tentativa de importacao MMS como um lote rastreavel em `mms_lotes_importacao`, contendo origem do arquivo, posto, data de atividade quando disponivel, usuario importador, status oficial e totais de processamento.

**Why this priority**: Sem lote de importacao, a operacao nao consegue auditar quem importou, qual arquivo foi usado, para qual posto/data e qual foi o resultado geral da tentativa.

**Independent Test**: Criar lotes para postos diferentes e validar que cada lote registra origem, importador, `estado_processamento`, status oficial nulo antes da conclusao quando aplicavel, totais e escopo de posto sem criar assistencias finais.

**Acceptance Scenarios**:

1. **Given** um usuario autorizado com acesso ao posto, **When** ele registra uma tentativa de importacao MMS com nome de arquivo e posto, **Then** o sistema cria um lote com usuario importador, dados de origem, `estado_processamento = recebido` e status oficial nulo ate a conclusao da validacao bruta ou cancelamento.
2. **Given** uma tentativa de importacao com data de atividade identificada, **When** o lote e registrado, **Then** a data de atividade fica associada ao lote.
3. **Given** uma tentativa de importacao sem data de atividade identificada no arquivo, **When** o lote e registrado, **Then** o lote permanece rastreavel e indica a ausencia desse dado como erro ou alerta conforme a severidade.
4. **Given** um usuario sem acesso ao posto, **When** tenta registrar lote para esse posto, **Then** a operacao e bloqueada.
5. **Given** uma tentativa de importacao registrada, **When** a operacao termina, **Then** o lote apresenta `estado_processamento = validado` e um dos status oficiais `importado`, `importado_com_alertas` ou `erro`, ou status `cancelado` se a tentativa for cancelada, com totais de linhas, erros e alertas sem criar registros finais de assistencia.

---

### User Story 2 - Preservar linhas importadas com raw_json original (Priority: P1)

A operacao precisa preservar cada linha da planilha MMS em `mms_linhas_importacao`, incluindo os dados originais em `raw_json`, numero da linha, campos candidatos extraidos, status tecnico de validacao da linha e qualquer informacao bruta necessaria para conferencia posterior.

**Why this priority**: `raw_json` e a evidencia primaria do que veio da MMS. Sem preservacao linha a linha, nao e possivel explicar divergencias, repetir validacoes ou auditar uma importacao malsucedida.

**Independent Test**: Importar um conjunto de linhas com conteudos validos, incompletos e inesperados; verificar que todas as linhas ficam associadas ao lote e preservam o dado original sem transformacao destrutiva.

**Acceptance Scenarios**:

1. **Given** um lote de importacao existente, **When** linhas MMS sao recebidas para staging, **Then** cada linha e registrada em `mms_linhas_importacao` com vinculo ao lote, numero de linha, campos candidatos e `raw_json` obrigatorio.
2. **Given** uma linha com campos MMS adicionais ou desconhecidos, **When** ela e preservada em staging, **Then** os campos originais permanecem em `raw_json`.
3. **Given** uma linha incompleta, **When** ela e registrada, **Then** o `raw_json` ainda e preservado, os campos candidatos possiveis sao persistidos e a linha recebe mensagens de validacao.
4. **Given** uma linha ja registrada em um lote, **When** alguem consulta a auditoria do lote, **Then** consegue identificar a origem bruta daquela linha.

---

### User Story 3 - Executar validacao bruta minima da MMS (Priority: P1)

O sistema precisa validar campos minimos e candidatos das linhas MMS antes de qualquer transformacao final, classificando problemas em `mms_erros_importacao` ou `mms_alertas_importacao` e consolidando os totais no lote.

**Why this priority**: A validacao bruta permite separar arquivos utilizaveis de arquivos incompletos ou suspeitos sem criar assistencias finais prematuramente.

**Independent Test**: Processar linhas com campos obrigatorios presentes, ausentes, invalidos e inconsistentes; verificar status, erros, alertas e totais por lote e por linha.

**Acceptance Scenarios**:

1. **Given** uma linha com campos minimos e candidatos presentes e coerentes, **When** a validacao bruta e executada, **Then** a linha fica apta para etapa futura de processamento.
2. **Given** uma linha sem `posto_id`, `data_atividade`, `numero_assistencia` ou `parte_conjunto` quando esses campos forem esperados na MMS, **When** a validacao bruta e executada, **Then** a linha recebe erro rastreavel em `mms_erros_importacao`.
3. **Given** uma linha com campo opcional ausente ou valor incomum que nao impede staging, **When** a validacao bruta e executada, **Then** a linha recebe alerta rastreavel em `mms_alertas_importacao`.
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

Direcao/Admin e Supervisao precisam rastrear criacao, processamento, falha, cancelamento, soft delete quando aplicavel e demais acoes criticas relacionadas a lotes e linhas de importacao MMS.

**Why this priority**: A importacao pode ser repetida varias vezes no dia; a auditoria centralizada e necessaria para explicar cada tentativa e evitar perda de evidencias.

**Independent Test**: Executar criacao, processamento, mudanca de status, registro de erro, cancelamento e soft delete quando aplicavel; verificar eventos correspondentes no historico centralizado.

**Acceptance Scenarios**:

1. **Given** um lote MMS criado, **When** a criacao e concluida, **Then** o historico registra entidade, acao, usuario responsavel, contexto da origem e `estado_processamento = recebido`.
2. **Given** um lote em processamento, **When** seu `estado_processamento` muda ou seu status oficial muda de nulo para `importado`, `importado_com_alertas`, `erro` ou `cancelado`, **Then** a mudanca gera historico centralizado.
3. **Given** erros ou alertas relevantes sao registrados em linhas, **When** a validacao termina, **Then** o lote guarda totais e a auditoria permite rastrear a tentativa.
4. **Given** uma operacao bloqueada por RLS ou validacao, **When** ela falha, **Then** nenhum evento de sucesso enganoso e registrado.
5. **Given** soft delete aplicavel a lote ou linha de staging, **When** ele ocorre, **Then** os campos de soft delete e o historico centralizado registram a acao.

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
- Linha com tipos ou formatos inesperados para `data_atividade`, `numero_assistencia`, `posto_id` ou `parte_conjunto`.
- Linhas duplicadas dentro do mesmo lote sem aplicar ainda a chave operacional MMS final.
- Lote sem linhas.
- Lote parcialmente processado apos falha.
- Lote com `status` oficial nulo enquanto `estado_processamento` ainda esta `recebido` ou `processando`.
- Reprocessamento de validacao bruta do mesmo lote.
- Cancelamento de lote ja `importado` ou `importado_com_alertas`.
- Tentativa de alterar `raw_json` depois da linha registrada.
- Soft delete de lote com linhas associadas.
- Consulta direta a lote ou linha de outro posto por filtro manipulado.
- Erro tecnico durante processamento que nao deve apagar evidencias ja registradas.

## Requirements *(mandatory)*

### Constitution Alignment *(mandatory)*

- A feature permanece dentro do MVP e cria apenas a base de importacao MMS em lote, staging, validacao bruta, status oficiais, erros, alertas e auditoria.
- A feature trata a MMS como fonte operacional externa e deve preservar `raw_json` dos dados originais em todas as linhas importadas.
- A feature nao cria tabela final de assistencias, nao aplica a chave operacional MMS final, nao atualiza assistencias existentes e nao marca assistencias como `removido`.
- A feature nao cria ocorrencias, tarefas, custos extras, dashboard, telas finais ou integracao automatica com MMS.
- A feature prepara a Spec seguinte de assistencias finais/espelho MMS, que aplicara a chave operacional `posto_id + data_atividade + numero_assistencia + parte_conjunto`.
- A feature depende da fundacao operacional da Spec 01 para `usuarios`, `postos`, vinculos usuario/posto, perfis, funcoes auxiliares de permissao, RLS e `historico_auditoria`.
- A feature usa tabelas e campos em portugues `snake_case`, chaves primarias `id` e chaves estrangeiras com sufixo `_id`.
- A feature define acesso por perfil e posto: Operador e Supervisao respeitam postos vinculados; Direcao/Admin tem visao global e capacidade administrativa conforme o MVP.
- A feature usa soft delete quando aplicavel com `deleted_at`, `deleted_by` e `delete_reason`.
- A feature registra acoes criticas em `historico_auditoria`.

### Scope Boundaries

- This feature includes only MMS import batches, MMS staging rows, raw data preservation, gross validation, official batch statuses, errors, warnings, totals and audit evidence.
- This feature must persist and validate the candidate fields `posto_id`, `data_atividade`, `numero_assistencia` and `parte_conjunto`, but must not create the final operational assistance records.
- This feature does not implement final MMS idempotency behavior, final MMS operational key enforcement, missing-assistance removal, occurrence creation, task creation, extra cost creation, dashboard, final product screens or automatic MMS integration.
- Future transformation from staging into assistencias finais/espelho MMS must be specified separately before implementation and will apply the operational key `posto_id + data_atividade + numero_assistencia + parte_conjunto`.

### Functional Requirements

- **FR-001**: The system MUST provide `mms_lotes_importacao` to represent each MMS import attempt.
- **FR-002**: Each import batch MUST record `nome_origem` or equivalent file/source identification, `posto_id`, optional `data_atividade`, importing user, official status when concluded, `estado_processamento`, totals, timestamps and control fields.
- **FR-003**: Each import batch MUST be linked to exactly one existing operational `posto` when the posto is known.
- **FR-004**: The system MUST reject creation of batches for missing, inactive or logically removed postos, except administrative historical review of existing records.
- **FR-005**: The system MUST identify the user who created or started the import batch.
- **FR-006**: Import batch official status MAY be null while gross validation has not concluded and the batch has not been cancelled.
- **FR-007**: When official status is filled, it MUST allow only `importado`, `importado_com_alertas`, `erro` and `cancelado`.
- **FR-008**: Internal processing steps MUST be represented by `estado_processamento` or timestamps, with `estado_processamento` covering at least `recebido`, `processando` and `validado`, without replacing or expanding the official batch status list.
- **FR-009**: Import batch totals MUST include total rows, valid rows, rows with errors, rows with warnings and ignored rows when applicable.
- **FR-010**: Batch totals MUST remain consistent with the current validation state of the lines associated with the batch.
- **FR-011**: The system MUST preserve auditable technical processing state and timestamps sufficient to understand when a batch was created, validated, completed, failed or cancelled.
- **FR-012**: The system MUST provide `mms_linhas_importacao` as staging lines linked to an import batch.
- **FR-013**: Each staging line MUST be linked to exactly one import batch.
- **FR-014**: Each staging line MUST preserve mandatory `raw_json` with the original non-empty MMS row data.
- **FR-015**: The system MUST reject staging lines without `raw_json`, with null `raw_json` or with empty `raw_json` that does not represent an original MMS row.
- **FR-016**: The system MUST preserve `raw_json` without destructive normalization of the original values.
- **FR-017**: The system MUST prevent ordinary operational updates from overwriting `raw_json` after the line is registered.
- **FR-018**: Each staging line MUST record source row order or row number when available.
- **FR-019**: Each staging line MUST persist candidate `posto_id`, `data_atividade`, `numero_assistencia` and `parte_conjunto` fields when they can be extracted or resolved during gross validation.
- **FR-020**: Each staging line MUST keep technical validation state separate from the official batch status.
- **FR-021**: The system MUST provide `mms_erros_importacao` for one or more blocking validation errors.
- **FR-022**: The system MUST provide `mms_alertas_importacao` for one or more non-blocking validation warnings.
- **FR-023**: Errors and warnings MUST be traceable to the batch and line that produced them.
- **FR-024**: Errors and warnings MUST include enough information for an operator or administrator to understand the affected field, issue and severity.
- **FR-025**: Gross MMS validation MUST check whether minimum expected MMS fields are present when available in the source format.
- **FR-026**: Gross MMS validation MUST validate candidate `posto_id`, `data_atividade`, `numero_assistencia` and `parte_conjunto` fields for presence, basic format and consistency when present or expected in the MMS row data.
- **FR-027**: Gross MMS validation MUST classify blocking issues as errors and non-blocking suspicious conditions as warnings.
- **FR-028**: A line with blocking validation errors MUST NOT be treated as valid for future transformation.
- **FR-029**: A line with warnings and no errors MAY remain valid for future transformation.
- **FR-030**: A batch with any line errors MUST finish with official status `erro`.
- **FR-031**: A batch with no line errors and one or more warnings MUST finish with official status `importado_com_alertas`.
- **FR-032**: A batch with no line errors and no warnings MUST finish with official status `importado`.
- **FR-033**: A cancelled batch MUST finish with official status `cancelado`.
- **FR-034**: Validation MUST NOT create final assistencias.
- **FR-035**: Validation MUST NOT create ocorrencias, tarefas, custos extras or dashboard records.
- **FR-036**: Validation MUST NOT apply the final MMS operational key as the authoritative assistance identity in this feature.
- **FR-037**: Validation MUST NOT mark any final assistance as `removido`.
- **FR-038**: The system MUST allow re-running gross validation for a batch while preserving the original batch, original lines and `raw_json`.
- **FR-039**: Re-running validation MUST update technical validation state, errors, warnings and totals in a traceable way.
- **FR-040**: Re-running validation MUST NOT alter the original `raw_json`.
- **FR-041**: The system MUST prevent users without an active operational profile from accessing MMS import batches, lines, errors and warnings.
- **FR-042**: Operador MUST be able to consult batches, lines, errors and warnings only for postos in their active scope.
- **FR-043**: Supervisao MUST be able to consult batches, lines, errors and warnings only for postos in their active scope.
- **FR-044**: Direcao/Admin MUST be able to consult batches, lines, errors and warnings for all postos.
- **FR-045**: Creation of import batches MUST be allowed only for users authorized for the target posto or Direcao/Admin.
- **FR-046**: Management actions such as cancellation, status correction or soft delete MUST be restricted to authorized profiles and posto scope.
- **FR-047**: Lines, errors and warnings MUST inherit access control from their parent batch.
- **FR-048**: Operational default consultations MUST hide soft-deleted batches, lines, errors and warnings.
- **FR-049**: Direcao/Admin MAY inspect soft-deleted batches, lines, errors and warnings for audit support.
- **FR-050**: Soft delete, when applied to a batch, line, error or warning, MUST fill `deleted_at`, `deleted_by` and `delete_reason`.
- **FR-051**: Soft delete MUST NOT be represented by an official status value.
- **FR-052**: A soft-deleted batch MUST not appear in ordinary operational import lists.
- **FR-053**: A soft-deleted line MUST not be counted as an active operational staging line unless an administrative audit view explicitly includes it.
- **FR-054**: Creation, official status changes, validation completion, failure, cancellation and soft delete of a batch MUST generate centralized audit history.
- **FR-055**: Critical line-level actions, including line creation, validation state change, error/warning association and soft delete, MUST be auditable directly or through batch-level summarized audit events.
- **FR-056**: Audit history MUST identify entity type, entity id, action, actor, previous values, new values and contextual information when applicable.
- **FR-057**: Failed or blocked operations MUST NOT create misleading success audit events.
- **FR-058**: The feature MUST provide SQL validation evidence for RLS by profile/posto, audit history, soft delete, raw_json preservation, raw_json immutability, batch validation, line validation, errors and warnings.
- **FR-059**: The feature MUST maintain Portuguese table and field naming in `snake_case`.
- **FR-060**: Primary keys MUST use `id`.
- **FR-061**: Foreign keys MUST use the `_id` suffix.
- **FR-062**: The feature MUST preserve compatibility with the Spec 01 operational foundation and Spec 002 cadastro conventions.
- **FR-063**: The feature MUST NOT introduce final assistance tables, final assistance mutation, occurrence records, task records, extra cost records, dashboards, final screens, complete MMS parser or automatic MMS integrations.

### Permission Rules

| Actor | `mms_lotes_importacao` | `mms_linhas_importacao`, `mms_erros_importacao`, `mms_alertas_importacao` |
| --- | --- | --- |
| Sem perfil ativo | Sem acesso | Sem acesso |
| Operador | Consulta lotes dos postos do escopo; cria lote apenas quando autorizado para o posto | Consulta linhas, erros e alertas dos lotes acessiveis |
| Supervisao | Consulta e gerencia lotes dos postos do escopo | Consulta e gerencia validacao, erros e alertas dos lotes acessiveis |
| Direcao/Admin | Consulta e gerencia todos os lotes | Consulta e gerencia todas as linhas, erros e alertas |

### Data Validation Rules

- `raw_json` MUST be mandatory, jsonb, non-null and non-empty for every staging line and must preserve original MMS values.
- Candidate fields extracted for validation MUST NOT replace `raw_json` as the audit source.
- Minimum MMS gross validation MUST check presence and basic consistency of `posto_id`, `data_atividade`, `numero_assistencia` and `parte_conjunto` when those fields are present or expected in the file pattern.
- Missing or invalid identifiers needed for future assistance matching MUST be recorded as errors, not silently ignored.
- Non-blocking anomalies such as optional fields missing, unusual text values or extra columns SHOULD be recorded as warnings.
- Batch totals MUST be derived from associated line technical validation states, errors and warnings.
- Revalidation MUST keep the same raw evidence and must not erase the fact that previous validation attempts occurred.
- Duplicate-looking lines inside the same batch MAY be warned about, but this feature MUST NOT enforce the final MMS operational key.
- The fields `posto_id`, `data_atividade`, `numero_assistencia` and `parte_conjunto` MUST be persisted as candidates for the next spec even though this feature does not perform the final upsert.

### Status Rules

- Batch official status MAY be null while `estado_processamento` is `recebido` or `processando` and gross validation has not concluded.
- When filled, batch official status MUST be exactly one of `importado`, `importado_com_alertas`, `erro` or `cancelado`.
- Batch official status MUST NOT include received, draft, processing, validated, validated with errors, failed, logically deleted or any other value outside the official list.
- Internal lifecycle steps MUST be tracked through `estado_processamento` or timestamps, with `estado_processamento` covering at least `recebido`, `processando` and `validado`.
- Line technical validation state MAY represent pending validation, valid, valid with warning, invalid and ignored when applicable, without changing the official batch status list.
- A batch with status `erro` MUST retain any lines and raw evidence already stored before the failure.
- A cancelled batch MUST remain auditable and must not be physically removed by ordinary operation.
- Soft delete MUST be represented only by `deleted_at`, `deleted_by` and `delete_reason`, never by a status value.

### Audit Events

- `mms_lotes_importacao` MUST emit audit events for criado, processamento_iniciado, validacao_concluida, erro, cancelado, atualizado and soft_delete_registrado when applicable.
- `mms_linhas_importacao` MUST emit or be included in audit evidence for criada, validada, erro_registrado, alerta_registrado, atualizada and soft_delete_registrado when applicable.
- `mms_erros_importacao` and `mms_alertas_importacao` MUST be auditable directly or through their parent batch and line context.
- Audit events MUST use the centralized audit history created in Spec 01.

### Key Entities *(include if feature involves data)*

- **mms_lotes_importacao**: Represents one MMS import attempt for a source file or source payload. Key attributes: source name, posto, optional activity date, importing user, official status, totals, technical processing timestamps, control fields and soft delete fields when applicable.
- **mms_linhas_importacao**: Represents one raw MMS row stored in staging. Key attributes: batch, source row number, mandatory non-null non-empty immutable `raw_json`, candidate `posto_id`, `data_atividade`, `numero_assistencia`, `parte_conjunto`, technical validation state and control fields.
- **mms_erros_importacao**: Represents a blocking validation problem tied to a batch and usually to a specific line or field. It explains why the line or batch cannot proceed to future transformation.
- **mms_alertas_importacao**: Represents a non-blocking suspicious condition tied to a batch and usually to a line or field. It supports review without preventing all future processing.
- **Posto**: Existing operational entity from Spec 01 used as the main access and operational scope for import batches.
- **Usuario Operacional**: Existing entity from Spec 01 used to identify importer, actor profile and posto scope.
- **Historico de Auditoria**: Existing centralized audit entity from Spec 01 used for critical import action tracking.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of created import batches record source identification, importer, posto, `estado_processamento`, official status when concluded and totals fields required by this specification.
- **SC-002**: 100% of staging lines created in tests preserve non-empty `raw_json` linked to the correct batch.
- **SC-003**: 100% of tested attempts to create staging lines without `raw_json`, with null `raw_json` or with empty `raw_json` are rejected.
- **SC-004**: 100% of tested staging lines persist candidate `posto_id`, `data_atividade`, `numero_assistencia` and `parte_conjunto` when those values are extractable or resolvable.
- **SC-005**: 100% of tested gross validation errors are recorded with batch, line when applicable, severity and understandable message.
- **SC-006**: 100% of tested gross validation warnings are recorded without incorrectly making the line invalid when no blocking error exists.
- **SC-007**: 100% of tested batches either keep official status null before conclusion or use only `importado`, `importado_com_alertas`, `erro` or `cancelado` when official status is filled.
- **SC-008**: 100% of tested soft delete cases use `deleted_at`, `deleted_by` and `delete_reason` instead of a deleted status.
- **SC-009**: 100% of tested batches consolidate total rows, valid rows, rows with errors and rows with warnings according to their lines.
- **SC-010**: 100% of tested users without active operational profile are blocked from MMS import batches, lines, errors and warnings.
- **SC-011**: In tests with at least 3 postos and 3 profiles, Operador and Supervisao see 0 import batches, lines, errors or warnings outside their authorized posto scope.
- **SC-012**: Direcao/Admin can inspect import batches, lines, errors and warnings for all postos in 100% of administrative access tests.
- **SC-013**: 100% of tested critical batch actions generate centralized audit history.
- **SC-014**: 100% of tested `raw_json` preservation checks confirm that validation does not destructively overwrite original MMS row data.
- **SC-015**: 100% of tested attempts to update `raw_json` after line creation are blocked for ordinary operational flows.
- **SC-016**: No final assistance, occurrence, task, extra cost, dashboard, complete parser or automatic MMS integration artifact is created by this feature.

## Assumptions

- Spec 01 is already available, including `usuarios`, `postos`, `usuarios_postos`, operational profiles, helper permission behavior, RLS conventions and `historico_auditoria`.
- Spec 002 conventions for database-first features, Portuguese naming, soft delete and SQL validation evidence are followed.
- MMS files are provided manually or by an upstream action outside this feature; this specification only covers persisted batch/staging records and gross validation evidence.
- `raw_json` is the authoritative evidence of each original MMS row for this feature.
- Extracted candidate fields support validation and review, but do not become the final assistance identity in this feature.
- The next assistance/espelho MMS spec will consume staging data and apply the operational key `posto_id + data_atividade + numero_assistencia + parte_conjunto`.
- The final transformation from staging into assistencias and the final MMS idempotency behavior will be specified later.
- Operational lists hide soft-deleted records by default, while administrative audit review can include them when authorized.
