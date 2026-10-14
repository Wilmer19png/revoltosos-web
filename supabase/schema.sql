-- Revoltosos · esquema de pedidos
-- Pégalo completo en Supabase › SQL Editor › New query › Run.
-- Se puede correr más de una vez sin romper nada.

-- 1. Quién puede entrar al panel -------------------------------------------
create table if not exists public.admins (
  email text primary key
);
alter table public.admins enable row level security;
-- Sin políticas: nadie la lee ni la cambia desde la web; solo desde este editor.

insert into public.admins (email)
values ('mariajosecastano81@gmail.com')
on conflict do nothing;

create or replace function public.es_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admins
    where email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- 2. Pedidos ------------------------------------------------------------------
create table if not exists public.pedidos (
  id            uuid primary key default gen_random_uuid(),
  order_id      text not null unique,                 -- REV-20261013-4821
  event_id      text not null unique,                 -- mismo id del Pixel y de Conversions API
  creado_en     timestamptz not null default now(),
  nombre        text not null check (char_length(nombre) between 3 and 120),
  celular       text not null check (celular ~ '^573[0-9]{9}$'),
  direccion     text not null check (char_length(direccion) between 4 and 200),
  barrio        text not null check (char_length(barrio) between 2 and 120),
  ciudad        text not null check (char_length(ciudad) between 2 and 80),
  departamento  text not null check (char_length(departamento) between 4 and 40),
  indicaciones  text check (char_length(indicaciones) <= 300),
  cantidad      smallint not null check (cantidad between 1 and 10),
  prioritario   boolean not null default false,
  total         integer not null check (total > 0),
  para_quien    text[] not null default '{}',
  estado        text not null default 'Nuevo'
                check (estado in ('Nuevo','Confirmado','Despachado','Entregado','Devuelto','Cancelado')),
  notas         text,
  utm_source    text,
  utm_campaign  text,
  fbclid        text
);

create index if not exists pedidos_creado_en_idx on public.pedidos (creado_en desc);
create index if not exists pedidos_estado_idx on public.pedidos (estado);

alter table public.pedidos enable row level security;

-- Solo los correos de la tabla admins pueden ver y actualizar pedidos.
drop policy if exists "admins leen pedidos" on public.pedidos;
create policy "admins leen pedidos" on public.pedidos
  for select to authenticated
  using (public.es_admin());

drop policy if exists "admins actualizan pedidos" on public.pedidos;
create policy "admins actualizan pedidos" on public.pedidos
  for update to authenticated
  using (public.es_admin())
  with check (public.es_admin());

-- No hay política de INSERT para visitantes a propósito: la landing crea los
-- pedidos a través de la Edge Function "crear-pedido". Esa función valida los
-- datos, calcula el precio en el servidor (para que nadie lo cambie desde el
-- navegador), guarda el pedido y envía el evento Purchase a Meta.
