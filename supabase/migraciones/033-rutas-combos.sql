-- Revoltosos · 033 · Cada combo abre su landing completa (2026-11-21)
-- Pégalo completo en Supabase › SQL Editor › New query › Run. Se puede correr más de una vez.
--
-- Los 10 combos de noviembre (027) entraron sin «ruta», así que desde el catálogo abrían la página
-- genérica /producto/?p=… (sin «Qué trae el combo», sin reseñas, sin preguntas). Sus landings ya
-- existen en /<id>/: con esto el catálogo, el buscador y el carrito llevan a ellas.

update public.productos set ruta = '/' || id || '/'
where id in (
  'combo-cerdito-crujiente', 'combo-masticador-grande', 'combo-despensa-crujiente', 'combo-favoritos-revoltosos',
  'combo-cerdo-patitas', 'combo-doble-paleta', 'combo-res-crujiente', 'combo-patitas-compartir',
  'combo-despensa-familiar', 'combo-duo-masticador')
  and ruta is null;

-- Revisión: ningún producto visible debe quedar sin ruta.
select id, nombre, ruta from public.productos where visible order by (ruta is null) desc, orden;
