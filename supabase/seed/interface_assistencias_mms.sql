-- Massa opcional de aceite da Spec 008.
-- Requer os seeds das Specs 001, 003 e 004.

select app_private.mms_processar_lote_assistencias(
  '94000000-0000-0000-0000-000000000001'
);
select app_private.mms_processar_lote_assistencias(
  '94000000-0000-0000-0000-000000000002'
);
select app_private.mms_processar_lote_assistencias(
  '94000000-0000-0000-0000-000000000004'
);

-- Mantém uma correção ativa e uma versão conhecida para o aceite de
-- precedência e para dois editores tentarem salvar a mesma versão.
select set_config(
  'request.jwt.claim.sub',
  '10000000-0000-0000-0000-000000000001',
  false
);

select public.corrigir_campo_assistencia_mms(
  'assistencia',
  a.id,
  'cliente_nome',
  'Cliente A corrigido no Doka',
  'Fixture de aceite da Spec 008',
  a.versao_registro
)
from public.mms_assistencias a
where a.posto_id = '40000000-0000-0000-0000-000000000001'
  and a.data_atividade = date '2026-06-24'
  and a.numero_assistencia_normalizado = 'ASS-100'
  and a.cliente_nome_corrigido is distinct from 'Cliente A corrigido no Doka';

select set_config('request.jwt.claim.sub', '', false);

-- Gera volume determinístico para filtro/cursor. Reutiliza lote e linha de
-- origem apenas como fixture técnica; não representa uma importação real.
insert into public.mms_assistencias (
  id,
  posto_id,
  data_atividade,
  numero_assistencia,
  numero_assistencia_normalizado,
  status_interno,
  status_atividade,
  tipo_atividade_original,
  tipo_atividade_normalizado,
  cliente_nome_importado,
  endereco_importado,
  lote_criacao_id,
  linha_criacao_id,
  lote_ultimo_id,
  linha_ultima_id,
  raw_json_resumo,
  created_by,
  updated_by
)
select
  (
    substr(md5('spec008-assistencia-' || n::text), 1, 8) || '-' ||
    substr(md5('spec008-assistencia-' || n::text), 9, 4) || '-4' ||
    substr(md5('spec008-assistencia-' || n::text), 14, 3) || '-8' ||
    substr(md5('spec008-assistencia-' || n::text), 18, 3) || '-' ||
    substr(md5('spec008-assistencia-' || n::text), 21, 12)
  )::uuid,
  '40000000-0000-0000-0000-000000000001',
  date '2026-01-01' + ((n - 1) % 180),
  'PERF-' || lpad(n::text, 5, '0'),
  'PERF-' || lpad(n::text, 5, '0'),
  'ativo',
  case when n % 3 = 0 then 'Pendente' else 'Concluida' end,
  case when n % 2 = 0 then 'Montagem' else 'Entrega' end,
  case when n % 2 = 0 then 'MONTAGEM' else 'ENTREGA' end,
  'Cliente desempenho ' || n,
  'Rua de desempenho, ' || n,
  '94000000-0000-0000-0000-000000000001',
  '94100000-0000-0000-0000-000000000001',
  '94000000-0000-0000-0000-000000000001',
  '94100000-0000-0000-0000-000000000001',
  jsonb_build_object('fixture', 'spec008', 'numero', n),
  '30000000-0000-0000-0000-000000000002',
  '30000000-0000-0000-0000-000000000002'
from generate_series(1, 10000) n
on conflict do nothing;
