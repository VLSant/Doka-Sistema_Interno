# Implementation Plan: Importação MMS — Upload, Parser, Validação e Processamento

**Branch**: `main` | **Date**: 2026-06-27 | **Spec**: `specs/006-importacao-mms-processamento/spec.md`

**Input**: Feature specification from `specs/006-importacao-mms-processamento/spec.md`

## Summary

Transformar o destino neutro de Importações MMS da Spec 005 em uma jornada
desktop-first de seleção, análise, armazenamento, prévia, confirmação e
resultado. CSV será lido com Papa Parse e XLSX com `read-excel-file`, ambos no
navegador e fora da thread principal quando possível. O arquivo original será
enviado sem sobrescrita para um bucket privado do Supabase Storage; a aplicação
enviará as linhas brutas em lotes pequenos para RPCs autenticadas, e o
PostgreSQL fará a normalização e a validação autoritativas.

A migration estenderá as entidades da Spec 003 com metadados do arquivo,
`json_normalizado`, totais de assistências/partes e controle de
confirmação/processamento, sem criar entidades de domínio duplicadas. RPCs
públicas estreitas, com ator derivado de `auth.uid()`, substituirão escrita
direta nas tabelas de staging. A confirmação bloqueará o lote, revalidará
sessão, perfil, posto, Storage e completude e chamará o processamento da Spec
004 dentro de uma subtransação; falhas revertem toda alteração do espelho,
permanecem auditáveis e permitem nova tentativa segura. Chamadas repetidas
depois do sucesso devolvem o resultado persistido sem reaplicar efeitos.

## Technical Context

**Language/Version**: TypeScript 5.9, React 19.2, Node.js 24 LTS para a SPA e
tooling; SQL PostgreSQL/PL/pgSQL no Supabase.

**Primary Dependencies**: Vite 8.1, React Router 7.18,
`@supabase/supabase-js` 2.108.2, Papa Parse 5.5.4,
`@types/papaparse` 5.5.2, `read-excel-file` 9.2.0 e `tus-js-client` 4.3.1,
todos fixados no lockfile; Vitest 4.1 e React Testing Library.

**Storage**: Supabase PostgreSQL existente para lotes, linhas, erros, alertas,
assistências, partes e auditoria; bucket privado `mms-importacoes` para CSV/XLSX
originais. Limite planejado de 25 MiB por objeto, tipos CSV/XLSX permitidos,
caminhos imutáveis e únicos por usuário/lote, sem `file_hash` e sem `upsert`.

**Testing**: Typecheck, ESLint e Vitest/React Testing Library em jsdom para
parser, normalização, máquina de estados, serviços e componentes, sem automação
de navegador. Testes SQL são executados no projeto Supabase remoto de
desenvolvimento em transações com rollback para RPCs, RLS, Storage, auditoria,
concorrência, atomicidade, `raw_json`, `json_normalizado`, idempotência,
`removido` e reativação. Navegação, visual, teclado e resoluções ficam em
homologação manual pelo usuário.

**Target Platform**: SPA interna desktop/notebook nos navegadores modernos já
suportados pela Spec 005, com validação principal em 1440×900 e 1280×720.

**Project Type**: Aplicação web client-side integrada diretamente a Supabase
Auth, Data API, RPC e Storage sob RLS; sem backend próprio e sem Edge Function
para o fluxo principal.

**Performance Goals**: Para até 10.000 linhas e 25 MiB, 95% das prévias em até
30 segundos e 95% das confirmações em até 60 segundos sob condições normais;
parsing sem congelar a interface; envio de staging paginado; consultas e
processamento por índices de lote, posto/data e chave operacional.

**Constraints**: Português brasileiro; desktop-first; Poppins e design system
Doka; um posto e uma data por arquivo; CSV/XLSX somente; `raw_json` imutável com
cabeçalhos e valores originais; normalização separada em `json_normalizado`;
sem `file_hash`; sem chave secreta/service role no navegador; sem equivalência
automática de postos; nenhum lote parcial altera o espelho; confirmação
idempotente e atômica; funções `SECURITY DEFINER` somente quando indispensáveis,
com `search_path` vazio/fixo, autorização explícita e privilégios mínimos.

**Scale/Scope**: Uma tela funcional com estados explícitos da jornada, seis RPCs
de workflow, um bucket privado,
extensões nas quatro entidades de staging existentes, adequação das funções da
Spec 004 e cobertura para três perfis, múltiplos postos e arquivos de até 10.000
linhas.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- PASS: A MMS permanece a fonte operacional externa; o Doka preserva o arquivo
  e as linhas e somente reflete uma importação manual confirmada.
- PASS: O escopo fica no MVP. Não há integração automática/agendada, edição de
  linhas, reprocessamento administrativo, desfazer lote concluído, histórico
  completo, equivalência de postos ou módulos reservados às Specs 007+.
- PASS: Persistência, Auth, RLS, Storage e funções usam a fundação Supabase já
  aprovada. Nenhuma chave privilegiada chega ao navegador.
- PASS: A mudança reutiliza tabelas em português `snake_case`, acrescenta
  somente campos necessários e mantém ações críticas em
  `historico_auditoria`.
- PASS: Operador e Supervisão ficam restritos ao posto autorizado;
  Direção/Administração mantém escopo global. Menu e rota não substituem RLS.
- PASS: `raw_json` preserva o original e `json_normalizado` recebe os valores
  canônicos; a chave completa continua
  `posto_id + data_atividade + numero_assistencia + parte_conjunto`.
- PASS: Somente lote completo, validado e elegível pode criar/atualizar,
  marcar `removido` ou reativar. Erro, cancelamento, parcialidade e falha não
  alteram o espelho.
- PASS: A feature não cria ocorrências nem custos extras e não altera seus
  vínculos obrigatórios futuros com assistência.
- PASS: O frontend reutiliza componentes/tokens oficiais, PT-BR, teclado, foco
  visível e comportamento desktop-first.
- PASS: A diferença dos documentos antigos sobre importação parcial e correção
  foi resolvida pelas Specs 003/004 e pela Spec 006: staging com erro continua
  auditável, mas não atualiza o espelho; correção fica na Spec 007.

## Project Structure

### Documentation (this feature)

```text
specs/006-importacao-mms-processamento/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   |-- database-rpc-contract.md
|   |-- parser-validation-contract.md
|   |-- storage-access-contract.md
|   `-- ui-workflow-contract.md
`-- tasks.md
```

`tasks.md` será criado posteriormente por `/speckit-tasks`.

### Source Code (repository root)

```text
package.json
package-lock.json
vite.config.ts
vitest.config.ts

src/
|-- app/
|   |-- router.tsx
|   `-- routes.ts
|-- components/
|   |-- feedback/
|   `-- ui/
|-- modules/
|   `-- importacoes-mms/
|       |-- components/
|       |   |-- FileDropzone.tsx
|       |   |-- ImportPreview.tsx
|       |   |-- ValidationSummary.tsx
|       |   `-- ImportResult.tsx
|       |-- pages/
|       |   `-- NewImportPage.tsx
|       |-- import-machine.ts
|       |-- import-service.ts
|       |-- parser/
|       |   |-- csv-parser.ts
|       |   |-- xlsx-parser.ts
|       |   |-- row-mapper.ts
|       |   `-- types.ts
|       `-- storage-upload.ts
|-- services/
|   `-- audit-service.ts
`-- styles/

tests/
|-- fixtures/
|   `-- mms/
|       |-- valido.csv
|       |-- valido.xlsx
|       |-- alertas.csv
|       |-- invalido.csv
|       `-- multiplas-partes.xlsx
|-- unit/
|   `-- importacoes-mms/
`-- integration/
    `-- importacoes-mms/

supabase/
|-- migrations/
|   `-- YYYYMMDDHHMMSS_importacao_mms_processamento.sql
|-- policies/
|   `-- importacao_mms_processamento.md
|-- seed/
|   `-- importacao_mms_processamento.sql
`-- tests/
    |-- importacao_mms_processamento_rpc.sql
    |-- importacao_mms_processamento_rls_storage.sql
    |-- importacao_mms_processamento_atomicidade.sql
    `-- importacao_mms_processamento_resultado.sql
```

**Structure Decision**: Manter a SPA única já implementada e adicionar um
módulo por feature. O navegador faz parsing para feedback rápido e envia apenas
dados brutos estruturados; regras autoritativas, transação e auditoria ficam no
banco. Storage é acessado diretamente com o JWT do usuário e policies próprias.
Não será criado `backend/` nem Edge Function: a operação intensiva em dados é
mais segura e atômica em funções PostgreSQL, e o parsing local evita os limites
de CPU/memória de funções serverless. A validação de banco usa o projeto remoto
de desenvolvimento conectado, nunca Docker local; testes SQL destrutivos ou de
massa ficam encapsulados em transações com rollback. A navegação real não será
automatizada nesta feature.

## Phase 0: Research

Pesquisa consolidada em `specs/006-importacao-mms-processamento/research.md`.

Decisões principais:

- Parsing local em worker com Papa Parse para CSV e `read-excel-file` para XLSX.
- CSV lido sem tipagem dinâmica e sem `header: true`; cabeçalhos duplicados são
  detectados antes de construir `raw_json`.
- XLSX lido com `trim: false`; arquivos protegidos, corrompidos ou com mais de
  uma tabela lógica são bloqueados.
- Upload TUS direto para bucket privado, caminho novo por tentativa e
  `upsert = false`; limite de 25 MiB.
- RPCs PostgreSQL autenticadas para iniciar lote, registrar arquivo/linhas,
  concluir análise, cancelar e confirmar.
- Escrita direta do papel `authenticated` em staging é revogada; leitura sob
  RLS permanece para prévia.
- `json_normalizado` é separado de `raw_json`; funções do espelho passam a
  consumir o primeiro.
- A confirmação usa lock do lote, verificação do objeto em Storage,
  subtransação para o espelho e resultado persistido para idempotência.

## Phase 1: Design

Artefatos de design:

- `specs/006-importacao-mms-processamento/data-model.md`
- `specs/006-importacao-mms-processamento/contracts/parser-validation-contract.md`
- `specs/006-importacao-mms-processamento/contracts/storage-access-contract.md`
- `specs/006-importacao-mms-processamento/contracts/database-rpc-contract.md`
- `specs/006-importacao-mms-processamento/contracts/ui-workflow-contract.md`
- `specs/006-importacao-mms-processamento/quickstart.md`

## Post-Design Constitution Check

- PASS: O modelo só estende lotes/linhas existentes e usa o bucket como
  evidência; nenhuma fonte oficial ou entidade de negócio paralela foi criada.
- PASS: `raw_json` e arquivo original permanecem imutáveis; normalizações são
  separadas e rastreáveis.
- PASS: Os contratos de RPC derivam ator do Auth, revalidam perfil/posto e
  recusam chamada anônima ou fora do escopo.
- PASS: Policies do bucket privado e das tabelas cobrem leitura e escrita por
  lote/posto; Storage não é público.
- PASS: Confirmação, atualização do espelho e resultado material são
  idempotentes; falhas intermediárias revertem o espelho e não geram sucesso.
- PASS: A marcação `removido` continua exclusiva de importação completa e
  elegível do mesmo posto/data.
- PASS: O contrato da UI mantém estados verdadeiros, PT-BR, acessibilidade e
  desktop-first sem implementar a gestão reservada à Spec 007.
- PASS: Nenhuma violação constitucional ou esclarecimento técnico permanece.

## Complexity Tracking

Nenhuma violação constitucional requer justificativa.
