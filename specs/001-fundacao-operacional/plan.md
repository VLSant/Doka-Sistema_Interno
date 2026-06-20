# Implementation Plan: Fundacao Operacional

**Branch**: `001-fundacao-operacional` | **Date**: 2026-06-17 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-fundacao-operacional/spec.md`

## Summary

Criar a fundacao operacional do Doka para o MVP: vincular usuarios autenticados
ao perfil operacional interno, cadastrar postos e cargos/funcoes, controlar
escopo por `usuarios_postos`, aplicar RLS por perfil/posto e centralizar auditoria
em `historico_auditoria`. A entrega e prioritariamente de banco/Supabase, com
migrations, policies, funcoes auxiliares de permissao, dados seed de validacao e
cenarios de teste de acesso. Importacao MMS, assistencias, ocorrencias, tarefas,
custos e dashboard completo permanecem fora desta feature.

## Technical Context

**Language/Version**: SQL PostgreSQL para migrations Supabase; TypeScript/JavaScript
apenas se a camada de app precisar consumir o perfil operacional.

**Primary Dependencies**: Supabase CLI, Supabase Auth, PostgreSQL, Row Level
Security, funcoes SQL/PLpgSQL para helpers de permissao.

**Storage**: Supabase/PostgreSQL, schema `public` para tabelas operacionais do MVP,
com referencia a `auth.users`.

**Testing**: `supabase db reset`, testes SQL/RLS com usuarios de teste por perfil,
consultas de validacao para permissao, soft delete e auditoria.

**Target Platform**: Aplicacao interna web desktop-first apoiada por Supabase.

**Project Type**: Web application com fundacao backend/database-first.

**Performance Goals**: Validacoes de escopo por posto devem permanecer simples e
reutilizaveis; consultas de permissao devem usar indices em FKs e chaves de escopo.

**Constraints**: Doka nao substitui MMS; feature nao cria modulos MMS nem telas
finais; tabelas/campos em portugues `snake_case`; RLS obrigatoria nas tabelas
expostas; soft delete em registros operacionais; historico centralizado.

**Scale/Scope**: MVP inicial com 3 perfis, 3 a 4 postos iniciais e possibilidade de
novos postos; base preparada para reutilizar permissao por posto em futuras tabelas.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Doka nao substitui MMS: PASS. A feature limita-se a autenticacao, usuarios,
  postos, vinculos, permissoes e auditoria.
- Escopo MVP controlado: PASS. Importacao MMS, assistencias, ocorrencias, tarefas,
  custos, dashboard completo e integracao automatica MMS estao fora do escopo.
- Supabase/PostgreSQL/Auth/RLS: PASS. O plano usa Supabase Auth, PostgreSQL e RLS.
- Portugues `snake_case`, soft delete e `historico_auditoria`: PASS. Todos os
  artefatos usam tabelas/campos em portugues, soft delete quando aplicavel e
  auditoria centralizada.
- Permissoes por perfil e posto: PASS. Operador e Supervisao dependem de escopo em
  `usuarios_postos`; Direcao/Admin tem visao global.
- Ocorrencias/custos exigem assistencia: N/A. Modulos fora desta feature.
- MMS `raw_json`, chave operacional e `removido`: N/A. Importacao MMS fora desta
  feature.
- Frontend Doka desktop-first: N/A para implementacao principal. Qualquer tela
  administrativa futura deve seguir o design system.
- Conflitos com README/docs: nenhum identificado.

## Project Structure

### Documentation (this feature)

```text
specs/001-fundacao-operacional/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   |-- rls-access-contract.md
|   `-- audit-contract.md
`-- checklists/
    `-- requirements.md
```

### Source Code (repository root)

```text
supabase/
|-- migrations/
|   `-- <timestamp>_fundacao_operacional.sql
|-- seed/
|   `-- <seed files for users/postos validation>
`-- policies/
    `-- <optional policy notes or split SQL if kept outside migration>

src/
|-- lib/
|   `-- <Supabase client/profile helpers if app layer exists>
|-- services/
|   `-- <operational profile access service if app layer exists>
`-- modules/
    `-- <future admin/access module if UI is implemented later>
```

**Structure Decision**: Implementar a fundacao primeiro em `supabase/migrations`,
com policies e helpers versionados junto da migration. A camada `src/` so deve ser
tocada se a proxima etapa decidir expor leitura de perfil operacional no app.

## Complexity Tracking

Sem violacoes constitucionais identificadas.
