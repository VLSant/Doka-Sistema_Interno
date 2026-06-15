# Documento 06 — Backlog Técnico do MVP v1.0

## Objetivo

Transformar a documentação funcional e técnica do Doka em um backlog executável para desenvolvimento.

## Premissas fechadas

- Banco em Supabase/PostgreSQL.
- Autenticação via Supabase Auth.
- RLS por perfil e posto.
- Tabelas e campos em português/snake_case.
- Histórico centralizado em historico_auditoria.
- Operador pode iniciar importação MMS.
- Operador vê dados do cliente final dentro do seu escopo.
- Importações podem ocorrer várias vezes por posto/dia.
- Não haverá file_hash no MVP.
- Anexos do MVP são apenas planilhas de importação.

## Priorização

- P0: indispensável para o MVP funcionar.
- P1: importante para operação diária.
- P2: melhora controle e gestão.
- P3: fora do MVP ou fase futura.

## Ordem recomendada

1. Setup Supabase.
2. Banco de dados e migrations.
3. Auth e RLS.
4. Cadastros base.
5. Importação MMS.
6. Assistências / MMS.
7. Ocorrências.
8. Tarefas e Rotinas.
9. Deslocamentos e Custos Extras.
10. Dashboard.
11. Histórico e Auditoria.
12. Testes e homologação.

## Fase 0 — Preparação técnica

### DOKA-001 — Criar projeto Supabase

Prioridade: P0.

Tarefas:

- criar projeto Supabase;
- configurar variáveis de ambiente;
- configurar conexão;
- preparar ambiente de desenvolvimento.

Critérios de aceite:

- Supabase criado;
- conexão validada;
- ambiente pronto para migrations.

### DOKA-002 — Definir padrão de migrations

Prioridade: P0.

Tarefas:

- criar pasta supabase/migrations;
- definir ordem de execução;
- versionar migrations.

## Fase 1 — Banco base

### DOKA-003 — Criar enums/tipos

Prioridade: P0.

Tipos:

- perfil_usuario;
- status_importacao;
- status_linha_importacao;
- status_atividade_mms;
- status_interno_assistencia;
- status_ocorrencia;
- status_tarefa;
- status_validacao;
- origem_registro;
- tipo_tarefa.

### DOKA-004 — Criar tabela usuarios

Prioridade: P0.

Critérios:

- vinculada ao auth.users;
- armazena perfil operacional;
- controla usuário ativo/inativo.

### DOKA-005 — Criar tabela postos

Prioridade: P0.

Critérios:

- posto cadastrado;
- posto ativo/inativo;
- usado como filtro operacional.

### DOKA-006 — Criar tabela usuarios_postos

Prioridade: P0.

Critérios:

- usuário pode ter vários postos;
- posto pode ter vários usuários;
- impede duplicidade ativa.

### DOKA-007 — Criar cadastros auxiliares

Prioridade: P0.

Tabelas:

- cargos_funcoes;
- prioridades;
- tipos_ocorrencia;
- metas_eficiencia.

### DOKA-008 — Criar historico_auditoria

Prioridade: P0.

Deve registrar:

- criação;
- edição;
- mudança de status;
- importação;
- correção;
- remoção lógica;
- validação;
- reabertura.

## Fase 2 — Segurança e RLS

### DOKA-009 — Configurar Supabase Auth

Prioridade: P0.

Critérios:

- login funcionando;
- usuário autenticado encontra perfil operacional;
- usuário sem perfil não acessa operação.

### DOKA-010 — Criar policies/RLS

Prioridade: P0.

Regras:

- Operador acessa apenas postos vinculados;
- Supervisão acessa seu escopo;
- Direção/Administração acessa todos;
- soft deleted fica oculto por padrão.

### DOKA-011 — Criar funções auxiliares de permissão

Prioridade: P1.

Funções sugeridas:

- usuario_atual_id();
- usuario_tem_perfil();
- usuario_tem_acesso_posto();
- usuario_e_direcao_admin();
- usuario_e_supervisao().

## Fase 3 — Cadastros

### DOKA-012 — Tela de usuários

Prioridade: P1.

### DOKA-013 — Tela de postos

Prioridade: P1.

### DOKA-014 — Tela vínculo usuário/posto

Prioridade: P1.

### DOKA-015 — Tela cadastros auxiliares

Prioridade: P2.

## Fase 4 — Importação MMS

### DOKA-016 — Criar tabelas MMS

Prioridade: P0.

Tabelas:

- mms_lotes_importacao;
- mms_linhas_importacao;
- mms_erros_importacao;
- mms_alertas_importacao;
- mms_mapeamento_status;
- mms_mapeamento_tipo_atividade;
- mms_assistencias;
- mms_partes_assistencia.

### DOKA-017 — Configurar storage de arquivos importados

Prioridade: P0.

Critérios:

- arquivo salvo no storage;
- lote aponta para storage_path;
- arquivo consultável por usuário autorizado.

### DOKA-018 — Tela Nova Importação MMS

Prioridade: P0.

Funcionalidades:

- upload;
- leitura;
- prévia;
- erros;
- alertas;
- confirmação;
- cancelamento.

### DOKA-019 — Parser da planilha MMS

Prioridade: P0.

Deve:

- ler CSV/XLSX;
- mapear colunas;
- validar obrigatórios;
- preservar raw_json;
- gerar normalized_json;
- separar erros e alertas.

### DOKA-020 — Normalizar Status da Atividade

Prioridade: P0.

### DOKA-021 — Normalizar Tipo de Atividade

Prioridade: P0.

### DOKA-022 — Processar lote e criar/atualizar assistências

Prioridade: P0.

### DOKA-023 — Marcar ausentes como Removido

Prioridade: P0.

### DOKA-024 — Tela tratamento de erros

Prioridade: P0.

### DOKA-025 — Tela lotes de importação

Prioridade: P1.

### DOKA-026 — Desfazer importação permitida

Prioridade: P2.

## Fase 5 — Assistências / MMS

### DOKA-027 — Tela Assistências / MMS

Prioridade: P0.

### DOKA-028 — Detalhe da assistência

Prioridade: P0.

### DOKA-029 — Componente partes do conjunto

Prioridade: P1.

### DOKA-030 — Edição manual controlada de dados importados

Prioridade: P1.

## Fase 6 — Ocorrências

### DOKA-031 — Criar tabelas ocorrencias e comentarios

Prioridade: P0.

### DOKA-032 — Tela Lista de Ocorrências

Prioridade: P0.

Abas:

- Hoje;
- Abertas;
- Atrasadas.

### DOKA-033 — Tela Nova Ocorrência

Prioridade: P0.

### DOKA-034 — Tela Detalhe da Ocorrência

Prioridade: P0.

### DOKA-035 — Regras de status de ocorrência

Prioridade: P0.

### DOKA-036 — Ocorrência sugerida por importação

Prioridade: P2.

## Fase 7 — Tarefas e Rotinas

### DOKA-037 — Criar tabelas de tarefas e rotinas

Prioridade: P0.

### DOKA-038 — Tela com lista, kanban e calendário

Prioridade: P0.

### DOKA-039 — Tela Nova Tarefa

Prioridade: P0.

### DOKA-040 — Fluxo de conclusão e validação

Prioridade: P0.

### DOKA-041 — Cadastro de rotina recorrente

Prioridade: P1.

### DOKA-042 — Regra de rotina acumulada

Prioridade: P1.

Regra:

- manter mesma tarefa em aberto;
- não gerar tarefa duplicada.

## Fase 8 — Deslocamentos e Custos Extras

### DOKA-043 — Criar tabela deslocamentos

Prioridade: P0.

### DOKA-044 — Criar tabela custos_extras

Prioridade: P0.

### DOKA-045 — Tela Custos Extras

Prioridade: P1.

### DOKA-046 — Tela Novo Custo Extra

Prioridade: P1.

## Fase 9 — Dashboard

### DOKA-047 — Dashboard do Operador

Prioridade: P0.

### DOKA-048 — Dashboard da Supervisão

Prioridade: P1.

### DOKA-049 — Dashboard Direção/Administração

Prioridade: P2.

### DOKA-050 — Criar views do dashboard

Prioridade: P0.

Views:

- view_ocorrencias_dashboard;
- view_tarefas_dashboard;
- view_produtividade_mms;
- view_importacoes_com_alerta.

## Fase 10 — Histórico e Soft Delete

### DOKA-051 — Implementar soft delete padrão

Prioridade: P0.

### DOKA-052 — Criar serviço/função de auditoria

Prioridade: P0.

### DOKA-053 — Tela Histórico / Auditoria

Prioridade: P2.

## Fase 11 — UX e Menus

### DOKA-054 — Menu principal por perfil

Prioridade: P0.

### DOKA-055 — Layout desktop-first

Prioridade: P1.

## Testes

### DOKA-056 — Criar massa de teste

Prioridade: P0.

### DOKA-057 — Testar importação MMS completa

Prioridade: P0.

### DOKA-058 — Testar permissões por perfil

Prioridade: P0.

### DOKA-059 — Testar ocorrências

Prioridade: P0.

### DOKA-060 — Testar tarefas e rotinas

Prioridade: P1.

## Definition of Done do MVP

O MVP estará pronto quando:

- Auth funciona;
- RLS funciona;
- importação MMS funciona com arquivo real;
- assistências e partes são criadas/atualizadas;
- ausentes viram Removido;
- raw_json é preservado;
- ocorrências funcionam;
- tarefas e rotinas funcionam;
- deslocamentos e custos aparecem;
- dashboard mostra indicadores básicos;
- histórico registra ações críticas;
- Operador não acessa dados fora do escopo.
