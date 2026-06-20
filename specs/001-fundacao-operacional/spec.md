# Feature Specification: Fundacao Operacional

**Feature Branch**: `001-fundacao-operacional`

**Created**: 2026-06-17

**Status**: Draft

**Input**: User description: "Criar a fundacao operacional do Doka para o MVP, incluindo autenticacao via Supabase Auth, tabela operacional de usuarios, cadastro de postos, vinculo entre usuarios e postos, perfis de acesso e historico centralizado de auditoria."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Acessar area interna com perfil operacional (Priority: P1)

Um usuario autenticado precisa entrar no Doka e ter seu perfil operacional ativo identificado para acessar a area interna conforme seu papel.

**Why this priority**: Sem vinculo entre autenticacao e perfil operacional, nenhuma regra de acesso do MVP pode ser aplicada com seguranca.

**Independent Test**: Criar usuarios autenticados com e sem perfil operacional ativo e verificar que apenas usuarios com perfil ativo acessam a area interna.

**Acceptance Scenarios**:

1. **Given** um usuario autenticado com perfil operacional ativo, **When** ele acessa a area interna, **Then** o sistema identifica seu registro operacional, perfil e escopo de postos.
2. **Given** um usuario autenticado sem perfil operacional ativo, **When** ele tenta acessar a area interna, **Then** o acesso e bloqueado e nenhum dado operacional e exibido.
3. **Given** um usuario operacional inativo, **When** ele tenta acessar a area interna, **Then** o acesso e bloqueado mesmo que a autenticacao externa esteja valida.

---

### User Story 2 - Restringir acesso por perfil e posto (Priority: P1)

Operadores, Supervisao e Direcao/Administracao precisam visualizar somente os dados permitidos por seu perfil e pelos postos vinculados ao seu escopo.

**Why this priority**: O controle por perfil e posto e a regra central de seguranca operacional do Doka.

**Independent Test**: Criar postos, vinculos e usuarios de cada perfil; confirmar que cada usuario enxerga exatamente seu escopo permitido.

**Acceptance Scenarios**:

1. **Given** um Operador vinculado ao Posto A, **When** ele consulta dados restritos por posto, **Then** apenas dados do Posto A aparecem.
2. **Given** um Operador sem vinculo ao Posto B, **When** ele tenta acessar dados do Posto B, **Then** o acesso e negado.
3. **Given** um usuario de Supervisao com escopo nos Postos A e B, **When** ele consulta dados operacionais, **Then** apenas dados dos Postos A e B aparecem.
4. **Given** um usuario Direcao/Administracao, **When** ele consulta dados operacionais, **Then** dados de todos os postos aparecem.

---

### User Story 3 - Gerenciar cadastros base de acesso (Priority: P2)

Direcao/Administracao precisa cadastrar e manter usuarios operacionais, postos, vinculos usuario/posto e cargos/funcoes necessarios para preparar a operacao.

**Why this priority**: A operacao precisa de cadastros confiaveis antes de importar MMS ou criar telas operacionais.

**Independent Test**: Criar, editar, inativar e vincular usuarios e postos; verificar que os vinculos ativos controlam acesso e nao permitem duplicidade ativa.

**Acceptance Scenarios**:

1. **Given** um usuario operacional existente e um posto ativo, **When** Direcao/Administracao cria um vinculo entre eles, **Then** o usuario passa a ter acesso ao posto conforme seu perfil e nivel de acesso.
2. **Given** um vinculo ativo entre usuario e posto, **When** alguem tenta criar o mesmo vinculo ativo novamente, **Then** o sistema rejeita a duplicidade.
3. **Given** um usuario, posto ou vinculo que nao deve mais operar, **When** ele e removido logicamente, **Then** ele deixa de aparecer nas listas padrao sem ser apagado definitivamente.

---

### User Story 4 - Auditar acoes criticas da fundacao (Priority: P2)

Direcao/Administracao e Supervisao precisam rastrear alteracoes criticas em usuarios, postos, vinculos e permissoes.

**Why this priority**: A fundacao de acesso precisa ser auditavel para explicar quem alterou escopo, perfil e dados operacionais.

**Independent Test**: Executar acoes criticas de criacao, edicao, inativacao e exclusao logica; verificar que cada acao gera historico centralizado.

**Acceptance Scenarios**:

1. **Given** uma alteracao de perfil de usuario, **When** a alteracao e salva, **Then** o historico registra usuario responsavel, entidade, acao, valor anterior e valor novo quando aplicavel.
2. **Given** uma exclusao logica de posto, usuario ou vinculo, **When** a exclusao e confirmada, **Then** o historico registra a acao critica e o registro permanece consultavel para auditoria.

### Edge Cases

- Usuario autenticado existe, mas nao possui registro em `usuarios`.
- Usuario possui registro operacional, mas esta inativo ou excluido logicamente.
- Operador nao possui nenhum posto vinculado.
- Usuario possui vinculos antigos removidos logicamente e um novo vinculo ativo para o mesmo posto.
- Posto esta inativo ou excluido logicamente, mas ainda possui vinculos antigos.
- Supervisao possui escopo vazio ou vinculos apenas removidos logicamente.
- Direcao/Administracao nao possui vinculos em `usuarios_postos`, mas precisa manter visao global.
- Alteracao critica falha antes de ser concluida e nao deve gerar historico enganoso de sucesso.
- Tentativa de acesso direto a dados de outro posto por rota, filtro manipulado ou consulta direta.

## Requirements *(mandatory)*

### Constitution Alignment *(mandatory)*

- A feature permanece dentro do MVP e entrega a fundacao de acesso, cadastros base, RLS e auditoria necessarios antes de importacao MMS e telas operacionais.
- A feature nao toca dados MMS; `raw_json`, chave operacional MMS e marcacao como `removido` ficam fora desta especificacao.
- A feature define controle por perfil + posto para Operador, Supervisao e Direcao/Administracao, incluindo bloqueio de usuarios sem perfil operacional ativo.
- A feature define soft delete para registros operacionais aplicaveis e historico centralizado em `historico_auditoria`.
- A feature nao toca ocorrencias nem custos extras; exigencia de assistencia para esses modulos fica fora desta especificacao.
- A feature nao entrega telas finais de produto; qualquer interface administrativa futura deve seguir o design system Doka e o comportamento desktop-first.

### Functional Requirements

- **FR-001**: O sistema MUST associar cada usuario autenticado a no maximo um registro operacional ativo em `usuarios`.
- **FR-002**: O sistema MUST permitir os perfis operacionais `operador`, `supervisao` e `direcao_admin`.
- **FR-003**: O sistema MUST bloquear acesso a area interna para usuario autenticado sem registro operacional ativo.
- **FR-004**: O sistema MUST bloquear acesso a area interna para usuario operacional inativo ou excluido logicamente.
- **FR-005**: O sistema MUST manter cadastro de postos com identificacao, status operacional e campos de controle.
- **FR-006**: O sistema MUST permitir vincular um usuario a um ou mais postos por meio de `usuarios_postos`.
- **FR-007**: O sistema MUST impedir duplicidade ativa de vinculo entre o mesmo usuario e o mesmo posto.
- **FR-008**: O sistema MUST permitir diferenciar o nivel de acesso do vinculo usuario/posto quando necessario para operacional, supervisao ou consulta.
- **FR-009**: O sistema MUST permitir cadastro de `cargos_funcoes` quando necessario para classificar usuarios e apoiar vinculos operacionais.
- **FR-010**: O sistema MUST garantir que Operador acesse apenas dados dos postos vinculados ao seu usuario.
- **FR-011**: O sistema MUST garantir que Supervisao acesse apenas dados dos postos dentro do seu escopo operacional.
- **FR-012**: O sistema MUST garantir que Direcao/Administracao tenha visao global dos postos e dados operacionais.
- **FR-013**: O sistema MUST definir regras iniciais de acesso em nivel de dados para impedir leitura, criacao, alteracao ou exclusao logica fora do escopo permitido.
- **FR-014**: O sistema MUST prever funcoes auxiliares reutilizaveis para identificar o usuario operacional atual, verificar perfil e verificar acesso a posto.
- **FR-015**: O sistema MUST usar tabelas e campos em portugues `snake_case`, chave primaria `id` e chaves estrangeiras com sufixo `_id`.
- **FR-016**: O sistema MUST aplicar soft delete em registros operacionais aplicaveis, incluindo `usuarios`, `postos`, `usuarios_postos` e `cargos_funcoes`.
- **FR-017**: O sistema MUST garantir que registros excluidos logicamente nao aparecam nas consultas operacionais padrao.
- **FR-018**: O sistema MUST registrar acoes criticas em `historico_auditoria`.
- **FR-019**: O historico MUST registrar, quando aplicavel, entidade, identificador da entidade, acao, usuario responsavel, valor anterior, valor novo, contexto adicional e data/hora.
- **FR-020**: O sistema MUST registrar historico para criacao, edicao, mudanca de perfil, ativacao/inativacao, vinculo/desvinculo de posto e exclusao logica.
- **FR-021**: O sistema MUST impedir que alteracoes de perfil, posto ou vinculo burlem as regras de escopo do usuario executor.
- **FR-022**: O sistema MUST manter Direcao/Administracao como perfil capaz de gerenciar usuarios, postos, vinculos, cargos/funcoes e consultar historico completo.
- **FR-023**: O sistema MUST permitir que Supervisao consulte e gerencie apenas dados de seu escopo quando essa acao for autorizada pelo MVP.
- **FR-024**: O sistema MUST manter historico e registros de auditoria fora de exclusao fisica pela operacao comum.
- **FR-025**: O sistema MUST deixar importacao MMS, assistencias, ocorrencias, tarefas, custos extras, dashboard completo e integracao automatica MMS fora desta feature.

### Key Entities *(include if feature involves data)*

- **usuarios**: Perfil operacional do usuario autenticado dentro do Doka; contem vinculo com o usuario autenticado, nome, email, perfil, cargo/funcao, status ativo e campos de controle.
- **postos**: Unidade operacional usada como filtro central de acesso; contem nome, codigo quando houver, descricao, status ativo e campos de controle.
- **usuarios_postos**: Relacionamento entre usuarios e postos; define o escopo operacional e o nivel de acesso de cada usuario em cada posto.
- **cargos_funcoes**: Cadastro auxiliar para classificar usuarios e apoiar rotinas futuras de responsabilidade operacional.
- **historico_auditoria**: Registro centralizado das acoes criticas; guarda entidade, acao, usuario responsavel, valores alterados e contexto.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos usuarios autenticados sem perfil operacional ativo sao bloqueados antes de visualizar dados internos.
- **SC-002**: Em testes com pelo menos 3 postos e 3 perfis, Operador e Supervisao visualizam 0 registros fora dos seus postos autorizados.
- **SC-003**: Direcao/Administracao consegue visualizar todos os postos cadastrados em 100% dos cenarios de teste de escopo global.
- **SC-004**: Tentativas de criar vinculo ativo duplicado entre o mesmo usuario e posto sao rejeitadas em 100% dos testes.
- **SC-005**: 100% das acoes criticas listadas nos requisitos geram registro em `historico_auditoria`.
- **SC-006**: Registros excluidos logicamente deixam de aparecer nas listas operacionais padrao em 100% dos cenarios testados.
- **SC-007**: A validacao de acesso por perfil e posto pode ser reutilizada em novas entidades do MVP sem redefinir a regra de negocio.

## Assumptions

- Supabase Auth e a fonte de autenticacao do projeto; a tabela `usuarios` guarda apenas o perfil operacional do Doka.
- O primeiro perfil administrativo consolidado do MVP e `direcao_admin`, representando Direcao/Administracao.
- Supervisao tem escopo definido por vinculos em `usuarios_postos`, com nivel apropriado para supervisao.
- Direcao/Administracao nao depende de vinculos em `usuarios_postos` para ter visao global.
- Usuarios sem posto vinculado nao visualizam dados operacionais, exceto Direcao/Administracao.
- A administracao completa de telas pode ser simplificada ou tratada em feature futura; esta feature define a base de dados, regras e comportamento esperado.
