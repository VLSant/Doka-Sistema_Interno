-- Validacoes manuais de RLS do espelho de assistencias MMS.

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
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000003', true);

insert into public.mms_lotes_importacao (
  id, nome_origem, posto_id, data_atividade, usuario_importador_id, status,
  estado_processamento, created_by, updated_by
)
values
  (
    '96000000-0000-0000-0000-000000000001', 'rls_a.xlsx',
    '40000000-0000-0000-0000-000000000001', '2026-06-25',
    '30000000-0000-0000-0000-000000000003', 'importado', 'validado',
    '30000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000003'
  ),
  (
    '96000000-0000-0000-0000-000000000002', 'rls_b.xlsx',
    '40000000-0000-0000-0000-000000000002', '2026-06-25',
    '30000000-0000-0000-0000-000000000003', 'importado', 'validado',
    '30000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000003'
  ),
  (
    '96000000-0000-0000-0000-000000000003', 'rls_c.xlsx',
    '40000000-0000-0000-0000-000000000003', '2026-06-25',
    '30000000-0000-0000-0000-000000000003', 'importado', 'validado',
    '30000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000003'
  );

insert into public.mms_linhas_importacao (
  id, lote_importacao_id, numero_linha_origem, raw_json, posto_id,
  data_atividade, numero_assistencia, parte_conjunto, estado_validacao,
  created_by, updated_by
)
values
  ('96100000-0000-0000-0000-000000000001', '96000000-0000-0000-0000-000000000001', 1, '{"cliente_nome":"A","descricao_mercadoria":"A"}', '40000000-0000-0000-0000-000000000001', '2026-06-25', 'RLS-A', 'PC-01', 'valida', '30000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000003'),
  ('96100000-0000-0000-0000-000000000002', '96000000-0000-0000-0000-000000000002', 1, '{"cliente_nome":"B","descricao_mercadoria":"B"}', '40000000-0000-0000-0000-000000000002', '2026-06-25', 'RLS-B', 'PC-01', 'valida', '30000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000003'),
  ('96100000-0000-0000-0000-000000000003', '96000000-0000-0000-0000-000000000003', 1, '{"cliente_nome":"C","descricao_mercadoria":"C"}', '40000000-0000-0000-0000-000000000003', '2026-06-25', 'RLS-C', 'PC-01', 'valida', '30000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000003');

select app_private.mms_recalcular_totais_lote('96000000-0000-0000-0000-000000000001');
select app_private.mms_recalcular_totais_lote('96000000-0000-0000-0000-000000000002');
select app_private.mms_recalcular_totais_lote('96000000-0000-0000-0000-000000000003');
select app_private.mms_processar_lote_assistencias('96000000-0000-0000-0000-000000000001');
select app_private.mms_processar_lote_assistencias('96000000-0000-0000-0000-000000000002');
select app_private.mms_processar_lote_assistencias('96000000-0000-0000-0000-000000000003');

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000004', true);
select pg_temp.assert_true((select count(*) = 0 from public.mms_assistencias), 'usuario sem perfil nao acessa assistencias');
select pg_temp.assert_true((select count(*) = 0 from public.mms_partes_assistencia), 'usuario sem perfil nao acessa partes');

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000001', true);
select pg_temp.assert_true((select count(*) = 1 from public.mms_assistencias where numero_assistencia_normalizado = 'RLS-A'), 'operador ve posto A');
select pg_temp.assert_true((select count(*) = 0 from public.mms_assistencias where numero_assistencia_normalizado = 'RLS-B'), 'operador nao ve posto B');
select pg_temp.assert_true((select count(*) = 1 from public.mms_partes_assistencia), 'operador ve apenas partes acessiveis');

do $$
begin
  update public.mms_assistencias
  set cliente_nome_corrigido = 'DML direto'
  where numero_assistencia_normalizado = 'RLS-A';
  raise exception 'ASSERTION FAILED: update direto em mms_assistencias deveria falhar';
exception
  when insufficient_privilege then
    null;
end
$$;

do $$
declare
  alvo uuid;
begin
  set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000003';
  select id into alvo from public.mms_assistencias where numero_assistencia_normalizado = 'RLS-B';
  set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000001';
  perform app_private.mms_corrigir_assistencia(alvo, 'cliente_nome', 'Bloqueado', 'teste fora de escopo');
  raise exception 'ASSERTION FAILED: correcao fora do escopo deveria falhar';
exception
  when insufficient_privilege then
    null;
end
$$;

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000002', true);
select pg_temp.assert_true((select count(*) = 2 from public.mms_assistencias), 'supervisao ve postos A e B');
select pg_temp.assert_true((select count(*) = 0 from public.mms_assistencias where numero_assistencia_normalizado = 'RLS-C'), 'supervisao nao ve posto C');

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000003', true);
select pg_temp.assert_true((select count(*) = 3 from public.mms_assistencias), 'direcao/admin ve todos os postos');

reset role;
rollback;
