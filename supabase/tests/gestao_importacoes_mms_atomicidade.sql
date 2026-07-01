begin;
create or replace function pg_temp.assert_true(ok boolean,msg text) returns void language plpgsql as $$
begin if not coalesce(ok,false) then raise exception 'ASSERTION FAILED: %',msg; end if; end $$;
select pg_temp.assert_true(
  pg_get_functiondef('public.desfazer_importacao_mms(uuid,text,text,uuid)'::regprocedure)
    like '%mms_reconstruir_espelho_escopo%'
  and pg_get_functiondef('public.desfazer_importacao_mms(uuid,text,text,uuid)'::regprocedure)
    not like '%delete from public.mms_%',
  'desfazer reconstrói atomicamente sem delete físico'
);
select pg_temp.assert_true(
  pg_get_functiondef('app_private.mms_reconstruir_espelho_escopo(uuid,date,uuid,uuid)'::regprocedure)
    like '%exception when others%',
  'reconstrução limpa contexto também em falha'
);
rollback;
