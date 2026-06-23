# Research: Importacao MMS - Lotes, Staging e Validacao Bruta

## Decision: Implementar a Spec 03 como feature database-first

**Rationale**: A feature precisa criar a base auditavel de importacao antes de
qualquer tela ou fluxo final. Supabase/PostgreSQL ja e a fundacao do projeto e
fornece constraints, RLS, triggers, funcoes e auditoria no mesmo ponto onde a
seguranca dos dados e aplicada.

**Alternatives considered**:

- Parser completo em aplicacao antes do banco: rejeitado porque sairia do escopo
  e atrasaria a base auditavel.
- Tabela unica de staging: rejeitada porque dificultaria separar lote, linha,
  erro e alerta para RLS, totais e auditoria.

## Decision: Usar entidades oficiais dos documentos base

**Rationale**: A especificacao refinada exige os nomes `mms_lotes_importacao`,
`mms_linhas_importacao`, `mms_erros_importacao` e `mms_alertas_importacao`.
Usar esses nomes reduz desalinhamento com as specs seguintes e com os documentos
do MVP.

**Alternatives considered**:

- `lotes_importacao_mms` e `linhas_importacao_mms`: rejeitados por nao serem os
  nomes oficiais solicitados.
- Guardar erros e alertas como arrays em linhas: rejeitado porque reduz
  rastreabilidade, dificulta consultas e complica totais por lote.

## Decision: Separar status oficial de estado tecnico

**Rationale**: O lote deve ter apenas os status oficiais `importado`,
`importado_com_alertas`, `erro` e `cancelado`, mas pode manter `status` nulo ate
a conclusao da validacao bruta ou cancelamento. Etapas internas como `recebido`,
`processando` e `validado` ficam em `estado_processamento` ou timestamps, sem
virar status oficial e sem conflitar com os documentos do MVP.

**Alternatives considered**:

- Expandir enum/status com `recebido`, `processando` e `validado`: rejeitado
  porque viola a lista oficial.
- Exigir status oficial no momento da criacao do lote: rejeitado porque o lote
  pode existir antes da validacao bruta ter resultado conclusivo.
- Nao guardar qualquer informacao de processamento: rejeitado porque prejudica
  auditoria de tentativas e falhas parciais.

## Decision: Preservar `raw_json` obrigatorio e imutavel apos criacao

**Rationale**: A MMS e fonte externa e o `raw_json` e a evidencia primaria da
linha importada. Por isso ele deve ser jsonb, obrigatorio, nao nulo, nao vazio e
representar uma linha MMS original. Campos extraidos podem ser corrigidos ou
recalculados, mas nao podem substituir o dado bruto original.

**Alternatives considered**:

- Normalizar e descartar valores originais: rejeitado por quebrar auditoria.
- Permitir update livre de `raw_json`: rejeitado porque permitiria reescrever a
  evidencia primaria da importacao.

## Decision: Persistir campos candidatos sem aplicar chave final

**Rationale**: A Spec 03 prepara a proxima Spec de assistencias finais/espelho MMS.
Por isso `posto_id`, `data_atividade`, `numero_assistencia` e `parte_conjunto`
devem ser persistidos e validados quando extraiveis, mas ainda nao devem acionar
upsert/idempotencia final.

**Alternatives considered**:

- Aplicar a chave operacional completa ja nesta feature: rejeitado porque criaria
  comportamento de assistencias finais fora do escopo.
- Deixar todos os campos apenas dentro do `raw_json`: rejeitado porque a proxima
  spec dependeria de retrabalho e as validacoes brutas ficariam fracas.

## Decision: RLS herdado por `posto_id` do lote

**Rationale**: O lote representa a tentativa de importacao para um posto. Linhas,
erros e alertas devem herdar acesso do lote para manter uma regra consistente e
evitar duplicar escopo em cada tabela.

**Alternatives considered**:

- RLS por `posto_id` em todas as tabelas filhas: rejeitado como fonte de
  divergencia caso linha/erro/alerta sejam atualizados separadamente.
- Liberar leitura global de erros/alertas: rejeitado porque os erros podem conter
  dados operacionais da MMS.

## Decision: Tabelas filhas para erros e alertas

**Rationale**: Erros e alertas precisam ser rastreaveis, consultaveis, contaveis e
auditaveis por lote/linha. Tabelas separadas permitem severidade, codigo, campo,
mensagem e contexto sem inflar a linha de staging.

**Alternatives considered**:

- Armazenar erros/alertas apenas no `raw_json`: rejeitado porque mistura evidencia
  original com resultado da validacao.
- Armazenar mensagens em texto unico na linha: rejeitado por dificultar relatorios
  e validacoes SQL.

## Decision: Recalcular ou validar totais por lote no banco

**Rationale**: Totais de lote precisam refletir linhas, erros e alertas associados.
O banco deve impedir totais inconsistentes ou oferecer funcao de recalculo usada
pela implementacao e pelos testes.

**Alternatives considered**:

- Confiar apenas no cliente/importador para preencher totais: rejeitado porque
  permitiria divergencia entre lote e linhas.
- Calcular totais somente em consultas futuras: rejeitado porque status e
  auditoria precisam registrar resultado consolidado da tentativa.

## Decision: Soft delete separado do status oficial

**Rationale**: A constituicao exige soft delete por `deleted_at`, `deleted_by` e
`delete_reason`, e a Spec 03 proibe status de exclusao logica. Assim o status do
lote continua representando resultado de importacao, enquanto soft delete controla
visibilidade operacional.

**Alternatives considered**:

- Status `excluido` ou equivalente: rejeitado por violar a especificacao e a
  constituicao.
- Delete fisico: rejeitado porque apagaria evidencia auditavel.
