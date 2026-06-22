# Validation Contract: Importacao MMS Staging

## Batch Status

`mms_lotes_importacao.status` deve aceitar somente:

- `importado`
- `importado_com_alertas`
- `erro`
- `cancelado`

Estados internos como recebido, processando ou validado devem ficar em campos
tecnicos ou timestamps, nunca em `status`.

## mms_lotes_importacao

Required validations:

- `nome_origem` obrigatorio e nao vazio.
- `posto_id` obrigatorio e deve referenciar `postos.id`.
- Criacao deve rejeitar posto inexistente, inativo ou removido logicamente.
- `usuario_importador_id` obrigatorio e deve referenciar `usuarios.id`.
- `status` obrigatorio e restrito aos quatro status oficiais.
- Totais obrigatorios, inteiros e maiores ou iguais a zero.
- Totais devem refletir linhas, erros e alertas ativos do lote.
- Soft delete exige `deleted_at`, `deleted_by` e `delete_reason`.
- Soft delete nao altera `status`.

## mms_linhas_importacao

Required validations:

- `lote_importacao_id` obrigatorio e deve referenciar lote existente.
- `raw_json` obrigatorio e nao nulo.
- `raw_json` deve ser imutavel apos criacao em fluxos operacionais comuns.
- `numero_linha_origem`, quando informado, deve ser positivo.
- `posto_id`, quando resolvido, deve referenciar `postos.id`.
- `data_atividade`, quando extraida, deve ser uma data valida.
- `numero_assistencia`, quando extraido, nao pode ficar vazio apos trim.
- `parte_conjunto`, quando extraido, nao pode ficar vazio apos trim.
- Ausencia ou inconsistencia de campo candidato esperado deve gerar erro ou
  alerta rastreavel.
- Soft delete exige `deleted_at`, `deleted_by` e `delete_reason`.

## Candidate Fields

Campos que devem ser persistidos e validados quando extraiveis/resolvidos:

- `posto_id`
- `data_atividade`
- `numero_assistencia`
- `parte_conjunto`

Esses campos preparam a Spec seguinte, que aplicara a chave operacional:

`posto_id + data_atividade + numero_assistencia + parte_conjunto`

Esta feature nao deve usar essa chave para upsert final nem marcacao `removido`.

## mms_erros_importacao

Required validations:

- `lote_importacao_id` obrigatorio.
- `linha_importacao_id`, quando preenchido, deve pertencer ao mesmo lote.
- `codigo` obrigatorio, estavel e nao vazio.
- `mensagem` obrigatoria e nao vazia.
- `campo` deve indicar o campo afetado quando o erro for associado a um campo
  especifico.
- Erro ativo de linha deve contribuir para linha invalida e para totais do lote.
- Soft delete exige `deleted_at`, `deleted_by` e `delete_reason`.

## mms_alertas_importacao

Required validations:

- `lote_importacao_id` obrigatorio.
- `linha_importacao_id`, quando preenchido, deve pertencer ao mesmo lote.
- `codigo` obrigatorio, estavel e nao vazio.
- `mensagem` obrigatoria e nao vazia.
- `campo` deve indicar o campo afetado quando o alerta for associado a um campo
  especifico.
- Alerta ativo de linha deve contribuir para totais de alerta do lote sem tornar
  a linha invalida quando nao houver erro.
- Soft delete exige `deleted_at`, `deleted_by` e `delete_reason`.

## Totals Contract

- `total_linhas` conta linhas ativas do lote.
- `total_linhas_validas` conta linhas ativas sem erro bloqueante.
- `total_linhas_com_erro` conta linhas ativas com pelo menos um erro ativo.
- `total_linhas_com_alerta` conta linhas ativas com pelo menos um alerta ativo.
- `total_linhas_ignoradas` conta linhas ativas em estado tecnico ignorado.
- Lote com qualquer erro ativo deve ter `status = erro`.
- Lote sem erros e com alerta ativo deve ter `status = importado_com_alertas`.
- Lote sem erros e sem alertas deve ter `status = importado`.
- Lote cancelado deve ter `status = cancelado` e permanecer auditavel.

## Required Test Scenarios

- Criar lote com status fora da lista oficial falha.
- Criar lote para posto inexistente, inativo ou removido falha.
- Criar linha sem `raw_json` falha.
- Atualizar `raw_json` apos criacao falha em fluxo operacional comum.
- Criar erro sem codigo ou mensagem falha.
- Criar alerta sem codigo ou mensagem falha.
- Criar erro/alerta com linha de outro lote falha.
- Totais de lote batem com linhas, erros e alertas ativos.
- Soft delete sem usuario ou motivo falha.
- Soft delete nao muda o status oficial do lote.
