-- Revoltosos · 007 · Tienda: catálogo, carrito, cupones, inventario y costos
-- Pégalo completo en Supabase › SQL Editor › New query › Run.
-- Se puede correr más de una vez sin romper nada (no borra lo que edites desde el gestor).
--
-- Qué agrega:
--   ajustes      → envío gratis desde, tarifa de envío, prioritario, costos internos y metas del mes
--   productos    → lo que se muestra en la tienda (se ocultan sin borrarse)
--   variantes    → los tamaños de cada producto con precio, precio antes, costo y stock
--   cupones      → códigos de descuento
--   movimientos  → historial del inventario (entradas, pedidos, devoluciones, ajustes)
--   pedidos      → ahora guarda varios productos (items), cupón, envío y costos

-- 1. Ajustes generales (una sola fila) ----------------------------------------
create table if not exists public.ajustes (
  id                    smallint primary key default 1 check (id = 1),
  envio_gratis_desde    integer not null default 70000 check (envio_gratis_desde >= 0),
  envio_base            integer not null default 12000 check (envio_base >= 0),   -- lo que paga el cliente si no llega al mínimo
  envio_departamentos   jsonb not null default '{}'::jsonb,                       -- {"Nariño": 15000} cambia la tarifa base
  prioritario           integer not null default 5000 check (prioritario >= 0),
  costo_envio_promedio  integer not null default 12000 check (costo_envio_promedio >= 0), -- lo que NOS cobra la transportadora si no se anota el real
  comision_recaudo      numeric(5,2) not null default 0 check (comision_recaudo between 0 and 30), -- % por recaudar contraentrega
  metas                 jsonb not null default '{}'::jsonb,                       -- {"2026-10": 1900000}
  actualizado_en        timestamptz not null default now()
);
insert into public.ajustes (id) values (1) on conflict do nothing;
alter table public.ajustes enable row level security;

drop policy if exists "ajustes publicos" on public.ajustes;
create policy "ajustes publicos" on public.ajustes for select to anon, authenticated using (true);
drop policy if exists "admins editan ajustes" on public.ajustes;
create policy "admins editan ajustes" on public.ajustes for update to authenticated
  using (public.es_admin()) with check (public.es_admin());

-- La tienda solo ve lo del envío; los costos internos y las metas no.
revoke select on public.ajustes from anon;
grant select (id, envio_gratis_desde, envio_base, envio_departamentos, prioritario) on public.ajustes to anon;

-- 2. Productos y tamaños -------------------------------------------------------
create table if not exists public.productos (
  id           text primary key check (id ~ '^[a-z0-9-]{2,60}$'),
  nombre       text not null check (char_length(nombre) between 2 and 80),
  categoria    text not null default 'Otros',
  descripcion  text check (char_length(descripcion) <= 400),
  imagen       text,                       -- ruta de la foto principal, p. ej. /assets/img/frasco-600.jpg
  ruta         text,                       -- landing propia (/codornices/). Vacía = /producto/?p=id
  visible      boolean not null default false,
  orden        smallint not null default 0,
  creado_en    timestamptz not null default now()
);

create table if not exists public.variantes (
  id                  text primary key check (id ~ '^[a-z0-9-]{2,80}$'),
  producto_id         text not null references public.productos (id) on update cascade on delete cascade,
  nombre              text not null check (char_length(nombre) between 1 and 60),
  detalle             text check (char_length(detalle) <= 120),
  precio              integer check (precio > 0),          -- lo que se cobra (precio de promoción si hay)
  precio_antes        integer check (precio_antes > 0),    -- precio normal, se muestra tachado
  costo               integer not null default 0 check (costo >= 0),
  stock               integer not null default 0,
  stock_minimo        integer not null default 5 check (stock_minimo >= 0),
  descuenta_de        text references public.variantes (id) on update cascade on delete set null, -- combos: "2 frascos" saca del frasco
  descuenta_cantidad  smallint not null default 1 check (descuenta_cantidad between 1 and 20),
  visible             boolean not null default true,
  orden               smallint not null default 0
);
create index if not exists variantes_producto_idx on public.variantes (producto_id, orden);

alter table public.productos enable row level security;
alter table public.variantes enable row level security;

drop policy if exists "productos publicos" on public.productos;
create policy "productos publicos" on public.productos for select to anon, authenticated
  using (visible or public.es_admin());
drop policy if exists "admins crean productos" on public.productos;
create policy "admins crean productos" on public.productos for insert to authenticated with check (public.es_admin());
drop policy if exists "admins editan productos" on public.productos;
create policy "admins editan productos" on public.productos for update to authenticated
  using (public.es_admin()) with check (public.es_admin());
drop policy if exists "admins borran productos" on public.productos;
create policy "admins borran productos" on public.productos for delete to authenticated using (public.es_admin());

drop policy if exists "variantes publicas" on public.variantes;
create policy "variantes publicas" on public.variantes for select to anon, authenticated
  using (
    public.es_admin() or (
      visible and precio is not null
      and exists (select 1 from public.productos p where p.id = producto_id and p.visible)
    )
  );
drop policy if exists "admins crean variantes" on public.variantes;
create policy "admins crean variantes" on public.variantes for insert to authenticated with check (public.es_admin());
drop policy if exists "admins editan variantes" on public.variantes;
create policy "admins editan variantes" on public.variantes for update to authenticated
  using (public.es_admin()) with check (public.es_admin());
drop policy if exists "admins borran variantes" on public.variantes;
create policy "admins borran variantes" on public.variantes for delete to authenticated using (public.es_admin());

-- La tienda no ve costos ni inventario.
revoke select on public.variantes from anon;
grant select (id, producto_id, nombre, detalle, precio, precio_antes, visible, orden) on public.variantes to anon;

-- 3. Cupones -------------------------------------------------------------------
create table if not exists public.cupones (
  codigo       text primary key check (codigo ~ '^[A-Z0-9-]{3,30}$'),
  tipo         text not null check (tipo in ('porcentaje', 'valor')),
  valor        integer not null check (valor > 0),
  minimo       integer not null default 0 check (minimo >= 0),     -- compra mínima en productos
  producto_id  text references public.productos (id) on update cascade on delete set null, -- vacío = toda la tienda
  vence        date,                                                -- último día válido (hora Colombia)
  usos_max     integer check (usos_max > 0),
  usos         integer not null default 0,
  activo       boolean not null default true,
  creado_en    timestamptz not null default now()
);
alter table public.cupones enable row level security;
drop policy if exists "admins gestionan cupones" on public.cupones;
create policy "admins gestionan cupones" on public.cupones for all to authenticated
  using (public.es_admin()) with check (public.es_admin());

-- Nadie puede listar los cupones desde la tienda; solo consultar uno que ya conoce.
create or replace function public.consultar_cupon(p_codigo text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object('codigo', c.codigo, 'tipo', c.tipo, 'valor', c.valor, 'minimo', c.minimo, 'producto_id', c.producto_id)
  from public.cupones c
  where c.codigo = upper(trim(p_codigo))
    and c.activo
    and (c.vence is null or c.vence >= (now() at time zone 'America/Bogota')::date)
    and (c.usos_max is null or c.usos < c.usos_max);
$$;
revoke all on function public.consultar_cupon(text) from public;
grant execute on function public.consultar_cupon(text) to anon, authenticated;

-- 4. Pedidos: varios productos, cupón, envío y costos ---------------------------
alter table public.pedidos add column if not exists items                 jsonb;      -- [{variante_id, producto_id, nombre, cantidad, precio, costo}]
alter table public.pedidos add column if not exists subtotal              integer;
alter table public.pedidos add column if not exists descuento             integer not null default 0;
alter table public.pedidos add column if not exists cupon                 text;
alter table public.pedidos add column if not exists envio_cobrado         integer not null default 0;
alter table public.pedidos add column if not exists costo_productos       integer;
alter table public.pedidos add column if not exists envio_real            integer;    -- lo que cobró la transportadora (se anota en el gestor)
alter table public.pedidos add column if not exists devolucion_costo      integer;    -- flete de vuelta si se devolvió
alter table public.pedidos add column if not exists guia                  text;
alter table public.pedidos add column if not exists transportadora        text;
alter table public.pedidos add column if not exists inventario_descontado boolean not null default false;
alter table public.pedidos add column if not exists estado_cambiado_en    timestamptz;
alter table public.pedidos add column if not exists entregado_en          timestamptz;

alter table public.pedidos drop constraint if exists pedidos_cantidad_check;
alter table public.pedidos add constraint pedidos_cantidad_check check (cantidad between 1 and 60);

alter table public.pedidos drop constraint if exists pedidos_estado_check;
alter table public.pedidos add constraint pedidos_estado_check
  check (estado in ('Nuevo', 'Confirmado', 'No confirmado', 'Despachado', 'En reparto', 'Entregado', 'Devuelto', 'Cancelado'));

-- Pedidos viejos (antes del carrito): sus ventas siguen contando.
update public.pedidos set subtotal = total where subtotal is null;
update public.pedidos set entregado_en = creado_en where estado = 'Entregado' and entregado_en is null;

-- 5. Inventario ----------------------------------------------------------------
create table if not exists public.movimientos (
  id              bigint generated always as identity primary key,
  creado_en       timestamptz not null default now(),
  variante_id     text not null references public.variantes (id) on update cascade on delete cascade,
  cantidad        integer not null check (cantidad <> 0),   -- + entra, − sale
  motivo          text not null check (char_length(motivo) between 2 and 160),
  pedido_id       uuid references public.pedidos (id) on delete set null,
  costo_unitario  integer check (costo_unitario >= 0)
);
create index if not exists movimientos_variante_idx on public.movimientos (variante_id, creado_en desc);
create index if not exists movimientos_creado_idx on public.movimientos (creado_en desc);
alter table public.movimientos enable row level security;
drop policy if exists "admins leen movimientos" on public.movimientos;
create policy "admins leen movimientos" on public.movimientos for select to authenticated using (public.es_admin());
drop policy if exists "admins registran movimientos" on public.movimientos;
create policy "admins registran movimientos" on public.movimientos for insert to authenticated with check (public.es_admin());

-- Cada movimiento actualiza el stock de su tamaño.
create or replace function public.aplicar_movimiento()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.variantes set stock = stock + new.cantidad where id = new.variante_id;
  return new;
end;
$$;
drop trigger if exists movimientos_stock on public.movimientos;
create trigger movimientos_stock after insert on public.movimientos
  for each row execute function public.aplicar_movimiento();

-- Mueve el inventario de todos los productos de un pedido (signo −1 sale, +1 vuelve).
create or replace function public.mover_inventario_pedido(p_pedido public.pedidos, p_signo integer, p_motivo text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  it jsonb;
  v  record;
begin
  if p_pedido.items is null then return; end if;
  for it in select * from jsonb_array_elements(p_pedido.items) loop
    select id, descuenta_de, descuenta_cantidad into v from public.variantes where id = it ->> 'variante_id';
    if not found then continue; end if;
    insert into public.movimientos (variante_id, cantidad, motivo, pedido_id)
    values (
      coalesce(v.descuenta_de, v.id),
      p_signo * (it ->> 'cantidad')::integer * (case when v.descuenta_de is null then 1 else v.descuenta_cantidad end),
      p_motivo || ' ' || p_pedido.order_id,
      p_pedido.id
    );
  end loop;
end;
$$;

-- Al cambiar el estado de un pedido:
--   Despachado / En reparto / Entregado → sale del inventario (una sola vez)
--   Cancelado / No confirmado / Devuelto → si ya había salido, vuelve a bodega
create or replace function public.pedido_cambia_estado()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.estado is distinct from old.estado then
    new.estado_cambiado_en := now();
    if new.estado = 'Entregado' and new.entregado_en is null then
      new.entregado_en := now();
    elsif new.estado <> 'Entregado' then
      new.entregado_en := null;
    end if;

    if new.estado in ('Despachado', 'En reparto', 'Entregado') and not old.inventario_descontado then
      perform public.mover_inventario_pedido(new, -1, 'Pedido');
      new.inventario_descontado := true;
    elsif new.estado in ('Cancelado', 'No confirmado', 'Devuelto', 'Nuevo', 'Confirmado') and old.inventario_descontado then
      perform public.mover_inventario_pedido(new, 1, case when new.estado = 'Devuelto' then 'Devolución' else 'Vuelve a bodega' end);
      new.inventario_descontado := false;
    end if;
  end if;
  return new;
end;
$$;
drop trigger if exists pedidos_estado on public.pedidos;
create trigger pedidos_estado before update on public.pedidos
  for each row execute function public.pedido_cambia_estado();

-- Estas funciones solo las usan los triggers.
revoke all on function public.aplicar_movimiento() from public, anon, authenticated;
revoke all on function public.mover_inventario_pedido(public.pedidos, integer, text) from public, anon, authenticated;
revoke all on function public.pedido_cambia_estado() from public, anon, authenticated;

-- 6. Compras recientes para los avisos de la tienda -----------------------------
-- Solo primer nombre, ciudad y producto de pedidos reales de los últimos 7 días.
create or replace function public.compras_recientes()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'hoy', (
      select count(*) from public.pedidos
      where (creado_en at time zone 'America/Bogota')::date = (now() at time zone 'America/Bogota')::date
        and estado not in ('Cancelado', 'No confirmado')
    ),
    'recientes', coalesce((
      select jsonb_agg(r) from (
        select initcap(lower(split_part(trim(p.nombre), ' ', 1))) as nombre,
               p.ciudad,
               coalesce(p.items -> 0 ->> 'nombre', p.producto, 'Codornices') as producto,
               p.creado_en
        from public.pedidos p
        where p.creado_en > now() - interval '7 days'
          and p.estado not in ('Cancelado', 'No confirmado')
        order by p.creado_en desc
        limit 12
      ) r
    ), '[]'::jsonb)
  );
$$;
revoke all on function public.compras_recientes() from public;
grant execute on function public.compras_recientes() to anon, authenticated;

-- 7. Catálogo inicial (no pisa lo que ya edites en el gestor) -------------------
insert into public.productos (id, nombre, categoria, descripcion, imagen, ruta, visible, orden) values
  ('codornices',      'Codornices deshidratadas', 'Codorniz',       'Codorniz entera, deshidratada lentamente. Un solo ingrediente.',                          '/assets/img/frasco-600.jpg',                                   '/codornices/', true,  1),
  ('cajita-perros',   'Cajita para perros',       'Cajitas',        'Patas de pollo, oreja de cerdo, codornicitas, codorniz entera y fémur de cerdo.',          '/assets/img/productos/cajita-producto-fondo-blanco-600.jpg',   '/cajita/',     true,  2),
  ('patas-pollo',     'Patas de pollo',           'Masticables',    'Crocantes y fáciles de masticar.',                                                          '/assets/img/productos/patas-pollo-producto-600.jpg',           null,           false, 3),
  ('oreja-cerdo',     'Oreja de cerdo',           'Masticables',    'Para masticar un buen rato.',                                                               '/assets/img/productos/oreja-cerdo-producto-600.jpg',           null,           false, 4),
  ('femur-cerdo',     'Fémur de cerdo',           'Huesos y fémur', 'Para perros medianos y grandes.',                                                           '/assets/img/productos/femur-cerdo-producto.jpg',               null,           false, 5),
  ('femur-res',       'Fémur de res',             'Huesos y fémur', 'Para perros medianos y grandes.',                                                           '/assets/img/productos/femur-res-producto.jpg',                 null,           false, 6),
  ('humero-cerdo',    'Húmero de cerdo',          'Huesos y fémur', 'Para perros medianos y grandes.',                                                           '/assets/img/productos/humero-cerdo-producto.jpg',              null,           false, 7),
  ('paleta-cerdo',    'Paleta de cerdo',          'Huesos y fémur', 'Para perros medianos y grandes.',                                                           '/assets/img/productos/paleta-cerdo-producto.jpg',              null,           false, 8),
  ('codorniz-entera', 'Codorniz entera × 2',      'Codorniz',       'Dos codornices enteras deshidratadas.',                                                     '/assets/img/productos/codorniz-entera-x2-producto-600.jpg',    null,           false, 9)
on conflict (id) do nothing;

insert into public.variantes (id, producto_id, nombre, detalle, precio, precio_antes, orden) values
  ('codornices-bolsa-50g',   'codornices',      'Bolsa 50 g',         'Para probar',           null,  null,  1),
  ('codornices-frasco-100g', 'codornices',      'Frasco 100 g',       null,                    14900, null,  2),
  ('codornices-2-frascos',   'codornices',      '2 frascos de 100 g', 'Rinde el doble',        26900, 29800, 3),
  ('cajita-perros',          'cajita-perros',   'Cajita · 5 snacks',  '5 snacks distintos',    72900, null,  1),
  ('patas-pollo',            'patas-pollo',     'Unidad',             null,                    null,  null,  1),
  ('oreja-cerdo',            'oreja-cerdo',     'Unidad',             null,                    null,  null,  1),
  ('femur-cerdo',            'femur-cerdo',     'Unidad',             null,                    null,  null,  1),
  ('femur-res',              'femur-res',       'Unidad',             null,                    null,  null,  1),
  ('humero-cerdo',           'humero-cerdo',    'Unidad',             null,                    null,  null,  1),
  ('paleta-cerdo',           'paleta-cerdo',    'Unidad',             null,                    null,  null,  1),
  ('codorniz-entera',        'codorniz-entera', '2 codornices',       null,                    null,  null,  1)
on conflict (id) do nothing;

-- "2 frascos" descuenta 2 frascos de 100 g del inventario.
update public.variantes set descuenta_de = 'codornices-frasco-100g', descuenta_cantidad = 2
where id = 'codornices-2-frascos' and descuenta_de is null;

select 'Listo: tienda creada' as resultado;
