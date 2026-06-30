# Contract: Histórico e Origem de Assistência MMS

## `public.listar_historico_assistencia_mms`

### Entrada

```json
{
  "p_assistencia_id": "uuid",
  "p_cursor_created_at": "timestamp opcional",
  "p_cursor_id": "uuid opcional",
  "p_limite": 50
}
```

### Escopo

Inclui eventos centralizados cuja entidade seja a assistência ou qualquer parte
vinculada. Eventos de parte removida continuam no histórico. Soft delete não
concede acesso; posto e perfil atuais continuam obrigatórios.

### Ordenação

- `created_at desc, id desc`;
- limite padrão 50, máximo 100;
- cursor aplicado após o escopo;
- sem offset.

### Saída

```json
{
  "itens": [
    {
      "evento_id": "uuid",
      "created_at": "2026-06-30T12:00:00Z",
      "tipo": "correcao",
      "acao": "corrigido",
      "entidade": "parte",
      "entidade_id": "uuid",
      "parte_conjunto": "ARMÁRIO",
      "campo": "recurso",
      "valor_anterior": "Montador A",
      "valor_novo": "Montador B",
      "justificativa": "Ajuste confirmado.",
      "ator": { "id": "uuid", "nome": "Usuário" },
      "origem": {
        "lote_id": "uuid",
        "linha_id": "uuid",
        "pode_abrir_lote": true
      }
    }
  ],
  "proximo_cursor": {
    "created_at": "2026-06-30T12:00:00Z",
    "id": "uuid"
  }
}
```

## Classificação

| Ações centrais | Tipo apresentado |
| --- | --- |
| `criado`, `atualizado_por_importacao` | `importacao` |
| `corrigido` | `correcao` |
| `marcado_removido` | `remocao_operacional` |
| `reativado_por_importacao` | `reativacao` |
| `soft_delete_registrado` | `exclusao_logica` |

Ação desconhecida aparece como `outro` com rótulo seguro.

## Minimização

A resposta não contém evidência bruta, metadata integral, e-mail, token, claims,
caminho de arquivo ou dados de posto fora do escopo.

## Navegação ao lote

- Destino: `/app/importacoes-mms/:loteId`.
- `pode_abrir_lote` orienta a UI, não autoriza.
- A rota e RPC da Spec 007 revalidam acesso.
- Lote multi-posto não amplia acesso.
- Lote indisponível preserva o evento e mostra mensagem neutra.

## Erros

- `cursor_invalido`
- `acesso_negado`
- `falha_temporaria`

## Testes obrigatórios

- Linha temporal de assistência e partes.
- Correção com campo, valores, ator e justificativa.
- Múltiplos lotes em ordem.
- Operador recebe projeção, não acesso genérico à auditoria.
- Lote fora do escopo não abre.
- Evento permanece após `removido`.
- Cursor não duplica eventos.
- Payload não contém evidência bruta.
