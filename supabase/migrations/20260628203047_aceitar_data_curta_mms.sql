begin;

create or replace function app_private.mms_data_texto(valor text)
returns date
language plpgsql
immutable
set search_path = ''
as $$
declare
  texto text := btrim(valor);
  canonico text;
  resultado date;
begin
  if texto ~ '^\d{2}/\d{2}/\d{2}$' then
    canonico := left(texto, 6) || '20' || right(texto, 2);
    resultado := to_date(canonico, 'DD/MM/YYYY');
    if to_char(resultado, 'DD/MM/YYYY') = canonico then
      return resultado;
    end if;
    return null;
  end if;

  if texto ~ '^\d{2}/\d{2}/\d{4}$' then
    resultado := to_date(texto, 'DD/MM/YYYY');
    if to_char(resultado, 'DD/MM/YYYY') = texto then
      return resultado;
    end if;
    return null;
  end if;

  if texto ~ '^\d{4}-\d{2}-\d{2}' then
    resultado := left(texto, 10)::date;
    if to_char(resultado, 'YYYY-MM-DD') = left(texto, 10) then
      return resultado;
    end if;
  end if;

  return null;
exception when others then
  return null;
end
$$;

commit;
