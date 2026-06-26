# Research: Fundação da Aplicação Web, Autenticação e Navegação

## 1. Runtime e ferramenta de build

**Decision**: Usar Node.js 24 LTS, TypeScript 5.x, React 19 e Vite 8. Gerenciar
dependências com npm e versionar `package-lock.json`.

**Rationale**: Node 24 é a linha Active LTS atual. Vite 8 é estável, suporta
template React + TypeScript e requer Node 20.19+ ou 22.12+; Node 24 evita iniciar
o projeto em uma linha próxima de manutenção. O design system já fornece
componentes React e ativos que podem ser portados diretamente para TSX.

**Alternatives considered**:

- Next.js/SSR: rejeitado porque a aplicação é interna, não precisa de SEO ou
  renderização no servidor e não possui backend de aplicação.
- JavaScript sem TypeScript: rejeitado porque sessão, perfil, estados e matriz de
  rotas se beneficiam de contratos estáticos.
- Node 20 local atual: rejeitado porque o ambiente encontrado (`v20.11.1`) não
  cumpre o mínimo do Vite 8.

**Sources**:

- [Node.js release schedule](https://nodejs.org/en/about/previous-releases)
- [Vite 8 announcement](https://vite.dev/blog/announcing-vite8)
- [Vite getting started](https://vite.dev/guide/)
- [React with TypeScript](https://react.dev/learn/typescript)

## 2. Arquitetura da aplicação

**Decision**: Construir uma SPA client-side estática, sem backend próprio, com
um cliente Supabase compartilhado e deploy configurado para fallback de rotas
para `index.html`.

**Rationale**: O Supabase já fornece Auth, Data API e RLS. Adicionar servidor
próprio não cria valor para os fluxos desta feature e ampliaria superfície de
segurança e operação. A segurança de dados permanece no banco, não no bundle.

**Alternatives considered**:

- Backend intermediário: rejeitado por duplicar Auth/autorização e ampliar o
  escopo sem necessidade.
- HTML multipágina: rejeitado porque dificulta a estrutura autenticada comum e a
  sincronização de sessão.

## 3. Roteamento e autorização de entrada

**Decision**: Usar React Router em Data Mode, com um loader no ramo protegido que
confirma a identidade e recarrega o contexto operacional antes de renderizar
cada navegação protegida. Cada rota declara perfis permitidos e disponibilidade.

**Rationale**: Data Mode permite configurar rotas, loaders, estados pendentes e
tratamento de erros fora da renderização. O mesmo guard cobre cliques no menu,
favoritos, histórico e acesso direto. A consulta sob RLS permanece obrigatória
para qualquer dado do módulo.

**Alternatives considered**:

- Guard apenas em componentes: rejeitado porque pode renderizar conteúdo antes
  da decisão e tende a divergir em URLs diretas.
- Menu como autorização: rejeitado explicitamente pela Spec 005.
- Framework Mode do React Router: rejeitado porque adiciona convenções de
  servidor/build não necessárias à SPA atual.

**Source**:

- [React Router modes](https://reactrouter.com/main/start/modes)

## 4. Confirmação e restauração da sessão

**Decision**: Deixar `@supabase/supabase-js` persistir e renovar a sessão no
navegador. Na inicialização e em cada entrada protegida, usar `getUser()` para
confirmar a identidade com o Auth e depois carregar o contexto operacional por
consultas RLS. Assinar `onAuthStateChange` imediatamente após criar o cliente.

**Rationale**: `getUser()` consulta o servidor e retorna identidade autêntica.
`onAuthStateChange` fornece `INITIAL_SESSION`, `SIGNED_IN`, `SIGNED_OUT`,
`PASSWORD_RECOVERY`, `TOKEN_REFRESHED` e `USER_UPDATED`, permitindo limpar o
conteúdo rapidamente e sincronizar janelas. A sessão local, isoladamente, não é
fonte de autorização.

**Alternatives considered**:

- Confiar apenas em `getSession()`: rejeitado como base de autorização porque o
  estado é lido do armazenamento local.
- Copiar perfil/postos para `user_metadata`: rejeitado porque esse conteúdo é
  editável pelo usuário e pode ficar desatualizado.
- Implementar persistência própria de tokens: rejeitado por aumentar risco de
  vazamento e duplicar o cliente oficial.

**Sources**:

- [Supabase getUser](https://supabase.com/docs/reference/javascript/auth-getuser)
- [Supabase auth state changes](https://supabase.com/docs/reference/javascript/auth-onauthstatechange)
- [Supabase user sessions](https://supabase.com/docs/guides/auth/sessions)
- [Supabase RLS and auth metadata](https://supabase.com/docs/guides/database/postgres/row-level-security)

## 5. Carregamento do contexto operacional

**Decision**: Consultar explicitamente o próprio registro em `usuarios` por
`auth_user_id`, depois seus vínculos ativos e os `postos` ativos. Aplicar os
níveis existentes: Operador aceita `operacional`/`consulta`; Supervisão aceita
`supervisao`; Direção/Administração recebe `escopo_global = true` sem depender de
vínculo.

**Rationale**: Esse desenho reaproveita as entidades e policies da Spec 001,
detecta remoções na interação protegida seguinte e evita duplicar regras em JWT.
As consultas selecionam apenas colunas necessárias e nunca usam chave
privilegiada.

**Alternatives considered**:

- Criar nova tabela de permissões: rejeitado por violar o escopo.
- Manter contexto indefinidamente em cache: rejeitado porque atrasaria mudanças
  de perfil/vínculo.
- RPC privilegiada para retornar todo o contexto: rejeitada; as policies atuais
  já permitem consultar o próprio perfil e vínculos.

## 6. Login e logout

**Decision**: Usar `signInWithPassword()` e mensagem neutra para falha. Usar
`signOut({ scope: "local" })` para encerrar a sessão do navegador atual. Antes do
logout, tentar registrar o evento auditável; a falha de auditoria não deve
preservar a sessão.

**Rationale**: O escopo local corresponde à ação “sair” da estação atual e evita
encerrar outras estações sem solicitação explícita. O cliente oficial remove a
sessão local e emite o evento de saída.

**Alternatives considered**:

- Logout global padrão: rejeitado porque surpreenderia o usuário ao encerrar
  outros dispositivos.
- Limpar manualmente apenas o armazenamento: rejeitado porque não revoga a
  sessão correspondente.

**Sources**:

- [Password-based Auth](https://supabase.com/docs/guides/auth/passwords)
- [Signing out](https://supabase.com/docs/guides/auth/signout/)

## 7. Recuperação e redefinição de senha

**Decision**: Usar o fluxo client-side padrão do Supabase para SPA:
`resetPasswordForEmail()` com URL exata permitida,
`PASSWORD_RECOVERY` para abrir a tela de nova senha e `updateUser()` para
concluir. A resposta à solicitação será sempre neutra.

**Rationale**: O fluxo oficial fornece autorização temporária e validação de
vigência sem armazenar código no Doka. URLs de produção devem ser exatas na
allowlist. Mailpit valida o fluxo local; entrega de e-mail em produção depende da
configuração de e-mail do projeto Supabase.

**Alternatives considered**:

- Recuperação administrativa manual: rejeitada porque não atende a spec.
- Serviço de e-mail implementado pela aplicação: rejeitado como integração
  externa fora do escopo.
- Armazenar token/código no Doka: rejeitado por segurança e pela spec.

**Sources**:

- [Supabase password reset](https://supabase.com/docs/guides/auth/passwords)
- [Supabase redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls)

## 8. Chaves e exposição da Data API

**Decision**: O bundle usa somente URL e chave publicável (`sb_publishable_*`).
Nenhuma variável `VITE_*` pode conter chave secreta ou `service_role`. A nova RPC
recebe `GRANT EXECUTE` explícito para `authenticated` e `REVOKE` para `PUBLIC` e
`anon`.

**Rationale**: As chaves legadas serão descontinuadas até o fim de 2026. Desde
maio de 2026, novos projetos não expõem automaticamente tabelas/funções à Data
API; grants e RLS são camadas separadas. Os grants existentes das tabelas serão
preservados.

**Alternatives considered**:

- Continuar usando `SUPABASE_ANON_KEY` no novo frontend: rejeitado por iniciar a
  aplicação já dependente de uma chave legada.
- Usar chave secreta no browser: rejeitado porque contorna controles e expõe o
  projeto.
- Conceder escrita direta em `historico_auditoria`: rejeitado porque permitiria
  eventos arbitrários.

**Sources**:

- [Migration to publishable and secret keys](https://supabase.com/docs/guides/getting-started/migrating-to-new-api-keys)
- [Breaking change: explicit Data API grants](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically)

## 9. Auditoria de autenticação

**Decision**: Criar apenas
`public.registrar_evento_autenticacao(p_acao text)`, uma RPC transacional com
allowlist. Ela deriva o ator de `auth.uid()`, resolve um único usuário operacional
não removido, não aceita metadata livre e insere diretamente o evento fixo em
`historico_auditoria` sob os privilégios controlados da função. Ações:
`acesso_interno_concedido`, `sessao_encerrada`,
`sessao_expirada_detectada` e `acesso_operacional_bloqueado`.

**Rationale**: `authenticated` não possui inserção direta na auditoria. Uma
função restrita permite os eventos exigidos sem reabrir a tabela. Quando não
houver sessão válida ou usuário operacional associável, nenhum evento será
fabricado. A expiração é best-effort: só é registrada se o servidor ainda puder
confirmar o ator.

**Alternatives considered**:

- Inserção direta do frontend: rejeitada pelos privilégios existentes e por
  permitir falsificação.
- Edge Function com chave secreta: rejeitada por ampliar a arquitetura.
- Auditar credenciais inválidas: rejeitado porque não existe ator operacional
  confirmado e isso aumentaria exposição/ruído.

## 10. Design system

**Decision**: Reutilizar `design-system/styles.css`, tokens, Poppins, logos e
ícones. Portar apenas os componentes necessários (`Button`, `Input`, `Card`,
`Avatar`, `IconButton`) para TSX acessível e criar App Shell próprio baseado no
kit de operações, com textos em português.

**Rationale**: Os componentes fonte usam React, mas alguns exemplos dependem de
globais `window` e textos em inglês. A adaptação local mantém a identidade visual
sem importar um runtime de demonstração.

**Alternatives considered**:

- Biblioteca visual externa: rejeitada por competir com o design system oficial.
- Reescrever tokens e ativos: rejeitado por duplicação e risco de divergência.

## 11. Estratégia de testes

**Decision**: Usar Vitest + React Testing Library para unidade/integração,
Playwright para fluxos reais e testes SQL transacionais para a RPC. Estados
Playwright ficam em `playwright/.auth/`, ignorados pelo Git, com contas separadas
por perfil.

**Rationale**: Vitest compartilha o pipeline do Vite; Testing Library testa a
interface como o usuário; Playwright cobre recarga, múltiplas janelas, URL
direta e perfis. Estado autenticado contém credenciais e não pode ser versionado.

**Sources**:

- [Vitest features](https://vitest.dev/guide/features)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright authentication](https://playwright.dev/docs/auth)
