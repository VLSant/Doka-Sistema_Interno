**Status:** Fechado para orientar especificação técnica, telas, banco de dados e backlog do MVP.

**Documento:** Regras de Negócio do MVP.

**Projeto:** Doka.

**Versão:** 1.0.

**Data:** 11/06/2026.

**Base:** PRD do MVP v1.0, decisões do usuário e documentos de importação MMS.

## 1. Objetivo do documento

Este documento define as regras de negócio do MVP do Doka. Ele serve para transformar o escopo funcional definido no PRD em comportamentos claros para desenvolvimento.

As regras aqui descritas devem orientar:

- criação das telas;
- modelagem do banco de dados;
- permissões de acesso;
- regras de importação MMS;
- regras de ocorrências;
- regras de tarefas e rotinas;
- regras de custos extras;
- regras do dashboard;
- regras de histórico, edição e soft delete.

## 2. Princípios gerais do MVP

O MVP do Doka deverá seguir os seguintes princípios:

- a MMS será a fonte oficial para produtividade, assistências, postos, atividades importadas e confronto planejado x executado;
- os cadastros manuais serão a fonte oficial para ocorrências, pendências, reclamações, tarefas, rotinas, estratégias, observações internas e cadastros base;
- nenhum registro deverá ser apagado definitivamente do banco;
- alterações relevantes devem manter histórico;
- alertas do MVP serão apenas visuais dentro do sistema;
- automações por WhatsApp, e-mail e integrações profundas ficam fora do MVP;
- dados importados da MMS poderão ser editados manualmente conforme permissões definidas neste documento;
- dados importados e posteriormente alterados devem manter histórico de alteração;
- o acesso dos usuários será controlado principalmente por perfil e posto.

## 3. Perfis de usuário

O Doka terá três perfis principais no MVP:

1. Operador;
2. Supervisão;
3. Direção/Administração.

## 3.1 Operador

O Operador é o usuário responsável pela alimentação e atualização operacional do sistema dentro dos postos aos quais possui acesso.

Permissões do Operador:

- pode criar ocorrências;
- pode editar ocorrências que ele mesmo criou;
- pode editar ocorrências criadas por outros usuários, desde que estejam relacionadas aos postos aos quais ele tem acesso;
- pode encerrar ou concluir ocorrências relacionadas aos seus postos;
- pode reabrir ocorrências relacionadas aos seus postos;
- pode visualizar apenas ocorrências relacionadas ao seu posto ou aos seus postos, quando tiver acesso a mais de um;
- pode concluir tarefas próprias ou atribuídas ao seu escopo;
- pode lançar custos extras vinculados a uma assistência;
- pode consultar informações operacionais dos seus postos;
- pode visualizar dashboard limitado à sua operação/postos.

Restrições do Operador:

- não deve visualizar dados de postos aos quais não possui acesso;
- não deve alterar permissões de usuários;
- não deve alterar cadastros base globais;
- não deve executar exclusão lógica de registros fora do seu escopo;
- não deve visualizar dados gerenciais fora da sua área operacional.

## 3.2 Supervisão

A Supervisão é responsável pelo acompanhamento da operação, validação de tarefas, correção de registros, revisão de ocorrências, acompanhamento de produtividade e gestão operacional dos postos/equipes.

Permissões da Supervisão:

- pode alterar qualquer ocorrência dentro do seu escopo operacional;
- pode alterar tarefas e responsáveis;
- pode validar tarefas e rotinas;
- pode reabrir tarefas e ocorrências;
- pode editar dados importados da MMS;
- pode executar exclusão lógica de registros;
- pode criar cadastros base, como tipo de ocorrência, posto e cargo;
- pode lançar custos extras;
- pode aprovar ou validar custos extras;
- pode consultar dados do posto ou da equipe sob sua responsabilidade;
- pode visualizar dashboard do posto/equipe.

## 3.3 Direção/Administração

Direção/Administração é o nível máximo de acesso do sistema. Este perfil reúne visão gerencial e administração do sistema.

Permissões da Direção/Administração:

- pode executar todas as ações disponíveis no sistema;
- pode visualizar todos os dados operacionais;
- pode visualizar todos os dados financeiros e de custos;
- pode alterar qualquer ocorrência, tarefa, assistência, importação, custo ou cadastro;
- pode editar dados importados da MMS;
- pode executar exclusão lógica;
- pode criar, editar e desativar cadastros base;
- pode cadastrar e gerenciar usuários;
- pode configurar permissões;
- pode configurar metas, parâmetros, postos, cargos e rotinas;
- pode visualizar dashboard geral da operação.

Regra confirmada:

Nenhuma ação crítica será bloqueada para Direção/Administração no MVP. Caso uma ação crítica altere registros importantes, o sistema deverá manter histórico da alteração.

## 4. Regra de acesso por posto

O posto será um dos principais filtros de acesso operacional.

Regras:

- um usuário Operador poderá estar vinculado a um ou mais postos;
- o Operador verá apenas informações relacionadas aos postos vinculados ao seu usuário;
- a Supervisão verá as informações dos postos/equipes sob sua responsabilidade;
- Direção/Administração verá todos os postos;
- ocorrências, tarefas, assistências, custos e indicadores deverão respeitar o filtro de posto quando exibidos para Operador e Supervisão.

## 5. Regras gerais de edição

Regras:

- registros operacionais poderão ser editados conforme perfil de acesso;
- dados importados da MMS poderão ser editados por Supervisão e Direção/Administração;
- Operador poderá editar registros operacionais relacionados aos seus postos;
- toda alteração relevante deverá registrar histórico;
- alterações em dados importados devem preservar o dado original em histórico ou raw_json;
- quando um registro importado for atualizado por nova importação, o sistema deve atualizar o registro existente e preservar histórico da alteração.

## 6. Regras de soft delete

Nenhum registro deverá ser apagado definitivamente no MVP.

Regras:

- exclusões devem ser feitas por soft delete;
- registros excluídos logicamente devem receber campos técnicos como deleted_at, deleted_by e, se necessário, delete_reason;
- soft delete não deve ser confundido com status operacional;
- os status Cancelado, Arquivado ou Inativo não devem ser usados como substitutos de exclusão lógica;
- Supervisão e Direção/Administração podem executar exclusão lógica;
- registros excluídos logicamente devem deixar de aparecer nas listas operacionais padrão;
- registros excluídos logicamente devem poder ser consultados em visão administrativa ou histórico, se necessário.

## 7. Regras de ocorrências

A Central de Ocorrências será usada para registrar pendências, reclamações, problemas operacionais, retornos futuros, baixas indevidas, improdutivas, devoluções e demais pontos de acompanhamento da operação.

## 7.1 Tipos iniciais de ocorrência

Os tipos iniciais serão:

- reclamação;
- baixa indevida;
- retorno futuro;
- adiantamento a baixar;

## 7.2 Status oficiais de ocorrência

Os status oficiais de ocorrência serão:

- Aberta;
- Em acompanhamento;
- Aguardando retorno;
- Resolvida;
- Encerrada;
- Reaberta.

## 7.3 Diferença entre Resolvida e Encerrada

Resolvida:

- indica que o problema foi tratado;
- pode ainda estar aguardando conferência, validação ou encerramento definitivo;
- permanece no histórico operacional.

Encerrada:

- indica que a ocorrência foi finalizada definitivamente no fluxo operacional;
- não representa exclusão lógica;
- continua registrada e consultável no histórico.

## 7.4 Status que não devem existir

O status Arquivada não deve existir como status operacional no MVP, pois arquivamento/exclusão será tratado por soft delete técnico.

## 7.5 Ocorrência vencida ou atrasada

Ocorrência vencida/atrasada não será um status fixo. Será uma condição automática calculada com base na data de retorno ou prazo.

Regra:

- se a ocorrência tiver data de retorno vencida e ainda não estiver Resolvida ou Encerrada, ela deverá aparecer automaticamente como Atrasada;
- a condição Atrasada deve ser exibida em filtros, abas e dashboard;
- o status original da ocorrência deve ser preservado.

## 7.6 Vínculo com assistência

Regras:

- uma assistência pode ter várias ocorrências;
- uma ocorrência não pode envolver mais de uma assistência;
- ocorrência sem assistência não será permitida no MVP;
- reclamação sempre precisa de número de assistência;
- ocorrências ligadas a serviço precisam obrigatoriamente estar vinculadas a uma assistência/montagem.

## 7.7 Abas de ocorrência

A tela de ocorrências deverá mostrar as ocorrências em abas:

- Hoje;
- Abertas;
- Atrasadas.

Regra da aba Hoje:

- deve exibir ocorrências com data de retorno/reaparecimento no dia atual;
- deve exibir ocorrências que precisam de ação no dia.

Regra da aba Abertas:

- deve exibir ocorrências abertas com prazo futuro;
- deve exibir ocorrências abertas sem prazo;
- deve exibir ocorrências ainda em acompanhamento ou aguardando retorno que não estejam atrasadas.

Regra da aba Atrasadas:

- deve exibir ocorrências com data de retorno/prazo vencido;
- deve exibir ocorrências que deveriam ter reaparecido ou sido tratadas e ainda não foram resolvidas ou encerradas.

## 7.8 Regras de reabertura

Regras:

- Operador pode reabrir ocorrências relacionadas aos seus postos;
- Supervisão pode reabrir ocorrências do seu escopo operacional;
- Direção/Administração pode reabrir qualquer ocorrência;
- ao reabrir uma ocorrência, o sistema deve registrar histórico da reabertura;
- uma ocorrência reaberta deve voltar para acompanhamento operacional.

## 8. Regras de tarefas, rotinas e estratégias

A Central de Rotinas, Tarefas e Estratégias será usada para transformar atividades operacionais recorrentes ou avulsas em tarefas acompanháveis.

## 8.1 Tipos de tarefa

O MVP deverá permitir:

- tarefa avulsa;
- rotina recorrente;
- estratégia operacional vinculada a uma pessoa, função ou posto.

## 8.2 Status oficiais de tarefa

Os status oficiais de tarefa serão:

- Pendente;
- Em andamento;
- Concluída;
- Validada;
- Reaberta.

Atrasada não será status fixo. Será uma condição automática calculada pelo prazo ou data limite.

## 8.3 Validação de tarefas

Regras:

- nem toda tarefa concluída precisa ser validada pela supervisão;
- tarefas simples podem ser apenas concluídas;
- algumas tarefas ou rotinas poderão exigir validação da supervisão;
- quando a tarefa exigir validação, o status Concluída indica que o responsável concluiu, mas ainda falta validação;
- quando validada pela supervisão, o status deverá mudar para Validada;
- a supervisão pode reabrir uma tarefa quando necessário.

## 8.4 Tarefas atrasadas

Regras:

- uma tarefa será considerada atrasada automaticamente quando ultrapassar seu prazo ou horário limite sem conclusão;
- Atrasada será uma condição calculada, não um status operacional;
- tarefas atrasadas devem aparecer no dashboard e nos filtros de tarefas;
- o status original da tarefa deve ser preservado.

## 8.5 Rotinas recorrentes

Regras:

- rotinas recorrentes serão geradas automaticamente de acordo com a recorrência escolhida no cadastro;
- a recorrência poderá ser diária, semanal, mensal ou outra frequência definida no cadastro;
- uma rotina pode ter múltiplos responsáveis;
- quando uma rotina não for feita no dia, ela acumula para o próximo dia;
- rotinas acumuladas devem continuar visíveis até serem concluídas ou tratadas;
- o sistema deve manter histórico das execuções de cada rotina.

## 9. Regras de assistências importadas da MMS

A assistência importada da MMS será base operacional para consulta, produtividade, ocorrências, custos e confronto planejado x executado.

## 9.1 Edição manual

Regras:

- usuários Operação poderão editar manualmente dados de assistências importadas da MMS;
- Supervisão e Direção/Administração podem editar dados importados da MMS;
- alterações manuais devem manter histórico;
- o dado original importado deve ser preservado no histórico ou no raw_json.

## 9.2 Atualização por nova importação

Se a MMS for importada novamente e a assistência já existir, o sistema deverá:

- atualizar o registro existente;
- preservar histórico das alterações;
- registrar o lote de importação responsável pela atualização;
- evitar duplicidade operacional.

## 9.3 Identificação de serviço e partes do conjunto

Regra principal:

O serviço deve ser identificado pelo Número da Assistência. Porém, uma mesma assistência pode possuir múltiplas partes do conjunto.

Exemplo:

- montagem de cozinha com número de assistência 123;
- parte do conjunto 1/3;
- parte do conjunto 2/3;
- parte do conjunto 3/3.

Nesse caso, o Doka deve gravar como apenas 1 serviço, vinculado a 1 número de assistência, contendo 3 partes de montagem.

Regras:

- Número da Assistência identifica o serviço principal;
- Parte do Conjunto identifica uma parte do serviço;
- quando houver mesmo número de assistência com partes diferentes, o sistema deve agrupar como uma única assistência/serviço com múltiplas partes;
- a duplicidade deve considerar Número da Assistência + Parte do Conjunto para evitar sobrescrever partes diferentes;
- a visão operacional principal deve tratar o conjunto como um único serviço quando fizer sentido gerencialmente;
- a visão detalhada deve permitir consultar as partes do conjunto.

## 9.4 Importação por posto e dia

Regras:

- a importação MMS será sempre por posto e por dia;
- o posto deverá ser identificado pela coluna Área de Trabalho da planilha;
- o usuário não deve precisar informar manualmente o posto se o sistema conseguir identificar pela coluna Área de Trabalho;
- o lote de importação deve registrar data, posto, usuário importador, status e arquivo de origem.

## 10. Regras de importação MMS

## 10.1 Status de importação

Os status oficiais de importação serão:

- Importado;
- Importado com alertas;
- Erro;
- Cancelado.

## 10.2 Tratamento de erros

Se a planilha vier com campo obrigatório vazio, dado corrompido ou inconsistência, o sistema não deve simplesmente descartar a informação sem ação do usuário.

Regras:

- deve existir uma tela de tratamento de erros;
- o usuário deve conseguir visualizar os registros com erro;
- o usuário deve conseguir editar dados corrompidos ou incompletos antes de concluir o tratamento;
- registros válidos podem ser importados conforme regra técnica definida na especificação de importação;
- registros inválidos devem ficar pendentes de correção ou gerar status Importado com alertas/Erro.

## 10.3 Identificação automática do posto

Regras:

- o sistema deve tentar identificar o posto pela coluna Área de Trabalho;
- se a Área de Trabalho estiver ausente, vazia ou inconsistente, a importação deve gerar alerta ou erro;
- a regra detalhada de fallback deverá ser definida na especificação final de importação MMS.

## 10.4 Desfazer importação

O sistema deve permitir desfazer uma importação apenas em condições específicas.

Regras:

- será permitido desfazer importação se os registros importados ainda não tiverem sido editados manualmente;
- será permitido desfazer importação se os registros importados ainda não estiverem vinculados a ocorrências;
- se algum registro do lote tiver sido editado ou vinculado a ocorrência, a importação não poderá ser simplesmente desfeita;
- ao desfazer uma importação, o sistema deve preservar histórico técnico do cancelamento;
- a importação desfeita deverá assumir status Cancelado.

## 11. Regras de deslocamentos e custos extras

Custos extras e deslocamentos entram no MVP apenas para controle e consulta inicial.

## 11.1 Lançamento de custo extra

Regras:

- todos os perfis podem lançar custo extra;
- todo custo extra precisa obrigatoriamente estar vinculado a uma assistência;
- o custo extra deve ter descrição, valor, responsável pelo lançamento e data;
- custos extras devem manter histórico de criação e edição.

## 11.2 Aprovação ou validação de custo extra

Regras:

- custo extra pode ser aprovado ou validado pela Supervisão;
- custo extra pode ser aprovado ou validado pela Direção/Administração;
- Operador não aprova/valida custo extra;
- custos extras importados da MMS podem ser editados manualmente conforme permissão.

## 11.3 Uso dos custos no MVP

Regras:

- custos extras entram inicialmente apenas para consulta;
- custos extras não alimentarão indicadores financeiros avançados no MVP;
- relatórios avançados de custos ficam fora do MVP;
- painel avançado de custos fica fora do MVP;
- comissão, repasse e emissão de nota fiscal ficam fora do MVP.

## 12. Regras do dashboard

O dashboard será diferente por perfil.

## 12.1 Dashboard do Operador

Regras:

- Operador verá apenas dados da sua operação;
- Operador verá apenas dados dos postos aos quais tem acesso;
- Operador verá tarefas, ocorrências, assistências e alertas relacionados ao seu escopo.

## 12.2 Dashboard da Supervisão

Regras:

- Supervisão verá dados do posto/equipe sob sua responsabilidade;
- Supervisão verá ocorrências, tarefas, assistências, produtividade e alertas do seu escopo operacional;
- Supervisão poderá acompanhar pendências críticas, atrasos e eficiência do posto/equipe.

## 12.3 Dashboard da Direção/Administração

Regras:

- Direção/Administração verá todos os dados;
- Direção/Administração verá visão geral da operação;
- Direção/Administração poderá consultar todos os postos, equipes, ocorrências, tarefas, custos, importações e indicadores.

## 12.4 Alertas críticos do MVP

Os alertas críticos do MVP serão:

- ocorrência vencida/atrasada;
- ocorrência reaparecendo hoje;
- tarefa atrasada;
- eficiência abaixo da meta;
- assistência com baixa indevida;
- assistência com reclamação;
- importação MMS com erro ou alerta.

## 13. Regras de histórico

O sistema deverá manter histórico para ações relevantes.

Eventos que devem gerar histórico:

- criação de ocorrência;
- edição de ocorrência;
- mudança de status de ocorrência;
- reabertura de ocorrência;
- encerramento de ocorrência;
- criação de tarefa;
- conclusão de tarefa;
- validação de tarefa;
- reabertura de tarefa;
- edição de assistência importada;
- atualização de assistência por nova importação;
- lançamento de custo extra;
- aprovação ou validação de custo extra;
- exclusão lógica;
- cancelamento de importação;
- correção de erro de importação.

Histórico mínimo recomendado:

- data e hora;
- usuário responsável;
- tipo de ação;
- valor anterior, quando aplicável;
- novo valor, quando aplicável;
- observação/motivo, quando necessário.

## 14. Regras fora do MVP

Ficam fora do MVP:

- automação de WhatsApp;
- automação de e-mail;
- app ou portal para montadores;
- roteirização inteligente;
- BI avançado;
- painel financeiro avançado;
- comissão automática;
- repasse automático;
- emissão de nota fiscal;
- integração automática profunda com MMS;
- integração automática com Credimóveis;
- gamificação;
- bonificação automática;
- relatórios gerenciais complexos.

## 15. Decisões fechadas neste documento

Decisões confirmadas:

- o sistema terá 3 perfis: Operador, Supervisão e Direção/Administração;
- Operador pode criar, editar, concluir e reabrir ocorrências do seu posto;
- Operador vê apenas ocorrências e dados dos postos vinculados a ele;
- Supervisão pode alterar ocorrências, tarefas, responsáveis, dados MMS, cadastros base e executar soft delete;
- Direção/Administração pode executar todas as ações;
- ocorrências terão os status Aberta, Em acompanhamento, Aguardando retorno, Resolvida, Encerrada e Reaberta;
- Arquivada não será status operacional;
- ocorrência atrasada será condição automática, não status;
- tarefas terão os status Pendente, Em andamento, Concluída, Validada e Reaberta;
- tarefa atrasada será condição automática, não status;
- rotinas recorrentes serão geradas automaticamente conforme recorrência;
- rotina não concluída acumula para o próximo dia;
- custo extra pode ser lançado por todos, mas validado apenas por Supervisão ou Direção/Administração;
- custo extra precisa de assistência;
- custos entram inicialmente apenas para consulta;
- importação MMS terá status Importado, Importado com alertas, Erro e Cancelado;
- importação poderá ser desfeita apenas se não tiver registros editados ou vinculados a ocorrências;
- dashboard será diferente por perfil;
- alertas críticos estão definidos na seção 12.4.
