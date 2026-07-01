# Data Model: Gestão de Importações MMS

## Estratégia

A feature estende o modelo das Specs 003, 004 e 006. Não duplica lotes, linhas,
erros, alertas, assistências, partes, usuários, postos ou auditoria. Duas novas
entidades persistentes são necessárias:

1. `mms_correcoes_importacao`, para preservar versões de correção separadas da
   evidência;
2. `mms_operacoes_lote`, para controlar idempotência e retomada de
   reprocessamento/desfazer.

Análise de desfazer, filtros e projeções de listagem são modelos de resposta, não
tabelas.

## Dependências existentes

### `mms_lotes_importacao`

Fonte de identidade, arquivo, status oficial, estado de processamento, totais,
confirmação, resultado e cancelamento.

### `mms_linhas_importacao`

Preserva `raw_json` e `json_normalizado`. Ambos permanecem imutáveis. A linha é
o agregado de concorrência para correções.

### `mms_erros_importacao` e `mms_alertas_importacao`

Erros passam a ter estado de resolução explícito. Alertas permanecem
consultáveis e não recebem fluxo de encerramento.

### `mms_assistencias` e `mms_partes_assistencia`

Espelho operacional reconstruído por reprocessamento ou desfazer. Nenhum registro
é apagado fisicamente.

### `usuarios`, `postos`, `usuarios_postos`

Fonte única do ator, perfil, nível de vínculo e escopo atual.

### `historico_auditoria`

Histórico central de ações críticas. As novas tabelas não substituem auditoria.

## Extensão: `mms_lotes_importacao`

### Novos campos

| Campo | Tipo lógico | Obrigatório | Regra |
| --- | --- | --- | --- |
| `versao_tratamento` | inteiro longo | Sim | Começa em 0 e incrementa em toda correção aceita/substituída |
| `versao_tratamento_concluida` | inteiro longo | Não | Versão integralmente revalidada por Supervisão/Direção |
| `tratamento_concluido_em` | data/hora | Não | Preenchido junto da versão concluída |
| `tratamento_concluido_por` | referência a usuário | Não | Ator autorizado que concluiu |
| `ultima_versao_processada` | inteiro longo | Não | Última versão aplicada ao espelho |
| `reprocessado_em` | data/hora | Não | Último reprocessamento concluído |
| `reprocessado_por` | referência a usuário | Não | Ator do último reprocessamento |
| `tipo_cancelamento` | enum textual | Não | `antes_confirmacao` ou `desfazer_processado` |
| `justificativa_cancelamento` | texto | Não | Obrigatória para `desfazer_processado` |
| `resultado_desfazer` | JSON | Não | Resumo conciliado da reversão |

### Validações

- Campos de conclusão são todos nulos ou todos preenchidos.
- `versao_tratamento_concluida <= versao_tratamento`.
- Reprocessar exige igualdade entre versão concluída e versão atual.
- `ultima_versao_processada <= versao_tratamento`.
- `tipo_cancelamento = desfazer_processado` exige lote previamente processado,
  justificativa não vazia, `cancelado_em`, `cancelado_por` e
  `resultado_desfazer`.
- O status oficial continua limitado a Importado, Importado com alertas, Erro e
  Cancelado.
- Cancelado não é soft delete.

### Transições relevantes

```text
erro + correções pendentes
  -> erro + versão de tratamento incrementada
  -> importado/importado_com_alertas + tratamento concluído
  -> reprocessamento em andamento
  -> importado/importado_com_alertas + versão processada
  -> cancelado por desfazer
```

Uma nova correção após a conclusão limpa a conclusão vigente até que todas as
linhas sejam novamente revalidadas.

## Extensão: `mms_linhas_importacao`

### Novo campo

| Campo | Tipo lógico | Obrigatório | Regra |
| --- | --- | --- | --- |
| `versao_correcao` | inteiro longo | Sim | Começa em 0 e incrementa em toda nova correção da linha |

### Projeção `json_efetivo`

`json_efetivo` não é persistido na linha. Uma função privada:

1. parte do `json_normalizado`;
2. seleciona no máximo uma correção vigente e válida por chave;
3. aplica somente chaves da allowlist;
4. devolve o objeto usado para revalidação, prévia e processamento.

`raw_json` e `json_normalizado` nunca são alterados por esse cálculo.

## Extensão: `mms_erros_importacao`

### Novos campos

| Campo | Tipo lógico | Obrigatório | Regra |
| --- | --- | --- | --- |
| `estado_resolucao` | enum textual | Sim | `pendente` ou `corrigido`; inicia `pendente` |
| `correcao_resolutiva_id` | referência a correção | Não | Obrigatória quando corrigido |
| `corrigido_em` | data/hora | Não | Preenchido quando corrigido |
| `corrigido_por` | referência a usuário | Não | Autor da correção resolutiva |

### Validações

- `pendente` exige campos de resolução nulos.
- `corrigido` exige correção, data e autor.
- A correção deve pertencer à mesma linha/campo e estar válida/vigente.
- Resolver erro não preenche `deleted_at`.
- Substituir correção reavalia o erro; se o novo valor falhar, o erro volta a
  `pendente`.

## Nova entidade: `mms_correcoes_importacao`

Representa uma tentativa imutável de corrigir um campo de uma linha.

### Campos

| Campo | Tipo lógico | Obrigatório | Regra |
| --- | --- | --- | --- |
| `id` | UUID | Sim | Chave primária |
| `lote_importacao_id` | referência a lote | Sim | Deve coincidir com o lote da linha |
| `linha_importacao_id` | referência a linha | Sim | Linha corrigida |
| `campo` | texto controlado | Sim | Chave presente na allowlist |
| `valor_original` | JSON | Não | Valor preservado de `raw_json`, quando localizável |
| `valor_normalizado_anterior` | JSON | Não | Valor efetivo antes desta correção |
| `valor_corrigido` | JSON | Não | Novo valor; nulo só quando a regra permitir |
| `estado_validacao` | enum textual | Sim | `valida`, `invalida` ou `substituida` |
| `codigo_validacao` | texto | Não | Código determinístico em caso inválido |
| `mensagem_validacao` | texto | Não | Mensagem segura ao usuário |
| `versao_origem` | inteiro longo | Sim | Versão da linha recebida pela RPC |
| `substitui_correcao_id` | autorreferência | Não | Versão vigente anterior do campo |
| `created_at` | data/hora | Sim | Momento da tentativa |
| `created_by` | referência a usuário | Sim | Ator derivado da sessão |

### Regras

- Registros são append-only; não há update/delete por usuário autenticado.
- Existe no máximo uma correção `valida` vigente por linha/campo.
- Correção `invalida` é preservada, mas não altera `json_efetivo`.
- Ao aceitar uma nova correção válida, a anterior passa a `substituida` dentro
  da mesma transação.
- Operador só insere por RPC quando possui vínculo `operacional` com o posto
  efetivo da linha; vínculo `consulta` é somente leitura.
- Supervisão exige todos os postos relevantes dentro do próprio escopo.
- Direção/Administração possui escopo global.
- `raw_json` nunca é copiado integralmente para auditoria.

### Índices

- `(lote_importacao_id, created_at desc)`
- `(linha_importacao_id, campo, created_at desc)`
- único parcial em `(linha_importacao_id, campo)` para correção válida vigente
- `(created_by, created_at desc)`

## Nova entidade: `mms_operacoes_lote`

Ledger operacional de reprocessamento e desfazer.

### Campos

| Campo | Tipo lógico | Obrigatório | Regra |
| --- | --- | --- | --- |
| `id` | UUID | Sim | Chave primária |
| `lote_importacao_id` | referência a lote | Sim | Lote alvo |
| `tipo` | enum textual | Sim | `reprocessamento` ou `desfazer` |
| `chave_idempotencia` | UUID | Sim | Gerada pelo cliente por confirmação |
| `versao_tratamento` | inteiro longo | Sim | Versão pretendida da operação |
| `estado` | enum textual | Sim | `em_andamento`, `concluida` ou `falha` |
| `assinatura_analise` | texto opaco | Não | Obrigatória para desfazer |
| `justificativa` | texto | Não | Obrigatória para desfazer |
| `resultado` | JSON | Não | Obrigatório no sucesso |
| `codigo_falha` | texto | Não | Obrigatório na falha conhecida |
| `solicitado_em` | data/hora | Sim | Criação |
| `solicitado_por` | referência a usuário | Sim | Ator |
| `finalizado_em` | data/hora | Não | Sucesso ou falha |

### Validações

- `chave_idempotencia` é única globalmente.
- A mesma chave com lote/tipo/parâmetros diferentes é rejeitada como conflito.
- `concluida` exige resultado e `finalizado_em`.
- `falha` exige código e `finalizado_em`.
- `em_andamento` não possui resultado final.
- `desfazer` exige justificativa normalizada entre limites definidos e
  assinatura de análise.
- Registros não usam soft delete e não são alteráveis diretamente pelo cliente.
- Uma única operação mutável pode ficar `em_andamento` por lote.

### Índices

- único em `chave_idempotencia`
- único parcial em `lote_importacao_id` para estado `em_andamento`
- `(lote_importacao_id, solicitado_em desc)`
- `(tipo, estado, solicitado_em desc)`

## Modelo calculado: `LoteResumoAutorizado`

Resposta da listagem:

- lote, data/hora, data operacional;
- somente postos autorizados e indicador de lote parcialmente visível;
- importador quando permitido;
- nome do arquivo somente com cobertura integral;
- status e estado de processamento;
- totais recalculados sobre linhas autorizadas;
- total de erros pendentes e alertas visíveis;
- flags `precisa_tratamento`, `pode_abrir`, `pode_baixar_arquivo`,
  `pode_corrigir`, `pode_concluir`, `pode_reprocessar`,
  `pode_analisar_desfazer`;
- cursor estável `(created_at, id)`.

## Modelo calculado: `LoteDetalheAutorizado`

Combina resumo, resultado autorizado, falhas, contadores, postos e capacidades.
Linhas, erros, alertas, correções e auditoria são coleções paginadas separadas
para evitar respostas ilimitadas.

## Modelo calculado: `AnaliseDesfazer`

- `lote_id`;
- `elegivel`;
- versão atual;
- assinatura opaca;
- lista de escopos posto/data;
- predecessor por escopo, quando houver;
- motivos estáveis de bloqueio;
- contadores de assistências/partes a restaurar, retirar ou preservar;
- `analisado_em`.

Não autoriza execução e não é persistido como aprovação.

## Bloqueios de desfazer

No mínimo:

- lote não processado, cancelado ou não mais efetivo;
- ator sem cobertura integral de todos os postos;
- operação concorrente;
- correção/conclusão/reprocessamento posterior à análise;
- edição manual incompatível em assistência/parte após aplicação do lote;
- ocorrência, custo extra ou dependência operacional vinculada;
- predecessor inelegível ou evidência incompleta;
- impossibilidade de conciliar o estado reconstruído.

## RLS e privilégios

- RLS permanece habilitada em todas as tabelas públicas.
- `anon` não recebe privilégios.
- `authenticated` recebe leitura somente quando necessária; não recebe
  insert/update/delete direto nas novas tabelas.
- Escritas ocorrem exclusivamente por RPC.
- Funções `SECURITY DEFINER` ficam privadas ou, quando públicas como RPC,
  validam ator/escopo e têm privilégios revogados por padrão.
- Políticas e funções usam colunas indexadas de lote, linha, posto e ator.

## Compatibilidade de migration

- A migration preenche versões existentes com zero.
- Lotes já processados recebem `ultima_versao_processada = 0`.
- Cancelamentos já existentes recebem `tipo_cancelamento =
  antes_confirmacao` quando não houve espelho processado; casos históricos
  ambíguos são bloqueados para desfazer até revisão.
- Nenhum backfill altera `raw_json`, `json_normalizado`, arquivo ou chaves MMS.
