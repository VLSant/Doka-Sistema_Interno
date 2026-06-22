# RLS Access Contract: Cadastros Base MVP

## Goal

Garantir que os cadastros base so sejam acessados por usuarios autenticados com
perfil operacional ativo e, quando houver `posto_id`, dentro do escopo autorizado.

## Shared Rules

- Todas as tabelas novas devem ter RLS habilitado.
- `anon` nao deve consultar nem alterar as tabelas novas.
- Usuario autenticado sem perfil operacional ativo nao deve consultar nem alterar
  `prioridades`, `tipos_ocorrencia` ou `metas_eficiencia`.
- Policies devem reutilizar as funcoes auxiliares da Spec 01 para usuario atual,
  perfil atual e acesso a posto.
- Qualquer funcao auxiliar nova deve ter `search_path` fixo e ficar em schema
  interno quando nao for API publica.

## prioridades

| Operacao | Operador | Supervisao | Direcao/Admin |
| --- | --- | --- | --- |
| Select operacional | Permitido somente `ativo = true` e `deleted_at is null` | Permitido somente `ativo = true` e `deleted_at is null` | Permitido global |
| Insert | Bloqueado | Bloqueado | Permitido |
| Update | Bloqueado | Bloqueado | Permitido |
| Delete fisico | Bloqueado | Bloqueado | Bloqueado |

## tipos_ocorrencia

| Operacao | Operador | Supervisao | Direcao/Admin |
| --- | --- | --- | --- |
| Select operacional | Permitido somente `ativo = true` e `deleted_at is null` | Permitido somente `ativo = true` e `deleted_at is null` | Permitido global |
| Insert | Bloqueado | Bloqueado | Permitido |
| Update | Bloqueado | Bloqueado | Permitido |
| Delete fisico | Bloqueado | Bloqueado | Bloqueado |

## metas_eficiencia

| Operacao | Operador | Supervisao | Direcao/Admin |
| --- | --- | --- | --- |
| Select operacional | Permitido somente metas ativas, nao removidas e de postos do escopo | Permitido somente metas ativas, nao removidas e de postos do escopo | Permitido global |
| Insert | Bloqueado | Permitido somente para `posto_id` do escopo | Permitido global |
| Update | Bloqueado | Permitido somente quando registro antigo e novo permanecem em posto do escopo | Permitido global |
| Delete fisico | Bloqueado | Bloqueado | Bloqueado |

## Required Test Scenarios

- Usuario sem perfil operacional ativo nao acessa nenhuma tabela nova.
- Operador consulta `prioridades` e `tipos_ocorrencia` ativos, mas nao ve
  inativos ou removidos.
- Operador ve `metas_eficiencia` apenas dos postos vinculados.
- Operador nao cria, atualiza, inativa, reativa nem remove logicamente registros.
- Supervisao consulta `prioridades` e `tipos_ocorrencia` ativos, mas nao gerencia.
- Supervisao cria ou altera `metas_eficiencia` apenas para postos do seu escopo.
- Supervisao nao move uma meta para posto fora do escopo via update.
- Direcao/Admin consulta e gerencia todos os cadastros.
- Delete fisico e bloqueado para fluxos autenticados comuns.
