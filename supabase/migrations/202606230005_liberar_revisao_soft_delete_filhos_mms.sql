-- Permite revisao gerencial de filhos MMS soft-deleted para viabilizar soft delete sob RLS.

create policy mms_linhas_importacao_select_soft_deleted_gerencial
on public.mms_linhas_importacao
for select
to authenticated
using (
  deleted_at is not null
  and app_private.mms_lote_gerenciavel(lote_importacao_id)
);

create policy mms_erros_importacao_select_soft_deleted_gerencial
on public.mms_erros_importacao
for select
to authenticated
using (
  deleted_at is not null
  and app_private.mms_lote_gerenciavel(lote_importacao_id)
);

create policy mms_alertas_importacao_select_soft_deleted_gerencial
on public.mms_alertas_importacao
for select
to authenticated
using (
  deleted_at is not null
  and app_private.mms_lote_gerenciavel(lote_importacao_id)
);
