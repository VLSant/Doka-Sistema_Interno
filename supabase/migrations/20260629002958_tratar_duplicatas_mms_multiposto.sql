begin;

create or replace function app_private.mms_classificar_duplicata_multiposto()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  lote_multiposto boolean;
  linha_anterior record;
  contexto_area jsonb;
  repeticao_de_reenvio boolean;
begin
  select l.multiplos_postos
  into lote_multiposto
  from public.mms_lotes_importacao l
  where l.id = new.lote_importacao_id;

  if not coalesce(lote_multiposto, false)
    or new.deleted_at is not null
    or new.posto_id is null
    or new.data_atividade is null
    or app_private.mms_normalizar_chave(new.numero_assistencia) is null
    or app_private.mms_normalizar_chave(new.parte_conjunto) is null then
    return new;
  end if;

  select exists (
    select 1
    from public.mms_linhas_importacao li
    where li.lote_importacao_id = new.lote_importacao_id
      and li.numero_linha_origem = new.numero_linha_origem
      and li.deleted_at is not null
      and li.delete_reason = 'Duplicata equivalente deduplicada automaticamente'
      and li.raw_json = new.raw_json
  )
  into repeticao_de_reenvio;

  if repeticao_de_reenvio then
    update public.mms_linhas_importacao
    set deleted_at = now(),
        deleted_by = new.created_by,
        delete_reason = 'Duplicata equivalente deduplicada automaticamente',
        updated_by = new.created_by
    where id = new.id;
    return new;
  end if;

  select li.id, li.raw_json
  into linha_anterior
  from public.mms_linhas_importacao li
  where li.lote_importacao_id = new.lote_importacao_id
    and li.id <> new.id
    and li.deleted_at is null
    and li.numero_linha_origem < new.numero_linha_origem
    and li.posto_id = new.posto_id
    and li.data_atividade = new.data_atividade
    and app_private.mms_normalizar_chave(li.numero_assistencia)
      = app_private.mms_normalizar_chave(new.numero_assistencia)
    and app_private.mms_normalizar_chave(li.parte_conjunto)
      = app_private.mms_normalizar_chave(new.parte_conjunto)
  order by li.numero_linha_origem, li.id
  limit 1;

  if linha_anterior.id is null then
    return new;
  end if;

  contexto_area := jsonb_build_object(
    'area_trabalho', new.json_normalizado ->> 'area_trabalho',
    'linha_original', (
      select li.numero_linha_origem
      from public.mms_linhas_importacao li
      where li.id = linha_anterior.id
    )
  );

  if linha_anterior.raw_json = new.raw_json then
    -- A evidência permanece no banco em soft delete, mas somente a primeira
    -- ocorrência participa do staging ativo e do espelho.
    update public.mms_linhas_importacao
    set deleted_at = now(),
        deleted_by = new.created_by,
        delete_reason = 'Duplicata equivalente deduplicada automaticamente',
        updated_by = new.created_by
    where id = new.id;

    insert into public.mms_alertas_importacao (
      lote_importacao_id, linha_importacao_id, campo, codigo,
      mensagem, contexto, created_by
    ) values (
      new.lote_importacao_id, new.id, 'Chave Operacional',
      'linha_duplicada_equivalente',
      'Linha idêntica repetida; somente a primeira ocorrência será importada.',
      contexto_area, new.created_by
    );

    update public.mms_lotes_importacao
    set total_linhas_esperadas = greatest(total_linhas_esperadas - 1, 0),
        updated_by = new.created_by
    where id = new.lote_importacao_id;
  else
    update public.mms_linhas_importacao
    set estado_validacao = 'invalida',
        updated_by = new.created_by
    where id = new.id;

    insert into public.mms_erros_importacao (
      lote_importacao_id, linha_importacao_id, campo, codigo,
      mensagem, contexto, created_by
    ) values (
      new.lote_importacao_id, new.id, 'Chave Operacional',
      'linha_duplicada_conflitante',
      'A mesma assistência e parte aparecem com dados diferentes.',
      contexto_area, new.created_by
    );
  end if;

  return new;
end
$$;

create or replace function app_private.mms_preservar_linha_invalida_com_erro()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.estado_validacao = 'invalida'
    and new.estado_validacao <> 'invalida'
    and exists (
      select 1
      from public.mms_erros_importacao e
      where e.linha_importacao_id = old.id
        and e.deleted_at is null
    ) then
    new.estado_validacao := 'invalida';
  end if;
  return new;
end
$$;

drop trigger if exists mms_linhas_classificar_duplicata_multiposto
  on public.mms_linhas_importacao;
create trigger mms_linhas_classificar_duplicata_multiposto
after insert on public.mms_linhas_importacao
for each row
execute function app_private.mms_classificar_duplicata_multiposto();

drop trigger if exists mms_linhas_preservar_invalida_com_erro
  on public.mms_linhas_importacao;
create trigger mms_linhas_preservar_invalida_com_erro
before update of estado_validacao on public.mms_linhas_importacao
for each row
execute function app_private.mms_preservar_linha_invalida_com_erro();

revoke all on function app_private.mms_classificar_duplicata_multiposto(),
  app_private.mms_preservar_linha_invalida_com_erro()
from public, anon, authenticated;

commit;
