-- Revoltosos · 025 · Contabilidad real, ventas y clics de WhatsApp, avisos al celular del admin (2026-11-17)
-- Correr DESPUÉS de 024. Pégalo completo en Supabase › SQL Editor › New query › Run.
-- Se puede correr más de una vez sin romper nada.
--
-- 1. ajustes.gastos_fijos: sueldos y gastos del mes que no dependen de cuántos pedidos salgan
--    (administración, marketing…). El gestor los resta de la ganancia para dar la utilidad real.
--    ajustes.pct_gastos: el % que tu Excel suma sobre el costo de producción (46,5 %), para ver
--    cada producto «con gastos incluidos» en la pestaña Productos.
-- 2. pedidos.canal: 'web' (tienda) o 'whatsapp' (venta que se anota a mano en el gestor).
--    Los admins ya pueden crear pedidos desde el gestor.
-- 3. clics_whatsapp: cada vez que alguien toca un botón de WhatsApp en la tienda.
--    La tienda solo puede sumar clics con la función registrar_clic_whatsapp; leerlos, solo admins.
-- 4. Avisos al celular del admin (notificaciones push del gestor): pedido nuevo, reseña nueva y
--    carrito sin terminar (20 minutos después, si no se convirtió en pedido). Los clientes nunca
--    los reciben: solo llegan a los celulares donde un admin tocó «Activar avisos» en el gestor.
--    Necesita las extensiones pg_net y pg_cron (se activan abajo) y la función avisar-admin.

-- 1. Gastos fijos --------------------------------------------------------------------------
alter table public.ajustes add column if not exists gastos_fijos jsonb not null
  default '[{"nombre":"Sueldo administración","valor":2000000},{"nombre":"Sueldo marketing","valor":2000000}]'::jsonb;
alter table public.ajustes add column if not exists pct_gastos numeric(5,2) not null default 46.5
  check (pct_gastos >= 0 and pct_gastos <= 300);

-- 2. Canal de venta y pedidos creados por el admin -----------------------------------------
alter table public.pedidos add column if not exists canal text not null default 'web';
alter table public.pedidos drop constraint if exists pedidos_canal_check;
alter table public.pedidos add constraint pedidos_canal_check check (canal in ('web', 'whatsapp', 'otro'));
-- Por WhatsApp también se vende con transferencia/Nequi (ya pagado) o en efectivo en persona.
alter table public.pedidos drop constraint if exists pedidos_metodo_pago_check;
alter table public.pedidos add constraint pedidos_metodo_pago_check check (metodo_pago in ('contraentrega', 'wompi', 'transferencia', 'efectivo'));
-- Las ventas por WhatsApp pueden no tener barrio o dirección exacta al anotarlas.
alter table public.pedidos alter column barrio drop not null;

drop policy if exists "admins crean pedidos" on public.pedidos;
create policy "admins crean pedidos" on public.pedidos for insert to authenticated with check (public.es_admin());
grant insert on public.pedidos to authenticated;

-- 3. Clics en WhatsApp -----------------------------------------------------------------------
create table if not exists public.clics_whatsapp (
  id            bigint generated always as identity primary key,
  creado_en     timestamptz not null default now(),
  lugar         text not null,          -- flotante, formulario, salida, error, gracias, pie…
  pagina        text,                   -- /codornices/, /, …
  visitante     text,                   -- el mismo código anónimo del navegador (rv-visitante)
  utm_source    text,
  utm_campaign  text,
  utm_content   text
);
create index if not exists clics_whatsapp_creado_idx on public.clics_whatsapp (creado_en desc);

alter table public.clics_whatsapp enable row level security;
drop policy if exists "admins leen clics" on public.clics_whatsapp;
create policy "admins leen clics" on public.clics_whatsapp for select to authenticated using (public.es_admin());
revoke all on public.clics_whatsapp from anon;
grant select on public.clics_whatsapp to authenticated;

create or replace function public.registrar_clic_whatsapp(
  p_lugar text, p_pagina text, p_visitante text, p_utm_source text, p_utm_campaign text, p_utm_content text
) returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_lugar is null or length(p_lugar) not between 2 and 30 then return; end if;
  -- El mismo visitante tocando el mismo botón varias veces en 2 minutos cuenta una vez.
  if p_visitante is not null and exists (
    select 1 from public.clics_whatsapp
    where visitante = p_visitante and lugar = p_lugar and creado_en > now() - interval '2 minutes'
  ) then return; end if;
  -- Freno contra abuso.
  if (select count(*) from public.clics_whatsapp where creado_en > now() - interval '1 hour') > 2000 then return; end if;
  insert into public.clics_whatsapp (lugar, pagina, visitante, utm_source, utm_campaign, utm_content)
  values (left(p_lugar, 30), left(p_pagina, 200), left(p_visitante, 64), left(p_utm_source, 120), left(p_utm_campaign, 200), left(p_utm_content, 120));
end;
$$;
revoke all on function public.registrar_clic_whatsapp(text, text, text, text, text, text) from public;
grant execute on function public.registrar_clic_whatsapp(text, text, text, text, text, text) to anon, authenticated;

-- 4. Avisos al celular del admin -------------------------------------------------------------
create table if not exists public.push_suscripciones (
  endpoint     text primary key,
  p256dh       text not null,
  auth         text not null,
  usuario      uuid default auth.uid(),
  dispositivo  text,
  creado_en    timestamptz not null default now()
);
alter table public.push_suscripciones enable row level security;
drop policy if exists "admins manejan suscripciones" on public.push_suscripciones;
create policy "admins manejan suscripciones" on public.push_suscripciones for all to authenticated
  using (public.es_admin()) with check (public.es_admin());
revoke all on public.push_suscripciones from anon;
grant select, insert, update, delete on public.push_suscripciones to authenticated;

-- Cada pedido, reseña o carrito se avisa una sola vez (la función anota aquí lo que ya avisó).
create table if not exists public.avisos_enviados (
  tipo       text not null,
  ref        text not null,
  creado_en  timestamptz not null default now(),
  primary key (tipo, ref)
);
alter table public.avisos_enviados enable row level security;
revoke all on public.avisos_enviados from anon, authenticated;

create extension if not exists pg_net with schema extensions;
create extension if not exists pg_cron;

-- Llama la función avisar-admin. Solo manda el tipo y el id: la función lee la fila con su
-- propia llave y avisa una sola vez por fila, así que nadie puede inventar avisos.
create or replace function public.avisar_admin(p_tipo text, p_id text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform net.http_post(
    url := 'https://jlvnrxmardcnarzspccs.supabase.co/functions/v1/avisar-admin',
    body := jsonb_build_object('tipo', p_tipo, 'id', p_id),
    headers := '{"Content-Type": "application/json"}'::jsonb,
    timeout_milliseconds := 5000
  );
exception when others then
  -- Un aviso que falla nunca debe impedir que se guarde un pedido.
  raise warning 'avisar_admin: %', sqlerrm;
end;
$$;
revoke all on function public.avisar_admin(text, text) from public, anon, authenticated;

create or replace function public.avisar_pedido_nuevo()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  -- Las ventas que anota el admin (WhatsApp) no se avisan: ya las conoce.
  if new.canal = 'web' then perform public.avisar_admin('pedido', new.id::text); end if;
  return new;
end;
$$;
drop trigger if exists pedidos_avisan_admin on public.pedidos;
create trigger pedidos_avisan_admin after insert on public.pedidos
  for each row execute function public.avisar_pedido_nuevo();

create or replace function public.avisar_resena_nueva()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  perform public.avisar_admin('resena', new.id::text);
  return new;
end;
$$;
drop trigger if exists resenas_avisan_admin on public.resenas;
create trigger resenas_avisan_admin after insert on public.resenas
  for each row execute function public.avisar_resena_nueva();

-- Carritos: se avisan 20 minutos después, solo si la persona no terminó el pedido.
create or replace function public.avisar_carritos_pendientes()
returns void language plpgsql security definer set search_path = '' as $$
declare c record;
begin
  for c in
    select k.sesion from public.carritos k
    where k.pedido_id is null and k.recuperado_en is null and not k.descartado
      and k.actualizado_en < now() - interval '20 minutes'
      and k.creado_en > now() - interval '1 day'
      and not exists (select 1 from public.avisos_enviados a where a.tipo = 'carrito' and a.ref = k.sesion)
    order by k.creado_en limit 20
  loop
    perform public.avisar_admin('carrito', c.sesion);
  end loop;
end;
$$;
revoke all on function public.avisar_carritos_pendientes() from public, anon, authenticated;

-- Los carritos que ya existían no se avisan.
insert into public.avisos_enviados (tipo, ref)
select 'carrito', sesion from public.carritos where creado_en < now() - interval '20 minutes'
on conflict do nothing;

do $$
begin
  perform cron.unschedule('avisar-carritos');
exception when others then null;
end $$;
select cron.schedule('avisar-carritos', '*/5 * * * *', 'select public.avisar_carritos_pendientes()');

-- Revisión
select (select gastos_fijos from public.ajustes where id = 1) as gastos_fijos,
       (select pct_gastos from public.ajustes where id = 1) as pct_gastos,
       (select count(*) from public.pedidos where canal = 'web') as pedidos_web,
       (select count(*) from cron.job where jobname = 'avisar-carritos') as cron_carritos;
