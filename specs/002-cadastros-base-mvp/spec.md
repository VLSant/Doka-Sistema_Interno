# Feature Specification: Cadastros Base MVP

**Feature Branch**: `002-cadastros-base-mvp`

**Created**: 2026-06-20

**Status**: Draft

**Input**: User description: "Criar os cadastros base do MVP do Doka necessarios para sustentar ocorrencias, tarefas, rotinas, eficiencia e operacao futura, usando a fundacao operacional ja criada na Spec 01."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Manter prioridades operacionais globais (Priority: P1)

Direcao/Administracao precisa manter uma lista padronizada de prioridades para que ocorrencias, tarefas, rotinas e paineis futuros usem a mesma classificacao de urgencia e ordenacao operacional.

**Why this priority**: Prioridade e um cadastro base transversal. Sem ele, os modulos futuros criariam classificacoes livres, dificultando triagem, comparacao, filtros e historico.

**Independent Test**: Criar, editar, ativar, inativar e remover logicamente prioridades com um usuario Direcao/Admin; validar que Operador e Supervisao consultam apenas prioridades ativas e nao conseguem gerenciar o cadastro.

**Acceptance Scenarios**:

1. **Given** um usuario Direcao/Admin autenticado e com perfil operacional ativo, **When** ele cadastra uma prioridade com nome, nivel, cor e status ativo, **Then** a prioridade fica disponivel para consultas operacionais ativas.
2. **Given** uma prioridade ativa existente, **When** Direcao/Admin altera nome, nivel, cor ou status, **Then** a alteracao e salva e gera historico centralizado.
3. **Given** uma prioridade ativa existente, **When** Direcao/Admin inativa a prioridade, **Then** ela deixa de aparecer em consultas operacionais padrao e gera historico de inativacao.
4. **Given** uma prioridade removida logicamente, **When** qualquer perfil consulta prioridades operacionais, **Then** a prioridade removida nao aparece.
5. **Given** um Operador autenticado, **When** ele tenta criar, editar, inativar ou remover uma prioridade, **Then** a operacao e bloqueada.
6. **Given** uma Supervisao autenticada, **When** ela consulta prioridades, **Then** visualiza somente prioridades ativas para uso operacional, sem permissao de gerenciamento global.

---

### User Story 2 - Manter tipos de ocorrencia globais (Priority: P1)

Direcao/Administracao precisa manter tipos de ocorrencia padronizados para preparar o modulo futuro de ocorrencias, incluindo reclamacoes como categoria futura sem criar ocorrencias reais nesta feature.

**Why this priority**: Tipos de ocorrencia estruturam classificacao, filtros, relatorios e regras futuras. O cadastro deve existir antes do modulo de ocorrencias para evitar dados livres e inconsistentes.

**Independent Test**: Criar, editar, ativar, inativar e remover logicamente tipos de ocorrencia; validar duplicidade ativa por nome; validar consulta operacional apenas de registros ativos.

**Acceptance Scenarios**:

1. **Given** um usuario Direcao/Admin, **When** ele cria um tipo de ocorrencia com nome, descricao opcional e status ativo, **Then** o tipo fica disponivel para consultas operacionais futuras.
2. **Given** um tipo de ocorrencia ativo, **When** Direcao/Admin atualiza nome ou descricao, **Then** a alteracao gera historico de atualizacao.
3. **Given** um tipo de ocorrencia ativo, **When** Direcao/Admin inativa ou remove logicamente o registro, **Then** ele deixa de aparecer nas consultas operacionais padrao.
4. **Given** um Operador ou Supervisao, **When** consulta tipos de ocorrencia, **Then** visualiza apenas tipos ativos e nao consegue gerenciar o cadastro.
5. **Given** um tipo de ocorrencia removido logicamente com um nome, **When** Direcao/Admin cria novo tipo ativo com o mesmo nome, **Then** a criacao pode ser permitida se nao houver outro registro ativo com esse nome.

---

### User Story 3 - Manter metas de eficiencia por posto (Priority: P1)

Direcao/Admin precisa definir metas de eficiencia por posto e tipo de atividade normalizado, com percentual de meta, vigencia e status ativo. Essas metas serao usadas por rotinas, acompanhamento de eficiencia e dashboard futuro.

**Why this priority**: Metas de eficiencia sao dados estruturantes para acompanhamento operacional por posto. Elas dependem da fundacao operacional da Spec 01 e precisam respeitar escopo por posto desde o inicio.

**Independent Test**: Criar metas para postos existentes, validar vigencia, percentual, duplicidade por combinacao critica e visibilidade por escopo de posto para Operador e Supervisao.

**Acceptance Scenarios**:

1. **Given** um posto existente, ativo e nao removido, **When** Direcao/Admin cria uma meta de eficiencia para esse posto com tipo de atividade, percentual e vigencia, **Then** a meta fica disponivel para usuarios autorizados.
2. **Given** uma meta ativa para posto, tipo de atividade e periodo de vigencia, **When** Direcao/Admin tenta criar outra meta ativa sobreposta para a mesma combinacao, **Then** a operacao e rejeitada.
3. **Given** uma meta de eficiencia vinculada a um posto fora do escopo de um Operador, **When** esse Operador consulta metas, **Then** essa meta nao aparece.
4. **Given** uma Supervisao vinculada a um posto, **When** consulta metas de eficiencia, **Then** visualiza metas ativas dos postos do seu escopo.
5. **Given** uma Supervisao vinculada a um posto e autorizada pelo MVP para gerenciamento scoped, **When** tenta gerenciar meta de eficiencia desse posto, **Then** a operacao e permitida somente dentro do escopo do posto.
6. **Given** uma Supervisao sem vinculo com o posto da meta, **When** tenta criar, editar, inativar ou remover a meta, **Then** a operacao e bloqueada.
7. **Given** uma meta removida logicamente, **When** usuarios consultam metas operacionais padrao, **Then** a meta removida nao aparece.

---

### User Story 4 - Consultar cadastros base conforme perfil operacional (Priority: P2)

Operador, Supervisao e Direcao/Admin precisam consultar os cadastros base de acordo com o perfil e, quando houver posto associado, de acordo com o escopo operacional definido na Spec 01.

**Why this priority**: Os cadastros base serao usados por modulos futuros, mas ja precisam respeitar a barreira de seguranca por perfil e posto para evitar vazamento ou alteracao indevida de dados.

**Independent Test**: Usar usuarios de teste dos tres perfis, usuario sem perfil operacional, postos vinculados e nao vinculados, registros ativos, inativos e removidos logicamente.

**Acceptance Scenarios**:

1. **Given** usuario sem perfil operacional ativo, **When** tenta consultar prioridades, tipos de ocorrencia ou metas, **Then** nao acessa os cadastros base.
2. **Given** Operador com posto vinculado, **When** consulta prioridades e tipos de ocorrencia, **Then** ve apenas registros globais ativos.
3. **Given** Operador com posto vinculado, **When** consulta metas de eficiencia, **Then** ve apenas metas ativas dos postos do seu escopo.
4. **Given** Supervisao com escopo em dois postos, **When** consulta metas de eficiencia, **Then** ve apenas metas ativas desses postos.
5. **Given** Direcao/Admin, **When** consulta cadastros base, **Then** tem visao administrativa global, incluindo possibilidade de inspecionar registros inativos e removidos quando necessario para auditoria administrativa.

---

### User Story 5 - Auditar acoes criticas dos cadastros base (Priority: P2)

O sistema deve registrar no historico centralizado todas as acoes criticas nos cadastros base para manter rastreabilidade desde a criacao ate a exclusao logica.

**Why this priority**: Esses cadastros afetam classificacoes e indicadores futuros; mudancas sem historico comprometeriam analise operacional e governanca.

**Independent Test**: Executar criacao, atualizacao, ativacao, inativacao e exclusao logica em cada cadastro base e verificar eventos correspondentes no historico centralizado.

**Acceptance Scenarios**:

1. **Given** Direcao/Admin cria uma prioridade, **When** a operacao e concluida, **Then** o historico registra entidade, acao, usuario responsavel e valores novos.
2. **Given** Direcao/Admin altera uma meta de eficiencia, **When** a operacao e concluida, **Then** o historico registra valores anteriores e novos.
3. **Given** Direcao/Admin inativa um tipo de ocorrencia, **When** a operacao e concluida, **Then** o historico registra acao de inativacao.
4. **Given** uma Supervisao tenta gerenciar prioridade global, **When** a operacao e bloqueada, **Then** nenhum evento de sucesso e registrado.

### Edge Cases

- Nome de prioridade com espacos extras, diferenca de maiusculas/minusculas ou acentos equivalentes a outro nome ativo.
- Nivel de prioridade duplicado entre prioridades ativas quando o nivel define ordem operacional.
- Cor de prioridade ausente ou em formato invalido para uso visual futuro.
- Nome de tipo de ocorrencia duplicado entre registros ativos.
- Tipo de ocorrencia inativo ou removido logicamente sendo usado em consultas operacionais futuras.
- Meta de eficiencia para posto inexistente.
- Meta de eficiencia para posto removido logicamente.
- Meta de eficiencia para posto inativo.
- Meta de eficiencia com percentual igual ou menor que zero.
- Meta de eficiencia com percentual acima do maximo operacional definido.
- Vigencia final anterior a vigencia inicial.
- Meta sem vigencia final e outra meta ativa posterior para a mesma combinacao.
- Sobreposicao parcial ou total de vigencias para mesmo posto e tipo de atividade.
- Tipo de atividade informado com variacoes de escrita que deveriam normalizar para o mesmo valor.
- Supervisao tentando gerenciar meta de posto fora do escopo.
- Operador tentando gerenciar qualquer cadastro base.
- Usuario autenticado sem perfil operacional ativo tentando consultar cadastros.
- Registro removido logicamente com tentativa posterior de recriar cadastro ativo equivalente.

## Requirements *(mandatory)*

### Constitution Alignment *(mandatory)*

- A feature permanece dentro do MVP e cria apenas cadastros base auxiliares para uso futuro por ocorrencias, tarefas, rotinas, eficiencia e dashboard.
- A feature nao toca dados MMS, nao cria importacao MMS, nao usa `raw_json`, nao define chave operacional MMS e nao marca registros MMS como `removido`.
- A feature depende da fundacao operacional da Spec 01 para perfis, postos, vinculos usuario/posto, funcoes auxiliares de permissao e RLS.
- A feature define comportamento por perfil e posto: Operador consulta apenas dados ativos permitidos, Supervisao respeita escopo por posto quando houver posto, e Direcao/Admin tem gestao global.
- A feature usa tabelas e campos em portugues `snake_case`, chaves primarias `id` e chaves estrangeiras com sufixo `_id`.
- A feature usa soft delete com `deleted_at`, `deleted_by` e `delete_reason` para registros removidos logicamente.
- A feature registra acoes criticas em `historico_auditoria`.
- A feature nao cria ocorrencias reais nem custos extras; portanto nao define vinculos obrigatorios com assistencias nesta etapa.
- A feature nao cria telas finais; qualquer frontend futuro deve seguir o design system Doka e o comportamento desktop-first do MVP.

### Scope Boundaries

- This feature includes only cadastros base: prioridades, tipos_ocorrencia and metas_eficiencia.
- This feature uses the operational foundation from Spec 01 for `usuarios`, `postos`, `usuarios_postos`, perfis, comportamento RLS and centralized audit history.
- This feature does not create ocorrencias reais, tarefas, rotinas, custos extras, dashboards, final product screens, MMS import or automatic MMS integration.
- This feature may prepare data consumed by future modules, but future modules must be specified separately before implementation.

### Functional Requirements

- **FR-001**: The system MUST provide the cadastro `prioridades` for classificacao operacional de prioridade.
- **FR-002**: Each `prioridades` record MUST have `nome`, `nome_normalizado`, `nivel`, `cor`, `ativo`, creation control, update control and soft delete control.
- **FR-003**: `prioridades.nome` MUST be required and must not be blank after normalization.
- **FR-004**: `prioridades.nivel` MUST be required and must be a positive integer.
- **FR-005**: `prioridades.cor` MUST be required and MUST accept only a Doka design-system color token or a hexadecimal value in `#RRGGBB` format.
- **FR-006**: The system MUST prevent two active `prioridades` records from having the same `nome_normalizado`.
- **FR-007**: The system MUST prevent two active `prioridades` records from having the same `nivel` when both are active and not logically removed.
- **FR-008**: Direcao/Admin MUST be able to create, edit, activate, inactivate and logically remove `prioridades`.
- **FR-009**: Supervisao and Operador MUST be able to consult active `prioridades` for operational use.
- **FR-010**: Supervisao and Operador MUST NOT be able to create, edit, activate, inactivate or logically remove `prioridades`.
- **FR-011**: The system MUST provide the cadastro `tipos_ocorrencia` for future occurrence classification.
- **FR-012**: Each `tipos_ocorrencia` record MUST have `nome`, `nome_normalizado`, optional `descricao`, `ativo`, creation control, update control and soft delete control.
- **FR-013**: `tipos_ocorrencia.nome` MUST be required and must not be blank after normalization.
- **FR-014**: The system MUST prevent two active `tipos_ocorrencia` records from having the same `nome_normalizado`.
- **FR-015**: Direcao/Admin MUST be able to create, edit, activate, inactivate and logically remove `tipos_ocorrencia`.
- **FR-016**: Supervisao and Operador MUST be able to consult active `tipos_ocorrencia` for operational use.
- **FR-017**: Supervisao and Operador MUST NOT be able to create, edit, activate, inactivate or logically remove `tipos_ocorrencia`.
- **FR-018**: The system MUST provide the cadastro `metas_eficiencia` for efficiency targets by posto.
- **FR-019**: Each `metas_eficiencia` record MUST be linked to exactly one existing posto using `posto_id`.
- **FR-020**: Each `metas_eficiencia` record MUST have `posto_id`, `tipo_atividade_normalizado`, `meta_percentual`, `vigencia_inicio`, optional `vigencia_fim`, `ativo`, creation control, update control and soft delete control.
- **FR-021**: `metas_eficiencia.tipo_atividade_normalizado` MUST be required and must not be blank after normalization.
- **FR-022**: `metas_eficiencia.meta_percentual` MUST be greater than zero.
- **FR-023**: `metas_eficiencia.meta_percentual` MUST not exceed 100 for the MVP unless a later approved spec changes the percentage model.
- **FR-024**: `metas_eficiencia.vigencia_inicio` MUST be required.
- **FR-025**: `metas_eficiencia.vigencia_fim`, when present, MUST be equal to or later than `vigencia_inicio`.
- **FR-026**: The system MUST reject `metas_eficiencia` linked to missing, inactive or logically removed `postos`, except for administrative historical consultation of already existing records.
- **FR-027**: The system MUST reject active `metas_eficiencia` records with overlapping validity for the same `posto_id` and `tipo_atividade_normalizado`.
- **FR-028**: Direcao/Admin MUST be able to create, edit, activate, inactivate and logically remove `metas_eficiencia` for all `postos`.
- **FR-029**: Supervisao MUST be able to consult active `metas_eficiencia` only for `postos` within its scope.
- **FR-030**: Supervisao MAY create, edit, activate, inactivate and logically remove `metas_eficiencia` only for `postos` within its scope as the scoped management permission of this MVP feature.
- **FR-031**: Supervisao MUST NOT manage `metas_eficiencia` outside its posto scope.
- **FR-032**: Operador MUST be able to consult active `metas_eficiencia` only for `postos` within its scope.
- **FR-033**: Operador MUST NOT create, edit, activate, inactivate or logically remove `metas_eficiencia`.
- **FR-034**: Users without an active operational profile MUST NOT access `prioridades`, `tipos_ocorrencia` or `metas_eficiencia`.
- **FR-035**: Operational default consultations MUST return only active and not logically removed `prioridades`, `tipos_ocorrencia` and `metas_eficiencia`.
- **FR-036**: Administrative consultations by Direcao/Admin MAY include inactive and logically removed records for review and audit support.
- **FR-037**: Soft delete MUST use deleted_at, deleted_by and delete_reason for all three cadastros.
- **FR-038**: When deleted_at is filled, deleted_by and delete_reason MUST also be filled.
- **FR-039**: Soft-deleted records MUST NOT be physically deleted as part of ordinary operational flows.
- **FR-040**: Creation, update, activation, inactivation and logical deletion MUST generate centralized audit history for `prioridades`.
- **FR-041**: Creation, update, activation, inactivation and logical deletion MUST generate centralized audit history for `tipos_ocorrencia`.
- **FR-042**: Creation, update, activation, inactivation and logical deletion MUST generate centralized audit history for `metas_eficiencia`.
- **FR-043**: Audit history MUST identify entity type, entity id, action, actor, previous values and new values when applicable.
- **FR-044**: Failed or blocked operations MUST NOT create misleading success audit events.
- **FR-045**: The cadastros MUST use Portuguese table and field naming in snake_case.
- **FR-046**: Primary keys MUST use id.
- **FR-047**: Foreign keys MUST use the _id suffix.
- **FR-048**: The feature MUST preserve compatibility with the Spec 01 operational profile and posto scope model.
- **FR-049**: The feature MUST NOT introduce importacao_mms, assistencias, ocorrencias reais, tarefas, rotinas, custos_extras, dashboard final, final product screens or automatic MMS integration.
- **FR-050**: The feature MUST provide enough validation evidence to prove profile permissions, posto-scope permissions, soft delete, duplicate prevention and audit history.

### Permission Rules

| Actor | Prioridades | Tipos ocorrencia | Metas eficiencia |
| --- | --- | --- | --- |
| Sem perfil ativo | Sem acesso | Sem acesso | Sem acesso |
| Operador | Consulta ativos | Consulta ativos | Consulta ativas dos postos do escopo |
| Supervisao | Consulta ativos | Consulta ativos | Consulta e gerencia metas dos postos do escopo |
| Direcao/Admin | Gerencia todos | Gerencia todos | Gerencia todos |

### Data Validation Rules

- Normalization for `nome_normalizado` and `tipo_atividade_normalizado` MUST trim leading/trailing spaces, collapse repeated internal spaces to one space, compare without case sensitivity and treat accents consistently so equivalent accented and unaccented forms cannot bypass duplicate checks.
- `prioridades.nome_normalizado` is the value used for active-name duplicate checks.
- `prioridades.nivel` is the value used for active ordering duplicate checks.
- `tipos_ocorrencia.nome_normalizado` is the value used for active-name duplicate checks.
- `metas_eficiencia` critical combination is `posto_id`, `tipo_atividade_normalizado` and the validity interval.
- Open-ended `metas_eficiencia` validity conflicts with any later active goal for the same `posto_id` and `tipo_atividade_normalizado` unless the earlier goal is inactive or logically removed.
- Inactive records remain stored but are not returned by operational default consultations.
- Logically removed records remain stored, require delete reason and are not returned by operational default consultations.

### Audit Events

- `prioridades` MUST emit audit events for criado, atualizado, ativado, inativado and excluido_logicamente.
- `tipos_ocorrencia` MUST emit audit events for criado, atualizado, ativado, inativado and excluido_logicamente.
- `metas_eficiencia` MUST emit audit events for criado, atualizado, ativado, inativado and excluido_logicamente.
- Audit events MUST use the centralized audit history created in Spec 01.

### Key Entities *(include if feature involves data)*

- **Prioridade**: Global classification used to order and identify urgency or operational importance in future occurrences, tasks and routines. Key attributes: `nome`, `nome_normalizado`, `nivel`, `cor`, `ativo`, control fields and soft delete fields.
- **Tipo de Ocorrencia**: Global classification used by future occurrence records. It can support future complaint classification, but this feature does not create occurrences or complaint flows. Key attributes: `nome`, `nome_normalizado`, `descricao`, `ativo`, control fields and soft delete fields.
- **Meta de Eficiencia**: Cadastro operacional por posto para um tipo de atividade normalizado e periodo de vigencia. Key attributes: `posto_id`, `tipo_atividade_normalizado`, `meta_percentual`, `vigencia_inicio`, `vigencia_fim`, `ativo`, control fields and soft delete fields.
- **Posto**: Existing operational entity from Spec 01. `metas_eficiencia` depends on existing active `postos` and inherits profile/posto access behavior from the operational foundation.
- **Usuario Operacional**: Existing entity from Spec 01 used to identify actor profile and posto scope.
- **Historico de Auditoria**: Existing centralized audit entity from Spec 01 used for critical action tracking.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Direcao/Admin can create, edit, activate, inactivate and logically remove all three cadastros base in validation flows.
- **SC-002**: 100% of tested duplicate active `prioridades.nome_normalizado`, duplicate active `prioridades.nivel` and duplicate active `tipos_ocorrencia.nome_normalizado` are rejected.
- **SC-003**: 100% of tested overlapping active `metas_eficiencia` for the same `posto_id` and `tipo_atividade_normalizado` are rejected.
- **SC-004**: 100% of tested `metas_eficiencia` for missing, inactive or logically removed `postos` are rejected.
- **SC-005**: 100% of tested Operador management attempts for cadastros base are blocked.
- **SC-006**: 100% of tested Supervisao attempts to manage global `prioridades` or `tipos_ocorrencia` are blocked.
- **SC-007**: 100% of tested Supervisao attempts to manage `metas_eficiencia` outside its posto scope are blocked.
- **SC-008**: 100% of tested `usuarios` without active operational profile are blocked from cadastros base access.
- **SC-009**: 100% of tested operational default consultations hide inactive or logically removed records when the actor is not using an administrative review flow.
- **SC-010**: 100% of tested create, update, activate, inactivate and logical delete actions produce centralized audit history for each cadastro base.
- **SC-011**: No out-of-scope module listed in this spec is introduced by the feature.

## Assumptions

- Spec 01 is already merged and available, including `usuarios`, `postos`, `usuarios_postos`, permission helper functions, RLS conventions and centralized audit history.
- `prioridades` and `tipos_ocorrencia` are global cadastros and do not have posto scope in this MVP.
- `metas_eficiencia` is scoped by `posto_id` because it represents operational targets by posto.
- For this MVP feature, Supervisao is authorized to manage only `metas_eficiencia` for `postos` in its own scope; global `prioridades` and `tipos_ocorrencia` remain under Direcao/Admin.
- Operador is a consumer of active cadastros only and has no management permission in this feature.
- `tipo_atividade_normalizado` is a normalized text value in this feature; a separate activity taxonomy can be proposed later if needed.
- The MVP percentage model for `metas_eficiencia.meta_percentual` uses values greater than zero and up to 100.
- This feature is database/rule focused; final frontend screens are outside scope unless separately approved.
