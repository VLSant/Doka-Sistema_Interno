# Feature Specification: Importação MMS — Upload, Parser, Validação e Processamento

**Feature Branch**: `006-importacao-mms-processamento`

**Created**: 2026-06-27

**Status**: Draft

**Input**: User description: "Criar a Spec 006 — Importação MMS: Upload, Parser, Validação e Processamento, integrando a aplicação web da Spec 005 ao staging da Spec 003 e ao espelho idempotente da Spec 004."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Acessar e selecionar uma planilha MMS (Priority: P1)

Um usuário autenticado dos perfis Operador, Supervisão ou
Direção/Administração precisa acessar Nova Importação MMS e selecionar uma
planilha CSV ou XLSX compatível contendo um ou mais postos ativos.

**Why this priority**: A entrada segura e a seleção do arquivo são necessárias
para iniciar qualquer importação manual sem expor dados ou ações fora do escopo
operacional do usuário.

**Independent Test**: Entrar com cada perfil, acessar Importações MMS, selecionar
arquivos suportados e não suportados e verificar acesso, feedback e bloqueios
antes de qualquer alteração no espelho.

**Acceptance Scenarios**:

1. **Given** um Operador ativo, **When** acessa Importações MMS, **Then**
   encontra a entrada funcional e pode selecionar um arquivo com qualquer
   posto ativo cadastrado.
2. **Given** uma Supervisão ativa, **When** acessa a mesma entrada, **Then**
   possui a mesma permissão global de ingestão.
3. **Given** Direção/Administração ativa, **When** acessa a entrada, **Then** pode
   iniciar importação para qualquer posto ativo identificado.
4. **Given** um usuário sem autorização operacional válida, **When** tenta abrir
   a rota diretamente, **Then** o acesso é bloqueado antes da exibição de dados
   protegidos.
5. **Given** um arquivo com extensão diferente de CSV ou XLSX, **When** o usuário
   o seleciona, **Then** o sistema recusa o arquivo com mensagem em português e
   não altera staging nem espelho.
6. **Given** um arquivo CSV ou XLSX selecionado, **When** seu conteúdo não
   corresponde ao formato suportado, **Then** o sistema o classifica como
   incompatível sem confiar apenas na extensão.

---

### User Story 2 - Analisar e revisar a prévia da importação (Priority: P1)

Antes de confirmar, o usuário precisa ver o arquivo interpretado, o posto e a
data identificados, os totais operacionais e a classificação das linhas, dos
erros bloqueantes e dos alertas.

**Why this priority**: A prévia permite verificar se a planilha representa o
posto e o dia esperados e impede que dados incompletos ou fora do escopo alterem
o espelho.

**Independent Test**: Enviar arquivos válidos, válidos com alertas e inválidos;
comparar a prévia com seu conteúdo original e verificar a possibilidade ou
impossibilidade de confirmação.

**Acceptance Scenarios**:

1. **Given** uma planilha válida com uma ou mais Áreas de Trabalho e uma única
   data, **When** a análise termina, **Then** um único lote e uma única prévia
   mostram arquivo, todos os postos, data, total
   de linhas, assistências principais, partes, linhas válidas, linhas válidas
   com alerta, linhas inválidas, erros bloqueantes e alertas.
2. **Given** uma planilha completa com apenas alertas não bloqueantes, **When** a
   prévia é exibida, **Then** cada alerta é compreensível, as linhas afetadas são
   contabilizadas e a confirmação permanece disponível.
3. **Given** uma planilha com qualquer erro bloqueante, **When** a prévia é
   exibida, **Then** a causa é apresentada, a confirmação fica indisponível e o
   espelho não é alterado.
4. **Given** valores originais com espaços, grafia ou formato que exijam
   normalização, **When** a análise termina, **Then** a prévia usa os valores
   normalizados para classificação sem substituir a evidência original.
5. **Given** várias linhas com o mesmo número de assistência e partes
   diferentes, **When** os totais são calculados, **Then** a prévia conta uma
   assistência principal e todas as partes distintas.
6. **Given** um posto ativo não vinculado ao usuário, **When** a validação
   ocorre, **Then** a ingestão controlada permanece permitida sem liberar a
   consulta operacional daquele posto.

---

### User Story 3 - Confirmar e atualizar o espelho operacional (Priority: P1)

Após revisar uma prévia elegível, o usuário precisa confirmar explicitamente a
importação para concluir o lote, persistir suas linhas e atualizar de forma
atômica e rastreável o espelho operacional.

**Why this priority**: A confirmação separa análise de mudança operacional e
garante que apenas um retrato completo e autorizado da MMS afete assistências e
partes.

**Independent Test**: Confirmar um arquivo elegível e verificar o lote, as
linhas, o arquivo original, a atualização do espelho, os totais finais e a
auditoria, sem depender das telas futuras de histórico de lotes.

**Acceptance Scenarios**:

1. **Given** uma prévia completa, validada, elegível e ainda atual, **When** o
   usuário confirma, **Then** o lote e suas linhas ficam persistidos conforme a
   Spec 003 e o processamento da Spec 004 é acionado uma única vez.
2. **Given** um arquivo aceito para análise, **When** sua tentativa é
   persistida, **Then** o arquivo original fica armazenado com vínculo
   rastreável ao lote, ao usuário importador, ao posto e à data de atividade.
3. **Given** linhas de uma assistência com múltiplas partes, **When** a
   importação é confirmada, **Then** existe uma única assistência principal e
   uma parte para cada chave operacional completa.
4. **Given** uma falha em qualquer etapa necessária à atualização do espelho,
   **When** o processamento termina com erro, **Then** não existe estado final
   enganoso, alteração parcial considerada concluída nem auditoria falsa de
   sucesso.
5. **Given** a confirmação foi enviada uma vez, **When** o usuário clica
   repetidamente ou a resposta é reenviada, **Then** existe no máximo um efeito
   operacional para aquela confirmação.
6. **Given** a sessão ou o escopo mudou depois da prévia, **When** o usuário
   confirma, **Then** identidade, perfil, posto, elegibilidade e integridade da
   tentativa são revalidados antes de qualquer mudança no espelho.

---

### User Story 4 - Reimportar o mesmo posto e data sem duplicidade (Priority: P1)

Os três perfis autorizados precisam importar várias vezes o mesmo posto e data
para refletir o retrato MMS mais recente, sem duplicar assistências ou partes e
sem perder a rastreabilidade das importações anteriores.

**Why this priority**: A operação atualiza a MMS ao longo do dia; a reimportação
idempotente é a regra central para o Doka permanecer um espelho confiável.

**Independent Test**: Importar e reimportar o mesmo posto/data com registros
inalterados, alterados, novos, ausentes e reaparecidos, verificando cada
resultado previsto.

**Acceptance Scenarios**:

1. **Given** o mesmo arquivo ou os mesmos dados elegíveis já foram processados,
   **When** são importados novamente, **Then** nenhuma assistência ou parte é
   duplicada.
2. **Given** uma chave operacional já existente com valores importados
   alterados, **When** uma nova importação elegível é confirmada, **Then** a
   parte existente é atualizada e a origem da atualização fica rastreável.
3. **Given** uma chave operacional nova para uma assistência existente, **When**
   a nova importação é confirmada, **Then** a nova parte é criada sob a mesma
   assistência principal.
4. **Given** uma parte ativa não aparece em uma nova importação completa e
   elegível do mesmo posto/data, **When** o processamento termina, **Then** a
   parte é marcada como `removido` conforme a Spec 004.
5. **Given** uma parte marcada como `removido` reaparece, **When** uma importação
   elegível posterior é confirmada, **Then** ela é reativada e atualizada.
6. **Given** um lote com erro, cancelado, incompleto, parcial ou inelegível,
   **When** sua análise ou processamento termina, **Then** ele não atualiza o
   espelho e não marca registros ausentes como `removido`.

---

### User Story 5 - Cancelar ou abandonar antes da confirmação (Priority: P2)

O usuário precisa poder desistir da tentativa durante seleção ou prévia sem
alterar assistências e partes do espelho.

**Why this priority**: A desistência segura evita mudanças acidentais e mantém
clara a diferença entre analisar um arquivo e confirmar seu efeito operacional.

**Independent Test**: Cancelar em cada etapa anterior à confirmação e encerrar a
sessão durante a prévia, verificando que o espelho permanece inalterado e que
eventual evidência já persistida não simula sucesso.

**Acceptance Scenarios**:

1. **Given** um arquivo apenas selecionado e ainda não persistido, **When** o
   usuário cancela, **Then** o fluxo é encerrado sem criar efeito operacional.
2. **Given** uma tentativa já preservada para análise, **When** o usuário
   cancela antes da confirmação, **Then** ela permanece rastreável como
   cancelada conforme os contratos vigentes e não altera o espelho.
3. **Given** o usuário abandona a tela ou perde a sessão antes da confirmação,
   **When** a tentativa deixa de poder continuar, **Then** nenhuma atualização
   do espelho ocorre e a interface não a apresenta como importação concluída.
4. **Given** uma tentativa cancelada, **When** o usuário retorna à Nova
   Importação MMS, **Then** inicia uma nova tentativa sem reaproveitar
   silenciosamente uma confirmação anterior.

---

### User Story 6 - Compreender o resultado final (Priority: P2)

Ao término, o usuário precisa receber um resultado em português que diferencie
sucesso, sucesso com alertas e falha e que permita rastrear o que ocorreu.

**Why this priority**: O resumo final permite confirmar o impacto operacional e
identificar quando nenhuma mudança segura foi realizada.

**Independent Test**: Concluir importações com sucesso, alertas e falha e
conferir o resumo com os registros efetivamente afetados.

**Acceptance Scenarios**:

1. **Given** uma importação concluída, **When** o resultado é exibido, **Then**
   apresenta lote, arquivo, posto, data e totais de registros criados,
   atualizados, preservados, removidos, reativados, inválidos e com alerta.
2. **Given** uma importação sem mudança material em registros existentes,
   **When** o resultado é exibido, **Then** esses registros são contabilizados
   como preservados e não como atualizações fictícias.
3. **Given** uma importação concluída com alertas, **When** o resultado é
   exibido, **Then** o sucesso com alertas é distinguível do sucesso sem
   alertas, sem indicar falha.
4. **Given** o processamento falha depois da confirmação, **When** o resultado é
   exibido, **Then** informa que o espelho não foi concluído, orienta uma nova
   tentativa segura e não apresenta totais de sucesso não confirmados.
5. **Given** qualquer resultado, **When** o usuário encerra a consulta, **Then**
   pode voltar com segurança à área autenticada sem depender da listagem
   histórica completa de lotes.

### Edge Cases

- CSV ou XLSX com extensão válida, mas conteúdo ilegível, vazio, corrompido ou
  protegido por senha.
- Arquivo com cabeçalhos consumidos pela importação duplicados, cabeçalhos
  escritos com variação não suportada ou sem uma coluna obrigatória;
  duplicidades em colunas desconhecidas/não utilizadas são permitidas.
- Arquivo com mais de uma área de trabalho, que deve ser particionado em lotes
  independentes, ou com mais de uma data operacional, que permanece bloqueante.
- Área de Trabalho ausente, vazia, correspondente a posto inexistente, inativo
  ou removido logicamente.
- Variação do nome do posto sem correspondência exata; não deve haver
  equivalência automática nem associação manual nesta feature.
- Data ausente, inválida ou divergente entre linhas.
- Número da assistência vazio, inválido após normalização ou com formatos
  distintos que representem a mesma identidade.
- Parte do conjunto ausente ou inválida quando exigida pelo contrato MMS.
- Linhas repetidas com a mesma chave operacional completa dentro do arquivo.
- Status da Atividade ou Tipo de Atividade ausente ou não reconhecido.
- Campo opcional inválido coexistindo com todos os campos obrigatórios válidos.
- Uma mesma assistência contém partes com status ou tipos diferentes.
- Falha ao armazenar o arquivo original ou ao vinculá-lo ao lote.
- Falha ao criar lote, persistir linhas, consolidar totais ou registrar
  erros/alertas.
- Falha durante a atualização do espelho depois da confirmação.
- Sessão expirada, perfil alterado, vínculo removido ou posto inativado durante
  seleção, prévia ou confirmação.
- Duplo clique, reenvio por rede ou nova tentativa após resposta incerta.
- Cancelamento, fechamento da janela ou perda de conexão antes da confirmação.
- Reimportação com dados idênticos, alterados, novos, ausentes e reaparecidos.
- Lote sem linhas ativas, com totais inconsistentes ou com linha não
  transformável.
- Valor original `null`, vazio, com espaços ou caracteres especiais que não
  pode ser substituído pela forma normalizada em `raw_json`.

## Requirements *(mandatory)*

### Constitution Alignment *(mandatory)*

- **I. MMS como Fonte Operacional Externa**: a feature somente importa e reflete
  planilhas MMS; não transforma o Doka na fonte oficial dos dados de
  produtividade, assistência, posto ou atividade.
- **II. MVP Operacional e Escopo Controlado**: a feature entrega apenas a
  importação manual, da seleção ao resultado. Integração automática, importação
  agendada, associação automática de postos e módulos posteriores permanecem
  fora do escopo.
- **III. Supabase, RLS e Permissões por Perfil/Posto**: a identidade e o contexto
  da Spec 005 são reutilizados; Operador e Supervisão permanecem limitados ao
  escopo, Direção/Administração tem escopo global e a interface não substitui
  RLS nem as funções vigentes de autorização.
- **IV. Modelagem Auditável em Português**: a feature consome as entidades em
  português das Specs 001, 003 e 004, preserva o arquivo e os valores originais
  e registra ações críticas no `historico_auditoria`, sem criar histórico
  paralelo.
- **V. Importação MMS Rastreável e Idempotente**: cada linha preserva
  `raw_json`; a assistência principal usa posto, data e número; as partes usam a
  chave completa `posto_id + data_atividade + numero_assistencia +
  parte_conjunto`; somente importação completa e elegível pode atualizar o
  espelho, marcar `removido` ou reativar registros.
- **Produto e interface**: toda a jornada usa português brasileiro, segue o
  design system Doka, mantém Poppins, componentes e estados oficiais e prioriza
  desktop/notebook.
- Nenhum princípio, entidade, status, modelo de permissão ou decisão fechada das
  Specs 001–005 é substituído por esta feature.

### Scope Boundaries

Esta feature inclui:

- entrada funcional de navegação para Importações MMS e Nova Importação MMS;
- seleção manual, armazenamento, leitura e validação de CSV/XLSX MMS;
- parser, preservação da linha original, normalização, erros e alertas;
- prévia, confirmação explícita, cancelamento anterior à confirmação e
  resultado imediato;
- uso das entidades de staging da Spec 003;
- acionamento controlado do processamento idempotente da Spec 004;
- mensagens, carregamento, autorização, auditoria e comportamento desktop.

Esta feature não inclui:

- listagem histórica completa ou detalhe administrativo completo de lotes;
- edição/correção manual de linhas, tela especializada de tratamento de erros,
  reprocessamento manual ou desfazer importação processada, reservados à Spec
  007;
- equivalência automática ou associação manual de nomes de postos;
- telas finais de Assistências / MMS;
- ocorrências sugeridas, criação de ocorrências, tarefas, rotinas,
  deslocamentos, custos extras, dashboard ou produtividade;
- integração automática ou agendada com MMS, aplicativo mobile ou BI avançado;
- novas classificações de frustrada, improdutiva ou devolução sem suporte nos
  dados MMS atuais.

### Functional Requirements

- **FR-001**: O sistema MUST disponibilizar uma entrada funcional de Importações
  MMS para os três perfis oficiais e uma ação de Nova Importação MMS.
- **FR-002**: Toda entrada na rota MUST reutilizar autenticação, restauração de
  sessão, autorização de rota e contexto operacional definidos na Spec 005.
- **FR-003**: Operador MUST poder iniciar importações para qualquer posto ativo
  cadastrado, independentemente de vínculo.
- **FR-004**: Supervisão MUST poder iniciar importações para qualquer posto
  ativo cadastrado, independentemente de vínculo.
- **FR-005**: Direção/Administração MUST poder iniciar importações para qualquer
  posto ativo, sem exigir vínculo individual.
- **FR-006**: Usuário sem perfil operacional ativo ou sem escopo obrigatório
  MUST NOT acessar dados ou ações de importação.
- **FR-007**: O sistema MUST aceitar somente arquivos CSV e XLSX cujo conteúdo
  corresponda ao formato MMS suportado.
- **FR-008**: O sistema MUST validar extensão, conteúdo legível, estrutura,
  cabeçalhos e presença das colunas obrigatórias antes de permitir confirmação.
- **FR-009**: O sistema MUST rejeitar arquivos vazios, corrompidos, protegidos,
  incompatíveis ou que não possam ser interpretados integralmente.
- **FR-010**: O arquivo original aceito para análise MUST ser preservado uma
  única vez e vinculado à tentativa/lote, ao usuário importador, aos postos
  resolvidos nas linhas e à data identificada.
- **FR-011**: Falha ao preservar ou vincular o arquivo MUST bloquear a
  confirmação e MUST NOT alterar o espelho.
- **FR-012**: O sistema MUST identificar o posto pelo valor da coluna Área de
  Trabalho e MUST NOT solicitar escolha manual para substituir esse valor.
- **FR-012A**: Quando um arquivo contiver múltiplas Áreas de Trabalho, o sistema
  MUST criar um único lote, resolver o `posto_id` de cada linha e preservar os
  números de linha de origem e o arquivo original.
- **FR-012B**: O banco MUST resolver cada área para um posto ativo durante o
  staging; área desconhecida ou inativa torna o lote inteiro inelegível.
- **FR-013**: A correspondência de Área de Trabalho MUST usar um posto existente
  e ativo; posto ausente, inativo, removido ou sem correspondência MUST bloquear
  a confirmação.
- **FR-014**: O sistema MUST NOT aplicar equivalência automática de nomes de
  postos nesta feature.
- **FR-015**: A permissão global de ingestão MUST NOT ampliar as RLS de
  assistências, partes, relatórios ou demais dados operacionais.
- **FR-016**: O sistema MUST identificar a data operacional pelos dados da
  planilha e exigir uma única data válida para o lote.
- **FR-017**: Data ausente, inválida ou múltiplas datas operacionais MUST ser
  tratadas como erro bloqueante.
- **FR-018**: O sistema MUST preservar cada linha aceita para staging em
  `mms_linhas_importacao` com ordem de origem e `raw_json` original, não vazio e
  imutável conforme a Spec 003.
- **FR-019**: `raw_json` MUST preservar nomes de colunas, valores, nulidade,
  grafia e representação recebida, sem substituição por valores corrigidos ou
  normalizados.
- **FR-020**: O sistema MUST extrair e persistir, quando presentes, os campos
  candidatos e complementares já definidos nas Specs 003 e 004, sem criar
  entidades duplicadas.
- **FR-021**: O sistema MUST normalizar `numero_assistencia` e
  `parte_conjunto` de forma consistente com as identidades vigentes, mantendo
  os valores originais em `raw_json`.
- **FR-022**: O sistema MUST normalizar Status da Atividade para os valores
  oficiais vigentes: pendente, iniciado, concluído, não concluído e cancelado.
- **FR-023**: Valor de Status da Atividade ausente ou não reconhecido MUST ser
  erro bloqueante.
- **FR-024**: O sistema MUST normalizar Tipo de Atividade conforme os
  mapeamentos vigentes: Montagem em Conjunto para Montagem, Desmontagem para
  Desmontagem, Assistência Técnica para Assistência, Inspeção Presencial para
  Inspeção e Retorno de Garantia para Retorno.
- **FR-025**: Valor de Tipo de Atividade ausente ou não reconhecido MUST ser
  erro bloqueante.
- **FR-026**: O sistema MUST NOT inferir frustrada, improdutiva ou devolução
  como classificações separadas quando os dados MMS não sustentarem essa
  distinção.
- **FR-027**: Cada problema bloqueante MUST ser registrado e exibido como erro;
  cada condição não bloqueante MUST ser registrada e exibida como alerta,
  mantendo vínculo com lote e linha quando aplicável.
- **FR-028**: Uma linha sem erro bloqueante e sem alerta MUST ser classificada
  como válida.
- **FR-029**: Uma linha sem erro bloqueante e com ao menos um alerta MUST ser
  classificada como válida com alerta.
- **FR-030**: Uma linha com ao menos um erro bloqueante MUST ser classificada
  como inválida.
- **FR-031**: A presença de qualquer linha inválida, erro bloqueante, linha
  pendente/ignorada ou total inconsistente MUST tornar o lote inelegível para
  atualizar o espelho.
- **FR-032**: Alertas não bloqueantes MAY resultar em lote
  `importado_com_alertas` somente quando todas as linhas forem transformáveis e
  os demais critérios de completude da Spec 004 forem atendidos.
- **FR-033**: O sistema MUST calcular totais de linhas, assistências principais,
  partes, linhas válidas, válidas com alerta, inválidas, erros e alertas.
- **FR-034**: Assistências principais MUST ser contadas pela identidade
  `posto_id + data_atividade + numero_assistencia`; partes MUST ser contadas
  pela chave operacional completa.
- **FR-035**: Antes da confirmação, o sistema MUST apresentar uma única prévia
  com arquivo, postos, data, todos os totais, erros, alertas e indicação de
  elegibilidade.
- **FR-036**: A prévia MUST distinguir valor original de valor normalizado
  sempre que a diferença for relevante para o entendimento do usuário.
- **FR-037**: A confirmação MUST permanecer indisponível enquanto a análise
  estiver em andamento ou quando a tentativa for inelegível.
- **FR-038**: O sistema MUST exigir confirmação explícita do usuário depois da
  prévia e MUST NOT interpretar seleção/upload como confirmação.
- **FR-039**: No momento da confirmação, o sistema MUST revalidar sessão,
  propriedade do lote, estado de todos os postos, objeto, integridade da
  tentativa e elegibilidade do lote.
- **FR-040**: A confirmação elegível MUST criar ou atualizar o lote e suas
  linhas segundo a Spec 003 e acionar o processamento definido na Spec 004.
- **FR-041**: Somente lote com `estado_processamento = validado`, status
  `importado` ou `importado_com_alertas`, postos por linha e data resolvidos, linhas ativas
  transformáveis, totais consistentes e nenhum erro bloqueante MUST poder
  atualizar o espelho.
- **FR-042**: Lote `erro`, `cancelado`, com status nulo, incompleto, parcial,
  vazio ou inelegível MUST NOT criar, atualizar, remover ou reativar registros
  do espelho.
- **FR-043**: O processamento MUST manter uma assistência principal por posto,
  data e número e uma parte por chave operacional completa.
- **FR-044**: Reprocessar os mesmos dados ou reenviar a mesma confirmação MUST
  produzir zero duplicidades de assistências e partes.
- **FR-045**: Nova importação elegível MUST criar chaves novas, atualizar chaves
  existentes e preservar chaves idênticas sem registrar atualização material
  fictícia.
- **FR-046**: Somente uma nova importação completa e elegível do mesmo posto/data
  MUST poder marcar partes ausentes como `removido`.
- **FR-047**: Quando todas as partes de uma assistência forem removidas, a
  assistência principal MUST refletir `removido`; quando uma parte ativa existir
  ou reaparecer, a assistência MUST refletir o estado ativo conforme a Spec 004.
- **FR-048**: Parte ou assistência `removido` que reaparecer em importação
  elegível MUST ser reativada, atualizada e vinculada ao lote/linha mais recente.
- **FR-049**: O usuário MUST poder cancelar a tentativa antes da confirmação sem
  alterar o espelho.
- **FR-050**: Tentativa já persistida e cancelada antes da confirmação MUST
  permanecer rastreável e MUST NOT ser apresentada como importação concluída.
- **FR-051**: O sistema MUST impedir efeitos duplicados decorrentes de clique
  repetido, reenvio de requisição ou resposta de rede incerta.
- **FR-052**: O sistema MUST tratar a atualização confirmada como uma unidade
  consistente: falha intermediária MUST NOT deixar estado parcial reconhecido
  como sucesso.
- **FR-053**: Falhas de armazenamento, persistência, validação, autorização ou
  atualização do espelho MUST produzir um estado final verdadeiro e acionável,
  sem auditoria falsa de sucesso.
- **FR-054**: Ao concluir, o sistema MUST apresentar totais de registros criados,
  atualizados, preservados, removidos, reativados, inválidos e com alerta.
- **FR-055**: O resultado MUST identificar lote, arquivo, posto, data, status
  final e se o espelho foi ou não atualizado.
- **FR-056**: Criação da tentativa/lote, início e conclusão da validação,
  confirmação, cancelamento, falha, atualização do espelho, marcação como
  removido e reativação MUST ser auditáveis conforme os contratos vigentes.
- **FR-057**: Auditoria MUST identificar o ator autenticado e, quando aplicável,
  lote, linha, posto, data, assistência, parte, valores anteriores e novos.
- **FR-058**: Operações bloqueadas ou malsucedidas MUST NOT gerar eventos de
  sucesso.
- **FR-059**: Toda mensagem, estado de carregamento, erro, alerta, confirmação e
  resultado voltado ao usuário MUST estar em português brasileiro.
- **FR-060**: A interface MUST seguir o design system Doka e funcionar
  prioritariamente em desktop/notebook, incluindo uso por teclado, foco visível
  e estados que não dependam somente de cor.
- **FR-061**: O fluxo MUST distinguir carregamento de arquivo, análise,
  prévia pronta, confirmação em andamento, sucesso, sucesso com alertas,
  cancelamento, sessão expirada, acesso negado e falha.
- **FR-062**: A feature MUST NOT oferecer correção manual de linhas,
  reprocessamento administrativo, desfazer lote concluído, listagem histórica
  completa ou detalhe administrativo do lote.

### Key Entities *(include if feature involves data)*

- **Usuário operacional (`usuarios`)**: entidade existente que identifica o ator
  autenticado, seu perfil oficial e estado operacional.
- **Posto (`postos`)**: entidade existente identificada pela Área de Trabalho e
  usada como escopo da importação e da autorização.
- **Vínculo usuário/posto (`usuarios_postos`)**: entidade existente que delimita
  o escopo de Operador e Supervisão; Direção/Administração mantém escopo global.
- **Lote de importação (`mms_lotes_importacao`)**: entidade existente da Spec
  003 que representa a tentativa, seu arquivo/origem, posto, data, importador,
  estado, status e totais.
- **Linha de importação (`mms_linhas_importacao`)**: entidade existente da Spec
  003 que preserva uma linha original em `raw_json`, os campos candidatos e seu
  estado de validação.
- **Erro de importação (`mms_erros_importacao`)**: entidade existente da Spec
  003 para problemas bloqueantes vinculados ao lote e, quando aplicável, à
  linha.
- **Alerta de importação (`mms_alertas_importacao`)**: entidade existente da Spec
  003 para condições não bloqueantes vinculadas ao lote e, quando aplicável, à
  linha.
- **Assistência MMS (`mms_assistencias`)**: entidade existente da Spec 004 que
  representa o serviço principal por posto, data e número de assistência.
- **Parte da assistência (`mms_partes_assistencia`)**: entidade existente da
  Spec 004 que representa a parte identificada pela chave operacional completa.
- **Histórico de auditoria (`historico_auditoria`)**: entidade central existente
  para registrar ações críticas sem criar histórico paralelo.
- **Arquivo original MMS**: evidência externa preservada e vinculada ao lote;
  não cria uma nova identidade operacional nem substitui `raw_json`.

### Dependencies

- Spec 001: usuários, perfis, postos, vínculos, funções de autorização, RLS e
  auditoria.
- Spec 003: lotes, linhas, erros, alertas, estados técnicos, status oficiais,
  campos candidatos, totais e preservação de `raw_json`.
- Spec 004: assistências, partes, elegibilidade, completude, idempotência,
  atualização, `removido`, reativação e auditoria do espelho.
- Spec 005: aplicação web, sessão, contexto operacional, proteção de rotas,
  navegação e estados comuns.
- Armazenamento seguro de arquivos previsto nos documentos fundacionais.
- Design system oficial Doka.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em testes com os três perfis e pelo menos três postos, 100% das
  tentativas fora do escopo são bloqueadas antes de alterar staging ou espelho.
- **SC-002**: 100% dos arquivos válidos de homologação em CSV e XLSX produzem
  prévia com posto, data e totais iguais ao conteúdo esperado.
- **SC-003**: 100% dos arquivos com extensão inválida, conteúdo ilegível,
  estrutura incompatível ou coluna obrigatória ausente são impedidos de
  confirmação.
- **SC-004**: Em 100% das linhas analisadas, os nomes e valores originais
  permanecem recuperáveis sem alteração em `raw_json`.
- **SC-005**: Em arquivos com múltiplas partes, 100% das partes são agrupadas sob
  uma única assistência principal por posto/data/número.
- **SC-006**: Reimportar três vezes o mesmo conjunto elegível gera zero
  assistências duplicadas e zero partes duplicadas.
- **SC-007**: Em reimportação com registros iguais, alterados, novos, ausentes e
  reaparecidos, 100% são respectivamente preservados, atualizados, criados,
  marcados `removido` e reativados conforme esperado.
- **SC-008**: 100% dos lotes com erro, cancelados, incompletos, parciais ou
  inelegíveis deixam o espelho inalterado e não marcam ausentes como
  `removido`.
- **SC-009**: 100% dos cancelamentos anteriores à confirmação deixam
  assistências e partes inalteradas.
- **SC-010**: Em testes de clique repetido, reenvio e resposta incerta, cada
  confirmação produz no máximo um efeito operacional.
- **SC-011**: 100% das falhas injetadas após confirmação terminam sem estado
  parcial apresentado como sucesso e sem evento falso de sucesso.
- **SC-012**: Para arquivos suportados com até 10.000 linhas, pelo menos 95% das
  prévias ficam disponíveis em até 30 segundos sob condições normais de uso.
- **SC-013**: Para arquivos suportados com até 10.000 linhas, pelo menos 95% das
  confirmações elegíveis apresentam resultado final em até 60 segundos sob
  condições normais de uso.
- **SC-014**: Em avaliação com representantes dos três perfis, pelo menos 90%
  conseguem selecionar um arquivo, interpretar a elegibilidade, confirmar ou
  cancelar e compreender o resultado sem orientação externa.
- **SC-015**: 100% dos resultados finais conciliam seus totais com as mudanças
  efetivamente persistidas e identificam lote, arquivo, posto, data e status.
- **SC-016**: 100% das telas e estados obrigatórios avaliados em 1440×900 e
  1280×720 permanecem utilizáveis por teclado, legíveis e em português
  brasileiro.

## Assumptions

- O formato suportado representa um único retrato MMS de uma data por arquivo.
  Arquivos com múltiplos postos permanecem em um único lote atômico; arquivos
  com múltiplas datas permanecem bloqueados.
- Linhas auxiliares do export sem Área de Trabalho, Tipo de Atividade e Status
  de Atividade não representam atividades, são informadas e ignoradas no
  staging; o arquivo original continua preservado.
- CSV e XLSX compatíveis contêm uma única tabela lógica MMS; escolha manual de
  aba, intervalo ou cabeçalho não faz parte desta feature.
- Os campos obrigatórios e candidatos continuam sendo os aprovados nas Specs
  003 e 004; esta feature não redefine suas identidades nem estados.
- Erro em campo obrigatório ou em qualquer condição necessária para provar
  completude bloqueia o lote inteiro para o espelho. Não existe importação
  parcial nesta feature.
- Campo complementar inválido pode produzir alerta somente quando não impede a
  transformação integral e a completude exigida pela Spec 004.
- Um lote pode ser criado ou atualizado durante a análise para preservar arquivo
  e evidências; confirmação é a autorização separada para atualizar o espelho.
- O arquivo original e as linhas de staging podem permanecer como evidência de
  tentativa cancelada ou com erro conforme retenção e acesso já aprovados.
- A prévia não oferece edição. O usuário deve cancelar e selecionar um arquivo
  corrigido; tratamento e reprocessamento administrativo pertencem à Spec 007.
- Os limites de desempenho serão medidos com arquivos representativos da
  operação e conexão estável; indisponibilidade externa é apresentada como
  falha acionável, nunca como sucesso.
- A validação automatizada desta feature usa Vitest/jsdom e testes SQL
  transacionais no projeto remoto aprovado do Supabase; não depende de Docker
  nem de uma instância local do Supabase.
- Navegação real, apresentação responsiva, teclado e acessibilidade no
  navegador são homologados manualmente pelo usuário, sem automação de
  navegador na Spec 006.
