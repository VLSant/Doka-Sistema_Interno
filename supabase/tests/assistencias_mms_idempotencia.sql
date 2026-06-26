-- Validacoes manuais de idempotencia do espelho de assistencias MMS.

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
values (
  '95000000-0000-0000-0000-000000000001', 'teste_idempotencia.xlsx',
  '40000000-0000-0000-0000-000000000001', '2026-06-25',
  '30000000-0000-0000-0000-000000000002', 'importado', 'validado',
  '30000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002'
);

insert into public.mms_linhas_importacao (
  id, lote_importacao_id, numero_linha_origem, raw_json, posto_id,
  data_atividade, numero_assistencia, parte_conjunto, estado_validacao,
  created_by, updated_by
)
values
  (
    '95100000-0000-0000-0000-000000000001', '95000000-0000-0000-0000-000000000001',
    1, '{"cliente_nome":"Cliente ID","endereco":"Rua ID","descricao_mercadoria":"Parte A","recurso":"Equipe 1"}',
    '40000000-0000-0000-0000-000000000001', '2026-06-25', 'ID-100', 'PC-01', 'valida',
    '30000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002'
  ),
  (
    '95100000-0000-0000-0000-000000000002', '95000000-0000-0000-0000-000000000001',
    2, '{"cliente_nome":"Cliente ID","endereco":"Rua ID","descricao_mercadoria":"Parte B","recurso":"Equipe 2"}',
    '40000000-0000-0000-0000-000000000001', '2026-06-25', 'ID-100', 'PC-02', 'valida',
    '30000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002'
  );

select app_private.mms_recalcular_totais_lote('95000000-0000-0000-0000-000000000001');
select app_private.mms_processar_lote_assistencias('95000000-0000-0000-0000-000000000001');
select app_private.mms_processar_lote_assistencias('95000000-0000-0000-0000-000000000001');
select app_private.mms_processar_lote_assistencias('95000000-0000-0000-0000-000000000001');

select pg_temp.assert_true(
  (select count(*) = 1
   from public.mms_assistencias
   where posto_id = '40000000-0000-0000-0000-000000000001'
     and data_atividade = '2026-06-25'
     and numero_assistencia_normalizado = 'ID-100'),
  'duas partes do mesmo numero devem gerar uma assistencia principal'
);

select pg_temp.assert_true(
  (select count(*) = 2
   from public.mms_partes_assistencia p
   join public.mms_assistencias a on a.id = p.assistencia_id
   where a.numero_assistencia_normalizado = 'ID-100'
     and a.data_atividade = '2026-06-25'),
  'reprocessamento triplo nao deve duplicar partes'
);

do $$
declare
  assistencia_uuid uuid;
begin
  select id into assistencia_uuid
  from public.mms_assistencias
  where numero_assistencia_normalizado = 'ID-100'
    and data_atividade = '2026-06-25';

  insert into public.mms_assistencias (
    posto_id, data_atividade, numero_assistencia, numero_assistencia_normalizado,
    lote_criacao_id, lote_ultimo_id, raw_json_resumo, created_by, updated_by
  )
  values (
    '40000000-0000-0000-0000-000000000001', '2026-06-25', 'ID-100', 'ID-100',
    '95000000-0000-0000-0000-000000000001', '95000000-0000-0000-0000-000000000001',
    '{"duplicado":true}', '30000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002'
  );
  raise exception 'ASSERTION FAILED: insert direto de assistencia deveria falhar';
exception
  when insufficient_privilege then
    null;
end
$$;

do $$
declare
  assistencia_uuid uuid;
begin
  select id into assistencia_uuid
  from public.mms_assistencias
  where numero_assistencia_normalizado = 'ID-100'
    and data_atividade = '2026-06-25';

  insert into public.mms_partes_assistencia (
    assistencia_id, parte_conjunto, parte_conjunto_normalizada, lote_criacao_id,
    linha_criacao_id, lote_ultimo_id, linha_ultima_id, raw_json, created_by, updated_by
  )
  values (
    assistencia_uuid, 'PC-01', 'PC-01', '95000000-0000-0000-0000-000000000001',
    '95100000-0000-0000-0000-000000000001', '95000000-0000-0000-0000-000000000001',
    '95100000-0000-0000-0000-000000000001', '{"duplicado":true}',
    '30000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002'
  );
  raise exception 'ASSERTION FAILED: insert direto de parte deveria falhar';
exception
  when insufficient_privilege then
    null;
end
$$;

reset role;
rollback;
