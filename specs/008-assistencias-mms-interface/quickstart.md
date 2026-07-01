# Quickstart: Validar Assistências MMS

## Objetivo

Comprovar lista, detalhe em dois níveis, precedência de valores, correção
controlada, histórico, origem e isolamento por perfil/posto.

## Pré-requisitos

- Node.js 24 LTS e npm.
- Supabase CLI compatível, versão confirmada por `--version`.
- Projeto remoto de desenvolvimento conectado; nunca produção.
- `.env.local` somente com URL e chave publicável.
- Operador consulta, Operador operacional, Supervisão e Direção/Administração.
- Dois postos, assistência com múltiplas partes, registro removido, correção
  ativa e múltiplos lotes.

Nenhuma chave secreta ou `service_role` pode estar disponível à SPA.

## Evidências automatizadas — 2026-06-30

- Migration principal aplicada no projeto remoto de desenvolvimento:
  `20260630155153_interface_assistencias_mms.sql`.
- Migration corretiva aplicada:
  `20260630163029_corrigir_escopo_consulta_assistencias_mms.sql`.
- Testes SQL transacionais: schema, grants, RLS, escopo estrito por perfil,
  valor vigente, correção, concorrência, histórico e índices passaram com
  `rollback`.
- Correção real exercitada em transação: versão incrementada, segunda gravação
  com versão antiga recusada, auditoria criada e `raw_json_resumo` preservado.
- Escopo de Supervisão exercitado em transação: vínculo alterado para
  `consulta` foi recusado e revertido.
- Frontend: `npm run typecheck` passou.
- Frontend: `npm run lint` passou sem erros; permaneceram 10 avisos preexistentes
  de Fast Refresh.
- Frontend: Vitest passou com 44 arquivos e 187 testes.
- Frontend: `npm run build` passou.
- Desempenho com 10.000 assistências em transação:
  - lista/cursor: `0,138 ms`, usando `mms_assistencias_lista_cursor_idx`;
  - busca parcial por número: `6,393 ms`, usando
    `mms_assistencias_numero_trgm_idx`.
- Advisors executados após as migrations. Os avisos `SECURITY DEFINER` das
  quatro RPCs são esperados: elas são a fronteira pública autenticada, usam
  `search_path = ''`, grants mínimos e revalidam ator, perfil, vínculo e posto.
  Os demais avisos reportados já existiam fora da Spec 008.
- O lint remoto via Supabase CLI permanece pendente porque o ambiente não possui
  `SUPABASE_ACCESS_TOKEN`. A aplicação e as verificações SQL foram executadas
  pelo conector autenticado do projeto.

## 1. Validação local

```powershell
npm install
npm run typecheck
npm run lint
npm test
npm run build
```

## 2. Preparar a migration

Descubra a sintaxe instalada:

```powershell
npx supabase --version
npx supabase migration new --help
npx supabase db push --help
npx supabase db lint --help
```

Crie o arquivo pelo CLI:

```powershell
npx supabase migration new interface_assistencias_mms
```

Antes de aplicar:

- revisar `versao_registro` e trigger;
- revisar índices de busca e cursor;
- confirmar RLS existente;
- revisar toda função `SECURITY DEFINER`;
- confirmar `search_path = ''`, nomes qualificados, `REVOKE` e `GRANT`;
- confirmar revogação das duas funções privadas legadas de correção;
- confirmar ator/perfil/posto derivados da sessão/banco;
- confirmar que correção não toca evidência bruta;
- executar dry-run no projeto de desenvolvimento:

```powershell
npx supabase db push --linked --dry-run
```

## 3. Testes SQL transacionais

Executar cada arquivo com rollback:

```sql
begin;

-- conteúdo integral do teste

rollback;
```

Arquivos esperados:

- `assistencias_mms_interface_consulta_rls.sql`;
- `assistencias_mms_interface_correcao.sql`;
- `assistencias_mms_interface_concorrencia.sql`;
- `assistencias_mms_interface_historico.sql`;
- `assistencias_mms_interface_desempenho.sql`.

Verificar:

1. Operador consulta lê, mas não corrige.
2. Operador operacional corrige só posto vinculado.
3. Supervisão exige vínculo `supervisao`.
4. Direção/Administração possui escopo global.
5. Usuário sem perfil e ID fora do escopo recebem negação neutra.
6. `removido` fica oculto por padrão.
7. Filtros/cursor não duplicam itens.
8. Assistência agrupa partes.
9. Corrigido prevalece sobre importado.
10. Campo fora da allowlist é bloqueado.
11. Duas sessões na mesma versão produzem um sucesso e um conflito.
12. Repetição não duplica auditoria.
13. Evidência permanece byte a byte idêntica.
14. Histórico une assistência/partes sem payload bruto.
15. Abrir lote não amplia autorização.

## 4. Lint, advisors e planos

Após aplicar no desenvolvimento:

```powershell
npx supabase db lint --linked --schema public --level error
```

- executar advisors de segurança e desempenho;
- verificar grants das quatro RPCs;
- confirmar RLS em tabelas expostas;
- inspecionar `EXPLAIN (ANALYZE, BUFFERS)` com 10.000 registros;
- confirmar índices de cursor, posto/data e trigram;
- revisar logs somente se testes/RPCs falharem.

## 5. Validação frontend

### Vitest/Testing Library

- mapeamento das RPCs e erros;
- filtros/query string/cursor;
- estados vazio, erro, atualização e acesso negado;
- agrupamento de partes;
- importado/corrigido/vigente;
- capacidades por perfil/vínculo;
- diálogo, sucesso e conflito;
- histórico e origem.

### Aceite E2E manual — execução pelo usuário

Esta seção não será automatizada. O usuário executará e registrará o resultado
de cada cenário no navegador.

- [ ] Acessar menu, lista e URL direta por perfil.
- [ ] Combinar todos os filtros.
- [ ] Confirmar `removido` oculto inicialmente.
- [ ] Abrir assistência com várias partes.
- [ ] Alternar partes removidas.
- [ ] Identificar as três origens de valor.
- [ ] Corrigir os quatro campos nos níveis corretos.
- [ ] Tentar campo proibido, posto alheio e vínculo consulta.
- [ ] Simular dois editores sem perder rascunho.
- [ ] Abrir histórico e lote autorizado.
- [ ] Tentar lote não autorizado sem vazamento.
- [ ] Simular falha e sessão expirada.
- [ ] Navegar por teclado.
- [ ] Validar foco, rótulos e estado não baseado só em cor.
- [ ] Validar 1280×720 e 1440×900.

## 6. Desempenho

Com 10.000 assistências:

- 95% das listagens/filtros mostram resultado ou progresso em até 2 s;
- página padrão 50 e máximo 100;
- detalhe não faz uma consulta por parte;
- histórico permanece paginado;
- payload não inclui evidência bruta;
- planos usam índices adequados.

## 7. Evidências de conclusão

Registrar migration, testes SQL, lint/advisors, typecheck, lint, Vitest, build,
plano de 10.000 registros, matriz E2E manual executada pelo usuário e
confirmação de evidência inalterada.
