# Documento 04 — Especificação Final da Importação MMS v1.0

## Objetivo

Definir como o Doka irá importar, tratar, armazenar e atualizar dados vindos da MMS.

## Contexto

A operação irá importar vários arquivos dos postos durante o dia, como um espelho do que está acontecendo na MMS.

A importação não será um processo único diário. Ela poderá acontecer várias vezes no mesmo posto e na mesma data.

## Princípios

- Não haverá file_hash no MVP.
- Cada importação gera um lote.
- O arquivo importado será salvo no storage.
- O lote deve guardar arquivo, posto, data, usuário, status e totais.
- Todas as linhas devem preservar raw_json.
- O Doka deve criar, atualizar ou marcar registros como Removido conforme nova importação.

## Permissões

Operador pode:

- iniciar importação dos seus postos;
- visualizar importações dos seus postos;
- visualizar erros e alertas dos seus postos.

Supervisão pode:

- importar;
- corrigir erros;
- visualizar escopo sob responsabilidade.

Direção/Administração pode:

- visualizar e tratar tudo.

## Status da importação

- Importado
- Importado com alertas
- Erro
- Cancelado

## Campos obrigatórios

Campos obrigatórios confirmados:

- Data;
- Área de Trabalho;
- Número da Assistência;
- Parte do Conjunto, quando existir no arquivo;
- Tipo de Atividade;
- Status da Atividade.

## Regra de importação parcial

- Se erro estiver em campo obrigatório, a linha deve ir para tratamento.
- Se erro estiver em campo não obrigatório, a importação é permitida.
- Registro com erro não obrigatório deve ficar marcado para correção posterior.

## Identificação do posto

- A coluna Área de Trabalho identifica o posto.
- Equivalência automática de nomes de postos fica para fase futura.
- No MVP, o valor deve corresponder a um posto cadastrado ou gerar alerta/tratamento.

## Identificação da assistência

- Número da Assistência identifica o serviço principal.
- Parte do Conjunto identifica partes internas.
- Mesmo número com partes diferentes deve gerar uma assistência principal com múltiplas partes.

## Chave operacional

A chave de controle será:

- Posto;
- Data;
- Número da Assistência;
- Parte do Conjunto.

## Status da Atividade

Mapeamento confirmado:

- pendente = Serviço ainda não iniciado;
- iniciado = Serviço em execução;
- concluído = Serviço finalizado corretamente;
- não concluído = Serviço não realizado;
- cancelado = Serviço removido internamente pela empresa.

No MVP, frustrada, improdutiva e devolução não serão capturadas como motivos separados. Esses motivos ficam para versão futura.

## Tipo de Atividade

Mapeamento confirmado:

- Montagem em Conjunto = Montagem;
- Desmontagem = Desmontagem;
- Assistência Técnica = Assistência;
- Inspeção Presencial = Inspeção;
- Retorno de Garantia = Retorno.

O sistema deve salvar o valor original e o valor normalizado.

## Reimportação

Quando nova importação do mesmo posto/data ocorrer:

- registros novos devem ser criados;
- registros existentes devem ser atualizados;
- alterações devem gerar histórico;
- registros que sumirem da nova importação devem mudar para status interno Removido;
- registros removidos não devem ser apagados;
- se registro voltar, poderá ser reativado/atualizado.

## Tratamento de erros

A tela de tratamento deve exibir:

- lote;
- número da linha;
- campo com erro;
- valor original;
- mensagem de erro;
- campo para valor corrigido;
- status da correção.

## Alertas

Alertas sugeridos:

- campo não obrigatório pendente;
- atendimento crítico;
- quantidade de reagendamento maior que zero;
- defeito identificado;
- laudo ou observação preenchido;
- posto não reconhecido;
- registro marcado como Removido.

## Deslocamentos

Deslocamentos vindos da MMS devem ser salvos em tabela separada chamada `deslocamentos`.

## Tabelas sugeridas

- mms_lotes_importacao;
- mms_linhas_importacao;
- mms_assistencias;
- mms_partes_assistencia;
- mms_erros_importacao;
- mms_alertas_importacao;
- mms_mapeamento_status;
- mms_mapeamento_tipo_atividade;
- deslocamentos.

## Resultado esperado

A importação MMS deve permitir que o Doka acompanhe a operação ao longo do dia, criando uma visão interna confiável e rastreável do que está acontecendo nos postos.
