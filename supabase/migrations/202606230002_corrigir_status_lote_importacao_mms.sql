-- Corrige a constraint de ciclo do lote MMS para impedir status nulo em lote validado.

alter table public.mms_lotes_importacao
  drop constraint if exists mms_lotes_importacao_status_lifecycle;

alter table public.mms_lotes_importacao
  add constraint mms_lotes_importacao_status_lifecycle check (
    coalesce(status = 'cancelado'::public.mms_status_lote_importacao, false)
    or (estado_processamento in ('recebido', 'processando') and status is null)
    or (
      estado_processamento = 'validado'
      and status is not null
      and status in ('importado', 'importado_com_alertas', 'erro')
    )
  );
