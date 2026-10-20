-- Revoltosos · 017 · Subir fotos de productos desde el gestor (2026-10-19)
-- Correr DESPUÉS de 016. Pégalo en Supabase › SQL Editor › New query › Run. Se puede correr más de una vez.
--
-- · Bucket público «productos»: ahí quedan las fotos que se suben desde el gestor (máx. 5 MB, solo imágenes).
--   Cualquiera puede VERLAS (salen en la tienda); solo los administradores pueden subir, cambiar o borrar.
-- · productos.fotos: fotos extra de cada producto; salen como miniaturas en su landing.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('productos', 'productos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "admins suben fotos de productos" on storage.objects;
create policy "admins suben fotos de productos" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'productos' and public.es_admin());

drop policy if exists "admins cambian fotos de productos" on storage.objects;
create policy "admins cambian fotos de productos" on storage.objects
  for update to authenticated
  using (bucket_id = 'productos' and public.es_admin())
  with check (bucket_id = 'productos' and public.es_admin());

drop policy if exists "admins borran fotos de productos" on storage.objects;
create policy "admins borran fotos de productos" on storage.objects
  for delete to authenticated
  using (bucket_id = 'productos' and public.es_admin());

alter table public.productos add column if not exists fotos text[] not null default '{}';
grant select (fotos) on public.productos to anon;

select id, public, file_size_limit from storage.buckets where id = 'productos';
