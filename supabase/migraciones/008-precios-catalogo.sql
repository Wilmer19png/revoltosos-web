-- Revoltosos · 008 · Precios del catálogo completo e inventario inicial (2026-10-14)
-- Correr DESPUÉS de 007-tienda.sql. Pégalo completo en Supabase › SQL Editor › New query › Run.
--
-- · Codornices: bolsa 50 g $15.900 y frasco 100 g $26.900. Se quita «2 frascos».
-- · Se activan todos los productos con sus precios y se agrega el húmero de res.
-- · Patas de pollo por paquetes: 5, 10, 30 unidades y 1 kg. El «precio normal» (tachado)
--   de 10 y 30 es lo que costarían en paquetes de 5, así la tienda muestra el ahorro real.
-- · Todos los tamaños quedan con 1000 unidades en inventario mientras se hace el conteo real
--   (queda registrado como movimiento «Inventario inicial»).

-- 1. Codornices -----------------------------------------------------------------
update public.variantes set precio = 15900, precio_antes = null, detalle = 'Para probar', visible = true, orden = 1
where id = 'codornices-bolsa-50g';
update public.variantes set precio = 26900, precio_antes = null, detalle = 'Aprox. 30 codornices', visible = true, orden = 2
where id = 'codornices-frasco-100g';
delete from public.variantes where id = 'codornices-2-frascos';

-- 2. Húmero de res (nuevo) --------------------------------------------------------
insert into public.productos (id, nombre, categoria, descripcion, imagen, ruta, visible, orden) values
  ('humero-res', 'Húmero de res', 'Huesos y fémur', 'Para perros medianos y grandes.', '/assets/img/productos/humero-res-empaque-fondo-blanco.jpg', null, true, 10)
on conflict (id) do nothing;
insert into public.variantes (id, producto_id, nombre, orden) values ('humero-res', 'humero-res', '1 unidad', 1)
on conflict (id) do nothing;

-- 3. Precios de los demás ---------------------------------------------------------
update public.variantes v set nombre = x.nombre, precio = x.precio, precio_antes = null, visible = true
from (values
  ('codorniz-entera', '2 unidades', 14000),
  ('femur-res',       '1 unidad',   19000),
  ('humero-res',      '1 unidad',   16000),
  ('paleta-cerdo',    '1 unidad',    6500),
  ('femur-cerdo',     '1 unidad',   14000),
  ('humero-cerdo',    '1 unidad',    7000),
  ('oreja-cerdo',     '1 unidad',   15000)
) as x(id, nombre, precio)
where v.id = x.id;

-- 4. Patas de pollo por paquetes ---------------------------------------------------
update public.variantes set nombre = '5 unidades', detalle = null, precio = 6800, precio_antes = null, visible = true, orden = 1
where id = 'patas-pollo';
insert into public.variantes (id, producto_id, nombre, detalle, precio, precio_antes, visible, orden) values
  ('patas-pollo-10',  'patas-pollo', '10 unidades', null,          12900, 13600, true, 2),
  ('patas-pollo-30',  'patas-pollo', '30 unidades', 'Rinde más',   26500, 40800, true, 3),
  ('patas-pollo-1kg', 'patas-pollo', '1 kilo',      'Por kilo',    78000, null,  true, 4)
on conflict (id) do update set
  nombre = excluded.nombre, detalle = excluded.detalle, precio = excluded.precio,
  precio_antes = excluded.precio_antes, visible = excluded.visible, orden = excluded.orden;

-- 5. Todos los productos visibles y en orden ----------------------------------------
update public.productos p set visible = true, orden = x.orden
from (values
  ('codornices', 1), ('cajita-perros', 2), ('patas-pollo', 3), ('codorniz-entera', 4), ('oreja-cerdo', 5),
  ('femur-cerdo', 6), ('humero-cerdo', 7), ('paleta-cerdo', 8), ('femur-res', 9), ('humero-res', 10)
) as x(id, orden)
where p.id = x.id;

-- 6. Inventario inicial: 1000 de cada tamaño --------------------------------------
-- (los combos que descuentan de otro tamaño no tienen stock propio)
insert into public.movimientos (variante_id, cantidad, motivo)
select id, 1000 - stock, 'Inventario inicial: 1000 mientras se hace el conteo real'
from public.variantes
where descuenta_de is null and stock <> 1000;

select p.nombre, v.nombre as tamano, v.precio, v.precio_antes, v.stock
from public.variantes v join public.productos p on p.id = v.producto_id
order by p.orden, v.orden;
