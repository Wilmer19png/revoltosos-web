// Revoltosos · Edge Function "crear-pedido"
//
// Recibe el carrito y los datos de envío de la tienda, valida todo, calcula en el
// servidor precios, cupón y envío (tablas `variantes`, `cupones` y `ajustes`,
// migración 007), guarda el pedido en `pedidos` y envía el evento Purchase a la
// API de Conversiones de Meta con el mismo event_id del Pixel (deduplicación).
//
// Pago con Wompi (migración 018): si el cliente elige pagar en línea, el pedido se
// guarda con pago_estado = 'pendiente' y se devuelve la firma de integridad para
// abrir el checkout de Wompi. El Purchase a Meta lo manda wompi-eventos cuando el
// pago se aprueba. Si el cliente vuelve a enviar el mismo pedido (pago rechazado,
// cerró la ventana, cambió el carrito o se pasó a contra entrega), se actualiza ese
// mismo pedido mientras no esté pagado.
//
// Lo que diga el navegador sobre precios se ignora: solo se usan los ids de los
// tamaños y las cantidades.
//
// Secrets que usa (Supabase › Edge Functions › Secrets):
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY  → Supabase los pone solos
//   META_PIXEL_ID, META_ACCESS_TOKEN         → opcionales; sin ellos no se envía a Meta
//   META_TEST_EVENT_CODE                     → opcional, solo para pruebas
//   META_API_VERSION                         → opcional (por defecto v23.0)
//   ALLOWED_ORIGIN                           → opcional, p. ej. https://revoltosos.com
//   WOMPI_PUBLIC_KEY, WOMPI_INTEGRITY_SECRET → para pagar con Wompi (pub_test_… / test_integrity_… en pruebas)

import { createClient } from 'npm:@supabase/supabase-js@2';

// Una misma conexión (IP) solo puede hacer un pedido cada 72 horas (migración 005).
const HORAS_ENTRE_PEDIDOS = 72;
const MAX_POR_PRODUCTO = 20;
const MAX_UNIDADES = 60;

// Páginas viejas que aún manden el formato anterior (oferta + cantidad).
const OFERTAS_VIEJAS: Record<string, Record<string, string>> = {
  'codornices-promo': { '1': 'codornices-frasco-100g' },
  'codornices-unidad': { '1': 'codornices-frasco-100g' },
  'cajita-perros': { '1': 'cajita-perros' },
};

const DEPARTAMENTOS = new Set([
  'Amazonas', 'Antioquia', 'Arauca', 'Atlántico', 'Bogotá D.C.', 'Bolívar', 'Boyacá', 'Caldas', 'Caquetá',
  'Casanare', 'Cauca', 'Cesar', 'Chocó', 'Córdoba', 'Cundinamarca', 'Guainía', 'Guaviare', 'Huila', 'La Guajira',
  'Magdalena', 'Meta', 'Nariño', 'Norte de Santander', 'Putumayo', 'Quindío', 'Risaralda',
  'San Andrés y Providencia', 'Santander', 'Sucre', 'Tolima', 'Valle del Cauca', 'Vaupés', 'Vichada',
]);
const MASCOTAS = new Set(['Perro pequeño', 'Perro mediano', 'Perro grande', 'Gato']);

type Variante = {
  id: string; producto_id: string; nombre: string; precio: number | null; costo: number; visible: boolean;
  envio_gratis?: boolean;
  productos: { nombre: string; visible: boolean } | null;
};
type Cupon = {
  codigo: string; tipo: 'porcentaje' | 'valor'; valor: number; minimo: number; producto_id: string | null;
  vence: string | null; usos_max: number | null; usos: number; activo: boolean;
};
type Item = { variante_id: string; producto_id: string; nombre: string; cantidad: number; precio: number; costo: number };

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
const redondear100 = (n: number) => Math.round(n / 100) * 100;
const hoyColombia = () => new Date(Date.now() - 5 * 3600 * 1000).toISOString().slice(0, 10);

// Mismo cálculo que assets/js/tienda.js (descuentoCupon).
function descuentoCupon(c: Cupon, items: Item[], subtotal: number): number {
  if (subtotal < c.minimo) return 0;
  const base = c.producto_id
    ? items.filter((i) => i.producto_id === c.producto_id).reduce((s, i) => s + i.precio * i.cantidad, 0)
    : subtotal;
  if (!base) return 0;
  return Math.min(base, c.tipo === 'porcentaje' ? redondear100((base * Math.min(c.valor, 100)) / 100) : c.valor);
}

async function sha256Exacto(valor: string): Promise<string> {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(valor));
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, '0')).join('');
}
const sha256 = (valor: string) => sha256Exacto(valor.trim().toLowerCase());

// La llave pública viaja al navegador: si alguien pega otra (p. ej. la privada prv_…), no se usa.
const wompiListo = () => {
  const publica = Deno.env.get('WOMPI_PUBLIC_KEY')?.trim() ?? '';
  if (publica && !/^pub_(test|prod)_/.test(publica)) console.error('WOMPI_PUBLIC_KEY no es una llave pública (debe empezar por pub_test_ o pub_prod_)');
  return /^pub_(test|prod)_/.test(publica) && !!Deno.env.get('WOMPI_INTEGRITY_SECRET')?.trim();
};

// Datos para abrir el checkout de Wompi. Cada intento lleva su propia referencia
// (Wompi no deja repetirla): order_id + 4 letras. La firma es
// SHA256(referencia + monto en centavos + moneda + secreto de integridad).
async function checkoutWompi(orderId: string, total: number) {
  const referencia = `${orderId}-${crypto.randomUUID().slice(0, 4)}`;
  const centavos = total * 100;
  const firma = await sha256Exacto(`${referencia}${centavos}COP${Deno.env.get('WOMPI_INTEGRITY_SECRET')!.trim()}`);
  return {
    referencia,
    datos: {
      public_key: Deno.env.get('WOMPI_PUBLIC_KEY')!.trim(),
      currency: 'COP',
      amount_in_cents: centavos,
      reference: referencia,
      signature: firma,
    },
  };
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
  const items = pedido.items as Item[];

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
        content_ids: items.map((i) => i.variante_id),
        contents: items.map((i) => ({ id: i.variante_id, quantity: i.cantidad, item_price: i.precio })),
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

// Lee el carrito del navegador: [{ variante_id, cantidad }] (o el formato viejo oferta + cantidad).
function leerCarrito(b: Record<string, unknown>): Map<string, number> {
  const carrito = new Map<string, number>();
  const sumar = (id: string, n: number) => {
    if (!/^[a-z0-9-]{2,80}$/.test(id) || !Number.isInteger(n) || n < 1) return;
    carrito.set(id, Math.min(MAX_POR_PRODUCTO, (carrito.get(id) ?? 0) + n));
  };
  if (Array.isArray(b.items)) {
    for (const it of b.items.slice(0, 30)) {
      if (it && typeof it === 'object') sumar(texto((it as Record<string, unknown>).variante_id, 80), Number((it as Record<string, unknown>).cantidad));
    }
  } else if (typeof b.oferta === 'string') {
    const id = OFERTAS_VIEJAS[b.oferta]?.[String(b.cantidad)];
    if (id) sumar(id, 1);
  }
  return carrito;
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
  const cedula = texto(b.cedula, 20).replace(/\D/g, '');
  const celular = texto(b.celular, 12);
  const direccion = texto(b.direccion, 200);
  const barrio = texto(b.barrio, 120);
  const ciudad = texto(b.ciudad, 80);
  const departamento = texto(b.departamento, 40);
  const indicaciones = texto(b.indicaciones, 300);
  const prioritario = b.prioritario === true;
  const conWompi = b.metodo_pago === 'wompi';
  const codigoCupon = texto(b.cupon, 30).toUpperCase();
  const paraQuien = Array.isArray(b.para_quien) ? b.para_quien.filter((m) => MASCOTAS.has(String(m))).map(String) : [];

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false },
  });

  // Precios, costos y ajustes salen de la base de datos.
  const carrito = leerCarrito(b);
  const ids = Array.from(carrito.keys());
  const [{ data: variantes }, { data: ajustes }] = await Promise.all([
    ids.length
      ? supabase.from('variantes').select('*, productos(nombre, visible)').in('id', ids)
      : Promise.resolve({ data: [] as Variante[] }),
    supabase.from('ajustes').select('*').eq('id', 1).maybeSingle(),
  ]);

  const items: Item[] = [];
  let conEnvioGratis = false;
  for (const v of (variantes ?? []) as unknown as Variante[]) {
    if (!v.visible || !v.precio || !v.productos?.visible) continue;
    if (v.envio_gratis) conEnvioGratis = true;
    items.push({
      variante_id: v.id,
      producto_id: v.producto_id,
      nombre: `${v.productos.nombre} · ${v.nombre}`,
      cantidad: carrito.get(v.id)!,
      precio: v.precio,
      costo: v.costo ?? 0,
    });
  }
  const unidades = items.reduce((s, i) => s + i.cantidad, 0);

  const errores: string[] = [];
  if (!items.length || items.length !== ids.length) errores.push('productos');
  if (unidades > MAX_UNIDADES) errores.push('cantidad');
  if (!ajustes) errores.push('ajustes');
  if (!/^[0-9a-f-]{16,64}$/i.test(eventId)) errores.push('event_id');
  if (nombre.length < 3) errores.push('nombre');
  if (!/^\d{6,10}$/.test(cedula)) errores.push('cedula');
  if (!/^573\d{9}$/.test(celular)) errores.push('celular');
  if (direccion.length < 4) errores.push('direccion');
  if (barrio.length < 2) errores.push('barrio');
  if (ciudad.length < 2) errores.push('ciudad');
  if (!DEPARTAMENTOS.has(departamento)) errores.push('departamento');
  if (errores.length) return json({ ok: false, error: 'Revisa: ' + errores.join(', ') }, 422);
  if (conWompi && (!wompiListo() || !ajustes!.wompi_activo)) {
    return json({ ok: false, error: 'El pago en línea no está disponible ahora', campo: 'metodo_pago' }, 503);
  }

  const subtotal = items.reduce((s, i) => s + i.precio * i.cantidad, 0);
  const costoProductos = items.reduce((s, i) => s + i.costo * i.cantidad, 0);

  // Cupón: si no sirve se avisa, para que el cliente no pague algo distinto a lo que vio.
  let descuento = 0;
  let cupon: Cupon | null = null;
  if (codigoCupon) {
    const { data } = await supabase.from('cupones').select('*').eq('codigo', codigoCupon).maybeSingle();
    cupon = data as Cupon | null;
    const vigente = cupon && cupon.activo
      && (!cupon.vence || cupon.vence >= hoyColombia())
      && (cupon.usos_max == null || cupon.usos < cupon.usos_max);
    descuento = vigente ? descuentoCupon(cupon!, items, subtotal) : 0;
    if (!descuento) return json({ ok: false, error: 'El cupón ya no es válido para este pedido', campo: 'cupon' }, 422);
  }

  // Envío: gratis si lleva un tamaño con envío gratis (combos) o desde el mínimo (en productos, ya con
  // descuento); si no, la tarifa de la ciudad, la del departamento o la normal (mismo orden que
  // tarifaEnvio en assets/js/tienda.js).
  const a = ajustes!;
  const porCiudad = ((a.envio_ciudades ?? {}) as Record<string, number>)[departamento + '|' + ciudad];
  const porDepartamento = ((a.envio_departamentos ?? {}) as Record<string, number>)[departamento];
  const productosNeto = subtotal - descuento;
  const envio = conEnvioGratis || productosNeto >= a.envio_gratis_desde ? 0 : Number(porCiudad ?? porDepartamento ?? a.envio_base);
  const valorPrioritario = prioritario ? a.prioritario : 0;
  const total = productosNeto + envio + valorPrioritario;

  const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim();
  const extra = {
    fbp: texto(b.fbp, 200),
    fbc: texto(b.fbc, 600),
    ua: req.headers.get('user-agent') ?? '',
    ip,
    url: texto(b.event_source_url, 500),
  };

  // Idempotencia: si el mismo event_id ya llegó (doble clic o reintento), se devuelve ese pedido.
  // Excepción: un pedido de Wompi sin pagar se reabre y se actualiza con lo que llega ahora.
  const { data: existente } = await supabase.from('pedidos').select('*').eq('event_id', eventId).maybeSingle();
  const reabierto = !!existente && existente.metodo_pago === 'wompi' && existente.pago_estado !== 'aprobado';
  if (existente && !reabierto) {
    return json({ ok: true, order_id: existente.order_id, total: existente.total, pagado: existente.pago_estado === 'aprobado' });
  }

  const ipHash = ip ? await sha256(ip) : null;
  if (ipHash && !reabierto) {
    // Un pedido de Wompi que nunca se pagó no cuenta para el límite.
    const desde = new Date(Date.now() - HORAS_ENTRE_PEDIDOS * 3600 * 1000).toISOString();
    const recientes = () => supabase.from('pedidos').select('id', { count: 'exact', head: true }).eq('ip_hash', ipHash).gte('creado_en', desde);
    let { count, error } = await recientes().or('metodo_pago.eq.contraentrega,pago_estado.eq.aprobado');
    if (error) ({ count } = await recientes()); // migración 018 sin correr
    if (count) {
      return json({ ok: false, error: 'Ya hay un pedido reciente desde esta conexión' }, 429);
    }
  }

  const resumen = items.map((i) => `${i.cantidad} × ${i.nombre}`).join(' + ');
  const fila = {
    ip_hash: ipHash,
    event_id: eventId,
    nombre, cedula, celular, direccion, barrio, ciudad, departamento,
    indicaciones: indicaciones || null,
    cantidad: unidades,
    prioritario: prioritario,
    items,
    subtotal,
    descuento,
    cupon: descuento ? cupon!.codigo : null,
    envio_cobrado: envio,
    costo_productos: costoProductos,
    total,
    producto: resumen.slice(0, 300),
    para_quien: paraQuien,
    utm_source: texto(b.utm_source, 120) || null,
    utm_medium: texto(b.utm_medium, 120) || null,
    utm_campaign: texto(b.utm_campaign, 200) || null,
    utm_content: texto(b.utm_content, 120) || null,
    utm_term: texto(b.utm_term, 200) || null,
    fbclid: texto(b.fbclid, 500) || null,
  };
  // Con Wompi se guardan las cookies de Meta para mandar el Purchase cuando se apruebe el pago.
  const pago = conWompi
    ? { metodo_pago: 'wompi', pago_estado: 'pendiente', meta_datos: extra }
    : reabierto ? { metodo_pago: 'contraentrega', pago_estado: null, wompi_referencia: null, meta_datos: null } : {};

  let orderId = '';
  if (reabierto) {
    const { error } = await supabase.from('pedidos').update({ ...fila, ...pago }).eq('id', existente.id);
    if (error) {
      console.error('update reabierto', error);
      return json({ ok: false, error: 'No pudimos guardar el pedido' }, 500);
    }
    orderId = existente.order_id;
  }
  let filaFinal: Record<string, unknown> = fila;
  for (let intento = 0; intento < 5 && !orderId; intento++) {
    const candidato = generarOrderId();
    const { error } = await supabase.from('pedidos').insert({ ...filaFinal, ...pago, order_id: candidato });
    if (!error) orderId = candidato;
    else if (error.code === 'PGRST204') {
      // Falta una columna (migración 009 sin correr): se guarda el pedido sin los datos del anuncio.
      console.warn('pedidos sin columnas utm nuevas', error.message);
      const { utm_medium: _m, utm_content: _c, utm_term: _t, ...resto } = fila;
      filaFinal = resto;
    }
    else if (error.code === '23505' && String(error.message).includes('event_id')) {
      const { data } = await supabase.from('pedidos').select('order_id, total').eq('event_id', eventId).single();
      return json({ ok: true, order_id: data?.order_id, total: data?.total });
    } else if (error.code !== '23505') {
      console.error('insert', error);
      return json({ ok: false, error: 'No pudimos guardar el pedido' }, 500);
    }
  }
  if (!orderId) return json({ ok: false, error: 'No pudimos generar el número de pedido' }, 500);

  if (descuento && !(reabierto && existente.cupon === cupon!.codigo)) {
    const { error } = await supabase.from('cupones').update({ usos: cupon!.usos + 1 }).eq('codigo', cupon!.codigo);
    if (error) console.error('cupon usos', error);
  }

  let wompi = null;
  if (conWompi) {
    const checkout = await checkoutWompi(orderId, total);
    const { error } = await supabase.from('pedidos').update({ wompi_referencia: checkout.referencia }).eq('order_id', orderId);
    if (error) {
      console.error('wompi_referencia', error);
      return json({ ok: false, error: 'No pudimos preparar el pago' }, 500);
    }
    wompi = checkout.datos;
  } else {
    // Meta no debe frenar la respuesta al cliente si tarda o falla.
    const meta = enviarAMeta({ ...fila, order_id: orderId }, extra).catch((e) => console.error('Meta', e));
    // @ts-ignore EdgeRuntime existe en Supabase
    if (typeof EdgeRuntime !== 'undefined') EdgeRuntime.waitUntil(meta); else await meta;
  }

  return json({
    ok: true,
    order_id: orderId,
    total,
    subtotal,
    descuento,
    envio,
    prioritario: valorPrioritario,
    items: items.map(({ costo: _costo, ...i }) => i),
    metodo_pago: conWompi ? 'wompi' : 'contraentrega',
    wompi,
  });
});
