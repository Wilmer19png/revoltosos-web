-- Revoltosos · 016 · Landings de los productos y combos nuevos + codorniz entera visible (2026-10-19)
-- Correr DESPUÉS de 015. Pégalo en Supabase › SQL Editor › New query › Run. Se puede correr más de una vez.
--
-- · Cada producto nuevo abre su landing propia (antes abrían la página genérica /producto/?p=…).
-- · La codorniz entera estaba oculta en la tienda aunque los combos la traen: vuelve a mostrarse.

update public.productos p set ruta = x.ruta
from (values
  ('oido-cerdo',               '/oido-de-cerdo/'),
  ('mix-visceras',             '/mix-de-visceras/'),
  ('combo-michi-revoltoso',    '/combo-michi-revoltoso/'),
  ('combo-mordedor-revoltoso', '/combo-mordedor-revoltoso/'),
  ('combo-cerdito-revoltoso',  '/combo-cerdito-revoltoso/'),
  ('combo-masticador-xl',      '/combo-masticador-xl/'),
  ('combo-pollo-loco',         '/combo-pollo-loco/'),
  ('combo-revoltoso-variado',  '/combo-revoltoso-variado/'),
  ('combo-huesos-snacks',      '/combo-huesos-snacks/'),
  ('combo-codorniz-lover',     '/combo-codorniz-lover/'),
  ('combo-huesos-revoltosos',  '/combo-huesos-revoltosos/')
) as x(id, ruta)
where p.id = x.id;

update public.productos set visible = true, orden = 4 where id = 'codorniz-entera';
update public.variantes set visible = true where producto_id = 'codorniz-entera';

select id, nombre, visible, ruta from public.productos order by orden;
