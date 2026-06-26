# Doka

> Plataforma interna de controle operacional e gerencial para acompanhamento de assistências, ocorrências, tarefas, rotinas, importações MMS, produtividade, deslocamentos e custos extras.

## Visão geral

O **Doka** é um sistema interno criado para centralizar a operação diária, reduzir perda de informações e melhorar o acompanhamento gerencial dos postos.

Ele nasce para resolver um problema claro: a operação possui dados importantes espalhados entre MMS, planilhas, controles manuais e conversas. Isso dificulta saber o que está pendente, atrasado, concluído, removido, importado com erro ou precisando de ação.

O Doka organiza essas informações em um fluxo único para operação, supervisão e direção.

## O que o Doka faz

No MVP, o Doka deve permitir:

- importar planilhas da MMS ao longo do dia;
- criar e atualizar assistências a partir da MMS;
- controlar partes do conjunto de uma assistência;
- marcar registros ausentes em nova importação como **Removido**;
- acompanhar ocorrências, pendências e reclamações;
- criar e acompanhar tarefas, rotinas e estratégias;
- controlar deslocamentos vindos da MMS;
- lançar e validar custos extras manuais;
- exibir dashboard por perfil de acesso;
- manter histórico centralizado das ações críticas;
- aplicar permissões por usuário, perfil e posto.

## O que o Doka não faz no MVP

O Doka **não substitui a MMS**.

A MMS continua sendo a fonte oficial das assistências. O Doka usa as planilhas importadas como espelho operacional interno.

Ficam fora do MVP:

- integração automática profunda com a MMS;
- WhatsApp/e-mail automático;
- app mobile completo;
- portal de montadores;
- BI avançado;
- comissão, repasse e nota fiscal;
- equivalência automática de nomes de postos;
- anexos gerais por ocorrência/tarefa;
- motivo detalhado automático para frustrada, improdutiva e devolução.

## Stack escolhida

### Banco e autenticação

- **Supabase**
- **PostgreSQL**
- **Supabase Auth**
- **Row Level Security (RLS)**
- **Supabase Storage** para arquivos de importação MMS

### Padrões técnicos

- Tabelas e campos em **português/snake_case**
- Histórico centralizado em `historico_auditoria`
- Soft delete com `deleted_at`, `deleted_by` e `delete_reason`
- Importação MMS preservando `raw_json`
- Sem `file_hash` no MVP
- Controle por lote de importação e chave operacional

### Frontend

O frontend ainda deve ser definido/implementado.

Quando a aplicação for criada, este README deverá ser atualizado com os comandos finais de instalação e execução.

## Estado atual do repositório

Este repositório está na fase inicial de estruturação técnica.

Ele contém:

- documentação do produto;
- estrutura base do projeto;
- pastas preparadas para Supabase;
- pastas preparadas para aplicação;
- scripts futuros de importação MMS;
- migrations, seeds, policies e testes SQL para a fundação operacional,
  cadastros base, staging MMS e artefatos iniciais do espelho operacional de
  assistências MMS (`mms_assistencias` e `mms_partes_assistencia`), ainda
  pendentes de validação local/remota completa da Spec 04.

Ainda pode não existir uma aplicação frontend executável até que a implementação comece.

## Como rodar localmente

### 1. Clonar o repositório

```bash
git clone git@github.com:VLSant/Doka.git
cd Doka
```

### 2. Criar arquivo de ambiente

```bash
cp .env.example .env
```

Preencha as variáveis:

```env
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
APP_ENV=development
APP_NAME=Doka
MMS_IMPORT_BUCKET=mms-importacoes
```

### 3. Instalar dependências do app

Quando o frontend/backend Node for criado, usar:

```bash
npm install
```

ou, se o projeto usar pnpm:

```bash
pnpm install
```

### 4. Rodar Supabase localmente

Pré-requisito: Supabase CLI instalado.

```bash
supabase start
```

Aplicar migrations:

```bash
supabase db reset
```

ou, conforme o fluxo adotado:

```bash
supabase migration up
```

### 5. Rodar a aplicação

Quando o app frontend for criado:

```bash
npm run dev
```

ou:

```bash
pnpm dev
```

## Como testar

Como o MVP ainda está em construção, os testes devem ser organizados por camada.

### Testes de banco

Validar:

- criação das tabelas;
- enums/tipos;
- constraints;
- índices;
- soft delete;
- histórico centralizado;
- views de dashboard;
- policies/RLS.

Comandos esperados:

```bash
supabase db reset
supabase test db
```

### Testes de permissão

Criar usuários de teste:

- Operador;
- Supervisão;
- Direção/Administração.

Validar:

- Operador vê apenas postos vinculados;
- Supervisão vê apenas escopo permitido;
- Direção/Administração vê tudo;
- usuário sem perfil operacional não acessa a aplicação.

### Testes de importação MMS

Cenários obrigatórios:

- importar arquivo válido;
- importar arquivo com campo obrigatório ausente;
- importar arquivo com erro em campo não obrigatório;
- reimportar mesmo posto/data;
- criar assistência nova;
- atualizar assistência existente;
- marcar registro ausente como **Removido**;
- preservar `raw_json`;
- gerar erros e alertas;
- salvar arquivo no Supabase Storage.

### Testes funcionais do MVP

Validar:

- criação de ocorrência vinculada a uma assistência;
- mudança de status da ocorrência;
- ocorrência atrasada por data de retorno;
- criação de tarefa;
- rotina acumulada mantendo a mesma tarefa em aberto;
- lançamento de custo extra;
- validação de custo extra;
- consulta de deslocamentos;
- dashboard por perfil.

## Estrutura do projeto

```txt
Doka/
├── docs/
│   ├── 01-prd-mvp.md
│   ├── 02-regras-negocio.md
│   ├── 03-mapa-telas-fluxos.md
│   ├── 04-importacao-mms.md
│   ├── 05-banco-dados.md
│   └── 06-backlog-tecnico.md
│
├── supabase/
│   ├── migrations/
│   │   └── README.md
│   ├── seed/
│   │   └── README.md
│   └── policies/
│       └── README.md
│
├── scripts/
│   └── importacao-mms/
│       └── README.md
│
├── src/
│   ├── app/
│   ├── components/
│   ├── services/
│   ├── lib/
│   └── modules/
│
├── .env.example
├── .gitignore
└── README.md
```

## Documentos importantes

Leia os documentos nesta ordem:

1. [Documento 01 — PRD do MVP](docs/01-prd-mvp.md)
2. [Documento 02 — Regras de Negócio](docs/02-regras-negocio.md)
3. [Documento 03 — Mapa de Telas e Fluxos](docs/03-mapa-telas-fluxos.md)
4. [Documento 04 — Especificação Final da Importação MMS](docs/04-importacao-mms.md)
5. [Documento 05 — Estrutura Inicial do Banco de Dados](docs/05-banco-dados.md)
6. [Documento 06 — Backlog Técnico do MVP](docs/06-backlog-tecnico.md)

Para implementação, comece pelo **Documento 06 — Backlog Técnico do MVP**.

Para modelagem de banco, use o **Documento 05 — Estrutura Inicial do Banco de Dados**.

Para importação MMS, use o **Documento 04 — Especificação Final da Importação MMS**.

## Regras importantes para agentes de IA

Antes de gerar código, leia:

- `docs/02-regras-negocio.md`
- `docs/04-importacao-mms.md`
- `docs/05-banco-dados.md`
- `docs/06-backlog-tecnico.md`

### Não alterar decisões fechadas sem aviso

Decisões já fechadas:

- o Doka não substitui a MMS;
- importação MMS pode ocorrer várias vezes no mesmo posto/data;
- não haverá `file_hash` no MVP;
- registros ausentes em nova importação viram `Removido`;
- rotina acumulada mantém a mesma tarefa em aberto;
- deslocamentos ficam em tabela separada de custos extras;
- custos extras são manuais e precisam de assistência;
- ocorrência sempre precisa de assistência;
- reclamação é tipo de ocorrência;
- histórico é centralizado;
- autenticação é via Supabase Auth;
- permissões devem usar perfil + posto;
- nomes de tabelas e campos devem ser português/snake_case.

### Ordem recomendada para agentes

1. Criar migrations base.
2. Criar tabelas de usuários, postos e vínculos.
3. Configurar Supabase Auth e RLS.
4. Criar tabelas MMS.
5. Implementar importação MMS.
6. Implementar Assistências / MMS.
7. Implementar Ocorrências.
8. Implementar Tarefas e Rotinas.
9. Implementar Deslocamentos e Custos Extras.
10. Implementar Dashboard.

## Chave operacional da importação MMS

A chave principal para evitar duplicidade operacional é:

```txt
posto_id + data_atividade + numero_assistencia + parte_conjunto
```

Regras:

- mesma assistência não deve duplicar;
- partes diferentes pertencem à mesma assistência;
- nova importação atualiza registros existentes;
- registro ausente vira `Removido`;
- `raw_json` original deve ser preservado.

## Perfis de acesso

### Operador

- vê apenas postos vinculados;
- pode iniciar importação MMS;
- pode criar ocorrência;
- pode lançar custo extra;
- pode visualizar dados do cliente final no seu escopo.

### Supervisão

- vê seu escopo operacional;
- pode validar tarefas;
- pode validar custos;
- pode corrigir dados;
- pode executar soft delete.

### Direção/Administração

- acesso total;
- visão global;
- auditoria;
- cadastros e permissões.

## Definition of Done do MVP

O MVP será considerado pronto quando:

- autenticação Supabase funcionar;
- RLS bloquear acessos indevidos;
- importação MMS funcionar com arquivo real;
- assistências e partes forem criadas/atualizadas corretamente;
- registros ausentes virarem `Removido`;
- `raw_json` for preservado;
- ocorrências funcionarem;
- tarefas e rotinas funcionarem;
- rotina acumulada não duplicar tarefa;
- deslocamentos aparecerem no detalhe da assistência;
- custos extras puderem ser lançados e validados;
- dashboard básico funcionar por perfil;
- histórico registrar ações críticas.

## Próximo passo técnico

O próximo passo recomendado é iniciar pelas migrations do Supabase:

```txt
supabase/migrations/
```

Primeira entrega técnica sugerida:

1. enums/tipos;
2. tabela `usuarios`;
3. tabela `postos`;
4. tabela `usuarios_postos`;
5. tabela `historico_auditoria`;
6. policies/RLS iniciais.
