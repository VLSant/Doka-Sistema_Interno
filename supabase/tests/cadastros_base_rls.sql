-- Validacoes manuais de RLS dos cadastros base.
-- Execute apos aplicar a migration e carregar os seeds da fundacao e da feature.

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

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000004', true);
select pg_temp.assert_true((select count(*) = 0 from public.prioridades), 'usuario sem perfil nao deve ver prioridades');
select pg_temp.assert_true((select count(*) = 0 from public.tipos_ocorrencia), 'usuario sem perfil nao deve ver tipos');
select pg_temp.assert_true((select count(*) = 0 from public.metas_eficiencia), 'usuario sem perfil nao deve ver metas');

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000001', true);
select pg_temp.assert_true((select count(*) = 3 from public.prioridades where id in ('60000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000002', '60000000-0000-0000-0000-000000000003')), 'operador deve ver prioridades ativas esperadas');
select pg_temp.assert_true((select count(*) = 0 from public.prioridades where id in ('60000000-0000-0000-0000-000000000004', '60000000-0000-0000-0000-000000000005')), 'operador nao deve ver prioridades inativas ou removidas');
select pg_temp.assert_true((select count(*) = 2 from public.tipos_ocorrencia where id in ('70000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000002')), 'operador deve ver tipos ativos esperados');
select pg_temp.assert_true((select count(*) = 0 from public.tipos_ocorrencia where id in ('70000000-0000-0000-0000-000000000003', '70000000-0000-0000-0000-000000000004')), 'operador nao deve ver tipos inativos ou removidos');
select pg_temp.assert_true((select count(*) = 1 from public.metas_eficiencia where id = '80000000-0000-0000-0000-000000000001'), 'operador deve ver meta ativa do Posto A');
select pg_temp.assert_true((select count(*) = 0 from public.metas_eficiencia where posto_id = '40000000-0000-0000-0000-000000000002'), 'operador nao deve ver meta do Posto B');

do $$
begin
  insert into public.prioridades (nome, nome_normalizado, nivel, cor)
  values ('Bloqueada Operador', 'bloqueada operador', 90, '#111111');
  raise exception 'ASSERTION FAILED: operador nao deveria criar prioridade';
exception
  when insufficient_privilege or with_check_option_violation then
    null;
end
$$;

do $$
begin
  update public.prioridades
  set nome = 'Operador Atualizou'
  where id = '60000000-0000-0000-0000-000000000001';
  if found then
    raise exception 'ASSERTION FAILED: operador nao deveria atualizar prioridade';
  end if;
end
$$;

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000002', true);
select pg_temp.assert_true((select count(*) = 3 from public.prioridades where id in ('60000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000002', '60000000-0000-0000-0000-000000000003')), 'supervisao deve ver prioridades ativas esperadas');
select pg_temp.assert_true((select count(*) = 2 from public.tipos_ocorrencia where id in ('70000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000002')), 'supervisao deve ver tipos ativos esperados');
select pg_temp.assert_true((select count(*) = 2 from public.metas_eficiencia where id in ('80000000-0000-0000-0000-000000000001', '80000000-0000-0000-0000-000000000002')), 'supervisao deve ver metas dos Postos A e B');
select pg_temp.assert_true((select count(*) = 0 from public.metas_eficiencia where id = '80000000-0000-0000-0000-000000000003'), 'supervisao nao deve ver meta do Posto C');

do $$
begin
  insert into public.tipos_ocorrencia (nome, nome_normalizado)
  values ('Bloqueado Supervisao', 'bloqueado supervisao');
  raise exception 'ASSERTION FAILED: supervisao nao deveria criar tipo global';
exception
  when insufficient_privilege or with_check_option_violation then
    null;
end
$$;

insert into public.metas_eficiencia (
  id,
  posto_id,
  tipo_atividade_normalizado,
  meta_percentual,
  vigencia_inicio
)
values (
  '80000000-0000-0000-0000-000000000060',
  '40000000-0000-0000-0000-000000000002',
  'qualidade',
  82.00,
  '2026-01-01'
)
on conflict do nothing;

select pg_temp.assert_true(
  exists (
    select 1
    from public.metas_eficiencia
    where id = '80000000-0000-0000-0000-000000000060'
  ),
  'supervisao deve criar meta no escopo'
);

do $$
begin
  insert into public.metas_eficiencia (
    posto_id,
    tipo_atividade_normalizado,
    meta_percentual,
    vigencia_inicio
  )
  values (
    '40000000-0000-0000-0000-000000000003',
    'qualidade',
    82.00,
    '2026-01-01'
  );
  raise exception 'ASSERTION FAILED: supervisao nao deveria criar meta fora do escopo';
exception
  when insufficient_privilege or with_check_option_violation then
    null;
end
$$;

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000003', true);
select pg_temp.assert_true((select count(*) = 5 from public.prioridades where id in ('60000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000002', '60000000-0000-0000-0000-000000000003', '60000000-0000-0000-0000-000000000004', '60000000-0000-0000-0000-000000000005')), 'direcao/admin deve ver prioridades incluindo inativas e removidas');
select pg_temp.assert_true((select count(*) = 4 from public.tipos_ocorrencia where id in ('70000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000002', '70000000-0000-0000-0000-000000000003', '70000000-0000-0000-0000-000000000004')), 'direcao/admin deve ver tipos incluindo inativos e removidos');
select pg_temp.assert_true((select count(*) = 5 from public.metas_eficiencia where id in ('80000000-0000-0000-0000-000000000001', '80000000-0000-0000-0000-000000000002', '80000000-0000-0000-0000-000000000003', '80000000-0000-0000-0000-000000000004', '80000000-0000-0000-0000-000000000005')), 'direcao/admin deve ver metas globais incluindo inativas e removidas');

insert into public.prioridades (
  id,
  nome,
  nome_normalizado,
  nivel,
  cor,
  created_by
)
values (
  '60000000-0000-0000-0000-000000000060',
  'Direcao Criada',
  'direcao criada',
  60,
  '#111111',
  '30000000-0000-0000-0000-000000000003'
)
on conflict do nothing;

update public.prioridades
set ativo = false,
    updated_by = '30000000-0000-0000-0000-000000000003'
where id = '60000000-0000-0000-0000-000000000060';

do $$
begin
  delete from public.prioridades
  where id = '60000000-0000-0000-0000-000000000060';
  raise exception 'ASSERTION FAILED: delete fisico de prioridade deveria falhar';
exception
  when insufficient_privilege then
    null;
end
$$;

reset role;

rollback;
