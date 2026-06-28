begin;

create or replace function pg_temp.assert_true(cond boolean, msg text)
returns void language plpgsql as $$
begin
  if not coalesce(cond, false) then raise exception 'ASSERTION FAILED: %', msg; end if;
end $$;

select pg_temp.assert_true(
  exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'mms_lotes_importacao'
      and column_name = 'resultado_processamento' and data_type = 'jsonb'
  ),
  'resultado imutavel deve ser persistido no lote'
);
select pg_temp.assert_true(
  exists (
    select 1 from pg_indexes
    where schemaname = 'public' and tablename = 'mms_linhas_importacao'
      and indexdef ilike '%lote_importacao_id%numero_linha_origem%'
  ),
  'linha deve ser idempotente por lote e numero de origem'
);

create or replace function pg_temp.mms_linha_reimportacao(
  numero_linha integer,
  numero_assistencia text,
  parte text,
  recurso text
)
returns jsonb
language sql
as $$
  select jsonb_build_object(
    'numero_linha_origem', numero_linha,
    'raw_json', jsonb_build_object(
      'Data', '25/06/2099',
      'Área de Trabalho', 'Posto A',
      'Número da Assistência', numero_assistencia,
      'Parte do Conjunto', parte,
      'Tipo de Atividade', 'Montagem em Conjunto',
      'Status da Atividade', 'Concluído',
      'Recurso', recurso,
      'Cliente', 'Cliente Reimportação'
    )
  )
$$;

create or replace function pg_temp.executar_reimportacao(linhas jsonb)
returns jsonb
language plpgsql
as $$
declare
  inicio jsonb;
  lote_uuid uuid;
  caminho text;
  previa jsonb;
begin
  inicio := public.iniciar_importacao_mms(
    'reimportacao-' || gen_random_uuid()::text || '.csv',
    'csv',
    'text/csv',
    321,
    date '2099-06-25',
    jsonb_array_length(linhas)
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
  perform public.registrar_linhas_importacao_mms(lote_uuid, linhas);
  previa := public.concluir_analise_importacao_mms(lote_uuid);
  if not coalesce((previa ->> 'pode_confirmar')::boolean, false) then
    raise exception 'ASSERTION FAILED: reimportacao invalida: %', previa;
  end if;
  return public.confirmar_importacao_mms(lote_uuid);
end
$$;

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
  primeira jsonb;
  identica jsonb;
  terceira_identica jsonb;
  alterada jsonb;
  reativada jsonb;
begin
  primeira := pg_temp.executar_reimportacao(jsonb_build_array(
    pg_temp.mms_linha_reimportacao(2, 'AST-REIMP-A', 'PARTE-1', 'Montador 1'),
    pg_temp.mms_linha_reimportacao(3, 'AST-REIMP-A', 'PARTE-2', 'Montador 2'),
    pg_temp.mms_linha_reimportacao(4, 'AST-REIMP-B', 'PARTE-1', 'Montador 3')
  ));
  if (primeira ->> 'assistencias_criadas')::integer <> 2
    or (primeira ->> 'partes_criadas')::integer <> 3 then
    raise exception 'ASSERTION FAILED: primeira importacao: %', primeira;
  end if;

  identica := pg_temp.executar_reimportacao(jsonb_build_array(
    pg_temp.mms_linha_reimportacao(2, 'AST-REIMP-A', 'PARTE-1', 'Montador 1'),
    pg_temp.mms_linha_reimportacao(3, 'AST-REIMP-A', 'PARTE-2', 'Montador 2'),
    pg_temp.mms_linha_reimportacao(4, 'AST-REIMP-B', 'PARTE-1', 'Montador 3')
  ));
  if (identica ->> 'assistencias_preservadas')::integer <> 2
    or (identica ->> 'partes_preservadas')::integer <> 3
    or (identica ->> 'assistencias_criadas')::integer <> 0
    or (identica ->> 'partes_criadas')::integer <> 0 then
    raise exception 'ASSERTION FAILED: reimportacao identica: %', identica;
  end if;

  terceira_identica := pg_temp.executar_reimportacao(jsonb_build_array(
    pg_temp.mms_linha_reimportacao(2, 'AST-REIMP-A', 'PARTE-1', 'Montador 1'),
    pg_temp.mms_linha_reimportacao(3, 'AST-REIMP-A', 'PARTE-2', 'Montador 2'),
    pg_temp.mms_linha_reimportacao(4, 'AST-REIMP-B', 'PARTE-1', 'Montador 3')
  ));
  if (terceira_identica ->> 'assistencias_preservadas')::integer <> 2
    or (terceira_identica ->> 'partes_preservadas')::integer <> 3
    or (terceira_identica ->> 'assistencias_criadas')::integer <> 0
    or (terceira_identica ->> 'partes_criadas')::integer <> 0 then
    raise exception 'ASSERTION FAILED: terceira importacao identica: %', terceira_identica;
  end if;

  alterada := pg_temp.executar_reimportacao(jsonb_build_array(
    pg_temp.mms_linha_reimportacao(2, 'AST-REIMP-A', 'PARTE-1', 'Montador alterado'),
    pg_temp.mms_linha_reimportacao(3, 'AST-REIMP-C', 'PARTE-1', 'Montador novo')
  ));
  if (alterada ->> 'assistencias_criadas')::integer <> 1
    or (alterada ->> 'partes_criadas')::integer <> 1
    or (alterada ->> 'partes_atualizadas')::integer <> 1
    or (alterada ->> 'assistencias_removidas')::integer <> 1
    or (alterada ->> 'partes_removidas')::integer <> 2 then
    raise exception 'ASSERTION FAILED: chaves alteradas/novas/ausentes: %', alterada;
  end if;

  reativada := pg_temp.executar_reimportacao(jsonb_build_array(
    pg_temp.mms_linha_reimportacao(2, 'AST-REIMP-A', 'PARTE-1', 'Montador alterado'),
    pg_temp.mms_linha_reimportacao(3, 'AST-REIMP-A', 'PARTE-2', 'Montador 2'),
    pg_temp.mms_linha_reimportacao(4, 'AST-REIMP-B', 'PARTE-1', 'Montador 3')
  ));
  if (reativada ->> 'assistencias_reativadas')::integer <> 1
    or (reativada ->> 'partes_reativadas')::integer <> 2
    or (reativada ->> 'assistencias_removidas')::integer <> 1
    or (reativada ->> 'partes_removidas')::integer <> 1 then
    raise exception 'ASSERTION FAILED: reativacao/remocao: %', reativada;
  end if;

  if exists (
    select 1
    from public.mms_assistencias a
    join public.mms_partes_assistencia p on p.assistencia_id = a.id
    where a.data_atividade = date '2099-06-25'
    group by a.posto_id, a.data_atividade, a.numero_assistencia_normalizado,
      p.parte_conjunto_normalizada
    having count(*) > 1
  ) then
    raise exception 'ASSERTION FAILED: chave completa duplicada';
  end if;
end
$$;

rollback;
