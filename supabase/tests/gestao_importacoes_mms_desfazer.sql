begin;
create or replace function pg_temp.assert_true(ok boolean,msg text) returns void language plpgsql as $$
begin if not coalesce(ok,false) then raise exception 'ASSERTION FAILED: %',msg; end if; end $$;
select pg_temp.assert_true(
  to_regprocedure('public.analisar_desfazer_importacao_mms(uuid)') is not null
  and to_regprocedure('public.desfazer_importacao_mms(uuid,text,text,uuid)') is not null,
  'RPCs de análise e execução existem'
);
select pg_temp.assert_true(
  pg_get_functiondef('public.analisar_desfazer_importacao_mms(uuid)'::regprocedure)
    like '%lote_nao_e_mais_recente%'
  and pg_get_functiondef('public.analisar_desfazer_importacao_mms(uuid)'::regprocedure)
    like '%edicao_manual_posterior%'
  and pg_get_functiondef('public.desfazer_importacao_mms(uuid,text,text,uuid)'::regprocedure)
    like '%analise_desatualizada%',
  'bloqueios e assinatura desatualizada são estáveis'
);
select pg_temp.assert_true(
  pg_get_functiondef('app_private.mms_reconstruir_espelho_escopo(uuid,date,uuid,uuid)'::regprocedure)
    like '%p_lote_fonte is null%'
  and pg_get_functiondef('app_private.mms_reconstruir_espelho_escopo(uuid,date,uuid,uuid)'::regprocedure)
    like '%mms_processar_lote_assistencias(p_lote_fonte)%',
  'reconstrução cobre predecessor e ausência de predecessor'
);
rollback;
