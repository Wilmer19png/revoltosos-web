// Revoltosos · Edge Function "crear-pedido"
//
// Recibe el formulario de la landing, valida los datos, calcula el total en el
// servidor, guarda el pedido en la tabla `pedidos` y envía el evento Purchase a
// la API de Conversiones de Meta con el mismo event_id del Pixel (deduplicación).
//
// Secrets que usa (Supabase › Edge Functions › Secrets):
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY  → Supabase los pone solos
//   META_PIXEL_ID, META_ACCESS_TOKEN         → opcionales; sin ellos no se envía a Meta
//   META_TEST_EVENT_CODE                     → opcional, solo para pruebas
//   META_API_VERSION                         → opcional (por defecto v23.0)
//   ALLOWED_ORIGIN                           → opcional, p. ej. https://revoltosos.com

import { createClient } from 'npm:@supabase/supabase-js@2';

// Los precios de cada landing viven en la tabla `ofertas` (supabase/migraciones/002-ofertas.sql).
const PRIORITARIO = 5000;
const OFERTA_POR_DEFECTO = 'codornices-promo';
// Una misma conexión (IP) solo puede hacer un pedido cada 72 horas (migración 005).
const HORAS_ENTRE_PEDIDOS = 72;

const DEPARTAMENTOS = new Set([
  'Amazonas', 'Antioquia', 'Arauca', 'Atlántico', 'Bogotá D.C.', 'Bolívar', 'Boyacá', 'Caldas', 'Caquetá',
  'Casanare', 'Cauca', 'Cesar', 'Chocó', 'Córdoba', 'Cundinamarca', 'Guainía', 'Guaviare', 'Huila', 'La Guajira',
  'Magdalena', 'Meta', 'Nariño', 'Norte de Santander', 'Putumayo', 'Quindío', 'Risaralda',
  'San Andrés y Providencia', 'Santander', 'Sucre', 'Tolima', 'Valle del Cauca', 'Vaupés', 'Vichada',
]);
const MASCOTAS = new Set(['Perro pequeño', 'Perro mediano', 'Perro grande', 'Gato']);

const origen = Deno.env.get('ALLOWED_ORIGIN') ?? '*';
const CORS = {
  'Access-Control-Allow-Origin': origen,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Vary': 'Origin',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

const texto = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

async function sha256(valor: string): Promise<string> {
  const datos = new TextEncoder().encode(valor.trim().toLowerCase());
  const hash = await crypto.subtle.digest('SHA-256', datos);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Quita tildes y espacios, como pide Meta para ct/st/fn/ln
const normalizar = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');

function generarOrderId(): string {
  const ahora = new Date(Date.now() - 5 * 3600 * 1000); // hora de Colombia
  const fecha = ahora.toISOString().slice(0, 10).replace(/-/g, '');
  const n = crypto.getRandomValues(new Uint32Array(1))[0] % 10000;
  return `REV-${fecha}-${String(n).padStart(4, '0')}`;
}

async function enviarAMeta(pedido: Record<string, unknown>, extra: { fbp: string; fbc: string; ua: string; ip: string; url: string }) {
  const pixel = Deno.env.get('META_PIXEL_ID')?.trim();
  const token = Deno.env.get('META_ACCESS_TOKEN')?.trim();
  if (!pixel || !token) {
    console.warn(`Meta CAPI omitido: falta ${!pixel ? 'META_PIXEL_ID' : ''} ${!token ? 'META_ACCESS_TOKEN' : ''}`.trim());
    return;
  }

  const version = Deno.env.get('META_API_VERSION') ?? 'v23.0';
  const [nombre, ...apellidos] = String(pedido.nombre).split(/\s+/);

  const user_data: Record<string, unknown> = {
    ph: [await sha256(String(pedido.celular))],
    fn: [await sha256(normalizar(nombre ?? ''))],
    ln: [await sha256(normalizar(apellidos.join('')))],
    ct: [await sha256(normalizar(String(pedido.ciudad)))],
    st: [await sha256(normalizar(String(pedido.departamento)))],
    country: [await sha256('co')],
    external_id: [await sha256(String(pedido.order_id))],
    client_user_agent: extra.ua,
  };
  if (extra.ip) user_data.client_ip_address = extra.ip;
  if (extra.fbp) user_data.fbp = extra.fbp;
  if (extra.fbc) user_data.fbc = extra.fbc;

  const cuerpo: Record<string, unknown> = {
    data: [{
      event_name: 'Purchase',
      event_time: Math.floor(Date.now() / 1000),
      event_id: pedido.event_id,
      action_source: 'website',
      event_source_url: extra.url,
      user_data,
      custom_data: {
        value: pedido.total,
        currency: 'COP',
        content_ids: [pedido.producto_id],
        content_type: 'product',
        num_items: pedido.cantidad,
        order_id: pedido.order_id,
      },
    }],
  };
  const prueba = Deno.env.get('META_TEST_EVENT_CODE')?.trim();
  if (prueba) cuerpo.test_event_code = prueba;

  const res = await fetch(`https://graph.facebook.com/${version}/${pixel}/events?access_token=${encodeURIComponent(token)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cuerpo),
  });
  const respuesta = await res.text();
  if (!res.ok) console.error('Meta CAPI error', res.status, respuesta);
  else console.log(`Meta CAPI ok ${pedido.order_id} (pixel ${pixel}${prueba ? ', prueba ' + prueba : ''}): ${respuesta}`);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ ok: false, error: 'Método no permitido' }, 405);

  let b: Record<string, unknown>;
  try {
    b = await req.json();
  } catch {
    return json({ ok: false, error: 'Datos inválidos' }, 400);
  }

  // Trampa para bots: si el campo oculto viene lleno, se responde "ok" sin guardar.
  if (texto(b.empresa, 100)) return json({ ok: true, order_id: generarOrderId(), total: 0 });

  const eventId = texto(b.event_id, 64);
  const nombre = texto(b.nombre, 120);
  const celular = texto(b.celular, 12);
  const direccion = texto(b.direccion, 200);
  const barrio = texto(b.barrio, 120);
  const ciudad = texto(b.ciudad, 80);
  const departamento = texto(b.departamento, 40);
  const indicaciones = texto(b.indicaciones, 300);
  const cantidad = Number(b.cantidad);
  const prioritario = b.prioritario === true;
  const paraQuien = Array.isArray(b.para_quien) ? b.para_quien.filter((m) => MASCOTAS.has(String(m))).map(String) : [];

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false },
  });

  // La oferta define el precio: lo que diga el navegador sobre precios se ignora.
  const slug = texto(b.oferta, 60) || OFERTA_POR_DEFECTO;
  const { data: oferta } = await supabase
    .from('ofertas')
    .select('slug, producto_id, producto_nombre, precios, prioritario, activa')
    .eq('slug', slug)
    .maybeSingle();
  const precio = oferta?.activa ? Number((oferta.precios as Record<string, number>)[String(cantidad)]) : NaN;

  const errores: string[] = [];
  if (!oferta || !oferta.activa) errores.push('oferta');
  if (!/^[0-9a-f-]{16,64}$/i.test(eventId)) errores.push('event_id');
  if (nombre.length < 3) errores.push('nombre');
  if (!/^573\d{9}$/.test(celular)) errores.push('celular');
  if (direccion.length < 4) errores.push('direccion');
  if (barrio.length < 2) errores.push('barrio');
  if (ciudad.length < 2) errores.push('ciudad');
  if (!DEPARTAMENTOS.has(departamento)) errores.push('departamento');
  if (!(precio > 0)) errores.push('cantidad');
  if (errores.length) return json({ ok: false, error: 'Revisa: ' + errores.join(', ') }, 422);

  const conPrioritario = prioritario && oferta!.prioritario;
  const total = precio + (conPrioritario ? PRIORITARIO : 0);

  // Idempotencia: si el mismo event_id ya llegó (doble clic o reintento), se devuelve ese pedido.
  const { data: existente } = await supabase.from('pedidos').select('order_id, total').eq('event_id', eventId).maybeSingle();
  if (existente) return json({ ok: true, order_id: existente.order_id, total: existente.total });

  const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim();
  const ipHash = ip ? await sha256(ip) : null;
  if (ipHash) {
    const desde = new Date(Date.now() - HORAS_ENTRE_PEDIDOS * 3600 * 1000).toISOString();
    const { count } = await supabase
      .from('pedidos')
      .select('id', { count: 'exact', head: true })
      .eq('ip_hash', ipHash)
      .gte('creado_en', desde);
    if (count) {
      return json({ ok: false, error: 'Ya hay un pedido reciente desde esta conexión' }, 429);
    }
  }

  const fila = {
    ip_hash: ipHash,
    event_id: eventId,
    nombre, celular, direccion, barrio, ciudad, departamento,
    indicaciones: indicaciones || null,
    cantidad, prioritario: conPrioritario, total,
    oferta: oferta!.slug,
    producto: oferta!.producto_nombre,
    para_quien: paraQuien,
    utm_source: texto(b.utm_source, 120) || null,
    utm_campaign: texto(b.utm_campaign, 200) || null,
    fbclid: texto(b.fbclid, 500) || null,
  };

  let orderId = '';
  for (let intento = 0; intento < 4 && !orderId; intento++) {
    const candidato = generarOrderId();
    const { error } = await supabase.from('pedidos').insert({ ...fila, order_id: candidato });
    if (!error) orderId = candidato;
    else if (error.code === '23505' && String(error.message).includes('event_id')) {
      const { data } = await supabase.from('pedidos').select('order_id, total').eq('event_id', eventId).single();
      return json({ ok: true, order_id: data?.order_id, total: data?.total });
    } else if (error.code !== '23505') {
      console.error('insert', error);
      return json({ ok: false, error: 'No pudimos guardar el pedido' }, 500);
    }
  }
  if (!orderId) return json({ ok: false, error: 'No pudimos generar el número de pedido' }, 500);

  const extra = {
    fbp: texto(b.fbp, 200),
    fbc: texto(b.fbc, 600),
    ua: req.headers.get('user-agent') ?? '',
    ip,
    url: texto(b.event_source_url, 500),
  };
  // Meta no debe frenar la respuesta al cliente si tarda o falla.
  const meta = enviarAMeta({ ...fila, order_id: orderId, producto_id: oferta!.producto_id }, extra).catch((e) => console.error('Meta', e));
  // @ts-ignore EdgeRuntime existe en Supabase
  if (typeof EdgeRuntime !== 'undefined') EdgeRuntime.waitUntil(meta); else await meta;

  return json({ ok: true, order_id: orderId, total, producto: oferta!.producto_nombre });
});
