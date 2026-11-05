-- Revoltosos · 021 · Combo Menos de 50 Mil (2026-11-05)
-- Correr DESPUÉS de 020. Pégalo completo en Supabase › SQL Editor › New query › Run.
-- Se puede correr más de una vez sin romper nada.
--
-- · Trae: 1 húmero de cerdo, 1 paleta de cerdo, 1 oreja de cerdo, 5 patas de pollo y 1 codorniz entera.
-- · Precio: $46.500, lo mismo que suma todo por separado (precio acordado; no termina en 900 a propósito).
-- · NO trae envío incluido: paga envío como cualquier pedido, y en el carrito se sugieren
--   codornices para llegar al envío gratis.
-- · Foto: combo-granja-revoltosa-foto (los 5 snacks juntos).

insert into public.productos (id, nombre, categoria, descripcion, imagen, ruta, visible, orden) values
  ('combo-granja-revoltosa', 'Combo Menos de 50 Mil', 'Combos',
   '1 húmero de cerdo, 1 paleta de cerdo, 1 oreja de cerdo, 5 patas de pollo y 1 codorniz entera.',
   '/assets/img/productos/combo-granja-revoltosa-foto-600.jpg', '/combo-granja-revoltosa/', true, 99)
on conflict (id) do update set nombre = excluded.nombre, descripcion = excluded.descripcion, imagen = excluded.imagen, ruta = excluded.ruta;

insert into public.variantes (id, producto_id, nombre, detalle, precio, envio_gratis, visible, orden) values
  ('combo-granja-revoltosa', 'combo-granja-revoltosa', 'Combo', null, 46500, false, true, 1)
on conflict (id) do update set precio = excluded.precio, envio_gratis = false, detalle = null;

-- Qué trae (al despachar, el inventario sale de cada producto).
delete from public.variante_componentes where combo_id = 'combo-granja-revoltosa';
insert into public.variante_componentes (combo_id, componente_id, cantidad) values
  ('combo-granja-revoltosa', 'humero-cerdo',    1),
  ('combo-granja-revoltosa', 'paleta-cerdo',    1),
  ('combo-granja-revoltosa', 'oreja-cerdo',     1),
  ('combo-granja-revoltosa', 'patas-pollo',     1),
  ('combo-granja-revoltosa', 'codorniz-entera', 1);

-- Costo = suma de lo que trae.
update public.variantes c set costo = s.costo
from (
  select vc.combo_id, sum(v.costo * vc.cantidad)::integer as costo
  from public.variante_componentes vc join public.variantes v on v.id = vc.componente_id
  where vc.combo_id = 'combo-granja-revoltosa'
  group by vc.combo_id
) s
where c.id = s.combo_id;

-- Orden de la tienda (misma regla de la 020: destacados primero, luego del más barato al más caro).
with destacados(id, orden) as (
  values ('humero-cerdo', 1), ('codornices', 2), ('oreja-cerdo', 3), ('patas-pollo', 4), ('paleta-cerdo', 5)
),
resto as (
  select p.id, 5 + row_number() over (order by min(v.precio) nulls last, p.orden, p.id) as orden
  from public.productos p
  left join public.variantes v on v.producto_id = p.id and v.precio > 0
  where p.id not in (select id from destacados)
  group by p.id, p.orden
)
update public.productos p
set orden = n.orden
from (select * from destacados union all select * from resto) n
where p.id = n.id;

-- Revisión
select p.nombre, v.precio, v.costo, v.envio_gratis, p.orden,
       (select string_agg(c.cantidad || ' × ' || c.componente_id, ', ') from public.variante_componentes c where c.combo_id = v.id) as trae
from public.variantes v join public.productos p on p.id = v.producto_id
where v.id = 'combo-granja-revoltosa';
