begin;
create or replace function pg_temp.assert_true(ok boolean,msg text) returns void language plpgsql as $$
begin if not coalesce(ok,false) then raise exception 'ASSERTION FAILED: %',msg; end if; end $$;
select pg_temp.assert_true(
  app_private.mms_correcao_valida('numero_assistencia','"AST-1"'::jsonb)
  and app_private.mms_correcao_valida('data_atividade','"29/06/2026"'::jsonb)
  and not app_private.mms_correcao_valida('numero_assistencia','""'::jsonb)
  and not app_private.mms_correcao_valida('campo_proibido','"x"'::jsonb),
  'allowlist e validadores são determinísticos'
);
select pg_temp.assert_true(
  app_private.mms_campo_correcao('Número da Assistência')='numero_assistencia'
  and app_private.mms_campo_correcao('Status da Atividade')='status_atividade'
  and app_private.mms_campo_correcao('Tipo de Atividade')='tipo_atividade',
  'rótulos persistidos convergem para campos canônicos'
);
select pg_temp.assert_true(
  exists(select 1 from pg_indexes where schemaname='public' and tablename='mms_correcoes_importacao'
    and indexdef like '%linha_importacao_id, campo, versao%'),
  'histórico possui versão única por linha/campo'
);
select pg_temp.assert_true(
  pg_get_functiondef('app_private.mms_processar_lote_assistencias(uuid)'::regprocedure)
    like '%mms_json_efetivo(linha.id)%',
  'processador consome projeção efetiva'
);
select pg_temp.assert_true(
  pg_get_functiondef('public.salvar_correcao_importacao_mms(uuid,uuid,text,jsonb,integer,text)'::regprocedure)
    like '%mms_campo_correcao(campo)=p_campo%',
  'erro persistido com rótulo é resolvido pelo campo canônico'
);
rollback;
