<!--
Sync Impact Report
Version change: template -> 1.0.0
Modified principles:
- [PRINCIPLE_1_NAME] -> I. MMS como Fonte Operacional Externa
- [PRINCIPLE_2_NAME] -> II. MVP Operacional e Escopo Controlado
- [PRINCIPLE_3_NAME] -> III. Supabase, RLS e Permissoes por Perfil/Posto
- [PRINCIPLE_4_NAME] -> IV. Modelagem Auditavel em Portugues
- [PRINCIPLE_5_NAME] -> V. Importacao MMS Rastreavel e Idempotente
Added sections:
- Padroes de Produto e Interface
- Processo de Desenvolvimento
Removed sections:
- Nenhuma
Templates requiring updates:
- ✅ updated .specify/templates/plan-template.md
- ✅ updated .specify/templates/spec-template.md
- ✅ updated .specify/templates/tasks-template.md
- ⚠ pending .specify/templates/commands/*.md (diretorio inexistente neste projeto)
Follow-up TODOs:
- Nenhum
-->
# Doka Constitution

## Core Principles

### I. MMS como Fonte Operacional Externa
O Doka MUST funcionar como plataforma interna auxiliar de controle operacional e
gerencial; ele MUST NOT substituir a MMS. A MMS permanece a fonte oficial para
produtividade, eficiencia, assistencias, postos, atividades importadas e confronto
planejado x executado. O Doka MUST refletir esses dados por importacao de planilhas
MMS e MUST preservar a capacidade de auditar o dado original.

Rationale: o MVP existe para centralizar controles internos sem mudar a fonte
operacional externa ja definida nos documentos de produto.

### II. MVP Operacional e Escopo Controlado
O MVP MUST ser alimentado por importacao MMS e cadastro manual. Cadastro manual
MUST ser a fonte oficial para ocorrencias, pendencias, reclamacoes, tarefas,
rotinas, estrategias, observacoes internas e cadastros base. Funcionalidades fora
do MVP, como integracao automatica profunda com MMS, WhatsApp/e-mail automatico,
app mobile completo, portal de montadores, BI avancado, comissao, repasse, nota
fiscal, anexos gerais e equivalencia automatica de postos, MUST NOT ser
implementadas sem aprovacao explicita.

Rationale: o escopo fechado reduz risco e mantem o primeiro ciclo focado em uso
operacional real.

### III. Supabase, RLS e Permissoes por Perfil/Posto
O projeto MUST usar Supabase, PostgreSQL, Supabase Auth e Row Level Security.
Autenticacao MUST usar `auth.users`; permissoes operacionais MUST considerar perfil
e posto. Os perfis do MVP sao Operador, Supervisao e Direcao/Administracao.
Operador MUST acessar apenas dados dos postos vinculados e MUST poder visualizar e
editar assistencias dos postos do seu escopo. Supervisao MUST acessar somente seu
escopo operacional. Direcao/Administracao MUST ter visao global e permissoes
administrativas conforme os documentos do MVP.

Rationale: o filtro por posto e perfil e a barreira central de seguranca e de
operacao do Doka.

### IV. Modelagem Auditavel em Portugues
Tabelas e campos MUST usar portugues em `snake_case`, com chaves primarias `id`,
chaves estrangeiras com sufixo `_id` e campos de controle coerentes. Registros
operacionais MUST usar soft delete quando excluidos logicamente, com `deleted_at`,
`deleted_by` e `delete_reason` quando aplicavel. Soft delete MUST NOT ser
substituido por status operacional como Cancelado, Arquivado ou Inativo. Acoes
criticas MUST registrar historico centralizado em `historico_auditoria`.

Rationale: a nomenclatura local reduz ambiguidade para a equipe, enquanto soft
delete e historico centralizado preservam rastreabilidade.

### V. Importacao MMS Rastreavel e Idempotente
Importacoes MMS MUST preservar `raw_json` dos dados originais. A chave operacional
MMS MUST ser `posto_id + data_atividade + numero_assistencia + parte_conjunto`.
Nova importacao do mesmo posto/data MUST atualizar registros existentes, criar
novos registros quando necessario e marcar como `removido` registros antes
existentes que nao aparecerem na nova importacao. O sistema MUST manter lotes,
linhas, erros, alertas e historico suficientes para rastrear criacao, atualizacao,
correcao, cancelamento e marcacao como removido.

Rationale: a operacao pode importar o mesmo posto/data varias vezes no dia; o Doka
precisa refletir o espelho atual da MMS sem duplicar assistencias nem perder
evidencias.

## Padroes de Produto e Interface

Ocorrencias no MVP MUST estar vinculadas a uma assistencia; ocorrencia sem
assistencia MUST NOT ser permitida. Reclamacao e tratada como tipo de ocorrencia e
MUST exigir numero de assistencia. Custos extras MUST ser manuais, MUST estar
vinculados a assistencia e MUST usar apenas os status Pendente e Validado no MVP.
Deslocamentos importados da MMS MUST ficar separados de custos extras manuais.

O frontend MUST seguir o design system Doka em `design-system/readme.md`, incluindo
Poppins, paleta oficial, componentes e linguagem em portugues brasileiro quando
aplicavel. O primeiro ciclo do frontend MUST ser desktop-first; responsividade
mobile refinada e app mobile completo ficam fora do MVP salvo aprovacao explicita.

## Processo de Desenvolvimento

Novas especificacoes, planos, tarefas, migrations, telas e servicos MUST declarar
como preservam os principios desta constituicao. Toda mudanca de escopo MUST indicar
se altera decisao fechada do MVP; quando houver conflito entre documentos fonte,
a implementacao MUST sinalizar o conflito e parar para decisao humana em vez de
escolher uma regra nova.

Planos tecnicos MUST priorizar Supabase/Auth/RLS, usuarios, postos, vinculos,
historico, importacao MMS, assistencias, ocorrencias, tarefas, custos e dashboard
na ordem recomendada pelos documentos do MVP, salvo justificativa registrada.
Testes e validacoes MUST cobrir, quando a feature tocar o dominio: RLS por perfil e
posto, soft delete, `historico_auditoria`, preservacao de `raw_json`, chave
operacional MMS, marcacao como `removido`, assistencia obrigatoria em ocorrencias e
custos extras, e comportamento desktop das telas.

## Governance

Esta constituicao tem precedencia sobre decisoes ad hoc de implementacao. Alteracoes
em principios, escopo permanente, stack, permissao, importacao MMS, auditoria ou
design system MUST ser propostas com referencia aos documentos fonte afetados e
aprovadas antes da implementacao.

Versionamento segue SemVer:
- MAJOR para remover ou redefinir principios de forma incompativel.
- MINOR para adicionar principio, secao ou regra permanente material.
- PATCH para esclarecimentos sem mudanca semantica.

Toda feature MUST passar pelo Constitution Check no plano antes de pesquisa/design e
novamente antes de gerar tarefas. Revisoes de PR ou entregas tecnicas MUST verificar
aderencia a esta constituicao sempre que houver impacto em banco, permissao, MMS,
historico, soft delete, ocorrencias, custos ou frontend.

**Version**: 1.0.0 | **Ratified**: 2026-06-17 | **Last Amended**: 2026-06-17
