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
  app_private.mms_valor_visivel('Importado', null) = 'Importado'
  and app_private.mms_valor_visivel('Importado', 'Corrigido') = 'Corrigido',
  'valor corrigido deve preceder o importado'
);

select pg_temp.assert_true(
  pg_get_functiondef(
    'public.obter_detalhe_assistencia_mms(uuid,boolean)'::regprocedure
  ) ilike '%cliente_nome_importado%'
  and pg_get_functiondef(
    'public.obter_detalhe_assistencia_mms(uuid,boolean)'::regprocedure
  ) ilike '%cliente_nome_corrigido%'
  and pg_get_functiondef(
    'public.obter_detalhe_assistencia_mms(uuid,boolean)'::regprocedure
  ) ilike '%descricao_mercadoria_importada%'
  and pg_get_functiondef(
    'public.obter_detalhe_assistencia_mms(uuid,boolean)'::regprocedure
  ) ilike '%recurso_corrigido%',
  'detalhe deve projetar importado e corrigido dos quatro campos'
);

rollback;
