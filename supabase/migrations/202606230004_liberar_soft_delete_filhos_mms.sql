-- Explicita policies de soft delete para tabelas filhas MMS.

create policy mms_linhas_importacao_soft_delete_update
on public.mms_linhas_importacao
for update
to authenticated
using (
  deleted_at is null
  and app_private.mms_lote_gerenciavel(lote_importacao_id)
)
with check (
  deleted_at is not null
  and deleted_by is not null
  and nullif(btrim(delete_reason), '') is not null
  and app_private.mms_lote_gerenciavel(lote_importacao_id)
);

create policy mms_erros_importacao_soft_delete_update
on public.mms_erros_importacao
for update
to authenticated
using (
  deleted_at is null
  and app_private.mms_lote_gerenciavel(lote_importacao_id)
)
with check (
  deleted_at is not null
  and deleted_by is not null
  and nullif(btrim(delete_reason), '') is not null
  and app_private.mms_lote_gerenciavel(lote_importacao_id)
);

create policy mms_alertas_importacao_soft_delete_update
on public.mms_alertas_importacao
for update
to authenticated
using (
  deleted_at is null
  and app_private.mms_lote_gerenciavel(lote_importacao_id)
)
with check (
  deleted_at is not null
  and deleted_by is not null
  and nullif(btrim(delete_reason), '') is not null
  and app_private.mms_lote_gerenciavel(lote_importacao_id)
);
