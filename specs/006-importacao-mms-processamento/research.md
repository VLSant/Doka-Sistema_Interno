# Research: Importação MMS — Upload, Parser, Validação e Processamento

## Amendment 2026-06-28: upload e lote únicos

**Decision**: Um arquivo com uma ou mais Áreas de Trabalho produz um único lote
e um único objeto no Storage. O banco resolve o posto de cada linha no staging.
Os três perfis podem executar a ingestão global por RPC, sem ampliar as RLS do
espelho operacional.

**Rationale**: Elimina upload, reserva, validação, consulta de problemas e
confirmação repetidos por posto. Um erro em qualquer posto bloqueia todo o lote.

## Decisão 1 — Executar parsing e prévia no navegador

**Decision**: Usar Papa Parse 5.5.4 para CSV e `read-excel-file` 9.2.0 para
XLSX. CSV será processado em worker/stream; XLSX usará o entrypoint browser, que
já delega leitura a Web Worker. A lógica comum converte as linhas em
`raw_json`, preservando cabeçalhos e valores apresentados pelo arquivo, e envia
somente blocos limitados ao banco.

**Rationale**: A prévia precisa responder rapidamente para até 10.000 linhas sem
depender de infraestrutura adicional. Papa Parse suporta arquivo local,
detecção de delimitador, streaming e worker. `read-excel-file` lê `File`,
`Blob` ou `ArrayBuffer`, usa worker no browser, permite `trim: false` e tem
benchmark publicado para arquivos maiores que o escopo. A leitura local também
evita os limites atuais de Edge Functions (memória finita e CPU curta) para um
trabalho intensivo de descompactação/parsing.

**Alternatives considered**:

- Edge Function com parser: rejeitada para o fluxo principal por limite de CPU,
  memória e duração, além de duplicar o download do arquivo antes da prévia.
- SheetJS `xlsx` do npm: rejeitado porque o pacote público está defasado em
  relação à distribuição oficial e adicionaria uma decisão incomum de
  fornecimento por tarball externo.
- ExcelJS: rejeitado por pacote muito maior e por oferecer recursos de edição
  que a feature não usa.
- Parser próprio: rejeitado por alto risco de CSV/XLSX incorreto.

Referências:

- https://www.papaparse.com/docs
- https://gitlab.com/catamphetamine/read-excel-file
- https://supabase.com/docs/guides/functions/limits

## Decisão 2 — Manter validação autoritativa no PostgreSQL

**Decision**: O parser produz a experiência de prévia, mas RPCs do banco
reconstroem os campos canônicos a partir de `raw_json`, aplicam validações,
registram erros/alertas e consolidam os totais. O cliente não determina sozinho
posto, elegibilidade, status do lote ou efeito no espelho.

**Rationale**: O cliente é uma superfície manipulável. Regras de negócio,
autorização e efeitos idempotentes precisam permanecer perto dos dados e dentro
da mesma transação. A documentação Supabase recomenda Database Functions para
operações intensivas em dados.

**Alternatives considered**:

- Confiar nos candidatos enviados pelo cliente: rejeitado por permitir bypass
  das validações de domínio.
- Inserções diretas com RLS: rejeitadas porque não coordenam erros, alertas,
  totais, auditoria e confirmação como uma unidade controlada.
- Backend próprio: rejeitado porque o projeto é uma SPA Supabase e não existe
  necessidade constitucional para outro serviço.

Referência:

- https://supabase.com/docs/guides/database/functions

## Decisão 3 — Separar `raw_json` de `json_normalizado`

**Decision**: Adicionar `json_normalizado` a `mms_linhas_importacao`. O
`raw_json` conterá chaves com os cabeçalhos MMS originais e valores sem
normalização destrutiva; `json_normalizado` conterá nomes canônicos
`snake_case`, valores convertidos e mapeamentos de status/tipo. As funções da
Spec 004 serão ajustadas para ler `json_normalizado`.

**Rationale**: As funções atuais do espelho leem chaves canônicas diretamente
de `raw_json`, o que conflita com a obrigação de preservar nomes e valores
originais. Separar os documentos mantém evidência e consumo operacional sem
duplicar a entidade Linha.

**Alternatives considered**:

- Continuar gravando chaves normalizadas em `raw_json`: rejeitado por violar a
  constituição e a Spec 006.
- Criar outra tabela de linhas normalizadas: rejeitado por duplicar ciclo de
  vida, escopo e auditoria sem necessidade.
- Criar colunas para todos os campos MMS: rejeitado porque o conjunto pode
  evoluir e apenas candidatos de identidade exigem colunas próprias.

## Decisão 4 — Usar bucket privado e upload TUS sem sobrescrita

**Decision**: Criar o bucket privado `mms-importacoes`, limitado a 25 MiB e aos
MIME types aprovados. Todo arquivo usará caminho novo
`<auth_user_id>/<lote_id>/<uuid>.<ext>` e `upsert = false`. O cliente enviará
com TUS e chunks de 6 MiB, exibindo progresso e retomando falhas transitórias.

**Rationale**: Supabase recomenda TUS acima de 6 MB e caminhos novos para evitar
concorrência e conteúdo obsoleto. O limite de 25 MiB cobre o volume de 10.000
linhas com margem, fica abaixo do teto do plano gratuito e reduz abuso. O
bucket privado permite policies por usuário/lote e impede URL pública.

**Alternatives considered**:

- Upload padrão para todos os tamanhos: rejeitado porque o escopo ultrapassa a
  recomendação de 6 MB para confiabilidade.
- Bucket público: rejeitado por conter dados operacionais e de cliente.
- Sobrescrever por nome do arquivo: rejeitado porque nomes podem repetir e o
  original de cada tentativa deve permanecer rastreável.
- `file_hash`: rejeitado por decisão fechada do MVP.

Referências:

- https://supabase.com/docs/guides/storage/uploads/resumable-uploads
- https://supabase.com/docs/guides/storage/security/access-control
- https://supabase.com/docs/guides/storage/uploads/file-limits

## Decisão 5 — Expor somente RPCs estreitas

**Decision**: Revogar `INSERT`/`UPDATE` diretos de `authenticated` nas tabelas
de staging usadas pelo fluxo e expor funções públicas específicas. As funções
que precisam escrever erros/alertas ou coordenar múltiplas tabelas serão
`SECURITY DEFINER`, com relações qualificadas, `search_path` vazio/fixo, ator
derivado de `auth.uid()`, verificação explícita de posto/lote, validação de
payload e `EXECUTE` revogado de `PUBLIC`/`anon`.

**Rationale**: O Operador precisa realizar a importação, mas não deve criar
arbitrariamente erros, alertas, usuários ou estados. RPCs estreitas mantêm o
caso de uso permitido sem conceder escrita genérica. A mudança de 2026 que
deixa novas tabelas fora da Data API por padrão reforça a necessidade de grants
explícitos e mínimos; não afeta as chamadas RPC planejadas quando os privilégios
forem declarados.

**Alternatives considered**:

- Manter grants genéricos e depender só de RLS: rejeitado por ampliar a
  superfície de alteração além da jornada.
- Edge Function com chave secreta: rejeitada porque adiciona um bypass de RLS e
  não melhora a transação do banco.
- Funções `SECURITY INVOKER` puras: insuficientes para o Operador registrar
  erros/alertas e executar o fluxo atômico sem grants amplos.

Referências:

- https://supabase.com/docs/guides/database/functions
- https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically

## Decisão 6 — Persistir staging antes da confirmação e tornar ingestão retomável

**Decision**: Depois do parsing local, a aplicação inicia o lote, envia o
arquivo, registra o objeto e envia linhas em blocos de até 250. A unicidade
`lote_importacao_id + numero_linha_origem` torna o reenvio do mesmo bloco
idempotente. A análise só termina se o objeto existir, o total esperado
coincidir e todas as linhas estiverem classificadas.

**Rationale**: Um payload único com 10.000 linhas seria frágil. Staging parcial
é aceitável como evidência, desde que permaneça inelegível e nunca alcance o
espelho. Blocos menores permitem progresso, retomada e erros precisos.

**Alternatives considered**:

- Um RPC com todas as linhas: rejeitado por tamanho de request, tempo de
  transação e baixa retomabilidade.
- Confirmar antes de persistir staging: rejeitado porque elimina a prévia
  auditável e torna falhas intermediárias difíceis de explicar.
- Inserção linha a linha: rejeitada por excesso de round trips.

## Decisão 7 — Confirmar com lock e subtransação idempotente

**Decision**: `confirmar_importacao_mms` fará `SELECT ... FOR UPDATE` no lote.
Se já houver `espelho_processado_em`, retornará o resultado persistido. Caso
contrário, revalidará autorização, objeto, status e completude e executará
`mms_processar_lote_assistencias` em bloco protegido. Exceção no bloco reverte
todas as mudanças do espelho; o bloco externo registra falha segura no lote e
na auditoria. Sucesso persiste o resultado e o timestamp na mesma transação.

**Rationale**: O lock serializa cliques concorrentes; o resultado persistido
torna retries seguros; a subtransação permite registrar falha sem conservar
mudanças parciais. Nenhum novo status oficial de lote é necessário.

**Alternatives considered**:

- Desabilitar apenas o botão: rejeitado porque não protege chamadas repetidas,
  múltiplas abas ou retries de rede.
- Chave de idempotência no cliente: desnecessária, pois o próprio lote é a
  unidade idempotente.
- Job assíncrono: rejeitado para o volume atual e o objetivo de resultado em 60
  segundos; pode ser revisto após medição real.

## Decisão 8 — Não apagar arquivo ou staging em cancelamento

**Decision**: Cancelar antes da confirmação altera o lote para `cancelado`,
registra ator/momento e bloqueia novas linhas/confirmação. Arquivo e staging
permanecem sob RLS para auditoria; a tela não oferece exclusão ou retomada.

**Rationale**: A constituição exige rastreabilidade e a Spec 007 tratará gestão,
reprocessamento e desfazer. Excluir o arquivo quebraria a evidência da tentativa.

**Alternatives considered**:

- Remover arquivo imediatamente: rejeitado por perda de evidência.
- Soft delete automático: rejeitado porque cancelamento é estado de negócio,
  não exclusão lógica.

## Decisão 9 — Fixar dependências e validar o changelog

**Decision**: Adicionar versões exatas ao `package.json` e lockfile. Antes da
implementação/deploy, revisar changelog, documentação de Storage/RPC e
advisors. O plano não depende de GraphQL nem do endpoint OpenAPI anônimo,
portanto as breaking changes de 2026 identificadas não bloqueiam a feature.

**Rationale**: Supabase e parsers mudam com frequência; versões fixas e
verificação de advisors reduzem regressão e risco de supply chain.

**Alternatives considered**:

- Faixas `^`: rejeitadas para dependências do parser/upload por mudarem
  comportamento sem alteração deliberada do lockfile.

## Decisão 10 — Validar sem Docker e sem automação de navegador

**Decision**: Executar Vitest/jsdom localmente e validar migrations, RPCs,
policies e testes SQL no projeto Supabase remoto de desenvolvimento conectado.
Cada script de teste remoto deve abrir uma transação, fazer as asserções e
terminar com rollback. Não criar novos testes Playwright/E2E para esta feature;
navegação, visual, teclado e resoluções serão homologados manualmente pelo
usuário.

**Rationale**: A máquina de desenvolvimento não possui Docker, e o usuário
assumiu a validação manual do comportamento real no navegador. A estratégia
mantém cobertura automatizada das regras puras, componentes isolados e
invariantes críticas do banco sem exigir infraestrutura local nem duplicar a
homologação manual.

**Alternatives considered**:

- Supabase local via Docker: rejeitado por indisponibilidade no ambiente.
- Playwright/automação de navegador: rejeitado por decisão do usuário.
- Remover testes de banco: rejeitado porque RLS, atomicidade, auditoria e
  idempotência não podem depender apenas de validação manual.
