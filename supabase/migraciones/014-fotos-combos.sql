-- Revoltosos · 014 · Fotos reales del Combo Cerdo y del Combo Codornicitas + Patas
-- Pégalo en Supabase › SQL Editor › New query › Run. Se puede correr más de una vez.

update public.productos set imagen = '/assets/img/productos/combo-cerdo-foto-600.jpg'              where id = 'combo-cerdo';
update public.productos set imagen = '/assets/img/productos/combo-codornicitas-patas-foto-600.jpg' where id = 'combo-codornicitas-patas';

select id, imagen from public.productos where categoria = 'Combos' order by orden;
