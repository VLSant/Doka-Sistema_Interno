-- Cadastros base do MVP Doka.
-- Supabase/PostgreSQL: prioridades, tipos_ocorrencia, metas_eficiencia,
-- permissoes RLS por perfil/posto, soft delete e auditoria centralizada.

create extension if not exists unaccent;
create extension if not exists btree_gist;

create schema if not exists app_private;
revoke all on schema app_private from public;

create or replace function app_private.normalizar_texto_operacional(valor text)
returns text
language sql
stable
set search_path = public, pg_temp
as $$
  select nullif(
    regexp_replace(
      lower(public.unaccent(btrim(coalesce(valor, '')))),
      '[[:space:]]+',
      ' ',
      'g'
    ),
    ''
  )
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

create or replace function app_private.set_prioridade_normalizada()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.nome_normalizado := app_private.normalizar_texto_operacional(new.nome);
  return new;
end;
$$;

create or replace function app_private.set_tipo_ocorrencia_normalizado()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.nome_normalizado := app_private.normalizar_texto_operacional(new.nome);
  return new;
end;
$$;

create or replace function app_private.validar_meta_eficiencia()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  new.tipo_atividade_normalizado := app_private.normalizar_texto_operacional(new.tipo_atividade_normalizado);

  if new.deleted_at is null and new.ativo = true then
    if not exists (
      select 1
      from public.postos p
      where p.id = new.posto_id
        and p.ativo = true
        and p.deleted_at is null
    ) then
      raise exception 'metas_eficiencia exige posto ativo e nao removido';
    end if;
  end if;

  return new;
end;
$$;

create or replace function app_private.auditar_cadastro_base()
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
  meta jsonb := jsonb_build_object('origem', 'trigger', 'operacao', TG_OP);
begin
  entidade_id := coalesce(new.id, old.id);

  if TG_OP = 'INSERT' then
    acao_auditoria := 'criado';
    depois := to_jsonb(new);
  elsif TG_OP = 'UPDATE' then
    antes := to_jsonb(old);
    depois := to_jsonb(new);
    acao_auditoria := 'atualizado';

    if old.deleted_at is null and new.deleted_at is not null then
      acao_auditoria := 'excluido_logicamente';
    elsif old.ativo is distinct from new.ativo then
      acao_auditoria := case when new.ativo then 'ativado' else 'inativado' end;
    end if;
  else
    return null;
  end if;

  if entidade = 'metas_eficiencia' then
    meta := meta || jsonb_build_object('posto_id', coalesce(new.posto_id, old.posto_id));
  end if;

  perform app_private.registrar_auditoria(
    entidade,
    entidade_id,
    acao_auditoria,
    antes,
    depois,
    meta
  );

  return coalesce(new, old);
end;
$$;

create table public.prioridades (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  nome_normalizado text not null,
  nivel integer not null,
  cor text not null,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  created_by uuid references public.usuarios(id) on delete set null,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.usuarios(id) on delete set null,
  deleted_at timestamptz,
  deleted_by uuid references public.usuarios(id) on delete set null,
  delete_reason text,
  constraint prioridades_nome_not_blank check (app_private.normalizar_texto_operacional(nome) is not null),
  constraint prioridades_nome_normalizado_not_blank check (nome_normalizado is not null and btrim(nome_normalizado) <> ''),
  constraint prioridades_nivel_positive check (nivel > 0),
  constraint prioridades_cor_format check (
    cor ~ '^#[0-9A-Fa-f]{6}$'
    or cor ~ '^doka\.[a-z0-9_]+(\.[a-z0-9_]+)*$'
  ),
  constraint prioridades_delete_reason_required check (
    app_private.campo_soft_delete_valido(deleted_at, deleted_by, delete_reason)
  )
);

create unique index prioridades_nome_ativo_uidx
  on public.prioridades (nome_normalizado)
  where ativo = true and deleted_at is null;

create unique index prioridades_nivel_ativo_uidx
  on public.prioridades (nivel)
  where ativo = true and deleted_at is null;

create index prioridades_created_by_idx on public.prioridades (created_by);
create index prioridades_updated_by_idx on public.prioridades (updated_by);
create index prioridades_deleted_by_idx on public.prioridades (deleted_by);
create index prioridades_operacional_idx on public.prioridades (ativo, deleted_at);

create table public.tipos_ocorrencia (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  nome_normalizado text not null,
  descricao text,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  created_by uuid references public.usuarios(id) on delete set null,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.usuarios(id) on delete set null,
  deleted_at timestamptz,
  deleted_by uuid references public.usuarios(id) on delete set null,
  delete_reason text,
  constraint tipos_ocorrencia_nome_not_blank check (app_private.normalizar_texto_operacional(nome) is not null),
  constraint tipos_ocorrencia_nome_normalizado_not_blank check (nome_normalizado is not null and btrim(nome_normalizado) <> ''),
  constraint tipos_ocorrencia_delete_reason_required check (
    app_private.campo_soft_delete_valido(deleted_at, deleted_by, delete_reason)
  )
);

create unique index tipos_ocorrencia_nome_ativo_uidx
  on public.tipos_ocorrencia (nome_normalizado)
  where ativo = true and deleted_at is null;

create index tipos_ocorrencia_created_by_idx on public.tipos_ocorrencia (created_by);
create index tipos_ocorrencia_updated_by_idx on public.tipos_ocorrencia (updated_by);
create index tipos_ocorrencia_deleted_by_idx on public.tipos_ocorrencia (deleted_by);
create index tipos_ocorrencia_operacional_idx on public.tipos_ocorrencia (ativo, deleted_at);

create table public.metas_eficiencia (
  id uuid primary key default gen_random_uuid(),
  posto_id uuid not null references public.postos(id) on delete restrict,
  tipo_atividade_normalizado text not null,
  meta_percentual numeric(5,2) not null,
  vigencia_inicio date not null,
  vigencia_fim date,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  created_by uuid references public.usuarios(id) on delete set null,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.usuarios(id) on delete set null,
  deleted_at timestamptz,
  deleted_by uuid references public.usuarios(id) on delete set null,
  delete_reason text,
  constraint metas_eficiencia_tipo_atividade_not_blank check (tipo_atividade_normalizado is not null and btrim(tipo_atividade_normalizado) <> ''),
  constraint metas_eficiencia_meta_percentual_range check (meta_percentual > 0 and meta_percentual <= 100),
  constraint metas_eficiencia_vigencia_ordem check (vigencia_fim is null or vigencia_fim >= vigencia_inicio),
  constraint metas_eficiencia_delete_reason_required check (
    app_private.campo_soft_delete_valido(deleted_at, deleted_by, delete_reason)
  ),
  constraint metas_eficiencia_sem_sobreposicao_excl exclude using gist (
    posto_id with =,
    tipo_atividade_normalizado with =,
    daterange(vigencia_inicio, coalesce(vigencia_fim, 'infinity'::date), '[]') with &&
  )
  where (ativo = true and deleted_at is null)
);

create index metas_eficiencia_posto_id_idx on public.metas_eficiencia (posto_id);
create index metas_eficiencia_created_by_idx on public.metas_eficiencia (created_by);
create index metas_eficiencia_updated_by_idx on public.metas_eficiencia (updated_by);
create index metas_eficiencia_deleted_by_idx on public.metas_eficiencia (deleted_by);
create index metas_eficiencia_operacional_idx
  on public.metas_eficiencia (posto_id, ativo, deleted_at);
create index metas_eficiencia_tipo_vigencia_idx
  on public.metas_eficiencia (posto_id, tipo_atividade_normalizado, vigencia_inicio, vigencia_fim)
  where deleted_at is null;

drop trigger if exists prioridades_set_normalizada on public.prioridades;
create trigger prioridades_set_normalizada
before insert or update on public.prioridades
for each row execute function app_private.set_prioridade_normalizada();

drop trigger if exists prioridades_set_updated_at on public.prioridades;
create trigger prioridades_set_updated_at
before update on public.prioridades
for each row execute function app_private.set_updated_at();

drop trigger if exists prioridades_audit on public.prioridades;
create trigger prioridades_audit
after insert or update on public.prioridades
for each row execute function app_private.auditar_cadastro_base();

drop trigger if exists tipos_ocorrencia_set_normalizado on public.tipos_ocorrencia;
create trigger tipos_ocorrencia_set_normalizado
before insert or update on public.tipos_ocorrencia
for each row execute function app_private.set_tipo_ocorrencia_normalizado();

drop trigger if exists tipos_ocorrencia_set_updated_at on public.tipos_ocorrencia;
create trigger tipos_ocorrencia_set_updated_at
before update on public.tipos_ocorrencia
for each row execute function app_private.set_updated_at();

drop trigger if exists tipos_ocorrencia_audit on public.tipos_ocorrencia;
create trigger tipos_ocorrencia_audit
after insert or update on public.tipos_ocorrencia
for each row execute function app_private.auditar_cadastro_base();

drop trigger if exists metas_eficiencia_validar on public.metas_eficiencia;
create trigger metas_eficiencia_validar
before insert or update on public.metas_eficiencia
for each row execute function app_private.validar_meta_eficiencia();

drop trigger if exists metas_eficiencia_set_updated_at on public.metas_eficiencia;
create trigger metas_eficiencia_set_updated_at
before update on public.metas_eficiencia
for each row execute function app_private.set_updated_at();

drop trigger if exists metas_eficiencia_audit on public.metas_eficiencia;
create trigger metas_eficiencia_audit
after insert or update on public.metas_eficiencia
for each row execute function app_private.auditar_cadastro_base();

alter table public.prioridades enable row level security;
alter table public.tipos_ocorrencia enable row level security;
alter table public.metas_eficiencia enable row level security;

create policy prioridades_select_operacional
on public.prioridades
for select
to authenticated
using (
  ativo = true
  and deleted_at is null
  and app_private.usuario_atual_id() is not null
);

create policy prioridades_admin_select
on public.prioridades
for select
to authenticated
using (app_private.usuario_e_direcao_admin());

create policy prioridades_admin_insert
on public.prioridades
for insert
to authenticated
with check (app_private.usuario_e_direcao_admin());

create policy prioridades_admin_update
on public.prioridades
for update
to authenticated
using (app_private.usuario_e_direcao_admin())
with check (app_private.usuario_e_direcao_admin());

create policy tipos_ocorrencia_select_operacional
on public.tipos_ocorrencia
for select
to authenticated
using (
  ativo = true
  and deleted_at is null
  and app_private.usuario_atual_id() is not null
);

create policy tipos_ocorrencia_admin_select
on public.tipos_ocorrencia
for select
to authenticated
using (app_private.usuario_e_direcao_admin());

create policy tipos_ocorrencia_admin_insert
on public.tipos_ocorrencia
for insert
to authenticated
with check (app_private.usuario_e_direcao_admin());

create policy tipos_ocorrencia_admin_update
on public.tipos_ocorrencia
for update
to authenticated
using (app_private.usuario_e_direcao_admin())
with check (app_private.usuario_e_direcao_admin());

create policy metas_eficiencia_select_operacional
on public.metas_eficiencia
for select
to authenticated
using (
  ativo = true
  and deleted_at is null
  and app_private.usuario_tem_acesso_posto(posto_id)
);

create policy metas_eficiencia_admin_select
on public.metas_eficiencia
for select
to authenticated
using (app_private.usuario_e_direcao_admin());

create policy metas_eficiencia_admin_insert
on public.metas_eficiencia
for insert
to authenticated
with check (app_private.usuario_e_direcao_admin());

create policy metas_eficiencia_admin_update
on public.metas_eficiencia
for update
to authenticated
using (app_private.usuario_e_direcao_admin())
with check (app_private.usuario_e_direcao_admin());

create policy metas_eficiencia_supervisao_insert
on public.metas_eficiencia
for insert
to authenticated
with check (
  app_private.usuario_e_supervisao()
  and app_private.usuario_tem_acesso_posto(posto_id)
);

create policy metas_eficiencia_supervisao_update
on public.metas_eficiencia
for update
to authenticated
using (
  app_private.usuario_e_supervisao()
  and app_private.usuario_tem_acesso_posto(posto_id)
)
with check (
  app_private.usuario_e_supervisao()
  and app_private.usuario_tem_acesso_posto(posto_id)
);

revoke all on public.prioridades, public.tipos_ocorrencia, public.metas_eficiencia from anon;
revoke all on public.prioridades, public.tipos_ocorrencia, public.metas_eficiencia from authenticated;

grant select, insert, update on public.prioridades to authenticated;
grant select, insert, update on public.tipos_ocorrencia to authenticated;
grant select, insert, update on public.metas_eficiencia to authenticated;

revoke delete, truncate, references, trigger
on public.prioridades, public.tipos_ocorrencia, public.metas_eficiencia
from authenticated;

revoke all on function app_private.set_prioridade_normalizada() from public;
revoke all on function app_private.set_tipo_ocorrencia_normalizado() from public;
revoke all on function app_private.validar_meta_eficiencia() from public;
revoke all on function app_private.auditar_cadastro_base() from public;
revoke all on function app_private.campo_soft_delete_valido(timestamptz, uuid, text) from public;

grant execute on function app_private.normalizar_texto_operacional(text) to authenticated;
grant execute on function app_private.campo_soft_delete_valido(timestamptz, uuid, text) to authenticated;
