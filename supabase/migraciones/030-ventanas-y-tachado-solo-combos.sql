-- Revoltosos · 030 · Ventanas del catálogo, tachado solo en combos y Cajita como combo (2026-11-20)
-- Correr DESPUÉS de 029. Pégalo completo en Supabase › SQL Editor › New query › Run.
-- Se puede correr más de una vez sin romper nada.
--
-- · Categorías = ventanas de la tienda: Combos · Huesos de res · Huesos de cerdo · Codorniz ·
--   Patas de pollo. (La tienda muestra además la ventana «Todos».)
-- · La Cajita para perros pasa a Combos y queda en $95.900.
-- · Precio tachado (25 %) SOLO en los combos. Los snacks sueltos se muestran sin tachado.
--   Se recalcula solo al cambiar un precio o la categoría de un producto.
-- · La tienda puede leer qué trae cada combo (variante_componentes): así cada combo muestra
--   «Trae» con la foto de cada snack. No es información privada.

-- 1. Categorías -------------------------------------------------------------------------------
update public.productos p set categoria = x.categoria
from (values
  ('cajita-perros',   'Combos'),
  ('femur-res',       'Huesos de res'),
  ('humero-res',      'Huesos de res'),
  ('paleta-res',      'Huesos de res'),
  ('femur-cerdo',     'Huesos de cerdo'),
  ('humero-cerdo',    'Huesos de cerdo'),
  ('paleta-cerdo',    'Huesos de cerdo'),
  ('oreja-cerdo',     'Huesos de cerdo'),
  ('oido-cerdo',      'Huesos de cerdo'),
  ('codornices',      'Codorniz'),
  ('codorniz-entera', 'Codorniz'),
  ('mix-visceras',    'Codorniz'),
  ('patas-pollo',     'Patas de pollo')
) as x(id, categoria)
where p.id = x.id;

-- La Cajita va con los combos (al final de ellos).
update public.productos set orden = 11 where id = 'cajita-perros';

-- 2. Tachado del 25 % solo en combos ----------------------------------------------------------
create or replace function public.tachado_25()
returns trigger
language plpgsql
set search_path = public
as $$
declare es_combo boolean;
begin
  select coalesce(p.categoria = 'Combos', false) into es_combo from public.productos p where p.id = new.producto_id;
  if coalesce(es_combo, false) and new.precio is not null and new.precio > 0 then
    new.precio_antes := (ceil(new.precio / 0.75 / 100.0) * 100)::integer;
  else
    new.precio_antes := null;
  end if;
  return new;
end;
$$;

drop trigger if exists variantes_tachado_25 on public.variantes;
create trigger variantes_tachado_25
  before insert or update on public.variantes
  for each row execute function public.tachado_25();

-- Si en el gestor se cambia la categoría de un producto, se recalcula el tachado de sus tamaños.
create or replace function public.recalcular_tachado_producto()
returns trigger language plpgsql set search_path = public as $$
begin
  if new.categoria is distinct from old.categoria then
    update public.variantes set precio = precio where producto_id = new.id;
  end if;
  return new;
end;
$$;
drop trigger if exists productos_recalculan_tachado on public.productos;
create trigger productos_recalculan_tachado after update of categoria on public.productos
  for each row execute function public.recalcular_tachado_producto();

-- 3. Cajita para perros: $95.900 ---------------------------------------------------------------
update public.variantes set precio = 95900 where id = 'cajita-perros';

-- Recalcular el tachado de todo.
update public.variantes set precio = precio where precio is not null;

-- 4. Qué trae cada combo: lectura pública ------------------------------------------------------
grant select on public.variante_componentes to anon, authenticated;
drop policy if exists "componentes publicos" on public.variante_componentes;
create policy "componentes publicos" on public.variante_componentes for select to anon, authenticated using (true);

-- Revisión
select p.categoria, p.nombre, v.nombre as tamano, v.precio, v.precio_antes
from public.variantes v join public.productos p on p.id = v.producto_id
where p.visible and v.visible and v.precio > 0
order by p.categoria, p.orden, v.orden;
