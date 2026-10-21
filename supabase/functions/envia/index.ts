// Revoltosos · Edge Function "envia"
//
// Conecta el gestor (/pedidos) con la API de Envía (envia.com): cotizar el envío de
// un pedido con todas las transportadoras, generar la guía con recaudo contraentrega,
// rastrear los pedidos despachados (y cambiar su estado solo) y anular guías.
// Solo la pueden usar los correos de la tabla admins (migraciones 007 y 010).
//
// Secrets (Supabase › Edge Functions › Secrets):
//   ENVIA_TOKEN    → token de la API de Envía (el de pruebas o el de producción)     · obligatorio
//   ENVIA_ENTORNO  → "pruebas" (por defecto, no genera guías reales) o "produccion"
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY → Supabase los pone solos
//
// Cuerpo: { accion: 'diagnostico' | 'cotizar' | 'generar' | 'rastrear' | 'cancelar', pedido_id?, carrier?, service? }

import { createClient, SupabaseClient } from 'npm:@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': Deno.env.get('ALLOWED_ORIGIN') ?? '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Vary': 'Origin',
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

const PRODUCCION = (Deno.env.get('ENVIA_ENTORNO') ?? 'pruebas').toLowerCase().startsWith('prod');
const API = PRODUCCION ? 'https://api.envia.com' : 'https://api-test.envia.com';
const QUERIES = PRODUCCION ? 'https://queries.envia.com' : 'https://queries-test.envia.com';
const TOKEN = (Deno.env.get('ENVIA_TOKEN') ?? '').trim();

// Códigos de departamento que usa Envía (queries.envia.com/state?country_code=CO).
const ESTADO_ENVIA: Record<string, string> = {
  'Amazonas': 'AM', 'Antioquia': 'AN', 'Arauca': 'AR', 'Atlántico': 'AT', 'Bogotá D.C.': 'DC', 'Bolívar': 'BL',
  'Boyacá': 'BY', 'Caldas': 'CL', 'Caquetá': 'CA', 'Casanare': 'CS', 'Cauca': 'CU', 'Cesar': 'CE', 'Chocó': 'CH',
  'Córdoba': 'CO', 'Cundinamarca': 'CN', 'Guainía': 'GU', 'Guaviare': 'GA', 'Huila': 'HU', 'La Guajira': 'LG',
  'Magdalena': 'MA', 'Meta': 'ME', 'Nariño': 'NA', 'Norte de Santander': 'NS', 'Putumayo': 'PU', 'Quindío': 'QU',
  'Risaralda': 'RI', 'San Andrés y Providencia': 'SA', 'Santander': 'SN', 'Sucre': 'SU', 'Tolima': 'TO',
  'Valle del Cauca': 'VC', 'Vaupés': 'VA', 'Vichada': 'VI',
};

type Pedido = Record<string, any>;
type Remitente = { nombre?: string; empresa?: string; telefono?: string; email?: string; documento?: string; direccion?: string; barrio?: string; departamento?: string; ciudad?: string; referencia?: string };

class ErrorEnvia extends Error {
  constructor(message: string, public detalle?: unknown, public status = 502) { super(message); }
}

// Llama a Envía y devuelve el JSON, o lanza un error con el mensaje que mandó Envía.
async function envia(url: string, body?: unknown) {
  const res = await fetch(url, {
    method: body === undefined ? 'GET' : 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const texto = await res.text();
  let datos: any = null;
  try { datos = JSON.parse(texto); } catch { datos = { texto: texto.slice(0, 500) }; }
  const fallo = !res.ok || datos?.meta === 'error' || (datos?.error && !datos?.data);
  if (fallo) {
    const e = datos?.error;
    const msg = (typeof e === 'string' ? e : (e?.description || e?.message)) || datos?.message || `Envía respondió ${res.status}`;
    if (res.status === 401) throw new ErrorEnvia('Envía no aceptó el token. Revisa ENVIA_TOKEN (y que sea del entorno ' + (PRODUCCION ? 'de producción' : 'de pruebas') + ').', datos, 401);
    throw new ErrorEnvia(String(msg), datos);
  }
  return datos;
}

const lista = (d: any): any[] => (Array.isArray(d) ? d : Array.isArray(d?.data) ? d.data : []);

async function municipioDane(sb: SupabaseClient, departamento: string, municipio: string): Promise<string> {
  const { data } = await sb.from('municipios').select('dane').eq('departamento', departamento).eq('municipio', municipio).maybeSingle();
  if (!data) throw new ErrorEnvia(`No encontramos el código DANE de ${municipio} (${departamento}). Revisa la ciudad del pedido.`, null, 422);
  return data.dane + '000';
}

async function direcciones(sb: SupabaseClient, p: Pedido, r: Remitente) {
  const faltan = ['nombre', 'telefono', 'documento', 'direccion', 'departamento', 'ciudad'].filter((k) => !(r as any)[k]);
  if (faltan.length) throw new ErrorEnvia('Faltan datos del remitente en el gestor (Ajustes → Envía): ' + faltan.join(', '), null, 422);
  if (!ESTADO_ENVIA[r.departamento!] || !ESTADO_ENVIA[p.departamento]) throw new ErrorEnvia('Departamento no reconocido para Envía.', null, 422);
  const [daneOrigen, daneDestino] = await Promise.all([
    municipioDane(sb, r.departamento!, r.ciudad!),
    municipioDane(sb, p.departamento, p.ciudad),
  ]);
  const origin = {
    name: r.nombre, company: r.empresa || r.nombre, email: r.email || undefined,
    phone: String(r.telefono).replace(/\D/g, '').slice(-10), phone_code: 'CO',
    street: r.direccion, number: '', district: r.barrio || undefined, reference: r.referencia || undefined,
    city: daneOrigen, state: ESTADO_ENVIA[r.departamento!], country: 'CO', postalCode: daneOrigen,
    identificationNumber: String(r.documento).replace(/[^\d-]/g, ''),
  };
  const destination = {
    name: p.nombre, phone: String(p.celular).slice(-10), phone_code: 'CO',
    street: p.direccion, number: '', district: p.barrio || undefined, reference: p.indicaciones || undefined,
    city: daneDestino, state: ESTADO_ENVIA[p.departamento], country: 'CO', postalCode: daneDestino,
    identificationNumber: p.cedula || undefined,
  };
  return { origin, destination };
}

// Un solo paquete con la caja estándar; el peso sale de cada tamaño (o del peso por defecto).
async function paquete(sb: SupabaseClient, p: Pedido, caja: Record<string, number>) {
  const items: any[] = Array.isArray(p.items) ? p.items : [];
  const ids = items.map((i) => i.variante_id);
  const { data: vs } = ids.length ? await sb.from('variantes').select('id, peso_g').in('id', ids) : { data: [] as any[] };
  const pesoDe = (id: string) => (vs ?? []).find((v: any) => v.id === id)?.peso_g || caja.peso_g || 500;
  const gramos = items.length ? items.reduce((s, i) => s + pesoDe(i.variante_id) * i.cantidad, 0) : (caja.peso_g || 500) * (p.cantidad || 1);
  const valorProductos = (p.subtotal ?? p.total) - (p.descuento ?? 0);
  return {
    type: 'box', content: 'Snacks deshidratados para mascotas', amount: 1,
    declaredValue: Math.max(0, valorProductos), lengthUnit: 'CM', weightUnit: 'KG',
    weight: Math.max(0.1, Math.round(gramos / 10) / 100),
    dimensions: { length: caja.largo || 20, width: caja.ancho || 15, height: caja.alto || 12 },
    // Contraentrega: la transportadora cobra el total del pedido al entregar (si ya se pagó con Wompi, nada).
    additionalServices: p.metodo_pago === 'wompi' ? [] : [{ service: 'cash_on_delivery', data: { amount: p.total } }],
  };
}

// Transportadoras a cotizar: las de Ajustes, o las que Envía tenga activas para Colombia.
async function transportadoras(preferidas?: string | null): Promise<string[]> {
  const propias = (preferidas ?? '').split(/[,\s]+/).map((s) => s.trim().toLowerCase()).filter(Boolean);
  if (propias.length) return propias;
  const d = await envia(`${QUERIES}/available-carrier/CO/0`);
  const nombres = lista(d).map((c: any) => String(c?.name ?? c?.carrier ?? c?.carrier_name ?? '').toLowerCase()).filter(Boolean);
  return Array.from(new Set(nombres));
}

// Estados de rastreo de Envía → estado del pedido en el gestor.
function traducirEstado(id: number | null, nombre: string): { estado?: string; novedad?: string | null } {
  const n = nombre.toLowerCase();
  if (id === 3 || (/deliver|entreg/.test(n) && !/out for|attempt|intento|origin|origen|partial|parcial/.test(n))) return { estado: 'Entregado', novedad: null };
  if ([11, 13, 20].includes(id ?? -1) || /return|devol|origin|origen/.test(n)) return { estado: 'Devuelto', novedad: null };
  if ([9, 17, 18, 19, 28].includes(id ?? -1) || /out for delivery|reparto|attempt|intento/.test(n)) {
    return { estado: 'En reparto', novedad: [17, 18, 19, 28].includes(id ?? -1) || /attempt|intento/.test(n) ? nombre : null };
  }
  if ([10, 14, 21, 22, 23, 24].includes(id ?? -1) || /address|direcci|undeliver|reject|rechaz|lost|perdid|damag|dañ|delay|retras/.test(n)) return { novedad: nombre };
  if (id === 4 || /cancel/.test(n)) return { novedad: 'Guía anulada en Envía' };
  return { novedad: null };
}
const ORDEN = ['Nuevo', 'Confirmado', 'No confirmado', 'Despachado', 'En reparto', 'Entregado', 'Devuelto', 'Cancelado'];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ ok: false, error: 'Método no permitido' }, 405);

  const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });

  // Solo correos de la tabla admins.
  const jwt = (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '');
  const { data: usuario } = jwt ? await sb.auth.getUser(jwt) : { data: { user: null } };
  const email = usuario?.user?.email?.toLowerCase();
  if (!email) return json({ ok: false, error: 'Inicia sesión en el gestor' }, 401);
  const { data: admin } = await sb.from('admins').select('email').eq('email', email).maybeSingle();
  if (!admin) return json({ ok: false, error: 'Sin permiso' }, 403);

  let b: Record<string, any> = {};
  try { b = await req.json(); } catch { /* sin cuerpo */ }
  const accion = String(b.accion ?? '');
  const entorno = PRODUCCION ? 'produccion' : 'pruebas';
  if (!TOKEN) return json({ ok: false, entorno, error: 'Falta el secret ENVIA_TOKEN con el token de la API de Envía.' }, 400);

  const { data: ajustes } = await sb.from('ajustes').select('envia_remitente, envia_caja, envia_transportadoras').eq('id', 1).maybeSingle();
  const remitente = (ajustes?.envia_remitente ?? {}) as Remitente;
  const caja = (ajustes?.envia_caja ?? {}) as Record<string, number>;

  const cargarPedido = async () => {
    const { data } = await sb.from('pedidos').select('*').eq('id', String(b.pedido_id ?? '')).maybeSingle();
    if (!data) throw new ErrorEnvia('No encontramos ese pedido.', null, 404);
    if (data.metodo_pago === 'wompi' && data.pago_estado !== 'aprobado') {
      throw new ErrorEnvia('Este pedido es con Wompi y el pago aún no está aprobado.', null, 409);
    }
    return data as Pedido;
  };

  try {
    if (accion === 'diagnostico') {
      const carriers = await transportadoras(ajustes?.envia_transportadoras);
      const faltan = ['nombre', 'telefono', 'documento', 'direccion', 'departamento', 'ciudad'].filter((k) => !(remitente as any)[k]);
      return json({ ok: true, entorno, transportadoras: carriers, remitente_completo: !faltan.length, faltan });
    }

    if (accion === 'cotizar') {
      const p = await cargarPedido();
      const { origin, destination } = await direcciones(sb, p, remitente);
      const pkg = await paquete(sb, p, caja);
      const carriers = await transportadoras(ajustes?.envia_transportadoras);
      const resultados = await Promise.allSettled(carriers.map((carrier) => envia(`${API}/ship/rate/`, {
        origin, destination, packages: [pkg], shipment: { type: 1, carrier }, settings: { currency: 'COP' },
      })));
      const opciones: any[] = [];
      const errores: { carrier: string; error: string }[] = [];
      resultados.forEach((r, i) => {
        if (r.status === 'rejected') { errores.push({ carrier: carriers[i], error: (r.reason as Error).message }); return; }
        lista(r.value).forEach((o: any) => {
          const precio = Number(o.totalPrice ?? o.total_price ?? o.price);
          if (!precio) return;
          opciones.push({
            carrier: o.carrier ?? carriers[i],
            nombre: o.carrierDescription ?? o.carrier_description ?? o.carrier ?? carriers[i],
            service: o.service,
            servicio: o.serviceDescription ?? o.service_description ?? o.service,
            precio: Math.round(precio),
            moneda: o.currency ?? 'COP',
            entrega: o.deliveryEstimate ?? o.delivery_estimate ?? o.deliveryDate?.dateDifference ?? null,
          });
        });
      });
      opciones.sort((a, c) => a.precio - c.precio);
      return json({ ok: true, entorno, opciones, errores, peso_kg: pkg.weight });
    }

    if (accion === 'generar') {
      const p = await cargarPedido();
      if (p.guia) throw new ErrorEnvia('Este pedido ya tiene guía (' + p.guia + '). Anúlala primero si quieres otra.', null, 409);
      const carrier = String(b.carrier ?? '').toLowerCase();
      const service = String(b.service ?? '');
      if (!carrier || !service) throw new ErrorEnvia('Elige una transportadora.', null, 422);
      const { origin, destination } = await direcciones(sb, p, remitente);
      const pkg = await paquete(sb, p, caja);
      const d = await envia(`${API}/ship/generate/`, {
        origin, destination, packages: [pkg],
        shipment: { type: 1, carrier, service, orderReference: p.order_id },
        settings: { printFormat: 'PDF', printSize: 'PAPER_4X6', currency: 'COP', comments: 'Pedido ' + p.order_id },
      });
      const g = lista(d)[0];
      if (!g?.trackingNumber) throw new ErrorEnvia('Envía no devolvió número de guía.', d);
      const cambios: Record<string, unknown> = {
        guia: g.trackingNumber,
        transportadora: g.carrier ?? carrier,
        envia_servicio: g.service ?? service,
        envia_envio_id: g.shipmentId != null ? String(g.shipmentId) : null,
        guia_url: g.label ?? null,
        rastreo_url: g.trackUrl ?? null,
        envio_real: g.totalPrice != null ? Math.round(Number(g.totalPrice)) : p.envio_real,
        envia_estado: 'Guía creada',
        envia_estado_en: new Date().toISOString(),
        novedad: null,
      };
      if (['Nuevo', 'Confirmado'].includes(p.estado)) cambios.estado = 'Despachado';
      const { data: actualizado, error } = await sb.from('pedidos').update(cambios).eq('id', p.id).select().single();
      if (error) throw new ErrorEnvia('La guía se creó (' + g.trackingNumber + ') pero no se pudo guardar en el pedido.', error, 500);
      return json({ ok: true, entorno, pedido: actualizado, saldo: g.currentBalance ?? null });
    }

    if (accion === 'cancelar') {
      const p = await cargarPedido();
      if (!p.guia) throw new ErrorEnvia('Este pedido no tiene guía.', null, 422);
      await envia(`${API}/ship/cancel/`, { carrier: p.transportadora, trackingNumber: p.guia });
      const cambios: Record<string, unknown> = {
        guia: null, guia_url: null, rastreo_url: null, envia_envio_id: null, envia_servicio: null,
        envio_real: null, envia_estado: 'Guía anulada', envia_estado_en: new Date().toISOString(), novedad: null,
      };
      if (['Despachado', 'En reparto'].includes(p.estado)) cambios.estado = 'Confirmado'; // vuelve a bodega
      const { data: actualizado } = await sb.from('pedidos').update(cambios).eq('id', p.id).select().single();
      return json({ ok: true, entorno, pedido: actualizado });
    }

    if (accion === 'rastrear') {
      let q = sb.from('pedidos').select('id, order_id, guia, estado, envia_estado, novedad').not('guia', 'is', null);
      q = b.pedido_id ? q.eq('id', String(b.pedido_id)) : q.in('estado', ['Despachado', 'En reparto']);
      const { data: pedidos } = await q.limit(200);
      const porGuia = new Map((pedidos ?? []).map((p: any) => [String(p.guia), p]));
      const guias = Array.from(porGuia.keys());
      const cambios: any[] = [];
      for (let i = 0; i < guias.length; i += 20) {
        const d = await envia(`${API}/ship/generaltrack/`, { trackingNumbers: guias.slice(i, i + 20) });
        for (const t of lista(d)) {
          const p = porGuia.get(String(t.trackingNumber ?? t.tracking_number ?? ''));
          if (!p) continue;
          const st = t.status;
          const nombre = String(typeof st === 'string' ? st : st?.name ?? t.statusName ?? t.status_name ?? '');
          const id = Number(t.statusId ?? t.status_id ?? st?.id) || null;
          if (!nombre && !id) continue;
          const tr = traducirEstado(id, nombre);
          const upd: Record<string, unknown> = { envia_estado: nombre || String(id), envia_estado_en: new Date().toISOString() };
          if (tr.novedad !== undefined) upd.novedad = tr.novedad;
          // Nunca se retrocede (un pedido entregado no vuelve a "en reparto").
          if (tr.estado && tr.estado !== p.estado && ORDEN.indexOf(tr.estado) > ORDEN.indexOf(p.estado)) upd.estado = tr.estado;
          await sb.from('pedidos').update(upd).eq('id', p.id);
          if (upd.estado || (upd.novedad && upd.novedad !== p.novedad)) cambios.push({ order_id: p.order_id, de: p.estado, a: upd.estado ?? p.estado, novedad: upd.novedad ?? null });
        }
      }
      await sb.from('ajustes').update({ envia_rastreado_en: new Date().toISOString() }).eq('id', 1);
      return json({ ok: true, entorno, revisados: guias.length, cambios });
    }

    return json({ ok: false, error: 'Acción no reconocida' }, 400);
  } catch (e) {
    if (e instanceof ErrorEnvia) {
      console.error('envia', accion, e.message, JSON.stringify(e.detalle ?? null).slice(0, 2000));
      return json({ ok: false, entorno, error: e.message, detalle: e.detalle ?? null }, e.status);
    }
    console.error('envia', accion, e);
    return json({ ok: false, entorno, error: 'Error inesperado: ' + (e as Error).message }, 500);
  }
});
