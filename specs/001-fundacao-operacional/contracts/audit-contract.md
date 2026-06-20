# Contract: Audit Events

## Purpose

Define which events must create records in `historico_auditoria` for the
operational foundation.

## Event Shape

Each audit event must include:
- `entidade_tipo`: affected entity type.
- `entidade_id`: affected entity id when available.
- `acao`: canonical action name.
- `valor_anterior`: previous values when applicable.
- `valor_novo`: new values when applicable.
- `metadata`: context such as reason, source or affected posto.
- `usuario_id`: operational user responsible for the action when available.
- `created_at`: event timestamp.

## Required Actions

| Action | When |
| --- | --- |
| `criado` | A user, posto, cargo/funcao or link is created |
| `atualizado` | Relevant fields are changed |
| `perfil_alterado` | `usuarios.perfil` changes |
| `ativado` | A user, posto or cargo/funcao becomes active |
| `inativado` | A user, posto or cargo/funcao becomes inactive |
| `vinculo_posto_criado` | A user receives access to a posto |
| `vinculo_posto_removido` | A user/posted link is soft-deleted |
| `excluido_logicamente` | Any applicable operational record receives `deleted_at` |

## Acceptance Rules

1. Audit is written only after the critical operation succeeds.
2. Failed operations do not create misleading success events.
3. Audit records are not removed by ordinary operational delete flows.
4. `valor_anterior` and `valor_novo` use structured JSON when values are available.
5. Direcao/Admin can inspect full audit history.
6. Supervisao can inspect scoped audit history when authorized by policy.
7. Operador does not receive a general audit listing in this feature.
