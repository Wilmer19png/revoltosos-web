-- Revoltosos · 009 · Pauta de Meta: gasto por anuncio y de qué anuncio viene cada pedido
-- Correr DESPUÉS de 007 y 008. Pégalo completo en Supabase › SQL Editor › New query › Run.
-- Se puede correr más de una vez sin romper nada.
--
-- La Edge Function "sincronizar-pauta" llena la tabla pauta_anuncios con lo que
-- reporta Meta (gasto, clics, compras) por anuncio y por día. Los pedidos guardan
-- utm_content = id del anuncio, así el gestor cruza gasto con pedidos ENTREGADOS.

create table if not exists public.pauta_anuncios (
  fecha               date not null,
  ad_id               text not null,
  ad_nombre           text,
  adset_id            text,
  adset_nombre        text,
  campana_id          text,
  campana_nombre      text,
  gasto               numeric(14, 2) not null default 0,
  moneda              text,
  impresiones         integer not null default 0,
  clics               integer not null default 0,
  compras_meta        integer not null default 0,   -- lo que reporta el Pixel / API de Conversiones
  valor_compras_meta  numeric(14, 2) not null default 0,
  actualizado_en      timestamptz not null default now(),
  primary key (fecha, ad_id)
);
create index if not exists pauta_anuncios_ad_idx on public.pauta_anuncios (ad_id);
alter table public.pauta_anuncios enable row level security;
drop policy if exists "admins leen pauta" on public.pauta_anuncios;
create policy "admins leen pauta" on public.pauta_anuncios for select to authenticated using (public.es_admin());
-- Solo la Edge Function (con la clave de servicio) escribe aquí.

-- De qué anuncio viene cada pedido (parámetros de URL del anuncio).
alter table public.pedidos add column if not exists utm_medium  text;
alter table public.pedidos add column if not exists utm_content text;   -- {{ad.id}}
alter table public.pedidos add column if not exists utm_term    text;   -- {{adset.name}}
create index if not exists pedidos_utm_content_idx on public.pedidos (utm_content) where utm_content is not null;

-- Estado de la última sincronización con Meta.
alter table public.ajustes add column if not exists meta_sincronizado_en timestamptz;
alter table public.ajustes add column if not exists meta_moneda          text;
alter table public.ajustes add column if not exists meta_error           text;

select 'Listo: pauta de Meta' as resultado;
