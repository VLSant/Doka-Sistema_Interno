-- Massa de validacao da fundacao operacional.
-- Dados ficticios e deterministicos para testes locais.

insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
values
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'operador@doka.test', crypt('doka123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'supervisao@doka.test', crypt('doka123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000003', 'authenticated', 'authenticated', 'direcao@doka.test', crypt('doka123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000004', 'authenticated', 'authenticated', 'sem-perfil@doka.test', crypt('doka123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000005', 'authenticated', 'authenticated', 'inativo@doka.test', crypt('doka123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000006', 'authenticated', 'authenticated', 'deletado@doka.test', crypt('doka123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now())
on conflict (id) do nothing;

insert into public.cargos_funcoes (id, nome, descricao)
values
  ('20000000-0000-0000-0000-000000000001', 'Operador', 'Usuario responsavel pela operacao diaria'),
  ('20000000-0000-0000-0000-000000000002', 'Supervisao', 'Usuario responsavel por acompanhamento operacional'),
  ('20000000-0000-0000-0000-000000000003', 'Direcao/Admin', 'Usuario com visao global e administracao')
on conflict do nothing;

insert into public.usuarios (id, auth_user_id, nome, email, perfil, cargo_funcao_id, ativo, deleted_at, deleted_by, delete_reason)
values
  ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Operador Teste', 'operador@doka.test', 'operador', '20000000-0000-0000-0000-000000000001', true, null, null, null),
  ('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'Supervisao Teste', 'supervisao@doka.test', 'supervisao', '20000000-0000-0000-0000-000000000002', true, null, null, null),
  ('30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'Direcao Teste', 'direcao@doka.test', 'direcao_admin', '20000000-0000-0000-0000-000000000003', true, null, null, null),
  ('30000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000005', 'Usuario Inativo', 'inativo@doka.test', 'operador', '20000000-0000-0000-0000-000000000001', false, null, null, null),
  ('30000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000006', 'Usuario Deletado', 'deletado@doka.test', 'operador', '20000000-0000-0000-0000-000000000001', true, now(), '30000000-0000-0000-0000-000000000003', 'massa de teste')
on conflict do nothing;

insert into public.postos (id, nome, codigo, descricao, ativo, deleted_at, deleted_by, delete_reason)
values
  ('40000000-0000-0000-0000-000000000001', 'Posto A', 'POSTO_A', 'Posto vinculado ao operador', true, null, null, null),
  ('40000000-0000-0000-0000-000000000002', 'Posto B', 'POSTO_B', 'Posto adicional da supervisao', true, null, null, null),
  ('40000000-0000-0000-0000-000000000003', 'Posto C', 'POSTO_C', 'Posto sem acesso do operador/supervisao', true, null, null, null),
  ('40000000-0000-0000-0000-000000000004', 'Posto Inativo', 'POSTO_INATIVO', 'Posto inativo para validacao', false, null, null, null),
  ('40000000-0000-0000-0000-000000000005', 'Posto Deletado', 'POSTO_DELETADO', 'Posto soft deleted para validacao', true, now(), '30000000-0000-0000-0000-000000000003', 'massa de teste')
on conflict do nothing;

insert into public.usuarios_postos (id, usuario_id, posto_id, nivel_acesso, deleted_at, deleted_by, delete_reason)
values
  ('50000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 'operacional', null, null, null),
  ('50000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000001', 'supervisao', null, null, null),
  ('50000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000002', 'supervisao', null, null, null),
  ('50000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000002', 'operacional', now(), '30000000-0000-0000-0000-000000000003', 'massa de teste')
on conflict do nothing;
