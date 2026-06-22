-- Refina avisos de advisors da Spec 02:
-- - move extensoes usadas pela feature para schema dedicado;
-- - consolida policies permissivas equivalentes nas tabelas novas.

create schema if not exists extensions;
grant usage on schema extensions to authenticated;

alter extension unaccent set schema extensions;
alter extension btree_gist set schema extensions;

create or replace function app_private.normalizar_texto_operacional(valor text)
returns text
language sql
stable
security definer
set search_path = extensions, public, pg_temp
as $$
  select nullif(
    regexp_replace(
      lower(extensions.unaccent(btrim(coalesce(valor, '')))),
      '[[:space:]]+',
      ' ',
      'g'
    ),
    ''
  )
$$;

drop policy if exists prioridades_select_operacional on public.prioridades;
drop policy if exists prioridades_admin_select on public.prioridades;
create policy prioridades_select
on public.prioridades
for select
to authenticated
using (
  app_private.usuario_e_direcao_admin()
  or (
    ativo = true
    and deleted_at is null
    and app_private.usuario_atual_id() is not null
  )
);

drop policy if exists tipos_ocorrencia_select_operacional on public.tipos_ocorrencia;
drop policy if exists tipos_ocorrencia_admin_select on public.tipos_ocorrencia;
create policy tipos_ocorrencia_select
on public.tipos_ocorrencia
for select
to authenticated
using (
  app_private.usuario_e_direcao_admin()
  or (
    ativo = true
    and deleted_at is null
    and app_private.usuario_atual_id() is not null
  )
);

drop policy if exists metas_eficiencia_select_operacional on public.metas_eficiencia;
drop policy if exists metas_eficiencia_admin_select on public.metas_eficiencia;
create policy metas_eficiencia_select
on public.metas_eficiencia
for select
to authenticated
using (
  app_private.usuario_e_direcao_admin()
  or (
    ativo = true
    and deleted_at is null
    and app_private.usuario_tem_acesso_posto(posto_id)
  )
);

drop policy if exists metas_eficiencia_admin_insert on public.metas_eficiencia;
drop policy if exists metas_eficiencia_supervisao_insert on public.metas_eficiencia;
create policy metas_eficiencia_insert
on public.metas_eficiencia
for insert
to authenticated
with check (
  app_private.usuario_e_direcao_admin()
  or (
    app_private.usuario_e_supervisao()
    and app_private.usuario_tem_acesso_posto(posto_id)
  )
);

drop policy if exists metas_eficiencia_admin_update on public.metas_eficiencia;
drop policy if exists metas_eficiencia_supervisao_update on public.metas_eficiencia;
create policy metas_eficiencia_update
on public.metas_eficiencia
for update
to authenticated
using (
  app_private.usuario_e_direcao_admin()
  or (
    app_private.usuario_e_supervisao()
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
