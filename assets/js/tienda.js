/* Revoltosos · tienda: catálogo, carrito, cupones, envío gratis y pedido
 *
 * Cada página define antes de cargar este archivo:
 *   window.PAGINA = {
 *     tipo: 'inicio' | 'producto',
 *     productoId: 'codornices',            // solo en páginas de producto (id en la tabla `productos`)
 *     resenas: 'Codornices',               // qué reseñas mostrar primero (opcional)
 *   };
 *
 * Precios, tamaños, envío gratis y tarifas salen de Supabase (tablas productos,
 * variantes y ajustes · migración 007). La función crear-pedido recalcula todo en
 * el servidor: lo que se muestra aquí es solo para el cliente.
 */

const CONFIG = {
  SUPABASE_URL: 'https://jlvnrxmardcnarzspccs.supabase.co',
  SUPABASE_KEY: 'sb_publishable_Jca2aMrjHOFVBrDnZpMj-Q_lDK6BWLF', // clave pública: se puede ver
  PIXEL_ID: '1089879483557850',
  WHATSAPP: '573122448276'
};

const P = window.PAGINA || { tipo: 'inicio' };
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
const pesos = (n) => '$' + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const guardar = (k, v) => { try { sessionStorage.setItem(k, v); } catch (e) {} };
const leer = (k) => { try { return sessionStorage.getItem(k); } catch (e) { return null; } };
const guardarL = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
const leerL = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
const reducirMovimiento = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

const ICONO = {
  regalo: '<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5"/></svg>',
  camion: '<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z"/><circle cx="7" cy="17.5" r="1.6"/><circle cx="17" cy="17.5" r="1.6"/></svg>',
  casa: '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-5h4v5"/></svg>',
  flecha: '<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  mas: '<svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  check: '<svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5 9-10"/></svg>',
  cerrar: '<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  etiqueta: '<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12l-8 8-9-9V3h8z"/><circle cx="7.5" cy="7.5" r="1.5"/></svg>',
  cupon: '<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9V6h18v3a3 3 0 0 0 0 6v3H3v-3a3 3 0 0 0 0-6z"/><path d="M14 6v12" stroke-dasharray="2 2"/></svg>',
  fuego: '<svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24"><path d="M12 2c1 3.5-1.5 5.3-2.6 7.4C8.2 11.6 8 13 8.5 14.5 7.3 14 6.5 12.8 6.4 11.4 4.9 13 4 15 4 17a8 8 0 0 0 16 0c0-4.6-3.2-7.5-4.7-10.4-.6 1.5-1.5 2.4-2.6 2.9C13.5 7 13.6 4.4 12 2z" fill="#F28C28"/><path d="M12 13c.4 1.5-.8 2.3-1.3 3.3-.4.9-.2 1.9.4 2.6a3 3 0 0 0 4.4-3.3c-.3-1.1-1.1-1.8-1.6-2.8-.3.6-.7 1-1.2 1.2.1-.4 0-.7-.7-1z" fill="#FFD166"/></svg>',
  basura: '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13"/></svg>',
  whatsapp: '<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" fill="currentColor"/></svg>',
  candado: '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>'
};

/* ---------- Catálogo ---------- */

// Para llegar al envío gratis se sugieren codornices (bolsa, frasco o codorniz entera).
const PRODUCTOS_SUGERIDOS = ['codornices', 'codorniz-entera'];

// Respaldo por si Supabase no responde: la tienda sigue mostrando lo principal.
const RESPALDO = {
  ajustes: { envio_gratis_desde: 120000, envio_base: 20000, envio_departamentos: {}, prioritario: 5000, pedido_minimo: 50000 },
  productos: [
    { id: 'codornices', nombre: 'Codornices deshidratadas', categoria: 'Codorniz', descripcion: 'Codorniz entera, deshidratada lentamente. Un solo ingrediente.', imagen: '/assets/img/productos/codornices-frasco-100g-600.jpg', ruta: '/codornices/', orden: 1 },
    { id: 'cajita-perros', nombre: 'Cajita para perros', categoria: 'Combos', descripcion: 'Patas de pollo, oreja de cerdo, codornicitas, codorniz entera y fémur de cerdo.', imagen: '/assets/img/productos/cajita-producto-fondo-blanco-600.jpg', ruta: '/cajita/', orden: 2 }
  ],
  variantes: [
    { id: 'codornices-bolsa-50g', producto_id: 'codornices', nombre: 'Bolsa 50 g', detalle: 'Para probar', precio: 22900, precio_antes: null, orden: 1, imagen: '/assets/img/productos/codornices-bolsa-50g-600.jpg' },
    { id: 'codornices-frasco-100g', producto_id: 'codornices', nombre: 'Frasco 100 g', detalle: 'Aprox. 30 codornices', precio: 38900, precio_antes: null, orden: 2, imagen: '/assets/img/productos/codornices-frasco-100g-600.jpg' },
    { id: 'cajita-perros', producto_id: 'cajita-perros', nombre: 'Cajita · 5 snacks', detalle: '5 snacks distintos', precio: 95900, precio_antes: null, orden: 1 }
  ]
};

const T = { ajustes: RESPALDO.ajustes, productos: [], variantes: [], porId: {}, prodPorId: {} };

function indexar(datos) {
  T.ajustes = Object.assign({}, RESPALDO.ajustes, datos.ajustes || {});
  T.productos = datos.productos.slice().sort((a, b) => a.orden - b.orden);
  T.prodPorId = {};
  T.productos.forEach((p) => { T.prodPorId[p.id] = p; });
  T.variantes = datos.variantes
    .filter((v) => v.precio > 0 && T.prodPorId[v.producto_id])
    .sort((a, b) => (T.prodPorId[a.producto_id].orden - T.prodPorId[b.producto_id].orden) || (a.orden - b.orden));
  T.porId = {};
  T.variantes.forEach((v) => {
    // El precio tachado (25 %) es solo de los combos; los snacks sueltos se muestran sin tachado.
    if (T.prodPorId[v.producto_id].categoria !== 'Combos') v.precio_antes = null;
    T.porId[v.id] = v;
  });
  T.componentes = {};
  (datos.componentes || []).forEach((c) => { (T.componentes[c.combo_id] = T.componentes[c.combo_id] || []).push(c); });
}

// «Trae» de un combo: [{ texto, foto }] en el orden de sus snacks. «30 unidades» × 2 → «60 patas de pollo».
// Plural de la primera palabra: paleta → paletas, fémur → fémures, codorniz → codornices, patas → patas.
const plural = (s) => s.replace(/^(\S+)/, (w) => (/s$/i.test(w) ? w : /z$/i.test(w) ? w.slice(0, -1) + 'ces' : /[aeiouáéíóú]$/i.test(w) ? w + 's' : w + 'es'));
function queTrae(comboId) {
  return (T.componentes[comboId] || []).map((c) => {
    const v = T.porId[c.componente_id];
    if (!v) return null;
    const p = prodDe(v);
    const nombre = p.nombre.replace(/ deshidratadas?$/i, '').replace(/ × ?\d+$/, '');
    const unidades = /^(\d+)\s+unidad(es)?$/i.exec(v.nombre);
    let texto;
    if (unidades) {
      const n = Number(unidades[1]) * c.cantidad;
      texto = n + ' ' + (n === 1 ? nombre.toLowerCase() : plural(nombre.toLowerCase()));
    } else {
      texto = (c.cantidad > 1 ? c.cantidad + ' × ' : '') + nombre + ' ' + v.nombre.replace(/^(Bolsa|Frasco)\s+/i, '');
    }
    return { texto, foto: fotoDe(v) };
  }).filter(Boolean);
}

async function rest(ruta, opciones) {
  const res = await fetch(CONFIG.SUPABASE_URL + '/rest/v1/' + ruta, Object.assign({
    headers: { apikey: CONFIG.SUPABASE_KEY, 'Content-Type': 'application/json' }
  }, opciones || {}));
  if (!res.ok) throw new Error('rest ' + res.status);
  return res.json();
}

async function descargarCatalogo() {
  // Si aún no están las migraciones 011/015 (foto por tamaño, envío por ciudad, envío gratis por tamaño),
  // se pide sin esas columnas.
  const pedir = (ruta, extra) => rest(ruta.replace('{extra}', extra)).catch(() => rest(ruta.replace('{extra}', '')));
  const [productos, variantes, ajustes, componentes] = await Promise.all([
    rest('productos?select=id,nombre,categoria,descripcion,imagen,ruta,orden,etiqueta,fotos&order=orden')
      .catch(() => pedir('productos?select=id,nombre,categoria,descripcion,imagen,ruta,orden{extra}&order=orden', ',etiqueta')),
    rest('variantes?select=id,producto_id,nombre,detalle,precio,precio_antes,orden,imagen,envio_gratis&order=orden')
      .catch(() => pedir('variantes?select=id,producto_id,nombre,detalle,precio,precio_antes,orden{extra}&order=orden', ',imagen')),
    rest('ajustes?select=envio_gratis_desde,envio_base,envio_departamentos,prioritario,envio_ciudades,wompi_activo,regalo_desde,regalo_variante,pedido_minimo,bono_wompi,bono_dias&id=eq.1')
      .catch(() => rest('ajustes?select=envio_gratis_desde,envio_base,envio_departamentos,prioritario,envio_ciudades,wompi_activo,regalo_desde,regalo_variante&id=eq.1'))
      .catch(() => rest('ajustes?select=envio_gratis_desde,envio_base,envio_departamentos,prioritario,envio_ciudades,wompi_activo&id=eq.1'))
      .catch(() => pedir('ajustes?select=envio_gratis_desde,envio_base,envio_departamentos,prioritario{extra}&id=eq.1', ',envio_ciudades')),
    // Qué trae cada combo (migración 030). Sin la migración, los combos muestran su descripción.
    rest('variante_componentes?select=combo_id,componente_id,cantidad').catch(() => [])
  ]);
  if (!productos.length || !variantes.length) throw new Error('catálogo vacío');
  return { productos, variantes, ajustes: ajustes[0], componentes };
}

// Se muestra al instante lo guardado en esta visita y siempre se actualiza por detrás,
// para que los cambios del gestor (precios, etiquetas, productos) se vean al recargar.
async function cargarCatalogo(alCambiar) {
  let guardado = null;
  try { guardado = JSON.parse(leer('rv-catalogo') || 'null'); } catch (e) {}
  indexar(guardado && guardado.datos ? guardado.datos : RESPALDO);
  try {
    const datos = await descargarCatalogo();
    guardar('rv-catalogo', JSON.stringify({ en: Date.now(), datos }));
    indexar(datos);
  } catch (e) { /* se queda con lo que había */ }
  catalogoListo = true;
  alCambiar();
}
// Mientras llega el catálogo, un producto que no está en lo guardado dice «Cargando…», no «no disponible».
let catalogoListo = false;

const prodDe = (v) => T.prodPorId[v.producto_id];
const nombreLargo = (v) => prodDe(v).nombre + ' · ' + v.nombre;
const urlProducto = (p) => p.ruta || '/producto/?p=' + encodeURIComponent(p.id);
// Descuento en % frente al precio tachado (0 si no tiene).
const pctAhorro = (v) => (v.precio_antes > v.precio ? Math.round(100 - (100 * v.precio) / v.precio_antes) : 0);
const fotoDe = (v) => v.imagen || prodDe(v).imagen || '/assets/img/logo.jpg';

// Tarifa de envío: la de la ciudad (si hay), si no la del departamento, si no la normal.
function tarifaEnvio(departamento, ciudad) {
  const A = T.ajustes;
  const porCiudad = (A.envio_ciudades || {})[departamento + '|' + ciudad];
  if (porCiudad != null) return Number(porCiudad);
  const porDep = (A.envio_departamentos || {})[departamento];
  return Number(porDep != null ? porDep : A.envio_base);
}

/* ---------- Carrito ---------- */

let carrito = {};
try { carrito = JSON.parse(leerL('rv-carrito') || '{}') || {}; } catch (e) { carrito = {}; }
let cupon = null;
try { cupon = JSON.parse(leer('rv-cupon') || 'null'); } catch (e) {}
// Bono de Wompi del cliente (migración 029): se busca al escribir el celular en el formulario.
// bonoCliente = { celular, monto, vence } · usarBono: el cliente lo puede guardar para después.
let bonoCliente = null;
let usarBono = true;
const bonoAplicado = () => !!(bonoCliente && usarBono);

function guardarCarrito() { guardarL('rv-carrito', JSON.stringify(carrito)); }

function lineas() {
  return Object.keys(carrito)
    .filter((id) => T.porId[id] && carrito[id] > 0)
    .map((id) => ({ v: T.porId[id], q: carrito[id] }));
}

// Mismo cálculo que la función crear-pedido (descuentoCupon).
function descuentoCupon(c, ls, subtotal) {
  if (!c || subtotal < c.minimo) return 0;
  const base = c.producto_id ? ls.filter((l) => l.v.producto_id === c.producto_id).reduce((s, l) => s + l.v.precio * l.q, 0) : subtotal;
  if (!base) return 0;
  return Math.min(base, c.tipo === 'porcentaje' ? Math.round(base * Math.min(c.valor, 100) / 100 / 100) * 100 : c.valor);
}

function cuentas(departamento, ciudad) {
  const ls = lineas();
  const subtotal = ls.reduce((s, l) => s + l.v.precio * l.q, 0);
  const ahorroPromo = ls.reduce((s, l) => s + (l.v.precio_antes > l.v.precio ? (l.v.precio_antes - l.v.precio) * l.q : 0), 0);
  const unidades = ls.reduce((s, l) => s + l.q, 0);
  const descuento = descuentoCupon(cupon, ls, subtotal);
  const neto = subtotal - descuento;
  const meta = T.ajustes.envio_gratis_desde;
  // Los tamaños con envío gratis (los combos) hacen gratis todo el pedido, igual que en crear-pedido.
  const porCombo = ls.some((l) => l.v.envio_gratis);
  const gratis = unidades > 0 && (porCombo || neto >= meta);
  const tarifa = departamento ? tarifaEnvio(departamento, ciudad || '') : null;
  // Regalo (migración 024): mismo cálculo que crear-pedido (productos ya con cupón).
  const regaloDesde = T.ajustes.regalo_variante ? Number(T.ajustes.regalo_desde) || 0 : 0;
  const regalo = !!regaloDesde && unidades > 0 && neto >= regaloDesde;
  // Pedido mínimo (migración 029): en productos, antes de cupón y bono. Igual que crear-pedido.
  const minimo = Number(T.ajustes.pedido_minimo) || 0;
  const puede = unidades > 0 && subtotal >= minimo;
  // Bono de Wompi: se descuenta al final (no cuenta para el mínimo, el envío gratis ni el regalo).
  const bono = puede && bonoAplicado() ? Math.min(bonoCliente.monto, neto) : 0;
  return {
    ls, subtotal, unidades, descuento, neto, gratis, porCombo,
    regaloDesde, regalo, minimo, puede, bono,
    faltaMinimo: Math.max(0, minimo - subtotal),
    // 0: aún no puede pedir · 1: puede pedir · 2: envío gratis · 3: regalo
    nivel: !puede ? 0 : regalo ? 3 : gratis ? 2 : 1,
    faltaRegalo: regaloDesde && !regalo ? Math.max(0, regaloDesde - neto) : 0,
    pctRegalo: regaloDesde ? Math.min(100, Math.round(neto / regaloDesde * 100)) : 0,
    ahorro: ahorroPromo + descuento,
    falta: gratis ? 0 : Math.max(0, meta - neto),
    pct: gratis ? 100 : (meta ? Math.min(100, Math.round(neto / meta * 100)) : 100),
    envio: gratis ? 0 : tarifa
  };
}

// «Codornices · Bolsa 50 g» (o un nombre genérico si ese tamaño no está a la venta en la tienda).
function nombreRegalo() {
  const v = T.porId[T.ajustes.regalo_variante];
  return v ? nombreLargo(v) : 'Codornices de 50 g';
}

function agregar(id, n, opciones) {
  const v = T.porId[id];
  if (!v) return;
  carrito[id] = Math.min(20, (carrito[id] || 0) + (n || 1));
  guardarCarrito();
  track('AddToCart', { content_ids: [id], content_type: 'product', content_name: nombreLargo(v), num_items: n || 1, value: v.precio * (n || 1), currency: 'COP' });
  actualizar();
  $$('[data-contador]').forEach((c) => { c.classList.remove('rv-salto'); void c.offsetWidth; c.classList.add('rv-salto'); });
  if (!(opciones && opciones.silencioso)) avisoAgregado(v, n || 1);
}

function cambiar(id, q) {
  if (q <= 0) delete carrito[id]; else carrito[id] = Math.min(20, q);
  guardarCarrito();
  actualizar();
}

/* ---------- Avisos ---------- */

// Tarjeta "Agregado al carrito": qué entró, cuánto vale, cómo va el carrito y botón para verlo.
// Se queda mientras el cliente tenga el mouse o el dedo encima.
// «Frasco 100 g · 2 unidades», pero sin repetir cuando el tamaño ya se llama «1 unidad».
function nombreConCantidad(v, n) {
  const cant = n + (n === 1 ? ' unidad' : ' unidades');
  if (n === 1 && /\bunidad(es)?\b/i.test(v.nombre)) return v.nombre;
  return v.nombre.trim().toLowerCase() === cant ? v.nombre : v.nombre + ' · ' + cant;
}

function avisoAgregado(v, n) {
  let t = $('#aviso-carrito');
  if (!t) {
    t = document.createElement('div');
    t.id = 'aviso-carrito';
    t.className = 'aviso-carrito';
    t.setAttribute('role', 'status');
    document.body.appendChild(t);
    t.addEventListener('click', (e) => {
      if (e.target.closest('[data-ver-carrito]')) { cerrarAviso(); abrirCarrito(); }
      else if (e.target.closest('[data-cerrar-aviso]')) cerrarAviso();
    });
    t.addEventListener('pointerenter', () => clearTimeout(avisoAgregado.temp));
    t.addEventListener('pointerleave', () => programarCierre(3000));
    t.addEventListener('focusin', () => clearTimeout(avisoAgregado.temp));
  }
  const k = cuentas();
  t.innerHTML = '<div class="aviso-cab">' + ICONO.check + '<strong>¡Agregado a tu carrito!</strong>' +
    '<button type="button" class="aviso-x" data-cerrar-aviso aria-label="Cerrar aviso">' + ICONO.cerrar + '</button></div>' +
    '<div class="aviso-prod"><img src="' + esc(fotoDe(v)) + '" alt="" width="64" height="64">' +
    '<div><strong>' + esc(prodDe(v).nombre) + '</strong><span>' + esc(nombreConCantidad(v, n)) + '</span></div>' +
    '<strong class="aviso-precio">' + pesos(v.precio * n) + '</strong></div>' +
    '<p class="aviso-total">Tu carrito: <b>' + k.unidades + (k.unidades === 1 ? ' producto' : ' productos') + ' · ' + pesos(k.neto) + '</b>' +
    (k.gratis && k.puede ? ' · <span class="verde">envío GRATIS</span>' : '') + '</p>' +
    (!k.puede ? '<p class="aviso-regalo">' + ICONO.candado + '<span>Te faltan <b>' + pesos(k.faltaMinimo) + '</b> para poder pedir</span></p>' : '') +
    (k.regalo ? '<p class="aviso-regalo">' + ICONO.regalo + '<span>¡Ganaste <b>' + esc(nombreRegalo()) + '</b> de regalo!</span></p>'
      : k.regaloDesde && k.gratis ? '<p class="aviso-regalo">' + ICONO.regalo + '<span>Te faltan <b>' + pesos(k.faltaRegalo) + '</b> para tu regalo</span></p>' : '') +
    '<div class="aviso-botones"><button type="button" class="btn" data-ver-carrito>' + (k.puede ? 'Ver mi carrito' : 'Ver mi paquete') + ICONO.flecha + '</button>' +
    '<button type="button" class="aviso-seguir" data-cerrar-aviso>Seguir comprando</button></div>';
  t.hidden = false;
  ubicarAviso(t);
  t.classList.remove('rv-entra'); void t.offsetWidth; t.classList.add('rv-entra');
  programarCierre(7000);
}
// Justo debajo del ícono del carrito del encabezado, con la flecha apuntándole.
function ubicarAviso(t) {
  const icono = $('.cab [data-abrir-carrito]');
  if (!icono) return;
  const r = icono.getBoundingClientRect();
  const derecha = Math.max(16, innerWidth - r.right);
  t.style.top = Math.max(8, r.bottom + 10) + 'px';
  t.style.right = derecha + 'px';
  t.style.setProperty('--flecha', Math.max(14, innerWidth - derecha - (r.left + r.width / 2) - 8) + 'px');
}
function programarCierre(ms) {
  clearTimeout(avisoAgregado.temp);
  avisoAgregado.temp = setTimeout(cerrarAviso, ms);
}
function cerrarAviso() {
  clearTimeout(avisoAgregado.temp);
  const t = $('#aviso-carrito');
  if (t) t.hidden = true;
}

function lanzarConfeti(contenedor) {
  if (reducirMovimiento || !contenedor) return;
  const c = document.createElement('div');
  c.className = 'confeti';
  c.setAttribute('aria-hidden', 'true');
  const colores = ['#C2185B', '#D9A441', '#4F5D3A', '#FBEAF1', '#FFFFFF', '#E6EADB'];
  let html = '';
  for (let i = 0; i < 30; i++) {
    html += '<i style="left:' + ((i * 37) % 100) + '%;width:' + (6 + (i % 3) * 2) + 'px;height:' + (10 + (i % 4) * 2) + 'px;background:' + colores[i % colores.length] +
      ';border-radius:' + (i % 3 === 0 ? '50%' : '2px') + ';animation-duration:' + (1.6 + (i % 5) * .25).toFixed(2) + 's;animation-delay:' + ((i % 7) * .08).toFixed(2) + 's"></i>';
  }
  c.innerHTML = html;
  contenedor.appendChild(c);
  setTimeout(() => c.remove(), 3200);
}

/* ---------- Barra de metas: pedir · envío gratis · regalo (migración 029) ----------
   Un camino con un premio por meta. Cada tramo se llena completo hasta su premio y el
   premio se enciende: candado que se abre (ya puedes pedir), camión (envío gratis) y regalo. */

const CANDADO_ABIERTO = '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.8-1.2"/></svg>';

function metasLista() {
  const A = T.ajustes;
  const l = [];
  const min = Number(A.pedido_minimo) || 0;
  if (min) l.push({ k: 'pedir', valor: min, nombre: 'Pedido mín.', hecho: 'Ya puedes pedir' });
  l.push({ k: 'envio', valor: Number(A.envio_gratis_desde) || 0, nombre: 'Envío gratis', hecho: 'Envío gratis' });
  const reg = A.regalo_variante ? Number(A.regalo_desde) || 0 : 0;
  if (reg) l.push({ k: 'regalo', valor: reg, nombre: 'Regalo', hecho: 'Regalo' });
  return l;
}

function textoMetas(k) {
  const A = T.ajustes;
  if (!k.unidades) {
    return (k.minimo ? 'Pides desde <strong>' + pesos(k.minimo) + '</strong> · ' : '') + 'Envío <strong>GRATIS</strong> desde ' + pesos(A.envio_gratis_desde);
  }
  if (!k.puede) return 'Te faltan <strong>' + pesos(k.faltaMinimo) + '</strong> para poder pedir';
  if (k.regalo) return '<strong>¡Envío GRATIS y regalo desbloqueados!</strong>';
  if (k.gratis) return k.regaloDesde ? '<strong>¡Envío GRATIS!</strong> Te faltan <strong>' + pesos(k.faltaRegalo) + '</strong> para tu regalo' : '<strong>¡Envío GRATIS desbloqueado!</strong>';
  return (k.minimo ? '<b class="metas-ok">Ya puedes pedir.</b> ' : '') + 'Te faltan <strong>' + pesos(k.falta) + '</strong> para el envío gratis';
}

function iconoMeta(m, hecho) {
  if (m.k === 'pedir') return hecho ? CANDADO_ABIERTO : ICONO.candado;
  return m.k === 'envio' ? ICONO.camion : ICONO.regalo;
}

// conEtiquetas: debajo de cada premio, su nombre y monto (en el carrito). En la barra de arriba solo los íconos.
function pintarMetas(el, k, conEtiquetas) {
  const lista = metasLista();
  const firma = lista.map((m) => m.k + m.valor).join(',') + (conEtiquetas ? 'e' : '');
  if (el.dataset.firma !== firma) {
    el.innerHTML = '<div class="metas' + (conEtiquetas ? ' metas--etiquetas' : '') + '"><p class="metas-msg" data-msg aria-live="polite"></p>' +
      '<div class="metas-camino" role="progressbar" aria-valuemin="0" aria-valuemax="' + lista.length + '">' +
      lista.map((m) => '<span class="metas-tramo"><i></i></span><span class="metas-nodo" data-nodo="' + m.k + '"><span class="metas-ico"></span>' +
        (conEtiquetas ? '<small></small>' : '') + '</span>').join('') + '</div></div>';
    el.dataset.firma = firma;
  }
  $('[data-msg]', el).innerHTML = textoMetas(k);
  const tramos = $$('.metas-tramo i', el);
  const nodos = $$('.metas-nodo', el);
  let hechas = 0;
  lista.forEach((m, i) => {
    const desde = i ? lista[i - 1].valor : 0;
    const base = m.k === 'pedir' ? k.subtotal : k.neto;
    const hecho = m.k === 'pedir' ? k.puede : m.k === 'envio' ? k.gratis && k.puede : k.regalo && k.puede;
    const f = hecho ? 1 : (k.unidades ? Math.max(0, Math.min(1, (base - desde) / Math.max(1, m.valor - desde))) : 0);
    if (hecho) hechas++;
    tramos[i].style.width = Math.round(f * 100) + '%';
    const n = nodos[i];
    const actual = !hecho && (i === 0 || nodos[i - 1].classList.contains('hecho'));
    n.classList.toggle('hecho', hecho);
    n.classList.toggle('actual', actual);
    $('.metas-ico', n).innerHTML = iconoMeta(m, hecho);
    n.setAttribute('aria-label', (hecho ? m.hecho + ': listo' : m.nombre + ' desde ' + pesos(m.valor)));
    const s = $('small', n);
    if (s) s.innerHTML = hecho ? '<b>' + esc(m.hecho) + '</b>' : esc(m.nombre) + '<br>' + pesos(m.valor);
  });
  const camino = $('.metas-camino', el);
  camino.setAttribute('aria-valuenow', String(hechas));
  camino.setAttribute('aria-label', 'Metas cumplidas: ' + hechas + ' de ' + lista.length);
}

// Barra de arriba: una meta a la vez. Primero completar el pedido; cuando se llena, la barra
// empieza de nuevo hacia el envío gratis, y después hacia el regalo.
function pintarBarraEnvio(el, k) {
  if (!el.dataset.listo) {
    el.innerHTML = '<div class="envio-barra-in"><p>' + ICONO.camion + '<span data-msg aria-live="polite"></span></p>' +
      '<div class="riel" role="progressbar" aria-valuemin="0" aria-valuemax="100"><span></span></div></div>';
    el.dataset.listo = '1';
  }
  const A = T.ajustes;
  const envioDesde = Number(A.envio_gratis_desde) || 0;
  const clamp = (x) => Math.max(0, Math.min(1, x));
  let msg, f, etiqueta;
  if (!k.unidades) {
    // Una sola línea en celular: textos cortos, la barra no debe robar pantalla.
    msg = (k.minimo ? 'Mín. <strong>' + pesos(k.minimo) + '</strong> · ' : '') + 'Envío <strong>GRATIS</strong> desde ' + pesos(envioDesde);
    f = 0; etiqueta = 'Avance de tu pedido';
  } else if (!k.puede) {
    msg = 'Te faltan <strong>' + pesos(k.faltaMinimo) + '</strong> para completar tu pedido';
    f = k.subtotal / k.minimo; etiqueta = 'Avance hacia el pedido mínimo';
  } else if (!k.gratis) {
    msg = 'Te faltan <strong>' + pesos(k.falta) + '</strong> para el envío GRATIS';
    const desde = Math.min(k.minimo, envioDesde);
    f = (k.neto - desde) / Math.max(1, envioDesde - desde); etiqueta = 'Avance hacia el envío gratis';
  } else if (k.regaloDesde && !k.regalo) {
    msg = '<strong>¡Envío GRATIS!</strong> Faltan <strong>' + pesos(k.faltaRegalo) + '</strong> para tu regalo';
    f =(k.neto - envioDesde) / Math.max(1, k.regaloDesde - envioDesde); etiqueta = 'Avance hacia el regalo';
  } else {
    msg = '<strong>' + (k.regalo ? '¡Envío GRATIS y regalo desbloqueados!' : '¡Desbloqueaste el envío GRATIS!') + '</strong>';
    f = 1; etiqueta = 'Metas cumplidas';
  }
  $('[data-msg]', el).innerHTML = msg;
  el.classList.toggle('gratis', k.puede && k.gratis);
  el.classList.remove('casi');
  const pct = Math.round(clamp(f) * 100);
  const riel = $('.riel', el);
  riel.setAttribute('aria-valuenow', String(pct));
  riel.setAttribute('aria-label', etiqueta);
  $('span', riel).style.width = (k.unidades ? Math.max(3, pct) : 0) + '%';
}

/* Celebración al cumplir una meta: insignia, confeti y vibración. Al llegar al regalo, la ruleta. */
const TEXTO_INSIGNIA = ['', 'Pedido desbloqueado', 'Envío gratis desbloqueado', 'Regalo desbloqueado'];
function celebrar(nivel) {
  let t = $('#insignia-meta');
  if (!t) {
    t = document.createElement('div');
    t.id = 'insignia-meta';
    t.className = 'insignia-meta';
    t.setAttribute('role', 'status');
    document.body.appendChild(t);
  }
  t.innerHTML = '<span class="insignia-check">' + ICONO.check + '</span>' + TEXTO_INSIGNIA[nivel];
  t.hidden = false;
  t.classList.remove('rv-sube'); void t.offsetWidth; t.classList.add('rv-sube');
  clearTimeout(celebrar.temp);
  celebrar.temp = setTimeout(() => { t.hidden = true; }, 2600);
  const carritoAbierto = $('#carrito') && $('#carrito').open;
  lanzarConfeti(carritoAbierto ? $('[data-metas-panel]', $('#carrito')) : $('.cab [data-envio-barra]'));
  if (!reducirMovimiento) { try { if (navigator.vibrate) navigator.vibrate([30, 40, 30]); } catch (e) {} }
  if (nivel === 1) {
    $$('[data-finalizar], [data-barra-btn]').forEach((b) => { b.classList.remove('rv-desbloqueo'); void b.offsetWidth; b.classList.add('rv-desbloqueo'); });
  }
  if (nivel === 3 && !leer('rv-ruleta')) {
    guardar('rv-ruleta', '1');
    setTimeout(abrirRuleta, 1300);
  }
}

/* ---------- Pintar todo lo que depende del carrito ---------- */

// Nivel de metas antes del último cambio. La primera pintada solo lo anota (no celebra al cargar la página).
let nivelAntes = Number(leer('rv-nivel') || '0');
let primeraPintada = true;

function actualizar() {
  const k = cuentas();
  programarCarritoGuardado();
  $$('[data-contador]').forEach((c) => { c.textContent = k.unidades; c.dataset.n = String(k.unidades); });
  $$('[data-envio-barra]').forEach((el) => pintarBarraEnvio(el, k));
  medirCabecera(); // el texto de la barra puede ocupar una o dos líneas
  $$('[data-agregar]').forEach((b) => {
    const q = carrito[b.dataset.agregar] || 0;
    b.classList.toggle('en-carrito', q > 0);
    if (b.classList.contains('btn-agregar')) b.innerHTML = (q ? ICONO.check + 'Agregado (' + q + ')' : ICONO.mas + 'Agregar');
    if (b.classList.contains('btn-mas')) b.innerHTML = q ? ICONO.check : ICONO.mas;
  });
  $$('[data-elegir]').forEach((b) => {
    const q = T.variantes.filter((v) => v.producto_id === b.dataset.elegir).reduce((s, v) => s + (carrito[v.id] || 0), 0);
    b.classList.toggle('en-carrito', q > 0);
    b.innerHTML = q ? ICONO.check + 'Agregado (' + q + ')' : ICONO.mas + 'Agregar';
  });
  if ($('#elegir') && $('#elegir').open) pintarElegir();
  if (compra.variante && T.porId[compra.variante] && $('#compra-agregar')) pintarCompraPaquete(T.porId[compra.variante]);
  pintarBarraFija(k);
  if ($('#carrito') && $('#carrito').open) pintarCarrito();
  if ($('#pedido-modal') && $('#pedido-modal').open && !$('#pedido-modal').dataset.gracias) pintarResumenPedido();

  if (k.nivel > nivelAntes && !primeraPintada && catalogoListo) celebrar(k.nivel);
  if (catalogoListo) primeraPintada = false;
  nivelAntes = k.nivel;
  guardar('rv-nivel', String(k.nivel));
}

/* ---------- Barra fija de abajo ---------- */

// En el catálogo la barra solo aparece con algo en el carrito; en un producto, siempre
// (salvo cuando se ve algo marcado con data-oculta-barra, como el bloque de compra).
let barraTapada = false;
function mostrarBarra() {
  const barra = $('#barra-t');
  if (!barra) return;
  const conCarrito = P.tipo === 'producto' || cuentas().unidades > 0;
  barra.classList.toggle('visible', conCarrito && !barraTapada);
}

function pintarBarraFija(k) {
  const barra = $('#barra-t');
  if (!barra) return;
  mostrarBarra();
  const btn = $('[data-barra-btn]', barra);
  // Por debajo del mínimo el botón dice cuánto falta (y abre el carrito con sugerencias para llegar).
  btn.classList.toggle('btn-falta', k.unidades > 0 && !k.puede);
  btn.innerHTML = !k.unidades ? 'Pedir ahora' + ICONO.flecha
    : !k.puede ? ICONO.candado + 'Te faltan ' + pesos(k.faltaMinimo) + ' para pedir'
    : 'Finalizar pedido (' + k.unidades + ')' + ICONO.flecha;
  const ahorro = $('[data-barra-ahorro]', barra);
  ahorro.hidden = !k.ahorro;
  ahorro.innerHTML = ICONO.etiqueta + 'Estás ahorrando ' + pesos(k.ahorro);
}

function iniciarBarraFija() {
  const barra = $('#barra-t');
  if (!barra) return;
  $('[data-barra-btn]', barra).addEventListener('click', () => {
    if (cuentas().unidades) return abrirCarrito();
    const destino = $(P.tipo === 'producto' ? '#comprar' : '#catalogo');
    if (destino) destino.scrollIntoView({ behavior: reducirMovimiento ? 'auto' : 'smooth', block: 'start' });
  });
  const ocultan = $$('[data-oculta-barra]');
  if (!('IntersectionObserver' in window) || !ocultan.length) { mostrarBarra(); return; }
  const vistos = new Set();
  const obs = new IntersectionObserver((entradas) => {
    entradas.forEach((e) => { if (e.isIntersecting) vistos.add(e.target); else vistos.delete(e.target); });
    barraTapada = vistos.size > 0;
    mostrarBarra();
  }, { threshold: 0.15 });
  ocultan.forEach((el) => obs.observe(el));
}

/* ---------- Catálogo en la página de inicio ---------- */

let categoria = null; // null: todavía no se ha elegido ventana (se usa la inicial de la página)
const ORDEN_VENTANAS = ['Combos', 'Huesos de res', 'Huesos de cerdo', 'Codorniz', 'Patas de pollo'];
let catPedida = new URLSearchParams(location.search).get('cat'); // /productos/?cat=Combos

const fuego = (texto) => '<span class="etq-fuego">' + ICONO.fuego + esc(texto) + '</span>';

// Una tarjeta por producto. Con un solo tamaño, "Agregar" lo agrega de una vez;
// con varios, abre la ventana para elegir cuál llevar (data-elegir).
function tarjetaProducto(vs) {
  const v = vs[0];
  const p = prodDe(v);
  const varios = vs.length > 1;
  const desde = varios ? vs.reduce((a, b) => (b.precio < a.precio ? b : a)) : v;
  const pct = Math.max.apply(null, vs.map(pctAhorro));
  const etiqueta = (p.etiqueta ? fuego(p.etiqueta) : '') + (pct
    ? '<span class="prod-etiqueta">' + (vs.some((x) => pctAhorro(x) !== pct) ? 'Hasta ' : '') + '−' + pct + '%</span>'
    : (vs.some((x) => x.envio_gratis || x.precio >= T.ajustes.envio_gratis_desde) ? '<span class="prod-etiqueta rosa">Envío gratis</span>' : ''));
  return '<article class="prod">' +
    '<a class="prod-foto" href="' + esc(urlProducto(p)) + '"><img src="' + esc(fotoDe(v)) + '" alt="' + esc(p.nombre) + '" width="600" height="600" loading="lazy">' + (etiqueta ? '<span class="prod-etiquetas">' + etiqueta + '</span>' : '') + '</a>' +
    '<div class="prod-info"><h3><a href="' + esc(urlProducto(p)) + '">' + esc(p.nombre) + '</a></h3>' +
    (varios
      ? '<div class="precio"><span class="desde">Desde</span><strong>' + pesos(desde.precio) + '</strong></div>' +
        '<span class="prod-tams">' + vs.map((x) => '<span>' + esc(x.nombre) + ' · ' + pesos(x.precio) + '</span>').join('') + '</span>' +
        '<button type="button" class="btn-agregar" data-elegir="' + esc(p.id) + '" aria-haspopup="dialog" aria-label="Elegir tamaño de ' + esc(p.nombre) + '"></button>'
      : '<span class="tam">' + esc(v.nombre) + (v.detalle ? ' · ' + esc(v.detalle) : '') + '</span>' +
        '<div class="precio"><strong>' + pesos(v.precio) + '</strong>' + (v.precio_antes > v.precio ? '<s>' + pesos(v.precio_antes) + '</s>' : '') + '</div>' +
        (p.categoria === 'Combos' ? traeHtml(v, p) : '') +
        '<button type="button" class="btn-agregar" data-agregar="' + esc(v.id) + '" aria-label="Agregar ' + esc(nombreLargo(v)) + ' al carrito"></button>') +
    '</div></article>';
}

// Combos: debajo del precio, qué trae, con una foto de cada snack (así se entiende qué se vende).
function traeHtml(v, p) {
  const lista = queTrae(v.id);
  if (!lista.length) return p.descripcion ? '<p class="prod-trae-txt">' + esc(p.descripcion) + '</p>' : '';
  return '<div class="prod-trae"><span class="prod-trae-t">Trae</span>' +
    lista.map((x) => '<span class="prod-trae-i"><img src="' + esc(x.foto) + '" alt="" width="26" height="26" loading="lazy">' + esc(x.texto) + '</span>').join('') + '</div>';
}

// Agrupa los tamaños por producto. Los primeros productos del gestor (orden 1 a DESTACADOS)
// van adelante; los demás siguen del más barato al más caro (según su tamaño más económico).
const DESTACADOS = 5;
function ordenCatalogo(vs) {
  const grupos = {};
  const lista = [];
  vs.forEach((v) => {
    if (!grupos[v.producto_id]) lista.push(grupos[v.producto_id] = []);
    grupos[v.producto_id].push(v);
  });
  lista.forEach((g) => g.sort((a, b) => a.orden - b.orden));
  const orden = (g) => prodDe(g[0]).orden;
  const minimo = (g) => Math.min.apply(null, g.map((v) => v.precio));
  const primeros = lista.filter((g) => orden(g) <= DESTACADOS).sort((a, b) => orden(a) - orden(b));
  const resto = lista.filter((g) => orden(g) > DESTACADOS).sort((a, b) => (minimo(a) - minimo(b)) || (orden(a) - orden(b)));
  return primeros.concat(resto);
}

function pintarCatalogo() {
  const caja = $('#catalogo-lista');
  if (!caja) return;
  const filtros = $('#filtro-cat');
  // Ventanas (migración 030): en este orden; «Todos» de primero; una categoría nueva del gestor va al final.
  const cats = [];
  T.variantes.forEach((v) => { const c = prodDe(v).categoria; if (cats.indexOf(c) < 0) cats.push(c); });
  const pos = (c) => { const i = ORDEN_VENTANAS.indexOf(c); return i < 0 ? 99 : i; };
  cats.sort((a, b) => pos(a) - pos(b));
  // Página de una sola categoría (p. ej. /combos/): sin filtros. Si no, ?cat=Combos preselecciona;
  // sin nada, la ventana inicial de la página (en el inicio, Combos).
  if (P.categoriaFija) categoria = P.categoriaFija;
  else if (catPedida && cats.indexOf(catPedida) >= 0) { categoria = catPedida; catPedida = null; } // se aplica cuando llega el catálogo real
  else if (categoria === null) categoria = 'categoriaInicial' in P ? P.categoriaInicial : 'Combos';
  // Mientras llega el catálogo puede no existir la ventana pedida: se muestra todo sin olvidar cuál era.
  if (!P.categoriaFija && categoria && cats.indexOf(categoria) < 0 && catalogoListo) categoria = '';
  const activa = cats.indexOf(categoria) >= 0 ? categoria : '';
  const palabras = normal(busqueda).split(/\s+/).filter(Boolean);
  const porCat = (c) => ordenCatalogo(T.variantes.filter((v) => !c || prodDe(v).categoria === c)).length;
  if (filtros) {
    filtros.innerHTML = [''].concat(cats).map((c) => '<button type="button" data-cat="' + esc(c) + '" aria-pressed="' + (!palabras.length && c === activa) + '">' +
      esc(c || 'Todos') + '<span>' + porCat(c) + '</span></button>').join('');
    filtros.hidden = cats.length < 2 || !!P.categoriaFija;
  }
  // Al buscar se busca en toda la tienda, no solo en la ventana abierta.
  let lista = ordenCatalogo(T.variantes.filter((v) => (palabras.length || !activa || prodDe(v).categoria === activa) && (!palabras.length || coincide(v, palabras))));
  // Al buscar, primero los productos cuyo nombre tiene lo buscado («fémur» → Fémur de res antes que los combos).
  if (palabras.length) {
    const enNombre = (g) => palabras.every((w) => normal(prodDe(g[0]).nombre).indexOf(w.replace(/e?s$/, '')) >= 0);
    lista = lista.filter(enNombre).concat(lista.filter((g) => !enNombre(g)));
  }
  const total = $('[data-total-catalogo]');
  if (total) total.textContent = lista.length + (lista.length === 1 ? ' producto' : ' productos');
  caja.innerHTML = lista.length ? lista.map(tarjetaProducto).join('')
    : palabras.length
      ? '<p class="catalogo-vacio">No encontramos «' + esc(busqueda.trim()) + '». Prueba con otra palabra, como «hueso», «codorniz» o «combo». <a href="/productos/">Ver todos los productos</a></p>'
      : '<p class="catalogo-vacio">' + (P.categoriaFija ? 'Pronto tendremos combos aquí.' : 'Pronto tendremos más snacks aquí.') + ' <a href="/productos/">Ver todos los productos</a></p>';
}

/* ---------- Buscador ---------- */

// /productos/?q=hueso abre con la búsqueda hecha. Sin tildes ni mayúsculas: «femur» encuentra «Fémur».
let busqueda = new URLSearchParams(location.search).get('q') || '';
const normal = (s) => String(s == null ? '' : s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
function coincide(v, palabras) {
  const p = prodDe(v);
  const texto = normal([p.nombre, p.descripcion, p.categoria, p.etiqueta].concat(T.variantes.filter((x) => x.producto_id === p.id).map((x) => x.nombre + ' ' + (x.detalle || ''))).join(' '));
  return palabras.every((w) => texto.indexOf(w) >= 0 || (w.length > 3 && /s$/.test(w) && texto.indexOf(w.replace(/e?s$/, '')) >= 0));
}

function iniciarBuscador() {
  $$('[data-buscador]').forEach((form) => {
    const input = $('input', form);
    if (!input) return;
    const enCatalogo = !!$('#catalogo-lista') && form.hasAttribute('data-en-vivo');
    if (busqueda && enCatalogo) input.value = busqueda;
    if (enCatalogo) {
      input.addEventListener('input', () => {
        busqueda = input.value;
        pintarCatalogo();
        const url = new URL(location.href);
        if (busqueda.trim()) url.searchParams.set('q', busqueda.trim()); else url.searchParams.delete('q');
        history.replaceState(null, '', url);
      });
    }
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = input.value.trim();
      if (enCatalogo) { input.blur(); const sec = $('#catalogo-lista'); if (sec) sec.scrollIntoView({ behavior: reducirMovimiento ? 'auto' : 'smooth', block: 'start' }); return; }
      location.href = '/productos/' + (q ? '?q=' + encodeURIComponent(q) : '');
    });
  });
}

/* ---------- Menú del celular (3 barritas junto al carrito) ---------- */

function iniciarMenu() {
  $$('.cab').forEach((cab) => {
    const nav = $('.cab-nav', cab);
    const fila = $('.cab-fila', cab);
    const carrito = fila && $('[data-abrir-carrito]', fila);
    if (!nav || !fila || !carrito || $('.cab-menu-btn', cab)) return;
    if (!nav.id) nav.id = 'cab-nav';
    const acciones = document.createElement('div');
    acciones.className = 'cab-acciones';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn-icono cab-menu-btn';
    btn.setAttribute('aria-label', 'Abrir menú');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', nav.id);
    btn.innerHTML = '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path class="l1" d="M4 7h16"/><path class="l2" d="M4 12h16"/><path class="l3" d="M4 17h16"/></svg>';
    fila.insertBefore(acciones, carrito);
    acciones.appendChild(btn);
    acciones.appendChild(carrito);
    // Buscador dentro del menú: lleva a /productos/?q=… con la búsqueda hecha.
    if (!$('[data-buscador]', nav)) {
      const f = document.createElement('form');
      f.className = 'buscador buscador--menu';
      f.setAttribute('role', 'search');
      f.setAttribute('data-buscador', '');
      f.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/></svg>' +
        '<input type="search" name="q" placeholder="Buscar snacks: hueso, codorniz…" aria-label="Buscar productos" autocomplete="off" enterkeyhint="search">';
      nav.insertBefore(f, nav.firstChild);
    }
    const cerrar = () => { cab.classList.remove('menu-abierto'); btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-label', 'Abrir menú'); };
    btn.addEventListener('click', () => {
      const abierto = cab.classList.toggle('menu-abierto');
      btn.setAttribute('aria-expanded', String(abierto));
      btn.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
    });
    $$('a', nav).forEach((a) => a.addEventListener('click', cerrar));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && cab.classList.contains('menu-abierto')) { cerrar(); btn.focus(); } });
    document.addEventListener('click', (e) => { if (cab.classList.contains('menu-abierto') && !cab.contains(e.target)) cerrar(); });
  });
}

// Carrusel del inicio: un snack por producto, con su precio más bajo. Se duplica para que el giro no tenga corte.
function pintarSlider() {
  const pista = $('#slider-pista');
  if (!pista) return;
  const items = T.productos.map((p) => {
    const vs = T.variantes.filter((v) => v.producto_id === p.id);
    if (!vs.length) return '';
    const desde = Math.min.apply(null, vs.map((v) => v.precio));
    return '<a class="slide" href="' + esc(urlProducto(p)) + '"><img src="' + esc(p.imagen || '/assets/img/logo.jpg') + '" alt="" width="600" height="600" loading="lazy">' + (p.etiqueta ? fuego(p.etiqueta) : '') +
      '<span>' + esc(p.nombre) + '<small>' + (vs.length > 1 ? 'Desde ' : '') + pesos(desde) + '</small></span></a>';
  }).filter(Boolean);
  const seccion = pista.closest('section');
  if (seccion) seccion.hidden = items.length < 3;
  pista.style.setProperty('--duracion', Math.max(20, items.length * 5) + 's');
  pista.innerHTML = '<div class="slider-grupo">' + items.join('') + '</div><div class="slider-grupo" aria-hidden="true">' + items.join('').replace(/<a /g, '<a tabindex="-1" ') + '</div>';
}

function pintarEscalones() {
  const caja = $('#escalones-lista');
  if (!caja) return;
  const id = caja.dataset.producto || 'codornices';
  const vs = T.variantes.filter((v) => v.producto_id === id).sort((a, b) => a.precio - b.precio);
  const seccion = caja.closest('section');
  if (vs.length < 2) { if (seccion) seccion.hidden = true; return; }
  if (seccion) seccion.hidden = false;
  // «Entre más pides, más ahorras» sin precio tachado: se compara con comprar paquetes del tamaño más pequeño
  // (p. ej. 30 patas = 6 paquetes de 5). Los tamaños que no son «N unidades» (1 kilo) no se comparan.
  const unidadesDe = (v) => { const m = /^(\d+)\s+unidad(es)?$/i.exec(v.nombre); return m ? Number(m[1]) : 0; };
  const base = vs.filter(unidadesDe).sort((a, b) => unidadesDe(a) - unidadesDe(b))[0];
  const ahorroDe = (v) => {
    const n = unidadesDe(v);
    if (!base || !n || v.id === base.id || n % unidadesDe(base)) return 0;
    return Math.max(0, (n / unidadesDe(base)) * base.precio - v.precio);
  };
  const mejor = vs.reduce((m, v) => (ahorroDe(v) > (m ? ahorroDe(m) : 0) ? v : m), null);
  caja.innerHTML = vs.map((v) => {
    const ahorra = ahorroDe(v);
    const n = unidadesDe(v);
    return '<button type="button" class="escalon' + (mejor && mejor.id === v.id ? ' destacado' : '') + '" data-agregar-escalon="' + esc(v.id) + '">' +
      '<span class="nombre"><strong>' + esc(v.nombre) + '</strong><span>' + esc(v.detalle || (n > 1 ? pesos(Math.round(v.precio / n / 10) * 10) + ' cada una' : 'Toca para agregar')) + '</span></span>' +
      '<span class="valor"><strong>' + pesos(v.precio) + '</strong></span>' +
      (ahorra ? '<span class="ahorro">Ahorras ' + pesos(ahorra) + '</span>' : '') + '</button>';
  }).join('');
}

/* ---------- Página de producto ---------- */

const compra = { variante: null, cantidad: 1, foto: null };

function variantesDelProducto() {
  return T.variantes.filter((v) => v.producto_id === P.productoId);
}

function pintarCompra() {
  const opciones = $('#compra-opciones');
  if (!opciones) return;
  const vs = variantesDelProducto();
  const caja = $('#comprar');
  const agotado = $('#compra-no-disponible');
  if (agotado && !agotado.dataset.texto) agotado.dataset.texto = agotado.innerHTML;
  if (!vs.length) {
    if (agotado) {
      agotado.hidden = false;
      agotado.classList.toggle('form-error', catalogoListo);
      agotado.classList.toggle('cargando-txt', !catalogoListo);
      agotado.innerHTML = catalogoListo ? agotado.dataset.texto : 'Cargando…';
    }
    $$('[data-solo-disponible]').forEach((el) => { el.hidden = true; });
    return;
  }
  if (agotado) agotado.hidden = true;
  $$('[data-solo-disponible]').forEach((el) => { el.hidden = false; });
  if (!compra.variante || !T.porId[compra.variante] || T.porId[compra.variante].producto_id !== P.productoId) {
    const pedida = varianteDelLink(vs);
    // Sin tamaño en el link: el de la foto principal (si está marcada con data-variante).
    const miniInicial = $('.miniaturas button[aria-pressed="true"][data-variante]');
    const deLaFoto = miniInicial && vs.find((v) => v.id === miniInicial.dataset.variante);
    const conAhorro = vs.filter((v) => v.precio_antes > v.precio).sort((a, b) => (b.precio_antes - b.precio) - (a.precio_antes - a.precio))[0];
    compra.variante = (pedida || deLaFoto || conAhorro || vs[0]).id;
  }
  const mejor = vs.filter((v) => v.precio_antes > v.precio).sort((a, b) => (b.precio_antes - b.precio) - (a.precio_antes - a.precio))[0];
  opciones.innerHTML = vs.map((v) => '<button type="button" class="opcion" data-opcion="' + esc(v.id) + '" aria-pressed="' + (v.id === compra.variante) + '">' +
    '<span class="radio"></span><span class="nom"><strong>' + esc(v.nombre) + '</strong>' + (v.detalle ? '<span>' + esc(v.detalle) + '</span>' : '') + '</span>' +
    '<span class="val">' + (v.precio_antes > v.precio ? '<s>' + pesos(v.precio_antes) + '</s>' : '') + '<strong>' + pesos(v.precio) + '</strong></span>' +
    (mejor && mejor.id === v.id ? '<span class="etq">Mejor precio</span>' : '') + '</button>').join('');
  $('#compra-opciones-caja').hidden = vs.length < 2;
  const v = T.porId[compra.variante];
  const ahorra = v.precio_antes > v.precio ? v.precio_antes - v.precio : 0;
  $('#compra-precio').innerHTML = '<strong>' + pesos(v.precio) + '</strong>' + (ahorra ? '<s>' + pesos(v.precio_antes) + '</s><span class="chip-ahorro">−' + pctAhorro(v) + '% · Ahorras ' + pesos(ahorra) + '</span>' : '');
  $('#compra-cantidad').textContent = compra.cantidad;
  const gratisTxt = $('[data-envio-gratis-desde]');
  if (gratisTxt) gratisTxt.textContent = pesos(T.ajustes.envio_gratis_desde);
  if (caja) caja.dataset.variante = v.id;
  pintarCompraPaquete(v);
  // Al cambiar de tamaño se muestra su foto: la miniatura marcada con data-variante,
  // o la foto propia del tamaño (columna Foto en el gestor).
  if (compra.foto !== v.id) {
    const primera = compra.foto === null;
    compra.foto = v.id;
    const mini = $('.miniaturas button[data-variante="' + v.id + '"]');
    // En la primera pintada no se toca la foto si ya es la correcta (así se aprovecha la versión liviana).
    if (mini) { if (!primera || mini.getAttribute('aria-pressed') !== 'true') mostrarFoto(mini.dataset.src, mini.dataset.alt, mini); }
    else if (v.imagen) mostrarFoto(v.imagen, nombreLargo(v), null);
  }
}

// Pedido mínimo (migración 029): los snacks sueltos se compran dentro de un paquete.
// El botón dice «Agregar a mi paquete» y una nota explica cómo se pide. «Pedir contra entrega»
// solo aparece si con este producto el carrito ya llega al mínimo.
function pintarCompraPaquete(v) {
  const p = prodDe(v);
  const esCombo = p && p.categoria === 'Combos';
  const minimo = Number(T.ajustes.pedido_minimo) || 0;
  const btn = $('#compra-agregar');
  if (btn) {
    const icono = $('svg', btn);
    btn.textContent = esCombo || !minimo ? 'Agregar al carrito' : 'Agregar a mi paquete';
    if (icono) btn.prepend(icono);
  }
  let nota = $('#compra-paquete');
  if (!nota && minimo && !esCombo) {
    const precio = $('#compra-precio');
    if (precio) {
      nota = document.createElement('div');
      nota.id = 'compra-paquete';
      nota.className = 'compra-paquete';
      precio.after(nota);
    }
  }
  if (nota) {
    nota.hidden = esCombo || !minimo;
    nota.innerHTML = ICONO.etiqueta + '<span><strong>Este snack va dentro de un paquete.</strong> Júntalo con un combo o con otros snacks: desde ' + pesos(minimo) + ' ya puedes pedir.</span>';
  }
  const pedir = $('#compra-pedir');
  if (pedir) {
    const k = cuentas();
    const despues = k.subtotal + (carrito[v.id] ? 0 : v.precio * compra.cantidad);
    pedir.hidden = !!minimo && despues < minimo;
  }
}

// Cambiar de foto se siente al instante: si la grande ya está descargada se pone de una; si no,
// primero se muestra la miniatura (ya está en el celular) y la grande la reemplaza apenas llega.
// Las fotos grandes de la galería se bajan en segundo plano cuando la página termina de cargar.
const precargadas = {};
function precargar(src) {
  if (!precargadas[src]) { const i = new Image(); i.decoding = 'async'; i.src = src; precargadas[src] = i; }
  return precargadas[src];
}
let fotoPedida = '';
function mostrarFoto(src, alt, mini) {
  const img = $('.galeria-p .principal img');
  if (!img || !src) return;
  fotoPedida = src;
  if (alt) img.alt = alt;
  $$('.miniaturas button').forEach((b) => b.setAttribute('aria-pressed', String(b === mini)));
  img.removeAttribute('srcset'); // si no, el navegador sigue mostrando la foto del srcset
  img.removeAttribute('sizes');
  const pre = precargar(src);
  const poner = () => { if (fotoPedida !== src) return; img.src = src; img.classList.remove('foto-cargando'); };
  if (pre.complete && pre.naturalWidth) { poner(); return; }
  const miniImg = mini && $('img', mini);
  if (miniImg && miniImg.complete && miniImg.naturalWidth) img.src = miniImg.currentSrc || miniImg.src;
  img.classList.add('foto-cargando');
  if (pre.decode) pre.decode().then(poner, poner);
  else { pre.addEventListener('load', poner); pre.addEventListener('error', poner); }
}
function precargarGaleria() {
  if (!$('.miniaturas') || (navigator.connection && navigator.connection.saveData)) return;
  const todas = () => $$('.miniaturas button[data-src]').forEach((b) => precargar(b.dataset.src));
  const luego = () => (window.requestIdleCallback ? requestIdleCallback(todas, { timeout: 2500 }) : setTimeout(todas, 1200));
  if (document.readyState === 'complete') luego(); else window.addEventListener('load', luego, { once: true });
  // Si la persona va a tocar una miniatura antes, se bajan ya.
  const minis = $('.miniaturas');
  minis.addEventListener('pointerover', todas, { once: true });
  minis.addEventListener('touchstart', todas, { once: true, passive: true });
}

// Tamaño pedido en el link del anuncio: ?t=50g, ?t=100g, ?t=10-unidades o el id completo.
function varianteDelLink(vs) {
  const q = new URLSearchParams(location.search);
  const t = (q.get('t') || q.get('tamano') || '').trim().toLowerCase();
  if (!t) return null;
  const limpio = t.replace(/[^a-z0-9]+/g, '');
  return vs.find((v) => v.id === t)
    || vs.find((v) => v.id.endsWith('-' + t))
    || vs.find((v) => v.id.replace(/[^a-z0-9]+/g, '').endsWith(limpio))
    || vs.find((v) => v.nombre.toLowerCase().replace(/[^a-z0-9]+/g, '').indexOf(limpio) >= 0)
    || null;
}

function pintarCombina() {
  const caja = $('#combina');
  if (!caja) return;
  const otros = T.variantes.filter((v) => v.producto_id !== P.productoId);
  // Primero las codornices (las que se sugieren para llegar al envío gratis).
  const peso = (v) => (PRODUCTOS_SUGERIDOS.indexOf(v.producto_id) >= 0 ? 0 : 1);
  otros.sort((a, b) => peso(a) - peso(b)); // sort estable: lo demás conserva su orden
  // Un tamaño por producto, primero lo que ayuda a llegar al envío gratis.
  const vistos = {};
  const lista = otros.filter((v) => (vistos[v.producto_id] ? false : (vistos[v.producto_id] = true))).slice(0, 4);
  const seccion = caja.closest('section');
  if (seccion) seccion.hidden = !lista.length;
  caja.innerHTML = lista.map((v) => '<div class="combina-item"><img src="' + esc(fotoDe(v)) + '" alt="" width="64" height="64" loading="lazy">' +
    '<div><strong><a href="' + esc(urlProducto(prodDe(v))) + '" style="color: inherit; text-decoration: none">' + esc(prodDe(v).nombre) + '</a></strong><span>' + esc(v.nombre) + ' · ' + pesos(v.precio) +
    (v.envio_gratis || v.precio >= T.ajustes.envio_gratis_desde ? ' · envío gratis' : '') + '</span></div>' +
    '<button type="button" class="btn-mas" data-agregar="' + esc(v.id) + '" aria-label="Agregar ' + esc(nombreLargo(v)) + '"></button></div>').join('');
}

// Combos: lo que costaría comprar lo mismo por separado (con el envío, si el combo lo incluye).
// data-combo-separado="id-del-tamaño:unidades,…" lo escribe el generador de landings.
function pintarSeparado() {
  $$('[data-combo-separado]').forEach((el) => {
    const combo = variantesDelProducto()[0];
    const partes = el.dataset.comboSeparado.split(',').map((x) => x.split(':'));
    if (!combo || partes.some((x) => !T.porId[x[0]])) { el.hidden = true; return; }
    const productos = partes.reduce((s, x) => s + T.porId[x[0]].precio * Number(x[1]), 0);
    // Por separado solo pagaría envío si no llega al mínimo del envío gratis.
    const envio = combo.envio_gratis && productos < T.ajustes.envio_gratis_desde ? Number(T.ajustes.envio_base) || 0 : 0;
    const suelto = productos + envio;
    el.hidden = suelto <= combo.precio;
    if (!el.hidden) {
      el.innerHTML = 'Por separado' + (envio ? ', con el envío,' : '') + ' pagarías <s>' + pesos(suelto) + '</s>. ' +
        'Con el combo pagas ' + pesos(combo.precio) + ' y <strong>ahorras ' + pesos(suelto - combo.precio) + '</strong>.';
    }
  });
}

// Fotos subidas desde el gestor (links completos, migración 017): la portada pasa a ser la foto
// principal de la landing y las fotos extra se suman como miniaturas. Las fotos del sitio (/assets/…)
// ya vienen en la landing, así que no se tocan.
function pintarFotosSubidas() {
  const p = T.prodPorId[P.productoId];
  const galeria = $('.galeria-p');
  if (!p || !galeria || P.generico) return;
  const subida = (src) => /^https?:/.test(src || '');
  const portada = subida(p.imagen) ? p.imagen : null;
  const extra = (Array.isArray(p.fotos) ? p.fotos : []).filter(Boolean);
  $$('[data-subida]', galeria).forEach((b) => b.remove()); // por si se pinta dos veces
  if (!portada && !extra.length) return;

  // Sin foto todavía (recuadro "foto muy pronto"): se cambia por una imagen.
  const principal = $('.principal', galeria);
  const pendiente = $('.pendiente', principal);
  if (pendiente) {
    const img = document.createElement('img');
    img.width = 600; img.height = 600; img.alt = p.nombre;
    pendiente.replaceWith(img);
  }
  let minis = $('.miniaturas', galeria);
  if (!minis) {
    minis = document.createElement('div');
    minis.className = 'miniaturas';
    minis.setAttribute('role', 'group');
    minis.setAttribute('aria-label', 'Fotos del producto');
    galeria.append(minis);
  }
  const boton = (src) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.subida = '';
    b.dataset.src = src;
    b.dataset.alt = p.nombre;
    b.setAttribute('aria-pressed', 'false');
    b.setAttribute('aria-label', 'Ver foto de ' + p.nombre);
    b.innerHTML = '<img src="' + esc(src) + '" alt="" width="64" height="64" loading="lazy">';
    return b;
  };
  if (portada) minis.prepend(boton(portada));
  extra.forEach((src) => minis.append(boton(src)));
  const primera = portada || (pendiente ? extra[0] : null);
  if (primera) mostrarFoto(primera, p.nombre, $('[data-subida]', minis));
}

// Página genérica /producto/?p=id: nombre, foto y descripción salen del catálogo.
function pintarProductoGenerico() {
  if (!P.generico) return;
  const p = T.prodPorId[P.productoId];
  $$('[data-p-nombre]').forEach((el) => { el.textContent = p ? p.nombre : (catalogoListo ? 'Producto no disponible' : 'Cargando…'); });
  $$('[data-p-desc]').forEach((el) => { el.textContent = p ? (p.descripcion || '') : (catalogoListo ? 'Este snack no está disponible por ahora. Mira los demás en la tienda.' : ''); });
  $$('[data-p-img]').forEach((el) => { if (p && p.imagen) { el.src = p.imagen; el.alt = p.nombre; } });
  if (p) document.title = p.nombre + ' · Revoltosos';
}

function iniciarCompra() {
  document.addEventListener('click', (e) => {
    const op = e.target.closest('[data-opcion]');
    if (op) { compra.variante = op.dataset.opcion; pintarCompra(); return; }
    const mini = e.target.closest('.miniaturas button[data-src]');
    if (mini) {
      mostrarFoto(mini.dataset.src, mini.dataset.alt, mini);
      // Si la foto es de un tamaño (p. ej. la bolsa), ese tamaño queda elegido.
      const vid = mini.dataset.variante;
      if (vid && T.porId[vid] && vid !== compra.variante) { compra.variante = vid; compra.foto = vid; pintarCompra(); }
    }
  });
  const menos = $('#compra-menos');
  if (!menos) return;
  menos.addEventListener('click', () => { compra.cantidad = Math.max(1, compra.cantidad - 1); pintarCompra(); });
  $('#compra-mas').addEventListener('click', () => { compra.cantidad = Math.min(20, compra.cantidad + 1); pintarCompra(); });
  $('#compra-agregar').addEventListener('click', () => {
    agregar(compra.variante, compra.cantidad);
    compra.cantidad = 1;
    pintarCompra();
  });
  // "Pedir contra entrega": mete el producto (si no estaba) y abre el formulario con contra entrega ya elegido.
  const pedir = $('#compra-pedir');
  if (pedir) pedir.addEventListener('click', () => {
    if (!carrito[compra.variante]) agregar(compra.variante, compra.cantidad, { silencioso: true });
    compra.cantidad = 1;
    pintarCompra();
    abrirPedido();
    const form = $('#form-pedido');
    if (form) {
      $$('[name="metodo_pago"]', form).forEach((x) => { x.checked = x.value === 'contraentrega'; });
      pintarResumenPedido();
    }
  });
}

/* ---------- Carrito (panel) ---------- */

function crearDialogos() {
  const c = document.createElement('dialog');
  c.id = 'carrito';
  c.className = 'panel carrito';
  c.setAttribute('aria-labelledby', 'carrito-titulo');
  c.innerHTML = '<div class="carrito-in"><div class="panel-cab"><h2 id="carrito-titulo">Tu carrito <small data-carrito-n></small></h2>' +
    '<button type="button" class="btn-icono" data-cerrar aria-label="Cerrar carrito">' + ICONO.cerrar + '</button></div>' +
    '<div class="panel-cuerpo" data-carrito-cuerpo></div>' +
    '<div class="panel-pie" data-carrito-pie><button type="button" class="btn rv-meneo" data-finalizar>Finalizar pedido' + ICONO.flecha + '</button>' +
    '<p><b>Pagas al recibir</b> · no pagas nada hoy</p></div></div>';
  document.body.appendChild(c);

  const m = document.createElement('dialog');
  m.id = 'pedido-modal';
  m.className = 'panel modal';
  m.setAttribute('aria-labelledby', 'pedido-titulo');
  m.innerHTML = '<div class="modal-in"><div class="agarre" aria-hidden="true"></div>' +
    '<div class="panel-cab"><div><h2 id="pedido-titulo">Datos para el envío</h2><p>Tarda 1 minuto. No pagas nada ahora.</p></div>' +
    '<button type="button" class="btn-icono" data-cerrar aria-label="Cerrar">' + ICONO.cerrar + '</button></div>' +
    '<div class="panel-cuerpo" data-pedido-cuerpo>' + plantillaFormulario() + '</div></div>';
  document.body.appendChild(m);

  const e = document.createElement('dialog');
  e.id = 'elegir';
  e.className = 'panel elegir';
  e.setAttribute('aria-labelledby', 'elegir-titulo');
  e.innerHTML = '<div class="elegir-in"><div class="agarre" aria-hidden="true"></div>' +
    '<div class="panel-cab"><div><h2 id="elegir-titulo"></h2><p>¿Cuál quieres llevar?</p></div>' +
    '<button type="button" class="btn-icono" data-cerrar aria-label="Cerrar">' + ICONO.cerrar + '</button></div>' +
    '<div class="panel-cuerpo" data-elegir-cuerpo></div>' +
    '<div class="panel-pie"><button type="button" class="btn" data-elegir-agregar></button></div></div>';
  document.body.appendChild(e);

  [c, m, e].forEach((d) => {
    d.addEventListener('click', (e) => { if (e.target === d || e.target.closest('[data-cerrar]')) cerrarDialogo(d); });
    d.addEventListener('close', () => {
      if (!$$('dialog.panel').some((x) => x.open)) document.documentElement.style.overflow = '';
      if (d === m && d.dataset.gracias) reiniciarFormulario();
    });
  });
  $('[data-finalizar]', c).addEventListener('click', () => {
    // Por debajo del mínimo no se abre el formulario: se muestran las sugerencias para llegar.
    if (!cuentas().puede) {
      const sug = $('#sug-minimo', c);
      if (sug) { sug.scrollIntoView({ behavior: reducirMovimiento ? 'auto' : 'smooth', block: 'center' }); sug.classList.remove('rv-meneo-1'); void sug.offsetWidth; sug.classList.add('rv-meneo-1'); }
      return;
    }
    cerrarDialogo(c);
    abrirPedido();
  });
  iniciarFormulario();
  iniciarAvisoSalida();
}

/* Aviso al intentar salir: solo en computador, una vez por visita y con algo en el carrito. */
function iniciarAvisoSalida() {
  if (!matchMedia('(hover: hover) and (pointer: fine) and (min-width: 900px)').matches) return;
  if (leer('rv-salida')) return;
  const s = document.createElement('dialog');
  s.id = 'salida';
  s.className = 'panel elegir salida';
  s.setAttribute('aria-labelledby', 'salida-titulo');
  s.innerHTML = '<div class="elegir-in"><div class="panel-cab"><div><h2 id="salida-titulo">¿Te vas?</h2><p>Tu carrito queda guardado.</p></div>' +
    '<button type="button" class="btn-icono" data-cerrar aria-label="Cerrar">' + ICONO.cerrar + '</button></div>' +
    '<div class="panel-cuerpo"><p class="salida-txt">Recuerda: <b>pagas al recibir</b> y el envío es <b>gratis desde <span data-salida-gratis></span></b>.</p></div>' +
    '<div class="panel-pie salida-botones"><button type="button" class="btn" data-salida-pedido>Terminar mi pedido' + ICONO.flecha + '</button>' +
    '<a class="btn btn--verde" data-salida-wa target="_blank" rel="noopener">' + ICONO.whatsapp + 'Preguntar por WhatsApp</a></div></div>';
  document.body.appendChild(s);
  s.addEventListener('click', (e) => {
    if (e.target === s || e.target.closest('[data-cerrar]') || e.target.closest('[data-salida-wa]')) cerrarDialogo(s);
    else if (e.target.closest('[data-salida-pedido]')) { cerrarDialogo(s); abrirPedido(); }
  });
  s.addEventListener('close', () => {
    if (!$$('dialog.panel').some((x) => x.open)) document.documentElement.style.overflow = '';
  });
  const alSalir = (e) => {
    if (e.relatedTarget || e.clientY > 0) return;
    if (!cuentas().unidades || $$('dialog').some((x) => x.open)) return;
    document.removeEventListener('mouseout', alSalir);
    guardar('rv-salida', '1');
    $('[data-salida-gratis]', s).textContent = pesos(T.ajustes.envio_gratis_desde);
    $('[data-salida-wa]', s).href = linkWhatsappCarrito('');
    abrirDialogo(s);
  };
  document.addEventListener('mouseout', alSalir);
}

function abrirDialogo(d) {
  document.documentElement.style.overflow = 'hidden';
  if (typeof d.showModal === 'function') d.showModal(); else d.setAttribute('open', '');
}
function cerrarDialogo(d) {
  if (typeof d.close === 'function') d.close(); else { d.removeAttribute('open'); d.dispatchEvent(new Event('close')); }
}

/* ---------- Elegir tamaño (productos con varios tamaños) ---------- */

const eleccion = { producto: null, variante: null, cantidad: 1 };

function abrirElegir(productoId) {
  const vs = T.variantes.filter((v) => v.producto_id === productoId);
  if (!vs.length) return;
  eleccion.producto = productoId;
  eleccion.variante = vs[0].id;
  eleccion.cantidad = 1;
  pintarElegir();
  abrirDialogo($('#elegir'));
}

function pintarElegir() {
  const d = $('#elegir');
  const vs = T.variantes.filter((v) => v.producto_id === eleccion.producto);
  const v = T.porId[eleccion.variante];
  if (!v) return;
  const mejor = vs.filter((x) => x.precio_antes > x.precio).sort((a, b) => (b.precio_antes - b.precio) - (a.precio_antes - a.precio))[0];
  $('#elegir-titulo').textContent = prodDe(v).nombre;
  $('[data-elegir-cuerpo]', d).innerHTML =
    '<img class="elegir-foto" src="' + esc(fotoDe(v)) + '" alt="" width="600" height="600">' +
    '<div class="opciones-lista" role="group" aria-label="Tamaño">' + vs.map((x) => '<button type="button" class="opcion" data-elegir-opcion="' + esc(x.id) + '" aria-pressed="' + (x.id === v.id) + '">' +
      '<span class="radio"></span><span class="nom"><strong>' + esc(x.nombre) + '</strong>' + (x.detalle ? '<span>' + esc(x.detalle) + '</span>' : '') +
      (carrito[x.id] ? '<span class="ya">Ya tienes ' + carrito[x.id] + ' en el carrito</span>' : '') + '</span>' +
      '<span class="val">' + (x.precio_antes > x.precio ? '<s>' + pesos(x.precio_antes) + '</s>' : '') + '<strong>' + pesos(x.precio) + '</strong></span>' +
      (mejor && mejor.id === x.id ? '<span class="etq">Mejor precio</span>' : '') + '</button>').join('') + '</div>' +
    '<div class="elegir-cantidad"><span>Cantidad</span><div class="cantidad" role="group" aria-label="Cantidad">' +
      '<button type="button" data-elegir-q="-1" aria-label="Quitar uno">−</button><output aria-live="polite">' + eleccion.cantidad + '</output>' +
      '<button type="button" data-elegir-q="1" aria-label="Agregar uno">+</button></div></div>';
  $('[data-elegir-agregar]', d).innerHTML = 'Agregar al carrito · ' + pesos(v.precio * eleccion.cantidad);
}

function abrirCarrito() {
  pintarCarrito();
  abrirDialogo($('#carrito'));
}

function pintarCarrito() {
  const d = $('#carrito');
  const k = cuentas();
  $('[data-carrito-n]', d).textContent = k.unidades ? '(' + k.unidades + ')' : '';
  $('[data-carrito-pie]', d).hidden = !k.unidades;
  const cuerpo = $('[data-carrito-cuerpo]', d);
  if (!k.unidades) {
    cuerpo.innerHTML = '<div class="carrito-vacio"><p>Tu carrito está vacío.</p><a class="btn" href="/#catalogo">Ver los snacks</a></div>';
    return;
  }
  const valorCupon = $('#cupon-input') ? $('#cupon-input').value : '';
  // Arriba, el camino de metas con su nombre y monto (se pinta después de armar el HTML).
  let html = '<div class="caja metas-caja' + (k.puede ? '' : ' falta') + '" data-metas-panel></div>';

  k.ls.forEach((l) => {
    html += '<div class="item-c"><img src="' + esc(fotoDe(l.v)) + '" alt="" width="72" height="72">' +
      '<div class="det"><div><strong>' + esc(prodDe(l.v).nombre) + '</strong><span>' + esc(l.v.nombre) + '</span></div>' +
      '<div class="fila"><div class="cantidad"><button type="button" data-q="' + esc(l.v.id) + '" data-d="-1" aria-label="' + (l.q === 1 ? 'Quitar ' : 'Quitar uno de ') + esc(nombreLargo(l.v)) + '">' + (l.q === 1 ? ICONO.basura : '−') + '</button>' +
      '<output>' + l.q + '</output><button type="button" data-q="' + esc(l.v.id) + '" data-d="1" aria-label="Agregar otro ' + esc(nombreLargo(l.v)) + '">+</button></div>' +
      // Precio de antes tachado, encima del precio real (sin la palabra «antes», que confundía).
      '<div class="precio-l">' + (l.v.precio_antes > l.v.precio ? '<s>' + pesos(l.v.precio_antes * l.q) + '</s>' : '') +
      '<strong>' + pesos(l.v.precio * l.q) + '</strong></div></div></div></div>';
  });

  if (!k.puede) {
    // Por debajo del mínimo: hasta 3 snacks con los que ya alcanza (o el más grande, si ninguno alcanza solo).
    const libres = T.variantes.filter((v) => !carrito[v.id]);
    const alcanzan = libres.filter((v) => v.precio >= k.faltaMinimo).sort((a, b) => a.precio - b.precio).slice(0, 3);
    const lista = alcanzan.length ? alcanzan : libres.slice().sort((a, b) => b.precio - a.precio).slice(0, 1);
    if (lista.length) {
      html += '<div class="sug-minimo" id="sug-minimo"><strong>' + (alcanzan.length ? 'Con uno de estos ya puedes pedir' : 'Súmale y te acercas al mínimo') + '</strong><div class="sug-minimo-lista">' +
        lista.map((v) => '<div class="sug-m"><img src="' + esc(fotoDe(v)) + '" alt="" width="120" height="90" loading="lazy">' +
          '<span class="sug-m-nom">' + esc(prodDe(v).nombre) + '<small>' + esc(v.nombre) + '</small></span><b>' + pesos(v.precio) + '</b>' +
          '<button type="button" data-agregar-sug="' + esc(v.id) + '" aria-label="Agregar ' + esc(nombreLargo(v)) + '">+ Agregar</button></div>').join('') +
        '</div><a class="sug-combos" href="/combos/">¿Prefieres un combo? Ver los combos</a></div>';
    }
  } else if (!k.gratis) {
    const sug = sugerencia(k);
    if (sug) {
      html += '<div class="sugerencia"><img src="' + esc(fotoDe(sug)) + '" alt="" width="56" height="56"><div><strong>' +
        (sug.precio >= k.falta ? 'Agrega ' + esc(prodDe(sug).nombre) + ' y el envío es GRATIS' : 'Súmale ' + esc(prodDe(sug).nombre) + ' y te acercas al envío gratis') +
        '</strong><span>' + esc(sug.nombre) + ' · ' + pesos(sug.precio) + '</span></div><button type="button" data-agregar-sug="' + esc(sug.id) + '">Agregar</button></div>';
    }
  } else if (k.faltaRegalo) {
    // Con envío gratis ya ganado, la sugerencia apunta al regalo.
    const sug = sugerencia({ falta: k.faltaRegalo });
    if (sug) {
      html += '<div class="sugerencia"><img src="' + esc(fotoDe(sug)) + '" alt="" width="56" height="56"><div><strong>' +
        (sug.precio >= k.faltaRegalo ? 'Agrega ' + esc(prodDe(sug).nombre) + ' y te llevas el regalo' : 'Súmale ' + esc(prodDe(sug).nombre) + ' y te acercas al regalo') +
        '</strong><span>' + esc(sug.nombre) + ' · ' + pesos(sug.precio) + '</span></div><button type="button" data-agregar-sug="' + esc(sug.id) + '">Agregar</button></div>';
    }
  }

  html += '<div class="caja cupon"><label for="cupon-input">' + ICONO.cupon + '¿Tienes un cupón?</label>';
  if (cupon) {
    html += '<p class="msg ok">Cupón ' + esc(cupon.codigo) + ' aplicado' + (k.descuento ? ': −' + pesos(k.descuento) : '') + '. <button type="button" class="quitar" data-quitar-cupon>Quitar</button></p>';
    if (!k.descuento) html += '<p class="msg mal">' + (k.subtotal < cupon.minimo ? 'Aplica desde ' + pesos(cupon.minimo) + ' en productos.' : 'No aplica a los productos de tu carrito.') + '</p>';
  } else {
    html += '<div class="fila"><input id="cupon-input" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="Escribe tu cupón" value="' + esc(valorCupon) + '">' +
      '<button type="button" data-aplicar-cupon>Aplicar</button></div><p class="msg mal" data-cupon-msg hidden></p>';
  }
  html += '</div>';

  html += '<div class="caja cuentas"><div><span>Productos</span><span>' + pesos(k.subtotal) + '</span></div>' +
    (k.descuento ? '<div class="verde"><span>Cupón</span><span>−' + pesos(k.descuento) + '</span></div>' : '') +
    '<div><span>Envío</span><span' + (k.gratis ? ' class="verde"' : '') + '>' + (k.gratis ? 'GRATIS' : 'Según tu ciudad') + '</span></div>' +
    '<div class="total"><span>Total</span><span>' + pesos(k.neto) + (k.gratis ? '' : ' + envío') + '</span></div>' +
    (k.ahorro ? '<div class="ahorro-caja rv-pop"><span>' + ICONO.etiqueta + 'Estás ahorrando</span><strong>' + pesos(k.ahorro) + '</strong></div>' : '') + '</div>';
  cuerpo.innerHTML = html;
  pintarMetas($('[data-metas-panel]', cuerpo), k, true);
  // Botón de abajo: por debajo del mínimo dice cuánto falta y lleva a las sugerencias.
  const fin = $('[data-finalizar]', d);
  fin.classList.toggle('btn-falta', !k.puede);
  fin.setAttribute('aria-disabled', String(!k.puede));
  fin.innerHTML = k.puede ? 'Finalizar pedido' + ICONO.flecha : ICONO.candado + 'Te faltan ' + pesos(k.faltaMinimo) + ' para pedir';
  $('[data-carrito-pie] p', d).innerHTML = !k.puede ? 'Todos los pedidos son desde <b>' + pesos(k.minimo) + '</b> en productos'
    : T.ajustes.wompi_activo ? '<b>Pagas al recibir</b> o en línea con Wompi' : '<b>Pagas al recibir</b> · no pagas nada hoy';
}

// El tamaño más barato que alcanza para el envío gratis; si ninguno alcanza, el más caro.
// Primero entre las codornices; solo si ya están todas en el carrito, entre lo demás.
function sugerencia(k) {
  const libres = T.variantes.filter((v) => !carrito[v.id]);
  const codornices = libres.filter((v) => PRODUCTOS_SUGERIDOS.indexOf(v.producto_id) >= 0);
  const fuera = codornices.length ? codornices : libres;
  if (!fuera.length) return null;
  const alcanzan = fuera.filter((v) => v.precio >= k.falta).sort((a, b) => a.precio - b.precio);
  return alcanzan[0] || fuera.slice().sort((a, b) => b.precio - a.precio)[0];
}

async function aplicarCupon() {
  const input = $('#cupon-input');
  const msg = $('[data-cupon-msg]');
  const codigo = input.value.trim().toUpperCase();
  if (!codigo) { input.focus(); return; }
  msg.hidden = true;
  try {
    const r = await rest('rpc/consultar_cupon', { method: 'POST', body: JSON.stringify({ p_codigo: codigo }) });
    if (!r) throw new Error('no existe');
    cupon = r;
    guardar('rv-cupon', JSON.stringify(cupon));
    actualizar();
    pintarCarrito();
  } catch (e) {
    input.setAttribute('aria-invalid', 'true');
    msg.textContent = 'Ese cupón no existe o ya venció.';
    msg.hidden = false;
  }
}

function iniciarCarrito() {
  document.addEventListener('click', (e) => {
    const t = e.target;
    const abrir = t.closest('[data-abrir-carrito]');
    if (abrir) { e.preventDefault(); abrirCarrito(); return; }
    const ag = t.closest('[data-agregar]');
    if (ag) { agregar(ag.dataset.agregar, 1); return; }
    const el = t.closest('[data-elegir]');
    if (el) { abrirElegir(el.dataset.elegir); return; }
    const op = t.closest('[data-elegir-opcion]');
    if (op) { eleccion.variante = op.dataset.elegirOpcion; pintarElegir(); return; }
    const eq = t.closest('[data-elegir-q]');
    if (eq) { eleccion.cantidad = Math.min(20, Math.max(1, eleccion.cantidad + Number(eq.dataset.elegirQ))); pintarElegir(); return; }
    if (t.closest('[data-elegir-agregar]')) {
      cerrarDialogo($('#elegir'));
      agregar(eleccion.variante, eleccion.cantidad);
      return;
    }
    const esc_ = t.closest('[data-agregar-escalon]');
    if (esc_) { agregar(esc_.dataset.agregarEscalon, 1); return; }
    const sug = t.closest('[data-agregar-sug]');
    if (sug) { agregar(sug.dataset.agregarSug, 1, { silencioso: true }); return; }
    const q = t.closest('[data-q]');
    if (q) { cambiar(q.dataset.q, (carrito[q.dataset.q] || 0) + Number(q.dataset.d)); return; }
    if (t.closest('[data-aplicar-cupon]')) { aplicarCupon(); return; }
    if (t.closest('[data-quitar-cupon]')) { cupon = null; guardar('rv-cupon', ''); actualizar(); pintarCarrito(); return; }
    const cat = t.closest('[data-cat]');
    if (cat && cat.closest('#filtro-cat')) {
      // Al tocar una ventana se deja de buscar: se ve todo lo de esa ventana.
      categoria = cat.dataset.cat;
      if (busqueda) { busqueda = ''; $$('[data-buscador][data-en-vivo] input').forEach((i) => { i.value = ''; }); const url = new URL(location.href); url.searchParams.delete('q'); history.replaceState(null, '', url); }
      pintarCatalogo();
      actualizar();
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.id === 'cupon-input') { e.preventDefault(); aplicarCupon(); }
  });
}

/* ---------- Formulario de pedido (ventana) ---------- */

const DEPARTAMENTOS = ['Amazonas', 'Antioquia', 'Arauca', 'Atlántico', 'Bogotá D.C.', 'Bolívar', 'Boyacá', 'Caldas', 'Caquetá', 'Casanare', 'Cauca', 'Cesar', 'Chocó', 'Córdoba', 'Cundinamarca', 'Guainía', 'Guaviare', 'Huila', 'La Guajira', 'Magdalena', 'Meta', 'Nariño', 'Norte de Santander', 'Putumayo', 'Quindío', 'Risaralda', 'San Andrés y Providencia', 'Santander', 'Sucre', 'Tolima', 'Valle del Cauca', 'Vaupés', 'Vichada'];

function plantillaFormulario() {
  return '<form id="form-pedido" novalidate>' +
    '<div class="mini-resumen" data-mini-resumen></div>' +
    '<div class="campo"><label for="f-nombre">Nombre completo</label><input id="f-nombre" name="nombre" type="text" autocomplete="name" placeholder="Ej: María Pérez" required maxlength="120" aria-describedby="e-nombre"><span class="error" id="e-nombre"></span></div>' +
    '<div class="campo"><label for="f-celular">Celular (WhatsApp)</label><input id="f-celular" name="celular" type="tel" inputmode="numeric" autocomplete="tel-national" placeholder="300 123 4567" required maxlength="16" aria-describedby="e-celular"><span class="error" id="e-celular"></span></div>' +
    '<div class="bono-caja" data-bono-caja hidden></div>' +
    '<div class="campos-2">' +
    '<div class="campo"><label for="f-departamento">Departamento</label><select id="f-departamento" name="departamento" autocomplete="address-level1" required aria-describedby="e-departamento"><option value="">Elige</option>' +
    DEPARTAMENTOS.map((d) => '<option>' + d + '</option>').join('') + '</select><span class="error" id="e-departamento"></span></div>' +
    '<div class="campo"><label for="f-ciudad">Ciudad o municipio</label><select id="f-ciudad" name="ciudad" autocomplete="address-level2" required disabled aria-describedby="e-ciudad"><option value="">Primero el departamento</option></select><span class="error" id="e-ciudad"></span></div>' +
    '</div>' +
    '<div class="campos-2">' +
    '<div class="campo"><label for="f-direccion">Dirección</label><input id="f-direccion" name="direccion" type="text" autocomplete="address-line1" placeholder="Calle 2 #5-20" required maxlength="200" aria-describedby="e-direccion"><span class="error" id="e-direccion"></span></div>' +
    '<div class="campo"><label for="f-barrio">Barrio</label><input id="f-barrio" name="barrio" type="text" placeholder="Barrio La Sultana" required maxlength="120" aria-describedby="e-barrio"><span class="error" id="e-barrio"></span></div>' +
    '</div>' +
    '<div class="campo"><label for="f-indicaciones">Indicaciones <small>(opcional)</small></label><input id="f-indicaciones" name="indicaciones" type="text" placeholder="Apto, torre, casa, punto de referencia" maxlength="300"></div>' +
    '<fieldset><legend style="font-size: 15px; margin-bottom: 8px">¿Para quién es? <small style="font-weight: 500; color: var(--tinta-2); font-size: inherit">(opcional)</small></legend>' +
    '<div class="mascotas"><button type="button" class="mascota" aria-pressed="false">Perro pequeño</button><button type="button" class="mascota" aria-pressed="false">Perro mediano</button><button type="button" class="mascota" aria-pressed="false">Perro grande</button><button type="button" class="mascota" aria-pressed="false">Gato</button></div></fieldset>' +
    '<fieldset class="metodos" data-metodos hidden><legend style="font-size: 15px; margin-bottom: 8px">¿Cómo quieres pagar?</legend>' +
    '<label class="metodo"><input type="radio" name="metodo_pago" value="contraentrega" checked><span><strong>Pagar al recibir <em class="recomendado">Recomendado</em></strong><span>Pagas en efectivo cuando te llegue.</span></span><b class="metodo-precio" data-precio-metodo></b></label>' +
    '<label class="metodo"><input type="radio" name="metodo_pago" value="wompi"><span><strong>Pagar ahora</strong><span>Tarjeta, PSE, Nequi o Bancolombia, con Wompi.</span><span class="metodo-bono" data-bono-wompi hidden></span></span><b class="metodo-precio" data-precio-metodo></b></label></fieldset>' +
    '<label class="acepto prio-linea"><input type="checkbox" id="f-prioritario" name="prioritario"><span>Agrega <strong>Envío Prioritario</strong> por solo <strong data-valor-prioritario></strong> COP</span></label>' +
    '<label class="acepto"><input type="checkbox" id="f-acepto" name="acepto" required aria-describedby="e-acepto"><span>Autorizo el tratamiento de mis datos para gestionar mi pedido, según la <a href="/privacidad.html" target="_blank" rel="noopener">política de datos</a> (Ley 1581 de 2012).</span></label>' +
    '<span class="error" id="e-acepto" style="margin-top: -8px"></span>' +
    '<div class="trampa" aria-hidden="true"><label for="f-empresa">Empresa</label><input id="f-empresa" name="empresa" type="text" tabindex="-1" autocomplete="off"></div>' +
    '<p class="form-error" id="form-error" role="alert" hidden></p>' +
    '<button type="submit" class="btn btn-confirmar rv-pulso" id="btn-pagar"><span>Confirmar pedido</span><span>Pago al recibir</span></button>' +
    '<p class="seguro" hidden>' + ICONO.candado + '<span data-seguro></span></p>' +
    '<p class="wa-salida"><a data-wa-pedido href="https://wa.me/' + CONFIG.WHATSAPP + '" target="_blank" rel="noopener">' + ICONO.whatsapp + '<span>¿Prefieres pedir por WhatsApp? <b>Escríbenos y te lo tomamos en 1 minuto.</b></span></a></p>' +
    '</form>';
}

// Link de WhatsApp con el carrito ya escrito (formulario y aviso al salir).
function linkWhatsappCarrito(ciudad) {
  const k = cuentas();
  const lista = k.ls.map((l) => l.q + ' × ' + nombreLargo(l.v)).join(', ');
  const texto = 'Hola Revoltosos, quiero pedir: ' + (lista || '') + '. Mi ciudad es: ' + (ciudad || '');
  return 'https://wa.me/' + CONFIG.WHATSAPP + '?text=' + encodeURIComponent(texto);
}

let enviando = false;
const mascotas = new Set();

// Pago con Wompi (migración 018): la opción solo aparece si está activa en el gestor.
const metodoDe = (form) => (T.ajustes.wompi_activo && form.metodo_pago && form.metodo_pago.value === 'wompi' ? 'wompi' : 'contraentrega');
function pintarBoton(form, total) {
  const wompi = metodoDe(form) === 'wompi';
  $('#btn-pagar').innerHTML = wompi
    ? '<span>Pagar ' + pesos(total) + '</span><span>Tarjeta, PSE, Nequi o Bancolombia</span>'
    : '<span>Confirmar pedido</span><span>Pago al recibir</span>';
  $('#pedido-titulo + p').textContent = wompi ? 'Tarda 1 minuto. Al final pagas con Wompi.' : 'Tarda 1 minuto. No pagas nada ahora.';
  // Debajo del botón, solo con Wompi (la nota de seguridad del pago en línea).
  const seguro = $('.seguro', form);
  seguro.hidden = !wompi;
  $('[data-seguro]', form).textContent = 'Pago seguro con Wompi, de Bancolombia. No guardamos los datos de tu tarjeta.';
}

// Lo que va a comprar, arriba del formulario: una fila por producto con foto, tamaño, ×cantidad y precio.
// Con más de 3 productos distintos se ven 3 y el resto con «Ver N más».
const MINI_VISIBLES = 3;
let miniAbierto = false;
function miniResumen(k, envio) {
  const extra = Math.max(0, k.ls.length - MINI_VISIBLES);
  const fila = (l, i) => '<li' + (i >= MINI_VISIBLES && !miniAbierto ? ' hidden' : '') + '>' +
    '<img src="' + esc(fotoDe(l.v)) + '" alt="" width="40" height="40">' +
    '<div class="mr-nom"><strong>' + esc(prodDe(l.v).nombre) + '</strong><span>' + esc(l.v.nombre) + '</span></div>' +
    (l.q > 1 ? '<b class="mr-q">×' + l.q + '</b>' : '') +
    '<span class="mr-precio">' + pesos(l.v.precio * l.q) + '</span></li>';
  return '<div class="mr-cab"><strong>Tu pedido</strong><span>' + k.unidades + (k.unidades === 1 ? ' producto' : ' productos') + '</span></div>' +
    '<ul class="mr-lista">' + k.ls.map(fila).join('') +
    (k.regalo ? '<li class="mr-regalo">' + ICONO.regalo + '<div class="mr-nom"><strong>Regalo</strong><span>' + esc(nombreRegalo()) + '</span></div><span class="mr-precio">GRATIS</span></li>' : '') +
    '</ul>' +
    (extra ? '<button type="button" class="mr-mas" data-mr-mas aria-expanded="' + miniAbierto + '">' + (miniAbierto ? 'Ver menos' : 'Ver ' + extra + (extra === 1 ? ' producto más' : ' productos más')) + '</button>' : '') +
    (envio || '');
}

// Debajo de los productos: cupón, envío (gratis o cuánto, y cuánto falta para que sea gratis),
// prioritario y el total. Reemplaza el viejo «Resumen de tu pago».
function cuentasArriba(k, ciudad, prio, wompi) {
  const fila = (a, b, clase) => '<div class="mr-fila' + (clase ? ' ' + clase : '') + '"><span>' + a + '</span><span>' + b + '</span></div>';
  const envio = k.gratis
    ? fila(ICONO.camion + 'Envío' + (ciudad ? ' a ' + esc(ciudad) : ''), '<b class="mr-gratis">GRATIS</b>', 'mr-envio')
    : fila(ICONO.camion + 'Envío' + (ciudad ? ' a ' + esc(ciudad) : ''), k.envio != null ? pesos(k.envio) : '<small>Según tu ciudad</small>', 'mr-envio');
  const nota = k.gratis
    ? '<p class="mr-nota ok">' + (k.porCombo ? 'Tu combo incluye el envío.' : 'Tu pedido supera ' + pesos(T.ajustes.envio_gratis_desde) + ': no pagas envío.') + '</p>'
    : '<p class="mr-nota">Agrega <strong>' + pesos(k.falta) + '</strong> más en productos y tu envío es <strong>GRATIS</strong>.</p>';
  const total = k.neto - k.bono + (k.gratis ? 0 : (k.envio || 0)) + prio;
  return '<div class="mr-cuentas">' +
    (k.descuento ? fila('Cupón ' + esc(cupon.codigo), '−' + pesos(k.descuento), 'mr-verde') : '') +
    envio + nota +
    (prio ? fila('Envío prioritario', pesos(prio)) : '') +
    (k.bono ? fila(ICONO.cupon + 'Bono Wompi', '−' + pesos(k.bono), 'mr-verde') +
      '<p class="mr-nota ok">El mínimo, el envío gratis y el regalo se cuentan con tus productos, antes del bono.</p>' : '') +
    fila('<strong>' + (wompi ? 'Total a pagar' : 'Total a pagar al recibir') + '</strong>', '<strong>' + pesos(total) + (k.gratis || k.envio != null ? '' : ' <small>+ envío</small>') + '</strong>', 'mr-total') +
    (k.ahorro ? '<p class="mr-nota ok">' + ICONO.etiqueta + 'Estás ahorrando <strong>' + pesos(k.ahorro) + '</strong></p>' : '') +
    '</div>';
}

function pintarResumenPedido() {
  const d = $('#pedido-modal');
  const form = $('#form-pedido', d);
  if (!form) return;
  const dep = form.departamento.value;
  const k = cuentas(dep, form.ciudad.value);
  const prio = form.prioritario.checked ? T.ajustes.prioritario : 0;
  const primera = k.ls[0];
  $('[data-valor-prioritario]', d).textContent = pesos(T.ajustes.prioritario);
  $('[data-metodos]', d).hidden = !T.ajustes.wompi_activo;
  const wompi = metodoDe(form) === 'wompi';
  // Arriba, de una vez: si el envío es gratis o cuánto cuesta, y el total.
  $('[data-mini-resumen]', d).innerHTML = primera ? miniResumen(k, cuentasArriba(k, form.ciudad.value, prio, wompi)) : '<div class="mr-cab"><strong>Tu carrito está vacío</strong></div>';

  const total = k.neto - k.bono + (k.gratis ? 0 : (k.envio || 0)) + prio;
  const totalTxt = pesos(total) + (dep || k.gratis ? '' : ' + envío');
  pintarBono(form, k);
  $$('[data-precio-metodo]', d).forEach((b) => { b.textContent = totalTxt; });
  if (!enviando) pintarBoton(form, total);
  const wa = $('[data-wa-pedido]', d);
  if (wa) wa.href = linkWhatsappCarrito(form.ciudad.value);
  return total;
}

/* Bono de Wompi (migración 029): al escribir un celular válido se pregunta si tiene un bono vigente.
   Si tiene, aparece aplicado; el cliente lo puede guardar para otra compra. */
const fechaLarga = (iso) => {
  try { return new Date(iso + 'T12:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'long' }); } catch (e) { return iso; }
};
const diasHasta = (iso) => Math.max(0, Math.round((new Date(iso + 'T12:00:00') - new Date(new Date().toDateString() + ' 12:00')) / 86400000));
let bonoBuscado = '';
async function buscarBono(form) {
  const cel = normalizarCelular(form.celular.value);
  if (cel === bonoBuscado) return;
  bonoBuscado = cel;
  if (bonoCliente && bonoCliente.celular !== cel) { bonoCliente = null; pintarResumenPedido(); }
  if (!cel) return;
  try {
    const r = await rest('rpc/bono_disponible', { method: 'POST', body: JSON.stringify({ p_celular: cel }) });
    if (bonoBuscado !== cel) return; // cambió el celular mientras llegaba la respuesta
    bonoCliente = r && r.monto ? { celular: cel, monto: Number(r.monto), vence: r.vence } : null;
    usarBono = true;
  } catch (e) { bonoCliente = null; }
  pintarResumenPedido();
}

function pintarBono(form, k) {
  const caja = $('[data-bono-caja]', form);
  if (caja) {
    caja.hidden = !bonoCliente;
    if (bonoCliente) {
      const dias = diasHasta(bonoCliente.vence);
      caja.classList.toggle('apagado', !usarBono);
      caja.innerHTML = ICONO.cupon + '<span><strong>Tienes un bono de ' + pesos(bonoCliente.monto) + '</strong>' +
        (dias === 0 ? 'Vence hoy' : 'Te ' + (dias === 1 ? 'queda 1 día' : 'quedan ' + dias + ' días') + ' para usarlo') +
        (!k.puede ? '' : usarBono ? '' : ' · lo guardas para después') + '</span>' +
        '<button type="button" data-bono-usar aria-pressed="' + usarBono + '">' + (usarBono ? ICONO.check + 'Aplicado' : 'Usar') + '</button>';
    }
  }
  const promo = $('[data-bono-wompi]', form);
  const monto = Number(T.ajustes.bono_wompi) || 0;
  if (promo) {
    promo.hidden = !monto;
    promo.innerHTML = ICONO.cupon + '<span><b>Te regalamos ' + pesos(monto) + '</b> para tu próximo pedido</span>';
  }
}

let checkoutIniciado = false;
function abrirPedido() {
  const d = $('#pedido-modal');
  if (d.dataset.gracias) reiniciarFormulario();
  // Vacío o por debajo del pedido mínimo: el carrito explica cuánto falta y sugiere cómo llegar.
  if (!cuentas().puede) { abrirCarrito(); return; }
  pintarResumenPedido();
  abrirDialogo(d);
  if (!checkoutIniciado) {
    checkoutIniciado = true;
    const k = cuentas();
    track('InitiateCheckout', { content_ids: k.ls.map((l) => l.v.id), content_type: 'product', num_items: k.unidades, value: k.neto, currency: 'COP' });
  }
}

function reiniciarFormulario() {
  const d = $('#pedido-modal');
  delete d.dataset.gracias;
  $('#pedido-titulo').textContent = 'Datos para el envío';
  $('.panel-cab p', d).hidden = false;
  $('[data-pedido-cuerpo]', d).innerHTML = plantillaFormulario();
  mascotas.clear();
  iniciarFormulario();
}

/* Validación */
function normalizarCelular(v) {
  let d = String(v).replace(/\D/g, '');
  if (d.length === 12 && d.startsWith('57')) d = d.slice(2);
  return /^3\d{9}$/.test(d) ? '57' + d : '';
}
const reglas = {
  nombre: (v) => v.trim().length >= 3 && /\s/.test(v.trim()) ? '' : 'Escribe tu nombre completo.',
  celular: (v) => normalizarCelular(v) ? '' : 'Escribe un celular de 10 dígitos que empiece por 3.',
  departamento: (v) => v ? '' : 'Elige el departamento.',
  ciudad: (v) => v.trim().length >= 2 ? '' : 'Elige la ciudad o municipio.',
  direccion: (v) => v.trim().length >= 4 ? '' : 'Escribe la dirección de entrega.',
  barrio: (v) => v.trim().length >= 2 ? '' : 'Escribe el barrio.'
};
function validarCampo(nombre) {
  const input = $('#form-pedido [name="' + nombre + '"]');
  const msg = reglas[nombre](input.value);
  input.setAttribute('aria-invalid', msg ? 'true' : 'false');
  $('#e-' + nombre).textContent = msg;
  return !msg;
}

/* Ciudad: lista de municipios según el departamento (DANE · DIVIPOLA) */
let municipios = null;
let cargandoMunicipios = null;
const cargarMunicipios = () => cargandoMunicipios || (cargandoMunicipios = fetch('/assets/data/municipios.json?v=1')
  .then((r) => (r.ok ? r.json() : null))
  .then((d) => { municipios = d; return d; })
  .catch(() => null));

/* Carrito abandonado: el gestor lo ve en la pestaña Carritos y escribe por WhatsApp con un clic.
   Cada navegador tiene su código de sesión; al terminar un pedido se cambia por uno nuevo. */
function sesionCarrito() {
  let s = leerL('rv-sesion-carrito');
  if (!s) {
    s = (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)).replace(/-/g, '');
    guardarL('rv-sesion-carrito', s);
  }
  return s;
}
var temporizadorCarrito = null; // var: actualizar() puede correr antes de esta línea
var ultimoCarritoGuardado = '';
function programarCarritoGuardado() {
  clearTimeout(temporizadorCarrito);
  temporizadorCarrito = setTimeout(guardarCarritoAbandonado, 1200);
}
function guardarCarritoAbandonado() {
  const form = $('#form-pedido');
  if (!form || enviando || !form.acepto.checked) return;
  const celular = normalizarCelular(form.celular.value);
  const k = cuentas();
  if (!celular || !k.unidades) return;
  const cuerpo = {
    p_sesion: sesionCarrito(),
    p_nombre: form.nombre.value.trim(),
    p_celular: celular,
    p_departamento: form.departamento.value,
    p_ciudad: form.ciudad.value,
    p_items: k.ls.map((l) => ({ variante_id: l.v.id, nombre: nombreLargo(l.v), cantidad: l.q, precio: l.v.precio })),
    p_total: k.neto
  };
  const firma = JSON.stringify(cuerpo);
  if (firma === ultimoCarritoGuardado) return;
  ultimoCarritoGuardado = firma;
  fetch(CONFIG.SUPABASE_URL + '/rest/v1/rpc/guardar_carrito', {
    method: 'POST',
    headers: { apikey: CONFIG.SUPABASE_KEY, 'Content-Type': 'application/json' },
    body: firma,
    keepalive: true
  }).catch(() => { ultimoCarritoGuardado = ''; });
  actualizarDatosMeta({ celular, nombre: cuerpo.p_nombre, ciudad: cuerpo.p_ciudad, departamento: cuerpo.p_departamento }).catch(() => {});
}

function iniciarFormulario() {
  const form = $('#form-pedido');
  const dep = form.departamento;
  dep.addEventListener('focus', cargarMunicipios, { once: true });
  dep.addEventListener('pointerdown', cargarMunicipios, { once: true });
  dep.addEventListener('change', async () => {
    await cargarMunicipios();
    const campo = form.ciudad;
    if (!municipios) {
      if (campo.tagName === 'SELECT') {
        const inp = document.createElement('input');
        Object.assign(inp, { type: 'text', id: 'f-ciudad', name: 'ciudad', maxLength: 80, placeholder: 'Escribe tu ciudad o municipio', autocomplete: 'address-level2' });
        inp.setAttribute('aria-describedby', 'e-ciudad');
        inp.addEventListener('input', pintarResumenPedido);
        campo.replaceWith(inp);
      }
      pintarResumenPedido();
      return;
    }
    const lista = municipios[dep.value] || [];
    campo.innerHTML = '';
    campo.add(new Option(lista.length ? 'Elige tu ciudad o municipio' : 'Primero el departamento', ''));
    lista.forEach((m) => campo.add(new Option(m, m)));
    campo.disabled = !lista.length;
    campo.value = lista.length === 1 ? lista[0] : '';
    campo.setAttribute('aria-invalid', 'false');
    $('#e-ciudad').textContent = '';
    pintarResumenPedido();
  });
  form.ciudad.addEventListener('change', pintarResumenPedido);
  form.prioritario.addEventListener('change', pintarResumenPedido);
  $$('[name="metodo_pago"]', form).forEach((r) => r.addEventListener('change', pintarResumenPedido));
  form.addEventListener('click', (e) => {
    if (e.target.closest('[data-mr-mas]')) { miniAbierto = !miniAbierto; pintarResumenPedido(); }
    if (e.target.closest('[data-bono-usar]')) { usarBono = !usarBono; pintarResumenPedido(); }
  });
  form.celular.addEventListener('input', () => buscarBono(form));
  form.celular.addEventListener('change', () => buscarBono(form));
  bonoBuscado = '';
  if (form.celular.value) buscarBono(form);
  // Carrito abandonado (migración 023): se guarda solo con celular válido y la casilla de datos marcada.
  ['input', 'change'].forEach((ev) => form.addEventListener(ev, (e) => {
    if (['nombre', 'celular', 'departamento', 'ciudad', 'acepto'].includes(e.target.name)) programarCarritoGuardado();
  }));
  $$('.mascota', form).forEach((btn) => btn.addEventListener('click', () => {
    const on = btn.getAttribute('aria-pressed') !== 'true';
    btn.setAttribute('aria-pressed', String(on));
    on ? mascotas.add(btn.textContent) : mascotas.delete(btn.textContent);
  }));
  Object.keys(reglas).forEach((n) => {
    const input = form[n];
    input.addEventListener('blur', () => { if (input.value) validarCampo(n); });
    input.addEventListener('input', () => { if (input.getAttribute('aria-invalid') === 'true') validarCampo(n); });
  });
  form.addEventListener('submit', enviarPedido);
}

function uuid() {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => { const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16); });
}

async function enviarPedido(e) {
  e.preventDefault();
  if (enviando) return;
  const form = e.currentTarget;
  const errorGeneral = $('#form-error');
  errorGeneral.hidden = true;

  const validos = Object.keys(reglas).map(validarCampo);
  const acepto = $('#f-acepto').checked;
  $('#e-acepto').textContent = acepto ? '' : 'Necesitamos tu autorización para gestionar el pedido.';
  if (validos.includes(false) || !acepto) {
    (form.querySelector('[aria-invalid="true"]') || $('#f-acepto')).focus();
    return;
  }
  const k = cuentas(form.departamento.value, form.ciudad.value);
  if (!k.puede) { cerrarDialogo($('#pedido-modal')); abrirCarrito(); return; }

  enviando = true;
  const btn = $('#btn-pagar');
  btn.disabled = true;
  btn.innerHTML = '<span>Enviando tu pedido…</span>';

  // Si el envío anterior falló, se reutiliza el mismo event_id: así no se duplica el pedido.
  const eventId = leer('rv-event-id') || uuid();
  guardar('rv-event-id', eventId);

  const datos = {
    items: k.ls.map((l) => ({ variante_id: l.v.id, cantidad: l.q })),
    cupon: cupon ? cupon.codigo : '',
    event_id: eventId,
    nombre: form.nombre.value.trim(),
    celular: normalizarCelular(form.celular.value),
    direccion: form.direccion.value.trim(),
    barrio: form.barrio.value.trim(),
    ciudad: form.ciudad.value.trim(),
    departamento: form.departamento.value,
    indicaciones: form.indicaciones.value.trim(),
    prioritario: form.prioritario.checked,
    metodo_pago: metodoDe(form),
    usar_bono: bonoAplicado() && bonoCliente.celular === normalizarCelular(form.celular.value),
    para_quien: Array.from(mascotas),
    utm_source: leer('rv-utm_source') || '',
    utm_medium: leer('rv-utm_medium') || '',
    utm_campaign: leer('rv-utm_campaign') || '',
    utm_content: leer('rv-utm_content') || '',
    utm_term: leer('rv-utm_term') || '',
    fbclid: leer('rv-fbclid') || '',
    fbp: cookie('_fbp'),
    visitante: leerL('rv-visitante') || '',
    fbc: fbc(),
    event_source_url: location.href.split('#')[0],
    empresa: form.empresa.value
  };

  try {
    const res = await fetch(CONFIG.SUPABASE_URL + '/functions/v1/crear-pedido', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: CONFIG.SUPABASE_KEY },
      body: JSON.stringify(datos)
    });
    const r = await res.json().catch(() => ({}));
    if (!res.ok || !r.ok) throw Object.assign(new Error(r.error || 'No pudimos registrar el pedido.'), { status: res.status, campo: r.campo });

    if (r.wompi) {
      // El pedido queda guardado sin pagar; si el cliente cierra la ventana de Wompi puede volver a intentar.
      btn.innerHTML = '<span>Abriendo el pago…</span>';
      await abrirWompi(datos, r, k.unidades, eventId);
      enviando = false;
      btn.disabled = false;
      pintarResumenPedido();
      return;
    }
    pedidoListo(datos, r, k.unidades, eventId, r.pagado ? 'aprobado' : null);
  } catch (err) {
    if (err.campo === 'metodo_pago') {
      $$('[name="metodo_pago"]', form).forEach((x) => { x.checked = x.value === 'contraentrega'; });
      errorGeneral.textContent = 'El pago en línea no está disponible en este momento. Cambiamos a pago contra entrega: revisa y vuelve a confirmar.';
    } else if (err.campo === 'wompi') {
      errorGeneral.textContent = 'No pudimos abrir la ventana de pago. Revisa tu conexión e inténtalo de nuevo, o elige pago contra entrega.';
    } else if (err.campo === 'cupon') {
      cupon = null;
      guardar('rv-cupon', '');
      pintarResumenPedido();
      errorGeneral.textContent = 'El cupón ya no es válido, lo quitamos. Revisa el total y vuelve a confirmar.';
    } else if (err.campo === 'bono') {
      bonoCliente = null;
      pintarResumenPedido();
      errorGeneral.textContent = 'Tu bono ya no está disponible (se usó o venció), lo quitamos. Revisa el total y vuelve a confirmar.';
    } else if (err.campo === 'minimo') {
      errorGeneral.textContent = err.message + '. Agrega otro snack desde el carrito y vuelve a confirmar.';
    } else {
      const texto = 'Hola, quiero pedir: ' + k.ls.map((l) => l.q + ' × ' + nombreLargo(l.v)).join(', ') + '. Mis datos: ' + datos.nombre + ', ' + datos.direccion + ', ' + datos.barrio + ', ' + datos.ciudad + ' - ' + datos.departamento + '.';
      const wa = '<a href="https://wa.me/' + CONFIG.WHATSAPP + '?text=' + encodeURIComponent(texto) + '" target="_blank" rel="noopener">';
      // 429: ya hubo un pedido desde esta conexión en las últimas 72 horas (ver crear-pedido).
      errorGeneral.innerHTML = err.status === 429
        ? 'Ya recibimos un pedido desde esta conexión hace poco. Si quieres pedir otro, ' + wa + 'escríbenos por WhatsApp</a> y te ayudamos.'
        : (err.status === 422 && /productos/.test(err.message)
          ? 'Uno de los productos de tu carrito ya no está disponible. Revisa tu carrito, o ' + wa + 'pídelo por WhatsApp</a>.'
          : 'No pudimos enviar tu pedido. Revisa tu conexión e inténtalo de nuevo, o ' + wa + 'pídelo por WhatsApp</a>.');
    }
    errorGeneral.hidden = false;
    btn.disabled = false;
    enviando = false;
    pintarResumenPedido();
  }
  enviando = false;
}

// Pedido listo: Purchase al Pixel (salvo pago en verificación: ese lo manda wompi-eventos a Meta al aprobarse),
// pantalla de gracias y carrito vacío. pago: null (contra entrega), 'aprobado' o 'pendiente'.
function pedidoListo(datos, r, unidades, eventId, pago) {
  if (window.fbq && pago !== 'pendiente') {
    const [fn, ...resto] = datos.nombre.toLowerCase().split(/\s+/);
    // Mismo external_id (visitante) que el resto de eventos y que el Purchase del servidor.
    fbq('init', CONFIG.PIXEL_ID, Object.assign({}, datosMeta(), { ph: datos.celular, fn: fn, ln: resto.join(''), ct: normalizarMeta(datos.ciudad), st: normalizarMeta(datos.departamento), country: 'co' }));
    track('Purchase', { value: r.total, currency: 'COP', content_ids: datos.items.map((i) => i.variante_id), contents: datos.items.map((i) => ({ id: i.variante_id, quantity: i.cantidad })), content_type: 'product', num_items: unidades }, { eventID: eventId });
  }
  // rv-wompi se deja: si Wompi recarga la página con ?id= después de aprobar, se vuelve a mostrar este mismo resultado.
  try { sessionStorage.removeItem('rv-event-id'); } catch (err) {}
  // El carrito de este pedido ya quedó recuperado (trigger en pedidos); el próximo será otro.
  clearTimeout(temporizadorCarrito);
  try { localStorage.removeItem('rv-sesion-carrito'); } catch (err) {}
  ultimoCarritoGuardado = '';
  mostrarGracias(datos, r, pago);
  carrito = {};
  cupon = null;
  bonoCliente = null;
  bonoBuscado = '';
  guardarCarrito();
  guardar('rv-cupon', '');
  actualizar();
}

/* Wompi: ventana de pago (widget). Si el medio de pago saca al cliente de la página (PSE, Bancolombia),
   Wompi lo devuelve a esta misma página con ?id=<transacción> y se retoma en volverDeWompi. */
let cargandoWompi = null;
const cargarWompi = () => cargandoWompi || (cargandoWompi = new Promise((ok, mal) => {
  if (window.WidgetCheckout) return ok();
  const s = document.createElement('script');
  s.src = 'https://checkout.wompi.co/widget.js';
  s.onload = ok;
  s.onerror = () => { cargandoWompi = null; mal(Object.assign(new Error('widget'), { campo: 'wompi' })); };
  document.head.appendChild(s);
}));

async function abrirWompi(datos, r, unidades, eventId) {
  await cargarWompi();
  const w = r.wompi;
  guardar('rv-wompi', JSON.stringify({ datos, r, unidades, eventId }));
  const checkout = new window.WidgetCheckout({
    currency: w.currency,
    amountInCents: w.amount_in_cents,
    reference: w.reference,
    publicKey: w.public_key,
    signature: { integrity: w.signature },
    redirectUrl: location.origin + location.pathname,
    customerData: { fullName: datos.nombre, phoneNumber: datos.celular.slice(2), phoneNumberPrefix: '+57' }
  });
  // El formulario es un <dialog> modal y quedaría encima de Wompi: se cierra mientras se paga
  // (sin borrar lo escrito) y vuelve si el cliente cierra la ventana de Wompi sin terminar.
  const m = $('#pedido-modal');
  cerrarDialogo(m);
  let terminado = false;
  let visto = false;
  const vigia = new MutationObserver(() => {
    const w = document.querySelector('.waybox-modal');
    const abierta = !!w && getComputedStyle(w).display !== 'none';
    if (abierta) { visto = true; return; }
    if (!visto) return;
    vigia.disconnect();
    if (!terminado && !m.open) abrirDialogo(m);
  });
  vigia.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style'] });
  checkout.open((resultado) => {
    terminado = true;
    resultadoWompi(resultado && resultado.transaction);
  });
}

// Lo que diga el navegador solo cambia la pantalla: el pedido se marca pagado cuando Wompi avisa a wompi-eventos.
async function resultadoWompi(tx) {
  let s = null;
  try { s = JSON.parse(leer('rv-wompi') || 'null'); } catch (e) {}
  if (!s || !tx || tx.reference !== s.r.wompi.reference) return;
  const d = $('#pedido-modal');
  if (!d.open) abrirDialogo(d);
  if (tx.status === 'APPROVED' || tx.status === 'PENDING') {
    pedidoListo(s.datos, s.r, s.unidades, s.eventId, tx.status === 'APPROVED' ? 'aprobado' : 'pendiente');
    return;
  }
  // Rechazado, anulado o con error: el pedido sigue guardado sin pagar y el formulario queda listo para reintentar.
  if (d.dataset.gracias || !$('#form-pedido', d)) reiniciarFormulario();
  const form = $('#form-pedido', d);
  if (!form.nombre.value) await llenarFormulario(form, s.datos);
  const errorGeneral = $('#form-error');
  errorGeneral.textContent = 'Tu pago no fue aprobado. Puedes intentarlo de nuevo con otro medio de pago, o elegir pago contra entrega.';
  errorGeneral.hidden = false;
  pintarResumenPedido();
}

async function llenarFormulario(form, datos) {
  ['nombre', 'direccion', 'barrio', 'indicaciones'].forEach((n) => { form[n].value = datos[n] || ''; });
  form.celular.value = datos.celular.slice(2);
  form.prioritario.checked = !!datos.prioritario;
  $$('[name="metodo_pago"]', form).forEach((x) => { x.checked = x.value === datos.metodo_pago; });
  form.departamento.value = datos.departamento;
  form.departamento.dispatchEvent(new Event('change'));
  await cargarMunicipios();
  await Promise.resolve();
  form.ciudad.value = datos.ciudad;
}

async function volverDeWompi() {
  const q = new URLSearchParams(location.search);
  const id = q.get('id');
  const guardado = leer('rv-wompi');
  if (!id || !guardado) return;
  q.delete('id');
  q.delete('env');
  history.replaceState(null, '', location.pathname + (q.toString() ? '?' + q : '') + location.hash);
  let s = null;
  try { s = JSON.parse(guardado); } catch (e) { return; }
  const api = /^pub_test_/.test(s.r.wompi.public_key) ? 'https://sandbox.wompi.co/v1' : 'https://production.wompi.co/v1';
  try {
    const res = await fetch(api + '/transactions/' + encodeURIComponent(id));
    const tx = (await res.json()).data;
    if (tx) resultadoWompi(tx);
  } catch (e) { /* sin respuesta: el pedido quedó guardado y el gestor verá el pago cuando Wompi avise */ }
}

// Pagó con Wompi: le mostramos el bono que ganó para el próximo pedido (lo crea wompi-eventos al aprobarse).
function boletaBono(datos, pago) {
  const monto = Number(T.ajustes.bono_wompi) || 0;
  if (!monto || (pago !== 'aprobado' && pago !== 'pendiente')) return '';
  const cel = String(datos.celular || '').slice(2);
  const vence = new Date(Date.now() + (Number(T.ajustes.bono_dias) || 30) * 86400000).toISOString().slice(0, 10);
  return '<div class="boleta-bono rv-pop"><span class="boleta-rotulo">TU BONO DE REGALO</span>' +
    '<strong class="boleta-valor">' + pesos(monto) + '</strong><span>para tu próximo pedido</span><hr>' +
    '<span class="boleta-nota">' + (pago === 'pendiente' ? 'Te queda apenas se apruebe tu pago. ' : '') +
    'Queda guardado con tu celular <b>' + esc(cel.slice(0, 3)) + ' ••• ' + esc(cel.slice(-4)) + '</b>: no tienes que copiar ningún código.</span>' +
    '<span class="boleta-vence">' + ((Number(T.ajustes.bono_dias) || 30) === 30 ? 'Dura 1 mes' : 'Dura ' + T.ajustes.bono_dias + ' días') + ': úsalo antes del ' + esc(fechaLarga(vence)) + '</span></div>' +
    '<p class="boleta-letra">Un bono por cada pedido pagado con Wompi. Se usa en un solo pedido y no se cambia por dinero.</p>';
}

function mostrarGracias(datos, r, pago) {
  const d = $('#pedido-modal');
  d.dataset.gracias = '1';
  $('#pedido-titulo').textContent = pago === 'aprobado' ? '¡Pago aprobado!' : '¡Pedido recibido!';
  $('.panel-cab p', d).hidden = true;
  const items = r.items || [];
  const msg = 'Hola Revoltosos, acabo de hacer el pedido #' + r.order_id + ' (total ' + pesos(r.total) + (pago === 'aprobado' ? ', pagado con Wompi' : '') + ').';
  $('[data-pedido-cuerpo]', d).innerHTML = '<div class="gracias-t">' +
    '<span class="gracias-check">' + ICONO.check.replace('width="17" height="17"', 'width="30" height="30"') + '</span>' +
    '<h2 tabindex="-1" id="t-gracias">¡Gracias, ' + esc(datos.nombre.split(/\s+/)[0]) + '!</h2>' +
    '<p>' + (pago === 'aprobado' ? 'Recibimos tu pago. Te escribiremos por WhatsApp cuando despachemos tu pedido.'
      : pago === 'pendiente' ? 'Tu pago está en verificación con el banco. Apenas se confirme te escribimos por WhatsApp.'
      : 'Te escribiremos por WhatsApp en breve para confirmar tus datos y despacharlo.') + '</p>' +
    '<div class="resumen cuentas"><div><span style="color: var(--tinta-2)">Pedido</span><strong>' + esc(r.order_id) + '</strong></div><hr class="perforado">' +
    items.map((i) => (i.regalo
      ? '<div class="verde"><span>' + i.cantidad + ' × ' + esc(i.nombre) + '</span><span>GRATIS</span></div>'
      : '<div><span>' + i.cantidad + ' × ' + esc(i.nombre) + '</span><span>' + pesos(i.precio * i.cantidad) + '</span></div>')).join('') +
    (r.descuento ? '<div class="verde"><span>Cupón</span><span>−' + pesos(r.descuento) + '</span></div>' : '') +
    (r.bono ? '<div class="verde"><span>Bono Wompi</span><span>−' + pesos(r.bono) + '</span></div>' : '') +
    '<div><span>Envío</span><span' + (r.envio ? '' : ' class="verde"') + '>' + (r.envio ? pesos(r.envio) : 'GRATIS') + '</span></div>' +
    (r.prioritario ? '<div><span>Envío prioritario</span><span>' + pesos(r.prioritario) + '</span></div>' : '') +
    '<hr class="perforado"><div class="resumen-total"><strong>' + (pago === 'aprobado' ? 'Pagado con Wompi' : pago === 'pendiente' ? 'Pago en verificación' : 'Pagas al recibir') + '</strong><span>' + pesos(r.total) + '</span></div>' +
    '<p style="margin-top: 12px; font-size: 14px; color: var(--tinta-2)">' + esc([datos.direccion, datos.barrio, datos.ciudad + ' - ' + datos.departamento].join(', ')) + '</p></div>' +
    boletaBono(datos, pago) +
    '<a class="btn btn--verde" href="https://wa.me/' + CONFIG.WHATSAPP + '?text=' + encodeURIComponent(msg) + '" target="_blank" rel="noopener">' + ICONO.whatsapp + 'Escríbenos por WhatsApp</a>' +
    '<button type="button" class="btn btn--borde" data-cerrar>Seguir mirando</button></div>';
  $('#t-gracias').focus();
}

/* ---------- Compras recientes (prueba social) ---------- */

function haceCuanto(fecha) {
  const min = Math.max(1, Math.round((Date.now() - new Date(fecha).getTime()) / 60000));
  if (min < 60) return 'Hace ' + min + ' min';
  const h = Math.round(min / 60);
  if (h < 24) return 'Hace ' + h + (h === 1 ? ' hora' : ' horas');
  const d = Math.round(h / 24);
  return 'Hace ' + d + (d === 1 ? ' día' : ' días');
}

async function iniciarPruebaSocial() {
  const cajas = $$('[data-prueba-social]');
  if (!cajas.length) return;
  let datos;
  try { datos = await rest('rpc/compras_recientes', { method: 'POST', body: '{}' }); } catch (e) { return; }
  let lista = (datos && datos.recientes) || [];
  if (!lista.length) return;
  if (P.tipo === 'producto' && T.prodPorId[P.productoId]) {
    const nombre = T.prodPorId[P.productoId].nombre.toLowerCase();
    const suyos = lista.filter((c) => String(c.producto).toLowerCase().indexOf(nombre) >= 0);
    if (suyos.length >= 2) lista = suyos;
  }
  const foto = (c) => {
    const p = T.productos.find((x) => String(c.producto).toLowerCase().indexOf(x.nombre.toLowerCase()) === 0);
    return (p && p.imagen) || '/assets/img/logo.jpg';
  };
  let i = 0;
  const pintar = () => {
    const c = lista[i % lista.length];
    const reciente = Date.now() - new Date(c.creado_en).getTime() < 3600000;
    const hoy = datos.hoy >= 3 ? ' · ' + datos.hoy + ' pedidos hoy' : '';
    cajas.forEach((caja) => {
      caja.hidden = false;
      caja.innerHTML = '<span class="foto"><img src="' + esc(foto(c)) + '" alt="" width="46" height="46"></span>' +
        '<span class="txt rv-entra"><strong>' + esc(c.nombre) + '</strong> de ' + esc(c.ciudad) + (reciente ? ' acaba de pedir ' : ' pidió ') +
        '<b>' + esc(c.producto) + '</b><small>' + haceCuanto(c.creado_en) + hoy + '</small></span>';
    });
    i++;
  };
  pintar();
  if (lista.length > 1) setInterval(() => { if (!document.hidden) pintar(); }, 6000);
}

/* ---------- Medición: UTM, cookies de Meta y Pixel ---------- */

const params = new URLSearchParams(location.search);
// En los anuncios de Meta: ?utm_source=facebook&utm_medium=paid&utm_campaign={{campaign.name}}&utm_content={{ad.id}}&utm_term={{adset.name}}
['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid'].forEach((k) => { if (params.get(k)) guardar('rv-' + k, params.get(k)); });
function cookie(nombre) {
  const m = document.cookie.match('(?:^|; )' + nombre + '=([^;]*)');
  return m ? decodeURIComponent(m[1]) : '';
}
function fbc() {
  const c = cookie('_fbc');
  if (c) return c;
  const id = leer('rv-fbclid');
  return id ? 'fb.1.' + Date.now() + '.' + id : '';
}
// Los eventos que salen antes de que el Pixel arranque (init espera el hash del visitante) se guardan y se mandan después.
let pixelListo = false;
const pendientesPixel = [];
function track(evento, datos, opciones) {
  if (!window.fbq) return;
  if (!pixelListo) { pendientesPixel.push([evento, datos, opciones]); return; }
  window.fbq('track', evento, datos || {}, opciones || {});
}

/* Coincidencias avanzadas manuales de Meta: el Pixel arranca con los datos del cliente ya cifrados
   (SHA-256, misma normalización que crear-pedido) para que Meta reconozca a la persona en todas las páginas.
   · external_id: un código anónimo de este navegador (también va en el Purchase del servidor).
   · Celular, nombre, ciudad y departamento: solo después de marcar «Autorizo el tratamiento de mis datos»;
     se guardan cifrados en este navegador (nunca en texto plano). */
const normalizarMeta = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
async function sha256Hex(texto) {
  const h = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(texto));
  return Array.from(new Uint8Array(h)).map((b) => b.toString(16).padStart(2, '0')).join('');
}
function visitante() {
  let v = leerL('rv-visitante');
  if (!v) {
    v = Array.from(crypto.getRandomValues(new Uint8Array(16))).map((b) => b.toString(16).padStart(2, '0')).join('');
    guardarL('rv-visitante', v);
  }
  return v;
}
function datosMeta() {
  try { return JSON.parse(leerL('rv-meta-am') || 'null') || {}; } catch (e) { return {}; }
}
async function datosMetaIniciales() {
  const d = datosMeta();
  if (!d.external_id) {
    d.external_id = await sha256Hex(visitante());
    d.country = d.country || await sha256Hex('co');
    guardarL('rv-meta-am', JSON.stringify(d));
  }
  return d;
}
// Se llama con el formulario lleno y la casilla de datos marcada.
async function actualizarDatosMeta(f) {
  if (!window.fbq || !CONFIG.PIXEL_ID || !(window.crypto && crypto.subtle)) return;
  const [nombre, ...apellidos] = String(f.nombre || '').trim().split(/\s+/);
  const nuevos = {};
  if (f.celular) nuevos.ph = await sha256Hex(f.celular);
  if (normalizarMeta(nombre)) nuevos.fn = await sha256Hex(normalizarMeta(nombre));
  if (normalizarMeta(apellidos.join(''))) nuevos.ln = await sha256Hex(normalizarMeta(apellidos.join('')));
  if (normalizarMeta(f.ciudad)) nuevos.ct = await sha256Hex(normalizarMeta(f.ciudad));
  if (normalizarMeta(f.departamento)) nuevos.st = await sha256Hex(normalizarMeta(f.departamento));
  const d = Object.assign(await datosMetaIniciales(), nuevos);
  const antes = leerL('rv-meta-am');
  guardarL('rv-meta-am', JSON.stringify(d));
  if (antes !== JSON.stringify(d)) window.fbq('init', CONFIG.PIXEL_ID, d);
}

if (CONFIG.PIXEL_ID) {
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
  const arrancar = (datos) => {
    fbq('init', CONFIG.PIXEL_ID, datos || {});
    pixelListo = true;
    fbq('track', 'PageView');
    pendientesPixel.splice(0).forEach(([e, d, o]) => fbq('track', e, d || {}, o || {}));
  };
  if (window.crypto && crypto.subtle) datosMetaIniciales().then(arrancar, () => arrancar(datosMeta()));
  else arrancar({});
}

/* ---------- Pantalla de carga, cookies, videos, carruseles y reseñas ---------- */

(function () {
  const quitar = () => { const c = $('#cargando'); if (c) c.classList.add('listo'); guardar('rv-visto', '1'); };
  if (document.readyState === 'complete') quitar();
  else { window.addEventListener('load', quitar, { once: true }); setTimeout(quitar, 3500); }
})();

(function () {
  const aviso = $('#cookies');
  if (!aviso) return;
  // Franja delgada arriba de todo, dentro de la página: así no tapa el botón fijo de abajo.
  document.body.prepend(aviso);
  if (!leerL('rv-cookies')) aviso.hidden = false;
  $('#cookies-ok').addEventListener('click', () => { aviso.hidden = true; guardarL('rv-cookies', '1'); });
})();

(function () {
  const todos = $$('video[data-src]');
  todos.forEach((v) => {
    v.muted = true;
    v.loop = true;
    v.playsInline = true;
    v.setAttribute('playsinline', '');
    v.setAttribute('muted', '');
    v.preload = 'none';
  });
  if (!('IntersectionObserver' in window)) { todos.forEach((v) => { v.src = v.dataset.src; }); return; }
  const obs = new IntersectionObserver((entradas) => entradas.forEach((en) => {
    const v = en.target;
    if (en.isIntersecting) {
      if (!v.getAttribute('src')) { v.src = v.dataset.src + '#t=0.1'; v.preload = 'auto'; }
      v.play().catch(() => {});
    } else v.pause();
  }), { threshold: 0.4, rootMargin: '200px 0px' });
  todos.forEach((v) => obs.observe(v));
})();

// «Qué trae el combo»: los snacks aparecen uno a uno al llegar a la sección. Sin JS (o sin
// IntersectionObserver) se ven quietos: la clase .revela, que los esconde, solo la pone este código.
(function iniciarRevela() {
  const grupos = $$('[data-revela]');
  if (!grupos.length || !('IntersectionObserver' in window)) return;
  const obs = new IntersectionObserver((entradas) => entradas.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add('visible'); obs.unobserve(en.target); }
  }), { threshold: 0.25 });
  grupos.forEach((g) => { g.classList.add('revela'); obs.observe(g); });
})();

// «Conoce cada snack de cerca»: tocar la foto la acerca 2,3×; moviendo el dedo o el mouse se recorre.
// Otra vez para alejar. Con teclado: Enter o espacio.
(function iniciarLupas() {
  $$('[data-lupa]').forEach((f) => {
    f.tabIndex = 0;
    f.setAttribute('role', 'button');
    f.setAttribute('aria-pressed', 'false');
    f.setAttribute('aria-label', 'Ver de cerca: ' + ($('img', f) || {}).alt);
    const mover = (e) => {
      const r = f.getBoundingClientRect();
      f.style.setProperty('--x', Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100)) + '%');
      f.style.setProperty('--y', Math.max(0, Math.min(100, ((e.clientY - r.top) / r.height) * 100)) + '%');
    };
    const cambiar = (e) => {
      const cerca = !f.classList.contains('de-cerca');
      // La foto grande (1100 px) solo se baja la primera vez que alguien acerca, para no hacer lenta la página.
      const img = $('img[data-grande]', f);
      if (cerca && img) { img.src = img.dataset.grande; img.removeAttribute('data-grande'); }
      if (cerca && e && 'clientX' in e && e.clientX) mover(e);
      else if (cerca) { f.style.setProperty('--x', '50%'); f.style.setProperty('--y', '50%'); }
      f.classList.toggle('de-cerca', cerca);
      f.setAttribute('aria-pressed', String(cerca));
    };
    f.addEventListener('click', cambiar);
    f.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cambiar(); } });
    f.addEventListener('pointermove', (e) => { if (f.classList.contains('de-cerca')) mover(e); });
  });
})();

function iniciarCarrusel(nav) {
  const pista = document.getElementById(nav.dataset.para);
  if (!pista || !pista.children.length) return;
  const puntos = $('.carrusel-puntos', nav);
  const [prev, next] = $$('.carrusel-btn', nav);
  const items = () => Array.from(pista.children);
  puntos.innerHTML = items().map(() => '<span></span>').join('');
  const paso = () => { const it = items()[0]; return it ? it.getBoundingClientRect().width + 12 : pista.clientWidth; };
  const actualizarNav = () => {
    nav.hidden = pista.scrollWidth <= pista.clientWidth + 4;
    const fin = pista.scrollLeft + pista.clientWidth >= pista.scrollWidth - 4;
    const i = fin ? items().length - 1 : Math.round(pista.scrollLeft / paso());
    $$('span', puntos).forEach((p, k) => p.classList.toggle('activo', k === i));
    prev.disabled = pista.scrollLeft <= 4;
    next.disabled = fin;
  };
  prev.addEventListener('click', () => pista.scrollBy({ left: -paso() }));
  next.addEventListener('click', () => pista.scrollBy({ left: paso() }));
  pista.addEventListener('scroll', () => requestAnimationFrame(actualizarNav), { passive: true });
  window.addEventListener('resize', actualizarNav);
  actualizarNav();
}
$$('.carrusel-nav[data-para]:not([data-tarde])').forEach(iniciarCarrusel);

// Reseñas reales: solo las que se marcaron como Publicadas en el gestor.
// En una landing se muestran las de ese producto; si todavía no tiene, las generales de la tienda.
// Arriba, junto al nombre, van las estrellas con el número de reseñas. Abajo, el formulario para dejar una.
const ESTRELLA = '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.3L12 17.1l-5.7 3.1 1.2-6.3L2.8 9.5l6.4-.8z" fill="#C2185B"/></svg>';
const estrellasHtml = (n) => '<span class="resena-estrellas" role="img" aria-label="' + n + ' de 5 estrellas">' + ESTRELLA.repeat(n) + '</span>';

async function pintarResenas() {
  const seccion = $('#opiniones');
  const pista = $('#pista-resenas');
  if (!seccion || !pista) return;
  const enProducto = P.tipo === 'producto' && !!P.productoId;
  if (enProducto) { iniciarFormResena(seccion); seccion.hidden = false; }
  let lista = [];
  try {
    const campos = 'nombre,ciudad,mascota,producto,estrellas,texto,foto_path';
    const ruta = (c) => 'resenas?select=' + c + '&estado=eq.Publicada&order=creado_en.desc&limit=60';
    lista = await rest(ruta(campos + ',producto_id')).catch(() => rest(ruta(campos))); // sin la migración 022 no existe producto_id
  } catch (e) { lista = []; }
  if (!Array.isArray(lista)) lista = [];
  const propias = enProducto ? lista.filter((r) => r.producto_id === P.productoId) : [];
  let mostrar = propias.length ? propias : lista;
  if (!propias.length && P.resenas) mostrar = mostrar.slice().sort((a, b) => (b.producto === P.resenas) - (a.producto === P.resenas));
  mostrar = mostrar.slice(0, 12);
  if (enProducto) pintarResumenResenas(propias.length ? propias : lista, !propias.length);
  if (!mostrar.length) {
    const titulo = $('#t-opiniones');
    if (enProducto && titulo) titulo.textContent = 'Sé el primero en opinar';
    pista.hidden = true;
    return;
  }
  mostrar.forEach((r) => {
    const art = document.createElement('article');
    if (r.foto_path) {
      const img = document.createElement('img');
      img.src = CONFIG.SUPABASE_URL + '/storage/v1/object/public/resenas/' + encodeURIComponent(r.foto_path);
      img.alt = r.mascota ? r.mascota + ', la mascota de ' + r.nombre : 'La mascota de ' + r.nombre;
      img.loading = 'lazy';
      img.width = 560;
      img.height = 420;
      art.appendChild(img);
    }
    const n = Math.max(1, Math.min(5, Number(r.estrellas) || 5));
    const cuerpo = document.createElement('div');
    cuerpo.className = 'resena-cuerpo';
    cuerpo.innerHTML = estrellasHtml(n) +
      '<blockquote>' + esc(r.texto) + '</blockquote><div class="resena-pie"><span><strong>' + esc(r.nombre) + '</strong> · ' + esc(r.ciudad) +
      (r.mascota ? ' · con ' + esc(r.mascota) : '') + '</span><span class="resena-tag">' + esc(r.producto === 'Cajita para perros' ? 'Cajita' : r.producto) + '</span></div>';
    art.appendChild(cuerpo);
    pista.appendChild(art);
  });
  seccion.hidden = false;
  iniciarCarrusel($('.carrusel-nav[data-para="pista-resenas"]'));
}

// Estrellas debajo del nombre del producto: promedio y número de reseñas (lleva a la sección de opiniones).
function pintarResumenResenas(lista, generales) {
  const h1 = $('.compra-info h1');
  if (!h1) return;
  let caja = $('.resumen-resenas');
  if (!caja) {
    caja = document.createElement('a');
    caja.className = 'resumen-resenas';
    caja.href = '#opiniones';
    h1.insertAdjacentElement('afterend', caja);
  }
  if (!lista.length) {
    caja.innerHTML = '<span class="resena-estrellas vacias" aria-hidden="true">' + ESTRELLA.repeat(5) + '</span><span>Sé el primero en opinar</span>';
    return;
  }
  const prom = lista.reduce((s, r) => s + (Number(r.estrellas) || 5), 0) / lista.length;
  const n = lista.length;
  const txt = prom.toFixed(1).replace('.', ',');
  caja.setAttribute('aria-label', 'Calificación ' + txt + ' de 5, ' + n + (n === 1 ? ' reseña' : ' reseñas') + (generales ? ' de clientes Revoltosos' : '') + '. Ver opiniones');
  caja.innerHTML = '<span class="resena-estrellas" aria-hidden="true">' + ESTRELLA.repeat(Math.round(prom)) + '</span>' +
    '<strong aria-hidden="true">' + txt + '</strong><span aria-hidden="true">(' + n + (n === 1 ? ' reseña' : ' reseñas') + ')</span>';
}

// Formulario para dejar una reseña desde la landing: estrellas, comentario, nombre, ciudad, mascota y foto.
// Entra como Pendiente y se publica desde el gestor › Reseñas.
function iniciarFormResena(seccion) {
  const cont = $('.contenedor', seccion);
  if (!cont || $('#rf-form')) return;
  const nombreProducto = () => (T.prodPorId[P.productoId] && T.prodPorId[P.productoId].nombre) || ($('.compra-info h1') || {}).textContent || 'Otro snack';
  const zona = document.createElement('div');
  zona.className = 'rf';
  zona.innerHTML =
    '<button type="button" class="btn btn--oscuro rf-abrir" aria-expanded="false" aria-controls="rf-form">' + ICONO.mas + 'Escribir una reseña</button>' +
    '<form class="rf-form" id="rf-form" novalidate hidden>' +
      '<h3>Cuéntanos cómo le fue a tu peludo</h3>' +
      '<fieldset><legend>¿Qué tanto le gustó?</legend><div class="rf-estrellas" role="radiogroup" aria-label="Calificación"></div></fieldset>' +
      '<div class="campo"><label for="rf-texto">Tu comentario</label><textarea id="rf-texto" name="texto" maxlength="600" rows="4" placeholder="Ej: apenas oye la bolsa se emociona"></textarea><span class="error" id="rf-e-texto"></span></div>' +
      '<div class="campos-2">' +
        '<div class="campo"><label for="rf-nombre">Tu nombre</label><input id="rf-nombre" name="nombre" type="text" autocomplete="given-name" maxlength="60" placeholder="Laura"><span class="error" id="rf-e-nombre"></span></div>' +
        '<div class="campo"><label for="rf-ciudad">Ciudad</label><input id="rf-ciudad" name="ciudad" type="text" autocomplete="address-level2" maxlength="60" placeholder="Pereira"><span class="error" id="rf-e-ciudad"></span></div>' +
      '</div>' +
      '<div class="campo"><label for="rf-mascota">Nombre de tu mascota <small>(opcional)</small></label><input id="rf-mascota" name="mascota" type="text" maxlength="40" placeholder="Toby"></div>' +
      '<div class="campo"><span class="rf-label">Foto de tu mascota <small>(opcional, pero nos encanta)</small></span>' +
        '<label class="rf-foto"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 8h3l2-2.5h6L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>' +
        '<span id="rf-foto-texto">Toca para subir una foto</span><input type="file" id="rf-foto" accept="image/jpeg,image/png,image/webp,image/heic,image/heif"></label><span class="error" id="rf-e-foto"></span></div>' +
      '<label class="acepto"><input type="checkbox" id="rf-autoriza"><span>Autorizo a Revoltosos a publicar mi comentario, mi nombre, mi ciudad y la foto de mi mascota en su página y sus redes, según la <a href="/privacidad.html" target="_blank" rel="noopener">política de datos</a>.</span></label>' +
      '<span class="error" id="rf-e-autoriza"></span>' +
      '<div class="trampa" aria-hidden="true"><label for="rf-empresa">Empresa</label><input id="rf-empresa" type="text" tabindex="-1" autocomplete="off"></div>' +
      '<p class="form-error" id="rf-error" role="alert" hidden></p>' +
      '<button type="submit" class="btn btn--ancho" id="rf-enviar">Enviar mi reseña</button>' +
      '<p class="seguro">Revisamos cada reseña antes de publicarla.</p>' +
    '</form>' +
    '<div class="rf-gracias" id="rf-gracias" role="status" hidden><strong>¡Gracias por tu reseña!</strong><span>La revisamos y aparece aquí en poco tiempo.</span></div>';
  cont.appendChild(zona);

  const form = $('#rf-form', zona);
  const abrir = $('.rf-abrir', zona);
  abrir.addEventListener('click', () => {
    form.hidden = !form.hidden;
    abrir.setAttribute('aria-expanded', String(!form.hidden));
    if (!form.hidden) $('#rf-texto').focus();
  });

  let nota = 5;
  const cajaEstrellas = $('.rf-estrellas', form);
  const pintar = () => $$('button', cajaEstrellas).forEach((b, i) => { b.classList.toggle('on', i < nota); b.setAttribute('aria-checked', String(i + 1 === nota)); });
  for (let n = 1; n <= 5; n++) {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('role', 'radio');
    b.setAttribute('aria-label', n + (n === 1 ? ' estrella' : ' estrellas'));
    b.innerHTML = '<svg width="34" height="34" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.3L12 17.1l-5.7 3.1 1.2-6.3L2.8 9.5l6.4-.8z"/></svg>';
    b.addEventListener('click', () => { nota = n; pintar(); });
    cajaEstrellas.appendChild(b);
  }
  pintar();

  // La foto se reduce a 1200 px en el celular antes de subirla.
  let foto = null;
  $('#rf-foto').addEventListener('change', async (e) => {
    const archivo = e.target.files[0];
    $('#rf-e-foto').textContent = '';
    foto = null;
    if (!archivo) return;
    if (archivo.size > 15 * 1024 * 1024) { $('#rf-e-foto').textContent = 'La foto es muy pesada. Prueba con otra.'; return; }
    try { foto = await reducirFoto(archivo); } catch (err) {
      if (archivo.size <= 8 * 1024 * 1024 && /^image\/(jpeg|png|webp)$/.test(archivo.type)) foto = archivo;
      else { $('#rf-e-foto').textContent = 'No pudimos leer esa foto. Prueba con una JPG o PNG.'; return; }
    }
    const lab = $('.rf-foto', form);
    let prev = $('img', lab);
    if (!prev) { prev = document.createElement('img'); prev.alt = 'Vista previa de la foto'; lab.insertBefore(prev, lab.firstChild); }
    prev.src = URL.createObjectURL(foto);
    $('svg', lab).style.display = 'none';
    $('#rf-foto-texto').textContent = 'Toca para cambiar la foto';
  });

  const reglas = {
    texto: (v) => (v.trim().length >= 5 ? '' : 'Escribe al menos una frase.'),
    nombre: (v) => (v.trim().length >= 2 ? '' : 'Escribe tu nombre.'),
    ciudad: (v) => (v.trim().length >= 2 ? '' : 'Escribe tu ciudad.')
  };
  const validar = (n) => {
    const el = $('[name="' + n + '"]', form);
    const msg = reglas[n](el.value);
    el.setAttribute('aria-invalid', msg ? 'true' : 'false');
    $('#rf-e-' + n).textContent = msg;
    return !msg;
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    $('#rf-error').hidden = true;
    const ok = Object.keys(reglas).map(validar);
    const autoriza = $('#rf-autoriza').checked;
    $('#rf-e-autoriza').textContent = autoriza ? '' : 'Necesitamos tu autorización para publicarla.';
    if (ok.indexOf(false) >= 0 || !autoriza) { ($('[aria-invalid="true"]', form) || $('#rf-autoriza')).focus(); return; }
    const listo = () => { form.hidden = true; abrir.hidden = true; $('#rf-gracias').hidden = false; };
    if ($('#rf-empresa').value) { listo(); return; }
    const btn = $('#rf-enviar');
    btn.disabled = true;
    btn.textContent = 'Enviando…';
    const cab = { apikey: CONFIG.SUPABASE_KEY, Authorization: 'Bearer ' + CONFIG.SUPABASE_KEY };
    try {
      const id = crypto.randomUUID ? crypto.randomUUID()
        : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => { const r = (Math.random() * 16) | 0; return (c === 'x' ? r : ((r & 3) | 8)).toString(16); });
      let fotoPath = null;
      if (foto) {
        fotoPath = id + '.jpg';
        const subida = await fetch(CONFIG.SUPABASE_URL + '/storage/v1/object/resenas/' + fotoPath, {
          method: 'POST', headers: Object.assign({ 'Content-Type': foto.type || 'image/jpeg', 'x-upsert': 'false' }, cab), body: foto
        }).catch(() => null);
        if (!subida || !subida.ok) fotoPath = null; // la reseña se guarda igual, sin foto
      }
      const fila = {
        id,
        nombre: $('#rf-nombre').value.trim(),
        ciudad: $('#rf-ciudad').value.trim(),
        mascota: $('#rf-mascota').value.trim() || null,
        producto: nombreProducto().trim().slice(0, 80),
        producto_id: P.productoId,
        estrellas: nota,
        texto: $('#rf-texto').value.trim(),
        foto_path: fotoPath,
        autoriza: true
      };
      const enviar = (f) => fetch(CONFIG.SUPABASE_URL + '/rest/v1/resenas', {
        method: 'POST', headers: Object.assign({ 'Content-Type': 'application/json', Prefer: 'return=minimal' }, cab), body: JSON.stringify(f)
      });
      let res = await enviar(fila);
      if (!res.ok) { // sin la migración 022 solo se aceptaba «Otro snack» y no existe producto_id
        const viejo = Object.assign({}, fila, { producto: 'Otro snack' });
        delete viejo.producto_id;
        res = await enviar(viejo);
      }
      if (!res.ok) throw new Error('resena ' + res.status);
      listo();
    } catch (err) {
      $('#rf-error').textContent = 'No pudimos enviar tu reseña. Revisa tu conexión e inténtalo de nuevo.';
      $('#rf-error').hidden = false;
      btn.disabled = false;
      btn.textContent = 'Enviar mi reseña';
    }
  });
}

function reducirFoto(archivo) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const s = Math.min(1, 1200 / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * s);
      c.height = Math.round(img.height * s);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      c.toBlob((b) => (b ? resolve(b) : reject(new Error('blob'))), 'image/jpeg', 0.85);
      URL.revokeObjectURL(img.src);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(archivo);
  });
}
pintarResenas();

$$('[data-anio]').forEach((el) => { el.textContent = new Date().getFullYear(); });

/* ---------- Clics a WhatsApp (migración 025) ----------
   Cada toque a un enlace de wa.me se cuenta en el gestor (Resumen → Clics al botón de WhatsApp)
   y se manda a Meta como «Contact». keepalive: el registro sale aunque se abra WhatsApp. */
function lugarWhatsapp(a) {
  if (a.dataset.waLugar) return a.dataset.waLugar;
  if (a.classList.contains('wa-flotante')) return 'flotante';
  if (a.hasAttribute('data-wa-pedido')) return 'formulario';
  if (a.hasAttribute('data-salida-wa')) return 'salida';
  if (a.closest('.gracias-t, [data-gracias]')) return 'gracias';
  if (a.closest('.form-error, #form-error')) return 'error';
  if (a.closest('footer')) return 'pie';
  return 'contacto';
}
function iniciarClicsWhatsapp() {
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href*="wa.me/"]');
    if (!a) return;
    const lugar = lugarWhatsapp(a);
    track('Contact', { content_name: 'whatsapp-' + lugar });
    try {
      fetch(CONFIG.SUPABASE_URL + '/rest/v1/rpc/registrar_clic_whatsapp', {
        method: 'POST',
        keepalive: true,
        headers: { apikey: CONFIG.SUPABASE_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          p_lugar: lugar, p_pagina: location.pathname, p_visitante: visitante(),
          p_utm_source: leer('rv-utm_source') || null, p_utm_campaign: leer('rv-utm_campaign') || null, p_utm_content: leer('rv-utm_content') || null
        })
      }).catch(() => {});
    } catch (err) { /* nunca debe impedir que se abra WhatsApp */ }
  }, true);
}

/* ---------- Ruleta del regalo (al pasar ajustes.regalo_desde) ----------
   Es solo una animación: siempre cae en el regalo (ajustes.regalo_variante) y lo dice abajo.
   Las demás porciones muestran otros snacks de la tienda con su foto. */

function porcionesRuleta() {
  const reg = T.porId[T.ajustes.regalo_variante];
  const vistos = {};
  const otros = [];
  T.variantes.forEach((v) => {
    const p = prodDe(v);
    if (!p || p.categoria === 'Combos' || vistos[p.id] || (reg && p.id === reg.producto_id)) return;
    vistos[p.id] = true;
    otros.push({ nombre: p.nombre.replace(/ deshidratadas?$/i, ''), foto: fotoDe(v) });
  });
  const primera = { nombre: reg ? prodDe(reg).nombre.replace(/ deshidratadas?$/i, '') + ' ' + reg.nombre.replace(/^Bolsa /i, '') : 'Codornices 50 g', foto: reg ? fotoDe(reg) : '/assets/img/productos/codornices-bolsa-50g-600.jpg' };
  const lista = [primera].concat(otros.slice(0, 7));
  while (lista.length < 8) lista.push(otros[lista.length % Math.max(1, otros.length)] || primera);
  return lista;
}

function abrirRuleta() {
  if ($('#ruleta')) $('#ruleta').remove();
  const reg = T.porId[T.ajustes.regalo_variante];
  const nombreReg = nombreRegalo();
  const fotoReg = reg ? fotoDe(reg) : '/assets/img/productos/codornices-bolsa-50g-600.jpg';
  const d = document.createElement('dialog');
  d.id = 'ruleta';
  d.className = 'ruleta';
  d.setAttribute('aria-labelledby', 'ruleta-titulo');
  const porciones = porcionesRuleta();
  const focos = Array.from({ length: 16 }, (_, i) => '<i style="--a:' + (i * 22.5) + 'deg;--d:' + (i % 2 ? '0s' : 'var(--vel)') + '"></i>').join('');
  const chispas = Array.from({ length: 10 }, (_, i) => {
    const a = (i / 10) * Math.PI * 2 + 0.3;
    return '<svg viewBox="0 0 24 24" style="left:calc(50% + ' + Math.round(Math.cos(a) * 160) + 'px - 9px);top:calc(50% + ' + Math.round(Math.sin(a) * 160) + 'px - 9px);animation-delay:' + (i * 90) + 'ms"><path d="M12 0l2.6 9.4L24 12l-9.4 2.6L12 24l-2.6-9.4L0 12l9.4-2.6z"/></svg>';
  }).join('');
  d.innerHTML = '<div class="ruleta-v">' +
    '<div class="ruleta-rayos" aria-hidden="true"></div>' +
    '<div class="ruleta-cab" data-ruleta-antes><span class="ruleta-rotulo">LLEGASTE A ' + esc(pesos(T.ajustes.regalo_desde)) + '</span><h2 id="ruleta-titulo">Gira y mira tu regalo</h2></div>' +
    '<div class="ruleta-cab" data-ruleta-despues hidden><span class="ruleta-rotulo ok">TU REGALO</span><h2>' + esc(nombreReg) + '</h2></div>' +
    '<div class="ruleta-zona"><div class="ruleta-escala">' +
      '<svg class="ruleta-puntero" viewBox="0 0 40 46" aria-hidden="true"><path d="M20 44 3 9a6 6 0 0 1 5.4-8.6h23.2A6 6 0 0 1 37 9z"/><circle cx="20" cy="13" r="5"/></svg>' +
      '<div class="ruleta-aro">' + focos + '</div>' +
      '<div class="ruleta-rueda" role="img" aria-label="Ruleta con fotos de los snacks Revoltosos">' +
        porciones.map((p, i) => '<span class="ruleta-div" style="--a:' + (i * 45) + 'deg"></span>').join('') +
        porciones.map((p, i) => '<div class="ruleta-porcion' + (i === 0 ? ' gana' : '') + '" style="--a:' + (i * 45 + 22.5) + 'deg;--c:' + (i % 2 ? '#2A231D' : '#FFFFFF') + '">' +
          '<img src="' + esc(p.foto) + '" alt="" width="46" height="46"><span>' + esc(p.nombre) + '</span></div>').join('') +
        '<div class="ruleta-brillo"></div></div>' +
      '<div class="ruleta-centro"><img src="' + esc(fotoReg) + '" alt="" width="68" height="68"></div>' +
      '<div class="ruleta-chispas" aria-hidden="true">' + chispas + '</div>' +
    '</div></div>' +
    '<div class="ruleta-premio" data-ruleta-despues hidden><img src="' + esc(fotoReg) + '" alt="" width="56" height="56"><div><strong>' + esc(nombreReg) + '</strong><span>Va gratis dentro de tu pedido</span></div><b>$0</b></div>' +
    '<div class="ruleta-acciones">' +
      '<button type="button" class="btn ruleta-girar" data-ruleta-girar>Girar la ruleta</button>' +
      '<button type="button" class="btn" data-ruleta-seguir hidden>Seguir con mi pedido</button>' +
      '<button type="button" class="ruleta-omitir" data-ruleta-omitir>Omitir animación</button>' +
      '<p class="ruleta-legal">La ruleta es solo una animación, no es un sorteo. Desde ' + esc(pesos(T.ajustes.regalo_desde)) + ' el regalo siempre es ' + esc(nombreReg.toLowerCase().indexOf('codorn') >= 0 ? 'una bolsa de codornices de 50 g' : nombreReg) + '.</p>' +
    '</div></div>';
  document.body.appendChild(d);
  const rueda = $('.ruleta-rueda', d);
  const FINAL = 360 * 7 - 22.5;
  let temp = null;
  const mostrarResultado = (sinGiro) => {
    clearTimeout(temp);
    if (sinGiro) { rueda.style.transition = 'none'; rueda.style.transform = 'rotate(' + FINAL + 'deg)'; }
    d.classList.remove('girando');
    d.classList.add('listo');
    $$('[data-ruleta-antes]', d).forEach((x) => { x.hidden = true; });
    $$('[data-ruleta-despues]', d).forEach((x) => { x.hidden = false; });
    $('[data-ruleta-girar]', d).hidden = true;
    $('[data-ruleta-omitir]', d).hidden = true;
    const seguir = $('[data-ruleta-seguir]', d);
    seguir.hidden = false;
    seguir.focus();
    lanzarConfeti($('.ruleta-v', d));
    if (!reducirMovimiento) { try { if (navigator.vibrate) navigator.vibrate([40, 60, 40, 60, 80]); } catch (e) {} }
  };
  d.addEventListener('click', (e) => {
    if (e.target.closest('[data-ruleta-girar]')) {
      if (reducirMovimiento) { mostrarResultado(true); return; }
      d.classList.add('girando');
      const b = $('[data-ruleta-girar]', d);
      b.disabled = true;
      b.textContent = 'Girando…';
      rueda.style.transform = 'rotate(' + FINAL + 'deg)';
      temp = setTimeout(() => mostrarResultado(false), 5100);
    } else if (e.target.closest('[data-ruleta-omitir]')) mostrarResultado(true);
    else if (e.target.closest('[data-ruleta-seguir]')) d.close();
  });
  d.addEventListener('close', () => { clearTimeout(temp); d.remove(); });
  if (typeof d.showModal === 'function') d.showModal(); else d.setAttribute('open', '');
}

/* ---------- Arranque ---------- */

function pintarTodo() {
  pintarProductoGenerico();
  pintarFotosSubidas();
  pintarCatalogo();
  pintarSlider();
  pintarEscalones();
  pintarCompra();
  pintarCombina();
  pintarSeparado();
  $$('[data-envio-gratis-desde]').forEach((el) => { el.textContent = pesos(T.ajustes.envio_gratis_desde); });
  $$('[data-pedido-minimo]').forEach((el) => { el.textContent = pesos(Number(T.ajustes.pedido_minimo) || 0); });
  actualizar();
}

// Las ventanas del catálogo se pegan justo debajo del encabezado (que también va pegado arriba).
function medirCabecera() { const c = $('.cab'); if (c) document.documentElement.style.setProperty('--cab-alto', c.offsetHeight + 'px'); }
window.addEventListener('resize', medirCabecera);
iniciarClicsWhatsapp();
iniciarMenu();
iniciarBuscador();
crearDialogos();
iniciarCarrito();
iniciarCompra();
iniciarBarraFija();
precargarGaleria();
cargarCatalogo(pintarTodo).then(() => {
  precargarGaleria(); // por si el catálogo sumó fotos subidas desde el gestor
  if (P.tipo === 'producto' && P.productoId) {
    const vs = variantesDelProducto();
    if (vs.length) track('ViewContent', { content_ids: vs.map((v) => v.id), content_type: 'product', content_name: P.productoId, value: vs[0].precio, currency: 'COP' });
  }
  iniciarPruebaSocial();
});
pintarTodo();
medirCabecera();
setTimeout(medirCabecera, 600);
if (location.hash === '#carrito') abrirCarrito();
else if (location.hash === '#pedido') abrirPedido();
volverDeWompi();
