// Revoltosos · portadas de los combos armadas con los recortes reales de cada snack.
//
// Toma los PNG sin fondo de assets/img/piezas (sacados de las fotos reales con Higgsfield)
// y arma una portada cuadrada por combo: cada snack que trae, con su cantidad.
// Así la foto del combo muestra lo que de verdad llega, mientras no haya foto de estudio.
//
// Uso (necesita sharp: npm i sharp):  node herramientas/portadas/componer.js
// Sale: assets/img/productos/<combo>-portada.jpg (1000 px) y <combo>-portada-600.jpg

const sharp = require('sharp');
const path = require('path');

const RAIZ = path.join(__dirname, '..', '..');
// Los PNG grandes sin fondo (diseno/piezas-png); en assets/img/piezas están en WebP liviano para la web.
const PIEZAS = path.join(RAIZ, 'diseno', 'piezas-png');
const SALIDA = path.join(RAIZ, 'assets', 'img', 'productos');
const L = 1000;

// pieza: archivo en assets/img/piezas. recorte: parte de la foto (la de orejas trae dos).
const P = {
  paleta: { f: 'paleta-cerdo' },
  femurCerdo: { f: 'femur-cerdo' },
  oreja: { f: 'oreja-cerdo', recorte: [0, 0, 0.53, 1] },
  patas: { f: 'patas-pollo' },
  femurRes: { f: 'femur-res' },
  humeroRes: { f: 'humero-res' },
  frasco: { f: 'codornices-frasco' },
  bolsa: { f: 'codornices-bolsa' },
};

// Cada combo: [pieza, copias dibujadas, etiqueta]. Las piezas van en el orden del combo.
const COMBOS = {
  'combo-cerdito-crujiente': [['paleta', 1, '×1'], ['femurCerdo', 1, '×1'], ['oreja', 1, '×1'], ['patas', 1, '×5']],
  'combo-masticador-grande': [['humeroRes', 1, '×1'], ['femurRes', 1, '×1'], ['patas', 1, '×30']],
  'combo-despensa-crujiente': [['patas', 1, '×30'], ['paleta', 2, '×2'], ['oreja', 2, '×2']],
  'combo-favoritos-revoltosos': [['frasco', 1, '100 g'], ['patas', 1, '×30'], ['paleta', 1, '×1']],
  'combo-cerdo-patitas': [['paleta', 1, '×1'], ['femurCerdo', 1, '×1'], ['patas', 1, '×30']],
  'combo-doble-paleta': [['paleta', 2, '×2'], ['patas', 1, '×30']],
  'combo-res-crujiente': [['humeroRes', 1, '×1'], ['femurRes', 1, '×1'], ['paleta', 1, '×1']],
  'combo-patitas-compartir': [['patas', 2, '×60'], ['bolsa', 1, '50 g']],
  'combo-despensa-familiar': [['frasco', 1, '100 g'], ['patas', 2, '×60'], ['paleta', 2, '×2']],
  'combo-duo-masticador': [['humeroRes', 2, '×2'], ['paleta', 2, '×2'], ['patas', 1, '×30']],
};

// Celdas [x, y, ancho, alto] en una portada de 1000 px, según cuántos snacks trae.
const CELDAS = {
  2: [[40, 120, 520, 640], [520, 220, 440, 560]],
  3: [[30, 50, 460, 420], [550, 150, 420, 360], [230, 500, 540, 440]],
  4: [[60, 60, 440, 440], [520, 80, 420, 400], [80, 520, 420, 400], [520, 510, 420, 430]],
};
const GIROS = [-8, 6, -4, 9];

// El recorte deja transparencias casi invisibles (alfa 1-20) que se notan como un recuadro: se borran.
async function limpiar(archivo) {
  const { data, info } = await sharp(archivo).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 3; i < data.length; i += 4) if (data[i] < 24) data[i] = 0;
  return sharp(data, { raw: info }).png().toBuffer();
}

async function pieza(k) {
  const p = P[k];
  let img = sharp(await sharp(await limpiar(path.join(PIEZAS, p.f + '.png'))).trim().png().toBuffer());
  if (p.recorte) {
    const m = await img.metadata();
    const [x, y, w, h] = p.recorte;
    img = sharp(await img.extract({ left: Math.round(x * m.width), top: Math.round(y * m.height), width: Math.round(w * m.width), height: Math.round(h * m.height) }).png().toBuffer()).trim();
  }
  return img.png().toBuffer();
}

// Escala y gira una pieza para que quepa en (w, h).
async function encajar(buf, w, h, giro) {
  const girada = await sharp(buf).rotate(giro, { background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  return sharp(girada).resize({ width: Math.round(w), height: Math.round(h), fit: 'inside' }).png().toBuffer();
}

// Sombra suave debajo de la pieza (la misma silueta, oscura y difuminada).
async function sombra(buf) {
  const m = await sharp(buf).metadata();
  const alfa = await sharp(buf).extractChannel('alpha').threshold(40).blur(16).linear(0.35, 0).png().toBuffer();
  return sharp({ create: { width: m.width, height: m.height, channels: 3, background: '#5A4632' } })
    .joinChannel(alfa).png().toBuffer();
}

function etiqueta(texto) {
  const ancho = 34 + texto.length * 27;
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${ancho}" height="64">` +
    `<rect width="${ancho}" height="64" rx="32" fill="#C2185B"/>` +
    `<text x="${ancho / 2}" y="44" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="700" fill="#FFFFFF" text-anchor="middle">${texto}</text></svg>`);
}

async function portada(id, items) {
  const celdas = CELDAS[items.length];
  const capas = [];
  const etiquetas = [];
  for (let i = 0; i < items.length; i++) {
    const [k, copias, txt] = items[i];
    const [cx, cy, cw, ch] = celdas[i];
    const base = await pieza(k);
    for (let c = copias - 1; c >= 0; c--) {
      // La segunda copia va detrás, corrida y con otro giro.
      const esc = copias > 1 ? 0.86 : 1;
      const img = await encajar(base, cw * esc, ch * esc, GIROS[(i + c * 2) % 4] + (c ? 14 : 0));
      const m = await sharp(img).metadata();
      const dx = c ? cw * 0.14 : 0;
      const dy = c ? -ch * 0.1 : 0;
      const left = Math.round(cx + (cw - m.width) / 2 + dx - (copias > 1 ? cw * 0.05 : 0));
      const top = Math.round(cy + (ch - m.height) / 2 + dy + (copias > 1 ? ch * 0.06 : 0));
      capas.push({ input: await sombra(img), left: left + 10, top: top + 18 });
      capas.push({ input: img, left, top });
      // La cantidad va abajo a la derecha de su snack, dentro de la portada.
      const ancho = 34 + txt.length * 27;
      if (c === 0) etiquetas.push({ input: etiqueta(txt), left: Math.max(20, Math.min(L - 20 - ancho, left + m.width - ancho + 16)), top: Math.max(20, Math.min(L - 84, top + m.height - 40)) });
    }
  }
  const fondo = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${L}" height="${L}"><defs><radialGradient id="g" cx="50%" cy="45%" r="70%">` +
    `<stop offset="0" stop-color="#FBF8F2"/><stop offset="1" stop-color="#EDE6D8"/></radialGradient></defs><rect width="${L}" height="${L}" fill="url(#g)"/></svg>`);
  const lienzo = sharp(fondo).composite(capas.concat(etiquetas)).flatten({ background: '#F5F1E8' });
  const buf = await lienzo.jpeg({ quality: 86, mozjpeg: true }).toBuffer();
  await sharp(buf).toFile(path.join(SALIDA, id + '-portada.jpg'));
  await sharp(buf).resize(600).jpeg({ quality: 82, mozjpeg: true }).toFile(path.join(SALIDA, id + '-portada-600.jpg'));
  console.log('listo', id);
}

(async () => {
  for (const [id, items] of Object.entries(COMBOS)) await portada(id, items);
})().catch((e) => { console.error(e); process.exit(1); });
