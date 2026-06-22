-- Ajusta a validacao de metas para deixar postos inexistentes serem tratados
-- pela FK e manter o bloqueio explicito apenas para postos existentes inativos
-- ou removidos logicamente.

create or replace function app_private.validar_meta_eficiencia()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  new.tipo_atividade_normalizado := app_private.normalizar_texto_operacional(new.tipo_atividade_normalizado);

  if new.deleted_at is null and new.ativo = true then
    if exists (
      select 1
      from public.postos p
      where p.id = new.posto_id
    ) and not exists (
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
