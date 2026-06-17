**Status:** Versão 1.0 fechada — pronta para servir de base ao documento de banco de dados.

**Documento:** Especificação Final da Importação MMS.

**Projeto:** Doka.

**Versão:** 1.0.

**Data:** 12/06/2026.

**Base:** PRD do MVP v1.0, Regras de Negócio v1.0, Mapa de Telas v0.1, Documento de Importação de Planilhas e tabela Campos MMS — MVP.

## 1. Objetivo do documento

Este documento define como a importação de planilhas extraídas da MMS deverá funcionar no MVP do Doka.

A importação MMS será responsável por alimentar o Doka com dados operacionais de assistências, serviços, atividades, postos, partes do conjunto, produtividade, eficiência, deslocamentos e informações complementares que poderão gerar alertas ou ocorrências operacionais.

Este documento deverá orientar:

- construção da tela de importação;
- leitura do arquivo exportado da MMS;
- validação dos campos;
- tratamento de erros;
- atualização de registros existentes;
- controle de duplicidade;
- agrupamento de assistências com partes do conjunto;
- preservação dos dados originais;
- criação de histórico de importação;
- estrutura inicial das tabelas relacionadas à importação.

## 2. Contexto da importação MMS

O arquivo-base analisado no mapeamento inicial foi `Atividades-KING_PE_21_05_26.csv`.

A extração da MMS será feita diariamente por posto. Inicialmente, poderão existir de 3 a 4 postos, com possibilidade de novos postos no futuro.

A planilha da MMS representa atividades/serviços de um posto em uma data específica. Um mesmo número de assistência pode aparecer em mais de uma linha quando o serviço possuir múltiplas partes do conjunto.

## 3. Princípios da importação

A importação MMS deverá seguir os seguintes princípios:

- importar arquivos por posto e por dia;
- identificar o posto pela coluna Área de Trabalho;
- preservar todos os campos originais em raw_json;
- transformar em colunas próprias apenas os campos necessários ao MVP;
- atualizar registros existentes quando houver nova importação;
- manter histórico de alterações provocadas por nova importação;
- permitir tratamento de dados corrompidos ou incompletos;
- permitir desfazer importação apenas quando os registros ainda não foram editados ou vinculados a ocorrências;
- evitar duplicidade de assistências;
- agrupar múltiplas partes do conjunto em um único serviço/assistência quando possuírem o mesmo número de assistência.

## 4. Permissões da importação

## 4.1 Operador

O Operador poderá acessar a tela de Importações MMS, respeitando os postos vinculados ao seu usuário.

Pode:

- visualizar importações relacionadas aos seus postos;
- iniciar nova importação para seus postos;
- visualizar erros e alertas relacionados aos seus postos;
- tratar dados de importação dentro do seu escopo operacional, se autorizado;
- consultar assistências importadas dos seus postos.

Restrições:

- não pode visualizar importações de postos não vinculados;
- não pode desfazer importações fora do seu escopo;
- não pode alterar regras globais de importação.

## 4.2 Supervisão

Pode:

- acessar importações dos postos/equipes sob sua responsabilidade;
- importar arquivos MMS;
- tratar erros e alertas;
- editar dados importados;
- desfazer importação quando a regra permitir;
- consultar histórico de importação;
- validar dados corrigidos.

## 4.3 Direção/Administração

Pode:

- acessar todas as importações;
- importar arquivos de qualquer posto;
- editar dados importados;
- desfazer importações quando a regra permitir;
- consultar histórico completo;
- ajustar cadastros relacionados à importação;
- visualizar raw_json e dados técnicos.

## 5. Tela de Nova Importação MMS

A tela de Nova Importação MMS deverá permitir o envio do arquivo exportado da MMS e apresentar uma prévia antes da confirmação final.

## 5.1 Fluxo da tela

1. usuário acessa Importações MMS;
2. clica em Nova importação;
3. seleciona ou arrasta o arquivo exportado da MMS;
4. sistema lê o arquivo;
5. sistema identifica o posto pela coluna Área de Trabalho;
6. sistema identifica a data da operação pela coluna Data;
7. sistema valida campos obrigatórios;
8. sistema identifica número da assistência e parte do conjunto;
9. sistema identifica registros novos e registros já existentes;
10. sistema exibe uma prévia da importação;
11. sistema exibe erros e alertas;
12. usuário confirma a importação ou abre tela de tratamento de erros;
13. sistema cria o lote de importação;
14. sistema grava ou atualiza os registros;
15. sistema preserva raw_json;
16. sistema registra histórico;
17. sistema exibe resultado final.

## 5.2 Elementos da tela

A tela deve conter:

- campo de upload de arquivo;
- identificação do nome do arquivo;
- identificação automática do posto;
- identificação da data da operação;
- total de linhas lidas;
- total de assistências identificadas;
- total de partes do conjunto identificadas;
- total de registros novos;
- total de registros que serão atualizados;
- total de erros;
- total de alertas;
- prévia dos registros;
- botão Confirmar importação;
- botão Corrigir erros;
- botão Cancelar.

## 6. Status oficiais da importação

Os status oficiais de importação serão:

- Importado;
- Importado com alertas;
- Erro;
- Cancelado.

## 6.1 Importado

Usado quando o arquivo foi processado com sucesso e não há erros ou alertas relevantes pendentes.

## 6.2 Importado com alertas

Usado quando o arquivo foi processado, mas existem pontos que exigem atenção, como:

- campo não obrigatório vazio;
- dado incomum;
- assistência atualizada por nova importação;
- divergência não impeditiva;
- campo preservado apenas em raw_json;
- posto identificado, mas com variação de nomenclatura.

## 6.3 Erro

Usado quando o arquivo não pôde ser importado integralmente ou possui falhas impeditivas.

Exemplos:

- ausência de campo obrigatório;
- arquivo ilegível;
- formato inválido;
- coluna Área de Trabalho ausente;
- coluna Data ausente;
- coluna Número da Assistência ausente;
- impossibilidade de identificar posto;
- inconsistência grave no agrupamento dos dados.

## 6.4 Cancelado

Usado quando uma importação foi desfeita/cancelada tecnicamente.

Cancelado não representa exclusão física do histórico. O lote deve permanecer registrado.

## 7. Campos mínimos esperados da MMS

A importação deverá considerar como campos mínimos para funcionamento do MVP:

- Data;
- Área de Trabalho;
- Número da Assistência;
- Parte do Conjunto;
- Tipo de Atividade;
- Status da Atividade;
- Recurso / Montador;
- Cliente;
- Endereço ou dados de localização, quando disponíveis;
- Código da Mercadoria;
- Descrição da Mercadoria;
- Deslocamento;
- Valor a receber pelo móvel, quando disponível;
- Atendimento Crítico;
- Quantidade de Reagendamento;
- Comentários sobre o local da montagem;
- Observação de finalização da montagem;
- Defeito Identificado;
- Laudo ou Observação.

## 8. Campos obrigatórios para importação

Campos obrigatórios confirmados:

- Data;
- Área de Trabalho;
- Número da Assistência;
- Parte do Conjunto, quando existir no arquivo;
- Tipo de Atividade;
- Status da Atividade.

Decisão confirmada:

A lista acima está correta para o MVP.

Regra:

- se Data, Área de Trabalho ou Número da Assistência estiverem ausentes, o registro deverá gerar erro;
- se a coluna inteira estiver ausente, o lote poderá ficar com status Erro;
- se apenas algumas linhas estiverem com campo obrigatório vazio, o sistema deverá enviar essas linhas para tratamento de erros;
- se o erro estiver em campo não obrigatório, a importação será permitida, mas o registro/linha deverá ficar marcado para correção posterior;
- registros importados com pendência em campo não obrigatório devem aparecer com alerta ou marcação visual de correção pendente.

## 9. Identificação do posto

O posto operacional será identificado pela coluna Área de Trabalho.

Regras:

- a Área de Trabalho será usada como posto operacional da atividade;
- o sistema deve tentar relacionar o valor da coluna Área de Trabalho com o cadastro de postos do Doka;
- se o posto já existir, o sistema vincula automaticamente;
- se o posto não existir, o sistema deve gerar alerta ou solicitar cadastro/associação;
- variações de nome do mesmo posto devem ser tratadas futuramente por tabela de equivalência;
- no MVP, a associação poderá ser manual caso não haja correspondência automática.

## 10. Identificação da data da operação

A data da operação deverá ser lida preferencialmente pela coluna Data da planilha MMS.

Regras:

- todos os registros do arquivo devem ser do mesmo dia operacional;
- se o arquivo contiver mais de uma data, o sistema deverá gerar alerta;
- se a data estiver ausente em uma linha, essa linha deve ir para tratamento;
- se a coluna Data estiver ausente, o lote deve gerar erro;
- o nome do arquivo poderá ser usado futuramente como conferência auxiliar, mas a fonte principal será a coluna Data.

## 11. Identificação da assistência e do serviço

O Número da Assistência identifica o serviço principal.

A Parte do Conjunto identifica partes internas de um mesmo serviço.

Exemplo:

- Número da Assistência: 12345;
- Parte do Conjunto: 1/3;
- Parte do Conjunto: 2/3;
- Parte do Conjunto: 3/3.

Nesse cenário, o Doka deve exibir como uma única assistência/serviço com três partes vinculadas.

## 11.1 Regra de agrupamento

Regras:

- o serviço principal será agrupado pelo Número da Assistência;
- as partes serão vinculadas ao serviço pelo campo Parte do Conjunto;
- várias linhas com o mesmo Número da Assistência e partes diferentes não devem gerar várias assistências duplicadas;
- devem gerar uma assistência principal e múltiplas partes;
- a visão operacional principal deve evitar duplicidade;
- a visão detalhada deve permitir abrir cada parte do conjunto.

## 11.2 Regra de duplicidade

Para fins de importação, a chave de controle deve considerar:

- Número da Assistência;
- Parte do Conjunto;
- Data da operação;
- Posto/Área de Trabalho.

Uso prático:

- Número da Assistência identifica o serviço;
- Parte do Conjunto identifica uma parte específica;
- Data e posto ajudam a evitar colisão entre extrações diferentes;
- se a mesma chave já existir, o registro deve ser atualizado e não duplicado.

## 12. Mapeamento de Status da Atividade

Os valores de Status da Atividade vindos da MMS deverão ser normalizados no Doka da seguinte forma:

- pendente = Serviço ainda não iniciado;
- iniciado = Serviço em execução;
- concluído = Serviço finalizado corretamente;
- não concluído = Serviço não realizado;
- cancelado = Serviço removido internamente pela empresa.

Regras:

- status pendente deve indicar que o serviço ainda não começou;
- status iniciado deve indicar que o serviço está em execução;
- status concluído deve contar como serviço realizado;
- status não concluído deve indicar serviço não realizado;
- status cancelado deve indicar que o serviço foi removido internamente pela empresa;
- no MVP, frustrada, improdutiva e devolução não serão capturadas como motivos separados;
- motivos de não conclusão, como frustrada, improdutiva ou devolução, ficam para versão futura.

## 13. Mapeamento de Tipo de Atividade

Os valores de Tipo de Atividade vindos da MMS deverão aparecer no Doka com nomes normalizados.

Mapeamento confirmado:

- Montagem em Conjunto = Montagem;
- Desmontagem = Desmontagem;
- Assistência Técnica = Assistência;
- Inspeção Presencial = Inspeção;
- Retorno de Garantia = Retorno.

Regras:

- esses cinco tipos devem ser importados e exibidos no sistema;
- o Doka deverá armazenar o valor original da MMS e também o valor normalizado;
- os relatórios e filtros operacionais devem usar preferencialmente o valor normalizado;
- o raw_json deve preservar o valor original.

## 14. Atualização de registros existentes

Se a MMS for importada novamente e uma assistência/parte já existir, o sistema deve atualizar o registro existente.

Regras:

- não deve criar duplicidade operacional;
- deve comparar dados novos com dados já existentes;
- se houver alteração, deve atualizar o registro;
- deve registrar histórico da alteração;
- deve registrar qual lote gerou a atualização;
- deve preservar o valor anterior;
- deve preservar o novo valor;
- deve preservar o raw_json original e o novo raw_json ou manter referência aos lotes.

## 15. Preservação de raw_json

Todos os campos originais do arquivo MMS devem ser preservados em raw_json.

Regras:

- mesmo campos que não virarem colunas próprias devem ser salvos;
- o raw_json deve permitir auditoria futura;
- o raw_json deve permitir reprocessamento futuro;
- o raw_json deve preservar os nomes originais das colunas MMS;
- alterações manuais no Doka não devem apagar o dado original importado;
- usuários com acesso à assistência dentro do seu escopo poderão consultar os dados da assistência, incluindo raw_json quando exibido na tela de detalhe;
- Operador poderá visualizar todos os campos da assistência dos seus postos;
- edição de dados importados será permitida ao Operador dentro dos postos do seu escopo e à Supervisão/Direção/Administração conforme permissões.

## 16. Tratamento de erros

Quando houver dados corrompidos, vazios ou inconsistentes, o sistema deverá direcionar para uma tela de tratamento de erros.

## 16.1 Tipos de erro

Erros impeditivos:

- arquivo ilegível;
- formato inválido;
- ausência da coluna Data;
- ausência da coluna Área de Trabalho;
- ausência da coluna Número da Assistência;
- posto não identificado e sem possibilidade de associação;
- número de assistência vazio em registro operacional;
- data inválida;
- linha sem dados suficientes para formar assistência ou parte.

Erros tratáveis:

- campo obrigatório vazio em algumas linhas;
- parte do conjunto inconsistente;
- status da atividade vazio;
- tipo de atividade vazio;
- valor monetário em formato inválido;
- data em formato corrigível;
- posto com variação de nome.

## 16.2 Tela de tratamento de erros

A tela deve exibir:

- linha do arquivo;
- campo com erro;
- valor original;
- descrição do erro;
- campo para correção;
- sugestão de correção, quando possível;
- status da correção;
- botão Salvar correção;
- botão Concluir tratamento.

## 16.3 Regras de correção

Regras:

- o usuário deve poder corrigir dados corrompidos ou incompletos;
- a correção deve gerar histórico;
- o valor original deve ser preservado;
- o valor corrigido deve ser salvo separadamente;
- após correção, o registro pode seguir para importação;
- se ainda houver erro impeditivo em campo obrigatório, o lote não deve ser marcado como Importado;
- se houver erro apenas em campo não obrigatório, a importação pode prosseguir, mas o registro deve ficar marcado para correção posterior;
- se restarem apenas alertas não impeditivos, o lote pode ficar como Importado com alertas.

## 17. Alertas de importação

Alertas são inconsistências ou pontos de atenção que não necessariamente impedem a importação.

Alertas possíveis:

- posto identificado com nome diferente do cadastro;
- assistência já existente será atualizada;
- registro com campo complementar vazio;
- atendimento crítico preenchido;
- quantidade de reagendamento maior que zero;
- campo de defeito identificado preenchido;
- campo de laudo ou observação preenchido;
- deslocamento com valor acima do padrão, se regra futura for criada;
- baixa indevida detectada, se houver campo/regra para isso;
- reclamação ou observação relevante detectada por campo textual.

## 18. Ocorrências sugeridas

A importação poderá indicar dados que gerem atenção operacional. No MVP, a criação automática de ocorrência deve ser tratada com cautela.

Regra recomendada para MVP:

- a importação pode gerar alertas de ocorrência sugerida;
- o usuário deve decidir se cria a ocorrência;
- o sistema pode exibir botão Criar ocorrência a partir do alerta;
- a ocorrência criada deve ficar vinculada à assistência;
- a ocorrência deve preservar referência ao lote de importação.

Campos que podem gerar alerta ou ocorrência sugerida:

- Atendimento Crítico;
- Defeito Identificado;
- Laudo ou Observação;
- Comentários sobre o local da montagem;
- Observação de finalização da montagem;
- Quantidade de Reagendamento;
- Status da Atividade, dependendo do valor;
- Tipo de Atividade, dependendo do valor;
- Deslocamento, se houver regra de custo fora do padrão.

## 19. Deslocamentos e custos

O campo Deslocamento deverá alimentar o controle simples de custos/deslocamentos do MVP.

Regras:

- valor de deslocamento importado da MMS deve ser salvo;
- o valor deve estar vinculado à assistência e, se aplicável, à parte do conjunto;
- valores importados podem ser editados manualmente por usuários autorizados;
- alterações devem gerar histórico;
- custos e deslocamentos entram inicialmente apenas para consulta;
- custos não alimentarão indicadores financeiros avançados no MVP.

## 20. Dados de cliente final

O Operador poderá visualizar todos os campos da assistência dentro do seu escopo/postos.

Regras:

- dados do cliente final poderão aparecer nas telas de Assistências / MMS;
- Operador verá apenas clientes ligados aos seus postos;
- Supervisão verá clientes dos postos/equipes sob sua responsabilidade;
- Direção/Administração verá todos os clientes;
- dados sensíveis devem ser exibidos apenas quando forem úteis à operação;
- o sistema deve respeitar permissões por posto.

## 21. Entidades/tabelas sugeridas para importação

A estrutura final será detalhada no documento de banco de dados, mas a importação MMS deve considerar as seguintes entidades:

## 21.1 mms_lotes_importacao

Representa o lote de importação.

Campos sugeridos:

- id;
- nome_arquivo;
- importado_por;
- importado_em;
- data_operacao;
- posto_id;
- area_trabalho_original;
- status;
- total_linhas;
- total_assistencias;
- total_partes;
- total_erros;
- total_alertas;
- cancelado_em;
- cancelado_por;
- motivo_cancelamento.

## 21.2 mms_linhas_importacao

Representa cada linha original da planilha.

Campos sugeridos:

- id;
- lote_importacao_id;
- numero_linha;
- numero_assistencia;
- parte_conjunto;
- raw_json;
- json_normalizado;
- status_linha;
- mensagem_erro;
- mensagem_alerta;
- created_at.

## 21.3 mms_assistencias

Representa o serviço principal agrupado por Número da Assistência.

Campos sugeridos:

- id;
- numero_assistencia;
- posto_id;
- data_atividade;
- cliente_nome;
- cliente_documento, se existir;
- endereco, se existir;
- status_geral;
- tipo_atividade_principal;
- recurso_principal;
- lote_importacao_id;
- raw_json_resumo;
- created_at;
- updated_at.

## 21.4 mms_partes_assistencia

Representa as partes do conjunto.

Campos sugeridos:

- id;
- assistencia_id;
- numero_assistencia;
- parte_conjunto;
- codigo_mercadoria;
- descricao_mercadoria;
- status_atividade;
- tipo_atividade;
- recurso;
- valor_deslocamento;
- valor_receber_movel;
- raw_json;
- lote_importacao_id;
- created_at;
- updated_at.

## 21.5 mms_erros_importacao

Representa erros encontrados no processamento.

Campos sugeridos:

- id;
- lote_importacao_id;
- linha_importacao_id;
- campo;
- valor_original;
- tipo_erro;
- mensagem_erro;
- valor_corrigido;
- corrigido_por;
- corrigido_em;
- status.

## 21.6 mms_alertas_importacao

Representa alertas não impeditivos.

Campos sugeridos:

- id;
- lote_importacao_id;
- linha_importacao_id;
- tipo_alerta;
- mensagem_alerta;
- assistencia_id;
- resolvido_em;
- resolvido_por;
- status.

## 22. Desfazer importação

O sistema deve permitir desfazer uma importação apenas quando não houver dependências operacionais.

Regras:

- pode desfazer se os registros do lote não foram editados manualmente;
- pode desfazer se os registros do lote não foram vinculados a ocorrências;
- pode desfazer se não houver custo extra manual vinculado aos registros do lote;
- se algum registro foi editado, não deve permitir desfazer automaticamente;
- se alguma assistência possui ocorrência vinculada, não deve permitir desfazer automaticamente;
- ao desfazer, o lote recebe status Cancelado;
- registros importados devem ser removidos da visão operacional ou marcados como cancelados tecnicamente;
- o histórico do lote deve permanecer.

## 23. Reprocessamento

O sistema poderá permitir reprocessar um arquivo ou importar nova versão do mesmo dia/posto.

Regras:

- nova importação do mesmo posto e data deve comparar os registros existentes;
- registros existentes devem ser atualizados;
- registros novos devem ser criados;
- registros que existiam em importação anterior do mesmo posto/data e não aparecerem na nova importação deverão mudar para status Removido;
- Removido será um status interno do Doka para indicar que o registro deixou de aparecer no espelho atual da MMS;
- registros Removidos não devem ser apagados do histórico;
- o histórico deve indicar qual lote provocou a mudança para Removido;
- caso o registro volte a aparecer em importação posterior, o sistema poderá reativar/atualizar o registro conforme a nova importação.

## 24. Resultado esperado da importação

Ao final de uma importação bem-sucedida, o sistema deverá permitir:

- consultar lote de importação;
- consultar assistências importadas;
- visualizar serviços agrupados por número de assistência;
- visualizar partes do conjunto dentro da assistência;
- criar ocorrência vinculada a uma assistência;
- lançar custo extra vinculado a uma assistência;
- alimentar indicadores de produtividade e eficiência;
- identificar alertas críticos;
- preservar dados originais da MMS;
- rastrear alterações entre importações.

## 25. Indicadores alimentados pela importação

A importação MMS deverá alimentar inicialmente:

- serviços previstos;
- serviços iniciados;
- serviços concluídos;
- serviços não concluídos;
- serviços cancelados;
- produtividade por tipo normalizado: Montagem, Desmontagem, Assistência, Inspeção e Retorno;
- status da atividade;
- eficiência do dia;
- eficiência da semana;
- resumo por posto;
- assistências com reclamação;
- assistências com baixa indevida;
- importações com erro;
- importações com alerta.

Observação:

No MVP, frustrada, improdutiva e devolução não serão capturadas como motivos separados. Esses motivos serão tratados em versão futura como detalhamento do status não concluído.

## 26. Campos já mapeados como relevantes

Campos já identificados como relevantes para o MVP:

- Recurso;
- Data;
- Tipo de Atividade;
- Status da Atividade;
- Número da Assistência;
- Atendimento Crítico;
- Área de Trabalho;
- Parte do Conjunto;
- Código da Mercadoria;
- Descrição da Mercadoria;
- Quantidade de Reagendamento;
- Valor a receber pelo móvel;
- Deslocamento;
- Comentários sobre o local da montagem;
- Observação da finalização da montagem;
- Defeito Identificado;
- Laudo ou Observação.

A tabela Campos MMS — MVP continuará sendo a fonte executiva para confirmar campo original, campo normalizado, tabela destino e uso no MVP.

## 27. Decisões finais da versão 1.0

Todas as pendências principais deste documento foram respondidas.

Decisões confirmadas:

- a lista de campos obrigatórios definida neste documento está correta;
- importação parcial será permitida quando o erro estiver em campo não obrigatório, ficando o registro marcado para correção posterior;
- Operador poderá iniciar importação;
- Status da Atividade terá os valores normalizados: pendente, iniciado, concluído, não concluído e cancelado;
- frustrada, improdutiva e devolução serão tratadas apenas em versão futura como motivos de não conclusão;
- Tipo de Atividade será normalizado para: Montagem, Desmontagem, Assistência, Inspeção e Retorno;
- não haverá controle por file_hash no MVP;
- o controle de duplicidade será feito por lote de importação, histórico e chave operacional dos registros: Posto + Data + Número da Assistência + Parte do Conjunto;
- registros que desaparecerem em nova importação do mesmo posto/data deverão mudar para status Removido;
- tabela de equivalência de nomes de postos fica para fase futura.

## 28. Critério de pronto da importação MMS

A importação MMS será considerada pronta para o MVP quando:

- o usuário conseguir enviar arquivo MMS;
- o sistema identificar posto e data;
- o sistema validar campos obrigatórios;
- o sistema exibir prévia;
- o sistema tratar erros;
- o sistema salvar raw_json;
- o sistema agrupar assistências por número e partes do conjunto;
- o sistema atualizar registros existentes mantendo histórico;
- o sistema permitir consulta das assistências importadas;
- o sistema alimentar dashboard e indicadores básicos;
- o sistema permitir desfazer importação dentro das regras permitidas.
