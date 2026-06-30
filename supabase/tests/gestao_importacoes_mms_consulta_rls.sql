begin;
create or replace function pg_temp.assert_true(ok boolean,msg text) returns void language plpgsql as $$
begin if not coalesce(ok,false) then raise exception 'ASSERTION FAILED: %',msg; end if; end $$;

select pg_temp.assert_true(
  has_function_privilege('authenticated','public.listar_lotes_importacao_mms(jsonb,timestamptz,uuid,integer)','EXECUTE')
  and not has_function_privilege('anon','public.listar_lotes_importacao_mms(jsonb,timestamptz,uuid,integer)','EXECUTE'),
  'somente authenticated executa consulta'
);
select pg_temp.assert_true(
  not has_function_privilege('authenticated','app_private.mms_cobertura_integral(uuid)','EXECUTE')
  and not has_function_privilege('anon','app_private.mms_json_efetivo(uuid)','EXECUTE'),
  'helpers privados não são API'
);
set local role anon;
do $$ begin
  begin perform public.listar_lotes_importacao_mms('{}',null,null,50);
    raise exception 'ASSERTION FAILED: anon executou listagem';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
select pg_temp.assert_true(
  exists(select 1 from pg_policies where schemaname='storage' and tablename='objects'
    and policyname='mms_importacoes_select' and roles::text like '%authenticated%'),
  'arquivo privado possui policy autenticada'
);
rollback;
