# Documento 02 — Regras de Negócio do MVP v1.0

## Objetivo

Definir as regras operacionais que devem orientar o comportamento do Doka no MVP.

## Princípios gerais

- O sistema é interno.
- A MMS continua sendo a fonte oficial das assistências.
- O Doka importa dados da MMS, mas não substitui a MMS.
- Cadastros manuais serão usados para ocorrências, tarefas, rotinas, custos e controles internos.
- Registros críticos devem manter histórico.
- Exclusão definitiva não será usada no MVP.

## Perfis

### Operador

- Visualiza apenas os postos vinculados.
- Pode criar ocorrências dos seus postos.
- Pode acompanhar ocorrências dos seus postos.
- Pode iniciar importação MMS dos seus postos.
- Pode lançar custos extras.
- Pode concluir tarefas simples.

### Supervisão

- Pode alterar ocorrências.
- Pode alterar responsáveis.
- Pode corrigir dados importados.
- Pode validar tarefas.
- Pode validar custos extras.
- Pode executar soft delete.
- Pode criar cadastros base.

### Direção/Administração

- Acesso total.
- Pode ver todos os postos.
- Pode auditar histórico.
- Pode configurar usuários, permissões e regras globais.

## Soft delete

Registros não devem ser apagados definitivamente.

Campos padrão:

- deleted_at;
- deleted_by;
- delete_reason.

Regras:

- registros excluídos logicamente não aparecem nas listas padrão;
- exclusão lógica deve gerar histórico;
- status Cancelado, Arquivado ou Inativo não substituem soft delete.

## Ocorrências

Toda ocorrência do MVP precisa estar vinculada a uma assistência.

Uma assistência pode ter várias ocorrências.

Uma ocorrência não pode envolver mais de uma assistência.

Reclamação será um tipo de ocorrência.

### Status oficiais

- Aberta
- Em acompanhamento
- Aguardando retorno
- Resolvida
- Encerrada
- Reaberta

### Regras

- Resolvida significa problema tratado, aguardando conferência.
- Encerrada significa finalizado definitivamente.
- Atrasada é condição calculada pela data de retorno, não status.
- Ocorrências devem aparecer em abas: Hoje, Abertas e Atrasadas.

## Tipos iniciais de ocorrência

- baixa indevida;
- retorno futuro;
- pendência MMS;
- reclamação;
- adiantamento a baixar;
- posição interna;
- falta de montador;
- erro operacional;
- montador abandonou montagem;
- cliente ausente;
- improdutiva;
- devolução;
- outro.

## Tarefas

### Status oficiais

- Pendente
- Em andamento
- Concluída
- Validada
- Reaberta

### Regras

- Atrasada é condição calculada.
- Tarefa simples pode ser concluída sem validação.
- Tarefa que exige validação fica Concluída até ser validada.
- Supervisão e Direção/Administração validam tarefas.

## Rotinas

- Rotinas geram tarefas conforme recorrência.
- Recorrências iniciais: diária, semanal, mensal e personalizada.
- Rotina pode ter múltiplos responsáveis.
- Rotina não feita acumula e mantém a mesma tarefa em aberto.
- Não deve gerar nova tarefa duplicada quando acumular.

## Importação MMS

- Importação será por posto e por dia.
- Operador pode iniciar importação.
- Área de Trabalho identifica o posto.
- Data identifica a operação.
- Número da Assistência identifica o serviço principal.
- Parte do Conjunto identifica partes internas do serviço.
- Mesmo número de assistência com partes diferentes gera uma assistência principal com múltiplas partes.

## Status de importação

- Importado
- Importado com alertas
- Erro
- Cancelado

## Custos extras

- Todo custo extra precisa de assistência.
- Todos os perfis podem lançar custo extra.
- Supervisão e Direção/Administração podem validar.
- Status de validação: Pendente e Validado.

## Deslocamentos

- Deslocamentos importados da MMS ficam em tabela separada.
- No MVP entram para consulta operacional.
- Futuramente poderão receber mais campos específicos.

## Histórico

O histórico deve registrar:

- data/hora;
- usuário;
- entidade;
- ação;
- valor anterior;
- valor novo;
- contexto/motivo.

## Fora do MVP

- WhatsApp/e-mail automático.
- Portal/app de montadores.
- BI avançado.
- Financeiro avançado.
- Integração automática profunda com MMS.
