begin;

do $migration$
declare
  assinatura regprocedure;
  definicao text;
begin
  foreach assinatura in array array[
    'public.reprocessar_lote_importacao_mms(uuid,integer,uuid)'::regprocedure,
    'public.desfazer_importacao_mms(uuid,text,text,uuid)'::regprocedure
  ]
  loop
    select pg_get_functiondef(assinatura) into definicao;
    if assinatura::text like 'reprocessar_lote_importacao_mms%' then
      definicao:=replace(
        definicao,
        'update public.mms_operacoes_lote set estado=''concluida'',resultado=resultado,finalizado_em=now() where id=op.id',
        'update public.mms_operacoes_lote o set estado=''concluida'',resultado=reprocessar_lote_importacao_mms.resultado,finalizado_em=now() where o.id=op.id'
      );
    else
      definicao:=replace(
        definicao,
        'update public.mms_operacoes_lote set estado=''concluida'',resultado=resultado,finalizado_em=now() where id=op.id',
        'update public.mms_operacoes_lote o set estado=''concluida'',resultado=desfazer_importacao_mms.resultado,finalizado_em=now() where o.id=op.id'
      );
    end if;
    execute definicao;
  end loop;
end
$migration$;

commit;
