-- Revoltosos · 015 · Precios detal (con logística), envío a $20.000 y 9 combos con envío gratis (2026-10-19)
-- Correr DESPUÉS de 007–014. Pégalo completo en Supabase › SQL Editor › New query › Run.
-- Se puede correr más de una vez sin romper nada.
--
-- · Precios = «Precio final» del canal Detal de la hoja de precios, subido al siguiente precio terminado en
--   900 (nunca queda por debajo de la hoja). Combos: el precio acordado menos $100 ($60.000 → $59.900). El costo de cada tamaño también queda el de la hoja.
-- · Envío: $20.000 en todo el país. Pereira y Dosquebradas conservan la tarifa que tienen hoy.
-- · variantes.envio_gratis: si el pedido lleva un tamaño marcado así (los combos), no paga envío.
-- · Oído de cerdo y Mix de vísceras: se crean solo si no existen ya (se buscan por nombre).
-- · Los 3 combos anteriores no se tocan (salvo su costo, que se recalcula con los costos nuevos).

-- 1. Envío gratis por tamaño -----------------------------------------------------------------
alter table public.variantes add column if not exists envio_gratis boolean not null default false;
grant select (envio_gratis) on public.variantes to anon;

-- 2. Envío: $20.000 en general, Pereira y Dosquebradas como están ---------------------------
-- (en un UPDATE los valores de la derecha son los de antes del cambio)
update public.ajustes set
  envio_ciudades = jsonb_build_object(
    'Risaralda|Pereira',      coalesce(envio_ciudades -> 'Risaralda|Pereira',      envio_departamentos -> 'Risaralda', to_jsonb(envio_base)),
    'Risaralda|Dosquebradas', coalesce(envio_ciudades -> 'Risaralda|Dosquebradas', envio_departamentos -> 'Risaralda', to_jsonb(envio_base))
  ),
  envio_departamentos = '{}'::jsonb,
  envio_base = 20000,
  actualizado_en = now()
where id = 1;

-- 3. Oído de cerdo y Mix de vísceras (si no existen) ------------------------------------------
insert into public.productos (id, nombre, categoria, descripcion, imagen, ruta, visible, orden)
select 'oido-cerdo', 'Oído de cerdo', 'Masticables', 'Para masticar un buen rato. Un solo ingrediente.', null, null, true, 14
where not exists (select 1 from public.productos where nombre ~* 'o[ií]do');

insert into public.productos (id, nombre, categoria, descripcion, imagen, ruta, visible, orden)
select 'mix-visceras', 'Mix de vísceras', 'Codorniz', 'Vísceras de codorniz deshidratadas. Un solo ingrediente.', null, null, true, 15
where not exists (select 1 from public.productos where nombre ~* 'v[ií]sceras');

insert into public.variantes (id, producto_id, nombre, orden)
select 'oido-cerdo', 'oido-cerdo', '1 unidad', 1 where exists (select 1 from public.productos where id = 'oido-cerdo')
on conflict (id) do nothing;
insert into public.variantes (id, producto_id, nombre, orden)
select 'mix-visceras', 'mix-visceras', '50 g', 1 where exists (select 1 from public.productos where id = 'mix-visceras')
on conflict (id) do nothing;

-- El tamaño que se usa de cada uno (el creado aquí o el que ya existía en el gestor).
drop table if exists _tam;
create temp table _tam (clave text primary key, id text);
insert into _tam values
  ('oido',     (select v.id from public.variantes v join public.productos p on p.id = v.producto_id
                where p.nombre ~* 'o[ií]do' order by (v.id = 'oido-cerdo') desc, v.orden limit 1)),
  ('visceras', (select v.id from public.variantes v join public.productos p on p.id = v.producto_id
                where p.nombre ~* 'v[ií]sceras' order by (v.id = 'mix-visceras') desc, v.orden limit 1));

-- 4. Precios detal y costos ------------------------------------------------------------------
-- Patas x10 y x30: el precio tachado es lo que costarían en paquetes de 5 ($6.900 c/u).
update public.variantes v set precio = x.precio, precio_antes = x.antes, costo = x.costo, visible = true
from (values
  ('codornices-frasco-100g', 34900, null::integer, 16391),
  ('codornices-bolsa-50g',   18900, null,           8716),
  ('codorniz-entera',        16900, null,           7836),
  ((select id from _tam where clave = 'visceras'), 13900, null, 2486),
  ('humero-cerdo',            7900, null,           4587),
  ('femur-cerdo',            13900, null,           4887),
  ('paleta-cerdo',            5900, null,           2523),
  ('oreja-cerdo',             8900, null,           2826),
  ((select id from _tam where clave = 'oido'),      8900, null, 2826),
  ('femur-res',              20900, null,           7619),
  ('humero-res',             17900, null,           6655),
  ('patas-pollo',             6900, null,           2399),
  ('patas-pollo-10',         11900, 13800,          4567),
  ('patas-pollo-30',         28900, 41400,         10183)
) as x(id, precio, antes, costo)
where v.id = x.id;

-- 5. Los 9 combos (precio con envío gratis) ---------------------------------------------------
-- Fotos provisionales (la más parecida que hay) hasta tener la foto real de cada combo.
insert into public.productos (id, nombre, categoria, descripcion, imagen, ruta, visible, orden) values
  ('combo-michi-revoltoso',    'Combo Michi Revoltoso',    'Combos', 'Para gatos: 1 bolsa de codornicitas de 50 g, 2 mix de vísceras de 50 g y 1 codorniz entera.',              '/assets/img/productos/codornices-bolsa-50g-600.jpg',               null, true, 16),
  ('combo-mordedor-revoltoso', 'Combo Mordedor Revoltoso', 'Combos', '1 bolsa de codornicitas de 50 g, 1 oído de cerdo, 1 fémur de cerdo y 10 patas de pollo.',                  '/assets/img/productos/femur-cerdo-producto-600.jpg',               null, true, 17),
  ('combo-cerdito-revoltoso',  'Combo Cerdito Revoltoso',  'Combos', '1 bolsa de codornicitas de 50 g, 1 fémur, 1 húmero, 1 paleta y 1 oído de cerdo.',                           '/assets/img/productos/combo-cerdo-foto-600.jpg',                   null, true, 18),
  ('combo-masticador-xl',      'Combo Masticador XL',      'Combos', '1 bolsa de codornicitas de 50 g, 1 fémur de res, 1 húmero de res y 1 oreja de cerdo.',                     '/assets/img/productos/combo-res-codornicitas-foto-600.jpg',        null, true, 19),
  ('combo-pollo-loco',         'Combo Pollo Loco',         'Combos', '1 bolsa de codornicitas de 50 g, 30 patas de pollo y 1 codorniz entera.',                                  '/assets/img/productos/combo-codornicitas-patas-foto-600.jpg',      null, true, 20),
  ('combo-revoltoso-variado',  'Combo Revoltoso Variado',  'Combos', '1 bolsa de codornicitas de 50 g, 10 patas de pollo, 1 oreja de cerdo, 1 paleta de cerdo y 1 codorniz entera.', '/assets/img/productos/cajita-producto-fondo-blanco-600.jpg',       null, true, 21),
  ('combo-huesos-snacks',      'Combo Huesos & Snacks',    'Combos', '1 bolsa de codornicitas de 50 g, 1 fémur de res, 1 fémur de cerdo y 5 patas de pollo.',                    '/assets/img/productos/femur-res-producto-600.jpg',                 null, true, 22),
  ('combo-codorniz-lover',     'Combo Codorniz Lover',     'Combos', '1 bolsa de codornicitas de 50 g, 1 frasco de codorniz de 100 g, 1 mix de vísceras de 50 g y 1 codorniz entera.', '/assets/img/productos/codornices-frasco-100g-600.jpg',       null, true, 23),
  ('combo-huesos-revoltosos',  'Combo Huesos Revoltosos',  'Combos', '1 bolsa de codornicitas de 50 g, 1 fémur y 1 húmero de res, 1 fémur y 1 húmero de cerdo.',                 '/assets/img/productos/humero-res-empaque-fondo-blanco-600.jpg',    null, true, 24)
on conflict (id) do nothing;

insert into public.variantes (id, producto_id, nombre, detalle, precio, envio_gratis, visible, orden) values
  ('combo-michi-revoltoso',    'combo-michi-revoltoso',    'Combo', 'Envío gratis incluido', 59900, true, true, 1),
  ('combo-mordedor-revoltoso', 'combo-mordedor-revoltoso', 'Combo', 'Envío gratis incluido', 54900, true, true, 1),
  ('combo-cerdito-revoltoso',  'combo-cerdito-revoltoso',  'Combo', 'Envío gratis incluido', 59900, true, true, 1),
  ('combo-masticador-xl',      'combo-masticador-xl',      'Combo', 'Envío gratis incluido', 69900, true, true, 1),
  ('combo-pollo-loco',         'combo-pollo-loco',         'Combo', 'Envío gratis incluido', 64900, true, true, 1),
  ('combo-revoltoso-variado',  'combo-revoltoso-variado',  'Combo', 'Envío gratis incluido', 64900, true, true, 1),
  ('combo-huesos-snacks',      'combo-huesos-snacks',      'Combo', 'Envío gratis incluido', 59900, true, true, 1),
  ('combo-codorniz-lover',     'combo-codorniz-lover',     'Combo', 'Envío gratis incluido', 74900, true, true, 1),
  ('combo-huesos-revoltosos',  'combo-huesos-revoltosos',  'Combo', 'Envío gratis incluido', 74900, true, true, 1)
on conflict (id) do update set precio = excluded.precio, envio_gratis = true;

-- Qué trae cada combo (al despachar, el inventario sale de cada producto).
delete from public.variante_componentes where combo_id in (
  'combo-michi-revoltoso', 'combo-mordedor-revoltoso', 'combo-cerdito-revoltoso', 'combo-masticador-xl', 'combo-pollo-loco',
  'combo-revoltoso-variado', 'combo-huesos-snacks', 'combo-codorniz-lover', 'combo-huesos-revoltosos');

insert into public.variante_componentes (combo_id, componente_id, cantidad)
select x.combo, coalesce((select id from _tam where clave = x.comp), x.comp), x.n
from (values
  ('combo-michi-revoltoso',    'codornices-bolsa-50g',   1), ('combo-michi-revoltoso',    'visceras',        2), ('combo-michi-revoltoso',    'codorniz-entera', 1),
  ('combo-mordedor-revoltoso', 'codornices-bolsa-50g',   1), ('combo-mordedor-revoltoso', 'oido',            1), ('combo-mordedor-revoltoso', 'femur-cerdo',     1), ('combo-mordedor-revoltoso', 'patas-pollo-10', 1),
  ('combo-cerdito-revoltoso',  'codornices-bolsa-50g',   1), ('combo-cerdito-revoltoso',  'femur-cerdo',     1), ('combo-cerdito-revoltoso',  'humero-cerdo',    1), ('combo-cerdito-revoltoso',  'paleta-cerdo',   1), ('combo-cerdito-revoltoso', 'oido', 1),
  ('combo-masticador-xl',      'codornices-bolsa-50g',   1), ('combo-masticador-xl',      'femur-res',       1), ('combo-masticador-xl',      'humero-res',      1), ('combo-masticador-xl',      'oreja-cerdo',    1),
  ('combo-pollo-loco',         'codornices-bolsa-50g',   1), ('combo-pollo-loco',         'patas-pollo-30',  1), ('combo-pollo-loco',         'codorniz-entera', 1),
  ('combo-revoltoso-variado',  'codornices-bolsa-50g',   1), ('combo-revoltoso-variado',  'patas-pollo-10',  1), ('combo-revoltoso-variado',  'oreja-cerdo',     1), ('combo-revoltoso-variado',  'paleta-cerdo',   1), ('combo-revoltoso-variado', 'codorniz-entera', 1),
  ('combo-huesos-snacks',      'codornices-bolsa-50g',   1), ('combo-huesos-snacks',      'femur-res',       1), ('combo-huesos-snacks',      'femur-cerdo',     1), ('combo-huesos-snacks',      'patas-pollo',    1),
  ('combo-codorniz-lover',     'codornices-bolsa-50g',   1), ('combo-codorniz-lover',     'codornices-frasco-100g', 1), ('combo-codorniz-lover', 'visceras',     1), ('combo-codorniz-lover',     'codorniz-entera', 1),
  ('combo-huesos-revoltosos',  'codornices-bolsa-50g',   1), ('combo-huesos-revoltosos',  'femur-res',       1), ('combo-huesos-revoltosos',  'humero-res',      1), ('combo-huesos-revoltosos',  'femur-cerdo',    1), ('combo-huesos-revoltosos', 'humero-cerdo', 1)
) as x(combo, comp, n);

-- 6. Costo de cada combo = suma de lo que trae (también los 3 combos anteriores) --------------
update public.variantes c set costo = s.costo
from (
  select vc.combo_id, sum(v.costo * vc.cantidad)::integer as costo
  from public.variante_componentes vc join public.variantes v on v.id = vc.componente_id
  group by vc.combo_id
) s
where c.id = s.combo_id;

-- 7. Revisión -------------------------------------------------------------------------------
select p.nombre, v.nombre as tamano, v.precio, v.precio_antes, v.costo, v.envio_gratis,
       (select string_agg(c.cantidad || ' × ' || c.componente_id, ', ') from public.variante_componentes c where c.combo_id = v.id) as trae
from public.variantes v join public.productos p on p.id = v.producto_id
order by p.orden, v.orden;

select envio_base, envio_departamentos, envio_ciudades from public.ajustes where id = 1;
