-- Revoltosos · 034 · Portadas de combos tipo bodegón con nombre nuevo (2026-11-21)
-- Pégalo completo en Supabase › SQL Editor › New query › Run. Se puede correr más de una vez.
--
-- Las portadas en fondo blanco reemplazaron a las anteriores con el mismo nombre (-portada), y el
-- celular guarda las imágenes una semana: quien ya las había visto seguía viendo las viejas.
-- Ahora se llaman <combo>-bodegon-600.jpg, así todos bajan la nueva.

update public.productos set imagen = replace(imagen, '-portada-600.jpg', '-bodegon-600.jpg')
where categoria = 'Combos' and imagen like '%-portada-600.jpg';

update public.variantes set imagen = replace(imagen, '-portada-600.jpg', '-bodegon-600.jpg')
where imagen like '%-portada-600.jpg';

-- Revisión
select id, imagen from public.productos where categoria = 'Combos' and visible order by orden;
