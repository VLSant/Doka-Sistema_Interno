# Policies / RLS

Esta pasta deve conter scripts e documentação das policies de Row Level Security do Supabase.

## Regras principais

- Operador acessa apenas postos vinculados em usuarios_postos.
- Supervisão acessa postos sob responsabilidade.
- Direção/Administração acessa todos os dados.
- Registros com deleted_at preenchido devem ficar ocultos em consultas operacionais padrão.

## Funções auxiliares sugeridas

- usuario_atual_id();
- usuario_tem_perfil(perfil);
- usuario_tem_acesso_posto(posto_id);
- usuario_e_direcao_admin();
- usuario_e_supervisao().
