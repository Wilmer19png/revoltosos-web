# Revoltosos · Landing de Codornices Deshidratadas

Landing de venta de un solo producto (frasco de 50 g: 1 por $14.900, promo 2 por $26.900; envío gratis y pago contraentrega) y un panel privado para gestionar los pedidos.

- **Diseño (lienzo):** https://claude.ai/artifact/CBFnSSrgfk6AztqJxZAy6y (copia de los archivos en `diseno/lienzo/`)
- **Contexto del negocio:** [PRODUCT.md](PRODUCT.md)
- **Prompts de imágenes:** [prompts-imagenes.md](prompts-imagenes.md)

## Qué hay

| Archivo | Qué es |
|---|---|
| `index.html` | La landing: pantalla de carga, formulario, pantalla de gracias, Meta Pixel |
| `pedidos/index.html` | Panel privado (correo + contraseña) con los pedidos y el botón de WhatsApp |
| `privacidad.html` | Política de datos (Ley 1581) y términos |
| `supabase/schema.sql` | Tablas `pedidos` y `admins` con seguridad (ya ejecutado) |
| `supabase/functions/crear-pedido/index.ts` | Función del servidor: guarda el pedido y avisa a Meta |
| `assets/img/` | Imágenes optimizadas (el render recortado sin el precio viejo) |

```
Landing ──POST──▶ Edge Function crear-pedido ──insert──▶ tabla pedidos ◀──leer/actualizar── Panel /pedidos (sesión)
   │                         └──▶ Meta Conversions API (mismo event_id que el Pixel)
   └── Meta Pixel en el navegador
```

## Puesta en marcha (una sola vez)

### 1. Base de datos ✅
`supabase/schema.sql` ya se ejecutó. El registro público está apagado y el usuario de María José ya existe.
Después: `supabase/migraciones/002-ofertas.sql` (ofertas por landing).

### 2. Subir la función `crear-pedido`
1. Supabase → **Edge Functions** → **Deploy a new function** → **Via Editor**.
2. Nombre: `crear-pedido` (exactamente así).
3. Borra el código de ejemplo, pega todo el contenido de `supabase/functions/crear-pedido/index.ts` y dale **Deploy**.
4. Entra a la función → **Details / Settings** → apaga **Enforce JWT Verification** (Verify JWT) y guarda.
   La landing usa la clave pública nueva (`sb_publishable_…`), que no es un JWT; con esa opción encendida, los pedidos se rechazan.

### 3. Secrets de la función (Edge Functions → Secrets)
| Nombre | Valor | ¿Obligatorio? |
|---|---|---|
| `META_PIXEL_ID` | ID del Pixel (solo números) | Para medir ventas en Meta |
| `META_ACCESS_TOKEN` | Token de la API de Conversiones (Administrador de eventos → Configuración → Generar token) | Para medir ventas en Meta |
| `META_TEST_EVENT_CODE` | Código de prueba (p. ej. `TEST12345`) | Solo mientras pruebas; **bórralo después** |
| `ALLOWED_ORIGIN` | Dominio final, p. ej. `https://revoltosos.com` | Recomendado cuando haya dominio |

`SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` ya vienen puestos por Supabase. **Nunca** los pegues en el código ni en el chat.

### 4. Pixel en la página
En `index.html`, busca `CONFIG` y pon el mismo ID en `PIXEL_ID: '123456789012345'`.

### 5. Correo para recuperar la contraseña
Supabase → **Authentication → URL Configuration**:
- **Site URL:** el dominio de la landing.
- **Redirect URLs:** agrega `https://TU-DOMINIO/pedidos/`.

### 6. Publicar
Es un sitio estático (sin build). Sirve en Netlify, Vercel, Cloudflare Pages o Hostinger: se sube la carpeta tal cual. `Recursos página/`, `diseno/` y `supabase/` no hacen falta en el hosting, pero no estorban.

## Checklist de prueba

1. Abrir la landing en el celular: sale la pantalla de carga, desaparece sola, y al recargar ya no vuelve a salir.
2. Hacer un pedido de prueba con datos reales tuyos → aparece la pantalla de gracias con número `REV-AAAAMMDD-XXXX`.
3. Entrar a `/pedidos/` con el correo de María José → el pedido aparece como **Nuevo**.
4. Tocar **Confirmar por WhatsApp** → se abre el chat del cliente con el mensaje ya escrito.
5. Cambiar el estado a **Confirmado** → se queda guardado al recargar.
6. Con `META_TEST_EVENT_CODE` puesto: en el Administrador de eventos → **Probar eventos** debe verse **Purchase** dos veces (navegador y servidor) marcado como **deduplicado**.
7. Borrar `META_TEST_EVENT_CODE` y el pedido de prueba (Supabase → Table editor → pedidos).

## Landings y ofertas

| Link | Oferta (`ofertas.slug`) | Qué vende | Visible |
|---|---|---|---|
| `/` | `codornices-promo` | 1 frasco $14.900 · 2 por $26.900 | Pública |
| `/codornices/unidad/` | `codornices-unidad` | Solo 1 frasco a $14.900 (prueba A/B) | Oculta |
| `/cajita/` | `cajita-perros` | Cajita para perros $72.900 | Pública |

- El precio que se cobra sale de la tabla **`ofertas`** en Supabase (la función `crear-pedido` la lee). La página solo lo muestra.
- `/` y `/codornices/unidad/` son **la misma página**: `index.html` mira la dirección y muestra u oculta los bloques `solo-promo` / `solo-unidad`.
- Estilos y lógica compartidos: `assets/css/landing.css` y `assets/js/landing.js`. Cada landing solo define `window.PAGINA`.
- El panel tiene la pestaña **Landings** con cada link, botón para copiarlo y cuántos pedidos y ventas trae.

### Para cambiar un precio
1. Supabase → **Table Editor → ofertas** → edita `precios` de la oferta (por ejemplo `{"1": 20900, "2": 29900}`).
2. Cambia el mismo número en `window.PAGINA.precios` de la landing (para que se muestre bien).

### Para crear otra variante oculta
1. Agrega una fila en `ofertas` con su `slug`, `precios`, `ruta` y `oculta = true`.
2. Agrega la variante en el `<script>` del `<head>` de la landing y la regla en `netlify.toml`.

## Contenido pendiente
- Foto real de una codorniz para "Anatomía del snack" (por ahora va un recorte del render) y los puntos 1–3 encima.
- Videos de perritos → `VIDEOS` en `index.html` (la sección aparece sola).
- Reseñas reales con permiso → `REVIEWS` en `index.html` (la sección aparece sola).
- Render del producto sin precio impreso (el actual dice 14.900; se recortó para ocultarlo).
- Nombre legal o NIT para la política de datos, si lo tienen.

## Supabase
- Proyecto: `https://jlvnrxmardcnarzspccs.supabase.co`
- Clave pública (publishable, se puede ver en la web): `sb_publishable_Jca2aMrjHOFVBrDnZpMj-Q_lDK6BWLF`
- Correos con acceso al panel: tabla `admins` (hoy `mariajosecastano81@gmail.com`). Para dar acceso a alguien más: agregar su correo en esa tabla **y** crearle usuario en Authentication.
