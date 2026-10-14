-- Revoltosos · 003 · Nuevos precios de codornices (2026-10-14)
-- 1 frasco de 50 g: $14.900 · Promo 2 frascos: $26.900
-- Pégalo en Supabase › SQL Editor › New query › Run.

update public.ofertas
set precios = '{"1": 14900, "2": 26900}',
    nombre  = 'Codornices · 1 × $14.900 o 2 × $26.900'
where slug = 'codornices-promo';

update public.ofertas
set nombre = 'Codornices · Solo 1 frasco a $14.900'
where slug = 'codornices-unidad';

select slug, nombre, precios from public.ofertas order by orden;
