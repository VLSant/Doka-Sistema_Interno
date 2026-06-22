# Policies / RLS

Esta pasta contem documentacao das policies de Row Level Security do Supabase.

## Regras principais

- Operador acessa apenas postos vinculados em `usuarios_postos`.
- Supervisao acessa postos sob responsabilidade.
- Direcao/Admin acessa todos os dados administrativos permitidos.
- Registros com `deleted_at` preenchido devem ficar ocultos em consultas operacionais padrao.
- Cadastros globais ativos podem ser consultados por usuarios com perfil operacional ativo.

## Documentos

- `fundacao_operacional.md`: policies da Spec 01 para usuarios, postos, vinculos, cargos/funcoes e historico.
- `cadastros_base_mvp.md`: policies da Spec 02 para `prioridades`, `tipos_ocorrencia` e `metas_eficiencia`.

## Funcoes auxiliares

- `app_private.usuario_atual_id()`
- `app_private.usuario_tem_perfil(perfil_usuario)`
- `app_private.usuario_tem_acesso_posto(uuid)`
- `app_private.usuario_e_direcao_admin()`
- `app_private.usuario_e_supervisao()`
