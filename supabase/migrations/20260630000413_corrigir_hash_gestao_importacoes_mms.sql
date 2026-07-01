begin;

do $migration$
declare
  assinatura regprocedure;
  definicao text;
begin
  foreach assinatura in array array[
    'public.reprocessar_lote_importacao_mms(uuid,integer,uuid)'::regprocedure,
    'public.analisar_desfazer_importacao_mms(uuid)'::regprocedure,
    'public.desfazer_importacao_mms(uuid,text,text,uuid)'::regprocedure
  ]
  loop
    select pg_get_functiondef(assinatura) into definicao;
    definicao:=replace(definicao,'encode(digest(','pg_catalog.encode(extensions.digest(');
    execute definicao;
  end loop;
end
$migration$;

commit;
