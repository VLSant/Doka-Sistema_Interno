# Data Model: Cadastros Base MVP

## Existing Dependencies

### usuarios

Tabela operacional da Spec 01 usada para identificar o perfil atual e o usuario
responsavel por criacao, atualizacao, soft delete e auditoria.

### postos

Tabela operacional da Spec 01 usada por `metas_eficiencia.posto_id`. Novas metas
so podem ser criadas ou reativadas para postos existentes, ativos e nao removidos
logicamente.

### usuarios_postos

Tabela da Spec 01 usada pelas policies para restringir Operador e Supervisao ao
escopo por posto.

### historico_auditoria

Tabela centralizada da Spec 01 para registrar acoes criticas das entidades desta
feature.

## Entity: prioridades

Cadastro global de classificacao de prioridade operacional.

### Fields

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | uuid | Yes | Primary key |
| `nome` | text | Yes | Nome exibivel da prioridade |
| `nome_normalizado` | text | Yes | Valor normalizado para comparacao |
| `nivel` | integer | Yes | Ordem operacional positiva |
| `cor` | text | Yes | Token do design system Doka ou `#RRGGBB` |
| `ativo` | boolean | Yes | Default `true` |
| `created_at` | timestamptz | Yes | Controle de criacao |
| `created_by` | uuid | Yes | FK para `usuarios.id` |
| `updated_at` | timestamptz | Yes | Controle de atualizacao |
| `updated_by` | uuid | Yes | FK para `usuarios.id` |
| `deleted_at` | timestamptz | No | Soft delete |
| `deleted_by` | uuid | No | FK para `usuarios.id` quando removido |
| `delete_reason` | text | No | Obrigatorio quando `deleted_at` estiver preenchido |

### Relationships

- `created_by`, `updated_by` e `deleted_by` referenciam `usuarios.id`.
- Eventos criticos devem gerar registros em `historico_auditoria`.

### Validation

- `nome` nao pode ficar vazio apos normalizacao.
- `nivel` deve ser inteiro positivo.
- `cor` deve ser token valido do design system Doka ou hexadecimal `#RRGGBB`.
- Nao pode haver duas prioridades ativas e nao removidas com o mesmo
  `nome_normalizado`.
- Nao pode haver duas prioridades ativas e nao removidas com o mesmo `nivel`.
- Quando `deleted_at` estiver preenchido, `deleted_by` e `delete_reason` tambem
  devem estar preenchidos.

### State Transitions

- Criada ativa: `ativo = true`, `deleted_at = null`.
- Inativada: `ativo = false`, `deleted_at = null`.
- Reativada: `ativo = true`, `deleted_at = null`, respeitando unicidade ativa.
- Removida logicamente: `deleted_at` preenchido, `deleted_by` preenchido,
  `delete_reason` preenchido.

## Entity: tipos_ocorrencia

Cadastro global de classificacao para ocorrencias futuras. Esta feature nao cria
ocorrencias reais.

### Fields

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | uuid | Yes | Primary key |
| `nome` | text | Yes | Nome exibivel do tipo |
| `nome_normalizado` | text | Yes | Valor normalizado para comparacao |
| `descricao` | text | No | Descricao administrativa |
| `ativo` | boolean | Yes | Default `true` |
| `created_at` | timestamptz | Yes | Controle de criacao |
| `created_by` | uuid | Yes | FK para `usuarios.id` |
| `updated_at` | timestamptz | Yes | Controle de atualizacao |
| `updated_by` | uuid | Yes | FK para `usuarios.id` |
| `deleted_at` | timestamptz | No | Soft delete |
| `deleted_by` | uuid | No | FK para `usuarios.id` quando removido |
| `delete_reason` | text | No | Obrigatorio quando `deleted_at` estiver preenchido |

### Relationships

- `created_by`, `updated_by` e `deleted_by` referenciam `usuarios.id`.
- Eventos criticos devem gerar registros em `historico_auditoria`.

### Validation

- `nome` nao pode ficar vazio apos normalizacao.
- Nao pode haver dois tipos ativos e nao removidos com o mesmo
  `nome_normalizado`.
- Quando `deleted_at` estiver preenchido, `deleted_by` e `delete_reason` tambem
  devem estar preenchidos.

### State Transitions

- Criado ativo, inativado, reativado e removido logicamente com as mesmas regras
  gerais de soft delete de `prioridades`.

## Entity: metas_eficiencia

Cadastro operacional de meta percentual por posto, tipo de atividade normalizado
e vigencia.

### Fields

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | uuid | Yes | Primary key |
| `posto_id` | uuid | Yes | FK para `postos.id` |
| `tipo_atividade_normalizado` | text | Yes | Tipo de atividade normalizado |
| `meta_percentual` | numeric(5,2) | Yes | Maior que 0 e ate 100 no MVP |
| `vigencia_inicio` | date | Yes | Inicio da vigencia |
| `vigencia_fim` | date | No | Fim da vigencia, quando houver |
| `ativo` | boolean | Yes | Default `true` |
| `created_at` | timestamptz | Yes | Controle de criacao |
| `created_by` | uuid | Yes | FK para `usuarios.id` |
| `updated_at` | timestamptz | Yes | Controle de atualizacao |
| `updated_by` | uuid | Yes | FK para `usuarios.id` |
| `deleted_at` | timestamptz | No | Soft delete |
| `deleted_by` | uuid | No | FK para `usuarios.id` quando removido |
| `delete_reason` | text | No | Obrigatorio quando `deleted_at` estiver preenchido |

### Relationships

- `posto_id` referencia `postos.id`.
- `created_by`, `updated_by` e `deleted_by` referenciam `usuarios.id`.
- Eventos criticos devem gerar registros em `historico_auditoria`.

### Validation

- `posto_id` deve existir em `postos`.
- Novas metas e reativacoes devem rejeitar postos inativos ou removidos
  logicamente.
- `tipo_atividade_normalizado` nao pode ficar vazio apos normalizacao.
- `meta_percentual` deve ser maior que zero e menor ou igual a 100.
- `vigencia_fim`, quando presente, deve ser maior ou igual a `vigencia_inicio`.
- Nao pode haver sobreposicao entre metas ativas e nao removidas para a mesma
  combinacao `posto_id` + `tipo_atividade_normalizado`.
- Quando `deleted_at` estiver preenchido, `deleted_by` e `delete_reason` tambem
  devem estar preenchidos.

### State Transitions

- Criada ativa: valida posto ativo, percentual, vigencia e sobreposicao.
- Inativada: deixa de aparecer nas consultas operacionais padrao.
- Reativada: revalida posto ativo e ausencia de sobreposicao.
- Removida logicamente: preenche `deleted_at`, `deleted_by` e `delete_reason`.

## Normalization Rules

Aplicar a mesma regra para `nome_normalizado` e
`tipo_atividade_normalizado`:

- Remover espacos no inicio e fim.
- Substituir sequencias de espacos internos por um unico espaco.
- Comparar sem diferenciar maiusculas e minusculas.
- Tratar acentos de forma consistente para impedir duplicidade equivalente com
  ou sem acento.

## Access Model

| Perfil | `prioridades` | `tipos_ocorrencia` | `metas_eficiencia` |
| --- | --- | --- | --- |
| Sem perfil ativo | Sem acesso | Sem acesso | Sem acesso |
| Operador | Select ativos | Select ativos | Select ativos do escopo |
| Supervisao | Select ativos | Select ativos | Select/insert/update scoped |
| Direcao/Admin | Gestao global | Gestao global | Gestao global |

## Indexing Plan

- Indices unicos parciais para duplicidade ativa de `prioridades`.
- Indice unico parcial para duplicidade ativa de `tipos_ocorrencia`.
- Indices em FKs de controle (`created_by`, `updated_by`, `deleted_by`) e
  `metas_eficiencia.posto_id`.
- Indices compostos para consultas operacionais por `ativo`, `deleted_at`,
  `posto_id`, `tipo_atividade_normalizado` e vigencia.
- Constraint ou indice de exclusao para evitar sobreposicao ativa de vigencia em
  `metas_eficiencia`.
