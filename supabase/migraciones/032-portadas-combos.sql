-- Revoltosos · 032 · Portada de cada combo con lo que de verdad trae (2026-11-21)
-- Pégalo completo en Supabase › SQL Editor › New query › Run. Se puede correr más de una vez.
--
-- Los 10 combos de noviembre tenían fotos provisionales (p. ej. el Masticador Grande mostraba
-- codornicitas y dos fémures empacados). Ahora cada uno usa una portada armada con los recortes
-- reales de sus snacks y su cantidad (herramientas/portadas/componer.js). Es la foto de la tarjeta
-- del catálogo, del carrito y de los mensajes; las landings ya la usan.

update public.productos p set imagen = '/assets/img/productos/' || p.id || '-portada-600.jpg'
where p.id in (
  'combo-cerdito-crujiente', 'combo-masticador-grande', 'combo-despensa-crujiente', 'combo-favoritos-revoltosos',
  'combo-cerdo-patitas', 'combo-doble-paleta', 'combo-res-crujiente', 'combo-patitas-compartir',
  'combo-despensa-familiar', 'combo-duo-masticador');

-- Si un tamaño del combo tiene su propia foto, también pasa a la portada.
update public.variantes v set imagen = '/assets/img/productos/' || v.producto_id || '-portada-600.jpg'
where v.producto_id in (
  'combo-cerdito-crujiente', 'combo-masticador-grande', 'combo-despensa-crujiente', 'combo-favoritos-revoltosos',
  'combo-cerdo-patitas', 'combo-doble-paleta', 'combo-res-crujiente', 'combo-patitas-compartir',
  'combo-despensa-familiar', 'combo-duo-masticador')
  and v.imagen is not null;

-- Revisión
select p.nombre, p.imagen from public.productos p where p.categoria = 'Combos' and p.visible order by p.orden;
