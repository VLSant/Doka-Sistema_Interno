# Quickstart: Importacao MMS - Lotes, Staging e Validacao Bruta

## Prerequisites

- Spec 01 aplicada, incluindo `usuarios`, `postos`, `usuarios_postos`,
  `cargos_funcoes`, `historico_auditoria`, funcoes auxiliares e RLS.
- Spec 02 aplicada, mantendo cadastros base e padroes database-first.
- Supabase CLI instalado para validacao local quando Docker estiver disponivel.
- Acesso ao projeto Supabase remoto Doka para validacao via MCP quando a
  validacao local nao puder rodar.

## Expected Implementation Files

```text
supabase/migrations/[timestamp]_importacao_mms_staging.sql
supabase/seed/importacao_mms_staging.sql
supabase/tests/importacao_mms_rls.sql
supabase/tests/importacao_mms_validacoes.sql
supabase/tests/importacao_mms_auditoria.sql
supabase/tests/importacao_mms_raw_json_totais.sql
supabase/policies/importacao_mms_staging.md
```

## Local Validation Flow

1. Confirmar branch:

   ```powershell
   git branch --show-current
   ```

   Expected: `003-importacao-mms-staging`.

2. Resetar banco local Supabase:

   ```powershell
   supabase db reset
   ```

   Expected: migrations da Spec 01, Spec 02 e Spec 03 aplicadas sem erro.

3. Rodar seed da feature:

   ```powershell
   supabase db query --local --file supabase/seed/importacao_mms_staging.sql
   ```

   Expected: usuarios/postos de teste e lotes/linhas MMS de exemplo criados sem
   violar escopo de posto ou status oficial.

4. Rodar validacoes RLS:

   ```powershell
   supabase db query --local --file supabase/tests/importacao_mms_rls.sql
   ```

   Expected:

   - Usuario sem perfil ativo nao acessa tabelas MMS.
   - Operador consulta apenas lotes e filhos dos postos do escopo.
   - Supervisao gerencia apenas lotes e validacoes dos postos do escopo.
   - Direcao/Admin gerencia todos os lotes e filhos.

5. Rodar validacoes de constraints e status:

   ```powershell
   supabase db query --local --file supabase/tests/importacao_mms_validacoes.sql
   ```

   Expected:

   - Status fora de `importado`, `importado_com_alertas`, `erro` e `cancelado`
     e rejeitado.
   - Lote para posto inexistente, inativo ou removido e rejeitado.
   - Linha sem `raw_json` e rejeitada.
   - Erros e alertas sem codigo/mensagem sao rejeitados.
   - Erro/alerta vinculado a linha de outro lote e rejeitado.
   - Soft delete exige usuario e motivo e nao muda status oficial.

6. Rodar validacoes de auditoria:

   ```powershell
   supabase db query --local --file supabase/tests/importacao_mms_auditoria.sql
   ```

   Expected:

   - Criacao, validacao, mudanca de status, cancelamento e soft delete geram
     eventos em `historico_auditoria`.
   - Operacoes bloqueadas nao geram eventos de sucesso.

7. Rodar validacoes de `raw_json` e totais:

   ```powershell
   supabase db query --local --file supabase/tests/importacao_mms_raw_json_totais.sql
   ```

   Expected:

   - `raw_json` permanece imutavel apos criacao.
   - Campos candidatos sao persistidos quando extraiveis.
   - Totais do lote batem com linhas, erros e alertas ativos.
   - Lote com erro fica `erro`; lote so com alertas fica
     `importado_com_alertas`; lote sem problemas fica `importado`.

## Remote Validation Flow

Quando Docker, Supabase local ou `psql` nao estiverem disponiveis, validar no
projeto remoto Doka via MCP Supabase:

1. Confirmar migrations aplicadas no projeto Doka.
2. Confirmar existencia das tabelas `mms_lotes_importacao`,
   `mms_linhas_importacao`, `mms_erros_importacao` e
   `mms_alertas_importacao`.
3. Confirmar RLS habilitado nas quatro tabelas.
4. Confirmar policies por perfil/posto.
5. Confirmar indices e constraints principais.
6. Rodar cenarios SQL de validacao com dados de teste e cleanup.
7. Rodar security e performance advisors e documentar alertas residuais.

## Completion Criteria

A feature so deve ser considerada pronta quando:

- Todos os arquivos esperados existirem.
- Todas as tabelas novas usarem portugues `snake_case`, PK `id`, FKs `_id`,
  soft delete e RLS.
- RLS bloquear usuario sem perfil operacional ativo.
- Operador e Supervisao ficarem restritos a postos do escopo.
- Direcao/Admin tiver gestao global.
- `raw_json` for obrigatorio e imutavel apos criacao.
- Campos candidatos forem persistidos e validados.
- Status oficial do lote for limitado aos quatro valores permitidos.
- Erros e alertas forem rastreaveis por lote/linha.
- Totais por lote forem consistentes.
- Acoes criticas gerarem `historico_auditoria`.
- Nenhuma assistencia final, ocorrencia, tarefa, custo extra, dashboard, tela
  final, parser completo ou integracao automatica MMS tiver sido criada.
