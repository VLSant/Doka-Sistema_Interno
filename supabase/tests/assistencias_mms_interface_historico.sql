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
  pg_get_functiondef(
    'public.listar_historico_assistencia_mms(uuid,timestamptz,uuid,integer)'::regprocedure
  ) ilike '%historico_auditoria%'
  and pg_get_functiondef(
    'public.listar_historico_assistencia_mms(uuid,timestamptz,uuid,integer)'::regprocedure
  ) ilike '%created_at desc%'
  and pg_get_functiondef(
    'public.listar_historico_assistencia_mms(uuid,timestamptz,uuid,integer)'::regprocedure
  ) ilike '%mms_lote_acessivel%',
  'historico deve usar fonte central, cursor e autorizacao de lote'
);

select pg_temp.assert_true(
  pg_get_functiondef(
    'public.listar_historico_assistencia_mms(uuid,timestamptz,uuid,integer)'::regprocedure
  ) not ilike '%''raw_json''%'
  and pg_get_functiondef(
    'public.listar_historico_assistencia_mms(uuid,timestamptz,uuid,integer)'::regprocedure
  ) not ilike '%''raw_json_resumo''%',
  'historico nao deve projetar evidencia bruta'
);

rollback;
