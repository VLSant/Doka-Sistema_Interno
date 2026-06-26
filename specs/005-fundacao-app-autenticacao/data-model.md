# Data Model: Fundação da Aplicação Web, Autenticação e Navegação

## Scope

Esta feature não cria tabelas, enums de negócio ou novos vínculos persistentes.
Ela consome a fundação da Spec 001 e define modelos de estado da aplicação. A
única adição de banco é uma função restrita para registrar eventos de
autenticação na entidade existente `historico_auditoria`.

## Existing Entity: auth.users

Fonte de identidade e sessão do Supabase Auth.

### Data used

- `id`: identidade usada para localizar `usuarios.auth_user_id`.
- `email`: identificador de login exibido somente quando necessário.
- Estado da sessão: administrado pelo cliente Supabase, não copiado para tabela
  própria.

### Rules

- Senha, hash, access token, refresh token e códigos de recuperação nunca são
  persistidos ou auditados pelo Doka.
- Uma sessão autenticada não concede acesso operacional sem contexto válido.
- `user_metadata` não participa de autorização.

## Existing Entity: usuarios

Perfil operacional criado na Spec 001.

### Fields consumed

- `id`
- `auth_user_id`
- `nome`
- `email`
- `perfil`
- `ativo`
- `deleted_at`

### Rules

- A consulta deve filtrar pelo `auth_user_id` confirmado pelo Auth.
- Exatamente um registro ativo e não removido deve ser retornado.
- Zero registros produz `sem_configuracao_operacional`.
- Mais de um registro produz `configuracao_ambigua` e bloqueia acesso.
- Perfis aceitos: `operador`, `supervisao`, `direcao_admin`.

## Existing Entity: usuarios_postos

Vínculo de escopo da Spec 001.

### Fields consumed

- `usuario_id`
- `posto_id`
- `nivel_acesso`
- `deleted_at`

### Rules

- Vínculos removidos não entram no contexto.
- Operador aceita somente `operacional` e `consulta`.
- Supervisão aceita somente `supervisao`.
- Direção/Administração não depende de vínculos.
- Operador ou Supervisão sem ao menos um posto elegível é bloqueado.

## Existing Entity: postos

Unidade operacional da Spec 001.

### Fields consumed

- `id`
- `nome`
- `codigo`
- `ativo`
- `deleted_at`

### Rules

- Apenas postos ativos e não removidos entram no contexto.
- A consulta e os relacionamentos permanecem sujeitos a RLS.
- Direção/Administração pode exibir “Escopo global” sem carregar todos os postos
  no App Shell.

## Existing Entity: historico_auditoria

Destino centralizado dos eventos compatíveis.

### Event shape used

- `entidade_tipo = 'usuarios'`
- `entidade_id = usuarios.id`
- `acao`: uma ação canônica da allowlist
- `usuario_id = usuarios.id`
- `metadata`: somente origem fixa e versão do contrato, sem entrada livre
- `created_at`: gerado no banco

### Rules

- Não há escrita direta pelo frontend.
- Eventos sem ator operacional confirmável não são fabricados.
- Nenhum segredo ou credencial entra em valores ou metadata.

## Application Model: AuthState

Estado discriminado e mantido em memória:

| State | Meaning | Protected content |
| --- | --- | --- |
| `inicializando` | Cliente Auth ainda resolve a sessão inicial | Oculto |
| `nao_autenticado` | Não existe sessão válida | Oculto |
| `autenticando` | Login está em andamento | Oculto |
| `resolvendo_contexto` | Identidade confirmada; perfil/postos em validação | Oculto |
| `autorizado` | Sessão e contexto operacional válidos | Permitido conforme rota |
| `bloqueado` | Sessão válida, contexto operacional inválido | Oculto |
| `expirado` | Sessão perdeu validade | Oculto |
| `falha_temporaria` | Não foi possível confirmar sessão/contexto | Oculto |

### Transitions

```text
inicializando -> nao_autenticado
inicializando -> resolvendo_contexto
nao_autenticado -> autenticando
autenticando -> resolvendo_contexto
autenticando -> nao_autenticado
resolvendo_contexto -> autorizado
resolvendo_contexto -> bloqueado
resolvendo_contexto -> falha_temporaria
autorizado -> resolvendo_contexto
autorizado -> expirado
autorizado -> nao_autenticado
autorizado -> bloqueado
falha_temporaria -> resolvendo_contexto
expirado -> nao_autenticado
```

Qualquer transição que saia de `autorizado` limpa imediatamente o contexto
operacional e o conteúdo protegido.

## Application Model: OperationalAccessContext

```text
OperationalAccessContext
  usuario_id
  nome
  email
  perfil
  escopo_global
  postos[]
  carregado_em
```

### PostoAccess

```text
PostoAccess
  posto_id
  nome
  codigo?
  nivel_acesso
```

### Validation

- `escopo_global = true` somente para `direcao_admin`.
- `direcao_admin` pode ter `postos = []`.
- `operador` e `supervisao` exigem `postos.length >= 1`.
- Postos duplicados por `posto_id` são normalizados para uma única entrada.
- Contexto nunca é persistido fora da memória da aplicação.
- `carregado_em` serve apenas para observabilidade/testes; não autoriza nada.

## Application Model: RouteDefinition

```text
RouteDefinition
  id
  path
  label
  icon
  profiles[]
  availability
  navigation_order
```

### availability

- `available`: tela funcional desta feature.
- `placeholder`: destino neutro permitido para validar navegação.
- `disabled`: item visível, mas não navegável.
- `hidden`: item não exibido para o perfil.

### Rules

- O guard de rota avalia perfil antes de disponibilidade.
- Usuário sem perfil permitido recebe `acesso_negado`, mesmo se o módulo estiver
  indisponível.
- `placeholder` não pode buscar dados do módulo ou renderizar ações falsas.
- A mesma definição alimenta roteador e menu para reduzir divergência.

## Database Interface: registrar_evento_autenticacao

Função nova, sem nova entidade:

```text
public.registrar_evento_autenticacao(p_acao text) -> void
```

### Allowed actions

- `acesso_interno_concedido`
- `sessao_encerrada`
- `sessao_expirada_detectada`
- `acesso_operacional_bloqueado`

### Security rules

- Exige chamada autenticada e `auth.uid()` não nulo.
- Resolve no máximo um `usuarios` não removido para o `auth.uid()`.
- Não recebe `usuario_id`, entidade, valores ou metadata do cliente.
- Rejeita ação fora da allowlist.
- Usa `SECURITY DEFINER` somente para inserir o evento fixo na auditoria sem
  conceder escrita direta ao cliente.
- Define `search_path` fixo.
- Revoga execução de `PUBLIC` e `anon`.
- Concede execução apenas a `authenticated`.
- Não altera policies existentes.

### Failure behavior

- Sem usuário operacional associável: retorna sem criar evento de sucesso.
- Associação ambígua: rejeita a chamada e não cria evento.
- Token inválido/expirado: a camada Auth recusa antes da gravação.
- Falha de auditoria não impede o frontend de limpar uma sessão em logout ou
  expiração.
