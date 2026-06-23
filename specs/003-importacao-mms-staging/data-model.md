# Data Model: Importacao MMS - Lotes, Staging e Validacao Bruta

## Existing Dependencies

### usuarios

Tabela operacional da Spec 01 usada para identificar usuario importador,
responsavel por criacao, atualizacao, cancelamento, soft delete e auditoria.

### postos

Tabela operacional da Spec 01 usada por `mms_lotes_importacao.posto_id` e pelos
campos candidatos de `mms_linhas_importacao`. Novos lotes devem rejeitar postos
inexistentes, inativos ou removidos logicamente.

### usuarios_postos

Tabela da Spec 01 usada pelas policies para restringir Operador e Supervisao ao
escopo por posto.

### historico_auditoria

Tabela centralizada da Spec 01 para registrar acoes criticas das entidades desta
feature.

## Entity: mms_lotes_importacao

Representa uma tentativa de importacao MMS.

### Fields

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | uuid | Yes | Primary key |
| `nome_origem` | text | Yes | Nome do arquivo ou identificacao da origem |
| `posto_id` | uuid | Yes | FK para `postos.id` |
| `data_atividade` | date | No | Data identificada no arquivo/lote quando disponivel |
| `usuario_importador_id` | uuid | Yes | FK para `usuarios.id` |
| `status` | text/enum | No | Nulo ate conclusao/cancelamento; quando preenchido aceita apenas `importado`, `importado_com_alertas`, `erro`, `cancelado` |
| `estado_processamento` | text | Yes | Estado tecnico do lote: `recebido`, `processando`, `validado` |
| `processamento_iniciado_at` | timestamptz | No | Timestamp tecnico |
| `processamento_finalizado_at` | timestamptz | No | Timestamp tecnico |
| `total_linhas` | integer | Yes | Total de linhas ativas do lote |
| `total_linhas_validas` | integer | Yes | Linhas sem erro bloqueante |
| `total_linhas_com_erro` | integer | Yes | Linhas com erro bloqueante |
| `total_linhas_com_alerta` | integer | Yes | Linhas com pelo menos um alerta |
| `total_linhas_ignoradas` | integer | Yes | Linhas tecnicamente ignoradas quando aplicavel |
| `created_at` | timestamptz | Yes | Controle de criacao |
| `created_by` | uuid | Yes | FK para `usuarios.id` |
| `updated_at` | timestamptz | Yes | Controle de atualizacao |
| `updated_by` | uuid | Yes | FK para `usuarios.id` |
| `deleted_at` | timestamptz | No | Soft delete |
| `deleted_by` | uuid | No | FK para `usuarios.id` quando removido |
| `delete_reason` | text | No | Obrigatorio quando `deleted_at` estiver preenchido |

### Relationships

- `posto_id` referencia `postos.id`.
- `usuario_importador_id`, `created_by`, `updated_by` e `deleted_by` referenciam
  `usuarios.id`.
- Possui muitas `mms_linhas_importacao`, `mms_erros_importacao` e
  `mms_alertas_importacao`.
- Acoes criticas geram eventos em `historico_auditoria`.

### Validation

- `nome_origem` e obrigatorio e nao pode ser vazio.
- `posto_id` deve referenciar posto existente, ativo e nao removido logicamente
  para criacao de novo lote.
- `status` pode ficar nulo enquanto `estado_processamento` estiver `recebido` ou
  `processando`.
- `status`, quando preenchido, deve estar limitado aos quatro valores oficiais.
- `estado_processamento` deve indicar o ciclo interno inicial sem expandir os
  status oficiais.
- Totais devem ser maiores ou iguais a zero.
- Totais devem ser consistentes com linhas, erros e alertas ativos do lote.
- Quando `deleted_at` estiver preenchido, `deleted_by` e `delete_reason` tambem
  devem estar preenchidos.
- Soft delete nao pode alterar `status`.

### State Transitions

- Criado/recebido: `estado_processamento = recebido`, `status = null`.
- Em validacao bruta: `estado_processamento = processando`, `status = null`.
- Validado sem erros ou alertas: `estado_processamento = validado`,
  `status = importado`.
- Validado com alertas e sem erros: `estado_processamento = validado`,
  `status = importado_com_alertas`.
- Validado com qualquer erro bloqueante: `estado_processamento = validado`,
  `status = erro`.
- Cancelado por usuario autorizado: `status = cancelado`.
- Soft delete: preenche `deleted_at`, `deleted_by`, `delete_reason` e remove de
  consultas operacionais padrao sem mudar para status de exclusao.

## Entity: mms_linhas_importacao

Representa uma linha bruta da planilha MMS dentro de um lote.

### Fields

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | uuid | Yes | Primary key |
| `lote_importacao_id` | uuid | Yes | FK para `mms_lotes_importacao.id` |
| `numero_linha_origem` | integer | No | Numero/ordem da linha no arquivo quando disponivel |
| `raw_json` | jsonb | Yes | Dado original da linha MMS; obrigatorio, nao nulo, nao vazio e imutavel apos criacao |
| `posto_id` | uuid | No | Campo candidato extraido/resolvido |
| `data_atividade` | date | No | Campo candidato extraido/resolvido |
| `numero_assistencia` | text | No | Campo candidato extraido/resolvido |
| `parte_conjunto` | text | No | Campo candidato extraido/resolvido |
| `estado_validacao` | text | Yes | Estado tecnico da linha |
| `created_at` | timestamptz | Yes | Controle de criacao |
| `created_by` | uuid | Yes | FK para `usuarios.id` |
| `updated_at` | timestamptz | Yes | Controle de atualizacao |
| `updated_by` | uuid | Yes | FK para `usuarios.id` |
| `deleted_at` | timestamptz | No | Soft delete |
| `deleted_by` | uuid | No | FK para `usuarios.id` quando removido |
| `delete_reason` | text | No | Obrigatorio quando `deleted_at` estiver preenchido |

### Relationships

- `lote_importacao_id` referencia `mms_lotes_importacao.id`.
- `posto_id` referencia `postos.id` quando resolvido.
- Possui muitos `mms_erros_importacao` e `mms_alertas_importacao`.

### Validation

- `raw_json` e obrigatorio, deve ser `jsonb`, nao pode ser nulo e nao pode ser
  objeto/array vazio ou valor que nao represente uma linha MMS original.
- `raw_json` nao pode ser alterado apos criacao em fluxos operacionais comuns.
- Campos candidatos devem ser preenchidos quando extraiveis/resolvidos.
- Ausencia ou formato invalido de campo candidato esperado gera erro ou alerta,
  conforme a severidade definida no contrato de validacao.
- Linha soft-deleted nao deve contar em totais operacionais padrao.

### Technical Validation States

Valores recomendados para `estado_validacao`:

- `pendente`
- `valida`
- `valida_com_alerta`
- `invalida`
- `ignorada`

Esses valores sao tecnicos e nao alteram a lista oficial de status do lote.

## Entity: mms_erros_importacao

Representa um problema bloqueante de lote ou linha.

### Fields

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | uuid | Yes | Primary key |
| `lote_importacao_id` | uuid | Yes | FK para `mms_lotes_importacao.id` |
| `linha_importacao_id` | uuid | No | FK para `mms_linhas_importacao.id` quando erro for de linha |
| `campo` | text | No | Campo afetado |
| `codigo` | text | Yes | Codigo estavel da regra violada |
| `mensagem` | text | Yes | Mensagem legivel para revisao |
| `contexto` | jsonb | No | Dados auxiliares sem substituir `raw_json` |
| `created_at` | timestamptz | Yes | Controle de criacao |
| `created_by` | uuid | Yes | FK para `usuarios.id` |
| `deleted_at` | timestamptz | No | Soft delete |
| `deleted_by` | uuid | No | FK para `usuarios.id` quando removido |
| `delete_reason` | text | No | Obrigatorio quando `deleted_at` estiver preenchido |

### Validation

- `codigo` e `mensagem` sao obrigatorios.
- Deve existir lote associado.
- Se `linha_importacao_id` estiver preenchido, a linha deve pertencer ao mesmo
  lote.
- Erro ativo deve contribuir para `total_linhas_com_erro` quando associado a
  linha ativa.

## Entity: mms_alertas_importacao

Representa uma condicao nao bloqueante de lote ou linha.

### Fields

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | uuid | Yes | Primary key |
| `lote_importacao_id` | uuid | Yes | FK para `mms_lotes_importacao.id` |
| `linha_importacao_id` | uuid | No | FK para `mms_linhas_importacao.id` quando alerta for de linha |
| `campo` | text | No | Campo afetado |
| `codigo` | text | Yes | Codigo estavel da regra observada |
| `mensagem` | text | Yes | Mensagem legivel para revisao |
| `contexto` | jsonb | No | Dados auxiliares sem substituir `raw_json` |
| `created_at` | timestamptz | Yes | Controle de criacao |
| `created_by` | uuid | Yes | FK para `usuarios.id` |
| `deleted_at` | timestamptz | No | Soft delete |
| `deleted_by` | uuid | No | FK para `usuarios.id` quando removido |
| `delete_reason` | text | No | Obrigatorio quando `deleted_at` estiver preenchido |

### Validation

- `codigo` e `mensagem` sao obrigatorios.
- Deve existir lote associado.
- Se `linha_importacao_id` estiver preenchido, a linha deve pertencer ao mesmo
  lote.
- Alerta ativo deve contribuir para `total_linhas_com_alerta` quando associado a
  linha ativa.

## Access Model

| Perfil | Lotes | Linhas, erros e alertas |
| --- | --- | --- |
| Sem perfil ativo | Sem acesso | Sem acesso |
| Operador | Select de lotes dos postos do escopo; criacao apenas quando autorizado | Select de filhos dos lotes acessiveis |
| Supervisao | Select/update/cancelamento/soft delete de lotes dos postos do escopo | Select/update validacao de filhos dos lotes acessiveis |
| Direcao/Admin | Gestao global | Gestao global |

## Indexing Plan

- Indices em `mms_lotes_importacao.posto_id`, `status`, `data_atividade`,
  `created_at` e `deleted_at`.
- Indices compostos para consultas operacionais de lotes por posto/status/data.
- Indices em `mms_linhas_importacao.lote_importacao_id`,
  `numero_linha_origem`, `estado_validacao`, `deleted_at` e nos campos candidatos
  `posto_id`, `data_atividade`, `numero_assistencia`, `parte_conjunto`.
- Indices em `mms_erros_importacao.lote_importacao_id`,
  `linha_importacao_id`, `codigo`, `campo` e `deleted_at`.
- Indices em `mms_alertas_importacao.lote_importacao_id`,
  `linha_importacao_id`, `codigo`, `campo` e `deleted_at`.
- Indices em FKs de controle (`created_by`, `updated_by`, `deleted_by`) quando
  aplicavel.
