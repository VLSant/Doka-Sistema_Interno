# Doka

Sistema interno de controle operacional e gerencial para acompanhamento de assistências, ocorrências, tarefas, rotinas, produtividade, importações MMS, deslocamentos e custos extras.

## Objetivo

O Doka será uma plataforma interna para centralizar a operação, reduzir perda de informações, acompanhar pendências e melhorar a gestão diária dos postos.

O sistema não substitui a MMS. No MVP, o Doka utilizará importações de planilhas da MMS ao longo do dia como espelho operacional.

## Stack inicial

- Supabase/PostgreSQL
- Supabase Auth
- Row Level Security
- Frontend a definir
- Importação de planilhas MMS
- Documentação em Markdown

## Estrutura do projeto

```txt
doka/
├── docs/
├── supabase/
│   ├── migrations/
│   ├── seed/
│   └── policies/
├── src/
│   ├── app/
│   ├── components/
│   ├── services/
│   ├── lib/
│   └── modules/
├── scripts/
│   └── importacao-mms/
├── .env.example
├── .gitignore
└── README.md
```

## Documentação

Os documentos principais estão em `/docs`:

1. PRD do MVP
2. Regras de Negócio
3. Mapa de Telas e Fluxos
4. Especificação Final da Importação MMS
5. Estrutura Inicial do Banco de Dados
6. Backlog Técnico do MVP

## Ordem inicial de desenvolvimento

1. Supabase e migrations base
2. Autenticação via Supabase Auth
3. Usuários, postos e permissões
4. Policies/RLS
5. Importação MMS
6. Assistências / MMS
7. Ocorrências
8. Tarefas e Rotinas
9. Deslocamentos e Custos Extras
10. Dashboard
