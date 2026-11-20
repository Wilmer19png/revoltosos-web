// Revoltosos · Edge Function "avisar-admin"
//
// Manda una notificación push a los celulares de los admins (los que tocaron «Activar avisos»
// en el gestor) cuando entra un pedido, una reseña o queda un carrito sin terminar.
// Los clientes nunca reciben estos avisos.
//
// La llaman los triggers de la migración 025 con { tipo, id }. Solo se manda el tipo y el id:
// la función lee la fila con su propia llave, revisa que sea reciente y avisa UNA sola vez por
// fila (tabla avisos_enviados), así que nadie de afuera puede inventar avisos.
// El gestor también la usa: GET → llave pública para suscribirse; POST { tipo: 'prueba' } con la
// sesión de un admin → aviso de prueba.
//
// Publicarla con Verify JWT APAGADO (los triggers no mandan sesión).
//
// Secrets (Supabase › Edge Functions › Secrets):
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY  → Supabase los pone solos
//   VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY      → par de llaves de los avisos (ver README «Avisos»)

import { createClient } from 'npm:@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

const pesos = (n: number) => '$' + String(Math.round(n || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const primerNombre = (s: string) => String(s || '').trim().split(/\s+/)[0] || 'Alguien';

/* ---------- Web Push (RFC 8291 aes128gcm + VAPID RFC 8292) con WebCrypto ---------- */
const enc = new TextEncoder();
const b64u = (buf: ArrayBuffer | Uint8Array) => {
  const b = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let s = '';
  for (const x of b) s += String.fromCharCode(x);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};
const desdeB64u = (s: string) => {
  const t = s.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(t + '='.repeat((4 - (t.length % 4)) % 4));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
};
const unir = (...partes: Uint8Array[]) => {
  const out = new Uint8Array(partes.reduce((s, p) => s + p.length, 0));
  let i = 0;
  for (const p of partes) { out.set(p, i); i += p.length; }
  return out;
};
async function hmac(llave: Uint8Array, datos: Uint8Array) {
  const k = await crypto.subtle.importKey('raw', llave, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return new Uint8Array(await crypto.subtle.sign('HMAC', k, datos));
}

async function cifrar(p256dh: string, authSecret: string, mensaje: Uint8Array) {
  const uaPublica = desdeB64u(p256dh);
  const auth = desdeB64u(authSecret);
  const efimera = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
  const asPublica = new Uint8Array(await crypto.subtle.exportKey('raw', efimera.publicKey));
  const uaLlave = await crypto.subtle.importKey('raw', uaPublica, { name: 'ECDH', namedCurve: 'P-256' }, false, []);
  const secreto = new Uint8Array(await crypto.subtle.deriveBits({ name: 'ECDH', public: uaLlave }, efimera.privateKey, 256));
  const prkKey = await hmac(auth, secreto);
  const ikm = await hmac(prkKey, unir(enc.encode('WebPush: info\0'), uaPublica, asPublica, new Uint8Array([1])));
  const sal = crypto.getRandomValues(new Uint8Array(16));
  const prk = await hmac(sal, ikm);
  const cek = (await hmac(prk, unir(enc.encode('Content-Encoding: aes128gcm\0'), new Uint8Array([1])))).slice(0, 16);
  const nonce = (await hmac(prk, unir(enc.encode('Content-Encoding: nonce\0'), new Uint8Array([1])))).slice(0, 12);
  const llaveAes = await crypto.subtle.importKey('raw', cek, 'AES-GCM', false, ['encrypt']);
  const cifrado = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, llaveAes, unir(mensaje, new Uint8Array([2]))));
  const rs = new Uint8Array([0, 0, 16, 0]); // 4096
  return unir(sal, rs, new Uint8Array([asPublica.length]), asPublica, cifrado);
}

let llaveVapid: CryptoKey | null = null;
async function firmaVapid(endpoint: string) {
  const publica = Deno.env.get('VAPID_PUBLIC_KEY')!.trim();
  if (!llaveVapid) {
    const raw = desdeB64u(publica);
    llaveVapid = await crypto.subtle.importKey('jwk', {
      kty: 'EC', crv: 'P-256', d: Deno.env.get('VAPID_PRIVATE_KEY')!.trim(),
      x: b64u(raw.slice(1, 33)), y: b64u(raw.slice(33, 65)), ext: true,
    }, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
  }
  const cab = b64u(enc.encode(JSON.stringify({ typ: 'JWT', alg: 'ES256' })));
  const cuerpo = b64u(enc.encode(JSON.stringify({
    aud: new URL(endpoint).origin,
    exp: Math.floor(Date.now() / 1000) + 12 * 3600,
    sub: 'https://revoltosos.netlify.app',
  })));
  const firma = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, llaveVapid, enc.encode(cab + '.' + cuerpo));
  return `vapid t=${cab}.${cuerpo}.${b64u(firma)}, k=${publica}`;
}

type Sus = { endpoint: string; p256dh: string; auth: string };
async function mandarPush(s: Sus, aviso: Record<string, unknown>) {
  const cuerpo = await cifrar(s.p256dh, s.auth, enc.encode(JSON.stringify(aviso)));
  const r = await fetch(s.endpoint, {
    method: 'POST',
    headers: {
      Authorization: await firmaVapid(s.endpoint),
      'Content-Encoding': 'aes128gcm',
      'Content-Type': 'application/octet-stream',
      TTL: '86400',
      Urgency: 'high',
    },
    body: cuerpo,
  });
  return r.status;
}

/* ---------- Qué decir en cada aviso ---------- */
type Aviso = { title: string; body: string; url: string; tag: string };

function lineasItems(items: unknown): string {
  if (!Array.isArray(items)) return '';
  return items.map((i: { cantidad?: number; nombre?: string; regalo?: boolean }) =>
    (i.regalo ? 'Regalo: ' : (i.cantidad && i.cantidad > 1 ? i.cantidad + ' × ' : '')) + (i.nombre || '')).join(', ');
}

// deno-lint-ignore no-explicit-any
async function armarAviso(sb: any, tipo: string, id: string): Promise<Aviso | null> {
  const hace = (min: number) => new Date(Date.now() - min * 60000).toISOString();
  if (tipo === 'pedido') {
    const { data: p } = await sb.from('pedidos').select('order_id, nombre, ciudad, total, items, producto, metodo_pago, creado_en')
      .eq('id', id).gte('creado_en', hace(120)).maybeSingle();
    if (!p) return null;
    return {
      title: '🛒 Pedido nuevo · ' + pesos(p.total) + (p.metodo_pago === 'wompi' ? ' (Wompi)' : ''),
      body: primerNombre(p.nombre) + ' · ' + p.ciudad + '\n' + (lineasItems(p.items) || p.producto || ''),
      url: '/pedidos/?tab=pedidos', tag: 'pedido-' + p.order_id,
    };
  }
  if (tipo === 'resena') {
    const { data: r } = await sb.from('resenas').select('nombre, ciudad, estrellas, texto, creado_en')
      .eq('id', id).gte('creado_en', hace(120)).maybeSingle();
    if (!r) return null;
    return {
      title: '⭐ Reseña nueva · ' + '★'.repeat(r.estrellas) + '☆'.repeat(5 - r.estrellas),
      body: primerNombre(r.nombre) + ' (' + r.ciudad + '): ' + String(r.texto).slice(0, 140),
      url: '/pedidos/?tab=resenas', tag: 'resena-' + id,
    };
  }
  if (tipo === 'carrito') {
    const { data: c } = await sb.from('carritos').select('nombre, ciudad, total, items, pedido_id, recuperado_en, descartado, actualizado_en, creado_en')
      .eq('sesion', id).gte('creado_en', hace(24 * 60)).maybeSingle();
    if (!c || c.pedido_id || c.recuperado_en || c.descartado || c.actualizado_en > hace(15)) return null;
    return {
      title: '⏳ Carrito sin terminar · ' + pesos(c.total),
      body: (c.nombre ? primerNombre(c.nombre) : 'Alguien') + (c.ciudad ? ' · ' + c.ciudad : '') + '\n' + lineasItems(c.items),
      url: '/pedidos/?tab=carritos', tag: 'carrito-' + id,
    };
  }
  if (tipo === 'bonos') {
    // id = fecha de hoy (YYYY-MM-DD): un aviso por día, con los bonos que vencen en 7 días o menos.
    if (!/^\d{4}-\d{2}-\d{2}$/.test(id)) return null;
    const hoy = new Date(Date.now() - 5 * 3600 * 1000).toISOString().slice(0, 10);
    if (id !== hoy) return null;
    const limite = new Date(Date.parse(hoy) + 7 * 86400000).toISOString().slice(0, 10);
    const { data: bs } = await sb.from('bonos').select('monto, vence').is('usado_pedido', null).gte('vence', hoy).lte('vence', limite);
    if (!bs?.length) return null;
    const suma = bs.reduce((s: number, x: { monto: number }) => s + x.monto, 0);
    const hoyMismo = bs.filter((x: { vence: string }) => x.vence === hoy).length;
    return {
      title: '🎟️ ' + (bs.length === 1 ? '1 bono se vence' : bs.length + ' bonos se vencen') + ' esta semana',
      body: 'Son ' + pesos(suma) + ' que tus clientes pueden usar' + (hoyMismo ? ' (' + hoyMismo + ' vence' + (hoyMismo === 1 ? '' : 'n') + ' hoy)' : '') + '. Toca para recordarles por WhatsApp.',
      url: '/pedidos/?tab=bonos', tag: 'bonos-' + id,
    };
  }
  return null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  const publica = Deno.env.get('VAPID_PUBLIC_KEY')?.trim();
  if (!publica || !Deno.env.get('VAPID_PRIVATE_KEY')?.trim()) return json({ ok: false, error: 'Faltan VAPID_PUBLIC_KEY y VAPID_PRIVATE_KEY en los secrets' }, 500);
  if (req.method === 'GET') return json({ ok: true, publica });
  if (req.method !== 'POST') return json({ ok: false }, 405);

  let b: { tipo?: string; id?: string };
  try { b = await req.json(); } catch { return json({ ok: false, error: 'JSON inválido' }, 400); }
  const tipo = String(b.tipo || '');
  const id = String(b.id || '').slice(0, 80);
  const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });

  let aviso: Aviso | null;
  if (tipo === 'prueba') {
    // Solo un admin con sesión abierta en el gestor.
    const token = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
    const { data: u } = await sb.auth.getUser(token);
    const email = u?.user?.email?.toLowerCase();
    const { data: admin } = email ? await sb.from('admins').select('email').eq('email', email).maybeSingle() : { data: null };
    if (!admin) return json({ ok: false, error: 'Solo para admins' }, 401);
    aviso = { title: '🔔 Avisos activados', body: 'Así te llegarán los pedidos, carritos y reseñas nuevas.', url: '/pedidos/', tag: 'prueba' };
  } else {
    if (!['pedido', 'resena', 'carrito', 'bonos'].includes(tipo) || !id) return json({ ok: false }, 400);
    aviso = await armarAviso(sb, tipo, id);
    if (!aviso) return json({ ok: true, omitido: true });
    // Una sola vez por fila.
    const { error } = await sb.from('avisos_enviados').insert({ tipo, ref: id });
    if (error) return json({ ok: true, repetido: true });
  }

  const { data: subs } = await sb.from('push_suscripciones').select('endpoint, p256dh, auth');
  let enviados = 0;
  for (const s of (subs || []) as Sus[]) {
    try {
      const status = await mandarPush(s, aviso);
      if (status === 404 || status === 410) await sb.from('push_suscripciones').delete().eq('endpoint', s.endpoint);
      else if (status >= 200 && status < 300) enviados++;
      else console.warn('push', status, s.endpoint.slice(0, 60));
    } catch (e) {
      console.error('push error', e);
    }
  }
  return json({ ok: true, enviados, dispositivos: (subs || []).length });
});
