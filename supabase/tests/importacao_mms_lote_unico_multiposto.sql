begin;

create or replace function pg_temp.assert_true(cond boolean, msg text)
returns void
language plpgsql
as $$
begin
  if not coalesce(cond, false) then
    raise exception 'ASSERTION FAILED: %', msg;
  end if;
end
$$;

select set_config(
  'request.jwt.claim.sub',
  (
    select auth_user_id::text
    from public.usuarios
    where email = 'operador@doka.test'
      and ativo
      and deleted_at is null
    limit 1
  ),
  true
);
set local role authenticated;

do $$
declare
  inicio jsonb;
  previa jsonb;
  resultado jsonb;
  lote_uuid uuid;
  caminho text;
begin
  -- O operador de teste está vinculado apenas ao Posto A. Mesmo assim, a
  -- ingestão controlada deve resolver também o Posto B no mesmo lote.
  inicio := public.iniciar_importacao_mms(
    'multiposto-spec006.csv',
    'csv',
    'text/csv',
    456,
    date '2099-06-28',
    2
  );
  lote_uuid := (inicio ->> 'lote_id')::uuid;
  caminho := inicio ->> 'caminho';

  if not (
    select multiplos_postos and posto_id is null
    from public.mms_lotes_importacao
    where id = lote_uuid
  ) then
    raise exception 'ASSERTION FAILED: lote nao foi reservado como multi-posto';
  end if;

  insert into storage.objects (bucket_id, name, owner_id, metadata)
  values (
    'mms-importacoes',
    caminho,
    auth.uid()::text,
    jsonb_build_object('size', 456, 'mimetype', 'text/csv')
  );

  perform public.registrar_arquivo_importacao_mms(lote_uuid);
  perform public.registrar_linhas_importacao_mms(
    lote_uuid,
    jsonb_build_array(
      jsonb_build_object(
        'numero_linha_origem', 2,
        'raw_json', jsonb_build_object(
          'Data', '28/06/2099',
          'Área de Trabalho', 'Posto A',
          'Número da Assistência', 'AST-MULTI-A',
          'Parte do Conjunto', 'PARTE-A',
          'Tipo de Atividade', 'Montagem em Conjunto',
          'Status da Atividade', 'Concluído',
          'Recurso', 'Montador A'
        )
      ),
      jsonb_build_object(
        'numero_linha_origem', 3,
        'raw_json', jsonb_build_object(
          'Data', '28/06/2099',
          'Área de Trabalho', 'Posto B',
          'Número da Assistência', 'AST-MULTI-B',
          'Parte do Conjunto', 'PARTE-B',
          'Tipo de Atividade', 'Montagem em Conjunto',
          'Status da Atividade', 'Concluído',
          'Recurso', 'Montador B'
        )
      )
    )
  );

  if (
    select count(distinct posto_id)
    from public.mms_linhas_importacao
    where lote_importacao_id = lote_uuid
      and deleted_at is null
  ) <> 2 then
    raise exception 'ASSERTION FAILED: linhas nao foram resolvidas em dois postos';
  end if;

  previa := public.concluir_analise_importacao_mms(lote_uuid);
  if jsonb_array_length(previa -> 'postos') <> 2
    or not (previa ->> 'pode_confirmar')::boolean then
    raise exception 'ASSERTION FAILED: previa multi-posto incorreta: %', previa;
  end if;

  resultado := public.confirmar_importacao_mms(lote_uuid);
  if not coalesce((resultado ->> 'processado')::boolean, false)
    or jsonb_array_length(resultado -> 'postos') <> 2
    or coalesce((resultado ->> 'assistencias_criadas')::integer, 0) <> 2 then
    raise exception 'ASSERTION FAILED: resultado atomico multi-posto incorreto: %', resultado;
  end if;
end
$$;

rollback;
