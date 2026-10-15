// Revoltosos · Edge Function "sincronizar-pauta"
//
// Trae de la API de Marketing de Meta el gasto, clics y compras de cada anuncio,
// día por día, y lo guarda en la tabla `pauta_anuncios` (migración 009).
// La llama el gestor (/pedidos) con la sesión de un admin; nadie más puede usarla.
//
// Secrets (Supabase › Edge Functions › Secrets):
//   META_AD_ACCOUNT_ID  → ID de la cuenta publicitaria (con o sin "act_")         · obligatorio
//   META_ADS_TOKEN      → token con permiso ads_read                               · opcional
//   META_ACCESS_TOKEN   → si no hay META_ADS_TOKEN se intenta con este (el de la API de Conversiones)
//   META_API_VERSION    → opcional (por defecto v23.0)
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY → Supabase los pone solos

import { createClient } from 'npm:@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': Deno.env.get('ALLOWED_ORIGIN') ?? '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Vary': 'Origin',
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

const MAX_DIAS = 93;
const diaColombia = (ms: number) => new Date(ms - 5 * 3600 * 1000).toISOString().slice(0, 10);
const esFecha = (s: unknown) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);

type Accion = { action_type: string; value: string };
type Fila = {
  date_start: string; ad_id: string; ad_name?: string; adset_id?: string; adset_name?: string;
  campaign_id?: string; campaign_name?: string; spend?: string; impressions?: string; clicks?: string;
  actions?: Accion[]; action_values?: Accion[]; account_currency?: string;
};

// Meta reporta la misma compra con varios nombres; se toma uno solo, en este orden.
const TIPOS_COMPRA = ['purchase', 'omni_purchase', 'offsite_conversion.fb_pixel_purchase'];
function compra(lista: Accion[] | undefined): number {
  if (!lista) return 0;
  for (const t of TIPOS_COMPRA) {
    const a = lista.find((x) => x.action_type === t);
    if (a) return Number(a.value) || 0;
  }
  return 0;
}

// Traduce los errores de Meta a algo que se pueda resolver.
function explicar(e: { code?: number; message?: string; error_subcode?: number } | undefined): string {
  const code = e?.code;
  if (code === 190) return 'La clave de Meta venció o no es válida. Genera una nueva y actualiza el secret.';
  if (code === 10 || code === 200 || code === 294 || code === 100 && /permission/i.test(e?.message ?? ''))
    return 'La clave de Meta no tiene permiso para leer los anuncios (ads_read) de esta cuenta publicitaria.';
  if (code === 100) return 'Meta no reconoce la cuenta publicitaria. Revisa META_AD_ACCOUNT_ID.';
  if (code === 4 || code === 17 || code === 613) return 'Meta pidió esperar un rato antes de volver a consultar. Intenta en unos minutos.';
  return 'Meta respondió con un error: ' + (e?.message ?? 'desconocido');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ ok: false, error: 'Método no permitido' }, 405);

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false },
  });

  // Solo correos de la tabla admins.
  const jwt = (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '');
  const { data: usuario } = jwt ? await supabase.auth.getUser(jwt) : { data: { user: null } };
  const email = usuario?.user?.email?.toLowerCase();
  if (!email) return json({ ok: false, error: 'Inicia sesión en el gestor' }, 401);
  const { data: admin } = await supabase.from('admins').select('email').eq('email', email).maybeSingle();
  if (!admin) return json({ ok: false, error: 'Sin permiso' }, 403);

  const cuenta = (Deno.env.get('META_AD_ACCOUNT_ID') ?? '').trim().replace(/^act_/, '');
  const token = (Deno.env.get('META_ADS_TOKEN') ?? Deno.env.get('META_ACCESS_TOKEN') ?? '').trim();
  const version = Deno.env.get('META_API_VERSION') ?? 'v23.0';
  const guardarError = (msg: string) =>
    supabase.from('ajustes').update({ meta_error: msg }).eq('id', 1);
  if (!/^\d{5,25}$/.test(cuenta)) {
    const msg = 'Falta el secret META_AD_ACCOUNT_ID con el ID de la cuenta publicitaria.';
    await guardarError(msg);
    return json({ ok: false, error: msg }, 400);
  }
  if (!token) {
    const msg = 'Falta la clave de Meta (META_ADS_TOKEN o META_ACCESS_TOKEN).';
    await guardarError(msg);
    return json({ ok: false, error: msg }, 400);
  }

  // Rango: por defecto desde el 1 del mes anterior hasta hoy (alcanza para comparar meses).
  let b: Record<string, unknown> = {};
  try { b = await req.json(); } catch { /* sin cuerpo */ }
  const hoy = diaColombia(Date.now());
  const inicioMesAnterior = (() => { const d = new Date(hoy + 'T12:00:00Z'); d.setUTCDate(1); d.setUTCMonth(d.getUTCMonth() - 1); return d.toISOString().slice(0, 10); })();
  let desde = esFecha(b.desde) ? String(b.desde) : inicioMesAnterior;
  const hasta = esFecha(b.hasta) && String(b.hasta) <= hoy ? String(b.hasta) : hoy;
  const minimo = diaColombia(Date.parse(hasta + 'T12:00:00Z') - (MAX_DIAS - 1) * 86400000);
  if (desde < minimo) desde = minimo;

  const campos = 'ad_id,ad_name,adset_id,adset_name,campaign_id,campaign_name,spend,impressions,clicks,actions,action_values,account_currency';
  const params = new URLSearchParams({
    level: 'ad',
    time_increment: '1',
    time_range: JSON.stringify({ since: desde, until: hasta }),
    fields: campos,
    limit: '500',
    access_token: token,
  });
  let url: string | null = `https://graph.facebook.com/${version}/act_${cuenta}/insights?${params}`;

  const filas: Fila[] = [];
  for (let pagina = 0; url && pagina < 40; pagina++) {
    const res: Response = await fetch(url);
    const cuerpo = await res.json().catch(() => ({}));
    if (!res.ok || cuerpo.error) {
      const msg = explicar(cuerpo.error);
      console.error('Meta insights', res.status, JSON.stringify(cuerpo.error ?? cuerpo));
      await guardarError(msg);
      return json({ ok: false, error: msg }, 502);
    }
    filas.push(...(cuerpo.data ?? []));
    url = cuerpo.paging?.next ?? null;
  }

  const moneda = filas.find((f) => f.account_currency)?.account_currency ?? null;
  const ahora = new Date().toISOString();
  const registros = filas.filter((f) => f.ad_id && f.date_start).map((f) => ({
    fecha: f.date_start,
    ad_id: f.ad_id,
    ad_nombre: f.ad_name ?? null,
    adset_id: f.adset_id ?? null,
    adset_nombre: f.adset_name ?? null,
    campana_id: f.campaign_id ?? null,
    campana_nombre: f.campaign_name ?? null,
    gasto: Number(f.spend) || 0,
    moneda: f.account_currency ?? moneda,
    impresiones: Number(f.impressions) || 0,
    clics: Number(f.clicks) || 0,
    compras_meta: compra(f.actions),
    valor_compras_meta: compra(f.action_values),
    actualizado_en: ahora,
  }));

  // Se reemplaza el rango completo: si Meta corrige un día, aquí también se corrige.
  const { error: errBorrar } = await supabase.from('pauta_anuncios').delete().gte('fecha', desde).lte('fecha', hasta);
  if (errBorrar) { console.error('borrar', errBorrar); return json({ ok: false, error: 'No se pudo guardar la pauta' }, 500); }
  for (let i = 0; i < registros.length; i += 500) {
    const { error } = await supabase.from('pauta_anuncios').insert(registros.slice(i, i + 500));
    if (error) { console.error('insertar', error); return json({ ok: false, error: 'No se pudo guardar la pauta' }, 500); }
  }

  await supabase.from('ajustes').update({ meta_sincronizado_en: ahora, meta_moneda: moneda, meta_error: null }).eq('id', 1);
  return json({ ok: true, desde, hasta, filas: registros.length, moneda });
});
