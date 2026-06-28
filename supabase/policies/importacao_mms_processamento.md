# Segurança da Importação MMS — Spec 006

## Storage

- Bucket privado `mms-importacoes`, limitado a 25 MiB e aos MIME types CSV/XLSX.
- Caminho reservado: `<auth.uid()>/<lote_id>/<uuid>.<ext>`.
- `authenticated` recebe somente `INSERT` no caminho reservado e `SELECT`
  quando o lote está no escopo; overwrite, update, move e delete não são
  concedidos.
- O navegador usa apenas o JWT corrente e o hostname direto do Storage. Chave
  secreta/service role e URL pública não participam do fluxo.

## Banco e RPCs

- Escrita direta de `authenticated` em lotes, linhas, erros e alertas é
  revogada; leitura continua sob RLS.
- As seis RPCs públicas derivam o ator de `auth.uid()`, revalidam posto/lote e
  aceitam somente payloads limitados.
- `EXECUTE` é revogado de `PUBLIC` e `anon` e concedido explicitamente a
  `authenticated`.
- Funções `SECURITY DEFINER` usam relações qualificadas e `search_path` vazio.
- O processador interno do espelho não é executável diretamente pela Data API.

## Evidência, auditoria e atomicidade

- `raw_json` preserva cabeçalhos/valores originais e é imutável.
- `json_normalizado` é separado, imutável e alimenta o espelho.
- Cancelamento preserva arquivo/staging e nunca altera o espelho.
- Confirmação bloqueia o lote; sucesso persiste resultado idempotente.
- Falha no bloco protegido reverte todas as mudanças do espelho e registra
  apenas código seguro, sem evento falso de sucesso.

## Validação

Os arquivos em `supabase/tests/importacao_mms_processamento_*.sql` devem ser
executados no projeto remoto de desenvolvimento como consultas únicas
envolvidas por `BEGIN`/`ROLLBACK`. A Spec 006 não depende de Docker.

## Exceções revisadas do Supabase Advisor

- O Advisor sinaliza `authenticated_security_definer_function_executable` nas
  seis RPCs públicas. A exposição é intencional: elas são a fronteira estreita
  do workflow, validam `auth.uid()`, perfil, posto e lote, usam `search_path`
  vazio e recebem limites de payload. `PUBLIC`/`anon` não executam as RPCs,
  escrita direta no staging é negada e o processador interno não é executável
  por `authenticated`.
- Índices recém-criados podem aparecer como não utilizados imediatamente após
  a migration; isso não justifica removê-los antes do uso operacional.
- O aviso de proteção contra senhas vazadas e os demais avisos de performance
  preexistentes não foram introduzidos pela Spec 006.
