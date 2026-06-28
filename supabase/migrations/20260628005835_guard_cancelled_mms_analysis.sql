begin;

create or replace function app_private.mms_preservar_cancelamento_spec006()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.status = 'cancelado' and new.status is distinct from old.status then
    raise exception 'lote_cancelado' using errcode = '22023';
  end if;
  return new;
end
$$;

drop trigger if exists mms_lotes_preservar_cancelamento_spec006
  on public.mms_lotes_importacao;

create trigger mms_lotes_preservar_cancelamento_spec006
before update on public.mms_lotes_importacao
for each row
execute function app_private.mms_preservar_cancelamento_spec006();

commit;
