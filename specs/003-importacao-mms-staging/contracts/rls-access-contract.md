# RLS Access Contract: Importacao MMS Staging

## Goal

Garantir que lotes, linhas, erros e alertas MMS so sejam acessados por usuarios
autenticados com perfil operacional ativo e dentro do escopo de posto permitido.

## Shared Rules

- Todas as tabelas novas devem ter RLS habilitado.
- `anon` nao deve consultar nem alterar as tabelas novas.
- Usuario autenticado sem perfil operacional ativo nao deve consultar nem alterar
  `mms_lotes_importacao`, `mms_linhas_importacao`, `mms_erros_importacao` ou
  `mms_alertas_importacao`.
- Policies devem reutilizar as funcoes auxiliares da Spec 01 para usuario atual,
  perfil atual e acesso a posto.
- Linhas, erros e alertas devem herdar escopo pelo lote pai.
- Delete fisico deve ser bloqueado para fluxos autenticados comuns.
- Qualquer funcao auxiliar nova deve ter `search_path` fixo e ficar em schema
  interno quando nao for API publica.

## mms_lotes_importacao

| Operacao | Operador | Supervisao | Direcao/Admin |
| --- | --- | --- | --- |
| Select operacional | Permitido somente lotes nao removidos dos postos do escopo | Permitido somente lotes nao removidos dos postos do escopo | Permitido global |
| Insert | Permitido somente para `posto_id` do escopo | Permitido somente para `posto_id` do escopo | Permitido global |
| Update | Bloqueado, exceto campos tecnicos explicitamente permitidos em tarefa futura | Permitido somente quando lote antigo e novo permanecem no escopo | Permitido global |
| Soft delete | Bloqueado | Permitido somente para lotes do escopo | Permitido global |
| Delete fisico | Bloqueado | Bloqueado | Bloqueado |

## mms_linhas_importacao

| Operacao | Operador | Supervisao | Direcao/Admin |
| --- | --- | --- | --- |
| Select operacional | Permitido somente linhas nao removidas de lotes acessiveis | Permitido somente linhas nao removidas de lotes acessiveis | Permitido global |
| Insert | Permitido somente em lote acessivel quando autorizada importacao para o posto | Permitido somente em lote acessivel | Permitido global |
| Update | Bloqueado para `raw_json`; demais campos somente se autorizado pelo lote | Permitido somente em lote acessivel e sem alterar `raw_json` | Permitido global sem alterar `raw_json` em fluxo comum |
| Soft delete | Bloqueado | Permitido somente em lote acessivel | Permitido global |
| Delete fisico | Bloqueado | Bloqueado | Bloqueado |

## mms_erros_importacao

| Operacao | Operador | Supervisao | Direcao/Admin |
| --- | --- | --- | --- |
| Select operacional | Permitido somente erros nao removidos de lotes acessiveis | Permitido somente erros nao removidos de lotes acessiveis | Permitido global |
| Insert | Bloqueado em fluxo manual | Permitido somente em lote acessivel durante validacao | Permitido global |
| Update | Bloqueado | Permitido somente em lote acessivel | Permitido global |
| Soft delete | Bloqueado | Permitido somente em lote acessivel | Permitido global |
| Delete fisico | Bloqueado | Bloqueado | Bloqueado |

## mms_alertas_importacao

| Operacao | Operador | Supervisao | Direcao/Admin |
| --- | --- | --- | --- |
| Select operacional | Permitido somente alertas nao removidos de lotes acessiveis | Permitido somente alertas nao removidos de lotes acessiveis | Permitido global |
| Insert | Bloqueado em fluxo manual | Permitido somente em lote acessivel durante validacao | Permitido global |
| Update | Bloqueado | Permitido somente em lote acessivel | Permitido global |
| Soft delete | Bloqueado | Permitido somente em lote acessivel | Permitido global |
| Delete fisico | Bloqueado | Bloqueado | Bloqueado |

## Required Test Scenarios

- Usuario sem perfil operacional ativo nao acessa nenhuma tabela nova.
- Operador consulta apenas lotes dos postos vinculados.
- Operador nao ve linhas, erros ou alertas de lote fora do escopo.
- Operador nao altera `raw_json`.
- Supervisao consulta e gerencia validacao apenas de lotes dos postos do escopo.
- Supervisao nao move lote para posto fora do escopo via update.
- Direcao/Admin consulta e gerencia todos os lotes e filhos.
- Registros soft-deleted ficam ocultos em consultas operacionais padrao.
- Delete fisico e bloqueado para fluxos autenticados comuns.
