begin;

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

create or replace function pg_temp.preparar_lote_duplicata(
  nome_arg text,
  linhas_arg jsonb
)
returns uuid
language plpgsql
as $$
declare
  inicio jsonb;
  lote_uuid uuid;
begin
  inicio := public.iniciar_importacao_mms(
    nome_arg,
    'csv',
    'text/csv',
    500,
    date '2099-06-29',
    jsonb_array_length(linhas_arg)
  );
  lote_uuid := (inicio ->> 'lote_id')::uuid;

  insert into storage.objects (bucket_id, name, owner_id, metadata)
  values (
    'mms-importacoes',
    inicio ->> 'caminho',
    auth.uid()::text,
    jsonb_build_object('size', 500, 'mimetype', 'text/csv')
  );

  perform public.registrar_arquivo_importacao_mms(lote_uuid);
  perform public.registrar_linhas_importacao_mms(lote_uuid, linhas_arg);
  return lote_uuid;
end
$$;

do $$
declare
  raw_equivalente jsonb;
  raw_conflitante jsonb;
  linhas jsonb;
  lote_uuid uuid;
  previa jsonb;
  resultado jsonb;
begin
  raw_equivalente := jsonb_build_object(
    'Data', '29/06/2099',
    'Área de Trabalho', 'Posto A',
    'Número da Assistência', 'AST-DUP-EQUIV',
    'Parte do Conjunto', 'PARTE-A',
    'Tipo de Atividade', 'Montagem em Conjunto',
    'Status da Atividade', 'Concluído',
    'Recurso', 'Montador A'
  );
  linhas := jsonb_build_array(
    jsonb_build_object('numero_linha_origem', 2, 'raw_json', raw_equivalente),
    jsonb_build_object('numero_linha_origem', 3, 'raw_json', raw_equivalente)
  );
  lote_uuid := pg_temp.preparar_lote_duplicata('duplicata-equivalente.csv', linhas);

  if (
    select count(*)
    from public.mms_linhas_importacao
    where lote_importacao_id = lote_uuid
      and deleted_at is null
  ) <> 1
    or (
      select total_linhas_esperadas
      from public.mms_lotes_importacao
      where id = lote_uuid
    ) <> 1
    or (
      select count(*)
      from public.mms_alertas_importacao
      where lote_importacao_id = lote_uuid
        and codigo = 'linha_duplicada_equivalente'
        and deleted_at is null
    ) <> 1 then
    raise exception 'ASSERTION FAILED: duplicata equivalente nao foi deduplicada';
  end if;

  -- O reenvio do mesmo bloco não pode reduzir novamente o total esperado.
  perform public.registrar_linhas_importacao_mms(lote_uuid, linhas);
  if (
    select total_linhas_esperadas
    from public.mms_lotes_importacao
    where id = lote_uuid
  ) <> 1
    or (
      select count(*)
      from public.mms_alertas_importacao
      where lote_importacao_id = lote_uuid
        and codigo = 'linha_duplicada_equivalente'
        and deleted_at is null
    ) <> 1 then
    raise exception 'ASSERTION FAILED: reenvio equivalente nao foi idempotente';
  end if;

  previa := public.concluir_analise_importacao_mms(lote_uuid);
  resultado := public.confirmar_importacao_mms(lote_uuid);
  if not (previa ->> 'pode_confirmar')::boolean
    or not (resultado ->> 'processado')::boolean
    or (resultado ->> 'assistencias_criadas')::integer <> 1 then
    raise exception 'ASSERTION FAILED: duplicata equivalente bloqueou ou duplicou espelho';
  end if;

  raw_conflitante := jsonb_build_object(
    'Data', '29/06/2099',
    'Área de Trabalho', 'Posto B',
    'Número da Assistência', 'AST-DUP-CONFLITO',
    'Parte do Conjunto', 'PARTE-B',
    'Tipo de Atividade', 'Montagem em Conjunto',
    'Status da Atividade', 'Concluído',
    'Recurso', 'Montador A'
  );
  linhas := jsonb_build_array(
    jsonb_build_object('numero_linha_origem', 2, 'raw_json', raw_conflitante),
    jsonb_build_object(
      'numero_linha_origem', 3,
      'raw_json', raw_conflitante || jsonb_build_object('Recurso', 'Montador B')
    )
  );
  lote_uuid := pg_temp.preparar_lote_duplicata('duplicata-conflitante.csv', linhas);
  previa := public.concluir_analise_importacao_mms(lote_uuid);

  if (previa ->> 'pode_confirmar')::boolean
    or (
      select count(*)
      from public.mms_erros_importacao
      where lote_importacao_id = lote_uuid
        and codigo = 'linha_duplicada_conflitante'
        and deleted_at is null
    ) <> 1 then
    raise exception 'ASSERTION FAILED: duplicata conflitante nao bloqueou o lote';
  end if;
end
$$;

rollback;
