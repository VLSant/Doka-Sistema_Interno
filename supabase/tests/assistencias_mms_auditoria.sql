-- Validacoes manuais de auditoria do espelho de assistencias MMS.

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
  ('97000000-0000-0000-0000-000000000001', 'auditoria_1.xlsx', '40000000-0000-0000-0000-000000000001', '2026-06-25', '30000000-0000-0000-0000-000000000002', 'importado', 'validado', '30000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002'),
  ('97000000-0000-0000-0000-000000000002', 'auditoria_2.xlsx', '40000000-0000-0000-0000-000000000001', '2026-06-25', '30000000-0000-0000-0000-000000000002', 'importado', 'validado', '30000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002'),
  ('97000000-0000-0000-0000-000000000003', 'auditoria_3.xlsx', '40000000-0000-0000-0000-000000000001', '2026-06-25', '30000000-0000-0000-0000-000000000002', 'importado', 'validado', '30000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002');

insert into public.mms_linhas_importacao (
  id, lote_importacao_id, numero_linha_origem, raw_json, posto_id,
  data_atividade, numero_assistencia, parte_conjunto, estado_validacao,
  created_by, updated_by
)
values
  ('97100000-0000-0000-0000-000000000001', '97000000-0000-0000-0000-000000000001', 1, '{"cliente_nome":"Auditoria","descricao_mercadoria":"A","recurso":"R1"}', '40000000-0000-0000-0000-000000000001', '2026-06-25', 'AUD-100', 'PC-01', 'valida', '30000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002'),
  ('97100000-0000-0000-0000-000000000002', '97000000-0000-0000-0000-000000000001', 2, '{"cliente_nome":"Auditoria","descricao_mercadoria":"B","recurso":"R2"}', '40000000-0000-0000-0000-000000000001', '2026-06-25', 'AUD-100', 'PC-02', 'valida', '30000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002'),
  ('97100000-0000-0000-0000-000000000003', '97000000-0000-0000-0000-000000000002', 1, '{"cliente_nome":"Auditoria alterada","descricao_mercadoria":"A2","recurso":"R3"}', '40000000-0000-0000-0000-000000000001', '2026-06-25', 'AUD-100', 'PC-01', 'valida', '30000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002'),
  ('97100000-0000-0000-0000-000000000004', '97000000-0000-0000-0000-000000000003', 1, '{"cliente_nome":"Auditoria retorno","descricao_mercadoria":"B2","recurso":"R4"}', '40000000-0000-0000-0000-000000000001', '2026-06-25', 'AUD-100', 'PC-02', 'valida', '30000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002');

select app_private.mms_recalcular_totais_lote('97000000-0000-0000-0000-000000000001');
select app_private.mms_recalcular_totais_lote('97000000-0000-0000-0000-000000000002');
select app_private.mms_recalcular_totais_lote('97000000-0000-0000-0000-000000000003');

select app_private.mms_processar_lote_assistencias('97000000-0000-0000-0000-000000000001');
select app_private.mms_processar_lote_assistencias('97000000-0000-0000-0000-000000000002');

select app_private.mms_corrigir_assistencia(
  (select id from public.mms_assistencias where numero_assistencia_normalizado = 'AUD-100'),
  'cliente_nome',
  'Cliente corrigido',
  'teste auditoria correcao'
);

select app_private.mms_processar_lote_assistencias('97000000-0000-0000-0000-000000000003');

select pg_temp.assert_true(
  exists (select 1 from public.historico_auditoria where entidade_tipo = 'mms_assistencias' and acao = 'criado' and metadata ->> 'numero_assistencia' = 'AUD-100'),
  'criacao de assistencia deve auditar'
);
select pg_temp.assert_true(
  exists (select 1 from public.historico_auditoria where entidade_tipo = 'mms_partes_assistencia' and acao = 'criado' and metadata ->> 'parte_conjunto' = 'PC-01'),
  'criacao de parte deve auditar'
);
select pg_temp.assert_true(
  exists (select 1 from public.historico_auditoria where entidade_tipo = 'mms_partes_assistencia' and acao = 'atualizado_por_importacao' and metadata ->> 'linha_importacao_id' = '97100000-0000-0000-0000-000000000003'),
  'alteracao por importacao deve auditar'
);
select pg_temp.assert_true(
  exists (select 1 from public.historico_auditoria where entidade_tipo = 'mms_assistencias' and acao = 'corrigido' and metadata ->> 'motivo' = 'teste auditoria correcao'),
  'correcao deve auditar motivo'
);
select pg_temp.assert_true(
  exists (select 1 from public.historico_auditoria where entidade_tipo = 'mms_partes_assistencia' and acao = 'marcado_removido' and metadata ->> 'lote_importacao_id' = '97000000-0000-0000-0000-000000000002'),
  'marcacao removido deve auditar lote causador'
);
select pg_temp.assert_true(
  exists (select 1 from public.historico_auditoria where entidade_tipo = 'mms_partes_assistencia' and acao = 'reativado_por_importacao' and metadata ->> 'lote_importacao_id' = '97000000-0000-0000-0000-000000000003'),
  'reativacao deve auditar lote causador'
);

do $$
begin
  perform app_private.mms_corrigir_assistencia(
    (select id from public.mms_assistencias where numero_assistencia_normalizado = 'AUD-100'),
    'campo_invalido',
    'x',
    'bloqueado'
  );
exception
  when raise_exception then
    null;
end
$$;

select pg_temp.assert_true(
  not exists (select 1 from public.historico_auditoria where metadata ->> 'motivo' = 'bloqueado' and acao = 'corrigido'),
  'operacao bloqueada nao deve gerar auditoria de sucesso'
);

reset role;
rollback;
