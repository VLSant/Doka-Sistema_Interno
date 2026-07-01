# Research: Assistências MMS — Consulta, Detalhe e Correção Controlada

## 1. Fronteira de acesso

**Decision**: Expor quatro RPCs públicas estreitas para lista, detalhe, histórico
e correção. Todas derivam o ator de `auth.uid()`, revalidam perfil/vínculo/posto
e retornam somente projeções necessárias à interface.

**Rationale**: As tabelas existentes contêm evidência e metadados que a lista
não precisa receber. A projeção no banco mantém filtro, paginação, capacidades e
autorização na mesma operação, evita acesso indevido por ID e permite resposta
neutra para recurso inacessível. Funções `SECURITY DEFINER` serão usadas apenas
onde a projeção precisa atravessar RLS de auditoria/identidade, com
`search_path = ''`, nomes qualificados, revogação de execução pública e grant
explícito a `authenticated`.

**Alternatives considered**:

- Consultas diretas às views existentes: preservam RLS, mas expõem colunas
  excessivas e dificultam histórico unificado e capacidades consistentes.
- Backend/Edge Function: adiciona uma camada fora da arquitetura aprovada.

## 2. Modelo de correção

**Decision**: Reutilizar `cliente_nome_corrigido`, `endereco_corrigido`,
`descricao_mercadoria_corrigida`, `recurso_corrigido` e
`historico_auditoria`. Não criar tabela paralela de correções do espelho.

**Rationale**: A Spec 004 já separa valores importados e corrigidos e seus
triggers registram antes/depois. O histórico central permite reconstruir
correções anteriores, enquanto as colunas atuais representam a correção ativa.

**Alternatives considered**:

- Tabela append-only de correções: duplicaria o contrato implementado e exigiria
  migração de precedência.
- Atualização direta pela SPA: não protege allowlist nem nível do vínculo.

## 3. Concorrência e repetição

**Decision**: Adicionar `versao_registro bigint` a assistências e partes,
incrementada em toda atualização. A RPC bloqueia o alvo, compara
`p_versao_esperada` e somente então aplica uma correção.

**Rationale**: A versão detecta correção concorrente, nova importação ou mudança
para `removido`. Repetição baseada na mesma versão não cria segunda correção nem
evento de sucesso.

**Alternatives considered**:

- Comparar apenas `updated_at`: timestamps são menos explícitos e podem sofrer
  serialização no cliente.
- Last-write-wins: perderia correções.
- Ledger idempotente separado: desnecessário para mutação curta de um registro.

## 4. Autorização de edição

**Decision**: Criar helper privado específico para correção:
Direção/Administração global; Supervisão com vínculo `supervisao`; Operador
somente com vínculo `operacional`; vínculo `consulta` permanece leitura.

**Rationale**: `usuario_tem_acesso_posto` também aceita `consulta` e não basta
para mutação. A RPC exige registro ativo, campo permitido, valor válido e
justificativa. A migration revoga de `authenticated` o `EXECUTE` direto em
`app_private.mms_corrigir_assistencia` e
`app_private.mms_corrigir_parte_assistencia`; somente a RPC pública versionada
permanece como entrada da SPA.

**Alternatives considered**:

- Reutilizar apenas `usuario_tem_acesso_posto`: permitiria edição por consulta.
- Confiar na capacidade da UI: pode ser contornada ou ficar desatualizada.

## 5. Lista, busca e paginação

**Decision**: Usar cursor `(data_atividade desc, id desc)`, página padrão 50 e
máximo 100. Busca parcial de número e cliente usa texto normalizado e
`pg_trgm`; filtros exatos e ordenação usam índices B-tree/partial.

**Rationale**: Cursor evita saltos e duplicações do offset durante importações.
Trigram atende substring em 10.000 registros sem mecanismo externo.

**Alternatives considered**:

- Offset: degrada e muda sob atualizações concorrentes.
- Full Text Search: excessivo para códigos e filtro simples de cliente.
- Apenas prefixo: não atende trecho no meio do número.

## 6. Detalhe e valor vigente

**Decision**: Retornar assistência e partes em uma projeção, incluindo para cada
campo corrigível `{importado, corrigido, vigente}` e `versao_registro`. Partes
removidas são omitidas por padrão e incluídas explicitamente.

**Rationale**: Uma resposta mantém agrupamento e consistência. A precedência
continua `coalesce(corrigido não vazio, importado)`.

**Alternatives considered**:

- Requisição por parte: cria waterfall.
- Somente valor vigente: esconde a origem.

## 7. Histórico e lote de origem

**Decision**: Projetar eventos de `historico_auditoria` da assistência e partes,
enriquecer apenas com dados permitidos e paginar por
`(created_at desc, id desc)`. O link de lote aponta para a Spec 007.

**Rationale**: A auditoria já contém importação, atualização, correção, remoção e
reativação. A RPC evita acesso genérico do Operador à tabela e remove
`raw_json`/metadata técnica.

**Alternatives considered**:

- Consultar auditoria diretamente: policy gerencial e payload amplo.
- Copiar eventos: criaria histórico paralelo.

## 8. Estado de interface

**Decision**: Manter filtros no query string, estado remoto discriminado e
componentes para carregamento, atualização, vazio, sem resultado, acesso
negado, sessão expirada e falha. Conflito preserva o texto digitado e exige
revisão.

**Rationale**: URL reproduzível preserva contexto; estados discriminados evitam
que erro pareça vazio ou sucesso.

**Alternatives considered**:

- Filtros só em memória: perde contexto.
- Reenvio automático após conflito: pode sobrescrever decisão concorrente.

## 9. Segurança Supabase atual

**Decision**: Manter RLS em tabelas expostas, índices nas colunas de policies,
views somente com `security_invoker`, funções privilegiadas com grants mínimos
e nenhuma `service_role` na SPA.

**Rationale**: A documentação Supabase vigente em 2026-06-30 reforça que views
podem ignorar RLS por padrão e que funções privilegiadas exigem configuração e
grants explícitos. A mudança de changelog sobre OpenAPI via chave anônima não
afeta esta feature, que usa sessão autenticada e RPCs nomeadas.

**Alternatives considered**:

- View padrão: risco de contornar RLS.
- `user_metadata` para autorização: editável pelo usuário.

## 10. Estratégia de validação

**Decision**: Testar SQL em transações com rollback no projeto remoto de
desenvolvimento, executar lint/advisors e Vitest/Testing Library. Navegação E2E,
teclado, foco e layouts ficam em uma matriz de aceite manual executada pelo
usuário.

**Rationale**: O projeto já usa esse ambiente e não depende de Docker local.
SQL prova a barreira autoritativa; testes de componentes cobrem estados e
interações isoladas; o aceite manual prova a jornada real no navegador.

**Alternatives considered**:

- Somente mocks: não comprovam RLS, concorrência ou imutabilidade.
- Produção: incompatível com o processo.

## Referências

- `https://supabase.com/docs/guides/database/postgres/row-level-security`
- `https://supabase.com/docs/guides/database/functions`
- `https://supabase.com/docs/guides/database/postgres/indexes`
- `https://supabase.com/docs/guides/database/full-text-search`
- `https://supabase.com/changelog`
