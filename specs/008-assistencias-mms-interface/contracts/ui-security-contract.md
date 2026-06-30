# Contract: Interface, Estados e Segurança de Assistências MMS

## Rotas

| Rota | Conteúdo |
| --- | --- |
| `/app/assistencias-mms` | Lista, busca e filtros |
| `/app/assistencias-mms/:assistenciaId` | Detalhe, partes, correções e histórico |

`assistencias-mms` muda de `placeholder` para `available`. Ambas as rotas passam
por `ProtectedRoute`; isso não substitui RLS/RPC.

## Lista

- Filtros ficam no query string.
- Alterar filtro reinicia cursor.
- Voltar do detalhe restaura filtros.
- “Carregar mais” mantém ordem estável.
- `removido` não é solicitado inicialmente.
- Tabela tem cabeçalhos acessíveis e rolagem no contêiner.

## Detalhe

- Cabeçalho identifica número, posto, data, tipo, status e situação.
- Cliente/endereço mostram vigente e permitem expandir origem.
- Partes permanecem no mesmo conjunto.
- Toggle inclui removidas e informa quantas estavam ocultas.
- Histórico carrega sob demanda e paginado.
- Link de origem usa a Spec 007.

## Correção

- Ação aparece somente com capacidade atual.
- Diálogo mostra importado, corrigido vigente e novo valor.
- Justificativa e confirmação são obrigatórias.
- Durante envio, somente o formulário fica bloqueado.
- Sucesso atualiza detalhe e versão.
- Conflito preserva texto, recarrega valor atual e exige revisão.
- Sessão expirada ou acesso negado não mostra sucesso.

## Estados discriminados

```text
idle
loading
ready
empty_scope
empty_filters
refreshing
saving
conflict
session_expired
access_denied
temporary_failure
```

- `empty_scope`: nenhum registro autorizado.
- `empty_filters`: filtros sem resultado; oferece limpar.
- `refreshing`: mantém conteúdo com indicação de atualização.
- `temporary_failure`: oferece tentar novamente sem substituir por vazio.
- `access_denied`: neutro, sem confirmar existência.

## Matriz

| Capacidade | Op. consulta | Op. operacional | Supervisão | Direção/Admin |
| --- | --- | --- | --- | --- |
| Listar/detalhar | Postos vinculados | Postos vinculados | Próprio escopo | Global |
| Incluir `removido` | Próprio escopo | Próprio escopo | Próprio escopo | Global |
| Corrigir | Não | Próprios postos | Próprio escopo | Global |
| Histórico projetado | Próprio escopo | Próprio escopo | Próprio escopo | Global |
| Abrir lote | Spec 007 | Spec 007 | Spec 007 | Global |

Capacidade orienta apresentação; a RPC revalida no salvamento.

## Acessibilidade e design

- Poppins e componentes/tokens Doka.
- Foco visível e ordem lógica.
- Rótulos em busca, filtros e inputs.
- Estado nunca depende só de cor.
- Diálogo retém/devolve foco.
- Erros são anunciados.
- Códigos usam numerais tabulares.
- Layout validado em 1280×720 e 1440×900.

## Testes frontend

- Query string, filtros e restauração.
- Cursor e “carregar mais”.
- Vazio do escopo versus filtros.
- Parte removida oculta/incluída.
- Valores importado/corrigido/vigente.
- Capacidades por perfil/vínculo.
- Conflito preservando rascunho.
- Falha sem falso vazio/sucesso.
- URL anônima, autorizada e negada.
- Aceite manual de navegação completa, teclado, foco e nomes acessíveis.
- Duas larguras de aceite.
