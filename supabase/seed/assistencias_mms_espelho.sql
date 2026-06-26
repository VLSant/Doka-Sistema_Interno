-- Massa de validacao da Spec 04: Assistencias MMS espelho.
-- Execute apos fundacao_operacional_seed.sql e importacao_mms_staging.sql.

insert into public.mms_lotes_importacao (
  id, nome_origem, posto_id, data_atividade, usuario_importador_id, status,
  estado_processamento, created_by, updated_by
)
values
  (
    '94000000-0000-0000-0000-000000000001', 'espelho_posto_a_inicial.xlsx',
    '40000000-0000-0000-0000-000000000001', '2026-06-24',
    '30000000-0000-0000-0000-000000000002', 'importado', 'validado',
    '30000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002'
  ),
  (
    '94000000-0000-0000-0000-000000000002', 'espelho_posto_a_segundo.xlsx',
    '40000000-0000-0000-0000-000000000001', '2026-06-24',
    '30000000-0000-0000-0000-000000000002', 'importado', 'validado',
    '30000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002'
  ),
  (
    '94000000-0000-0000-0000-000000000003', 'espelho_posto_a_inelegivel.xlsx',
    '40000000-0000-0000-0000-000000000001', '2026-06-24',
    '30000000-0000-0000-0000-000000000002', 'erro', 'validado',
    '30000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002'
  ),
  (
    '94000000-0000-0000-0000-000000000004', 'espelho_posto_a_reaparece.xlsx',
    '40000000-0000-0000-0000-000000000001', '2026-06-24',
    '30000000-0000-0000-0000-000000000002', 'importado', 'validado',
    '30000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002'
  )
on conflict (id) do nothing;

insert into public.mms_linhas_importacao (
  id, lote_importacao_id, numero_linha_origem, raw_json, posto_id,
  data_atividade, numero_assistencia, parte_conjunto, estado_validacao,
  created_by, updated_by
)
values
  (
    '94100000-0000-0000-0000-000000000001', '94000000-0000-0000-0000-000000000001',
    1, '{"cliente_nome":"Cliente A","endereco":"Rua A","numero_assistencia":"ASS-100","parte_conjunto":"PC-01","descricao_mercadoria":"Modulo 1","recurso":"Equipe A","tipo_atividade":"Montagem","status_atividade":"Concluida"}',
    '40000000-0000-0000-0000-000000000001', '2026-06-24', 'ASS-100', 'PC-01', 'valida',
    '30000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002'
  ),
  (
    '94100000-0000-0000-0000-000000000002', '94000000-0000-0000-0000-000000000001',
    2, '{"cliente_nome":"Cliente A","endereco":"Rua A","numero_assistencia":"ASS-100","parte_conjunto":"PC-02","descricao_mercadoria":"Modulo 2","recurso":"Equipe B","tipo_atividade":"Montagem","status_atividade":"Concluida"}',
    '40000000-0000-0000-0000-000000000001', '2026-06-24', 'ASS-100', 'PC-02', 'valida',
    '30000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002'
  ),
  (
    '94100000-0000-0000-0000-000000000003', '94000000-0000-0000-0000-000000000002',
    1, '{"cliente_nome":"Cliente A MMS alterado","endereco":"Rua A 2","numero_assistencia":"ASS-100","parte_conjunto":"PC-01","descricao_mercadoria":"Modulo 1 alterado","recurso":"Equipe C","tipo_atividade":"Montagem","status_atividade":"Concluida"}',
    '40000000-0000-0000-0000-000000000001', '2026-06-24', 'ASS-100', 'PC-01', 'valida',
    '30000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002'
  ),
  (
    '94100000-0000-0000-0000-000000000004', '94000000-0000-0000-0000-000000000002',
    2, '{"cliente_nome":"Cliente A MMS alterado","endereco":"Rua A 2","numero_assistencia":"ASS-100","parte_conjunto":"PC-03","descricao_mercadoria":"Modulo 3","recurso":"Equipe D","tipo_atividade":"Montagem","status_atividade":"Concluida"}',
    '40000000-0000-0000-0000-000000000001', '2026-06-24', 'ASS-100', 'PC-03', 'valida',
    '30000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002'
  ),
  (
    '94100000-0000-0000-0000-000000000005', '94000000-0000-0000-0000-000000000003',
    1, '{"cliente_nome":"Cliente A","numero_assistencia":"ASS-100","parte_conjunto":"PC-01"}',
    '40000000-0000-0000-0000-000000000001', '2026-06-24', 'ASS-100', 'PC-01', 'invalida',
    '30000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002'
  ),
  (
    '94100000-0000-0000-0000-000000000006', '94000000-0000-0000-0000-000000000004',
    1, '{"cliente_nome":"Cliente A reaparece","endereco":"Rua A 3","numero_assistencia":"ASS-100","parte_conjunto":"PC-02","descricao_mercadoria":"Modulo 2 reaparece","recurso":"Equipe E","tipo_atividade":"Montagem","status_atividade":"Concluida"}',
    '40000000-0000-0000-0000-000000000001', '2026-06-24', 'ASS-100', 'PC-02', 'valida',
    '30000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002'
  )
on conflict (id) do nothing;

select app_private.mms_recalcular_totais_lote('94000000-0000-0000-0000-000000000001');
select app_private.mms_recalcular_totais_lote('94000000-0000-0000-0000-000000000002');
select app_private.mms_recalcular_totais_lote('94000000-0000-0000-0000-000000000003');
select app_private.mms_recalcular_totais_lote('94000000-0000-0000-0000-000000000004');
