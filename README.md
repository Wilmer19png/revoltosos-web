# Revoltosos · Landing de Codornices Deshidratadas

Landing de venta de un solo producto (frasco de 50 g, $14.900 COP, envío gratis y pago contraentrega) y un panel privado para gestionar los pedidos.

- **Diseño (lienzo):** https://claude.ai/artifact/CBFnSSrgfk6AztqJxZAy6y (copia de los archivos en `diseno/lienzo/`)
- **Contexto del negocio:** [PRODUCT.md](PRODUCT.md)
- **Prompts de imágenes:** [prompts-imagenes.md](prompts-imagenes.md)

## Estado

- [x] Diseño de la landing (móvil y escritorio), barra fija, pantalla de carga y pantalla de gracias
- [x] Diseño del panel de pedidos (ingreso y lista)
- [ ] Aprobación final del diseño
- [ ] `index.html` de la landing (HTML + CSS + JS vanilla, datos en `PRODUCT = {...}`)
- [ ] Supabase: tabla `pedidos`, reglas de seguridad (RLS), inicio de sesión del dueño
- [ ] Panel `/pedidos` con correo y contraseña, y botón de WhatsApp con el mensaje prellenado
- [ ] Meta Pixel + Conversions API (función en Supabase, evento deduplicado)
- [ ] Fotos y videos reales, y reseñas de clientes

## Arquitectura prevista

```
Landing (index.html) ──insert──▶ Supabase · tabla pedidos ◀──leer/actualizar── Panel /pedidos (con sesión)
        │                              │
        └── Meta Pixel (navegador)      └── Edge Function ──▶ Meta Conversions API (mismo event_id)
```

- La landing solo puede **crear** pedidos. Leerlos o cambiarlos requiere la sesión del dueño.
- El registro público queda desactivado. El usuario del dueño se crea a mano en Supabase.
- Los secretos (token de Meta, `service_role` de Supabase) **nunca** se suben a este repositorio.

## Estructura

```
Recursos página/   fotos y logo originales del cliente
diseno/lienzo/     artboards del lienzo de diseño (.dc.html)
PRODUCT.md         contexto del negocio y decisiones
```
