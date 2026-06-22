-- Permite que roles autenticados avaliem check constraints que usam a funcao
-- compartilhada de soft delete nos cadastros base.

grant execute on function app_private.campo_soft_delete_valido(timestamptz, uuid, text) to authenticated;
