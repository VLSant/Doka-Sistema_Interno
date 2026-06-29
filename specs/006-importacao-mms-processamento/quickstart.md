# Quickstart: Validar Importação MMS

## Objetivo

Comprovar a importação, o parser, as regras de negócio e a persistência sem
depender de Docker ou automação de navegador.

## Pré-requisitos

- Node.js 24 LTS e npm.
- Acesso ao projeto remoto de desenvolvimento/validação do Supabase.
- Supabase CLI autenticada ou conexão MCP aprovada para esse projeto remoto.
- `.env.local` somente com URL e chave publicável do ambiente aprovado.
- Fixtures CSV/XLSX em `tests/fixtures/mms/`.
- Usuários de teste dos perfis e postos necessários.

Nenhuma chave secreta/service role deve estar no ambiente da SPA. Não é
necessário instalar Docker nem iniciar um Supabase local.

## 1. Instalação e validações locais

```powershell
npm install
npm run typecheck
npm run lint
npm test
npm run build
```

Os testes locais usam Vitest, React Testing Library e jsdom. Eles cobrem parser,
validações, transformação e comportamento isolado dos componentes sem abrir ou
controlar um navegador real.

## 2. Validação do banco remoto

Use exclusivamente um projeto remoto de desenvolvimento/validação. Não aplique
migrações nem execute fixtures em produção.

1. Confirme o projeto selecionado e inspecione migrações, tabelas e políticas.
2. Revise a migração da feature antes de aplicá-la.
3. Aplique-a pelo fluxo remoto aprovado do projeto.
4. Execute cada arquivo SQL de teste como uma única consulta transacional:

```sql
begin;

-- conteúdo do arquivo de teste

rollback;
```

5. Confirme que o rollback removeu todos os dados criados pelo teste.
6. Consulte os advisors de segurança e desempenho e revise logs, grants, RLS,
   Storage e funções introduzidas pela feature.

Os scripts SQL podem ser executados pelo MCP do Supabase ou por outro executor
remoto aprovado. Nenhum comando depende de `supabase start`,
`supabase db reset`, `supabase test db` ou Docker.

Cobertura obrigatória:

- chamadas anônimas negadas;
- perfil/posto aplicado a RPCs e objetos do Storage;
- escrita direta em staging negada;
- upload somente no caminho reservado e sem overwrite;
- preservação de `raw_json` e separação de `json_normalizado`;
- staging idempotente e conflito detectado;
- totais de prévia conciliados;
- lote inválido, cancelado ou incompleto impedido de processar;
- alertas não bloqueantes permitidos quando todas as linhas são válidas;
- confirmação concorrente com efeito único;
- falha injetada revertendo o espelho sem auditoria de sucesso;
- retry seguro após falha;
- reimportação criando, atualizando, preservando, removendo e reativando.

## 3. Aceite manual no navegador

O usuário executará o aceite de navegação e apresentação. Não criar nem
executar testes Playwright, Cypress, Selenium ou qualquer automação de navegador
para a Spec 006.

Validar manualmente:

- acesso pelo menu de perfil e pela URL direta;
- redirecionamento de usuário não autenticado;
- seleção de arquivo por clique e arrastar/soltar;
- rejeição de extensão, tamanho ou conteúdo inválido;
- prévia CSV/XLSX, avisos, erros e confirmação;
- cancelamento durante upload e na prévia;
- resultado final, retorno ao Dashboard e nova tentativa;
- expiração de sessão sem confirmação com contexto obsoleto;
- jornadas de reimportação sem duplicidade;
- apresentação em 1440×900 e 1280×720;
- foco, ordem de tabulação, mensagens acessíveis e movimento reduzido.

## 4. Desempenho

Use fixtures determinísticas representativas nos testes do parser e consultas
remotas controladas para medir as operações de banco. O tempo da jornada real
no navegador é registrado pelo usuário durante o aceite manual, incluindo
máquina, ambiente, formato e tamanho do arquivo.

Critérios:

- pelo menos 95% das prévias em até 30 segundos;
- pelo menos 95% das confirmações em até 60 segundos;
- consultas usando índices de lote, posto e chave completa.

## 5. Evidências de conclusão

Registrar:

- resultados de typecheck, lint, Vitest e build;
- testes SQL remotos executados em transações com rollback;
- revisão dos advisors, políticas e privilégios do Supabase;
- resultado do aceite manual informado pelo usuário;
- medições de desempenho e eventuais limites do ambiente.
