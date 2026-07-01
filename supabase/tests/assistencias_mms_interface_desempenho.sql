begin;

create or replace function pg_temp.assert_true(cond boolean, msg text)
returns void language plpgsql as $$
begin
  if not coalesce(cond, false) then
    raise exception 'ASSERTION FAILED: %', msg;
  end if;
end
$$;

select pg_temp.assert_true(
  exists (
    select 1 from pg_indexes
    where schemaname = 'public' and tablename = 'mms_assistencias'
      and indexname = 'mms_assistencias_lista_cursor_idx'
  )
  and exists (
    select 1 from pg_indexes
    where schemaname = 'public' and tablename = 'mms_assistencias'
      and indexname = 'mms_assistencias_numero_trgm_idx'
  )
  and exists (
    select 1 from pg_indexes
    where schemaname = 'public' and tablename = 'mms_assistencias'
      and indexname = 'mms_assistencias_cliente_vigente_trgm_idx'
  ),
  'lista e buscas parciais devem possuir indices dedicados'
);

select pg_temp.assert_true(
  exists (
    select 1 from pg_indexes
    where schemaname = 'public' and tablename = 'historico_auditoria'
      and indexname = 'historico_auditoria_entidade_cursor_idx'
  ),
  'historico deve possuir indice de entidade e cursor'
);

rollback;
