create or replace function app_private.usuario_pode_consultar_assistencia_mms(
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
        and p.ativo
        and p.deleted_at is null
        and up.posto_id = posto_uuid
        and (
          (
            u.perfil = 'operador'::public.perfil_usuario
            and up.nivel_acesso in (
              'operacional'::public.nivel_acesso_posto,
              'consulta'::public.nivel_acesso_posto
            )
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

-- As três RPCs já possuem toda a projeção e paginação revisadas. Substituir o
-- helper em suas definições preserva esse contrato e fecha somente o escopo de
-- leitura, sem redefinir regras de importação ou de correção.
do $$
declare
  v_funcao regprocedure;
  v_definicao text;
begin
  foreach v_funcao in array array[
    'public.listar_assistencias_mms(jsonb,date,uuid,integer)'::regprocedure,
    'public.obter_detalhe_assistencia_mms(uuid,boolean)'::regprocedure,
    'public.listar_historico_assistencia_mms(uuid,timestamptz,uuid,integer)'::regprocedure
  ]
  loop
    v_definicao := pg_get_functiondef(v_funcao);

    if position(
      'app_private.usuario_tem_acesso_posto' in v_definicao
    ) = 0 then
      raise exception 'helper de escopo esperado ausente em %', v_funcao;
    end if;

    v_definicao := replace(
      v_definicao,
      'app_private.usuario_tem_acesso_posto',
      'app_private.usuario_pode_consultar_assistencia_mms'
    );

    if v_funcao = 'public.listar_historico_assistencia_mms(uuid,timestamptz,uuid,integer)'::regprocedure then
      if position(
        'if v_assistencia.id is null then' in v_definicao
      ) = 0 then
        raise exception 'validação neutra esperada ausente em %', v_funcao;
      end if;

      v_definicao := replace(
        v_definicao,
        'if v_assistencia.id is null then',
        'if v_assistencia.id is null or v_assistencia.deleted_at is not null then'
      );
    end if;

    execute v_definicao;
  end loop;
end
$$;

revoke all on function app_private.usuario_pode_consultar_assistencia_mms(uuid)
from public, anon, authenticated;

grant execute on function app_private.usuario_pode_consultar_assistencia_mms(uuid)
to postgres;
