# Feature Specification: Gestão de Importações MMS — Lotes, Tratamento, Reprocessamento e Desfazer

**Feature Branch**: `007-gestao-importacoes-mms`

**Created**: 2026-06-28

**Status**: Ready for Planning

**Input**: User description: "Criar a Spec 007 — Gestão de Lotes, Tratamento de Erros, Reprocessamento e Desfazer Importação MMS."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consultar lotes autorizados (Priority: P1)

Um usuário autenticado precisa consultar os lotes MMS que pertencem ao seu
escopo, localizar rapidamente importações por filtros operacionais e distinguir
lotes concluídos, cancelados, com falha ou que exigem tratamento.

**Why this priority**: A consulta é a entrada da central operacional e permite
acompanhar o que aconteceu após a ingestão sem depender de acesso técnico ou de
outras telas.

**Independent Test**: Entrar como Operador, Supervisão e
Direção/Administração, aplicar cada filtro e verificar que a lista, os totais e
os acessos respeitam perfil, postos e ordenação.

**Acceptance Scenarios**:

1. **Given** um Operador com dois postos vinculados, **When** abre Importações
   MMS, **Then** vê somente lotes que abrangem pelo menos um posto autorizado e
   somente informações das linhas e postos do seu escopo.
2. **Given** uma Supervisão com escopo operacional definido, **When** filtra por
   posto, data operacional, período de importação, status, erro, alerta ou
   importador permitido, **Then** recebe apenas lotes e totais compatíveis com
   seu escopo e com os filtros combinados.
3. **Given** um usuário de Direção/Administração, **When** abre a listagem,
   **Then** pode consultar globalmente os lotes, inclusive o importador, sem
   depender de vínculo com posto.
4. **Given** lotes em diferentes estados, **When** a lista é exibida, **Then**
   os mais recentes aparecem primeiro e os que precisam de tratamento,
   concluídos, cancelados ou com falha são distinguíveis.
5. **Given** nenhum lote autorizado ou nenhum resultado para os filtros,
   **When** a consulta termina, **Then** o sistema diferencia lista vazia de
   filtros sem resultado e oferece limpar filtros ou iniciar nova importação
   pelo fluxo da Spec 006.
6. **Given** uma URL direta da listagem, **When** a sessão está expirada ou o
   perfil não permite acesso, **Then** nenhum dado protegido é exibido e o
   estado correspondente da Spec 005 é apresentado.

---

### User Story 2 - Auditar o detalhe de um lote (Priority: P1)

Um usuário autorizado precisa abrir um lote e compreender sua origem, estado,
linhas, erros, alertas, resultado e histórico, sem perder a evidência original.

**Why this priority**: O detalhe reúne a prova necessária para explicar o
resultado da importação e decidir se o lote exige correção, reprocessamento ou
análise de desfazer.

**Independent Test**: Abrir por navegação e por URL direta lotes válidos, com
alertas, com erros, com falha e cancelados, conferindo dados, totais, histórico e
restrições por perfil.

**Acceptance Scenarios**:

1. **Given** um lote acessível, **When** o usuário abre seu detalhe, **Then**
   visualiza identificação, arquivo original, importador, data/hora, data
   operacional, postos autorizados, status oficial, estado de processamento e
   totais de linhas, assistências, partes, erros e alertas.
2. **Given** um lote processado, **When** o detalhe é exibido, **Then** o usuário
   vê os totais conciliados de registros criados, atualizados, preservados,
   removidos e reativados, além de eventuais falhas de processamento.
3. **Given** erros, alertas ou linhas em diferentes classificações, **When** o
   usuário navega pelo detalhe, **Then** consegue separar linhas válidas,
   válidas com alerta e inválidas e localizar cada ocorrência na linha original.
4. **Given** um arquivo original preservado, **When** um usuário autorizado
   solicita consultá-lo ou baixá-lo, **Then** o acesso é concedido apenas se o
   perfil e todos os postos expostos estiverem no escopo atual.
5. **Given** um usuário sem acesso ao lote, **When** tenta abrir sua URL direta,
   **Then** recebe acesso negado sem nome de arquivo, totais, dados técnicos ou
   confirmação da existência do lote.
6. **Given** um usuário autorizado conforme os contratos vigentes, **When**
   consulta o histórico, **Then** vê correções, tentativas de reprocessamento,
   cancelamento anterior à confirmação ou desfazer posterior e os eventos
   relevantes da auditoria centralizada.

---

### User Story 3 - Tratar erros preservando evidência (Priority: P1)

Um usuário autorizado precisa corrigir campos tratáveis, revalidar cada
correção e concluir o tratamento sem modificar a linha original ou produzir
alterações parciais no espelho.

**Why this priority**: Sem tratamento seguro, lotes com erros recuperáveis
permanecem bloqueados e a operação precisa reenviar arquivos que poderiam ser
corrigidos com rastreabilidade.

**Independent Test**: Corrigir campos permitidos em um lote com múltiplos erros,
simular concorrência e validar que somente correções atuais e válidas resolvem
erros, preservando valores originais e histórico.

**Acceptance Scenarios**:

1. **Given** um lote com erros tratáveis acessível ao usuário, **When** abre o
   tratamento, **Then** vê erros agrupados por linha, campo, descrição,
   severidade, valor original, valor normalizado, valor corrigido e situação
   atual.
2. **Given** uma regra determinística já aprovada, **When** existe sugestão de
   correção, **Then** ela é apresentada como sugestão revisável; na ausência de
   regra aprovada, nenhuma sugestão é inventada.
3. **Given** um valor corrigido permitido, **When** o usuário salva, **Then** o
   sistema revalida apenas o campo afetado, mantém a evidência original imutável
   e registra lote, linha, campo, valor anterior, valor corrigido, autor e data.
4. **Given** uma correção que continua inválida, **When** a validação termina,
   **Then** o erro permanece pendente e o lote continua impedido de processar.
5. **Given** uma correção salva por outro usuário após a abertura da tela,
   **When** o primeiro usuário tenta sobrescrevê-la, **Then** a alteração
   desatualizada é recusada e o valor mais recente é apresentado.
6. **Given** um valor de Área de Trabalho corrigido manualmente, **When** a
   correção é validada, **Then** ela vale somente para a linha ou lote tratado e
   não cria equivalência global de postos nem amplia o escopo do ator.
7. **Given** erros bloqueantes ainda ativos, **When** o usuário solicita concluir
   o tratamento, **Then** a conclusão é bloqueada e os pendentes são indicados.
8. **Given** apenas alertas não bloqueantes remanescentes, **When** a revalidação
   integral conclui que o lote está completo, **Then** o lote pode avançar para
   a confirmação de reprocessamento e os alertas continuam consultáveis.
9. **Given** um Operador com vínculo operacional no posto da linha, **When**
   salva uma correção tratável válida, **Then** a correção é registrada e
   revalidada, mas as ações de concluir tratamento e reprocessar permanecem
   indisponíveis; com vínculo somente de consulta, salvar também permanece
   indisponível.

---

### User Story 4 - Revalidar e reprocessar com segurança (Priority: P1)

Uma Supervisão no próprio escopo ou uma Direção/Administração precisa concluir o
tratamento, revisar o impacto e reprocessar o mesmo lote de forma atômica e
idempotente, reutilizando as regras de espelho das Specs 004 e 006.

**Why this priority**: O tratamento só entrega valor operacional quando o lote
corrigido pode atualizar o espelho sem duplicidade, remoção indevida ou falso
sucesso.

**Independent Test**: Reprocessar um lote elegível, repetir a confirmação,
simular falha intermediária e comparar o resultado persistido com os totais do
espelho.

**Acceptance Scenarios**:

1. **Given** um pedido para concluir tratamento, **When** o sistema revalida
   sessão, perfil, escopo, estado do lote, linhas e correções, **Then** só oferece
   reprocessamento se o lote inteiro estiver completo e sem erro bloqueante.
2. **Given** um lote elegível, **When** o resumo de impacto é apresentado,
   **Then** o usuário vê os efeitos previstos e precisa confirmar explicitamente
   antes da execução.
3. **Given** confirmação válida, **When** o reprocessamento termina, **Then**
   todas as alterações são aplicadas atomicamente e o resultado concilia
   criados, atualizados, preservados, removidos e reativados.
4. **Given** clique repetido, atualização da página ou repetição da mesma
   solicitação após sucesso, **When** o pedido é recebido novamente, **Then** o
   resultado persistido é devolvido sem reaplicar efeitos.
5. **Given** falha intermediária, **When** o processamento não pode terminar,
   **Then** nenhuma mudança parcial no espelho é apresentada como sucesso, a
   tentativa fica auditável e uma nova tentativa segura continua possível.
6. **Given** um lote inelegível, incompleto ou com erro, **When** o
   reprocessamento é solicitado, **Then** nenhuma assistência ou parte é criada,
   atualizada, removida ou reativada.
7. **Given** necessidade de importar outro arquivo para o mesmo posto/data,
   **When** o usuário procura essa ação no tratamento, **Then** é direcionado à
   nova importação da Spec 006, sem substituir a evidência deste lote.

---

### User Story 5 - Analisar e desfazer uma importação elegível (Priority: P2)

Uma Supervisão ou Direção/Administração autorizada precisa analisar o impacto e,
quando todas as condições permanecerem válidas, desfazer atomicamente uma
importação processada, sem excluir evidências.

**Why this priority**: Desfazer corrige uma importação indevida, mas depende das
capacidades de consulta, auditoria e segurança do MVP P1 e possui maior risco
operacional.

**Independent Test**: Analisar lotes elegíveis e bloqueados, alterar uma
dependência após a análise, confirmar com justificativa e repetir a solicitação,
verificando status, efeitos, histórico e atomicidade.

**Acceptance Scenarios**:

1. **Given** um lote concluído e não cancelado, **When** o usuário solicita
   analisar o desfazer, **Then** o sistema verifica se ele é o lote efetivo mais
   recente de todos os postos/datas afetados, além de autorização, alterações
   manuais posteriores, ocorrências, custos extras e demais dependências
   operacionais de todas as assistências e partes afetadas.
2. **Given** qualquer impedimento, **When** a análise termina, **Then** o lote é
   declarado inelegível, todos os motivos permitidos são listados e nenhuma ação
   de sucesso é registrada.
3. **Given** um lote elegível, **When** a análise termina, **Then** o impacto
   previsto é apresentado e a execução exige justificativa obrigatória e
   confirmação explícita.
4. **Given** uma análise antes elegível, **When** outro usuário cria uma
   dependência ou altera um registro antes da confirmação, **Then** a execução
   revalida o estado atual e bloqueia o desfazer.
5. **Given** confirmação ainda elegível, **When** o desfazer termina, **Then** o
   lote assume status Cancelado, seus efeitos operacionais são ajustados
   atomicamente conforme a regra esclarecida e arquivo, staging, `raw_json`,
   correções e histórico permanecem acessíveis.
6. **Given** um lote já desfeito ou uma confirmação repetida, **When** a ação é
   solicitada novamente, **Then** nenhum efeito é repetido e o resultado atual é
   apresentado.
7. **Given** falha intermediária ou impossibilidade de reconstruir com segurança
   o estado correto, **When** a execução ocorre, **Then** toda alteração é
   revertida, o lote não recebe falso sucesso e a operação fica bloqueada.

### MVP da Feature

O MVP mínimo desta feature é formado pelas User Stories 1 a 4: consulta de
lotes, detalhe auditável, tratamento de erros e reprocessamento seguro. A User
Story 5 integra o escopo aprovado da Spec 007, mas é P2 e só pode avançar após a
decisão explícita sobre importações posteriores e restauração do espelho.

### Edge Cases

- Um lote multi-posto contém postos dentro e fora do escopo do usuário: a
  consulta não pode vazar linhas, totais, arquivo ou dados técnicos dos postos
  não autorizados; ações sobre o lote inteiro exigem autorização para todos os
  postos afetados.
- Um vínculo de posto ou perfil muda enquanto a tela está aberta: qualquer ação
  mutável revalida o escopo e falha sem efeitos se a autorização deixou de
  existir.
- O arquivo original está indisponível temporariamente: o lote e sua auditoria
  continuam consultáveis, mas consulta/baixar arquivo informa falha sem expor
  caminho interno.
- Um erro já foi corrigido ou deixou de existir após revalidação: a interface
  mostra o estado atual e não cria correção duplicada.
- Duas pessoas corrigem a mesma linha ou campo: somente a alteração baseada na
  versão atual pode ser aceita.
- Uma correção válida resolve um erro e revela outro: a linha permanece pendente
  até a revalidação integral satisfazer todas as regras.
- Restam somente alertas: eles permanecem visíveis e não são encerrados pela
  simples consulta ou pelo processamento.
- A sessão expira durante correção, reprocessamento ou desfazer: nenhuma resposta
  iniciada sob contexto inválido é tratada como sucesso.
- O resultado de uma execução fica incerto por falha de comunicação: a retomada
  consulta o estado persistido antes de oferecer nova execução.
- Um lote está em reprocessamento ou sendo corrigido por outro usuário: ações
  incompatíveis são bloqueadas e o estado em andamento é informado.
- Um lote foi cancelado antes da confirmação pela Spec 006: ele não é tratado
  como importação processada desfeita e não pode executar o fluxo de reversão.
- Uma análise de desfazer fica antiga: qualquer mudança relevante invalida a
  análise e exige nova avaliação.
- Uma assistência afetada possui parte com ocorrência, custo extra ou edição
  manual posterior: o lote inteiro é bloqueado para desfazer.
- Filtros combinados não retornam dados: o sistema preserva os filtros e oferece
  uma forma clara de removê-los.
- Falha temporária não pode ser apresentada como lista vazia, acesso negado,
  correção salva, reprocessamento concluído ou desfazer concluído.

## Requirements *(mandatory)*

### Constitution Alignment *(mandatory)*

- **MMS como fonte externa**: o arquivo original e todo `raw_json` permanecem
  imutáveis; correções são dados separados e rastreáveis, sem reescrever a
  evidência da MMS.
- **MVP e escopo controlado**: a feature cobre gestão posterior dos lotes das
  Specs 003–006 e não cria novo parser, upload, integração automática,
  ocorrência, custo, dashboard ou edição manual do espelho.
- **Perfil e posto**: toda leitura e ação considera sessão, perfil e escopo atual
  de postos; proteção de rota ou menu nunca substitui a autorização dos dados.
- **Modelagem auditável**: a feature reutiliza lotes, linhas, erros, alertas,
  assistências, partes e `historico_auditoria`; não cria histórico paralelo,
  não usa exclusão física e não confunde status Cancelado com soft delete.
- **Importação rastreável e idempotente**: tratamento e reprocessamento preservam
  a chave operacional MMS, aplicam precedência apenas a correções autorizadas,
  mantêm atomicidade e não repetem efeitos; somente lote completo e elegível
  pode aplicar a regra vigente de `removido`.
- **Produto e interface**: as jornadas usam português brasileiro, o design
  system Doka, comportamento desktop-first e estados comuns definidos pela Spec
  005.
- **Decisões esclarecidas**: Operador com vínculo operacional pode salvar
  correções nos próprios postos, mas não concluir tratamento nem reprocessar; o
  desfazer se limita ao lote efetivo mais recente de cada posto/data afetado e
  restaura o estado anterior somente quando isso puder ser feito com segurança.

### Scope Boundaries

Esta feature reutiliza integralmente autenticação, navegação, staging,
armazenamento, validação, processamento e espelho definidos nas Specs 001–006.
Ela não redefine status oficiais, chaves MMS, normalização, elegibilidade,
autorização existente, regra de registros ausentes ou formato dos resultados.

Ficam fora do escopo: novo parser CSV/XLSX; novo upload; substituição do arquivo
original; importação parcial; equivalência global de postos; edição manual de
assistências já processadas; telas finais de Assistências/MMS; criação de
ocorrências ou custos; tarefas, dashboard, BI; integração automática com MMS; e
exclusão física de qualquer evidência ou registro.

### Functional Requirements

- **FR-001**: O sistema MUST apresentar lotes autorizados ordenados do mais
  recente para o mais antigo, com data/hora de importação, data operacional,
  postos, importador permitido, arquivo, status oficial, estado de
  processamento e totais de linhas, assistências, partes, erros e alertas.
- **FR-002**: O sistema MUST permitir combinar filtros por posto, data
  operacional, período de importação, status, presença de erro, presença de
  alerta e importador quando o perfil puder consultá-lo.
- **FR-003**: O sistema MUST distinguir carregamento, lista vazia, filtros sem
  resultado, falha temporária, sessão expirada e acesso negado.
- **FR-004**: O sistema MUST permitir iniciar nova importação exclusivamente
  pelo fluxo vigente da Spec 006.
- **FR-005**: O sistema MUST apresentar no detalhe somente postos, linhas,
  totais e dados que o usuário atual possa consultar, sem inferir acesso pelo
  menu ou pela URL.
- **FR-006**: O sistema MUST mostrar no detalhe identificação e origem do lote,
  status, estado de processamento, classificações de linha, erros, alertas,
  resultado conciliado, falhas e histórico relevante.
- **FR-007**: O sistema MUST permitir consulta ou download do arquivo original
  somente a usuários autorizados a todo o conteúdo exposto pelo arquivo.
- **FR-008**: O sistema MUST restringir `raw_json` e outros dados técnicos aos
  perfis e escopos já aprovados, sem ampliar as permissões das Specs vigentes.
- **FR-009**: O sistema MUST permitir localizar cada erro ou alerta em seu lote,
  linha e campo de origem e distinguir claramente bloqueante, tratável e não
  bloqueante.
- **FR-010**: O sistema MUST manter alertas consultáveis após processamento e
  MUST NOT alterá-los por mera visualização nem criar ocorrência ou fluxo de
  aprovação sem regra aprovada.
- **FR-011**: O sistema MUST preservar arquivo original e `raw_json` imutáveis;
  valor corrigido e valor original MUST permanecer separados.
- **FR-012**: Cada correção MUST registrar lote, linha, campo, valor anterior,
  valor corrigido, autor e data no histórico centralizado.
- **FR-013**: O sistema MUST aceitar correção somente em campo explicitamente
  tratável e MUST revalidar o valor antes de considerar o erro resolvido.
- **FR-014**: Uma correção MUST NOT alterar silenciosamente outro campo, criar
  equivalência global de posto, ampliar acesso ou substituir evidência original.
- **FR-015**: Sugestões de correção MUST ser exibidas somente quando derivadas de
  regra determinística já aprovada e MUST exigir revisão do usuário.
- **FR-016**: O sistema MUST detectar correções concorrentes e rejeitar gravação
  baseada em versão desatualizada, preservando a correção mais recente.
- **FR-017**: Operador com vínculo operacional MUST poder salvar correções de
  campos tratáveis nas linhas dos próprios postos; Operador com vínculo somente
  de consulta MUST permanecer somente leitura. Nenhum Operador pode concluir o
  tratamento, validar o lote para processamento, reprocessar ou desfazer.
- **FR-018**: Supervisão MUST poder tratar, validar correções, reprocessar e
  solicitar análise de desfazer somente no próprio escopo;
  Direção/Administração MUST ter o mesmo conjunto de ações em escopo global,
  sempre sujeito às regras de elegibilidade.
- **FR-019**: O sistema MUST revalidar sessão, perfil, todos os postos afetados,
  estado atual do lote, linhas e correções antes de concluir tratamento,
  reprocessar ou desfazer.
- **FR-020**: Enquanto existir erro bloqueante ativo, o sistema MUST impedir
  conclusão do tratamento e qualquer atualização do espelho.
- **FR-021**: Quando restarem somente alertas e o lote estiver completo, o
  sistema MUST permitir revisão do impacto e confirmação explícita do
  reprocessamento.
- **FR-022**: O reprocessamento MUST usar evidência original mais correções
  autorizadas separadas, sem criar ou substituir `raw_json`.
- **FR-023**: O reprocessamento MUST reutilizar a elegibilidade, chave
  operacional, idempotência, regra de `removido` e resultado das Specs 004 e 006.
- **FR-024**: O reprocessamento MUST abranger o lote inteiro atomicamente; falha
  intermediária MUST deixar o espelho sem efeitos parciais apresentados como
  sucesso.
- **FR-025**: Repetições da mesma confirmação MUST retornar o resultado
  persistido sem criar, atualizar, remover ou reativar registros novamente.
- **FR-026**: Cada tentativa de correção, conclusão e reprocessamento MUST
  permanecer auditável; tentativa bloqueada MUST NOT gerar evento falso de
  sucesso.
- **FR-027**: O resultado final MUST conciliar totais de criados, atualizados,
  preservados, removidos e reativados com os efeitos persistidos.
- **FR-028**: Uma nova versão de arquivo para o mesmo posto/data MUST continuar
  sendo uma nova importação da Spec 006, nunca uma substituição no tratamento.
- **FR-029**: O sistema MUST diferenciar cancelamento anterior ao processamento,
  definido na Spec 006, de desfazer os efeitos de lote já processado.
- **FR-030**: Antes de desfazer, o sistema MUST analisar se o lote está
  concluído, não cancelado, integralmente autorizado e sem edição manual
  posterior incompatível, ocorrência, custo extra ou outra dependência
  operacional insegura em qualquer registro afetado.
- **FR-031**: Uma análise inelegível MUST listar motivos de bloqueio permitidos e
  MUST NOT habilitar confirmação nem registrar sucesso.
- **FR-032**: Uma análise elegível MUST apresentar impacto previsto e exigir
  justificativa obrigatória e confirmação explícita.
- **FR-033**: O sistema MUST revalidar toda condição de desfazer imediatamente
  antes da execução e MUST invalidar análise antiga após mudança relevante.
- **FR-034**: O sistema MUST permitir desfazer somente o lote concluído que seja
  o efetivo mais recente para cada posto/data afetado. A operação MUST restaurar
  o estado derivado do lote elegível imediatamente anterior; quando não houver
  lote anterior, MUST retirar da visão operacional os efeitos introduzidos
  exclusivamente pelo lote, sem exclusão física. Se o lote não for o mais
  recente em todos os seus postos/datas ou se o estado anterior não puder ser
  reconstruído com segurança, o desfazer MUST ser bloqueado.
- **FR-035**: O desfazer MUST ser atômico, idempotente e executável no máximo uma
  vez; falha intermediária MUST reverter todos os efeitos.
- **FR-036**: Um desfazer concluído MUST mudar o lote para Cancelado sem soft
  delete nem exclusão física e MUST preservar arquivo, staging, `raw_json`,
  correções, tentativas e histórico.
- **FR-037**: O desfazer MUST NOT apagar fisicamente assistências ou partes; se
  o estado operacional seguro não puder ser reconstruído, a operação MUST ser
  bloqueada.
- **FR-038**: Toda ação mutável MUST impedir efeitos duplicados causados por
  concorrência, clique repetido, atualização da página ou repetição de
  solicitação.
- **FR-039**: Em resposta incerta, o sistema MUST consultar o estado persistido
  antes de permitir nova tentativa e MUST NOT presumir sucesso ou falha.
- **FR-040**: A interface MUST seguir o design system Doka, usar português
  brasileiro, ser desktop-first e oferecer identificação não baseada somente em
  cor para estados, erros, alertas e ações destrutivas.

### Permission Rules

- Operador consulta lotes, linhas, erros, alertas e resultados somente dos
  postos vinculados. Quando seu vínculo for operacional, pode salvar correções
  tratáveis nesses postos; vínculo somente de consulta permanece somente
  leitura. Operador não conclui tratamento, não reprocessa e não desfaz.
- Supervisão consulta e executa ações mutáveis somente quando todos os postos
  afetados pertencem ao seu escopo e as regras da ação permitem.
- Direção/Administração possui consulta e atuação globais, mas não ultrapassa
  elegibilidade, imutabilidade, atomicidade ou dependências operacionais.
- Nenhum perfil acessa lote, arquivo, linha, erro, alerta ou correção fora do
  escopo atual.
- Toda ação mutável revalida autorização no momento da execução.

### Audit Events

Devem ser rastreáveis no `historico_auditoria`, sem histórico paralelo:

- correção proposta, aceita ou rejeitada;
- erro resolvido ou novamente identificado pela revalidação;
- tratamento concluído ou bloqueado;
- reprocessamento solicitado, concluído ou falho;
- análise de desfazer realizada e seus motivos de bloqueio;
- desfazer solicitado, concluído ou falho;
- mudança de status oficial ou estado de processamento;
- ator, data/hora, lote, linha/campo quando aplicável, valores anterior e novo,
  justificativa e resultado.

Falhas de autorização ou validação não podem registrar evento de sucesso.
Informações sensíveis, segredos e conteúdo integral do arquivo não devem ser
copiados para a auditoria.

### Key Entities *(include if feature involves data)*

- **Lote de importação MMS**: entidade existente que identifica origem, ator,
  datas, postos, status oficial, estado de processamento, totais, confirmação,
  cancelamento e resultado.
- **Linha de importação MMS**: evidência existente de uma linha do arquivo, com
  `raw_json` imutável, dados normalizados separados e estado de validação.
- **Erro de importação MMS**: problema existente ligado a lote e linha, com
  campo, código, mensagem, severidade e situação de resolução.
- **Alerta de importação MMS**: inconsistência não bloqueante existente, mantida
  consultável sem fluxo de encerramento criado por esta feature.
- **Correção de importação**: registro auditável separado da evidência original,
  associado a lote, linha e campo, com valores, autor, data e versão de
  concorrência.
- **Tentativa de reprocessamento**: registro da solicitação e resultado de cada
  tentativa sobre o mesmo lote, sem duplicar efeitos do espelho.
- **Análise de desfazer**: fotografia temporária de elegibilidade e impacto que
  precisa ser revalidada antes da execução.
- **Assistência e parte MMS**: entidades existentes do espelho operacional cujos
  efeitos são consultados, reprocessados ou ajustados sem exclusão física.
- **Histórico de auditoria**: registro central existente para todas as ações
  críticas; nenhuma entidade paralela de histórico será criada.

### Dependencies

- Specs 001–002: usuários, postos, vínculos, perfis, autorização e auditoria.
- Spec 003: lotes, linhas, erros, alertas, status e acesso ao staging.
- Spec 004: espelho, chave operacional, correções separadas, idempotência,
  `removido`, reativação e auditoria.
- Spec 005: autenticação, sessão, contexto operacional, rotas e estados comuns.
- Spec 006: arquivo original, ingestão, validação, confirmação, processamento
  atômico, resultados persistidos e cancelamento antes da confirmação.
- Design system oficial Doka para interface desktop-first.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em testes por perfil, 100% dos lotes, linhas, arquivos, erros,
  alertas e correções fora do escopo permanecem inacessíveis inclusive por URL
  direta.
- **SC-002**: Um usuário encontra um lote conhecido usando filtros e abre seu
  detalhe em até 60 segundos em pelo menos 90% dos testes de usabilidade.
- **SC-003**: Para lotes de até 10.000 linhas, listagem inicial e aplicação de
  filtros apresentam resultado ou estado de progresso em até 2 segundos em pelo
  menos 95% das tentativas no ambiente de aceite.
- **SC-004**: 100% dos detalhes testados conciliam totais de linhas, erros,
  alertas, assistências, partes e resultado com os registros autorizados.
- **SC-005**: 100% das correções aceitas preservam o valor original, registram
  autor/data/valor e passam por revalidação antes de resolver o erro.
- **SC-006**: Em testes concorrentes, 100% das tentativas baseadas em correção
  desatualizada são bloqueadas sem perda da alteração mais recente.
- **SC-007**: Nenhum dos testes com erro bloqueante permite concluir tratamento,
  reprocessar ou alterar o espelho.
- **SC-008**: Repetir três vezes um reprocessamento bem-sucedido produz os mesmos
  totais e zero efeito operacional adicional.
- **SC-009**: Em 100% das falhas intermediárias injetadas, reprocessamento e
  desfazer deixam zero efeito parcial apresentado como sucesso.
- **SC-010**: 100% dos lotes inelegíveis para desfazer exibem ao menos um motivo
  verificável e não oferecem execução.
- **SC-011**: 100% das mudanças relevantes feitas após uma análise de desfazer
  invalidam a análise antiga antes de qualquer efeito.
- **SC-012**: Após reprocessar ou desfazer, 100% dos resultados apresentados
  conciliam com o estado persistido e todas as evidências originais continuam
  consultáveis por usuários autorizados.
- **SC-013**: Pelo menos 90% dos usuários de aceite distinguem corretamente, sem
  ajuda, erro bloqueante, alerta, falha de processamento e lote cancelado.
- **SC-014**: 100% das ações críticas concluídas possuem evento rastreável na
  auditoria central e nenhuma operação bloqueada possui falso evento de sucesso.

## Assumptions

- As Specs 001–006 são contratos vigentes e prevalecem sobre sugestões antigas
  dos documentos de produto quando já fecharam uma decisão.
- Um lote pode abranger múltiplos postos; ações atômicas sobre o lote exigem que
  o ator esteja autorizado para todos os postos afetados.
- Os quatro status oficiais continuam sendo Importado, Importado com alertas,
  Erro e Cancelado; condições intermediárias usam o estado de processamento
  existente e não criam novos status oficiais.
- Alertas permanecem informativos e consultáveis; esta feature não cria
  aprovação, encerramento ou ocorrência a partir deles.
- Reprocessar o mesmo lote é diferente de importar um novo arquivo para o mesmo
  posto/data.
- A análise de desfazer não reserva nem congela registros; por isso toda condição
  é revalidada imediatamente antes da execução.
- Justificativas de desfazer são obrigatórias e legíveis para auditoria, mas não
  podem conter segredos ou cópia integral do arquivo.
- A experiência refinada para celular permanece fora deste ciclo; os fluxos
  devem funcionar no padrão desktop-first do projeto.
