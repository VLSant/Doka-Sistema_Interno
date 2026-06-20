-- Permite que updates admin produzam estados soft-deleted que saem das leituras
-- padrao. A autorizacao permanece no USING da linha original.

drop policy if exists cargos_funcoes_admin_update on public.cargos_funcoes;
create policy cargos_funcoes_admin_update
on public.cargos_funcoes
for update
to authenticated
using (app_private.usuario_e_direcao_admin())
with check (app_private.usuario_atual_id() is not null);

drop policy if exists usuarios_admin_update on public.usuarios;
create policy usuarios_admin_update
on public.usuarios
for update
to authenticated
using (app_private.usuario_e_direcao_admin())
with check (app_private.usuario_atual_id() is not null);

drop policy if exists postos_admin_update on public.postos;
create policy postos_admin_update
on public.postos
for update
to authenticated
using (app_private.usuario_e_direcao_admin())
with check (app_private.usuario_atual_id() is not null);

drop policy if exists usuarios_postos_admin_update on public.usuarios_postos;
create policy usuarios_postos_admin_update
on public.usuarios_postos
for update
to authenticated
using (app_private.usuario_e_direcao_admin())
with check (app_private.usuario_atual_id() is not null);
