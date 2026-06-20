-- Corrige auditoria generica para ler campos especificos apenas nas tabelas que
-- possuem esses campos.

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
