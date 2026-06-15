# Documento 05 — Estrutura Inicial do Banco de Dados v1.0

## Objetivo

Definir a estrutura inicial do banco de dados do MVP do Doka.

## Tecnologia definida

- Supabase/PostgreSQL
- Supabase Auth
- Row Level Security
- Tabelas e campos em português/snake_case

## Autenticação

A autenticação será feita pelo Supabase Auth.

A tabela `auth.users` será a fonte de autenticação.

O Doka terá a tabela `usuarios` para armazenar perfil operacional, cargo/função, status e permissões internas.

## Campos padrão

Tabelas operacionais devem conter, quando aplicável:

- id;
- created_at;
- created_by;
- updated_at;
- updated_by;
- deleted_at;
- deleted_by;
- delete_reason.

## Soft delete

Registros não devem ser apagados definitivamente.

Soft delete usa:

- deleted_at;
- deleted_by;
- delete_reason.

## Histórico

O histórico será centralizado em `historico_auditoria`.

Campos principais:

- entidade_tipo;
- entidade_id;
- acao;
- valor_anterior;
- valor_novo;
- metadata;
- usuario_id;
- import_batch_id;
- created_at.

## Tabelas principais

### usuarios

Perfil operacional do usuário autenticado.

Campos principais:

- id;
- auth_user_id;
- nome;
- email;
- perfil;
- cargo_funcao_id;
- ativo;
- ultimo_login_em.

Perfis:

- operador;
- supervisao;
- direcao_admin.

### postos

Representa os postos operacionais.

Campos principais:

- id;
- nome;
- codigo;
- descricao;
- ativo.

### usuarios_postos

Relaciona usuários a postos.

Campos principais:

- id;
- usuario_id;
- posto_id;
- nivel_acesso.

Níveis:

- operacional;
- supervisao;
- consulta.

### cargos_funcoes

Cadastro auxiliar de cargos e funções.

### prioridades

Cadastro auxiliar de prioridades.

Sugestões:

- Baixa;
- Média;
- Alta;
- Crítica.

### tipos_ocorrencia

Cadastro de tipos de ocorrência.

### metas_eficiencia

Metas por posto e tipo de atividade.

## Tabelas MMS

### mms_lotes_importacao

Representa cada importação.

Campos principais:

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
- total_errors;
- total_warnings.

### mms_linhas_importacao

Representa cada linha original do arquivo.

Campos principais:

- id;
- import_batch_id;
- row_number;
- numero_assistencia;
- parte_conjunto;
- raw_json;
- normalized_json;
- row_status.

### mms_assistencias

Representa a assistência principal.

Campos principais:

- id;
- numero_assistencia;
- posto_id;
- data_atividade;
- cliente_nome;
- cliente_contato;
- endereco;
- status_atividade;
- status_interno;
- tipo_atividade_principal;
- tipo_atividade_normalizado;
- recurso_principal;
- first_import_batch_id;
- last_import_batch_id;
- raw_json_resumo.

Status interno:

- ativo;
- removido.

### mms_partes_assistencia

Representa as partes do conjunto.

Campos principais:

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
- raw_json.

### mms_erros_importacao

Registra erros de importação.

### mms_alertas_importacao

Registra alertas não impeditivos.

### mms_mapeamento_status

Mapeia status original para status normalizado.

### mms_mapeamento_tipo_atividade

Mapeia tipo original para tipo normalizado.

## Ocorrências

### ocorrencias

Campos principais:

- id;
- assistencia_id;
- numero_assistencia;
- posto_id;
- tipo_ocorrencia_id;
- prioridade_id;
- status;
- responsavel_id;
- data_retorno;
- titulo;
- descricao;
- origem;
- import_batch_id.

### ocorrencia_comentarios

Comentários e atualizações textuais da ocorrência.

## Tarefas e rotinas

### tarefas

Campos principais:

- id;
- titulo;
- descricao;
- tipo;
- posto_id;
- prioridade_id;
- status;
- due_date;
- due_time;
- requires_validation;
- validated_at;
- validated_by;
- rotina_id.

### tarefa_responsaveis

Relaciona tarefas com responsáveis.

### rotinas

Cadastro de rotinas recorrentes.

### rotina_responsaveis

Responsáveis por rotina.

### rotina_execucoes

Execuções geradas pelas rotinas.

Regra confirmada:

- rotina acumulada mantém a mesma tarefa em aberto;
- não deve gerar nova tarefa duplicada.

## Deslocamentos e custos

### deslocamentos

Tabela separada para deslocamentos vindos da MMS ou lançados manualmente.

Campos principais:

- id;
- assistencia_id;
- parte_assistencia_id;
- numero_assistencia;
- posto_id;
- origem;
- valor_deslocamento;
- data_deslocamento;
- observacoes.

### custos_extras

Custos manuais extras vinculados a assistências.

Campos principais:

- id;
- assistencia_id;
- numero_assistencia;
- posto_id;
- tipo_custo;
- descricao;
- valor;
- data_custo;
- status_validacao;
- lancado_por;
- validado_em;
- validado_por.

Status:

- pendente;
- validado.

## Views sugeridas

- view_ocorrencias_dashboard;
- view_tarefas_dashboard;
- view_produtividade_mms;
- view_importacoes_com_alerta.

## Índices recomendados

- usuarios.email;
- usuarios.auth_user_id;
- usuarios_postos.usuario_id;
- usuarios_postos.posto_id;
- mms_lotes_importacao.posto_id + operation_date;
- mms_assistencias.numero_assistencia;
- mms_assistencias.posto_id + data_atividade;
- mms_assistencias.posto_id + data_atividade + numero_assistencia;
- mms_partes_assistencia.assistencia_id;
- ocorrencias.assistencia_id;
- ocorrencias.posto_id + status;
- tarefas.posto_id + status;
- deslocamentos.assistencia_id;
- custos_extras.assistencia_id;
- historico_auditoria.entidade_tipo + entidade_id.

## Próximo passo técnico

Criar migrations SQL no Supabase seguindo esta estrutura.
