# Audit Contract: Assistencias MMS

## Audit Target

Todas as acoes criticas devem registrar eventos em `historico_auditoria`,
reaproveitando o contrato da Spec 01.

## Required Events

### mms_assistencias

- `criado`
- `atualizado_por_importacao`
- `corrigido`
- `marcado_removido`
- `reativado_por_importacao`
- `soft_delete_registrado`

### mms_partes_assistencia

- `criado`
- `atualizado_por_importacao`
- `corrigido`
- `marcado_removido`
- `reativado_por_importacao`
- `soft_delete_registrado`

## Required Audit Context

Eventos devem registrar, quando aplicavel:

- entidade;
- identificador da entidade;
- acao;
- usuario/ator;
- posto;
- `data_atividade`;
- `numero_assistencia`;
- `parte_conjunto` para partes;
- lote de importacao;
- linha de importacao;
- valores anteriores;
- valores novos;
- motivo/contexto de correcao;
- motivo/contexto de soft delete excepcional.

## Non-Success Operations

Operacoes bloqueadas por RLS, validacao, lote inelegivel, linha inelegivel ou
duplicidade nao devem criar eventos de sucesso. Elas podem ser auditadas como
tentativa bloqueada somente se o padrao global do projeto exigir esse tipo de
evento separado.

Lotes cancelados pertencem ao fluxo de importacao da Spec 03 e nao devem gerar
evento de cancelamento no espelho, porque nao alteram `mms_assistencias` nem
`mms_partes_assistencia` nesta feature.

## Required SQL Tests

- Criacao de assistencia e parte gera auditoria.
- Atualizacao por importacao com mudanca rastreada gera auditoria.
- Reprocessamento identico nao gera auditoria enganosa de mudanca material.
- Correcao manual gera auditoria com valor anterior, valor corrigido e motivo.
- Marcacao `removido` gera auditoria com lote causador.
- Reativacao por reaparecimento gera auditoria.
- Lote inelegivel bloqueado nao gera evento de sucesso.
- Soft delete excepcional gera auditoria e exige motivo.
