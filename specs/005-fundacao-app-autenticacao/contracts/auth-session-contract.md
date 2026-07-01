# Contract: Authentication and Session

## Purpose

Definir o comportamento observável de login, restauração, logout, expiração e
recuperação de senha.

## Public Routes

| Route | Purpose | Auth requirement |
| --- | --- | --- |
| `/login` | Login por e-mail e senha | Apenas não autenticado; autorizado redireciona |
| `/recuperar-senha` | Solicitar e-mail de recuperação | Pública |
| `/redefinir-senha` | Definir nova senha após recovery | Evento/sessão de recovery válida |

## Login

Input:

- E-mail normalizado com trim.
- Senha mantida apenas no estado do formulário até o envio.

Behavior:

1. Chamar o método oficial de login por e-mail/senha.
2. Em falha de credencial, exibir mensagem neutra.
3. Em sucesso, confirmar identidade com o servidor.
4. Carregar contexto operacional.
5. Só então redirecionar para `/app/dashboard`.

The UI must never:

- Registrar senha em log.
- Persistir senha no estado global ou storage.
- Distinguir “e-mail inexistente” de “senha incorreta”.
- Basear autorização somente no retorno local do login.

## Initial Session

1. A aplicação começa em `inicializando`.
2. O listener Auth é registrado junto à inicialização do cliente.
3. Sem sessão, transita para `nao_autenticado`.
4. Com sessão, confirma o usuário no servidor e carrega o contexto operacional.
5. Conteúdo protegido permanece oculto até o estado `autorizado`.

## Auth Events

| Event | Required reaction |
| --- | --- |
| `INITIAL_SESSION` | Resolver identidade/contexto ou ficar não autenticado |
| `SIGNED_IN` | Resolver novamente o contexto antes de liberar rotas quando a identidade mudar; evento repetido do mesmo usuário já autorizado mantém a UI e revalida na próxima navegação protegida |
| `SIGNED_OUT` | Limpar contexto e redirecionar para login |
| `TOKEN_REFRESHED` | Manter sessão e contexto visível; revalidar contexto antes da próxima navegação protegida |
| `USER_UPDATED` | Revalidar identidade/contexto |
| `PASSWORD_RECOVERY` | Abrir fluxo de redefinição |

Callbacks do listener não devem executar cadeias assíncronas longas dentro do
callback. Eles atualizam o estado/disparam a revalidação fora do callback.

## Logout

1. Solicitar auditoria `sessao_encerrada` enquanto a sessão ainda é válida.
2. Executar logout com escopo local.
3. Limpar contexto, caches e conteúdo protegido mesmo se a auditoria falhar.
4. Redirecionar para `/login`.
5. Histórico, favorito ou URL direta devem exigir novo login.

## Session Expiration

Expiração inclui refresh recusado, identidade não confirmada ou evento de saída
não iniciado pelo fluxo de logout atual.

Required behavior:

- Limpar contexto protegido imediatamente.
- Não continuar usando respostas iniciadas com contexto anterior.
- Mostrar estado `sessao_expirada`.
- Permitir voltar ao login.
- Tentar auditoria de expiração somente se o Auth ainda aceitar a chamada; não
  enfileirar token expirado nem usar chave privilegiada.

## Password Recovery

### Request

1. Aceitar e-mail válido.
2. Solicitar recuperação com redirect exato para `/redefinir-senha`.
3. Mostrar a mesma confirmação neutra para e-mail existente ou inexistente.

### Completion

1. Exigir evento/sessão de recovery válida.
2. Solicitar nova senha e confirmação.
3. Aplicar as regras configuradas no Auth.
4. Atualizar a senha pelo cliente oficial.
5. Limpar estado sensível e retornar ao login.

Expired, malformed or reused recovery authorizations must show a safe failure
with an option to request a new link.

## Temporary Failure

If Auth or operational context cannot be confirmed:

- Do not render protected content.
- Preserve no stale authorization snapshot.
- Show `falha_temporaria`.
- Offer retry and logout/login as safe exits.
