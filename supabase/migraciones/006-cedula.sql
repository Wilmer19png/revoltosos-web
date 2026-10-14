-- Revoltosos · 006 · Cédula del cliente (la pide la transportadora)
-- Pégalo completo en Supabase › SQL Editor › New query › Run.
-- Se puede correr más de una vez sin romper nada.
--
-- Queda opcional en la tabla para que los pedidos viejos (sin cédula) sigan siendo válidos;
-- la Edge Function crear-pedido la exige en los pedidos nuevos.

alter table public.pedidos add column if not exists cedula text;

alter table public.pedidos drop constraint if exists pedidos_cedula_check;
alter table public.pedidos add constraint pedidos_cedula_check check (cedula ~ '^[0-9]{6,10}$');
