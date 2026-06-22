-- Massa de validacao dos cadastros base do MVP.
-- Execute apos supabase/seed/fundacao_operacional_seed.sql.

insert into public.prioridades (
  id,
  nome,
  nome_normalizado,
  nivel,
  cor,
  ativo,
  created_by,
  updated_by,
  deleted_at,
  deleted_by,
  delete_reason
)
values
  ('60000000-0000-0000-0000-000000000001', 'Alta', 'alta', 1, 'doka.feedback.erro', true, '30000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000003', null, null, null),
  ('60000000-0000-0000-0000-000000000002', 'Media', 'media', 2, 'doka.feedback.alerta', true, '30000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000003', null, null, null),
  ('60000000-0000-0000-0000-000000000003', 'Baixa', 'baixa', 3, '#2E7D32', true, '30000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000003', null, null, null),
  ('60000000-0000-0000-0000-000000000004', 'Prioridade Inativa', 'prioridade inativa', 10, '#64748B', false, '30000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000003', null, null, null),
  ('60000000-0000-0000-0000-000000000005', 'Prioridade Removida', 'prioridade removida', 11, '#94A3B8', true, '30000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000003', now(), '30000000-0000-0000-0000-000000000003', 'massa de teste')
on conflict do nothing;

insert into public.tipos_ocorrencia (
  id,
  nome,
  nome_normalizado,
  descricao,
  ativo,
  created_by,
  updated_by,
  deleted_at,
  deleted_by,
  delete_reason
)
values
  ('70000000-0000-0000-0000-000000000001', 'Atraso', 'atraso', 'Atraso operacional futuro', true, '30000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000003', null, null, null),
  ('70000000-0000-0000-0000-000000000002', 'Reclamacao', 'reclamacao', 'Classificacao futura para reclamacoes', true, '30000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000003', null, null, null),
  ('70000000-0000-0000-0000-000000000003', 'Divergencia MMS', 'divergencia mms', 'Tipo inativo para validacao', false, '30000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000003', null, null, null),
  ('70000000-0000-0000-0000-000000000004', 'Tipo Removido', 'tipo removido', 'Tipo removido para validacao', true, '30000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000003', now(), '30000000-0000-0000-0000-000000000003', 'massa de teste')
on conflict do nothing;

insert into public.metas_eficiencia (
  id,
  posto_id,
  tipo_atividade_normalizado,
  meta_percentual,
  vigencia_inicio,
  vigencia_fim,
  ativo,
  created_by,
  updated_by,
  deleted_at,
  deleted_by,
  delete_reason
)
values
  ('80000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 'montagem', 85.00, '2026-01-01', '2026-12-31', true, '30000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000003', null, null, null),
  ('80000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000002', 'montagem', 88.00, '2026-01-01', '2026-12-31', true, '30000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000003', null, null, null),
  ('80000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000003', 'montagem', 90.00, '2026-01-01', '2026-12-31', true, '30000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000003', null, null, null),
  ('80000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000001', 'desmontagem', 80.00, '2026-01-01', null, false, '30000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000003', null, null, null),
  ('80000000-0000-0000-0000-000000000005', '40000000-0000-0000-0000-000000000001', 'assistencia tecnica', 75.00, '2026-01-01', null, true, '30000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000003', now(), '30000000-0000-0000-0000-000000000003', 'massa de teste')
on conflict do nothing;
