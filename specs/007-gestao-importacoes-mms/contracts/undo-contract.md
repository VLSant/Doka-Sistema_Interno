# Contract: Análise e Desfazer Importação MMS

## Escopo autorizado

Somente Supervisão com cobertura integral de todos os postos do lote e
Direção/Administração podem analisar ou executar. Operador nunca desfaz.

## Definição de lote efetivo mais recente

Para cada par `posto_id + data_atividade` representado pelas linhas ativas do
lote, o lote alvo deve ser o último que:

- concluiu processamento do espelho;
- não foi cancelado;
- aplicou uma versão elegível;
- permanece como fonte efetiva mais recente daquele escopo.

Se a condição falhar em um único escopo de lote multi-posto, o lote inteiro é
inelegível.

## Motivos estáveis de bloqueio

- `lote_nao_processado`
- `lote_cancelado`
- `lote_nao_e_mais_recente`
- `escopo_incompleto`
- `operacao_em_andamento`
- `edicao_manual_posterior`
- `ocorrencia_vinculada`
- `custo_extra_vinculado`
- `dependencia_operacional`
- `predecessor_invalido`
- `evidencia_incompleta`
- `estado_irreconstruivel`

Mensagens ao usuário não revelam dados fora do escopo.

## `public.analisar_desfazer_importacao_mms`

### Entrada

```json
{ "p_lote_id": "uuid" }
```

### Comportamento

1. Revalida ator e cobertura integral.
2. Lê a versão atual sem manter lock após a resposta.
3. Identifica todos os escopos do lote.
4. Confirma que o lote é o efetivo mais recente em cada escopo.
5. Localiza o predecessor elegível imediato de cada escopo.
6. Examina assistências/partes afetadas e dependências posteriores.
7. Calcula impacto previsto.
8. Produz assinatura opaca cobrindo lote, versão, escopos, predecessores e
   marcadores de dependência.

### Saída elegível

```json
{
  "lote_id": "uuid",
  "elegivel": true,
  "versao_tratamento": 8,
  "assinatura_analise": "opaca",
  "analisado_em": "timestamp",
  "escopos": [
    {
      "posto_id": "uuid",
      "data_atividade": "2026-06-28",
      "lote_predecessor_id": "uuid"
    }
  ],
  "impacto": {
    "assistencias_restauradas": 10,
    "assistencias_retiradas": 2,
    "partes_restauradas": 12,
    "partes_retiradas": 2
  },
  "motivos_bloqueio": []
}
```

### Saída bloqueada

`elegivel = false`, sem assinatura executável, com todos os códigos de bloqueio
que o ator pode conhecer.

## `public.desfazer_importacao_mms`

### Entrada

```json
{
  "p_lote_id": "uuid",
  "p_assinatura_analise": "opaca",
  "p_justificativa": "Arquivo MMS importado para o dia incorreto.",
  "p_chave_idempotencia": "uuid"
}
```

### Comportamento

1. Resolve chave idempotente como no contrato de reprocessamento.
2. Normaliza e valida a justificativa.
3. Bloqueia lote e adquire locks dos escopos em ordem determinística.
4. Bloqueia assistências e partes afetadas.
5. Recalcula autorização, versão, posição temporal, predecessores e
   dependências.
6. Se assinatura/estado divergir, retorna `analise_desatualizada` sem efeitos.
7. Cria operação `em_andamento`.
8. Para cada escopo:
   - com predecessor, reconstrói somente aquele posto/data a partir das linhas
     efetivas do predecessor;
   - sem predecessor, marca como fora da visão operacional os efeitos exclusivos
     do lote, preservando fisicamente as entidades.
9. Confere que chaves, contadores e fontes `lote_ultimo_id/linha_ultima_id`
   correspondem ao estado restaurado.
10. Muda o lote alvo para `cancelado`, com
    `tipo_cancelamento = desfazer_processado`.
11. Persiste justificativa, resultado conciliado e operação concluída.
12. Registra auditoria.

Falha dentro da restauração reverte todos os escopos; o bloco externo registra a
operação falha sem marcar o lote Cancelado.

## Função privada de reconstrução por escopo

`app_private.mms_reconstruir_espelho_escopo(p_posto_id, p_data_atividade,
p_lote_fonte, p_lote_desfeito)`:

- nunca processa postos diferentes do argumento;
- usa `json_efetivo` do lote predecessor;
- reaplica a chave operacional vigente;
- marca ausentes como `removido` apenas nesse escopo;
- preserva `raw_json` da linha fonte;
- não remove correções ou auditoria;
- retorna contadores para conciliação.

`p_lote_fonte` nulo representa ausência de predecessor.

## Idempotência

- Repetir a mesma chave retorna a operação persistida.
- Nova chave contra lote já desfeito retorna o resultado de desfazer vigente sem
  repetir efeitos.
- Mesma chave com justificativa/lote divergente retorna
  `chave_idempotencia_conflitante`.

## Dependências futuras

Quando migrations de `ocorrencias` ou `custos_extras` forem introduzidas, elas
devem substituir/estender o verificador privado de dependências antes de
conceder escrita nessas tabelas. Ocorrência/custo vinculados a qualquer registro
afetado bloqueiam o lote inteiro.

## Auditoria obrigatória

- `analise_desfazer_realizada`
- `analise_desfazer_bloqueada`
- `desfazer_importacao_solicitado`
- `desfazer_importacao_concluido`
- `desfazer_importacao_falhou`

O sucesso registra ator, lote, justificativa, escopos, predecessores e
contadores, sem copiar arquivo ou `raw_json`.

## Testes obrigatórios

- Operador é bloqueado.
- Supervisão sem um dos postos de lote multi-posto é bloqueada.
- Lote não mais recente em um único escopo bloqueia o lote inteiro.
- Predecessores diferentes por posto são restaurados sem alterar outros escopos.
- Ausência de predecessor retira efeitos exclusivos sem delete físico.
- Edição manual, ocorrência, custo ou dependência bloqueia.
- Dependência criada após análise produz `analise_desatualizada`.
- Falha no segundo escopo reverte também o primeiro.
- Repetições não reaplicam efeitos.
- Arquivo, staging, correções e histórico permanecem acessíveis após sucesso.
