# Implementation Plan: Fundação da Aplicação Web, Autenticação e Navegação

**Branch**: `main` | **Date**: 2026-06-26 | **Spec**: `specs/005-fundacao-app-autenticacao/spec.md`

**Input**: Feature specification from `specs/005-fundacao-app-autenticacao/spec.md`

## Summary

Criar a primeira aplicação web executável do Doka como SPA desktop-first em
React e TypeScript. A aplicação usará Supabase Auth para login por e-mail/senha,
restauração, logout e recuperação de senha; consultará `usuarios`,
`usuarios_postos` e `postos` sob as policies existentes para montar o contexto
operacional; e usará React Router para bloquear rotas antes da renderização,
inclusive em acesso direto por URL.

O frontend será estático e não terá backend próprio. RLS continuará sendo a
autoridade de acesso a dados. Uma migration pequena adicionará somente uma RPC
restrita e com ações permitidas para registrar eventos compatíveis em
`historico_auditoria`; nenhuma tabela, perfil, policy de RLS ou regra de escopo
existente será alterada. Os módulos futuros aparecerão apenas como itens
indisponíveis ou destinos neutros autorizados, sem funcionalidade simulada.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19, Node.js 24 LTS para tooling;
SQL PostgreSQL/PL/pgSQL apenas para a RPC de auditoria.

**Primary Dependencies**: Vite 8, React Router em Data Mode,
`@supabase/supabase-js` v2, componentes/tokens do design system Doka, Vitest 4,
React Testing Library e Playwright.

**Storage**: Supabase Auth e PostgreSQL existentes. Não há nova tabela. A sessão
fica sob persistência padrão do cliente Supabase no navegador; o contexto
operacional derivado permanece somente em memória. Eventos compatíveis usam
`historico_auditoria`.

**Testing**: Typecheck e lint; Vitest + React Testing Library para serviços,
máquina de estados, guards, menu e componentes; Playwright para login,
restauração, logout, recuperação, rotas diretas e perfis; testes SQL para a RPC
de auditoria e preservação dos bloqueios existentes.

**Target Platform**: Aplicação web interna desktop/notebook em navegadores
modernos, com prioridade para Chrome, Edge e Firefox suportados pelo build
estável do Vite.

**Project Type**: SPA web client-side integrada diretamente ao Supabase sob RLS.

**Performance Goals**: Em condições normais, pelo menos 95% dos logins e
restaurações devem chegar à área segura ou a um estado acionável em até 3
segundos; transições de menu e estados locais devem responder sem recarga total.

**Constraints**: Português brasileiro; desktop-first; Poppins, paleta e ativos
Doka; nenhum segredo ou chave privilegiada no bundle; chave publicável apenas;
nenhuma autorização baseada em `user_metadata`; nenhum conteúdo protegido antes
da resolução de Auth + contexto operacional; menu não substitui RLS; módulos
futuros sem telas falsas; deploy SPA deve redirecionar URLs desconhecidas pelo
servidor para `index.html` sem impedir a página 404 do roteador.

**Scale/Scope**: Fundação inicial com 3 perfis, múltiplos postos por usuário, 8
destinos principais, 4 fluxos públicos de autenticação/recuperação e 7 estados
globais de feedback. Volume inicial baixo a moderado de usuários internos.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- PASS: A feature não altera dados MMS e não faz o Doka substituir a MMS.
- PASS: O escopo permanece no MVP: fundação web, autenticação, autorização,
  navegação e estados comuns; nenhum módulo operacional futuro é implementado.
- PASS: Autenticação usa Supabase Auth e `auth.users`; autorização consulta as
  entidades da Spec 001 e preserva RLS como barreira final.
- PASS: Operador e Supervisão permanecem restritos aos postos autorizados;
  Direção/Administração mantém escopo global sem vínculo obrigatório.
- PASS: Não são criadas tabelas nem novos modelos de permissão. A única mudança
  de banco é uma RPC de auditoria com allowlist, ator derivado de `auth.uid()`,
  `search_path` fixo e privilégios explícitos.
- PASS: Eventos compatíveis continuam em `historico_auditoria` e não armazenam
  senha, token, código de recuperação, segredo ou metadados livres do cliente.
- PASS: Nenhuma policy de RLS aprovada nas Specs 001–004 é alterada.
- PASS: A mudança não toca ocorrências ou custos extras e, portanto, não altera
  os vínculos obrigatórios com assistência.
- PASS: A mudança não toca `raw_json`, chave operacional MMS, idempotência ou
  marcação `removido`.
- PASS: O frontend reutiliza o design system Doka e é desktop-first.
- PASS: Não há conflito identificado entre README, documentos do MVP, Specs
  001–004, constituição e design system.

## Project Structure

### Documentation (this feature)

```text
specs/005-fundacao-app-autenticacao/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   |-- auth-session-contract.md
|   |-- operational-access-contract.md
|   |-- route-navigation-contract.md
|   `-- audit-contract.md
`-- tasks.md
```

`tasks.md` será criado posteriormente por `/speckit-tasks`.

### Source Code (repository root)

```text
package.json
package-lock.json
tsconfig.json
vite.config.ts
vitest.config.ts
playwright.config.ts
index.html

src/
|-- app/
|   |-- providers.tsx
|   |-- router.tsx
|   `-- routes.ts
|-- components/
|   |-- layout/
|   |-- feedback/
|   `-- ui/
|-- lib/
|   `-- supabase.ts
|-- modules/
|   |-- auth/
|   |   |-- components/
|   |   |-- pages/
|   |   |-- auth-service.ts
|   |   `-- auth-state.ts
|   |-- access/
|   |   |-- access-service.ts
|   |   |-- route-guard.ts
|   |   `-- types.ts
|   `-- navigation/
|       |-- menu-config.ts
|       `-- pages/
|-- services/
|   `-- audit-service.ts
|-- styles/
|   |-- app.css
|   `-- design-system.css
|-- main.tsx
`-- vite-env.d.ts

tests/
|-- unit/
|-- integration/
`-- e2e/

public/
`-- design-system/
    |-- fonts/
    `-- logos/

supabase/
|-- migrations/
|   `-- [timestamp]_auditoria_autenticacao_web.sql
|-- tests/
|   `-- autenticacao_web_auditoria.sql
`-- policies/
    `-- autenticacao_web.md
```

**Structure Decision**: Usar o projeto único já preparado em `src/`, mantendo
separação por módulos de interface. A aplicação é client-side e fala com o
Supabase diretamente, portanto não será criado `backend/`. Componentes
necessários do design system serão portados para TSX em `src/components/ui`;
tokens, fontes, logos e ícones oficiais serão reutilizados sem depender dos
exemplos globais baseados em `window` dos UI kits.

## Phase 0: Research

Pesquisa consolidada em `specs/005-fundacao-app-autenticacao/research.md`.

Decisões principais:

- React 19 + TypeScript + Vite 8 sobre Node.js 24 LTS e npm com lockfile.
- SPA client-side, sem SSR e sem backend próprio.
- React Router Data Mode com loaders para revalidar o contexto antes de cada
  entrada protegida e cobrir URL direta.
- Cliente Supabase único com chave publicável, persistência e renovação padrão de
  sessão; nunca usar chave secreta/service role no navegador.
- `getUser()` para confirmar identidade com o servidor de Auth e consultas RLS
  explícitas para montar perfil/postos; não usar metadados editáveis do JWT.
- `onAuthStateChange` para sincronizar login, logout, expiração, recuperação e
  mudanças entre janelas.
- Fluxo de recuperação padrão para SPA com redirect exato permitido e tratamento
  de `PASSWORD_RECOVERY`.
- RPC pública mínima, `SECURITY DEFINER` apenas por necessidade de escrita na
  auditoria, com `search_path` fixo, allowlist e grants/revokes explícitos.
- Vitest/React Testing Library para unidade e integração; Playwright para
  jornadas reais com os três perfis.

## Phase 1: Design

Artefatos de design:

- `specs/005-fundacao-app-autenticacao/data-model.md`
- `specs/005-fundacao-app-autenticacao/contracts/auth-session-contract.md`
- `specs/005-fundacao-app-autenticacao/contracts/operational-access-contract.md`
- `specs/005-fundacao-app-autenticacao/contracts/route-navigation-contract.md`
- `specs/005-fundacao-app-autenticacao/contracts/audit-contract.md`
- `specs/005-fundacao-app-autenticacao/quickstart.md`

O desenho não adiciona entidades persistentes. Ele define uma máquina de estados
de sessão, um contexto operacional derivado, metadados estáticos de rota/menu e
uma única interface de auditoria.

## Post-Design Constitution Check

- PASS: Os contratos de sessão separam autenticação de autorização operacional.
- PASS: O contexto operacional deriva exclusivamente de `usuarios`,
  `usuarios_postos` e `postos` sob RLS; perfil/posto não vêm de
  `user_metadata`.
- PASS: Rotas e menu aplicam a mesma matriz, mas os contratos declaram
  explicitamente que RLS continua soberana.
- PASS: A RPC de auditoria não recebe entidade, usuário ou metadata arbitrários;
  o banco deriva o ator e grava somente ações canônicas.
- PASS: A mudança de Data API de 2026 é atendida com privilégio `EXECUTE`
  explícito para a nova função e revogação para `PUBLIC`/`anon`.
- PASS: O fluxo de recuperação não cria provisionamento, convite ou gestão
  administrativa de contas.
- PASS: Os destinos indisponíveis são neutros e não simulam dashboard,
  ocorrências, tarefas, MMS, custos, cadastros ou auditoria final.
- PASS: O design visual reutiliza Poppins, tokens, cores, componentes e ativos
  oficiais do Doka.
- PASS: Os testes cobrem RLS por perfil/posto, URL direta, sessão expirada,
  alteração de vínculo/perfil, auditoria sem segredos e desktop.
- PASS: Nenhuma violação constitucional ou conflito documental permanece.
