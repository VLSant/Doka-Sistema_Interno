-- Fecha privilegios operacionais remanescentes no historico centralizado.
-- A aplicacao deve consultar historico via RLS, mas nao modificar, truncar ou
-- criar dependencias operacionais sobre a tabela de auditoria.

revoke insert, update, delete, truncate, references, trigger
on public.historico_auditoria
from authenticated;
