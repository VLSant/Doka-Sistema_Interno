# Research: Cadastros Base MVP

## Decision: Implementar a feature como evolucao database-first da Spec 01

**Rationale**: Os requisitos sao cadastros, permissoes, validacoes, soft delete e
auditoria. A fundacao operacional ja fornece Supabase Auth, `usuarios`, `postos`,
`usuarios_postos`, perfis, funcoes auxiliares e `historico_auditoria`.

**Alternatives considered**:
- Criar telas ou camada de API agora: rejeitado porque telas finais e modulos de
  produto estao fora do escopo.
- Criar uma abstracao separada de autorizacao: rejeitado porque RLS e o padrao
  constitucional e ja existe base da Spec 01.

## Decision: Usar RLS em todas as tabelas novas

**Rationale**: A constituicao exige Supabase Auth/RLS e permissoes por perfil e
posto. As tabelas `prioridades`, `tipos_ocorrencia` e `metas_eficiencia` devem
bloquear usuarios sem perfil operacional ativo. `metas_eficiencia` tambem deve
respeitar `posto_id`.

**Alternatives considered**:
- Confiar apenas na aplicacao cliente: rejeitado porque permitiria bypass por API.
- Criar regras somente no frontend: rejeitado pelo mesmo motivo e por fugir do
  padrao da Spec 01.

## Decision: Manter cadastros globais e metas scoped por posto

**Rationale**: `prioridades` e `tipos_ocorrencia` sao cadastros globais de
classificacao. `metas_eficiencia` representa objetivo operacional por posto, entao
deve carregar `posto_id` e respeitar escopo de Operador/Supervisao.

**Alternatives considered**:
- Vincular prioridades e tipos a posto: rejeitado porque a spec define esses
  cadastros como globais.
- Tornar metas globais: rejeitado porque a spec exige metas por posto.

## Decision: Usar colunas normalizadas explicitas

**Rationale**: `nome_normalizado` e `tipo_atividade_normalizado` aparecem nos
requisitos como campos de comparacao. Persistir os valores normalizados facilita
auditoria, debug, constraints e testes. A normalizacao deve remover espacos
externos, reduzir espacos internos repetidos, comparar sem diferenciar
maiusculas/minusculas e tratar acentos de forma consistente.

**Alternatives considered**:
- Usar apenas indices funcionais sem coluna: rejeitado porque dificulta inspecao
  administrativa e torna os testes menos claros.
- Aceitar texto livre sem normalizacao: rejeitado porque permitiria duplicidades
  ativas equivalentes.

## Decision: Bloquear duplicidade ativa com constraints e indices parciais

**Rationale**: A feature precisa permitir historico e recriacao apos soft delete,
mas impedir duplicidade operacional ativa. Indices unicos parciais sobre registros
`ativo = true` e `deleted_at is null` atendem esse comportamento para
`prioridades.nome_normalizado`, `prioridades.nivel` e
`tipos_ocorrencia.nome_normalizado`.

**Alternatives considered**:
- Bloquear duplicidade historica para sempre: rejeitado porque registros
  logicamente removidos podem permitir recriacao.
- Validar duplicidade somente por trigger: rejeitado quando um indice parcial
  declarativo resolve o caso com menos risco de concorrencia.

## Decision: Usar validacao declarativa para vigencias sobrepostas

**Rationale**: `metas_eficiencia` deve impedir metas ativas sobrepostas para o
mesmo `posto_id` e `tipo_atividade_normalizado`. A abordagem preferida e usar
`btree_gist` e constraint de exclusao sobre o intervalo de vigencia quando o
registro estiver ativo e nao removido logicamente.

**Alternatives considered**:
- Validar somente por consulta antes de inserir: rejeitado por risco de corrida.
- Permitir sobreposicao e resolver por data mais recente: rejeitado porque cria
  regra nova nao prevista na spec.

## Decision: Rejeitar metas para postos inexistentes, inativos ou removidos

**Rationale**: A spec exige vinculo a posto existente, ativo e nao removido. A FK
garante existencia; uma validacao adicional deve bloquear criacao/reativacao para
posto inativo ou soft-deleted.

**Alternatives considered**:
- Aceitar metas para posto inativo para uso futuro: rejeitado porque conflita com
  a regra explicita da spec.
- Remover metas automaticamente ao inativar posto: rejeitado porque criaria
  comportamento fora do escopo.

## Decision: Centralizar auditoria por trigger em historico_auditoria

**Rationale**: A constituicao e a Spec 01 exigem historico centralizado. A feature
deve registrar `criado`, `atualizado`, `ativado`, `inativado` e
`excluido_logicamente` para as tres tabelas.

**Alternatives considered**:
- Registrar auditoria apenas pela aplicacao: rejeitado porque operacoes diretas
  no banco ou via API poderiam ficar sem historico.
- Criar uma tabela de auditoria por cadastro: rejeitado porque viola o historico
  centralizado.

## Decision: Restringir grants e usar funcoes seguras

**Rationale**: As referencias Supabase recomendam RLS habilitado, policies
explicitas e cuidado com funcoes `security definer`. Funcoes auxiliares devem ter
`search_path` fixo e ficar fora do acesso direto quando forem internas.

**Alternatives considered**:
- Expor funcoes auxiliares diretamente ao cliente: rejeitado quando a funcao
  puder bypassar RLS ou revelar dados internos.
- Usar metadados editaveis de usuario para autorizacao: rejeitado; autorizacao
  deve vir das tabelas operacionais da Spec 01.

## Decision: Validar localmente quando possivel e remotamente quando necessario

**Rationale**: O ambiente local pode nao ter Docker ou `psql`, mas o projeto
Supabase Doka existe para validar migrations. O quickstart deve prever ambos os
caminhos e registrar quando a validacao local nao estiver disponivel.

**Alternatives considered**:
- Depender apenas da validacao remota: rejeitado porque migrations devem ser
  reproduziveis localmente.
- Depender apenas da validacao local: rejeitado porque o ambiente atual pode nao
  conter todos os binarios.

## Baseline Supabase Doka

Verificacao remota do projeto Doka indicou que a Spec 01 esta aplicada, com as
tabelas `usuarios`, `postos`, `usuarios_postos`, `cargos_funcoes` e
`historico_auditoria` no schema `public` com RLS ativo. Os security advisors nao
reportaram lints no momento da pesquisa. Performance advisors ainda reportam
alertas herdados da Spec 01, principalmente indices nao utilizados, FKs de campos
de controle sem indice e policies permissivas multiplas. A Spec 02 deve evitar
introduzir novos alertas equivalentes e deve documentar qualquer alerta residual.
