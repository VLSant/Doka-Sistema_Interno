-- Validacoes manuais de auditoria da fundacao operacional.
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
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000003', true);

insert into public.postos (id, nome, codigo, descricao, created_by)
values (
  '40000000-0000-0000-0000-000000000010',
  'Posto Auditoria',
  'POSTO_AUDITORIA',
  'Criado pelo teste de auditoria',
  '30000000-0000-0000-0000-000000000003'
);

select public.assert_true(
  exists (
    select 1 from public.historico_auditoria
    where entidade_tipo = 'postos'
      and entidade_id = '40000000-0000-0000-0000-000000000010'
      and acao = 'criado'
      and metadata ->> 'posto_id' = '40000000-0000-0000-0000-000000000010'
  ),
  'criacao de posto deve gerar auditoria com posto_id'
);

insert into public.cargos_funcoes (id, nome, descricao, created_by)
values (
  '20000000-0000-0000-0000-000000000010',
  'Cargo Auditoria',
  'Criado pelo teste de auditoria',
  '30000000-0000-0000-0000-000000000003'
);

select public.assert_true(
  exists (
    select 1 from public.historico_auditoria
    where entidade_tipo = 'cargos_funcoes'
      and entidade_id = '20000000-0000-0000-0000-000000000010'
      and acao = 'criado'
  ),
  'criacao de cargo/funcao deve gerar auditoria'
);

update public.cargos_funcoes
set descricao = 'Atualizado pelo teste de auditoria',
    updated_by = '30000000-0000-0000-0000-000000000003'
where id = '20000000-0000-0000-0000-000000000010';

select public.assert_true(
  exists (
    select 1 from public.historico_auditoria
    where entidade_tipo = 'cargos_funcoes'
      and entidade_id = '20000000-0000-0000-0000-000000000010'
      and acao = 'atualizado'
      and valor_anterior is not null
      and valor_novo is not null
  ),
  'atualizacao de cargo/funcao deve gerar auditoria atualizada'
);

update public.usuarios
set perfil = 'supervisao',
    updated_by = '30000000-0000-0000-0000-000000000003'
where id = '30000000-0000-0000-0000-000000000001';

select public.assert_true(
  exists (
    select 1 from public.historico_auditoria
    where entidade_tipo = 'usuarios'
      and entidade_id = '30000000-0000-0000-0000-000000000001'
      and acao = 'perfil_alterado'
      and valor_anterior is not null
      and valor_novo is not null
  ),
  'mudanca de perfil deve gerar auditoria com valores'
);

update public.usuarios
set ativo = false,
    updated_by = '30000000-0000-0000-0000-000000000003'
where id = '30000000-0000-0000-0000-000000000001';

select public.assert_true(
  exists (
    select 1 from public.historico_auditoria
    where entidade_tipo = 'usuarios'
      and entidade_id = '30000000-0000-0000-0000-000000000001'
      and acao = 'inativado'
  ),
  'inativacao deve gerar auditoria'
);

update public.usuarios
set ativo = true,
    updated_by = '30000000-0000-0000-0000-000000000003'
where id = '30000000-0000-0000-0000-000000000005';

select public.assert_true(
  exists (
    select 1 from public.historico_auditoria
    where entidade_tipo = 'usuarios'
      and entidade_id = '30000000-0000-0000-0000-000000000005'
      and acao = 'ativado'
  ),
  'ativacao deve gerar auditoria'
);

insert into public.usuarios_postos (id, usuario_id, posto_id, nivel_acesso, created_by)
values (
  '50000000-0000-0000-0000-000000000010',
  '30000000-0000-0000-0000-000000000002',
  '40000000-0000-0000-0000-000000000003',
  'supervisao',
  '30000000-0000-0000-0000-000000000003'
);

select public.assert_true(
  exists (
    select 1 from public.historico_auditoria
    where entidade_tipo = 'usuarios_postos'
      and entidade_id = '50000000-0000-0000-0000-000000000010'
      and acao = 'vinculo_posto_criado'
      and metadata ->> 'posto_id' = '40000000-0000-0000-0000-000000000003'
  ),
  'criacao de vinculo usuario/posto deve gerar auditoria com posto_id'
);

update public.usuarios_postos
set deleted_at = now(),
    deleted_by = '30000000-0000-0000-0000-000000000003',
    delete_reason = 'teste de auditoria'
where id = '50000000-0000-0000-0000-000000000001';

select public.assert_true(
  exists (
    select 1 from public.historico_auditoria
    where entidade_tipo = 'usuarios_postos'
      and entidade_id = '50000000-0000-0000-0000-000000000001'
      and acao = 'vinculo_posto_removido'
  ),
  'remocao logica de vinculo deve gerar auditoria'
);

update public.postos
set deleted_at = now(),
    deleted_by = '30000000-0000-0000-0000-000000000003',
    delete_reason = 'teste de auditoria'
where id = '40000000-0000-0000-0000-000000000010';

select public.assert_true(
  exists (
    select 1 from public.historico_auditoria
    where entidade_tipo = 'postos'
      and entidade_id = '40000000-0000-0000-0000-000000000010'
      and acao = 'excluido_logicamente'
  ),
  'soft delete deve gerar auditoria'
);

do $$
begin
  delete from public.historico_auditoria
  where entidade_tipo = 'postos'
    and entidade_id = '40000000-0000-0000-0000-000000000010';
  raise exception 'ASSERTION FAILED: delete operacional de historico deveria falhar';
exception
  when insufficient_privilege then
    null;
end
$$;

select public.assert_true(
  not has_table_privilege('authenticated', 'public.historico_auditoria', 'TRUNCATE'),
  'authenticated nao deve ter TRUNCATE em historico_auditoria'
);

select public.assert_true(
  not has_table_privilege('authenticated', 'public.historico_auditoria', 'REFERENCES'),
  'authenticated nao deve ter REFERENCES em historico_auditoria'
);

select public.assert_true(
  not has_table_privilege('authenticated', 'public.historico_auditoria', 'TRIGGER'),
  'authenticated nao deve ter TRIGGER em historico_auditoria'
);

select public.assert_true(
  not has_function_privilege(
    'authenticated',
    'app_private.registrar_auditoria(text, uuid, text, jsonb, jsonb, jsonb)',
    'EXECUTE'
  ),
  'authenticated nao deve executar registrador interno de auditoria'
);

reset role;
drop function public.assert_true(boolean, text);
