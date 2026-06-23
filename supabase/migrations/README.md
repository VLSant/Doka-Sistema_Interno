# Migrations Supabase

Esta pasta contem as migrations SQL do banco do Doka.

## Ordem sugerida

1. extensoes e funcoes utilitarias;
2. enums/tipos;
3. tabelas base: usuarios, postos, usuarios_postos;
4. cadastros auxiliares;
5. tabelas de importacao MMS;
6. assistencias e partes;
7. ocorrencias;
8. tarefas e rotinas;
9. deslocamentos e custos extras;
10. historico_auditoria;
11. views de dashboard;
12. policies/RLS.

## Migrations atuais

- `202606180001_fundacao_operacional.sql`: fundacao operacional, usuarios, postos, vinculos, perfis, RLS e auditoria.
- `202606190001_ajustar_policies_admin_soft_delete.sql`: ajustes iniciais de policies administrativas.
- `202606190002_corrigir_auditoria_cadastros.sql`: correcao da auditoria generica dos cadastros da fundacao.
- `202606190003_ajustar_update_admin_soft_delete.sql`: refinamento de update administrativo.
- `202606190004_ajustar_select_admin_soft_delete.sql`: refinamento de select administrativo.
- `202606190005_refinar_check_update_admin.sql`: refinamento de `WITH CHECK` administrativo.
- `202606200001_restringir_historico_auditoria_privilegios.sql`: restricao final de privilegios em `historico_auditoria`.
- `202606200002_cadastros_base_mvp.sql`: cadastros base do MVP (`prioridades`, `tipos_ocorrencia`, `metas_eficiencia`), RLS, soft delete, validacoes e auditoria.
- `202606200003_ajustar_validacao_metas_eficiencia.sql`: ajusta a validacao de `metas_eficiencia` para deixar posto inexistente ser tratado pela FK.
- `202606200004_liberar_funcao_soft_delete_cadastros.sql`: libera execucao da funcao compartilhada de soft delete para constraints avaliadas por `authenticated`.
- `202606200005_refinar_cadastros_base_advisors.sql`: move extensoes para `extensions` e consolida policies permissivas equivalentes da Spec 02.
- `202606220001_corrigir_revisao_spec01.sql`: corrige comentarios de revisao da Spec 01 sobre RLS, privilegios da auditoria e `posto_id` no metadata.
- `202606230001_importacao_mms_staging.sql`: cria staging de importacao MMS com lotes, linhas, erros, alertas, RLS, auditoria, raw_json imutavel, soft delete e totais.
- `202606230002_corrigir_status_lote_importacao_mms.sql`: corrige constraint para impedir lote `validado` com status nulo.
- `202606230003_corrigir_totais_linhas_validas_mms.sql`: corrige `total_linhas_validas` para contar linhas ativas sem erro bloqueante.
- `202606230004_liberar_soft_delete_filhos_mms.sql`: explicita policies de soft delete das tabelas filhas MMS.
- `202606230005_liberar_revisao_soft_delete_filhos_mms.sql`: permite revisao gerencial de filhos MMS soft-deleted para viabilizar soft delete sob RLS.
- `202606230006_proteger_rpc_concluir_validacao_mms.sql`: adiciona checagem de escopo gerencial na RPC de conclusao de validacao MMS.

## Convencao sugerida

```txt
YYYYMMDDHHMMSS_nome_da_migration.sql
```
