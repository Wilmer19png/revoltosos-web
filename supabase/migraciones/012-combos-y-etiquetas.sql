-- Revoltosos · 012 · Combos y etiquetas con fueguito
-- Correr DESPUÉS de 007–011. Pégalo completo en Supabase › SQL Editor › New query › Run.
-- Se puede correr más de una vez sin romper nada.
--
-- · productos.etiqueta: texto que sale con un fueguito sobre la foto ("El más vendido").
-- · variante_componentes: qué trae cada combo. Al despachar un combo, el inventario se
--   descuenta de cada producto que trae (no del combo).
-- · Tres combos nuevos con su landing.

-- 1. Etiqueta con fueguito --------------------------------------------------------------
alter table public.productos add column if not exists etiqueta text check (char_length(etiqueta) <= 30);
grant select (etiqueta) on public.productos to anon;

update public.productos set etiqueta = x.etiqueta
from (values ('cajita-perros', 'El más vendido'), ('codornices', 'Favorito'), ('femur-cerdo', 'Muy pedido')) as x(id, etiqueta)
where productos.id = x.id and productos.etiqueta is null;

-- 2. Qué trae cada combo -------------------------------------------------------------------
create table if not exists public.variante_componentes (
  combo_id       text not null references public.variantes (id) on update cascade on delete cascade,
  componente_id  text not null references public.variantes (id) on update cascade on delete cascade,
  cantidad       smallint not null default 1 check (cantidad between 1 and 50),
  primary key (combo_id, componente_id),
  check (combo_id <> componente_id)
);
alter table public.variante_componentes enable row level security;
drop policy if exists "admins gestionan componentes" on public.variante_componentes;
create policy "admins gestionan componentes" on public.variante_componentes for all to authenticated
  using (public.es_admin()) with check (public.es_admin());

-- El inventario de un pedido: un combo saca cada producto que trae; un tamaño normal,
-- de sí mismo (o del tamaño del que descuenta).
create or replace function public.mover_inventario_pedido(p_pedido public.pedidos, p_signo integer, p_motivo text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  it jsonb;
  v  record;
  c  record;
  n  integer;
begin
  if p_pedido.items is null then return; end if;
  for it in select * from jsonb_array_elements(p_pedido.items) loop
    n := (it ->> 'cantidad')::integer;
    if exists (select 1 from public.variante_componentes where combo_id = it ->> 'variante_id') then
      for c in select componente_id, cantidad from public.variante_componentes where combo_id = it ->> 'variante_id' loop
        insert into public.movimientos (variante_id, cantidad, motivo, pedido_id)
        values (c.componente_id, p_signo * n * c.cantidad, p_motivo || ' ' || p_pedido.order_id || ' (combo)', p_pedido.id);
      end loop;
      continue;
    end if;
    select id, descuenta_de, descuenta_cantidad into v from public.variantes where id = it ->> 'variante_id';
    if not found then continue; end if;
    insert into public.movimientos (variante_id, cantidad, motivo, pedido_id)
    values (
      coalesce(v.descuenta_de, v.id),
      p_signo * n * (case when v.descuenta_de is null then 1 else v.descuenta_cantidad end),
      p_motivo || ' ' || p_pedido.order_id,
      p_pedido.id
    );
  end loop;
end;
$$;
revoke all on function public.mover_inventario_pedido(public.pedidos, integer, text) from public, anon, authenticated;

-- 3. Los combos ----------------------------------------------------------------------------
insert into public.productos (id, nombre, categoria, descripcion, imagen, ruta, visible, orden) values
  ('combo-res-codornicitas',   'Combo Res + Codornicitas',   'Combos', '1 fémur de res, 1 húmero de res y 1 bolsa de codornicitas de 50 g.', '/assets/img/productos/combo-res-codornicitas-600.jpg', '/combo-res-codornicitas/',   true, 11),
  ('combo-cerdo',              'Combo Cerdo',                'Combos', '1 oreja, 1 fémur, 1 húmero y 1 paleta de cerdo.',                    '/assets/img/productos/combo-cerdo-600.jpg', '/combo-cerdo/',              true, 12),
  ('combo-codornicitas-patas', 'Combo Codornicitas + Patas', 'Combos', '1 bolsa de codornicitas de 50 g y 1 paquete de 30 patas de pollo.',   '/assets/img/productos/combo-codornicitas-patas-600.jpg', '/combo-codornicitas-patas/', true, 13)
on conflict (id) do nothing;

insert into public.variantes (id, producto_id, nombre, detalle, precio, orden) values
  ('combo-res-codornicitas',   'combo-res-codornicitas',   'Combo', 'Fémur + húmero de res + codornicitas 50 g', 50900, 1),
  ('combo-cerdo',              'combo-cerdo',              'Combo', 'Oreja + fémur + húmero + paleta',            42900, 1),
  ('combo-codornicitas-patas', 'combo-codornicitas-patas', 'Combo', 'Codornicitas 50 g + 30 patas de pollo',      42900, 1)
on conflict (id) do nothing;

insert into public.variante_componentes (combo_id, componente_id, cantidad) values
  ('combo-res-codornicitas',   'femur-res',            1),
  ('combo-res-codornicitas',   'humero-res',           1),
  ('combo-res-codornicitas',   'codornices-bolsa-50g', 1),
  ('combo-cerdo',              'oreja-cerdo',          1),
  ('combo-cerdo',              'femur-cerdo',          1),
  ('combo-cerdo',              'humero-cerdo',         1),
  ('combo-cerdo',              'paleta-cerdo',         1),
  ('combo-codornicitas-patas', 'codornices-bolsa-50g', 1),
  ('combo-codornicitas-patas', 'patas-pollo-30',       1)
on conflict (combo_id, componente_id) do update set cantidad = excluded.cantidad;

select p.nombre, v.precio,
       (select string_agg(c.cantidad || ' × ' || c.componente_id, ', ') from public.variante_componentes c where c.combo_id = v.id) as trae
from public.productos p join public.variantes v on v.producto_id = p.id
where p.categoria = 'Combos';
