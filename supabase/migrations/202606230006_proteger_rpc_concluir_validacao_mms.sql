-- Protege a RPC de conclusao de validacao MMS contra bypass de RLS.

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
