# Assistencias MMS - Policies e Contratos Operacionais

## Escopo

`mms_assistencias` representa a assistencia principal por
`posto_id + data_atividade + numero_assistencia_normalizado`.
`mms_partes_assistencia` representa a parte por
`assistencia_id + parte_conjunto_normalizada`.

As duas tabelas usam RLS e preservam soft delete excepcional separado de
`status_interno`. `status_interno = removido` significa ausencia em nova
importacao elegivel completa, nao exclusao logica.

## Elegibilidade

O processamento usa somente lotes `importado` ou `importado_com_alertas` com
`estado_processamento = validado`, posto/data resolvidos, totais consistentes,
linhas ativas maiores que zero e sem erros ativos. Todas as linhas ativas do
lote precisam ser `valida` ou `valida_com_alerta`, com posto, data, numero da
assistencia e parte preenchidos.

Lotes `erro`, `cancelado`, incompletos, parciais ou com erro ativo retornam
resultado de lote inelegivel e nao atualizam o espelho nem marcam ausentes como
`removido`.

## Correcoes

Campos corrigiveis v1:

- `mms_assistencias`: `cliente_nome`, `endereco`.
- `mms_partes_assistencia`: `descricao_mercadoria`, `recurso`.

As funcoes de correcao exigem usuario operacional autenticado, acesso ao posto,
campo da allowlist, valor corrigido e motivo. Valores importados continuam
separados dos valores corrigidos. As views operacionais usam
`security_invoker = true` e projetam valor visivel com precedencia do valor
corrigido ativo.

## Raw Evidence

`mms_partes_assistencia.raw_json` e `mms_assistencias.raw_json_resumo` sao
protegidos contra update direto. Apenas as rotinas aprovadas de importacao do
espelho, executadas durante processamento de lote elegivel, podem substituir a
evidencia por uma nova linha/lote rastreavel.

## Matriz RLS

| Perfil | Assistencias | Partes |
| --- | --- | --- |
| Sem usuario operacional ativo | Sem acesso | Sem acesso |
| Operador | Postos vinculados por `usuarios_postos` | Herda assistencia acessivel |
| Supervisao | Postos com nivel `supervisao` | Herda assistencia acessivel |
| Direcao/Admin | Global | Global |

As roles autenticadas recebem `SELECT` nas tabelas finais e nas views
operacionais. Elas nao recebem `INSERT` ou `UPDATE` direto em
`mms_assistencias` ou `mms_partes_assistencia`; criacao, atualizacao por
importacao, marcacao `removido`, reativacao e correcoes manuais passam pelas
funcoes RPC em `app_private`, que validam escopo por posto, allowlist de campos e
motivo obrigatorio.

Essa decisao evita que usuarios alterem campos importados, status interno,
metadados, soft delete ou valores corrigidos sem as regras e auditoria da Spec
04.

## Auditoria

Triggers registram em `historico_auditoria` eventos de criacao, atualizacao por
importacao, correcao, marcacao `removido`, reativacao e soft delete excepcional.
O metadata inclui posto, data da atividade, numero da assistencia, parte quando
aplicavel, lote e linha. Operacoes bloqueadas por RLS, validacao, campo fora da
allowlist ou lote inelegivel nao geram evento de sucesso.
