-- Spec 005: RPC restrita para registrar eventos de autenticacao web em
-- historico_auditoria. Nao altera nenhuma policy de RLS existente, nenhuma
-- tabela, perfil ou regra de escopo. Ver supabase/policies/autenticacao_web.md
-- para o threat model completo.

create or replace function public.registrar_evento_autenticacao(p_acao text)
returns void
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  v_usuario_id uuid;
  v_count integer;
  v_ativo boolean;
begin
  if p_acao not in (
    'acesso_interno_concedido',
    'sessao_encerrada',
    'sessao_expirada_detectada',
    'acesso_operacional_bloqueado'
  ) then
    raise exception 'acao fora da allowlist de autenticacao web: %', p_acao
      using errcode = '22023';
  end if;

  if auth.uid() is null then
    raise exception 'chamada de autenticacao web exige auth.uid() valido'
      using errcode = '28000';
  end if;

  select count(*) into v_count
  from public.usuarios u
  where u.auth_user_id = auth.uid()
    and u.deleted_at is null;

  if v_count = 0 then
    -- Sem usuario operacional associavel: nenhum evento e fabricado.
    return;
  end if;

  if v_count > 1 then
    raise exception 'mapeamento ambiguo de usuario operacional para auth.uid()'
      using errcode = '22023';
  end if;

  select u.id, u.ativo into v_usuario_id, v_ativo
  from public.usuarios u
  where u.auth_user_id = auth.uid()
    and u.deleted_at is null;

  if v_ativo is not true and p_acao <> 'acesso_operacional_bloqueado' then
    -- Usuario inativo so pode gerar o evento de bloqueio.
    return;
  end if;

  insert into public.historico_auditoria (
    entidade_tipo,
    entidade_id,
    acao,
    valor_anterior,
    valor_novo,
    metadata,
    usuario_id
  )
  values (
    'usuarios',
    v_usuario_id,
    p_acao,
    null,
    null,
    jsonb_build_object('origem', 'aplicacao_web', 'contrato', 'spec_005'),
    v_usuario_id
  );
end;
$$;

revoke all on function public.registrar_evento_autenticacao(text) from public;
revoke all on function public.registrar_evento_autenticacao(text) from anon;
grant execute on function public.registrar_evento_autenticacao(text) to authenticated;
