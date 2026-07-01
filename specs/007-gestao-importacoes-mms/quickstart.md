# Quickstart: Validar Gestão de Importações MMS

## Objetivo

Comprovar consulta, correção concorrente, reprocessamento e desfazer sem perder
evidência, violar escopo ou produzir efeitos duplicados.

## Pré-requisitos

- Node.js 24 LTS e npm.
- Supabase CLI 2.108.0 ou versão compatível verificada por `--version`.
- Projeto remoto de desenvolvimento conectado; nunca produção.
- Acesso autorizado ao executor SQL/MCP e aos advisors do projeto.
- `.env.local` apenas com URL e chave publicável.
- Usuários de teste: Operador consulta, Operador operacional, Supervisão e
  Direção/Administração.
- Pelo menos dois postos e lotes simples/multi-posto das Specs 003–006.

Nenhuma chave secreta/service role deve estar disponível à SPA. Docker local não
é requisito.

## 1. Validações locais

```powershell
npm install
npm run typecheck
npm run lint
npm test
npm run build
```

As jornadas completas no navegador serão validadas manualmente pelo usuário. A
Spec 007 não adiciona nem exige execução de testes E2E automatizados.

## 2. Preparar e revisar a migration

Descubra a sintaxe no ambiente antes de usar o CLI:

```powershell
npx supabase --version
npx supabase migration new --help
npx supabase db push --help
npx supabase db lint --help
```

Crie a migration pelo CLI, não inventando timestamp:

```powershell
npx supabase migration new gestao_importacoes_mms
```

Antes de aplicar:

- revisar tabelas/colunas/constraints/índices;
- revisar cada função `SECURITY DEFINER`;
- confirmar `search_path`, `REVOKE` e `GRANT`;
- confirmar RLS nas tabelas novas;
- confirmar que nenhum update pode alterar `raw_json` ou `json_normalizado`;
- executar dry-run no projeto remoto conectado:

```powershell
npx supabase db push --linked --dry-run
```

A aplicação efetiva exige confirmação humana de que o link aponta para o projeto
de desenvolvimento.

## 3. Testes SQL remotos

Execute os arquivos da feature como consultas transacionais com rollback:

```sql
begin;

-- conteúdo integral do teste

rollback;
```

Cobertura esperada:

- `gestao_importacoes_mms_consulta_rls.sql`;
- `gestao_importacoes_mms_correcao.sql`;
- `gestao_importacoes_mms_concorrencia.sql`;
- `gestao_importacoes_mms_reprocessamento.sql`;
- `gestao_importacoes_mms_desfazer.sql`;
- `gestao_importacoes_mms_atomicidade.sql`;
- `gestao_importacoes_mms_auditoria.sql`.

Verifique:

1. perfis e postos, incluindo lote multi-posto parcialmente visível;
2. arquivo bloqueado sem cobertura integral;
3. correção append-only e versões concorrentes;
4. evidência original byte a byte inalterada;
5. conclusão bloqueada por erro pendente;
6. reprocessamento da versão vigente;
7. repetição da chave idempotente;
8. resposta incerta recuperável;
9. lote histórico bloqueado para desfazer;
10. predecessores diferentes restaurados por escopo;
11. dependência posterior invalidando análise;
12. falha no último escopo revertendo todos os anteriores;
13. ausência de evento falso de sucesso.

Após os testes:

- confirme rollback;
- rode lint remoto do schema quando autorizado;
- consulte advisors de segurança e desempenho;
- revise logs somente se algum teste/RPC falhar.

## 4. Validação frontend

### Vitest/Testing Library

- mapeamento de respostas;
- filtros/cursor;
- capacidades por perfil;
- estados vazios e falhas;
- formulário de correção;
- conflito de versão;
- confirmação idempotente;
- retomada de resposta incerta;
- análise desatualizada.

## 5. Aceite manual

O usuário executará e registrará manualmente:

1. acesso por menu e URL direta;
2. foco, teclado e distinção visual/textual de erro, alerta e status;
3. rotas de lista, nova importação, detalhe e tratamento;
4. layout em 1440×900 e 1280×720;
5. Operador consulta vê dados, mas não corrige;
6. Operador operacional corrige no próprio posto, mas não conclui;
7. Supervisão conclui e reprocessa apenas com cobertura integral;
8. Direção/Administração consulta globalmente;
9. dois usuários editam o mesmo campo e o segundo recebe conflito;
10. clique repetido não duplica reprocessamento/desfazer;
11. queda simulada após confirmação permite consultar a operação;
12. nova dependência após análise bloqueia desfazer;
13. lote mais recente restaura o predecessor correto por posto/data;
14. arquivo, staging, correções e auditoria permanecem após Cancelado.

## 6. Desempenho

Com lote de 10.000 linhas:

- listagem/filtro deve mostrar resultado ou progresso em até 2 segundos em pelo
  menos 95% das medições;
- coleções devem permanecer paginadas;
- planos de consulta devem usar índices de lote, linha, posto, data, estado e
  cursor;
- reprocessamento/desfazer devem registrar duração e contadores sem payload
  ilimitado.

## 7. Evidências de conclusão

### Execução automatizada — 2026-06-29/30

- Projeto remoto: `Doka` (`zwxxjbiwpgqjsmaxybbm`), saudável, PostgreSQL 17.
- Migration principal `20260629231841_gestao_importacoes_mms` aplicada e
  registrada, seguida das migrations corretivas de hash, variável de resultado,
  índices de FKs e download de arquivo inexistente.
- `supabase db lint --linked --schema public --level error`: zero erros.
- Nove arquivos `gestao_importacoes_mms_*.sql` executados individualmente em
  transação com rollback: todos aprovados.
- Advisors: FKs introduzidas pela feature foram indexadas. Permanecem warnings
  preexistentes e o warning esperado para RPCs públicas `SECURITY DEFINER`;
  todas as RPCs da feature revalidam ator/escopo, usam `search_path=''` e grants
  explícitos.
- Planos inspecionados: predecessor usa
  `mms_lotes_espelho_processado_idx`; lote alvo usa a chave primária.
- `npm run typecheck`: aprovado.
- `npm run lint`: aprovado, com oito warnings preexistentes de Fast Refresh.
- `vitest run --maxWorkers=2`: 34 arquivos e 167 testes aprovados no escopo
  isolado da Spec 007.
- `npm run build`: aprovado.
- Teste unitário de mapeamento com 10.000 itens: aprovado.

### Matriz manual a registrar pelo usuário

- [ ] URL direta protegida redireciona sessão anônima sem expor lote.
- [ ] Menu, central, nova importação, detalhe e tratamento funcionam por perfil.
- [ ] Filtros combinados, limpar e carregar mais preservam cursor/ordem.
- [ ] 1280×720 e 1440×900 não produzem overflow da página; tabela rola
  horizontalmente dentro do próprio contêiner.
- [ ] Navegação completa por teclado, foco visível e retorno de foco dos
  diálogos.
- [ ] Status, erro e alerta possuem texto/ícone e não dependem apenas de cor.
- [ ] Operador consulta não corrige; Operador operacional corrige somente seu
  posto.
- [ ] Supervisão exige cobertura integral para concluir, reprocessar e desfazer.
- [ ] Direção/Administração possui projeção global.
- [ ] Conflito entre dois editores preserva o valor digitado e exige revisão.
- [ ] Clique repetido/rede incerta recupera a mesma operação idempotente.
- [ ] Desfazer exige justificativa, rejeita análise desatualizada e restaura o
  predecessor correto por posto/data.
- [ ] Lote Cancelado preserva arquivo, staging, correções e auditoria.
