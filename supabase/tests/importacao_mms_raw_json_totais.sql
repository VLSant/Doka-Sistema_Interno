-- Validacoes manuais de raw_json, campos candidatos, status e totais.

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

insert into public.mms_lotes_importacao (
  id, nome_origem, posto_id, data_atividade, usuario_importador_id,
  estado_processamento, created_by, updated_by
)
values (
  '90000000-0000-0000-0000-000000000201', 'totais_mms.xlsx',
  '40000000-0000-0000-0000-000000000001', '2026-06-20',
  '30000000-0000-0000-0000-000000000002', 'processando',
  '30000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002'
);

insert into public.mms_linhas_importacao (
  id, lote_importacao_id, numero_linha_origem, raw_json, posto_id, data_atividade,
  numero_assistencia, parte_conjunto, estado_validacao, created_by, updated_by
)
values
  (
    '91000000-0000-0000-0000-000000000201', '90000000-0000-0000-0000-000000000201',
    1, '{"numero_assistencia":"A-301","parte_conjunto":"PC-01"}',
    '40000000-0000-0000-0000-000000000001', '2026-06-20', 'A-301', 'PC-01',
    'valida', '30000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002'
  ),
  (
    '91000000-0000-0000-0000-000000000202', '90000000-0000-0000-0000-000000000201',
    2, '{"numero_assistencia":"A-302","parte_conjunto":"PC-02"}',
    '40000000-0000-0000-0000-000000000001', '2026-06-20', 'A-302', 'PC-02',
    'valida_com_alerta', '30000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002'
  ),
  (
    '91000000-0000-0000-0000-000000000203', '90000000-0000-0000-0000-000000000201',
    3, '{"numero_assistencia":"","parte_conjunto":"PC-03"}',
    '40000000-0000-0000-0000-000000000001', '2026-06-20', null, 'PC-03',
    'invalida', '30000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002'
  ),
  (
    '91000000-0000-0000-0000-000000000204', '90000000-0000-0000-0000-000000000201',
    4, '{"linha":"cabecalho"}',
    null, null, null, null,
    'ignorada', '30000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002'
  );

do $$
begin
  update public.mms_linhas_importacao
  set raw_json = '{"alterado":true}'::jsonb
  where id = '91000000-0000-0000-0000-000000000201';
  raise exception 'ASSERTION FAILED: update de raw_json deveria falhar';
exception
  when raise_exception then
    null;
end
$$;

insert into public.mms_alertas_importacao (
  lote_importacao_id, linha_importacao_id, campo, codigo, mensagem, created_by
)
values (
  '90000000-0000-0000-0000-000000000201',
  '91000000-0000-0000-0000-000000000202',
  'observacao', 'ALERTA_TESTE', 'Alerta rastreavel de teste',
  '30000000-0000-0000-0000-000000000002'
);

insert into public.mms_erros_importacao (
  lote_importacao_id, linha_importacao_id, campo, codigo, mensagem, created_by
)
values (
  '90000000-0000-0000-0000-000000000201',
  '91000000-0000-0000-0000-000000000203',
  'numero_assistencia', 'NUMERO_ASSISTENCIA_AUSENTE', 'Numero ausente',
  '30000000-0000-0000-0000-000000000002'
);

select app_private.mms_recalcular_totais_lote('90000000-0000-0000-0000-000000000201');

select pg_temp.assert_true(
  exists (
    select 1
    from public.mms_lotes_importacao
    where id = '90000000-0000-0000-0000-000000000201'
      and total_linhas = 4
      and total_linhas_validas = 3
      and total_linhas_com_erro = 1
      and total_linhas_com_alerta = 1
      and total_linhas_ignoradas = 1
      and status is null
      and estado_processamento = 'processando'
  ),
  'totais devem refletir linhas, erros, alertas e status nulo antes da conclusao'
);

select pg_temp.assert_true(
  exists (
    select 1
    from public.mms_linhas_importacao
    where id = '91000000-0000-0000-0000-000000000201'
      and posto_id = '40000000-0000-0000-0000-000000000001'
      and data_atividade = '2026-06-20'
      and numero_assistencia = 'A-301'
      and parte_conjunto = 'PC-01'
  ),
  'campos candidatos devem ser persistidos'
);

select app_private.mms_concluir_validacao_lote('90000000-0000-0000-0000-000000000201');

select pg_temp.assert_true(
  (select status = 'erro' and estado_processamento = 'validado'
   from public.mms_lotes_importacao
   where id = '90000000-0000-0000-0000-000000000201'),
  'lote com erro ativo deve concluir com status erro'
);

insert into public.mms_lotes_importacao (
  id, nome_origem, posto_id, usuario_importador_id, estado_processamento,
  created_by, updated_by
)
values (
  '90000000-0000-0000-0000-000000000202', 'somente_alertas.xlsx',
  '40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002',
  'processando', '30000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002'
);

insert into public.mms_linhas_importacao (
  id, lote_importacao_id, numero_linha_origem, raw_json, estado_validacao, created_by, updated_by
)
values (
  '91000000-0000-0000-0000-000000000205', '90000000-0000-0000-0000-000000000202',
  1, '{"numero_assistencia":"A-401"}', 'valida_com_alerta',
  '30000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002'
);

insert into public.mms_alertas_importacao (
  lote_importacao_id, linha_importacao_id, codigo, mensagem, created_by
)
values (
  '90000000-0000-0000-0000-000000000202',
  '91000000-0000-0000-0000-000000000205',
  'ALERTA_TESTE', 'Alerta sem erro',
  '30000000-0000-0000-0000-000000000002'
);

select app_private.mms_concluir_validacao_lote('90000000-0000-0000-0000-000000000202');

select pg_temp.assert_true(
  (select status = 'importado_com_alertas'
   from public.mms_lotes_importacao
   where id = '90000000-0000-0000-0000-000000000202'),
  'lote somente com alertas deve concluir como importado_com_alertas'
);

insert into public.mms_lotes_importacao (
  id, nome_origem, posto_id, usuario_importador_id, estado_processamento,
  created_by, updated_by
)
values (
  '90000000-0000-0000-0000-000000000203', 'sem_problemas.xlsx',
  '40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002',
  'processando', '30000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002'
);

insert into public.mms_linhas_importacao (
  lote_importacao_id, numero_linha_origem, raw_json, estado_validacao, created_by, updated_by
)
values (
  '90000000-0000-0000-0000-000000000203',
  1, '{"numero_assistencia":"A-501"}', 'valida',
  '30000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002'
);

select app_private.mms_concluir_validacao_lote('90000000-0000-0000-0000-000000000203');

select pg_temp.assert_true(
  (select status = 'importado'
   from public.mms_lotes_importacao
   where id = '90000000-0000-0000-0000-000000000203'),
  'lote sem erros ou alertas deve concluir como importado'
);

rollback;
