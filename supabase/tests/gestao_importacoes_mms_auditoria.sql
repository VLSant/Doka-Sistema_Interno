begin;
create or replace function pg_temp.assert_true(ok boolean,msg text) returns void language plpgsql as $$
begin if not coalesce(ok,false) then raise exception 'ASSERTION FAILED: %',msg; end if; end $$;
select pg_temp.assert_true(
  pg_get_functiondef('public.salvar_correcao_importacao_mms(uuid,uuid,text,jsonb,integer,text)'::regprocedure)
    like '%registrar_auditoria%'
  and pg_get_functiondef('public.reprocessar_lote_importacao_mms(uuid,integer,uuid)'::regprocedure)
    like '%registrar_auditoria%'
  and pg_get_functiondef('public.desfazer_importacao_mms(uuid,text,text,uuid)'::regprocedure)
    like '%registrar_auditoria%',
  'ações críticas registram auditoria central'
);
select pg_temp.assert_true(
  substring(
    pg_get_functiondef('public.salvar_correcao_importacao_mms(uuid,uuid,text,jsonb,integer,text)'::regprocedure)
    from 'perform app_private\.registrar_auditoria[^;]+;'
  ) not like '%raw_json%',
  'payload de correção não copia raw_json para auditoria'
);
rollback;
