# Validation Contract: Cadastros Base MVP

## Normalization

Campos normalizados:

- `prioridades.nome_normalizado`
- `tipos_ocorrencia.nome_normalizado`
- `metas_eficiencia.tipo_atividade_normalizado`

Regra obrigatoria:

- Remover espacos no inicio e fim.
- Colapsar espacos internos repetidos para um unico espaco.
- Comparar sem diferenciar maiusculas e minusculas.
- Tratar acentos de forma consistente para impedir duplicidade equivalente com
  ou sem acento.

Examples:

| Input A | Input B | Expected |
| --- | --- | --- |
| `Alta` | ` alta ` | Duplicidade equivalente |
| `Reclamacao` | `RECLAMACAO` | Duplicidade equivalente |
| `Montagem  Externa` | `montagem externa` | Duplicidade equivalente |

## prioridades

Required validations:

- `nome` obrigatorio e nao vazio apos normalizacao.
- `nivel` obrigatorio, inteiro e maior que zero.
- `cor` obrigatoria.
- `cor` aceita somente token do design system Doka ou hexadecimal `#RRGGBB`.
- Duplicidade ativa por `nome_normalizado` deve ser rejeitada.
- Duplicidade ativa por `nivel` deve ser rejeitada.
- Registros inativos ou removidos logicamente nao aparecem em consultas
  operacionais padrao.
- Soft delete exige `deleted_at`, `deleted_by` e `delete_reason`.

## tipos_ocorrencia

Required validations:

- `nome` obrigatorio e nao vazio apos normalizacao.
- Duplicidade ativa por `nome_normalizado` deve ser rejeitada.
- `descricao` e opcional.
- Registros inativos ou removidos logicamente nao aparecem em consultas
  operacionais padrao.
- Soft delete exige `deleted_at`, `deleted_by` e `delete_reason`.

## metas_eficiencia

Required validations:

- `posto_id` obrigatorio e deve referenciar `postos.id`.
- Criacao e reativacao devem rejeitar posto inativo ou removido logicamente.
- `tipo_atividade_normalizado` obrigatorio e nao vazio apos normalizacao.
- `meta_percentual` obrigatorio, maior que zero e menor ou igual a 100.
- `vigencia_inicio` obrigatoria.
- `vigencia_fim`, quando preenchida, deve ser maior ou igual a
  `vigencia_inicio`.
- Nao pode haver sobreposicao entre metas ativas e nao removidas para o mesmo
  `posto_id` e `tipo_atividade_normalizado`.
- Vigencia aberta conflita com qualquer meta ativa posterior para a mesma
  combinacao.
- Registros inativos ou removidos logicamente nao aparecem em consultas
  operacionais padrao.
- Soft delete exige `deleted_at`, `deleted_by` e `delete_reason`.

## Required Test Scenarios

- Criar duplicidade ativa de prioridade por nome normalizado falha.
- Criar duplicidade ativa de prioridade por nivel falha.
- Criar duplicidade ativa de tipo de ocorrencia por nome normalizado falha.
- Recriar nome apos soft delete e permitido quando nao houver ativo equivalente.
- Criar meta para posto inexistente falha por FK.
- Criar meta para posto inativo ou removido logicamente falha.
- Criar meta com percentual `0`, negativo ou acima de `100` falha.
- Criar meta com `vigencia_fim` anterior a `vigencia_inicio` falha.
- Criar meta ativa sobreposta para mesma combinacao falha.
- Criar meta nao sobreposta para mesma combinacao e permitido.
