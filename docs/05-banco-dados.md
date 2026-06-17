**Status:** Versão 1.0 fechada — base inicial para implementação em Supabase/PostgreSQL.

**Documento:** Estrutura Inicial do Banco de Dados.

**Projeto:** Doka.

**Versão:** 1.0.

**Data:** 12/06/2026.

**Base:** PRD v1.0, Regras de Negócio v1.0, Mapa de Telas v0.1 e Especificação Final da Importação MMS v1.0.

## 1. Objetivo do documento

Este documento define a estrutura inicial do banco de dados do MVP do Doka.

A finalidade é transformar as regras de negócio, telas e fluxos em uma base organizada de tabelas, campos, relacionamentos, índices e regras técnicas.

Este documento não é ainda o script SQL final de criação do banco. Ele é a base para gerar a modelagem final, migrations do Supabase/PostgreSQL, APIs, telas e backlog técnico.

## 2. Princípios da modelagem

A estrutura do banco deve seguir estes princípios:

- usar identificadores únicos em todas as tabelas principais;
- manter histórico de ações relevantes;
- não apagar registros definitivamente;
- usar soft delete em registros operacionais;
- preservar dados importados da MMS em raw_json;
- separar dados importados da MMS de dados manuais do Doka;
- permitir rastrear qual lote de importação criou ou atualizou cada registro;
- permitir controle por perfil e posto;
- permitir que uma assistência tenha várias partes do conjunto;
- permitir que uma assistência tenha várias ocorrências;
- impedir que uma ocorrência envolva mais de uma assistência;
- permitir tarefas com múltiplos responsáveis;
- permitir rotinas recorrentes que geram tarefas;
- permitir custos extras vinculados obrigatoriamente a assistências.

## 3. Convenções técnicas recomendadas

## 3.1 Tecnologia definida

Tecnologia do banco:

- Supabase/PostgreSQL.

Autenticação:

- a autenticação será feita pelo Supabase Auth;
- a tabela auth.users será a fonte de autenticação;
- o Doka terá uma tabela própria de perfil operacional, chamada usuarios, vinculada ao usuário autenticado do Supabase.

## 3.2 Nomenclatura

Recomendação confirmada:

- nomes de tabelas em português/snake_case;
- nomes de campos em português/snake_case;
- chaves primárias chamadas id;
- chaves estrangeiras com sufixo _id;
- datas de controle padronizadas como created_at, updated_at, deleted_at.

## 3.3 Campos padrão

Tabelas operacionais devem possuir, sempre que fizer sentido:

- id;
- created_at;
- created_by;
- updated_at;
- updated_by;
- deleted_at;
- deleted_by;
- delete_reason.

## 3.4 Soft delete

Registros não devem ser apagados definitivamente.

Campos recomendados:

- deleted_at;
- deleted_by;
- delete_reason.

Regra:

- registros com deleted_at preenchido não aparecem nas listas operacionais padrão;
- soft delete não deve ser confundido com status operacional;
- status Arquivada não deve ser usado como substituto de exclusão lógica.

## 3.5 Histórico

Ações relevantes devem ser registradas em tabela de histórico/auditoria.

Exemplos:

- criação;
- edição;
- mudança de status;
- reabertura;
- conclusão;
- validação;
- importação;
- atualização por nova importação;
- correção de erro;
- cancelamento;
- exclusão lógica.

## 4. Visão geral dos grupos de tabelas

A estrutura inicial será dividida em grupos:

1. Acesso, usuários e postos;
2. Cadastros base;
3. Importação MMS;
4. Assistências e partes do conjunto;
5. Ocorrências;
6. Tarefas e rotinas;
7. Custos extras;
8. Histórico e auditoria;
9. Dashboard e consultas operacionais.

## 5. Tabela usuarios

Representa o perfil operacional do usuário dentro do Doka.

A autenticação não será feita por esta tabela. A autenticação será feita pelo Supabase Auth, usando auth.users.

Campos sugeridos:

- id;
- auth_user_id;
- nome;
- email;
- perfil;
- cargo_funcao_id;
- ativo;
- ultimo_login_em;
- created_at;
- created_by;
- updated_at;
- updated_by;
- deleted_at;
- deleted_by;
- delete_reason.

Valores possíveis de perfil:

- operador;
- supervisao;
- direcao_admin.

Regras:

- auth_user_id deve referenciar auth.users.id;
- usuarios guarda apenas dados operacionais e permissões internas do Doka;
- Operador acessa dados dos postos vinculados;
- Supervisão acessa dados dos postos/equipes sob responsabilidade;
- Direção/Administração acessa todos os dados;
- usuário pode estar vinculado a um ou mais postos.

## 6. Tabela postos

Representa os postos operacionais.

Campos sugeridos:

- id;
- nome;
- codigo;
- descricao;
- ativo;
- created_at;
- updated_at;
- deleted_at;
- deleted_by;
- delete_reason.

Regras:

- posto será usado como filtro central de acesso;
- Área de Trabalho da MMS será vinculada ao posto;
- equivalência automática de nomes de postos fica para fase futura;
- no MVP, o valor da Área de Trabalho deverá corresponder a um posto cadastrado ou gerar tratamento/alerta.

## 7. Tabela usuarios_postos

Tabela de relacionamento entre usuários e postos.

Campos sugeridos:

- id;
- usuario_id;
- posto_id;
- nivel_acesso;
- created_at;
- created_by;
- deleted_at;
- deleted_by.

Valores possíveis de nivel_acesso:

- operacional;
- supervisao;
- consulta.

Regras:

- um usuário pode estar em vários postos;
- um posto pode ter vários usuários;
- Operador vê apenas dados dos postos vinculados;
- Supervisão vê os postos vinculados com nível supervisão;
- Direção/Administração ignora esse filtro para visão global.

## 8. Tabela cargos_funcoes

Representa cargos ou funções internas.

Campos sugeridos:

- id;
- nome;
- descricao;
- ativo;
- created_at;
- updated_at;
- deleted_at.

Uso:

- vincular usuários;
- vincular tarefas e rotinas;
- permitir filtros por cargo/função.

## 9. Tabela prioridades

Representa prioridades operacionais.

Campos sugeridos:

- id;
- nome;
- nivel;
- cor;
- ativo;
- created_at;
- updated_at;
- deleted_at.

Sugestões iniciais:

- Baixa;
- Média;
- Alta;
- Crítica.

Uso:

- ocorrências;
- tarefas;
- rotinas.

## 10. Tabela tipos_ocorrencia

Representa os tipos de ocorrência do sistema.

Campos sugeridos:

- id;
- nome;
- descricao;
- ativo;
- created_at;
- updated_at;
- deleted_at.

Tipos iniciais:

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

Observação:

Mesmo que improdutiva e devolução não venham detalhadas pela importação MMS no MVP, elas podem existir como tipo manual de ocorrência.

## 11. Tabela metas_eficiencia

Representa metas ou parâmetros simples de eficiência.

Campos sugeridos:

- id;
- posto_id;
- tipo_atividade_normalizado;
- meta_percentual;
- vigencia_inicio;
- vigencia_fim;
- ativo;
- created_at;
- updated_at.

Uso:

- dashboard;
- cálculo de eficiência;
- alerta de eficiência abaixo da meta.

## 12. Tabela mms_lotes_importacao

Representa cada lote de importação MMS.

Campos sugeridos:

- id;
- nome_arquivo;
- caminho_storage;
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
- motivo_cancelamento;
- created_at;
- updated_at.

Status possíveis:

- importado;
- importado_com_alertas;
- erro;
- cancelado.

Regras:

- não haverá file_hash no MVP;
- cada importação gera um lote;
- o histórico de importação será feito por lote;
- o lote identifica o usuário, data/hora, posto e arquivo;
- importações do mesmo posto/data podem ocorrer várias vezes ao longo do dia;
- novas importações atualizam registros existentes e criam histórico.

## 13. Tabela mms_linhas_importacao

Representa cada linha original do arquivo importado.

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
- created_at;
- updated_at.

Status possíveis de status_linha:

- lida;
- importada;
- importada_com_alerta;
- erro;
- corrigida;
- ignorada;
- cancelada.

Regras:

- raw_json preserva a linha original;
- normalized_json pode guardar dados tratados;
- erros em campos obrigatórios impedem processamento da linha até correção;
- erros em campos não obrigatórios permitem importação com marcação para correção posterior.

## 14. Tabela mms_assistencias

Representa o serviço principal importado da MMS.

Campos sugeridos:

- id;
- numero_assistencia;
- posto_id;
- data_atividade;
- cliente_nome;
- cliente_documento;
- cliente_contato;
- endereco;
- status_atividade;
- status_interno;
- tipo_atividade_principal;
- tipo_atividade_normalizado;
- recurso_principal;
- lote_importacao_id;
- primeiro_lote_importacao_id;
- ultimo_lote_importacao_id;
- raw_json_resumo;
- created_at;
- updated_at;
- deleted_at;
- deleted_by;
- delete_reason.

Valores de status_atividade:

- pendente;
- iniciado;
- concluido;
- nao_concluido;
- cancelado.

Valores de status_interno:

- ativo;
- removido.

Regras:

- Número da Assistência identifica o serviço principal;
- uma assistência pode ter várias partes do conjunto;
- uma assistência pode ter várias ocorrências;
- uma assistência pode ter vários custos extras;
- se uma assistência desaparecer em nova importação do mesmo posto/data, status_interno deve virar removido;
- se voltar a aparecer, poderá ser reativada/atualizada;
- registros não devem ser apagados fisicamente.

Índices sugeridos:

- numero_assistencia;
- posto_id + data_atividade;
- posto_id + data_atividade + numero_assistencia;
- status_atividade;
- status_interno;
- tipo_atividade_normalizado.

## 15. Tabela mms_partes_assistencia

Representa as partes do conjunto de uma assistência.

Campos sugeridos:

- id;
- assistencia_id;
- numero_assistencia;
- parte_conjunto;
- codigo_mercadoria;
- descricao_mercadoria;
- status_atividade;
- tipo_atividade_original;
- tipo_atividade_normalizado;
- recurso;
- valor_deslocamento;
- valor_receber_movel;
- atendimento_critico;
- quantidade_reagendamento;
- comentarios_local_montagem;
- observacao_finalizacao;
- defeito_identificado;
- laudo_ou_observacao;
- lote_importacao_id;
- primeiro_lote_importacao_id;
- ultimo_lote_importacao_id;
- raw_json;
- created_at;
- updated_at;
- deleted_at;
- deleted_by;
- delete_reason.

Regras:

- uma assistência pode possuir múltiplas partes;
- a chave operacional deve considerar posto, data, número da assistência e parte do conjunto;
- partes diferentes do mesmo número de assistência não devem gerar assistências duplicadas;

## 16. Tabela mms_erros_importacao

Representa erros encontrados durante a leitura, validação ou tratamento de uma importação MMS.

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
- status;
- created_at;
- updated_at.

Valores possíveis de status:

- pendente;
- corrigido;
- ignorado.

Regras:

- erros impeditivos devem bloquear a linha ou o lote conforme regra de importação;
- correções devem preservar valor_original e salvar valor_corrigido separadamente;
- correções devem gerar registro em historico_auditoria.

## 17. Tabela mms_alertas_importacao

Representa alertas não impeditivos gerados pela importação MMS.

Campos sugeridos:

- id;
- lote_importacao_id;
- linha_importacao_id;
- tipo_alerta;
- mensagem_alerta;
- assistencia_id;
- resolvido_em;
- resolvido_por;
- status;
- created_at;
- updated_at.

Valores possíveis de status:

- pendente;
- resolvido;
- ignorado.

Regras:

- alertas não impedem a importação quando não houver erro obrigatório;
- alertas podem sugerir criação manual de ocorrência;
- alertas resolvidos devem manter rastreabilidade.

## 18. Tabela mms_mapeamento_status

Representa o mapeamento entre Status da Atividade original da MMS e status normalizado do Doka.

Campos sugeridos:

- id;
- valor_original;
- valor_normalizado;
- descricao;
- ativo;
- created_at;
- updated_at.

Regras:

- valor_normalizado deve usar status_atividade_mms;
- valor_original deve ser preservado para auditoria e reprocessamento;
- mapeamentos inativos não devem ser usados em novas importações.

## 19. Tabela mms_mapeamento_tipo_atividade

Representa o mapeamento entre Tipo de Atividade original da MMS e tipo normalizado do Doka.

Campos sugeridos:

- id;
- valor_original;
- valor_normalizado;
- descricao;
- ativo;
- created_at;
- updated_at.

Regras:

- valor_normalizado será usado em filtros, produtividade e dashboard;
- raw_json deve preservar o valor original da MMS.

## 20. Tabela ocorrencias

Representa pendências, reclamações e problemas operacionais vinculados a uma assistência.

Campos sugeridos:

- id;
- assistencia_id;
- posto_id;
- tipo_ocorrencia_id;
- prioridade_id;
- responsavel_id;
- criada_por;
- titulo;
- descricao;
- observacoes;
- status;
- data_retorno;
- resolvida_em;
- encerrada_em;
- reaberta_em;
- origem;
- lote_importacao_id;
- created_at;
- updated_at;
- deleted_at;
- deleted_by;
- delete_reason.

Valores possíveis de status:

- aberta;
- em_acompanhamento;
- aguardando_retorno;
- resolvida;
- encerrada;
- reaberta.

Regras:

- toda ocorrência do MVP deve estar vinculada a uma assistência;
- uma ocorrência não pode envolver mais de uma assistência;
- uma assistência pode ter várias ocorrências;
- atrasada será condição calculada por data_retorno e status, não status fixo;
- mudanças de status devem gerar historico_auditoria.

Índices sugeridos:

- assistencia_id;
- posto_id;
- responsavel_id;
- status;
- data_retorno;
- tipo_ocorrencia_id.

## 21. Tabela ocorrencia_comentarios

Representa comentários e acompanhamentos registrados dentro de uma ocorrência.

Campos sugeridos:

- id;
- ocorrencia_id;
- usuario_id;
- comentario;
- created_at;
- updated_at;
- deleted_at;
- deleted_by;
- delete_reason.

Regras:

- comentários devem ficar vinculados a uma única ocorrência;
- comentários não devem substituir o histórico técnico;
- exclusão de comentário deve usar soft delete quando permitida.

## 22. Tabela tarefas

Representa tarefas avulsas, tarefas geradas por rotina e estratégias operacionais.

Campos sugeridos:

- id;
- titulo;
- descricao;
- tipo;
- posto_id;
- cargo_funcao_id;
- prioridade_id;
- criada_por;
- status;
- prazo_data;
- horario_limite;
- exige_validacao;
- concluida_em;
- concluida_por;
- validada_em;
- validada_por;
- reaberta_em;
- observacoes;
- rotina_id;
- rotina_execucao_id;
- created_at;
- updated_at;
- deleted_at;
- deleted_by;
- delete_reason.

Valores possíveis de tipo:

- avulsa;
- rotina;
- estrategia.

Valores possíveis de status:

- pendente;
- em_andamento;
- concluida;
- validada;
- reaberta.

Regras:

- tarefa pode ter um ou múltiplos responsáveis por tarefa_responsaveis;
- atraso será condição calculada por prazo_data, horario_limite e status;
- horario_limite não será obrigatório;
- tarefa com exige_validacao deve ser validada por Supervisão ou Direção/Administração;
- rotina acumulada deve manter a mesma tarefa aberta até conclusão ou tratamento.

Índices sugeridos:

- posto_id;
- status;
- prazo_data;
- prioridade_id;
- rotina_id.

## 23. Tabela tarefa_responsaveis

Relaciona tarefas aos seus responsáveis.

Campos sugeridos:

- id;
- tarefa_id;
- usuario_id;
- created_at;
- created_by;
- deleted_at;
- deleted_by.

Regras:

- uma tarefa pode ter múltiplos responsáveis;
- não deve haver duplicidade ativa de tarefa_id + usuario_id;
- permissões de visualização devem considerar usuário responsável e posto.

## 24. Tabela rotinas

Representa cadastros de rotinas recorrentes.

Campos sugeridos:

- id;
- nome;
- descricao;
- posto_id;
- cargo_funcao_id;
- prioridade_id;
- recorrencia;
- dias_semana;
- dia_mes;
- horario_limite;
- exige_validacao;
- ativa;
- data_inicio;
- data_fim;
- created_at;
- updated_at;
- deleted_at;
- deleted_by;
- delete_reason.

Valores sugeridos de recorrencia:

- diaria;
- semanal;
- mensal;
- personalizada.

Regras:

- rotina gera tarefas conforme recorrência;
- alterações em rotina devem afetar gerações futuras;
- rotina inativa não gera novas tarefas;
- rotina acumulada não deve duplicar tarefa ainda aberta.

## 25. Tabela rotina_responsaveis

Relaciona rotinas aos seus responsáveis padrão.

Campos sugeridos:

- id;
- rotina_id;
- usuario_id;
- created_at;
- created_by;
- deleted_at;
- deleted_by.

Regras:

- uma rotina pode ter múltiplos responsáveis;
- responsáveis da rotina devem ser usados ao gerar tarefas recorrentes.

## 26. Tabela rotina_execucoes

Representa cada ocorrência planejada ou acumulada de uma rotina.

Campos sugeridos:

- id;
- rotina_id;
- tarefa_id;
- data_prevista;
- status;
- gerada_em;
- concluida_em;
- acumulada_de_execucao_id;
- created_at;
- updated_at.

Valores possíveis de status:

- prevista;
- gerada;
- acumulada;
- concluida;
- cancelada.

Regras:

- cada execução deve apontar para a tarefa gerada quando existir;
- se a rotina acumular, deve manter referência à mesma tarefa aberta;
- histórico deve permitir entender quando uma rotina ficou acumulada.

## 27. Tabela deslocamentos

Representa deslocamentos importados da MMS ou lançados manualmente no futuro.

Campos sugeridos:

- id;
- assistencia_id;
- parte_assistencia_id;
- posto_id;
- origem;
- valor;
- data_deslocamento;
- descricao;
- lote_importacao_id;
- raw_json;
- created_at;
- created_by;
- updated_at;
- updated_by;
- deleted_at;
- deleted_by;
- delete_reason.

Valores possíveis de origem:

- mms;
- manual.

Regras:

- deslocamentos importados da MMS devem ficar separados de custos extras manuais;
- deslocamento deve aparecer no detalhe da assistência;
- edição manual deve gerar historico_auditoria.

## 28. Tabela custos_extras

Representa custos extras manuais vinculados obrigatoriamente a assistências.

Campos sugeridos:

- id;
- assistencia_id;
- posto_id;
- tipo_custo;
- descricao;
- valor;
- data_custo;
- origem;
- status_validacao;
- lancado_por;
- validado_por;
- validado_em;
- observacoes;
- created_at;
- updated_at;
- deleted_at;
- deleted_by;
- delete_reason.

Valores possíveis de origem:

- manual.

Valores possíveis de status_validacao:

- pendente;
- validado.

Regras:

- custo extra não pode ser salvo sem assistência;
- todos os perfis podem lançar custo extra dentro do seu escopo;
- apenas Supervisão e Direção/Administração podem validar;
- não haverá status reprovado ou devolvido para ajuste no MVP;
- validação deve gerar historico_auditoria.

## 29. Tabela historico_auditoria

Representa o histórico centralizado de ações críticas do sistema.

Campos sugeridos:

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

Ações sugeridas:

- criado;
- atualizado;
- status_alterado;
- reaberto;
- concluido;
- validado;
- excluido_logicamente;
- importado;
- corrigido;
- cancelado;
- marcado_removido.

Regras:

- histórico não deve ser apagado;
- valor_anterior e valor_novo devem usar jsonb quando aplicável;
- metadata deve guardar contexto adicional da ação;
- ações críticas de importação, ocorrências, tarefas, custos, soft delete e alterações manuais devem gerar histórico.

## 30. Views de dashboard

As views de dashboard devem consolidar consultas operacionais frequentes sem substituir as regras de RLS.

Views sugeridas:

- view_ocorrencias_dashboard;
- view_tarefas_dashboard;
- view_produtividade_mms;
- view_importacoes_com_alerta.

## 30.1 view_ocorrencias_dashboard

Deve consolidar:

- ocorrências abertas;
- ocorrências atrasadas;
- ocorrências com retorno no dia;
- ocorrências por posto, responsável, tipo e prioridade.

## 30.2 view_tarefas_dashboard

Deve consolidar:

- tarefas pendentes;
- tarefas atrasadas;
- tarefas do dia;
- tarefas aguardando validação;
- tarefas por posto e responsável.

## 30.3 view_produtividade_mms

Deve consolidar:

- assistências previstas;
- assistências iniciadas;
- assistências concluídas;
- assistências não concluídas;
- assistências canceladas;
- eficiência por posto, período e tipo de atividade normalizado.

## 30.4 view_importacoes_com_alerta

Deve consolidar:

- lotes com erro;
- lotes importados com alertas;
- total de erros pendentes;
- total de alertas pendentes;
- posto, data de operação e usuário importador.

Regras gerais das views:

- devem permitir filtro por posto e período;
- devem evitar consultas pesadas no frontend;
- devem respeitar RLS quando consultadas pela aplicação;
- devem ocultar registros com deleted_at preenchido nas visões operacionais padrão.
