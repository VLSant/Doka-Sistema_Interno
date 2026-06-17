**Status:** Fechado para início da etapa técnica.

**Documento:** PRD do MVP — Product Requirements Document.

**Projeto:** Doka.

**Versão:** 1.0.

**Data de fechamento:** 10/06/2026.

**Base:** Documento de brainstorm organizado, PRD v0.1, decisões consolidadas e revisão de escopo do MVP.

## 1. Contexto do projeto

O Doka será um sistema interno auxiliar para operação e gestão. Ele não substituirá os sistemas operacionais principais já utilizados pela operação, especialmente a MMS. Seu papel será centralizar controles internos que hoje ficam espalhados em planilhas, mensagens, e-mails, grupos de WhatsApp, anotações e rotinas acompanhadas manualmente pela supervisão.

O sistema deverá funcionar como uma central interna para registrar, consultar, acompanhar e medir informações críticas da operação, com foco inicial em organização, rastreabilidade e visão diária do trabalho.

## 2. Problema que o produto resolve

Atualmente, a operação depende de muitos controles paralelos. Isso gera perda de histórico, dificuldade de acompanhamento, risco de esquecimento de pendências, baixa padronização das rotinas e dificuldade para medir produtividade e eficiência de forma confiável.

As principais dores a serem resolvidas no MVP são:

- dificuldade para saber o status real da operação no dia;
- pendências e ocorrências espalhadas em conversas, e-mails e planilhas;
- dependência excessiva da memória da supervisão;
- dificuldade de rastrear reclamações por número de assistência ou montagem;
- dificuldade para acompanhar tarefas recorrentes e POPs operacionais;
- pouca visibilidade sobre atrasos, pendências e recorrências;
- dificuldade para confrontar dados internos com dados da MMS;
- baixa padronização no registro de problemas, improdutivas, devoluções e retornos futuros;
- dificuldade para gerar dados estatísticos úteis para gestão.

## 3. Objetivo do produto

Criar uma plataforma interna de controle operacional e gerencial para centralizar ocorrências, pendências, tarefas, rotinas, produtividade, eficiência e informações estatísticas da operação.

O objetivo do MVP é organizar rapidamente os controles internos essenciais, reduzir dependência de planilhas soltas e mensagens dispersas, melhorar a rastreabilidade por assistência/montagem e criar uma base confiável para evolução futura com automações, integrações e relatórios avançados.

## 4. Objetivo específico do MVP

O MVP deve entregar uma primeira versão funcional do Doka capaz de:

1. permitir o cadastro e acompanhamento de ocorrências, pendências e reclamações;
2. permitir o cadastro e acompanhamento de tarefas, rotinas e estratégias operacionais;
3. importar planilhas da MMS para alimentar dados operacionais básicos;
4. permitir consulta de assistências importadas;
5. vincular ocorrências e custos a uma assistência/montagem;
6. exibir uma visão geral da operação no dashboard;
7. registrar deslocamentos e custos extras de forma simples;
8. manter histórico e rastreabilidade das informações cadastradas.

## 5. Perfis de usuário

No MVP, o Doka trabalhará com três níveis principais de usuário: Operador, Supervisão e Direção/Administração. O nível administrativo ficará concentrado no perfil de Direção/Administração, evitando a criação de um quarto perfil separado apenas para configuração do sistema.

### 5.1 Operador

Usuário responsável por alimentar dados operacionais, cadastrar ocorrências, atualizar tarefas, registrar observações, acompanhar pendências e consultar informações do dia.

Pode:

- cadastrar ocorrências dentro do seu escopo;
- atualizar informações operacionais permitidas;
- registrar observações;
- concluir tarefas próprias;
- consultar dashboard operacional;
- acompanhar assistências relacionadas ao seu trabalho.

### 5.2 Supervisão

Usuário responsável por acompanhar a operação, validar tarefas, revisar ocorrências, corrigir classificações, reabrir itens, alterar responsáveis, acompanhar produtividade e cobrar pendências.

Pode:

- cadastrar e editar ocorrências;
- validar tarefas e rotinas;
- revisar classificações;
- alterar responsáveis;
- reabrir tarefas ou ocorrências quando necessário;
- acompanhar indicadores por pessoa, cargo, posto e período;
- visualizar pendências críticas e atrasadas.

### 5.3 Direção/Administração

Usuário com foco em visão gerencial, indicadores, relatórios, histórico, gargalos, acompanhamento geral da operação e configuração administrativa do sistema.

Este perfil reúne as permissões anteriormente separadas entre Gestão/Diretoria e Administrador.

Pode:

- visualizar indicadores e relatórios;
- acompanhar histórico;
- consultar produtividade, eficiência e ocorrências;
- analisar gargalos por posto, equipe ou período;
- cadastrar e gerenciar usuários;
- configurar permissões;
- gerenciar cadastros base;
- configurar tipos de ocorrência;
- configurar metas, parâmetros, postos, cargos e rotinas;
- realizar ajustes administrativos.

No MVP, a Direção/Administração será o nível máximo de acesso do sistema. Esse perfil poderá consultar informações gerenciais e executar configurações administrativas essenciais.

## 6. Escopo final do MVP

O MVP do Doka será composto pelos seguintes módulos:

1. Cadastros Gerais;
2. Produtividade, Eficiência e Confronto MMS;
3. Deslocamentos e Custos Extras;
4. Central de Ocorrências, Pendências e Reclamações;
5. Central de Rotinas, Tarefas e Estratégias;
6. Dashboard / Visão Geral.

A alimentação do MVP será feita por cadastro manual e importação simples de planilhas. Não haverá integração automática profunda nesta primeira versão.

### 7. Módulo 1 — Cadastros Gerais

O módulo de Cadastros Gerais será usado para manter as informações básicas necessárias ao funcionamento do sistema.

Entra no MVP:

- cadastro de usuários;
- cadastro de perfis/permissões simples;
- cadastro de postos;
- cadastro de cargos/funções;
- cadastro de responsáveis;
- cadastro de tipos de ocorrência;
- cadastro de prioridades;
- cadastro de status operacionais;
- cadastro de metas/parâmetros simples de eficiência.

Não entra no MVP:

- regras avançadas de hierarquia;
- permissões extremamente granulares por campo;
- auditoria avançada de cada alteração em tela;
- integração automática com base externa de colaboradores.

### 8. Módulo 2 — Central de Ocorrências, Pendências e Reclamações

Área oficial para registrar tudo que precisa ser lembrado, acompanhado, resolvido ou auditado.

Reclamações não serão um módulo separado no MVP. Elas serão tratadas como um tipo de ocorrência dentro da central.

Entra no MVP:

- cadastrar ocorrência vinculada a uma assistência/montagem;
- exigir vínculo com assistência para toda ocorrência do MVP;
- classificar ocorrência por tipo;
- definir responsável pelo acompanhamento;
- definir prioridade;
- definir status da ocorrência;
- definir data de retorno/reaparecimento;
- registrar descrição e observações;
- consultar histórico;
- filtrar por assistência, posto, montador, responsável, tipo, status, prioridade e data;
- exibir ocorrências abertas, vencidas e que reaparecem no dia;
- reabrir ocorrência quando necessário;
- arquivar/encerrar ocorrência sem exclusão definitiva.

Tipos iniciais de ocorrência:

- baixa indevida;
- retorno futuro;
- pendência MMS;
- reclamação;
- adiantamento a baixar;
- posição interna;
- falta de montador;
- erro operacional;
- montador abandonou montagem;
- cliente ausente;
- improdutiva;
- devolução;
- outro.

Regra confirmada:

O número da assistência/montagem será obrigatório para ocorrências ligadas a serviço executado. O número de assistência representa o número da montagem ou serviço que está sendo executado.

Não entra no MVP:

- abertura automática de ocorrência por WhatsApp;
- leitura automática de mensagens;
- geração automática de reclamação por cliente;
- workflow jurídico ou financeiro de reclamações;
- SLA avançado com notificações externas.

### 9. Módulo 3 — Central de Rotinas, Tarefas e Estratégias

Área para transformar rotinas operacionais em tarefas acompanháveis, com responsáveis, prazos, horários limite, status e validação da supervisão.

Entra no MVP:

- cadastrar tarefas avulsas;
- cadastrar rotinas recorrentes simples;
- organizar tarefas por pessoa, cargo/função e posto;
- definir prazo ou horário limite;
- marcar tarefa como concluída;
- registrar observações;
- validar execução pela supervisão;
- visualizar tarefas por dia, pessoa, posto, status e prioridade;
- acompanhar tarefas atrasadas;
- manter histórico de execução.

Regras confirmadas:

- uma rotina poderá ser vinculada a cargo/função;
- uma rotina poderá ser atribuída a uma pessoa específica;
- uma rotina poderá ser relacionada a um posto quando fizer sentido;
- a supervisão poderá validar ou reabrir a execução de uma tarefa;
- tarefas concluídas devem permanecer no histórico.

Não entra no MVP:

- automação complexa de geração de tarefas;
- distribuição inteligente de tarefas;
- alertas automáticos por WhatsApp/e-mail;
- gamificação de tarefas;
- bonificação automática por cumprimento de rotina.

### 10. Módulo 4 — Produtividade, Eficiência e Confronto MMS

Área para acompanhar produtividade, eficiência, assistências, importações da MMS e confronto entre planejado e executado.

Entra no MVP:

- importar planilha MMS;
- padronizar dados importados;
- registrar histórico de importação;
- preservar dados originais em raw_json;
- acompanhar montagens previstas;
- acompanhar montagens realizadas;
- acompanhar cancelamentos, acréscimos, frustradas, improdutivas e devoluções;
- calcular percentual de eficiência;
- comparar início do dia com fechamento;
- confrontar controle interno com dados MMS;
- permitir consulta de assistência importada;
- permitir vínculo de ocorrência ao número da assistência.

Indicadores iniciais:

- montagens previstas;
- montagens realizadas;
- cancelamentos;
- acréscimos;
- frustradas;
- improdutivas;
- devoluções;
- baixas indevidas;
- retornos futuros;
- percentual de eficiência;
- meta de eficiência;
- margem máxima de frustração permitida para manter a meta.

Fonte oficial:

A MMS será a fonte oficial para produtividade, eficiência, assistências, postos, dados operacionais importados e confronto planejado × executado.

Não entra no MVP:

- integração automática direta com MMS;
- robô de captura automática;
- roteirização inteligente;
- previsão automática de produtividade;
- conciliação financeira completa;
- fechamento decenal/faturamento completo.

### 11. Módulo 5 — Deslocamentos e Custos Extras

O módulo de Deslocamentos e Custos Extras entra no MVP de forma simples, vinculado principalmente à assistência/montagem e aos dados importados da MMS.

Entra no MVP:

- registrar custo extra vinculado à assistência;
- registrar valor de deslocamento quando disponível na planilha MMS;
- consultar custos por assistência, posto, período e responsável;
- exibir custos extras de forma operacional;
- preservar dados financeiros importados no raw_json quando não forem usados como coluna própria.

Não entra no MVP:

- painel avançado de custos;
- regras financeiras completas;
- cálculo automático de comissão;
- emissão de NF;
- repasse automático para montador;
- análise completa de margem por serviço.

### 12. Módulo 6 — Dashboard / Visão Geral

Tela inicial do sistema, com foco operacional e camada gerencial resumida.

Objetivo:

Ajudar supervisão e operadores a entenderem rapidamente como está o dia, quais tarefas estão atrasadas, quais ocorrências exigem atenção, quais assistências estão com problema, quais postos estão críticos e se a eficiência está dentro da meta.

Entra no MVP:

- eficiência do dia;
- eficiência da semana;
- montagens previstas;
- montagens executadas;
- frustradas, improdutivas e devoluções;
- ocorrências abertas;
- ocorrências vencidas;
- ocorrências que reaparecem hoje;
- tarefas pendentes;
- tarefas atrasadas;
- resumo por posto;
- alertas críticos da operação;
- comparativo início do dia × fechamento.

Não entra no MVP:

- BI avançado;
- gráficos financeiros completos;
- drill-down estatístico profundo;
- previsão automática de gargalos;
- relatórios exportáveis avançados.

## 13. Fontes de dados

### 13.1 Cadastro manual

Será fonte oficial para:

- ocorrências;
- pendências;
- reclamações;
- tarefas;
- rotinas;
- estratégias;
- observações internas;
- cadastros base.

### 13.2 Importação MMS

Será fonte oficial para:

- produtividade;
- eficiência;
- assistências;
- postos;
- montagens previstas;
- montagens realizadas;
- confronto planejado × executado;
- parte dos custos/deslocamentos quando o campo existir na planilha.

### 13.3 Credimóveis

Ficará como fonte secundária ou evolução futura, podendo virar módulo específico em fase posterior.

## 14. Regras e decisões confirmadas

- O MVP será alimentado manualmente e por importação de planilhas.
- Não haverá integração automática profunda no MVP.
- A primeira fonte oficial de dados será mista: MMS para produtividade/assistências e cadastro manual para ocorrências/tarefas/rotinas.
- O número da assistência/montagem será obrigatório para ocorrências ligadas a serviço.
- Ao digitar o número da assistência, o sistema deverá consultar a base de assistências importadas da MMS quando houver dados disponíveis.
- Ninguém deve excluir registros definitivamente no MVP.
- O sistema deve usar soft delete técnico, com campos como deleted_at, deleted_by e, se necessário, delete_reason.
- O soft delete não deve usar status como Cancelado, Arquivado ou Inativo, para não confundir com status operacional da assistência.
- Alertas no MVP serão apenas visuais dentro do sistema.
- WhatsApp e e-mail ficam para fase futura.
- Reclamações entram como tipo de ocorrência, não como módulo separado.
- Deslocamentos e custos extras entram de forma simples.
- Dados da planilha MMS ainda não transformados em coluna própria devem ser preservados em raw_json.

## 15. Fora do escopo do MVP

Os itens abaixo não devem entrar no MVP como funcionalidades completas:

- gamificação completa;
- bonificação automática;
- regras financeiras de comissão;
- emissão de NF de montadores;
- automação total de WhatsApp;
- automação total de e-mail;
- inteligência automática de roteirização;
- app ou portal para montadores;
- fechamento decenal/faturamento completo;
- painel avançado de custos;
- integração profunda com todos os sistemas externos;
- alertas automáticos complexos;
- geração completa de documentos para todos os processos;
- módulo completo de deslocamentos;
- automação completa da Credimóveis;
- BI avançado;
- permissões extremamente granulares;
- relatórios gerenciais complexos;
- conciliação financeira completa.

## 16. Resultado esperado do MVP

Ao final do MVP, a operação deverá conseguir:

- consultar o status geral do dia;
- importar a planilha MMS;
- consultar assistências importadas;
- registrar ocorrências vinculadas a assistências;
- acompanhar pendências abertas, vencidas e recorrentes;
- registrar tarefas e rotinas operacionais;
- validar tarefas pela supervisão;
- visualizar indicadores básicos de produtividade e eficiência;
- consultar histórico operacional;
- reduzir dependência de planilhas soltas e mensagens dispersas.

## 17. Observação final

Este documento não substitui a documentação técnica detalhada. Ele define o escopo funcional fechado do MVP e serve como base oficial para transformar o produto em telas, regras, banco de dados e tarefas de desenvolvimento.
