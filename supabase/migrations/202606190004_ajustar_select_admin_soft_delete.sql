-- Permite que Direcao/Admin inspecione registros soft-deleted em telas
-- administrativas e viabiliza updates de soft delete sob RLS.

drop policy if exists cargos_funcoes_admin_select on public.cargos_funcoes;
create policy cargos_funcoes_admin_select
on public.cargos_funcoes
for select
to authenticated
using (app_private.usuario_e_direcao_admin());

drop policy if exists usuarios_admin_select on public.usuarios;
create policy usuarios_admin_select
on public.usuarios
for select
to authenticated
using (app_private.usuario_e_direcao_admin());

drop policy if exists postos_admin_select on public.postos;
create policy postos_admin_select
on public.postos
for select
to authenticated
using (app_private.usuario_e_direcao_admin());

drop policy if exists usuarios_postos_admin_select on public.usuarios_postos;
create policy usuarios_postos_admin_select
on public.usuarios_postos
for select
to authenticated
using (app_private.usuario_e_direcao_admin());

revoke delete, truncate, references, trigger
on public.cargos_funcoes, public.usuarios, public.postos, public.usuarios_postos
from authenticated;
