-- Importacao MMS - Lotes, Staging e Validacao Bruta.
-- Base database-first para preservar planilhas MMS em staging auditavel.

create extension if not exists pgcrypto;

create schema if not exists app_private;
revoke all on schema app_private from public;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'mms_status_lote_importacao') then
    create type public.mms_status_lote_importacao as enum (
      'importado',
      'importado_com_alertas',
      'erro',
      'cancelado'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'mms_estado_processamento_lote') then
    create type public.mms_estado_processamento_lote as enum (
      'recebido',
      'processando',
      'validado'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'mms_estado_validacao_linha') then
    create type public.mms_estado_validacao_linha as enum (
      'pendente',
      'valida',
      'valida_com_alerta',
      'invalida',
      'ignorada'
    );
  end if;
end
$$;

create or replace function app_private.mms_raw_json_linha_valido(valor jsonb)
returns boolean
language sql
immutable
set search_path = pg_temp
as $$
  select valor is not null
    and valor <> 'null'::jsonb
    and not (jsonb_typeof(valor) = 'object' and valor = '{}'::jsonb)
    and not (jsonb_typeof(valor) = 'array' and valor = '[]'::jsonb)
    and not (jsonb_typeof(valor) = 'string' and nullif(btrim(valor #>> '{}'), '') is null)
$$;

create or replace function app_private.mms_validar_lote()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not exists (
    select 1
    from public.postos p
    where p.id = new.posto_id
      and p.ativo = true
      and p.deleted_at is null
  ) then
    raise exception 'mms_lotes_importacao exige posto ativo e nao removido';
  end if;

  if new.estado_processamento = 'processando'::public.mms_estado_processamento_lote
     and new.processamento_iniciado_at is null then
    new.processamento_iniciado_at := now();
  end if;

  if new.estado_processamento = 'validado'::public.mms_estado_processamento_lote
     and new.processamento_finalizado_at is null then
    new.processamento_finalizado_at := now();
  end if;

  return new;
end;
$$;

create or replace function app_private.mms_bloquear_update_raw_json()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if old.raw_json is distinct from new.raw_json then
    raise exception 'raw_json original da linha MMS nao pode ser alterado';
  end if;

  return new;
end;
$$;

create or replace function app_private.mms_validar_vinculo_linha()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.linha_importacao_id is not null and not exists (
    select 1
    from public.mms_linhas_importacao li
    where li.id = new.linha_importacao_id
      and li.lote_importacao_id = new.lote_importacao_id
  ) then
    raise exception 'linha_importacao_id deve pertencer ao mesmo lote_importacao_id';
  end if;

  return new;
end;
$$;

create or replace function app_private.mms_recalcular_totais_lote(lote_uuid uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  totais record;
begin
  select
    count(li.id)::integer as total_linhas,
    count(li.id) filter (
      where not exists (
          select 1
          from public.mms_erros_importacao e
          where e.lote_importacao_id = li.lote_importacao_id
            and e.linha_importacao_id = li.id
            and e.deleted_at is null
        )
    )::integer as total_linhas_validas,
    count(li.id) filter (
      where exists (
        select 1
        from public.mms_erros_importacao e
        where e.lote_importacao_id = li.lote_importacao_id
          and e.linha_importacao_id = li.id
          and e.deleted_at is null
      )
    )::integer as total_linhas_com_erro,
    count(li.id) filter (
      where exists (
        select 1
        from public.mms_alertas_importacao a
        where a.lote_importacao_id = li.lote_importacao_id
          and a.linha_importacao_id = li.id
          and a.deleted_at is null
      )
    )::integer as total_linhas_com_alerta,
    count(li.id) filter (
      where li.estado_validacao = 'ignorada'::public.mms_estado_validacao_linha
    )::integer as total_linhas_ignoradas
  into totais
  from public.mms_linhas_importacao li
  where li.lote_importacao_id = lote_uuid
    and li.deleted_at is null;

  update public.mms_lotes_importacao
  set total_linhas = coalesce(totais.total_linhas, 0),
      total_linhas_validas = coalesce(totais.total_linhas_validas, 0),
      total_linhas_com_erro = coalesce(totais.total_linhas_com_erro, 0),
      total_linhas_com_alerta = coalesce(totais.total_linhas_com_alerta, 0),
      total_linhas_ignoradas = coalesce(totais.total_linhas_ignoradas, 0)
  where id = lote_uuid;
end;
$$;

create or replace function app_private.mms_recalcular_totais_trigger()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  lote_uuid uuid;
begin
  lote_uuid := coalesce(new.lote_importacao_id, old.lote_importacao_id);
  perform app_private.mms_recalcular_totais_lote(lote_uuid);
  return coalesce(new, old);
end;
$$;

create or replace function app_private.mms_concluir_validacao_lote(lote_uuid uuid)
returns public.mms_status_lote_importacao
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  possui_erro boolean;
  possui_alerta boolean;
  novo_status public.mms_status_lote_importacao;
begin
  if not app_private.mms_lote_gerenciavel(lote_uuid) then
    raise exception 'usuario sem permissao para concluir validacao do lote MMS'
      using errcode = '42501';
  end if;

  perform app_private.mms_recalcular_totais_lote(lote_uuid);

  select exists (
    select 1
    from public.mms_erros_importacao e
    where e.lote_importacao_id = lote_uuid
      and e.deleted_at is null
  )
  into possui_erro;

  select exists (
    select 1
    from public.mms_alertas_importacao a
    where a.lote_importacao_id = lote_uuid
      and a.deleted_at is null
  )
  into possui_alerta;

  novo_status := case
    when possui_erro then 'erro'::public.mms_status_lote_importacao
    when possui_alerta then 'importado_com_alertas'::public.mms_status_lote_importacao
    else 'importado'::public.mms_status_lote_importacao
  end;

  update public.mms_lotes_importacao
  set estado_processamento = 'validado'::public.mms_estado_processamento_lote,
      status = novo_status,
      processamento_finalizado_at = coalesce(processamento_finalizado_at, now())
  where id = lote_uuid;

  return novo_status;
end;
$$;

create or replace function app_private.mms_atualizar_linha_candidatos(
  linha_uuid uuid,
  posto_uuid uuid default null,
  data_atividade_arg date default null,
  numero_assistencia_arg text default null,
  parte_conjunto_arg text default null,
  estado_validacao_arg public.mms_estado_validacao_linha default null
)
returns void
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  lote_uuid uuid;
begin
  select li.lote_importacao_id
  into lote_uuid
  from public.mms_linhas_importacao li
  where li.id = linha_uuid;

  if lote_uuid is null then
    raise exception 'linha de importacao MMS nao encontrada';
  end if;

  if not app_private.mms_lote_gerenciavel(lote_uuid) then
    raise exception 'usuario sem permissao para atualizar candidatos da linha MMS';
  end if;

  update public.mms_linhas_importacao
  set posto_id = posto_uuid,
      data_atividade = data_atividade_arg,
      numero_assistencia = nullif(btrim(numero_assistencia_arg), ''),
      parte_conjunto = nullif(btrim(parte_conjunto_arg), ''),
      estado_validacao = coalesce(estado_validacao_arg, estado_validacao),
      updated_by = app_private.usuario_atual_id()
  where id = linha_uuid;
end;
$$;

create or replace function app_private.auditar_importacao_mms()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  entidade text := TG_TABLE_NAME;
  entidade_id uuid := coalesce(new.id, old.id);
  acao_auditoria text;
  antes jsonb;
  depois jsonb;
  lote_uuid uuid;
  posto_uuid uuid;
  nome_origem_valor text;
  status_valor text;
  linha_uuid uuid;
begin
  if TG_OP = 'INSERT' then
    acao_auditoria := case entidade
      when 'mms_linhas_importacao' then 'criada'
      else 'criado'
    end;
    depois := to_jsonb(new);
  elsif TG_OP = 'UPDATE' then
    antes := to_jsonb(old);
    depois := to_jsonb(new);
    acao_auditoria := 'atualizado';

    if old.deleted_at is null and new.deleted_at is not null then
      acao_auditoria := 'soft_delete_registrado';
    elsif entidade = 'mms_lotes_importacao' then
      if old.status is distinct from new.status then
        acao_auditoria := case
          when new.status = 'cancelado'::public.mms_status_lote_importacao then 'cancelado'
          else 'status_alterado'
        end;
      elsif old.estado_processamento is distinct from new.estado_processamento then
        acao_auditoria := case
          when new.estado_processamento = 'processando'::public.mms_estado_processamento_lote then 'processamento_iniciado'
          when new.estado_processamento = 'validado'::public.mms_estado_processamento_lote then 'validacao_concluida'
          else 'atualizado'
        end;
      end if;
    elsif entidade = 'mms_linhas_importacao' then
      if old.estado_validacao is distinct from new.estado_validacao then
        acao_auditoria := 'validada';
      end if;
    end if;
  else
    return null;
  end if;

  if entidade = 'mms_lotes_importacao' then
    lote_uuid := entidade_id;
    posto_uuid := coalesce(new.posto_id, old.posto_id);
    nome_origem_valor := coalesce(new.nome_origem, old.nome_origem);
    status_valor := coalesce(new.status::text, old.status::text);
  elsif entidade = 'mms_linhas_importacao' then
    lote_uuid := coalesce(new.lote_importacao_id, old.lote_importacao_id);
    linha_uuid := entidade_id;
  else
    lote_uuid := coalesce(new.lote_importacao_id, old.lote_importacao_id);
    linha_uuid := coalesce(new.linha_importacao_id, old.linha_importacao_id);
  end if;

  if lote_uuid is not null and entidade <> 'mms_lotes_importacao' then
    select l.posto_id, l.nome_origem, l.status::text
    into posto_uuid, nome_origem_valor, status_valor
    from public.mms_lotes_importacao l
    where l.id = lote_uuid;
  end if;

  perform app_private.registrar_auditoria(
    entidade,
    entidade_id,
    acao_auditoria,
    antes,
    depois,
    jsonb_strip_nulls(jsonb_build_object(
      'origem', 'trigger',
      'operacao', TG_OP,
      'lote_importacao_id', lote_uuid,
      'linha_importacao_id', linha_uuid,
      'posto_id', posto_uuid,
      'nome_origem', nome_origem_valor,
      'status', status_valor
    ))
  );

  return coalesce(new, old);
end;
$$;

create table public.mms_lotes_importacao (
  id uuid primary key default gen_random_uuid(),
  nome_origem text not null,
  posto_id uuid not null references public.postos(id) on delete restrict,
  data_atividade date,
  usuario_importador_id uuid not null references public.usuarios(id) on delete restrict,
  status public.mms_status_lote_importacao,
  estado_processamento public.mms_estado_processamento_lote not null default 'recebido',
  processamento_iniciado_at timestamptz,
  processamento_finalizado_at timestamptz,
  total_linhas integer not null default 0,
  total_linhas_validas integer not null default 0,
  total_linhas_com_erro integer not null default 0,
  total_linhas_com_alerta integer not null default 0,
  total_linhas_ignoradas integer not null default 0,
  created_at timestamptz not null default now(),
  created_by uuid not null references public.usuarios(id) on delete restrict,
  updated_at timestamptz not null default now(),
  updated_by uuid not null references public.usuarios(id) on delete restrict,
  deleted_at timestamptz,
  deleted_by uuid references public.usuarios(id) on delete restrict,
  delete_reason text,
  constraint mms_lotes_importacao_nome_origem_not_blank check (btrim(nome_origem) <> ''),
  constraint mms_lotes_importacao_status_lifecycle check (
    coalesce(status = 'cancelado'::public.mms_status_lote_importacao, false)
    or (estado_processamento in ('recebido', 'processando') and status is null)
    or (
      estado_processamento = 'validado'
      and status is not null
      and status in ('importado', 'importado_com_alertas', 'erro')
    )
  ),
  constraint mms_lotes_importacao_totais_non_negative check (
    total_linhas >= 0
    and total_linhas_validas >= 0
    and total_linhas_com_erro >= 0
    and total_linhas_com_alerta >= 0
    and total_linhas_ignoradas >= 0
  ),
  constraint mms_lotes_importacao_totais_consistentes check (
    total_linhas_validas <= total_linhas
    and total_linhas_com_erro <= total_linhas
    and total_linhas_com_alerta <= total_linhas
    and total_linhas_ignoradas <= total_linhas
  ),
  constraint mms_lotes_importacao_soft_delete_valido check (
    app_private.campo_soft_delete_valido(deleted_at, deleted_by, delete_reason)
  )
);

create table public.mms_linhas_importacao (
  id uuid primary key default gen_random_uuid(),
  lote_importacao_id uuid not null references public.mms_lotes_importacao(id) on delete restrict,
  numero_linha_origem integer,
  raw_json jsonb not null,
  posto_id uuid references public.postos(id) on delete restrict,
  data_atividade date,
  numero_assistencia text,
  parte_conjunto text,
  estado_validacao public.mms_estado_validacao_linha not null default 'pendente',
  created_at timestamptz not null default now(),
  created_by uuid not null references public.usuarios(id) on delete restrict,
  updated_at timestamptz not null default now(),
  updated_by uuid not null references public.usuarios(id) on delete restrict,
  deleted_at timestamptz,
  deleted_by uuid references public.usuarios(id) on delete restrict,
  delete_reason text,
  constraint mms_linhas_importacao_numero_linha_positive check (
    numero_linha_origem is null or numero_linha_origem > 0
  ),
  constraint mms_linhas_importacao_raw_json_non_empty check (
    app_private.mms_raw_json_linha_valido(raw_json)
  ),
  constraint mms_linhas_importacao_numero_assistencia_not_blank check (
    numero_assistencia is null or btrim(numero_assistencia) <> ''
  ),
  constraint mms_linhas_importacao_parte_conjunto_not_blank check (
    parte_conjunto is null or btrim(parte_conjunto) <> ''
  ),
  constraint mms_linhas_importacao_soft_delete_valido check (
    app_private.campo_soft_delete_valido(deleted_at, deleted_by, delete_reason)
  )
);

create table public.mms_erros_importacao (
  id uuid primary key default gen_random_uuid(),
  lote_importacao_id uuid not null references public.mms_lotes_importacao(id) on delete restrict,
  linha_importacao_id uuid references public.mms_linhas_importacao(id) on delete restrict,
  campo text,
  codigo text not null,
  mensagem text not null,
  contexto jsonb,
  created_at timestamptz not null default now(),
  created_by uuid not null references public.usuarios(id) on delete restrict,
  deleted_at timestamptz,
  deleted_by uuid references public.usuarios(id) on delete restrict,
  delete_reason text,
  constraint mms_erros_importacao_campo_not_blank check (campo is null or btrim(campo) <> ''),
  constraint mms_erros_importacao_codigo_not_blank check (btrim(codigo) <> ''),
  constraint mms_erros_importacao_mensagem_not_blank check (btrim(mensagem) <> ''),
  constraint mms_erros_importacao_soft_delete_valido check (
    app_private.campo_soft_delete_valido(deleted_at, deleted_by, delete_reason)
  )
);

create table public.mms_alertas_importacao (
  id uuid primary key default gen_random_uuid(),
  lote_importacao_id uuid not null references public.mms_lotes_importacao(id) on delete restrict,
  linha_importacao_id uuid references public.mms_linhas_importacao(id) on delete restrict,
  campo text,
  codigo text not null,
  mensagem text not null,
  contexto jsonb,
  created_at timestamptz not null default now(),
  created_by uuid not null references public.usuarios(id) on delete restrict,
  deleted_at timestamptz,
  deleted_by uuid references public.usuarios(id) on delete restrict,
  delete_reason text,
  constraint mms_alertas_importacao_campo_not_blank check (campo is null or btrim(campo) <> ''),
  constraint mms_alertas_importacao_codigo_not_blank check (btrim(codigo) <> ''),
  constraint mms_alertas_importacao_mensagem_not_blank check (btrim(mensagem) <> ''),
  constraint mms_alertas_importacao_soft_delete_valido check (
    app_private.campo_soft_delete_valido(deleted_at, deleted_by, delete_reason)
  )
);

create index mms_lotes_importacao_posto_id_idx on public.mms_lotes_importacao (posto_id);
create index mms_lotes_importacao_status_idx on public.mms_lotes_importacao (status);
create index mms_lotes_importacao_estado_processamento_idx on public.mms_lotes_importacao (estado_processamento);
create index mms_lotes_importacao_data_atividade_idx on public.mms_lotes_importacao (data_atividade);
create index mms_lotes_importacao_created_at_idx on public.mms_lotes_importacao (created_at);
create index mms_lotes_importacao_deleted_at_idx on public.mms_lotes_importacao (deleted_at);
create index mms_lotes_importacao_usuario_importador_idx on public.mms_lotes_importacao (usuario_importador_id);
create index mms_lotes_importacao_created_by_idx on public.mms_lotes_importacao (created_by);
create index mms_lotes_importacao_updated_by_idx on public.mms_lotes_importacao (updated_by);
create index mms_lotes_importacao_deleted_by_idx on public.mms_lotes_importacao (deleted_by);
create index mms_lotes_importacao_operacional_idx
  on public.mms_lotes_importacao (posto_id, status, data_atividade, deleted_at);

create index mms_linhas_importacao_lote_idx on public.mms_linhas_importacao (lote_importacao_id);
create index mms_linhas_importacao_numero_linha_idx on public.mms_linhas_importacao (numero_linha_origem);
create index mms_linhas_importacao_estado_validacao_idx on public.mms_linhas_importacao (estado_validacao);
create index mms_linhas_importacao_posto_id_idx on public.mms_linhas_importacao (posto_id);
create index mms_linhas_importacao_data_atividade_idx on public.mms_linhas_importacao (data_atividade);
create index mms_linhas_importacao_numero_assistencia_idx on public.mms_linhas_importacao (numero_assistencia);
create index mms_linhas_importacao_parte_conjunto_idx on public.mms_linhas_importacao (parte_conjunto);
create index mms_linhas_importacao_deleted_at_idx on public.mms_linhas_importacao (deleted_at);
create index mms_linhas_importacao_created_by_idx on public.mms_linhas_importacao (created_by);
create index mms_linhas_importacao_updated_by_idx on public.mms_linhas_importacao (updated_by);
create index mms_linhas_importacao_deleted_by_idx on public.mms_linhas_importacao (deleted_by);

create index mms_erros_importacao_lote_idx on public.mms_erros_importacao (lote_importacao_id);
create index mms_erros_importacao_linha_idx on public.mms_erros_importacao (linha_importacao_id);
create index mms_erros_importacao_codigo_idx on public.mms_erros_importacao (codigo);
create index mms_erros_importacao_campo_idx on public.mms_erros_importacao (campo);
create index mms_erros_importacao_deleted_at_idx on public.mms_erros_importacao (deleted_at);
create index mms_erros_importacao_created_by_idx on public.mms_erros_importacao (created_by);
create index mms_erros_importacao_deleted_by_idx on public.mms_erros_importacao (deleted_by);

create index mms_alertas_importacao_lote_idx on public.mms_alertas_importacao (lote_importacao_id);
create index mms_alertas_importacao_linha_idx on public.mms_alertas_importacao (linha_importacao_id);
create index mms_alertas_importacao_codigo_idx on public.mms_alertas_importacao (codigo);
create index mms_alertas_importacao_campo_idx on public.mms_alertas_importacao (campo);
create index mms_alertas_importacao_deleted_at_idx on public.mms_alertas_importacao (deleted_at);
create index mms_alertas_importacao_created_by_idx on public.mms_alertas_importacao (created_by);
create index mms_alertas_importacao_deleted_by_idx on public.mms_alertas_importacao (deleted_by);

create or replace function app_private.mms_lote_acessivel(lote_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public, auth, pg_temp
as $$
  select coalesce(
    exists (
      select 1
      from public.mms_lotes_importacao l
      where l.id = lote_uuid
        and (
          app_private.usuario_e_direcao_admin()
          or (
            l.deleted_at is null
            and app_private.usuario_tem_acesso_posto(l.posto_id)
          )
        )
    ),
    false
  )
$$;

create or replace function app_private.mms_lote_gerenciavel(lote_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public, auth, pg_temp
as $$
  select coalesce(
    exists (
      select 1
      from public.mms_lotes_importacao l
      where l.id = lote_uuid
        and (
          app_private.usuario_e_direcao_admin()
          or (
            l.deleted_at is null
            and app_private.usuario_e_supervisao()
            and app_private.usuario_tem_acesso_posto(l.posto_id)
          )
        )
    ),
    false
  )
$$;

drop trigger if exists mms_lotes_importacao_validar on public.mms_lotes_importacao;
create trigger mms_lotes_importacao_validar
before insert or update on public.mms_lotes_importacao
for each row execute function app_private.mms_validar_lote();

drop trigger if exists mms_lotes_importacao_set_updated_at on public.mms_lotes_importacao;
create trigger mms_lotes_importacao_set_updated_at
before update on public.mms_lotes_importacao
for each row execute function app_private.set_updated_at();

drop trigger if exists mms_lotes_importacao_audit on public.mms_lotes_importacao;
create trigger mms_lotes_importacao_audit
after insert or update on public.mms_lotes_importacao
for each row execute function app_private.auditar_importacao_mms();

drop trigger if exists mms_linhas_importacao_bloquear_raw_json on public.mms_linhas_importacao;
create trigger mms_linhas_importacao_bloquear_raw_json
before update on public.mms_linhas_importacao
for each row execute function app_private.mms_bloquear_update_raw_json();

drop trigger if exists mms_linhas_importacao_set_updated_at on public.mms_linhas_importacao;
create trigger mms_linhas_importacao_set_updated_at
before update on public.mms_linhas_importacao
for each row execute function app_private.set_updated_at();

drop trigger if exists mms_linhas_importacao_recalcular_totais on public.mms_linhas_importacao;
create trigger mms_linhas_importacao_recalcular_totais
after insert or update on public.mms_linhas_importacao
for each row execute function app_private.mms_recalcular_totais_trigger();

drop trigger if exists mms_linhas_importacao_audit on public.mms_linhas_importacao;
create trigger mms_linhas_importacao_audit
after insert or update on public.mms_linhas_importacao
for each row execute function app_private.auditar_importacao_mms();

drop trigger if exists mms_erros_importacao_validar_linha on public.mms_erros_importacao;
create trigger mms_erros_importacao_validar_linha
before insert or update on public.mms_erros_importacao
for each row execute function app_private.mms_validar_vinculo_linha();

drop trigger if exists mms_erros_importacao_recalcular_totais on public.mms_erros_importacao;
create trigger mms_erros_importacao_recalcular_totais
after insert or update on public.mms_erros_importacao
for each row execute function app_private.mms_recalcular_totais_trigger();

drop trigger if exists mms_erros_importacao_audit on public.mms_erros_importacao;
create trigger mms_erros_importacao_audit
after insert or update on public.mms_erros_importacao
for each row execute function app_private.auditar_importacao_mms();

drop trigger if exists mms_alertas_importacao_validar_linha on public.mms_alertas_importacao;
create trigger mms_alertas_importacao_validar_linha
before insert or update on public.mms_alertas_importacao
for each row execute function app_private.mms_validar_vinculo_linha();

drop trigger if exists mms_alertas_importacao_recalcular_totais on public.mms_alertas_importacao;
create trigger mms_alertas_importacao_recalcular_totais
after insert or update on public.mms_alertas_importacao
for each row execute function app_private.mms_recalcular_totais_trigger();

drop trigger if exists mms_alertas_importacao_audit on public.mms_alertas_importacao;
create trigger mms_alertas_importacao_audit
after insert or update on public.mms_alertas_importacao
for each row execute function app_private.auditar_importacao_mms();

alter table public.mms_lotes_importacao enable row level security;
alter table public.mms_linhas_importacao enable row level security;
alter table public.mms_erros_importacao enable row level security;
alter table public.mms_alertas_importacao enable row level security;

create policy mms_lotes_importacao_select
on public.mms_lotes_importacao
for select
to authenticated
using (
  app_private.usuario_e_direcao_admin()
  or (
    deleted_at is null
    and app_private.usuario_tem_acesso_posto(posto_id)
  )
);

create policy mms_lotes_importacao_insert
on public.mms_lotes_importacao
for insert
to authenticated
with check (
  app_private.usuario_e_direcao_admin()
  or app_private.usuario_tem_acesso_posto(posto_id)
);

create policy mms_lotes_importacao_update
on public.mms_lotes_importacao
for update
to authenticated
using (
  app_private.usuario_e_direcao_admin()
  or (
    deleted_at is null
    and app_private.usuario_e_supervisao()
    and app_private.usuario_tem_acesso_posto(posto_id)
  )
)
with check (
  app_private.usuario_e_direcao_admin()
  or (
    app_private.usuario_e_supervisao()
    and app_private.usuario_tem_acesso_posto(posto_id)
  )
);

create policy mms_linhas_importacao_select
on public.mms_linhas_importacao
for select
to authenticated
using (
  app_private.usuario_e_direcao_admin()
  or (
    deleted_at is null
    and app_private.mms_lote_acessivel(lote_importacao_id)
  )
);

create policy mms_linhas_importacao_insert
on public.mms_linhas_importacao
for insert
to authenticated
with check (
  app_private.mms_lote_acessivel(lote_importacao_id)
);

create policy mms_linhas_importacao_update
on public.mms_linhas_importacao
for update
to authenticated
using (
  app_private.usuario_e_direcao_admin()
  or (
    deleted_at is null
    and app_private.mms_lote_gerenciavel(lote_importacao_id)
  )
)
with check (
  app_private.mms_lote_gerenciavel(lote_importacao_id)
);

create policy mms_erros_importacao_select
on public.mms_erros_importacao
for select
to authenticated
using (
  app_private.usuario_e_direcao_admin()
  or (
    deleted_at is null
    and app_private.mms_lote_acessivel(lote_importacao_id)
  )
);

create policy mms_erros_importacao_insert
on public.mms_erros_importacao
for insert
to authenticated
with check (
  app_private.usuario_e_direcao_admin()
  or app_private.mms_lote_gerenciavel(lote_importacao_id)
);

create policy mms_erros_importacao_update
on public.mms_erros_importacao
for update
to authenticated
using (
  app_private.usuario_e_direcao_admin()
  or (
    deleted_at is null
    and app_private.mms_lote_gerenciavel(lote_importacao_id)
  )
)
with check (
  app_private.usuario_e_direcao_admin()
  or app_private.mms_lote_gerenciavel(lote_importacao_id)
);

create policy mms_alertas_importacao_select
on public.mms_alertas_importacao
for select
to authenticated
using (
  app_private.usuario_e_direcao_admin()
  or (
    deleted_at is null
    and app_private.mms_lote_acessivel(lote_importacao_id)
  )
);

create policy mms_alertas_importacao_insert
on public.mms_alertas_importacao
for insert
to authenticated
with check (
  app_private.usuario_e_direcao_admin()
  or app_private.mms_lote_gerenciavel(lote_importacao_id)
);

create policy mms_alertas_importacao_update
on public.mms_alertas_importacao
for update
to authenticated
using (
  app_private.usuario_e_direcao_admin()
  or (
    deleted_at is null
    and app_private.mms_lote_gerenciavel(lote_importacao_id)
  )
)
with check (
  app_private.usuario_e_direcao_admin()
  or app_private.mms_lote_gerenciavel(lote_importacao_id)
);

revoke all on public.mms_lotes_importacao,
  public.mms_linhas_importacao,
  public.mms_erros_importacao,
  public.mms_alertas_importacao
from anon;

revoke all on public.mms_lotes_importacao,
  public.mms_linhas_importacao,
  public.mms_erros_importacao,
  public.mms_alertas_importacao
from authenticated;

grant select, insert, update on public.mms_lotes_importacao to authenticated;
grant select, insert, update on public.mms_linhas_importacao to authenticated;
grant select, insert, update on public.mms_erros_importacao to authenticated;
grant select, insert, update on public.mms_alertas_importacao to authenticated;

revoke delete, truncate, references, trigger
on public.mms_lotes_importacao,
  public.mms_linhas_importacao,
  public.mms_erros_importacao,
  public.mms_alertas_importacao
from authenticated;

revoke all on function app_private.mms_raw_json_linha_valido(jsonb) from public;
revoke all on function app_private.mms_lote_acessivel(uuid) from public;
revoke all on function app_private.mms_lote_gerenciavel(uuid) from public;
revoke all on function app_private.mms_validar_lote() from public;
revoke all on function app_private.mms_bloquear_update_raw_json() from public;
revoke all on function app_private.mms_validar_vinculo_linha() from public;
revoke all on function app_private.mms_recalcular_totais_lote(uuid) from public;
revoke all on function app_private.mms_recalcular_totais_trigger() from public;
revoke all on function app_private.mms_concluir_validacao_lote(uuid) from public;
revoke all on function app_private.mms_atualizar_linha_candidatos(uuid, uuid, date, text, text, public.mms_estado_validacao_linha) from public;
revoke all on function app_private.auditar_importacao_mms() from public;

grant execute on function app_private.mms_raw_json_linha_valido(jsonb) to authenticated;
grant execute on function app_private.mms_lote_acessivel(uuid) to authenticated;
grant execute on function app_private.mms_lote_gerenciavel(uuid) to authenticated;
grant execute on function app_private.mms_recalcular_totais_lote(uuid) to authenticated;
grant execute on function app_private.mms_concluir_validacao_lote(uuid) to authenticated;
grant execute on function app_private.mms_atualizar_linha_candidatos(uuid, uuid, date, text, text, public.mms_estado_validacao_linha) to authenticated;
