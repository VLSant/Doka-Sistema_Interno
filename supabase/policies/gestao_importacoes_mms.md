# Gestão de Importações MMS — RLS, RPCs e auditoria

## Matriz de capacidades

| Capacidade | Operador consulta | Operador operacional | Supervisão | Direção/Admin |
| --- | --- | --- | --- | --- |
| Listar/detalhar postos autorizados | Sim | Sim | Sim | Global |
| Baixar arquivo do lote | Cobertura integral | Cobertura integral | Cobertura integral | Sim |
| Corrigir staging | Não | Postos operacionais | Escopo autorizado | Global |
| Concluir/reprocessar | Não | Não | Cobertura integral | Global |
| Analisar/desfazer | Não | Não | Cobertura integral | Global |

## Fronteiras de segurança

- Autorização deriva de `auth.uid()`, `usuarios`, `usuarios_postos` e `postos`
  ativos. `user_metadata` não é usado.
- `mms_correcoes_importacao` e `mms_operacoes_lote` possuem RLS habilitada.
  Clientes recebem somente `SELECT`; INSERT/UPDATE/DELETE são exclusivos das
  RPCs transacionais.
- RPCs públicas são `SECURITY DEFINER` intencionais, têm `search_path` vazio,
  revalidam ator/perfil/escopo e revogam `PUBLIC`/`anon`.
- Helpers privilegiados ficam em `app_private`, fora do schema exposto, sem
  `EXECUTE` para clientes.
- Arquivos no bucket privado exigem cobertura integral atual do lote. A policy
  não concede acesso por conhecer caminho ou UUID.
- Lotes parcialmente visíveis são projetados pelas RPCs; totais globais,
  caminho do arquivo, resultado e operações não são expostos.

## Imutabilidade e concorrência

- `raw_json` e `json_normalizado` continuam protegidos pelos gatilhos existentes.
- Correções são append-only por linha/campo/versão. Somente a versão vigente
  entra em `app_private.mms_json_efetivo`.
- Escritas usam lock de linha e versão esperada. Versões obsoletas retornam
  `correcao_desatualizada`.
- Reprocessamento e desfazer usam ledger com chave idempotente e hash da
  requisição. Chave reutilizada com payload diferente é rejeitada.
- Desfazer adquire locks consultivos por `posto_id + data_atividade`, revalida a
  assinatura e nunca executa delete físico.

## Auditoria

`historico_auditoria` permanece a fonte única. Eventos:

- `correcao_salva`;
- `tratamento_concluido`;
- `reprocessamento_concluido`;
- `analise_desfazer_realizada` / `analise_desfazer_bloqueada`;
- `desfazer_importacao_concluido`.

Metadados não incluem token, URL assinada, arquivo completo ou `raw_json`.
Operações bloqueadas não geram evento de sucesso.

## Dependências futuras

Antes de liberar escrita em ocorrências ou custos extras, os respectivos
vínculos devem integrar o verificador de dependências do desfazer. Qualquer
ocorrência, custo ou dependência operacional posterior deve bloquear o lote
inteiro com código estável, sem revelar dados fora do escopo.

## Verificação

Executar os arquivos `supabase/tests/gestao_importacoes_mms_*.sql` em transação,
os advisors de segurança/desempenho e planos das RPCs de lista, detalhe e
desfazer. Warnings de RPC pública `SECURITY DEFINER` devem ser revisados
individualmente: só são aceitáveis para endpoints intencionais com autenticação,
escopo e grants explícitos.
