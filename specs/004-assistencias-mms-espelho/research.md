# Research: Assistencias MMS - Espelho Operacional Idempotente

## Decision: modelar espelho em dois niveis

`mms_assistencias` representa o servico principal por
`posto_id + data_atividade + numero_assistencia`. `mms_partes_assistencia`
representa as partes do conjunto e aplica a chave operacional completa
`posto_id + data_atividade + numero_assistencia + parte_conjunto`.

**Rationale**: Os documentos base definem que o numero da assistencia identifica o
servico principal, mas uma assistencia pode ter varias partes. Aplicar a chave
completa diretamente na entidade principal duplicaria a assistencia e quebraria
vinculos futuros de ocorrencias, reclamacoes e custos.

**Alternatives considered**:

- Uma tabela unica de assistencias por chave completa: rejeitada porque duplica o
  servico principal.
- Assistencia principal sem tabela de partes: rejeitada porque perde
  rastreabilidade por parte e `raw_json` de linha.

## Decision: consumir apenas lotes e linhas elegiveis da Spec 03

Somente lotes `importado` e lotes completos `importado_com_alertas` sem erro
bloqueante podem atualizar o espelho. Lotes `erro`, `cancelado`, incompletos ou
parciais nao atualizam registros nem marcam ausentes como `removido`.
Completude e derivada da Spec 03: lote `validado`, posto/data resolvidos, totais
consistentes, linhas ativas maiores que zero, nenhuma linha ativa com erro
bloqueante e todas as linhas transformaveis em `valida` ou `valida_com_alerta`
com os campos candidatos obrigatorios.

**Rationale**: Marcar ausentes como removidos exige confiar que a nova importacao
representa o espelho completo daquele posto/data. Lotes com erro, cancelados ou
parciais nao oferecem essa garantia.

**Alternatives considered**:

- Atualizar parcialmente com qualquer linha valida: rejeitada porque poderia
  remover registros validos por falha de arquivo.
- Permitir lote `erro` atualizar registros presentes: rejeitada para manter uma
  regra simples e auditavel no MVP.
- Criar novo campo de completude na Spec 04: rejeitada por acoplar esta feature a
  uma alteracao retroativa da Spec 03; a funcao derivada cobre o MVP sem mudar o
  contrato de staging.

## Decision: separar `status_atividade`, `status_interno` e soft delete

`status_atividade` preserva o estado operacional vindo da MMS. `status_interno`
representa o espelho do Doka (`ativo`, `removido`). Soft delete usa
`deleted_at`, `deleted_by` e `delete_reason` apenas para exclusao logica
excepcional.

**Rationale**: A constituicao proibe substituir soft delete por status
operacional e exige marcacao `removido` para ausentes em nova importacao.

**Alternatives considered**:

- Usar soft delete para ausentes: rejeitada porque apagaria o comportamento de
  espelho MMS.
- Usar status MMS cancelado como removido: rejeitada porque cancelamento MMS e
  ausencia em nova importacao sao conceitos distintos.

## Decision: preservar `raw_json` em partes e `raw_json_resumo` na principal

Cada parte preserva o `raw_json` da linha MMS que a criou ou atualizou. A
assistencia principal mantem `raw_json_resumo` para explicar a composicao
principal sem substituir a evidencia detalhada das partes.

**Rationale**: A evidencia de linha e essencial para auditoria e reprocessamento.
O resumo facilita consultas da assistencia principal sem perder o dado original.

**Alternatives considered**:

- Guardar `raw_json` apenas na assistencia principal: rejeitada porque partes
  diferentes podem vir de linhas diferentes.
- Nao guardar resumo na principal: rejeitada porque futuras telas/consultas da
  assistencia principal precisam explicar o dado agregado.

## Decision: valores corrigidos ficam separados dos importados

Campos corrigiveis v1 ficam limitados a `cliente_nome`, `endereco`,
`descricao_mercadoria` e `recurso`. Eles devem preservar valor importado, valor
corrigido, metadados de correcao e historico. O valor visivel segue precedencia:
correcao ativa primeiro; caso contrario, ultimo valor importado elegivel.

**Rationale**: Usuarios autorizados podem corrigir dados importados, mas a MMS
continua sendo evidencia. Nova importacao nao pode apagar uma correcao sem
rastreabilidade.

**Alternatives considered**:

- Sobrescrever valor importado com correcao: rejeitada por perda de evidencia.
- Sobrescrever correcao sempre que a MMS muda: rejeitada porque apagaria decisao
  operacional sem acao explicita.
- Permitir correcao livre de qualquer campo importado: rejeitada porque amplia o
  escopo e enfraquece auditoria antes das telas e regras finais.

## Decision: views de valor visivel devem respeitar RLS

Se a implementacao usar views para expor valores visiveis, as views devem usar
`WITH (security_invoker = true)` em Supabase/PostgreSQL compativel. Alternativa
permitida: manter a projecao por funcoes ou colunas calculadas sob RLS das
tabelas base.

**Rationale**: Views comuns podem operar com privilegios do owner e causar bypass
de RLS em cenarios Supabase. O espelho MMS contem dados por posto e deve manter a
barreira de perfil/posto.

**Alternatives considered**:

- View sem `security_invoker`: rejeitada por risco de bypass de RLS.
- Expor somente tabelas base: aceito como alternativa se os valores visiveis
  ficarem claros para consumidores.

## Decision: raw evidence imutavel apos criacao

`mms_partes_assistencia.raw_json` e `mms_assistencias.raw_json_resumo` devem ter
protecoes explicitas contra update direto apos criacao, exceto por rotinas de
importacao aprovadas que substituem evidencia por nova linha/lote elegivel e
registram auditoria.

**Rationale**: Correcao manual e manutencao operacional nao podem apagar a
evidencia original da MMS.

**Alternatives considered**:

- Confiar apenas em convencao de aplicacao: rejeitada porque a feature e
  database-first e precisa proteger o dado no banco.

## Decision: idempotencia por constraints e funcoes de banco

Usar unicidade operacional para `mms_assistencias` por
`posto_id + data_atividade + numero_assistencia` e para
`mms_partes_assistencia` por assistencia/`parte_conjunto`, complementada por
funcoes SQL transacionais para criar/atualizar, marcar `removido` e reativar.

**Rationale**: A regra precisa ser garantida no banco para proteger contra
reprocessamentos, concorrencia e chamadas futuras de servicos ou telas.

**Alternatives considered**:

- Aplicar idempotencia apenas na aplicacao: rejeitada porque RLS e processamento
  database-first devem garantir consistencia no MVP.
- Criar somente indices sem funcao de sincronizacao: rejeitada porque a regra de
  `removido` e reativacao depende de comparacao por posto/data.

## Decision: contratos futuros exigem assistencia principal obrigatoria

Ocorrencias, reclamacoes e custos futuros devem vincular obrigatoriamente a
`mms_assistencias`; podem referenciar `mms_partes_assistencia` quando o evento se
aplica a uma parte especifica.

**Rationale**: A constituicao exige assistencia obrigatoria para ocorrencias e
custos. A assistencia principal e o ponto estavel do servico; a parte e detalhe
opcional.

**Alternatives considered**:

- Vincular diretamente apenas a parte: rejeitada porque nem todo problema ou
  custo e especifico de uma parte.
- Permitir ocorrencia sem assistencia quando parte nao for conhecida: rejeitada
  por violacao constitucional.
