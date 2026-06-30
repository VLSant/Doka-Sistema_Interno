begin;

create extension if not exists pg_trgm with schema extensions;

alter table public.mms_assistencias
  add column versao_registro bigint not null default 1,
  add constraint mms_assistencias_versao_registro_positiva
    check (versao_registro > 0);

alter table public.mms_partes_assistencia
  add column versao_registro bigint not null default 1,
  add constraint mms_partes_versao_registro_positiva
    check (versao_registro > 0);

create or replace function app_private.mms_incrementar_versao_registro()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.versao_registro := old.versao_registro + 1;
  return new;
end;
$$;

drop trigger if exists mms_assistencias_versao_registro on public.mms_assistencias;
create trigger mms_assistencias_versao_registro
before update on public.mms_assistencias
for each row execute function app_private.mms_incrementar_versao_registro();

drop trigger if exists mms_partes_versao_registro on public.mms_partes_assistencia;
create trigger mms_partes_versao_registro
before update on public.mms_partes_assistencia
for each row execute function app_private.mms_incrementar_versao_registro();

create or replace function app_private.mms_normalizar_busca(valor text)
returns text
language sql
immutable
set search_path = ''
as $$
  select nullif(
    upper(regexp_replace(btrim(coalesce(valor, '')), '\s+', ' ', 'g')),
    ''
  )
$$;

create or replace function app_private.usuario_pode_corrigir_assistencia_mms(
  posto_uuid uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    app_private.usuario_e_direcao_admin()
    or exists (
      select 1
      from public.usuarios u
      join public.usuarios_postos up on up.usuario_id = u.id
      join public.postos p on p.id = up.posto_id
      where u.auth_user_id = auth.uid()
        and u.ativo
        and u.deleted_at is null
        and up.deleted_at is null
        and p.deleted_at is null
        and p.ativo
        and up.posto_id = posto_uuid
        and (
          (
            u.perfil = 'operador'::public.perfil_usuario
            and up.nivel_acesso = 'operacional'::public.nivel_acesso_posto
          )
          or (
            u.perfil = 'supervisao'::public.perfil_usuario
            and up.nivel_acesso = 'supervisao'::public.nivel_acesso_posto
          )
        )
    ),
    false
  )
$$;

create index mms_assistencias_lista_cursor_idx
  on public.mms_assistencias (data_atividade desc, id desc)
  where deleted_at is null;

create index mms_assistencias_posto_lista_cursor_idx
  on public.mms_assistencias (posto_id, data_atividade desc, id desc)
  where deleted_at is null;

create index mms_assistencias_numero_trgm_idx
  on public.mms_assistencias
  using gin (numero_assistencia_normalizado extensions.gin_trgm_ops)
  where deleted_at is null;

create index mms_assistencias_cliente_vigente_trgm_idx
  on public.mms_assistencias
  using gin (
    app_private.mms_normalizar_busca(
      app_private.mms_valor_visivel(
        cliente_nome_importado,
        cliente_nome_corrigido
      )
    ) extensions.gin_trgm_ops
  )
  where deleted_at is null;

create index mms_partes_assistencia_lista_idx
  on public.mms_partes_assistencia (assistencia_id, status_interno, id)
  where deleted_at is null;

create index historico_auditoria_entidade_cursor_idx
  on public.historico_auditoria
  (entidade_tipo, entidade_id, created_at desc, id desc);

create or replace function public.listar_assistencias_mms(
  p_filtros jsonb default '{}'::jsonb,
  p_cursor_data_atividade date default null,
  p_cursor_id uuid default null,
  p_limite integer default 50
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_ator uuid := app_private.usuario_atual_id();
  v_posto_id uuid;
  v_data_de date;
  v_data_ate date;
  v_status text;
  v_tipo text;
  v_cliente text;
  v_numero text;
  v_situacao text := coalesce(nullif(p_filtros ->> 'situacao', ''), 'ativo');
  v_itens jsonb;
  v_cursor jsonb;
begin
  if v_ator is null then
    raise exception 'acesso_negado' using errcode = '42501';
  end if;

  if p_filtros is null or jsonb_typeof(p_filtros) <> 'object'
     or p_limite < 1 or p_limite > 100
     or v_situacao not in ('ativo', 'removido', 'todos')
     or ((p_cursor_data_atividade is null) <> (p_cursor_id is null)) then
    raise exception 'filtros_invalidos' using errcode = '22023';
  end if;

  begin
    v_posto_id := nullif(p_filtros ->> 'posto_id', '')::uuid;
    v_data_de := nullif(p_filtros ->> 'data_de', '')::date;
    v_data_ate := nullif(p_filtros ->> 'data_ate', '')::date;
  exception
    when invalid_text_representation or datetime_field_overflow then
      raise exception 'filtros_invalidos' using errcode = '22023';
  end;

  if v_data_de is not null and v_data_ate is not null and v_data_de > v_data_ate then
    raise exception 'filtros_invalidos' using errcode = '22023';
  end if;

  if v_posto_id is not null
     and not (
       app_private.usuario_e_direcao_admin()
       or app_private.usuario_tem_acesso_posto(v_posto_id)
     ) then
    raise exception 'acesso_negado' using errcode = '42501';
  end if;

  v_status := app_private.mms_normalizar_busca(p_filtros ->> 'status');
  v_tipo := app_private.mms_normalizar_busca(p_filtros ->> 'tipo');
  v_cliente := app_private.mms_normalizar_busca(p_filtros ->> 'cliente');
  v_numero := app_private.mms_normalizar_busca(p_filtros ->> 'numero_assistencia');

  select coalesce(jsonb_agg(to_jsonb(q) order by q.data_atividade desc, q.assistencia_id desc), '[]'::jsonb)
  into v_itens
  from (
    select
      a.id as assistencia_id,
      a.numero_assistencia,
      jsonb_build_object('id', p.id, 'nome', p.nome) as posto,
      a.data_atividade,
      app_private.mms_valor_visivel(
        a.cliente_nome_importado,
        a.cliente_nome_corrigido
      ) as cliente,
      a.tipo_atividade_normalizado as tipo,
      a.status_atividade as status,
      a.status_interno::text as situacao,
      (
        select count(*)::integer
        from public.mms_partes_assistencia pa
        where pa.assistencia_id = a.id
          and pa.deleted_at is null
          and pa.status_interno = 'ativo'
      ) as total_partes_ativas,
      (
        select count(*)::integer
        from public.mms_partes_assistencia pa
        where pa.assistencia_id = a.id
          and pa.deleted_at is null
      ) as total_partes,
      a.versao_registro
    from public.mms_assistencias a
    join public.postos p on p.id = a.posto_id
    where a.deleted_at is null
      and p.deleted_at is null
      and (
        app_private.usuario_e_direcao_admin()
        or app_private.usuario_tem_acesso_posto(a.posto_id)
      )
      and (v_posto_id is null or a.posto_id = v_posto_id)
      and (v_data_de is null or a.data_atividade >= v_data_de)
      and (v_data_ate is null or a.data_atividade <= v_data_ate)
      and (v_status is null or app_private.mms_normalizar_busca(a.status_atividade) = v_status)
      and (v_tipo is null or app_private.mms_normalizar_busca(a.tipo_atividade_normalizado) = v_tipo)
      and (
        v_cliente is null
        or app_private.mms_normalizar_busca(
          app_private.mms_valor_visivel(
            a.cliente_nome_importado,
            a.cliente_nome_corrigido
          )
        ) like '%' || v_cliente || '%'
      )
      and (
        v_numero is null
        or a.numero_assistencia_normalizado like '%' || v_numero || '%'
      )
      and (
        v_situacao = 'todos'
        or a.status_interno::text = v_situacao
      )
      and (
        p_cursor_data_atividade is null
        or (a.data_atividade, a.id) < (p_cursor_data_atividade, p_cursor_id)
      )
    order by a.data_atividade desc, a.id desc
    limit (p_limite + 1)
  ) q;

  if jsonb_array_length(v_itens) > p_limite then
    v_cursor := jsonb_build_object(
      'data_atividade', v_itens -> (p_limite - 1) ->> 'data_atividade',
      'id', v_itens -> (p_limite - 1) ->> 'assistencia_id'
    );
    v_itens := v_itens - p_limite;
  end if;

  return jsonb_build_object(
    'itens', v_itens,
    'proximo_cursor', v_cursor
  );
end;
$$;

create or replace function public.obter_detalhe_assistencia_mms(
  p_assistencia_id uuid,
  p_incluir_partes_removidas boolean default false
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_ator uuid := app_private.usuario_atual_id();
  v_assistencia public.mms_assistencias%rowtype;
  v_posto public.postos%rowtype;
  v_partes jsonb;
  v_removidas_ocultas integer;
  v_pode_corrigir boolean;
begin
  if v_ator is null or p_assistencia_id is null then
    raise exception 'acesso_negado' using errcode = '42501';
  end if;

  select a.* into v_assistencia
  from public.mms_assistencias a
  where a.id = p_assistencia_id
    and a.deleted_at is null
    and (
      app_private.usuario_e_direcao_admin()
      or app_private.usuario_tem_acesso_posto(a.posto_id)
    );

  if v_assistencia.id is null then
    raise exception 'acesso_negado' using errcode = '42501';
  end if;

  select p.* into v_posto
  from public.postos p
  where p.id = v_assistencia.posto_id
    and p.deleted_at is null;

  v_pode_corrigir :=
    v_assistencia.status_interno = 'ativo'
    and app_private.usuario_pode_corrigir_assistencia_mms(v_assistencia.posto_id);

  select count(*)::integer into v_removidas_ocultas
  from public.mms_partes_assistencia pa
  where pa.assistencia_id = v_assistencia.id
    and pa.deleted_at is null
    and pa.status_interno = 'removido';

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'parte_id', pa.id,
        'parte_conjunto', pa.parte_conjunto,
        'situacao', pa.status_interno,
        'status', pa.status_atividade,
        'tipo_original', pa.tipo_atividade_original,
        'tipo', pa.tipo_atividade_normalizado,
        'descricao_mercadoria', jsonb_build_object(
          'importado', pa.descricao_mercadoria_importada,
          'corrigido', pa.descricao_mercadoria_corrigida,
          'vigente', app_private.mms_valor_visivel(
            pa.descricao_mercadoria_importada,
            pa.descricao_mercadoria_corrigida
          ),
          'origem_vigente', case
            when nullif(btrim(pa.descricao_mercadoria_corrigida), '') is not null then 'correcao'
            when pa.descricao_mercadoria_importada is not null then 'importacao'
            else 'ausente'
          end
        ),
        'recurso', jsonb_build_object(
          'importado', pa.recurso_importado,
          'corrigido', pa.recurso_corrigido,
          'vigente', app_private.mms_valor_visivel(
            pa.recurso_importado,
            pa.recurso_corrigido
          ),
          'origem_vigente', case
            when nullif(btrim(pa.recurso_corrigido), '') is not null then 'correcao'
            when pa.recurso_importado is not null then 'importacao'
            else 'ausente'
          end
        ),
        'origem', jsonb_build_object(
          'lote_criacao_id', pa.lote_criacao_id,
          'linha_criacao_id', pa.linha_criacao_id,
          'lote_ultimo_id', pa.lote_ultimo_id,
          'linha_ultima_id', pa.linha_ultima_id
        ),
        'versao_registro', pa.versao_registro,
        'pode_corrigir', (
          pa.status_interno = 'ativo'
          and v_pode_corrigir
        )
      )
      order by pa.parte_conjunto_normalizada, pa.id
    ),
    '[]'::jsonb
  )
  into v_partes
  from public.mms_partes_assistencia pa
  where pa.assistencia_id = v_assistencia.id
    and pa.deleted_at is null
    and (p_incluir_partes_removidas or pa.status_interno = 'ativo');

  return jsonb_build_object(
    'assistencia_id', v_assistencia.id,
    'numero_assistencia', v_assistencia.numero_assistencia,
    'posto', jsonb_build_object('id', v_posto.id, 'nome', v_posto.nome),
    'data_atividade', v_assistencia.data_atividade,
    'status', v_assistencia.status_atividade,
    'tipo_original', v_assistencia.tipo_atividade_original,
    'tipo', v_assistencia.tipo_atividade_normalizado,
    'situacao', v_assistencia.status_interno,
    'cliente', jsonb_build_object(
      'importado', v_assistencia.cliente_nome_importado,
      'corrigido', v_assistencia.cliente_nome_corrigido,
      'vigente', app_private.mms_valor_visivel(
        v_assistencia.cliente_nome_importado,
        v_assistencia.cliente_nome_corrigido
      ),
      'origem_vigente', case
        when nullif(btrim(v_assistencia.cliente_nome_corrigido), '') is not null then 'correcao'
        when v_assistencia.cliente_nome_importado is not null then 'importacao'
        else 'ausente'
      end
    ),
    'endereco', jsonb_build_object(
      'importado', v_assistencia.endereco_importado,
      'corrigido', v_assistencia.endereco_corrigido,
      'vigente', app_private.mms_valor_visivel(
        v_assistencia.endereco_importado,
        v_assistencia.endereco_corrigido
      ),
      'origem_vigente', case
        when nullif(btrim(v_assistencia.endereco_corrigido), '') is not null then 'correcao'
        when v_assistencia.endereco_importado is not null then 'importacao'
        else 'ausente'
      end
    ),
    'origem', jsonb_build_object(
      'lote_criacao_id', v_assistencia.lote_criacao_id,
      'linha_criacao_id', v_assistencia.linha_criacao_id,
      'lote_ultimo_id', v_assistencia.lote_ultimo_id,
      'linha_ultima_id', v_assistencia.linha_ultima_id
    ),
    'versao_registro', v_assistencia.versao_registro,
    'capacidades', jsonb_build_object(
      'corrigir_assistencia', v_pode_corrigir,
      'consultar_historico', true
    ),
    'partes_removidas_ocultas', case
      when p_incluir_partes_removidas then 0
      else v_removidas_ocultas
    end,
    'partes', v_partes
  );
end;
$$;

create or replace function public.corrigir_campo_assistencia_mms(
  p_tipo_entidade text,
  p_entidade_id uuid,
  p_campo text,
  p_valor_corrigido text,
  p_justificativa text,
  p_versao_esperada bigint
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_ator uuid := app_private.usuario_atual_id();
  v_assistencia public.mms_assistencias%rowtype;
  v_parte public.mms_partes_assistencia%rowtype;
  v_posto_id uuid;
  v_importado text;
  v_corrigido text;
  v_versao bigint;
  v_corrigido_em timestamptz;
begin
  if v_ator is null or p_entidade_id is null then
    raise exception 'acesso_negado' using errcode = '42501';
  end if;

  if nullif(btrim(p_justificativa), '') is null
     or length(btrim(p_justificativa)) > 1000 then
    raise exception 'justificativa_obrigatoria' using errcode = '22023';
  end if;

  if nullif(btrim(p_valor_corrigido), '') is null then
    raise exception 'valor_invalido' using errcode = '22023';
  end if;

  if p_tipo_entidade = 'assistencia'
     and p_campo in ('cliente_nome', 'endereco') then
    select a.* into v_assistencia
    from public.mms_assistencias a
    where a.id = p_entidade_id
      and a.deleted_at is null
    for update;

    if v_assistencia.id is null then
      raise exception 'acesso_negado' using errcode = '42501';
    end if;

    v_posto_id := v_assistencia.posto_id;

    if not (
      app_private.usuario_e_direcao_admin()
      or app_private.usuario_tem_acesso_posto(v_posto_id)
    ) then
      raise exception 'acesso_negado' using errcode = '42501';
    end if;

    if not app_private.usuario_pode_corrigir_assistencia_mms(v_posto_id) then
      raise exception 'vinculo_somente_consulta' using errcode = '42501';
    end if;

    if v_assistencia.status_interno <> 'ativo' then
      raise exception 'registro_removido' using errcode = '55000';
    end if;

    if v_assistencia.versao_registro <> p_versao_esperada then
      raise exception 'correcao_desatualizada' using errcode = '40001';
    end if;

    if (p_campo = 'cliente_nome' and length(btrim(p_valor_corrigido)) > 300)
       or (p_campo = 'endereco' and length(btrim(p_valor_corrigido)) > 1000) then
      raise exception 'valor_invalido' using errcode = '22023';
    end if;

    if p_campo = 'cliente_nome' then
      update public.mms_assistencias
      set cliente_nome_corrigido = btrim(p_valor_corrigido),
          corrigido_em = now(),
          corrigido_por = v_ator,
          motivo_correcao = btrim(p_justificativa),
          updated_by = v_ator
      where id = p_entidade_id
      returning
        cliente_nome_importado,
        cliente_nome_corrigido,
        versao_registro,
        corrigido_em
      into v_importado, v_corrigido, v_versao, v_corrigido_em;
    else
      update public.mms_assistencias
      set endereco_corrigido = btrim(p_valor_corrigido),
          corrigido_em = now(),
          corrigido_por = v_ator,
          motivo_correcao = btrim(p_justificativa),
          updated_by = v_ator
      where id = p_entidade_id
      returning
        endereco_importado,
        endereco_corrigido,
        versao_registro,
        corrigido_em
      into v_importado, v_corrigido, v_versao, v_corrigido_em;
    end if;
  elsif p_tipo_entidade = 'parte'
        and p_campo in ('descricao_mercadoria', 'recurso') then
    select pa.* into v_parte
    from public.mms_partes_assistencia pa
    where pa.id = p_entidade_id
      and pa.deleted_at is null
    for update;

    if v_parte.id is null then
      raise exception 'acesso_negado' using errcode = '42501';
    end if;

    select a.* into v_assistencia
    from public.mms_assistencias a
    where a.id = v_parte.assistencia_id
      and a.deleted_at is null;

    if v_assistencia.id is null then
      raise exception 'acesso_negado' using errcode = '42501';
    end if;

    v_posto_id := v_assistencia.posto_id;

    if not (
      app_private.usuario_e_direcao_admin()
      or app_private.usuario_tem_acesso_posto(v_posto_id)
    ) then
      raise exception 'acesso_negado' using errcode = '42501';
    end if;

    if not app_private.usuario_pode_corrigir_assistencia_mms(v_posto_id) then
      raise exception 'vinculo_somente_consulta' using errcode = '42501';
    end if;

    if v_assistencia.status_interno <> 'ativo' or v_parte.status_interno <> 'ativo' then
      raise exception 'registro_removido' using errcode = '55000';
    end if;

    if v_parte.versao_registro <> p_versao_esperada then
      raise exception 'correcao_desatualizada' using errcode = '40001';
    end if;

    if (p_campo = 'descricao_mercadoria' and length(btrim(p_valor_corrigido)) > 1000)
       or (p_campo = 'recurso' and length(btrim(p_valor_corrigido)) > 300) then
      raise exception 'valor_invalido' using errcode = '22023';
    end if;

    if p_campo = 'descricao_mercadoria' then
      update public.mms_partes_assistencia
      set descricao_mercadoria_corrigida = btrim(p_valor_corrigido),
          corrigido_em = now(),
          corrigido_por = v_ator,
          motivo_correcao = btrim(p_justificativa),
          updated_by = v_ator
      where id = p_entidade_id
      returning
        descricao_mercadoria_importada,
        descricao_mercadoria_corrigida,
        versao_registro,
        corrigido_em
      into v_importado, v_corrigido, v_versao, v_corrigido_em;
    else
      update public.mms_partes_assistencia
      set recurso_corrigido = btrim(p_valor_corrigido),
          corrigido_em = now(),
          corrigido_por = v_ator,
          motivo_correcao = btrim(p_justificativa),
          updated_by = v_ator
      where id = p_entidade_id
      returning
        recurso_importado,
        recurso_corrigido,
        versao_registro,
        corrigido_em
      into v_importado, v_corrigido, v_versao, v_corrigido_em;
    end if;
  else
    raise exception 'campo_nao_corrigivel' using errcode = '22023';
  end if;

  return jsonb_build_object(
    'tipo_entidade', p_tipo_entidade,
    'entidade_id', p_entidade_id,
    'campo', p_campo,
    'importado', v_importado,
    'corrigido', v_corrigido,
    'vigente', app_private.mms_valor_visivel(v_importado, v_corrigido),
    'origem_vigente', 'correcao',
    'versao_registro', v_versao,
    'corrigido_em', v_corrigido_em,
    'corrigido_por', jsonb_build_object(
      'id', v_ator,
      'nome', (select u.nome from public.usuarios u where u.id = v_ator)
    )
  );
end;
$$;

create or replace function public.listar_historico_assistencia_mms(
  p_assistencia_id uuid,
  p_cursor_created_at timestamptz default null,
  p_cursor_id uuid default null,
  p_limite integer default 50
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_ator uuid := app_private.usuario_atual_id();
  v_assistencia public.mms_assistencias%rowtype;
  v_itens jsonb;
  v_cursor jsonb;
begin
  if v_ator is null or p_assistencia_id is null then
    raise exception 'acesso_negado' using errcode = '42501';
  end if;

  if p_limite < 1 or p_limite > 100
     or ((p_cursor_created_at is null) <> (p_cursor_id is null)) then
    raise exception 'cursor_invalido' using errcode = '22023';
  end if;

  select a.* into v_assistencia
  from public.mms_assistencias a
  where a.id = p_assistencia_id
    and (
      app_private.usuario_e_direcao_admin()
      or (
        a.deleted_at is null
        and app_private.usuario_tem_acesso_posto(a.posto_id)
      )
    );

  if v_assistencia.id is null then
    raise exception 'acesso_negado' using errcode = '42501';
  end if;

  select coalesce(
    jsonb_agg(to_jsonb(q) order by q.created_at desc, q.evento_id desc),
    '[]'::jsonb
  )
  into v_itens
  from (
    select
      ha.id as evento_id,
      ha.created_at,
      case ha.acao
        when 'criado' then 'importacao'
        when 'atualizado_por_importacao' then 'importacao'
        when 'corrigido' then 'correcao'
        when 'marcado_removido' then 'remocao_operacional'
        when 'reativado_por_importacao' then 'reativacao'
        when 'soft_delete_registrado' then 'exclusao_logica'
        else 'outro'
      end as tipo,
      ha.acao,
      case
        when ha.entidade_tipo = 'mms_assistencias' then 'assistencia'
        else 'parte'
      end as entidade,
      ha.entidade_id,
      ha.metadata ->> 'parte_conjunto' as parte_conjunto,
      case
        when ha.acao <> 'corrigido' then null
        when ha.entidade_tipo = 'mms_assistencias'
             and ha.valor_anterior ->> 'cliente_nome_corrigido'
                 is distinct from ha.valor_novo ->> 'cliente_nome_corrigido'
          then 'cliente_nome'
        when ha.entidade_tipo = 'mms_assistencias'
             and ha.valor_anterior ->> 'endereco_corrigido'
                 is distinct from ha.valor_novo ->> 'endereco_corrigido'
          then 'endereco'
        when ha.entidade_tipo = 'mms_partes_assistencia'
             and ha.valor_anterior ->> 'descricao_mercadoria_corrigida'
                 is distinct from ha.valor_novo ->> 'descricao_mercadoria_corrigida'
          then 'descricao_mercadoria'
        when ha.entidade_tipo = 'mms_partes_assistencia'
             and ha.valor_anterior ->> 'recurso_corrigido'
                 is distinct from ha.valor_novo ->> 'recurso_corrigido'
          then 'recurso'
        else null
      end as campo,
      case
        when ha.entidade_tipo = 'mms_assistencias'
             and ha.valor_anterior ->> 'cliente_nome_corrigido'
                 is distinct from ha.valor_novo ->> 'cliente_nome_corrigido'
          then app_private.mms_valor_visivel(
            ha.valor_anterior ->> 'cliente_nome_importado',
            ha.valor_anterior ->> 'cliente_nome_corrigido'
          )
        when ha.entidade_tipo = 'mms_assistencias'
             and ha.valor_anterior ->> 'endereco_corrigido'
                 is distinct from ha.valor_novo ->> 'endereco_corrigido'
          then app_private.mms_valor_visivel(
            ha.valor_anterior ->> 'endereco_importado',
            ha.valor_anterior ->> 'endereco_corrigido'
          )
        when ha.entidade_tipo = 'mms_partes_assistencia'
             and ha.valor_anterior ->> 'descricao_mercadoria_corrigida'
                 is distinct from ha.valor_novo ->> 'descricao_mercadoria_corrigida'
          then app_private.mms_valor_visivel(
            ha.valor_anterior ->> 'descricao_mercadoria_importada',
            ha.valor_anterior ->> 'descricao_mercadoria_corrigida'
          )
        when ha.entidade_tipo = 'mms_partes_assistencia'
             and ha.valor_anterior ->> 'recurso_corrigido'
                 is distinct from ha.valor_novo ->> 'recurso_corrigido'
          then app_private.mms_valor_visivel(
            ha.valor_anterior ->> 'recurso_importado',
            ha.valor_anterior ->> 'recurso_corrigido'
          )
        else null
      end as valor_anterior,
      case
        when ha.entidade_tipo = 'mms_assistencias'
             and ha.valor_anterior ->> 'cliente_nome_corrigido'
                 is distinct from ha.valor_novo ->> 'cliente_nome_corrigido'
          then app_private.mms_valor_visivel(
            ha.valor_novo ->> 'cliente_nome_importado',
            ha.valor_novo ->> 'cliente_nome_corrigido'
          )
        when ha.entidade_tipo = 'mms_assistencias'
             and ha.valor_anterior ->> 'endereco_corrigido'
                 is distinct from ha.valor_novo ->> 'endereco_corrigido'
          then app_private.mms_valor_visivel(
            ha.valor_novo ->> 'endereco_importado',
            ha.valor_novo ->> 'endereco_corrigido'
          )
        when ha.entidade_tipo = 'mms_partes_assistencia'
             and ha.valor_anterior ->> 'descricao_mercadoria_corrigida'
                 is distinct from ha.valor_novo ->> 'descricao_mercadoria_corrigida'
          then app_private.mms_valor_visivel(
            ha.valor_novo ->> 'descricao_mercadoria_importada',
            ha.valor_novo ->> 'descricao_mercadoria_corrigida'
          )
        when ha.entidade_tipo = 'mms_partes_assistencia'
             and ha.valor_anterior ->> 'recurso_corrigido'
                 is distinct from ha.valor_novo ->> 'recurso_corrigido'
          then app_private.mms_valor_visivel(
            ha.valor_novo ->> 'recurso_importado',
            ha.valor_novo ->> 'recurso_corrigido'
          )
        else null
      end as valor_novo,
      ha.metadata ->> 'motivo' as justificativa,
      case
        when u.id is null then null
        else jsonb_build_object('id', u.id, 'nome', u.nome)
      end as ator,
      jsonb_build_object(
        'lote_id', ha.metadata ->> 'lote_importacao_id',
        'linha_id', ha.metadata ->> 'linha_importacao_id',
        'pode_abrir_lote', case
          when nullif(ha.metadata ->> 'lote_importacao_id', '') is null then false
          else app_private.mms_lote_acessivel(
            (ha.metadata ->> 'lote_importacao_id')::uuid
          )
        end
      ) as origem
    from public.historico_auditoria ha
    left join public.usuarios u on u.id = ha.usuario_id
    where (
      (
        ha.entidade_tipo = 'mms_assistencias'
        and ha.entidade_id = v_assistencia.id
      )
      or (
        ha.entidade_tipo = 'mms_partes_assistencia'
        and ha.entidade_id in (
          select pa.id
          from public.mms_partes_assistencia pa
          where pa.assistencia_id = v_assistencia.id
        )
      )
    )
      and (
        p_cursor_created_at is null
        or (ha.created_at, ha.id) < (p_cursor_created_at, p_cursor_id)
      )
    order by ha.created_at desc, ha.id desc
    limit (p_limite + 1)
  ) q;

  if jsonb_array_length(v_itens) > p_limite then
    v_cursor := jsonb_build_object(
      'created_at', v_itens -> (p_limite - 1) ->> 'created_at',
      'id', v_itens -> (p_limite - 1) ->> 'evento_id'
    );
    v_itens := v_itens - p_limite;
  end if;

  return jsonb_build_object(
    'itens', v_itens,
    'proximo_cursor', v_cursor
  );
end;
$$;

revoke all on function app_private.mms_incrementar_versao_registro()
from public, anon, authenticated;
revoke all on function app_private.mms_normalizar_busca(text)
from public, anon, authenticated;
revoke all on function app_private.usuario_pode_corrigir_assistencia_mms(uuid)
from public, anon, authenticated;

revoke execute on function app_private.mms_corrigir_assistencia(uuid, text, text, text)
from authenticated;
revoke execute on function app_private.mms_corrigir_parte_assistencia(uuid, text, text, text)
from authenticated;

revoke all on function public.listar_assistencias_mms(jsonb, date, uuid, integer)
from public, anon, authenticated;
revoke all on function public.obter_detalhe_assistencia_mms(uuid, boolean)
from public, anon, authenticated;
revoke all on function public.corrigir_campo_assistencia_mms(text, uuid, text, text, text, bigint)
from public, anon, authenticated;
revoke all on function public.listar_historico_assistencia_mms(uuid, timestamptz, uuid, integer)
from public, anon, authenticated;

grant execute on function public.listar_assistencias_mms(jsonb, date, uuid, integer)
to authenticated;
grant execute on function public.obter_detalhe_assistencia_mms(uuid, boolean)
to authenticated;
grant execute on function public.corrigir_campo_assistencia_mms(text, uuid, text, text, text, bigint)
to authenticated;
grant execute on function public.listar_historico_assistencia_mms(uuid, timestamptz, uuid, integer)
to authenticated;

commit;
