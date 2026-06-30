begin;

create type public.mms_estado_operacao_lote as enum ('em_andamento', 'concluida', 'falha');
create type public.mms_tipo_operacao_lote as enum ('reprocessamento', 'desfazer');

alter table public.mms_lotes_importacao
  add column versao_tratamento integer not null default 0,
  add column versao_processada integer,
  add column tratamento_concluido_em timestamptz,
  add column tratamento_concluido_por uuid references public.usuarios(id) on delete restrict,
  add column tipo_cancelamento text,
  add constraint mms_lotes_versoes_validas check (
    versao_tratamento >= 0 and (versao_processada is null or versao_processada between 0 and versao_tratamento)
  ),
  add constraint mms_lotes_tipo_cancelamento_valido check (
    tipo_cancelamento is null or tipo_cancelamento in ('tentativa', 'desfazer_processado')
  );

alter table public.mms_linhas_importacao
  add column versao_correcao integer not null default 0;

alter table public.mms_erros_importacao
  add column resolvido_em timestamptz,
  add column resolvido_por uuid references public.usuarios(id) on delete restrict,
  add column correcao_importacao_id uuid;

create table public.mms_correcoes_importacao (
  id uuid primary key default gen_random_uuid(),
  lote_importacao_id uuid not null references public.mms_lotes_importacao(id) on delete restrict,
  linha_importacao_id uuid not null references public.mms_linhas_importacao(id) on delete restrict,
  campo text not null,
  valor_anterior jsonb,
  valor_corrigido jsonb not null,
  versao integer not null,
  vigente boolean not null default true,
  justificativa text,
  created_at timestamptz not null default now(),
  created_by uuid not null references public.usuarios(id) on delete restrict,
  constraint mms_correcoes_campo_valido check (
    campo in (
      'area_trabalho', 'data_atividade', 'numero_assistencia', 'parte_conjunto',
      'tipo_atividade', 'status_atividade', 'descricao', 'laudo_ou_observacao'
    )
  ),
  constraint mms_correcoes_versao_positiva check (versao > 0),
  constraint mms_correcoes_justificativa check (
    justificativa is null or length(btrim(justificativa)) between 5 and 1000
  )
);

alter table public.mms_erros_importacao
  add constraint mms_erros_correcao_fk foreign key (correcao_importacao_id)
  references public.mms_correcoes_importacao(id) on delete restrict;

create table public.mms_operacoes_lote (
  id uuid primary key default gen_random_uuid(),
  lote_importacao_id uuid not null references public.mms_lotes_importacao(id) on delete restrict,
  tipo public.mms_tipo_operacao_lote not null,
  estado public.mms_estado_operacao_lote not null default 'em_andamento',
  chave_idempotencia uuid not null,
  hash_requisicao text not null,
  versao_tratamento integer not null,
  assinatura_analise text,
  justificativa text,
  resultado jsonb,
  codigo_falha text,
  iniciado_em timestamptz not null default now(),
  finalizado_em timestamptz,
  created_by uuid not null references public.usuarios(id) on delete restrict,
  constraint mms_operacoes_finalizacao check (
    (estado = 'em_andamento' and finalizado_em is null)
    or (estado <> 'em_andamento' and finalizado_em is not null)
  ),
  constraint mms_operacoes_justificativa check (
    tipo <> 'desfazer' or length(btrim(justificativa)) between 10 and 1000
  ),
  unique (created_by, chave_idempotencia)
);

create unique index mms_correcoes_vigente_uidx
  on public.mms_correcoes_importacao (linha_importacao_id, campo)
  where vigente;
create unique index mms_correcoes_versao_uidx
  on public.mms_correcoes_importacao (linha_importacao_id, campo, versao);
create index mms_correcoes_lote_created_idx
  on public.mms_correcoes_importacao (lote_importacao_id, created_at desc, id desc);
create index mms_correcoes_created_by_idx
  on public.mms_correcoes_importacao (created_by);
create index mms_operacoes_lote_created_idx
  on public.mms_operacoes_lote (lote_importacao_id, iniciado_em desc, id desc);
create index mms_lotes_gestao_cursor_idx
  on public.mms_lotes_importacao (created_at desc, id desc) where deleted_at is null;
create index mms_erros_pendentes_idx
  on public.mms_erros_importacao (lote_importacao_id, linha_importacao_id, created_at desc)
  where deleted_at is null and resolvido_em is null;
create index mms_erros_correcao_idx
  on public.mms_erros_importacao (correcao_importacao_id)
  where correcao_importacao_id is not null;
create index mms_erros_resolvido_por_idx
  on public.mms_erros_importacao (resolvido_por)
  where resolvido_por is not null;
create index mms_lotes_tratamento_concluido_por_idx
  on public.mms_lotes_importacao (tratamento_concluido_por)
  where tratamento_concluido_por is not null;

create or replace function app_private.mms_bloquear_correcao_mutacao()
returns trigger language plpgsql set search_path = ''
as $$
begin
  if current_user in ('anon', 'authenticated') then
    raise exception 'correcoes MMS sao imutaveis' using errcode = '42501';
  end if;
  return case when tg_op = 'DELETE' then old else new end;
end
$$;

create trigger mms_correcoes_no_update_delete
before update or delete on public.mms_correcoes_importacao
for each row execute function app_private.mms_bloquear_correcao_mutacao();

create or replace function app_private.mms_json_efetivo(linha_uuid uuid)
returns jsonb language sql stable security definer set search_path = ''
as $$
  select coalesce(li.json_normalizado, '{}'::jsonb)
    || coalesce((
      select jsonb_object_agg(c.campo, c.valor_corrigido)
      from public.mms_correcoes_importacao c
      where c.linha_importacao_id = li.id and c.vigente
    ), '{}'::jsonb)
  from public.mms_linhas_importacao li
  where li.id = linha_uuid and li.deleted_at is null
$$;

create or replace function app_private.mms_correcao_valida(p_campo text, p_valor jsonb)
returns boolean language sql immutable set search_path = ''
as $$
  select case
    when p_valor is null or p_valor = 'null'::jsonb or jsonb_typeof(p_valor) not in ('string','number','boolean') then false
    when p_campo = 'data_atividade' then
      app_private.mms_data_texto(nullif(btrim(p_valor #>> '{}'), '')) is not null
    when p_campo = 'tipo_atividade' then
      app_private.mms_tipo_canonico(p_valor #>> '{}') is not null
    when p_campo = 'status_atividade' then
      app_private.mms_status_canonico(p_valor #>> '{}') is not null
    when p_campo in (
      'area_trabalho', 'numero_assistencia', 'parte_conjunto', 'descricao', 'laudo_ou_observacao'
    ) then nullif(btrim(p_valor #>> '{}'), '') is not null
    else false
  end
$$;

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

-- Refatora o processador da Spec 006 no próprio catálogo para consumir a
-- projeção efetiva, mantendo raw_json/json_normalizado fisicamente imutáveis.
do $migration$
declare
  definicao text;
begin
  select pg_get_functiondef(
    'app_private.mms_processar_lote_assistencias(uuid)'::regprocedure
  ) into definicao;

  if definicao !~* 'n\s*:=\s*linha\.json_normalizado\s*;' then
    raise exception 'processador MMS incompatível: atribuição normalizada não encontrada';
  end if;

  definicao := regexp_replace(
    definicao,
    'n\s*:=\s*linha\.json_normalizado\s*;',
    'n:=app_private.mms_json_efetivo(linha.id);',
    'gi'
  );
  definicao := replace(
    definicao,
    'app_private.mms_normalizar_chave(li.numero_assistencia)',
    'app_private.mms_normalizar_chave(app_private.mms_json_efetivo(li.id) ->> ''numero_assistencia'')'
  );
  definicao := replace(
    definicao,
    'app_private.mms_normalizar_chave(li.parte_conjunto)',
    'app_private.mms_normalizar_chave(app_private.mms_json_efetivo(li.id) ->> ''parte_conjunto'')'
  );
  definicao := regexp_replace(
    definicao,
    'if\s+not\s+app_private\.mms_lote_assistencias_elegivel\(lote_uuid\)\s+then',
    'if coalesce(current_setting(''app.mms_replay'', true), ''off'') <> ''on''
      and not app_private.mms_lote_assistencias_elegivel(lote_uuid) then',
    'gi'
  );
  definicao := regexp_replace(
    definicao,
    'where\s+lote_importacao_id\s*=\s*lote_uuid\s+and\s+deleted_at\s+is\s+null\s+and\s+estado_validacao',
    'where lote_importacao_id = lote_uuid
      and (
        nullif(current_setting(''app.mms_scope_posto'', true), '''') is null
        or posto_id = current_setting(''app.mms_scope_posto'', true)::uuid
      )
      and deleted_at is null
      and estado_validacao',
    'gi'
  );
  definicao := regexp_replace(
    definicao,
    'and\s+a\.data_atividade\s*=\s*lote\.data_atividade',
    'and a.data_atividade = lote.data_atividade
    and (
      nullif(current_setting(''app.mms_scope_posto'', true), '''') is null
      or a.posto_id = current_setting(''app.mms_scope_posto'', true)::uuid
    )',
    'gi'
  );
  definicao := regexp_replace(
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
  execute definicao;
end
$migration$;

create or replace function app_private.mms_cobertura_integral(lote_uuid uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select app_private.usuario_atual_id() is not null and (
    app_private.usuario_e_direcao_admin()
    or not exists (
      select 1 from public.mms_linhas_importacao li
      where li.lote_importacao_id = lote_uuid and li.deleted_at is null
        and (li.posto_id is null or not app_private.usuario_tem_acesso_posto(li.posto_id))
    )
  )
$$;

create or replace function app_private.mms_pode_corrigir(lote_uuid uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select app_private.usuario_e_direcao_admin()
    or (
      app_private.usuario_e_supervisao() and app_private.mms_cobertura_integral(lote_uuid)
    )
    or exists (
      select 1 from public.usuarios u
      join public.usuarios_postos up on up.usuario_id = u.id
      join public.mms_linhas_importacao li on li.posto_id = up.posto_id
      where u.id = app_private.usuario_atual_id()
        and u.perfil = 'operador'::public.perfil_usuario
        and up.nivel_acesso = 'operacional'::public.nivel_acesso_posto
        and up.deleted_at is null
        and li.lote_importacao_id = lote_uuid and li.deleted_at is null
    )
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

create or replace function public.listar_lotes_importacao_mms(
  p_filtros jsonb default '{}'::jsonb,
  p_cursor_created_at timestamptz default null,
  p_cursor_id uuid default null,
  p_limite integer default 50
)
returns jsonb language plpgsql stable security definer set search_path = ''
as $$
declare resposta jsonb;
begin
  if app_private.usuario_atual_id() is null then raise exception 'acesso_negado' using errcode = '42501'; end if;
  if p_limite not between 1 and 100
    or ((p_cursor_created_at is null) <> (p_cursor_id is null))
    or jsonb_typeof(coalesce(p_filtros, '{}'::jsonb)) <> 'object'
    or (p_filtros - array['posto_id','data_atividade','importado_de','importado_ate','status','com_erro','com_alerta','usuario_importador_id']) <> '{}'::jsonb
  then raise exception 'filtros_invalidos' using errcode = '22023'; end if;

  with visiveis as (
    select l.*,
      count(distinct li.id)::int total_visivel,
      count(distinct (li.posto_id,li.data_atividade,li.numero_assistencia))
        filter (where nullif(btrim(li.numero_assistencia),'') is not null)::int
        assistencias_visiveis,
      count(distinct (li.posto_id,li.data_atividade,li.numero_assistencia,li.parte_conjunto))
        filter (
          where nullif(btrim(li.numero_assistencia),'') is not null
            and nullif(btrim(li.parte_conjunto),'') is not null
        )::int partes_visiveis,
      count(distinct e.id)::int erros_visiveis,
      count(distinct a.id)::int alertas_visiveis,
      coalesce(jsonb_agg(distinct jsonb_build_object('id', p.id, 'nome', p.nome))
        filter (where p.id is not null), '[]'::jsonb) postos_visiveis
    from public.mms_lotes_importacao l
    join public.mms_linhas_importacao li on li.lote_importacao_id = l.id and li.deleted_at is null
      and (app_private.usuario_e_direcao_admin() or app_private.usuario_tem_acesso_posto(li.posto_id))
    left join public.postos p on p.id = li.posto_id
    left join public.mms_erros_importacao e on e.linha_importacao_id = li.id and e.deleted_at is null and e.resolvido_em is null
    left join public.mms_alertas_importacao a on a.linha_importacao_id = li.id and a.deleted_at is null
    where l.deleted_at is null
    group by l.id
  ), pagina as (
    select * from visiveis v
    where (p_cursor_created_at is null or (v.created_at, v.id) < (p_cursor_created_at, p_cursor_id))
      and (not (p_filtros ? 'posto_id') or exists (
        select 1 from public.mms_linhas_importacao x where x.lote_importacao_id=v.id
          and x.posto_id=(p_filtros->>'posto_id')::uuid and x.deleted_at is null
      ))
      and (not (p_filtros ? 'data_atividade') or v.data_atividade=(p_filtros->>'data_atividade')::date)
      and (not (p_filtros ? 'importado_de') or v.created_at >= (p_filtros->>'importado_de')::timestamptz)
      and (not (p_filtros ? 'importado_ate') or v.created_at <= (p_filtros->>'importado_ate')::timestamptz)
      and (not (p_filtros ? 'status') or v.status::text=p_filtros->>'status')
      and (not coalesce((p_filtros->>'com_erro')::boolean,false) or v.erros_visiveis>0)
      and (not coalesce((p_filtros->>'com_alerta')::boolean,false) or v.alertas_visiveis>0)
      and (not (p_filtros ? 'usuario_importador_id') or v.usuario_importador_id=(p_filtros->>'usuario_importador_id')::uuid)
    order by v.created_at desc, v.id desc limit p_limite + 1
  ), itens as (
    select p.*, row_number() over(order by p.created_at desc,p.id desc) rn from pagina p
  )
  select jsonb_build_object(
    'itens', coalesce(jsonb_agg(jsonb_build_object(
      'lote_id', i.id, 'importado_em', i.created_at, 'data_atividade', i.data_atividade,
      'postos', i.postos_visiveis, 'visibilidade_parcial', i.total_visivel < i.total_linhas,
      'usuario_importador', jsonb_build_object('id', u.id, 'nome', u.nome),
      'arquivo', case when app_private.mms_cobertura_integral(i.id) then i.nome_origem end,
      'status', i.status, 'estado_processamento', i.estado_processamento,
      'total_linhas', i.total_visivel,
      'total_assistencias', case when i.total_visivel < i.total_linhas
        then i.assistencias_visiveis else i.total_assistencias end,
      'total_partes', case when i.total_visivel < i.total_linhas
        then i.partes_visiveis else i.total_partes end,
      'total_erros_pendentes', i.erros_visiveis,
      'total_alertas', i.alertas_visiveis, 'precisa_tratamento', i.erros_visiveis > 0,
      'capacidades', app_private.mms_capacidades_lote(i.id)
    ) order by i.created_at desc,i.id desc) filter(where i.rn <= p_limite), '[]'::jsonb),
    'proximo_cursor', case when count(*) > p_limite then (
      select jsonb_build_object('created_at', x.created_at, 'id', x.id) from itens x where x.rn=p_limite
    ) end
  ) into resposta
  from itens i join public.usuarios u on u.id=i.usuario_importador_id;
  return resposta;
exception when invalid_text_representation or datetime_field_overflow then
  raise exception 'filtros_invalidos' using errcode = '22023';
end
$$;

create or replace function public.obter_detalhe_lote_importacao_mms(p_lote_id uuid)
returns jsonb language plpgsql stable security definer set search_path = ''
as $$
declare l public.mms_lotes_importacao%rowtype; postos jsonb; erros int; alertas int;
begin
  if not app_private.mms_lote_acessivel(p_lote_id) then raise exception 'acesso_negado' using errcode='42501'; end if;
  select * into l from public.mms_lotes_importacao where id=p_lote_id and deleted_at is null;
  if l.id is null then raise exception 'acesso_negado' using errcode='42501'; end if;
  select coalesce(jsonb_agg(distinct jsonb_build_object('id',p.id,'nome',p.nome)),'[]'::jsonb)
    into postos from public.mms_linhas_importacao li join public.postos p on p.id=li.posto_id
    where li.lote_importacao_id=l.id and li.deleted_at is null
      and (app_private.usuario_e_direcao_admin() or app_private.usuario_tem_acesso_posto(li.posto_id));
  select count(*) into erros from public.mms_erros_importacao e join public.mms_linhas_importacao li on li.id=e.linha_importacao_id
    where e.lote_importacao_id=l.id and e.deleted_at is null and e.resolvido_em is null
      and (app_private.usuario_e_direcao_admin() or app_private.usuario_tem_acesso_posto(li.posto_id));
  select count(*) into alertas from public.mms_alertas_importacao a join public.mms_linhas_importacao li on li.id=a.linha_importacao_id
    where a.lote_importacao_id=l.id and a.deleted_at is null
      and (app_private.usuario_e_direcao_admin() or app_private.usuario_tem_acesso_posto(li.posto_id));
  return jsonb_build_object(
    'lote_id',l.id,'importado_em',l.created_at,'data_atividade',l.data_atividade,'postos',postos,
    'visibilidade_parcial',not app_private.mms_cobertura_integral(l.id),
    'usuario_importador',(select jsonb_build_object('id',u.id,'nome',u.nome) from public.usuarios u where u.id=l.usuario_importador_id),
    'arquivo',case when app_private.mms_cobertura_integral(l.id) then l.nome_origem end,
    'caminho_arquivo',case when app_private.mms_cobertura_integral(l.id) then l.caminho_arquivo end,
    'status',l.status,'estado_processamento',l.estado_processamento,'total_linhas',l.total_linhas,
    'total_assistencias',l.total_assistencias,'total_partes',l.total_partes,
    'total_erros_pendentes',erros,'total_alertas',alertas,'precisa_tratamento',erros>0,
    'versao_tratamento',l.versao_tratamento,'versao_processada',l.versao_processada,
    'resultado_processamento',case when app_private.mms_cobertura_integral(l.id) then l.resultado_processamento end,
    'codigo_ultima_falha',l.codigo_ultima_falha,'tipo_cancelamento',l.tipo_cancelamento,
    'capacidades',app_private.mms_capacidades_lote(l.id)
  );
end
$$;

create or replace function public.listar_itens_lote_importacao_mms(
  p_lote_id uuid, p_colecao text, p_filtros jsonb default '{}'::jsonb,
  p_cursor jsonb default '{}'::jsonb, p_limite integer default 50
)
returns jsonb language plpgsql stable security definer set search_path = ''
as $$
declare itens jsonb;
begin
  if not app_private.mms_lote_acessivel(p_lote_id) then raise exception 'acesso_negado' using errcode='42501'; end if;
  if p_colecao not in ('linhas','erros','alertas','correcoes','operacoes','auditoria') or p_limite not between 1 and 100
    then raise exception 'filtros_invalidos' using errcode='22023'; end if;
  if p_colecao='linhas' then
    select coalesce(jsonb_agg(to_jsonb(x) order by x.created_at desc,x.id desc),'[]'::jsonb) into itens from (
      select li.id,li.numero_linha_origem,li.posto_id,li.data_atividade,li.numero_assistencia,
        li.parte_conjunto,li.estado_validacao,li.versao_correcao,li.created_at
      from public.mms_linhas_importacao li where li.lote_importacao_id=p_lote_id and li.deleted_at is null
        and (app_private.usuario_e_direcao_admin() or app_private.usuario_tem_acesso_posto(li.posto_id))
      order by li.created_at desc,li.id desc limit p_limite
    ) x;
  elsif p_colecao='erros' then
    select coalesce(jsonb_agg(to_jsonb(x) order by x.created_at desc,x.id desc),'[]'::jsonb) into itens from (
      select e.id,e.linha_importacao_id,e.campo,
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
        e.created_at
      from public.mms_erros_importacao e join public.mms_linhas_importacao li on li.id=e.linha_importacao_id
      where e.lote_importacao_id=p_lote_id and e.deleted_at is null
        and (app_private.usuario_e_direcao_admin() or app_private.usuario_tem_acesso_posto(li.posto_id))
      order by e.created_at desc,e.id desc limit p_limite
    ) x;
  elsif p_colecao='alertas' then
    select coalesce(jsonb_agg(to_jsonb(x) order by x.created_at desc,x.id desc),'[]'::jsonb) into itens from (
      select a.id,a.linha_importacao_id,a.campo,a.codigo,a.mensagem,a.created_at
      from public.mms_alertas_importacao a join public.mms_linhas_importacao li on li.id=a.linha_importacao_id
      where a.lote_importacao_id=p_lote_id and a.deleted_at is null
        and (app_private.usuario_e_direcao_admin() or app_private.usuario_tem_acesso_posto(li.posto_id))
      order by a.created_at desc,a.id desc limit p_limite
    ) x;
  elsif p_colecao='correcoes' then
    select coalesce(jsonb_agg(to_jsonb(x) order by x.created_at desc,x.id desc),'[]'::jsonb) into itens from (
      select c.id,c.linha_importacao_id,c.campo,c.valor_anterior,c.valor_corrigido,c.versao,c.vigente,c.created_at,c.created_by
      from public.mms_correcoes_importacao c join public.mms_linhas_importacao li on li.id=c.linha_importacao_id
      where c.lote_importacao_id=p_lote_id and (app_private.usuario_e_direcao_admin() or app_private.usuario_tem_acesso_posto(li.posto_id))
      order by c.created_at desc,c.id desc limit p_limite
    ) x;
  elsif p_colecao='operacoes' then
    if not app_private.mms_cobertura_integral(p_lote_id) then raise exception 'acesso_negado' using errcode='42501'; end if;
    select coalesce(jsonb_agg(to_jsonb(x) order by x.iniciado_em desc,x.id desc),'[]'::jsonb) into itens from (
      select o.id,o.tipo,o.estado,o.resultado,o.codigo_falha,o.iniciado_em as created_at,o.iniciado_em,o.finalizado_em
      from public.mms_operacoes_lote o where o.lote_importacao_id=p_lote_id order by o.iniciado_em desc,o.id desc limit p_limite
    ) x;
  else
    if not app_private.mms_cobertura_integral(p_lote_id) then raise exception 'acesso_negado' using errcode='42501'; end if;
    select coalesce(jsonb_agg(to_jsonb(x) order by x.created_at desc,x.id desc),'[]'::jsonb) into itens from (
      select h.id,h.acao,h.metadata,h.created_at,h.usuario_id from public.historico_auditoria h
      where h.entidade_id=p_lote_id or h.metadata->>'lote_id'=p_lote_id::text
      order by h.created_at desc,h.id desc limit p_limite
    ) x;
  end if;
  return jsonb_build_object('itens',itens,'proximo_cursor',null);
end
$$;

create or replace function public.salvar_correcao_importacao_mms(
  p_lote_id uuid, p_linha_id uuid, p_campo text, p_valor jsonb,
  p_versao_esperada integer, p_justificativa text default null
)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare ator uuid:=app_private.usuario_atual_id(); linha public.mms_linhas_importacao%rowtype;
  anterior jsonb; nova_versao int; correcao_uuid uuid; pendentes int;
begin
  if ator is null or not app_private.mms_pode_corrigir(p_lote_id) then raise exception 'acesso_negado' using errcode='42501'; end if;
  if p_campo not in ('area_trabalho','data_atividade','numero_assistencia','parte_conjunto','tipo_atividade','status_atividade','descricao','laudo_ou_observacao')
    or not app_private.mms_correcao_valida(p_campo,p_valor)
    then raise exception 'correcao_invalida' using errcode='22023'; end if;
  select * into linha from public.mms_linhas_importacao where id=p_linha_id and lote_importacao_id=p_lote_id and deleted_at is null for update;
  if linha.id is null or not app_private.mms_usuario_pode_corrigir_posto(linha.posto_id)
    then raise exception 'acesso_negado' using errcode='42501'; end if;
  if linha.versao_correcao<>p_versao_esperada then raise exception 'correcao_desatualizada' using errcode='40001'; end if;
  anterior:=app_private.mms_json_efetivo(linha.id)->p_campo; nova_versao:=linha.versao_correcao+1;
  update public.mms_correcoes_importacao set vigente=false
    where linha_importacao_id=linha.id and campo=p_campo and vigente;
  insert into public.mms_correcoes_importacao(
    lote_importacao_id,linha_importacao_id,campo,valor_anterior,valor_corrigido,versao,justificativa,created_by
  ) values(p_lote_id,p_linha_id,p_campo,anterior,p_valor,nova_versao,p_justificativa,ator) returning id into correcao_uuid;
  update public.mms_linhas_importacao set versao_correcao=nova_versao,updated_at=now(),updated_by=ator where id=linha.id;
  update public.mms_lotes_importacao set versao_tratamento=versao_tratamento+1,
    tratamento_concluido_em=null,tratamento_concluido_por=null,updated_at=now(),updated_by=ator where id=p_lote_id;
  update public.mms_erros_importacao set resolvido_em=now(),resolvido_por=ator,correcao_importacao_id=correcao_uuid
    where linha_importacao_id=linha.id
      and app_private.mms_campo_correcao(campo)=p_campo
      and deleted_at is null and resolvido_em is null;
  select count(*) into pendentes from public.mms_erros_importacao where lote_importacao_id=p_lote_id and deleted_at is null and resolvido_em is null;
  if exists (
    select 1 from public.mms_linhas_importacao li
    where li.lote_importacao_id=p_lote_id and li.deleted_at is null
      and (
        not app_private.mms_raw_json_linha_valido(li.raw_json)
        or not app_private.mms_raw_json_linha_valido(li.json_normalizado)
        or exists (
          select 1 from public.mms_correcoes_importacao c
          where c.linha_importacao_id=li.id and c.vigente
            and not app_private.mms_correcao_valida(c.campo,c.valor_corrigido)
        )
      )
  ) then raise exception 'evidencia_incompleta' using errcode='22023'; end if;
  perform app_private.registrar_auditoria('mms_correcoes_importacao',correcao_uuid,'correcao_salva',anterior,p_valor,
    jsonb_build_object('lote_id',p_lote_id,'linha_id',p_linha_id,'campo',p_campo,'versao',nova_versao));
  return jsonb_build_object('correcao_id',correcao_uuid,'linha_id',p_linha_id,'campo',p_campo,
    'valor_efetivo',p_valor,'versao',nova_versao,'erros_pendentes',pendentes);
end
$$;

create or replace function public.concluir_tratamento_importacao_mms(p_lote_id uuid,p_versao_esperada integer)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare l public.mms_lotes_importacao%rowtype; pendentes int; ator uuid:=app_private.usuario_atual_id();
begin
  if ator is null or not (app_private.usuario_e_supervisao() or app_private.usuario_e_direcao_admin())
    or not app_private.mms_cobertura_integral(p_lote_id) then raise exception 'acesso_negado' using errcode='42501'; end if;
  select * into l from public.mms_lotes_importacao where id=p_lote_id and deleted_at is null for update;
  if l.id is null then raise exception 'acesso_negado' using errcode='42501'; end if;
  if l.versao_tratamento<>p_versao_esperada then raise exception 'correcao_desatualizada' using errcode='40001'; end if;
  select count(*) into pendentes from public.mms_erros_importacao where lote_importacao_id=p_lote_id and deleted_at is null and resolvido_em is null;
  if pendentes>0 then raise exception 'tratamento_incompleto' using errcode='22023'; end if;
  update public.mms_lotes_importacao set tratamento_concluido_em=now(),tratamento_concluido_por=ator,
    updated_at=now(),updated_by=ator where id=p_lote_id;
  perform app_private.registrar_auditoria('mms_lotes_importacao',p_lote_id,'tratamento_concluido',null,null,
    jsonb_build_object('lote_id',p_lote_id,'versao',p_versao_esperada));
  return jsonb_build_object('lote_id',p_lote_id,'versao_tratamento',p_versao_esperada,'elegivel_reprocessamento',true);
end
$$;

create or replace function public.reprocessar_lote_importacao_mms(
  p_lote_id uuid,p_versao_esperada integer,p_chave_idempotencia uuid
)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare ator uuid:=app_private.usuario_atual_id(); op public.mms_operacoes_lote%rowtype;
  l public.mms_lotes_importacao%rowtype; hash text; resultado_operacao jsonb;
begin
  if ator is null or not (app_private.usuario_e_supervisao() or app_private.usuario_e_direcao_admin())
    or not app_private.mms_cobertura_integral(p_lote_id) then raise exception 'acesso_negado' using errcode='42501'; end if;
  hash:=pg_catalog.encode(extensions.digest(p_lote_id::text||':'||p_versao_esperada::text,'sha256'),'hex');
  select * into op from public.mms_operacoes_lote where created_by=ator and chave_idempotencia=p_chave_idempotencia;
  if op.id is not null then
    if op.hash_requisicao<>hash then raise exception 'chave_idempotencia_conflitante' using errcode='22023'; end if;
    return jsonb_build_object('operacao_id',op.id,'lote_id',op.lote_importacao_id,'tipo',op.tipo,
      'estado',op.estado,'chave_idempotencia',op.chave_idempotencia,'resultado',op.resultado,'codigo_falha',op.codigo_falha);
  end if;
  select * into l from public.mms_lotes_importacao where id=p_lote_id and deleted_at is null for update;
  if l.id is null or l.versao_tratamento<>p_versao_esperada or l.tratamento_concluido_em is null
    then raise exception 'tratamento_incompleto' using errcode='22023'; end if;
  insert into public.mms_operacoes_lote(lote_importacao_id,tipo,chave_idempotencia,hash_requisicao,versao_tratamento,created_by)
    values(p_lote_id,'reprocessamento',p_chave_idempotencia,hash,p_versao_esperada,ator) returning * into op;
  -- O processador existente permanece autoritativo. A projeção efetiva é selada
  -- por versão antes da chamada, permitindo retomada idempotente.
  perform set_config('app.mms_replay','on',true);
  begin
    resultado_operacao:=app_private.mms_processar_lote_assistencias(p_lote_id);
    perform set_config('app.mms_replay','off',true);
  exception when others then
    perform set_config('app.mms_replay','off',true);
    raise;
  end;
  if not coalesce((resultado_operacao->>'processado')::boolean,false) then
    raise exception 'falha_processamento' using errcode='P0001';
  end if;
  update public.mms_lotes_importacao set versao_processada=p_versao_esperada,
    resultado_processamento=resultado_operacao,espelho_processado_em=now(),updated_at=now(),updated_by=ator where id=p_lote_id;
  update public.mms_operacoes_lote o set estado='concluida',
    resultado=resultado_operacao,finalizado_em=now() where o.id=op.id;
  perform app_private.registrar_auditoria('mms_lotes_importacao',p_lote_id,'reprocessamento_concluido',null,null,
    jsonb_build_object('lote_id',p_lote_id,'operacao_id',op.id,'versao',p_versao_esperada));
  return jsonb_build_object('operacao_id',op.id,'lote_id',p_lote_id,'tipo','reprocessamento',
    'estado','concluida','chave_idempotencia',p_chave_idempotencia,'resultado',resultado_operacao,'codigo_falha',null);
end
$$;

create or replace function public.obter_operacao_lote_mms(p_lote_id uuid,p_chave_idempotencia uuid)
returns jsonb language plpgsql stable security definer set search_path = ''
as $$
declare op public.mms_operacoes_lote%rowtype;
begin
  if not app_private.mms_cobertura_integral(p_lote_id) then raise exception 'acesso_negado' using errcode='42501'; end if;
  select * into op from public.mms_operacoes_lote where lote_importacao_id=p_lote_id
    and chave_idempotencia=p_chave_idempotencia and created_by=app_private.usuario_atual_id();
  if op.id is null then raise exception 'acesso_negado' using errcode='42501'; end if;
  return jsonb_build_object('operacao_id',op.id,'lote_id',op.lote_importacao_id,'tipo',op.tipo,
    'estado',op.estado,'chave_idempotencia',op.chave_idempotencia,'resultado',op.resultado,'codigo_falha',op.codigo_falha);
end
$$;

create or replace function app_private.mms_predecessor_escopo(
  p_lote_alvo uuid, p_posto_id uuid, p_data_atividade date
)
returns uuid language sql stable security definer set search_path = ''
as $$
  select anterior.id
  from public.mms_lotes_importacao alvo
  join public.mms_lotes_importacao anterior
    on anterior.espelho_processado_em < alvo.espelho_processado_em
   and anterior.espelho_processado_em is not null
   and anterior.status <> 'cancelado'
   and anterior.deleted_at is null
  where alvo.id=p_lote_alvo
    and exists (
      select 1 from public.mms_linhas_importacao li
      where li.lote_importacao_id=anterior.id
        and li.posto_id=p_posto_id and li.data_atividade=p_data_atividade
        and li.deleted_at is null
    )
  order by anterior.espelho_processado_em desc, anterior.id desc
  limit 1
$$;

create or replace function app_private.mms_reconstruir_espelho_escopo(
  p_posto_id uuid, p_data_atividade date, p_lote_fonte uuid, p_lote_desfeito uuid
)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare
  ator uuid:=app_private.usuario_atual_id();
  resultado jsonb;
  assistencias_retiradas int:=0;
  partes_retiradas int:=0;
begin
  if ator is null then raise exception 'acesso_negado' using errcode='42501'; end if;
  perform set_config('app.mms_assistencias_importacao','on',true);
  perform set_config('app.mms_scope_posto',p_posto_id::text,true);
  perform set_config('app.mms_replay','on',true);

  if p_lote_fonte is null then
    update public.mms_partes_assistencia pa
    set status_interno='removido',removido_em=now(),removido_lote_id=p_lote_desfeito,
      updated_at=now(),updated_by=ator
    from public.mms_assistencias a
    where pa.assistencia_id=a.id and a.posto_id=p_posto_id
      and a.data_atividade=p_data_atividade and pa.lote_ultimo_id=p_lote_desfeito
      and pa.deleted_at is null and pa.status_interno='ativo';
    get diagnostics partes_retiradas=row_count;

    update public.mms_assistencias
    set status_interno='removido',removido_em=now(),removido_lote_id=p_lote_desfeito,
      updated_at=now(),updated_by=ator
    where posto_id=p_posto_id and data_atividade=p_data_atividade
      and lote_ultimo_id=p_lote_desfeito and deleted_at is null and status_interno='ativo';
    get diagnostics assistencias_retiradas=row_count;
    resultado:=jsonb_build_object(
      'processado',true,'assistencias_restauradas',0,
      'assistencias_retiradas',assistencias_retiradas,
      'partes_restauradas',0,'partes_retiradas',partes_retiradas
    );
  else
    if not exists (
      select 1 from public.mms_linhas_importacao
      where lote_importacao_id=p_lote_fonte and posto_id=p_posto_id
        and data_atividade=p_data_atividade and deleted_at is null
    ) then raise exception 'predecessor_invalido' using errcode='22023'; end if;
    resultado:=app_private.mms_processar_lote_assistencias(p_lote_fonte);
    if not coalesce((resultado->>'processado')::boolean,false) then
      raise exception 'estado_irreconstruivel' using errcode='22023';
    end if;
    resultado:=resultado||jsonb_build_object(
      'assistencias_restauradas',
        coalesce((resultado->>'assistencias_criadas')::int,0)
        +coalesce((resultado->>'assistencias_atualizadas')::int,0)
        +coalesce((resultado->>'assistencias_reativadas')::int,0),
      'assistencias_retiradas',coalesce((resultado->>'assistencias_removidas')::int,0),
      'partes_restauradas',
        coalesce((resultado->>'partes_criadas')::int,0)
        +coalesce((resultado->>'partes_atualizadas')::int,0)
        +coalesce((resultado->>'partes_reativadas')::int,0),
      'partes_retiradas',coalesce((resultado->>'partes_removidas')::int,0)
    );
  end if;
  perform set_config('app.mms_scope_posto','',true);
  perform set_config('app.mms_replay','off',true);
  perform set_config('app.mms_assistencias_importacao','off',true);
  return resultado;
exception when others then
  perform set_config('app.mms_scope_posto','',true);
  perform set_config('app.mms_replay','off',true);
  perform set_config('app.mms_assistencias_importacao','off',true);
  raise;
end
$$;

create or replace function public.analisar_desfazer_importacao_mms(p_lote_id uuid)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare l public.mms_lotes_importacao%rowtype; motivos jsonb:='[]'::jsonb; assinatura text; escopos jsonb;
begin
  if not (app_private.usuario_e_supervisao() or app_private.usuario_e_direcao_admin())
    or not app_private.mms_cobertura_integral(p_lote_id) then raise exception 'acesso_negado' using errcode='42501'; end if;
  select * into l from public.mms_lotes_importacao where id=p_lote_id and deleted_at is null;
  if l.id is null then raise exception 'acesso_negado' using errcode='42501'; end if;
  if l.espelho_processado_em is null then motivos:=motivos||'"lote_nao_processado"'::jsonb; end if;
  if l.status='cancelado' then motivos:=motivos||'"lote_cancelado"'::jsonb; end if;
  if exists(select 1 from public.mms_operacoes_lote where lote_importacao_id=l.id and estado='em_andamento')
    then motivos:=motivos||'"operacao_em_andamento"'::jsonb; end if;
  if exists(
    select 1 from (select distinct posto_id,data_atividade from public.mms_linhas_importacao where lote_importacao_id=l.id and deleted_at is null) alvo
    join public.mms_linhas_importacao x on x.posto_id=alvo.posto_id and x.data_atividade=alvo.data_atividade and x.deleted_at is null
    join public.mms_lotes_importacao outro on outro.id=x.lote_importacao_id and outro.espelho_processado_em>l.espelho_processado_em
      and outro.status<>'cancelado' and outro.deleted_at is null
  ) then motivos:=motivos||'"lote_nao_e_mais_recente"'::jsonb; end if;
  if exists (
    select 1 from public.mms_assistencias a
    where a.lote_ultimo_id=l.id and a.corrigido_em>l.espelho_processado_em
  ) or exists (
    select 1 from public.mms_partes_assistencia p
    where p.lote_ultimo_id=l.id and p.corrigido_em>l.espelho_processado_em
  ) then motivos:=motivos||'"edicao_manual_posterior"'::jsonb; end if;
  select coalesce(jsonb_agg(jsonb_build_object(
    'posto_id',s.posto_id,'data_atividade',s.data_atividade,
    'lote_predecessor_id',app_private.mms_predecessor_escopo(l.id,s.posto_id,s.data_atividade)
  ) order by s.posto_id,s.data_atividade),'[]'::jsonb)
  into escopos
  from (
    select distinct posto_id,data_atividade from public.mms_linhas_importacao
    where lote_importacao_id=l.id and deleted_at is null
  ) s;
  if jsonb_array_length(motivos)=0 then
    assinatura:=pg_catalog.encode(extensions.digest(l.id::text||':'||l.versao_tratamento::text||':'||escopos::text,'sha256'),'hex');
  end if;
  perform app_private.registrar_auditoria('mms_lotes_importacao',l.id,
    case when assinatura is null then 'analise_desfazer_bloqueada' else 'analise_desfazer_realizada' end,
    null,null,jsonb_build_object('lote_id',l.id,'motivos',motivos));
  return jsonb_build_object('lote_id',l.id,'elegivel',assinatura is not null,'versao_tratamento',l.versao_tratamento,
    'assinatura_analise',assinatura,'analisado_em',now(),'escopos',escopos,
    'impacto',jsonb_build_object('assistencias_restauradas',0,'assistencias_retiradas',0,'partes_restauradas',0,'partes_retiradas',0),
    'motivos_bloqueio',motivos);
end
$$;

create or replace function public.desfazer_importacao_mms(
  p_lote_id uuid,p_assinatura_analise text,p_justificativa text,p_chave_idempotencia uuid
)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare analise jsonb; ator uuid:=app_private.usuario_atual_id(); op public.mms_operacoes_lote%rowtype;
  hash text; resultado_operacao jsonb; escopo jsonb; parcial jsonb;
  assistencias_restauradas int:=0; assistencias_retiradas int:=0;
  partes_restauradas int:=0; partes_retiradas int:=0;
begin
  if length(btrim(coalesce(p_justificativa,''))) not between 10 and 1000 then raise exception 'justificativa_invalida' using errcode='22023'; end if;
  hash:=pg_catalog.encode(extensions.digest(p_lote_id::text||':'||p_assinatura_analise||':'||btrim(p_justificativa),'sha256'),'hex');
  select * into op from public.mms_operacoes_lote where created_by=ator and chave_idempotencia=p_chave_idempotencia;
  if op.id is not null then
    if op.hash_requisicao<>hash then raise exception 'chave_idempotencia_conflitante' using errcode='22023'; end if;
    return jsonb_build_object('operacao_id',op.id,'lote_id',op.lote_importacao_id,'tipo',op.tipo,
      'estado',op.estado,'chave_idempotencia',op.chave_idempotencia,'resultado',op.resultado,'codigo_falha',op.codigo_falha);
  end if;
  analise:=public.analisar_desfazer_importacao_mms(p_lote_id);
  if not coalesce((analise->>'elegivel')::boolean,false) or analise->>'assinatura_analise'<>p_assinatura_analise
    then raise exception 'analise_desatualizada' using errcode='40001'; end if;
  insert into public.mms_operacoes_lote(lote_importacao_id,tipo,chave_idempotencia,hash_requisicao,
    versao_tratamento,assinatura_analise,justificativa,created_by)
  values(p_lote_id,'desfazer',p_chave_idempotencia,hash,(analise->>'versao_tratamento')::int,
    p_assinatura_analise,btrim(p_justificativa),ator) returning * into op;
  for escopo in
    select value from jsonb_array_elements(analise->'escopos')
    order by value->>'posto_id',value->>'data_atividade'
  loop
    perform pg_advisory_xact_lock(
      hashtextextended((escopo->>'posto_id')||':'||(escopo->>'data_atividade'),0)
    );
    parcial:=app_private.mms_reconstruir_espelho_escopo(
      (escopo->>'posto_id')::uuid,(escopo->>'data_atividade')::date,
      (escopo->>'lote_predecessor_id')::uuid,p_lote_id
    );
    assistencias_restauradas:=assistencias_restauradas+coalesce((parcial->>'assistencias_restauradas')::int,0);
    assistencias_retiradas:=assistencias_retiradas+coalesce((parcial->>'assistencias_retiradas')::int,0);
    partes_restauradas:=partes_restauradas+coalesce((parcial->>'partes_restauradas')::int,0);
    partes_retiradas:=partes_retiradas+coalesce((parcial->>'partes_retiradas')::int,0);
  end loop;
  resultado_operacao:=jsonb_build_object(
    'status','cancelado','escopos',analise->'escopos',
    'assistencias_restauradas',assistencias_restauradas,
    'assistencias_retiradas',assistencias_retiradas,
    'partes_restauradas',partes_restauradas,'partes_retiradas',partes_retiradas
  );
  update public.mms_lotes_importacao set status='cancelado',tipo_cancelamento='desfazer_processado',
    cancelado_em=now(),cancelado_por=ator,resultado_processamento=resultado_operacao,updated_at=now(),updated_by=ator where id=p_lote_id;
  update public.mms_operacoes_lote o set estado='concluida',
    resultado=resultado_operacao,finalizado_em=now() where o.id=op.id;
  perform app_private.registrar_auditoria('mms_lotes_importacao',p_lote_id,'desfazer_importacao_concluido',null,null,
    jsonb_build_object('lote_id',p_lote_id,'operacao_id',op.id,'justificativa',btrim(p_justificativa)));
  return jsonb_build_object('operacao_id',op.id,'lote_id',p_lote_id,'tipo','desfazer','estado','concluida',
    'chave_idempotencia',p_chave_idempotencia,'resultado',resultado_operacao,'codigo_falha',null);
end
$$;

alter table public.mms_correcoes_importacao enable row level security;
alter table public.mms_operacoes_lote enable row level security;
create policy mms_correcoes_select on public.mms_correcoes_importacao for select to authenticated
  using (app_private.mms_lote_acessivel(lote_importacao_id));
create policy mms_operacoes_select on public.mms_operacoes_lote for select to authenticated
  using (app_private.mms_cobertura_integral(lote_importacao_id));

revoke all on public.mms_correcoes_importacao,public.mms_operacoes_lote from public,anon,authenticated;
grant select on public.mms_correcoes_importacao,public.mms_operacoes_lote to authenticated;
revoke all on function
  public.listar_lotes_importacao_mms(jsonb,timestamptz,uuid,integer),
  public.obter_detalhe_lote_importacao_mms(uuid),
  public.listar_itens_lote_importacao_mms(uuid,text,jsonb,jsonb,integer),
  public.salvar_correcao_importacao_mms(uuid,uuid,text,jsonb,integer,text),
  public.concluir_tratamento_importacao_mms(uuid,integer),
  public.reprocessar_lote_importacao_mms(uuid,integer,uuid),
  public.obter_operacao_lote_mms(uuid,uuid),
  public.analisar_desfazer_importacao_mms(uuid),
  public.desfazer_importacao_mms(uuid,text,text,uuid)
from public,anon;
grant execute on function
  public.listar_lotes_importacao_mms(jsonb,timestamptz,uuid,integer),
  public.obter_detalhe_lote_importacao_mms(uuid),
  public.listar_itens_lote_importacao_mms(uuid,text,jsonb,jsonb,integer),
  public.salvar_correcao_importacao_mms(uuid,uuid,text,jsonb,integer,text),
  public.concluir_tratamento_importacao_mms(uuid,integer),
  public.reprocessar_lote_importacao_mms(uuid,integer,uuid),
  public.obter_operacao_lote_mms(uuid,uuid),
  public.analisar_desfazer_importacao_mms(uuid),
  public.desfazer_importacao_mms(uuid,text,text,uuid)
to authenticated;
revoke all on function
  app_private.mms_json_efetivo(uuid),app_private.mms_cobertura_integral(uuid),
  app_private.mms_pode_corrigir(uuid),app_private.mms_usuario_pode_corrigir_posto(uuid),
  app_private.mms_campo_correcao(text),app_private.mms_capacidades_lote(uuid),
  app_private.mms_bloquear_correcao_mutacao()
from public,anon,authenticated;

drop policy if exists mms_importacoes_select on storage.objects;
create policy mms_importacoes_select on storage.objects for select to authenticated using (
  bucket_id='mms-importacoes' and exists (
    select 1 from public.mms_lotes_importacao l
    where l.id::text=(storage.foldername(name))[2] and l.caminho_arquivo=name
      and app_private.mms_cobertura_integral(l.id)
  )
);

commit;
