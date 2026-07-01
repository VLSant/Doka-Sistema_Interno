begin;

create or replace function app_private.mms_campo_correcao(p_campo text)
returns text language sql immutable set search_path = ''
as $$
  select case app_private.mms_normalizar_texto(p_campo)
    when 'area de trabalho' then 'area_trabalho'
    when 'area_trabalho' then 'area_trabalho'
    when 'data' then 'data_atividade'
    when 'data da atividade' then 'data_atividade'
    when 'data_atividade' then 'data_atividade'
    when 'numero da assistencia' then 'numero_assistencia'
    when 'numero_assistencia' then 'numero_assistencia'
    when 'parte do conjunto' then 'parte_conjunto'
    when 'parte_conjunto' then 'parte_conjunto'
    when 'status da atividade' then 'status_atividade'
    when 'status_atividade' then 'status_atividade'
    when 'tipo de atividade' then 'tipo_atividade'
    when 'tipo_atividade' then 'tipo_atividade'
    when 'descricao' then 'descricao'
    when 'laudo ou observacao' then 'laudo_ou_observacao'
    when 'laudo_ou_observacao' then 'laudo_ou_observacao'
  end
$$;

create or replace function app_private.mms_usuario_pode_corrigir_posto(p_posto_id uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select coalesce(
    app_private.usuario_e_direcao_admin()
    or (
      app_private.usuario_e_supervisao()
      and app_private.usuario_tem_acesso_posto(p_posto_id)
    )
    or exists (
      select 1
      from public.usuarios u
      join public.usuarios_postos up on up.usuario_id=u.id
      join public.postos p on p.id=up.posto_id
      where u.id=app_private.usuario_atual_id()
        and u.perfil='operador'::public.perfil_usuario
        and u.ativo and u.deleted_at is null
        and up.posto_id=p_posto_id
        and up.nivel_acesso='operacional'::public.nivel_acesso_posto
        and up.deleted_at is null
        and p.ativo and p.deleted_at is null
    ),
    false
  )
$$;

do $migration$
declare
  definicao text;
  anterior text;
begin
  select pg_get_functiondef(
    'app_private.mms_processar_lote_assistencias(uuid)'::regprocedure
  ) into definicao;
  if position('erro_pendente.resolvido_em is null' in lower(definicao))=0 then
    anterior:=definicao;
    definicao:=regexp_replace(
      definicao,
      'and\s+estado_validacao\s+in\s*\(''valida''\s*,\s*''valida_com_alerta''\)',
      'and (
        estado_validacao in (''valida'',''valida_com_alerta'')
        or (
          coalesce(current_setting(''app.mms_replay'',true),''off'')=''on''
          and not exists (
            select 1 from public.mms_erros_importacao erro_pendente
            where erro_pendente.linha_importacao_id=mms_linhas_importacao.id
              and erro_pendente.deleted_at is null
              and erro_pendente.resolvido_em is null
          )
        )
      )',
      'gi'
    );
    if definicao=anterior then
      raise exception 'processador MMS incompatível: filtro de linhas não encontrado';
    end if;
    execute definicao;
  end if;

  select pg_get_functiondef(
    'public.listar_lotes_importacao_mms(jsonb,timestamptz,uuid,integer)'::regprocedure
  ) into definicao;
  if position('assistencias_visiveis' in lower(definicao))=0 then
    anterior:=definicao;
    definicao:=regexp_replace(
      definicao,
      'count\(distinct\s+li\.id\)::int\s+total_visivel,',
      'count(distinct li.id)::int total_visivel,
        count(distinct (li.posto_id,li.data_atividade,li.numero_assistencia))
          filter (where nullif(btrim(li.numero_assistencia),'''') is not null)::int
          assistencias_visiveis,
        count(distinct (li.posto_id,li.data_atividade,li.numero_assistencia,li.parte_conjunto))
          filter (
            where nullif(btrim(li.numero_assistencia),'''') is not null
              and nullif(btrim(li.parte_conjunto),'''') is not null
          )::int partes_visiveis,',
      'gi'
    );
    definicao:=regexp_replace(
      definicao,
      '''total_linhas'',\s*i\.total_visivel,\s*''total_assistencias'',\s*i\.total_assistencias,\s*''total_partes'',\s*i\.total_partes,',
      '''total_linhas'', i.total_visivel,
        ''total_assistencias'', case when i.total_visivel < i.total_linhas
          then i.assistencias_visiveis else i.total_assistencias end,
        ''total_partes'', case when i.total_visivel < i.total_linhas
          then i.partes_visiveis else i.total_partes end,',
      'gi'
    );
    if definicao=anterior or position('assistencias_visiveis' in lower(definicao))=0 then
      raise exception 'listar lotes incompatível: agregados visíveis não encontrados';
    end if;
    execute definicao;
  end if;

  select pg_get_functiondef(
    'public.listar_itens_lote_importacao_mms(uuid,text,jsonb,jsonb,integer)'::regprocedure
  ) into definicao;
  if position('campo_correcao' in lower(definicao))=0 then
    anterior:=definicao;
    definicao:=replace(
      definicao,
      'select e.id,e.linha_importacao_id,e.campo,e.codigo,e.mensagem,e.resolvido_em,
        li.versao_correcao,
        case when e.campo is not null then li.raw_json->e.campo end as valor_original,
        case when e.campo is not null then li.json_normalizado->e.campo end as valor_normalizado,
        case when e.campo is not null then app_private.mms_json_efetivo(li.id)->e.campo end as valor_efetivo,
        e.created_at',
      'select e.id,e.linha_importacao_id,e.campo,
        app_private.mms_campo_correcao(e.campo) campo_correcao,
        e.codigo,e.mensagem,e.resolvido_em,
        li.versao_correcao,
        case when e.campo is not null then li.raw_json->e.campo end as valor_original,
        case when e.campo is not null then
          li.json_normalizado->app_private.mms_campo_correcao(e.campo)
        end as valor_normalizado,
        case when e.campo is not null then
          app_private.mms_json_efetivo(li.id)->app_private.mms_campo_correcao(e.campo)
        end as valor_efetivo,
        e.created_at'
    );
    if definicao=anterior then
      raise exception 'listar itens incompatível: projeção de erros não encontrada';
    end if;
    execute definicao;
  end if;

  select pg_get_functiondef(
    'public.salvar_correcao_importacao_mms(uuid,uuid,text,jsonb,integer,text)'::regprocedure
  ) into definicao;
  if position('mms_usuario_pode_corrigir_posto' in lower(definicao))=0 then
    anterior:=definicao;
    definicao:=regexp_replace(
      definicao,
      'not\s*\(app_private\.usuario_e_direcao_admin\(\)\s+or\s+app_private\.usuario_tem_acesso_posto\(linha\.posto_id\)\)',
      'not app_private.mms_usuario_pode_corrigir_posto(linha.posto_id)',
      'gi'
    );
    definicao:=regexp_replace(
      definicao,
      'where\s+linha_importacao_id=linha\.id\s+and\s+campo=p_campo\s+and\s+deleted_at\s+is\s+null\s+and\s+resolvido_em\s+is\s+null',
      'where linha_importacao_id=linha.id
        and app_private.mms_campo_correcao(campo)=p_campo
        and deleted_at is null and resolvido_em is null',
      'gi'
    );
    if definicao=anterior or position('mms_usuario_pode_corrigir_posto' in lower(definicao))=0 then
      raise exception 'salvar correção incompatível: autorização por linha não encontrada';
    end if;
    execute definicao;
  end if;

  select pg_get_functiondef(
    'public.reprocessar_lote_importacao_mms(uuid,integer,uuid)'::regprocedure
  ) into definicao;
  if position('set_config(''app.mms_replay'',''on''' in lower(definicao))=0 then
    anterior:=definicao;
    definicao:=replace(
      definicao,
      'resultado_operacao:=app_private.mms_processar_lote_assistencias(p_lote_id);',
      'perform set_config(''app.mms_replay'',''on'',true);
  begin
    resultado_operacao:=app_private.mms_processar_lote_assistencias(p_lote_id);
    perform set_config(''app.mms_replay'',''off'',true);
  exception when others then
    perform set_config(''app.mms_replay'',''off'',true);
    raise;
  end;
  if not coalesce((resultado_operacao->>''processado'')::boolean,false) then
    raise exception ''falha_processamento'' using errcode=''P0001'';
  end if;'
    );
    if definicao=anterior then
      raise exception 'reprocessar incompatível: chamada do processador não encontrada';
    end if;
    execute definicao;
  end if;
end
$migration$;

revoke all on function
  app_private.mms_campo_correcao(text),
  app_private.mms_usuario_pode_corrigir_posto(uuid)
from public,anon,authenticated;

commit;
