-- Revoltosos · 005 · Un pedido por conexión (IP) cada 72 horas
-- Pégalo completo en Supabase › SQL Editor › New query › Run.
-- Se puede correr más de una vez sin romper nada.
--
-- No se guarda la IP tal cual: solo su huella (SHA-256), que sirve para comparar
-- pero no para saber cuál era la IP.

alter table public.pedidos add column if not exists ip_hash text;

create index if not exists pedidos_ip_hash_idx on public.pedidos (ip_hash, creado_en desc)
  where ip_hash is not null;
