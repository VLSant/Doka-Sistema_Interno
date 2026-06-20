-- Ajusta policies admin para nao ampliar SELECT sobre registros soft-deleted.
-- Admin continua podendo inserir e atualizar registros dentro das regras RLS.

drop policy if exists cargos_funcoes_admin_all on public.cargos_funcoes;
drop policy if exists cargos_funcoes_admin_insert on public.cargos_funcoes;
drop policy if exists cargos_funcoes_admin_update on public.cargos_funcoes;

create policy cargos_funcoes_admin_insert
on public.cargos_funcoes
for insert
to authenticated
with check (app_private.usuario_e_direcao_admin());

create policy cargos_funcoes_admin_update
on public.cargos_funcoes
for update
to authenticated
using (app_private.usuario_e_direcao_admin())
with check (app_private.usuario_e_direcao_admin());

drop policy if exists usuarios_admin_all on public.usuarios;
drop policy if exists usuarios_admin_insert on public.usuarios;
drop policy if exists usuarios_admin_update on public.usuarios;

create policy usuarios_admin_insert
on public.usuarios
for insert
to authenticated
with check (app_private.usuario_e_direcao_admin());

create policy usuarios_admin_update
on public.usuarios
for update
to authenticated
using (app_private.usuario_e_direcao_admin())
with check (app_private.usuario_e_direcao_admin());

drop policy if exists postos_admin_all on public.postos;
drop policy if exists postos_admin_insert on public.postos;
drop policy if exists postos_admin_update on public.postos;

create policy postos_admin_insert
on public.postos
for insert
to authenticated
with check (app_private.usuario_e_direcao_admin());

create policy postos_admin_update
on public.postos
for update
to authenticated
using (app_private.usuario_e_direcao_admin())
with check (app_private.usuario_e_direcao_admin());

drop policy if exists usuarios_postos_admin_all on public.usuarios_postos;
drop policy if exists usuarios_postos_admin_insert on public.usuarios_postos;
drop policy if exists usuarios_postos_admin_update on public.usuarios_postos;

create policy usuarios_postos_admin_insert
on public.usuarios_postos
for insert
to authenticated
with check (app_private.usuario_e_direcao_admin());

create policy usuarios_postos_admin_update
on public.usuarios_postos
for update
to authenticated
using (app_private.usuario_e_direcao_admin())
with check (app_private.usuario_e_direcao_admin());
