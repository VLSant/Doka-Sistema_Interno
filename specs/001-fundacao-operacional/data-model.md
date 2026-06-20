# Data Model: Fundacao Operacional

## Enum: perfil_usuario

Valores:
- `operador`
- `supervisao`
- `direcao_admin`

## Enum: nivel_acesso_posto

Valores:
- `operacional`
- `supervisao`
- `consulta`

## Entity: usuarios

Representa o perfil operacional de um usuario autenticado.

Fields:
- `id`: uuid primary key.
- `auth_user_id`: uuid, referencia `auth.users.id`, obrigatorio para usuarios que
  acessam a area interna.
- `nome`: text, obrigatorio.
- `email`: text, obrigatorio.
- `perfil`: `perfil_usuario`, obrigatorio.
- `cargo_funcao_id`: uuid nullable, FK para `cargos_funcoes.id`.
- `ativo`: boolean, default true.
- `ultimo_login_em`: timestamptz nullable.
- `created_at`, `created_by`, `updated_at`, `updated_by`.
- `deleted_at`, `deleted_by`, `delete_reason`.

Relationships:
- Muitos `usuarios` podem referenciar um `cargo_funcao`.
- Um `usuario` pode ter muitos `usuarios_postos`.
- `historico_auditoria.usuario_id` referencia o usuario responsavel pela acao.

Validation rules:
- Deve existir no maximo um `usuarios` ativo e nao deletado por `auth_user_id`.
- `perfil` deve ser um dos valores oficiais.
- Usuario com `ativo = false` ou `deleted_at` preenchido nao acessa area interna.
- `email` deve ser preenchido e coerente com o usuario autenticado quando aplicavel.

Indexes/constraints:
- Unique parcial em `auth_user_id` quando `deleted_at is null`.
- Index em `perfil`.
- Index em `cargo_funcao_id`.

## Entity: postos

Representa unidade operacional usada como filtro central de acesso.

Fields:
- `id`: uuid primary key.
- `nome`: text, obrigatorio.
- `codigo`: text nullable.
- `descricao`: text nullable.
- `ativo`: boolean, default true.
- `created_at`, `created_by`, `updated_at`, `updated_by`.
- `deleted_at`, `deleted_by`, `delete_reason`.

Relationships:
- Um `posto` pode ter muitos `usuarios_postos`.
- Futuras tabelas operacionais devem referenciar `posto_id`.

Validation rules:
- Postos inativos ou deletados nao aparecem em listas operacionais padrao.
- `nome` deve ser unico entre postos ativos quando a operacao exigir nomes sem
  duplicidade.
- `codigo`, quando usado, deve ser unico entre postos ativos.

Indexes/constraints:
- Unique parcial em `codigo` quando `codigo is not null and deleted_at is null`.
- Index em `ativo`.

## Entity: usuarios_postos

Relaciona usuarios a postos e define escopo operacional.

Fields:
- `id`: uuid primary key.
- `usuario_id`: uuid FK para `usuarios.id`.
- `posto_id`: uuid FK para `postos.id`.
- `nivel_acesso`: `nivel_acesso_posto`, obrigatorio.
- `created_at`, `created_by`.
- `deleted_at`, `deleted_by`, `delete_reason`.

Relationships:
- Muitos vinculos pertencem a um `usuario`.
- Muitos vinculos pertencem a um `posto`.

Validation rules:
- Nao pode existir duplicidade ativa de `usuario_id + posto_id`.
- Vinculo deletado logicamente nao concede acesso.
- Vinculo para posto deletado/inativo nao deve conceder acesso operacional padrao.
- Para Supervisao, `nivel_acesso = supervisao` define escopo de supervisao.

Indexes/constraints:
- Unique parcial em `(usuario_id, posto_id)` quando `deleted_at is null`.
- Index em `posto_id`.
- Index em `(usuario_id, nivel_acesso)` quando `deleted_at is null`.

## Entity: cargos_funcoes

Cadastro auxiliar para classificar usuarios.

Fields:
- `id`: uuid primary key.
- `nome`: text, obrigatorio.
- `descricao`: text nullable.
- `ativo`: boolean, default true.
- `created_at`, `created_by`, `updated_at`, `updated_by`.
- `deleted_at`, `deleted_by`, `delete_reason`.

Relationships:
- Um cargo/funcao pode estar vinculado a muitos usuarios.

Validation rules:
- Cargos/funcoes deletados ou inativos nao devem ser usados em novos usuarios.
- `nome` deve ser unico entre registros ativos quando aplicavel.

Indexes/constraints:
- Unique parcial em `nome` quando `deleted_at is null`.

## Entity: historico_auditoria

Registro centralizado de acoes criticas.

Fields:
- `id`: uuid primary key.
- `entidade_tipo`: text, obrigatorio.
- `entidade_id`: uuid, obrigatorio quando a entidade tiver identificador.
- `acao`: text, obrigatorio.
- `valor_anterior`: jsonb nullable.
- `valor_novo`: jsonb nullable.
- `metadata`: jsonb nullable.
- `usuario_id`: uuid nullable, FK para `usuarios.id`.
- `lote_importacao_id`: uuid nullable, reservado para futuras features MMS.
- `created_at`: timestamptz, default now.

Relationships:
- `usuario_id` aponta para o usuario operacional responsavel pela acao.
- Futuras features podem preencher `lote_importacao_id` ao auditar importacao MMS.

Validation rules:
- Historico nao deve sofrer soft delete nem exclusao operacional comum.
- `entidade_tipo` deve identificar a tabela ou dominio afetado.
- Eventos de criacao, edicao, mudanca de perfil, ativacao/inativacao, vinculo,
  desvinculo e exclusao logica devem ser registrados.

Indexes/constraints:
- Index em `(entidade_tipo, entidade_id)`.
- Index em `usuario_id`.
- Index em `created_at`.
- Index em `acao`.

## Permission Helper Contracts

Funcoes auxiliares previstas:
- `usuario_atual_id()`: retorna `usuarios.id` ativo vinculado a `auth.uid()`.
- `usuario_tem_perfil(perfil_usuario)`: retorna se usuario atual possui perfil.
- `usuario_e_direcao_admin()`: retorna se usuario atual e Direcao/Administracao.
- `usuario_e_supervisao()`: retorna se usuario atual e Supervisao.
- `usuario_tem_acesso_posto(posto_uuid)`: retorna se usuario atual pode acessar o
  posto informado.

Behavior:
- Usuario sem perfil operacional ativo deve receber resultado nulo ou falso.
- Direcao/Admin deve ter acesso global.
- Operador deve depender de vinculo ativo ao posto.
- Supervisao deve depender de vinculo ativo com nivel de supervisao ou regra
  equivalente definida na migration.

## State and Access Rules

Usuario:
- Ativo: `ativo = true` e `deleted_at is null`.
- Inativo: `ativo = false`, nao acessa area interna.
- Deletado logicamente: `deleted_at is not null`, nao aparece em listas padrao.

Posto:
- Ativo: pode ser usado em vinculos e escopo.
- Inativo/deletado: nao aparece em listas padrao nem concede acesso operacional
  para novas operacoes.

Vinculo:
- Ativo: `deleted_at is null` e usuario/posto tambem operacionais.
- Deletado logicamente: nao concede acesso.

Auditoria:
- Append-only para operacao comum.
- Deve registrar a acao somente apos sucesso da alteracao critica.
