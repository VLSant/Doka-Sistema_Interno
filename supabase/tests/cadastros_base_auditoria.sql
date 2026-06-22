-- Validacoes manuais de auditoria dos cadastros base.
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

delete from public.metas_eficiencia
where id = '80000000-0000-0000-0000-000000000070';

delete from public.tipos_ocorrencia
where id = '70000000-0000-0000-0000-000000000070';

delete from public.prioridades
where id = '60000000-0000-0000-0000-000000000070';

set role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000003', true);

insert into public.prioridades (
  id,
  nome,
  nome_normalizado,
  nivel,
  cor,
  created_by
)
values (
  '60000000-0000-0000-0000-000000000070',
  'Auditoria Prioridade',
  'auditoria prioridade',
  70,
  '#111111',
  '30000000-0000-0000-0000-000000000003'
);

update public.prioridades
set nome = 'Auditoria Prioridade Atualizada',
    updated_by = '30000000-0000-0000-0000-000000000003'
where id = '60000000-0000-0000-0000-000000000070';

update public.prioridades
set ativo = false,
    updated_by = '30000000-0000-0000-0000-000000000003'
where id = '60000000-0000-0000-0000-000000000070';

update public.prioridades
set ativo = true,
    updated_by = '30000000-0000-0000-0000-000000000003'
where id = '60000000-0000-0000-0000-000000000070';

update public.prioridades
set deleted_at = now(),
    deleted_by = '30000000-0000-0000-0000-000000000003',
    delete_reason = 'teste de auditoria'
where id = '60000000-0000-0000-0000-000000000070';

select pg_temp.assert_true(
  (select count(distinct acao) = 5
   from public.historico_auditoria
   where entidade_tipo = 'prioridades'
     and entidade_id = '60000000-0000-0000-0000-000000000070'
     and acao in ('criado', 'atualizado', 'inativado', 'ativado', 'excluido_logicamente')),
  'prioridades deve auditar todas as acoes criticas'
);

insert into public.tipos_ocorrencia (
  id,
  nome,
  nome_normalizado,
  descricao,
  created_by
)
values (
  '70000000-0000-0000-0000-000000000070',
  'Auditoria Tipo',
  'auditoria tipo',
  'teste',
  '30000000-0000-0000-0000-000000000003'
);

update public.tipos_ocorrencia
set descricao = 'teste atualizado',
    updated_by = '30000000-0000-0000-0000-000000000003'
where id = '70000000-0000-0000-0000-000000000070';

update public.tipos_ocorrencia
set ativo = false,
    updated_by = '30000000-0000-0000-0000-000000000003'
where id = '70000000-0000-0000-0000-000000000070';

update public.tipos_ocorrencia
set ativo = true,
    updated_by = '30000000-0000-0000-0000-000000000003'
where id = '70000000-0000-0000-0000-000000000070';

update public.tipos_ocorrencia
set deleted_at = now(),
    deleted_by = '30000000-0000-0000-0000-000000000003',
    delete_reason = 'teste de auditoria'
where id = '70000000-0000-0000-0000-000000000070';

select pg_temp.assert_true(
  (select count(distinct acao) = 5
   from public.historico_auditoria
   where entidade_tipo = 'tipos_ocorrencia'
     and entidade_id = '70000000-0000-0000-0000-000000000070'
     and acao in ('criado', 'atualizado', 'inativado', 'ativado', 'excluido_logicamente')),
  'tipos_ocorrencia deve auditar todas as acoes criticas'
);

insert into public.metas_eficiencia (
  id,
  posto_id,
  tipo_atividade_normalizado,
  meta_percentual,
  vigencia_inicio,
  created_by
)
values (
  '80000000-0000-0000-0000-000000000070',
  '40000000-0000-0000-0000-000000000001',
  'auditoria meta',
  80.00,
  '2026-01-01',
  '30000000-0000-0000-0000-000000000003'
);

update public.metas_eficiencia
set meta_percentual = 81.00,
    updated_by = '30000000-0000-0000-0000-000000000003'
where id = '80000000-0000-0000-0000-000000000070';

update public.metas_eficiencia
set ativo = false,
    updated_by = '30000000-0000-0000-0000-000000000003'
where id = '80000000-0000-0000-0000-000000000070';

update public.metas_eficiencia
set ativo = true,
    updated_by = '30000000-0000-0000-0000-000000000003'
where id = '80000000-0000-0000-0000-000000000070';

update public.metas_eficiencia
set deleted_at = now(),
    deleted_by = '30000000-0000-0000-0000-000000000003',
    delete_reason = 'teste de auditoria'
where id = '80000000-0000-0000-0000-000000000070';

select pg_temp.assert_true(
  (select count(distinct acao) = 5
   from public.historico_auditoria
   where entidade_tipo = 'metas_eficiencia'
     and entidade_id = '80000000-0000-0000-0000-000000000070'
     and acao in ('criado', 'atualizado', 'inativado', 'ativado', 'excluido_logicamente')),
  'metas_eficiencia deve auditar todas as acoes criticas'
);

select pg_temp.assert_true(
  exists (
    select 1
    from public.historico_auditoria
    where entidade_tipo = 'metas_eficiencia'
      and entidade_id = '80000000-0000-0000-0000-000000000070'
      and acao = 'atualizado'
      and valor_anterior is not null
      and valor_novo is not null
      and usuario_id = '30000000-0000-0000-0000-000000000003'
  ),
  'auditoria de meta deve registrar valores e usuario'
);

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000001', true);

do $$
begin
  insert into public.prioridades (nome, nome_normalizado, nivel, cor)
  values ('Auditoria Bloqueada Operador', 'auditoria bloqueada operador', 71, '#111111');
exception
  when insufficient_privilege or with_check_option_violation then
    null;
end
$$;

select pg_temp.assert_true(
  not exists (
    select 1
    from public.historico_auditoria
    where entidade_tipo = 'prioridades'
      and valor_novo ->> 'nome' = 'Auditoria Bloqueada Operador'
      and acao = 'criado'
  ),
  'operacao bloqueada de operador nao deve gerar evento de sucesso'
);

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000002', true);

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
    'auditoria bloqueada supervisao',
    80.00,
    '2026-01-01'
  );
exception
  when insufficient_privilege or with_check_option_violation then
    null;
end
$$;

select pg_temp.assert_true(
  not exists (
    select 1
    from public.historico_auditoria
    where entidade_tipo = 'metas_eficiencia'
      and valor_novo ->> 'tipo_atividade_normalizado' = 'auditoria bloqueada supervisao'
      and acao = 'criado'
  ),
  'operacao bloqueada de supervisao fora do escopo nao deve gerar evento de sucesso'
);

reset role;

rollback;
