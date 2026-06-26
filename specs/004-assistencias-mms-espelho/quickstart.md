# Quickstart: Assistencias MMS - Espelho Operacional Idempotente

## Prerequisites

- Spec 01 aplicada, incluindo `usuarios`, `postos`, `usuarios_postos`, funcoes de
  permissao, RLS base e `historico_auditoria`.
- Spec 03 aplicada, incluindo `mms_lotes_importacao`,
  `mms_linhas_importacao`, status oficiais, campos candidatos e `raw_json`.
- Supabase CLI, Docker e psql disponiveis para validacao local quando possivel.

## Expected Files After Implementation

```text
supabase/migrations/202606260001_assistencias_mms_espelho.sql
supabase/seed/assistencias_mms_espelho.sql
supabase/policies/assistencias_mms_espelho.md
supabase/tests/assistencias_mms_idempotencia.sql
supabase/tests/assistencias_mms_rls.sql
supabase/tests/assistencias_mms_auditoria.sql
supabase/tests/assistencias_mms_removido_raw_json.sql
```

## Validation Scenarios

### 1. Principal assistance grouping

1. Preparar um lote elegivel `importado` para um posto/data.
2. Inserir duas linhas elegiveis com mesmo `numero_assistencia` e partes
   diferentes.
3. Executar o processamento do espelho.
4. Esperado: uma linha em `mms_assistencias` e duas linhas em
   `mms_partes_assistencia`.

### 2. Idempotent reprocessing

1. Reexecutar o mesmo processamento tres vezes.
2. Esperado: zero duplicidades em assistencias principais e zero duplicidades em
   partes.

### 3. Update, create and removed

1. Processar lote elegivel inicial com partes A e B.
2. Processar novo lote elegivel completo com parte A alterada e parte C nova.
3. Esperado: A atualizada, C criada, B marcada como `removido`.

### 4. Ineligible lots do not remove

1. Processar lote inicial elegivel com partes A e B.
2. Processar ou tentar processar lote `erro`, `cancelado`, incompleto ou parcial
   contendo apenas A.
3. Esperado: B nao vira `removido`.

### 5. Reactivation

1. Marcar B como `removido` por ausencia em lote elegivel completo.
2. Processar novo lote elegivel em que B reaparece.
3. Esperado: B retorna para `ativo` com lote/linha mais recentes atualizados.

### 6. Raw evidence and manual correction

1. Processar parte com `raw_json`.
2. Corrigir campo operacional autorizado da allowlist v1.
3. Reimportar a mesma parte com valor MMS diferente.
4. Esperado: `raw_json` preservado, valor importado atualizado, valor corrigido
   distinguivel e valor visivel seguindo precedencia da correcao ativa.
5. Tentar corrigir campo fora da allowlist.
6. Esperado: operacao rejeitada.

### 6.1 Direct raw evidence update protection

1. Tentar atualizar diretamente `mms_partes_assistencia.raw_json`.
2. Tentar atualizar diretamente `mms_assistencias.raw_json_resumo`.
3. Esperado: ambas as operacoes sao bloqueadas fora de rotina de importacao
   aprovada e auditada.

### 7. RLS by profile and posto

1. Criar assistencias e partes para pelo menos 3 postos.
2. Validar usuario sem perfil, Operador, Supervisao e Direcao/Admin.
3. Esperado: usuario sem perfil bloqueado; Operador e Supervisao veem 0 registros
   fora do escopo; Direcao/Admin ve todos.

### 8. Audit history

1. Executar criacao, atualizacao por importacao, correcao manual, marcacao
   `removido` e reativacao.
2. Esperado: cada acao bem sucedida gera evento coerente em
   `historico_auditoria`; operacoes bloqueadas nao geram evento de sucesso.

## Suggested Commands

```powershell
supabase db reset
psql "$env:SUPABASE_DB_URL" -f supabase/tests/assistencias_mms_idempotencia.sql
psql "$env:SUPABASE_DB_URL" -f supabase/tests/assistencias_mms_rls.sql
psql "$env:SUPABASE_DB_URL" -f supabase/tests/assistencias_mms_auditoria.sql
psql "$env:SUPABASE_DB_URL" -f supabase/tests/assistencias_mms_removido_raw_json.sql
```

Use validacao remota via Supabase MCP quando o ambiente local nao estiver
disponivel.

## Implementation Validation Notes

Em 2026-06-26, a implementacao criou os arquivos finais esperados, a migration
`202606260001_assistencias_mms_espelho.sql`, seed, documentacao de policies e os
quatro testes SQL.

Atualizacao de revisao em 2026-06-26:

- `authenticated` ficou restrito a `SELECT` nas tabelas finais e views; DML
  operacional direto foi removido da superficie publica.
- Alteracoes em `raw_json` e `raw_json_resumo` agora exigem flag interna e
  contexto de rotina privilegiada, e as funcoes desligam o flag antes de
  retornar.
- `raw_json_resumo` da assistencia principal passou a consolidar as linhas
  elegiveis do servico no lote, em vez de manter apenas a ultima parte
  processada.
- Os testes foram ajustados para cobrir bloqueio de DML direto e tentativa de
  bypass do flag local por usuario autenticado.

Validacoes executadas localmente:

- `supabase --version`: CLI 2.107.0 disponivel.
- `git diff --check`: sem erros nos arquivos novos.
- Varredura estatica com `rg` para tabs, trailing whitespace, marcadores de
  pendencia e mojibake nos arquivos da Spec 04: sem ocorrencias.
- Nova tentativa de `supabase db reset` apos os ajustes de RLS/raw evidence:
  ainda bloqueada pelo Docker Desktop/daemon indisponivel no Windows.

Validacoes bloqueadas pelo ambiente local:

- `supabase db reset` falhou porque o Docker Desktop/daemon nao esta acessivel
  neste Windows.
- Os testes SQL individuais dependem do banco local resetado ou de
  `SUPABASE_DB_URL`; nao foram executados neste ambiente.
- Validacao remota via Supabase MCP/advisors nao foi executada porque nao ha
  `project_id`, `.mcp.json` ou `supabase/config.toml` no workspace para
  identificar um projeto de validacao aprovado.

## Remote Validation Fallback

Quando Docker, Supabase CLI local ou psql nao estiverem disponiveis:

1. Aplicar migrations em ambiente remoto de validacao aprovado.
2. Executar os testes SQL da Spec 04 por MCP Supabase ou canal remoto
   equivalente.
3. Consultar advisors/logs do Supabase apos a aplicacao.
4. Registrar no resultado da implementacao quais testes rodaram localmente e
   quais rodaram por fallback remoto.
