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

update public.usuarios_postos
set nivel_acesso='consulta',deleted_at=null,deleted_by=null,delete_reason=null
where id='50000000-0000-0000-0000-000000000004';
select set_config(
  'request.jwt.claim.sub',
  (select auth_user_id::text from public.usuarios where email='operador@doka.test'),
  true
);
select pg_temp.assert_true(
  app_private.mms_usuario_pode_corrigir_posto('40000000-0000-0000-0000-000000000001')
  and not app_private.mms_usuario_pode_corrigir_posto('40000000-0000-0000-0000-000000000002'),
  'operador corrige posto operacional, mas não posto somente consulta'
);

update public.usuarios_postos
set deleted_at=now(),deleted_by='30000000-0000-0000-0000-000000000003',
  delete_reason='teste de projeção parcial'
where id='50000000-0000-0000-0000-000000000004';
update public.mms_lotes_importacao
set total_assistencias=99,total_partes=99
where id='70000000-0000-4000-8000-000000000002';
do $$
declare item jsonb;
begin
  select value into item
  from jsonb_array_elements(public.listar_lotes_importacao_mms('{}',null,null,100)->'itens')
  where value->>'lote_id'='70000000-0000-4000-8000-000000000002';
  if item is null
    or (item->>'visibilidade_parcial')::boolean is not true
    or (item->>'total_assistencias')::int<>1
    or (item->>'total_partes')::int<>1 then
    raise exception 'ASSERTION FAILED: lote parcial expôs totais globais: %',item;
  end if;
end
$$;
rollback;
