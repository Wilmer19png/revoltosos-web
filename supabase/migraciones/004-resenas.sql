-- Revoltosos · 004 · Reseñas reales de clientes (/opina → panel → landing)
-- Pégalo completo en Supabase › SQL Editor › New query › Run.
-- Se puede correr más de una vez sin romper nada.

-- 1. Tabla de reseñas ----------------------------------------------------------
create table if not exists public.resenas (
  id          uuid primary key default gen_random_uuid(),
  creado_en   timestamptz not null default now(),
  nombre      text not null check (char_length(nombre) between 2 and 60),
  ciudad      text not null check (char_length(ciudad) between 2 and 60),
  mascota     text check (char_length(mascota) <= 40),
  producto    text not null check (producto in ('Codornices', 'Cajita para perros', 'Otro snack')),
  estrellas   smallint not null check (estrellas between 1 and 5),
  texto       text not null check (char_length(texto) between 5 and 600),
  foto_path   text check (foto_path ~ '^[0-9a-f-]{36}\.(jpg|jpeg|png|webp)$'),
  autoriza    boolean not null check (autoriza),          -- sin autorización no se guarda
  estado      text not null default 'Pendiente' check (estado in ('Pendiente', 'Publicada', 'Oculta'))
);
create index if not exists resenas_estado_idx on public.resenas (estado, creado_en desc);
alter table public.resenas enable row level security;

-- Cualquiera puede ENVIAR una reseña, pero siempre entra como Pendiente.
drop policy if exists "clientes envian resenas" on public.resenas;
create policy "clientes envian resenas" on public.resenas
  for insert to anon, authenticated
  with check (estado = 'Pendiente' and autoriza);

-- La landing solo puede LEER las publicadas.
drop policy if exists "landing lee publicadas" on public.resenas;
create policy "landing lee publicadas" on public.resenas
  for select to anon, authenticated
  using (estado = 'Publicada' or public.es_admin());

-- Solo admins aprueban u ocultan.
drop policy if exists "admins moderan resenas" on public.resenas;
create policy "admins moderan resenas" on public.resenas
  for update to authenticated
  using (public.es_admin())
  with check (public.es_admin());

drop policy if exists "admins borran resenas" on public.resenas;
create policy "admins borran resenas" on public.resenas
  for delete to authenticated
  using (public.es_admin());

-- 2. Fotos de las mascotas (Storage) ---------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('resenas', 'resenas', true, 8388608, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Cualquiera puede SUBIR una foto (máx. 8 MB, solo imágenes); nadie puede reemplazar ni borrar
-- fotos ajenas. Las fotos se ven por su link público.
drop policy if exists "clientes suben fotos de resenas" on storage.objects;
create policy "clientes suben fotos de resenas" on storage.objects
  for insert to anon, authenticated
  with check (bucket_id = 'resenas');

drop policy if exists "admins borran fotos de resenas" on storage.objects;
create policy "admins borran fotos de resenas" on storage.objects
  for delete to authenticated
  using (bucket_id = 'resenas' and public.es_admin());
