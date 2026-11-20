-- Revoltosos · 026 · Precio tachado = 25 % de descuento en todo (2026-11-20)
-- Correr DESPUÉS de 025. Pégalo completo en Supabase › SQL Editor › New query › Run.
-- Se puede correr más de una vez sin romper nada.
--
-- · El precio tachado (precio_antes) es el precio de venta / 0,75, redondeado HACIA ARRIBA a la
--   centena. Así el descuento que se muestra nunca es menor al 25 % (ej.: $20.900 → $27.900).
-- · Quita las excepciones de la 022 (fémur de res al 35 %, Cajita $102.000, húmero de cerdo $10.000).
-- · Desde ahora se recalcula solo cada vez que se crea un tamaño o se cambia su precio
--   (también los combos con sus precios nuevos). Lo que se escriba a mano en «Precio antes»
--   en el gestor se reemplaza por el cálculo.

create or replace function public.tachado_25()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.precio is not null and new.precio > 0 then
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

-- Recalcular todo lo que ya existe (el trigger hace el cálculo).
update public.variantes set precio = precio where precio is not null;

-- Revisión: todos deben salir con 25 %.
select p.nombre, v.nombre as tamano, v.precio, v.precio_antes,
       round(100 - 100.0 * v.precio / v.precio_antes, 1) as descuento_pct
from public.variantes v
join public.productos p on p.id = v.producto_id
where v.precio > 0
order by p.orden, v.orden;
