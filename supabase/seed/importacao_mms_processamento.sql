-- Fixtures determinísticas da Spec 006. Execute somente em desenvolvimento.
begin;

insert into public.mms_lotes_importacao (
  id,
  nome_origem,
  posto_id,
  data_atividade,
  usuario_importador_id,
  estado_processamento,
  created_by,
  updated_by
)
select
  '62000000-0000-0000-0000-000000000001'::uuid,
  'baseline-spec006.csv',
  p.id,
  date '2026-06-27',
  u.id,
  'recebido'::public.mms_estado_processamento_lote,
  u.id,
  u.id
from public.postos p
join public.usuarios u on u.email = 'operador@doka.test'
where p.codigo = 'POSTO_A'
on conflict (id) do nothing;

commit;
