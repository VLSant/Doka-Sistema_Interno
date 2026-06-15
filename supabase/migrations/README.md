# Migrations Supabase

Esta pasta deve conter as migrations SQL do banco do Doka.

## Ordem sugerida

1. extensões e funções utilitárias;
2. enums/tipos;
3. tabelas base: usuarios, postos, usuarios_postos;
4. cadastros auxiliares;
5. tabelas de importação MMS;
6. assistências e partes;
7. ocorrências;
8. tarefas e rotinas;
9. deslocamentos e custos extras;
10. historico_auditoria;
11. views de dashboard;
12. policies/RLS.

## Convenção sugerida

```txt
YYYYMMDDHHMMSS_nome_da_migration.sql
```

Exemplo:

```txt
202606120001_create_base_tables.sql
```
