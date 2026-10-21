// Revoltosos · Edge Function "wompi-eventos"
//
// Wompi llama a esta URL cada vez que cambia una transacción (evento
// transaction.updated). Se verifica la firma del evento, se busca el pedido por la
// referencia (la que armó crear-pedido: order_id + 4 letras) y se anota el estado
// del pago. Cuando el pago se aprueba se manda el Purchase a la API de
// Conversiones de Meta con el mismo event_id del Pixel.
//
// En Wompi › Desarrolladores › Seguimiento de transacciones, la "URL de eventos" es:
//   https://<proyecto>.supabase.co/functions/v1/wompi-eventos      (Verify JWT apagado)
//
// Secrets que usa (Supabase › Edge Functions › Secrets):
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY  → Supabase los pone solos
//   WOMPI_EVENTS_SECRET                      → Wompi › Desarrolladores › Secretos › Eventos
//   META_PIXEL_ID, META_ACCESS_TOKEN         → opcionales, los mismos de crear-pedido
//   META_TEST_EVENT_CODE, META_API_VERSION   → opcionales

import { createClient } from 'npm:@supabase/supabase-js@2';

const ESTADOS: Record<string, string> = {
  APPROVED: 'aprobado',
  DECLINED: 'rechazado',
  VOIDED: 'anulado',
  ERROR: 'error',
  PENDING: 'pendiente',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

async function sha256Exacto(valor: string): Promise<string> {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(valor));
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, '0')).join('');
}
const sha256 = (valor: string) => sha256Exacto(valor.trim().toLowerCase());

// Mismo cálculo que crear-pedido.
const normalizar = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');

// Firma de Wompi: SHA256 de los valores de signature.properties (en orden) + timestamp + secreto de eventos.
async function firmaValida(evento: Record<string, any>, secreto: string): Promise<boolean> {
  const props: string[] = evento?.signature?.properties ?? [];
  const recibida = String(evento?.signature?.checksum ?? '').toLowerCase();
  if (!props.length || !recibida) return false;
  const valores = props.map((ruta) => ruta.split('.').reduce((o: any, k) => o?.[k], evento.data) ?? '').join('');
  return (await sha256Exacto(`${valores}${evento.timestamp}${secreto}`)) === recibida;
}

// Igual que enviarAMeta en crear-pedido, con los datos guardados en el pedido.
async function enviarAMeta(p: Record<string, any>) {
  const pixel = Deno.env.get('META_PIXEL_ID')?.trim();
  const token = Deno.env.get('META_ACCESS_TOKEN')?.trim();
  if (!pixel || !token) return;
  const extra = p.meta_datos ?? {};
  const version = Deno.env.get('META_API_VERSION') ?? 'v23.0';
  const [nombre, ...apellidos] = String(p.nombre).split(/\s+/);
  const items: any[] = Array.isArray(p.items) ? p.items : [];

  const user_data: Record<string, unknown> = {
    ph: [await sha256(String(p.celular))],
    fn: [await sha256(normalizar(nombre ?? ''))],
    ln: [await sha256(normalizar(apellidos.join('')))],
    ct: [await sha256(normalizar(String(p.ciudad)))],
    st: [await sha256(normalizar(String(p.departamento)))],
    country: [await sha256('co')],
    external_id: [await sha256(String(p.order_id))],
    client_user_agent: extra.ua ?? '',
  };
  if (extra.ip) user_data.client_ip_address = extra.ip;
  if (extra.fbp) user_data.fbp = extra.fbp;
  if (extra.fbc) user_data.fbc = extra.fbc;

  const cuerpo: Record<string, unknown> = {
    data: [{
      event_name: 'Purchase',
      event_time: Math.floor(Date.now() / 1000),
      event_id: p.event_id,
      action_source: 'website',
      event_source_url: extra.url || undefined,
      user_data,
      custom_data: {
        value: p.total,
        currency: 'COP',
        content_ids: items.map((i) => i.variante_id),
        contents: items.map((i) => ({ id: i.variante_id, quantity: i.cantidad, item_price: i.precio })),
        content_type: 'product',
        num_items: p.cantidad,
        order_id: p.order_id,
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
  else console.log(`Meta CAPI ok ${p.order_id} (Wompi): ${respuesta}`);
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json({ ok: false }, 405);
  const secreto = Deno.env.get('WOMPI_EVENTS_SECRET')?.trim();
  if (!secreto) {
    console.error('Falta WOMPI_EVENTS_SECRET');
    return json({ ok: false }, 500); // Wompi reintenta más tarde
  }

  let evento: Record<string, any>;
  try {
    evento = await req.json();
  } catch {
    return json({ ok: false }, 400);
  }
  if (!(await firmaValida(evento, secreto))) {
    console.warn('Evento con firma inválida', evento?.event);
    return json({ ok: false }, 401);
  }
  if (evento.event !== 'transaction.updated') return json({ ok: true });

  const tx = evento.data?.transaction ?? {};
  const referencia = String(tx.reference ?? '');
  const estado = ESTADOS[String(tx.status)];
  if (!referencia || !estado) return json({ ok: true });

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false },
  });

  // Se busca por la referencia del último intento; si es de un intento anterior, por el order_id.
  let { data: p } = await supabase.from('pedidos').select('*').eq('wompi_referencia', referencia).maybeSingle();
  const esUltimoIntento = !!p;
  if (!p) ({ data: p } = await supabase.from('pedidos').select('*').eq('order_id', referencia.replace(/-[^-]+$/, '')).maybeSingle());
  if (!p) {
    console.warn('Evento de Wompi sin pedido', referencia, tx.status);
    return json({ ok: true });
  }

  // Un intento viejo rechazado no pisa el estado actual; un pago aprobado solo cambia si esa misma transacción se anula.
  if (p.pago_estado === 'aprobado' && !(estado === 'anulado' && tx.id === p.wompi_transaccion)) return json({ ok: true });
  if (!esUltimoIntento && estado !== 'aprobado') return json({ ok: true });

  if (estado === 'aprobado' && (Number(tx.amount_in_cents) !== p.total * 100 || tx.currency !== 'COP')) {
    console.error(`Wompi aprobó ${tx.amount_in_cents} ${tx.currency} para ${p.order_id}, que vale ${p.total * 100}: no se marca pagado`);
    await supabase.from('pedidos').update({ pago_estado: 'error', wompi_transaccion: tx.id ?? null }).eq('id', p.id);
    return json({ ok: true });
  }

  const cambios: Record<string, unknown> = {
    metodo_pago: 'wompi',
    pago_estado: estado,
    wompi_transaccion: tx.id ?? null,
    wompi_medio: tx.payment_method_type ?? null,
  };
  if (estado === 'aprobado') {
    cambios.pagado_en = new Date().toISOString();
    cambios.wompi_referencia = referencia;
  }
  const { error } = await supabase.from('pedidos').update(cambios).eq('id', p.id);
  if (error) {
    console.error('update pago', error);
    return json({ ok: false }, 500);
  }
  console.log(`Wompi ${p.order_id}: ${tx.status} (${tx.payment_method_type ?? '?'})`);

  // Purchase a Meta una sola vez: quien logra borrar meta_datos es quien lo manda.
  if (estado === 'aprobado') {
    const { data: tomado } = await supabase.from('pedidos').update({ meta_datos: null })
      .eq('id', p.id).not('meta_datos', 'is', null).select('id');
    if (tomado?.length) {
      const meta = enviarAMeta(p).catch((e) => console.error('Meta', e));
      // @ts-ignore EdgeRuntime existe en Supabase
      if (typeof EdgeRuntime !== 'undefined') EdgeRuntime.waitUntil(meta); else await meta;
    }
  }
  return json({ ok: true });
});
