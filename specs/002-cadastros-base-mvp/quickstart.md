# Quickstart: Cadastros Base MVP

## Prerequisites

- Spec 01 aplicada, incluindo `usuarios`, `postos`, `usuarios_postos`,
  `cargos_funcoes`, `historico_auditoria`, funcoes auxiliares e RLS.
- Supabase CLI instalado para validacao local quando Docker estiver disponivel.
- Acesso ao projeto Supabase remoto Doka para validacao via MCP quando a
  validacao local nao puder rodar.

## Expected Implementation Files

```text
supabase/migrations/[timestamp]_cadastros_base_mvp.sql
supabase/seed/cadastros_base_mvp.sql
supabase/tests/cadastros_base_rls.sql
supabase/tests/cadastros_base_validacoes.sql
supabase/tests/cadastros_base_auditoria.sql
supabase/policies/cadastros_base_mvp.md
```

## Local Validation Flow

1. Confirmar branch:

   ```powershell
   git branch --show-current
   ```

   Expected: `002-cadastros-base-mvp`.

2. Resetar banco local Supabase:

   ```powershell
   supabase db reset
   ```

   Expected: migrations da Spec 01 e Spec 02 aplicadas sem erro.

3. Rodar seed da feature:

   ```powershell
   supabase db query --local --file supabase/seed/cadastros_base_mvp.sql
   ```

   Expected: dados base e usuarios/postos de teste criados ou reutilizados sem
   duplicidade ativa indevida.

4. Rodar validacoes RLS:

   ```powershell
   supabase db query --local --file supabase/tests/cadastros_base_rls.sql
   ```

   Expected:

   - Usuario sem perfil ativo nao acessa cadastros.
   - Operador consulta apenas ativos e metas de postos do escopo.
   - Supervisao gerencia apenas metas de postos do escopo.
   - Direcao/Admin gerencia todos os cadastros.

5. Rodar validacoes de constraints:

   ```powershell
   supabase db query --local --file supabase/tests/cadastros_base_validacoes.sql
   ```

   Expected:

   - Duplicidades ativas sao rejeitadas.
   - Metas para postos inexistentes, inativos ou removidos sao rejeitadas.
   - Vigencias sobrepostas sao rejeitadas.
   - Soft delete exige motivo e usuario.

6. Rodar validacoes de auditoria:

   ```powershell
   supabase db query --local --file supabase/tests/cadastros_base_auditoria.sql
   ```

   Expected:

   - `criado`, `atualizado`, `ativado`, `inativado` e
     `excluido_logicamente` sao registrados para cada cadastro.
   - Operacoes bloqueadas nao geram eventos de sucesso.

## Remote Validation Flow

Quando Docker, Supabase local ou `psql` nao estiverem disponiveis, validar no
projeto remoto Doka via MCP Supabase:

1. Confirmar migrations aplicadas no projeto Doka.
2. Confirmar existencia das tabelas `prioridades`, `tipos_ocorrencia` e
   `metas_eficiencia`.
3. Confirmar RLS habilitado nas tres tabelas.
4. Confirmar policies por perfil/posto.
5. Confirmar indices e constraints principais.
6. Rodar cenarios SQL de validacao com dados de teste e cleanup.
7. Rodar security e performance advisors e documentar alertas residuais.

## Baseline Notes

No momento do planejamento, o projeto Doka remoto ja continha as migrations da
Spec 01 aplicadas e security advisors sem lints. Performance advisors indicavam
alertas herdados da Spec 01, principalmente indices nao utilizados, FKs de
controle sem indice e multiplas policies permissivas. A implementacao da Spec 02
deve evitar adicionar novos alertas equivalentes e registrar qualquer pendencia
encontrada.

## Completion Criteria

A feature so deve ser considerada pronta quando:

- Todos os arquivos esperados existirem.
- Todas as tabelas novas usarem portugues `snake_case`, PK `id`, FKs `_id`,
  soft delete e RLS.
- RLS bloquear usuario sem perfil operacional ativo.
- Operador consultar apenas dados ativos permitidos.
- Supervisao respeitar escopo de posto em `metas_eficiencia`.
- Direcao/Admin gerenciar todos os cadastros.
- Duplicidades e vigencias invalidas forem rejeitadas.
- Acoes criticas gerarem `historico_auditoria`.
- Nenhum modulo fora do escopo tiver sido criado.

## Validation Results - 2026-06-20

### Local

- `supabase --version`: nao executado com sucesso; a Supabase CLI nao esta
  instalada no PATH desta maquina (`supabase` nao reconhecido pelo PowerShell).
- `supabase db reset`: nao executado localmente pelo mesmo motivo.
- `supabase db query --local --file ...`: nao executado localmente pelo mesmo
  motivo.

### Remote Doka via MCP Supabase

Projeto validado: `Doka` (`zwxxjbiwpgqjsmaxybbm`).

Migrations aplicadas para esta spec:

- `cadastros_base_mvp`
- `ajustar_validacao_metas_eficiencia`
- `liberar_funcao_soft_delete_cadastros`
- `refinar_cadastros_base_advisors`

Seeds executados:

- `supabase/seed/fundacao_operacional_seed.sql`
- `supabase/seed/cadastros_base_mvp.sql`

Validacoes executadas com sucesso no remoto:

- Constraints e regras de duplicidade/vigencia de
  `supabase/tests/cadastros_base_validacoes.sql`.
- RLS por perfil e posto de `supabase/tests/cadastros_base_rls.sql`.
- Auditoria centralizada de `supabase/tests/cadastros_base_auditoria.sql`.
- Verificacao curta pos-hardening confirmando sem perfil bloqueado, Operador
  restrito ao escopo e Direcao/Admin com visao global.

Tabelas remotas confirmadas com RLS ativo:

- `prioridades`
- `tipos_ocorrencia`
- `metas_eficiencia`

Advisor final de seguranca:

- Sem lints de RLS/tabelas da Spec 02.
- Permanece alerta de configuracao do projeto Supabase Auth:
  `auth_leaked_password_protection` desabilitado.

Advisor final de performance:

- Alertas herdados da Spec 01 permanecem em FKs de controle sem indice e
  policies permissivas multiplas de tabelas da fundacao.
- Na Spec 02, as policies permissivas multiplas foram consolidadas.
- Permanecem alertas `unused_index` em indices recem-criados da Spec 02; mantidos
  porque cobrem FKs, consultas operacionais e RLS, e a base ainda tem uso
  minimo de teste.
