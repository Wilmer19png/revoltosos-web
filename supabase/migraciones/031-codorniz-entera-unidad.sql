-- Revoltosos · 031 · Codorniz entera: la unidad a $12.900 y el nombre sin «× 2» (2026-11-20)
-- Pégalo completo en Supabase › SQL Editor › New query › Run. Se puede correr más de una vez.
--
-- · 1 unidad (50 g): $12.900 (antes quedó en $13.900 en la 027).
-- · 2 unidades (100 g): sigue en $20.900.
-- · El producto se llamaba «Codorniz entera × 2»; como ahora se vende por 1 o por 2, la tarjeta
--   mostraba «× 2 desde $13.900» y confundía. Queda «Codorniz entera».

update public.variantes set precio = 12900 where id = 'codorniz-entera-1';
update public.variantes set precio = 20900 where id = 'codorniz-entera';
update public.productos set nombre = 'Codorniz entera' where id = 'codorniz-entera';

-- Revisión
select p.nombre, v.nombre as tamano, v.detalle, v.precio, v.precio_antes
from public.variantes v join public.productos p on p.id = v.producto_id
where v.producto_id = 'codorniz-entera'
order by v.orden;
