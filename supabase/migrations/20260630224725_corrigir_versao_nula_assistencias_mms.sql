do $$
declare
  v_funcao constant regprocedure :=
    'public.corrigir_campo_assistencia_mms(text,uuid,text,text,text,bigint)'::regprocedure;
  v_definicao text := pg_get_functiondef(v_funcao);
  v_alterada boolean := false;
begin
  if position(
    'v_assistencia.versao_registro<>p_versao_esperada' in v_definicao
  ) > 0 then
    v_definicao := replace(
      v_definicao,
      'v_assistencia.versao_registro<>p_versao_esperada',
      'v_assistencia.versao_registro is distinct from p_versao_esperada'
    );
    v_alterada := true;
  elsif position(
    'v_assistencia.versao_registro is distinct from p_versao_esperada'
    in v_definicao
  ) = 0 then
    raise exception 'comparação de versão da assistência não encontrada';
  end if;

  if position(
    'v_parte.versao_registro<>p_versao_esperada' in v_definicao
  ) > 0 then
    v_definicao := replace(
      v_definicao,
      'v_parte.versao_registro<>p_versao_esperada',
      'v_parte.versao_registro is distinct from p_versao_esperada'
    );
    v_alterada := true;
  elsif position(
    'v_parte.versao_registro is distinct from p_versao_esperada'
    in v_definicao
  ) = 0 then
    raise exception 'comparação de versão da parte não encontrada';
  end if;

  if v_alterada then
    execute v_definicao;
  end if;
end
$$;
