# Contract: Consulta e Detalhe de Lotes MMS

## Objetivo

Fornecer listagem, detalhe e coleções paginadas sem expor dados de postos fora
do escopo, inclusive quando um único lote contém múltiplos postos.

## Regras compartilhadas

- Todas as funções exigem usuário autenticado e operacional ativo.
- Perfil, vínculos e postos são consultados no momento da chamada.
- Direção/Administração possui escopo global.
- Operador e Supervisão recebem somente a interseção entre linhas do lote e
  postos ativos autorizados.
- Um lote parcialmente visível nunca expõe arquivo, nome completo do arquivo,
  totais globais, resultado global ou dados técnicos de postos ocultos.
- Cursor é estável e não usa offset para percorrer grandes coleções.
- Limite padrão é 50 e máximo é 100 itens.
- IDs inacessíveis retornam `acesso_negado` sem confirmar existência.

## `public.listar_lotes_importacao_mms`

### Entrada

```json
{
  "p_filtros": {
    "posto_id": "uuid opcional",
    "data_atividade": "YYYY-MM-DD opcional",
    "importado_de": "timestamp opcional",
    "importado_ate": "timestamp opcional",
    "status": "valor oficial opcional",
    "com_erro": "boolean opcional",
    "com_alerta": "boolean opcional",
    "usuario_importador_id": "uuid opcional"
  },
  "p_cursor_created_at": "timestamp opcional",
  "p_cursor_id": "uuid opcional",
  "p_limite": 50
}
```

### Comportamento

1. Valida filtros, intervalo e limite.
2. Resolve perfil e postos atuais.
3. Seleciona lotes com ao menos uma linha autorizada, ou globais para
   Direção/Administração.
4. Recalcula postos e contadores sobre linhas visíveis.
5. Aplica filtros antes da paginação.
6. Ordena por `created_at desc, id desc`.
7. Retorna capacidades derivadas do estado e do perfil.

### Saída

```json
{
  "itens": [
    {
      "lote_id": "uuid",
      "importado_em": "timestamp",
      "data_atividade": "YYYY-MM-DD",
      "postos": [{ "id": "uuid", "nome": "Posto A" }],
      "visibilidade_parcial": false,
      "usuario_importador": { "id": "uuid", "nome": "Nome" },
      "arquivo": "mms.xlsx",
      "status": "erro",
      "estado_processamento": "validado",
      "total_linhas": 100,
      "total_assistencias": 80,
      "total_partes": 100,
      "total_erros_pendentes": 2,
      "total_alertas": 3,
      "precisa_tratamento": true,
      "capacidades": {
        "abrir": true,
        "baixar_arquivo": true,
        "corrigir": true,
        "concluir_tratamento": false,
        "reprocessar": false,
        "analisar_desfazer": false
      }
    }
  ],
  "proximo_cursor": {
    "created_at": "timestamp",
    "id": "uuid"
  }
}
```

### Erros

- `filtros_invalidos`
- `cursor_invalido`
- `acesso_negado`
- `falha_temporaria`

## `public.obter_detalhe_lote_importacao_mms`

### Entrada

```json
{ "p_lote_id": "uuid" }
```

### Saída

Retorna o resumo autorizado acrescido de:

- confirmação e processamento;
- resultado conciliado somente quando integralmente visível;
- totais por classificação;
- última falha segura;
- versão de tratamento e versão processada;
- resumo de correções/reprocessamentos;
- tipo de cancelamento;
- capacidades atuais.

Coleções extensas não são incluídas.

## `public.listar_itens_lote_importacao_mms`

### Entrada

```json
{
  "p_lote_id": "uuid",
  "p_colecao": "linhas|erros|alertas|correcoes|operacoes|auditoria",
  "p_filtros": {},
  "p_cursor": {},
  "p_limite": 50
}
```

### Regras por coleção

- `linhas`: filtra por classificação, posto e número da linha.
- `erros`: somente erros visíveis, com estado de resolução e correção vigente.
- `alertas`: leitura apenas; visualização não altera estado.
- `correcoes`: histórico append-only da linha/campo, conforme perfil.
- `operacoes`: tentativas de reprocessamento/desfazer autorizadas.
- `auditoria`: somente eventos e metadados permitidos pelo contrato central.

`raw_json` e `json_normalizado` não são retornados por padrão. Um parâmetro de
expansão técnica só é aceito para perfil já autorizado e cobertura integral.

## Arquivo original

O caminho do objeto só é disponibilizado quando:

- todos os postos ativos das linhas do lote estão no escopo atual; e
- o perfil tem permissão vigente para arquivo; e
- o lote e o objeto não foram removidos.

A policy de `storage.objects` usa a mesma condição de cobertura integral. URL ou
menu não concedem acesso.

## Índices esperados

- lotes por `(created_at desc, id desc)`, status, data e importador;
- linhas por `(lote_importacao_id, posto_id, data_atividade)`;
- erros/alertas por `(lote_importacao_id, linha_importacao_id, created_at)`;
- correções/operações por lote e data descendente.

## Testes obrigatórios

- Operador com um de dois postos vê somente seu posto e contadores parciais.
- O mesmo Operador não obtém caminho/download do arquivo multi-posto.
- Supervisão com todos os postos recebe totais integrais e ações do próprio
  escopo.
- Direção/Administração recebe visão global.
- URL direta inacessível não confirma existência.
- Combinação de todos os filtros preserva ordenação e cursor sem duplicar itens.
- Alertas permanecem inalterados após consulta.
- Falha temporária não vira lista vazia.
