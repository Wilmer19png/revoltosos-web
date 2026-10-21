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
  whatsapp: '<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"><path d="M4 20l1.3-3.9A8 8 0 1 1 8 19z"/></svg>',
  candado: '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>'
};

/* ---------- Catálogo ---------- */

// Respaldo por si Supabase no responde: la tienda sigue mostrando lo principal.
const RESPALDO = {
  ajustes: { envio_gratis_desde: 70000, envio_base: 20000, envio_departamentos: {}, prioritario: 5000 },
  productos: [
    { id: 'codornices', nombre: 'Codornices deshidratadas', categoria: 'Codorniz', descripcion: 'Codorniz entera, deshidratada lentamente. Un solo ingrediente.', imagen: '/assets/img/productos/codornices-frasco-100g-600.jpg', ruta: '/codornices/', orden: 1 },
    { id: 'cajita-perros', nombre: 'Cajita para perros', categoria: 'Cajitas', descripcion: 'Patas de pollo, oreja de cerdo, codornicitas, codorniz entera y fémur de cerdo.', imagen: '/assets/img/productos/cajita-producto-fondo-blanco-600.jpg', ruta: '/cajita/', orden: 2 }
  ],
  variantes: [
    { id: 'codornices-bolsa-50g', producto_id: 'codornices', nombre: 'Bolsa 50 g', detalle: 'Para probar', precio: 18900, precio_antes: null, orden: 1, imagen: '/assets/img/productos/codornices-bolsa-50g-600.jpg' },
    { id: 'codornices-frasco-100g', producto_id: 'codornices', nombre: 'Frasco 100 g', detalle: 'Aprox. 30 codornices', precio: 34900, precio_antes: null, orden: 2, imagen: '/assets/img/productos/codornices-frasco-100g-600.jpg' },
    { id: 'cajita-perros', producto_id: 'cajita-perros', nombre: 'Cajita · 5 snacks', detalle: '5 snacks distintos', precio: 72900, precio_antes: null, orden: 1 }
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
  T.variantes.forEach((v) => { T.porId[v.id] = v; });
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
  const [productos, variantes, ajustes] = await Promise.all([
    rest('productos?select=id,nombre,categoria,descripcion,imagen,ruta,orden,etiqueta,fotos&order=orden')
      .catch(() => pedir('productos?select=id,nombre,categoria,descripcion,imagen,ruta,orden{extra}&order=orden', ',etiqueta')),
    rest('variantes?select=id,producto_id,nombre,detalle,precio,precio_antes,orden,imagen,envio_gratis&order=orden')
      .catch(() => pedir('variantes?select=id,producto_id,nombre,detalle,precio,precio_antes,orden{extra}&order=orden', ',imagen')),
    rest('ajustes?select=envio_gratis_desde,envio_base,envio_departamentos,prioritario,envio_ciudades,wompi_activo&id=eq.1')
      .catch(() => pedir('ajustes?select=envio_gratis_desde,envio_base,envio_departamentos,prioritario{extra}&id=eq.1', ',envio_ciudades'))
  ]);
  if (!productos.length || !variantes.length) throw new Error('catálogo vacío');
  return { productos, variantes, ajustes: ajustes[0] };
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
    alCambiar();
  } catch (e) { /* se queda con lo que había */ }
}

const prodDe = (v) => T.prodPorId[v.producto_id];
const nombreLargo = (v) => prodDe(v).nombre + ' · ' + v.nombre;
const urlProducto = (p) => p.ruta || '/producto/?p=' + encodeURIComponent(p.id);
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
  return {
    ls, subtotal, unidades, descuento, neto, gratis, porCombo,
    ahorro: ahorroPromo + descuento,
    falta: gratis ? 0 : Math.max(0, meta - neto),
    pct: gratis ? 100 : (meta ? Math.min(100, Math.round(neto / meta * 100)) : 100),
    envio: gratis ? 0 : tarifa
  };
}

function agregar(id, n, opciones) {
  const v = T.porId[id];
  if (!v) return;
  carrito[id] = Math.min(20, (carrito[id] || 0) + (n || 1));
  guardarCarrito();
  track('AddToCart', { content_ids: [id], content_type: 'product', content_name: nombreLargo(v), num_items: n || 1, value: v.precio * (n || 1), currency: 'COP' });
  actualizar();
  $$('[data-contador]').forEach((c) => { c.classList.remove('rv-salto'); void c.offsetWidth; c.classList.add('rv-salto'); });
  if (!(opciones && opciones.silencioso)) toast((n > 1 ? n + ' × ' : '') + nombreLargo(v) + ' en tu carrito', 'Ver carrito', abrirCarrito);
}

function cambiar(id, q) {
  if (q <= 0) delete carrito[id]; else carrito[id] = Math.min(20, q);
  guardarCarrito();
  actualizar();
}

/* ---------- Avisos ---------- */

function toast(texto, accion, alHacer) {
  let t = $('#toast-t');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast-t';
    t.className = 'toast-t';
    t.setAttribute('role', 'status');
    document.body.appendChild(t);
  }
  t.innerHTML = '<span>' + esc(texto) + '</span>' + (accion ? '<button type="button">' + esc(accion) + '</button>' : '');
  if (accion) $('button', t).addEventListener('click', () => { t.hidden = true; alHacer(); });
  t.hidden = false;
  t.classList.remove('rv-entra'); void t.offsetWidth; t.classList.add('rv-entra');
  clearTimeout(toast.temp);
  toast.temp = setTimeout(() => { t.hidden = true; }, 3800);
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

/* ---------- Barras de envío gratis ---------- */

function pintarBarraEnvio(el, k) {
  if (!el.dataset.listo) {
    el.innerHTML = '<div class="envio-barra-in"><p>' + ICONO.camion + '<span data-msg></span></p>' +
      '<div class="riel" role="progressbar" aria-label="Avance hacia el envío gratis" aria-valuemin="0" aria-valuemax="100"><span></span></div></div>';
    el.dataset.listo = '1';
  }
  const meta = pesos(T.ajustes.envio_gratis_desde);
  const msg = $('[data-msg]', el);
  if (k.gratis) msg.innerHTML = '<strong>¡Desbloqueaste el envío GRATIS!</strong>';
  else if (!k.unidades) msg.innerHTML = 'Envío <strong>GRATIS</strong> desde ' + meta;
  else msg.innerHTML = (k.pct >= 60 ? '¡Ya casi! ' : '') + 'Te faltan <strong>' + pesos(k.falta) + '</strong> para envío GRATIS';
  el.classList.toggle('gratis', k.gratis);
  el.classList.toggle('casi', !k.gratis && k.pct >= 60);
  const riel = $('.riel', el);
  riel.setAttribute('aria-valuenow', String(k.pct));
  $('span', riel).style.width = (k.unidades ? Math.max(4, k.pct) : 0) + '%';
}

/* ---------- Pintar todo lo que depende del carrito ---------- */

let estabaGratis = leer('rv-gratis') === '1';

function actualizar() {
  const k = cuentas();
  $$('[data-contador]').forEach((c) => { c.textContent = k.unidades; c.dataset.n = String(k.unidades); });
  $$('[data-envio-barra]').forEach((el) => pintarBarraEnvio(el, k));
  $$('[data-agregar]').forEach((b) => {
    const q = carrito[b.dataset.agregar] || 0;
    b.classList.toggle('en-carrito', q > 0);
    if (b.classList.contains('btn-agregar')) b.innerHTML = (q ? ICONO.check + 'Agregado (' + q + ')' : ICONO.mas + 'Agregar');
    if (b.classList.contains('btn-mas')) b.innerHTML = q ? ICONO.check : ICONO.mas;
  });
  pintarBarraFija(k);
  if ($('#carrito') && $('#carrito').open) pintarCarrito();
  if ($('#pedido-modal') && $('#pedido-modal').open && !$('#pedido-modal').dataset.gracias) pintarResumenPedido();

  if (k.gratis && !estabaGratis) {
    const visible = ($('#carrito') && $('#carrito').open) ? $('.envio-caja', $('#carrito')) : $('.cab [data-envio-barra]');
    lanzarConfeti(visible);
  }
  estabaGratis = k.gratis;
  guardar('rv-gratis', k.gratis ? '1' : '0');
}

/* ---------- Barra fija de abajo ---------- */

function pintarBarraFija(k) {
  const barra = $('#barra-t');
  if (!barra) return;
  const btn = $('[data-barra-btn]', barra);
  btn.innerHTML = (k.unidades ? 'Finalizar pedido (' + k.unidades + ')' : 'Pedir ahora') + ICONO.flecha;
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
  if (!('IntersectionObserver' in window) || !ocultan.length) { barra.classList.add('visible'); return; }
  const vistos = new Set();
  const obs = new IntersectionObserver((entradas) => {
    entradas.forEach((e) => { if (e.isIntersecting) vistos.add(e.target); else vistos.delete(e.target); });
    barra.classList.toggle('visible', vistos.size === 0);
  }, { threshold: 0.15 });
  ocultan.forEach((el) => obs.observe(el));
}

/* ---------- Catálogo en la página de inicio ---------- */

let categoria = '';
let catPedida = new URLSearchParams(location.search).get('cat'); // /productos/?cat=Combos

const fuego = (texto) => '<span class="etq-fuego">' + ICONO.fuego + esc(texto) + '</span>';

function tarjetaProducto(v) {
  const p = prodDe(v);
  const etiqueta = (p.etiqueta ? fuego(p.etiqueta) : '') + (v.precio_antes > v.precio
    ? '<span class="prod-etiqueta">Ahorras ' + pesos(v.precio_antes - v.precio) + '</span>'
    : (v.envio_gratis || v.precio >= T.ajustes.envio_gratis_desde ? '<span class="prod-etiqueta rosa">Envío gratis</span>' : ''));
  return '<article class="prod">' +
    '<a class="prod-foto" href="' + esc(urlProducto(p)) + '"><img src="' + esc(fotoDe(v)) + '" alt="' + esc(p.nombre) + '" width="600" height="600" loading="lazy">' + (etiqueta ? '<span class="prod-etiquetas">' + etiqueta + '</span>' : '') + '</a>' +
    '<div class="prod-info"><h3><a href="' + esc(urlProducto(p)) + '">' + esc(p.nombre) + '</a></h3>' +
    '<span class="tam">' + esc(v.nombre) + (v.detalle ? ' · ' + esc(v.detalle) : '') + '</span>' +
    '<div class="precio"><strong>' + pesos(v.precio) + '</strong>' + (v.precio_antes > v.precio ? '<s>' + pesos(v.precio_antes) + '</s>' : '') + '</div>' +
    '<button type="button" class="btn-agregar" data-agregar="' + esc(v.id) + '" aria-label="Agregar ' + esc(nombreLargo(v)) + ' al carrito"></button></div></article>';
}

function pintarCatalogo() {
  const caja = $('#catalogo-lista');
  if (!caja) return;
  const filtros = $('#filtro-cat');
  const cats = [];
  T.variantes.forEach((v) => { const c = prodDe(v).categoria; if (cats.indexOf(c) < 0) cats.push(c); });
  // Página de una sola categoría (p. ej. /combos/): sin filtros. Si no, ?cat=Combos preselecciona.
  if (P.categoriaFija) categoria = P.categoriaFija;
  else if (catPedida && cats.indexOf(catPedida) >= 0) { categoria = catPedida; catPedida = null; } // se aplica cuando llega el catálogo real
  if (!P.categoriaFija && categoria && cats.indexOf(categoria) < 0) categoria = '';
  if (filtros) {
    filtros.innerHTML = ['', ...cats].map((c) => '<button type="button" data-cat="' + esc(c) + '" aria-pressed="' + (c === categoria) + '">' + esc(c || 'Todo') + '</button>').join('');
    filtros.hidden = cats.length < 2 || !!P.categoriaFija;
  }
  const lista = T.variantes.filter((v) => !categoria || prodDe(v).categoria === categoria);
  const total = $('[data-total-catalogo]');
  if (total) total.textContent = lista.length + (lista.length === 1 ? ' opción' : ' opciones');
  caja.innerHTML = lista.length ? lista.map(tarjetaProducto).join('') : '<p class="catalogo-vacio">' + (P.categoriaFija ? 'Pronto tendremos combos aquí.' : 'Pronto tendremos más snacks aquí.') + ' <a href="/productos/">Ver todos los productos</a></p>';
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
  const mejor = vs.reduce((m, v) => ((v.precio_antes || 0) - v.precio > ((m && m.precio_antes) || 0) - (m ? m.precio : 0) ? v : m), null);
  caja.innerHTML = vs.map((v) => {
    const ahorra = v.precio_antes > v.precio ? v.precio_antes - v.precio : 0;
    return '<button type="button" class="escalon' + (mejor && mejor.id === v.id && ahorra ? ' destacado' : '') + '" data-agregar-escalon="' + esc(v.id) + '">' +
      '<span class="nombre"><strong>' + esc(v.nombre) + '</strong><span>' + esc(v.detalle || 'Toca para agregar') + '</span></span>' +
      '<span class="valor">' + (ahorra ? '<s>' + pesos(v.precio_antes) + '</s>' : '') + '<strong>' + pesos(v.precio) + '</strong></span>' +
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
  if (!vs.length) {
    if (agotado) agotado.hidden = false;
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
  $('#compra-precio').innerHTML = '<strong>' + pesos(v.precio) + '</strong>' + (ahorra ? '<s>' + pesos(v.precio_antes) + '</s><span class="chip-ahorro">Ahorras ' + pesos(ahorra) + '</span>' : '');
  $('#compra-cantidad').textContent = compra.cantidad;
  const gratisTxt = $('[data-envio-gratis-desde]');
  if (gratisTxt) gratisTxt.textContent = pesos(T.ajustes.envio_gratis_desde);
  if (caja) caja.dataset.variante = v.id;
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

function mostrarFoto(src, alt, mini) {
  const img = $('.galeria-p .principal img');
  if (!img || !src) return;
  img.removeAttribute('srcset'); // si no, el navegador sigue mostrando la foto del srcset
  img.removeAttribute('sizes');
  img.src = src;
  if (alt) img.alt = alt;
  $$('.miniaturas button').forEach((b) => b.setAttribute('aria-pressed', String(b === mini)));
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
  $$('[data-p-nombre]').forEach((el) => { el.textContent = p ? p.nombre : 'Producto no disponible'; });
  $$('[data-p-desc]').forEach((el) => { el.textContent = p ? (p.descripcion || '') : 'Este snack no está disponible por ahora. Mira los demás en la tienda.'; });
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
  $('#compra-pedir').addEventListener('click', () => {
    if (!carrito[compra.variante]) agregar(compra.variante, compra.cantidad, { silencioso: true });
    compra.cantidad = 1;
    pintarCompra();
    abrirPedido();
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

  [c, m].forEach((d) => {
    d.addEventListener('click', (e) => { if (e.target === d || e.target.closest('[data-cerrar]')) cerrarDialogo(d); });
    d.addEventListener('close', () => {
      if (!$$('dialog.panel').some((x) => x.open)) document.documentElement.style.overflow = '';
      if (d === m && d.dataset.gracias) reiniciarFormulario();
    });
  });
  $('[data-finalizar]', c).addEventListener('click', () => { cerrarDialogo(c); abrirPedido(); });
  iniciarFormulario();
}

function abrirDialogo(d) {
  document.documentElement.style.overflow = 'hidden';
  if (typeof d.showModal === 'function') d.showModal(); else d.setAttribute('open', '');
}
function cerrarDialogo(d) {
  if (typeof d.close === 'function') d.close(); else { d.removeAttribute('open'); d.dispatchEvent(new Event('close')); }
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
  let html = '<div class="caja envio-caja' + (k.gratis ? ' gratis' : (k.pct >= 60 ? ' casi' : '')) + '">';
  html += k.gratis
    ? '<p class="rv-pop"><strong>¡Desbloqueaste el envío GRATIS!</strong> Te ahorraste el envío.</p>'
    : '<p>' + (k.pct >= 60 ? '¡Ya casi! ' : '') + 'Te faltan <strong style="color: var(--rosa)">' + pesos(k.falta) + '</strong> para que tu envío sea totalmente <strong>GRATIS</strong>.</p>';
  html += '<div class="riel" role="progressbar" aria-label="Avance hacia el envío gratis" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + k.pct + '"><span style="width:' + Math.max(4, k.pct) + '%"></span></div></div>';

  k.ls.forEach((l) => {
    html += '<div class="item-c"><img src="' + esc(fotoDe(l.v)) + '" alt="" width="72" height="72">' +
      '<div class="det"><div><strong>' + esc(prodDe(l.v).nombre) + '</strong><span>' + esc(l.v.nombre) + (l.v.precio_antes > l.v.precio ? ' · antes ' + pesos(l.v.precio_antes) : '') + '</span></div>' +
      '<div class="fila"><div class="cantidad"><button type="button" data-q="' + esc(l.v.id) + '" data-d="-1" aria-label="' + (l.q === 1 ? 'Quitar ' : 'Quitar uno de ') + esc(nombreLargo(l.v)) + '">' + (l.q === 1 ? ICONO.basura : '−') + '</button>' +
      '<output>' + l.q + '</output><button type="button" data-q="' + esc(l.v.id) + '" data-d="1" aria-label="Agregar otro ' + esc(nombreLargo(l.v)) + '">+</button></div>' +
      '<strong>' + pesos(l.v.precio * l.q) + '</strong></div></div></div>';
  });

  if (!k.gratis) {
    const sug = sugerencia(k);
    if (sug) {
      html += '<div class="sugerencia"><img src="' + esc(fotoDe(sug)) + '" alt="" width="56" height="56"><div><strong>' +
        (sug.precio >= k.falta ? 'Agrega ' + esc(prodDe(sug).nombre) + ' y el envío es GRATIS' : 'Súmale ' + esc(prodDe(sug).nombre) + ' y te acercas al envío gratis') +
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
}

// El tamaño más barato que alcanza para el envío gratis; si ninguno alcanza, el más caro.
function sugerencia(k) {
  const fuera = T.variantes.filter((v) => !carrito[v.id]);
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
    const esc_ = t.closest('[data-agregar-escalon]');
    if (esc_) { agregar(esc_.dataset.agregarEscalon, 1); return; }
    const sug = t.closest('[data-agregar-sug]');
    if (sug) { agregar(sug.dataset.agregarSug, 1, { silencioso: true }); return; }
    const q = t.closest('[data-q]');
    if (q) { cambiar(q.dataset.q, (carrito[q.dataset.q] || 0) + Number(q.dataset.d)); return; }
    if (t.closest('[data-aplicar-cupon]')) { aplicarCupon(); return; }
    if (t.closest('[data-quitar-cupon]')) { cupon = null; guardar('rv-cupon', ''); actualizar(); pintarCarrito(); return; }
    const cat = t.closest('[data-cat]');
    if (cat && cat.closest('#filtro-cat')) { categoria = cat.dataset.cat; pintarCatalogo(); actualizar(); }
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
    '<div class="campo"><label for="f-nombre">Tu nombre</label><input id="f-nombre" name="nombre" type="text" autocomplete="name" placeholder="Nombre y apellido" required maxlength="120" aria-describedby="e-nombre"><span class="error" id="e-nombre"></span></div>' +
    '<div class="campos-2">' +
    '<div class="campo"><label for="f-cedula">Cédula</label><input id="f-cedula" name="cedula" type="text" inputmode="numeric" placeholder="1234567890" required maxlength="14" aria-describedby="e-cedula"><span class="error" id="e-cedula"></span></div>' +
    '<div class="campo"><label for="f-celular">Celular (WhatsApp)</label><input id="f-celular" name="celular" type="tel" inputmode="numeric" autocomplete="tel-national" placeholder="300 123 4567" required maxlength="16" aria-describedby="e-celular"><span class="error" id="e-celular"></span></div>' +
    '<div class="campo"><label for="f-departamento">Departamento</label><select id="f-departamento" name="departamento" autocomplete="address-level1" required aria-describedby="e-departamento"><option value="">Elige</option>' +
    DEPARTAMENTOS.map((d) => '<option>' + d + '</option>').join('') + '</select><span class="error" id="e-departamento"></span></div>' +
    '<div class="campo"><label for="f-ciudad">Ciudad o municipio</label><select id="f-ciudad" name="ciudad" autocomplete="address-level2" required disabled aria-describedby="e-ciudad"><option value="">Primero el departamento</option></select><span class="error" id="e-ciudad"></span></div>' +
    '</div>' +
    '<div class="cotiza" data-cotiza hidden></div>' +
    '<div class="campos-2">' +
    '<div class="campo"><label for="f-direccion">Dirección</label><input id="f-direccion" name="direccion" type="text" autocomplete="address-line1" placeholder="Calle 2 #5-20" required maxlength="200" aria-describedby="e-direccion"><span class="error" id="e-direccion"></span></div>' +
    '<div class="campo"><label for="f-barrio">Barrio</label><input id="f-barrio" name="barrio" type="text" placeholder="Barrio La Sultana" required maxlength="120" aria-describedby="e-barrio"><span class="error" id="e-barrio"></span></div>' +
    '</div>' +
    '<div class="campo"><label for="f-indicaciones">Indicaciones <small>(opcional)</small></label><input id="f-indicaciones" name="indicaciones" type="text" placeholder="Apto, torre, casa, punto de referencia" maxlength="300"></div>' +
    '<fieldset><legend style="font-size: 15px; margin-bottom: 8px">¿Para quién es? <small style="font-weight: 500; color: var(--tinta-2); font-size: inherit">(opcional)</small></legend>' +
    '<div class="mascotas"><button type="button" class="mascota" aria-pressed="false">Perro pequeño</button><button type="button" class="mascota" aria-pressed="false">Perro mediano</button><button type="button" class="mascota" aria-pressed="false">Perro grande</button><button type="button" class="mascota" aria-pressed="false">Gato</button></div></fieldset>' +
    '<label class="prioritario"><input type="checkbox" id="f-prioritario" name="prioritario"><span><strong>Envío prioritario: +<span data-valor-prioritario></span></strong><br><span>Despachamos tu pedido primero.</span></span></label>' +
    '<fieldset class="metodos" data-metodos hidden><legend style="font-size: 15px; margin-bottom: 8px">¿Cómo quieres pagar?</legend>' +
    '<label class="metodo"><input type="radio" name="metodo_pago" value="contraentrega" checked><span><strong>Contra entrega</strong><span>Pagas en efectivo cuando te llegue.</span></span></label>' +
    '<label class="metodo"><input type="radio" name="metodo_pago" value="wompi"><span><strong>Pagar ahora</strong><span>Tarjeta, PSE, Nequi o Bancolombia, con Wompi.</span></span></label></fieldset>' +
    '<div class="resumen cuentas" aria-live="polite" data-cuentas-pedido></div>' +
    '<label class="acepto"><input type="checkbox" id="f-acepto" name="acepto" required aria-describedby="e-acepto"><span>Autorizo el tratamiento de mis datos para gestionar mi pedido, según la <a href="/privacidad.html" target="_blank" rel="noopener">política de datos</a> (Ley 1581 de 2012).</span></label>' +
    '<span class="error" id="e-acepto" style="margin-top: -8px"></span>' +
    '<div class="trampa" aria-hidden="true"><label for="f-empresa">Empresa</label><input id="f-empresa" name="empresa" type="text" tabindex="-1" autocomplete="off"></div>' +
    '<p class="form-error" id="form-error" role="alert" hidden></p>' +
    '<button type="submit" class="btn btn-confirmar rv-pulso" id="btn-pagar"><span>Confirmar pedido</span><span>Pago contraentrega · sin tarjeta</span></button>' +
    '<p class="seguro">' + ICONO.candado + '<span data-seguro>No pagas nada ahora. Te confirmamos por WhatsApp.</span></p>' +
    '</form>';
}

let enviando = false;
const mascotas = new Set();

// Pago con Wompi (migración 018): la opción solo aparece si está activa en el gestor.
const metodoDe = (form) => (T.ajustes.wompi_activo && form.metodo_pago && form.metodo_pago.value === 'wompi' ? 'wompi' : 'contraentrega');
function pintarBoton(form, total) {
  const wompi = metodoDe(form) === 'wompi';
  $('#btn-pagar').innerHTML = wompi
    ? '<span>Pagar ' + pesos(total) + '</span><span>Tarjeta, PSE, Nequi o Bancolombia</span>'
    : '<span>Confirmar pedido</span><span>Pago contraentrega · sin tarjeta</span>';
  $('[data-seguro]', form).textContent = wompi
    ? 'Pago seguro con Wompi, de Bancolombia. No guardamos los datos de tu tarjeta.'
    : 'No pagas nada ahora. Te confirmamos por WhatsApp.';
}

function pintarResumenPedido() {
  const d = $('#pedido-modal');
  const form = $('#form-pedido', d);
  if (!form) return;
  const dep = form.departamento.value;
  const k = cuentas(dep, form.ciudad.value);
  const prio = form.prioritario.checked ? T.ajustes.prioritario : 0;
  const primera = k.ls[0];
  $('[data-mini-resumen]', d).innerHTML = primera
    ? '<img src="' + esc(fotoDe(primera.v)) + '" alt="" width="44" height="44"><div><strong>' + k.unidades + (k.unidades === 1 ? ' producto' : ' productos') + '</strong><span>' +
      esc(k.ls.map((l) => l.q + ' × ' + nombreLargo(l.v)).join(', ')) + '</span></div><strong>' + pesos(k.neto) + '</strong>'
    : '<div><strong>Tu carrito está vacío</strong></div>';
  $('[data-valor-prioritario]', d).textContent = pesos(T.ajustes.prioritario);
  $('[data-metodos]', d).hidden = !T.ajustes.wompi_activo;
  const wompi = metodoDe(form) === 'wompi';

  const cotiza = $('[data-cotiza]', d);
  if (dep && form.ciudad.value) {
    cotiza.hidden = false;
    cotiza.innerHTML = k.gratis
      ? '<div class="fila"><span>Envío a ' + esc(form.ciudad.value) + '</span><span>GRATIS</span></div><span>' + (k.porCombo ? 'Tu combo incluye el envío.' : 'Tu pedido supera ' + pesos(T.ajustes.envio_gratis_desde) + '.') + '</span>'
      : '<div class="fila"><span>Envío a ' + esc(form.ciudad.value) + '</span><span>' + pesos(k.envio) + '</span></div>' +
        '<span class="falta">Agrega ' + pesos(k.falta) + ' más en productos y no pagas envío.</span>';
  } else cotiza.hidden = true;

  const envioTxt = k.gratis ? '<span class="verde">GRATIS</span>' : (dep ? pesos(k.envio) : '<span style="color: var(--tinta-2)">Elige tu departamento</span>');
  const total = k.neto + (k.gratis ? 0 : (k.envio || 0)) + prio;
  $('[data-cuentas-pedido]', d).innerHTML =
    '<div><span>Productos</span><span>' + pesos(k.subtotal) + '</span></div>' +
    (k.descuento ? '<div class="verde"><span>Cupón ' + esc(cupon.codigo) + '</span><span>−' + pesos(k.descuento) + '</span></div>' : '') +
    '<div><span>Envío</span>' + envioTxt + '</div>' +
    (prio ? '<div><span>Envío prioritario</span><span>' + pesos(prio) + '</span></div>' : '') +
    '<hr class="perforado"><div class="resumen-total"><strong>' + (wompi ? 'Pagas ahora' : 'Pagas al recibir') + '</strong><span>' + pesos(total) + (dep || k.gratis ? '' : ' + envío') + '</span></div>' +
    (k.ahorro ? '<div class="ahorro-caja" style="margin-top: 10px"><span>' + ICONO.etiqueta + 'Estás ahorrando</span><strong>' + pesos(k.ahorro) + '</strong></div>' : '');
  if (!enviando) pintarBoton(form, total);
  return total;
}

let checkoutIniciado = false;
function abrirPedido() {
  const d = $('#pedido-modal');
  if (d.dataset.gracias) reiniciarFormulario();
  if (!cuentas().unidades) { abrirCarrito(); return; }
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
function normalizarCedula(v) {
  const d = String(v).replace(/\D/g, '');
  return /^\d{6,10}$/.test(d) ? d : '';
}
const reglas = {
  nombre: (v) => v.trim().length >= 3 && /\s/.test(v.trim()) ? '' : 'Escribe tu nombre y apellido.',
  cedula: (v) => normalizarCedula(v) ? '' : 'Escribe tu número de cédula (solo números).',
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
  if (!k.unidades) { cerrarDialogo($('#pedido-modal')); abrirCarrito(); return; }

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
    cedula: normalizarCedula(form.cedula.value),
    celular: normalizarCelular(form.celular.value),
    direccion: form.direccion.value.trim(),
    barrio: form.barrio.value.trim(),
    ciudad: form.ciudad.value.trim(),
    departamento: form.departamento.value,
    indicaciones: form.indicaciones.value.trim(),
    prioritario: form.prioritario.checked,
    metodo_pago: metodoDe(form),
    para_quien: Array.from(mascotas),
    utm_source: leer('rv-utm_source') || '',
    utm_medium: leer('rv-utm_medium') || '',
    utm_campaign: leer('rv-utm_campaign') || '',
    utm_content: leer('rv-utm_content') || '',
    utm_term: leer('rv-utm_term') || '',
    fbclid: leer('rv-fbclid') || '',
    fbp: cookie('_fbp'),
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
    fbq('init', CONFIG.PIXEL_ID, { ph: datos.celular, fn: fn, ln: resto.join(' '), ct: datos.ciudad.toLowerCase(), st: datos.departamento.toLowerCase(), country: 'co', external_id: r.order_id });
    track('Purchase', { value: r.total, currency: 'COP', content_ids: datos.items.map((i) => i.variante_id), contents: datos.items.map((i) => ({ id: i.variante_id, quantity: i.cantidad })), content_type: 'product', num_items: unidades }, { eventID: eventId });
  }
  // rv-wompi se deja: si Wompi recarga la página con ?id= después de aprobar, se vuelve a mostrar este mismo resultado.
  try { sessionStorage.removeItem('rv-event-id'); } catch (err) {}
  mostrarGracias(datos, r, pago);
  carrito = {};
  cupon = null;
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
    customerData: { fullName: datos.nombre, phoneNumber: datos.celular.slice(2), phoneNumberPrefix: '+57', legalId: datos.cedula, legalIdType: 'CC' }
  });
  checkout.open((resultado) => resultadoWompi(resultado && resultado.transaction));
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
  ['nombre', 'cedula', 'direccion', 'barrio', 'indicaciones'].forEach((n) => { form[n].value = datos[n] || ''; });
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
    items.map((i) => '<div><span>' + i.cantidad + ' × ' + esc(i.nombre) + '</span><span>' + pesos(i.precio * i.cantidad) + '</span></div>').join('') +
    (r.descuento ? '<div class="verde"><span>Cupón</span><span>−' + pesos(r.descuento) + '</span></div>' : '') +
    '<div><span>Envío</span><span' + (r.envio ? '' : ' class="verde"') + '>' + (r.envio ? pesos(r.envio) : 'GRATIS') + '</span></div>' +
    (r.prioritario ? '<div><span>Envío prioritario</span><span>' + pesos(r.prioritario) + '</span></div>' : '') +
    '<hr class="perforado"><div class="resumen-total"><strong>' + (pago === 'aprobado' ? 'Pagado con Wompi' : pago === 'pendiente' ? 'Pago en verificación' : 'Pagas al recibir') + '</strong><span>' + pesos(r.total) + '</span></div>' +
    '<p style="margin-top: 12px; font-size: 14px; color: var(--tinta-2)">' + esc([datos.direccion, datos.barrio, datos.ciudad + ' - ' + datos.departamento].join(', ')) + '</p></div>' +
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
function track(evento, datos, opciones) {
  if (window.fbq) window.fbq('track', evento, datos || {}, opciones || {});
}
if (CONFIG.PIXEL_ID) {
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', CONFIG.PIXEL_ID);
  fbq('track', 'PageView');
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
(async function () {
  const seccion = $('#opiniones');
  const pista = $('#pista-resenas');
  if (!seccion || !pista) return;
  try {
    const lista = await rest('resenas?select=nombre,ciudad,mascota,producto,estrellas,texto,foto_path&estado=eq.Publicada&order=creado_en.desc&limit=12');
    if (!Array.isArray(lista) || !lista.length) return;
    if (P.resenas) lista.sort((a, b) => (b.producto === P.resenas) - (a.producto === P.resenas));
    const estrella = '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.3L12 17.1l-5.7 3.1 1.2-6.3L2.8 9.5l6.4-.8z" fill="#C2185B"/></svg>';
    lista.forEach((r) => {
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
      cuerpo.innerHTML = '<span class="resena-estrellas" role="img" aria-label="' + n + ' de 5 estrellas">' + estrella.repeat(n) + '</span>' +
        '<blockquote>' + esc(r.texto) + '</blockquote><div class="resena-pie"><span><strong>' + esc(r.nombre) + '</strong> · ' + esc(r.ciudad) +
        (r.mascota ? ' · con ' + esc(r.mascota) : '') + '</span><span class="resena-tag">' + esc(r.producto === 'Cajita para perros' ? 'Cajita' : r.producto) + '</span></div>';
      art.appendChild(cuerpo);
      pista.appendChild(art);
    });
    seccion.hidden = false;
    iniciarCarrusel($('.carrusel-nav[data-para="pista-resenas"]'));
  } catch (e) { /* sin reseñas: la sección sigue escondida */ }
})();

$$('[data-anio]').forEach((el) => { el.textContent = new Date().getFullYear(); });

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
  actualizar();
}

crearDialogos();
iniciarCarrito();
iniciarCompra();
iniciarBarraFija();
cargarCatalogo(pintarTodo).then(() => {
  if (P.tipo === 'producto' && P.productoId) {
    const vs = variantesDelProducto();
    if (vs.length) track('ViewContent', { content_ids: vs.map((v) => v.id), content_type: 'product', content_name: P.productoId, value: vs[0].precio, currency: 'COP' });
  }
  iniciarPruebaSocial();
});
pintarTodo();
if (location.hash === '#carrito') abrirCarrito();
else if (location.hash === '#pedido') abrirPedido();
volverDeWompi();
