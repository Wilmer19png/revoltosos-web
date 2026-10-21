-- Revoltosos · migración 018: pago en línea con Wompi
--
-- El cliente elige entre pago contra entrega (como siempre) o pagar ya con Wompi
-- (tarjeta, PSE, Nequi, Bancolombia). El pedido se guarda igual en los dos casos;
-- los de Wompi quedan con pago_estado = 'pendiente' hasta que Wompi avisa a la
-- función wompi-eventos que el pago se aprobó.
--
--   pedidos.metodo_pago        → 'contraentrega' o 'wompi'
--   pedidos.pago_estado        → solo Wompi: pendiente, aprobado, rechazado, anulado, error
--   pedidos.wompi_referencia   → referencia del último intento de pago (order_id + sufijo)
--   pedidos.wompi_transaccion  → id de la transacción en Wompi
--   pedidos.wompi_medio        → CARD, PSE, NEQUI, BANCOLOMBIA_TRANSFER…
--   pedidos.pagado_en          → cuándo se aprobó el pago
--   pedidos.meta_datos         → cookies de Meta del navegador, para mandar el Purchase
--                                cuando se apruebe el pago (se borran apenas se envía)
--   ajustes.wompi_activo       → muestra u oculta la opción en la tienda
--   ajustes.comision_wompi     → % que cobra Wompi (antes de IVA)
--   ajustes.comision_wompi_fija → valor fijo por transacción que cobra Wompi (antes de IVA)

alter table public.pedidos add column if not exists metodo_pago       text not null default 'contraentrega';
alter table public.pedidos add column if not exists pago_estado       text;
alter table public.pedidos add column if not exists wompi_referencia  text;
alter table public.pedidos add column if not exists wompi_transaccion text;
alter table public.pedidos add column if not exists wompi_medio       text;
alter table public.pedidos add column if not exists pagado_en         timestamptz;
alter table public.pedidos add column if not exists meta_datos        jsonb;

alter table public.pedidos drop constraint if exists pedidos_metodo_pago_check;
alter table public.pedidos add constraint pedidos_metodo_pago_check check (metodo_pago in ('contraentrega', 'wompi'));
alter table public.pedidos drop constraint if exists pedidos_pago_estado_check;
alter table public.pedidos add constraint pedidos_pago_estado_check
  check (pago_estado is null or pago_estado in ('pendiente', 'aprobado', 'rechazado', 'anulado', 'error'));

create unique index if not exists pedidos_wompi_referencia_idx on public.pedidos (wompi_referencia) where wompi_referencia is not null;

alter table public.ajustes add column if not exists wompi_activo        boolean not null default false;
alter table public.ajustes add column if not exists comision_wompi      numeric(5,2) not null default 2.65 check (comision_wompi between 0 and 30);
alter table public.ajustes add column if not exists comision_wompi_fija integer not null default 700 check (comision_wompi_fija >= 0);

-- La tienda necesita saber si muestra la opción de Wompi.
grant select (wompi_activo) on public.ajustes to anon;

-- Avisos de compras recientes: un pedido de Wompi sin pagar no cuenta como compra.
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
        and (metodo_pago = 'contraentrega' or pago_estado = 'aprobado')
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
          and (p.metodo_pago = 'contraentrega' or p.pago_estado = 'aprobado')
        order by p.creado_en desc
        limit 12
      ) r
    ), '[]'::jsonb)
  );
$$;
revoke all on function public.compras_recientes() from public;
grant execute on function public.compras_recientes() to anon, authenticated;
