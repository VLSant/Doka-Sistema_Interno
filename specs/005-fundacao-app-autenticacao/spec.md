# Feature Specification: Fundação da Aplicação Web, Autenticação e Navegação

**Feature Branch**: `005-fundacao-app-autenticacao`

**Created**: 2026-06-26

**Status**: Draft

**Input**: User description: "Criar a Spec 005 — Fundação da Aplicação Web, Autenticação e Navegação do Doka."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Autenticar e manter uma sessão segura (Priority: P1)

Um usuário operacional precisa entrar no Doka com e-mail e senha, continuar
autenticado após recarregar a aplicação enquanto sua sessão for válida e sair
quando encerrar o trabalho.

**Why this priority**: A autenticação e o ciclo seguro da sessão são a porta de
entrada para qualquer uso interno do Doka.

**Independent Test**: Autenticar um usuário operacional válido, recarregar a
aplicação, encerrar a sessão e tentar retornar a uma área interna. O teste entrega
valor mesmo sem os módulos operacionais finais, pois comprova acesso seguro à
fundação autenticada.

**Acceptance Scenarios**:

1. **Given** um usuário com credenciais válidas, cadastro operacional ativo,
   perfil oficial ativo e escopo válido, **When** ele entra no Doka, **Then** o
   acesso à área autenticada é concedido e sua identidade operacional é exibida.
2. **Given** uma sessão ainda válida, **When** o usuário recarrega a aplicação,
   **Then** a sessão é restaurada e o cadastro operacional, o perfil e os postos
   autorizados são revalidados antes de qualquer conteúdo interno ser exibido.
3. **Given** credenciais inválidas, **When** o usuário tenta entrar, **Then** o
   acesso é recusado com mensagem clara que não revela qual credencial está
   incorreta.
4. **Given** um usuário autenticado, **When** ele escolhe sair, **Then** a sessão
   é encerrada, o conteúdo interno deixa de ser acessível e uma tentativa de
   retornar por histórico ou URL direta exige nova autenticação.
5. **Given** uma sessão expirada ou invalidada, **When** a aplicação detecta essa
   condição, **Then** remove imediatamente o acesso às áreas internas, descarta
   dados protegidos visíveis e direciona o usuário ao fluxo de entrada com a
   informação de que a sessão expirou.

---

### User Story 2 - Autorizar por perfil e posto em toda entrada protegida (Priority: P1)

O Doka precisa identificar o usuário autenticado no cadastro operacional
existente e conceder somente o acesso permitido por seu perfil e pelos postos de
seu escopo, inclusive quando uma rota é aberta diretamente.

**Why this priority**: O controle por perfil e posto é a barreira central de
segurança do MVP e não pode depender da visibilidade do menu.

**Independent Test**: Usar usuários Operador, Supervisão e
Direção/Administração, além de usuários sem configuração válida, para abrir
rotas protegidas pelo menu e por URL direta e confirmar o resultado esperado em
cada escopo.

**Acceptance Scenarios**:

1. **Given** um Operador ativo vinculado aos Postos A e B, **When** acessa uma
   área operacional permitida, **Then** a aplicação reconhece somente os Postos
   A e B como seu escopo e nenhuma consulta ou ação pode alcançar outro posto.
2. **Given** uma Supervisão ativa com escopo nos Postos A e B, **When** acessa
   uma área operacional permitida, **Then** a aplicação reconhece somente esse
   escopo e bloqueia dados ou rotas administrativas globais não autorizadas.
3. **Given** um usuário Direção/Administração ativo e sem vínculos em
   `usuarios_postos`, **When** acessa uma área interna prevista para seu perfil,
   **Then** recebe escopo global, sem exigir vínculo individual com postos.
4. **Given** um usuário autenticado sem cadastro operacional ativo, **When**
   tenta entrar na área interna, **Then** nenhum dado operacional é exibido e a
   aplicação informa que sua configuração de acesso precisa ser regularizada.
5. **Given** um usuário operacional inativo ou removido logicamente, **When**
   tenta entrar ou restaurar uma sessão, **Then** o acesso é bloqueado.
6. **Given** um usuário sem perfil operacional oficial ativo, **When** tenta
   entrar ou restaurar uma sessão, **Then** o acesso é bloqueado.
7. **Given** um Operador ou Supervisão sem posto ativo vinculado ao escopo,
   **When** tenta entrar ou restaurar uma sessão, **Then** o acesso operacional é
   bloqueado; essa regra não se aplica a Direção/Administração.
8. **Given** um usuário autenticado sem autorização para uma rota, **When**
   digita ou abre diretamente sua URL, **Then** recebe estado de acesso negado e
   nenhum conteúdo protegido da rota é carregado.
9. **Given** um usuário autorizado para uma rota, mas sem acesso ao posto
   solicitado em seu endereço ou parâmetros, **When** tenta abrir essa rota,
   **Then** o acesso ao recurso é negado sem revelar seus dados.

---

### User Story 3 - Navegar pela estrutura comum conforme o perfil (Priority: P2)

Um usuário autorizado precisa encontrar uma área autenticada consistente, com
identificação pessoal, perfil atual, postos acessíveis, ação de sair e menu
adaptado ao que seu papel pode utilizar.

**Why this priority**: A estrutura comum permite que as próximas telas do MVP
sejam incorporadas sem recriar autenticação, navegação e estados globais.

**Independent Test**: Entrar com cada perfil oficial e validar a estrutura
compartilhada, a identificação exibida, o escopo apresentado e a disponibilidade
dos itens do menu, usando destinos neutros para módulos ainda não entregues.

**Acceptance Scenarios**:

1. **Given** um Operador autorizado, **When** entra na área interna, **Then** vê
   a estrutura comum e somente entradas operacionais previstas para Dashboard,
   Ocorrências, Tarefas e Rotinas, Assistências / MMS, Importações MMS e Custos
   Extras, respeitando a disponibilidade real de cada módulo.
2. **Given** uma Supervisão autorizada, **When** entra na área interna, **Then**
   vê as entradas operacionais de seu escopo e as entradas previstas de
   Cadastros e Histórico / Auditoria operacional, respeitando a disponibilidade
   real de cada módulo.
3. **Given** um usuário Direção/Administração autorizado, **When** entra na área
   interna, **Then** vê todas as entradas previstas nesta feature, inclusive
   Cadastros e Histórico / Auditoria, com indicação fiel do que ainda não está
   disponível.
4. **Given** qualquer usuário autorizado, **When** consulta a estrutura comum,
   **Then** encontra nome, perfil atual, postos acessíveis ou indicação de escopo
   global e ação de sair.
5. **Given** um módulo ainda não implementado, **When** o menu é apresentado,
   **Then** sua entrada fica oculta ou explicitamente indisponível, sem simular
   dados, ações ou uma tela funcional inexistente.
6. **Given** um usuário autorizado a conhecer um módulo ainda indisponível,
   **When** acessa um destino neutro previsto para esse módulo, **Then** recebe
   somente a informação de indisponibilidade e uma forma segura de voltar.

---

### User Story 4 - Recuperar o acesso por senha (Priority: P2)

Um usuário que não lembra sua senha precisa solicitar recuperação e definir uma
nova senha por um fluxo seguro, retornando ao login sem intervenção
administrativa completa.

**Why this priority**: A recuperação reduz bloqueios operacionais sem ampliar o
escopo para provisionamento ou administração completa de usuários.

**Independent Test**: Solicitar recuperação para um e-mail cadastrado, concluir
a redefinição por uma autorização válida e confirmar que a senha anterior deixa
de conceder acesso enquanto a nova senha funciona.

**Acceptance Scenarios**:

1. **Given** a tela de entrada, **When** o usuário solicita recuperação com um
   e-mail, **Then** recebe uma resposta neutra que não confirma se o e-mail
   existe.
2. **Given** uma autorização de recuperação válida, **When** o usuário informa e
   confirma uma nova senha aceita pelas regras vigentes, **Then** a senha é
   redefinida e o usuário pode retornar ao fluxo de entrada.
3. **Given** uma autorização de recuperação expirada, inválida ou já utilizada,
   **When** o usuário tenta redefinir a senha, **Then** a alteração é recusada e
   uma nova solicitação pode ser iniciada.
4. **Given** uma redefinição concluída, **When** alguém tenta usar a senha
   anterior, **Then** o acesso é recusado.

### Edge Cases

- A autenticação é válida, mas não existe `usuarios` ativo associado ao usuário
  autenticado.
- Existem cadastros operacionais conflitantes para a mesma identidade
  autenticada; o acesso deve ser bloqueado até correção, sem escolher um deles.
- O usuário é inativado ou removido logicamente durante uma sessão.
- O perfil do usuário é alterado durante uma sessão, inclusive de ou para
  Direção/Administração.
- Um vínculo com posto é incluído, inativado ou removido durante uma sessão.
- O último vínculo ativo de um Operador ou Supervisão é removido durante uma
  sessão.
- Um posto vinculado é inativado ou removido logicamente durante uma sessão.
- A sessão expira enquanto o usuário está em uma rota protegida.
- A sessão expira durante uma navegação ou solicitação de dados protegidos.
- A aplicação é recarregada enquanto a restauração da sessão ainda está em
  andamento.
- Há indisponibilidade temporária ao autenticar, restaurar sessão, carregar
  identidade operacional ou encerrar sessão.
- O usuário abre simultaneamente mais de uma janela e encerra ou perde a sessão
  em uma delas.
- Uma rota existe, mas o perfil não pode acessá-la; o resultado deve ser acesso
  negado, não página inexistente.
- Uma rota não existe; o resultado deve ser página inexistente, sem expor
  detalhes internos.
- Um módulo indisponível é acessado por URL direta por usuário autorizado e por
  usuário não autorizado; o primeiro recebe indisponibilidade neutra e o segundo
  recebe acesso negado.
- Uma solicitação de recuperação usa e-mail com diferenças de maiúsculas,
  espaços ou formato inválido.
- A autorização de recuperação é reutilizada, adulterada ou aberta após expirar.
- O usuário tenta navegar pelo histórico após sair ou após a sessão expirar.

## Requirements *(mandatory)*

### Constitution Alignment *(mandatory)*

- A feature preserva o princípio **MMS como Fonte Operacional Externa** porque
  não cria, altera ou simula dados MMS; apenas prepara navegação segura para os
  módulos que consumirão os contratos das Specs 003 e 004.
- A feature preserva o princípio **MVP Operacional e Escopo Controlado** porque
  entrega somente fundação web, autenticação, autorização, navegação e estados
  compartilhados. Não implementa funcionalidades dos módulos futuros nem
  integrações externas.
- A feature preserva o princípio **Supabase, RLS e Permissões por Perfil/Posto**
  ao reutilizar a autenticação, os perfis, os usuários operacionais, os vínculos
  e as regras de acesso aprovadas na Spec 001. A navegação nunca substitui RLS
  ou autorização em nível de dados.
- A feature preserva o princípio **Modelagem Auditável em Português** ao
  reutilizar `historico_auditoria` somente para eventos compatíveis, sem criar
  armazenamento paralelo e sem registrar senha, autorização de recuperação,
  token ou segredo.
- A feature preserva o princípio **Importação MMS Rastreável e Idempotente**
  porque não modifica lotes, linhas, `raw_json`, chave operacional,
  assistências, partes ou a regra de `removido` das Specs 003 e 004.
- A interface deve seguir integralmente o design system Doka, usar português
  brasileiro, Poppins, paleta e padrões oficiais, e ser desktop-first conforme
  a constituição.
- Nenhuma decisão fechada do MVP é alterada: permanecem os três perfis oficiais,
  o escopo por posto, a visão global de Direção/Administração e os contratos das
  Specs 001–004.

### Scope Boundaries

- A feature inclui login, logout, restauração e invalidação de sessão,
  recuperação/redefinição de senha, resolução da identidade operacional,
  autorização de rotas, estrutura visual autenticada, menu por perfil e estados
  globais de acesso.
- A feature pode oferecer uma página inicial neutra e destinos de “módulo ainda
  não disponível” apenas para validar autenticação e navegação.
- A feature não implementa dashboards funcionais, cadastros finais, upload ou
  processamento MMS, telas de lotes/erros/alertas, assistências finais,
  ocorrências, tarefas, rotinas, custos, deslocamentos, produtividade,
  eficiência ou painel geral de auditoria.
- A feature não cria novos perfis, modelos de permissão ou alterações nas regras
  de RLS aprovadas.
- A feature não inclui provisionamento administrativo completo de usuários,
  aplicativo mobile, responsividade mobile refinada ou integração externa.

### Access and Navigation Rules

| Área prevista | Operador | Supervisão | Direção/Administração |
| --- | --- | --- | --- |
| Dashboard | Escopo dos postos | Escopo dos postos | Global |
| Ocorrências | Operacional, quando disponível | Escopo operacional, quando disponível | Global, quando disponível |
| Tarefas e Rotinas | Operacional, quando disponível | Escopo operacional, quando disponível | Global, quando disponível |
| Assistências / MMS | Postos vinculados, quando disponível | Postos do escopo, quando disponível | Global, quando disponível |
| Importações MMS | Postos vinculados, quando disponível | Postos do escopo, quando disponível | Global, quando disponível |
| Custos Extras | Postos vinculados, quando disponível | Postos do escopo, quando disponível | Global, quando disponível |
| Cadastros | Oculto ou negado | Somente escopo previsto nas specs, quando disponível | Global, quando disponível |
| Histórico / Auditoria | Sem listagem geral | Escopo operacional, quando disponível | Global, quando disponível |

Esta matriz prepara a navegação, mas não amplia permissões de leitura ou escrita
definidas nas Specs 001–004. Quando uma permissão específica de entidade for
mais restritiva, prevalece o contrato daquela entidade.

### Functional Requirements

- **FR-001**: O sistema MUST permitir autenticação por e-mail e senha.
- **FR-002**: O sistema MUST apresentar uma mensagem neutra e clara quando as
  credenciais forem inválidas, sem indicar se o e-mail ou a senha falhou.
- **FR-003**: O sistema MUST recusar toda tentativa de autenticação que não
  resulte em uma identidade válida confirmada.
- **FR-004**: O sistema MUST manter estado de carregamento explícito enquanto
  determina se existe uma sessão válida.
- **FR-005**: O sistema MUST restaurar uma sessão válida após recarregamento sem
  exigir novo login.
- **FR-006**: O sistema MUST revalidar identidade operacional, perfil, estado do
  usuário e escopo de postos antes de liberar conteúdo interno em uma sessão
  restaurada.
- **FR-007**: O sistema MUST manter todo conteúdo protegido oculto enquanto a
  sessão e a autorização operacional não estiverem resolvidas.
- **FR-008**: O sistema MUST permitir que o usuário autenticado encerre sua
  sessão a partir da estrutura comum das áreas internas.
- **FR-009**: O encerramento da sessão MUST remover o acesso a áreas internas em
  todas as navegações subsequentes, inclusive retorno por histórico e URL
  direta.
- **FR-010**: Sessão expirada ou invalidada MUST remover imediatamente o acesso
  às áreas internas e exigir nova autenticação.
- **FR-011**: O sistema MUST informar de forma distinta quando o acesso foi
  removido por expiração da sessão.
- **FR-012**: O sistema MUST associar a identidade autenticada a exatamente um
  cadastro operacional ativo conforme o contrato da Spec 001.
- **FR-013**: O sistema MUST bloquear o acesso interno quando não encontrar
  cadastro operacional ativo associado.
- **FR-014**: O sistema MUST bloquear o acesso interno quando encontrar
  associação operacional conflitante ou ambígua.
- **FR-015**: O sistema MUST bloquear o acesso interno para usuário operacional
  inativo ou removido logicamente.
- **FR-016**: O sistema MUST aceitar somente os perfis oficiais `operador`,
  `supervisao` e `direcao_admin`.
- **FR-017**: O sistema MUST bloquear o acesso interno para usuário sem perfil
  oficial ativo.
- **FR-018**: O sistema MUST carregar somente postos ativos, não removidos e
  acessíveis por vínculos ativos do usuário.
- **FR-019**: Operador MUST ter escopo somente nos postos vinculados e ativos.
- **FR-020**: Supervisão MUST ter escopo somente nos postos vinculados e ativos
  de sua responsabilidade conforme a Spec 001.
- **FR-021**: Direção/Administração MUST ter escopo global e MUST NOT depender de
  vínculo em `usuarios_postos`.
- **FR-022**: Operador e Supervisão sem posto ativo no escopo MUST ser bloqueados
  da área operacional.
- **FR-023**: Antes de cada nova navegação protegida ou solicitação de dados
  protegidos, o sistema MUST aplicar as regras de autorização vigentes para que
  alterações de usuário, perfil, posto ou vínculo produzam efeito, no máximo,
  nessa próxima interação protegida.
- **FR-024**: Ao detectar perda de autorização durante uma sessão, o sistema MUST
  remover imediatamente o conteúdo que deixou de ser autorizado e redirecionar
  o usuário para um estado seguro.
- **FR-025**: Ao detectar alteração de perfil ou escopo que mantenha algum acesso,
  o sistema MUST atualizar menu, identificação de perfil, postos e rotas
  permitidas antes da próxima interação protegida.
- **FR-026**: Toda área interna MUST exigir autenticação e autorização
  operacional antes de exibir conteúdo.
- **FR-027**: Toda rota protegida MUST validar o perfil necessário e, quando
  aplicável, o posto solicitado.
- **FR-028**: A autorização de rota MUST produzir o mesmo resultado para acesso
  pelo menu, URL digitada, favorito, histórico ou redirecionamento interno.
- **FR-029**: Usuários sem autorização para uma rota existente MUST receber
  estado de acesso negado sem carregar conteúdo protegido.
- **FR-030**: Uma rota inexistente MUST apresentar estado de página inexistente
  e uma forma segura de retornar à área permitida ou ao login.
- **FR-031**: Ocultar ou desabilitar menu MUST NOT ser considerado controle de
  autorização.
- **FR-032**: A interface MUST NOT ampliar acesso além do que as regras de dados
  e RLS das Specs 001–004 permitem.
- **FR-033**: A estrutura autenticada MUST apresentar nome do usuário, perfil
  atual, postos acessíveis ou indicação de escopo global e ação de sair.
- **FR-034**: O sistema MUST fornecer navegação comum para Dashboard,
  Ocorrências, Tarefas e Rotinas, Assistências / MMS, Importações MMS, Custos
  Extras, Cadastros e Histórico / Auditoria conforme perfil e disponibilidade.
- **FR-035**: O menu de Operador MUST ocultar ou negar Cadastros e a listagem
  geral de Histórico / Auditoria.
- **FR-036**: O menu de Supervisão MUST limitar Cadastros e Histórico /
  Auditoria ao escopo permitido pelos contratos existentes.
- **FR-037**: O menu de Direção/Administração MAY apresentar todas as entradas
  previstas, sem simular funcionalidades ainda não implementadas.
- **FR-038**: Itens de módulos ainda não implementados MUST ser ocultados,
  desabilitados com indicação clara ou direcionados apenas a um estado neutro de
  indisponibilidade.
- **FR-039**: Destinos neutros MUST NOT exibir métricas, registros, formulários,
  ações ou dados fictícios que aparentem funcionalidade pronta.
- **FR-040**: Usuário não autorizado MUST receber acesso negado antes de qualquer
  estado de indisponibilidade do módulo.
- **FR-041**: O sistema MUST permitir solicitar recuperação de senha a partir da
  tela de entrada.
- **FR-042**: A resposta à solicitação de recuperação MUST ser neutra quanto à
  existência do e-mail informado.
- **FR-043**: O sistema MUST permitir redefinir a senha somente com autorização
  de recuperação válida e dentro de sua vigência.
- **FR-044**: Autorizações de recuperação inválidas, expiradas, adulteradas ou
  já utilizadas MUST ser recusadas.
- **FR-045**: A nova senha MUST cumprir as regras vigentes do serviço de
  autenticação e ser confirmada pelo usuário antes da redefinição.
- **FR-046**: Após redefinição bem-sucedida, a senha anterior MUST deixar de
  autenticar o usuário.
- **FR-047**: O sistema MUST apresentar estados distintos e compreensíveis para
  carregamento da sessão, credenciais inválidas, acesso negado, usuário sem
  configuração operacional, sessão expirada, página inexistente e falha
  temporária.
- **FR-048**: Em falha temporária, o sistema MUST manter dados protegidos ocultos
  quando não puder confirmar sessão ou autorização e MUST oferecer nova
  tentativa segura.
- **FR-049**: Mensagens de erro MUST ser em português brasileiro, acionáveis e
  não revelar detalhes internos, dados de outros usuários ou regras que
  facilitem contornar autorização.
- **FR-050**: A interface MUST seguir o design system oficial Doka e priorizar
  uso em desktop e notebook.
- **FR-051**: A estrutura autenticada MUST manter comportamento e linguagem
  consistentes entre todos os estados e perfis.
- **FR-052**: O sistema MUST registrar em `historico_auditoria` somente eventos
  de autenticação que possam ser associados de forma segura ao usuário
  operacional e representados pela estrutura de auditoria existente.
- **FR-053**: Acesso interno concedido, encerramento voluntário de sessão,
  expiração detectada e bloqueio após identificação operacional MUST ser
  auditáveis quando houver usuário operacional identificável.
- **FR-054**: Tentativas com credenciais inválidas antes da identificação
  operacional MUST NOT criar evento de sucesso em `historico_auditoria`.
- **FR-055**: Eventos de autenticação MUST NOT armazenar senha, senha anterior,
  autorização de recuperação, token de sessão, segredo, credencial ou seu
  conteúdo derivado.
- **FR-056**: Eventos auditados MUST respeitar a visibilidade por perfil e escopo
  já definida para `historico_auditoria`.
- **FR-057**: A feature MUST reutilizar as entidades, perfis, vínculos e funções
  de autorização existentes sem criar um novo modelo de permissão.
- **FR-058**: A feature MUST NOT alterar policies de RLS aprovadas nas Specs
  anteriores.
- **FR-059**: A feature MUST NOT implementar funcionalidade final dos módulos
  reservados às próximas specs.

### Key Entities *(include if feature involves data)*

- **Sessão autenticada**: Estado temporário que comprova a autenticação do
  usuário, possui validade e pode ser encerrado ou invalidado. Não substitui a
  autorização operacional.
- **Usuário operacional (`usuarios`)**: Cadastro existente da Spec 001 associado
  à identidade autenticada; fornece nome, estado ativo e perfil oficial.
- **Perfil operacional**: Um dos três papéis oficiais — Operador, Supervisão ou
  Direção/Administração — usado junto ao escopo por posto para autorizar áreas.
- **Posto (`postos`)**: Unidade operacional ativa que delimita o acesso de
  Operador e Supervisão.
- **Vínculo usuário/posto (`usuarios_postos`)**: Relação ativa existente que
  define os postos acessíveis e o nível de acesso no escopo operacional.
- **Evento de auditoria (`historico_auditoria`)**: Registro centralizado
  existente para eventos compatíveis de autenticação e bloqueio operacional,
  sem conteúdo secreto.
- **Destino de navegação**: Entrada prevista da aplicação com disponibilidade e
  autorização por perfil; não representa a implementação funcional do módulo.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos usuários válidos dos três perfis conseguem autenticar,
  visualizar sua identidade operacional correta e encerrar a sessão nos testes
  de aceitação.
- **SC-002**: Em 100% dos recarregamentos com sessão válida, nenhum conteúdo
  interno aparece antes da revalidação do usuário, perfil e escopo.
- **SC-003**: 100% das sessões expiradas ou invalidadas perdem acesso às áreas
  internas na primeira tentativa subsequente de navegação ou acesso protegido,
  sem exibir dados da resposta protegida.
- **SC-004**: Em testes com pelo menos três postos e usuários dos três perfis,
  Operador e Supervisão obtêm zero acesso a rotas ou dados fora de seu escopo,
  enquanto Direção/Administração mantém visão global.
- **SC-005**: 100% dos usuários inativos, sem cadastro operacional, sem perfil
  oficial ou sem posto obrigatório são bloqueados antes de visualizar dados
  internos.
- **SC-006**: 100% das tentativas de abrir diretamente uma URL não autorizada
  resultam em acesso negado sem carregamento de conteúdo protegido.
- **SC-007**: 100% dos itens de módulos ainda não implementados permanecem
  ocultos, explicitamente indisponíveis ou restritos a destinos neutros, sem
  ações ou dados funcionais simulados.
- **SC-008**: Em validação com cada perfil, 100% dos itens de menu exibidos e dos
  destinos acessíveis correspondem à matriz desta especificação e aos contratos
  mais restritivos das Specs 001–004.
- **SC-009**: Pelo menos 95% das autenticações válidas e restaurações de sessão
  apresentam a área segura ou um estado acionável em até 3 segundos sob
  condições normais de uso.
- **SC-010**: 100% dos fluxos de recuperação respondem sem revelar se o e-mail
  existe, e autorizações expiradas, inválidas ou reutilizadas são recusadas.
- **SC-011**: 100% das redefinições concluídas nos testes permitem autenticação
  com a nova senha e recusam a senha anterior.
- **SC-012**: 100% dos estados obrigatórios — carregamento, credenciais
  inválidas, acesso negado, configuração operacional ausente, sessão expirada,
  página inexistente e falha temporária — são distinguíveis e orientam uma
  próxima ação segura.
- **SC-013**: 100% dos eventos de autenticação gravados em
  `historico_auditoria` não contêm senha, token, segredo ou autorização de
  recuperação.
- **SC-014**: Em avaliação de usabilidade com representantes dos três perfis,
  pelo menos 90% conseguem entrar, identificar perfil/escopo, localizar um
  destino disponível e sair sem orientação externa.

## Assumptions

- A fundação de dados da Spec 001 está disponível, incluindo `usuarios`,
  `postos`, `usuarios_postos`, perfis oficiais, funções auxiliares de autorização
  e `historico_auditoria`.
- As Specs 002–004 permanecem como contratos vigentes para cadastros, importação
  MMS e assistências; esta feature apenas prepara seus destinos de navegação.
- O serviço de autenticação aprovado na constituição já suporta e-mail/senha,
  ciclo de sessão e recuperação de senha; detalhes de configuração pertencem ao
  plano.
- O endereço de e-mail é o identificador de entrada. Não haverá login por nome
  de usuário nesta feature.
- Operador e Supervisão precisam de ao menos um posto ativo em seu escopo;
  Direção/Administração possui escopo global mesmo sem vínculos.
- Mudanças de perfil, usuário, posto ou vínculo são efetivadas na interface assim
  que detectadas por uma nova verificação de autorização; nenhuma informação
  protegida pode continuar sendo usada depois da detecção.
- Uma página inicial neutra pode ocupar o destino Dashboard até que o dashboard
  funcional seja especificado e implementado.
- O refinamento para telas pequenas não faz parte desta feature, mas os fluxos
  críticos não devem depender de recursos exclusivos de uma resolução específica.
- Provisionamento, convite, confirmação administrativa e gestão completa de
  contas permanecem fora do escopo.
