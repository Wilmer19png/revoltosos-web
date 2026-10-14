# PROMPT — Landing de venta: Snacks de Codorniz Deshidratada (Revoltosos)

> Copia todo lo que está debajo de la línea y pégalo en tu herramienta (Claude Code / Claude con las skills instaladas).

---

## 0. Cómo quiero que trabajes (orden obligatorio)

1. **Primero el diseño en Canva / lienzo de diseño.** Antes de escribir una sola línea de código, crea el diseño completo de la landing (versión móvil 390 px y escritorio 1440 px) en Canva (o en el lienzo de diseño disponible). Muéstramelo y espera mi aprobación.
2. **Usa la skill `impeccable`** para la dirección estética, tipografía, espaciado y revisión final de calidad visual. Pasa la landing por su checklist antes de entregar.
3. **Usa la skill de diseño** (design / canvas) para las piezas visuales: hero, tarjetas de beneficios, banners de envío gratis y contraentrega.
4. Solo cuando yo apruebe el diseño, constrúyelo en código (HTML + CSS + JS vanilla, un solo archivo `index.html` + un script de Google Apps Script). Debe ser fácil de migrar después a una tienda completa (Shopify / WooCommerce / Next.js), así que separa bien secciones y datos del producto en un objeto JS (`PRODUCT = {...}`).

## 1. Contexto del negocio

- Marca: **Revoltosos** — snacks deshidratados 100 % naturales para mascotas. Hecho en Colombia.
- Instagram: @revoltosos.vet · WhatsApp del dueño: **+57 312 244 8276**
- Producto único por ahora: **Snacks de Codorniz Deshidratada — 50 g (≈ 30 unidades de codorniz)**
- Precio: **$14.900 COP** por unidad. Todo en pesos colombianos, formato `$14.900` (punto de miles, sin decimales).
- **ENVÍO GRATIS a toda Colombia** y **PAGO CONTRAENTREGA**. Esto es lo más importante de la página: debe verse en el hero, junto al precio, en el formulario, en el botón y en el footer fijo móvil.
- Upsell en el formulario: **Envío prioritario +$5.000** (checkbox, desmarcado por defecto).
- Usa la información del catálogo (beneficios, características), pero **NO copies la identidad visual del catálogo** (café/naranja con huellas). Propón una identidad nueva siguiendo la sección 3.

## 2. Objetivo y principio de diseño

Una sola acción: **que el cliente llene el formulario y toque "Pagar al recibir"**. Página sobria, limpia, sin distracciones, sin menú de navegación, sin links que saquen de la página. Mobile‑first (el 90 % del tráfico viene de anuncios de Meta en el celular).

## 3. Identidad visual (psicología del color)

| Rol | Color | Por qué |
|---|---|---|
| Fondo base | Hueso `#F5F1E8` (secciones alternas `#EDE6D8`) | Calidez, natural, premium sin ser frío |
| Primario | Verde salvia/oliva `#4F5D3A` | Natural, saludable, confianza ("sin químicos") |
| CTA / acento | Terracota `#C1652F` (hover `#A9541F`) | Despierta apetito y urgencia; contrasta fuerte sobre hueso |
| Texto | Café casi negro `#2A231D` | Legibilidad, cálido |
| Texto secundario | `#6B6157` | |
| Sello / badges | Mostaza suave `#D9A441` (uso mínimo) | Atención puntual: "Envío gratis" |

- Tipografía: títulos con una serif con carácter (ej. *Fraunces* o *DM Serif Display*), cuerpo en sans legible (ej. *Inter* o *DM Sans*). Máx. 2 fuentes.
- Bordes redondeados suaves (12–16 px), sombras muy sutiles, mucho aire. Iconos de línea simples.
- Verifica contraste AA en todos los textos y botones.

## 4. Estructura de la landing (en este orden)

1. **Barra superior delgada**: "🚚 Envío GRATIS a toda Colombia · 💵 Pagas al recibir".
2. **Hero**: foto del producto (frasco abierto con codornices) + título + subtítulo + precio + CTA "Pedir ahora — Pagar al recibir" (hace scroll al formulario). Debajo del botón, 3 micro‑sellos: Envío gratis · Contraentrega · 100 % natural.
   - Título propuesto: **"El premio que tu perro va a pedir todos los días"**
   - Subtítulo: "Codorniz 100 % natural, deshidratada lentamente. Sin conservantes, sin sal, sin colorantes. Solo codorniz."
3. **Galería del producto**: 4–6 fotos (frasco, producto suelto, textura de cerca, mascota comiendo). Carrusel deslizable en móvil.
4. **Videos de perritos comiendo** (prueba social real): 3–6 videos verticales en carrusel, `autoplay muted loop playsinline`, carga diferida (`loading="lazy"` / IntersectionObserver), con póster. Título: "Míralos tú mismo 🐾".
5. **Beneficios** (tarjetas con ícono, texto corto):
   - **Proteína de verdad**: un solo ingrediente, codorniz entera; carne magra alta en proteína.
   - **Proteína novedosa**: buena opción para mascotas que no toleran bien pollo o res.
   - **Calcio y fósforo naturales**: al incluir hueso, aporta minerales como calcio, fósforo y zinc.
   - **Dientes más limpios**: la masticación ayuda a reducir placa y sarro y mejora el aliento.
   - **Menos ansiedad, menos destrozos**: masticar calma, entretiene y satisface su instinto natural.
   - **Sin aditivos**: sin conservantes, sin sal añadida, sin colorantes.
   - **Larga duración**: fácil de guardar, ideal para premiar o entrenar.
   > Redacta en tono cálido y concreto. No prometas curar enfermedades ni uses claims médicos.
6. **¿Para quién es?** (chips visuales):
   - 🐕 Perros de todas las razas y tamaños (adultos y cachorros desde ~3 meses).
   - 🐕‍🦺 Razas pequeñas: partir en trozos.
   - 🐈 Gatos.
   - Etapas: cachorros (+3 meses), adultos, seniors (ofrecer trozos más pequeños).
   - Usos: premio diario, entrenamiento, topper triturado sobre la comida, enriquecimiento.
   - (Minipigs u otras especies: NO incluir hasta que el dueño lo confirme con su veterinario.)
7. **Cómo darlo** (3 pasos visuales): 1) Ofrécelo como premio, 1–3 unidades al día según tamaño. 2) Siempre bajo supervisión y con agua fresca disponible. 3) Guárdalo cerrado en lugar fresco y seco.
8. **Opiniones de clientes** (ver sección 6).
9. **Cómo funciona tu pedido**: 1) Llenas el formulario (30 segundos). 2) Te escribimos por WhatsApp para confirmar. 3) Lo recibes en casa y pagas al recibir. Envío gratis.
10. **Formulario de pedido** (sección 5) — el corazón de la página.
11. **Preguntas frecuentes** (acordeón): ¿Cuánto tarda el envío? ¿De verdad el envío es gratis? ¿Cómo pago? ¿Le sirve a mi gato? ¿Cuántas le doy al día? ¿Cuánto dura el producto abierto? ¿Qué es el envío prioritario?
12. **Footer** simple: logo, Instagram, WhatsApp, "Hecho en Colombia con amor 🇨🇴", política de datos (Ley 1581 de 2012) y términos.
13. **Botón fijo en móvil** (sticky bottom): "Pedir ahora · $14.900 · Pagas al recibir" → scroll al formulario. Se oculta cuando el formulario está visible.

## 5. Formulario de pedido

Campos (todos obligatorios salvo indicación):

- **Cantidad**: selector − / + (1 a 10). Opcional: tarjetas de paquete "1 frasco / 2 frascos / 3 frascos" con la más vendida destacada (deja los precios de paquete configurables en `PRODUCT`).
- **Nombre completo**
- **Celular (WhatsApp)**: validar 10 dígitos que empiecen por 3. Guardar normalizado como `573XXXXXXXXX`.
- **Dirección** — placeholder: `Calle 2 #5-20`
- **Barrio** — placeholder: `Barrio La Sultana`
- **Departamento**: lista desplegable con los 32 departamentos + Bogotá D.C.
- **Ciudad / municipio**: campo de texto (o lista dependiente del departamento si es fácil).
- **Indicaciones adicionales** (opcional): "Apto, torre, casa, punto de referencia".
- **¿Para quién es?** (opcional, chips): Perro pequeño / Perro mediano / Perro grande / Gato.
- **Checkbox upsell**: "⚡ Envío prioritario: +$5.000 — despachamos tu pedido primero".
- **Resumen en vivo**: Subtotal · Envío: **GRATIS** (tachado "$12.000" opcional) · Prioritario (si aplica) · **Total a pagar al recibir**.
- Checkbox de autorización de tratamiento de datos (Ley 1581).
- **Botón**: **"PAGAR AL RECIBIR"** (terracota, ancho completo, grande). Debajo: "🔒 No pagas nada ahora. Pagas cuando llegue a tu casa."

Comportamiento al enviar:
1. Validar, deshabilitar botón y mostrar "Enviando tu pedido…".
2. Generar `order_id` (ej. `REV-20261013-4821`) y `event_id` único.
3. POST al Web App de Google Apps Script (sección 7).
4. Disparar `fbq('track','Purchase', {...}, {eventID: event_id})`.
5. Redirigir a una pantalla de **gracias** (en la misma página o `gracias.html`) con: número de pedido, resumen, "Te escribiremos por WhatsApp en breve para confirmar" y botón opcional "Escríbenos por WhatsApp" con el pedido prellenado.
6. Evitar envíos duplicados (bloquear doble clic y guardar `order_id` en sessionStorage).

## 6. Opiniones de clientes

- Sección con tarjetas: foto de la mascota, nombre del dueño + ciudad, estrellas y un comentario corto.
- **Usar solo opiniones reales.** Construye la sección con datos en un arreglo `REVIEWS = []` fácil de editar, y déjala con **marcadores claramente identificados** (ej. "[Nombre del cliente] — [Ciudad]", foto gris de placeholder) para que yo los reemplace con reseñas y fotos que me envíen mis clientes por WhatsApp/Instagram. No inventes nombres ni testimonios.
- Si hay menos de 3 reseñas, la sección prioriza los **videos reales de perritos comiendo** y capturas de mensajes reales de clientes (con permiso).

## 7. Gestión de pedidos: Google Sheets + Apps Script + WhatsApp

Crea un **Google Apps Script** (vinculado a una hoja "Pedidos Revoltosos") publicado como Web App que:

1. Reciba el POST del formulario (`doPost`) y agregue una fila con columnas:
   `Fecha | Order ID | Nombre | Celular | Dirección | Barrio | Ciudad | Departamento | Indicaciones | Cantidad | Prioritario (Sí/No) | Total | Para quién | Estado | Link WhatsApp | UTM source | UTM campaign | fbclid`
2. **Estado** con lista desplegable: `Nuevo · Confirmado · Despachado · Entregado · Devuelto · Cancelado` (con colores condicionales).
3. **Link WhatsApp**: fórmula/hipervínculo `https://wa.me/57XXXXXXXXXX?text=...` con el mensaje de confirmación **ya escrito y codificado** (encodeURIComponent), así el dueño solo da clic y envía:

   ```
   ¡Hola {Nombre}! 🐾 Somos Revoltosos.
   Recibimos tu pedido #{OrderID}:
   • {Cantidad} x Snacks de Codorniz Deshidratada 50 g
   • Envío: GRATIS {+ Prioritario $5.000 si aplica}
   • Total a pagar al recibir: ${Total}
   📍 {Dirección}, {Barrio}, {Ciudad} - {Departamento}
   {Indicaciones}
   ¿Nos confirmas que los datos están correctos para despacharlo? ✅
   ```
4. Envíe una notificación al dueño (correo con `MailApp`) por cada pedido nuevo, con el link de WhatsApp incluido.
5. Envíe el evento **Purchase** a la **Meta Conversions API** desde el servidor (sección 8).
6. Devuelva JSON `{ok:true, order_id}`; maneje CORS (usar `Content-Type: text/plain` en el fetch para evitar preflight).
7. Incluye instrucciones paso a paso (en español, para alguien no técnico) para: crear la hoja, pegar el script, configurar las propiedades del script (PIXEL_ID, ACCESS_TOKEN), publicar el Web App y pegar la URL en la landing.

## 8. Meta Pixel + Conversions API (para que el algoritmo optimice bien)

- **Pixel en el navegador** con `PIXEL_ID` configurable:
  - `PageView` al cargar.
  - `ViewContent` al cargar (content_ids: `["codorniz-50g"]`, value 14900, currency `COP`).
  - `AddToCart` al cambiar cantidad o tocar el CTA del hero.
  - `InitiateCheckout` al primer foco en el formulario (una sola vez).
  - `Purchase` al enviar con éxito: `value` = total, `currency: 'COP'`, `content_ids`, `num_items`, y `{eventID: event_id}`.
  - Usa **Advanced Matching** con teléfono, nombre, ciudad, departamento y país `co`.
- **Conversions API desde Apps Script** (`UrlFetchApp` a `https://graph.facebook.com/v{versión vigente}/{PIXEL_ID}/events`):
  - Mismo `event_name: "Purchase"` y **mismo `event_id`** que el navegador para deduplicar.
  - `event_time` (Unix), `action_source: "website"`, `event_source_url`.
  - `user_data` con hash **SHA‑256** (minúsculas, sin espacios): `ph` (57XXXXXXXXXX), `fn`, `ln`, `ct`, `st`, `country` (`co`), `external_id` (order_id). Además `client_user_agent`, `fbp` y `fbc` (leer cookies `_fbp`/`_fbc` en el navegador o construir `fbc` desde `fbclid`) y enviarlos en el POST.
  - `custom_data`: `value`, `currency: "COP"`, `content_ids`, `content_type: "product"`, `num_items`, `order_id`.
  - Opción `TEST_EVENT_CODE` para probar en el Administrador de Eventos.
- Captura y guarda UTMs y `fbclid` de la URL.
- Banner de cookies mínimo y discreto.

## 9. Rendimiento y calidad

- Carga < 2,5 s en 4G: imágenes WebP/AVIF con `srcset`, videos comprimidos (MP4 H.264, ≤ 2 MB c/u) con póster, fuentes con `display=swap`, sin librerías pesadas.
- Accesible: labels reales, foco visible, `alt` descriptivos, tamaños táctiles ≥ 44 px.
- SEO básico + Open Graph (para que se vea bien al compartir por WhatsApp).
- Probar en iPhone y Android (Safari y Chrome) y en el navegador interno de Instagram/Facebook.

## 10. Imágenes con IA (si tienes acceso a un generador)

Usa las **fotos reales del producto** para todo lo que muestre el producto (no lo alteres con IA: el cliente debe recibir lo que ve). La IA solo para escenas de ambiente. Prompts sugeridos:

1. *"Fotografía de producto editorial, frasco plástico transparente con tapa amarilla lleno de codornices deshidratadas color caramelo, sobre superficie de lino color hueso, luz natural suave de ventana lateral, sombras suaves, ramitas de romero, fondo beige cálido liso, estilo minimalista premium, 4:5"*
2. *"Golden retriever sentado mirando con ilusión la mano de su dueña que le ofrece un snack de codorniz deshidratada, sala colombiana luminosa con plantas, paleta hueso, verde oliva y terracota, luz cálida de tarde, fotografía lifestyle realista, poca profundidad de campo"*
3. *"Perro pequeño tipo french poodle masticando un snack natural sobre un tapete tejido, tonos crema y verde salvia, fotografía realista, cálida y tierna"*
4. *"Gato atigrado olfateando curioso un trozo de codorniz deshidratada en un plato de cerámica hueso, luz natural, fondo limpio, realista"*
5. *"Flat lay de codornices deshidratadas sobre papel kraft y fondo hueso, con hojas de salvia, vista cenital, luz suave, estilo editorial de comida natural"*

## 11. Entregables

1. Diseño en Canva / lienzo (móvil + escritorio) para aprobación.
2. `index.html` (landing + página de gracias), listo para subir a Netlify/Vercel/Hostinger.
3. `Code.gs` (Apps Script) + instrucciones de instalación.
4. Lista de los textos y lugares donde debo poner: fotos, videos, reseñas reales, PIXEL_ID y token.
5. Checklist de prueba: pedido de prueba → fila en la hoja → link de WhatsApp correcto → evento Purchase visible en Meta (navegador + servidor, deduplicado).
