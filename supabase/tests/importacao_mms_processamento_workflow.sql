begin;

select set_config(
  'request.jwt.claim.sub',
  (select auth_user_id::text from public.usuarios where email = 'operador@doka.test' and ativo and deleted_at is null limit 1),
  true
);
set local role authenticated;

do $$
declare
  inicio jsonb;
  previa jsonb;
  resultado jsonb;
  repetido jsonb;
  lote_uuid uuid;
  caminho text;
begin
  inicio := public.iniciar_importacao_mms(
    'workflow-spec006.csv',
    'csv',
    'text/csv',
    123,
    date '2026-06-27',
    1
  );
  lote_uuid := (inicio ->> 'lote_id')::uuid;
  caminho := inicio ->> 'caminho';

  if lote_uuid is null or caminho is null then
    raise exception 'ASSERTION FAILED: reserva de lote/caminho ausente';
  end if;

  insert into storage.objects (bucket_id, name, owner_id, metadata)
  values (
    'mms-importacoes',
    caminho,
    auth.uid()::text,
    jsonb_build_object('size', 123, 'mimetype', 'text/csv')
  );

  perform public.registrar_arquivo_importacao_mms(lote_uuid);
  perform public.registrar_linhas_importacao_mms(
    lote_uuid,
    jsonb_build_array(jsonb_build_object(
      'numero_linha_origem', 2,
      'raw_json', jsonb_build_object(
        'Data', '27/06/26',
        'Área de Trabalho', 'Posto A',
        'Número da Assistência', 'AST-WORKFLOW-006',
        'Parte do Conjunto', 'PARTE-A',
        'Tipo de Atividade', 'Montagem em Conjunto',
        'Status da Atividade', 'Concluído',
        'Recurso', 'Montador Teste',
        'Cliente', 'Cliente Teste'
      )
    ))
  );

  previa := public.concluir_analise_importacao_mms(lote_uuid);
  if not coalesce((previa ->> 'pode_confirmar')::boolean, false) then
    raise exception 'ASSERTION FAILED: lote válido não ficou elegível: %', previa;
  end if;

  if not exists (
    select 1
    from public.mms_linhas_importacao
    where lote_importacao_id = lote_uuid
      and raw_json ? 'Área de Trabalho'
      and json_normalizado ->> 'area_trabalho' = 'Posto A'
      and raw_json is distinct from json_normalizado
  ) then
    raise exception 'ASSERTION FAILED: raw_json original/json_normalizado separados';
  end if;

  resultado := public.confirmar_importacao_mms(lote_uuid);
  if not coalesce((resultado ->> 'processado')::boolean, false) then
    raise exception 'ASSERTION FAILED: confirmação falhou: %', resultado;
  end if;

  repetido := public.confirmar_importacao_mms(lote_uuid);
  if repetido is distinct from resultado then
    raise exception 'ASSERTION FAILED: retry não retornou resultado imutável';
  end if;

  if (select count(*) from public.mms_assistencias where lote_ultimo_id = lote_uuid) <> 1
    or (select count(*) from public.mms_partes_assistencia where lote_ultimo_id = lote_uuid) <> 1 then
    raise exception 'ASSERTION FAILED: efeito operacional não é único';
  end if;
end
$$;

rollback;
