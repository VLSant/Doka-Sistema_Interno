-- Corrige total_linhas_validas para contar toda linha ativa sem erro bloqueante.

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
