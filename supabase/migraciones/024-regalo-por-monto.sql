-- Revoltosos · 024 · Regalo por compras grandes (2026-11-14)
-- Correr DESPUÉS de 023. Pégalo completo en Supabase › SQL Editor › New query › Run.
-- Se puede correr más de una vez sin romper nada.
--
-- · Desde $100.000 en productos (ya con cupón, sin contar envío) el pedido lleva de regalo
--   la bolsa de codornices de 50 g. La función crear-pedido la agrega sola al pedido con precio $0
--   (su costo sí cuenta en la ganancia y sale del inventario al despachar).
-- · Para cambiar el monto o el regalo: gestor › Ajustes (o edita estas dos columnas).
--   regalo_desde vacío = sin regalo.

alter table public.ajustes add column if not exists regalo_desde integer;
alter table public.ajustes add column if not exists regalo_variante text references public.variantes(id) on delete set null;

update public.ajustes
set regalo_desde = 100000, regalo_variante = 'codornices-bolsa-50g'
where id = 1 and regalo_variante is null;

-- La tienda (visitantes) lee estas dos columnas para mostrar «te faltan $X para tu regalo».
grant select (regalo_desde, regalo_variante) on public.ajustes to anon;

-- Revisión: el regalo y su costo (si el costo está en 0, ponlo en gestor › Productos).
select a.regalo_desde, v.id, p.nombre, v.nombre as tamano, v.costo
from public.ajustes a
left join public.variantes v on v.id = a.regalo_variante
left join public.productos p on p.id = v.producto_id
where a.id = 1;
