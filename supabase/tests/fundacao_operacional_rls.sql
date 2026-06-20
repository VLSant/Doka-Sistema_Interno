-- Validacoes manuais de RLS da fundacao operacional.
-- Execute apos aplicar a migration e carregar supabase/seed/fundacao_operacional_seed.sql.

create or replace function public.assert_true(cond boolean, msg text)
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
select public.assert_true((select count(*) = 0 from public.usuarios), 'usuario sem perfil nao deve visualizar usuarios');
select public.assert_true((select count(*) = 0 from public.postos), 'usuario sem perfil nao deve visualizar postos');

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000005', true);
select public.assert_true((select count(*) = 0 from public.usuarios), 'usuario inativo nao deve visualizar usuarios');

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000006', true);
select public.assert_true((select count(*) = 0 from public.usuarios), 'usuario deletado nao deve visualizar usuarios');

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000001', true);
select public.assert_true((select count(*) = 1 from public.usuarios where email = 'operador@doka.test'), 'operador deve ver o proprio perfil');
select public.assert_true((select count(*) = 1 from public.postos where codigo = 'POSTO_A'), 'operador deve ver Posto A');
select public.assert_true((select count(*) = 0 from public.postos where codigo = 'POSTO_B'), 'operador nao deve ver Posto B');
select public.assert_true((select count(*) = 0 from public.postos where codigo = 'POSTO_C'), 'operador nao deve ver Posto C');
select public.assert_true((select count(*) = 0 from public.usuarios_postos where posto_id = '40000000-0000-0000-0000-000000000002'), 'vinculo deletado nao concede acesso ao Posto B');

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000002', true);
select public.assert_true((select count(*) = 2 from public.postos where codigo in ('POSTO_A', 'POSTO_B')), 'supervisao deve ver Postos A e B');
select public.assert_true((select count(*) = 0 from public.postos where codigo = 'POSTO_C'), 'supervisao nao deve ver Posto C');

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000003', true);
select public.assert_true((select count(*) = 4 from public.postos where deleted_at is null), 'direcao/admin deve ver todos os postos nao deletados, incluindo inativos');
select public.assert_true((select count(*) = 4 from public.usuarios where deleted_at is null), 'direcao/admin deve ver usuarios nao deletados');

reset role;

do $$
begin
  insert into public.usuarios_postos (usuario_id, posto_id, nivel_acesso)
  values ('30000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 'operacional');
  raise exception 'ASSERTION FAILED: vinculo ativo duplicado deveria falhar';
exception
  when unique_violation then
    null;
end
$$;

insert into public.usuarios_postos (usuario_id, posto_id, nivel_acesso)
values ('30000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000002', 'operacional');

select public.assert_true(
  exists (
    select 1
    from public.usuarios_postos
    where usuario_id = '30000000-0000-0000-0000-000000000001'
      and posto_id = '40000000-0000-0000-0000-000000000002'
      and deleted_at is null
  ),
  'novo vinculo ativo deve ser permitido apos vinculo antigo deletado'
);

drop function public.assert_true(boolean, text);
