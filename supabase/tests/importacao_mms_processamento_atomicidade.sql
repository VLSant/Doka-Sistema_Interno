begin;

create or replace function pg_temp.assert_true(cond boolean, msg text)
returns void language plpgsql as $$
begin
  if not coalesce(cond, false) then raise exception 'ASSERTION FAILED: %', msg; end if;
end $$;

select pg_temp.assert_true(
  to_regprocedure('public.confirmar_importacao_mms(uuid)') is not null,
  'RPC de confirmacao deve existir'
);
select pg_temp.assert_true(
  has_function_privilege('authenticated', 'public.confirmar_importacao_mms(uuid)', 'EXECUTE')
  and not has_function_privilege('anon', 'public.confirmar_importacao_mms(uuid)', 'EXECUTE'),
  'confirmacao deve ter privilegio minimo'
);
select pg_temp.assert_true(
  not has_function_privilege('authenticated', 'app_private.mms_processar_lote_assistencias(uuid)', 'EXECUTE'),
  'processamento interno nao pode ser chamado diretamente pelo cliente'
);
select pg_temp.assert_true(
  pg_get_functiondef('public.confirmar_importacao_mms(uuid)'::regprocedure)
    ilike '%for update%',
  'confirmacao deve serializar concorrencia com bloqueio do lote'
);
select pg_temp.assert_true(
  pg_get_functiondef('public.confirmar_importacao_mms(uuid)'::regprocedure)
    ilike '%if lote.espelho_processado_em is not null then return lote.resultado_processamento%',
  'retry deve devolver o resultado persistido sem repetir efeitos'
);
select pg_temp.assert_true(
  pg_get_functiondef('public.confirmar_importacao_mms(uuid)'::regprocedure)
    ilike '%exception when others%'
  and pg_get_functiondef('public.confirmar_importacao_mms(uuid)'::regprocedure)
    ilike '%codigo_ultima_falha=''falha_processamento''%',
  'falha protegida deve reverter o espelho e registrar somente codigo seguro'
);

rollback;
