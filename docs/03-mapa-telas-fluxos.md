**Status:** Primeira versão estruturada — pendências principais respondidas e incorporadas ao documento.
**Documento:** Mapa de Telas e Fluxos de Usuário do MVP.
**Projeto:** Doka.
**Versão:** 1.0
**Data:** 11/06/2026.
**Base:** PRD do MVP v1.0 e Documento 02 — Regras de Negócio do MVP v1.0.

## 1. Objetivo do documento

Este documento define o mapa inicial de telas, menus, fluxos de navegação e ações de usuário do MVP do Doka.

Ele serve para transformar o PRD e as Regras de Negócio em uma estrutura prática para construção da interface, organização dos módulos e definição dos fluxos operacionais.

Este documento deverá orientar:

- criação dos wireframes;
- definição da navegação principal;
- organização dos menus;
- separação das telas por perfil de usuário;
- definição dos fluxos de criação, edição, validação e consulta;
- priorização das telas do MVP;
- preparação do backlog técnico por tela.

## 2. Premissas gerais de navegação

O sistema deverá ter uma navegação simples, objetiva e operacional.

Premissas:

- o usuário deverá acessar o sistema com login e perfil definido;
- o conteúdo exibido deverá respeitar o perfil do usuário;
- o conteúdo exibido também deverá respeitar os postos aos quais o usuário tem acesso;
- Operador verá apenas dados dos seus postos;
- Supervisão verá dados dos postos/equipes sob sua responsabilidade;
- Direção/Administração verá todos os dados;
- o menu principal deverá ser lateral ou superior, conforme layout final;
- o Dashboard será a primeira tela após login;
- os módulos do MVP deverão ser acessíveis a partir de menu principal;
- telas operacionais devem priorizar filtros rápidos, abas e ações diretas.

## 3. Estrutura inicial do menu principal

A estrutura inicial recomendada para o menu do MVP é:

1. Dashboard
2. Ocorrências
3. Tarefas e Rotinas
4. Assistências / MMS
5. Importações MMS
6. Custos Extras
7. Cadastros
8. Configurações
9. Histórico / Auditoria

## 3.1 Visibilidade do menu por perfil

## Operador

Menus visíveis:

- Dashboard;
- Ocorrências;
- Tarefas e Rotinas;
- Assistências / MMS;
- Importações MMS;
- Custos Extras.

Menus ocultos ou restritos:

- Cadastros;
- Configurações;
- Histórico / Auditoria geral.

## Supervisão

Menus visíveis:

- Dashboard;
- Ocorrências;
- Tarefas e Rotinas;
- Assistências / MMS;
- Importações MMS;
- Custos Extras;
- Cadastros;
- Histórico / Auditoria operacional.

Menus restritos:

- Configurações avançadas de sistema, se existirem;
- configurações globais sensíveis, caso sejam criadas futuramente.

## Direção/Administração

Menus visíveis:

- todos os menus;
- todos os cadastros;
- todas as configurações;
- histórico/auditoria completa;
- dados financeiros e custos.

## 4. Tela 01 — Login

## 4.1 Objetivo

Permitir que o usuário acesse o sistema com segurança e carregue seu perfil de acesso.

## 4.2 Elementos da tela

- campo de e-mail ou usuário;
- campo de senha;
- botão Entrar;
- opção de recuperação de senha, se aplicável;
- mensagem de erro de login;
- identificação visual do Doka.

## 4.3 Regras

- após login, o sistema deve identificar o perfil do usuário;
- após login, o sistema deve identificar os postos vinculados ao usuário;
- o usuário deve ser direcionado para o Dashboard correspondente ao seu perfil;
- usuários sem posto vinculado não devem visualizar dados operacionais até correção do cadastro.

## 5. Tela 02 — Dashboard

### 5.1 Objetivo

Apresentar uma visão rápida da operação, alertas críticos e indicadores do dia.

### 5.2 Variação por perfil

O Dashboard será diferente conforme perfil.

### Dashboard do Operador

Objetivo:

Mostrar ao operador apenas a operação relacionada aos seus postos.

Cards e blocos sugeridos:

- ocorrências de hoje;
- ocorrências abertas;
- ocorrências atrasadas;
- tarefas pendentes;
- tarefas atrasadas;
- tarefas do dia;
- assistências relacionadas aos seus postos;
- importações MMS relacionadas aos seus postos;
- custos extras lançados ou pendentes, quando aplicável;
- alertas críticos do seu escopo.

Ações rápidas:

- nova ocorrência;
- nova tarefa;
- lançar custo extra;
- consultar assistência.

### Dashboard da Supervisão

Objetivo:

Mostrar a visão do posto/equipe sob responsabilidade da supervisão.

Cards e blocos sugeridos:

- eficiência do dia;
- eficiência da semana;
- montagens previstas;
- montagens realizadas;
- frustradas;
- improdutivas;
- devoluções;
- ocorrências abertas;
- ocorrências atrasadas;
- ocorrências reaparecendo hoje;
- tarefas pendentes;
- tarefas atrasadas;
- importações MMS com erro ou alerta;
- custos extras aguardando validação;
- resumo por posto/equipe.

Ações rápidas:

- nova ocorrência;
- validar tarefas;
- importar MMS;
- tratar erros de importação;
- validar custo extra;
- consultar assistência.

### Dashboard da Direção/Administração

Objetivo:

Mostrar visão geral da operação.

Cards e blocos sugeridos:

- eficiência geral do dia;
- eficiência geral da semana;
- produtividade por posto;
- ocorrências críticas;
- ranking de postos com mais atrasos;
- tarefas atrasadas por equipe;
- importações MMS com erro ou alerta;
- custos extras por período;
- assistências com baixa indevida;
- assistências com reclamação;
- comparativo início do dia x fechamento.

Ações rápidas:

- acessar relatórios operacionais;
- consultar todos os postos;
- abrir importações;
- abrir ocorrências críticas;
- acessar cadastros;
- acessar configurações.

## 5.3 Alertas críticos exibidos no Dashboard

Alertas críticos:

- ocorrência atrasada;
- ocorrência reaparecendo hoje;
- tarefa atrasada;
- eficiência abaixo da meta;
- assistência com baixa indevida;
- assistência com reclamação;
- importação MMS com erro;
- importação MMS com alerta.

## 6. Tela 03 — Lista de Ocorrências

## 6.1 Objetivo

Permitir consulta, acompanhamento e gestão das ocorrências operacionais.

## 6.2 Abas principais

A tela de ocorrências deverá ter as seguintes abas:

- Hoje;
- Abertas;
- Atrasadas.

## Aba Hoje

Exibe:

- ocorrências com data de retorno/reaparecimento no dia atual;
- ocorrências que exigem ação no dia;
- ocorrências relevantes para acompanhamento imediato.

## Aba Abertas

Exibe:

- ocorrências abertas sem prazo;
- ocorrências com prazo futuro;
- ocorrências em acompanhamento;
- ocorrências aguardando retorno e que ainda não estão atrasadas.

## Aba Atrasadas

Exibe:

- ocorrências com prazo vencido;
- ocorrências com data de retorno vencida;
- ocorrências ainda não resolvidas ou encerradas.

## 6.3 Filtros da lista

Filtros recomendados:

- número da assistência;
- posto;
- responsável;
- tipo de ocorrência;
- status;
- prioridade;
- data de criação;
- data de retorno;
- condição: hoje, aberta ou atrasada;
- montador/recurso, quando disponível;
- cliente, quando permitido;
- texto livre.

## 6.4 Colunas da lista

Colunas recomendadas:

- número da assistência;
- tipo;
- status;
- condição;
- prioridade;
- posto;
- responsável;
- data de retorno;
- data de criação;
- última atualização;
- ação rápida.

## 6.5 Ações disponíveis

Ações:

- nova ocorrência;
- visualizar ocorrência;
- editar ocorrência;
- mudar status;
- reabrir ocorrência;
- encerrar ocorrência;
- excluir logicamente, conforme perfil;
- ver histórico.

## 7. Tela 04 — Nova / Editar Ocorrência

## 7.1 Objetivo

Permitir o registro ou edição de uma ocorrência vinculada a uma assistência.

## 7.2 Campos principais

Campos recomendados:

- número da assistência;
- parte do conjunto, quando aplicável;
- posto;
- tipo de ocorrência;
- prioridade;
- status;
- responsável;
- data de retorno/reaparecimento;
- descrição;
- observações;
- anexos, se aplicável futuramente;
- custo vinculado, se aplicável;
- origem da ocorrência, se necessário.

## 7.3 Regras da tela

- número da assistência será obrigatório;
- ocorrência sem assistência não será permitida no MVP;
- reclamação sempre precisa de número da assistência;
- ao informar o número da assistência, o sistema deve buscar dados da base importada da MMS;
- se a assistência existir, o sistema deve preencher informações disponíveis;
- se a assistência não existir, o sistema deve alertar o usuário;
- usuário poderá salvar a ocorrência conforme permissão do perfil;
- alterações devem gerar histórico.

## 7.4 Ações da tela

Ações:

- salvar;
- cancelar;
- alterar status;
- marcar como resolvida;
- encerrar;
- reabrir;
- excluir logicamente, conforme perfil;
- visualizar assistência vinculada;
- visualizar histórico.

## 8. Tela 05 — Detalhe da Ocorrência

## 8.1 Objetivo

Exibir todos os dados da ocorrência e seu histórico operacional.

## 8.2 Blocos da tela

Blocos recomendados:

- dados principais;
- assistência vinculada;
- status e condição;
- responsável;
- descrição e observações;
- histórico de alterações;
- custos vinculados;
- tarefas relacionadas, se aplicável futuramente.

## 8.3 Ações disponíveis

Ações:

- editar;
- alterar status;
- reabrir;
- encerrar;
- lançar custo extra vinculado;
- abrir assistência;
- visualizar histórico completo.

## 9. Tela 06 — Tarefas e Rotinas

## 9.1 Objetivo

Permitir o acompanhamento de tarefas avulsas, rotinas recorrentes e estratégias operacionais.

## 9.2 Visualizações e abas sugeridas

A tela de Tarefas e Rotinas deverá permitir três tipos de visualização no MVP:

- Lista simples;
- Kanban;
- Calendário.

Além das visualizações, a tela deverá manter abas ou filtros principais:

- Hoje;
- Pendentes;
- Atrasadas;
- Concluídas;
- Rotinas;
- Validação.

## Aba Hoje

Exibe:

- tarefas do dia;
- rotinas geradas para o dia;
- tarefas acumuladas de dias anteriores que ainda precisam ser feitas.

## Aba Pendentes

Exibe:

- tarefas ainda não concluídas;
- tarefas em andamento.

## Aba Atrasadas

Exibe:

- tarefas com prazo ou horário limite vencido;
- rotinas acumuladas não concluídas.

## Aba Concluídas

Exibe:

- tarefas concluídas;
- tarefas validadas;
- histórico recente.

## Aba Rotinas

Exibe:

- cadastro das rotinas recorrentes;
- recorrência;
- responsáveis;
- posto;
- status da rotina.

## Aba Validação

Exibe:

- tarefas concluídas que exigem validação da supervisão;
- tarefas aguardando validação.

## 9.3 Regras das visualizações

Lista simples:

- deve ser a visualização mais direta para acompanhamento operacional;
- deve permitir filtros rápidos, ordenação por prazo e ações em lote quando aplicável.

Kanban:

- deve organizar tarefas por status ou condição operacional;
- colunas sugeridas: Pendente, Em andamento, Concluída, Validada e Reaberta;
- tarefas atrasadas devem ser destacadas visualmente, mas Atrasada não será status.

Calendário:

- deve exibir tarefas e rotinas por data de vencimento, data prevista ou data de recorrência;
- deve ajudar a visualizar tarefas do dia, da semana e rotinas futuras.

## 9.4 Filtros

Filtros recomendados:

- responsável;
- posto;
- cargo/função;
- status;
- condição: atrasada ou no prazo;
- prioridade;
- data;
- tipo: tarefa avulsa, rotina ou estratégia;
- exige validação.

## 9.5 Ações disponíveis

Ações:

- criar tarefa;
- criar rotina;
- editar tarefa;
- concluir tarefa;
- validar tarefa;
- reabrir tarefa;
- visualizar histórico;
- excluir logicamente, conforme perfil.

## 10. Tela 07 — Nova / Editar Tarefa

## 10.1 Objetivo

Permitir criação ou edição de tarefa avulsa.

## 10.2 Campos principais

Campos recomendados:

- título;
- descrição;
- tipo;
- responsável;
- posto;
- cargo/função;
- prioridade;
- data de vencimento;
- horário limite;
- exige validação;
- status;
- observações.

## 10.3 Regras

- tarefa pode ter um responsável ou múltiplos responsáveis, conforme necessidade;
- tarefa simples pode ser concluída sem validação;
- se a tarefa exigir validação, a conclusão pelo responsável não encerra o fluxo;
- tarefas atrasadas devem ser calculadas automaticamente;
- alterações devem gerar histórico.

## 11. Tela 08 — Nova / Editar Rotina Recorrente

## 11.1 Objetivo

Permitir o cadastro de rotinas que geram tarefas automaticamente conforme recorrência.

## 11.2 Campos principais

Campos recomendados:

- nome da rotina;
- descrição;
- recorrência;
- dias da semana, quando aplicável;
- dia do mês, quando aplicável;
- horário limite;
- responsáveis;
- posto;
- cargo/função;
- prioridade;
- exige validação;
- status da rotina;
- data de início;
- data de fim, se houver.

## 11.3 Regras

- rotinas recorrentes serão geradas automaticamente conforme recorrência;
- rotina pode ter múltiplos responsáveis;
- rotina não concluída acumula para o próximo dia;
- rotina acumulada permanece visível até ser concluída ou tratada;
- alterações em rotina devem afetar gerações futuras;
- histórico de execuções deve ser preservado.

## 12. Tela 09 — Assistências / MMS

## 12.1 Objetivo

Permitir consulta das assistências importadas da MMS e seus detalhes operacionais.

## 12.2 Lista de assistências

Filtros recomendados:

- número da assistência;
- posto;
- data;
- status da atividade;
- tipo de atividade;
- recurso/montador;
- cliente;
- mercadoria;
- condição: com ocorrência, com reclamação, baixa indevida, improdutiva, devolução;
- importação/lote;
- texto livre.

Colunas recomendadas:

- número da assistência;
- posto;
- data;
- cliente;
- tipo de atividade;
- status da atividade;
- recurso/montador;
- partes do conjunto;
- ocorrências vinculadas;
- custo/deslocamento;
- lote de importação;
- última atualização.

## 12.3 Ações disponíveis

Ações:

- visualizar assistência;
- editar dados da assistência, conforme perfil;
- criar ocorrência vinculada;
- lançar custo extra;
- visualizar partes do conjunto;
- visualizar histórico;
- abrir lote de importação.

## 13. Tela 10 — Detalhe da Assistência

## 13.1 Objetivo

Exibir a visão completa de uma assistência/serviço importado da MMS.

## 13.2 Blocos da tela

Blocos recomendados:

- dados principais da assistência;
- posto;
- data;
- cliente;
- endereço e dados do cliente final;
- recurso/montador;
- status da atividade;
- tipo de atividade;
- partes do conjunto;
- itens/mercadorias;
- ocorrências vinculadas;
- custos/deslocamentos vinculados;
- histórico de importações;
- histórico de alterações manuais;
- raw_json ou dados originais, visível aos usuários com acesso à assistência dentro do seu escopo.

## 13.3 Regras sobre partes do conjunto

- o número da assistência identifica o serviço principal;
- parte do conjunto identifica uma parte do serviço;
- se houver mesmo número de assistência com partes 1/3, 2/3 e 3/3, o sistema deve exibir como um serviço com 3 partes;
- a tela deve permitir visualizar cada parte separadamente;
- a visão principal deve evitar duplicidade do serviço.

## 14. Tela 11 — Importações MMS

## 14.1 Objetivo

Permitir acompanhar os lotes de importação da MMS.

## 14.2 Lista de importações

Filtros recomendados:

- data da importação;
- data da operação;
- posto;
- usuário importador;
- status da importação;
- arquivo de origem;
- com erro;
- com alerta.

Colunas recomendadas:

- data/hora da importação;
- data da operação;
- posto identificado;
- arquivo;
- status;
- quantidade de registros;
- registros importados;
- registros com alerta;
- registros com erro;
- usuário importador;
- ação.

## 14.3 Status de importação

Status oficiais:

- Importado;
- Importado com alertas;
- Erro;
- Cancelado.

## 14.4 Ações disponíveis

Ações:

- nova importação;
- visualizar lote;
- tratar erros;
- visualizar alertas;
- cancelar/desfazer importação, quando permitido;
- visualizar histórico.

## 15. Tela 12 — Nova Importação MMS

## 15.1 Objetivo

Permitir envio de arquivo exportado da MMS para processamento.

## 15.2 Fluxo da tela

Fluxo recomendado:

1. usuário seleciona arquivo;
2. sistema lê o arquivo;
3. sistema identifica data e posto pela planilha;
4. sistema valida campos obrigatórios;
5. sistema mostra prévia da importação;
6. sistema aponta erros e alertas;
7. usuário confirma importação ou vai para tratamento de erros;
8. sistema cria lote de importação;
9. sistema grava registros e preserva raw_json;
10. sistema exibe resultado final.

## 15.3 Elementos da tela

Elementos:

- upload de arquivo;
- identificação automática do posto pela coluna Área de Trabalho;
- identificação da data da operação;
- prévia dos registros;
- resumo de validação;
- total de registros;
- total com erro;
- total com alerta;
- botão Confirmar importação;
- botão Corrigir erros;
- botão Cancelar.

## 15.4 Regras

- importação será por posto e por dia;
- posto deve ser identificado pela coluna Área de Trabalho;
- Operador, Supervisão e Direção/Administração poderão acessar a tela de Importações MMS, respeitando seus postos e permissões;
- se houver campo obrigatório vazio, deve haver tela de tratamento;
- dados originais devem ser preservados em raw_json;
- registros existentes devem ser atualizados e gerar histórico;
- número da assistência + parte do conjunto deve ser usado para identificar partes do mesmo serviço;
- mesmo número de assistência com partes diferentes deve gerar um único serviço com múltiplas partes.

## 16. Tela 13 — Tratamento de Erros da Importação

## 16.1 Objetivo

Permitir que o usuário corrija dados corrompidos, vazios ou inconsistentes antes de concluir ou revisar a importação.

## 16.2 Elementos da tela

Elementos:

- lista de registros com erro;
- descrição do erro;
- campo com valor original;
- campo para correção;
- indicação de campo obrigatório;
- botão salvar correção;
- botão ignorar registro, se permitido;
- botão concluir tratamento;
- resumo de erros restantes.

## 16.3 Regras

- o usuário deve conseguir editar dados corrompidos;
- correções devem gerar histórico;
- o valor original deve ser preservado;
- registros corrigidos podem seguir para importação;
- lote com registros ainda problemáticos deve manter status Erro ou Importado com alertas;
- regra detalhada sobre importação parcial será fechada na especificação final de importação MMS.

## 17. Tela 14 — Custos Extras

## 17.1 Objetivo

Permitir lançamento, consulta e validação de custos extras vinculados a assistências.

## 17.2 Lista de custos extras

Filtros recomendados:

- número da assistência;
- posto;
- responsável pelo lançamento;
- status de validação;
- período;
- tipo de custo;
- valor;
- origem: manual ou MMS.

Colunas recomendadas:

- número da assistência;
- posto;
- tipo de custo;
- valor;
- origem;
- lançado por;
- data de lançamento;
- validado por;
- status de validação;
- ação.

## 17.3 Ações disponíveis

Ações:

- novo custo extra;
- editar custo;
- validar custo;
- visualizar assistência;
- visualizar histórico;
- excluir logicamente, conforme perfil.

## 18. Tela 15 — Novo / Editar Custo Extra

## 18.1 Objetivo

Permitir registro de custo extra vinculado a uma assistência.

## 18.2 Campos principais

Campos recomendados:

- número da assistência;
- posto;
- tipo de custo;
- descrição;
- valor;
- data;
- responsável pelo lançamento;
- origem;
- observações;
- status de validação.

## 18.3 Status de validação

Os custos extras terão apenas dois status no MVP:

- Pendente;
- Validado.

Não haverá status Reprovado ou Devolvido para ajuste no MVP.

## 18.4 Regras

- todo custo extra precisa de assistência;
- todos os perfis podem lançar custo extra;
- apenas Supervisão e Direção/Administração podem validar custo extra;
- custos entram inicialmente apenas para consulta;
- custos não alimentarão indicadores financeiros avançados no MVP;
- alterações devem gerar histórico.

## 18.5 Responsividade

A interface não precisa ser otimizada para celular no primeiro ciclo do MVP. O foco inicial será uso em desktop/notebook.

## 19. Tela 16 — Cadastros

## 19.1 Objetivo

Permitir manutenção dos cadastros base do sistema.

## 19.2 Cadastros previstos

Cadastros iniciais:

- usuários;
- postos;
- cargos/funções;
- responsáveis;
- tipos de ocorrência;
- prioridades;
- status operacionais;
- metas de eficiência;
- parâmetros simples;
- recorrências de rotinas, se necessário.

## 19.3 Permissões

- Operador não acessa cadastros base;
- Supervisão pode criar e editar cadastros base;
- Direção/Administração pode criar, editar, desativar e gerenciar todos os cadastros.

## 20. Tela 17 — Usuários e Permissões

## 20.1 Objetivo

Permitir cadastro e gerenciamento dos usuários do sistema.

## 20.2 Campos principais

Campos recomendados:

- nome;
- e-mail/login;
- perfil;
- postos vinculados;
- status do usuário;
- cargo/função;
- observações.

## 20.3 Regras

- usuário pode estar vinculado a um ou mais postos;
- perfil define permissões gerais;
- posto define escopo operacional;
- Direção/Administração gerencia todos os usuários;
- Supervisão pode gerenciar cadastros conforme regra definida no MVP.

## 21. Tela 18 — Histórico / Auditoria

## 21.1 Objetivo

Permitir consulta de alterações relevantes do sistema.

## 21.2 Eventos que devem aparecer

Eventos:

- criação de ocorrência;
- edição de ocorrência;
- mudança de status;
- reabertura;
- encerramento;
- criação de tarefa;
- conclusão de tarefa;
- validação de tarefa;
- reabertura de tarefa;
- edição de assistência importada;
- atualização por nova importação;
- lançamento de custo extra;
- validação de custo extra;
- exclusão lógica;
- cancelamento de importação;
- correção de erro de importação.

## 21.3 Filtros

Filtros recomendados:

- usuário;
- tipo de ação;
- módulo;
- data;
- assistência;
- ocorrência;
- tarefa;
- importação;
- posto.

## 21.4 Permissões

- Operador pode ver histórico dos registros do seu escopo quando estiver dentro do próprio registro;
- Supervisão pode ver histórico operacional do seu escopo;
- Direção/Administração pode ver histórico completo.

## 22. Fluxo 01 — Criar ocorrência

Passo a passo:

1. usuário acessa Ocorrências;
2. clica em Nova ocorrência;
3. informa número da assistência;
4. sistema consulta base MMS importada;
5. sistema retorna dados da assistência, se encontrada;
6. usuário seleciona tipo de ocorrência;
7. define prioridade, responsável, status e data de retorno;
8. preenche descrição e observações;
9. salva a ocorrência;
10. sistema registra histórico;
11. ocorrência aparece na aba correspondente.

Condição especial:

- se a assistência não for encontrada, o sistema deve alertar o usuário e impedir ou tratar conforme regra futura.

## 23. Fluxo 02 — Acompanhar ocorrência

Passo a passo:

1. usuário acessa Ocorrências;
2. escolhe aba Hoje, Abertas ou Atrasadas;
3. aplica filtros, se necessário;
4. abre a ocorrência;
5. atualiza status, responsável, prazo ou observações;
6. salva alteração;
7. sistema registra histórico;
8. ocorrência muda de aba automaticamente conforme prazo/status.

## 24. Fluxo 03 — Resolver, encerrar ou reabrir ocorrência

Resolver:

1. usuário abre ocorrência;
2. altera status para Resolvida;
3. registra observação, se necessário;
4. sistema mantém ocorrência em histórico e acompanhamento.

Encerrar:

1. usuário abre ocorrência resolvida ou tratada;
2. altera status para Encerrada;
3. sistema registra histórico;
4. ocorrência deixa de aparecer nas listas operacionais principais, salvo filtros de encerradas.

Reabrir:

1. usuário abre ocorrência encerrada ou resolvida;
2. clica em Reabrir;
3. sistema altera status para Reaberta;
4. usuário informa motivo, se necessário;
5. sistema registra histórico;
6. ocorrência volta para acompanhamento.

## 25. Fluxo 04 — Criar tarefa avulsa

Passo a passo:

1. usuário acessa Tarefas e Rotinas;
2. clica em Nova tarefa;
3. informa título, descrição, responsável, posto, prazo e prioridade;
4. define se exige validação;
5. salva tarefa;
6. sistema registra histórico;
7. tarefa aparece na aba Hoje, Pendentes ou Atrasadas conforme data/prazo.

## 26. Fluxo 05 — Executar e validar tarefa

Conclusão simples:

1. responsável abre tarefa;
2. marca como Concluída;
3. sistema registra histórico;
4. se não exigir validação, tarefa fica concluída.

Conclusão com validação:

1. responsável abre tarefa;
2. marca como Concluída;
3. tarefa aparece na aba Validação da Supervisão;
4. supervisão valida ou reabre;
5. sistema registra histórico.

## 27. Fluxo 06 — Criar rotina recorrente

Passo a passo:

1. usuário acessa Tarefas e Rotinas;
2. abre aba Rotinas;
3. clica em Nova rotina;
4. define nome, recorrência, responsáveis, posto e prazo/horário;
5. define se exige validação;
6. salva rotina;
7. sistema gera tarefas automaticamente conforme recorrência;
8. tarefas não concluídas acumulam para o próximo dia.

## 28. Fluxo 07 — Importar MMS

Passo a passo:

1. usuário acessa Importações MMS;
2. clica em Nova importação;
3. envia arquivo exportado da MMS;
4. sistema lê o arquivo;
5. sistema identifica posto pela coluna Área de Trabalho;
6. sistema identifica data da operação;
7. sistema valida campos obrigatórios;
8. sistema identifica número da assistência e partes do conjunto;
9. sistema mostra prévia;
10. sistema exibe erros e alertas;
11. usuário confirma importação ou abre tratamento de erros;
12. sistema grava lote;
13. sistema atualiza registros existentes e mantém histórico;
14. sistema exibe status final da importação.

## 29. Fluxo 08 — Tratar erros da importação

Passo a passo:

1. usuário acessa lote com erro ou alerta;
2. abre tela de Tratamento de Erros;
3. visualiza registros problemáticos;
4. corrige campos corrompidos ou vazios;
5. salva correções;
6. sistema preserva valor original;
7. sistema registra histórico;
8. usuário conclui tratamento;
9. sistema atualiza status do lote.

## 30. Fluxo 09 — Desfazer importação

Passo a passo:

1. usuário abre lote de importação;
2. clica em Desfazer/Cancelar importação;
3. sistema verifica se registros foram editados manualmente;
4. sistema verifica se registros estão vinculados a ocorrências;
5. se não houver edição nem vínculo, sistema permite cancelamento;
6. sistema aplica cancelamento técnico;
7. status do lote vira Cancelado;
8. sistema registra histórico.

Bloqueio:

- se houver registro editado ou vinculado a ocorrência, o sistema não deve permitir desfazer automaticamente.

## 31. Fluxo 10 — Lançar custo extra

Passo a passo:

1. usuário acessa Custos Extras ou detalhe da assistência;
2. clica em Novo custo extra;
3. informa número da assistência;
4. sistema busca assistência;
5. usuário informa tipo de custo, valor, descrição e data;
6. salva custo;
7. sistema registra histórico;
8. custo fica disponível para consulta e validação.

## 32. Fluxo 11 — Validar custo extra

Passo a passo:

1. Supervisão ou Direção/Administração acessa Custos Extras;
2. filtra custos pendentes de validação;
3. abre custo;
4. valida o custo, se estiver correto;
5. sistema registra histórico.

## 33. Priorização das telas do MVP

## Prioridade 1 — Obrigatórias para o MVP funcionar

- Login;
- Dashboard;
- Ocorrências;
- Nova/Editar Ocorrência;
- Detalhe da Ocorrência;
- Tarefas e Rotinas;
- Nova/Editar Tarefa;
- Nova/Editar Rotina;
- Assistências / MMS;
- Detalhe da Assistência;
- Importações MMS;
- Nova Importação MMS;
- Tratamento de Erros da Importação.

## Prioridade 2 — Importantes para controle operacional

- Custos Extras;
- Novo/Editar Custo Extra;
- Validação de Custo Extra;
- Histórico/Auditoria operacional;
- Cadastros básicos.

## Prioridade 3 — Podem ser simplificadas no primeiro ciclo

- dashboard avançado da Direção/Administração;
- relatórios gerenciais;
- filtros avançados;
- auditoria completa;
- configurações avançadas.

## 34. Decisões incorporadas e pendências restantes

Decisões incorporadas nesta revisão:

- o menu será chamado de Assistências / MMS;
- o Operador poderá acessar a tela de Importações MMS, respeitando os postos vinculados ao seu usuário;
- a tela de Tarefas e Rotinas deverá ter três visualizações: lista simples, kanban e calendário;
- custos extras terão apenas os status Pendente e Validado no MVP;
- a interface não precisa ser otimizada para celular no primeiro ciclo;
- Operador poderá visualizar todos os campos da assistência dentro do seu escopo/postos.

Pendências resolvidas nesta revisão:

1. campos obrigatórios da ocorrência: assistência, tipo de ocorrência, prioridade, responsável, data de retorno, título e descrição;
2. campos obrigatórios da tarefa: título, descrição, tipo, posto, responsável ou responsáveis, prioridade, prazo e indicação se exige validação; horário limite não será obrigatório;
3. acesso e edição dos campos da assistência: Operador poderá visualizar e editar dados importados da assistência dentro dos postos do seu escopo; Supervisão e Direção/Administração poderão editar conforme seu escopo de acesso;
4. anexos gerais não entram no MVP; os únicos arquivos armazenados serão planilhas de importação MMS;
5. custo extra terá apenas os status Pendente e Validado; não haverá devolução para ajuste no MVP.

Pendências restantes para refinamento:

- não há pendências funcionais abertas nesta seção.

## 35. Próximos passos

Após validar este mapa de telas, as próximas etapas recomendadas são:

1. fechar pendências de refinamento listadas na seção 34;
2. transformar este mapa em wireframes simples;
3. criar Documento 04 — Especificação Final da Importação MMS;
4. gerar Documento 05 — Estrutura Inicial do Banco de Dados;
5. gerar backlog técnico por módulo e tela.
