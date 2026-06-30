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
    'public.corrigir_campo_assistencia_mms(text,uuid,text,text,text,bigint)'::regprocedure
  ) ilike '%versao_registro%'
  and pg_get_functiondef(
    'public.corrigir_campo_assistencia_mms(text,uuid,text,text,text,bigint)'::regprocedure
  ) ilike '%p_versao_esperada%'
  and pg_get_functiondef(
    'public.corrigir_campo_assistencia_mms(text,uuid,text,text,text,bigint)'::regprocedure
  ) ilike '%correcao_desatualizada%',
  'RPC deve rejeitar versao desatualizada'
);

select pg_temp.assert_true(
  pg_get_functiondef(
    'app_private.mms_incrementar_versao_registro()'::regprocedure
  ) ilike '%old.versao_registro + 1%',
  'trigger deve incrementar versao exatamente uma vez'
);

rollback;
