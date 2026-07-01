# Data Model: Assistências MMS — Interface Operacional

## Visão geral

A feature não cria nova fonte de domínio. Ela estende o espelho da Spec 004 com
controle de concorrência e cria projeções de leitura sobre entidades existentes.

```text
posto
  `-- mms_assistencias
        |-- mms_partes_assistencia
        |-- lotes/linhas de criação e última atualização
        `-- historico_auditoria (assistência e partes)
```

## Entidades persistidas

### `mms_assistencias` (existente, estendida)

Identidade: `posto_id + data_atividade + numero_assistencia_normalizado`.

Campos relevantes existentes:

- identidade, posto, data, número, status e tipo;
- valores importado/corrigido de cliente e endereço;
- lotes/linhas de criação e última atualização;
- `raw_json_resumo`;
- correção, remoção, autoria, timestamps e soft delete.

Campo novo:

- `versao_registro bigint not null default 1`: versão monotônica positiva,
  incrementada em atualização efetiva, inclusive importação, correção, remoção
  ou reativação.

Valores projetados:

- `cliente_nome`: corrigido não vazio, senão importado;
- `endereco`: corrigido não vazio, senão importado;
- `pode_corrigir`: capacidade derivada na consulta.

### `mms_partes_assistencia` (existente, estendida)

Identidade: `assistencia_id + parte_conjunto_normalizada`, equivalente à chave
MMS completa herdada da assistência.

Campos relevantes existentes:

- parte, status e tipo;
- código e descrição da mercadoria;
- recurso/montador;
- demais campos importados somente leitura;
- lotes/linhas, `raw_json`, correção, remoção, autoria e soft delete.

Campo novo:

- `versao_registro bigint not null default 1`, com a mesma semântica da
  assistência.

Valores projetados:

- `descricao_mercadoria`: corrigida não vazia, senão importada;
- `recurso`: corrigido não vazio, senão importado.

### `historico_auditoria` (existente)

Fonte central para criação, importação, correção, `removido`, reativação e soft
delete. A interface recebe somente:

- `id`, `created_at`, ação;
- entidade e parte quando aplicável;
- ator legível quando autorizado;
- lote e linha;
- campo, valores permitidos e justificativa.

Não retorna evidência bruta, tokens, caminhos internos ou metadata integral.

### Lote e linha de importação (existentes)

Referências de criação e atualização. Abrir o lote transfere a decisão de acesso
à Spec 007.

## Projeções de aplicação

### `AssistanceListItem`

- identidade, número, posto e data;
- cliente vigente, tipo, status e situação;
- totais de partes;
- versão e capacidade.

### `AssistanceDetail`

- resumo da assistência;
- cliente/endereço como `EffectiveField`;
- partes;
- referências de origem;
- capacidades;
- quantidade de partes removidas omitidas.

### `EffectiveField`

```text
importado: text|null
corrigido: text|null
vigente: text|null
origem_vigente: importacao|correcao|ausente
```

### `AssistanceHistoryEvent`

- cursor `{created_at, id}`;
- tipo, ação, entidade e parte;
- ator/origem;
- campo, valores e justificativa;
- lote/linha e capacidade de abrir lote.

## Regras de validação

- Alvo deve existir, não estar soft-deleted e pertencer ao posto autorizado.
- Correção só ocorre quando `status_interno = ativo`.
- Assistência aceita apenas `cliente_nome` e `endereco`.
- Parte aceita apenas `descricao_mercadoria` e `recurso`.
- Valor é texto normalizado e justificativa é obrigatória.
- A versão esperada deve ser exatamente a versão bloqueada.
- Evidência bruta nunca é atualizada pela correção.
- Sucesso incrementa versão uma vez e gera auditoria central.

## Estados

```text
ativo --importação completa sem a chave--> removido
removido --reaparecimento elegível-------> ativo
```

A interface não executa essas transições.

```text
versão N
  |-- autorização/campo/valor inválido --> sem alteração
  |-- versão esperada diferente -------> conflito
  `-- válida --------------------------> correção + versão N+1 + auditoria
```

## Índices planejados

- Assistências `(data_atividade desc, id desc)` onde não soft-deleted;
- `(posto_id, data_atividade desc, id desc)` onde não soft-deleted;
- filtros de situação, status e tipo;
- GIN trigram no número normalizado;
- GIN trigram na expressão do cliente vigente normalizado;
- Partes `(assistencia_id, status_interno, id)`;
- Auditoria `(entidade_tipo, entidade_id, created_at desc, id desc)`.

Confirmar com `EXPLAIN (ANALYZE, BUFFERS)` e advisors em 10.000 registros.

## Segurança e grants

- Tabelas mantêm RLS.
- RPCs públicas recebem `EXECUTE` somente para `authenticated`.
- `PUBLIC` e `anon` não executam as RPCs.
- As duas funções privadas antigas de correção perdem `EXECUTE` para
  `authenticated`; podem permanecer internas ou ser substituídas pela nova
  rotina transacional, mas não ficam diretamente chamáveis pela SPA.
- Nenhuma função confia em ator, perfil ou posto vindo do cliente.
- Funções privilegiadas usam nomes qualificados e `search_path = ''`.
- SPA usa apenas chave publicável e sessão do usuário.
