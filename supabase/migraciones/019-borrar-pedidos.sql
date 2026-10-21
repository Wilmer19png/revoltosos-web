-- Revoltosos · migración 019: borrar pedidos desde el gestor
--
-- Para quitar pedidos de prueba. Solo los admins, y solo pedidos que no han sacado
-- producto del inventario (si ya salió, primero se cancela para que vuelva a bodega).
-- El historial del inventario conserva sus movimientos (pedido_id queda vacío).

drop policy if exists "admins borran pedidos" on public.pedidos;
create policy "admins borran pedidos" on public.pedidos
  for delete to authenticated
  using (public.es_admin() and not inventario_descontado);

grant delete on public.pedidos to authenticated;
