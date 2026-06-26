-- Assistencias MMS - espelho operacional idempotente.
-- Cria assistencias principais e partes a partir do staging MMS validado.

create extension if not exists pgcrypto;

create schema if not exists app_private;
revoke all on schema app_private from public;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'status_interno_mms') then
    create type public.status_interno_mms as enum ('ativo', 'removido');
  end if;
end
$$;

create or replace function app_private.mms_normalizar_chave(valor text)
returns text
language sql
immutable
set search_path = pg_temp
as $$
  select nullif(upper(regexp_replace(btrim(coalesce(valor, '')), '\s+', ' ', 'g')), '')
$$;

create or replace function app_private.campo_soft_delete_valido(
  deleted_at_arg timestamptz,
  deleted_by_arg uuid,
  delete_reason_arg text
)
returns boolean
language sql
immutable
set search_path = pg_temp
as $$
  select deleted_at_arg is null
    or (deleted_by_arg is not null and nullif(btrim(delete_reason_arg), '') is not null)
$$;

create or replace function app_private.mms_valor_visivel(importado text, corrigido text)
returns text
language sql
immutable
set search_path = pg_temp
as $$
  select coalesce(nullif(btrim(corrigido), ''), importado)
$$;

create or replace function app_private.mms_texto_para_numeric(valor text)
returns numeric
language sql
immutable
set search_path = pg_temp
as $$
  select case
    when nullif(btrim(valor), '') is null then null
    when replace(btrim(valor), ',', '.') ~ '^-?[0-9]+(\.[0-9]+)?$'
      then replace(btrim(valor), ',', '.')::numeric
    else null
  end
$$;

create or replace function app_private.mms_texto_para_integer(valor text)
returns integer
language sql
immutable
set search_path = pg_temp
as $$
  select case
    when nullif(btrim(valor), '') is null then null
    when btrim(valor) ~ '^-?[0-9]+$' then btrim(valor)::integer
    else null
  end
$$;

create or replace function app_private.mms_texto_para_boolean(valor text)
returns boolean
language sql
immutable
set search_path = pg_temp
as $$
  select case lower(btrim(coalesce(valor, '')))
    when 'true' then true
    when 't' then true
    when 'sim' then true
    when 's' then true
    when '1' then true
    when 'yes' then true
    when 'false' then false
    when 'f' then false
    when 'nao' then false
    when 'n' then false
    when '0' then false
    when 'no' then false
    else null
  end
$$;

create or replace function app_private.mms_importacao_espelho_autorizada()
returns boolean
language sql
stable
set search_path = pg_temp
as $$
  select current_setting('app.mms_assistencias_importacao', true) = 'on'
    and current_user not in ('anon', 'authenticated')
$$;

create or replace function app_private.mms_raw_json_resumo_assistencia(
  lote_uuid uuid,
  posto_uuid uuid,
  data_atividade_arg date,
  numero_assistencia_normalizado_arg text
)
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select jsonb_strip_nulls(jsonb_build_object(
    'lote_importacao_id', lote_uuid,
    'numero_assistencia_normalizado', numero_assistencia_normalizado_arg,
    'total_partes_lote', count(li.id),
    'linhas', coalesce(
      jsonb_agg(
        jsonb_build_object(
          'linha_importacao_id', li.id,
          'numero_linha_origem', li.numero_linha_origem,
          'parte_conjunto', li.parte_conjunto,
          'raw_json', li.raw_json
        )
        order by li.numero_linha_origem nulls last, li.created_at, li.id
      ),
      '[]'::jsonb
    )
  ))
  from public.mms_linhas_importacao li
  where li.lote_importacao_id = lote_uuid
    and li.deleted_at is null
    and li.posto_id = posto_uuid
    and li.data_atividade = data_atividade_arg
    and app_private.mms_normalizar_chave(li.numero_assistencia) = numero_assistencia_normalizado_arg
    and li.estado_validacao in ('valida', 'valida_com_alerta')
$$;

create or replace function app_private.mms_lote_assistencias_elegivel(lote_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  with lote as (
    select l.*
    from public.mms_lotes_importacao l
    where l.id = lote_uuid
      and l.deleted_at is null
  ),
  linhas as (
    select li.*
    from public.mms_linhas_importacao li
    where li.lote_importacao_id = lote_uuid
      and li.deleted_at is null
  ),
  totais as (
    select
      count(*)::integer as total_linhas_ativas,
      count(*) filter (
        where li.estado_validacao in ('valida', 'valida_com_alerta')
          and li.posto_id is not null
          and li.data_atividade is not null
          and app_private.mms_normalizar_chave(li.numero_assistencia) is not null
          and app_private.mms_normalizar_chave(li.parte_conjunto) is not null
          and li.raw_json is not null
      )::integer as total_linhas_transformaveis
    from linhas li
  )
  select coalesce(
    exists (
      select 1
      from lote l
      cross join totais t
      where l.status in ('importado', 'importado_com_alertas')
        and l.estado_processamento = 'validado'
        and l.posto_id is not null
        and l.data_atividade is not null
        and t.total_linhas_ativas > 0
        and t.total_linhas_ativas = t.total_linhas_transformaveis
        and l.total_linhas = t.total_linhas_ativas
        and l.total_linhas_validas = t.total_linhas_ativas
        and l.total_linhas_com_erro = 0
        and not exists (
          select 1
          from public.mms_erros_importacao e
          where e.lote_importacao_id = l.id
            and e.deleted_at is null
        )
    ),
    false
  )
$$;

create or replace function app_private.mms_linha_assistencia_elegivel(linha_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select coalesce(
    exists (
      select 1
      from public.mms_linhas_importacao li
      where li.id = linha_uuid
        and li.deleted_at is null
        and li.estado_validacao in ('valida', 'valida_com_alerta')
        and li.posto_id is not null
        and li.data_atividade is not null
        and app_private.mms_normalizar_chave(li.numero_assistencia) is not null
        and app_private.mms_normalizar_chave(li.parte_conjunto) is not null
        and app_private.mms_raw_json_linha_valido(li.raw_json)
        and app_private.mms_lote_assistencias_elegivel(li.lote_importacao_id)
        and not exists (
          select 1
          from public.mms_erros_importacao e
          where e.lote_importacao_id = li.lote_importacao_id
            and e.linha_importacao_id = li.id
            and e.deleted_at is null
        )
    ),
    false
  )
$$;

create or replace function app_private.mms_assistencia_audit_metadata(
  posto_uuid uuid,
  data_atividade_arg date,
  numero_assistencia_arg text,
  parte_conjunto_arg text default null,
  lote_uuid uuid default null,
  linha_uuid uuid default null,
  motivo_arg text default null
)
returns jsonb
language sql
immutable
set search_path = pg_temp
as $$
  select jsonb_strip_nulls(jsonb_build_object(
    'origem', 'assistencias_mms_espelho',
    'posto_id', posto_uuid,
    'data_atividade', data_atividade_arg,
    'numero_assistencia', numero_assistencia_arg,
    'parte_conjunto', parte_conjunto_arg,
    'lote_importacao_id', lote_uuid,
    'linha_importacao_id', linha_uuid,
    'motivo', motivo_arg
  ))
$$;

create table public.mms_assistencias (
  id uuid primary key default gen_random_uuid(),
  posto_id uuid not null references public.postos(id) on delete restrict,
  data_atividade date not null,
  numero_assistencia text not null,
  numero_assistencia_normalizado text not null,
  status_interno public.status_interno_mms not null default 'ativo',
  status_atividade text,
  tipo_atividade_original text,
  tipo_atividade_normalizado text,
  cliente_nome_importado text,
  cliente_nome_corrigido text,
  endereco_importado text,
  endereco_corrigido text,
  lote_criacao_id uuid not null references public.mms_lotes_importacao(id) on delete restrict,
  linha_criacao_id uuid references public.mms_linhas_importacao(id) on delete restrict,
  lote_ultimo_id uuid not null references public.mms_lotes_importacao(id) on delete restrict,
  linha_ultima_id uuid references public.mms_linhas_importacao(id) on delete restrict,
  raw_json_resumo jsonb not null,
  corrigido_em timestamptz,
  corrigido_por uuid references public.usuarios(id) on delete restrict,
  motivo_correcao text,
  removido_em timestamptz,
  removido_lote_id uuid references public.mms_lotes_importacao(id) on delete restrict,
  created_at timestamptz not null default now(),
  created_by uuid not null references public.usuarios(id) on delete restrict,
  updated_at timestamptz not null default now(),
  updated_by uuid not null references public.usuarios(id) on delete restrict,
  deleted_at timestamptz,
  deleted_by uuid references public.usuarios(id) on delete restrict,
  delete_reason text,
  constraint mms_assistencias_numero_not_blank check (btrim(numero_assistencia) <> ''),
  constraint mms_assistencias_numero_normalizado_not_blank check (btrim(numero_assistencia_normalizado) <> ''),
  constraint mms_assistencias_raw_resumo_non_empty check (app_private.mms_raw_json_linha_valido(raw_json_resumo)),
  constraint mms_assistencias_soft_delete_valido check (
    app_private.campo_soft_delete_valido(deleted_at, deleted_by, delete_reason)
  ),
  constraint mms_assistencias_removido_consistente check (
    (status_interno = 'ativo' and removido_em is null and removido_lote_id is null)
    or (status_interno = 'removido' and removido_em is not null and removido_lote_id is not null)
  )
);

create table public.mms_partes_assistencia (
  id uuid primary key default gen_random_uuid(),
  assistencia_id uuid not null references public.mms_assistencias(id) on delete restrict,
  parte_conjunto text not null,
  parte_conjunto_normalizada text not null,
  status_interno public.status_interno_mms not null default 'ativo',
  status_atividade text,
  tipo_atividade_original text,
  tipo_atividade_normalizado text,
  codigo_mercadoria_importado text,
  descricao_mercadoria_importada text,
  descricao_mercadoria_corrigida text,
  recurso_importado text,
  recurso_corrigido text,
  valor_deslocamento_importado numeric,
  valor_receber_movel_importado numeric,
  atendimento_critico boolean,
  quantidade_reagendamento integer,
  comentarios_local_montagem text,
  observacao_finalizacao text,
  defeito_identificado text,
  laudo_ou_observacao text,
  lote_criacao_id uuid not null references public.mms_lotes_importacao(id) on delete restrict,
  linha_criacao_id uuid not null references public.mms_linhas_importacao(id) on delete restrict,
  lote_ultimo_id uuid not null references public.mms_lotes_importacao(id) on delete restrict,
  linha_ultima_id uuid not null references public.mms_linhas_importacao(id) on delete restrict,
  raw_json jsonb not null,
  corrigido_em timestamptz,
  corrigido_por uuid references public.usuarios(id) on delete restrict,
  motivo_correcao text,
  removido_em timestamptz,
  removido_lote_id uuid references public.mms_lotes_importacao(id) on delete restrict,
  created_at timestamptz not null default now(),
  created_by uuid not null references public.usuarios(id) on delete restrict,
  updated_at timestamptz not null default now(),
  updated_by uuid not null references public.usuarios(id) on delete restrict,
  deleted_at timestamptz,
  deleted_by uuid references public.usuarios(id) on delete restrict,
  delete_reason text,
  constraint mms_partes_assistencia_parte_not_blank check (btrim(parte_conjunto) <> ''),
  constraint mms_partes_assistencia_parte_normalizada_not_blank check (btrim(parte_conjunto_normalizada) <> ''),
  constraint mms_partes_assistencia_raw_json_non_empty check (app_private.mms_raw_json_linha_valido(raw_json)),
  constraint mms_partes_assistencia_quantidade_reagendamento_non_negative check (
    quantidade_reagendamento is null or quantidade_reagendamento >= 0
  ),
  constraint mms_partes_assistencia_soft_delete_valido check (
    app_private.campo_soft_delete_valido(deleted_at, deleted_by, delete_reason)
  ),
  constraint mms_partes_assistencia_removido_consistente check (
    (status_interno = 'ativo' and removido_em is null and removido_lote_id is null)
    or (status_interno = 'removido' and removido_em is not null and removido_lote_id is not null)
  )
);

create unique index mms_assistencias_identidade_uidx
  on public.mms_assistencias (posto_id, data_atividade, numero_assistencia_normalizado)
  where deleted_at is null;
create unique index mms_partes_assistencia_identidade_uidx
  on public.mms_partes_assistencia (assistencia_id, parte_conjunto_normalizada)
  where deleted_at is null;

create index mms_assistencias_posto_data_idx on public.mms_assistencias (posto_id, data_atividade);
create index mms_assistencias_numero_idx on public.mms_assistencias (numero_assistencia_normalizado);
create index mms_assistencias_status_idx on public.mms_assistencias (status_interno);
create index mms_assistencias_status_atividade_idx on public.mms_assistencias (status_atividade);
create index mms_assistencias_tipo_idx on public.mms_assistencias (tipo_atividade_normalizado);
create index mms_assistencias_deleted_at_idx on public.mms_assistencias (deleted_at);
create index mms_assistencias_lote_ultimo_idx on public.mms_assistencias (lote_ultimo_id);
create index mms_assistencias_linha_ultima_idx on public.mms_assistencias (linha_ultima_id);
create index mms_assistencias_created_by_idx on public.mms_assistencias (created_by);
create index mms_assistencias_updated_by_idx on public.mms_assistencias (updated_by);
create index mms_assistencias_corrigido_por_idx on public.mms_assistencias (corrigido_por);
create index mms_assistencias_deleted_by_idx on public.mms_assistencias (deleted_by);

create index mms_partes_assistencia_assistencia_idx on public.mms_partes_assistencia (assistencia_id);
create index mms_partes_assistencia_parte_idx on public.mms_partes_assistencia (parte_conjunto_normalizada);
create index mms_partes_assistencia_status_idx on public.mms_partes_assistencia (status_interno);
create index mms_partes_assistencia_status_atividade_idx on public.mms_partes_assistencia (status_atividade);
create index mms_partes_assistencia_tipo_idx on public.mms_partes_assistencia (tipo_atividade_normalizado);
create index mms_partes_assistencia_lote_ultimo_idx on public.mms_partes_assistencia (lote_ultimo_id);
create index mms_partes_assistencia_linha_ultima_idx on public.mms_partes_assistencia (linha_ultima_id);
create index mms_partes_assistencia_deleted_at_idx on public.mms_partes_assistencia (deleted_at);
create index mms_partes_assistencia_created_by_idx on public.mms_partes_assistencia (created_by);
create index mms_partes_assistencia_updated_by_idx on public.mms_partes_assistencia (updated_by);
create index mms_partes_assistencia_corrigido_por_idx on public.mms_partes_assistencia (corrigido_por);
create index mms_partes_assistencia_deleted_by_idx on public.mms_partes_assistencia (deleted_by);

create or replace function app_private.mms_bloquear_raw_json_espelho()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if app_private.mms_importacao_espelho_autorizada() then
    return new;
  end if;

  if TG_TABLE_NAME = 'mms_assistencias'
     and old.raw_json_resumo is distinct from new.raw_json_resumo then
    raise exception 'raw_json_resumo da assistencia MMS nao pode ser alterado diretamente';
  end if;

  if TG_TABLE_NAME = 'mms_partes_assistencia'
     and old.raw_json is distinct from new.raw_json then
    raise exception 'raw_json da parte MMS nao pode ser alterado diretamente';
  end if;

  return new;
end;
$$;

create or replace function app_private.auditar_assistencias_mms()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  entidade text := TG_TABLE_NAME;
  entidade_id uuid;
  acao_auditoria text;
  antes jsonb;
  depois jsonb;
  assistencia record;
  parte_valor text;
  lote_uuid uuid;
  linha_uuid uuid;
  motivo_valor text;
begin
  if TG_OP = 'INSERT' then
    entidade_id := new.id;
    acao_auditoria := 'criado';
    depois := to_jsonb(new);
    lote_uuid := new.lote_ultimo_id;
    linha_uuid := new.linha_ultima_id;
    motivo_valor := new.motivo_correcao;
  elsif TG_OP = 'UPDATE' then
    entidade_id := new.id;
    antes := to_jsonb(old);
    depois := to_jsonb(new);
    acao_auditoria := 'atualizado_por_importacao';
    lote_uuid := coalesce(new.lote_ultimo_id, old.lote_ultimo_id);
    linha_uuid := coalesce(new.linha_ultima_id, old.linha_ultima_id);
    motivo_valor := coalesce(new.motivo_correcao, old.motivo_correcao, new.delete_reason, old.delete_reason);

    if old.deleted_at is null and new.deleted_at is not null then
      acao_auditoria := 'soft_delete_registrado';
    elsif old.status_interno = 'ativo' and new.status_interno = 'removido' then
      acao_auditoria := 'marcado_removido';
    elsif old.status_interno = 'removido' and new.status_interno = 'ativo' then
      acao_auditoria := 'reativado_por_importacao';
    elsif old.corrigido_em is distinct from new.corrigido_em
       or old.motivo_correcao is distinct from new.motivo_correcao then
      acao_auditoria := 'corrigido';
    end if;
  else
    return null;
  end if;

  if entidade = 'mms_assistencias' then
    assistencia := new;
  else
    select a.* into assistencia
    from public.mms_assistencias a
    where a.id = case when TG_OP = 'INSERT' then new.assistencia_id else coalesce(new.assistencia_id, old.assistencia_id) end;
    parte_valor := case when TG_OP = 'INSERT' then new.parte_conjunto else coalesce(new.parte_conjunto, old.parte_conjunto) end;
  end if;

  perform app_private.registrar_auditoria(
    entidade,
    entidade_id,
    acao_auditoria,
    antes,
    depois,
    app_private.mms_assistencia_audit_metadata(
      assistencia.posto_id,
      assistencia.data_atividade,
      assistencia.numero_assistencia,
      parte_valor,
      lote_uuid,
      linha_uuid,
      motivo_valor
    )
  );

  return coalesce(new, old);
end;
$$;

create or replace function app_private.mms_upsert_assistencia_por_linha(linha_uuid uuid)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  linha record;
  lote record;
  ator uuid;
  assistencia_uuid uuid;
  numero_norm text;
  resumo jsonb;
begin
  if not app_private.mms_linha_assistencia_elegivel(linha_uuid) then
    raise exception 'linha MMS inelegivel para espelho de assistencias';
  end if;

  select li.* into linha
  from public.mms_linhas_importacao li
  where li.id = linha_uuid;

  select l.* into lote
  from public.mms_lotes_importacao l
  where l.id = linha.lote_importacao_id;

  ator := coalesce(app_private.usuario_atual_id(), linha.updated_by, linha.created_by, lote.updated_by, lote.created_by);
  numero_norm := app_private.mms_normalizar_chave(linha.numero_assistencia);
  resumo := app_private.mms_raw_json_resumo_assistencia(
    linha.lote_importacao_id,
    linha.posto_id,
    linha.data_atividade,
    numero_norm
  );

  begin
    perform set_config('app.mms_assistencias_importacao', 'on', true);

    insert into public.mms_assistencias (
      posto_id, data_atividade, numero_assistencia, numero_assistencia_normalizado,
      status_interno, status_atividade, tipo_atividade_original, tipo_atividade_normalizado,
      cliente_nome_importado, endereco_importado, lote_criacao_id, linha_criacao_id,
      lote_ultimo_id, linha_ultima_id, raw_json_resumo, created_by, updated_by
    )
    values (
      linha.posto_id,
      linha.data_atividade,
      btrim(linha.numero_assistencia),
      numero_norm,
      'ativo',
      coalesce(linha.raw_json ->> 'status_atividade', linha.raw_json ->> 'status'),
      coalesce(linha.raw_json ->> 'tipo_atividade', linha.raw_json ->> 'atividade'),
      app_private.mms_normalizar_chave(coalesce(linha.raw_json ->> 'tipo_atividade', linha.raw_json ->> 'atividade')),
      coalesce(linha.raw_json ->> 'cliente_nome', linha.raw_json ->> 'cliente', linha.raw_json ->> 'nome_cliente'),
      coalesce(linha.raw_json ->> 'endereco', linha.raw_json ->> 'endereco_cliente'),
      linha.lote_importacao_id,
      linha.id,
      linha.lote_importacao_id,
      linha.id,
      resumo,
      ator,
      ator
    )
    on conflict (posto_id, data_atividade, numero_assistencia_normalizado)
      where deleted_at is null
    do update set
      numero_assistencia = excluded.numero_assistencia,
      status_interno = 'ativo',
      removido_em = null,
      removido_lote_id = null,
      status_atividade = excluded.status_atividade,
      tipo_atividade_original = excluded.tipo_atividade_original,
      tipo_atividade_normalizado = excluded.tipo_atividade_normalizado,
      cliente_nome_importado = excluded.cliente_nome_importado,
      endereco_importado = excluded.endereco_importado,
      lote_ultimo_id = excluded.lote_ultimo_id,
      linha_ultima_id = excluded.linha_ultima_id,
      raw_json_resumo = excluded.raw_json_resumo,
      updated_by = excluded.updated_by
    where public.mms_assistencias.status_interno is distinct from 'ativo'
      or public.mms_assistencias.status_atividade is distinct from excluded.status_atividade
      or public.mms_assistencias.tipo_atividade_original is distinct from excluded.tipo_atividade_original
      or public.mms_assistencias.tipo_atividade_normalizado is distinct from excluded.tipo_atividade_normalizado
      or public.mms_assistencias.cliente_nome_importado is distinct from excluded.cliente_nome_importado
      or public.mms_assistencias.endereco_importado is distinct from excluded.endereco_importado
      or public.mms_assistencias.lote_ultimo_id is distinct from excluded.lote_ultimo_id
      or public.mms_assistencias.linha_ultima_id is distinct from excluded.linha_ultima_id
      or public.mms_assistencias.raw_json_resumo is distinct from excluded.raw_json_resumo
    returning id into assistencia_uuid;

    perform set_config('app.mms_assistencias_importacao', 'off', true);
  exception
    when others then
      perform set_config('app.mms_assistencias_importacao', 'off', true);
      raise;
  end;

  if assistencia_uuid is null then
    select id into assistencia_uuid
    from public.mms_assistencias
    where posto_id = linha.posto_id
      and data_atividade = linha.data_atividade
      and numero_assistencia_normalizado = numero_norm
      and deleted_at is null;
  end if;

  return assistencia_uuid;
end;
$$;

create or replace function app_private.mms_upsert_parte_por_linha(linha_uuid uuid)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  linha record;
  ator uuid;
  assistencia_uuid uuid;
  parte_uuid uuid;
  parte_norm text;
begin
  if not app_private.mms_linha_assistencia_elegivel(linha_uuid) then
    raise exception 'linha MMS inelegivel para parte de assistencia';
  end if;

  select li.* into linha
  from public.mms_linhas_importacao li
  where li.id = linha_uuid;

  assistencia_uuid := app_private.mms_upsert_assistencia_por_linha(linha_uuid);
  ator := coalesce(app_private.usuario_atual_id(), linha.updated_by, linha.created_by);
  parte_norm := app_private.mms_normalizar_chave(linha.parte_conjunto);

  begin
    perform set_config('app.mms_assistencias_importacao', 'on', true);

    insert into public.mms_partes_assistencia (
      assistencia_id, parte_conjunto, parte_conjunto_normalizada, status_interno,
      status_atividade, tipo_atividade_original, tipo_atividade_normalizado,
      codigo_mercadoria_importado, descricao_mercadoria_importada, recurso_importado,
      valor_deslocamento_importado, valor_receber_movel_importado, atendimento_critico,
      quantidade_reagendamento, comentarios_local_montagem, observacao_finalizacao,
      defeito_identificado, laudo_ou_observacao, lote_criacao_id, linha_criacao_id,
      lote_ultimo_id, linha_ultima_id, raw_json, created_by, updated_by
    )
    values (
      assistencia_uuid,
      btrim(linha.parte_conjunto),
      parte_norm,
      'ativo',
      coalesce(linha.raw_json ->> 'status_atividade', linha.raw_json ->> 'status'),
      coalesce(linha.raw_json ->> 'tipo_atividade', linha.raw_json ->> 'atividade'),
      app_private.mms_normalizar_chave(coalesce(linha.raw_json ->> 'tipo_atividade', linha.raw_json ->> 'atividade')),
      coalesce(linha.raw_json ->> 'codigo_mercadoria', linha.raw_json ->> 'codigo'),
      coalesce(linha.raw_json ->> 'descricao_mercadoria', linha.raw_json ->> 'mercadoria_descricao'),
      linha.raw_json ->> 'recurso',
      app_private.mms_texto_para_numeric(linha.raw_json ->> 'valor_deslocamento'),
      app_private.mms_texto_para_numeric(linha.raw_json ->> 'valor_receber_movel'),
      app_private.mms_texto_para_boolean(linha.raw_json ->> 'atendimento_critico'),
      app_private.mms_texto_para_integer(linha.raw_json ->> 'quantidade_reagendamento'),
      linha.raw_json ->> 'comentarios_local_montagem',
      linha.raw_json ->> 'observacao_finalizacao',
      linha.raw_json ->> 'defeito_identificado',
      coalesce(linha.raw_json ->> 'laudo_ou_observacao', linha.raw_json ->> 'laudo', linha.raw_json ->> 'observacao'),
      linha.lote_importacao_id,
      linha.id,
      linha.lote_importacao_id,
      linha.id,
      linha.raw_json,
      ator,
      ator
    )
    on conflict (assistencia_id, parte_conjunto_normalizada)
      where deleted_at is null
    do update set
      parte_conjunto = excluded.parte_conjunto,
      status_interno = 'ativo',
      removido_em = null,
      removido_lote_id = null,
      status_atividade = excluded.status_atividade,
      tipo_atividade_original = excluded.tipo_atividade_original,
      tipo_atividade_normalizado = excluded.tipo_atividade_normalizado,
      codigo_mercadoria_importado = excluded.codigo_mercadoria_importado,
      descricao_mercadoria_importada = excluded.descricao_mercadoria_importada,
      recurso_importado = excluded.recurso_importado,
      valor_deslocamento_importado = excluded.valor_deslocamento_importado,
      valor_receber_movel_importado = excluded.valor_receber_movel_importado,
      atendimento_critico = excluded.atendimento_critico,
      quantidade_reagendamento = excluded.quantidade_reagendamento,
      comentarios_local_montagem = excluded.comentarios_local_montagem,
      observacao_finalizacao = excluded.observacao_finalizacao,
      defeito_identificado = excluded.defeito_identificado,
      laudo_ou_observacao = excluded.laudo_ou_observacao,
      lote_ultimo_id = excluded.lote_ultimo_id,
      linha_ultima_id = excluded.linha_ultima_id,
      raw_json = excluded.raw_json,
      updated_by = excluded.updated_by
    where public.mms_partes_assistencia.status_interno is distinct from 'ativo'
      or public.mms_partes_assistencia.status_atividade is distinct from excluded.status_atividade
      or public.mms_partes_assistencia.tipo_atividade_original is distinct from excluded.tipo_atividade_original
      or public.mms_partes_assistencia.tipo_atividade_normalizado is distinct from excluded.tipo_atividade_normalizado
      or public.mms_partes_assistencia.codigo_mercadoria_importado is distinct from excluded.codigo_mercadoria_importado
      or public.mms_partes_assistencia.descricao_mercadoria_importada is distinct from excluded.descricao_mercadoria_importada
      or public.mms_partes_assistencia.recurso_importado is distinct from excluded.recurso_importado
      or public.mms_partes_assistencia.valor_deslocamento_importado is distinct from excluded.valor_deslocamento_importado
      or public.mms_partes_assistencia.valor_receber_movel_importado is distinct from excluded.valor_receber_movel_importado
      or public.mms_partes_assistencia.atendimento_critico is distinct from excluded.atendimento_critico
      or public.mms_partes_assistencia.quantidade_reagendamento is distinct from excluded.quantidade_reagendamento
      or public.mms_partes_assistencia.comentarios_local_montagem is distinct from excluded.comentarios_local_montagem
      or public.mms_partes_assistencia.observacao_finalizacao is distinct from excluded.observacao_finalizacao
      or public.mms_partes_assistencia.defeito_identificado is distinct from excluded.defeito_identificado
      or public.mms_partes_assistencia.laudo_ou_observacao is distinct from excluded.laudo_ou_observacao
      or public.mms_partes_assistencia.lote_ultimo_id is distinct from excluded.lote_ultimo_id
      or public.mms_partes_assistencia.linha_ultima_id is distinct from excluded.linha_ultima_id
      or public.mms_partes_assistencia.raw_json is distinct from excluded.raw_json
    returning id into parte_uuid;

    perform set_config('app.mms_assistencias_importacao', 'off', true);
  exception
    when others then
      perform set_config('app.mms_assistencias_importacao', 'off', true);
      raise;
  end;

  if parte_uuid is null then
    select id into parte_uuid
    from public.mms_partes_assistencia
    where assistencia_id = assistencia_uuid
      and parte_conjunto_normalizada = parte_norm
      and deleted_at is null;
  end if;

  return parte_uuid;
end;
$$;

create or replace function app_private.mms_processar_lote_assistencias(lote_uuid uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  lote record;
  linha record;
  ator uuid;
  linhas_processadas integer := 0;
  partes_removidas integer := 0;
  assistencias_removidas integer := 0;
begin
  if not app_private.mms_lote_gerenciavel(lote_uuid) then
    raise exception 'usuario sem permissao para processar espelho MMS'
      using errcode = '42501';
  end if;

  if not app_private.mms_lote_assistencias_elegivel(lote_uuid) then
    return jsonb_build_object('lote_id', lote_uuid, 'processado', false, 'motivo', 'lote_inelegivel');
  end if;

  select * into lote
  from public.mms_lotes_importacao
  where id = lote_uuid;

  ator := coalesce(app_private.usuario_atual_id(), lote.updated_by, lote.created_by);

  for linha in
    select li.*
    from public.mms_linhas_importacao li
    where li.lote_importacao_id = lote_uuid
      and app_private.mms_linha_assistencia_elegivel(li.id)
    order by li.numero_linha_origem nulls last, li.created_at, li.id
  loop
    perform app_private.mms_upsert_parte_por_linha(linha.id);
    linhas_processadas := linhas_processadas + 1;
  end loop;

  update public.mms_partes_assistencia p
  set status_interno = 'removido',
      removido_em = now(),
      removido_lote_id = lote_uuid,
      lote_ultimo_id = lote_uuid,
      linha_ultima_id = p.linha_ultima_id,
      updated_by = ator
  from public.mms_assistencias a
  where p.assistencia_id = a.id
    and a.posto_id = lote.posto_id
    and a.data_atividade = lote.data_atividade
    and p.deleted_at is null
    and p.status_interno = 'ativo'
    and not exists (
      select 1
      from public.mms_linhas_importacao li
      where li.lote_importacao_id = lote_uuid
        and li.deleted_at is null
        and li.estado_validacao in ('valida', 'valida_com_alerta')
        and app_private.mms_normalizar_chave(li.numero_assistencia) = a.numero_assistencia_normalizado
        and app_private.mms_normalizar_chave(li.parte_conjunto) = p.parte_conjunto_normalizada
    );
  get diagnostics partes_removidas = row_count;

  update public.mms_assistencias a
  set status_interno = 'removido',
      removido_em = now(),
      removido_lote_id = lote_uuid,
      lote_ultimo_id = lote_uuid,
      updated_by = ator
  where a.posto_id = lote.posto_id
    and a.data_atividade = lote.data_atividade
    and a.deleted_at is null
    and a.status_interno = 'ativo'
    and not exists (
      select 1
      from public.mms_partes_assistencia p
      where p.assistencia_id = a.id
        and p.deleted_at is null
        and p.status_interno = 'ativo'
    );
  get diagnostics assistencias_removidas = row_count;

  update public.mms_assistencias a
  set status_interno = 'ativo',
      removido_em = null,
      removido_lote_id = null,
      updated_by = ator
  where a.posto_id = lote.posto_id
    and a.data_atividade = lote.data_atividade
    and a.deleted_at is null
    and a.status_interno = 'removido'
    and exists (
      select 1
      from public.mms_partes_assistencia p
      where p.assistencia_id = a.id
        and p.deleted_at is null
        and p.status_interno = 'ativo'
    );

  return jsonb_build_object(
    'lote_id', lote_uuid,
    'processado', true,
    'linhas_processadas', linhas_processadas,
    'partes_removidas', partes_removidas,
    'assistencias_removidas', assistencias_removidas
  );
end;
$$;

create or replace function app_private.mms_corrigir_assistencia(
  assistencia_uuid uuid,
  campo_arg text,
  valor_corrigido_arg text,
  motivo_arg text
)
returns uuid
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  alvo record;
  ator uuid;
begin
  ator := app_private.usuario_atual_id();
  if ator is null then
    raise exception 'usuario operacional ativo obrigatorio' using errcode = '42501';
  end if;

  if nullif(btrim(motivo_arg), '') is null then
    raise exception 'motivo da correcao e obrigatorio';
  end if;

  select * into alvo
  from public.mms_assistencias
  where id = assistencia_uuid
    and deleted_at is null;

  if alvo.id is null or not app_private.usuario_tem_acesso_posto(alvo.posto_id) then
    raise exception 'usuario sem permissao para corrigir assistencia MMS' using errcode = '42501';
  end if;

  if campo_arg = 'cliente_nome' then
    update public.mms_assistencias
    set cliente_nome_corrigido = nullif(btrim(valor_corrigido_arg), ''),
        corrigido_em = now(),
        corrigido_por = ator,
        motivo_correcao = btrim(motivo_arg),
        updated_by = ator
    where id = assistencia_uuid;
  elsif campo_arg = 'endereco' then
    update public.mms_assistencias
    set endereco_corrigido = nullif(btrim(valor_corrigido_arg), ''),
        corrigido_em = now(),
        corrigido_por = ator,
        motivo_correcao = btrim(motivo_arg),
        updated_by = ator
    where id = assistencia_uuid;
  else
    raise exception 'campo nao permitido para correcao de assistencia MMS: %', campo_arg;
  end if;

  return assistencia_uuid;
end;
$$;

create or replace function app_private.mms_corrigir_parte_assistencia(
  parte_uuid uuid,
  campo_arg text,
  valor_corrigido_arg text,
  motivo_arg text
)
returns uuid
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  alvo record;
  ator uuid;
begin
  ator := app_private.usuario_atual_id();
  if ator is null then
    raise exception 'usuario operacional ativo obrigatorio' using errcode = '42501';
  end if;

  if nullif(btrim(motivo_arg), '') is null then
    raise exception 'motivo da correcao e obrigatorio';
  end if;

  select p.*, a.posto_id
  into alvo
  from public.mms_partes_assistencia p
  join public.mms_assistencias a on a.id = p.assistencia_id
  where p.id = parte_uuid
    and p.deleted_at is null
    and a.deleted_at is null;

  if alvo.id is null or not app_private.usuario_tem_acesso_posto(alvo.posto_id) then
    raise exception 'usuario sem permissao para corrigir parte de assistencia MMS' using errcode = '42501';
  end if;

  if campo_arg = 'descricao_mercadoria' then
    update public.mms_partes_assistencia
    set descricao_mercadoria_corrigida = nullif(btrim(valor_corrigido_arg), ''),
        corrigido_em = now(),
        corrigido_por = ator,
        motivo_correcao = btrim(motivo_arg),
        updated_by = ator
    where id = parte_uuid;
  elsif campo_arg = 'recurso' then
    update public.mms_partes_assistencia
    set recurso_corrigido = nullif(btrim(valor_corrigido_arg), ''),
        corrigido_em = now(),
        corrigido_por = ator,
        motivo_correcao = btrim(motivo_arg),
        updated_by = ator
    where id = parte_uuid;
  else
    raise exception 'campo nao permitido para correcao de parte MMS: %', campo_arg;
  end if;

  return parte_uuid;
end;
$$;

create or replace view public.mms_assistencias_operacionais
with (security_invoker = true)
as
select
  a.*,
  app_private.mms_valor_visivel(a.cliente_nome_importado, a.cliente_nome_corrigido) as cliente_nome,
  app_private.mms_valor_visivel(a.endereco_importado, a.endereco_corrigido) as endereco
from public.mms_assistencias a
where a.deleted_at is null;

create or replace view public.mms_partes_assistencia_operacionais
with (security_invoker = true)
as
select
  p.*,
  app_private.mms_valor_visivel(p.descricao_mercadoria_importada, p.descricao_mercadoria_corrigida) as descricao_mercadoria,
  app_private.mms_valor_visivel(p.recurso_importado, p.recurso_corrigido) as recurso
from public.mms_partes_assistencia p
where p.deleted_at is null;

drop trigger if exists mms_assistencias_bloquear_raw_json on public.mms_assistencias;
create trigger mms_assistencias_bloquear_raw_json
before update on public.mms_assistencias
for each row execute function app_private.mms_bloquear_raw_json_espelho();

drop trigger if exists mms_partes_assistencia_bloquear_raw_json on public.mms_partes_assistencia;
create trigger mms_partes_assistencia_bloquear_raw_json
before update on public.mms_partes_assistencia
for each row execute function app_private.mms_bloquear_raw_json_espelho();

drop trigger if exists mms_assistencias_set_updated_at on public.mms_assistencias;
create trigger mms_assistencias_set_updated_at
before update on public.mms_assistencias
for each row execute function app_private.set_updated_at();

drop trigger if exists mms_partes_assistencia_set_updated_at on public.mms_partes_assistencia;
create trigger mms_partes_assistencia_set_updated_at
before update on public.mms_partes_assistencia
for each row execute function app_private.set_updated_at();

drop trigger if exists mms_assistencias_audit on public.mms_assistencias;
create trigger mms_assistencias_audit
after insert or update on public.mms_assistencias
for each row execute function app_private.auditar_assistencias_mms();

drop trigger if exists mms_partes_assistencia_audit on public.mms_partes_assistencia;
create trigger mms_partes_assistencia_audit
after insert or update on public.mms_partes_assistencia
for each row execute function app_private.auditar_assistencias_mms();

alter table public.mms_assistencias enable row level security;
alter table public.mms_partes_assistencia enable row level security;

create policy mms_assistencias_select
on public.mms_assistencias
for select
to authenticated
using (
  app_private.usuario_e_direcao_admin()
  or (
    deleted_at is null
    and app_private.usuario_tem_acesso_posto(posto_id)
  )
);

create policy mms_partes_assistencia_select
on public.mms_partes_assistencia
for select
to authenticated
using (
  app_private.usuario_e_direcao_admin()
  or (
    deleted_at is null
    and exists (
      select 1
      from public.mms_assistencias a
      where a.id = assistencia_id
        and a.deleted_at is null
        and app_private.usuario_tem_acesso_posto(a.posto_id)
    )
  )
);

revoke all on public.mms_assistencias,
  public.mms_partes_assistencia,
  public.mms_assistencias_operacionais,
  public.mms_partes_assistencia_operacionais
from anon;

revoke all on public.mms_assistencias,
  public.mms_partes_assistencia,
  public.mms_assistencias_operacionais,
  public.mms_partes_assistencia_operacionais
from authenticated;

grant select on public.mms_assistencias to authenticated;
grant select on public.mms_partes_assistencia to authenticated;
grant select on public.mms_assistencias_operacionais to authenticated;
grant select on public.mms_partes_assistencia_operacionais to authenticated;

revoke delete, truncate, references, trigger
on public.mms_assistencias,
  public.mms_partes_assistencia
from authenticated;

revoke all on function app_private.mms_normalizar_chave(text) from public;
revoke all on function app_private.mms_valor_visivel(text, text) from public;
revoke all on function app_private.mms_texto_para_numeric(text) from public;
revoke all on function app_private.mms_texto_para_integer(text) from public;
revoke all on function app_private.mms_texto_para_boolean(text) from public;
revoke all on function app_private.mms_importacao_espelho_autorizada() from public;
revoke all on function app_private.mms_raw_json_resumo_assistencia(uuid, uuid, date, text) from public;
revoke all on function app_private.mms_lote_assistencias_elegivel(uuid) from public;
revoke all on function app_private.mms_linha_assistencia_elegivel(uuid) from public;
revoke all on function app_private.mms_upsert_assistencia_por_linha(uuid) from public;
revoke all on function app_private.mms_upsert_parte_por_linha(uuid) from public;
revoke all on function app_private.mms_processar_lote_assistencias(uuid) from public;
revoke all on function app_private.mms_corrigir_assistencia(uuid, text, text, text) from public;
revoke all on function app_private.mms_corrigir_parte_assistencia(uuid, text, text, text) from public;
revoke all on function app_private.mms_bloquear_raw_json_espelho() from public;
revoke all on function app_private.auditar_assistencias_mms() from public;

grant execute on function app_private.mms_normalizar_chave(text) to authenticated;
grant execute on function app_private.mms_valor_visivel(text, text) to authenticated;
grant execute on function app_private.mms_lote_assistencias_elegivel(uuid) to authenticated;
grant execute on function app_private.mms_linha_assistencia_elegivel(uuid) to authenticated;
grant execute on function app_private.mms_processar_lote_assistencias(uuid) to authenticated;
grant execute on function app_private.mms_corrigir_assistencia(uuid, text, text, text) to authenticated;
grant execute on function app_private.mms_corrigir_parte_assistencia(uuid, text, text, text) to authenticated;
