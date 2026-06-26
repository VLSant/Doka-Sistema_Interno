# Validation and Idempotency Contract: Assistencias MMS

## Principal Assistance Identity

`mms_assistencias` usa a identidade:

```text
posto_id + data_atividade + numero_assistencia_normalizado
```

Essa identidade representa o servico principal. Partes diferentes nao podem criar
assistencias principais duplicadas.

## Part Identity

`mms_partes_assistencia` usa a identidade completa:

```text
posto_id + data_atividade + numero_assistencia_normalizado + parte_conjunto_normalizada
```

Na tabela de partes, essa identidade e aplicada pela assistencia principal
vinculada mais `parte_conjunto_normalizada`.

## Eligible Input

Um lote pode atualizar o espelho somente quando:

- `status = importado`; ou
- `status = importado_com_alertas`, completo para o posto/data e sem erro
  bloqueante ativo.

Para a Spec 04, "completo" e uma regra derivada da Spec 03. Um lote completo
deve cumprir todos os criterios:

- `estado_processamento = validado`;
- `posto_id` e `data_atividade` preenchidos;
- `total_linhas` ativo maior que zero;
- totais consistentes com linhas, erros e alertas ativos;
- nenhum erro bloqueante ativo no lote ou em suas linhas;
- nenhuma linha ativa do espelho com `estado_validacao` `pendente`, `invalida`
  ou `ignorada`;
- todas as linhas ativas transformaveis com `estado_validacao` `valida` ou
  `valida_com_alerta`;
- todas as linhas transformaveis com `posto_id`, `data_atividade`,
  `numero_assistencia` e `parte_conjunto` preenchidos.

Um lote nao pode atualizar o espelho nem marcar `removido` quando:

- `status = erro`;
- `status = cancelado`;
- `status` nulo;
- `estado_processamento` diferente de `validado`;
- estiver incompleto;
- for parcial;
- possuir erro bloqueante nao resolvido.

Uma linha pode atualizar o espelho somente quando:

- pertence a lote elegivel;
- possui `estado_validacao` `valida` ou `valida_com_alerta`;
- possui `posto_id`, `data_atividade`, `numero_assistencia` e `parte_conjunto`
  normalizados;
- esta valida para transformacao conforme Spec 03;
- nao possui erro bloqueante ativo.

Linhas com `estado_validacao` `pendente`, `invalida` ou `ignorada` nao podem
alimentar o espelho.

## Upsert Rules

- Linha elegivel com assistencia principal inexistente cria
  `mms_assistencias`.
- Linha elegivel com assistencia principal existente reutiliza
  `mms_assistencias`.
- Linha elegivel com parte inexistente cria `mms_partes_assistencia`.
- Linha elegivel com parte existente atualiza a parte.
- Reprocessar o mesmo lote/linha nao cria duplicidade.
- Nova importacao elegivel atualiza `lote_ultimo_id`, `linha_ultima_id`,
  campos importados e raw evidence correspondente.

## Removed Rules

- Somente nova importacao elegivel e completa do mesmo posto/data pode marcar
  ausentes como `removido`.
- A comparacao de ausencia ocorre no nivel de partes pela chave completa.
- Parte ausente vira `status_interno = removido`, sem soft delete.
- Assistencia principal vira `removido` quando todas as suas partes daquele
  espelho estiverem `removido`.
- Assistencia principal volta para `ativo` quando ao menos uma parte ativa
  existe ou reaparece.
- Parte `removido` que reaparece em lote elegivel volta para `ativo`.

## Raw Evidence and Corrections

- `mms_partes_assistencia.raw_json` preserva a linha MMS original.
- `mms_assistencias.raw_json_resumo` preserva um resumo auditavel da assistencia
  principal.
- Correcoes manuais nunca sobrescrevem `raw_json` ou `raw_json_resumo`.
- Campos corrigiveis v1 sao limitados a `cliente_nome`, `endereco`,
  `descricao_mercadoria` e `recurso`.
- Funcoes de correcao devem aceitar apenas um campo da allowlist, valor
  corrigido, motivo/contexto obrigatorio e ator inferido do usuario operacional
  autenticado.
- Campos corrigiveis devem distinguir valor importado e valor corrigido.
- Valor visivel = correcao ativa; se nao houver correcao ativa, ultimo valor
  importado elegivel.
- Nova importacao atualiza valor importado e rastreabilidade, mas nao apaga
  correcao ativa sem acao explicita e auditada.

## Required SQL Tests

- Duas partes do mesmo numero geram uma assistencia principal e duas partes.
- Reprocessar o mesmo lote tres vezes nao gera duplicidade.
- Linha nova cria parte nova na assistencia existente.
- Linha alterada atualiza parte sem apagar correcao ativa.
- Lote elegivel completo marca ausentes como `removido`.
- Lote `erro`, `cancelado`, incompleto ou parcial nao marca ausentes.
- Parte `removido` que reaparece e reativada.
- Todos os registros preservam lote/linha de criacao e lote/linha mais recente.
- `raw_json` e `raw_json_resumo` permanecem preenchidos e auditaveis.
- Update direto de `raw_json` ou `raw_json_resumo` fora de rotina de importacao
  aprovada e bloqueado.
- Tentativa de corrigir campo fora da allowlist falha.
