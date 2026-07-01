begin;

create or replace function app_private.mms_capacidades_lote(lote_uuid uuid)
returns jsonb language sql stable security definer set search_path = ''
as $$
  select jsonb_build_object(
    'abrir', app_private.mms_lote_acessivel(lote_uuid),
    'baixar_arquivo', app_private.mms_cobertura_integral(lote_uuid) and exists (
      select 1 from public.mms_lotes_importacao l
      where l.id=lote_uuid and l.deleted_at is null
        and l.bucket_arquivo='mms-importacoes' and l.caminho_arquivo is not null
    ),
    'corrigir', app_private.mms_pode_corrigir(lote_uuid),
    'concluir_tratamento', (app_private.usuario_e_supervisao() or app_private.usuario_e_direcao_admin())
      and app_private.mms_cobertura_integral(lote_uuid),
    'reprocessar', (app_private.usuario_e_supervisao() or app_private.usuario_e_direcao_admin())
      and app_private.mms_cobertura_integral(lote_uuid),
    'analisar_desfazer', (app_private.usuario_e_supervisao() or app_private.usuario_e_direcao_admin())
      and app_private.mms_cobertura_integral(lote_uuid)
  )
$$;

revoke all on function app_private.mms_capacidades_lote(uuid)
from public,anon,authenticated;

commit;
