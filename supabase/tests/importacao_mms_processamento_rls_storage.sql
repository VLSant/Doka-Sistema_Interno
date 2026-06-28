begin;

create or replace function pg_temp.assert_true(cond boolean, msg text)
returns void language plpgsql as $$
begin
  if not coalesce(cond, false) then raise exception 'ASSERTION FAILED: %', msg; end if;
end $$;

select pg_temp.assert_true(
  (
    select not public
      and file_size_limit = 26214400
      and allowed_mime_types @> array[
        'text/csv',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ]
    from storage.buckets
    where id = 'mms-importacoes'
  ),
  'bucket MMS deve ser privado e limitado a CSV/XLSX de 25 MiB'
);
select pg_temp.assert_true(
  has_table_privilege('authenticated', 'public.mms_linhas_importacao', 'SELECT')
  and not has_table_privilege('authenticated', 'public.mms_linhas_importacao', 'INSERT')
  and not has_table_privilege('authenticated', 'public.mms_linhas_importacao', 'UPDATE'),
  'staging deve permitir leitura e negar escrita direta'
);
select pg_temp.assert_true(
  exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'mms_linhas_importacao'
      and column_name = 'json_normalizado'
  ),
  'json_normalizado deve existir separado do raw_json'
);
select pg_temp.assert_true(
  (select relrowsecurity from pg_class where oid = 'public.mms_lotes_importacao'::regclass)
  and (select relrowsecurity from pg_class where oid = 'public.mms_linhas_importacao'::regclass)
  and (select relrowsecurity from pg_class where oid = 'public.mms_erros_importacao'::regclass)
  and (select relrowsecurity from pg_class where oid = 'public.mms_alertas_importacao'::regclass),
  'todas as tabelas do workflow devem manter RLS'
);
select pg_temp.assert_true(
  exists (
    select 1
    from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'mms_importacoes_insert'
      and cmd = 'INSERT'
      and with_check ilike '%auth.uid()%'
  )
  and exists (
    select 1
    from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'mms_importacoes_select'
      and cmd = 'SELECT'
  ),
  'Storage deve restringir upload ao caminho reservado e leitura ao lote'
);
select pg_temp.assert_true(
  not exists (
    select 1
    from public.mms_lotes_importacao
    where caminho_arquivo is not null
      and (
        bucket_arquivo is null
        or extensao_arquivo is null
        or mime_type_arquivo is null
        or tamanho_arquivo_bytes is null
        or total_linhas_esperadas < 1
      )
  ),
  'lotes Spec 006 devem ter metadados completos sem inventar metadados legados'
);
select pg_temp.assert_true(
  exists (
    select 1 from pg_trigger
    where tgname = 'mms_linhas_bloquear_evidencia_spec006'
      and not tgisinternal
  ),
  'raw_json e json_normalizado devem ser imutaveis'
);
select pg_temp.assert_true(
  not has_function_privilege('anon', 'public.iniciar_importacao_mms(text,text,text,bigint,text,date,integer)', 'EXECUTE')
  and has_function_privilege('authenticated', 'public.iniciar_importacao_mms(text,text,text,bigint,text,date,integer)', 'EXECUTE'),
  'somente authenticated pode iniciar importacao'
);

rollback;
