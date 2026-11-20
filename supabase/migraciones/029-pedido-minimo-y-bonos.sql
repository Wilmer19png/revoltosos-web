-- Revoltosos · 029 · Pedido mínimo, nuevas metas y bonos por pagar con Wompi (2026-11-20)
-- Correr DESPUÉS de 026, 027 y 028, y ANTES de publicar la tienda nueva y las funciones
-- crear-pedido, wompi-eventos y avisar-admin.
-- Pégalo completo en Supabase › SQL Editor › New query › Run. Se puede correr más de una vez.
--
-- · Todo pedido es desde $50.000 en productos (antes de cupón y bono).
-- · Envío gratis desde $120.000 y regalo (bolsa de codornices 50 g) desde $150.000.
-- · Cada pedido pagado con Wompi gana un bono de $10.000 para el próximo pedido. Queda
--   amarrado al celular del cliente, dura 30 días y se aplica solo en la tienda.
--   El mínimo, el envío gratis y el regalo se cuentan ANTES del bono.
-- · Si un pedido que usó un bono se cancela, el bono vuelve a quedar disponible.
-- · Cada mañana (9 a. m.) llega un aviso al celular del admin si hay bonos que vencen en
--   7 días o menos.

-- 1. Ajustes ---------------------------------------------------------------------------------
alter table public.ajustes add column if not exists pedido_minimo integer not null default 0 check (pedido_minimo >= 0);
alter table public.ajustes add column if not exists bono_wompi    integer not null default 0 check (bono_wompi >= 0);
alter table public.ajustes add column if not exists bono_dias     integer not null default 30 check (bono_dias between 1 and 365);

update public.ajustes
set pedido_minimo = 50000,
    envio_gratis_desde = 120000,
    regalo_desde = 150000,
    regalo_variante = coalesce(regalo_variante, 'codornices-bolsa-50g'),
    bono_wompi = 10000,
    bono_dias = 30
where id = 1;

grant select (pedido_minimo, bono_wompi, bono_dias) on public.ajustes to anon;

-- 2. Bonos -----------------------------------------------------------------------------------
create table if not exists public.bonos (
  id             bigint generated always as identity primary key,
  celular        text not null check (celular ~ '^573[0-9]{9}$'),
  nombre         text,
  monto          integer not null check (monto > 0),
  pedido_origen  text not null unique,          -- order_id del pedido pagado con Wompi
  creado_en      timestamptz not null default now(),
  vence          date not null,                 -- último día en que se puede usar
  usado_pedido   text,                          -- order_id donde se usó
  usado_en       timestamptz,
  recordado_7    timestamptz,                   -- recordatorio cuando faltaban 7 días
  recordado_2    timestamptz                    -- último aviso cuando faltaban 2 días
);
create index if not exists bonos_celular on public.bonos (celular);
create index if not exists bonos_vence on public.bonos (vence) where usado_pedido is null;

alter table public.bonos enable row level security;
revoke all on public.bonos from anon;
drop policy if exists "admins manejan bonos" on public.bonos;
create policy "admins manejan bonos" on public.bonos for all to authenticated
  using (public.es_admin()) with check (public.es_admin());

alter table public.pedidos add column if not exists bono_id bigint references public.bonos (id) on delete set null;
alter table public.pedidos add column if not exists bono_descuento integer not null default 0 check (bono_descuento >= 0);

-- 3. ¿Este celular tiene un bono? (la tienda lo pregunta al escribir el celular) ---------------
-- Devuelve solo el valor y la fecha del bono que vence primero; nada del pedido ni del cliente.
create or replace function public.bono_disponible(p_celular text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object('monto', b.monto, 'vence', b.vence)
  from public.bonos b
  where b.celular = p_celular
    and b.usado_pedido is null
    and b.vence >= (now() at time zone 'America/Bogota')::date
  order by b.vence, b.id
  limit 1;
$$;
revoke all on function public.bono_disponible(text) from public;
grant execute on function public.bono_disponible(text) to anon, authenticated;

-- 4. Pedido cancelado → el bono que usó vuelve a quedar disponible ----------------------------
create or replace function public.devolver_bono()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.bono_id is not null and new.estado = 'Cancelado' and old.estado is distinct from 'Cancelado' then
    update public.bonos set usado_pedido = null, usado_en = null
    where id = new.bono_id and usado_pedido = new.order_id;
  end if;
  return new;
end;
$$;
drop trigger if exists pedidos_devuelven_bono on public.pedidos;
create trigger pedidos_devuelven_bono after update of estado on public.pedidos
  for each row execute function public.devolver_bono();

-- 5. Aviso diario al admin: bonos que vencen en 7 días o menos --------------------------------
create or replace function public.avisar_bonos_por_vencer()
returns void language plpgsql security definer set search_path = '' as $$
declare hoy date := (now() at time zone 'America/Bogota')::date;
begin
  if exists (
    select 1 from public.bonos
    where usado_pedido is null and vence between hoy and hoy + 7
  ) then
    perform public.avisar_admin('bonos', to_char(hoy, 'YYYY-MM-DD'));
  end if;
end;
$$;
revoke all on function public.avisar_bonos_por_vencer() from public, anon, authenticated;

do $$
begin
  perform cron.unschedule('avisar-bonos');
exception when others then null;
end $$;
-- 14:00 UTC = 9:00 a. m. en Colombia.
select cron.schedule('avisar-bonos', '0 14 * * *', 'select public.avisar_bonos_por_vencer()');

-- Revisión
select pedido_minimo, envio_gratis_desde, regalo_desde, regalo_variante, bono_wompi, bono_dias
from public.ajustes where id = 1;
select (select count(*) from cron.job where jobname = 'avisar-bonos') as cron_bonos;
