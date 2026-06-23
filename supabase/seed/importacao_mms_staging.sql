-- Massa de validacao da Spec 03: Importacao MMS staging.
-- Execute apos supabase/seed/fundacao_operacional_seed.sql.

insert into public.mms_lotes_importacao (
  id,
  nome_origem,
  posto_id,
  data_atividade,
  usuario_importador_id,
  status,
  estado_processamento,
  created_by,
  updated_by
)
values
  (
    '90000000-0000-0000-0000-000000000001',
    'mms_posto_a_2026-06-20.xlsx',
    '40000000-0000-0000-0000-000000000001',
    '2026-06-20',
    '30000000-0000-0000-0000-000000000002',
    'importado',
    'validado',
    '30000000-0000-0000-0000-000000000002',
    '30000000-0000-0000-0000-000000000002'
  ),
  (
    '90000000-0000-0000-0000-000000000002',
    'mms_posto_a_alertas_2026-06-21.xlsx',
    '40000000-0000-0000-0000-000000000001',
    '2026-06-21',
    '30000000-0000-0000-0000-000000000002',
    'importado_com_alertas',
    'validado',
    '30000000-0000-0000-0000-000000000002',
    '30000000-0000-0000-0000-000000000002'
  ),
  (
    '90000000-0000-0000-0000-000000000003',
    'mms_posto_b_erros_2026-06-21.xlsx',
    '40000000-0000-0000-0000-000000000002',
    '2026-06-21',
    '30000000-0000-0000-0000-000000000002',
    'erro',
    'validado',
    '30000000-0000-0000-0000-000000000002',
    '30000000-0000-0000-0000-000000000002'
  ),
  (
    '90000000-0000-0000-0000-000000000004',
    'mms_posto_a_cancelado_2026-06-22.xlsx',
    '40000000-0000-0000-0000-000000000001',
    '2026-06-22',
    '30000000-0000-0000-0000-000000000002',
    'cancelado',
    'recebido',
    '30000000-0000-0000-0000-000000000002',
    '30000000-0000-0000-0000-000000000002'
  )
on conflict (id) do nothing;

insert into public.mms_linhas_importacao (
  id,
  lote_importacao_id,
  numero_linha_origem,
  raw_json,
  posto_id,
  data_atividade,
  numero_assistencia,
  parte_conjunto,
  estado_validacao,
  created_by,
  updated_by
)
values
  (
    '91000000-0000-0000-0000-000000000001',
    '90000000-0000-0000-0000-000000000001',
    2,
    '{"posto":"POSTO_A","data_atividade":"2026-06-20","numero_assistencia":"A-100","parte_conjunto":"PC-01","atividade":"montagem"}',
    '40000000-0000-0000-0000-000000000001',
    '2026-06-20',
    'A-100',
    'PC-01',
    'valida',
    '30000000-0000-0000-0000-000000000002',
    '30000000-0000-0000-0000-000000000002'
  ),
  (
    '91000000-0000-0000-0000-000000000002',
    '90000000-0000-0000-0000-000000000002',
    3,
    '{"posto":"POSTO_A","data_atividade":"2026-06-21","numero_assistencia":"A-101","parte_conjunto":"PC-02","observacao":"campo opcional inesperado"}',
    '40000000-0000-0000-0000-000000000001',
    '2026-06-21',
    'A-101',
    'PC-02',
    'valida_com_alerta',
    '30000000-0000-0000-0000-000000000002',
    '30000000-0000-0000-0000-000000000002'
  ),
  (
    '91000000-0000-0000-0000-000000000003',
    '90000000-0000-0000-0000-000000000003',
    4,
    '{"posto":"POSTO_B","data_atividade":"data invalida","numero_assistencia":"","parte_conjunto":"PC-03"}',
    '40000000-0000-0000-0000-000000000002',
    null,
    null,
    'PC-03',
    'invalida',
    '30000000-0000-0000-0000-000000000002',
    '30000000-0000-0000-0000-000000000002'
  )
on conflict (id) do nothing;

insert into public.mms_alertas_importacao (
  id,
  lote_importacao_id,
  linha_importacao_id,
  campo,
  codigo,
  mensagem,
  contexto,
  created_by
)
values (
  '92000000-0000-0000-0000-000000000001',
  '90000000-0000-0000-0000-000000000002',
  '91000000-0000-0000-0000-000000000002',
  'observacao',
  'CAMPO_OPCIONAL_INESPERADO',
  'Campo opcional nao mapeado foi preservado no raw_json.',
  '{"origem":"seed"}',
  '30000000-0000-0000-0000-000000000002'
)
on conflict (id) do nothing;

insert into public.mms_erros_importacao (
  id,
  lote_importacao_id,
  linha_importacao_id,
  campo,
  codigo,
  mensagem,
  contexto,
  created_by
)
values
  (
    '93000000-0000-0000-0000-000000000001',
    '90000000-0000-0000-0000-000000000003',
    '91000000-0000-0000-0000-000000000003',
    'data_atividade',
    'DATA_ATIVIDADE_INVALIDA',
    'Data de atividade nao pode ser resolvida a partir da linha MMS.',
    '{"valor_original":"data invalida"}',
    '30000000-0000-0000-0000-000000000002'
  ),
  (
    '93000000-0000-0000-0000-000000000002',
    '90000000-0000-0000-0000-000000000003',
    '91000000-0000-0000-0000-000000000003',
    'numero_assistencia',
    'NUMERO_ASSISTENCIA_AUSENTE',
    'Numero de assistencia nao foi encontrado na linha MMS.',
    '{"valor_original":""}',
    '30000000-0000-0000-0000-000000000002'
  )
on conflict (id) do nothing;

select app_private.mms_recalcular_totais_lote('90000000-0000-0000-0000-000000000001');
select app_private.mms_recalcular_totais_lote('90000000-0000-0000-0000-000000000002');
select app_private.mms_recalcular_totais_lote('90000000-0000-0000-0000-000000000003');
select app_private.mms_recalcular_totais_lote('90000000-0000-0000-0000-000000000004');
