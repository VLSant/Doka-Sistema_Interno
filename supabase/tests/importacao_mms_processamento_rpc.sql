begin;

create or replace function pg_temp.assert_true(cond boolean, msg text)
returns void language plpgsql as $$
begin
  if not coalesce(cond, false) then raise exception 'ASSERTION FAILED: %', msg; end if;
end $$;

select pg_temp.assert_true(
  to_regprocedure('public.iniciar_importacao_mms(text,text,text,bigint,text,date,integer)') is not null,
  'RPC iniciar deve existir'
);
select pg_temp.assert_true(
  to_regprocedure('public.registrar_arquivo_importacao_mms(uuid)') is not null
  and to_regprocedure('public.registrar_linhas_importacao_mms(uuid,jsonb)') is not null
  and to_regprocedure('public.concluir_analise_importacao_mms(uuid)') is not null
  and to_regprocedure('public.cancelar_importacao_mms(uuid)') is not null,
  'RPCs de staging e cancelamento devem existir'
);
select pg_temp.assert_true(
  has_function_privilege('authenticated', 'public.registrar_linhas_importacao_mms(uuid,jsonb)', 'EXECUTE')
  and not has_function_privilege('anon', 'public.registrar_linhas_importacao_mms(uuid,jsonb)', 'EXECUTE'),
  'somente authenticated executa workflow'
);

select pg_temp.assert_true(
  to_regprocedure('app_private.mms_preservar_cancelamento_spec006()') is not null,
  'cancelamento terminal deve ser protegido no banco'
);

select set_config(
  'request.jwt.claim.sub',
  (select auth_user_id::text
   from public.usuarios
   where email = 'operador@doka.test' and ativo and deleted_at is null
   limit 1),
  true
);
set local role authenticated;

do $$
declare
  inicio jsonb;
  lote_uuid uuid;
  caminho text;
  evidencia_linhas integer;
  bloqueado boolean := false;
begin
  inicio := public.iniciar_importacao_mms(
    'cancelamento-spec006.csv',
    'csv',
    'text/csv',
    321,
    'Posto A',
    date '2099-06-26',
    1
  );
  lote_uuid := (inicio ->> 'lote_id')::uuid;
  caminho := inicio ->> 'caminho';

  insert into storage.objects (bucket_id, name, owner_id, metadata)
  values (
    'mms-importacoes',
    caminho,
    auth.uid()::text,
    jsonb_build_object('size', 321, 'mimetype', 'text/csv')
  );

  perform public.registrar_arquivo_importacao_mms(lote_uuid);
  perform public.registrar_linhas_importacao_mms(
    lote_uuid,
    jsonb_build_array(jsonb_build_object(
      'numero_linha_origem', 2,
      'raw_json', jsonb_build_object(
        'Data', '26/06/2099',
        'Área de Trabalho', 'Posto A',
        'Número da Assistência', 'AST-CANCEL-006',
        'Parte do Conjunto', 'PARTE-A',
        'Tipo de Atividade', 'Montagem em Conjunto',
        'Status da Atividade', 'Concluído',
        'Recurso', 'Montador Teste'
      )
    ))
  );

  select count(*) into evidencia_linhas
  from public.mms_linhas_importacao
  where lote_importacao_id = lote_uuid;

  perform public.cancelar_importacao_mms(lote_uuid);
  perform public.cancelar_importacao_mms(lote_uuid);

  begin
    perform public.concluir_analise_importacao_mms(lote_uuid);
  exception when sqlstate '22023' then
    bloqueado := true;
  end;

  if not bloqueado then
    raise exception 'ASSERTION FAILED: lote cancelado voltou ao fluxo';
  end if;
  if evidencia_linhas <> 1
    or (select count(*) from public.mms_linhas_importacao where lote_importacao_id = lote_uuid) <> 1 then
    raise exception 'ASSERTION FAILED: cancelamento removeu evidencia';
  end if;
  if (select status from public.mms_lotes_importacao where id = lote_uuid) <> 'cancelado' then
    raise exception 'ASSERTION FAILED: cancelamento nao permaneceu terminal';
  end if;
  if exists (
    select 1 from public.mms_assistencias
    where lote_criacao_id = lote_uuid or lote_ultimo_id = lote_uuid
  ) then
    raise exception 'ASSERTION FAILED: cancelamento alterou o espelho';
  end if;
end
$$;

rollback;
