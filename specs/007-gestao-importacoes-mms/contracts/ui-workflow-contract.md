# Contract: UI da Central de Importações MMS

## Rotas

| Rota | Objetivo | Perfis |
| --- | --- | --- |
| `/app/importacoes-mms` | Listagem da central | Todos |
| `/app/importacoes-mms/nova` | Fluxo da Spec 006 | Todos conforme Spec 006 |
| `/app/importacoes-mms/:loteId` | Detalhe auditável | Todos no escopo |
| `/app/importacoes-mms/:loteId/tratamento` | Correções | Leitura para autorizados; escrita conforme vínculo/perfil |

Todas passam por `ProtectedRoute`; dados ainda dependem de autorização no banco.

## Central de lotes

### Regiões

- título e ação Nova importação;
- filtros combináveis;
- resumo do resultado;
- tabela desktop-first;
- paginação por cursor;
- estados de carregamento, vazio, sem resultado, falha e acesso negado.

### Colunas

- importado em;
- data operacional;
- postos autorizados;
- importador quando permitido;
- arquivo quando permitido;
- status e estado de processamento;
- linhas/assistências/partes;
- erros/alertas;
- ação Abrir.

Status, erro e alerta usam texto/ícone além de cor.

## Detalhe do lote

### Regiões

- cabeçalho e status;
- origem/arquivo;
- postos e importador;
- totais e resultado;
- abas Linhas, Erros, Alertas, Correções, Operações e Auditoria;
- ações contextuais;
- resumo de falha seguro.

Coleções carregam sob demanda e são paginadas.

### Capacidades

A UI renderiza ações conforme `capacidades` do backend, mas não trata essa
resposta como autorização definitiva. A RPC revalida ao executar.

## Tratamento

### Linha/erro

Mostrar:

- número da linha;
- campo/código/mensagem;
- severidade;
- valor original;
- valor normalizado;
- correção vigente;
- histórico de correções;
- autor/data;
- versão atual.

### Salvar

- envia campo, valor e versão esperada;
- bloqueia somente o formulário em envio;
- em `correcao_desatualizada`, recarrega o item e preserva o valor digitado para
  comparação, sem reenviar automaticamente;
- correção inválida mostra mensagem e mantém erro pendente;
- sucesso atualiza contadores e versão.

Operador operacional pode salvar; Operador consulta não. Somente
Supervisão/Direção veem Concluir tratamento e Reprocessar.

## Conclusão e reprocessamento

1. Concluir tratamento executa revalidação integral.
2. Se bloqueado, mostra todos os erros pendentes autorizados.
3. Se elegível, abre resumo de impacto.
4. Confirmação gera uma chave idempotente.
5. A chave é mantida até obter resultado definitivo.
6. Falha de comunicação consulta a operação pela mesma chave.
7. Sucesso mostra contadores conciliados.

## Desfazer

1. Ação inicia análise, nunca execução direta.
2. Bloqueios são listados com linguagem operacional.
3. Elegibilidade mostra impacto e aviso de irreversibilidade operacional.
4. Justificativa é obrigatória.
5. Confirmação explícita usa ação visual destrutiva e chave idempotente.
6. `analise_desatualizada` fecha a confirmação e exige nova análise.
7. Sucesso mostra lote Cancelado e resultado restaurado.

## Estados obrigatórios

- carregando;
- lista vazia;
- filtros sem resultado;
- lote em análise;
- aguardando correção;
- corrigido por outro usuário;
- correção desatualizada;
- reprocessamento em andamento/concluído/falho;
- elegível/bloqueado para desfazer;
- lote cancelado;
- sessão expirada;
- acesso negado;
- falha temporária;
- resposta incerta.

## Acessibilidade

- foco vai para título/erro do novo estado;
- diálogos retêm e devolvem foco;
- tabela possui cabeçalhos e nome acessível;
- filtros possuem rótulos;
- erro/alerta/status não dependem apenas de cor;
- ações destrutivas exigem confirmação textual clara;
- controles reutilizam componentes do design system.

## Testes frontend

- filtros, paginação e estados vazios;
- URL direta autorizada/negada;
- visibilidade parcial multi-posto;
- capacidades por perfil/vínculo;
- conflito de correção;
- conclusão bloqueada/elegível;
- idempotência após clique repetido;
- resposta incerta e retomada;
- análise desatualizada;
- acessibilidade automatizada e teclado;
- layout desktop nas larguras de aceite.
