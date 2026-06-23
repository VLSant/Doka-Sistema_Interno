-- Validacoes manuais de RLS da Importacao MMS staging.

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
  id, nome_origem, posto_id, usuario_importador_id, estado_processamento,
  created_by, updated_by
)
values
  (
    '90000000-0000-0000-0000-000000000301', 'rls_posto_a.xlsx',
    '40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002',
    'recebido', '30000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002'
  ),
  (
    '90000000-0000-0000-0000-000000000302', 'rls_posto_b.xlsx',
    '40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002',
    'recebido', '30000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002'
  ),
  (
    '90000000-0000-0000-0000-000000000303', 'rls_posto_c.xlsx',
    '40000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000003',
    'recebido', '30000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000003'
  );

insert into public.mms_linhas_importacao (
  id, lote_importacao_id, numero_linha_origem, raw_json, created_by, updated_by
)
values
  ('91000000-0000-0000-0000-000000000301', '90000000-0000-0000-0000-000000000301', 1, '{"posto":"A"}', '30000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002'),
  ('91000000-0000-0000-0000-000000000302', '90000000-0000-0000-0000-000000000302', 1, '{"posto":"B"}', '30000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002'),
  ('91000000-0000-0000-0000-000000000303', '90000000-0000-0000-0000-000000000303', 1, '{"posto":"C"}', '30000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000003');

insert into public.mms_erros_importacao (
  lote_importacao_id, linha_importacao_id, codigo, mensagem, created_by
)
values (
  '90000000-0000-0000-0000-000000000302',
  '91000000-0000-0000-0000-000000000302',
  'ERRO_RLS', 'Erro para teste de RLS',
  '30000000-0000-0000-0000-000000000002'
);

insert into public.mms_alertas_importacao (
  lote_importacao_id, linha_importacao_id, codigo, mensagem, created_by
)
values (
  '90000000-0000-0000-0000-000000000301',
  '91000000-0000-0000-0000-000000000301',
  'ALERTA_RLS', 'Alerta para teste de RLS',
  '30000000-0000-0000-0000-000000000002'
);

set role authenticated;

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000004', true);
select pg_temp.assert_true((select count(*) = 0 from public.mms_lotes_importacao), 'usuario sem perfil ativo nao acessa lotes');
select pg_temp.assert_true((select count(*) = 0 from public.mms_linhas_importacao), 'usuario sem perfil ativo nao acessa linhas');
select pg_temp.assert_true((select count(*) = 0 from public.mms_erros_importacao), 'usuario sem perfil ativo nao acessa erros');
select pg_temp.assert_true((select count(*) = 0 from public.mms_alertas_importacao), 'usuario sem perfil ativo nao acessa alertas');

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000001', true);
select pg_temp.assert_true((select count(*) = 1 from public.mms_lotes_importacao where posto_id = '40000000-0000-0000-0000-000000000001'), 'operador ve lote do posto A');
select pg_temp.assert_true((select count(*) = 0 from public.mms_lotes_importacao where posto_id = '40000000-0000-0000-0000-000000000002'), 'operador nao ve lote do posto B');
select pg_temp.assert_true((select count(*) = 1 from public.mms_linhas_importacao), 'operador ve apenas linhas do lote acessivel');
select pg_temp.assert_true((select count(*) = 0 from public.mms_erros_importacao), 'operador nao ve erro de lote fora do escopo');
select pg_temp.assert_true((select count(*) = 1 from public.mms_alertas_importacao), 'operador ve alerta do lote acessivel');

do $$
begin
  insert into public.mms_lotes_importacao (
    nome_origem, posto_id, usuario_importador_id, estado_processamento, created_by, updated_by
  )
  values (
    'operador_fora_escopo.xlsx', '40000000-0000-0000-0000-000000000002',
    '30000000-0000-0000-0000-000000000001', 'recebido',
    '30000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001'
  );
  raise exception 'ASSERTION FAILED: operador nao deve criar lote fora do escopo';
exception
  when insufficient_privilege or with_check_option_violation then
    null;
end
$$;

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000002', true);
select pg_temp.assert_true((select count(*) = 2 from public.mms_lotes_importacao), 'supervisao ve lotes dos postos A e B');
update public.mms_lotes_importacao
set estado_processamento = 'processando',
    updated_by = '30000000-0000-0000-0000-000000000002'
where id = '90000000-0000-0000-0000-000000000302';

select pg_temp.assert_true(
  (select estado_processamento = 'processando' from public.mms_lotes_importacao where id = '90000000-0000-0000-0000-000000000302'),
  'supervisao gerencia lote dentro do escopo'
);

do $$
begin
  update public.mms_lotes_importacao
  set posto_id = '40000000-0000-0000-0000-000000000003',
      updated_by = '30000000-0000-0000-0000-000000000002'
  where id = '90000000-0000-0000-0000-000000000302';
  raise exception 'ASSERTION FAILED: supervisao nao deve mover lote para posto fora do escopo';
exception
  when insufficient_privilege or with_check_option_violation then
    null;
end
$$;

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000003', true);
select pg_temp.assert_true((select count(*) = 3 from public.mms_lotes_importacao), 'direcao/admin ve todos os lotes');
update public.mms_lotes_importacao
set deleted_at = now(),
    deleted_by = '30000000-0000-0000-0000-000000000003',
    delete_reason = 'teste RLS admin',
    updated_by = '30000000-0000-0000-0000-000000000003'
where id = '90000000-0000-0000-0000-000000000303';

select pg_temp.assert_true(
  exists (select 1 from public.mms_lotes_importacao where id = '90000000-0000-0000-0000-000000000303' and deleted_at is not null),
  'direcao/admin revisa registros soft-deleted'
);

reset role;

rollback;
