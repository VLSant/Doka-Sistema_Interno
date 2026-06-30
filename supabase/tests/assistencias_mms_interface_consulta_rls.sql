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
  position(
    'usuario_pode_consultar_assistencia_mms'
    in pg_get_functiondef(
      'public.listar_assistencias_mms(jsonb,date,uuid,integer)'::regprocedure
    )
  ) > 0
  and position(
    'data_atividade'
    in pg_get_functiondef(
      'public.listar_assistencias_mms(jsonb,date,uuid,integer)'::regprocedure
    )
  ) > 0
  and position(
    'v_situacao'
    in pg_get_functiondef(
      'public.listar_assistencias_mms(jsonb,date,uuid,integer)'::regprocedure
    )
  ) > 0,
  'lista deve aplicar escopo, cursor e situacao no banco'
);

select pg_temp.assert_true(
  pg_get_functiondef(
    'public.obter_detalhe_assistencia_mms(uuid,boolean)'::regprocedure
  ) ilike '%usuario_pode_consultar_assistencia_mms%'
  and pg_get_functiondef(
    'public.obter_detalhe_assistencia_mms(uuid,boolean)'::regprocedure
  ) ilike '%p_incluir_partes_removidas%',
  'detalhe deve aplicar escopo e inclusao explicita de removidos'
);

select pg_temp.assert_true(
  pg_get_functiondef(
    'app_private.usuario_pode_consultar_assistencia_mms(uuid)'::regprocedure
  ) ilike '%nivel_acesso in (%'
  and pg_get_functiondef(
    'app_private.usuario_pode_consultar_assistencia_mms(uuid)'::regprocedure
  ) ilike '%nivel_acesso = ''supervisao''%',
  'leitura deve diferenciar vinculos de operador e supervisao'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000000', true);

do $$
begin
  perform public.listar_assistencias_mms();
  raise exception 'ASSERTION FAILED: usuario sem perfil deveria ser bloqueado';
exception
  when insufficient_privilege then null;
end
$$;

reset role;
rollback;
