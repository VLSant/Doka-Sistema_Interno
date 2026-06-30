# Contract: Correção Controlada de Assistência MMS

## `public.corrigir_campo_assistencia_mms`

### Entrada

```json
{
  "p_tipo_entidade": "assistencia|parte",
  "p_entidade_id": "uuid",
  "p_campo": "cliente_nome|endereco|descricao_mercadoria|recurso",
  "p_valor_corrigido": "texto",
  "p_justificativa": "Correção confirmada com a operação.",
  "p_versao_esperada": 4
}
```

### Matriz de campos

| Entidade | Campos aceitos |
| --- | --- |
| `assistencia` | `cliente_nome`, `endereco` |
| `parte` | `descricao_mercadoria`, `recurso` |

Qualquer combinação diferente retorna `campo_nao_corrigivel`.

### Autorização

- Operador `operacional`: próprios postos.
- Operador `consulta`: bloqueado.
- Supervisão: postos com vínculo `supervisao`.
- Direção/Administração: global.
- Registro soft-deleted ou `removido`: bloqueado.

### Comportamento transacional

1. Deriva ator da sessão.
2. Localiza e bloqueia o registro; parte herda posto da assistência.
3. Revalida perfil, vínculo, posto e estado ativo.
4. Valida entidade/campo, valor e justificativa.
5. Compara `versao_registro` com `p_versao_esperada`.
6. Atualiza somente a coluna corrigida e metadados permitidos.
7. Trigger incrementa a versão uma vez.
8. Trigger registra `historico_auditoria`.
9. Retorna os três valores e a nova versão.

Nenhum argumento define ator, perfil ou posto.

### Saída

```json
{
  "tipo_entidade": "assistencia",
  "entidade_id": "uuid",
  "campo": "cliente_nome",
  "importado": "Cliente MMS",
  "corrigido": "Cliente corrigido",
  "vigente": "Cliente corrigido",
  "origem_vigente": "correcao",
  "versao_registro": 5,
  "corrigido_em": "2026-06-30T12:00:00Z",
  "corrigido_por": { "id": "uuid", "nome": "Usuário" }
}
```

### Erros estáveis

- `acesso_negado`
- `vinculo_somente_consulta`
- `campo_nao_corrigivel`
- `valor_invalido`
- `justificativa_obrigatoria`
- `registro_removido`
- `correcao_desatualizada`
- `falha_temporaria`

IDs inexistentes e fora do escopo convergem para `acesso_negado`.

## Concorrência

- A primeira requisição válida na versão N produz N+1.
- Outra requisição com N recebe `correcao_desatualizada`.
- Repetir a solicitação com N não gera segunda correção ou evento de sucesso.
- Nova importação, remoção ou reativação também invalida formulário antigo.
- A UI nunca reenvia automaticamente após conflito.

## Preservação e auditoria

- Evidências brutas são comparadas antes/depois nos testes.
- Valores importados não são atualizados.
- Status, tipo, número, posto, data e parte do conjunto são somente leitura.
- Não há `UPDATE` direto concedido à SPA.
- `authenticated` não mantém `EXECUTE` direto nas funções privadas legadas
  `mms_corrigir_assistencia` e `mms_corrigir_parte_assistencia`.
- Evento `corrigido` identifica entidade/parte, campo, antes/depois, valor
  importado relevante, justificativa, ator, data, posto e origem.
- Operação bloqueada não gera sucesso.

## Testes obrigatórios

- Quatro campos em seus níveis corretos.
- Campo no nível errado e campo desconhecido.
- Matriz de perfil/vínculo/posto.
- Duas sessões com a mesma versão.
- Importação entre leitura e gravação.
- Registro que se torna `removido`.
- Repetição da mesma versão.
- Imutabilidade das evidências.
- Um único evento de sucesso.
