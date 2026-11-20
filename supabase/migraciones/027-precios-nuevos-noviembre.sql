-- Revoltosos · 027 · Precios nuevos con pauta y los 10 combos nuevos (2026-11-20)
-- Correr DESPUÉS de 026 (así el precio tachado al 25 % se recalcula solo).
-- Pégalo completo en Supabase › SQL Editor › New query › Run. Se puede correr más de una vez.
--
-- · Snacks sueltos: imagen «Nuevos precios» (propuesta con pauta de $1.600.000/mes). Cada precio
--   propuesto se redondeó HACIA ARRIBA al siguiente valor terminado en 900.
-- · Paleta de res: $19.900 (precio dado por el dueño).
-- · Combos: los 13 combos de antes se ocultan (no se borran, para no dañar pedidos viejos) y
--   entran los 10 de la imagen «combos precios». Ninguno trae envío incluido: el envío es gratis
--   desde $120.000 para todo.
-- · No cambian: Cajita para perros ($72.900), Patas de pollo 1 kilo ($78.000).

-- 1. Snacks sueltos ---------------------------------------------------------------------------
update public.variantes v set precio = x.precio
from (values
  ('codornices-bolsa-50g',     22900),  -- $22.719
  ('codornices-frasco-100g',   38900),  -- $38.719
  ('codorniz-entera',          20900),  -- $20.719 (2 unidades)
  ('oreja-cerdo',              12900),  -- $12.719
  ('oido-cerdo',               14900),  -- $14.628
  ('humero-cerdo',             11900),  -- $11.719
  ('paleta-cerdo',             14900),  -- $14.719
  ('femur-cerdo',              18900),  -- $18.673
  ('femur-res',                24900),  -- $24.719
  ('humero-res',               23900),  -- $23.628
  ('paleta-res',               19900),  -- precio del dueño
  ('patas-pollo',              11900),  -- $11.673 (5 unidades)
  ('patas-pollo-10',           17900),  -- $17.628
  ('patas-pollo-30',           34900),  -- $34.628
  ('mix-visceras',             19900)   -- $19.628
) as x(id, precio)
where v.id = x.id;

-- Codorniz entera por unidad (50 g): tamaño nuevo, $13.900. El costo es la mitad del de 2 unidades.
insert into public.variantes (id, producto_id, nombre, detalle, precio, visible, orden)
values ('codorniz-entera-1', 'codorniz-entera', '1 unidad', '50 g', 13900, true, 0)
on conflict (id) do update set precio = excluded.precio, detalle = excluded.detalle, visible = true;
update public.variantes set costo = (select round(costo / 2.0)::integer from public.variantes where id = 'codorniz-entera')
where id = 'codorniz-entera-1';
update public.variantes set detalle = '100 g' where id = 'codorniz-entera' and detalle is null;

-- 2. Los combos de antes salen de la tienda ---------------------------------------------------
update public.productos set visible = false
where categoria = 'Combos' and id in (
  'combo-cerdo', 'combo-codornicitas-patas', 'combo-granja-revoltosa', 'combo-res-codornicitas',
  'combo-mordedor-revoltoso', 'combo-michi-revoltoso', 'combo-cerdito-revoltoso', 'combo-huesos-snacks',
  'combo-pollo-loco', 'combo-revoltoso-variado', 'combo-masticador-xl', 'combo-codorniz-lover',
  'combo-huesos-revoltosos');
update public.variantes set visible = false
where id in (
  'combo-cerdo', 'combo-codornicitas-patas', 'combo-granja-revoltosa', 'combo-res-codornicitas',
  'combo-mordedor-revoltoso', 'combo-michi-revoltoso', 'combo-cerdito-revoltoso', 'combo-huesos-snacks',
  'combo-pollo-loco', 'combo-revoltoso-variado', 'combo-masticador-xl', 'combo-codorniz-lover',
  'combo-huesos-revoltosos');

-- 3. Los 10 combos nuevos (fotos provisionales hasta tener la foto de cada uno) ----------------
insert into public.productos (id, nombre, categoria, descripcion, imagen, ruta, visible, orden) values
  ('combo-cerdito-crujiente',   'Combo Cerdito Crujiente',   'Combos', '1 paleta, 1 fémur y 1 oreja de cerdo, y 5 patas de pollo.',                        '/assets/img/productos/combo-cerdo-foto-600.jpg',                null, true, 1),
  ('combo-masticador-grande',   'Combo Masticador Grande',   'Combos', '1 húmero de res, 1 fémur de res y 30 patas de pollo.',                              '/assets/img/productos/combo-res-codornicitas-foto-600.jpg',     null, true, 2),
  ('combo-despensa-crujiente',  'Combo Despensa Crujiente',  'Combos', '30 patas de pollo, 2 paletas de cerdo y 2 orejas de cerdo.',                        '/assets/img/productos/combo-granja-revoltosa-foto-600.jpg',     null, true, 3),
  ('combo-favoritos-revoltosos','Combo Favoritos Revoltosos','Combos', 'Codornicitas 100 g, 30 patas de pollo y 1 paleta de cerdo.',                        '/assets/img/productos/codornices-frasco-100g-600.jpg',          null, true, 4),
  ('combo-cerdo-patitas',       'Combo Cerdo y Patitas',     'Combos', '1 paleta de cerdo, 1 fémur de cerdo y 30 patas de pollo.',                          '/assets/img/productos/femur-cerdo-producto-600.jpg',            null, true, 5),
  ('combo-doble-paleta',        'Combo Doble Paleta',        'Combos', '2 paletas de cerdo y 30 patas de pollo.',                                           '/assets/img/productos/paleta-cerdo-producto-600.jpg',           null, true, 6),
  ('combo-res-crujiente',       'Combo Res Crujiente',       'Combos', '1 húmero de res, 1 fémur de res y 1 paleta de cerdo.',                              '/assets/img/productos/humero-res-empaque-fondo-blanco-600.jpg', null, true, 7),
  ('combo-patitas-compartir',   'Combo Patitas para Compartir','Combos','60 patas de pollo (2 paquetes de 30) y codornicitas 50 g.',                        '/assets/img/productos/combo-codornicitas-patas-foto-600.jpg',   null, true, 8),
  ('combo-despensa-familiar',   'Combo Despensa Familiar',   'Combos', 'Codornicitas 100 g, 60 patas de pollo (2 paquetes de 30) y 2 paletas de cerdo.',    '/assets/img/productos/cajita-producto-fondo-blanco-600.jpg',    null, true, 9),
  ('combo-duo-masticador',      'Combo Dúo Masticador',      'Combos', '2 húmeros de res, 2 paletas de cerdo y 30 patas de pollo.',                         '/assets/img/productos/humero-res-empaque-600.jpg',              null, true, 10)
on conflict (id) do update set nombre = excluded.nombre, categoria = excluded.categoria, descripcion = excluded.descripcion, visible = true, orden = excluded.orden;

insert into public.variantes (id, producto_id, nombre, detalle, precio, envio_gratis, visible, orden) values
  ('combo-cerdito-crujiente',    'combo-cerdito-crujiente',    'Combo', null,  54900, false, true, 1),
  ('combo-masticador-grande',    'combo-masticador-grande',    'Combo', null,  79900, false, true, 1),
  ('combo-despensa-crujiente',   'combo-despensa-crujiente',   'Combo', null,  85900, false, true, 1),
  ('combo-favoritos-revoltosos', 'combo-favoritos-revoltosos', 'Combo', null,  85900, false, true, 1),
  ('combo-cerdo-patitas',        'combo-cerdo-patitas',        'Combo', null,  64900, false, true, 1),
  ('combo-doble-paleta',         'combo-doble-paleta',         'Combo', null,  59900, false, true, 1),
  ('combo-res-crujiente',        'combo-res-crujiente',        'Combo', null,  57900, false, true, 1),
  ('combo-patitas-compartir',    'combo-patitas-compartir',    'Combo', null,  84900, false, true, 1),
  ('combo-despensa-familiar',    'combo-despensa-familiar',    'Combo', null, 129900, false, true, 1),
  ('combo-duo-masticador',       'combo-duo-masticador',       'Combo', null, 109900, false, true, 1)
on conflict (id) do update set precio = excluded.precio, envio_gratis = false, visible = true;

-- Qué trae cada combo (al despachar, el inventario sale de cada producto).
delete from public.variante_componentes where combo_id in (
  'combo-cerdito-crujiente', 'combo-masticador-grande', 'combo-despensa-crujiente', 'combo-favoritos-revoltosos',
  'combo-cerdo-patitas', 'combo-doble-paleta', 'combo-res-crujiente', 'combo-patitas-compartir',
  'combo-despensa-familiar', 'combo-duo-masticador');
insert into public.variante_componentes (combo_id, componente_id, cantidad) values
  ('combo-cerdito-crujiente',    'paleta-cerdo', 1), ('combo-cerdito-crujiente', 'femur-cerdo', 1), ('combo-cerdito-crujiente', 'oreja-cerdo', 1), ('combo-cerdito-crujiente', 'patas-pollo', 1),
  ('combo-masticador-grande',    'humero-res', 1),   ('combo-masticador-grande', 'femur-res', 1),   ('combo-masticador-grande', 'patas-pollo-30', 1),
  ('combo-despensa-crujiente',   'patas-pollo-30', 1), ('combo-despensa-crujiente', 'paleta-cerdo', 2), ('combo-despensa-crujiente', 'oreja-cerdo', 2),
  ('combo-favoritos-revoltosos', 'codornices-frasco-100g', 1), ('combo-favoritos-revoltosos', 'patas-pollo-30', 1), ('combo-favoritos-revoltosos', 'paleta-cerdo', 1),
  ('combo-cerdo-patitas',        'paleta-cerdo', 1), ('combo-cerdo-patitas', 'femur-cerdo', 1), ('combo-cerdo-patitas', 'patas-pollo-30', 1),
  ('combo-doble-paleta',         'paleta-cerdo', 2), ('combo-doble-paleta', 'patas-pollo-30', 1),
  ('combo-res-crujiente',        'humero-res', 1),   ('combo-res-crujiente', 'femur-res', 1), ('combo-res-crujiente', 'paleta-cerdo', 1),
  ('combo-patitas-compartir',    'patas-pollo-30', 2), ('combo-patitas-compartir', 'codornices-bolsa-50g', 1),
  ('combo-despensa-familiar',    'codornices-frasco-100g', 1), ('combo-despensa-familiar', 'patas-pollo-30', 2), ('combo-despensa-familiar', 'paleta-cerdo', 2),
  ('combo-duo-masticador',       'humero-res', 2),   ('combo-duo-masticador', 'paleta-cerdo', 2), ('combo-duo-masticador', 'patas-pollo-30', 1);

-- Costo de cada combo = suma de lo que trae.
update public.variantes c set costo = s.costo
from (
  select vc.combo_id, sum(v.costo * vc.cantidad)::integer as costo
  from public.variante_componentes vc join public.variantes v on v.id = vc.componente_id
  where vc.combo_id like 'combo-%'
  group by vc.combo_id
) s
where c.id = s.combo_id;

-- 4. Orden de la tienda: los combos primero, luego los sueltos ---------------------------------
update public.productos set orden = orden + 20 where categoria <> 'Combos' and orden < 20;

-- 5. Revisión ---------------------------------------------------------------------------------
select p.nombre, v.precio, v.precio_antes, v.costo, p.visible,
       (select string_agg(c.cantidad || ' × ' || c.componente_id, ', ') from public.variante_componentes c where c.combo_id = v.id) as trae
from public.variantes v join public.productos p on p.id = v.producto_id
where v.precio > 0
order by p.visible desc, p.orden, v.orden;
