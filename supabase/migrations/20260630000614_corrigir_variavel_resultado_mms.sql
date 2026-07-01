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
    definicao:=replace(definicao,' resultado jsonb;',' resultado_operacao jsonb;');
    definicao:=replace(definicao,'resultado:=','resultado_operacao:=');
    definicao:=replace(definicao,'resultado_processamento=resultado,','resultado_processamento=resultado_operacao,');
    definicao:=replace(definicao,'resultado=reprocessar_lote_importacao_mms.resultado,','resultado=resultado_operacao,');
    definicao:=replace(definicao,'resultado=desfazer_importacao_mms.resultado,','resultado=resultado_operacao,');
    definicao:=replace(definicao,'''resultado'',resultado,','''resultado'',resultado_operacao,');
    execute definicao;
  end loop;
end
$migration$;

commit;
