-- Corrige comentarios pendentes da revisao da Spec 01:
-- - restringe leitura escopada de usuarios/vinculos a supervisao e direcao;
-- - remove execucao direta da funcao escritora de auditoria;
-- - inclui posto_id no metadata de auditoria para entidades com escopo de posto.

drop policy if exists usuarios_select_proprio on public.usuarios;
drop policy if exists usuarios_admin_select on public.usuarios;
drop policy if exists usuarios_select on public.usuarios;
create policy usuarios_select
on public.usuarios
for select
to authenticated
using (
  deleted_at is null
  and (
    id = app_private.usuario_atual_id()
    or app_private.usuario_e_direcao_admin()
    or (
      app_private.usuario_e_supervisao()
      and exists (
        select 1
        from public.usuarios_postos alvo
        where alvo.usuario_id = usuarios.id
          and alvo.deleted_at is null
          and app_private.usuario_tem_acesso_posto(alvo.posto_id)
      )
    )
  )
);

drop policy if exists usuarios_postos_select_por_escopo on public.usuarios_postos;
drop policy if exists usuarios_postos_admin_select on public.usuarios_postos;
drop policy if exists usuarios_postos_select on public.usuarios_postos;
create policy usuarios_postos_select
on public.usuarios_postos
for select
to authenticated
using (
  deleted_at is null
  and (
    app_private.usuario_e_direcao_admin()
    or usuario_id = app_private.usuario_atual_id()
    or (
      app_private.usuario_e_supervisao()
      and app_private.usuario_tem_acesso_posto(posto_id)
    )
  )
);

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
  meta jsonb := jsonb_build_object('origem', 'trigger', 'operacao', TG_OP);
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

  if entidade = 'postos' then
    meta := meta || jsonb_build_object('posto_id', entidade_id);
  elsif entidade = 'usuarios_postos' then
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

revoke execute on function app_private.registrar_auditoria(text, uuid, text, jsonb, jsonb, jsonb)
from public, authenticated;
