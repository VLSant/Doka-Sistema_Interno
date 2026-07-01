# Contract: Correção, Conclusão e Reprocessamento MMS

## Princípios

- `raw_json` e `json_normalizado` são imutáveis.
- Correções são append-only e aplicadas por allowlist.
- A mesma regra autoritativa valida ingestão e correção.
- O lote inteiro é revalidado e processado atomicamente.
- Operador com vínculo `operacional` corrige; vínculo `consulta` apenas lê.
- Somente Supervisão no escopo integral e Direção/Administração concluem e
  reprocessam.
- O ator é sempre derivado da sessão.

## Campos corrigíveis iniciais

A migration deve declarar chaves canônicas explícitas e seus validadores:

- `area_trabalho` / `posto_id`;
- `data_atividade`;
- `numero_assistencia`;
- `parte_conjunto`;
- `status_atividade`;
- `tipo_atividade_original` e seu normalizado derivado;
- valores numéricos que já possuam conversor determinístico na Spec 006.

Campos fora da allowlist retornam `campo_nao_corrigivel`. Uma correção de
`area_trabalho` resolve apenas a linha; não altera cadastro ou equivalência
global.

## `public.salvar_correcao_importacao_mms`

### Entrada

```json
{
  "p_linha_id": "uuid",
  "p_campo": "data_atividade",
  "p_valor_corrigido": "2026-06-28",
  "p_versao_esperada": 2
}
```

### Comportamento

1. Bloqueia lote e linha.
2. Revalida ator, perfil, vínculo e posto efetivo.
3. Exige lote não cancelado e sem operação mutável em andamento.
4. Compara `versao_correcao` com a versão esperada.
5. Normaliza e valida somente o campo solicitado.
6. Insere uma tentativa imutável.
7. Se válida, substitui a correção vigente do campo e recalcula `json_efetivo`.
8. Revalida todos os erros da linha afetados por esse campo.
9. Atualiza a classificação da linha e totais do lote.
10. Incrementa versões de linha/lote e invalida conclusão anterior.
11. Registra auditoria sem copiar o `raw_json`.

### Saída válida

```json
{
  "correcao_id": "uuid",
  "linha_id": "uuid",
  "campo": "data_atividade",
  "estado_validacao": "valida",
  "versao_correcao": 3,
  "versao_tratamento": 8,
  "erros_resolvidos": ["uuid"],
  "erros_pendentes": 1
}
```

### Saída inválida

A tentativa fica preservada com `estado_validacao = invalida`; a versão não
altera a projeção efetiva e o erro continua pendente.

### Erros

- `acesso_negado`
- `vinculo_somente_consulta`
- `campo_nao_corrigivel`
- `correcao_desatualizada`
- `lote_cancelado`
- `operacao_em_andamento`
- `valor_invalido`

## `public.concluir_tratamento_importacao_mms`

### Entrada

```json
{
  "p_lote_id": "uuid",
  "p_versao_tratamento_esperada": 8
}
```

### Comportamento

1. Bloqueia o lote.
2. Exige Supervisão com cobertura integral ou Direção/Administração.
3. Revalida sessão, postos, linhas, correções vigentes, arquivo e totais.
4. Recalcula todas as projeções efetivas e erros.
5. Bloqueia se houver linha incompleta, inválida ou erro pendente.
6. Define status `importado` ou `importado_com_alertas`, sem criar novo status.
7. Registra a versão concluída e retorna impacto previsto.

### Saída

```json
{
  "lote_id": "uuid",
  "versao_tratamento": 8,
  "elegivel": true,
  "status": "importado_com_alertas",
  "total_linhas": 100,
  "total_assistencias": 80,
  "total_partes": 100,
  "total_alertas": 3,
  "impacto_previsto": {
    "escopos": [{ "posto_id": "uuid", "data_atividade": "2026-06-28" }]
  }
}
```

## `public.reprocessar_lote_importacao_mms`

### Entrada

```json
{
  "p_lote_id": "uuid",
  "p_versao_tratamento": 8,
  "p_chave_idempotencia": "uuid"
}
```

### Comportamento

1. Busca operação existente pela chave.
2. Mesma chave e mesmos parâmetros retornam estado/resultado persistido.
3. Mesma chave com parâmetros diferentes retorna conflito.
4. Bloqueia lote e cria operação `em_andamento`.
5. Revalida autorização integral, versão concluída, arquivo, linhas, erros e
   ausência de outra operação.
6. Executa o processador da Spec 004/006 consumindo `json_efetivo`.
7. Mantém a regra completa de ausentes como `removido` por posto/data.
8. Persiste resultado conciliado, versão processada e operação concluída.
9. Em falha, a subtransação do espelho é revertida e a operação externa registra
   falha segura.

### Saída

```json
{
  "operacao_id": "uuid",
  "lote_id": "uuid",
  "tipo": "reprocessamento",
  "estado": "concluida",
  "versao_tratamento": 8,
  "resultado": {
    "assistencias_criadas": 0,
    "assistencias_atualizadas": 2,
    "assistencias_preservadas": 78,
    "assistencias_removidas": 0,
    "assistencias_reativadas": 0,
    "partes_criadas": 0,
    "partes_atualizadas": 2,
    "partes_preservadas": 98,
    "partes_removidas": 0,
    "partes_reativadas": 0
  }
}
```

## Resposta incerta

`public.obter_operacao_lote_mms(p_chave_idempotencia)` retorna a operação apenas
ao ator/escopo autorizado. A UI consulta esse estado antes de gerar nova chave.

## Auditoria obrigatória

- `correcao_importacao_tentada`
- `correcao_importacao_validada`
- `correcao_importacao_rejeitada`
- `erro_importacao_corrigido`
- `erro_importacao_reaberto`
- `tratamento_importacao_concluido`
- `tratamento_importacao_bloqueado`
- `reprocessamento_solicitado`
- `reprocessamento_concluido`
- `reprocessamento_falhou`

Operação bloqueada não gera evento de sucesso.

## Testes obrigatórios

- Operador `operacional` corrige linha do próprio posto.
- Operador `consulta` e posto fora do escopo são bloqueados.
- Operador não conclui nem reprocessa.
- Duas correções com mesma versão: uma vence e outra recebe conflito.
- Valor inválido é preservado sem resolver erro.
- Correção válida não altera `raw_json`/`json_normalizado`.
- Campo fora da allowlist é bloqueado.
- Correção de posto não cria equivalência global.
- Erro pendente bloqueia conclusão e espelho.
- Nova correção invalida conclusão anterior.
- Três repetições da mesma chave retornam o mesmo resultado.
- Falha injetada reverte todo o espelho e mantém tentativa falha auditável.
