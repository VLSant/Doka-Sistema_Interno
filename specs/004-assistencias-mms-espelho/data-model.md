# Data Model: Assistencias MMS - Espelho Operacional Idempotente

## Existing Dependencies

### usuarios

Tabela operacional da Spec 01 usada para identificar usuario responsavel por
criacao, atualizacao, correcao, marcacao `removido`, reativacao, soft delete
excepcional e auditoria.

### postos

Tabela operacional da Spec 01 usada por `mms_assistencias.posto_id` e pelas
policies de escopo por posto.

### usuarios_postos

Tabela da Spec 01 usada pelas policies para restringir Operador e Supervisao ao
escopo por posto.

### historico_auditoria

Tabela centralizada da Spec 01 para registrar acoes criticas das entidades desta
feature.

### mms_lotes_importacao

Tabela da Spec 03 que fornece lote, posto, data de atividade, status oficial,
estado tecnico e totais. Esta feature consome somente lotes elegiveis.

### mms_linhas_importacao

Tabela da Spec 03 que fornece `raw_json`, campos candidatos normalizados e estado
de validacao da linha.

## Entity: mms_assistencias

Representa o servico principal importado da MMS.

### Fields

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | uuid | Yes | Primary key |
| `posto_id` | uuid | Yes | FK para `postos.id` |
| `data_atividade` | date | Yes | Data operacional da MMS |
| `numero_assistencia` | text | Yes | Numero do servico principal |
| `numero_assistencia_normalizado` | text | Yes | Valor normalizado para unicidade |
| `status_interno` | text | Yes | `ativo` ou `removido` |
| `status_atividade` | text | No | Status operacional normalizado da MMS |
| `tipo_atividade_original` | text | No | Tipo principal original quando aplicavel |
| `tipo_atividade_normalizado` | text | No | Tipo principal normalizado |
| `cliente_nome_importado` | text | No | Valor importado mais recente |
| `cliente_nome_corrigido` | text | No | Valor corrigido ativo quando aplicavel |
| `endereco_importado` | text | No | Valor importado mais recente |
| `endereco_corrigido` | text | No | Valor corrigido ativo quando aplicavel |
| `lote_criacao_id` | uuid | Yes | FK para `mms_lotes_importacao.id` |
| `linha_criacao_id` | uuid | No | FK para `mms_linhas_importacao.id` quando disponivel |
| `lote_ultimo_id` | uuid | Yes | FK para lote mais recente que afetou o registro |
| `linha_ultima_id` | uuid | No | FK para linha mais recente quando disponivel |
| `raw_json_resumo` | jsonb | Yes | Resumo auditavel derivado das linhas MMS |
| `corrigido_em` | timestamptz | No | Ultima correcao manual ativa |
| `corrigido_por` | uuid | No | FK para `usuarios.id` |
| `motivo_correcao` | text | No | Contexto da correcao |
| `removido_em` | timestamptz | No | Quando `status_interno` virou `removido` |
| `removido_lote_id` | uuid | No | Lote elegivel que causou a marcacao |
| `created_at` | timestamptz | Yes | Controle de criacao |
| `created_by` | uuid | Yes | FK para `usuarios.id` |
| `updated_at` | timestamptz | Yes | Controle de atualizacao |
| `updated_by` | uuid | Yes | FK para `usuarios.id` |
| `deleted_at` | timestamptz | No | Soft delete excepcional |
| `deleted_by` | uuid | No | FK para `usuarios.id` quando removido logicamente |
| `delete_reason` | text | No | Obrigatorio quando `deleted_at` estiver preenchido |

### Relationships

- `posto_id` referencia `postos.id`.
- `lote_criacao_id`, `lote_ultimo_id` e `removido_lote_id` referenciam
  `mms_lotes_importacao.id`.
- `linha_criacao_id` e `linha_ultima_id` referenciam `mms_linhas_importacao.id`.
- Possui muitas `mms_partes_assistencia`.
- Acoes criticas geram eventos em `historico_auditoria`.

### Validation

- A identidade principal e `posto_id + data_atividade + numero_assistencia_normalizado`.
- Deve existir no maximo uma assistencia nao deletada logicamente por identidade
  principal.
- `status_interno` aceita `ativo` e `removido`.
- `status_interno = removido` nao pode ser usado como soft delete.
- `raw_json_resumo` e obrigatorio e nao pode substituir o `raw_json` das partes.
- Quando `deleted_at` estiver preenchido, `deleted_by` e `delete_reason` tambem
  devem estar preenchidos.

### Visible Value Rules

- Para campos corrigiveis, o valor visivel e o valor corrigido ativo quando
  existir.
- Se nao houver correcao ativa, o valor visivel e o ultimo valor importado
  elegivel.
- Nova importacao atualiza campos importados e lote/linha mais recentes, mas nao
  remove correcao ativa sem acao explicita e auditada.
- Campos corrigiveis v1 em `mms_assistencias`: `cliente_nome` e `endereco`.
- Funcoes de correcao devem receber apenas campo permitido, valor corrigido,
  motivo/contexto obrigatorio e ator inferido do usuario operacional autenticado.
- `raw_json_resumo` deve ser protegido contra update direto fora de rotina de
  importacao elegivel e auditada.

## Entity: mms_partes_assistencia

Representa uma parte do conjunto vinculada a uma assistencia principal.

### Fields

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | uuid | Yes | Primary key |
| `assistencia_id` | uuid | Yes | FK para `mms_assistencias.id` |
| `parte_conjunto` | text | Yes | Identificador da parte |
| `parte_conjunto_normalizada` | text | Yes | Valor normalizado para unicidade |
| `status_interno` | text | Yes | `ativo` ou `removido` |
| `status_atividade` | text | No | Status operacional normalizado da MMS |
| `tipo_atividade_original` | text | No | Tipo original da MMS |
| `tipo_atividade_normalizado` | text | No | Tipo normalizado |
| `codigo_mercadoria_importado` | text | No | Valor importado mais recente |
| `descricao_mercadoria_importada` | text | No | Valor importado mais recente |
| `descricao_mercadoria_corrigida` | text | No | Valor corrigido ativo quando aplicavel |
| `recurso_importado` | text | No | Valor importado mais recente |
| `recurso_corrigido` | text | No | Valor corrigido ativo quando aplicavel |
| `valor_deslocamento_importado` | numeric | No | Valor importado para consumo futuro |
| `valor_receber_movel_importado` | numeric | No | Valor importado para consumo futuro |
| `atendimento_critico` | boolean | No | Valor importado/normalizado quando disponivel |
| `quantidade_reagendamento` | integer | No | Valor importado/normalizado quando disponivel |
| `comentarios_local_montagem` | text | No | Valor importado quando disponivel |
| `observacao_finalizacao` | text | No | Valor importado quando disponivel |
| `defeito_identificado` | text | No | Valor importado quando disponivel |
| `laudo_ou_observacao` | text | No | Valor importado quando disponivel |
| `lote_criacao_id` | uuid | Yes | FK para `mms_lotes_importacao.id` |
| `linha_criacao_id` | uuid | Yes | FK para `mms_linhas_importacao.id` |
| `lote_ultimo_id` | uuid | Yes | FK para lote mais recente |
| `linha_ultima_id` | uuid | Yes | FK para linha mais recente |
| `raw_json` | jsonb | Yes | Linha MMS original preservada |
| `corrigido_em` | timestamptz | No | Ultima correcao manual ativa |
| `corrigido_por` | uuid | No | FK para `usuarios.id` |
| `motivo_correcao` | text | No | Contexto da correcao |
| `removido_em` | timestamptz | No | Quando `status_interno` virou `removido` |
| `removido_lote_id` | uuid | No | Lote elegivel que causou a marcacao |
| `created_at` | timestamptz | Yes | Controle de criacao |
| `created_by` | uuid | Yes | FK para `usuarios.id` |
| `updated_at` | timestamptz | Yes | Controle de atualizacao |
| `updated_by` | uuid | Yes | FK para `usuarios.id` |
| `deleted_at` | timestamptz | No | Soft delete excepcional |
| `deleted_by` | uuid | No | FK para `usuarios.id` quando removido logicamente |
| `delete_reason` | text | No | Obrigatorio quando `deleted_at` estiver preenchido |

### Relationships

- `assistencia_id` referencia `mms_assistencias.id`.
- Lotes e linhas de criacao/atualizacao referenciam entidades da Spec 03.
- Acoes criticas geram eventos em `historico_auditoria`.

### Validation

- A chave idempotente completa e composta pela identidade da assistencia
  principal mais `parte_conjunto_normalizada`.
- Deve existir no maximo uma parte nao deletada logicamente por assistencia e
  `parte_conjunto_normalizada`.
- `raw_json` e obrigatorio, nao nulo e preserva a linha MMS original.
- `status_interno` aceita `ativo` e `removido`.
- `status_interno = removido` nao pode ser usado como soft delete.
- Quando `deleted_at` estiver preenchido, `deleted_by` e `delete_reason` tambem
  devem estar preenchidos.

### State Transitions

- Criada por importacao elegivel: `status_interno = ativo`.
- Atualizada por nova importacao elegivel: permanece `ativo` e atualiza campos
  importados/rastreabilidade.
- Ausente em nova importacao elegivel completa do mesmo posto/data:
  `status_interno = removido`.
- Reaparece em nova importacao elegivel: retorna para `ativo`, atualiza campos e
  registra reativacao.
- Soft delete excepcional: preenche `deleted_at`, `deleted_by`, `delete_reason`
  sem usar `removido`.
- Campos corrigiveis v1 em `mms_partes_assistencia`:
  `descricao_mercadoria` e `recurso`.
- Funcoes de correcao devem receber apenas campo permitido, valor corrigido,
  motivo/contexto obrigatorio e ator inferido do usuario operacional autenticado.
- `raw_json` deve ser protegido contra update direto fora de rotina de importacao
  elegivel e auditada.

## Eligibility Model

Um lote e elegivel para atualizar o espelho quando:

- `mms_lotes_importacao.status = importado`; ou
- `mms_lotes_importacao.status = importado_com_alertas`, sem erro bloqueante,
  com alertas nao bloqueantes e completo para o posto/data.

Completude do lote e derivada dos dados da Spec 03 e exige:

- `estado_processamento = validado`;
- `posto_id` e `data_atividade` resolvidos no lote;
- `total_linhas` ativo maior que zero;
- totais consistentes com linhas, erros e alertas ativos;
- nenhum erro bloqueante ativo;
- nenhuma linha ativa em `pendente`, `invalida` ou `ignorada` quando essa linha
  fizer parte do espelho do posto/data;
- todas as linhas ativas transformaveis em `valida` ou `valida_com_alerta`;
- todas as linhas transformaveis com `posto_id`, `data_atividade`,
  `numero_assistencia` e `parte_conjunto` preenchidos.

Um lote nao e elegivel quando:

- `status = erro`;
- `status = cancelado`;
- `status` nulo ou `estado_processamento` diferente de `validado`;
- esta incompleto ou parcial;
- possui erro bloqueante nao resolvido;
- nao possui posto/data suficientes para escopo do espelho.

Uma linha e elegivel quando:

- pertence a lote elegivel;
- possui `estado_validacao` igual a `valida` ou `valida_com_alerta`;
- possui `posto_id`, `data_atividade`, `numero_assistencia` e `parte_conjunto`
  normalizados;
- nao possui erro bloqueante ativo.

Linhas `pendente`, `invalida` ou `ignorada` nao atualizam o espelho.

## Access Model

| Perfil | `mms_assistencias` | `mms_partes_assistencia` |
| --- | --- | --- |
| Sem perfil ativo | Sem acesso | Sem acesso |
| Operador | Select e correcao autorizada apenas dos postos vinculados | Select e correcao autorizada apenas das partes de assistencias acessiveis |
| Supervisao | Select e correcao apenas dos postos do escopo | Select e correcao apenas das partes do escopo |
| Direcao/Admin | Gestao/auditoria global | Gestao/auditoria global |

## Indexing Plan

- Indice unico parcial em `mms_assistencias`
  (`posto_id`, `data_atividade`, `numero_assistencia_normalizado`) para registros
  nao deletados logicamente.
- Indice unico parcial em `mms_partes_assistencia`
  (`assistencia_id`, `parte_conjunto_normalizada`) para registros nao deletados
  logicamente.
- Indices em `mms_assistencias.posto_id`, `data_atividade`,
  `numero_assistencia_normalizado`, `status_interno`, `status_atividade`,
  `tipo_atividade_normalizado`, `deleted_at`.
- Indices em `mms_partes_assistencia.assistencia_id`,
  `parte_conjunto_normalizada`, `status_interno`, `status_atividade`,
  `tipo_atividade_normalizado`, `lote_ultimo_id`, `linha_ultima_id`,
  `deleted_at`.
- Indices em FKs de lote/linha e controle (`created_by`, `updated_by`,
  `deleted_by`, `corrigido_por`) quando aplicavel.
