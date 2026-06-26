create index if not exists mms_assistencias_lote_criacao_idx
  on public.mms_assistencias (lote_criacao_id);

create index if not exists mms_assistencias_linha_criacao_idx
  on public.mms_assistencias (linha_criacao_id);

create index if not exists mms_assistencias_removido_lote_idx
  on public.mms_assistencias (removido_lote_id);

create index if not exists mms_partes_assistencia_lote_criacao_idx
  on public.mms_partes_assistencia (lote_criacao_id);

create index if not exists mms_partes_assistencia_linha_criacao_idx
  on public.mms_partes_assistencia (linha_criacao_id);

create index if not exists mms_partes_assistencia_removido_lote_idx
  on public.mms_partes_assistencia (removido_lote_id);
