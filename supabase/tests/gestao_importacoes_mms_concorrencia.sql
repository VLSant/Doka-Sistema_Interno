begin;
create or replace function pg_temp.assert_true(ok boolean,msg text) returns void language plpgsql as $$
begin if not coalesce(ok,false) then raise exception 'ASSERTION FAILED: %',msg; end if; end $$;
select pg_temp.assert_true(
  pg_get_functiondef('public.salvar_correcao_importacao_mms(uuid,uuid,text,jsonb,integer,text)'::regprocedure)
    like '%for update%'
  and pg_get_functiondef('public.salvar_correcao_importacao_mms(uuid,uuid,text,jsonb,integer,text)'::regprocedure)
    like '%correcao_desatualizada%',
  'correção usa lock e versão esperada'
);
select pg_temp.assert_true(
  pg_get_functiondef('public.desfazer_importacao_mms(uuid,text,text,uuid)'::regprocedure)
    like '%pg_advisory_xact_lock%',
  'desfazer bloqueia escopos em ordem determinística'
);
rollback;
