# Assistências MMS — Interface, RLS e RPCs

## Fronteira de acesso

A SPA consome somente:

- `public.listar_assistencias_mms`;
- `public.obter_detalhe_assistencia_mms`;
- `public.corrigir_campo_assistencia_mms`;
- `public.listar_historico_assistencia_mms`.

As quatro funções recebem `EXECUTE` apenas para `authenticated`, derivam o ator
de `auth.uid()`, usam `search_path = ''` e qualificam objetos. `anon` e `PUBLIC`
não executam as RPCs.

## Leitura

- Direção/Administração: escopo global.
- Supervisão: postos com vínculo `supervisao`.
- Operador: postos com vínculo `operacional` ou `consulta`.
- Usuário sem perfil ativo: bloqueado.
- Soft-deleted nunca aparece para operação.
- `status_interno = removido` é oculto por padrão, mas pode ser solicitado no
  próprio escopo; não é soft delete.
- ID inexistente e ID fora do escopo retornam `acesso_negado`.

As policies RLS das tabelas continuam ativas como defesa em profundidade. As
RPCs `SECURITY DEFINER` repetem autorização porque projetam auditoria e nomes que
não devem ser liberados por grants amplos.

O helper privado `usuario_pode_consultar_assistencia_mms` implementa essa matriz
sem reutilizar o vínculo genérico. Ele não possui `EXECUTE` para
`authenticated`; somente as RPCs públicas o invocam.

## Correção

- Direção/Administração: global.
- Supervisão: somente vínculo `supervisao`.
- Operador: somente vínculo `operacional`.
- Vínculo `consulta`: leitura apenas.
- Registro `removido` ou soft-deleted: sem correção.

Allowlist:

| Entidade | Campos |
| --- | --- |
| `mms_assistencias` | `cliente_nome`, `endereco` |
| `mms_partes_assistencia` | `descricao_mercadoria`, `recurso` |

A RPC bloqueia o registro, compara `versao_registro` e atualiza somente a coluna
corrigida e metadados de auditoria. Nova importação, remoção, reativação e
correção incrementam a versão.

As funções privadas legadas `mms_corrigir_assistencia` e
`mms_corrigir_parte_assistencia` não possuem `EXECUTE` para `authenticated`.

## Evidência e chave MMS

- `raw_json` e `raw_json_resumo` não fazem parte das projeções padrão.
- A RPC de correção não referencia nem atualiza evidência bruta.
- Triggers existentes continuam bloqueando alteração direta.
- A chave `posto_id + data_atividade + numero_assistencia + parte_conjunto` não
  é alterada.
- A interface não executa importação, `removido` ou reativação.

## Histórico

`historico_auditoria` permanece a fonte central. A RPC projeta apenas ação,
entidade, parte, campo, valores permitidos, motivo, ator, data e IDs de
lote/linha. Metadata integral e evidência bruta não são retornadas.

O link de lote usa `app_private.mms_lote_acessivel` apenas como capacidade; a
rota/RPC da Spec 007 revalida o acesso.

## Revisão de segurança

- RLS habilitada em todas as tabelas expostas.
- Nenhuma chave secreta/service role no navegador.
- Nenhum `user_metadata` usado em autorização.
- Índices cobrem posto/data, cursores, busca parcial e auditoria.
- Advisors e lint devem ser executados após aplicar a migration no projeto de
  desenvolvimento.

Os advisors de 2026-06-30 sinalizaram as RPCs públicas `SECURITY DEFINER` como
aviso esperado. A exposição é intencional e limitada a `authenticated`; as
funções usam `search_path = ''`, objetos qualificados e autorização interna. O
lint via CLI depende de autenticação do ambiente e está registrado no
quickstart.
