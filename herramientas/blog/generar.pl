#!/usr/bin/perl
# Revoltosos · generador del blog y del sitemap
#
# Crea /blog/index.html (lista de artículos), /blog/<slug>/index.html (cada artículo) y /sitemap.xml
# (todas las páginas públicas + artículos, para Google).
#
# Para escribir un artículo nuevo: agrega un bloque en @articulos (el más nuevo arriba) y corre,
# desde la carpeta del proyecto:   perl herramientas/blog/generar.pl
# El cuerpo va en HTML sencillo: <h2>, <p>, <ul><li>, <a href="/femur-de-res/">…</a>.
# Enlaza siempre a las landings de los productos: eso ayuda a que Google las posicione.

use strict;
use warnings;
use utf8;
use FindBin;
binmode STDOUT, ':utf8';

my $raiz = "$FindBin::Bin/../..";
my $SITIO = 'https://revoltosos.netlify.app';
my $IMG = '/assets/img/productos';
my @MESES = qw(enero febrero marzo abril mayo junio julio agosto septiembre octubre noviembre diciembre);

my @articulos = (
  {
    slug => 'huesos-para-perros-como-darlos-seguros',
    titulo => 'Huesos para perros: cuáles dar y cómo darlos de forma segura',
    descripcion => 'Qué huesos sí le puedes dar a tu perro, por qué los deshidratados son distintos a los cocinados y 6 reglas para que morder sea seguro.',
    fecha => '2026-11-13',
    foto => 'femur-res-producto', alt => 'Fémur de res deshidratado para perros',
    lectura => 5,
    productos => ['femur-de-res', 'humero-de-res', 'paleta-de-res', 'femur-de-cerdo'],
    cuerpo => <<'HTML',
<p>Morder es una necesidad para los perros: los calma, los entretiene y les ayuda a gastar energía. Por eso los huesos son uno de los premios favoritos. Pero no cualquier hueso sirve, y la forma de darlo importa tanto como el hueso.</p>

<h2>Hueso cocinado vs. hueso deshidratado</h2>
<p>El hueso que sobra del almuerzo (cocinado, asado o frito) <strong>no se le debe dar a un perro</strong>: la cocción lo vuelve quebradizo y puede astillarse en puntas filosas. Además suele venir con sal, condimentos o grasa que le caen mal.</p>
<p>Un hueso deshidratado lentamente, a baja temperatura y sin nada agregado, conserva una textura más firme y el sabor natural de la carne que queda pegada. Aun así, ningún hueso es 100 % libre de riesgo: por eso siempre se da bajo supervisión.</p>

<h2>Qué hueso elegir según tu perro</h2>
<ul>
  <li><strong>Perros grandes que muerden fuerte:</strong> el <a href="/femur-de-res/">fémur de res</a> o el <a href="/humero-de-res/">húmero de res</a>. Son grandes y resistentes, les duran.</li>
  <li><strong>Perros medianos y grandes que prefieren sostener el hueso con las patas:</strong> la <a href="/paleta-de-res/">paleta de res</a> o la <a href="/paleta-de-cerdo/">paleta de cerdo</a>, planas y anchas.</li>
  <li><strong>Mordedores intensos que buscan sabor:</strong> el <a href="/femur-de-cerdo/">fémur de cerdo</a>, con carne y tejido deshidratados pegados al hueso.</li>
  <li><strong>Perros pequeños:</strong> mejor algo más fácil de masticar, como las <a href="/patas-de-pollo/">patas de pollo</a> o las <a href="/codornices/">codornicitas</a>.</li>
</ul>
<p>La regla de oro: el hueso debe ser <strong>más grande que la boca de tu perro</strong>, para que no pueda tragárselo entero.</p>

<h2>6 reglas para darle un hueso sin sustos</h2>
<ul>
  <li><strong>Siempre bajo supervisión.</strong> No lo dejes solo con el hueso, sobre todo las primeras veces.</li>
  <li><strong>Un hueso a la vez</strong>, y si tienes varios perros, cada uno en su espacio para evitar peleas.</li>
  <li><strong>Retíralo cuando quede pequeño</strong> o con puntas: es el momento en que se lo podría tragar.</li>
  <li><strong>Agua fresca a la mano</strong> mientras muerde.</li>
  <li><strong>Sesiones cortas al principio</strong> (15 a 20 minutos) para ver cómo le cae.</li>
  <li><strong>Guárdalo en un lugar fresco y seco</strong> entre una sesión y otra.</li>
</ul>

<h2>¿Qué gana tu perro al morder?</h2>
<p>Morder un hueso satisface su instinto natural, lo mantiene ocupado cuando está solo en casa y ayuda a que no muerda lo que no debe (zapatos, muebles, cables). La masticación también ayuda a reducir la placa y el sarro, como complemento a su higiene dental.</p>
<p>Si tu perro tiene problemas dentales, está muy viejito o tiene alguna condición de salud, consulta primero con tu veterinario.</p>
HTML
  },
  {
    slug => 'snacks-naturales-para-perros',
    titulo => 'Snacks naturales para perros: qué son y cómo elegir uno bueno',
    descripcion => 'Cómo reconocer un snack natural de verdad: un solo ingrediente, sin sal ni conservantes. Qué mirar en la etiqueta y cuántos darle al día.',
    fecha => '2026-11-13',
    foto => 'cajita-escena', alt => 'Caja con snacks naturales deshidratados para perros',
    lectura => 4,
    productos => ['codornices', 'patas-de-pollo', 'oreja-de-cerdo', 'combos'],
    cuerpo => <<'HTML',
<p>Muchos premios para perros dicen ser «naturales», pero al leer la etiqueta aparecen harinas, azúcares, colorantes y conservantes. Un snack natural de verdad es mucho más sencillo: <strong>un solo ingrediente</strong>, preparado de forma que conserve lo bueno.</p>

<h2>Qué mirar en la etiqueta</h2>
<ul>
  <li><strong>Ingredientes que puedas reconocer.</strong> «Pata de pollo», «oreja de cerdo», «codorniz». Si la lista es larga y con nombres raros, no es tan natural.</li>
  <li><strong>Sin sal añadida.</strong> Los perros no la necesitan en sus premios.</li>
  <li><strong>Sin conservantes ni colorantes.</strong> Un snack bien deshidratado y bien cerrado se conserva sin químicos.</li>
  <li><strong>Sin harinas ni rellenos</strong> que solo agregan volumen y calorías.</li>
</ul>

<h2>¿Por qué deshidratado?</h2>
<p>La deshidratación lenta le quita el agua al alimento sin cocinarlo a altas temperaturas. Así se conserva la proteína, el sabor natural queda concentrado (por eso les encanta) y el snack dura más sin necesidad de aditivos.</p>

<h2>Opciones según lo que busques</h2>
<ul>
  <li><strong>Para premiar todos los días y entrenar:</strong> <a href="/codornices/">codornices deshidratadas</a>, pequeñas y crocantes. Además son una proteína novedosa, útil si tu perro no se lleva bien con el pollo o la res.</li>
  <li><strong>Para perros pequeños:</strong> <a href="/patas-de-pollo/">patas de pollo</a>, fáciles de masticar.</li>
  <li><strong>Para entretenerlo un buen rato:</strong> <a href="/oreja-de-cerdo/">oreja</a> u <a href="/oido-de-cerdo/">oído de cerdo</a>.</li>
  <li><strong>Para probar de todo:</strong> los <a href="/combos/">combos</a>, con varios snacks en un solo pedido.</li>
</ul>

<h2>¿Cuántos snacks al día?</h2>
<p>Los premios no reemplazan su comida. Como guía general, no deberían pasar del <strong>10 % de lo que come en el día</strong>. Empieza con poco, mira cómo le cae y ajusta según su tamaño y su actividad.</p>
HTML
  },
  {
    slug => 'codorniz-deshidratada-para-perros-y-gatos',
    titulo => 'Codorniz deshidratada para perros y gatos: beneficios y cómo darla',
    descripcion => 'Por qué la codorniz es una proteína novedosa, qué aporta el hueso y cómo darle codorniz deshidratada a tu perro o tu gato sin sustos.',
    fecha => '2026-11-13',
    foto => 'codornices-frasco-100g', alt => 'Frasco de codorniz deshidratada para perros y gatos',
    lectura => 4,
    productos => ['codornices', 'codorniz-entera', 'mix-de-visceras', 'combo-favoritos-revoltosos'],
    cuerpo => <<'HTML',
<p>La codorniz es un ave pequeña que muchos perros y gatos nunca han probado. Justamente por eso se ha vuelto una de las proteínas favoritas para premiar: es sabrosa, ligera y distinta a lo de siempre.</p>

<h2>Una proteína novedosa</h2>
<p>Se le llama <strong>proteína novedosa</strong> a la que tu mascota no ha comido antes. Cuando un perro o un gato no se lleva bien con el pollo o la res, cambiar a una proteína distinta, como la codorniz, es una alternativa que muchos dueños prueban. Si tu mascota tiene alergias diagnosticadas, consúltalo con tu veterinario.</p>

<h2>Qué aporta</h2>
<ul>
  <li><strong>Carne magra con mucha proteína.</strong></li>
  <li><strong>Calcio y fósforo naturales</strong> cuando se da con el hueso, como en la <a href="/codorniz-entera/">codorniz entera</a>.</li>
  <li><strong>Mucho sabor</strong>: las <a href="/mix-de-visceras/">vísceras de codorniz</a> son la parte que más les atrae, ideales para animar a los que son exigentes con la comida.</li>
</ul>

<h2>Cómo darla</h2>
<ul>
  <li><strong>Perros pequeños y gatos:</strong> en trozos pequeños, poquito al día. Las <a href="/codornices/">codornicitas</a> ya vienen del tamaño justo para premiar.</li>
  <li><strong>Perros medianos y grandes:</strong> pueden recibir la codorniz entera como premio especial.</li>
  <li><strong>Como topper:</strong> tritura un poco sobre su comida para hacerla más apetitosa.</li>
  <li>Siempre con agua fresca a la mano y, la primera vez, bajo supervisión para ver cómo le cae.</li>
</ul>

<h2>¿La codorniz deshidratada tiene hueso?</h2>
<p>Sí, la codorniz entera incluye sus huesos, que son pequeños y quedan crocantes al deshidratarse lentamente (no es lo mismo que un hueso cocinado). Si tu mascota come muy rápido o es muy pequeña, dásela en trozos.</p>
<p>Si quieres combinar, el <a href="/combo-favoritos-revoltosos/">Combo Favoritos Revoltosos</a> trae un frasco de codornicitas de 100 g, 30 patas de pollo y una paleta de cerdo.</p>
HTML
  },
  {
    slug => 'que-snack-darle-a-mi-perro-segun-su-tamano',
    titulo => '¿Qué snack le doy a mi perro según su tamaño?',
    descripcion => 'Guía rápida para elegir el snack natural correcto para perros pequeños, medianos y grandes, y para los que muerden con todas sus fuerzas.',
    fecha => '2026-11-13',
    foto => 'patas-pollo-producto', alt => 'Patas de pollo deshidratadas para perros pequeños',
    lectura => 3,
    productos => ['patas-de-pollo', 'humero-de-cerdo', 'femur-de-res', 'codornices'],
    cuerpo => <<'HTML',
<p>El mejor snack es el que tu perro puede disfrutar sin riesgo. El tamaño de su boca, la fuerza con la que muerde y su edad cambian mucho la elección. Esta es una guía rápida.</p>

<h2>Perros pequeños (menos de 10 kg)</h2>
<p>Necesitan snacks fáciles de masticar y de tamaño pequeño.</p>
<ul>
  <li><a href="/patas-de-pollo/">Patas de pollo</a>: crocantes y se rompen fácil.</li>
  <li><a href="/codornices/">Codornicitas</a>: del tamaño justo para premiar y entrenar.</li>
  <li><a href="/mix-de-visceras/">Mix de vísceras</a>: en trozos pequeños o triturado sobre la comida.</li>
</ul>

<h2>Perros medianos (10 a 25 kg)</h2>
<p>Ya pueden con masticables que les duren un rato.</p>
<ul>
  <li><a href="/oreja-de-cerdo/">Oreja de cerdo</a> y <a href="/oido-de-cerdo/">oído de cerdo</a>.</li>
  <li><a href="/humero-de-cerdo/">Húmero de cerdo</a> y <a href="/paleta-de-cerdo/">paleta de cerdo</a>.</li>
  <li><a href="/codorniz-entera/">Codorniz entera</a> como premio especial.</li>
</ul>

<h2>Perros grandes y mordedores intensos</h2>
<p>Necesitan huesos grandes y firmes que no se puedan tragar.</p>
<ul>
  <li><a href="/femur-de-res/">Fémur de res</a>: el más grande y resistente.</li>
  <li><a href="/humero-de-res/">Húmero de res</a> y <a href="/paleta-de-res/">paleta de res</a>.</li>
  <li><a href="/femur-de-cerdo/">Fémur de cerdo</a>, con mucho sabor.</li>
</ul>

<h2>Cachorros y perros mayores</h2>
<p>Sus dientes son más delicados. Prefiere snacks blandos o pequeños (patas de pollo, codornicitas) y consulta con tu veterinario antes de darles huesos grandes.</p>
<p>¿No sabes por dónde empezar? Los <a href="/combos/">combos</a> traen varios snacks para que descubras cuál es su favorito.</p>
HTML
  },
);

# Nombre y foto de cada landing que se recomienda al final del artículo.
my %PRODUCTO = (
  'femur-de-res'         => ['Fémur de res', 'femur-res-producto'],
  'humero-de-res'        => ['Húmero de res', 'humero-res-empaque-fondo-blanco'],
  'paleta-de-res'        => ['Paleta de res', 'paleta-res-producto'],
  'femur-de-cerdo'       => ['Fémur de cerdo', 'femur-cerdo-producto'],
  'humero-de-cerdo'      => ['Húmero de cerdo', 'humero-cerdo-producto'],
  'paleta-de-cerdo'      => ['Paleta de cerdo', 'paleta-cerdo-producto'],
  'codornices'           => ['Codornices deshidratadas', 'codornices-frasco-100g'],
  'codorniz-entera'      => ['Codorniz entera', 'codorniz-entera-x2-producto'],
  'mix-de-visceras'      => ['Mix de vísceras', 'codornices-bolsa-50g'],
  'patas-de-pollo'       => ['Patas de pollo', 'patas-pollo-producto'],
  'oreja-de-cerdo'       => ['Oreja de cerdo', 'oreja-cerdo-producto'],
  'combos'               => ['Combos', 'combo-cerdo-foto'],
  'combo-favoritos-revoltosos' => ['Combo Favoritos Revoltosos', 'codornices-frasco-100g'],
);

sub esc { my $s = shift // ''; $s =~ s/&/&amp;/g; $s =~ s/</&lt;/g; $s =~ s/>/&gt;/g; $s =~ s/"/&quot;/g; return $s; }
sub json { my $s = shift // ''; $s =~ s/\\/\\\\/g; $s =~ s/"/\\"/g; return $s; }
sub leer { my $f = shift; open my $h, '<:encoding(UTF-8)', $f or die "No pude leer $f: $!"; local $/; my $t = <$h>; close $h; return $t; }
sub escribir { my ($f, $t) = @_; open my $o, '>:encoding(UTF-8)', $f or die "No pude escribir $f: $!"; print $o $t; close $o; }
sub fecha_larga { my ($a, $m, $d) = split /-/, shift; return ($d + 0) . ' de ' . $MESES[$m - 1] . " de $a"; }

my ($iconos) = leer("$raiz/productos/index.html") =~ /(<!-- Íconos reutilizables -->.*?<\/svg>\n)/s or die 'No encontré los íconos en productos/index.html';

# Página completa: cabecera y pie iguales a los de la tienda.
sub pagina {
  my (%o) = @_;
  my $og = $o{imagen} ? "$SITIO$o{imagen}" : "$SITIO/assets/img/og.jpg";
  return <<"HTML";
<!doctype html>
<html lang="es-CO">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>@{[esc($o{titulo})]}</title>
<meta name="description" content="@{[esc($o{descripcion})]}">
<meta name="theme-color" content="#C2185B">
<link rel="icon" href="/assets/img/logo.jpg">
<link rel="apple-touch-icon" href="/assets/img/logo.jpg">
<link rel="canonical" href="$SITIO$o{ruta}">

<meta property="og:type" content="$o{tipo}">
<meta property="og:locale" content="es_CO">
<meta property="og:site_name" content="Revoltosos">
<meta property="og:url" content="$SITIO$o{ruta}">
<meta property="og:title" content="@{[esc($o{titulo})]}">
<meta property="og:description" content="@{[esc($o{descripcion})]}">
<meta property="og:image" content="$og">
<meta name="twitter:card" content="summary_large_image">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Young+Serif&family=Figtree:wght\@400;500;600;700;800&display=swap">
<link rel="stylesheet" href="/assets/css/landing.css?v=10">
<link rel="stylesheet" href="/assets/css/tienda.css?v=26">
$o{jsonld}
<!-- Generada con herramientas/blog/generar.pl: los cambios van allá, no aquí. -->
<script>
  window.PAGINA = { tipo: 'inicio' };
</script>
</head>
<body>

$iconos
<div class="anuncio">Envío <b>GRATIS</b> desde <span data-envio-gratis-desde>\$120.000</span> · Pagas al recibir</div>

<header class="cab">
  <div class="cab-fila">
    <a class="cab-logo" href="/" aria-label="Revoltosos, ir a la tienda"><img src="/assets/img/logo.jpg" width="150" height="150" alt="Logo de Revoltosos"><span>Revoltosos</span></a>
    <a class="btn-icono" href="#carrito" data-abrir-carrito aria-label="Abrir carrito">
      <svg width="25" height="25" aria-hidden="true"><use href="#i-bolsa"/></svg>
      <span class="contador-carrito" data-contador data-n="0">0</span>
    </a>
  </div>
  <nav class="cab-nav" aria-label="Secciones">
    <a href="/">Tienda</a>
    <a href="/productos/">Productos</a>
    <a href="/combos/">Combos</a>
    <a href="/codornices/">Codornices</a>
    <a href="/cajita/">Cajita</a>
    <a href="/blog/" aria-current="page">Blog</a>
  </nav>
  <div class="envio-barra" data-envio-barra></div>
</header>

<main>
$o{contenido}
</main>

<footer class="pie">
  <div class="contenedor pie-grid">
    <div class="pie-marca">
      <span><img src="/assets/img/logo.jpg" width="150" height="150" alt="Logo de Revoltosos" loading="lazy"></span>
      <span><strong>Revoltosos</strong><br><span style="font-size: 14px">Hecho en Colombia con amor</span></span>
    </div>
    <div class="pie-redes">
      <a href="https://instagram.com/revoltosos.deshidratados" target="_blank" rel="noopener"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="5"/><circle cx="12" cy="12" r="3.6"/></svg>\@revoltosos.deshidratados</a>
      <a href="https://wa.me/573122448276" target="_blank" rel="noopener"><svg width="18" height="18" aria-hidden="true"><use href="#i-whatsapp"/></svg>312 244 8276</a>
    </div>
    <div class="pie-legal">
      <span>© <span data-anio>2026</span> Revoltosos</span>
      <a href="/blog/">Blog</a>
      <a href="/privacidad.html">Política de tratamiento de datos (Ley 1581 de 2012)</a>
      <a href="/privacidad.html#terminos">Términos y condiciones</a>
      <span class="pie-credito">Diseño y desarrollo web: <strong>Rakun Visual Designs</strong></span>
    </div>
  </div>
</footer>

<div class="fijo-abajo">
  <a class="wa-flotante" href="https://wa.me/573122448276?text=Hola%20Revoltosos%2C%20tengo%20una%20pregunta" target="_blank" rel="noopener" aria-label="¿Dudas? Escríbenos por WhatsApp"><svg width="26" height="26" aria-hidden="true"><use href="#i-wa-lleno"/></svg></a>
  <div class="barra-t" id="barra-t">
    <button type="button" class="btn rv-meneo" data-barra-btn>Pedir ahora</button>
    <p class="ahorro-linea rv-pop" data-barra-ahorro hidden></p>
    <p><svg width="18" height="18" aria-hidden="true"><use href="#i-casa"/></svg>Pagas al recibir en tu casa · <span>no pagas nada hoy</span></p>
  </div>
</div>

<div class="cookies" id="cookies" hidden>
  <span>Usamos cookies para medir anuncios. <a href="/privacidad.html">Más info</a></span>
  <button type="button" id="cookies-ok">Entendido</button>
</div>

<script src="/assets/js/tienda.js?v=31"></script>
</body>
</html>
HTML
}

sub tarjeta_producto {
  my $ruta = shift;
  my $x = $PRODUCTO{$ruta} or die "No conozco el producto $ruta (agrégalo a %PRODUCTO)";
  my $img = defined $x->[1]
    ? qq{<img src="$IMG/$x->[1]-600.jpg" width="600" height="600" loading="lazy" alt="@{[esc($x->[0])]}">}
    : '<span class="pendiente">Foto muy pronto</span>';
  return qq{<a class="blog-prod" href="/$ruta/">$img<span>@{[esc($x->[0])]}</span></a>};
}

mkdir "$raiz/blog" unless -d "$raiz/blog";

# --- Cada artículo ---------------------------------------------------------------
for my $a (@articulos) {
  my $ruta = "/blog/$a->{slug}/";
  my $foto = "$IMG/$a->{foto}.jpg";
  my $prods = join "\n        ", map { tarjeta_producto($_) } @{ $a->{productos} };
  my $otros = join "\n        ", map {
    qq{<li><a href="/blog/$_->{slug}/">@{[esc($_->{titulo})]}</a></li>}
  } grep { $_->{slug} ne $a->{slug} } @articulos;
  my $jsonld = qq{<script type="application/ld+json">
{"\@context":"https://schema.org","\@type":"BlogPosting","headline":"@{[json($a->{titulo})]}","description":"@{[json($a->{descripcion})]}","image":"$SITIO$foto","datePublished":"$a->{fecha}","dateModified":"$a->{fecha}","inLanguage":"es-CO","mainEntityOfPage":"$SITIO$ruta","author":{"\@type":"Organization","name":"Revoltosos"},"publisher":{"\@type":"Organization","name":"Revoltosos","logo":{"\@type":"ImageObject","url":"$SITIO/assets/img/logo.jpg"}}}
</script>
<script type="application/ld+json">
{"\@context":"https://schema.org","\@type":"BreadcrumbList","itemListElement":[{"\@type":"ListItem","position":1,"name":"Tienda","item":"$SITIO/"},{"\@type":"ListItem","position":2,"name":"Blog","item":"$SITIO/blog/"},{"\@type":"ListItem","position":3,"name":"@{[json($a->{titulo})]}","item":"$SITIO$ruta"}]}
</script>};
  my $contenido = <<"HTML";
  <article class="blog-art" data-oculta-barra>
    <div class="contenedor blog-angosto">
      <nav class="blog-migas" aria-label="Estás en"><a href="/">Tienda</a> › <a href="/blog/">Blog</a></nav>
      <h1 class="titulo-sec">@{[esc($a->{titulo})]}</h1>
      <p class="blog-meta"><time datetime="$a->{fecha}">@{[fecha_larga($a->{fecha})]}</time> · $a->{lectura} min de lectura</p>
      <img class="blog-portada" src="$IMG/$a->{foto}.jpg" width="1000" height="1000" alt="@{[esc($a->{alt})]}" fetchpriority="high">
      <div class="blog-cuerpo">
$a->{cuerpo}
      </div>
    </div>
  </article>

  <section class="seccion-t" style="background: var(--hueso-2)" aria-labelledby="t-prods">
    <div class="contenedor blog-angosto">
      <h2 class="titulo-sec" id="t-prods" style="font-size: 30px">Snacks de este artículo</h2>
      <p class="bajada" style="margin: 6px 0 18px">Naturales, de un solo ingrediente. Envío gratis desde <span data-envio-gratis-desde>\$120.000</span> y pagas al recibir.</p>
      <div class="blog-prods">
        $prods
      </div>
      <h2 class="titulo-sec" style="font-size: 26px; margin-top: 36px">Sigue leyendo</h2>
      <ul class="blog-otros">
        $otros
      </ul>
    </div>
  </section>
HTML
  mkdir "$raiz/blog/$a->{slug}" unless -d "$raiz/blog/$a->{slug}";
  escribir("$raiz/blog/$a->{slug}/index.html", pagina(
    titulo => "$a->{titulo} · Blog Revoltosos", descripcion => $a->{descripcion}, ruta => $ruta,
    tipo => 'article', imagen => $foto, jsonld => $jsonld, contenido => $contenido,
  ));
  print "  $ruta\n";
}

# --- Lista del blog --------------------------------------------------------------
my $tarjetas = join "\n        ", map {
  qq{<article class="blog-tarjeta"><a href="/blog/$_->{slug}/"><img src="$IMG/$_->{foto}@{[ -f "$raiz$IMG/$_->{foto}-600.jpg" ? "-600" : "" ]}.jpg" width="600" height="600" loading="lazy" alt="@{[esc($_->{alt})]}"></a>}
  . qq{<div><p class="blog-meta"><time datetime="$_->{fecha}">@{[fecha_larga($_->{fecha})]}</time> · $_->{lectura} min</p>}
  . qq{<h2><a href="/blog/$_->{slug}/">@{[esc($_->{titulo})]}</a></h2><p>@{[esc($_->{descripcion})]}</p></div></article>}
} @articulos;
escribir("$raiz/blog/index.html", pagina(
  titulo => 'Blog Revoltosos · Snacks naturales y cuidado de tu perro',
  descripcion => 'Guías para elegir snacks naturales y huesos para tu perro o tu gato: cuáles dar, cuántos y cómo darlos de forma segura.',
  ruta => '/blog/', tipo => 'website', jsonld => '',
  contenido => <<"HTML",
  <section class="seccion-t" data-oculta-barra style="padding-top: 28px" aria-labelledby="t-blog">
    <div class="contenedor">
      <p class="antetitulo">Blog Revoltosos</p>
      <h1 class="titulo-sec" id="t-blog" style="margin: 4px 0 6px">Consejos para consentir a tu peludo</h1>
      <p class="bajada" style="margin-bottom: 24px">Qué snacks darle, cuántos y cómo hacerlo de forma segura.</p>
      <div class="blog-lista">
        $tarjetas
      </div>
    </div>
  </section>
HTML
));
print "  /blog/\n";

# --- Sitemap ---------------------------------------------------------------------
# Todas las carpetas con index.html, menos las privadas o internas.
my %fuera = map { $_ => 1 } qw(pedidos opina producto diseno herramientas supabase assets blog);
opendir my $d, $raiz or die $!;
my @rutas = ('/', map { "/$_/" } sort grep { !$fuera{$_} && !/^\./ && -f "$raiz/$_/index.html" } readdir $d);
closedir $d;
push @rutas, '/blog/', map { "/blog/$_->{slug}/" } @articulos;
my %fecha = map { ("/blog/$_->{slug}/" => $_->{fecha}) } @articulos;
my $urls = join "\n", map {
  "  <url><loc>$SITIO$_</loc>" . ($fecha{$_} ? "<lastmod>$fecha{$_}</lastmod>" : '') . '</url>'
} @rutas;
escribir("$raiz/sitemap.xml", qq{<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n$urls\n</urlset>\n});
print "  /sitemap.xml (", scalar(@rutas), " páginas)\n";
print scalar(@articulos), " artículos generados.\n";
