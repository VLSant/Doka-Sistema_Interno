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
  pg_get_functiondef(
    'public.corrigir_campo_assistencia_mms(text,uuid,text,text,text,bigint)'::regprocedure
  ) ilike '%for update%'
  and pg_get_functiondef(
    'public.corrigir_campo_assistencia_mms(text,uuid,text,text,text,bigint)'::regprocedure
  ) ilike '%usuario_pode_corrigir_assistencia_mms%'
  and pg_get_functiondef(
    'public.corrigir_campo_assistencia_mms(text,uuid,text,text,text,bigint)'::regprocedure
  ) ilike '%campo_nao_corrigivel%',
  'correcao deve bloquear linha, validar vinculo e allowlist'
);

select pg_temp.assert_true(
  pg_get_functiondef(
    'public.corrigir_campo_assistencia_mms(text,uuid,text,text,text,bigint)'::regprocedure
  ) not ilike '%raw_json%'
  and pg_get_functiondef(
    'public.corrigir_campo_assistencia_mms(text,uuid,text,text,text,bigint)'::regprocedure
  ) not ilike '%raw_json_resumo%',
  'correcao nao pode tocar evidencia original'
);

select pg_temp.assert_true(
  pg_get_functiondef(
    'app_private.usuario_pode_corrigir_assistencia_mms(uuid)'::regprocedure
  ) ilike '%nivel_acesso = ''operacional''%'
  and pg_get_functiondef(
    'app_private.usuario_pode_corrigir_assistencia_mms(uuid)'::regprocedure
  ) not ilike '%nivel_acesso in (''operacional'', ''consulta'')%',
  'vinculo consulta nao pode corrigir'
);

rollback;
