-- Revoltosos · 022 · Precio tachado en todo, Paleta de res, paleta de cerdo a $10.900 y reseñas por producto (2026-11-13)
-- Correr DESPUÉS de 021. Pégalo completo en Supabase › SQL Editor › New query › Run.
-- Se puede correr más de una vez sin romper nada.
--
-- · Paleta de cerdo (por unidad): $10.900. Los combos que la traen no cambian de precio.
-- · Paleta de res: producto nuevo, 1 unidad a $16.900 (costo en 0 hasta que lo llenes en el gestor).
-- · Precio tachado (precio_antes): los precios bajaron 25 %, así que el tachado es el precio de venta / 0,75,
--   redondeado a la centena (así el descuento que se muestra da 25 %). Excepciones:
--     fémur de res: bajó 35 % (precio / 0,65) · Cajita para perros: antes $102.000 · Húmero de cerdo: antes $10.000.
-- · Reseñas: ahora se pueden dejar desde cada landing. Se guarda el producto (resenas.producto_id) y siguen
--   entrando como Pendiente: se publican desde el gestor › Reseñas.

-- 1. Paleta de cerdo por unidad a $10.900 ------------------------------------------------
update public.variantes set precio = 10900 where id = 'paleta-cerdo';

-- 2. Paleta de res ---------------------------------------------------------------------
insert into public.productos (id, nombre, categoria, descripcion, imagen, ruta, visible, orden) values
  ('paleta-res', 'Paleta de res', 'Huesos y fémur',
   'Paleta de res deshidratada: hueso plano y grande para morder. Un solo ingrediente.',
   '/assets/img/productos/paleta-res-producto-600.jpg', '/paleta-de-res/', true, 99)
on conflict (id) do update set nombre = excluded.nombre, categoria = excluded.categoria, descripcion = excluded.descripcion, imagen = excluded.imagen, ruta = excluded.ruta, visible = true;

insert into public.variantes (id, producto_id, nombre, detalle, precio, visible, orden) values
  ('paleta-res', 'paleta-res', '1 unidad', null, 16900, true, 1)
on conflict (id) do update set precio = excluded.precio, visible = true;

-- Inventario inicial como los demás (1000 mientras se hace el conteo real).
insert into public.movimientos (variante_id, cantidad, motivo)
select id, 1000 - stock, 'Inventario inicial: 1000 mientras se hace el conteo real'
from public.variantes
where id = 'paleta-res' and stock = 0;

-- 3. Precio tachado ----------------------------------------------------------------------
update public.variantes set precio_antes = (round(precio / 0.75 / 100.0) * 100)::integer
where precio is not null and precio > 0;

update public.variantes set precio_antes = (round(precio / 0.65 / 100.0) * 100)::integer where id = 'femur-res';
update public.variantes set precio_antes = 102000 where id = 'cajita-perros';
update public.variantes set precio_antes = 10000  where id = 'humero-cerdo';

-- 4. Orden de la tienda (misma regla de la 020/021) ---------------------------------------
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

-- 5. Reseñas por producto ------------------------------------------------------------------
-- Antes solo se aceptaban 3 valores en «producto»; ahora va el nombre del producto de la landing.
alter table public.resenas drop constraint if exists resenas_producto_check;
alter table public.resenas add constraint resenas_producto_check check (char_length(producto) between 2 and 80);
alter table public.resenas add column if not exists producto_id text references public.productos (id) on delete set null;
create index if not exists resenas_producto_idx on public.resenas (producto_id, estado);

-- Las reseñas que ya existen quedan asociadas a su producto.
update public.resenas set producto_id = 'codornices'    where producto_id is null and producto = 'Codornices';
update public.resenas set producto_id = 'cajita-perros' where producto_id is null and producto = 'Cajita para perros';

-- 6. Revisión ------------------------------------------------------------------------------
select p.nombre, v.nombre as tamano, v.precio, v.precio_antes,
       round(100 - 100.0 * v.precio / v.precio_antes) as descuento_pct
from public.variantes v join public.productos p on p.id = v.producto_id
order by p.orden, v.orden;
