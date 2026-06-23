# Seed Supabase

Esta pasta contem dados iniciais para testes e desenvolvimento.

## Seeds atuais

- `fundacao_operacional_seed.sql`: usuarios Auth ficticios, usuarios operacionais, postos, cargos/funcoes e vinculos usuario/posto.
- `cadastros_base_mvp.sql`: prioridades, tipos de ocorrencia e metas de eficiencia usados nos testes da Spec 02.
- `importacao_mms_staging.sql`: lotes, linhas, erros e alertas MMS ficticios para validar a Spec 03.

## Ordem de execucao sugerida

1. Aplicar as migrations.
2. Executar `fundacao_operacional_seed.sql`.
3. Executar `cadastros_base_mvp.sql`.
4. Executar `importacao_mms_staging.sql`.

## Observacao

Dados sensiveis reais nao devem ser versionados neste repositorio.
