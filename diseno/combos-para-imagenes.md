# Combos: qué trae cada uno (para hacer sus imágenes)

Precios del gestor al 21 nov 2026. Los recortes sin fondo de cada snack, en grande, están en
`diseno/piezas-png/` (sacados de las fotos reales con Higgsfield). Úsalos como referencia para que
la imagen muestre el producto real.

| # | Combo | Precio | Trae | Recortes |
|---|-------|--------|------|----------|
| 1 | Combo Cerdito Crujiente | $54.900 | 1 paleta de cerdo · 1 fémur de cerdo · 1 oreja de cerdo · 5 patas de pollo | paleta-cerdo, femur-cerdo, oreja-cerdo-una, patas-pollo |
| 2 | Combo Res Crujiente | $57.900 | 1 húmero de res · 1 fémur de res · 1 paleta de cerdo | humero-res, femur-res, paleta-cerdo |
| 3 | Combo Doble Paleta | $59.900 | 2 paletas de cerdo · 30 patas de pollo | paleta-cerdo, patas-pollo |
| 4 | Combo Cerdo y Patitas | $64.900 | 1 paleta de cerdo · 1 fémur de cerdo · 30 patas de pollo | paleta-cerdo, femur-cerdo, patas-pollo |
| 5 | Combo Masticador Grande | $79.900 | 1 húmero de res · 1 fémur de res · 30 patas de pollo | humero-res, femur-res, patas-pollo |
| 6 | Combo Patitas para Compartir | $84.900 | 60 patas de pollo (2 tarros de 30) · 1 bolsa de codornicitas 50 g | patas-pollo, codornices-bolsa |
| 7 | Combo Despensa Crujiente | $85.900 | 30 patas de pollo · 2 paletas de cerdo · 2 orejas de cerdo | patas-pollo, paleta-cerdo, oreja-cerdo |
| 8 | Combo Favoritos Revoltosos | $85.900 | 1 frasco de codornicitas 100 g · 30 patas de pollo · 1 paleta de cerdo | codornices-frasco, patas-pollo, paleta-cerdo |
| 9 | Combo Dúo Masticador | $109.900 | 2 húmeros de res · 2 paletas de cerdo · 30 patas de pollo | humero-res, paleta-cerdo, patas-pollo |
| 10 | Combo Despensa Familiar | $129.900 (envío gratis) | 1 frasco de codornicitas 100 g · 60 patas de pollo (2 tarros de 30) · 2 paletas de cerdo | codornices-frasco, patas-pollo, paleta-cerdo |

## Recortes que faltan

- **Húmero de res sin empaque**: solo hay foto empacada (el recorte `humero-res` sale con su etiqueta).
- **Húmero de cerdo, oído de cerdo, codorniz entera, mix de vísceras y paleta de res**: no los trae
  ningún combo actual, por eso no se recortaron. Si un combo nuevo los usa, hay que recortarlos.
- **Tarro de 30 patas de pollo**: el recorte `patas-pollo` son 6 patas sueltas; para mostrar «30»
  sirve una foto del tarro.

## Cómo reemplazar una portada

1. Guarda la imagen cuadrada (1000 × 1000) como `assets/img/productos/<combo>-portada.jpg`
   y una de 600 × 600 como `<combo>-portada-600.jpg` (mismo nombre que la provisional).
2. Las imágenes no llevan `?v=` y el celular las guarda una semana. Si quieres que la nueva se vea
   ya, ponle otro nombre (p. ej. `-portada2`) y cámbialo en `herramientas/landings/generar.pl` y en
   `productos.imagen` del gestor.
3. Para volver a armar las portadas automáticas con los recortes: `node herramientas/portadas/componer.js`.
