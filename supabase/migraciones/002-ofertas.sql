-- Revoltosos · 002 · Ofertas (una por landing) y producto en cada pedido
-- Pégalo completo en Supabase › SQL Editor › New query › Run.
-- Se puede correr más de una vez sin romper nada.

-- 1. Ofertas: cada landing vende una oferta con sus precios -------------------
create table if not exists public.ofertas (
  slug             text primary key,              -- lo que envía la landing: 'codornices-promo'
  nombre           text not null,                 -- cómo se ve en el panel
  producto_id      text not null,                 -- content_id para Meta
  producto_nombre  text not null,                 -- cómo se ve en el pedido y en WhatsApp
  ruta             text not null,                 -- dirección de la landing, p. ej. /cajita/
  precios          jsonb not null,                -- { "cantidad": precio }, p. ej. {"1": 20900, "2": 29900}
  prioritario      boolean not null default true, -- ¿ofrece envío prioritario +$5.000?
  oculta           boolean not null default false,-- true = no se enlaza desde ningún lado (pruebas A/B)
  activa           boolean not null default true, -- false = la landing deja de recibir pedidos
  orden            smallint not null default 0,
  creado_en        timestamptz not null default now()
);
alter table public.ofertas enable row level security;

-- Cualquiera puede leer las ofertas activas (son precios públicos); solo admins las cambian.
drop policy if exists "ofertas publicas" on public.ofertas;
create policy "ofertas publicas" on public.ofertas
  for select to anon, authenticated
  using (activa or public.es_admin());

drop policy if exists "admins editan ofertas" on public.ofertas;
create policy "admins editan ofertas" on public.ofertas
  for update to authenticated
  using (public.es_admin())
  with check (public.es_admin());

insert into public.ofertas (slug, nombre, producto_id, producto_nombre, ruta, precios, prioritario, oculta, orden) values
  ('codornices-promo',  'Codornices · Promo 2 frascos',   'codorniz-50g',  'Codornices deshidratadas 50 g', '/',                   '{"1": 20900, "2": 29900}', true, false, 1),
  ('codornices-unidad', 'Codornices · 1 frasco a $14.900', 'codorniz-50g',  'Codornices deshidratadas 50 g', '/codornices/unidad/', '{"1": 14900}',             true, true,  2),
  ('cajita-perros',     'Cajita para perros',              'cajita-perros', 'Cajita para perros',            '/cajita/',            '{"1": 72900}',             true, false, 3)
on conflict (slug) do update set
  nombre = excluded.nombre, producto_id = excluded.producto_id, producto_nombre = excluded.producto_nombre,
  ruta = excluded.ruta, precios = excluded.precios, prioritario = excluded.prioritario,
  oculta = excluded.oculta, orden = excluded.orden;

-- 2. Cada pedido guarda de qué oferta vino ------------------------------------
alter table public.pedidos add column if not exists oferta   text references public.ofertas (slug);
alter table public.pedidos add column if not exists producto text;

update public.pedidos
set oferta = 'codornices-promo', producto = 'Codornices deshidratadas 50 g'
where oferta is null;

create index if not exists pedidos_oferta_idx on public.pedidos (oferta);
