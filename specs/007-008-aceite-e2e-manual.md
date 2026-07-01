# Roteiro unificado de aceite E2E manual — Specs 007 e 008

## Objetivo

Validar no navegador a navegabilidade, as permissões, os estados de interface,
a acessibilidade básica e os fluxos integrados de:

- Spec 007 — Gestão de Importações MMS;
- Spec 008 — Assistências MMS.

Este roteiro cobre somente o aceite manual pendente. Os testes automatizados e
SQL já registrados nos quickstarts não precisam ser repetidos para executar
estes passos.

## 1. Preparação

### 1.1 Ambiente

- [ ] Confirmar que o ambiente é de desenvolvimento ou aceite, nunca produção.
- [ ] Confirmar que `.env.local` contém somente:
  `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` e `VITE_APP_URL`.
- [ ] Instalar dependências com `npm install`.
- [ ] Iniciar a SPA com `npm run dev`.
- [ ] Abrir a URL informada pelo Vite, normalmente
  `http://localhost:5173`.
- [ ] Abrir o DevTools nas abas **Network**, **Console** e
  **Application/Storage**.
- [ ] Desabilitar extensões que alterem foco, teclado ou estilos da página.

### 1.2 Massa mínima

Confirmar antes do teste:

- [ ] um Operador com vínculo `consulta`;
- [ ] um Operador com vínculo `operacional`;
- [ ] uma Supervisão com vínculo `supervisao`;
- [ ] uma Direção/Administração;
- [ ] pelo menos um usuário sem perfil operacional ativo;
- [ ] Postos A e B;
- [ ] lotes simples e multi-posto;
- [ ] assistência `ASS-100`, de 24/06/2026, com várias partes;
- [ ] pelo menos uma assistência ou parte removida;
- [ ] correção ativa em `ASS-100`;
- [ ] lotes de origem acessível e inacessível conforme o perfil.

Quando os seeds locais forem usados, as credenciais disponíveis são:

| Perfil disponível no seed | E-mail | Senha |
| --- | --- | --- |
| Operador operacional | `operador@doka.test` | `doka123` |
| Supervisão | `supervisao@doka.test` | `doka123` |
| Direção/Administração | `direcao@doka.test` | `doka123` |
| Sem perfil | `sem-perfil@doka.test` | `doka123` |
| Usuário inativo | `inativo@doka.test` | `doka123` |

> O seed de fundação não cria um segundo Operador com vínculo `consulta`.
> Prepare esse usuário no ambiente de aceite ou altere temporariamente, e
> depois restaure, o vínculo do Operador de teste. Não use essa alteração em
> produção.

IDs determinísticos da Spec 007:

| Cenário | Lote |
| --- | --- |
| Predecessor do Posto A | `70000000-0000-4000-8000-000000000001` |
| Lote atual multi-posto com erro | `70000000-0000-4000-8000-000000000002` |
| Lote do Posto B para bloqueio/desfazer | `70000000-0000-4000-8000-000000000003` |

### 1.3 Registro do resultado

Para cada cenário, registrar:

```text
ID:
Data/hora:
Perfil:
Navegador e versão:
Resolução:
Resultado: PASSOU | FALHOU | BLOQUEADO
Resultado observado:
Evidência: nome do print/vídeo e, se houver falha, request da aba Network
Observação:
```

Uma falha visual deve ter print. Uma falha de carregamento ou gravação deve ter
também o status e a resposta segura da chamada RPC, sem copiar tokens.

## 2. Acesso comum e URLs protegidas

### E2E-01 — Sessão anônima

1. Primeiro, em sessão autorizada, localizar `ASS-100`, abrir seu detalhe e
   copiar a URL completa para obter um `assistenciaId` válido.
2. Sair da aplicação e limpar a sessão do site.
3. Abrir diretamente:
   `/app/importacoes-mms/70000000-0000-4000-8000-000000000002`.
4. Abrir diretamente a URL válida copiada de
   `/app/assistencias-mms/:assistenciaId`.

**Aprova se:** ambas redirecionam para autenticação ou estado de sessão
adequado, sem exibir nome, posto, linhas, partes ou qualquer dado do registro.

### E2E-02 — Usuário sem acesso operacional

1. Entrar com o usuário sem perfil ou inativo.
2. Tentar abrir pelo menu e por URL direta:
   `/app/importacoes-mms` e `/app/assistencias-mms`.

**Aprova se:** o acesso é bloqueado com mensagem compreensível e neutra; não
há breve exibição de dados protegidos antes do bloqueio.

### E2E-03 — Menu e rotas principais

Repetir com Operador operacional, Supervisão e Direção/Administração:

1. Abrir o menu principal.
2. Acessar **Importações MMS**.
3. Abrir **Nova importação**, voltar à central, abrir um lote e acessar
   **Tratamento** quando a ação estiver disponível.
4. Acessar **Assistências MMS**, abrir uma assistência e voltar à lista.
5. Usar os botões Voltar do navegador nos mesmos trajetos.

**Aprova se:** as rotas corretas abrem sem tela em branco, loop ou perda
indevida da sessão; ações incompatíveis com o perfil não aparecem.

## 3. Spec 007 — Gestão de Importações MMS

### E2E-07-01 — Lista, filtros e paginação

1. Entrar com Direção/Administração.
2. Abrir `/app/importacoes-mms`.
3. Confirmar o estado de carregamento inicial.
4. Aplicar isoladamente e depois combinar:
   Posto, Data operacional, Importado de/Até, Status, Com erro e Com alerta.
5. Usar **Carregar mais**, quando disponível.
6. Usar **Limpar**.
7. Aplicar uma combinação sem resultado.

**Aprova se:** filtros combinam corretamente, a ordem não muda nem duplica
lotes ao carregar mais, limpar restaura a lista e “sem resultado” não é
confundido com erro ou ausência de escopo.

### E2E-07-02 — Detalhe e coleções do lote

1. Abrir o lote
   `70000000-0000-4000-8000-000000000002`.
2. Conferir origem, status, totais e capacidades.
3. Percorrer as abas de linhas, erros, alertas, correções, operações e
   auditoria.
4. Usar paginação nas coleções quando disponível.
5. Testar o download do arquivo original com um perfil de cobertura integral.
6. Repetir o download com um perfil sem cobertura integral do lote multi-posto.

**Aprova se:** as coleções carregam sob demanda sem misturar dados; o download
é permitido somente com cobertura integral e uma negação não revela caminho
interno do arquivo.

### E2E-07-03 — Permissões por perfil

Repetir lista, detalhe e URL direta do lote do Posto A e de um lote fora do
escopo:

1. Operador `consulta`: tentar localizar ação de correção ou tratamento.
2. Operador `operacional`: corrigir somente uma linha do próprio posto e
   procurar ações de concluir/reprocessar/desfazer.
3. Supervisão: validar lotes do próprio escopo e um lote sem cobertura integral.
4. Direção/Administração: validar projeção global.

**Aprova se:**

- Operador `consulta` lê, mas não corrige;
- Operador `operacional` corrige somente o próprio posto e não conclui;
- Supervisão só conclui, reprocessa ou desfaz com cobertura integral;
- Direção/Administração enxerga o escopo global;
- URL direta fora do escopo retorna negação neutra.

### E2E-07-04 — Correção e conflito entre editores

1. Abrir o mesmo lote/erro em duas sessões independentes, por exemplo janela
   normal e anônima, usando usuários autorizados.
2. Manter o editor do mesmo campo aberto nas duas sessões.
3. Salvar um valor na sessão A.
4. Sem recarregar a sessão B, salvar outro valor nela.

**Aprova se:** A salva; B recebe conflito de versão, não sobrescreve A e mantém
o texto digitado para revisão.

### E2E-07-05 — Concluir e reprocessar

Executar somente em massa descartável.

1. Abrir um lote elegível como Supervisão ou Direção/Administração.
2. Se houver erro pendente, tentar concluir antes de corrigi-lo.
3. Corrigir os erros e concluir o tratamento.
4. Abrir **Reprocessar**.
5. Conferir descrição do impacto, cancelar e confirmar que o foco retorna ao
   botão de origem.
6. Abrir novamente, confirmar e dar duplo clique rápido no botão de
   confirmação.
7. Recarregar o lote e conferir resultado, contadores e operação.

**Aprova se:** erro pendente bloqueia conclusão; o diálogo exige confirmação;
duplo clique não cria operação duplicada; o estado final é recuperável ao
recarregar.

### E2E-07-06 — Resposta de rede incerta

Executar somente em massa descartável.

1. Abrir o diálogo de reprocessamento.
2. No DevTools, ativar **Offline** imediatamente depois de confirmar.
3. Voltar a **Online**.
4. Seguir a orientação apresentada e consultar/recarregar o lote.

**Aprova se:** a interface não declara sucesso falso, orienta a consultar o
lote e recupera a operação existente sem criar outra.

### E2E-07-07 — Analisar e desfazer

Executar por último e somente em massa descartável.

1. Abrir um lote inelegível e clicar **Analisar desfazer**.
2. Confirmar que os motivos de bloqueio são exibidos em texto.
3. Abrir um lote elegível e analisar.
4. Tentar confirmar sem justificativa e com menos de 10 caracteres.
5. Informar justificativa válida.
6. Para o caso de análise desatualizada, alterar o estado usando outra sessão
   autorizada depois da análise e antes da confirmação.
7. Analisar novamente e confirmar o desfazer.
8. Reabrir lote, abas e histórico.

**Aprova se:** bloqueios impedem a ação; justificativa é obrigatória; análise
antiga é rejeitada; o predecessor correto é restaurado por posto/data; o lote
fica Cancelado sem excluir arquivo, staging, correções ou auditoria.

## 4. Spec 008 — Assistências MMS

### E2E-08-01 — Lista, busca, filtros e retorno

1. Entrar como Direção/Administração e abrir `/app/assistencias-mms`.
2. Buscar `ASS-100` e depois a forma parcial `100`.
3. Combinar número, cliente, Posto A, período contendo 24/06/2026, status,
   tipo e situação interna.
4. Confirmar os parâmetros na URL.
5. Usar **Carregar mais** com a massa de desempenho, quando disponível.
6. Abrir `ASS-100` e usar **Voltar para assistências**.
7. Usar **Limpar** e depois aplicar um filtro sem resultado.

**Aprova se:** busca completa/parcial respeita os demais filtros; paginação não
duplica registros; voltar restaura filtros; vazio filtrado oferece limpar e é
diferente de falha.

### E2E-08-02 — Removidos

1. Na lista inicial, confirmar que a situação padrão é **Ativas**.
2. Buscar um registro removido conhecido: ele não deve aparecer.
3. Selecionar **Removidas** e depois **Ativas e removidas**.
4. Abrir `ASS-100`.
5. Confirmar o contador de partes removidas.
6. Usar **Incluir removidas** e depois **Ocultar removidas**.

**Aprova se:** removidos ficam ocultos inicialmente, aparecem somente por ação
explícita e são identificados por texto, não apenas por cor.

### E2E-08-03 — Detalhe em dois níveis e valores

1. Abrir `ASS-100`, de 24/06/2026.
2. Conferir número, Posto A, data, tipo, status e situação.
3. Confirmar que todas as partes aparecem sob uma única assistência.
4. Conferir a identificação de cada `parte_conjunto`.
5. Em Cliente/Endereço e nos campos de parte, identificar:
   valor importado, correção ativa quando houver e valor vigente.
6. Confirmar que “Cliente A corrigido no Doka” é vigente quando o seed da
   Spec 008 tiver sido aplicado.

**Aprova se:** nenhuma parte é mostrada como assistência separada e a origem do
valor vigente é compreensível sem depender de cor.

### E2E-08-04 — Corrigir os quatro campos permitidos

Executar com Operador operacional no próprio posto ou Direção/Administração:

1. Corrigir **Cliente** no nível da assistência.
2. Corrigir **Endereço** no nível da assistência.
3. Corrigir **Descrição da mercadoria** em uma parte.
4. Corrigir **Recurso/montador** na mesma ou em outra parte.
5. Em cada diálogo, tentar confirmar uma vez sem valor e uma vez sem
   justificativa.
6. Salvar com valor e justificativa válidos.
7. Reabrir o detalhe depois de cada gravação.

**Aprova se:** validações impedem envio incompleto; os quatro campos só aparecem
no nível correto; o vigente é atualizado e o importado continua visível.

### E2E-08-05 — Campo proibido, vínculo consulta e posto alheio

1. No detalhe, procurar ações de edição em número, posto, data, tipo e status.
2. Entrar como Operador `consulta` e abrir uma assistência autorizada.
3. Abrir por URL direta uma assistência de posto alheio.
4. Repetir a URL com Direção/Administração para confirmar que o ID é válido.

**Aprova se:** campos fora da allowlist não possuem ação; Operador `consulta`
não possui botões de corrigir; posto alheio retorna resposta neutra sem
confirmar existência; Direção/Administração acessa o registro válido.

### E2E-08-06 — Conflito sem perda do rascunho

1. Abrir o mesmo campo de `ASS-100` em duas sessões autorizadas.
2. Digitar valores diferentes e justificativas em A e B.
3. Salvar A.
4. Sem recarregar, salvar B.

**Aprova se:** B recebe aviso de alteração concorrente, não sobrescreve A e
mantém valor e justificativa digitados até o usuário fechar/revisar.

### E2E-08-07 — Histórico e integração com a Spec 007

1. Abrir **Histórico e origem** de `ASS-100`.
2. Conferir eventos de importação, correção, remoção e reativação disponíveis.
3. Confirmar ordem decrescente, data/hora, entidade, parte, campo, valores,
   ator/origem e justificativa.
4. Usar **Carregar mais eventos**, quando disponível.
5. Clicar **Abrir lote de origem** em um evento autorizado.
6. Confirmar abertura do detalhe da Spec 007 e voltar à assistência.
7. Repetir com perfil sem acesso integral ao lote.

**Aprova se:** o lote autorizado abre pela rota da Spec 007; o lote não
autorizado é indicado como indisponível ou resulta em negação neutra; o link
não amplia acesso a linhas, arquivo ou postos.

### E2E-08-08 — Falha temporária e sessão expirada

1. Com a lista já carregada, ativar **Offline** no DevTools.
2. Aplicar um filtro e usar **Tentar novamente**.
3. Voltar a **Online** e tentar novamente.
4. Abrir um detalhe e remover/expirar a sessão em outra aba ou sair da
   aplicação.
5. Tentar carregar histórico e salvar uma correção na aba antiga.

**Aprova se:** falha de rede não aparece como lista vazia nem sucesso; há ação
de nova tentativa; sessão expirada não mantém carregamento protegido nem
apresenta correção salva.

## 5. Teclado, foco e nomes acessíveis

Executar nas duas specs sem usar o mouse:

1. Pressionar `Tab` desde o início da página.
2. Percorrer menu, filtros, tabela, links, botões e paginação.
3. Ativar controles com `Enter` ou `Espaço`.
4. Confirmar que cada campo possui rótulo anunciado/visível.
5. Abrir cada diálogo disponível.
6. Confirmar foco inicial dentro do diálogo.
7. Usar `Tab` e `Shift+Tab` até dar a volta completa sem escapar do diálogo.
8. Fechar com `Esc` quando suportado e pelo botão Cancelar/Fechar.
9. Confirmar retorno do foco ao controle que abriu o diálogo.
10. Provocar uma validação e confirmar que a mensagem é anunciada e associada
    ao contexto.

**Aprova se:** ordem é lógica, foco é sempre visível, nenhum controle fica
inalcançável, os diálogos retêm/devolvem foco e nomes/estados são
compreensíveis. Status, alerta, erro, removido e cancelado devem possuir texto
ou ícone com texto, nunca somente cor.

## 6. Layout desktop

Repetir as páginas de lista, detalhe, tratamento e um diálogo em:

- [ ] 1280 × 720;
- [ ] 1440 × 900.

Em cada resolução:

1. Usar zoom do navegador em 100%.
2. Conferir cabeçalho, menu, filtros, tabelas, cartões e ações.
3. Abrir a tabela mais larga.
4. Abrir um diálogo e rolar seu conteúdo, se necessário.

**Aprova se:** não há corte ou sobreposição de texto/ações; a página não cria
rolagem horizontal global; tabelas largas rolam dentro do próprio contêiner;
ações continuam visíveis e utilizáveis.

## 7. Encerramento

- [ ] Salvar prints, vídeos e dados dos cenários.
- [ ] Restaurar vínculo alterado temporariamente para `consulta`.
- [ ] Restaurar throttling/offline do DevTools.
- [ ] Reaplicar a massa descartável se reprocessamento ou desfazer mudou o
  estado necessário para outro teste.
- [ ] Não marcar as tarefas das specs como concluídas enquanto houver cenário
  `FALHOU` ou `BLOQUEADO`.
- [ ] Registrar os resultados da Spec 007 em
  `specs/007-gestao-importacoes-mms/quickstart.md`.
- [ ] Registrar os resultados da Spec 008 em
  `specs/008-assistencias-mms-interface/quickstart.md`.
- [ ] Depois do aceite, marcar T073, T074 e T080 da Spec 008; T077 é o lint
  remoto e não faz parte deste roteiro de navegabilidade.

## Resultado final

```text
Spec 007: APROVADA | REPROVADA | BLOQUEADA
Spec 008: APROVADA | REPROVADA | BLOQUEADA
Total de cenários PASSOU:
Total de cenários FALHOU:
Total de cenários BLOQUEADO:
Pendências:
Responsável pelo aceite:
Data:
```
