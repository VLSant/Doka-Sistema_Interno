-- Validacoes manuais de removido, reativacao, raw_json e correcoes MMS.

begin;

create or replace function pg_temp.assert_true(cond boolean, msg text)
returns void
language plpgsql
as $$
begin
  if not coalesce(cond, false) then
    raise exception 'ASSERTION FAILED: %', msg;
  end if;
end;
$$;

set role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000002', true);

insert into public.mms_lotes_importacao (
  id, nome_origem, posto_id, data_atividade, usuario_importador_id, status,
  estado_processamento, created_by, updated_by
)
values
  ('98000000-0000-0000-0000-000000000001', 'removido_1.xlsx', '40000000-0000-0000-0000-000000000001', '2026-06-25', '30000000-0000-0000-0000-000000000002', 'importado', 'validado', '30000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002'),
  ('98000000-0000-0000-0000-000000000002', 'removido_2.xlsx', '40000000-0000-0000-0000-000000000001', '2026-06-25', '30000000-0000-0000-0000-000000000002', 'importado', 'validado', '30000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002'),
  ('98000000-0000-0000-0000-000000000003', 'removido_erro.xlsx', '40000000-0000-0000-0000-000000000001', '2026-06-25', '30000000-0000-0000-0000-000000000002', 'erro', 'validado', '30000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002'),
  ('98000000-0000-0000-0000-000000000004', 'removido_retorno.xlsx', '40000000-0000-0000-0000-000000000001', '2026-06-25', '30000000-0000-0000-0000-000000000002', 'importado', 'validado', '30000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002');

insert into public.mms_linhas_importacao (
  id, lote_importacao_id, numero_linha_origem, raw_json, posto_id,
  data_atividade, numero_assistencia, parte_conjunto, estado_validacao,
  created_by, updated_by
)
values
  ('98100000-0000-0000-0000-000000000001', '98000000-0000-0000-0000-000000000001', 1, '{"cliente_nome":"Raw Cliente","endereco":"Rua Raw","descricao_mercadoria":"Mercadoria A","recurso":"Recurso A"}', '40000000-0000-0000-0000-000000000001', '2026-06-25', 'RAW-100', 'PC-01', 'valida', '30000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002'),
  ('98100000-0000-0000-0000-000000000002', '98000000-0000-0000-0000-000000000001', 2, '{"cliente_nome":"Raw Cliente","endereco":"Rua Raw","descricao_mercadoria":"Mercadoria B","recurso":"Recurso B"}', '40000000-0000-0000-0000-000000000001', '2026-06-25', 'RAW-100', 'PC-02', 'valida', '30000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002'),
  ('98100000-0000-0000-0000-000000000003', '98000000-0000-0000-0000-000000000002', 1, '{"cliente_nome":"Raw Cliente MMS 2","endereco":"Rua Raw 2","descricao_mercadoria":"Mercadoria A MMS 2","recurso":"Recurso A MMS 2"}', '40000000-0000-0000-0000-000000000001', '2026-06-25', 'RAW-100', 'PC-01', 'valida', '30000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002'),
  ('98100000-0000-0000-0000-000000000004', '98000000-0000-0000-0000-000000000003', 1, '{"cliente_nome":"Erro","descricao_mercadoria":"Erro"}', '40000000-0000-0000-0000-000000000001', '2026-06-25', 'RAW-100', 'PC-01', 'invalida', '30000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002'),
  ('98100000-0000-0000-0000-000000000005', '98000000-0000-0000-0000-000000000004', 1, '{"cliente_nome":"Raw Cliente MMS 3","endereco":"Rua Raw 3","descricao_mercadoria":"Mercadoria B retorno","recurso":"Recurso B retorno"}', '40000000-0000-0000-0000-000000000001', '2026-06-25', 'RAW-100', 'PC-02', 'valida', '30000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002');

select app_private.mms_recalcular_totais_lote('98000000-0000-0000-0000-000000000001');
select app_private.mms_recalcular_totais_lote('98000000-0000-0000-0000-000000000002');
select app_private.mms_recalcular_totais_lote('98000000-0000-0000-0000-000000000003');
select app_private.mms_recalcular_totais_lote('98000000-0000-0000-0000-000000000004');

select app_private.mms_processar_lote_assistencias('98000000-0000-0000-0000-000000000001');

select pg_temp.assert_true(
  (select count(*) = 1 from public.mms_assistencias where numero_assistencia_normalizado = 'RAW-100' and raw_json_resumo is not null),
  'assistencia deve ter campos minimos e raw_json_resumo'
);
select pg_temp.assert_true(
  (select (raw_json_resumo ->> 'total_partes_lote')::integer = 2
   from public.mms_assistencias
   where numero_assistencia_normalizado = 'RAW-100'),
  'raw_json_resumo deve consolidar as partes elegiveis do servico no lote'
);
select pg_temp.assert_true(
  (select count(*) = 2 from public.mms_partes_assistencia where raw_json is not null),
  'partes devem ter campos minimos e raw_json'
);

select public.corrigir_campo_assistencia_mms(
  'assistencia',
  (select id from public.mms_assistencias where numero_assistencia_normalizado = 'RAW-100'),
  'cliente_nome',
  'Cliente Corrigido',
  'teste correcao',
  (select versao_registro from public.mms_assistencias where numero_assistencia_normalizado = 'RAW-100')
);
select public.corrigir_campo_assistencia_mms(
  'parte',
  (select p.id from public.mms_partes_assistencia p join public.mms_assistencias a on a.id = p.assistencia_id where a.numero_assistencia_normalizado = 'RAW-100' and p.parte_conjunto_normalizada = 'PC-01'),
  'descricao_mercadoria',
  'Mercadoria Corrigida',
  'teste correcao parte',
  (select p.versao_registro from public.mms_partes_assistencia p join public.mms_assistencias a on a.id = p.assistencia_id where a.numero_assistencia_normalizado = 'RAW-100' and p.parte_conjunto_normalizada = 'PC-01')
);

select app_private.mms_processar_lote_assistencias('98000000-0000-0000-0000-000000000002');

select pg_temp.assert_true(
  (select cliente_nome = 'Cliente Corrigido' and cliente_nome_importado = 'Raw Cliente MMS 2' from public.mms_assistencias_operacionais where numero_assistencia_normalizado = 'RAW-100'),
  'valor visivel da assistencia deve priorizar correcao sem apagar importado'
);
select pg_temp.assert_true(
  (select descricao_mercadoria = 'Mercadoria Corrigida' and descricao_mercadoria_importada = 'Mercadoria A MMS 2'
   from public.mms_partes_assistencia_operacionais p
   join public.mms_assistencias a on a.id = p.assistencia_id
   where a.numero_assistencia_normalizado = 'RAW-100' and p.parte_conjunto_normalizada = 'PC-01'),
  'valor visivel da parte deve priorizar correcao sem apagar importado'
);
select pg_temp.assert_true(
  exists (
    select 1
    from public.mms_partes_assistencia p
    join public.mms_assistencias a on a.id = p.assistencia_id
    where a.numero_assistencia_normalizado = 'RAW-100'
      and p.parte_conjunto_normalizada = 'PC-02'
      and p.status_interno = 'removido'
  ),
  'parte ausente em lote elegivel deve virar removido'
);

select app_private.mms_processar_lote_assistencias('98000000-0000-0000-0000-000000000003');
select pg_temp.assert_true(
  exists (
    select 1
    from public.mms_partes_assistencia p
    join public.mms_assistencias a on a.id = p.assistencia_id
    where a.numero_assistencia_normalizado = 'RAW-100'
      and p.parte_conjunto_normalizada = 'PC-02'
      and p.status_interno = 'removido'
      and p.removido_lote_id = '98000000-0000-0000-0000-000000000002'
  ),
  'lote inelegivel nao deve remarcar removido'
);

select app_private.mms_processar_lote_assistencias('98000000-0000-0000-0000-000000000004');
select pg_temp.assert_true(
  exists (
    select 1
    from public.mms_partes_assistencia p
    join public.mms_assistencias a on a.id = p.assistencia_id
    where a.numero_assistencia_normalizado = 'RAW-100'
      and p.parte_conjunto_normalizada = 'PC-02'
      and p.status_interno = 'ativo'
  ),
  'parte removida deve reativar quando reaparece'
);

do $$
begin
  perform set_config('app.mms_assistencias_importacao', 'on', true);

  update public.mms_partes_assistencia
  set raw_json = '{"tentativa":"alterar"}'
  where id = (
    select p.id
    from public.mms_partes_assistencia p
    join public.mms_assistencias a on a.id = p.assistencia_id
    where a.numero_assistencia_normalizado = 'RAW-100'
    limit 1
  );
  raise exception 'ASSERTION FAILED: update direto de raw_json deveria falhar mesmo com flag local';
exception
  when insufficient_privilege or raise_exception then
    perform set_config('app.mms_assistencias_importacao', 'off', true);
    null;
end
$$;

do $$
begin
  perform set_config('app.mms_assistencias_importacao', 'on', true);

  update public.mms_assistencias
  set raw_json_resumo = '{"tentativa":"alterar"}'
  where numero_assistencia_normalizado = 'RAW-100';
  raise exception 'ASSERTION FAILED: update direto de raw_json_resumo deveria falhar mesmo com flag local';
exception
  when insufficient_privilege or raise_exception then
    perform set_config('app.mms_assistencias_importacao', 'off', true);
    null;
end
$$;

do $$
begin
  perform public.corrigir_campo_assistencia_mms(
    'parte',
    (select p.id from public.mms_partes_assistencia p join public.mms_assistencias a on a.id = p.assistencia_id where a.numero_assistencia_normalizado = 'RAW-100' limit 1),
    'codigo_mercadoria',
    'X',
    'fora allowlist',
    (select p.versao_registro from public.mms_partes_assistencia p join public.mms_assistencias a on a.id = p.assistencia_id where a.numero_assistencia_normalizado = 'RAW-100' limit 1)
  );
  raise exception 'ASSERTION FAILED: campo fora da allowlist deveria falhar';
exception
  when invalid_parameter_value then
    null;
end
$$;

reset role;
rollback;
