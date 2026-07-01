# Contract: Segurança, RLS e Auditoria da Gestão MMS

## Matriz de capacidades

| Capacidade | Operador consulta | Operador operacional | Supervisão | Direção/Admin |
| --- | --- | --- | --- | --- |
| Listar/detalhar escopo | Sim | Sim | Sim | Global |
| Consultar erros/alertas | Sim | Sim | Sim | Global |
| Salvar correção | Não | Próprios postos | Próprio escopo | Global |
| Concluir tratamento | Não | Não | Escopo integral | Global |
| Reprocessar | Não | Não | Escopo integral | Global |
| Analisar/desfazer | Não | Não | Escopo integral | Global |
| Dados técnicos/arquivo | Contratos vigentes + cobertura integral | Igual | Igual | Global |

## Invariantes de autorização

- O JWT identifica sessão; perfil e posto vêm das tabelas operacionais.
- `user_metadata` não participa de autorização.
- Toda mutação revalida `auth.uid()`, usuário ativo, perfil, vínculo e postos.
- `TO authenticated` sempre é combinado com predicado de escopo ou RPC
  autoritativa.
- Nenhuma chave privilegiada é usada no navegador.
- Funções privilegiadas usam nomes totalmente qualificados e `search_path`
  fixo.
- `PUBLIC` e `anon` não executam RPCs nem acessam novas tabelas.
- Update direto das novas entidades é bloqueado.
- Delete físico continua bloqueado.

## RLS

### `mms_correcoes_importacao`

- SELECT: herda visibilidade da linha/posto e restrição técnica do perfil.
- INSERT/UPDATE/DELETE: bloqueados diretamente; somente RPC.

### `mms_operacoes_lote`

- SELECT: somente ator com cobertura atual do lote e perfil compatível com a
  operação.
- INSERT/UPDATE/DELETE: bloqueados diretamente; somente RPC.

### Entidades existentes

As policies de lotes/linhas/erros/alertas devem ser revistas para lotes
multi-posto:

- linha é autorizada por seu próprio `posto_id`;
- erro/alerta/correção herda a linha;
- registros de nível de lote com dados globais são projetados por RPC;
- arquivo exige cobertura integral;
- o fluxo da Spec 006 do importador continua funcional.

## Auditoria

`historico_auditoria` continua sendo a fonte única. Cada evento inclui:

- entidade e id;
- ação estável;
- ator derivado;
- lote, linha, campo e posto quando aplicável;
- versão anterior/nova;
- valores anterior/corrigido apenas quando seguros;
- justificativa quando obrigatória;
- resultado ou código de falha;
- timestamp do banco.

Não incluir:

- access token, segredo, caminho assinado;
- arquivo completo;
- `raw_json` integral;
- detalhes de registros fora do escopo;
- evento de sucesso para operação bloqueada.

## Advisors e validações

Antes de concluir a migration:

- executar advisors de segurança e desempenho;
- confirmar RLS habilitada;
- confirmar grants explícitos e ausência de `PUBLIC EXECUTE`;
- verificar índices usados pelas policies;
- testar que UPDATE possui SELECT correspondente quando aplicável;
- verificar que views, se alguma for indispensável, usam invocador de segurança.

## Testes SQL mínimos

- `anon` sem acesso.
- Usuário sem perfil/ativo sem acesso.
- Todos os perfis conforme matriz.
- Vínculo removido durante tela bloqueia ação.
- Posto inativo bloqueia.
- Lote multi-posto parcial não vaza arquivo/totais.
- Chamada direta a função privada falha.
- Escrita direta nas novas tabelas falha.
- Toda ação crítica bem-sucedida audita.
- Toda ação bloqueada não registra sucesso.
