-- Policies RLS e policies do Storage são avaliadas como `authenticated` e
-- precisam executar estes predicados privados. O schema app_private não é
-- exposto pela Data API e os helpers retornam somente boolean.
grant execute on function app_private.mms_lote_workflow_acessivel(uuid),
  app_private.mms_lote_acessivel(uuid),
  app_private.mms_lote_gerenciavel(uuid)
to authenticated;
