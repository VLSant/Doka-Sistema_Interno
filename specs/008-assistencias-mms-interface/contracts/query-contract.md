# Contract: Lista e Detalhe de Assistências MMS

## Regras compartilhadas

- Usuário operacional ativo obrigatório.
- Direção/Administração consulta globalmente.
- Supervisão consulta somente postos com vínculo `supervisao`.
- Operador consulta postos vinculados por `operacional` ou `consulta`.
- Soft-deleted nunca aparece; `removido` aparece apenas quando solicitado.
- IDs inacessíveis retornam `acesso_negado` sem confirmar existência.
- Limite padrão 50, máximo 100.

## `public.listar_assistencias_mms`

### Entrada

```json
{
  "p_filtros": {
    "posto_id": "uuid opcional",
    "data_de": "YYYY-MM-DD opcional",
    "data_ate": "YYYY-MM-DD opcional",
    "status": "texto opcional",
    "tipo": "texto opcional",
    "cliente": "texto parcial opcional",
    "numero_assistencia": "texto parcial opcional",
    "situacao": "ativo|removido|todos; padrão ativo"
  },
  "p_cursor_data_atividade": "YYYY-MM-DD opcional",
  "p_cursor_id": "uuid opcional",
  "p_limite": 50
}
```

### Comportamento

1. Valida intervalo, filtros, situação, cursor e limite.
2. Resolve ator e escopo atuais.
3. Aplica escopo, soft delete e situação.
4. Aplica todos os filtros antes da paginação.
5. Normaliza busca sem unir números operacionalmente distintos.
6. Ordena por `data_atividade desc, id desc`.
7. Conta partes sem retornar coleções extensas.

### Saída

```json
{
  "itens": [
    {
      "assistencia_id": "uuid",
      "numero_assistencia": "A-123",
      "posto": { "id": "uuid", "nome": "Posto A" },
      "data_atividade": "2026-06-30",
      "cliente": "Cliente vigente",
      "tipo": "MONTAGEM",
      "status": "CONCLUÍDA",
      "situacao": "ativo",
      "total_partes_ativas": 2,
      "total_partes": 2,
      "versao_registro": 4
    }
  ],
  "proximo_cursor": {
    "data_atividade": "2026-06-30",
    "id": "uuid"
  }
}
```

### Erros

- `filtros_invalidos`
- `cursor_invalido`
- `acesso_negado`
- `falha_temporaria`

## `public.obter_detalhe_assistencia_mms`

### Entrada

```json
{
  "p_assistencia_id": "uuid",
  "p_incluir_partes_removidas": false
}
```

### Saída

```json
{
  "assistencia_id": "uuid",
  "numero_assistencia": "A-123",
  "posto": { "id": "uuid", "nome": "Posto A" },
  "data_atividade": "2026-06-30",
  "status": "CONCLUÍDA",
  "tipo_original": "Montagem",
  "tipo": "MONTAGEM",
  "situacao": "ativo",
  "cliente": {
    "importado": "Cliente MMS",
    "corrigido": "Cliente corrigido",
    "vigente": "Cliente corrigido",
    "origem_vigente": "correcao"
  },
  "endereco": {
    "importado": "Rua MMS",
    "corrigido": null,
    "vigente": "Rua MMS",
    "origem_vigente": "importacao"
  },
  "origem": {
    "lote_criacao_id": "uuid",
    "linha_criacao_id": "uuid",
    "lote_ultimo_id": "uuid",
    "linha_ultima_id": "uuid"
  },
  "versao_registro": 4,
  "capacidades": {
    "corrigir_assistencia": true,
    "consultar_historico": true
  },
  "partes_removidas_ocultas": 1,
  "partes": [
    {
      "parte_id": "uuid",
      "parte_conjunto": "ARMÁRIO",
      "situacao": "ativo",
      "status": "CONCLUÍDA",
      "tipo": "MONTAGEM",
      "descricao_mercadoria": {
        "importado": "Armário 6 portas",
        "corrigido": null,
        "vigente": "Armário 6 portas",
        "origem_vigente": "importacao"
      },
      "recurso": {
        "importado": "Montador A",
        "corrigido": "Montador B",
        "vigente": "Montador B",
        "origem_vigente": "correcao"
      },
      "versao_registro": 2,
      "pode_corrigir": true
    }
  ]
}
```

Evidência bruta, caminhos de arquivo e dados de outros postos não fazem parte
da resposta.

## Testes obrigatórios

- Matriz de perfil, nível de vínculo e posto.
- Mesmo número em posto/data diferentes permanece distinto.
- Todos os filtros combinados preservam cursor e ordem.
- `removido` oculto por padrão e incluído explicitamente.
- Parte removida não altera agrupamento.
- ID inexistente e inacessível têm resposta neutra.
- Valor vigente segue precedência da Spec 004.
- Consulta não altera auditoria nem estado.
