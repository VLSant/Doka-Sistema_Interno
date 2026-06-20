-- Fundacao operacional do Doka
-- Supabase/PostgreSQL: usuarios operacionais, postos, escopo por posto,
-- permissoes RLS e historico centralizado.

create extension if not exists pgcrypto;

create schema if not exists app_private;
revoke all on schema app_private from public;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'perfil_usuario') then
    create type public.perfil_usuario as enum ('operador', 'supervisao', 'direcao_admin');
  end if;

  if not exists (select 1 from pg_type where typname = 'nivel_acesso_posto') then
    create type public.nivel_acesso_posto as enum ('operacional', 'supervisao', 'consulta');
  end if;
end
$$;

create or replace function app_private.set_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.cargos_funcoes (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  descricao text,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  deleted_at timestamptz,
  deleted_by uuid,
  delete_reason text,
  constraint cargos_funcoes_nome_not_blank check (btrim(nome) <> ''),
  constraint cargos_funcoes_delete_reason_required check (
    deleted_at is null or (deleted_by is not null and nullif(btrim(delete_reason), '') is not null)
  )
);

create unique index if not exists cargos_funcoes_nome_ativo_uidx
  on public.cargos_funcoes (lower(nome))
  where deleted_at is null;

create table if not exists public.usuarios (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null references auth.users(id) on delete cascade,
  nome text not null,
  email text not null,
  perfil public.perfil_usuario not null,
  cargo_funcao_id uuid references public.cargos_funcoes(id) on delete set null,
  ativo boolean not null default true,
  ultimo_login_em timestamptz,
  created_at timestamptz not null default now(),
  created_by uuid references public.usuarios(id) on delete set null,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.usuarios(id) on delete set null,
  deleted_at timestamptz,
  deleted_by uuid references public.usuarios(id) on delete set null,
  delete_reason text,
  constraint usuarios_nome_not_blank check (btrim(nome) <> ''),
  constraint usuarios_email_not_blank check (btrim(email) <> ''),
  constraint usuarios_delete_reason_required check (
    deleted_at is null or (deleted_by is not null and nullif(btrim(delete_reason), '') is not null)
  )
);

create unique index if not exists usuarios_auth_user_id_ativo_uidx
  on public.usuarios (auth_user_id)
  where deleted_at is null;

create index if not exists usuarios_perfil_idx on public.usuarios (perfil);
create index if not exists usuarios_cargo_funcao_id_idx on public.usuarios (cargo_funcao_id);
create index if not exists usuarios_ativo_idx on public.usuarios (ativo) where deleted_at is null;

alter table public.cargos_funcoes
  add constraint cargos_funcoes_created_by_fkey
  foreign key (created_by) references public.usuarios(id) on delete set null;

alter table public.cargos_funcoes
  add constraint cargos_funcoes_updated_by_fkey
  foreign key (updated_by) references public.usuarios(id) on delete set null;

alter table public.cargos_funcoes
  add constraint cargos_funcoes_deleted_by_fkey
  foreign key (deleted_by) references public.usuarios(id) on delete set null;

create table if not exists public.postos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  codigo text,
  descricao text,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  created_by uuid references public.usuarios(id) on delete set null,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.usuarios(id) on delete set null,
  deleted_at timestamptz,
  deleted_by uuid references public.usuarios(id) on delete set null,
  delete_reason text,
  constraint postos_nome_not_blank check (btrim(nome) <> ''),
  constraint postos_codigo_not_blank check (codigo is null or btrim(codigo) <> ''),
  constraint postos_delete_reason_required check (
    deleted_at is null or (deleted_by is not null and nullif(btrim(delete_reason), '') is not null)
  )
);

create unique index if not exists postos_codigo_ativo_uidx
  on public.postos (lower(codigo))
  where codigo is not null and deleted_at is null;

create index if not exists postos_ativo_idx on public.postos (ativo) where deleted_at is null;

create table if not exists public.usuarios_postos (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references public.usuarios(id) on delete cascade,
  posto_id uuid not null references public.postos(id) on delete cascade,
  nivel_acesso public.nivel_acesso_posto not null default 'operacional',
  created_at timestamptz not null default now(),
  created_by uuid references public.usuarios(id) on delete set null,
  deleted_at timestamptz,
  deleted_by uuid references public.usuarios(id) on delete set null,
  delete_reason text,
  constraint usuarios_postos_delete_reason_required check (
    deleted_at is null or (deleted_by is not null and nullif(btrim(delete_reason), '') is not null)
  )
);

create unique index if not exists usuarios_postos_usuario_posto_ativo_uidx
  on public.usuarios_postos (usuario_id, posto_id)
  where deleted_at is null;

create index if not exists usuarios_postos_posto_id_idx on public.usuarios_postos (posto_id);
create index if not exists usuarios_postos_usuario_nivel_idx
  on public.usuarios_postos (usuario_id, nivel_acesso)
  where deleted_at is null;

create table if not exists public.historico_auditoria (
  id uuid primary key default gen_random_uuid(),
  entidade_tipo text not null,
  entidade_id uuid,
  acao text not null,
  valor_anterior jsonb,
  valor_novo jsonb,
  metadata jsonb,
  usuario_id uuid references public.usuarios(id) on delete set null,
  lote_importacao_id uuid,
  created_at timestamptz not null default now(),
  constraint historico_entidade_tipo_not_blank check (btrim(entidade_tipo) <> ''),
  constraint historico_acao_not_blank check (btrim(acao) <> '')
);

create index if not exists historico_auditoria_entidade_idx
  on public.historico_auditoria (entidade_tipo, entidade_id);
create index if not exists historico_auditoria_usuario_id_idx
  on public.historico_auditoria (usuario_id);
create index if not exists historico_auditoria_created_at_idx
  on public.historico_auditoria (created_at);
create index if not exists historico_auditoria_acao_idx
  on public.historico_auditoria (acao);

create or replace function app_private.usuario_atual_id()
returns uuid
language sql
stable
security definer
set search_path = public, auth, pg_temp
as $$
  select u.id
  from public.usuarios u
  where u.auth_user_id = auth.uid()
    and u.ativo = true
    and u.deleted_at is null
  limit 1
$$;

create or replace function app_private.usuario_tem_perfil(perfil_desejado public.perfil_usuario)
returns boolean
language sql
stable
security definer
set search_path = public, auth, pg_temp
as $$
  select exists (
    select 1
    from public.usuarios u
    where u.auth_user_id = auth.uid()
      and u.perfil = perfil_desejado
      and u.ativo = true
      and u.deleted_at is null
  )
$$;

create or replace function app_private.usuario_e_direcao_admin()
returns boolean
language sql
stable
security definer
set search_path = public, auth, pg_temp
as $$
  select app_private.usuario_tem_perfil('direcao_admin'::public.perfil_usuario)
$$;

create or replace function app_private.usuario_e_supervisao()
returns boolean
language sql
stable
security definer
set search_path = public, auth, pg_temp
as $$
  select app_private.usuario_tem_perfil('supervisao'::public.perfil_usuario)
$$;

create or replace function app_private.usuario_tem_acesso_posto(posto_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public, auth, pg_temp
as $$
  select coalesce(
    app_private.usuario_e_direcao_admin()
    or exists (
      select 1
      from public.usuarios u
      join public.usuarios_postos up on up.usuario_id = u.id
      join public.postos p on p.id = up.posto_id
      where u.auth_user_id = auth.uid()
        and u.ativo = true
        and u.deleted_at is null
        and up.deleted_at is null
        and p.deleted_at is null
        and p.ativo = true
        and up.posto_id = posto_uuid
        and (
          (u.perfil = 'operador'::public.perfil_usuario and up.nivel_acesso in ('operacional', 'consulta'))
          or (u.perfil = 'supervisao'::public.perfil_usuario and up.nivel_acesso = 'supervisao')
        )
    ),
    false
  )
$$;

create or replace function app_private.registrar_auditoria(
  entidade_tipo_arg text,
  entidade_id_arg uuid,
  acao_arg text,
  valor_anterior_arg jsonb default null,
  valor_novo_arg jsonb default null,
  metadata_arg jsonb default null
)
returns void
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
begin
  insert into public.historico_auditoria (
    entidade_tipo,
    entidade_id,
    acao,
    valor_anterior,
    valor_novo,
    metadata,
    usuario_id
  )
  values (
    entidade_tipo_arg,
    entidade_id_arg,
    acao_arg,
    valor_anterior_arg,
    valor_novo_arg,
    metadata_arg,
    app_private.usuario_atual_id()
  );
end;
$$;

create or replace function app_private.auditar_cadastro()
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
begin
  entidade_id := coalesce(new.id, old.id);

  if TG_OP = 'INSERT' then
    acao_auditoria := case
      when entidade = 'usuarios_postos' then 'vinculo_posto_criado'
      else 'criado'
    end;
    depois := to_jsonb(new);
  elsif TG_OP = 'UPDATE' then
    antes := to_jsonb(old);
    depois := to_jsonb(new);
    acao_auditoria := 'atualizado';

    if old.deleted_at is null and new.deleted_at is not null then
      acao_auditoria := case
        when entidade = 'usuarios_postos' then 'vinculo_posto_removido'
        else 'excluido_logicamente'
      end;
    elsif entidade = 'usuarios' then
      if old.perfil is distinct from new.perfil then
        acao_auditoria := 'perfil_alterado';
      elsif old.ativo is distinct from new.ativo then
        acao_auditoria := case when new.ativo then 'ativado' else 'inativado' end;
      end if;
    elsif entidade in ('cargos_funcoes', 'postos') then
      if old.ativo is distinct from new.ativo then
        acao_auditoria := case when new.ativo then 'ativado' else 'inativado' end;
      end if;
    end if;
  else
    return null;
  end if;

  perform app_private.registrar_auditoria(
    entidade,
    entidade_id,
    acao_auditoria,
    antes,
    depois,
    jsonb_build_object('origem', 'trigger', 'operacao', TG_OP)
  );

  return coalesce(new, old);
end;
$$;

drop trigger if exists cargos_funcoes_set_updated_at on public.cargos_funcoes;
create trigger cargos_funcoes_set_updated_at
before update on public.cargos_funcoes
for each row execute function app_private.set_updated_at();

drop trigger if exists usuarios_set_updated_at on public.usuarios;
create trigger usuarios_set_updated_at
before update on public.usuarios
for each row execute function app_private.set_updated_at();

drop trigger if exists postos_set_updated_at on public.postos;
create trigger postos_set_updated_at
before update on public.postos
for each row execute function app_private.set_updated_at();

drop trigger if exists cargos_funcoes_audit on public.cargos_funcoes;
create trigger cargos_funcoes_audit
after insert or update on public.cargos_funcoes
for each row execute function app_private.auditar_cadastro();

drop trigger if exists usuarios_audit on public.usuarios;
create trigger usuarios_audit
after insert or update on public.usuarios
for each row execute function app_private.auditar_cadastro();

drop trigger if exists postos_audit on public.postos;
create trigger postos_audit
after insert or update on public.postos
for each row execute function app_private.auditar_cadastro();

drop trigger if exists usuarios_postos_audit on public.usuarios_postos;
create trigger usuarios_postos_audit
after insert or update on public.usuarios_postos
for each row execute function app_private.auditar_cadastro();

alter table public.cargos_funcoes enable row level security;
alter table public.usuarios enable row level security;
alter table public.postos enable row level security;
alter table public.usuarios_postos enable row level security;
alter table public.historico_auditoria enable row level security;

drop policy if exists cargos_funcoes_select_operacional on public.cargos_funcoes;
create policy cargos_funcoes_select_operacional
on public.cargos_funcoes
for select
to authenticated
using (
  deleted_at is null
  and ativo = true
  and app_private.usuario_atual_id() is not null
);

drop policy if exists cargos_funcoes_admin_select on public.cargos_funcoes;
create policy cargos_funcoes_admin_select
on public.cargos_funcoes
for select
to authenticated
using (app_private.usuario_e_direcao_admin());

drop policy if exists cargos_funcoes_admin_all on public.cargos_funcoes;
create policy cargos_funcoes_admin_insert
on public.cargos_funcoes
for insert
to authenticated
with check (app_private.usuario_e_direcao_admin());

create policy cargos_funcoes_admin_update
on public.cargos_funcoes
for update
to authenticated
using (app_private.usuario_e_direcao_admin())
with check (app_private.usuario_atual_id() is not null);

drop policy if exists usuarios_select_proprio on public.usuarios;
create policy usuarios_select_proprio
on public.usuarios
for select
to authenticated
using (
  deleted_at is null
  and (
    id = app_private.usuario_atual_id()
    or app_private.usuario_e_direcao_admin()
    or exists (
      select 1
      from public.usuarios_postos alvo
      where alvo.usuario_id = usuarios.id
        and alvo.deleted_at is null
        and app_private.usuario_tem_acesso_posto(alvo.posto_id)
    )
  )
);

drop policy if exists usuarios_admin_select on public.usuarios;
create policy usuarios_admin_select
on public.usuarios
for select
to authenticated
using (app_private.usuario_e_direcao_admin());

drop policy if exists usuarios_admin_all on public.usuarios;
create policy usuarios_admin_insert
on public.usuarios
for insert
to authenticated
with check (app_private.usuario_e_direcao_admin());

create policy usuarios_admin_update
on public.usuarios
for update
to authenticated
using (app_private.usuario_e_direcao_admin())
with check (app_private.usuario_atual_id() is not null);

drop policy if exists postos_select_por_escopo on public.postos;
create policy postos_select_por_escopo
on public.postos
for select
to authenticated
using (
  deleted_at is null
  and (
    app_private.usuario_e_direcao_admin()
    or (ativo = true and app_private.usuario_tem_acesso_posto(id))
  )
);

drop policy if exists postos_admin_select on public.postos;
create policy postos_admin_select
on public.postos
for select
to authenticated
using (app_private.usuario_e_direcao_admin());

drop policy if exists postos_admin_all on public.postos;
create policy postos_admin_insert
on public.postos
for insert
to authenticated
with check (app_private.usuario_e_direcao_admin());

create policy postos_admin_update
on public.postos
for update
to authenticated
using (app_private.usuario_e_direcao_admin())
with check (app_private.usuario_atual_id() is not null);

drop policy if exists postos_supervisao_update on public.postos;
create policy postos_supervisao_update
on public.postos
for update
to authenticated
using (
  deleted_at is null
  and app_private.usuario_e_supervisao()
  and app_private.usuario_tem_acesso_posto(id)
)
with check (
  deleted_at is null
  and app_private.usuario_e_supervisao()
  and app_private.usuario_tem_acesso_posto(id)
);

drop policy if exists usuarios_postos_select_por_escopo on public.usuarios_postos;
create policy usuarios_postos_select_por_escopo
on public.usuarios_postos
for select
to authenticated
using (
  deleted_at is null
  and (
    app_private.usuario_e_direcao_admin()
    or usuario_id = app_private.usuario_atual_id()
    or app_private.usuario_tem_acesso_posto(posto_id)
  )
);

drop policy if exists usuarios_postos_admin_select on public.usuarios_postos;
create policy usuarios_postos_admin_select
on public.usuarios_postos
for select
to authenticated
using (app_private.usuario_e_direcao_admin());

drop policy if exists usuarios_postos_admin_all on public.usuarios_postos;
create policy usuarios_postos_admin_insert
on public.usuarios_postos
for insert
to authenticated
with check (app_private.usuario_e_direcao_admin());

create policy usuarios_postos_admin_update
on public.usuarios_postos
for update
to authenticated
using (app_private.usuario_e_direcao_admin())
with check (app_private.usuario_atual_id() is not null);

drop policy if exists usuarios_postos_supervisao_update on public.usuarios_postos;
create policy usuarios_postos_supervisao_update
on public.usuarios_postos
for update
to authenticated
using (
  deleted_at is null
  and app_private.usuario_e_supervisao()
  and app_private.usuario_tem_acesso_posto(posto_id)
)
with check (
  deleted_at is null
  and app_private.usuario_e_supervisao()
  and app_private.usuario_tem_acesso_posto(posto_id)
);

drop policy if exists historico_auditoria_select_admin_supervisao on public.historico_auditoria;
create policy historico_auditoria_select_admin_supervisao
on public.historico_auditoria
for select
to authenticated
using (
  app_private.usuario_e_direcao_admin()
  or (
    app_private.usuario_e_supervisao()
    and (
      (metadata ? 'posto_id' and app_private.usuario_tem_acesso_posto((metadata ->> 'posto_id')::uuid))
      or usuario_id = app_private.usuario_atual_id()
    )
  )
);

revoke all on all tables in schema public from anon;
revoke all on public.cargos_funcoes, public.usuarios, public.postos, public.usuarios_postos, public.historico_auditoria from anon;

grant usage on schema public to authenticated;
grant usage on schema app_private to authenticated;

grant select, insert, update on public.cargos_funcoes to authenticated;
grant select, insert, update on public.usuarios to authenticated;
grant select, insert, update on public.postos to authenticated;
grant select, insert, update on public.usuarios_postos to authenticated;
grant select on public.historico_auditoria to authenticated;

revoke delete, truncate, references, trigger on public.cargos_funcoes, public.usuarios, public.postos, public.usuarios_postos from authenticated;

grant execute on function app_private.usuario_atual_id() to authenticated;
grant execute on function app_private.usuario_tem_perfil(public.perfil_usuario) to authenticated;
grant execute on function app_private.usuario_e_direcao_admin() to authenticated;
grant execute on function app_private.usuario_e_supervisao() to authenticated;
grant execute on function app_private.usuario_tem_acesso_posto(uuid) to authenticated;

revoke insert, update, delete, truncate, references, trigger on public.historico_auditoria from authenticated;
