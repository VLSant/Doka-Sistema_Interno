# Research: Gestão de Importações MMS

## Contexto pesquisado

A Spec 007 estende uma SPA React que acessa Supabase diretamente com a sessão do
usuário. As Specs 003, 004 e 006 já entregaram staging, arquivo privado,
validação autoritativa, espelho operacional e RPCs transacionais. A pesquisa
concentrou-se em como acrescentar consulta multi-posto, correções concorrentes,
reprocessamento e desfazer sem quebrar evidência, RLS ou idempotência.

## Decisão 1 — Manter a arquitetura SPA + RPCs PostgreSQL

**Decision**: manter a interface no módulo `src/modules/importacoes-mms` e
implementar consultas agregadas e todas as mutações críticas por RPCs
autenticadas. Funções auxiliares com privilégios elevados ficam em
`app_private`; RPCs públicas revogam `PUBLIC`/`anon`, concedem execução apenas a
`authenticated`, fixam `search_path` e derivam o ator de `auth.uid()`.

**Rationale**: tratamento, reprocessamento e desfazer precisam bloquear linhas,
revalidar escopo e aplicar várias alterações em uma única transação. Colocar
essas decisões no banco preserva atomicidade e impede que o navegador componha
operações privilegiadas. O projeto já usa esse padrão na Spec 006.

**Alternatives considered**:

- Edge Function: adicionaria outra fronteira de confiança e ainda dependeria de
  transações no PostgreSQL.
- Escrita direta do navegador: não oferece uma unidade atômica segura para
  correção, revalidação e espelho.
- Backend separado: não existe no repositório e não traz benefício para esta
  operação intensiva em dados.

## Decisão 2 — Projetar listagem e detalhe por RPC, não por view privilegiada

**Decision**: criar RPCs paginadas que retornem projeções autorizadas de lotes,
detalhes, erros, alertas e histórico. O banco calcula a interseção dos postos do
lote com o escopo atual. Metadados globais do arquivo e download só são
retornados quando o ator cobre todos os postos do lote.

**Rationale**: um lote pode conter múltiplos postos. Liberar a linha do lote por
RLS não é suficiente, pois os totais globais e o arquivo podem revelar dados de
postos não autorizados. Uma projeção explícita permite recalcular totais apenas
com linhas visíveis, manter paginação por cursor e evitar views que, por padrão,
podem executar com privilégios do criador.

**Alternatives considered**:

- View comum: risco de ignorar RLS e não resolve download condicionado à
  cobertura integral do lote.
- Consultas diretas encadeadas no frontend: aumentam round-trips e podem produzir
  totais incoerentes entre respostas.
- Liberar lote multi-posto somente ao importador: contradiz a consulta por
  perfil/posto definida na Spec 007.

## Decisão 3 — Correções imutáveis e projeção efetiva calculada

**Decision**: criar `mms_correcoes_importacao` como registro imutável por
lote/linha/campo. `raw_json` e `json_normalizado` continuam imutáveis. Uma função
privada monta `json_efetivo` aplicando somente a correção vigente e tecnicamente
válida sobre as chaves autorizadas de `json_normalizado`.

**Rationale**: a tabela separa evidência, normalização original e decisão
humana; mantém todas as versões; permite mostrar valor original, normalizado e
corrigido; e oferece uma fonte única para revalidação e processamento.

**Alternatives considered**:

- Alterar `json_normalizado`: viola a imutabilidade já protegida por trigger na
  Spec 006.
- Adicionar uma coluna corrigida para cada campo: amplia o schema a cada nova
  regra e dificulta histórico de versões.
- Guardar apenas o último valor no erro: perde as correções anteriores e não
  cobre vários erros/campos por linha.

## Decisão 4 — Allowlist de campos e validadores reutilizados

**Decision**: o banco mantém uma allowlist explícita de chaves corrigíveis da
linha. A migration inicial cobre apenas campos para os quais já existem regras
determinísticas nas Specs 003–006, incluindo identidade operacional, posto,
data, status/tipo de atividade e valores com conversores existentes. Cada chave
é revalidada pela mesma regra autoritativa usada na ingestão.

**Rationale**: aceitar JSON livre permitiria alterar silenciosamente campos não
aprovados. Reutilizar normalizadores evita divergência entre importar e tratar.

**Alternatives considered**:

- Qualquer chave de `raw_json`: amplia escopo e permite dados sem validação.
- Validação apenas no frontend: pode ser contornada e divergir do processamento.
- Sugestões por IA: não são determinísticas nem aprovadas e ficam fora do
  escopo.

## Decisão 5 — Concorrência otimista por versão, confirmada por row lock

**Decision**: adicionar `versao_correcao` em `mms_linhas_importacao` e
`versao_tratamento` em `mms_lotes_importacao`. Salvar correção exige a versão
esperada; a RPC bloqueia lote e linha com `FOR UPDATE`, compara a versão, grava
uma nova correção, substitui a anterior e incrementa as versões na mesma
transação.

**Rationale**: a versão torna conflitos detectáveis para o usuário, enquanto o
row lock elimina a janela entre validar e gravar. Uma versão no lote invalida
resumos e análises obtidos antes de qualquer correção.

**Alternatives considered**:

- Última gravação vence: sobrescreve correção recente sem aviso.
- Lock mantido durante edição na UI: impraticável em sessões web.
- Comparar somente timestamp: possui semântica menos clara e precisão variável.

## Decisão 6 — Erro resolvido aponta para a correção vigente

**Decision**: estender `mms_erros_importacao` com estado de resolução e referência
à correção que o resolveu. A correção inválida é preservada, mas não resolve o
erro. Substituir uma correção reabre/revalida os erros do campo antes de marcar o
novo resultado.

**Rationale**: soft delete de erro apagaria sua condição operacional e
misturaria resolução com exclusão. A referência permite explicar exatamente
qual correção resolveu qual erro.

**Alternatives considered**:

- Soft delete ao corrigir: contraria a distinção constitucional entre estado e
  exclusão lógica.
- Recriar todos os erros: quebra identidade e dificulta auditoria.

## Decisão 7 — Ledger operacional para idempotência e resposta incerta

**Decision**: criar `mms_operacoes_lote` para tentativas de reprocessamento e
desfazer. Cada operação tem chave idempotente única, versão de tratamento,
estado, ator, timestamps e resultado/falha. O ledger não substitui
`historico_auditoria`; ele guarda estado necessário para execução e retomada,
enquanto a auditoria registra eventos críticos.

**Rationale**: o lote pode ser reprocessado após novas correções, portanto o
marcador único `espelho_processado_em` da Spec 006 não basta. Uma chave por
solicitação permite responder a clique repetido e descobrir o resultado após
falha de comunicação.

**Alternatives considered**:

- Sobrescrever apenas `resultado_processamento` no lote: perde a associação
  entre versão, tentativa e resposta incerta.
- Usar somente auditoria: auditoria não deve controlar execução nem servir como
  estado transacional.
- Confiar em desabilitar o botão: não protege repetição de requisição.

## Decisão 8 — Reprocessar a versão vigente do tratamento

**Decision**: concluir tratamento registra a versão validada do lote.
Reprocessamento exige ausência de erro bloqueante, cobertura integral de postos,
versão concluída ainda atual e confirmação explícita. O processador da Spec 006
passa a consumir `json_efetivo`; o lock do lote e o ledger impedem execução
duplicada da mesma versão.

**Rationale**: uma correção posterior deve invalidar a conclusão anterior. O
processamento continua usando a mesma chave MMS e as mesmas regras de
`removido`, mas com a projeção corrigida autorizada.

**Alternatives considered**:

- Criar novo lote: falsifica a origem e duplica staging.
- Processar somente linhas corrigidas: viola atomicidade e a regra do espelho
  completo.
- Manter o primeiro resultado como definitivo: impede que o tratamento produza
  efeito.

## Decisão 9 — Desfazer somente o lote efetivo mais recente por escopo

**Decision**: analisar cada par `posto_id + data_atividade` presente no lote. O
lote só é elegível se for o último lote concluído, não cancelado e efetivamente
aplicado em todos esses pares. Cada escopo identifica seu lote elegível
imediatamente anterior. A restauração reaplica esse predecessor por escopo; sem
predecessor, retira da visão operacional os efeitos exclusivos do lote sem
exclusão física.

**Rationale**: lotes multi-posto podem ter predecessores diferentes. Reexecutar
um lote predecessor inteiro poderia alterar outros postos onde ele não é mais o
estado correto. A reconstrução deve ser limitada ao escopo posto/data.

**Alternatives considered**:

- Reprocessar o lote anterior inteiro: pode regredir outros postos.
- Permitir desfazer lote histórico: exige replay cronológico completo e foi
  rejeitado no esclarecimento Q2.
- Apenas marcar o lote Cancelado: deixaria o espelho divergente do histórico.

## Decisão 10 — Análise de desfazer é informativa e sempre revalidada

**Decision**: `analisar_desfazer_importacao_mms` retorna elegibilidade, motivos,
impacto, versão de tratamento e uma assinatura opaca do estado analisado, sem
reservar registros. `desfazer_importacao_mms` recebe justificativa, chave
idempotente e assinatura, bloqueia lote/escopos/registros afetados e recalcula
todas as condições antes de qualquer efeito.

**Rationale**: manter locks entre análise e confirmação não é compatível com uma
interação humana. A assinatura detecta mudança para feedback claro, e a
revalidação dentro da transação é a autoridade final.

**Alternatives considered**:

- Persistir uma aprovação de longa duração: ficaria obsoleta com ações
  posteriores.
- Confiar apenas na assinatura: uma assinatura não substitui autorização nem
  locks atuais.

## Decisão 11 — Dependências operacionais bloqueiam o lote inteiro

**Decision**: qualquer edição manual posterior incompatível, ocorrência, custo
extra ou dependência registrada em uma assistência/parte afetada bloqueia o
desfazer completo. No schema atual, ausência das tabelas de ocorrências e custos
implica ausência desses vínculos; migrations futuras dessas entidades devem
estender a função privada de elegibilidade antes de habilitar seus vínculos.

**Rationale**: a Spec exige atomicidade do lote e proíbe reconstrução insegura.
O bloqueio conservador evita remover a base de uma ação operacional posterior.

**Alternatives considered**:

- Desfazer apenas registros sem dependência: seria importação/reversão parcial.
- Apagar ou mover dependências: está fora do escopo e destruiria rastreabilidade.

## Decisão 12 — Testar no projeto remoto de desenvolvimento

**Decision**: manter a estratégia da Spec 006: migrations são criadas pelo CLI,
aplicadas no projeto remoto de desenvolvimento conectado e verificadas por
testes SQL transacionais com rollback, advisors e testes frontend. Não depender
de Docker local.

**Rationale**: é a restrição operacional já registrada pelo projeto e preserva
o ambiente real de Auth/RLS/Storage.

**Alternatives considered**:

- Supabase local com Docker: indisponível no fluxo vigente.
- Teste manual sem SQL: insuficiente para concorrência, RLS e atomicidade.

## Referências verificadas

- Supabase Row Level Security:
  https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase — Securing your Data:
  https://supabase.com/docs/guides/database/secure-data
- Supabase — Securing your API:
  https://supabase.com/docs/guides/api/securing-your-api
- Supabase — Database Functions:
  https://supabase.com/docs/guides/database/functions
- Supabase changelog consultado em 2026-06-28; nenhuma mudança localizada altera
  o desenho adotado. A remoção de acesso anônimo ao OpenAPI reforça a decisão de
  não depender de descoberta anônima de RPCs.
