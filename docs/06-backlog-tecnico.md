**Status:** Documento final de planejamento — pronto para orientar a execução técnica do MVP.

**Documento:** Backlog Técnico do MVP.

**Projeto:** Doka.

**Versão:** 1.0.

**Data:** 12/06/2026.

**Base:** Documento 01 — PRD do MVP, Documento 02 — Regras de Negócio, Documento 03 — Mapa de Telas e Fluxos, Documento 04 — Especificação Final da Importação MMS, Documento 05 — Estrutura Inicial do Banco de Dados.

## 1. Objetivo deste documento

Este documento transforma toda a documentação funcional e técnica do Doka em um backlog executável.

Ele deve servir como guia para:

- criar o banco no Supabase;
- criar migrations SQL;
- configurar autenticação;
- configurar permissões e RLS;
- construir telas;
- construir a importação MMS;
- construir ocorrências, tarefas, rotinas, custos, deslocamentos e dashboard;
- organizar o desenvolvimento por fases;
- separar o que é MVP do que fica para fase futura;
- orientar testes, critérios de aceite e validação final.

## 2. Premissas fechadas do MVP

Premissas já confirmadas:

- Doka será uma plataforma interna de controle operacional e gerencial;
- Doka não substitui a MMS;
- Doka importa arquivos/planilhas da MMS ao longo do dia como espelho operacional;
- banco será Supabase/PostgreSQL;
- autenticação será via Supabase Auth;
- tabelas e campos seguirão português/snake_case;
- histórico será centralizado em historico_auditoria;
- usuário poderá estar vinculado a um ou mais postos;
- Operador poderá iniciar importação MMS;
- Operador poderá ver todos os campos da assistência dentro do seu escopo/postos;
- interface mobile não é obrigatória no primeiro ciclo;
- anexos do MVP serão apenas os arquivos de importação;
- file_hash não será usado no MVP;
- importação controla duplicidade por lote, histórico e chave operacional;
- chave operacional: Posto + Data + Número da Assistência + Parte do Conjunto;
- registros que desaparecerem em nova importação do mesmo posto/data mudam para status Removido;
- equivalência automática de nomes de postos fica para fase futura.

## 3. Perfis do sistema

## 3.1 Operador

Pode:

- acessar dashboard do seu escopo;
- visualizar dados dos postos vinculados;
- iniciar importação MMS dos seus postos;
- visualizar assistências dos seus postos;
- visualizar todos os campos da assistência dos seus postos;
- criar ocorrência vinculada a uma assistência;
- acompanhar ocorrências dos seus postos;
- concluir/reabrir ocorrências conforme regra operacional;
- lançar custos extras;
- visualizar tarefas e rotinas atribuídas ou do seu posto;
- concluir tarefas simples.

Não pode:

- alterar cadastros globais;
- alterar permissões;
- visualizar postos não vinculados;
- validar custos extras;
- executar ações críticas globais.

## 3.2 Supervisão

Pode:

- acessar dados dos postos/equipes sob responsabilidade;
- importar e tratar importações MMS;
- corrigir registros importados;
- alterar ocorrências, responsáveis e status;
- validar tarefas;
- validar custos extras;
- criar cadastros base;
- executar soft delete;
- consultar histórico operacional.

## 3.3 Direção/Administração

Pode:

- acesso total;
- visualizar todos os postos;
- visualizar todos os dashboards;
- editar dados críticos;
- configurar cadastros globais;
- consultar histórico completo;
- auditar importações;
- ajustar permissões.

## 4. Priorização do backlog

Classificação usada neste documento:

- P0 — indispensável para o MVP funcionar;
- P1 — importante para operação diária;
- P2 — melhora controle e rastreabilidade;
- P3 — fase futura, fora do MVP.

## 5. Ordem recomendada de desenvolvimento

Ordem ideal:

1. Setup do projeto e Supabase;
2. Banco de dados e migrations;
3. Autenticação e permissões;
4. Cadastros base;
5. Importação MMS;
6. Assistências / MMS;
7. Ocorrências;
8. Tarefas e rotinas;
9. Deslocamentos e custos extras;
10. Dashboard;
11. Histórico, auditoria e soft delete;
12. Testes, ajustes e homologação.

## 6. Sprint/Fase 0 — Preparação técnica

Objetivo: deixar o ambiente pronto para construir.

### DOKA-001 — Criar projeto Supabase

Prioridade: P0.

Tarefas:

- criar projeto Supabase;
- definir região;
- configurar variáveis de ambiente;
- configurar conexão com frontend/backend;
- definir ambiente de desenvolvimento e produção, se aplicável.

Critérios de aceite:

- projeto Supabase criado;
- conexão testada;
- credenciais salvas com segurança;
- ambiente pronto para migrations.

### DOKA-002 — Definir padrão de migrations SQL

Prioridade: P0.

Tarefas:

- definir estrutura de pastas de migrations;
- criar padrão de nomenclatura;
- separar migrations por módulo;
- documentar ordem de execução.

Critérios de aceite:

- migrations versionadas;
- ordem de criação definida;
- fácil recriar banco do zero.

### DOKA-003 — Criar tipos/enums iniciais

Prioridade: P0.

Tipos necessários:

- perfil_usuario: operador, supervisao, direcao_admin;
- status_importacao: importado, importado_com_alertas, erro, cancelado;
- status_linha_importacao: lida, importada, importada_com_alerta, erro, corrigida, ignorada, cancelada;
- status_atividade_mms: pendente, iniciado, concluido, nao_concluido, cancelado;
- status_interno_assistencia: ativo, removido;
- status_ocorrencia: aberta, em_acompanhamento, aguardando_retorno, resolvida, encerrada, reaberta;
- status_tarefa: pendente, em_andamento, concluida, validada, reaberta;
- status_validacao: pendente, validado;
- origem_registro: mms, manual;
- tipo_tarefa: avulsa, rotina, estrategia.

Critérios de aceite:

- tipos criados no banco;
- campos críticos usando valores padronizados;
- valores compatíveis com documentos anteriores.

## 7. Sprint/Fase 1 — Banco de dados principal

Objetivo: criar as tabelas base do sistema.

### DOKA-004 — Criar tabela usuarios

Prioridade: P0.

Campos principais:

- id;
- auth_user_id;
- nome;
- email;
- perfil;
- cargo_funcao_id;
- ativo;
- ultimo_login_em;
- created_at;
- updated_at;
- deleted_at;
- deleted_by;
- delete_reason.

Regras:

- auth_user_id referencia auth.users.id;
- não guardar senha;
- perfil define permissões principais;
- usuário pode se vincular a múltiplos postos.

Critérios de aceite:

- usuário autenticado no Supabase possui perfil operacional no Doka;
- perfil pode ser operador, supervisao ou direcao_admin;
- usuário inativo não acessa operação.

### DOKA-005 — Criar tabela postos

Prioridade: P0.

Campos principais:

- id;
- nome;
- codigo;
- descricao;
- ativo;
- created_at;
- updated_at;
- deleted_at.

Critérios de aceite:

- posto pode ser cadastrado;
- posto pode ser ativado/inativado;
- posto é usado como filtro operacional.

### DOKA-006 — Criar tabela usuarios_postos

Prioridade: P0.

Campos principais:

- id;
- usuario_id;
- posto_id;
- nivel_acesso;
- created_at;
- deleted_at.

Regras:

- um usuário pode estar em vários postos;
- um posto pode ter vários usuários;
- não permitir duplicidade ativa de usuario_id + posto_id;
- Operador vê apenas postos vinculados;
- Direção/Administração vê todos.

Critérios de aceite:

- vínculo usuário/posto funcional;
- filtros por posto respeitam o vínculo;
- usuários sem posto não veem operação, salvo Direção/Administração.

### DOKA-007 — Criar tabelas de cadastros base

Prioridade: P0.

Tabelas:

- cargos_funcoes;
- prioridades;
- tipos_ocorrencia;
- metas_eficiencia.

Critérios de aceite:

- cadastros podem ser usados em tarefas, ocorrências e dashboard;
- cadastros possuem ativo/inativo;
- soft delete aplicado quando necessário.

### DOKA-008 — Criar tabela historico_auditoria

Prioridade: P0.

Campos principais:

- id;
- entidade_tipo;
- entidade_id;
- acao;
- valor_anterior;
- valor_novo;
- metadata;
- usuario_id;
- lote_importacao_id;
- created_at.

Regras:

- histórico será centralizado;
- entidade_tipo diferencia ocorrencia, tarefa, rotina, assistencia, importacao, custo, deslocamento etc.;
- metadata guarda contexto adicional;
- histórico não deve ser apagado.

Critérios de aceite:

- toda alteração crítica gera registro;
- importações geram histórico;
- mudanças de status geram histórico;
- soft delete gera histórico.

## 8. Sprint/Fase 2 — Segurança, autenticação e RLS

Objetivo: garantir que cada perfil veja apenas o que pode ver.

### DOKA-009 — Configurar Supabase Auth

Prioridade: P0.

Tarefas:

- habilitar login por e-mail/senha;
- criar fluxo de primeiro acesso;
- vincular auth.users à tabela usuarios;
- criar trigger ou rotina para criação de perfil operacional.

Critérios de aceite:

- usuário consegue logar;
- usuário autenticado encontra seu registro em usuarios;
- usuário sem perfil operacional não acessa área interna.

### DOKA-010 — Criar policies/RLS por perfil

Prioridade: P0.

Regras mínimas:

- Operador acessa apenas registros de postos vinculados;
- Supervisão acessa postos sob responsabilidade;
- Direção/Administração acessa todos;
- registros soft deleted não aparecem em consultas padrão.

Tabelas com RLS prioritário:

- usuarios;
- usuarios_postos;
- postos;
- mms_assistencias;
- mms_partes_assistencia;
- ocorrencias;
- tarefas;
- rotinas;
- custos_extras;
- deslocamentos;
- mms_lotes_importacao.

Critérios de aceite:

- Operador não acessa posto não vinculado;
- Supervisão acessa apenas escopo definido;
- Direção/Administração acessa todos;
- tentativas inválidas são bloqueadas.

### DOKA-011 — Criar funções auxiliares de permissão

Prioridade: P1.

Funções sugeridas:

- usuario_atual_id();
- usuario_tem_perfil(perfil);
- usuario_tem_acesso_posto(posto_id);
- usuario_e_direcao_admin();
- usuario_e_supervisao();

Critérios de aceite:

- policies usam funções reaproveitáveis;
- regras ficam mais fáceis de manter;
- reduzir repetição nas policies.

## 9. Sprint/Fase 3 — Cadastros base

Objetivo: permitir preparar o sistema para operação.

### DOKA-012 — Tela de usuários

Prioridade: P1.

Funcionalidades:

- listar usuários;
- cadastrar/editar perfil operacional;
- vincular usuário ao auth_user_id;
- selecionar perfil;
- ativar/inativar usuário;
- vincular cargos/funções.

Critérios de aceite:

- Direção/Administração gerencia usuários;
- Supervisão pode consultar usuários do seu escopo, se permitido;
- Operador não acessa tela de usuários.

### DOKA-013 — Tela de postos

Prioridade: P1.

Funcionalidades:

- listar postos;
- criar posto;
- editar posto;
- ativar/inativar;
- consultar usuários vinculados.

Critérios de aceite:

- posto cadastrado aparece na importação;
- posto pode ser associado ao usuário;
- posto inativo não deve ser usado em novos registros operacionais.

### DOKA-014 — Tela de vínculo usuário/posto

Prioridade: P1.

Funcionalidades:

- vincular usuário a um ou mais postos;
- definir nível de acesso;
- remover vínculo;
- consultar postos do usuário.

Critérios de aceite:

- vínculo reflete permissões;
- Operador vê apenas seus postos;
- Supervisão pode ter múltiplos postos.

### DOKA-015 — Tela de cadastros auxiliares

Prioridade: P2.

Cadastros:

- tipos de ocorrência;
- prioridades;
- cargos/funções;
- metas de eficiência.

Critérios de aceite:

- cadastros alimentam formulários;
- itens inativos não aparecem em novas seleções;
- histórico registra alteração crítica.

## 10. Sprint/Fase 4 — Importação MMS

Objetivo: criar o núcleo técnico do MVP.

### DOKA-016 — Criar tabelas de importação MMS

Prioridade: P0.

Tabelas:

- mms_lotes_importacao;
- mms_linhas_importacao;
- mms_erros_importacao;
- mms_alertas_importacao;
- mms_mapeamento_status;
- mms_mapeamento_tipo_atividade.

Critérios de aceite:

- lote registra arquivo, usuário, data/hora, posto e status;
- linhas originais são preservadas em raw_json;
- erros e alertas ficam rastreáveis;
- mapeamentos funcionam.

### DOKA-017 — Configurar storage para arquivos importados

Prioridade: P0.

Regras:

- anexos do MVP serão apenas planilhas de importação;
- arquivos devem ficar vinculados ao lote de importação;
- tabela mms_lotes_importacao deve armazenar caminho_storage;
- não haverá anexos gerais em ocorrências/tarefas no MVP.

Critérios de aceite:

- arquivo importado fica salvo;
- lote aponta para o arquivo;
- usuário autorizado pode consultar o arquivo do lote.

### DOKA-018 — Tela Nova Importação MMS

Prioridade: P0.

Funcionalidades:

- upload de planilha;
- identificação do arquivo;
- leitura inicial;
- prévia;
- total de linhas;
- total de assistências;
- total de partes;
- total de erros;
- total de alertas;
- botão confirmar importação;
- botão corrigir erros;
- botão cancelar.

Critérios de aceite:

- Operador pode iniciar importação dos seus postos;
- Supervisão e Direção/Administração podem importar conforme permissão;
- sistema identifica Data e Área de Trabalho;
- sistema cria lote de importação;
- sistema salva o arquivo no storage.

### DOKA-019 — Parser da planilha MMS

Prioridade: P0.

Tarefas:

- ler arquivo CSV/XLSX conforme formato real;
- mapear colunas originais;
- normalizar nomes dos campos;
- preservar raw_json;
- validar campos obrigatórios;
- detectar campos não obrigatórios com problemas;
- gerar prévia.

Campos obrigatórios:

- Data;
- Área de Trabalho;
- Número da Assistência;
- Parte do Conjunto, quando existir no arquivo;
- Tipo de Atividade;
- Status da Atividade.

Critérios de aceite:

- arquivo é lido corretamente;
- linhas válidas seguem para importação;
- erros obrigatórios impedem linha/lote conforme regra;
- erro em campo não obrigatório permite importação com marcação para correção posterior.

### DOKA-020 — Normalizar Status da Atividade

Prioridade: P0.

Mapeamento:

- pendente = Serviço ainda não iniciado;
- iniciado = Serviço em execução;
- concluído = Serviço finalizado corretamente;
- não concluído = Serviço não realizado;
- cancelado = Serviço removido internamente pela empresa.

Critérios de aceite:

- valor original é preservado;
- valor normalizado é salvo;
- filtros e dashboard usam valor normalizado;
- frustrada, improdutiva e devolução não são capturadas no MVP como motivos separados.

### DOKA-021 — Normalizar Tipo de Atividade

Prioridade: P0.

Mapeamento:

- Montagem em Conjunto = Montagem;
- Desmontagem = Desmontagem;
- Assistência Técnica = Assistência;
- Inspeção Presencial = Inspeção;
- Retorno de Garantia = Retorno.

Critérios de aceite:

- valor original salvo;
- valor normalizado salvo;
- filtros usam valor normalizado;
- produtividade usa tipo normalizado.

### DOKA-022 — Processar lote e criar/atualizar assistências

Prioridade: P0.

Regras:

- agrupamento por Número da Assistência;
- partes do conjunto vinculadas à assistência;
- não duplicar assistência existente;
- atualizar registro existente quando a mesma chave operacional aparecer;
- gerar histórico para criação e atualização;
- preservar raw_json.

Chave operacional:

- posto_id;
- data_atividade;
- numero_assistencia;
- parte_conjunto.

Critérios de aceite:

- mesma assistência não duplica;
- partes diferentes não criam assistências separadas;
- importação nova atualiza dados existentes;
- alterações ficam no histórico.

### DOKA-023 — Marcar registros ausentes como Removido

Prioridade: P0.

Regras:

- quando nova importação do mesmo posto/data não trouxer registro antes existente, status_interno vira removido;
- registro não é apagado;
- histórico registra mudança;
- se registro voltar em importação futura, poderá ser reativado/atualizado.

Critérios de aceite:

- registro ausente muda para removido;
- removido não aparece como ativo nas telas padrão;
- histórico aponta o lote que marcou como removido.

### DOKA-024 — Tela de tratamento de erros da importação

Prioridade: P0.

Funcionalidades:

- listar erros por lote;
- exibir linha do arquivo;
- exibir campo com erro;
- exibir valor original;
- permitir correção;
- salvar valor corrigido;
- marcar erro como corrigido;
- manter histórico.

Critérios de aceite:

- erro obrigatório pode ser corrigido;
- erro não obrigatório pode ficar pendente para depois;
- correção não apaga valor original;
- lote pode mudar de erro para importado_com_alertas ou importado conforme estado final.

### DOKA-025 — Tela de lotes de importação

Prioridade: P1.

Funcionalidades:

- listar lotes;
- filtrar por posto;
- filtrar por data;
- filtrar por status;
- ver totais;
- abrir detalhes;
- consultar arquivo importado;
- ver erros e alertas;
- ver registros criados, atualizados e removidos.

Critérios de aceite:

- Operador vê lotes dos seus postos;
- Supervisão vê escopo sob responsabilidade;
- Direção/Administração vê todos.

### DOKA-026 — Desfazer importação permitida

Prioridade: P2.

Regras:

- pode desfazer apenas se registros não foram editados manualmente;
- pode desfazer se não existem ocorrências vinculadas;
- pode desfazer se não existem custos extras manuais vinculados;
- lote vira cancelado;
- histórico permanece.

Critérios de aceite:

- sistema bloqueia desfazer quando há dependência;
- desfazer não apaga histórico;
- registros saem da operação ativa quando permitido.

## 11. Sprint/Fase 5 — Assistências / MMS

Objetivo: permitir consultar e trabalhar com dados importados.

### DOKA-027 — Criar tela Assistências / MMS

Prioridade: P0.

Funcionalidades:

- listar assistências;
- filtrar por posto;
- filtrar por data;
- filtrar por status da atividade;
- filtrar por status interno;
- buscar por número da assistência;
- buscar por cliente;
- filtrar por tipo de atividade normalizado;
- abrir detalhe.

Critérios de aceite:

- Operador vê assistências dos seus postos;
- todos os campos da assistência ficam visíveis ao Operador dentro do seu escopo;
- registros Removidos podem ficar ocultos por padrão, mas acessíveis em filtro.

### DOKA-028 — Criar detalhe da assistência

Prioridade: P0.

Conteúdo:

- número da assistência;
- posto;
- data;
- cliente;
- endereço;
- status;
- tipo de atividade;
- recurso/montador;
- partes do conjunto;
- ocorrências vinculadas;
- deslocamentos;
- custos extras;
- histórico;
- lote de importação.

Critérios de aceite:

- assistência mostra partes do conjunto;
- usuário consegue criar ocorrência a partir da assistência;
- usuário consegue lançar custo extra;
- histórico é consultável.

### DOKA-029 — Criar componente de partes do conjunto

Prioridade: P1.

Funcionalidades:

- listar partes;
- mostrar código mercadoria;
- descrição mercadoria;
- status da atividade;
- tipo normalizado;
- recurso;
- deslocamento;
- observações relevantes.

Critérios de aceite:

- partes aparecem agrupadas na assistência;
- partes não duplicam assistência;
- dados originais ficam rastreáveis via importação.

### DOKA-030 — Permitir edição manual controlada de dados importados

Prioridade: P1.

Regras:

- Operador pode visualizar e editar dados importados da assistência dentro dos postos do seu escopo;
- Supervisão e Direção/Administração podem editar dados importados conforme seu escopo de acesso;
- toda edição gera histórico;
- raw_json original não deve ser alterado.

Critérios de aceite:

- edição gera histórico;
- valor original fica preservado;
- nova importação pode atualizar dados conforme regra.

## 12. Sprint/Fase 6 — Ocorrências

Objetivo: controlar pendências, reclamações e problemas operacionais.

### DOKA-031 — Criar tabela ocorrencias e comentários

Prioridade: P0.

Tabelas:

- ocorrencias;
- ocorrencia_comentarios.

Critérios de aceite:

- ocorrência sempre vinculada a uma assistência;
- uma assistência pode ter várias ocorrências;
- ocorrência não pode envolver mais de uma assistência;
- comentários preservam acompanhamento.

### DOKA-032 — Tela Lista de Ocorrências

Prioridade: P0.

Abas/filtros principais:

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

Critérios de aceite:

- Operador vê ocorrências dos seus postos;
- atraso é condição calculada;
- ocorrência atrasada aparece destacada.

### DOKA-033 — Tela Nova Ocorrência

Prioridade: P0.

Campos mínimos:

- assistência;
- tipo de ocorrência;
- prioridade;
- responsável;
- data de retorno;
- título;
- descrição.

Regras:

- assistência obrigatória;
- reclamação exige número de assistência;
- ocorrência criada a partir da assistência já traz assistência preenchida.

Critérios de aceite:

- não permite salvar sem assistência;
- status inicial = aberta;
- cria histórico de abertura.

### DOKA-034 — Tela Detalhe da Ocorrência

Prioridade: P0.

Conteúdo:

- dados da ocorrência;
- assistência vinculada;
- cliente;
- posto;
- status;
- comentários;
- histórico;
- ações disponíveis.

Ações:

- alterar status;
- comentar;
- alterar responsável;
- alterar data de retorno;
- resolver;
- encerrar;
- reabrir.

Critérios de aceite:

- cada mudança de status gera histórico;
- comentário fica vinculado;
- reabertura preserva histórico anterior.

### DOKA-035 — Regras de status de ocorrência

Prioridade: P0.

Status oficiais:

- aberta;
- em_acompanhamento;
- aguardando_retorno;
- resolvida;
- encerrada;
- reaberta.

Regras:

- resolvida = problema tratado aguardando conferência;
- encerrada = finalizado definitivamente;
- reaberta = voltou a exigir ação;
- atrasada é condição automática, não status.

Critérios de aceite:

- status seguem fluxo permitido;
- status inválido não é aceito;
- atrasadas aparecem por data de retorno.

### DOKA-036 — Ocorrência sugerida a partir da importação

Prioridade: P2.

Regras:

- importação pode gerar alerta de ocorrência sugerida;
- usuário decide criar ocorrência;
- ocorrência gerada deve ficar vinculada à assistência;
- alerta deve guardar referência ao lote.

Critérios de aceite:

- alerta permite criar ocorrência;
- ocorrência herda assistência;
- histórico indica origem por importação.

## 13. Sprint/Fase 7 — Tarefas, rotinas e estratégias

Objetivo: controlar atividades internas e rotinas recorrentes.

### DOKA-037 — Criar tabelas de tarefas e rotinas

Prioridade: P0.

Tabelas:

- tarefas;
- tarefa_responsaveis;
- rotinas;
- rotina_responsaveis;
- rotina_execucoes.

Critérios de aceite:

- tarefa pode ser avulsa, rotina ou estratégia;
- tarefa pode ter múltiplos responsáveis;
- rotina pode gerar tarefa recorrente;
- rotina acumulada mantém a mesma tarefa aberta.

### DOKA-038 — Tela Tarefas e Rotinas com 3 visualizações

Prioridade: P0.

Visualizações obrigatórias:

- lista simples;
- kanban;
- calendário.

Filtros:

- hoje;
- pendentes;
- atrasadas;
- concluídas;
- rotinas;
- validação;
- responsável;
- posto;
- prioridade.

Critérios de aceite:

- usuário alterna entre lista, kanban e calendário;
- dados são os mesmos, apenas muda a visão;
- atraso é condição calculada;
- tarefas atrasadas ficam destacadas.

### DOKA-039 — Tela Nova Tarefa

Prioridade: P0.

Campos:

- título;
- descrição;
- tipo;
- posto;
- responsável/responsáveis;
- prioridade;
- prazo;
- horário;
- exige validação;
- observações.

Critérios de aceite:

- tarefa salva com status pendente;
- permite múltiplos responsáveis;
- tarefa com validação exige validação posterior.

### DOKA-040 — Fluxo de conclusão e validação de tarefas

Prioridade: P0.

Regras:

- tarefa simples pode ser concluída sem validação;
- se exige validação, fica concluída aguardando validação;
- Supervisão/Direção/Administração valida;
- tarefa validada não fica pendente;
- tarefa pode ser reaberta.

Critérios de aceite:

- status seguem regra;
- validação gera histórico;
- reabertura gera histórico.

### DOKA-041 — Cadastro de rotina recorrente

Prioridade: P1.

Campos:

- nome;
- descrição;
- posto;
- responsáveis;
- recorrência;
- horário;
- prioridade;
- exige validação;
- data inicial;
- data final, opcional.

Recorrências:

- diária;
- semanal;
- mensal;
- personalizada.

Critérios de aceite:

- rotina gera tarefa conforme recorrência;
- múltiplos responsáveis permitidos;
- rotina pode ser pausada/inativada.

### DOKA-042 — Regra de rotina acumulada

Prioridade: P1.

Regra confirmada:

- rotina não concluída mantém a mesma tarefa em aberto;
- não gera nova tarefa duplicada;
- tarefa acumulada permanece visível até conclusão ou tratamento.

Critérios de aceite:

- não duplicar tarefa acumulada;
- calendário/lista/kanban mostram pendência acumulada;
- histórico mostra acúmulo.

## 14. Sprint/Fase 8 — Deslocamentos e custos extras

Objetivo: registrar custos e deslocamentos relacionados a assistências.

### DOKA-043 — Criar tabela deslocamentos

Prioridade: P0.

Regras:

- deslocamentos importados da MMS ficam em tabela separada;
- deslocamento vincula assistência e parte, quando aplicável;
- origem pode ser mms ou manual;
- futuras informações de deslocamento serão adicionadas nessa tabela.

Critérios de aceite:

- deslocamento importado é salvo;
- deslocamento aparece no detalhe da assistência;
- histórico registra edição manual.

### DOKA-044 — Criar tabela custos_extras

Prioridade: P0.

Regras:

- custos extras são manuais;
- todo custo extra precisa de assistência;
- status: pendente ou validado;
- todos podem lançar;
- Supervisão/Direção/Administração validam.

Critérios de aceite:

- não salva custo sem assistência;
- custo pendente aparece para validação;
- validação gera histórico.

### DOKA-045 — Tela Custos Extras

Prioridade: P1.

Funcionalidades:

- listar custos;
- filtrar por posto;
- filtrar por assistência;
- filtrar por status;
- filtrar por período;
- abrir detalhe;
- validar custo.

Critérios de aceite:

- Operador vê custos dos seus postos;
- Supervisão valida custos do escopo;
- Direção/Administração vê todos.

### DOKA-046 — Tela Novo Custo Extra

Prioridade: P1.

Campos:

- assistência;
- tipo de custo;
- descrição;
- valor;
- data;
- observação.

Critérios de aceite:

- assistência obrigatória;
- status inicial pendente;
- lançamento gera histórico.

## 15. Sprint/Fase 9 — Dashboard

Objetivo: criar visão geral por perfil.

### DOKA-047 — Dashboard do Operador

Prioridade: P0.

Cards:

- ocorrências abertas;
- ocorrências atrasadas;
- tarefas de hoje;
- tarefas atrasadas;
- importações recentes dos seus postos;
- assistências do dia;
- alertas dos seus postos.

Critérios de aceite:

- mostra apenas dados do escopo do Operador;
- cards clicam para listas filtradas;
- dados atualizam conforme importações.

### DOKA-048 — Dashboard da Supervisão

Prioridade: P1.

Cards:

- ocorrências abertas por posto;
- ocorrências atrasadas por responsável;
- tarefas aguardando validação;
- custos pendentes de validação;
- eficiência por posto;
- importações com erro ou alerta;
- assistências não concluídas.

Critérios de aceite:

- visão por posto/equipe;
- permite priorizar problemas;
- filtros por período e posto.

### DOKA-049 — Dashboard Direção/Administração

Prioridade: P2.

Cards:

- visão geral de todos os postos;
- eficiência global;
- ocorrências por tipo;
- tarefas por status;
- importações com erro;
- custos/deslocamentos por período;
- ranking de postos com mais pendências.

Critérios de aceite:

- Direção/Administração vê todos os dados;
- visão inicial não precisa ser BI avançado;
- foco em operação e alertas críticos.

### DOKA-050 — Criar views do dashboard

Prioridade: P0.

Views sugeridas:

- view_ocorrencias_dashboard;
- view_tarefas_dashboard;
- view_produtividade_mms;
- view_importacoes_com_alerta.

Critérios de aceite:

- dashboards não dependem de consultas pesadas no frontend;
- filtros por perfil/posto funcionam;
- views respeitam RLS quando aplicável.

## 16. Sprint/Fase 10 — Histórico, auditoria e soft delete

Objetivo: garantir rastreabilidade e segurança operacional.

### DOKA-051 — Implementar soft delete padrão

Prioridade: P0.

Tabelas principais:

- usuarios;
- postos;
- ocorrencias;
- tarefas;
- rotinas;
- custos_extras;
- deslocamentos;
- mms_assistencias;
- mms_partes_assistencia.

Critérios de aceite:

- registros não são apagados definitivamente;
- deleted_at remove da visão padrão;
- delete_reason obrigatório em exclusões críticas;
- exclusão gera histórico.

### DOKA-052 — Criar serviço/função de auditoria

Prioridade: P0.

Ações registradas:

- created;
- updated;
- status_changed;
- reopened;
- completed;
- validated;
- deleted_soft;
- imported;
- corrected;
- canceled;
- marked_removed.

Critérios de aceite:

- mudanças críticas registradas;
- usuário responsável identificado;
- valor antigo e novo preservados quando aplicável.

### DOKA-053 — Tela Histórico / Auditoria

Prioridade: P2.

Funcionalidades:

- buscar por entidade;
- filtrar por usuário;
- filtrar por período;
- filtrar por ação;
- abrir detalhe do histórico.

Critérios de aceite:

- Direção/Administração vê histórico completo;
- Supervisão vê histórico do seu escopo;
- Operador não precisa acessar histórico geral no MVP.

## 17. Sprint/Fase 11 — UX, navegação e menus

### DOKA-054 — Menu principal

Prioridade: P0.

Itens:

- Dashboard;
- Ocorrências;
- Tarefas e Rotinas;
- Assistências / MMS;
- Importações MMS;
- Custos Extras;
- Cadastros;
- Configurações;
- Histórico / Auditoria.

Regras:

- menu muda conforme perfil;
- Operador não vê Cadastros, Configurações e Histórico geral;
- Operador vê Importações MMS;
- Direção/Administração vê tudo.

Critérios de aceite:

- menu reflete perfil;
- links levam às telas corretas;
- usuário sem permissão não acessa tela por URL direta.

### DOKA-055 — Layout desktop-first

Prioridade: P1.

Regra:

- interface precisa funcionar bem em desktop/notebook;
- mobile responsivo não é obrigatório no primeiro ciclo.

Critérios de aceite:

- telas principais funcionam em resolução desktop;
- tabelas e filtros são legíveis;
- formulários são utilizáveis.

## 18. Testes e homologação

### DOKA-056 — Criar massa de teste inicial

Prioridade: P0.

Dados necessários:

- 3 a 4 postos;
- usuários de cada perfil;
- vínculos usuário/posto;
- arquivo MMS real ou amostra;
- assistências com múltiplas partes;
- ocorrências abertas/atrasadas;
- tarefas e rotinas;
- custos extras;
- deslocamentos.

Critérios de aceite:

- ambiente de teste simula operação real;
- importação pode ser testada mais de uma vez no mesmo dia/posto;
- dados permitem validar dashboard.

### DOKA-057 — Testar importação MMS completa

Prioridade: P0.

Cenários:

- importação sem erro;
- importação com erro obrigatório;
- importação com erro não obrigatório;
- reimportação do mesmo posto/dia;
- registro novo;
- registro atualizado;
- registro removido;
- assistência com múltiplas partes;
- arquivo com posto não reconhecido;
- importação com alertas.

Critérios de aceite:

- todos os cenários funcionam conforme Documento 04;
- histórico registra criação, atualização e remoção;
- raw_json preserva dados originais.

### DOKA-058 — Testar permissões por perfil

Prioridade: P0.

Cenários:

- Operador acessa apenas seus postos;
- Operador inicia importação;
- Operador não acessa cadastros globais;
- Supervisão valida custos/tarefas;
- Direção/Administração acessa todos.

Critérios de aceite:

- permissões funcionam no frontend e no banco/RLS;
- tentativa de acesso indevido é bloqueada.

### DOKA-059 — Testar ocorrências

Prioridade: P0.

Cenários:

- criar ocorrência;
- alterar status;
- marcar aguardando retorno;
- resolver;
- encerrar;
- reabrir;
- detectar atrasada;
- comentar;
- soft delete.

Critérios de aceite:

- todas as ações geram histórico;
- ocorrência sempre possui assistência;
- atraso é calculado corretamente.

### DOKA-060 — Testar tarefas e rotinas

Prioridade: P1.

Cenários:

- criar tarefa;
- atribuir múltiplos responsáveis;
- concluir tarefa simples;
- concluir tarefa com validação;
- validar tarefa;
- reabrir tarefa;
- criar rotina;
- rotina gera tarefa;
- rotina acumulada mantém mesma tarefa aberta.

Critérios de aceite:

- lista, kanban e calendário mostram dados coerentes;
- rotinas não duplicam tarefas acumuladas;
- histórico registra mudanças.

## 19. Fora do escopo do MVP

Itens fora do MVP:

- app mobile completo;
- responsividade mobile refinada;
- integração automática direta com MMS;
- WhatsApp/e-mail automático;
- portal de montadores;
- BI avançado;
- painel financeiro avançado;
- comissões;
- repasses;
- nota fiscal;
- gamificação;
- bonificação automática;
- equivalência automática de nomes de postos;
- anexos gerais por ocorrência/tarefa;
- detalhamento automático de frustrada, improdutiva e devolução como motivos separados.

## 20. Dependências críticas

Dependências para iniciar construção:

- projeto Supabase ativo;
- autenticação configurada;
- migrations iniciais criadas;
- pelo menos um arquivo real da MMS para teste;
- postos reais cadastrados;
- usuários de teste criados;
- regras de RLS validadas;
- tabela de mapeamento de status e tipo de atividade criada.

## 21. Riscos do MVP

## Risco 1 — Importação MMS variar formato

Impacto: alto.

Mitigação:

- preservar raw_json;
- parser flexível;
- tela de erros;
- não depender de file_hash;
- testar com arquivos reais de vários postos.

## Risco 2 — RLS bloquear operação indevidamente

Impacto: alto.

Mitigação:

- criar funções auxiliares;
- testar cada perfil;
- separar ambiente de teste;
- criar usuário de teste por perfil.

## Risco 3 — Duplicidade de assistência

Impacto: alto.

Mitigação:

- chave operacional clara;
- upsert por posto/data/número/parte;
- histórico de atualização;
- status Removido para ausentes.

## Risco 4 — Rotinas acumuladas duplicarem tarefas

Impacto: médio.

Mitigação:

- regra: manter mesma tarefa aberta;
- rotina_execucoes deve controlar acúmulo;
- testar recorrência antes de liberar.

## Risco 5 — Dashboard lento

Impacto: médio.

Mitigação:

- criar views;
- índices corretos;
- filtros por período;
- evitar carregar tudo no frontend.

## 22. Definition of Done geral do MVP

O MVP será considerado pronto quando:

- usuários conseguem autenticar pelo Supabase;
- perfis e postos controlam permissões;
- importação MMS funciona com arquivos reais;
- assistências e partes são criadas/atualizadas corretamente;
- registros ausentes viram Removido;
- raw_json é preservado;
- ocorrências podem ser criadas e acompanhadas;
- tarefas e rotinas funcionam em lista, kanban e calendário;
- custos extras e deslocamentos aparecem corretamente;
- dashboard mostra indicadores básicos por perfil;
- histórico registra ações críticas;
- soft delete funciona;
- Operador não acessa dados fora do escopo;
- Direção/Administração acessa visão global;
- principais cenários de teste passam.

## 23. Ordem resumida de execução técnica

Ordem recomendada:

1. Supabase e migrations base;
2. usuarios, postos e usuarios_postos;
3. RLS e autenticação;
4. cadastros base;
5. tabelas MMS;
6. parser/importação;
7. assistências e partes;
8. tela de importação;
9. tela Assistências / MMS;
10. ocorrências;
11. tarefas e rotinas;
12. deslocamentos e custos;
13. dashboard;
14. histórico/auditoria;
15. testes e homologação.

## 24. Entrega recomendada por marcos

## Marco 1 — Fundação

Inclui:

- Supabase;
- Auth;
- usuários;
- postos;
- RLS;
- cadastros base.

Resultado:

- sistema acessível com perfis e escopo por posto.

## Marco 2 — Importação MMS

Inclui:

- upload;
- leitura;
- parser;
- lotes;
- linhas;
- erros;
- alertas;
- assistências;
- partes;
- deslocamentos.

Resultado:

- Doka começa a refletir a MMS.

## Marco 3 — Operação diária

Inclui:

- Assistências / MMS;
- Ocorrências;
- Tarefas;
- Rotinas;
- Custos Extras.

Resultado:

- equipe consegue operar no Doka.

## Marco 4 — Gestão

Inclui:

- dashboard;
- histórico;
- validações;
- auditoria;
- ajustes finais.

Resultado:

- supervisão e direção conseguem acompanhar a operação.

## 25. Próximo passo após este documento

Depois deste documento, a fase de planejamento essencial está completa.

Próximo passo recomendado:

1. criar migrations SQL iniciais no Supabase;
2. criar tabelas base;
3. configurar autenticação e RLS;
4. importar uma planilha real de teste;
5. validar o fluxo MMS antes de construir todas as telas finais.

## 26. Observação final

Este backlog deve ser tratado como o mapa principal de execução do MVP.

Mudanças futuras devem ser feitas com cuidado, sempre verificando impacto em:

- banco de dados;
- permissões;
- importação MMS;
- dashboard;
- histórico;
- telas operacionais.

O objetivo do MVP é ser simples, confiável e operacional, evitando automações complexas antes da validação real do fluxo com a equipe.
