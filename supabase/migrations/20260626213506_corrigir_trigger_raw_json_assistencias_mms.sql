create or replace function app_private.mms_bloquear_raw_json_espelho()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if app_private.mms_importacao_espelho_autorizada() then
    return new;
  end if;

  if TG_TABLE_NAME = 'mms_assistencias' then
    if old.raw_json_resumo is distinct from new.raw_json_resumo then
      raise exception 'raw_json_resumo da assistencia MMS nao pode ser alterado diretamente';
    end if;
  elsif TG_TABLE_NAME = 'mms_partes_assistencia' then
    if old.raw_json is distinct from new.raw_json then
      raise exception 'raw_json da parte MMS nao pode ser alterado diretamente';
    end if;
  end if;

  return new;
end;
$$;
