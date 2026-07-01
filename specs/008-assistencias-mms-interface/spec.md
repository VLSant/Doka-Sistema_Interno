# Feature Specification: Assistências MMS — Consulta, Detalhe e Correção Controlada

**Feature Branch**: `008-assistencias-mms-interface`

**Created**: 2026-06-29

**Status**: Ready for Planning

**Input**: User description: "Transformar o espelho operacional criado na Spec
004 em uma interface utilizável, com lista, filtros, busca, detalhe, agrupamento
de partes, valores importados e corrigidos, edição controlada, histórico, acesso
ao lote de origem, RLS e estados completos de interface."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Localizar assistências autorizadas (Priority: P1)

Um usuário autenticado precisa consultar as assistências MMS do seu escopo,
combinar filtros operacionais e localizar uma assistência pelo número sem
visualizar registros de postos não autorizados.

**Why this priority**: A lista é a entrada operacional para encontrar um serviço
importado e viabiliza todas as demais jornadas desta feature.

**Independent Test**: Acessar a lista como Operador, Supervisão e
Direção/Administração, combinar todos os filtros, buscar números conhecidos e
confirmar resultados, ordenação, registros removidos e isolamento por posto.

**Acceptance Scenarios**:

1. **Given** um usuário com acesso a um ou mais postos, **When** abre a lista de
   Assistências MMS, **Then** vê somente assistências desses postos, ordenadas da
   data de atividade mais recente para a mais antiga.
2. **Given** assistências de diferentes postos, datas, status, tipos e clientes,
   **When** o usuário combina filtros, **Then** a lista apresenta apenas os
   registros que atendem simultaneamente aos critérios e preserva os filtros
   ativos.
3. **Given** um número de assistência conhecido no escopo, **When** o usuário
   pesquisa pelo número completo ou por um trecho significativo, **Then**
   encontra as correspondências autorizadas independentemente de diferenças
   irrelevantes de espaços ou caixa.
4. **Given** assistências ativas e removidas, **When** a lista é aberta sem
   filtro de situação interna, **Then** registros `removido` ficam ocultos.
5. **Given** um usuário autorizado a auditar o registro, **When** seleciona
   `removido` ou todos no filtro de situação interna, **Then** os registros
   removidos correspondentes ao seu escopo podem ser consultados e são
   identificados sem depender somente de cor.
6. **Given** nenhum registro no escopo ou nenhum resultado para os filtros,
   **When** a consulta termina, **Then** a interface diferencia base vazia de
   filtros sem resultado e oferece uma ação adequada para limpar filtros.

---

### User Story 2 - Compreender o detalhe e suas partes (Priority: P1)

Um usuário autorizado precisa abrir uma assistência, compreender os dados
principais e analisar todas as partes do conjunto como componentes do mesmo
serviço, sem confundir parte com assistência principal.

**Why this priority**: O agrupamento em dois níveis é o contrato central da Spec
004 e precisa ficar explícito para que a operação interprete corretamente o
serviço importado.

**Independent Test**: Abrir uma assistência com uma parte e outra com várias
partes, inclusive partes removidas, e conferir identificação, agrupamento,
valores visíveis, origem e restrições de acesso.

**Acceptance Scenarios**:

1. **Given** uma assistência acessível, **When** o detalhe é carregado, **Then**
   apresenta posto, data da atividade, número da assistência, cliente, endereço,
   tipo, status e situação interna da assistência.
2. **Given** uma assistência com várias partes, **When** o usuário consulta o
   detalhe, **Then** cada parte é exibida dentro do mesmo conjunto com sua
   identificação, descrição da mercadoria, recurso/montador, tipo, status,
   situação interna e origem.
3. **Given** uma parte removida e uma parte ativa, **When** o usuário inclui
   removidos no detalhe, **Then** ambas permanecem agrupadas sob a mesma
   assistência e a situação de cada uma é inequívoca.
4. **Given** uma URL direta de assistência inexistente ou não autorizada,
   **When** o usuário tenta abri-la, **Then** nenhum dado protegido nem
   confirmação da existência do registro é exibido.

---

### User Story 3 - Distinguir origem, correção e valor vigente (Priority: P1)

Um usuário autorizado precisa saber o que veio da MMS, o que foi corrigido no
Doka e qual valor está vigente em cada campo corrigível.

**Why this priority**: A correção só é segura quando a evidência original
permanece visível e a precedência do valor operacional não gera ambiguidade.

**Independent Test**: Consultar campos sem correção, com correção ativa e após
nova importação, verificando valor importado mais recente, valor corrigido,
valor vigente e preservação da evidência.

**Acceptance Scenarios**:

1. **Given** um campo corrigível sem correção ativa, **When** ele é exibido,
   **Then** o valor vigente é o valor da importação elegível mais recente.
2. **Given** um campo com correção ativa, **When** ele é exibido, **Then** o
   valor vigente é o corrigido e os valores importado e corrigido permanecem
   distinguíveis.
3. **Given** uma nova importação que altera o valor importado de um campo já
   corrigido, **When** o detalhe é consultado, **Then** o novo valor importado é
   mostrado no histórico e a correção ativa continua prevalecendo até uma ação
   autorizada alterá-la ou resolvê-la.
4. **Given** um campo não corrigível, **When** o detalhe é exibido, **Then** ele
   permanece somente leitura e nenhuma ação de correção é oferecida.

---

### User Story 4 - Corrigir campos permitidos com controle (Priority: P1)

Um usuário com permissão de edição precisa corrigir cliente, endereço, descrição
da mercadoria ou recurso/montador sem alterar o `raw_json`, sobrescrever
evidência ou editar outros dados MMS.

**Why this priority**: Esses quatro campos formam a allowlist aprovada na Spec
004 e atendem correções operacionais sem abrir edição irrestrita do espelho.

**Independent Test**: Editar cada campo permitido com os perfis e postos
autorizados, tentar editar campos proibidos e fora do escopo, simular
concorrência e verificar valor vigente, histórico e `raw_json`.

**Acceptance Scenarios**:

1. **Given** um Operador com vínculo operacional no posto, **When** corrige
   cliente ou endereço da assistência, **Then** a correção válida é salva
   separadamente da evidência e passa a definir o valor vigente.
2. **Given** um usuário autorizado na parte, **When** corrige descrição da
   mercadoria ou recurso/montador com justificativa, **Then** a correção fica
   vinculada à parte correta e não altera outras partes do conjunto.
3. **Given** um Operador somente consulta, um usuário fora do posto ou sem perfil
   ativo, **When** tenta corrigir qualquer campo, **Then** a ação é recusada e
   nenhum dado ou evento falso de sucesso é criado.
4. **Given** uma tentativa de corrigir status, tipo, número, posto, data, parte
   do conjunto ou outro campo fora da allowlist, **When** a alteração é enviada,
   **Then** ela é recusada mesmo que a interface tenha sido contornada.
5. **Given** que outro usuário atualizou a mesma correção após a abertura do
   detalhe, **When** o primeiro tenta salvar uma versão antiga, **Then** a
   gravação é recusada, o valor atual é preservado e a tela oferece recarregar os
   dados.
6. **Given** sessão expirada ou perda de autorização antes do salvamento,
   **When** a correção é confirmada, **Then** a autorização é revalidada e
   nenhum sucesso é apresentado.

---

### User Story 5 - Auditar importações, correções e origem (Priority: P2)

Um usuário autorizado precisa rastrear de quais lotes a assistência e suas
partes vieram, como os valores importados evoluíram e quem realizou cada
correção.

**Why this priority**: A rastreabilidade permite explicar o estado atual e
investigar divergências sem consultar diretamente estruturas técnicas.

**Independent Test**: Abrir o histórico de uma assistência atualizada por vários
lotes e com correções em assistência e partes, validando ordem, contexto,
valores, ator e navegação autorizada ao lote.

**Acceptance Scenarios**:

1. **Given** uma assistência criada e atualizada por importações, **When** o
   histórico é aberto, **Then** apresenta eventos em ordem cronológica
   decrescente, com data/hora, origem, lote, campos alterados e valores
   permitidos ao perfil.
2. **Given** correções na assistência e em suas partes, **When** o histórico é
   consultado, **Then** distingue entidade e parte afetada, valor anterior, valor
   corrigido, autor, data/hora e justificativa.
3. **Given** um lote de origem autorizado, **When** o usuário solicita seu
   detalhe, **Then** é direcionado ao fluxo de gestão de importações da Spec 007.
4. **Given** um lote que contém dados de postos além do escopo do usuário,
   **When** o acesso ao lote puder expor conteúdo não autorizado, **Then** a
   navegação é bloqueada ou apresenta apenas a projeção já autorizada pela Spec
   007, sem ampliar o acesso por meio da assistência.

### Edge Cases

- A mesma assistência existe em postos ou datas diferentes com o mesmo número:
  busca e detalhe preservam posto e data como parte da identidade.
- O número pesquisado contém espaços, pontuação ou diferenças de caixa:
  normalização não pode unir números operacionalmente distintos.
- Uma assistência não tem partes ativas porque todas foram marcadas
  `removido`: ela só aparece quando removidos forem incluídos.
- A assistência está ativa, mas uma de suas partes está removida: a parte fica
  oculta por padrão sem desaparecer do histórico.
- Cliente ou endereço está vazio na fonte: a interface distingue ausência de
  valor, carregamento e falha de consulta.
- Uma parte não possui descrição ou recurso/montador: o campo vazio pode ser
  corrigido somente por usuário autorizado.
- Uma correção ativa contém o mesmo texto do valor importado mais recente: sua
  origem corrigida e seu histórico continuam identificáveis.
- Nova importação ocorre enquanto o detalhe está aberto: uma tentativa de
  salvar com versão antiga é recusada sem sobrescrever o estado recente.
- A assistência ou parte muda para `removido` enquanto está sendo editada: o
  salvamento revalida elegibilidade e autorização antes de produzir efeito.
- O lote de origem foi cancelado, desfeito ou está temporariamente
  indisponível: a assistência mantém a referência auditável e a interface não
  inventa um estado de sucesso.
- Uma falha temporária não pode ser apresentada como lista vazia, registro
  inexistente, acesso negado ou correção salva.
- A sessão expira durante lista, detalhe ou histórico: nenhum dado protegido
  permanece sendo carregado sob contexto inválido.

## Requirements *(mandatory)*

### Constitution Alignment *(mandatory)*

- **MMS como fonte externa**: lista, detalhe e correções operam sobre o espelho
  das Specs 004/006; `raw_json` e `raw_json_resumo` permanecem imutáveis e a MMS
  continua sendo a evidência original.
- **MVP e escopo controlado**: a feature torna o espelho utilizável sem criar
  ocorrências, reclamações, deslocamentos, custos extras, tarefas, dashboard,
  produtividade, novas regras de importação ou edição irrestrita.
- **Perfil e posto**: toda lista, detalhe, histórico, lote e correção respeita
  perfil, nível do vínculo e posto no acesso aos dados, não apenas em rotas ou
  controles visuais.
- **Modelagem auditável**: correções ficam separadas dos valores importados,
  eventos críticos usam `historico_auditoria`, `removido` não é soft delete e
  nenhuma evidência é excluída fisicamente.
- **Importação rastreável**: a identidade em dois níveis, a chave operacional,
  a precedência do valor corrigido, os lotes de origem, `removido` e reativação
  são reutilizados sem redefinição.
- **Produto e interface**: a experiência segue o design system Doka, usa
  português brasileiro, é desktop-first e não depende somente de cor para
  comunicar estado.

### Scope Boundaries

Esta feature consome o espelho operacional e os contratos de importação já
definidos nas Specs 003, 004, 006 e 007. Ela não altera elegibilidade de lote ou
linha, processamento, chave operacional, status oficiais, regra de `removido`,
reativação, formato da evidência ou resultado de importação.

Ficam fora do escopo: ocorrências e reclamações; deslocamentos e custos extras;
tarefas; dashboard e produtividade; parsing, upload, validação ou novas regras
de importação; edição de campos fora da allowlist; exclusão física; substituição
do `raw_json`; e experiência mobile refinada.

### Functional Requirements

- **FR-001**: O sistema MUST apresentar uma lista paginada de assistências
  autorizadas com número, posto, data da atividade, cliente vigente, tipo,
  status e situação interna.
- **FR-002**: A lista MUST ser ordenada por padrão pela data da atividade mais
  recente e usar um critério estável para registros com a mesma data.
- **FR-003**: O sistema MUST permitir combinar filtros por posto, data ou
  período de atividade, status, tipo de atividade, cliente e situação interna.
- **FR-004**: O sistema MUST permitir busca por número da assistência completo
  ou parcial, sem ampliar resultados além do escopo autorizado.
- **FR-005**: Busca e filtros MUST poder ser combinados e MUST permanecer
  identificáveis enquanto ativos.
- **FR-006**: Consultas operacionais MUST ocultar assistências `removido` por
  padrão e MUST permitir incluir somente removidas ou todas quando o perfil
  puder consultá-las.
- **FR-007**: A lista MUST diferenciar carregamento inicial, atualização,
  ausência de dados, filtros sem resultado, falha temporária, sessão inválida e
  acesso negado.
- **FR-008**: O sistema MUST apresentar no detalhe a identidade da assistência
  por posto, data da atividade e número, além dos campos operacionais
  autorizados.
- **FR-009**: O detalhe MUST agrupar todas as partes acessíveis sob uma única
  assistência principal e MUST NOT apresentar cada parte como uma assistência
  independente.
- **FR-010**: Cada parte MUST exibir `parte_conjunto`, descrição da mercadoria,
  recurso/montador, tipo, status, situação interna e rastreabilidade permitida.
- **FR-011**: Partes `removido` MUST ficar ocultas por padrão no detalhe, com
  opção explícita de inclusão para usuários autorizados.
- **FR-012**: Assistências e partes removidas MUST ser identificadas por texto ou
  ícone acompanhado de texto, sem depender somente de cor.
- **FR-013**: Para cada campo corrigível, o sistema MUST distinguir valor da
  importação elegível mais recente, correção ativa e valor vigente.
- **FR-014**: O valor vigente MUST ser a correção ativa quando existir; caso
  contrário, MUST ser o valor da importação elegível mais recente.
- **FR-015**: Nova importação MUST poder atualizar o valor importado e sua
  rastreabilidade sem apagar nem desativar silenciosamente uma correção ativa.
- **FR-016**: Os únicos campos corrigíveis nesta feature MUST ser
  `cliente_nome`, `endereco`, `descricao_mercadoria` e `recurso`, conforme a
  allowlist da Spec 004.
- **FR-017**: Cliente e endereço MUST ser corrigidos no nível da assistência;
  descrição da mercadoria e recurso/montador MUST ser corrigidos somente na
  parte selecionada.
- **FR-018**: O sistema MUST manter todos os demais dados MMS em modo somente
  leitura nesta interface.
- **FR-019**: Uma correção MUST exigir valor válido, justificativa e confirmação
  explícita antes do salvamento.
- **FR-020**: Uma correção MUST registrar entidade, parte quando aplicável,
  campo, valor importado relevante, valor vigente anterior, valor corrigido,
  justificativa, ator e data/hora.
- **FR-021**: Correções MUST permanecer separadas de `raw_json` e
  `raw_json_resumo`; nenhum fluxo desta feature pode alterar essas evidências.
- **FR-022**: O sistema MUST revalidar sessão, perfil, vínculo, posto, campo
  permitido, registro atual e versão esperada no momento de salvar.
- **FR-023**: Uma tentativa baseada em versão desatualizada MUST ser recusada
  sem sobrescrever o valor atual e MUST orientar o usuário a recarregar.
- **FR-024**: Clique repetido ou repetição da mesma solicitação MUST NOT criar
  correções ou eventos de sucesso duplicados.
- **FR-025**: Operador com vínculo operacional MUST poder consultar e corrigir
  os quatro campos permitidos somente em assistências dos postos vinculados.
- **FR-026**: Operador com vínculo somente de consulta MUST poder consultar,
  mas MUST NOT corrigir assistências ou partes.
- **FR-027**: Supervisão MUST poder consultar e corrigir somente no próprio
  escopo operacional.
- **FR-028**: Direção/Administração MUST poder consultar, corrigir e auditar em
  escopo global, sem ultrapassar a allowlist ou regras de integridade.
- **FR-029**: Usuário sem perfil operacional ativo MUST NOT acessar lista,
  detalhe, histórico ou correções.
- **FR-030**: Todas as restrições por perfil, vínculo e posto MUST ser aplicadas
  no acesso aos dados e nas mutações, inclusive por URL ou solicitação direta.
- **FR-031**: Respostas para registro inexistente e registro não autorizado MUST
  evitar revelar dados ou confirmar a existência de assistência, parte,
  histórico ou lote fora do escopo.
- **FR-032**: O detalhe MUST apresentar o lote e a linha de criação e os lotes e
  linhas posteriores relevantes, conforme a rastreabilidade vigente.
- **FR-033**: O sistema MUST apresentar histórico unificado de importações,
  atualizações, correções, marcação como `removido` e reativação da assistência
  e de suas partes.
- **FR-034**: O histórico MUST identificar data/hora, tipo de evento, entidade,
  parte quando aplicável, ator ou origem de importação, lote e valores
  anterior/novo permitidos ao perfil.
- **FR-035**: O histórico MUST usar a auditoria e a rastreabilidade existentes e
  MUST NOT criar uma fonte paralela de verdade.
- **FR-036**: O acesso ao detalhe de um lote de origem MUST reutilizar o fluxo e
  as regras de autorização da Spec 007.
- **FR-037**: Uma referência a lote MUST NOT conceder acesso ao arquivo, linhas
  ou postos que o usuário não poderia consultar diretamente na Spec 007.
- **FR-038**: Falha ao consultar o lote MUST preservar a referência auditável e
  apresentar erro sem expor identificadores ou caminhos internos indevidos.
- **FR-039**: O sistema MUST preservar filtros e contexto de navegação ao
  retornar do detalhe para a lista enquanto a sessão continuar válida.
- **FR-040**: A interface MUST seguir o design system Doka, usar português
  brasileiro, ser desktop-first e oferecer foco visível, navegação por teclado,
  rótulos associados e mensagens compreensíveis.
- **FR-041**: Toda tela MUST possuir estados explícitos de carregamento, vazio,
  erro e acesso negado adequados ao seu contexto.
- **FR-042**: Falha temporária MUST NOT ser apresentada como lista vazia,
  registro inexistente, acesso negado ou correção concluída.
- **FR-043**: A feature MUST NOT criar ou editar ocorrências, reclamações,
  deslocamentos, custos extras, tarefas, indicadores de dashboard ou
  produtividade.
- **FR-044**: A feature MUST NOT alterar regras de importação, processar lotes ou
  oferecer edição genérica de dados MMS.

### Permission Rules

| Perfil e vínculo | Consulta | Correção controlada | Histórico e lote |
| --- | --- | --- | --- |
| Sem perfil ativo | Sem acesso | Sem acesso | Sem acesso |
| Operador — consulta | Postos vinculados | Não permitida | Somente dados autorizados |
| Operador — operacional | Postos vinculados | Allowlist nos postos vinculados | Somente dados autorizados |
| Supervisão | Postos do escopo | Allowlist no próprio escopo | Somente dados autorizados |
| Direção/Administração | Escopo global | Allowlist global | Auditoria global sujeita às regras do lote |

### Key Entities *(include if feature involves data)*

- **Assistência MMS**: serviço principal identificado por posto, data da
  atividade e número da assistência; reúne dados principais, situação interna,
  rastreabilidade e suas partes.
- **Parte da assistência MMS**: componente do conjunto vinculado a uma única
  assistência e identificado pela parte do conjunto; contém descrição da
  mercadoria, recurso/montador e evidência da linha importada.
- **Correção operacional**: alteração auditável de um único campo permitido,
  separada da evidência importada, com valor, justificativa, ator, data e versão.
- **Lote e linha de importação**: origem rastreável da criação ou atualização da
  assistência e de cada parte, consultada conforme a Spec 007.
- **Histórico de auditoria**: registro central existente que explica importação,
  atualização, correção, remoção operacional e reativação.
- **Posto e vínculo de usuário**: contexto existente que delimita consulta,
  correção e auditoria por perfil, nível de vínculo e escopo operacional.

### Dependencies

- Specs 001–002: usuários, perfis, postos, vínculos, RLS e auditoria.
- Spec 003: lotes, linhas, evidência e rastreabilidade da importação.
- Spec 004: espelho em dois níveis, chave operacional, `removido`, allowlist de
  correção, precedência e preservação do `raw_json`.
- Spec 005: autenticação, sessão, rotas e estados comuns da aplicação.
- Spec 006: processamento elegível e atualização atômica do espelho.
- Spec 007: consulta de lotes, histórico de importação e acesso ao lote de
  origem.
- Design system oficial Doka para a interface desktop-first.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em testes por perfil, 100% das assistências, partes, correções,
  históricos e lotes fora do escopo permanecem inacessíveis, inclusive por URL
  e solicitações diretas.
- **SC-002**: Pelo menos 90% dos usuários de aceite localizam uma assistência
  conhecida por busca ou filtros e abrem seu detalhe em até 60 segundos, sem
  ajuda.
- **SC-003**: Para até 10.000 assistências no escopo consultado, 95% das
  listagens e alterações de filtro apresentam resultado ou progresso em até 2
  segundos no ambiente de aceite.
- **SC-004**: Em 100% dos cenários testados, registros `removido` ficam ocultos
  por padrão e aparecem somente após seleção explícita de filtro autorizado.
- **SC-005**: Em 100% das assistências com múltiplas partes testadas, todas as
  partes aparecem sob uma única assistência principal e nenhuma é apresentada
  como serviço independente.
- **SC-006**: Em 100% dos campos corrigíveis testados, o valor vigente segue a
  precedência correção ativa sobre importação mais recente e ambas as origens
  permanecem distinguíveis.
- **SC-007**: 100% das correções aceitas pertencem à allowlist, preservam
  `raw_json`/`raw_json_resumo` e registram campo, valores, justificativa, ator e
  data/hora.
- **SC-008**: 100% das tentativas fora da allowlist, fora do posto, sem vínculo
  de edição ou com versão desatualizada são bloqueadas sem alterar o valor
  vigente.
- **SC-009**: Em testes de usabilidade, pelo menos 90% dos usuários identificam
  corretamente valor importado, valor corrigido e valor vigente sem ajuda.
- **SC-010**: 100% das assistências e partes testadas permitem rastrear sua
  criação e atualizações aos lotes e linhas autorizados correspondentes.
- **SC-011**: 100% das telas e consultas testadas distinguem carregamento, vazio,
  erro e acesso negado sem apresentar falso sucesso ou ausência de dados.
- **SC-012**: Nenhum teste funcional introduz edição irrestrita, nova regra de
  importação ou módulo declarado fora do escopo.

## Assumptions

- As Specs 001–007 são contratos vigentes; esta feature os expõe em uma jornada
  de usuário e não redefine suas decisões.
- `tipo` significa o tipo de atividade normalizado vigente, mantendo o valor
  original disponível no detalhe quando autorizado.
- `status` representa o status de atividade exibido pelo espelho; a situação
  interna `ativo`/`removido` possui filtro separado para evitar ambiguidade.
- A busca por número aceita correspondência parcial normalizada, mas posto e
  data continuam fazendo parte da identidade e impedem que resultados
  semelhantes sejam tratados como o mesmo registro.
- `recurso` é o campo de dados aprovado na Spec 004 e será apresentado ao usuário
  como recurso/montador.
- A justificativa de correção é obrigatória e não deve conter segredos ou cópia
  integral do arquivo importado.
- O histórico apresentado é uma projeção legível da auditoria e da
  rastreabilidade existentes, não um novo armazenamento de histórico.
- A experiência refinada para celular permanece fora deste ciclo; acessibilidade
  básica e funcionamento desktop-first são obrigatórios.
