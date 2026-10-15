-- Revoltosos · 013 · Fotos reales: bolsa de 50 g, frasco de 100 g y Combo Res + Codornicitas
-- Pégalo en Supabase › SQL Editor › New query › Run. Se puede correr más de una vez.

update public.variantes set imagen = '/assets/img/productos/codornices-bolsa-50g-600.jpg'   where id = 'codornices-bolsa-50g';
update public.variantes set imagen = '/assets/img/productos/codornices-frasco-100g-600.jpg' where id = 'codornices-frasco-100g';

update public.productos set imagen = '/assets/img/productos/codornices-frasco-100g-600.jpg'      where id = 'codornices';
update public.productos set imagen = '/assets/img/productos/combo-res-codornicitas-foto-600.jpg' where id = 'combo-res-codornicitas';

select p.id, p.imagen as foto_producto, v.id as tamano, v.imagen as foto_tamano
from public.productos p left join public.variantes v on v.producto_id = p.id
where p.id in ('codornices', 'combo-res-codornicitas');
