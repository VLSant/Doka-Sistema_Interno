begin;
create or replace function pg_temp.assert_true(ok boolean,msg text) returns void language plpgsql as $$
begin if not coalesce(ok,false) then raise exception 'ASSERTION FAILED: %',msg; end if; end $$;

select pg_temp.assert_true(to_regclass('public.mms_correcoes_importacao') is not null,'tabela de correções existe');
select pg_temp.assert_true(to_regclass('public.mms_operacoes_lote') is not null,'ledger de operações existe');
select pg_temp.assert_true(
  (select relrowsecurity from pg_class where oid='public.mms_correcoes_importacao'::regclass)
  and (select relrowsecurity from pg_class where oid='public.mms_operacoes_lote'::regclass),
  'novas tabelas possuem RLS'
);
select pg_temp.assert_true(
  exists(select 1 from information_schema.columns where table_schema='public' and table_name='mms_lotes_importacao' and column_name='versao_tratamento')
  and exists(select 1 from information_schema.columns where table_schema='public' and table_name='mms_linhas_importacao' and column_name='versao_correcao')
  and exists(select 1 from information_schema.columns where table_schema='public' and table_name='mms_erros_importacao' and column_name='resolvido_em'),
  'extensões de lote, linha e erro existem'
);
select pg_temp.assert_true(
  not has_table_privilege('anon','public.mms_correcoes_importacao','SELECT')
  and not has_table_privilege('authenticated','public.mms_correcoes_importacao','INSERT,UPDATE,DELETE'),
  'grants bloqueiam leitura anônima e escrita direta'
);
select pg_temp.assert_true(
  to_regprocedure('app_private.mms_json_efetivo(uuid)') is not null
  and to_regprocedure('app_private.mms_reconstruir_espelho_escopo(uuid,date,uuid,uuid)') is not null,
  'helpers privados existem'
);
rollback;
