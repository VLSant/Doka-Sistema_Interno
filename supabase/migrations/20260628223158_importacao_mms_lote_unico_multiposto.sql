begin;

-- Um arquivo MMS corresponde a uma única tentativa, ainda que contenha vários
-- postos. O posto autoritativo permanece em cada linha e no espelho operacional.
alter table public.mms_lotes_importacao
  alter column posto_id drop not null,
  add column multiplos_postos boolean not null default false;

alter table public.mms_lotes_importacao
  drop constraint if exists mms_lotes_spec006_metadata_check;

alter table public.mms_lotes_importacao
  add constraint mms_lotes_importacao_escopo_check check (
    (multiplos_postos and posto_id is null)
    or (not multiplos_postos and posto_id is not null)
  ),
  add constraint mms_lotes_spec006_metadata_check check (
    caminho_arquivo is null or (
      (
        (multiplos_postos and area_trabalho_original is null)
        or (
          not multiplos_postos
          and nullif(btrim(area_trabalho_original), '') is not null
        )
      )
      and bucket_arquivo = 'mms-importacoes'
      and extensao_arquivo in ('csv', 'xlsx')
      and tamanho_arquivo_bytes between 1 and 26214400
      and total_linhas_esperadas > 0
    )
  );

create index mms_linhas_lote_posto_data_idx
  on public.mms_linhas_importacao (lote_importacao_id, posto_id, data_atividade)
  where deleted_at is null;

create or replace function app_private.mms_normalizar_area(valor text)
returns text
language sql
immutable
set search_path = ''
as $$
  select nullif(
    lower(regexp_replace(normalize(btrim(coalesce(valor, '')), NFC), '\s+', ' ', 'g')),
    ''
  )
$$;

create or replace function app_private.mms_posto_por_area(area_arg text)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select case when count(*) = 1 then (array_agg(p.id order by p.id))[1] end
  from public.postos p
  where p.ativo = true
    and p.deleted_at is null
    and app_private.mms_normalizar_area(area_arg) in (
      app_private.mms_normalizar_area(p.nome),
      app_private.mms_normalizar_area(p.codigo)
    )
$$;

revoke all on function app_private.mms_posto_por_area(text)
  from public, anon, authenticated;

create or replace function app_private.mms_validar_lote()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.multiplos_postos then
    if new.posto_id is not null then
      raise exception 'lote multi-posto nao aceita posto_id no cabecalho';
    end if;
  elsif not exists (
    select 1
    from public.postos p
    where p.id = new.posto_id
      and p.ativo = true
      and p.deleted_at is null
  ) then
    raise exception 'mms_lotes_importacao exige posto ativo e nao removido';
  end if;

  if new.estado_processamento = 'processando'::public.mms_estado_processamento_lote
     and new.processamento_iniciado_at is null then
    new.processamento_iniciado_at := now();
  end if;

  if new.estado_processamento = 'validado'::public.mms_estado_processamento_lote
     and new.processamento_finalizado_at is null then
    new.processamento_finalizado_at := now();
  end if;

  return new;
end
$$;

create or replace function app_private.mms_lote_workflow_acessivel(lote_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.mms_lotes_importacao l
    where l.id = lote_uuid
      and l.deleted_at is null
      and l.usuario_importador_id = app_private.usuario_atual_id()
      and app_private.usuario_atual_id() is not null
  )
$$;

create or replace function app_private.mms_lote_acessivel(lote_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(exists (
    select 1
    from public.mms_lotes_importacao l
    where l.id = lote_uuid
      and (
        app_private.usuario_e_direcao_admin()
        or (
          l.deleted_at is null
          and (
            (l.multiplos_postos and l.usuario_importador_id = app_private.usuario_atual_id())
            or (not l.multiplos_postos and app_private.usuario_tem_acesso_posto(l.posto_id))
          )
        )
      )
  ), false)
$$;

create or replace function app_private.mms_lote_gerenciavel(lote_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(exists (
    select 1
    from public.mms_lotes_importacao l
    where l.id = lote_uuid
      and (
        app_private.usuario_e_direcao_admin()
        or (
          l.deleted_at is null
          and (
            (l.multiplos_postos and l.usuario_importador_id = app_private.usuario_atual_id())
            or (
              not l.multiplos_postos
              and app_private.usuario_e_supervisao()
              and app_private.usuario_tem_acesso_posto(l.posto_id)
            )
          )
        )
      )
  ), false)
$$;

revoke all on function app_private.mms_lote_workflow_acessivel(uuid),
  app_private.mms_lote_acessivel(uuid),
  app_private.mms_lote_gerenciavel(uuid)
from public, anon, authenticated;
grant execute on function app_private.mms_lote_workflow_acessivel(uuid),
  app_private.mms_lote_acessivel(uuid),
  app_private.mms_lote_gerenciavel(uuid)
to authenticated;

drop policy if exists mms_lotes_importacao_select on public.mms_lotes_importacao;
create policy mms_lotes_importacao_select
on public.mms_lotes_importacao
for select
to authenticated
using ((select app_private.mms_lote_acessivel(id)));

drop policy if exists mms_lotes_importacao_insert on public.mms_lotes_importacao;
create policy mms_lotes_importacao_insert
on public.mms_lotes_importacao
for insert
to authenticated
with check (
  usuario_importador_id = (select app_private.usuario_atual_id())
  and (
    (multiplos_postos and posto_id is null)
    or (not multiplos_postos and (select app_private.usuario_tem_acesso_posto(posto_id)))
  )
);

drop policy if exists mms_lotes_importacao_update on public.mms_lotes_importacao;
create policy mms_lotes_importacao_update
on public.mms_lotes_importacao
for update
to authenticated
using ((select app_private.mms_lote_gerenciavel(id)))
with check ((select app_private.mms_lote_gerenciavel(id)));

revoke all on function public.iniciar_importacao_mms(text,text,text,bigint,text,date,integer)
  from public, anon, authenticated;
drop function public.iniciar_importacao_mms(text,text,text,bigint,text,date,integer);

create or replace function public.iniciar_importacao_mms(
  p_nome_origem text,
  p_extensao text,
  p_mime_type text,
  p_tamanho_bytes bigint,
  p_data_atividade date,
  p_total_linhas_esperadas integer
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  ator uuid := app_private.usuario_atual_id();
  lote_uuid uuid := gen_random_uuid();
  caminho text;
begin
  if (select auth.uid()) is null or ator is null then
    raise exception 'acesso_negado' using errcode = '42501';
  end if;

  if nullif(btrim(p_nome_origem), '') is null
    or lower(p_extensao) not in ('csv', 'xlsx')
    or p_tamanho_bytes not between 1 and 26214400
    or p_total_linhas_esperadas < 1
    or p_data_atividade is null then
    raise exception 'arquivo_incompativel' using errcode = '22023';
  end if;

  if not (
    (lower(p_extensao) = 'csv' and p_mime_type in ('text/csv','application/csv','application/vnd.ms-excel'))
    or (
      lower(p_extensao) = 'xlsx'
      and p_mime_type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
  ) then
    raise exception 'arquivo_incompativel' using errcode = '22023';
  end if;

  caminho := (select auth.uid())::text || '/' || lote_uuid::text || '/'
    || gen_random_uuid()::text || '.' || lower(p_extensao);

  insert into public.mms_lotes_importacao (
    id, nome_origem, posto_id, multiplos_postos, data_atividade,
    usuario_importador_id, estado_processamento, area_trabalho_original,
    bucket_arquivo, caminho_arquivo, extensao_arquivo, mime_type_arquivo,
    tamanho_arquivo_bytes, total_linhas_esperadas, created_by, updated_by
  ) values (
    lote_uuid, btrim(p_nome_origem), null, true, p_data_atividade,
    ator, 'recebido', null, 'mms-importacoes', caminho, lower(p_extensao),
    p_mime_type, p_tamanho_bytes, p_total_linhas_esperadas, ator, ator
  );

  perform app_private.registrar_auditoria(
    'mms_lotes_importacao',
    lote_uuid,
    'criado',
    null,
    null,
    jsonb_build_object(
      'nome_origem', btrim(p_nome_origem),
      'escopo_importacao', 'multiplos_postos'
    )
  );

  return jsonb_build_object(
    'lote_id', lote_uuid,
    'bucket', 'mms-importacoes',
    'caminho', caminho
  );
end
$$;

create or replace function public.registrar_linhas_importacao_mms(
  p_lote_id uuid,
  p_linhas jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  lote record;
  item jsonb;
  raw jsonb;
  linha_uuid uuid;
  posto_uuid uuid;
  n integer;
  area text;
  data_text text;
  data_val date;
  numero text;
  parte text;
  tipo_original text;
  status_original text;
  tipo text;
  status text;
  estado public.mms_estado_validacao_linha;
  normalizado jsonb;
  contexto_area jsonb;
  recebidas integer := 0;
  criadas integer := 0;
  preservadas integer := 0;
begin
  if jsonb_typeof(p_linhas) <> 'array'
    or jsonb_array_length(p_linhas) not between 1 and 250 then
    raise exception 'lote_incompleto' using errcode = '22023';
  end if;

  select * into lote
  from public.mms_lotes_importacao
  where id = p_lote_id
  for update;

  if lote.id is null or not app_private.mms_lote_workflow_acessivel(p_lote_id) then
    raise exception 'acesso_negado' using errcode = '42501';
  end if;
  if lote.arquivo_armazenado_em is null or lote.status is not null then
    raise exception 'lote_incompleto' using errcode = '22023';
  end if;

  for item in select value from jsonb_array_elements(p_linhas)
  loop
    if item - array['numero_linha_origem','raw_json'] <> '{}'::jsonb then
      raise exception 'payload_invalido' using errcode = '22023';
    end if;

    n := (item ->> 'numero_linha_origem')::integer;
    raw := item -> 'raw_json';
    recebidas := recebidas + 1;

    if n < 1 or not app_private.mms_raw_json_linha_valido(raw) then
      raise exception 'payload_invalido' using errcode = '22023';
    end if;

    select id into linha_uuid
    from public.mms_linhas_importacao
    where lote_importacao_id = p_lote_id
      and numero_linha_origem = n
      and deleted_at is null;

    if linha_uuid is not null then
      if (
        select raw_json
        from public.mms_linhas_importacao
        where id = linha_uuid
      ) = raw then
        preservadas := preservadas + 1;
        continue;
      end if;
      raise exception 'linha_duplicada_conflitante' using errcode = '23505';
    end if;

    data_text := app_private.mms_json_valor(raw, array['data']);
    area := app_private.mms_json_valor(raw, array['area de trabalho']);
    posto_uuid := app_private.mms_posto_por_area(area);
    numero := nullif(btrim(app_private.mms_json_valor(raw, array['numero da assistencia'])), '');
    parte := nullif(btrim(app_private.mms_json_valor(raw, array['parte do conjunto'])), '');
    tipo_original := app_private.mms_json_valor(raw, array['tipo de atividade']);
    status_original := app_private.mms_json_valor(raw, array['status da atividade']);
    data_val := app_private.mms_data_texto(data_text);
    tipo := app_private.mms_tipo_canonico(tipo_original);
    status := app_private.mms_status_canonico(status_original);
    contexto_area := jsonb_build_object('area_trabalho', area);

    estado := case
      when data_val = lote.data_atividade
        and posto_uuid is not null
        and numero is not null
        and parte is not null
        and tipo is not null
        and status is not null
      then 'valida'::public.mms_estado_validacao_linha
      else 'invalida'::public.mms_estado_validacao_linha
    end;

    normalizado := jsonb_strip_nulls(jsonb_build_object(
      'data_atividade', data_val,
      'area_trabalho', area,
      'posto_id', posto_uuid,
      'numero_assistencia', numero,
      'parte_conjunto', parte,
      'tipo_atividade_original', tipo_original,
      'tipo_atividade_normalizado', tipo,
      'status_atividade_original', status_original,
      'status_atividade', status,
      'recurso', app_private.mms_json_valor(raw, array['recurso','recurso / montador']),
      'cliente_nome', app_private.mms_json_valor(raw, array['cliente']),
      'endereco', app_private.mms_json_valor(raw, array['endereco']),
      'codigo_mercadoria', app_private.mms_json_valor(raw, array['codigo da mercadoria']),
      'descricao_mercadoria', app_private.mms_json_valor(raw, array['descricao da mercadoria']),
      'valor_deslocamento', app_private.mms_json_valor(raw, array['deslocamento']),
      'valor_receber_movel', app_private.mms_json_valor(raw, array['valor a receber pelo movel']),
      'atendimento_critico', app_private.mms_json_valor(raw, array['atendimento critico']),
      'quantidade_reagendamento', app_private.mms_json_valor(raw, array['quantidade de reagendamento']),
      'comentarios_local_montagem', app_private.mms_json_valor(raw, array['comentarios sobre o local da montagem']),
      'observacao_finalizacao', app_private.mms_json_valor(raw, array['observacao de finalizacao da montagem']),
      'defeito_identificado', app_private.mms_json_valor(raw, array['defeito identificado']),
      'laudo_ou_observacao', app_private.mms_json_valor(raw, array['laudo ou observacao'])
    ));

    insert into public.mms_linhas_importacao (
      lote_importacao_id, numero_linha_origem, raw_json, json_normalizado,
      posto_id, data_atividade, numero_assistencia, parte_conjunto,
      estado_validacao, created_by, updated_by
    ) values (
      p_lote_id, n, raw, normalizado, posto_uuid, data_val, numero, parte,
      estado, app_private.usuario_atual_id(), app_private.usuario_atual_id()
    )
    returning id into linha_uuid;

    criadas := criadas + 1;

    if data_val is null or data_val <> lote.data_atividade then
      insert into public.mms_erros_importacao (
        lote_importacao_id, linha_importacao_id, campo, codigo,
        mensagem, contexto, created_by
      ) values (
        p_lote_id, linha_uuid, 'Data', 'data_invalida',
        'Data inválida ou diferente da data do arquivo.',
        contexto_area, app_private.usuario_atual_id()
      );
    end if;

    if nullif(btrim(area), '') is null then
      insert into public.mms_erros_importacao (
        lote_importacao_id, linha_importacao_id, campo, codigo,
        mensagem, contexto, created_by
      ) values (
        p_lote_id, linha_uuid, 'Área de Trabalho', 'area_trabalho_ausente',
        'Área de Trabalho ausente.', contexto_area, app_private.usuario_atual_id()
      );
    elsif posto_uuid is null then
      insert into public.mms_erros_importacao (
        lote_importacao_id, linha_importacao_id, campo, codigo,
        mensagem, contexto, created_by
      ) values (
        p_lote_id, linha_uuid, 'Área de Trabalho', 'posto_nao_encontrado',
        'Posto não cadastrado ou inativo.', contexto_area, app_private.usuario_atual_id()
      );
    end if;

    if numero is null then
      insert into public.mms_erros_importacao (
        lote_importacao_id, linha_importacao_id, campo, codigo,
        mensagem, contexto, created_by
      ) values (
        p_lote_id, linha_uuid, 'Número da Assistência',
        'numero_assistencia_ausente', 'Número da assistência ausente.',
        contexto_area, app_private.usuario_atual_id()
      );
    end if;

    if parte is null then
      insert into public.mms_erros_importacao (
        lote_importacao_id, linha_importacao_id, campo, codigo,
        mensagem, contexto, created_by
      ) values (
        p_lote_id, linha_uuid, 'Parte do Conjunto',
        'parte_conjunto_invalida', 'Parte do conjunto inválida.',
        contexto_area, app_private.usuario_atual_id()
      );
    end if;

    if status is null then
      insert into public.mms_erros_importacao (
        lote_importacao_id, linha_importacao_id, campo, codigo,
        mensagem, contexto, created_by
      ) values (
        p_lote_id, linha_uuid, 'Status da Atividade',
        'status_atividade_nao_reconhecido', 'Status da atividade não reconhecido.',
        contexto_area, app_private.usuario_atual_id()
      );
    end if;

    if tipo is null then
      insert into public.mms_erros_importacao (
        lote_importacao_id, linha_importacao_id, campo, codigo,
        mensagem, contexto, created_by
      ) values (
        p_lote_id, linha_uuid, 'Tipo de Atividade',
        'tipo_atividade_nao_reconhecido', 'Tipo da atividade não reconhecido.',
        contexto_area, app_private.usuario_atual_id()
      );
    end if;

    if nullif(btrim(app_private.mms_json_valor(
      raw, array['recurso','recurso / montador']
    )), '') is null and estado = 'valida' then
      insert into public.mms_alertas_importacao (
        lote_importacao_id, linha_importacao_id, campo, codigo,
        mensagem, contexto, created_by
      ) values (
        p_lote_id, linha_uuid, 'Recurso', 'campo_complementar_vazio',
        'Campo complementar vazio.', contexto_area, app_private.usuario_atual_id()
      );
      update public.mms_linhas_importacao
      set estado_validacao = 'valida_com_alerta',
          updated_by = app_private.usuario_atual_id()
      where id = linha_uuid;
    end if;
  end loop;

  perform app_private.mms_recalcular_totais_lote(p_lote_id);

  return jsonb_build_object(
    'lote_id', p_lote_id,
    'recebidas', recebidas,
    'criadas', criadas,
    'preservadas', preservadas,
    'total_linhas_atual', (
      select count(*)
      from public.mms_linhas_importacao
      where lote_importacao_id = p_lote_id
        and deleted_at is null
    )
  );
end
$$;

create or replace function public.concluir_analise_importacao_mms(p_lote_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  lote record;
  total_rows integer;
  erros integer;
  alertas integer;
  invalidas integer;
  assistencias integer;
  partes integer;
  postos jsonb;
  novo_status public.mms_status_lote_importacao;
begin
  select * into lote
  from public.mms_lotes_importacao
  where id = p_lote_id
  for update;

  if lote.id is null or not app_private.mms_lote_workflow_acessivel(p_lote_id) then
    raise exception 'acesso_negado' using errcode = '42501';
  end if;

  select
    count(*),
    count(distinct posto_id::text || '|' || app_private.mms_normalizar_chave(numero_assistencia)),
    count(distinct posto_id::text || '|' || app_private.mms_normalizar_chave(numero_assistencia)
      || '|' || app_private.mms_normalizar_chave(parte_conjunto)),
    count(*) filter (where estado_validacao = 'invalida')
  into total_rows, assistencias, partes, invalidas
  from public.mms_linhas_importacao
  where lote_importacao_id = p_lote_id
    and deleted_at is null;

  select count(*) into erros
  from public.mms_erros_importacao
  where lote_importacao_id = p_lote_id
    and deleted_at is null;

  select count(*) into alertas
  from public.mms_alertas_importacao
  where lote_importacao_id = p_lote_id
    and deleted_at is null;

  select coalesce(
    jsonb_agg(
      jsonb_build_object('id', resolved.id, 'nome', resolved.nome)
      order by resolved.nome
    ),
    '[]'::jsonb
  )
  into postos
  from (
    select distinct p.id, p.nome
    from public.mms_linhas_importacao li
    join public.postos p on p.id = li.posto_id
    where li.lote_importacao_id = p_lote_id
      and li.deleted_at is null
  ) resolved;

  if total_rows <> lote.total_linhas_esperadas
    or exists (
      select 1
      from public.mms_linhas_importacao
      where lote_importacao_id = p_lote_id
        and estado_validacao in ('pendente','ignorada')
    ) then
    raise exception 'lote_incompleto' using errcode = '22023';
  end if;

  novo_status := case
    when erros > 0 or invalidas > 0 then 'erro'::public.mms_status_lote_importacao
    when alertas > 0 then 'importado_com_alertas'::public.mms_status_lote_importacao
    else 'importado'::public.mms_status_lote_importacao
  end;

  update public.mms_lotes_importacao
  set estado_processamento = 'validado',
      status = novo_status,
      total_assistencias = assistencias,
      total_partes = partes,
      processamento_finalizado_at = now(),
      updated_by = app_private.usuario_atual_id()
  where id = p_lote_id;

  perform app_private.registrar_auditoria(
    'mms_lotes_importacao',
    p_lote_id,
    'validacao_concluida'
  );

  return jsonb_build_object(
    'lote_id', p_lote_id,
    'arquivo', lote.nome_origem,
    'postos', postos,
    'data_atividade', lote.data_atividade,
    'status', novo_status,
    'total_linhas', total_rows,
    'total_assistencias', assistencias,
    'total_partes', partes,
    'linhas_validas', (
      select count(*)
      from public.mms_linhas_importacao
      where lote_importacao_id = p_lote_id
        and estado_validacao = 'valida'
    ),
    'linhas_com_alerta', (
      select count(*)
      from public.mms_linhas_importacao
      where lote_importacao_id = p_lote_id
        and estado_validacao = 'valida_com_alerta'
    ),
    'linhas_invalidas', invalidas,
    'total_erros', erros,
    'total_alertas', alertas,
    'pode_confirmar', erros = 0 and invalidas = 0 and jsonb_array_length(postos) > 0
  );
end
$$;

create or replace function app_private.mms_lote_assistencias_elegivel(lote_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  with lote as (
    select l.*
    from public.mms_lotes_importacao l
    where l.id = lote_uuid
      and l.deleted_at is null
  ),
  linhas as (
    select li.*
    from public.mms_linhas_importacao li
    where li.lote_importacao_id = lote_uuid
      and li.deleted_at is null
  ),
  totais as (
    select
      count(*)::integer as total_linhas_ativas,
      count(*) filter (
        where li.estado_validacao in ('valida', 'valida_com_alerta')
          and li.posto_id is not null
          and li.data_atividade is not null
          and app_private.mms_normalizar_chave(li.numero_assistencia) is not null
          and app_private.mms_normalizar_chave(li.parte_conjunto) is not null
          and li.raw_json is not null
      )::integer as total_linhas_transformaveis
    from linhas li
  )
  select coalesce(exists (
    select 1
    from lote l
    cross join totais t
    where l.status in ('importado', 'importado_com_alertas')
      and l.estado_processamento = 'validado'
      and l.data_atividade is not null
      and t.total_linhas_ativas > 0
      and t.total_linhas_ativas = t.total_linhas_transformaveis
      and l.total_linhas = t.total_linhas_ativas
      and l.total_linhas_validas = t.total_linhas_ativas
      and l.total_linhas_com_erro = 0
      and not exists (
        select 1
        from linhas li
        left join public.postos p on p.id = li.posto_id
        where li.data_atividade <> l.data_atividade
          or p.id is null
          or not p.ativo
          or p.deleted_at is not null
      )
      and not exists (
        select 1
        from public.mms_erros_importacao e
        where e.lote_importacao_id = l.id
          and e.deleted_at is null
      )
  ), false)
$$;

create or replace function app_private.mms_processar_lote_assistencias(lote_uuid uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  lote record;
  linha record;
  n jsonb;
  ator uuid;
  assist record;
  parte record;
  assist_uuid uuid;
  numero_norm text;
  parte_norm text;
  processadas uuid[] := '{}';
  ac integer := 0;
  aa integer := 0;
  ap integer := 0;
  ar integer := 0;
  arm integer := 0;
  pc integer := 0;
  pa integer := 0;
  pp integer := 0;
  pr integer := 0;
  prm integer := 0;
begin
  if not app_private.mms_lote_assistencias_elegivel(lote_uuid) then
    return jsonb_build_object(
      'lote_id', lote_uuid,
      'processado', false,
      'motivo', 'lote_inelegivel'
    );
  end if;

  select * into lote
  from public.mms_lotes_importacao
  where id = lote_uuid;

  ator := coalesce(app_private.usuario_atual_id(), lote.updated_by, lote.created_by);
  perform set_config('app.mms_assistencias_importacao', 'on', true);

  for linha in
    select *
    from public.mms_linhas_importacao
    where lote_importacao_id = lote_uuid
      and deleted_at is null
      and estado_validacao in ('valida','valida_com_alerta')
    order by numero_linha_origem
  loop
    n := linha.json_normalizado;
    numero_norm := app_private.mms_normalizar_chave(n ->> 'numero_assistencia');
    parte_norm := app_private.mms_normalizar_chave(n ->> 'parte_conjunto');

    select * into assist
    from public.mms_assistencias
    where posto_id = linha.posto_id
      and data_atividade = linha.data_atividade
      and numero_assistencia_normalizado = numero_norm
      and deleted_at is null;

    if assist.id is null then
      insert into public.mms_assistencias (
        posto_id, data_atividade, numero_assistencia, numero_assistencia_normalizado,
        status_interno, status_atividade, tipo_atividade_original,
        tipo_atividade_normalizado, cliente_nome_importado, endereco_importado,
        lote_criacao_id, linha_criacao_id, lote_ultimo_id, linha_ultima_id,
        raw_json_resumo, created_by, updated_by
      ) values (
        linha.posto_id, linha.data_atividade, n ->> 'numero_assistencia', numero_norm,
        'ativo', n ->> 'status_atividade', n ->> 'tipo_atividade_original',
        n ->> 'tipo_atividade_normalizado', n ->> 'cliente_nome', n ->> 'endereco',
        lote_uuid, linha.id, lote_uuid, linha.id,
        app_private.mms_raw_json_resumo_assistencia(
          lote_uuid, linha.posto_id, linha.data_atividade, numero_norm
        ),
        ator, ator
      )
      returning id into assist_uuid;
      ac := ac + 1;
      processadas := array_append(processadas, assist_uuid);
    else
      assist_uuid := assist.id;
      if not (assist_uuid = any(processadas)) then
        if assist.status_interno = 'removido' then
          ar := ar + 1;
        elsif assist.status_atividade is distinct from n ->> 'status_atividade'
          or assist.tipo_atividade_original is distinct from n ->> 'tipo_atividade_original'
          or assist.tipo_atividade_normalizado is distinct from n ->> 'tipo_atividade_normalizado'
          or assist.cliente_nome_importado is distinct from n ->> 'cliente_nome'
          or assist.endereco_importado is distinct from n ->> 'endereco' then
          aa := aa + 1;
        else
          ap := ap + 1;
        end if;
        processadas := array_append(processadas, assist_uuid);
      end if;

      update public.mms_assistencias
      set numero_assistencia = n ->> 'numero_assistencia',
          status_interno = 'ativo',
          removido_em = null,
          removido_lote_id = null,
          status_atividade = n ->> 'status_atividade',
          tipo_atividade_original = n ->> 'tipo_atividade_original',
          tipo_atividade_normalizado = n ->> 'tipo_atividade_normalizado',
          cliente_nome_importado = n ->> 'cliente_nome',
          endereco_importado = n ->> 'endereco',
          lote_ultimo_id = lote_uuid,
          linha_ultima_id = linha.id,
          raw_json_resumo = app_private.mms_raw_json_resumo_assistencia(
            lote_uuid, linha.posto_id, linha.data_atividade, numero_norm
          ),
          updated_by = ator
      where id = assist_uuid;
    end if;

    select * into parte
    from public.mms_partes_assistencia
    where assistencia_id = assist_uuid
      and parte_conjunto_normalizada = parte_norm
      and deleted_at is null;

    if parte.id is null then
      insert into public.mms_partes_assistencia (
        assistencia_id, parte_conjunto, parte_conjunto_normalizada, status_interno,
        status_atividade, tipo_atividade_original, tipo_atividade_normalizado,
        codigo_mercadoria_importado, descricao_mercadoria_importada, recurso_importado,
        valor_deslocamento_importado, valor_receber_movel_importado,
        atendimento_critico, quantidade_reagendamento, comentarios_local_montagem,
        observacao_finalizacao, defeito_identificado, laudo_ou_observacao,
        lote_criacao_id, linha_criacao_id, lote_ultimo_id, linha_ultima_id,
        raw_json, created_by, updated_by
      ) values (
        assist_uuid, n ->> 'parte_conjunto', parte_norm, 'ativo',
        n ->> 'status_atividade', n ->> 'tipo_atividade_original',
        n ->> 'tipo_atividade_normalizado', n ->> 'codigo_mercadoria',
        n ->> 'descricao_mercadoria', n ->> 'recurso',
        app_private.mms_texto_para_numeric(n ->> 'valor_deslocamento'),
        app_private.mms_texto_para_numeric(n ->> 'valor_receber_movel'),
        app_private.mms_texto_para_boolean(n ->> 'atendimento_critico'),
        app_private.mms_texto_para_integer(n ->> 'quantidade_reagendamento'),
        n ->> 'comentarios_local_montagem', n ->> 'observacao_finalizacao',
        n ->> 'defeito_identificado', n ->> 'laudo_ou_observacao',
        lote_uuid, linha.id, lote_uuid, linha.id, linha.raw_json, ator, ator
      );
      pc := pc + 1;
    else
      if parte.status_interno = 'removido' then
        pr := pr + 1;
      elsif parte.status_atividade is distinct from n ->> 'status_atividade'
        or parte.tipo_atividade_normalizado is distinct from n ->> 'tipo_atividade_normalizado'
        or parte.descricao_mercadoria_importada is distinct from n ->> 'descricao_mercadoria'
        or parte.recurso_importado is distinct from n ->> 'recurso' then
        pa := pa + 1;
      else
        pp := pp + 1;
      end if;

      update public.mms_partes_assistencia
      set parte_conjunto = n ->> 'parte_conjunto',
          status_interno = 'ativo',
          removido_em = null,
          removido_lote_id = null,
          status_atividade = n ->> 'status_atividade',
          tipo_atividade_original = n ->> 'tipo_atividade_original',
          tipo_atividade_normalizado = n ->> 'tipo_atividade_normalizado',
          codigo_mercadoria_importado = n ->> 'codigo_mercadoria',
          descricao_mercadoria_importada = n ->> 'descricao_mercadoria',
          recurso_importado = n ->> 'recurso',
          valor_deslocamento_importado =
            app_private.mms_texto_para_numeric(n ->> 'valor_deslocamento'),
          valor_receber_movel_importado =
            app_private.mms_texto_para_numeric(n ->> 'valor_receber_movel'),
          atendimento_critico =
            app_private.mms_texto_para_boolean(n ->> 'atendimento_critico'),
          quantidade_reagendamento =
            app_private.mms_texto_para_integer(n ->> 'quantidade_reagendamento'),
          comentarios_local_montagem = n ->> 'comentarios_local_montagem',
          observacao_finalizacao = n ->> 'observacao_finalizacao',
          defeito_identificado = n ->> 'defeito_identificado',
          laudo_ou_observacao = n ->> 'laudo_ou_observacao',
          lote_ultimo_id = lote_uuid,
          linha_ultima_id = linha.id,
          raw_json = linha.raw_json,
          updated_by = ator
      where id = parte.id;
    end if;
  end loop;

  update public.mms_partes_assistencia p
  set status_interno = 'removido',
      removido_em = now(),
      removido_lote_id = lote_uuid,
      lote_ultimo_id = lote_uuid,
      updated_by = ator
  from public.mms_assistencias a
  where p.assistencia_id = a.id
    and a.data_atividade = lote.data_atividade
    and p.deleted_at is null
    and p.status_interno = 'ativo'
    and exists (
      select 1
      from public.mms_linhas_importacao escopo
      where escopo.lote_importacao_id = lote_uuid
        and escopo.posto_id = a.posto_id
        and escopo.deleted_at is null
    )
    and not exists (
      select 1
      from public.mms_linhas_importacao li
      where li.lote_importacao_id = lote_uuid
        and li.posto_id = a.posto_id
        and li.deleted_at is null
        and app_private.mms_normalizar_chave(li.numero_assistencia)
          = a.numero_assistencia_normalizado
        and app_private.mms_normalizar_chave(li.parte_conjunto)
          = p.parte_conjunto_normalizada
    );
  get diagnostics prm = row_count;

  update public.mms_assistencias a
  set status_interno = 'removido',
      removido_em = now(),
      removido_lote_id = lote_uuid,
      lote_ultimo_id = lote_uuid,
      updated_by = ator
  where a.data_atividade = lote.data_atividade
    and a.deleted_at is null
    and a.status_interno = 'ativo'
    and exists (
      select 1
      from public.mms_linhas_importacao escopo
      where escopo.lote_importacao_id = lote_uuid
        and escopo.posto_id = a.posto_id
        and escopo.deleted_at is null
    )
    and not exists (
      select 1
      from public.mms_partes_assistencia p
      where p.assistencia_id = a.id
        and p.deleted_at is null
        and p.status_interno = 'ativo'
    );
  get diagnostics arm = row_count;

  perform set_config('app.mms_assistencias_importacao', 'off', true);

  return jsonb_build_object(
    'lote_id', lote_uuid,
    'processado', true,
    'assistencias_criadas', ac,
    'assistencias_atualizadas', aa,
    'assistencias_preservadas', ap,
    'assistencias_removidas', arm,
    'assistencias_reativadas', ar,
    'partes_criadas', pc,
    'partes_atualizadas', pa,
    'partes_preservadas', pp,
    'partes_removidas', prm,
    'partes_reativadas', pr
  );
exception
  when others then
    perform set_config('app.mms_assistencias_importacao', 'off', true);
    raise;
end
$$;

create or replace function public.confirmar_importacao_mms(p_lote_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  lote record;
  resultado jsonb;
  nomes_postos jsonb;
begin
  select * into lote
  from public.mms_lotes_importacao
  where id = p_lote_id
  for update;

  if lote.id is null or not app_private.mms_lote_workflow_acessivel(p_lote_id) then
    raise exception 'acesso_negado' using errcode = '42501';
  end if;
  if lote.espelho_processado_em is not null then
    return lote.resultado_processamento;
  end if;
  if lote.status not in ('importado','importado_com_alertas')
    or lote.estado_processamento <> 'validado'
    or not app_private.mms_objeto_reservado_valido(p_lote_id)
    or not app_private.mms_lote_assistencias_elegivel(p_lote_id) then
    raise exception 'lote_incompleto' using errcode = '22023';
  end if;

  select coalesce(jsonb_agg(resolved.nome order by resolved.nome), '[]'::jsonb)
  into nomes_postos
  from (
    select distinct p.nome
    from public.mms_linhas_importacao li
    join public.postos p on p.id = li.posto_id
    where li.lote_importacao_id = p_lote_id
      and li.deleted_at is null
  ) resolved;

  update public.mms_lotes_importacao
  set confirmacao_solicitada_em = now(),
      confirmado_por = app_private.usuario_atual_id(),
      updated_by = app_private.usuario_atual_id()
  where id = p_lote_id;

  begin
    resultado := app_private.mms_processar_lote_assistencias(p_lote_id);
    resultado := resultado || jsonb_build_object(
      'arquivo', lote.nome_origem,
      'postos', nomes_postos,
      'data_atividade', lote.data_atividade,
      'status', lote.status,
      'assistencias_criadas', coalesce((resultado ->> 'assistencias_criadas')::int, 0),
      'assistencias_atualizadas', coalesce((resultado ->> 'assistencias_atualizadas')::int, 0),
      'assistencias_preservadas', coalesce((resultado ->> 'assistencias_preservadas')::int, 0),
      'assistencias_reativadas', coalesce((resultado ->> 'assistencias_reativadas')::int, 0),
      'partes_criadas', coalesce((resultado ->> 'partes_criadas')::int, 0),
      'partes_atualizadas', coalesce((resultado ->> 'partes_atualizadas')::int, 0),
      'partes_preservadas', coalesce((resultado ->> 'partes_preservadas')::int, 0),
      'partes_reativadas', coalesce((resultado ->> 'partes_reativadas')::int, 0),
      'linhas_invalidas', lote.total_linhas_com_erro,
      'linhas_com_alerta', lote.total_linhas_com_alerta,
      'processado_em', now()
    );

    update public.mms_lotes_importacao
    set espelho_processado_em = now(),
        resultado_processamento = resultado,
        ultima_falha_processamento_em = null,
        codigo_ultima_falha = null,
        updated_by = app_private.usuario_atual_id()
    where id = p_lote_id;

    perform app_private.registrar_auditoria(
      'mms_lotes_importacao',
      p_lote_id,
      'espelho_processado'
    );
    return resultado;
  exception
    when others then
      update public.mms_lotes_importacao
      set ultima_falha_processamento_em = now(),
          codigo_ultima_falha = 'falha_processamento',
          updated_by = app_private.usuario_atual_id()
      where id = p_lote_id;

      perform app_private.registrar_auditoria(
        'mms_lotes_importacao',
        p_lote_id,
        'falha_processamento'
      );
      return jsonb_build_object(
        'lote_id', p_lote_id,
        'processado', false,
        'codigo', 'falha_processamento',
        'mensagem', 'Não foi possível concluir a importação. Tente novamente.'
      );
  end;
end
$$;

revoke all on function public.iniciar_importacao_mms(text,text,text,bigint,date,integer)
  from public, anon;
grant execute on function public.iniciar_importacao_mms(text,text,text,bigint,date,integer)
  to authenticated;

-- Mantém as demais RPCs limitadas ao papel autenticado. O próprio workflow
-- exige que o lote pertença ao ator atual.
revoke all on function public.registrar_linhas_importacao_mms(uuid,jsonb),
  public.concluir_analise_importacao_mms(uuid),
  public.confirmar_importacao_mms(uuid)
from public, anon;
grant execute on function public.registrar_linhas_importacao_mms(uuid,jsonb),
  public.concluir_analise_importacao_mms(uuid),
  public.confirmar_importacao_mms(uuid)
to authenticated;

commit;
