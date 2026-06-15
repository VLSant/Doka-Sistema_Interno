# Documento 01 — PRD do MVP v1.0

## Projeto

Doka — Plataforma interna de controle operacional e gerencial.

## Objetivo

Criar um MVP para centralizar informações operacionais que hoje ficam dispersas entre MMS, planilhas e controles manuais.

O Doka deverá ajudar a equipe a acompanhar assistências, ocorrências, pendências, reclamações, tarefas, rotinas, produtividade, eficiência, deslocamentos e custos extras.

## Problema

A operação possui informações importantes espalhadas em diferentes fontes. Isso dificulta:

- acompanhar pendências;
- saber o que está atrasado;
- identificar problemas recorrentes;
- controlar reclamações;
- medir produtividade;
- acompanhar custos extras;
- saber quais assistências precisam de ação;
- gerar visão clara para supervisão e direção.

## Escopo do MVP

O MVP será construído com foco em operação interna, sem substituir a MMS.

A MMS continuará sendo fonte oficial das assistências e produtividade importada.

O Doka irá receber planilhas da MMS e permitir controle operacional interno em cima desses dados.

## Módulos do MVP

1. Cadastros Gerais
2. Produtividade, Eficiência e Confronto MMS
3. Deslocamentos e Custos Extras
4. Central de Ocorrências, Pendências e Reclamações
5. Central de Rotinas, Tarefas e Estratégias
6. Dashboard / Visão Geral

## Perfis de usuário

### Operador

Responsável pelo acompanhamento operacional dos postos vinculados.

Pode:

- visualizar dados dos seus postos;
- iniciar importação MMS dos seus postos;
- visualizar assistências;
- criar e acompanhar ocorrências;
- lançar custos extras;
- acompanhar tarefas e rotinas.

### Supervisão

Responsável por acompanhar equipes, validar tarefas, custos e corrigir dados operacionais.

Pode:

- acompanhar postos/equipes;
- alterar ocorrências;
- validar tarefas;
- validar custos extras;
- corrigir dados importados;
- criar cadastros base.

### Direção/Administração

Acesso global ao sistema.

Pode:

- visualizar todos os postos;
- acessar visão gerencial;
- consultar histórico completo;
- configurar permissões;
- acompanhar indicadores globais.

## Decisões principais

- Reclamações serão tratadas como tipo de ocorrência.
- Toda ocorrência do MVP precisa estar vinculada a uma assistência.
- O Doka usará soft delete, não exclusão definitiva.
- Alertas do MVP serão apenas visuais no sistema.
- WhatsApp/e-mail ficam para fase futura.
- Interface inicial será desktop/notebook.
- Operador pode visualizar dados do cliente final dentro do seu escopo.

## Fora do MVP

- Integração automática profunda com MMS.
- Portal/app de montadores.
- WhatsApp/e-mail automático.
- BI avançado.
- Comissão, repasse e nota fiscal.
- Gamificação.
- Equivalência automática de nomes de postos.
- Anexos gerais por ocorrência/tarefa.

## Resultado esperado

Ao final do MVP, o Doka deverá permitir que a operação acompanhe o dia a dia com mais clareza, reduzindo falhas de acompanhamento, duplicidade de controles e perda de informações críticas.
