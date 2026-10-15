# Revoltosos · Tienda de snacks naturales

Tienda con catálogo, carrito, cupones y pago contraentrega, una landing por producto para pautar, y un gestor privado con pedidos, productos, inventario, costos y metas.

- **Diseño (lienzo):** https://claude.ai/artifact/MmiRMVLBnLN1Prohm5f7ZF
- **Contexto del negocio:** [PRODUCT.md](PRODUCT.md)

## Qué hay

| Ruta | Qué es |
|---|---|
| `/` (`index.html`) | Inicio de la tienda: catálogo, «entre más pides, más ahorras», beneficios, preguntas |
| `/productos/` | Todos los productos con filtros por tipo (`/productos/?cat=Masticables` abre con ese filtro) |
| `/combos/` | Solo los combos |
| `/codornices/` | Landing de codornices (la que se pauta) |
| `/cajita/` | Landing de la Cajita para perros |
| `/patas-de-pollo/`, `/oreja-de-cerdo/`, `/femur-de-cerdo/`, `/femur-de-res/`, `/humero-de-cerdo/`, `/humero-de-res/`, `/paleta-de-cerdo/`, `/codorniz-entera/` | Landings de cada producto, generadas con `herramientas/landings/generar.pl` (textos y fotos en ese archivo; después de cambiarlo: `perl herramientas/landings/generar.pl`) |
| `/combo-res-codornicitas/`, `/combo-cerdo/`, `/combo-codornicitas-patas/` | Landings de los combos (mismo generador). Al despachar un combo, el inventario baja en cada producto que trae (tabla `variante_componentes`, migración 012) |
| `/producto/?p=ID` | Página genérica para un producto nuevo que aún no tenga landing |
| `/pedidos/` | Gestor privado: resumen, pedidos, productos, inventario, cupones, ajustes, reseñas |
| `/opina/` | Formulario de reseñas para clientes |
| `assets/css/tienda.css`, `assets/js/tienda.js` | Estilos y lógica compartidos de la tienda (carrito, cupón, envío gratis, formulario) |
| `assets/css/landing.css` | Base visual y secciones de contenido (anatomía, carruseles, beneficios…) |
| `supabase/functions/crear-pedido/index.ts` | Función del servidor: recalcula precios, cupón y envío, guarda el pedido y avisa a Meta |
| `supabase/migraciones/` | Cambios de la base de datos, en orden |

```
Tienda (carrito) ──POST──▶ crear-pedido ──▶ pedidos (items, cupón, envío, costos)
   │  lee productos, variantes y ajustes          │ trigger: al pasar a Despachado sale del inventario
   └── Meta Pixel                                 └──▶ Meta Conversions API (mismo event_id)
Gestor /pedidos ◀── lee y edita todo (solo correos de la tabla admins)
```

## Cómo funciona

- **Precios y tamaños** viven en Supabase (`productos` y `variantes`) y se cambian en el gestor → pestaña **Productos**. La tienda los muestra; la función `crear-pedido` los vuelve a leer al crear el pedido, así nadie puede cambiar un precio desde el navegador.
- **Precio normal / precio de venta:** si un tamaño tiene precio normal mayor que el de venta, la tienda lo muestra tachado con «Ahorras $X» y lo suma en «Estás ahorrando».
- **Envío:** gratis cuando los productos (ya con cupón) llegan al mínimo de **Ajustes** (hoy $70.000). Si no, se cobra la tarifa de la ciudad (si tiene), la del departamento o la normal, en ese orden. Las tarifas se sacan a mano del cotizador público de envia.com (instrucciones en Ajustes) y se pueden cambiar cuando quieras.
- **Pautar un tamaño:** `/codornices/?t=50g` abre la landing con la bolsa elegida y `?t=100g` con el frasco. Gestor → Productos → «Links para pautar cada tamaño» tiene cada link listo para copiar. Si un tamaño tiene foto propia (columna Foto), la foto principal cambia al elegirlo.
- **Inventario:** sale solo cuando un pedido pasa a **Despachado** (o En reparto / Entregado). Vuelve a bodega si se cancela, no se confirma o se devuelve. Un combo («2 frascos») descuenta del tamaño que se elija (2 × frasco de 100 g).
- **Ganancia:** venta − costo de producto − envío real (o el promedio de Ajustes) − comisión de recaudo. Las devoluciones restan el flete de ida y vuelta. La neta resta además el gasto en pauta del mes.
- **Metas:** en Resumen → «Poner meta» y «Gasto en pauta» por mes. Las ventas cuentan solo pedidos **Entregados**.
- **Avisos de compra** («Juliana de Medellín acaba de pedir…»): salen de pedidos reales de los últimos 7 días (solo primer nombre y ciudad), con la función `compras_recientes`.

## Puesta en marcha de la tienda (en este orden)

1. **Base de datos:** Supabase → SQL Editor → pega `supabase/migraciones/007-tienda.sql` → Run. Después, en una consulta nueva, `supabase/migraciones/008-precios-catalogo.sql` → Run (precios de todo el catálogo, productos activos y 1000 unidades de inventario inicial en cada tamaño). Luego `011-envio-ciudad-y-landings.sql` (tarifas por ciudad, foto por tamaño y la ruta de cada landing). Después `012-combos-y-etiquetas.sql` (los 3 combos y las etiquetas con fueguito, que se cambian en Productos → «Etiqueta con fueguito»).
2. **Función:** Supabase → Edge Functions → `crear-pedido` → reemplaza todo el código por `supabase/functions/crear-pedido/index.ts` → Deploy. (Verify JWT sigue apagado.)
3. **Publicar el sitio** (Netlify, desde git).
4. En el gestor → **Productos**: completa precios y **costos** de cada tamaño, y activa los productos que quieras vender.
5. En el gestor → **Ajustes**: revisa la tarifa de envío, el costo promedio que te cobra la transportadora y la comisión de recaudo.
6. Cambia los anuncios que apuntaban a `/` para que apunten a `/codornices/` (o a la landing del producto).

Si el sitio se publica antes de correr la migración, la tienda muestra un catálogo de respaldo (codornices y Cajita), pero los pedidos fallan hasta que estén la migración y la función nueva.

## Pauta de Meta en el gestor (pestaña Pauta)

Trae de Meta el gasto, clics y compras de cada anuncio, día por día, y lo cruza con los pedidos **entregados** de ese anuncio. El Resumen usa ese gasto para la ganancia neta del mes.

1. SQL Editor → `supabase/migraciones/009-pauta-meta.sql` → Run.
2. Edge Functions → **Deploy a new function** → nombre `sincronizar-pauta` → pega `supabase/functions/sincronizar-pauta/index.ts` → Deploy. Esta sí puede dejar **Verify JWT encendido** (la llama el gestor con tu sesión).
3. Vuelve a desplegar `crear-pedido` con su código actual (ahora guarda de qué anuncio vino cada pedido).
4. Secrets: `META_AD_ACCOUNT_ID` = ID de la cuenta publicitaria (Administrador de anuncios, arriba a la izquierda; con o sin `act_`). La función usa `META_ACCESS_TOKEN`; si Meta dice que no tiene permiso para leer anuncios, crea un token de **usuario del sistema** con permiso `ads_read` (Configuración del negocio → Usuarios del sistema) y guárdalo como `META_ADS_TOKEN`.
5. En cada anuncio → **Parámetros de URL**:
   `utm_source=facebook&utm_medium=paid&utm_campaign={{campaign.name}}&utm_content={{ad.id}}&utm_term={{adset.name}}`
   (el botón «Copiar» está en la pestaña Pauta).

El gestor se actualiza solo al abrir la pestaña si pasaron más de 3 horas, o con «Actualizar desde Meta». Si algo falla, el mensaje dice qué revisar. Reportes: «Descargar Excel» (CSV) y «Guardar PDF» (en Pauta y en Resumen).

## Envía: guías, contraentrega y rastreo desde el gestor

Desde cada pedido: **Generar guía con Envía** cotiza con todas las transportadoras (precio con recaudo contraentrega incluido), generas la guía con la que elijas, se descarga el PDF, el pedido pasa a **Despachado** (sale del inventario) y el envío real queda anotado. El rastreo cambia solo los pedidos a **En reparto**, **Entregado** o **Devuelto**, y marca las **novedades** (dirección errada, intento fallido…) para escribirle al cliente antes de que se devuelva. Los avisos al cliente van por botones de WhatsApp con el mensaje ya escrito.

1. Crea tu cuenta en envia.com y genera un **token de pruebas** (sandbox). Las guías de pruebas no son reales ni se cobran.
2. SQL Editor → `supabase/migraciones/010-envia.sql` → Run (municipios con código DANE, peso por tamaño, datos del remitente, campos de la guía).
3. Edge Functions → **Deploy a new function** → `envia` → pega `supabase/functions/envia/index.ts` → Deploy (Verify JWT puede quedar encendido).
4. Secrets: `ENVIA_TOKEN` = el token. Mientras pruebas no pongas nada más (queda en modo pruebas). Para guías reales: cambia `ENVIA_TOKEN` por el token de producción y agrega `ENVIA_ENTORNO` = `produccion`.
5. Gestor → **Ajustes → Envía**: llena el remitente y la caja, guarda y toca **Probar conexión con Envía**.
6. Gestor → **Productos**: pon el **Peso (g)** de cada tamaño ya empacado.

## Primera puesta en marcha (ya hecha)

- `supabase/schema.sql` y migraciones 002–006 ya se ejecutaron. El registro público está apagado y el usuario de María José existe.
- Secrets de la función (Edge Functions → Secrets): `META_PIXEL_ID`, `META_ACCESS_TOKEN`, opcionales `META_TEST_EVENT_CODE` (bórralo después de probar) y `ALLOWED_ORIGIN`. `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` los pone Supabase; **nunca** los pegues en el código ni en el chat.
- Authentication → URL Configuration: Site URL = dominio de la tienda; Redirect URLs incluye `https://TU-DOMINIO/pedidos/`.

## Checklist de prueba

1. Abrir `/` en el celular: aparece el catálogo; agregar un producto sube el contador del carrito y la barra de envío gratis.
2. Llegar a $70.000: la barra se pone verde con dorado y cae confeti.
3. Crear un cupón en el gestor → escribirlo en el carrito → baja el total.
4. Hacer un pedido de prueba → pantalla de gracias con número `REV-AAAAMMDD-XXXX`.
5. En el gestor el pedido sale como **Nuevo** con sus productos, cupón y envío.
6. Pasarlo a **Despachado** → en Inventario baja el stock y aparece el movimiento.
7. Pasarlo a **Entregado** → suma en Resumen y en la meta.
8. Con `META_TEST_EVENT_CODE`: en Administrador de eventos → Probar eventos se ve **Purchase** deduplicado.
9. Borrar el pedido de prueba (Supabase → Table editor → pedidos) y el código de prueba de Meta.

## Para probar en el computador

El sitio usa rutas que empiezan con `/`, así que no se ve bien abriendo el archivo directo. Abre la carpeta con la extensión **Live Server** de VS Code (clic derecho en `index.html` → Open with Live Server).

## Supabase
- Proyecto: `https://jlvnrxmardcnarzspccs.supabase.co`
- Clave pública (publishable, se puede ver en la web): `sb_publishable_Jca2aMrjHOFVBrDnZpMj-Q_lDK6BWLF`
- Correos con acceso al gestor: tabla `admins` (hoy `mariajosecastano81@gmail.com`). Para dar acceso a alguien más: agregar su correo en esa tabla **y** crearle usuario en Authentication.
