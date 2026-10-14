/* Revoltosos · lógica compartida de las landings
 *
 * Cada landing define antes de cargar este archivo:
 *   window.PAGINA = {
 *     oferta: 'codornices-promo',          // slug en la tabla `ofertas` de Supabase
 *     productoId: 'codorniz-50g',           // content_id para Meta
 *     producto: 'Codornices deshidratadas 50 g',
 *     unidad: ['frasco', 'frascos'],
 *     precios: { 1: 20900, 2: 29900 },      // deben coincidir con la tabla `ofertas`
 *     cantidadInicial: 2,
 *     cinta: ['Envío GRATIS…', …],
 *     reviews: [], videos: []
 *   };
 */

const CONFIG = {
  SUPABASE_URL: 'https://jlvnrxmardcnarzspccs.supabase.co',
  SUPABASE_KEY: 'sb_publishable_Jca2aMrjHOFVBrDnZpMj-Q_lDK6BWLF', // clave pública: se puede ver
  PIXEL_ID: '1089879483557850',
  WHATSAPP: '573122448276',
  PRIORITARIO: 5000,
  ENVIO_ANTES: 12000
};

const P = window.PAGINA;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
const pesos = (n) => '$' + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const guardar = (k, v) => { try { sessionStorage.setItem(k, v); } catch (e) {} };
const leer = (k) => { try { return sessionStorage.getItem(k); } catch (e) { return null; } };
const unidades = (n) => n + ' ' + (n === 1 ? P.unidad[0] : P.unidad[1]);

/* Pantalla de carga: se quita apenas la página está lista */
(function () {
  const quitar = () => { const c = $('#cargando'); if (c) c.classList.add('listo'); guardar('rv-visto', '1'); };
  if (document.readyState === 'complete') quitar();
  else { window.addEventListener('load', quitar, { once: true }); setTimeout(quitar, 3500); }
})();

/* Precios en toda la página */
$$('[data-precio]').forEach((el) => { const v = P.precios[el.dataset.precio]; if (v) el.textContent = pesos(v); });
if (P.precios[2]) $$('[data-ahorro]').forEach((el) => { el.textContent = pesos(P.precios[1] * 2 - P.precios[2]); });
$$('[data-prioritario]').forEach((el) => { el.textContent = pesos(CONFIG.PRIORITARIO); });
$$('[data-anio]').forEach((el) => { el.textContent = new Date().getFullYear(); });

/* Cinta deslizante */
(function () {
  const pista = $('#cinta');
  if (!pista) return;
  const html = P.cinta.map((f) => '<span>' + f + '<svg width="10" height="10" style="color:#fff"><use href="#i-estrella"/></svg></span>').join('');
  pista.innerHTML = html.repeat(4);
})();

/* UTM, fbclid y cookies de Meta */
const params = new URLSearchParams(location.search);
['utm_source', 'utm_campaign', 'fbclid'].forEach((k) => { if (params.get(k)) guardar('rv-' + k, params.get(k)); });
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

/* Meta Pixel */
function track(evento, datos, opciones) {
  if (window.fbq) window.fbq('track', evento, datos || {}, opciones || {});
}
if (CONFIG.PIXEL_ID) {
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', CONFIG.PIXEL_ID);
  fbq('track', 'PageView');
  track('ViewContent', { content_ids: [P.productoId], content_type: 'product', content_name: P.oferta, value: P.precios[P.cantidadInicial], currency: 'COP' });
}

/* Aviso de cookies */
(function () {
  const aviso = $('#cookies');
  if (!aviso) return;
  let visto = '1';
  try { visto = localStorage.getItem('rv-cookies'); } catch (e) {}
  if (!visto) aviso.hidden = false;
  $('#cookies-ok').addEventListener('click', () => { aviso.hidden = true; try { localStorage.setItem('rv-cookies', '1'); } catch (e) {} });
})();

/* Formulario: estado */
const estado = { cantidad: P.cantidadInicial, prioritario: false, mascotas: new Set() };
let agregadoAlCarrito = false;

function pintarResumen() {
  const subtotal = P.precios[estado.cantidad];
  const total = subtotal + (estado.prioritario ? CONFIG.PRIORITARIO : 0);
  $('#r-cantidad').textContent = unidades(estado.cantidad);
  $('#r-subtotal').textContent = pesos(subtotal);
  $('#r-prio-fila').hidden = !estado.prioritario;
  $('#r-total').textContent = pesos(total);
  return total;
}

function addToCart() {
  track('AddToCart', { content_ids: [P.productoId], content_type: 'product', content_name: P.oferta, num_items: estado.cantidad, value: P.precios[estado.cantidad], currency: 'COP' });
  agregadoAlCarrito = true;
}

$$('button.paquete[data-qty]').forEach((btn) => btn.addEventListener('click', () => {
  estado.cantidad = Number(btn.dataset.qty);
  $$('button.paquete[data-qty]').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
  pintarResumen();
  addToCart();
}));
$$('.mascota').forEach((btn) => btn.addEventListener('click', () => {
  const on = btn.getAttribute('aria-pressed') !== 'true';
  btn.setAttribute('aria-pressed', String(on));
  on ? estado.mascotas.add(btn.textContent) : estado.mascotas.delete(btn.textContent);
}));
$('#f-prioritario').addEventListener('change', (e) => { estado.prioritario = e.target.checked; pintarResumen(); });
$$('[data-cta]').forEach((a) => a.addEventListener('click', () => { if (!agregadoAlCarrito) addToCart(); }));

let checkoutIniciado = false;
$('#form-pedido').addEventListener('focusin', () => {
  if (checkoutIniciado) return;
  checkoutIniciado = true;
  track('InitiateCheckout', { content_ids: [P.productoId], content_type: 'product', content_name: P.oferta, num_items: estado.cantidad, value: pintarResumen(), currency: 'COP' });
});

/* Validación */
function normalizarCelular(v) {
  let d = String(v).replace(/\D/g, '');
  if (d.length === 12 && d.startsWith('57')) d = d.slice(2);
  return /^3\d{9}$/.test(d) ? '57' + d : '';
}
// Cédula colombiana: 6 a 10 dígitos; se quitan puntos y espacios.
function normalizarCedula(v) {
  const d = String(v).replace(/\D/g, '');
  return /^\d{6,10}$/.test(d) ? d : '';
}
const reglas = {
  nombre: (v) => v.trim().length >= 3 && /\s/.test(v.trim()) ? '' : 'Escribe tu nombre y apellido.',
  cedula: (v) => normalizarCedula(v) ? '' : 'Escribe tu número de cédula (solo números).',
  celular: (v) => normalizarCelular(v) ? '' : 'Escribe un celular de 10 dígitos que empiece por 3.',
  direccion: (v) => v.trim().length >= 4 ? '' : 'Escribe la dirección de entrega.',
  barrio: (v) => v.trim().length >= 2 ? '' : 'Escribe el barrio.',
  departamento: (v) => v ? '' : 'Elige el departamento.',
  ciudad: (v) => v.trim().length >= 2 ? '' : 'Elige la ciudad o municipio.'
};

/* Ciudad: lista de municipios según el departamento (DANE · DIVIPOLA) */
(function () {
  const dep = $('#f-departamento');
  const ciu = $('#f-ciudad');
  if (!dep || !ciu || ciu.tagName !== 'SELECT') return;
  let datos = null;
  let cargando = null;
  const cargar = () => cargando || (cargando = fetch('/assets/data/municipios.json?v=1')
    .then((r) => (r.ok ? r.json() : null))
    .then((d) => { datos = d; return d; })
    .catch(() => null));
  dep.addEventListener('focus', cargar, { once: true });
  dep.addEventListener('pointerdown', cargar, { once: true });
  dep.addEventListener('change', async () => {
    await cargar();
    const campo = $('[name="ciudad"]');
    if (!datos) {
      // Si la lista no carga (sin internet momentáneo), se deja escribir la ciudad.
      if (campo.tagName === 'SELECT') {
        const inp = document.createElement('input');
        Object.assign(inp, { type: 'text', id: 'f-ciudad', name: 'ciudad', maxLength: 80, placeholder: 'Escribe tu ciudad o municipio', autocomplete: 'address-level2' });
        inp.setAttribute('aria-describedby', 'e-ciudad');
        campo.replaceWith(inp);
      }
      return;
    }
    const lista = datos[dep.value] || [];
    campo.innerHTML = '';
    campo.add(new Option(lista.length ? 'Elige tu ciudad o municipio' : 'Primero elige el departamento', ''));
    lista.forEach((m) => campo.add(new Option(m, m)));
    campo.disabled = !lista.length;
    campo.value = lista.length === 1 ? lista[0] : '';
    campo.setAttribute('aria-invalid', 'false');
    $('#e-ciudad').textContent = '';
  });
})();
function validarCampo(nombre) {
  const input = $('[name="' + nombre + '"]');
  const msg = reglas[nombre](input.value);
  input.setAttribute('aria-invalid', msg ? 'true' : 'false');
  $('#e-' + nombre).textContent = msg;
  return !msg;
}
Object.keys(reglas).forEach((n) => {
  const input = $('[name="' + n + '"]');
  input.addEventListener('blur', () => { if (input.value) validarCampo(n); });
  input.addEventListener('input', () => { if (input.getAttribute('aria-invalid') === 'true') validarCampo(n); });
});

/* Envío del pedido */
function uuid() {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => { const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16); });
}

function mostrarGracias(p) {
  $('#landing').hidden = true;
  $('#gracias').hidden = false;
  $('#g-orden').textContent = p.order_id;
  $('#g-cantidad').textContent = p.cantidad + ' × ' + P.producto;
  $('#g-subtotal').textContent = pesos(P.precios[p.cantidad] || p.total);
  $('#g-prio-fila').hidden = !p.prioritario;
  $('#g-total').textContent = pesos(p.total);
  $('#g-direccion').textContent = [p.direccion, p.barrio, p.ciudad + ' - ' + p.departamento].filter(Boolean).join(', ');
  const msg = 'Hola Revoltosos, acabo de hacer el pedido #' + p.order_id + ' (' + p.cantidad + ' × ' + P.producto + ', total ' + pesos(p.total) + ').';
  $('#g-whatsapp').href = 'https://wa.me/' + CONFIG.WHATSAPP + '?text=' + encodeURIComponent(msg);
  window.scrollTo(0, 0);
  $('#t-gracias').focus();
}

$('#form-pedido').addEventListener('submit', async (e) => {
  e.preventDefault();
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

  const btn = $('#btn-pagar');
  btn.disabled = true;
  btn.textContent = 'Enviando tu pedido…';

  // Si el envío anterior falló, se reutiliza el mismo event_id: así no se duplica el pedido.
  const eventId = leer('rv-event-id') || uuid();
  guardar('rv-event-id', eventId);

  const datos = {
    oferta: P.oferta,
    event_id: eventId,
    nombre: form.nombre.value.trim(),
    cedula: normalizarCedula(form.cedula.value),
    celular: normalizarCelular(form.celular.value),
    direccion: form.direccion.value.trim(),
    barrio: form.barrio.value.trim(),
    ciudad: form.ciudad.value.trim(),
    departamento: form.departamento.value,
    indicaciones: form.indicaciones.value.trim(),
    cantidad: estado.cantidad,
    prioritario: estado.prioritario,
    para_quien: Array.from(estado.mascotas),
    utm_source: leer('rv-utm_source') || '',
    utm_campaign: leer('rv-utm_campaign') || '',
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
    if (!res.ok || !r.ok) throw Object.assign(new Error(r.error || 'No pudimos registrar el pedido.'), { status: res.status });

    const pedido = { ...datos, order_id: r.order_id, total: r.total };
    if (window.fbq) {
      const [fn, ...resto] = datos.nombre.toLowerCase().split(/\s+/);
      fbq('init', CONFIG.PIXEL_ID, { ph: datos.celular, fn: fn, ln: resto.join(' '), ct: datos.ciudad.toLowerCase(), st: datos.departamento.toLowerCase(), country: 'co', external_id: r.order_id });
      track('Purchase', { value: r.total, currency: 'COP', content_ids: [P.productoId], content_type: 'product', content_name: P.oferta, num_items: datos.cantidad }, { eventID: eventId });
    }
    try { sessionStorage.removeItem('rv-event-id'); } catch (err) {}
    mostrarGracias(pedido);
  } catch (err) {
    const texto = 'Hola, quiero pedir ' + unidades(estado.cantidad) + ' de ' + P.producto + '. Mis datos: ' + datos.nombre + ', ' + datos.direccion + ', ' + datos.barrio + ', ' + datos.ciudad + ' - ' + datos.departamento + '.';
    const wa = '<a href="https://wa.me/' + CONFIG.WHATSAPP + '?text=' + encodeURIComponent(texto) + '" target="_blank" rel="noopener">';
    // 429: ya hubo un pedido desde esta conexión en las últimas 72 horas (ver crear-pedido).
    errorGeneral.innerHTML = err.status === 429
      ? 'Ya recibimos un pedido desde esta conexión hace poco. Si quieres pedir otro, ' + wa + 'escríbenos por WhatsApp</a> y te ayudamos.'
      : 'No pudimos enviar tu pedido. Revisa tu conexión e inténtalo de nuevo, o ' + wa + 'pídelo por WhatsApp</a>.';
    errorGeneral.hidden = false;
    btn.disabled = false;
    btn.textContent = 'PAGAR AL RECIBIR';
  }
});

/* Barra fija: aparece después del hero y se oculta en el formulario */
(function () {
  const barra = $('#barra-fija');
  if (!barra) return;
  if (!('IntersectionObserver' in window)) { barra.classList.add('visible'); return; }
  let heroVisible = true, formVisible = false;
  const actualizar = () => barra.classList.toggle('visible', !heroVisible && !formVisible);
  new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; actualizar(); }).observe($('.hero'));
  new IntersectionObserver(([e]) => { formVisible = e.isIntersecting; actualizar(); }, { threshold: 0.05 }).observe($('#pedido'));
})();

/* Videos de clientes (la sección aparece solo si hay videos) */
(function () {
  const videos = P.videos || [];
  if (videos.length && $('#videos')) {
    const lista = $('#videos-lista');
    videos.forEach((v) => {
      const video = document.createElement('video');
      video.setAttribute('aria-label', v.alt || 'Perro comiendo su snack Revoltosos');
      if (v.poster) video.poster = v.poster;
      video.dataset.src = v.src;
      lista.appendChild(video);
    });
    $('#videos').hidden = false;
  }
})();

/* Videos: se cargan y reproducen solo cuando están a la vista (sin sonido, en bucle) */
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

/* Carruseles: flechas y puntos para cada .carrusel-nav[data-para] */
function iniciarCarrusel(nav) {
  {
    const pista = document.getElementById(nav.dataset.para);
    if (!pista || !pista.children.length) return;
    const puntos = $('.carrusel-puntos', nav);
    const [prev, next] = $$('.carrusel-btn', nav);
    const items = () => Array.from(pista.children);
    puntos.innerHTML = items().map(() => '<span></span>').join('');
    const paso = () => { const it = items()[0]; return it ? it.getBoundingClientRect().width + 12 : pista.clientWidth; };
    const actualizar = () => {
      nav.hidden = pista.scrollWidth <= pista.clientWidth + 4;
      const fin = pista.scrollLeft + pista.clientWidth >= pista.scrollWidth - 4;
      const i = fin ? items().length - 1 : Math.round(pista.scrollLeft / paso());
      $$('span', puntos).forEach((p, k) => p.classList.toggle('activo', k === i));
      prev.disabled = pista.scrollLeft <= 4;
      next.disabled = fin;
    };
    prev.addEventListener('click', () => pista.scrollBy({ left: -paso() }));
    next.addEventListener('click', () => pista.scrollBy({ left: paso() }));
    pista.addEventListener('scroll', () => requestAnimationFrame(actualizar), { passive: true });
    window.addEventListener('resize', actualizar);
    actualizar();
  }
}
$$('.carrusel-nav[data-para]:not([data-tarde])').forEach(iniciarCarrusel);

/* Reseñas reales: solo las que María José marcó como Publicadas en el panel */
(async function () {
  const seccion = $('#opiniones');
  const pista = $('#pista-resenas');
  if (!seccion || !pista) return;
  try {
    const url = CONFIG.SUPABASE_URL + '/rest/v1/resenas?select=nombre,ciudad,mascota,producto,estrellas,texto,foto_path&estado=eq.Publicada&order=creado_en.desc&limit=12';
    const res = await fetch(url, { headers: { apikey: CONFIG.SUPABASE_KEY } });
    if (!res.ok) return;
    const lista = await res.json();
    if (!Array.isArray(lista) || !lista.length) return;
    const mio = P.productoId === 'cajita-perros' ? 'Cajita para perros' : 'Codornices';
    lista.sort((a, b) => (b.producto === mio) - (a.producto === mio));
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
      const cuerpo = document.createElement('div');
      cuerpo.className = 'resena-cuerpo';
      const n = Math.max(1, Math.min(5, Number(r.estrellas) || 5));
      const est = document.createElement('span');
      est.className = 'resena-estrellas';
      est.setAttribute('role', 'img');
      est.setAttribute('aria-label', n + ' de 5 estrellas');
      est.innerHTML = estrella.repeat(n);
      const cita = document.createElement('blockquote');
      cita.textContent = r.texto;
      const pie = document.createElement('div');
      pie.className = 'resena-pie';
      const quien = document.createElement('span');
      const nombre = document.createElement('strong');
      nombre.textContent = r.nombre;
      quien.append(nombre, ' · ' + r.ciudad + (r.mascota ? ' · con ' + r.mascota : ''));
      const tag = document.createElement('span');
      tag.className = 'resena-tag';
      tag.textContent = r.producto === 'Cajita para perros' ? 'Cajita' : r.producto;
      pie.append(quien, tag);
      cuerpo.append(est, cita, pie);
      art.appendChild(cuerpo);
      pista.appendChild(art);
    });
    seccion.hidden = false;
    iniciarCarrusel($('.carrusel-nav[data-para="pista-resenas"]'));
  } catch (e) { /* sin reseñas: la sección sigue escondida */ }
})();

pintarResumen();
