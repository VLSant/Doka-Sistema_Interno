-- Validacoes manuais de auditoria da Importacao MMS staging.

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
  id, nome_origem, posto_id, usuario_importador_id, estado_processamento,
  created_by, updated_by
)
values (
  '90000000-0000-0000-0000-000000000401', 'auditoria_mms.xlsx',
  '40000000-0000-0000-0000-000000000001',
  '30000000-0000-0000-0000-000000000002', 'recebido',
  '30000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002'
);

update public.mms_lotes_importacao
set estado_processamento = 'processando',
    updated_by = '30000000-0000-0000-0000-000000000002'
where id = '90000000-0000-0000-0000-000000000401';

insert into public.mms_linhas_importacao (
  id, lote_importacao_id, numero_linha_origem, raw_json, estado_validacao,
  created_by, updated_by
)
values (
  '91000000-0000-0000-0000-000000000401',
  '90000000-0000-0000-0000-000000000401',
  1, '{"numero_assistencia":"A-701"}', 'pendente',
  '30000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002'
);

update public.mms_linhas_importacao
set estado_validacao = 'invalida',
    updated_by = '30000000-0000-0000-0000-000000000002'
where id = '91000000-0000-0000-0000-000000000401';

insert into public.mms_erros_importacao (
  id, lote_importacao_id, linha_importacao_id, campo, codigo, mensagem, created_by
)
values (
  '93000000-0000-0000-0000-000000000401',
  '90000000-0000-0000-0000-000000000401',
  '91000000-0000-0000-0000-000000000401',
  'numero_assistencia', 'ERRO_AUDITORIA', 'Erro rastreavel',
  '30000000-0000-0000-0000-000000000002'
);

insert into public.mms_alertas_importacao (
  id, lote_importacao_id, linha_importacao_id, campo, codigo, mensagem, created_by
)
values (
  '92000000-0000-0000-0000-000000000401',
  '90000000-0000-0000-0000-000000000401',
  '91000000-0000-0000-0000-000000000401',
  'observacao', 'ALERTA_AUDITORIA', 'Alerta rastreavel',
  '30000000-0000-0000-0000-000000000002'
);

select app_private.mms_concluir_validacao_lote('90000000-0000-0000-0000-000000000401');

update public.mms_lotes_importacao
set status = 'cancelado',
    updated_by = '30000000-0000-0000-0000-000000000002'
where id = '90000000-0000-0000-0000-000000000401';

update public.mms_erros_importacao
set deleted_at = now(),
    deleted_by = '30000000-0000-0000-0000-000000000002',
    delete_reason = 'teste auditoria'
where id = '93000000-0000-0000-0000-000000000401';

select pg_temp.assert_true(
  exists (
    select 1 from public.historico_auditoria
    where entidade_tipo = 'mms_lotes_importacao'
      and entidade_id = '90000000-0000-0000-0000-000000000401'
      and acao = 'criado'
      and metadata ->> 'posto_id' = '40000000-0000-0000-0000-000000000001'
  ),
  'criacao de lote deve gerar auditoria com posto'
);

select pg_temp.assert_true(
  exists (
    select 1 from public.historico_auditoria
    where entidade_tipo = 'mms_lotes_importacao'
      and entidade_id = '90000000-0000-0000-0000-000000000401'
      and acao = 'processamento_iniciado'
  ),
  'inicio de processamento deve gerar auditoria'
);

select pg_temp.assert_true(
  exists (
    select 1 from public.historico_auditoria
    where entidade_tipo = 'mms_lotes_importacao'
      and entidade_id = '90000000-0000-0000-0000-000000000401'
      and acao in ('status_alterado', 'validacao_concluida')
      and valor_anterior is not null
      and valor_novo is not null
  ),
  'conclusao de validacao/status deve registrar valores anteriores e novos'
);

select pg_temp.assert_true(
  exists (
    select 1 from public.historico_auditoria
    where entidade_tipo = 'mms_lotes_importacao'
      and entidade_id = '90000000-0000-0000-0000-000000000401'
      and acao = 'cancelado'
  ),
  'cancelamento deve gerar auditoria'
);

select pg_temp.assert_true(
  exists (
    select 1 from public.historico_auditoria
    where entidade_tipo = 'mms_linhas_importacao'
      and entidade_id = '91000000-0000-0000-0000-000000000401'
      and acao in ('criada', 'validada')
      and metadata ->> 'lote_importacao_id' = '90000000-0000-0000-0000-000000000401'
  ),
  'linha deve gerar auditoria com lote'
);

select pg_temp.assert_true(
  exists (
    select 1 from public.historico_auditoria
    where entidade_tipo = 'mms_erros_importacao'
      and entidade_id = '93000000-0000-0000-0000-000000000401'
      and acao = 'soft_delete_registrado'
  ),
  'soft delete de erro deve gerar auditoria'
);

do $$
begin
  update public.mms_linhas_importacao
  set raw_json = '{"tentativa":"alterar"}'
  where id = '91000000-0000-0000-0000-000000000401';
exception
  when raise_exception then
    null;
end
$$;

select pg_temp.assert_true(
  not exists (
    select 1
    from public.historico_auditoria
    where entidade_tipo = 'mms_linhas_importacao'
      and entidade_id = '91000000-0000-0000-0000-000000000401'
      and valor_novo -> 'raw_json' = '{"tentativa":"alterar"}'::jsonb
  ),
  'tentativa bloqueada de alterar raw_json nao deve gerar evento de sucesso'
);

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000001', true);

do $$
begin
  insert into public.mms_lotes_importacao (
    nome_origem, posto_id, usuario_importador_id, estado_processamento,
    created_by, updated_by
  )
  values (
    'bloqueado_fora_escopo.xlsx', '40000000-0000-0000-0000-000000000002',
    '30000000-0000-0000-0000-000000000001', 'recebido',
    '30000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001'
  );
exception
  when insufficient_privilege or with_check_option_violation then
    null;
end
$$;

select pg_temp.assert_true(
  not exists (
    select 1 from public.historico_auditoria
    where entidade_tipo = 'mms_lotes_importacao'
      and valor_novo ->> 'nome_origem' = 'bloqueado_fora_escopo.xlsx'
  ),
  'operacao bloqueada por RLS nao deve gerar auditoria de sucesso'
);

reset role;

rollback;
