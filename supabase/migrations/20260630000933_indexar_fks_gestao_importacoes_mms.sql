begin;
create index if not exists mms_correcoes_created_by_idx
  on public.mms_correcoes_importacao (created_by);
create index if not exists mms_erros_correcao_idx
  on public.mms_erros_importacao (correcao_importacao_id)
  where correcao_importacao_id is not null;
create index if not exists mms_erros_resolvido_por_idx
  on public.mms_erros_importacao (resolvido_por)
  where resolvido_por is not null;
create index if not exists mms_lotes_tratamento_concluido_por_idx
  on public.mms_lotes_importacao (tratamento_concluido_por)
  where tratamento_concluido_por is not null;
commit;
