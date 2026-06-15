# Documento 03 — Mapa de Telas e Fluxos de Usuário v1.0

## Objetivo

Definir as telas principais do MVP do Doka, a navegação inicial e os fluxos operacionais por perfil.

## Menu principal

Itens previstos:

1. Dashboard
2. Ocorrências
3. Tarefas e Rotinas
4. Assistências / MMS
5. Importações MMS
6. Custos Extras
7. Cadastros
8. Configurações
9. Histórico / Auditoria

## Visibilidade por perfil

### Operador

Pode acessar:

- Dashboard;
- Ocorrências;
- Tarefas e Rotinas;
- Assistências / MMS;
- Importações MMS;
- Custos Extras.

Não deve acessar:

- Cadastros globais;
- Configurações;
- Histórico/Auditoria geral.

### Supervisão

Pode acessar:

- Dashboard;
- Ocorrências;
- Tarefas e Rotinas;
- Assistências / MMS;
- Importações MMS;
- Custos Extras;
- Cadastros;
- Histórico do seu escopo.

### Direção/Administração

Pode acessar todos os módulos.

## Tela Login

Funções:

- autenticação via Supabase Auth;
- validação de usuário ativo;
- redirecionamento conforme perfil;
- bloqueio de usuário sem perfil operacional.

## Dashboard

### Operador

Deve exibir:

- ocorrências abertas dos seus postos;
- ocorrências atrasadas;
- tarefas do dia;
- tarefas atrasadas;
- assistências dos seus postos;
- importações recentes;
- alertas críticos do seu escopo.

### Supervisão

Deve exibir:

- visão por posto;
- tarefas aguardando validação;
- custos pendentes;
- importações com erro/alerta;
- eficiência por posto;
- assistências não concluídas.

### Direção/Administração

Deve exibir:

- visão global;
- eficiência geral;
- ocorrências por tipo;
- produtividade por posto;
- custos/deslocamentos;
- alertas críticos.

## Ocorrências

### Lista

Abas:

- Hoje;
- Abertas;
- Atrasadas.

Filtros:

- posto;
- responsável;
- tipo;
- status;
- prioridade;
- número da assistência;
- cliente;
- data de retorno.

### Nova ocorrência

Campos:

- assistência;
- tipo;
- prioridade;
- responsável;
- data de retorno;
- título;
- descrição.

Regras:

- assistência obrigatória;
- status inicial = Aberta;
- reclamação precisa de número de assistência.

### Detalhe da ocorrência

Deve mostrar:

- dados da ocorrência;
- assistência vinculada;
- cliente;
- comentários;
- histórico;
- ações de status.

## Tarefas e Rotinas

Visualizações obrigatórias:

- lista simples;
- kanban;
- calendário.

Filtros:

- hoje;
- pendentes;
- atrasadas;
- concluídas;
- aguardando validação;
- responsável;
- posto;
- prioridade.

## Assistências / MMS

Tela principal para consultar dados importados da MMS.

Funcionalidades:

- listar assistências;
- filtrar por posto, data, status, tipo e cliente;
- buscar por número da assistência;
- abrir detalhe;
- criar ocorrência a partir da assistência;
- lançar custo extra;
- visualizar partes do conjunto.

## Importações MMS

### Lista de importações

Deve mostrar:

- arquivo;
- posto;
- data;
- usuário;
- status;
- total de linhas;
- erros;
- alertas;
- registros criados/atualizados/removidos.

### Nova importação

Fluxo:

1. selecionar arquivo;
2. ler arquivo;
3. identificar posto/data;
4. exibir prévia;
5. mostrar erros/alertas;
6. confirmar importação;
7. processar lote.

### Tratamento de erros

Deve permitir:

- ver linha;
- ver campo com erro;
- ver valor original;
- corrigir;
- salvar valor corrigido;
- manter histórico.

## Custos Extras

Telas:

- lista de custos;
- novo custo extra;
- validação de custo extra.

Status:

- Pendente;
- Validado.

## Fluxos principais

### Fluxo 01 — Criar ocorrência

1. Usuário acessa Assistências / MMS ou Ocorrências.
2. Seleciona assistência.
3. Informa tipo, prioridade, responsável, data de retorno e descrição.
4. Sistema cria ocorrência Aberta.
5. Sistema registra histórico.

### Fluxo 02 — Acompanhar ocorrência

1. Usuário abre lista.
2. Filtra por hoje, abertas ou atrasadas.
3. Abre detalhe.
4. Adiciona comentário ou altera status.
5. Sistema registra histórico.

### Fluxo 03 — Importar MMS

1. Usuário acessa Importações MMS.
2. Faz upload da planilha.
3. Sistema cria lote.
4. Sistema lê linhas.
5. Sistema valida campos obrigatórios.
6. Sistema cria/atualiza assistências e partes.
7. Sistema marca ausentes como Removido.
8. Sistema gera histórico.

### Fluxo 04 — Criar tarefa

1. Usuário acessa Tarefas e Rotinas.
2. Cria tarefa.
3. Define responsável e prazo.
4. Sistema salva como Pendente.

### Fluxo 05 — Rotina acumulada

1. Rotina gera tarefa.
2. Tarefa não é concluída no dia.
3. Sistema mantém a mesma tarefa aberta.
4. Tarefa permanece visível como pendente/acumulada.

## Priorização das telas

### Prioridade 1

- Login;
- Dashboard;
- Ocorrências;
- Nova/Editar Ocorrência;
- Detalhe da Ocorrência;
- Tarefas e Rotinas;
- Assistências / MMS;
- Importações MMS;
- Nova Importação MMS;
- Tratamento de Erros.

### Prioridade 2

- Custos Extras;
- Validação de Custo Extra;
- Histórico/Auditoria operacional;
- Cadastros básicos.

### Prioridade 3

- Dashboard avançado;
- Relatórios gerenciais;
- Auditoria completa;
- Configurações avançadas.
