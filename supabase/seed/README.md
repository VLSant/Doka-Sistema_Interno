# Seed Supabase

Esta pasta contem dados iniciais para testes e desenvolvimento.

## Seeds atuais

- `fundacao_operacional_seed.sql`: usuarios Auth ficticios, usuarios operacionais, postos, cargos/funcoes e vinculos usuario/posto.
- `cadastros_base_mvp.sql`: prioridades, tipos de ocorrencia e metas de eficiencia usados nos testes da Spec 02.

## Ordem de execucao sugerida

1. Aplicar as migrations.
2. Executar `fundacao_operacional_seed.sql`.
3. Executar `cadastros_base_mvp.sql`.

## Observacao

Dados sensiveis reais nao devem ser versionados neste repositorio.
