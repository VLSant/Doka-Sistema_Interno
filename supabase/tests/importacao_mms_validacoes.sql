-- Validacoes manuais de constraints da Importacao MMS staging.

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
values (
  '90000000-0000-0000-0000-000000000101', 'validacao_recebido.xlsx',
  '40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002',
  'recebido', '30000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002'
);

select pg_temp.assert_true(
  (select status is null from public.mms_lotes_importacao where id = '90000000-0000-0000-0000-000000000101'),
  'lote recebido deve permitir status oficial nulo'
);

do $$
begin
  insert into public.mms_lotes_importacao (
    nome_origem, posto_id, usuario_importador_id, status, estado_processamento,
    created_by, updated_by
  )
  values (
    'status_invalido.xlsx', '40000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000002', 'recebido', 'recebido',
    '30000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002'
  );
  raise exception 'ASSERTION FAILED: status fora da lista oficial deveria falhar';
exception
  when invalid_text_representation then
    null;
end
$$;

do $$
begin
  insert into public.mms_lotes_importacao (
    nome_origem, posto_id, usuario_importador_id, estado_processamento,
    created_by, updated_by
  )
  values (
    '', '40000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000002', 'recebido',
    '30000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002'
  );
  raise exception 'ASSERTION FAILED: nome_origem vazio deveria falhar';
exception
  when check_violation then
    null;
end
$$;

do $$
begin
  insert into public.mms_lotes_importacao (
    nome_origem, posto_id, usuario_importador_id, estado_processamento,
    created_by, updated_by
  )
  values (
    'posto_inativo.xlsx', '40000000-0000-0000-0000-000000000004',
    '30000000-0000-0000-0000-000000000002', 'recebido',
    '30000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002'
  );
  raise exception 'ASSERTION FAILED: lote para posto inativo deveria falhar';
exception
  when raise_exception then
    null;
end
$$;

do $$
begin
  insert into public.mms_lotes_importacao (
    nome_origem, posto_id, usuario_importador_id, estado_processamento,
    created_by, updated_by
  )
  values (
    'validado_sem_status.xlsx', '40000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000002', 'validado',
    '30000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002'
  );
  raise exception 'ASSERTION FAILED: lote validado com status nulo deveria falhar';
exception
  when check_violation then
    null;
end
$$;

insert into public.mms_linhas_importacao (
  id, lote_importacao_id, numero_linha_origem, raw_json, posto_id, data_atividade,
  numero_assistencia, parte_conjunto, created_by, updated_by
)
values (
  '91000000-0000-0000-0000-000000000101', '90000000-0000-0000-0000-000000000101',
  1, '{"posto":"POSTO_A","numero_assistencia":"A-201","parte_conjunto":"PC-01"}',
  '40000000-0000-0000-0000-000000000001', '2026-06-20', 'A-201', 'PC-01',
  '30000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002'
);

do $$
begin
  insert into public.mms_linhas_importacao (
    lote_importacao_id, numero_linha_origem, raw_json, created_by, updated_by
  )
  values (
    '90000000-0000-0000-0000-000000000101', 2, '{}'::jsonb,
    '30000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002'
  );
  raise exception 'ASSERTION FAILED: raw_json objeto vazio deveria falhar';
exception
  when check_violation then
    null;
end
$$;

do $$
begin
  insert into public.mms_linhas_importacao (
    lote_importacao_id, numero_linha_origem, raw_json, created_by, updated_by
  )
  values (
    '90000000-0000-0000-0000-000000000101', 3, '[]'::jsonb,
    '30000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002'
  );
  raise exception 'ASSERTION FAILED: raw_json array vazio deveria falhar';
exception
  when check_violation then
    null;
end
$$;

do $$
begin
  insert into public.mms_linhas_importacao (
    lote_importacao_id, numero_linha_origem, raw_json, created_by, updated_by
  )
  values (
    '90000000-0000-0000-0000-000000000101', 4, null,
    '30000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002'
  );
  raise exception 'ASSERTION FAILED: raw_json nulo deveria falhar';
exception
  when not_null_violation then
    null;
end
$$;

do $$
begin
  insert into public.mms_linhas_importacao (
    lote_importacao_id, numero_linha_origem, raw_json, created_by, updated_by
  )
  values (
    '90000000-0000-0000-0000-000000000101', 0, '{"linha":0}',
    '30000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002'
  );
  raise exception 'ASSERTION FAILED: numero_linha_origem zero deveria falhar';
exception
  when check_violation then
    null;
end
$$;

do $$
begin
  insert into public.mms_erros_importacao (
    lote_importacao_id, linha_importacao_id, codigo, mensagem, created_by
  )
  values (
    '90000000-0000-0000-0000-000000000101',
    '91000000-0000-0000-0000-000000000101',
    '', 'Mensagem', '30000000-0000-0000-0000-000000000002'
  );
  raise exception 'ASSERTION FAILED: erro sem codigo deveria falhar';
exception
  when check_violation then
    null;
end
$$;

do $$
begin
  insert into public.mms_alertas_importacao (
    lote_importacao_id, linha_importacao_id, codigo, mensagem, created_by
  )
  values (
    '90000000-0000-0000-0000-000000000101',
    '91000000-0000-0000-0000-000000000101',
    'ALERTA', '', '30000000-0000-0000-0000-000000000002'
  );
  raise exception 'ASSERTION FAILED: alerta sem mensagem deveria falhar';
exception
  when check_violation then
    null;
end
$$;

do $$
begin
  insert into public.mms_lotes_importacao (
    id, nome_origem, posto_id, usuario_importador_id, estado_processamento,
    created_by, updated_by
  )
  values (
    '90000000-0000-0000-0000-000000000102', 'outro_lote.xlsx',
    '40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002',
    'recebido', '30000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002'
  );

  insert into public.mms_erros_importacao (
    lote_importacao_id, linha_importacao_id, codigo, mensagem, created_by
  )
  values (
    '90000000-0000-0000-0000-000000000102',
    '91000000-0000-0000-0000-000000000101',
    'LINHA_OUTRO_LOTE', 'Linha pertence a outro lote', '30000000-0000-0000-0000-000000000002'
  );
  raise exception 'ASSERTION FAILED: erro com linha de outro lote deveria falhar';
exception
  when raise_exception then
    null;
end
$$;

do $$
begin
  update public.mms_lotes_importacao
  set deleted_at = now()
  where id = '90000000-0000-0000-0000-000000000101';
  raise exception 'ASSERTION FAILED: soft delete sem usuario e motivo deveria falhar';
exception
  when check_violation then
    null;
end
$$;

rollback;
