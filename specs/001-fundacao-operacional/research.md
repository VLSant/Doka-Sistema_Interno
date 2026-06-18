# Research: Fundacao Operacional

## Decision: usar Supabase Auth como identidade e `usuarios` como perfil operacional

**Rationale**: A constituicao e os documentos do MVP definem `auth.users` como fonte
de autenticacao e `usuarios` como tabela propria de perfil operacional. Isso evita
guardar senha no Doka e separa identidade de permissao interna.

**Alternatives considered**:
- Guardar usuarios/senhas em tabela propria: rejeitado por contrariar Supabase Auth.
- Usar apenas claims JWT para perfil/posto: rejeitado porque escopo por posto muda e
precisa ser consultavel/auditavel no banco.

## Decision: manter autorizacao operacional em tabelas, nao em `user_metadata`

**Rationale**: Supabase alerta que `raw_user_meta_data` e editavel pelo usuario e
nao deve ser usado para autorizacao. Perfil e postos ficam em `usuarios` e
`usuarios_postos`; policies consultam essas tabelas ou helpers.

**Alternatives considered**:
- Gravar perfil em metadata editavel: rejeitado por risco de escalacao.
- Gravar perfil em `app_metadata`: aceitavel para casos futuros, mas insuficiente
  para escopo por posto e auditoria operacional do Doka.

## Decision: habilitar RLS em todas as tabelas publicas desta feature

**Rationale**: Supabase recomenda RLS em tabelas de schemas expostos. Policies devem
modelar o acesso real por perfil/posto e nao apenas comparar `auth.uid()` em todas
as tabelas.

**Alternatives considered**:
- Confiar apenas no frontend: rejeitado porque URL/consulta direta poderia burlar
  filtros.
- Usar RLS apenas nas tabelas futuras: rejeitado porque a fundacao ja contem dados
  sensiveis de usuarios, postos e auditoria.

## Decision: helpers de permissao em schema privado ou com search_path fixo

**Rationale**: Funcoes reutilizaveis reduzem repeticao nas policies. Para funcoes
`security definer`, o plano deve evitar expor execucao desnecessaria e fixar
`search_path`, conforme recomendacoes de seguranca Supabase/Postgres.

**Alternatives considered**:
- Repetir subconsultas em cada policy: rejeitado por aumentar risco de divergencia.
- Criar funcoes em schema exposto sem cuidado: rejeitado por aumentar superficie de
  ataque.

## Decision: soft delete com indices parciais para unicidade ativa

**Rationale**: A constituicao exige soft delete. Regras como "um usuario autenticado
tem no maximo um perfil operacional ativo" e "vinculo usuario/posto nao duplica
ativo" precisam de unicidade considerando `deleted_at is null`.

**Alternatives considered**:
- Unicidade global simples: rejeitada porque impediria recriar vinculos apos soft
  delete quando necessario.
- Exclusao fisica para liberar unicidade: rejeitada pela constituicao.

## Decision: auditoria centralizada por evento critico

**Rationale**: `historico_auditoria` e decisao permanente do projeto. Para esta
feature, eventos criticos incluem criacao/edicao de usuario operacional, mudanca de
perfil, ativacao/inativacao, vinculo/desvinculo de posto e soft delete.

**Alternatives considered**:
- Historico por tabela: rejeitado por contrariar a decisao de historico central.
- Auditar apenas via logs de aplicacao: rejeitado por nao garantir rastreabilidade
  no banco.

## Decision: considerar mudanca recente de exposicao da Data API no Supabase

**Rationale**: O changelog Supabase registra breaking change de 2026-04-28 sobre
tabelas nao serem expostas automaticamente a Data/GraphQL API em novos projetos.
O plano deve prever grants explicitos para roles quando a aplicacao precisar
acessar tabelas via API, mantendo RLS habilitada.

**Alternatives considered**:
- Assumir exposicao automatica de tabelas: rejeitado por ser instavel em projetos
  novos.
- Conceder acesso amplo sem RLS: rejeitado por risco de vazamento de dados.

## Supabase references consulted

- Supabase RLS docs: https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase securing API docs: https://supabase.com/docs/guides/api/securing-your-api
- Supabase Auth users docs: https://supabase.com/docs/guides/auth/users
- Supabase changelog: https://supabase.com/changelog
- Supabase RLS performance and best practices: https://supabase.com/docs/guides/troubleshooting/rls-performance-and-best-practices-Z5Jjwv
- Supabase security/performance advisors: https://supabase.com/docs/guides/database/database-advisors
