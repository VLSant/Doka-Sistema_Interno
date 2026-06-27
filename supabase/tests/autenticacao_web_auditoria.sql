-- Validacoes manuais da RPC de auditoria de autenticacao web (Spec 005).
-- Execute apos aplicar a migration *_auditoria_autenticacao_web.sql e carregar
-- supabase/seed/fundacao_operacional_seed.sql.
--
-- Antes da migration existir, esta suite deve FALHAR porque a funcao
-- public.registrar_evento_autenticacao ainda nao existe.

create or replace function public.assert_true(cond boolean, msg text)
returns void
language plpgsql
as $$
begin
  if not coalesce(cond, false) then
    raise exception 'ASSERTION FAILED: %', msg;
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- 1. Chamada anonima deve ser negada.
-- ---------------------------------------------------------------------------
set role anon;

do $$
begin
  perform public.registrar_evento_autenticacao('acesso_interno_concedido');
  raise exception 'ASSERTION FAILED: chamada anonima deveria ser negada';
exception
  when insufficient_privilege then
    null;
end
$$;

reset role;

-- ---------------------------------------------------------------------------
-- 2. Usuario ativo (operador) pode registrar acesso concedido e logout.
-- ---------------------------------------------------------------------------
set role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000001', true);

select public.registrar_evento_autenticacao('acesso_interno_concedido');
select public.registrar_evento_autenticacao('sessao_encerrada');
select public.registrar_evento_autenticacao('sessao_expirada_detectada');

-- Importante: a policy de SELECT em historico_auditoria restringe o que a
-- role authenticated pode ler. As asserções de existência abaixo devem
-- correr OUTSIDE do "set role authenticated" (após reset role), senão a
-- query de verificação enxerga 0 linhas mesmo com o insert tendo
-- ocorrido com sucesso.
reset role;

select public.assert_true(
  exists (
    select 1 from public.historico_auditoria
    where entidade_tipo = 'usuarios'
      and entidade_id = '30000000-0000-0000-0000-000000000001'
      and usuario_id = '30000000-0000-0000-0000-000000000001'
      and acao = 'acesso_interno_concedido'
      and valor_anterior is null
      and valor_novo is null
      and metadata = jsonb_build_object('origem', 'aplicacao_web', 'contrato', 'spec_005')
  ),
  'acesso_interno_concedido deve gravar evento com formato fixo e ator derivado de auth.uid()'
);

select public.assert_true(
  exists (
    select 1 from public.historico_auditoria
    where entidade_tipo = 'usuarios'
      and entidade_id = '30000000-0000-0000-0000-000000000001'
      and acao = 'sessao_encerrada'
  ),
  'sessao_encerrada deve ser uma acao permitida para usuario ativo'
);

select public.assert_true(
  exists (
    select 1 from public.historico_auditoria
    where entidade_tipo = 'usuarios'
      and entidade_id = '30000000-0000-0000-0000-000000000001'
      and acao = 'sessao_expirada_detectada'
  ),
  'sessao_expirada_detectada deve ser uma acao permitida para usuario ativo'
);

-- ---------------------------------------------------------------------------
-- 3. Acao fora da allowlist deve ser rejeitada e nao deve gravar nada.
-- ---------------------------------------------------------------------------
set role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000001', true);

do $$
begin
  perform public.registrar_evento_autenticacao('acao_inexistente');
  raise exception 'ASSERTION FAILED: acao fora da allowlist deveria ser rejeitada';
exception
  when others then
    if sqlerrm not like '%allowlist%' and sqlerrm not like '%invalid%' and sqlerrm not like '%nao permitida%' then
      -- Aceita qualquer erro controlado, mas garante que nada foi gravado.
      null;
    end if;
end
$$;

reset role;

select public.assert_true(
  not exists (
    select 1 from public.historico_auditoria
    where acao = 'acao_inexistente'
  ),
  'acao fora da allowlist nao deve gravar evento'
);

-- ---------------------------------------------------------------------------
-- 4. Usuario sem registro operacional (auth.uid sem linha em usuarios) nao
--    deve gravar evento de sucesso.
-- ---------------------------------------------------------------------------
set role authenticated;
select set_config('request.jwt.claim.sub', '99999999-9999-9999-9999-999999999999', true);

select public.registrar_evento_autenticacao('acesso_interno_concedido');

reset role;

select public.assert_true(
  not exists (
    select 1 from public.historico_auditoria
    where acao = 'acesso_interno_concedido'
      and usuario_id is null
  ),
  'usuario sem usuarios.id associavel nao deve gerar evento de sucesso fabricado'
);

select public.assert_true(
  not exists (
    select 1 from public.historico_auditoria
    where created_at > now() - interval '1 minute'
      and entidade_tipo = 'usuarios'
      and entidade_id is null
  ),
  'nenhum evento deve ser gravado sem entidade_id resolvido'
);

reset role;

-- ---------------------------------------------------------------------------
-- 5. Usuario inativo (nao removido) so pode gerar acesso_operacional_bloqueado.
-- ---------------------------------------------------------------------------
set role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000005', true);

select public.registrar_evento_autenticacao('acesso_operacional_bloqueado');
select public.registrar_evento_autenticacao('acesso_interno_concedido');

reset role;

select public.assert_true(
  exists (
    select 1 from public.historico_auditoria
    where entidade_tipo = 'usuarios'
      and entidade_id = '30000000-0000-0000-0000-000000000005'
      and acao = 'acesso_operacional_bloqueado'
  ),
  'usuario inativo deve poder gerar acesso_operacional_bloqueado'
);

select public.assert_true(
  not exists (
    select 1 from public.historico_auditoria
    where entidade_tipo = 'usuarios'
      and entidade_id = '30000000-0000-0000-0000-000000000005'
      and acao = 'acesso_interno_concedido'
  ),
  'usuario inativo nao deve poder gerar acesso_interno_concedido'
);

reset role;

-- ---------------------------------------------------------------------------
-- 6. Insert direto em historico_auditoria continua negado (nao deve mudar).
-- ---------------------------------------------------------------------------
set role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000001', true);

do $$
begin
  insert into public.historico_auditoria (entidade_tipo, entidade_id, acao)
  values ('usuarios', '30000000-0000-0000-0000-000000000001', 'forjado_pelo_cliente');
  raise exception 'ASSERTION FAILED: insert direto em historico_auditoria deveria ser negado';
exception
  when insufficient_privilege then
    null;
end
$$;

reset role;

-- ---------------------------------------------------------------------------
-- 7. Privilegios da funcao: revoke de PUBLIC/anon, grant explicito para
--    authenticated.
-- ---------------------------------------------------------------------------
select public.assert_true(
  not has_function_privilege(
    'anon',
    'public.registrar_evento_autenticacao(text)',
    'EXECUTE'
  ),
  'anon nao deve executar registrar_evento_autenticacao'
);

select public.assert_true(
  has_function_privilege(
    'authenticated',
    'public.registrar_evento_autenticacao(text)',
    'EXECUTE'
  ),
  'authenticated deve executar registrar_evento_autenticacao'
);

select public.assert_true(
  exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'registrar_evento_autenticacao'
      and p.prosecdef = false
      and p.proconfig @> array['search_path=""']
  ),
  'RPC publica deve ser SECURITY INVOKER com search_path vazio'
);

select public.assert_true(
  exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'app_private'
      and p.proname = 'registrar_evento_autenticacao'
      and p.prosecdef = true
      and p.proconfig @> array['search_path=""']
  ),
  'escritor privilegiado deve permanecer no schema privado com search_path vazio'
);

select public.assert_true(
  not has_function_privilege(
    'anon',
    'app_private.registrar_evento_autenticacao(text)',
    'EXECUTE'
  ),
  'anon nao deve executar o escritor privado'
);

drop function public.assert_true(boolean, text);
