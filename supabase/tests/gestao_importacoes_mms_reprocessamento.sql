begin;
create or replace function pg_temp.assert_true(ok boolean,msg text) returns void language plpgsql as $$
begin if not coalesce(ok,false) then raise exception 'ASSERTION FAILED: %',msg; end if; end $$;
select pg_temp.assert_true(
  to_regprocedure('public.concluir_tratamento_importacao_mms(uuid,integer)') is not null
  and to_regprocedure('public.reprocessar_lote_importacao_mms(uuid,integer,uuid)') is not null
  and to_regprocedure('public.obter_operacao_lote_mms(uuid,uuid)') is not null,
  'RPCs de conclusão, reprocessamento e retomada existem'
);
select pg_temp.assert_true(
  pg_get_functiondef('public.reprocessar_lote_importacao_mms(uuid,integer,uuid)'::regprocedure)
    like '%chave_idempotencia_conflitante%'
  and exists(select 1 from pg_indexes where schemaname='public' and tablename='mms_operacoes_lote'
    and indexdef like '%created_by, chave_idempotencia%'),
  'ledger garante idempotência por ator'
);
select pg_temp.assert_true(
  pg_get_functiondef('public.reprocessar_lote_importacao_mms(uuid,integer,uuid)'::regprocedure)
    like '%set_config(''app.mms_replay'',''on'',true)%'
  and pg_get_functiondef('public.reprocessar_lote_importacao_mms(uuid,integer,uuid)'::regprocedure)
    like '%resultado_operacao->>''processado''%'
  and pg_get_functiondef('app_private.mms_processar_lote_assistencias(uuid)'::regprocedure)
    like '%erro_pendente.resolvido_em is null%',
  'reprocessamento ignora guarda antiga, inclui linhas corrigidas e rejeita falso sucesso'
);
rollback;
