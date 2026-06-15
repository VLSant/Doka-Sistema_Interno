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
- name;
- code;
- description;
- is_active;
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
- name;
- description;
- is_active;
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
- name;
- level;
- color;
- is_active;
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
- name;
- description;
- is_active;
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
- is_active;
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
- file_name;
- storage_path;
- imported_by;
- imported_at;
- operation_date;
- posto_id;
- area_trabalho_original;
- status;
- total_rows;
- total_assistencias;
- total_partes;
- total_errors;
- total_warnings;
- canceled_at;
- canceled_by;
- cancel_reason;
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
- import_batch_id;
- row_number;
- numero_assistencia;
- parte_conjunto;
- raw_json;
- normalized_json;
- row_status;
- error_message;
- warning_message;
- created_at;
- updated_at.

Status possíveis de row_status:

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
- import_batch_id;
- first_import_batch_id;
- last_import_batch_id;
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
- import_batch_id;
- first_import_batch_id;
- last_import_batch_id;
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
