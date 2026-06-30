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
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'mms_assistencias'
      and column_name = 'versao_registro' and data_type = 'bigint'
  ),
  'mms_assistencias deve possuir versao_registro bigint'
);

select pg_temp.assert_true(
  exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'mms_partes_assistencia'
      and column_name = 'versao_registro' and data_type = 'bigint'
  ),
  'mms_partes_assistencia deve possuir versao_registro bigint'
);

select pg_temp.assert_true(
  exists (
    select 1 from pg_trigger
    where tgrelid = 'public.mms_assistencias'::regclass
      and tgname = 'mms_assistencias_versao_registro' and not tgisinternal
  )
  and exists (
    select 1 from pg_trigger
    where tgrelid = 'public.mms_partes_assistencia'::regclass
      and tgname = 'mms_partes_versao_registro' and not tgisinternal
  ),
  'assistencia e parte devem incrementar versao por trigger'
);

select pg_temp.assert_true(
  (select relrowsecurity from pg_class where oid = 'public.mms_assistencias'::regclass)
  and (select relrowsecurity from pg_class where oid = 'public.mms_partes_assistencia'::regclass),
  'RLS deve permanecer habilitada no espelho'
);

select pg_temp.assert_true(
  not has_function_privilege(
    'authenticated',
    'app_private.mms_corrigir_assistencia(uuid,text,text,text)',
    'EXECUTE'
  )
  and not has_function_privilege(
    'authenticated',
    'app_private.mms_corrigir_parte_assistencia(uuid,text,text,text)',
    'EXECUTE'
  ),
  'authenticated nao pode executar correcoes legadas'
);

select pg_temp.assert_true(
  has_function_privilege(
    'authenticated',
    'public.listar_assistencias_mms(jsonb,date,uuid,integer)',
    'EXECUTE'
  )
  and has_function_privilege(
    'authenticated',
    'public.obter_detalhe_assistencia_mms(uuid,boolean)',
    'EXECUTE'
  )
  and has_function_privilege(
    'authenticated',
    'public.corrigir_campo_assistencia_mms(text,uuid,text,text,text,bigint)',
    'EXECUTE'
  )
  and has_function_privilege(
    'authenticated',
    'public.listar_historico_assistencia_mms(uuid,timestamptz,uuid,integer)',
    'EXECUTE'
  ),
  'authenticated deve executar apenas as RPCs publicas da interface'
);

rollback;
