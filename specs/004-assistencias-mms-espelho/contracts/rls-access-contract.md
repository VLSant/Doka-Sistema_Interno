# RLS Access Contract: Assistencias MMS

## Scope Source

RLS deve reaproveitar a fundacao da Spec 01:

- usuario operacional atual;
- perfil `operador`, `supervisao` ou `direcao_admin`;
- vinculos ativos em `usuarios_postos`;
- funcoes auxiliares de permissao por posto.

## Tables Covered

- `mms_assistencias`
- `mms_partes_assistencia`

`mms_partes_assistencia` herda o escopo por meio da assistencia principal.

## Access Matrix

| Perfil | Select | Insert/update por importacao | Correcao manual | Audit/admin |
| --- | --- | --- | --- | --- |
| Sem perfil ativo | Bloqueado | Bloqueado | Bloqueado | Bloqueado |
| Operador | Apenas postos vinculados | Apenas via fluxo autorizado e posto vinculado | Permitida apenas nos postos vinculados quando autorizada pelo MVP | Sem visao global |
| Supervisao | Apenas postos do escopo | Apenas escopo | Permitida apenas no escopo | Sem visao global |
| Direcao/Admin | Global | Global | Global | Global |

## Required Behaviors

- Usuario sem perfil operacional ativo nao acessa nenhuma linha.
- Operador nao acessa assistencias ou partes fora de seus postos vinculados.
- Supervisao nao acessa assistencias ou partes fora do seu escopo operacional.
- Direcao/Admin acessa todos os postos.
- `mms_partes_assistencia` deve bloquear acesso quando a assistencia principal
  vinculada estiver fora do escopo do usuario.
- Registros com `deleted_at` preenchido ficam fora das consultas operacionais
  padrao.
- Registros `removido` podem ser ocultados em consultas operacionais padrao, mas
  continuam acessiveis para auditoria autorizada.

## Required SQL Tests

- Usuario sem perfil ativo nao seleciona, cria, atualiza ou corrige registros.
- Operador vinculado ao Posto A ve 0 registros do Posto B.
- Supervisao com escopo A/B ve 0 registros do Posto C.
- Direcao/Admin ve registros de todos os postos.
- Parte vinculada a assistencia fora do escopo nao e visivel mesmo quando
  consultada diretamente.
- Tentativas de correcao fora do escopo sao bloqueadas e nao geram auditoria de
  sucesso.
