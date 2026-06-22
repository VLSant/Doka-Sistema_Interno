# Staging Status Contract: Importacao MMS

## Official Batch Status

`mms_lotes_importacao.status` e o status de negocio do lote e deve aceitar apenas:

| Status | Meaning | When used |
| --- | --- | --- |
| `importado` | Lote importado sem erros ou alertas ativos | Validacao bruta concluiu sem problemas rastreaveis |
| `importado_com_alertas` | Lote importado sem erros, mas com alertas ativos | Validacao bruta encontrou condicoes nao bloqueantes |
| `erro` | Lote possui erro bloqueante ou falha de validacao/processamento | Qualquer erro ativo bloqueia avancar para transformacao futura |
| `cancelado` | Lote cancelado por usuario autorizado | Operacao interrompida e mantida apenas para auditoria |

Nenhum outro valor deve ser aceito em `status`.

## Technical Processing State

Etapas internas podem ser representadas por campos tecnicos separados, por
exemplo:

- `estado_processamento`
- `processamento_iniciado_at`
- `processamento_finalizado_at`
- `validado_at`

Esses campos nao sao status oficiais e nao devem ser usados para substituir as
regras de negocio do lote.

## Line Technical Validation State

`mms_linhas_importacao.estado_validacao` pode usar valores tecnicos como:

- `pendente`
- `valida`
- `valida_com_alerta`
- `invalida`
- `ignorada`

Esses valores sao derivados de erros/alertas e existem apenas no staging.

## Mapping Rules

- Se qualquer linha ativa tiver erro ativo, o lote deve terminar como `erro`.
- Se nenhuma linha ativa tiver erro e pelo menos uma linha ativa tiver alerta, o
  lote deve terminar como `importado_com_alertas`.
- Se nenhuma linha ativa tiver erro ou alerta, o lote deve terminar como
  `importado`.
- Se usuario autorizado cancelar o lote, o lote deve terminar como `cancelado`.
- Soft delete nao muda `status`; usa apenas `deleted_at`, `deleted_by` e
  `delete_reason`.

## Out of Scope

- Status de assistencia final.
- Status `removido`.
- Upsert/idempotencia da chave operacional MMS.
- Parser completo da planilha.
- Integracao automatica com MMS.
