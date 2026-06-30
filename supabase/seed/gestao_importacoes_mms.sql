-- Cenários determinísticos da Spec 007.
-- Execute após os seeds de fundação/staging. Os IDs fixos facilitam o aceite.
do $$
declare
  ator uuid;
  posto_a uuid;
  posto_b uuid;
  lote_predecessor constant uuid:='70000000-0000-4000-8000-000000000001';
  lote_atual constant uuid:='70000000-0000-4000-8000-000000000002';
  lote_bloqueado constant uuid:='70000000-0000-4000-8000-000000000003';
begin
  select id into ator from public.usuarios
  where email='direcao@doka.test' and ativo and deleted_at is null limit 1;
  select id into posto_a from public.postos
  where (codigo='POSTO-A' or nome='Posto A') and ativo and deleted_at is null limit 1;
  select id into posto_b from public.postos
  where (codigo='POSTO-B' or nome='Posto B') and ativo and deleted_at is null limit 1;

  if ator is null or posto_a is null or posto_b is null then
    raise notice 'Seed gestão MMS ignorado: admin/Posto A/Posto B não encontrados';
    return;
  end if;

  insert into public.mms_lotes_importacao(
    id,nome_origem,posto_id,multiplos_postos,data_atividade,usuario_importador_id,
    status,estado_processamento,processamento_iniciado_at,processamento_finalizado_at,
    espelho_processado_em,total_linhas,total_linhas_validas,total_linhas_esperadas,
    versao_tratamento,versao_processada,created_at,created_by,updated_by
  ) values
    (lote_predecessor,'spec007-predecessor.csv',posto_a,false,date '2099-07-01',ator,
     'importado','validado',timestamptz '2099-07-01 08:00Z',timestamptz '2099-07-01 08:01Z',
     timestamptz '2099-07-01 08:01Z',1,1,1,0,0,timestamptz '2099-07-01 08:00Z',ator,ator),
    (lote_atual,'spec007-multiposto.csv',null,true,date '2099-07-01',ator,
     'erro','validado',timestamptz '2099-07-01 09:00Z',timestamptz '2099-07-01 09:01Z',
     null,2,1,2,0,null,timestamptz '2099-07-01 09:00Z',ator,ator),
    (lote_bloqueado,'spec007-desfazer-bloqueado.csv',posto_b,false,date '2099-07-01',ator,
     'importado','validado',timestamptz '2099-07-01 10:00Z',timestamptz '2099-07-01 10:01Z',
     timestamptz '2099-07-01 10:01Z',1,1,1,0,0,timestamptz '2099-07-01 10:00Z',ator,ator)
  on conflict(id) do nothing;

  insert into public.mms_linhas_importacao(
    id,lote_importacao_id,numero_linha_origem,raw_json,json_normalizado,
    posto_id,data_atividade,numero_assistencia,parte_conjunto,estado_validacao,
    created_by,updated_by
  ) values
    ('71000000-0000-4000-8000-000000000001',lote_predecessor,2,
     '{"Número da Assistência":"AST-007-A","Parte do Conjunto":"PARTE-A"}',
     '{"numero_assistencia":"AST-007-A","parte_conjunto":"PARTE-A","status_atividade":"concluido","tipo_atividade_normalizado":"montagem"}',
     posto_a,date '2099-07-01','AST-007-A','PARTE-A','valida',ator,ator),
    ('71000000-0000-4000-8000-000000000002',lote_atual,2,
     '{"Número da Assistência":"AST-007-A","Parte do Conjunto":"PARTE-A"}',
     '{"numero_assistencia":"AST-007-A","parte_conjunto":"PARTE-A","status_atividade":"concluido","tipo_atividade_normalizado":"montagem"}',
     posto_a,date '2099-07-01','AST-007-A','PARTE-A','valida',ator,ator),
    ('71000000-0000-4000-8000-000000000003',lote_atual,3,
     '{"Número da Assistência":"","Parte do Conjunto":"PARTE-B"}',
     '{"numero_assistencia":"","parte_conjunto":"PARTE-B","status_atividade":"concluido","tipo_atividade_normalizado":"montagem"}',
     posto_b,date '2099-07-01',null,'PARTE-B','invalida',ator,ator),
    ('71000000-0000-4000-8000-000000000004',lote_bloqueado,2,
     '{"Número da Assistência":"AST-007-B","Parte do Conjunto":"PARTE-B"}',
     '{"numero_assistencia":"AST-007-B","parte_conjunto":"PARTE-B","status_atividade":"concluido","tipo_atividade_normalizado":"montagem"}',
     posto_b,date '2099-07-01','AST-007-B','PARTE-B','valida',ator,ator)
  on conflict(id) do nothing;

  insert into public.mms_erros_importacao(
    id,lote_importacao_id,linha_importacao_id,campo,codigo,mensagem,created_by
  ) values(
    '72000000-0000-4000-8000-000000000001',lote_atual,
    '71000000-0000-4000-8000-000000000003','numero_assistencia',
    'numero_assistencia_ausente','Número da assistência obrigatório.',ator
  ) on conflict(id) do nothing;
end
$$;

-- Limpeza: operações -> erros/alertas -> correções -> espelho exclusivo ->
-- linhas -> lotes, sempre restrita aos IDs 7000/7100/7200 acima.
