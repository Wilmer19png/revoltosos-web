-- Revoltosos · 011 · Envío por ciudad, foto por tamaño y landings de cada producto
-- Correr DESPUÉS de 007–010. Pégalo completo en Supabase › SQL Editor › New query › Run.
-- Se puede correr más de una vez sin romper nada.
--
-- · ajustes.envio_ciudades: tarifa para una ciudad puntual (gana sobre la del departamento).
--   Formato: {"Antioquia|Medellín": 9500, "Nariño|Tumaco": 21000}
-- · variantes.imagen: foto propia de un tamaño (p. ej. la bolsa de 50 g). Vacía = la del producto.
-- · productos.ruta: cada producto con su landing propia para pautar.

alter table public.ajustes add column if not exists envio_ciudades jsonb not null default '{}'::jsonb;
grant select (envio_ciudades) on public.ajustes to anon;

alter table public.variantes add column if not exists imagen text;
grant select (imagen) on public.variantes to anon;

update public.productos p set ruta = x.ruta, imagen = x.imagen
from (values
  ('patas-pollo',     '/patas-de-pollo/',   '/assets/img/productos/patas-pollo-producto-600.jpg'),
  ('oreja-cerdo',     '/oreja-de-cerdo/',   '/assets/img/productos/oreja-cerdo-producto-600.jpg'),
  ('femur-cerdo',     '/femur-de-cerdo/',   '/assets/img/productos/femur-cerdo-producto-600.jpg'),
  ('femur-res',       '/femur-de-res/',     '/assets/img/productos/femur-res-producto-600.jpg'),
  ('humero-cerdo',    '/humero-de-cerdo/',  '/assets/img/productos/humero-cerdo-producto-600.jpg'),
  ('humero-res',      '/humero-de-res/',    '/assets/img/productos/humero-res-empaque-fondo-blanco-600.jpg'),
  ('paleta-cerdo',    '/paleta-de-cerdo/',  '/assets/img/productos/paleta-cerdo-producto-600.jpg'),
  ('codorniz-entera', '/codorniz-entera/',  '/assets/img/productos/codorniz-entera-x2-producto-600.jpg')
) as x(id, ruta, imagen)
where p.id = x.id;

select id, nombre, ruta from public.productos order by orden;
