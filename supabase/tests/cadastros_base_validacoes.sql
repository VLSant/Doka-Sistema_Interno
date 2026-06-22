-- Validacoes manuais de regras dos cadastros base.
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
where id = '80000000-0000-0000-0000-000000000050';

delete from public.tipos_ocorrencia
where id = '70000000-0000-0000-0000-000000000050';

delete from public.prioridades
where id = '60000000-0000-0000-0000-000000000050';

do $$
begin
  insert into public.prioridades (nome, nome_normalizado, nivel, cor, created_by)
  values (' ALTA ', 'alta manual', 20, '#111111', '30000000-0000-0000-0000-000000000003');
  raise exception 'ASSERTION FAILED: nome normalizado duplicado de prioridade deveria falhar';
exception
  when unique_violation then
    null;
end
$$;

do $$
begin
  insert into public.prioridades (nome, nome_normalizado, nivel, cor, created_by)
  values ('Urgente Nivel Duplicado', 'urgente nivel duplicado', 1, '#111111', '30000000-0000-0000-0000-000000000003');
  raise exception 'ASSERTION FAILED: nivel duplicado de prioridade deveria falhar';
exception
  when unique_violation then
    null;
end
$$;

do $$
begin
  insert into public.prioridades (nome, nome_normalizado, nivel, cor, created_by)
  values ('Cor Invalida', 'cor invalida', 21, 'vermelho', '30000000-0000-0000-0000-000000000003');
  raise exception 'ASSERTION FAILED: cor invalida deveria falhar';
exception
  when check_violation then
    null;
end
$$;

do $$
begin
  insert into public.prioridades (nome, nome_normalizado, nivel, cor, deleted_at, created_by)
  values ('Sem Motivo Delete', 'sem motivo delete', 22, '#111111', now(), '30000000-0000-0000-0000-000000000003');
  raise exception 'ASSERTION FAILED: soft delete sem usuario e motivo deveria falhar';
exception
  when check_violation then
    null;
end
$$;

insert into public.prioridades (
  id,
  nome,
  nome_normalizado,
  nivel,
  cor,
  created_by
)
values (
  '60000000-0000-0000-0000-000000000050',
  'Prioridade Removida',
  'prioridade removida',
  50,
  '#111111',
  '30000000-0000-0000-0000-000000000003'
);

select pg_temp.assert_true(
  exists (
    select 1
    from public.prioridades
    where id = '60000000-0000-0000-0000-000000000050'
  ),
  'recriar nome de prioridade removida deve ser permitido'
);

do $$
begin
  insert into public.tipos_ocorrencia (nome, nome_normalizado, descricao, created_by)
  values (' reclamacao ', 'reclamacao manual', 'duplicado', '30000000-0000-0000-0000-000000000003');
  raise exception 'ASSERTION FAILED: nome normalizado duplicado de tipo deveria falhar';
exception
  when unique_violation then
    null;
end
$$;

insert into public.tipos_ocorrencia (
  id,
  nome,
  nome_normalizado,
  descricao,
  created_by
)
values (
  '70000000-0000-0000-0000-000000000050',
  'Tipo Removido',
  'tipo removido',
  'recriacao permitida',
  '30000000-0000-0000-0000-000000000003'
);

select pg_temp.assert_true(
  exists (
    select 1
    from public.tipos_ocorrencia
    where id = '70000000-0000-0000-0000-000000000050'
  ),
  'recriar nome de tipo removido deve ser permitido'
);

do $$
begin
  insert into public.metas_eficiencia (
    posto_id,
    tipo_atividade_normalizado,
    meta_percentual,
    vigencia_inicio,
    created_by
  )
  values (
    '40000000-0000-0000-0000-000000000999',
    'montagem',
    85.00,
    '2026-01-01',
    '30000000-0000-0000-0000-000000000003'
  );
  raise exception 'ASSERTION FAILED: meta para posto inexistente deveria falhar';
exception
  when foreign_key_violation then
    null;
end
$$;

do $$
begin
  insert into public.metas_eficiencia (
    posto_id,
    tipo_atividade_normalizado,
    meta_percentual,
    vigencia_inicio,
    created_by
  )
  values (
    '40000000-0000-0000-0000-000000000004',
    'montagem',
    85.00,
    '2026-01-01',
    '30000000-0000-0000-0000-000000000003'
  );
  raise exception 'ASSERTION FAILED: meta para posto inativo deveria falhar';
exception
  when raise_exception then
    null;
end
$$;

do $$
begin
  insert into public.metas_eficiencia (
    posto_id,
    tipo_atividade_normalizado,
    meta_percentual,
    vigencia_inicio,
    created_by
  )
  values (
    '40000000-0000-0000-0000-000000000005',
    'montagem',
    85.00,
    '2026-01-01',
    '30000000-0000-0000-0000-000000000003'
  );
  raise exception 'ASSERTION FAILED: meta para posto removido deveria falhar';
exception
  when raise_exception then
    null;
end
$$;

do $$
begin
  insert into public.metas_eficiencia (
    posto_id,
    tipo_atividade_normalizado,
    meta_percentual,
    vigencia_inicio,
    created_by
  )
  values (
    '40000000-0000-0000-0000-000000000001',
    'qualidade',
    0,
    '2026-01-01',
    '30000000-0000-0000-0000-000000000003'
  );
  raise exception 'ASSERTION FAILED: meta percentual zero deveria falhar';
exception
  when check_violation then
    null;
end
$$;

do $$
begin
  insert into public.metas_eficiencia (
    posto_id,
    tipo_atividade_normalizado,
    meta_percentual,
    vigencia_inicio,
    vigencia_fim,
    created_by
  )
  values (
    '40000000-0000-0000-0000-000000000001',
    'qualidade',
    101.00,
    '2026-01-01',
    '2026-12-31',
    '30000000-0000-0000-0000-000000000003'
  );
  raise exception 'ASSERTION FAILED: meta percentual acima de 100 deveria falhar';
exception
  when check_violation then
    null;
end
$$;

do $$
begin
  insert into public.metas_eficiencia (
    posto_id,
    tipo_atividade_normalizado,
    meta_percentual,
    vigencia_inicio,
    vigencia_fim,
    created_by
  )
  values (
    '40000000-0000-0000-0000-000000000001',
    'qualidade',
    80.00,
    '2026-12-31',
    '2026-01-01',
    '30000000-0000-0000-0000-000000000003'
  );
  raise exception 'ASSERTION FAILED: vigencia final anterior deveria falhar';
exception
  when check_violation then
    null;
end
$$;

do $$
begin
  insert into public.metas_eficiencia (
    posto_id,
    tipo_atividade_normalizado,
    meta_percentual,
    vigencia_inicio,
    vigencia_fim,
    created_by
  )
  values (
    '40000000-0000-0000-0000-000000000001',
    ' montagem ',
    90.00,
    '2026-06-01',
    '2026-12-31',
    '30000000-0000-0000-0000-000000000003'
  );
  raise exception 'ASSERTION FAILED: meta sobreposta deveria falhar';
exception
  when exclusion_violation then
    null;
end
$$;

insert into public.metas_eficiencia (
  id,
  posto_id,
  tipo_atividade_normalizado,
  meta_percentual,
  vigencia_inicio,
  vigencia_fim,
  created_by
)
values (
  '80000000-0000-0000-0000-000000000050',
  '40000000-0000-0000-0000-000000000001',
  'montagem',
  91.00,
  '2027-01-01',
  '2027-12-31',
  '30000000-0000-0000-0000-000000000003'
);

select pg_temp.assert_true(
  exists (
    select 1
    from public.metas_eficiencia
    where id = '80000000-0000-0000-0000-000000000050'
      and tipo_atividade_normalizado = 'montagem'
  ),
  'meta nao sobreposta deve ser permitida'
);

rollback;
