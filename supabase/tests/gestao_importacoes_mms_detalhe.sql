begin;
create or replace function pg_temp.assert_true(ok boolean,msg text) returns void language plpgsql as $$
begin if not coalesce(ok,false) then raise exception 'ASSERTION FAILED: %',msg; end if; end $$;
select pg_temp.assert_true(
  to_regprocedure('public.obter_detalhe_lote_importacao_mms(uuid)') is not null
  and to_regprocedure('public.listar_itens_lote_importacao_mms(uuid,text,jsonb,jsonb,integer)') is not null,
  'RPCs de detalhe existem'
);
select pg_temp.assert_true(
  pg_get_functiondef('public.obter_detalhe_lote_importacao_mms(uuid)'::regprocedure) like '%mms_cobertura_integral%'
  and pg_get_functiondef('public.listar_itens_lote_importacao_mms(uuid,text,jsonb,jsonb,integer)'::regprocedure) like '%mms_lote_acessivel%',
  'detalhe e coleções revalidam escopo'
);
rollback;
