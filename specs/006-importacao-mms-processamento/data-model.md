# Data Model: Importação MMS — Upload, Parser, Validação e Processamento

## Model Strategy

A feature não cria novas entidades de domínio. Ela estende o lote e a linha da
Spec 003, usa o objeto privado do Supabase Storage como evidência do arquivo e
consome assistências/partes da Spec 004. Estado de UI e dados temporários do
parser permanecem no navegador.

## Existing Dependencies

### `usuarios`, `postos` e `usuarios_postos`

Fornecem ator, perfil e escopo. Toda RPC deriva o usuário operacional de
`auth.uid()`; Operador e Supervisão exigem acesso ativo ao posto,
Direção/Administração mantém escopo global.

### `historico_auditoria`

Recebe eventos de início, arquivo armazenado, análise concluída, cancelamento,
confirmação, falha e sucesso, além dos eventos de assistência/parte já gerados
pela Spec 004.

### `mms_assistencias` e `mms_partes_assistencia`

Continuam sendo o espelho final. A identidade principal e a chave operacional
completa permanecem inalteradas.

## Entity Extension: `mms_lotes_importacao`

Representa uma tentativa completa, desde a reserva do arquivo até o resultado
da confirmação.

### Existing Fields Reused

- `id`
- `nome_origem`
- `posto_id`
- `data_atividade`
- `usuario_importador_id`
- `status`
- `estado_processamento`
- `processamento_iniciado_at`
- `processamento_finalizado_at`
- totais de linhas/erros/alertas
- campos de criação, atualização e soft delete

### New Fields

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `area_trabalho_original` | text | Yes for Spec 006 lots | Valor único identificado no arquivo |
| `bucket_arquivo` | text | Yes for Spec 006 lots | Sempre `mms-importacoes` |
| `caminho_arquivo` | text | Yes for Spec 006 lots | Caminho privado reservado e imutável |
| `extensao_arquivo` | text | Yes | `csv` ou `xlsx` |
| `mime_type_arquivo` | text | Yes | MIME type validado |
| `tamanho_arquivo_bytes` | bigint | Yes | Maior que zero e até 25 MiB |
| `arquivo_armazenado_em` | timestamptz | No | Preenchido somente após confirmar objeto no Storage |
| `total_linhas_esperadas` | integer | Yes | Quantidade de linhas de dados não vazias identificadas pelo parser |
| `total_assistencias` | integer | Yes | Identidades principais distintas após validação |
| `total_partes` | integer | Yes | Chaves operacionais completas distintas após validação |
| `confirmacao_solicitada_em` | timestamptz | No | Última confirmação aceita para processamento |
| `confirmado_por` | uuid | No | FK para `usuarios.id`; ator derivado |
| `espelho_processado_em` | timestamptz | No | Preenchido apenas após sucesso atômico |
| `resultado_processamento` | jsonb | No | Resumo final imutável depois do sucesso |
| `ultima_falha_processamento_em` | timestamptz | No | Última falha segura depois de confirmação |
| `codigo_ultima_falha` | text | No | Código estável, sem detalhes internos |
| `cancelado_em` | timestamptz | No | Momento do cancelamento pré-confirmação |
| `cancelado_por` | uuid | No | FK para `usuarios.id`; ator derivado |

### Validation

- `area_trabalho_original` não pode ser vazia.
- `bucket_arquivo = 'mms-importacoes'`.
- `caminho_arquivo` é único, não vazio e não pode ser alterado depois de
  `arquivo_armazenado_em`.
- Extensão e MIME devem formar combinação CSV ou XLSX aprovada.
- `tamanho_arquivo_bytes` deve ser `> 0` e `<= 26214400`.
- `total_linhas_esperadas`, `total_assistencias` e `total_partes` são inteiros
  não negativos.
- `arquivo_armazenado_em` só pode ser preenchido se existir objeto com bucket,
  caminho, tamanho e MIME correspondentes.
- `espelho_processado_em` exige `confirmacao_solicitada_em`,
  `confirmado_por` e resultado com `processado = true`.
- `resultado_processamento` de sucesso não pode ser substituído.
- `status = cancelado` exige `cancelado_em` e `cancelado_por`; lotes antigos são
  retrocompatibilizados com `updated_at`/`updated_by` na migration.
- Lote cancelado não aceita novas linhas, nova análise ou confirmação.
- Lote processado com sucesso não aceita cancelamento nem nova confirmação
  material; retry somente retorna o resultado existente.
- Soft delete continua separado de cancelamento.

### Result Shape

`resultado_processamento` usa chaves estáveis:

```text
lote_id
processado
status
assistencias_criadas
assistencias_atualizadas
assistencias_preservadas
assistencias_removidas
assistencias_reativadas
partes_criadas
partes_atualizadas
partes_preservadas
partes_removidas
partes_reativadas
linhas_invalidas
linhas_com_alerta
processado_em
```

O resultado não contém stack trace, SQL, token, caminho assinado ou segredo.

### State Transitions

```text
recebido/status null
  -> processando/status null
  -> validado/importado
  -> validado/importado_com_alertas
  -> validado/erro

qualquer estado anterior ao espelho
  -> cancelado

validado + elegível + arquivo confirmado
  -> confirmação solicitada
  -> espelho processado (sucesso terminal)
  -> falha registrada (pode receber nova confirmação)
```

`estado_processamento` e `status` continuam com os valores oficiais das Specs
003/004. Timestamps complementam o workflow; não são criados status paralelos.

## Entity Extension: `mms_linhas_importacao`

Representa uma linha original e sua interpretação canônica.

### Existing Fields Reused

- `id`
- `lote_importacao_id`
- `numero_linha_origem`
- `raw_json`
- `posto_id`
- `data_atividade`
- `numero_assistencia`
- `parte_conjunto`
- `estado_validacao`
- campos de criação, atualização e soft delete

### New Field

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `json_normalizado` | jsonb | Yes for Spec 006 rows | Campos canônicos derivados de `raw_json`; nunca substitui a evidência |

### Canonical `json_normalizado` Keys

- `data_atividade`
- `area_trabalho`
- `numero_assistencia`
- `parte_conjunto`
- `status_atividade_original`
- `status_atividade`
- `tipo_atividade_original`
- `tipo_atividade_normalizado`
- `recurso`
- `cliente_nome`
- `endereco`
- `codigo_mercadoria`
- `descricao_mercadoria`
- `valor_deslocamento`
- `valor_receber_movel`
- `atendimento_critico`
- `quantidade_reagendamento`
- `comentarios_local_montagem`
- `observacao_finalizacao`
- `defeito_identificado`
- `laudo_ou_observacao`

Chaves complementares podem ser adicionadas no futuro sem alterar
`raw_json`; chaves desconhecidas permanecem apenas no original.

### Validation

- `raw_json` continua obrigatório, não vazio e imutável.
- As chaves de `raw_json` são os cabeçalhos originais, não os nomes canônicos.
- `json_normalizado` é objeto JSON e fica imutável após a criação da linha.
- `numero_linha_origem` é obrigatório e positivo para lotes da Spec 006.
- Existe no máximo uma linha ativa por
  `lote_importacao_id + numero_linha_origem`.
- Reenvio com a mesma linha e mesmo `raw_json` é no-op; conteúdo diferente para
  a mesma posição é conflito e invalida a tentativa.
- `posto_id`, `data_atividade`, `numero_assistencia` e `parte_conjunto` devem
  refletir os valores canônicos do `json_normalizado`.
- Linha `valida` ou `valida_com_alerta` exige todos os candidatos da chave e
  status/tipo reconhecidos.
- Linha `invalida` exige ao menos um erro ativo.
- Alerta sem erro resulta em `valida_com_alerta`.
- As funções da Spec 004 passam a consumir `json_normalizado`, nunca a procurar
  nomes canônicos em `raw_json`.

## Existing Entity: `mms_erros_importacao`

Sem nova tabela ou novo ciclo de vida.

### Codes Required by Spec 006

- `arquivo_incompativel`
- `estrutura_incompativel`
- `coluna_obrigatoria_ausente`
- `cabecalho_duplicado`
- `multiplas_datas`
- `multiplas_areas_trabalho`
- `data_invalida`
- `area_trabalho_ausente`
- `posto_nao_encontrado_ou_inacessivel`
- `numero_assistencia_ausente`
- `parte_conjunto_invalida`
- `status_atividade_nao_reconhecido`
- `tipo_atividade_nao_reconhecido`
- `linha_duplicada_conflitante`
- `arquivo_storage_inconsistente`
- `lote_incompleto`

Erros estruturais podem ter `linha_importacao_id = null`; erros de linha devem
apontar para a linha correspondente.

## Existing Entity: `mms_alertas_importacao`

Sem nova tabela ou novo ciclo de vida.

### Initial Codes Required by Spec 006

- `campo_complementar_vazio`
- `valor_complementar_invalido`
- `assistencia_existente`
- `atendimento_critico`
- `reagendamento_identificado`
- `defeito_identificado`
- `observacao_relevante`

Alertas nunca corrigem valor, nunca mudam `raw_json` e não tornam uma linha
inválida quando todos os requisitos de transformação são atendidos.

## Existing Storage Entities

### `storage.buckets`

Um registro privado:

```text
id: mms-importacoes
public: false
file_size_limit: 26214400
allowed_mime_types:
  - text/csv
  - application/csv
  - application/vnd.ms-excel
  - application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
```

`application/vnd.ms-excel` é aceito apenas junto de extensão `.csv`, pois
navegadores/Windows podem usar esse MIME para CSV; conteúdo ainda é validado.

### `storage.objects`

O objeto usa:

```text
bucket_id = mms-importacoes
name = <auth_user_id>/<lote_id>/<uuid>.<csv|xlsx>
owner_id = auth.uid()
```

Não existe update, move, upsert ou delete no fluxo desta feature. Leitura é
permitida somente a usuário autenticado cujo escopo alcance o lote extraído do
caminho.

## Existing Mirror Adjustments

### `mms_assistencias`

Identidade e campos não mudam. A função de upsert passa a ler:

- status canônico de `json_normalizado.status_atividade`;
- tipo original/canônico de `json_normalizado`;
- cliente e endereço de `json_normalizado`;
- `raw_json_resumo` derivado das linhas originais, mantendo chaves originais.

### `mms_partes_assistencia`

Identidade e campos não mudam. A função de upsert passa a ler os campos
operacionais de `json_normalizado` e continua copiando a evidência original da
linha para `mms_partes_assistencia.raw_json`.

### Processing Counters

`app_private.mms_processar_lote_assistencias` passa a distinguir, para
assistências e partes:

- criada;
- atualizada materialmente;
- preservada sem mudança material;
- removida;
- reativada.

Esses totais são calculados na transação, retornados e persistidos no lote.

## Application Models (Non-Persistent)

### `ParsedMmsFile`

- `file`
- `extension`
- `mimeType`
- `originalName`
- `sizeBytes`
- `headersOriginal`
- `rows`
- `totalDataRows`
- `areaTrabalhoOriginal`
- `dataAtividade`

### `ParsedMmsRow`

- `sourceRowNumber`
- `rawValuesByOriginalHeader`

Não contém `posto_id`, status de lote ou decisão de elegibilidade autoritativa.

### `ImportPreview`

- identidade do lote/arquivo;
- posto/data;
- totais;
- erros e alertas;
- `canConfirm`;
- timestamps de análise.

### `ImportResult`

Reflete exatamente `resultado_processamento`; não recalcula totais no cliente.

### `ImportUiState`

Estados discriminados:

- `idle`
- `parsing`
- `uploading`
- `staging`
- `preview_ready`
- `confirming`
- `success`
- `success_with_warnings`
- `cancelled`
- `session_expired`
- `access_denied`
- `failure`

Transições inválidas são recusadas; trocar arquivo após iniciar lote exige
cancelar/abandonar a tentativa atual e iniciar outra.

## Indexing and Constraints

- Unique em `mms_lotes_importacao.caminho_arquivo` quando não nulo.
- Índice em `mms_lotes_importacao.usuario_importador_id`,
  `arquivo_armazenado_em`, `espelho_processado_em` e
  `confirmacao_solicitada_em`.
- Unique parcial em `mms_linhas_importacao
  (lote_importacao_id, numero_linha_origem)` para linhas ativas com número.
- Índice GIN em `json_normalizado` somente se medições mostrarem consulta
  necessária; o fluxo principal usa colunas candidatas e não precisa dele.
- Índices existentes por lote, posto/data, assistência e parte permanecem.

## Migration Compatibility

- Linhas anteriores recebem `json_normalizado` derivado das chaves canônicas
  legadas já presentes em seu `raw_json`, sem alterar o original.
- Lotes anteriores não precisam de metadados de Storage; as novas constraints
  condicionam obrigatoriedade ao workflow da Spec 006.
- Lotes cancelados anteriores recebem `cancelado_em = updated_at` e
  `cancelado_por = updated_by` antes da nova constraint.
- Funções existentes continuam aceitando dados das Specs 003/004 após o
  backfill.
