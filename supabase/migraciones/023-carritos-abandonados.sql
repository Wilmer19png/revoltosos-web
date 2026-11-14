-- Revoltosos · 023 · Carritos abandonados (2026-11-13)
-- Correr DESPUÉS de 022. Pégalo completo en Supabase › SQL Editor › New query › Run.
-- Se puede correr más de una vez sin romper nada.
--
-- · La tienda guarda el carrito cuando la persona escribe un celular válido Y marca
--   «Autorizo el tratamiento de mis datos» (Ley 1581). Sin la casilla no se guarda nada.
-- · Los visitantes no pueden leer esta tabla: solo escriben su propio carrito con la función
--   guardar_carrito (identificado por un código de sesión que genera su navegador).
-- · Cuando entra un pedido con ese mismo celular, el carrito se marca como recuperado solo
--   (trigger en pedidos), así que no hace falta volver a publicar crear-pedido.
-- · El gestor (pestaña Carritos) lee, marca los mensajes enviados y descarta.

create table if not exists public.carritos (
  sesion          text primary key,
  nombre          text,
  celular         text not null,
  departamento    text,
  ciudad          text,
  items           jsonb not null default '[]'::jsonb,   -- [{variante_id, nombre, cantidad, precio}]
  total           integer not null default 0,
  creado_en       timestamptz not null default now(),
  actualizado_en  timestamptz not null default now(),
  pedido_id       uuid references public.pedidos(id) on delete set null,
  recuperado_en   timestamptz,
  enviados        jsonb not null default '{}'::jsonb,   -- {"1h": fecha, "24h": fecha, "72h": fecha}
  descartado      boolean not null default false
);
create index if not exists carritos_celular_idx on public.carritos (celular);
create index if not exists carritos_actualizado_idx on public.carritos (actualizado_en desc);

alter table public.carritos enable row level security;

drop policy if exists "admins leen carritos" on public.carritos;
create policy "admins leen carritos" on public.carritos for select to authenticated using (public.es_admin());
drop policy if exists "admins editan carritos" on public.carritos;
create policy "admins editan carritos" on public.carritos for update to authenticated
  using (public.es_admin()) with check (public.es_admin());
drop policy if exists "admins borran carritos" on public.carritos;
create policy "admins borran carritos" on public.carritos for delete to authenticated using (public.es_admin());

revoke all on public.carritos from anon;
grant select, update, delete on public.carritos to authenticated;

-- La tienda llama esta función (no puede leer ni tocar carritos ajenos).
create or replace function public.guardar_carrito(
  p_sesion text, p_nombre text, p_celular text, p_departamento text, p_ciudad text,
  p_items jsonb, p_total integer
) returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_sesion is null or length(p_sesion) not between 16 and 64 then return; end if;
  if p_celular is null or p_celular !~ '^573[0-9]{9}$' then return; end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 or jsonb_array_length(p_items) > 30 then return; end if;
  -- Freno contra abuso: si llegan demasiados carritos en una hora, se ignoran los nuevos.
  if (select count(*) from public.carritos where creado_en > now() - interval '1 hour') > 500
     and not exists (select 1 from public.carritos where sesion = p_sesion) then return; end if;

  insert into public.carritos as c (sesion, nombre, celular, departamento, ciudad, items, total)
  values (p_sesion, left(trim(p_nombre), 120), p_celular, left(trim(p_departamento), 60), left(trim(p_ciudad), 80),
          p_items, greatest(0, least(coalesce(p_total, 0), 10000000)))
  on conflict (sesion) do update set
    nombre = excluded.nombre, celular = excluded.celular, departamento = excluded.departamento,
    ciudad = excluded.ciudad, items = excluded.items, total = excluded.total, actualizado_en = now()
  where c.pedido_id is null;
end;
$$;
revoke all on function public.guardar_carrito(text, text, text, text, text, jsonb, integer) from public;
grant execute on function public.guardar_carrito(text, text, text, text, text, jsonb, integer) to anon, authenticated;

-- Al entrar un pedido, los carritos abiertos de ese celular quedan recuperados.
create or replace function public.recuperar_carrito()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.carritos
  set pedido_id = new.id, recuperado_en = now()
  where celular = new.celular and pedido_id is null and actualizado_en > now() - interval '30 days';
  return new;
end;
$$;
drop trigger if exists pedidos_recuperan_carrito on public.pedidos;
create trigger pedidos_recuperan_carrito after insert on public.pedidos
  for each row execute function public.recuperar_carrito();

-- Revisión
select count(*) as carritos_guardados from public.carritos;
