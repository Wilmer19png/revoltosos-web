#!/usr/bin/perl
# Revoltosos · generador de landings de producto
#
# Crea /patas-de-pollo/index.html, /oreja-de-cerdo/index.html, etc. con la misma
# estructura de la landing de codornices. Los precios y tamaños NO van aquí: salen
# del gestor (Supabase). Aquí solo van textos, fotos y rutas.
#
# Uso (desde la carpeta del proyecto):   perl herramientas/landings/generar.pl
# La pantalla de carga se copia de codornices/index.html para que todas queden iguales.

use strict;
use warnings;
use utf8;
use FindBin;
binmode STDOUT, ':utf8';

my $raiz = "$FindBin::Bin/../..";
my $IMG = '/assets/img/productos';

# --- Contenido de cada producto --------------------------------------------------
# foto / empaque: nombre base del archivo en assets/img/productos (sin .jpg).
# Existen <foto>.jpg y <foto>-600.jpg (cuadradas) y <empaque>.jpg y <empaque>-600.jpg (3:4).
my @productos = (
  {
    id => 'patas-pollo', ruta => 'patas-de-pollo', nombre => 'Patas de pollo deshidratadas', corto => 'Patas de pollo',
    antetitulo => 'Pollo · un solo ingrediente',
    descripcion => 'Patas de pollo enteras, deshidratadas lentamente. Crocantes, fáciles de masticar y sin nada agregado: ni sal, ni conservantes, ni colorantes.',
    meta => 'Patas de pollo deshidratadas para perros: crocantes, un solo ingrediente, sin conservantes. Paquetes de 5, 10, 30 o por kilo. Pagas al recibir.',
    foto => 'patas-pollo-producto', empaque => 'patas-pollo-empaque',
    alt_foto => 'Patas de pollo deshidratadas Revoltosos', alt_empaque => 'Tarro de patas de pollo Revoltosos',
    checks => ['Crocantes', 'Sin conservantes', 'Ideales para razas pequeñas', 'Hecho en Colombia'],
    beneficios_titulo => 'Crocantes, sencillas y muy pedidas.',
    beneficios_bajada => 'Una pata de pollo es eso: una pata de pollo, deshidratada despacio para que quede crocante.',
    beneficios => [
      ['textura', 'Crocantes y fáciles de masticar', 'Se rompen fácil, por eso funcionan bien en perros pequeños.'],
      ['proteina', 'Un solo ingrediente', 'Pata de pollo y nada más. Sin harinas ni rellenos.'],
      ['dientes', 'Ayudan a mantener los dientes', 'Masticarlas ayuda a reducir placa y sarro.'],
      ['calma', 'Los entretiene', 'Morder y masticar satisface su instinto natural.'],
      ['aditivos', 'Sin aditivos', 'Sin conservantes, sin sal añadida, sin colorantes.'],
      ['paquete', 'Entre más pides, más ahorras', 'Paquetes de 5, 10, 30 unidades o por kilo.'],
    ],
    para_quien => ['Perros de todas las razas', 'Ideales para razas pequeñas y medianas', 'Adultos'],
    uso => ['Premio diario', 'Entrenamiento', 'Para morder un rato'],
    como_darlo => [
      ['Ofrécela como premio,', ' sin reemplazar su comida. Empieza con una y mira cómo le cae.'],
      ['Siempre bajo supervisión', ' y con agua fresca a la mano.'],
      ['Guárdalas bien cerradas', ' en un lugar fresco y seco.'],
    ],
    preguntas => [
      ['¿Qué paquete me conviene?', 'Entre más unidades, menor precio por pata: el de 10 y el de 30 salen más baratos que comprar paquetes de 5.'],
      ['¿Le sirven a un perro pequeño?', 'Sí. Son de los snacks más fáciles de masticar. Dale siempre bajo supervisión.'],
    ],
  },
  {
    id => 'oreja-cerdo', ruta => 'oreja-de-cerdo', nombre => 'Oreja de cerdo deshidratada', corto => 'Oreja de cerdo',
    antetitulo => 'Cerdo · un solo ingrediente',
    descripcion => 'Oreja de cerdo entera, deshidratada lentamente. Un masticable natural para que tu perro se entretenga un buen rato.',
    meta => 'Oreja de cerdo deshidratada para perros: masticable natural, un solo ingrediente, sin conservantes. Pagas al recibir.',
    foto => 'oreja-cerdo-producto', empaque => 'oreja-cerdo-empaque',
    alt_foto => 'Oreja de cerdo deshidratada Revoltosos', alt_empaque => 'Oreja de cerdo Revoltosos empacada',
    checks => ['Masticable natural', 'Sin conservantes', 'Un solo ingrediente', 'Hecho en Colombia'],
    beneficios_titulo => 'Para masticar un buen rato.',
    beneficios_bajada => 'Oreja de cerdo entera, deshidratada despacio. Sin harinas ni rellenos.',
    beneficios => [
      ['calma', 'Lo mantiene ocupado', 'Masticar los calma, los entretiene y satisface su instinto natural.'],
      ['dientes', 'Ayuda a mantener los dientes', 'La masticación ayuda a reducir placa y sarro.'],
      ['proteina', 'Un solo ingrediente', 'Oreja de cerdo y nada más.'],
      ['aditivos', 'Sin aditivos', 'Sin conservantes, sin sal añadida, sin colorantes.'],
      ['duracion', 'Fácil de guardar', 'Ideal para tener a la mano cuando lo dejas solo en casa.'],
    ],
    para_quien => ['Perros medianos y grandes', 'Adultos', 'Perros que disfrutan masticar'],
    uso => ['Premio especial', 'Para los días en casa', 'Masticable'],
    como_darlo => [
      ['Ofrécela como premio,', ' sin reemplazar su comida.'],
      ['Siempre bajo supervisión.', ' Retira los trozos pequeños que se puedan tragar enteros.'],
      ['Agua fresca a la mano', ' y guárdala en un lugar fresco y seco.'],
    ],
    preguntas => [
      ['¿Le sirve a un perro pequeño?', 'Es mejor para perros medianos y grandes. Para los pequeños recomendamos las patas de pollo o las codornices.'],
    ],
  },
  {
    id => 'femur-cerdo', ruta => 'femur-de-cerdo', nombre => 'Fémur de cerdo deshidratado', corto => 'Fémur de cerdo',
    antetitulo => 'Cerdo · un solo ingrediente',
    descripcion => 'Fémur de cerdo deshidratado lentamente. Un reto para los perros que muerden fuerte y necesitan algo que les dure.',
    meta => 'Fémur de cerdo deshidratado para perros: hueso natural para morder, sin conservantes. Pagas al recibir.',
    foto => 'femur-cerdo-producto', empaque => 'femur-cerdo-empaque', ancho => 1000,
    alt_foto => 'Fémur de cerdo deshidratado Revoltosos', alt_empaque => 'Fémur de cerdo Revoltosos empacado con su etiqueta',
    anatomia => {
      foto => 'femur-cerdo-producto', alt => 'Fémur de cerdo deshidratado Revoltosos, con restos de carne pegados al hueso',
      bajada => 'Así luce un fémur de cerdo Revoltosos de cerca. Lo que ves es todo lo que tiene.',
      puntos => [
        [11, 37, 'Cabeza del hueso', 'La parte redonda que más disfrutan roer.'],
        [28, 56, 'Carne y tejido deshidratados', 'Quedan pegados al hueso: ahí está el sabor que los atrae.'],
        [53, 50, 'Hueso firme', 'Resistente, para morder un buen rato. Siempre bajo supervisión.'],
      ],
    },
    checks => ['Para mordedores fuertes', 'Sin conservantes', '100 % natural', 'Hecho en Colombia'],
    beneficios_titulo => 'Un reto para los que muerden fuerte.',
    beneficios_bajada => 'Hueso de cerdo deshidratado despacio, con su sabor natural.',
    beneficios => [
      ['calma', 'Horas de entretenimiento', 'Masticar los calma y ayuda a que no muerdan lo que no deben.'],
      ['dientes', 'Ayuda a mantener los dientes', 'La masticación ayuda a reducir placa y sarro.'],
      ['hueso', 'Hueso natural', 'Sin harinas, sin rellenos, sin colorantes.'],
      ['aditivos', 'Sin aditivos', 'Sin conservantes y sin sal añadida.'],
      ['duracion', 'Le dura', 'Ideal para perros con mucha energía.'],
    ],
    para_quien => ['Perros medianos y grandes', 'Adultos', 'Mordedores intensos'],
    uso => ['Para morder', 'Para los días en casa', 'Enriquecimiento'],
    como_darlo => [
      ['Siempre bajo supervisión.', ' No lo dejes solo con el hueso.'],
      ['Retíralo cuando quede pequeño', ' o con puntas, para que no lo trague entero.'],
      ['Agua fresca a la mano', ' y guárdalo en un lugar fresco y seco.'],
    ],
    preguntas => [
      ['¿Le sirve a un perro pequeño?', 'Es mejor para perros medianos y grandes. Para los pequeños recomendamos las patas de pollo o las codornices.'],
    ],
  },
  {
    id => 'femur-res', ruta => 'femur-de-res', nombre => 'Fémur de res deshidratado', corto => 'Fémur de res',
    antetitulo => 'Res · un solo ingrediente',
    descripcion => 'Fémur de res deshidratado lentamente. Grande y resistente, para los perros que necesitan morder en serio.',
    meta => 'Fémur de res deshidratado para perros: hueso grande y resistente, sin conservantes. Pagas al recibir.',
    foto => 'femur-res-producto', empaque => 'femur-res-empaque',
    alt_foto => 'Fémur de res deshidratado Revoltosos', alt_empaque => 'Fémur de res Revoltosos empacado con su etiqueta',
    anatomia => {
      foto => 'femur-res-producto', alt => 'Fémur de res deshidratado Revoltosos sobre fondo blanco',
      bajada => 'Así luce un fémur de res Revoltosos de cerca. Lo que ves es todo lo que tiene.',
      puntos => [
        [12, 40, 'Cabeza del hueso', 'La parte redonda que más disfrutan roer.'],
        [45, 50, 'Hueso grande y firme', 'Para los que muerden en serio. Siempre bajo supervisión.'],
        [83, 53, 'Tejido deshidratado', 'El sabor natural de la res, sin nada agregado.'],
      ],
    },
    checks => ['Grande y resistente', 'Sin conservantes', '100 % natural', 'Hecho en Colombia'],
    beneficios_titulo => 'Grande, resistente y natural.',
    beneficios_bajada => 'Hueso de res deshidratado despacio, para los que muerden en serio.',
    beneficios => [
      ['calma', 'Horas de entretenimiento', 'Masticar los calma y ayuda a que no muerdan lo que no deben.'],
      ['dientes', 'Ayuda a mantener los dientes', 'La masticación ayuda a reducir placa y sarro.'],
      ['hueso', 'Hueso natural', 'Sin harinas, sin rellenos, sin colorantes.'],
      ['aditivos', 'Sin aditivos', 'Sin conservantes y sin sal añadida.'],
      ['duracion', 'Le dura', 'Grande y firme: ideal para perros grandes.'],
    ],
    para_quien => ['Perros grandes', 'Perros medianos con mordida fuerte', 'Adultos'],
    uso => ['Para morder', 'Para los días en casa', 'Enriquecimiento'],
    como_darlo => [
      ['Siempre bajo supervisión.', ' No lo dejes solo con el hueso.'],
      ['Retíralo cuando quede pequeño', ' o con puntas, para que no lo trague entero.'],
      ['Agua fresca a la mano', ' y guárdalo en un lugar fresco y seco.'],
    ],
    preguntas => [
      ['¿Cuál es la diferencia con el fémur de cerdo?', 'El de res es más grande y firme: va mejor con perros grandes o que muerden muy fuerte.'],
    ],
  },
  {
    id => 'humero-cerdo', ruta => 'humero-de-cerdo', nombre => 'Húmero de cerdo deshidratado', corto => 'Húmero de cerdo',
    antetitulo => 'Cerdo · un solo ingrediente',
    descripcion => 'Húmero de cerdo deshidratado lentamente. Un hueso natural para morder, con su sabor de siempre y nada agregado.',
    meta => 'Húmero de cerdo deshidratado para perros: hueso natural para morder, sin conservantes. Pagas al recibir.',
    foto => 'humero-cerdo-producto', empaque => 'humero-cerdo-empaque',
    alt_foto => 'Húmero de cerdo deshidratado Revoltosos', alt_empaque => 'Húmero de cerdo Revoltosos empacado con su etiqueta',
    checks => ['Para morder', 'Sin conservantes', '100 % natural', 'Hecho en Colombia'],
    beneficios_titulo => 'Un hueso natural para morder.',
    beneficios_bajada => 'Húmero de cerdo deshidratado despacio, sin nada agregado.',
    beneficios => [
      ['calma', 'Lo mantiene ocupado', 'Masticar los calma y los entretiene.'],
      ['dientes', 'Ayuda a mantener los dientes', 'La masticación ayuda a reducir placa y sarro.'],
      ['hueso', 'Hueso natural', 'Sin harinas, sin rellenos, sin colorantes.'],
      ['aditivos', 'Sin aditivos', 'Sin conservantes y sin sal añadida.'],
    ],
    para_quien => ['Perros medianos y grandes', 'Adultos', 'Perros que disfrutan masticar'],
    uso => ['Para morder', 'Premio especial', 'Enriquecimiento'],
    como_darlo => [
      ['Siempre bajo supervisión.', ' No lo dejes solo con el hueso.'],
      ['Retíralo cuando quede pequeño', ' o con puntas, para que no lo trague entero.'],
      ['Agua fresca a la mano', ' y guárdalo en un lugar fresco y seco.'],
    ],
    preguntas => [
      ['¿Le sirve a un perro pequeño?', 'Es mejor para perros medianos y grandes. Para los pequeños recomendamos las patas de pollo o las codornices.'],
    ],
  },
  {
    id => 'humero-res', ruta => 'humero-de-res', nombre => 'Húmero de res deshidratado', corto => 'Húmero de res',
    antetitulo => 'Res · un solo ingrediente',
    descripcion => 'Húmero de res deshidratado lentamente. Un hueso grande y firme para los perros que muerden con ganas.',
    meta => 'Húmero de res deshidratado para perros: hueso grande y firme, sin conservantes. Pagas al recibir.',
    foto => 'humero-res-empaque-fondo-blanco', empaque => 'humero-res-empaque',
    alt_foto => 'Húmero de res Revoltosos empacado', alt_empaque => 'Húmero de res Revoltosos sobre una mesa de madera',
    checks => ['Grande y firme', 'Sin conservantes', '100 % natural', 'Hecho en Colombia'],
    beneficios_titulo => 'Grande, firme y natural.',
    beneficios_bajada => 'Hueso de res deshidratado despacio, para morder con ganas.',
    beneficios => [
      ['calma', 'Horas de entretenimiento', 'Masticar los calma y ayuda a que no muerdan lo que no deben.'],
      ['dientes', 'Ayuda a mantener los dientes', 'La masticación ayuda a reducir placa y sarro.'],
      ['hueso', 'Hueso natural', 'Sin harinas, sin rellenos, sin colorantes.'],
      ['aditivos', 'Sin aditivos', 'Sin conservantes y sin sal añadida.'],
    ],
    para_quien => ['Perros grandes', 'Perros medianos con mordida fuerte', 'Adultos'],
    uso => ['Para morder', 'Para los días en casa', 'Enriquecimiento'],
    como_darlo => [
      ['Siempre bajo supervisión.', ' No lo dejes solo con el hueso.'],
      ['Retíralo cuando quede pequeño', ' o con puntas, para que no lo trague entero.'],
      ['Agua fresca a la mano', ' y guárdalo en un lugar fresco y seco.'],
    ],
    preguntas => [
      ['¿Cuál es la diferencia con el fémur de res?', 'Los dos son huesos grandes de res. Elige según el tamaño de tu perro y lo que más le guste morder.'],
    ],
  },
  {
    id => 'paleta-cerdo', ruta => 'paleta-de-cerdo', nombre => 'Paleta de cerdo deshidratada', corto => 'Paleta de cerdo',
    antetitulo => 'Cerdo · un solo ingrediente',
    descripcion => 'Paleta de cerdo (el hueso del omoplato), plana y ancha, deshidratada lentamente. Fácil de sostener entre las patas y morder.',
    meta => 'Paleta de cerdo deshidratada para perros: hueso plano, fácil de sostener y morder, sin conservantes. Pagas al recibir.',
    foto => 'paleta-cerdo-producto', empaque => 'paleta-cerdo-empaque',
    alt_foto => 'Paleta de cerdo deshidratada Revoltosos', alt_empaque => 'Paleta de cerdo Revoltosos empacada con su etiqueta',
    checks => ['Plana y fácil de sostener', 'Sin conservantes', '100 % natural', 'Hecho en Colombia'],
    beneficios_titulo => 'Plana, ancha y fácil de morder.',
    beneficios_bajada => 'Hueso de paleta de cerdo, deshidratado despacio y sin nada agregado.',
    beneficios => [
      ['textura', 'Fácil de sostener', 'Su forma plana le permite sujetarla con las patas.'],
      ['calma', 'Lo mantiene ocupado', 'Masticar los calma y los entretiene.'],
      ['dientes', 'Ayuda a mantener los dientes', 'La masticación ayuda a reducir placa y sarro.'],
      ['aditivos', 'Sin aditivos', 'Sin conservantes y sin sal añadida.'],
    ],
    para_quien => ['Perros medianos y grandes', 'Adultos', 'Perros que disfrutan masticar'],
    uso => ['Para morder', 'Premio especial', 'Enriquecimiento'],
    como_darlo => [
      ['Siempre bajo supervisión.', ' No lo dejes solo con el hueso.'],
      ['Retírala cuando quede pequeña', ' o con puntas, para que no la trague entera.'],
      ['Agua fresca a la mano', ' y guárdala en un lugar fresco y seco.'],
    ],
    preguntas => [
      ['¿Qué es la paleta?', 'Es el hueso del omoplato del cerdo: plano y ancho, más fácil de sostener que un fémur.'],
    ],
  },
  {
    id => 'codorniz-entera', ruta => 'codorniz-entera', nombre => 'Codorniz entera deshidratada', corto => 'Codorniz entera',
    antetitulo => 'Codorniz · un solo ingrediente',
    descripcion => 'Dos codornices enteras, deshidratadas lentamente: carne, piel y hueso en un solo snack. Sin conservantes, sin sal, sin colorantes.',
    meta => 'Codorniz entera deshidratada para perros y gatos: carne, piel y hueso, un solo ingrediente. Pagas al recibir.',
    foto => 'codorniz-entera-x2-producto', empaque => 'codorniz-entera-empaque',
    alt_foto => 'Dos codornices enteras deshidratadas Revoltosos', alt_empaque => 'Bolsa de codorniz entera Revoltosos',
    checks => ['Carne, piel y hueso', 'Sin conservantes', 'Para perros y gatos', 'Hecho en Colombia'],
    beneficios_titulo => 'La codorniz completa.',
    beneficios_bajada => 'Carne, piel y hueso, deshidratados despacio para que conserven lo bueno.',
    beneficios => [
      ['proteina', 'Proteína de verdad', 'Un solo ingrediente: codorniz entera. Carne magra con mucha proteína.'],
      ['novedosa', 'Proteína novedosa', 'Una buena opción si tu mascota no se lleva bien con el pollo o la res.'],
      ['hueso', 'Calcio y fósforo naturales', 'Como incluye el hueso, aporta minerales como calcio, fósforo y zinc.'],
      ['dientes', 'Ayuda a mantener los dientes', 'Masticarla ayuda a reducir placa y sarro.'],
      ['aditivos', 'Sin aditivos', 'Sin conservantes, sin sal añadida, sin colorantes.'],
    ],
    para_quien => ['Perros de todas las razas', 'Razas pequeñas · en trozos', 'Gatos · en trozos pequeños'],
    uso => ['Premio especial', 'Topper triturado sobre la comida', 'Enriquecimiento'],
    como_darlo => [
      ['Ofrécela como premio,', ' entera o en trozos según el tamaño de tu mascota.'],
      ['Siempre bajo supervisión', ' y con agua fresca a la mano.'],
      ['Guárdala bien cerrada', ' en un lugar fresco y seco.'],
    ],
    preguntas => [
      ['¿En qué se diferencia de las codornices del frasco?', 'Es la misma codorniz, pero viene en bolsa y en pareja: dos codornices enteras.'],
      ['¿Le sirve a mi gato?', 'Sí. Ofrécela en trozos pequeños, siempre bajo supervisión.'],
    ],
  },

  # --- Combos (qué traen y su precio están en el gestor; aquí van textos y fotos) ---
  {
    id => 'combo-res-codornicitas', ruta => 'combo-res-codornicitas', nombre => 'Combo Res + Codornicitas', corto => 'el Combo Res + Codornicitas',
    antetitulo => 'Combo · 3 snacks',
    descripcion => '1 fémur de res, 1 húmero de res y 1 bolsa de codornicitas de 50 g. Huesos grandes para morder y codornicitas para premiar, en un solo pedido.',
    meta => 'Combo de snacks naturales para perros: fémur de res, húmero de res y codornicitas de 50 g. Pagas al recibir.',
    foto => 'combo-res-codornicitas-foto', ancho => 1000, empaque => 'femur-res-empaque',
    alt_foto => 'Fémur de res, húmero de res y codornicitas Revoltosos',
    miniaturas => [
      ['combo-res-codornicitas-foto', 'Fémur de res, húmero de res y bolsa de codornicitas Revoltosos'],
      ['femur-res-empaque', 'Fémur de res Revoltosos empacado'],
      ['humero-res-empaque', 'Húmero de res Revoltosos empacado'],
      ['codornices-bolsa-50g', 'Bolsa de codornicitas Revoltosos de 50 g'],
    ],
    trae => [
      ['femur-res-producto', '×1', 'Fémur de res', 'Grande y resistente, para mordedores intensos.', 'femur-de-res'],
      ['humero-res-empaque-fondo-blanco', '×1', 'Húmero de res', 'Grande y firme, para morder con ganas.', 'humero-de-res'],
      ['codornices-bolsa-50g', '50 g', 'Codornicitas', 'Codorniz deshidratada para premiar todos los días.', 'codornices'],
    ],
    trae_bajada => 'Dos huesos grandes para morder y codornicitas para premiar. Todo llega junto.',
    llega => [
      ['femur-res-empaque', 'Fémur de res Revoltosos empacado con su etiqueta', 'Fémur de res', 1],
      ['humero-res-empaque', 'Húmero de res Revoltosos empacado con su etiqueta', 'Húmero de res', 1],
      ['codornices-bolsa-50g', 'Bolsa de codornicitas Revoltosos de 50 g', 'Codornicitas', 0],
    ],
    anatomia => {
      foto => 'femur-res-producto', alt => 'Fémur de res deshidratado Revoltosos sobre fondo blanco',
      bajada => 'El fémur de res del combo, de cerca. Lo que ves es todo lo que tiene.',
      puntos => [
        [12, 40, 'Cabeza del hueso', 'La parte redonda que más disfrutan roer.'],
        [45, 50, 'Hueso grande y firme', 'Para los que muerden en serio. Siempre bajo supervisión.'],
        [83, 53, 'Tejido deshidratado', 'El sabor natural de la res, sin nada agregado.'],
      ],
    },
    checks => ['3 snacks en un pedido', 'Sin conservantes', 'Para morder y para premiar', 'Hecho en Colombia'],
    beneficios_titulo => 'Para morder y para premiar.',
    beneficios_bajada => 'Dos huesos de res para los ratos largos y codornicitas para el premio de todos los días.',
    beneficios => [
      ['calma', 'Horas de entretenimiento', 'Los huesos los mantienen ocupados y ayudan a que no muerdan lo que no deben.'],
      ['proteina', 'Premios de verdad', 'Las codornicitas son codorniz entera: un solo ingrediente.'],
      ['dientes', 'Ayuda a mantener los dientes', 'La masticación ayuda a reducir placa y sarro.'],
      ['aditivos', 'Sin aditivos', 'Sin conservantes, sin sal añadida, sin colorantes.'],
      ['paquete', 'Todo en un pedido', 'Tres snacks distintos que llegan juntos a tu casa.'],
    ],
    para_quien => ['Perros grandes', 'Perros medianos con mordida fuerte', 'Adultos'],
    uso => ['Huesos para morder', 'Codornicitas como premio', 'Para regalar'],
    como_darlo => [
      ['Los huesos, siempre bajo supervisión.', ' Retíralos cuando queden pequeños o con puntas.'],
      ['Las codornicitas, como premio:', ' de 1 a 3 al día según el tamaño de tu perro.'],
      ['Agua fresca a la mano', ' y todo guardado en un lugar fresco y seco.'],
    ],
    preguntas => [
      ['¿Le sirve a un perro pequeño?', 'Los huesos de res son grandes: van mejor con perros medianos y grandes. Para los pequeños mira el Combo Codornicitas + Patas.'],
    ],
  },
  {
    id => 'combo-cerdo', ruta => 'combo-cerdo', nombre => 'Combo Cerdo', corto => 'el Combo Cerdo',
    antetitulo => 'Combo · 4 snacks de cerdo',
    descripcion => '1 oreja, 1 fémur, 1 húmero y 1 paleta de cerdo. Cuatro texturas distintas para morder y masticar, en un solo pedido.',
    meta => 'Combo Cerdo para perros: oreja, fémur, húmero y paleta de cerdo deshidratados, sin conservantes. Pagas al recibir.',
    foto => 'combo-cerdo-foto', ancho => 1000, empaque => 'oreja-cerdo-empaque',
    alt_foto => 'Oreja, fémur, húmero y paleta de cerdo Revoltosos',
    miniaturas => [
      ['combo-cerdo-foto', 'Oreja, fémur, húmero y paleta de cerdo Revoltosos empacados'],
      ['oreja-cerdo-empaque', 'Oreja de cerdo Revoltosos empacada'],
      ['femur-cerdo-empaque', 'Fémur de cerdo Revoltosos empacado'],
      ['humero-cerdo-empaque', 'Húmero de cerdo Revoltosos empacado'],
      ['paleta-cerdo-empaque', 'Paleta de cerdo Revoltosos empacada'],
    ],
    trae => [
      ['oreja-cerdo-producto', '×1', 'Oreja de cerdo', 'Para masticar un buen rato.', 'oreja-de-cerdo'],
      ['femur-cerdo-producto', '×1', 'Fémur de cerdo', 'Un reto para los que muerden fuerte.', 'femur-de-cerdo'],
      ['humero-cerdo-producto', '×1', 'Húmero de cerdo', 'Hueso natural para morder.', 'humero-de-cerdo'],
      ['paleta-cerdo-producto', '×1', 'Paleta de cerdo', 'Plana y fácil de sostener.', 'paleta-de-cerdo'],
    ],
    trae_bajada => 'Cuatro snacks de cerdo con texturas distintas, para que cada día tenga algo nuevo.',
    llega => [
      ['oreja-cerdo-empaque', 'Oreja de cerdo Revoltosos empacada con su etiqueta', 'Oreja', 1],
      ['femur-cerdo-empaque', 'Fémur de cerdo Revoltosos empacado con su etiqueta', 'Fémur', 1],
      ['humero-cerdo-empaque', 'Húmero de cerdo Revoltosos empacado con su etiqueta', 'Húmero', 1],
      ['paleta-cerdo-empaque', 'Paleta de cerdo Revoltosos empacada con su etiqueta', 'Paleta', 1],
    ],
    anatomia => {
      foto => 'femur-cerdo-producto', alt => 'Fémur de cerdo deshidratado Revoltosos, con restos de carne pegados al hueso',
      bajada => 'El fémur de cerdo del combo, de cerca. Lo que ves es todo lo que tiene.',
      puntos => [
        [11, 37, 'Cabeza del hueso', 'La parte redonda que más disfrutan roer.'],
        [28, 56, 'Carne y tejido deshidratados', 'Quedan pegados al hueso: ahí está el sabor que los atrae.'],
        [53, 50, 'Hueso firme', 'Resistente, para morder un buen rato. Siempre bajo supervisión.'],
      ],
    },
    checks => ['4 snacks en un pedido', 'Sin conservantes', '4 texturas distintas', 'Hecho en Colombia'],
    beneficios_titulo => 'Cuatro texturas, un solo pedido.',
    beneficios_bajada => 'Oreja para masticar, fémur y húmero para morder y paleta para sostener entre las patas.',
    beneficios => [
      ['textura', 'Variedad que se muerde', 'Cada snack tiene su textura: cada día algo diferente.'],
      ['calma', 'Horas de entretenimiento', 'Masticar los calma y ayuda a que no muerdan lo que no deben.'],
      ['dientes', 'Ayuda a mantener los dientes', 'La masticación ayuda a reducir placa y sarro.'],
      ['aditivos', 'Sin aditivos', 'Sin conservantes, sin sal añadida, sin colorantes.'],
      ['paquete', 'Todo en un pedido', 'Cuatro snacks que llegan juntos a tu casa.'],
    ],
    para_quien => ['Perros medianos y grandes', 'Adultos', 'Perros que disfrutan masticar'],
    uso => ['Para morder', 'Para los días en casa', 'Para regalar'],
    como_darlo => [
      ['Un snack a la vez,', ' siempre bajo supervisión.'],
      ['Retira los huesos cuando queden pequeños', ' o con puntas, para que no los traguen enteros.'],
      ['Agua fresca a la mano', ' y todo guardado en un lugar fresco y seco.'],
    ],
    preguntas => [
      ['¿Le sirve a un perro pequeño?', 'Es mejor para perros medianos y grandes. Para los pequeños mira el Combo Codornicitas + Patas.'],
    ],
  },
  {
    id => 'combo-codornicitas-patas', ruta => 'combo-codornicitas-patas', nombre => 'Combo Codornicitas + Patas', corto => 'el Combo Codornicitas + Patas',
    antetitulo => 'Combo · premios para todos los días',
    descripcion => '1 bolsa de codornicitas de 50 g y 1 paquete de 30 patas de pollo. Premios crocantes y fáciles de masticar, ideales también para perros pequeños.',
    meta => 'Combo para perros: codornicitas de 50 g y 30 patas de pollo deshidratadas, sin conservantes. Pagas al recibir.',
    foto => 'combo-codornicitas-patas-foto', ancho => 1000, empaque => 'patas-pollo-empaque',
    alt_foto => 'Codornicitas y patas de pollo deshidratadas Revoltosos',
    miniaturas => [
      ['combo-codornicitas-patas-foto', 'Bolsa de codornicitas y tarro de 30 patas de pollo Revoltosos'],
      ['codornices-bolsa-50g', 'Bolsa de codornicitas Revoltosos de 50 g'],
      ['patas-pollo-empaque', 'Tarro de patas de pollo Revoltosos'],
    ],
    trae => [
      ['codornices-bolsa-50g', '50 g', 'Codornicitas', 'Codorniz deshidratada para premiar.', 'codornices'],
      ['patas-pollo-producto', '×30', 'Patas de pollo', 'Crocantes y fáciles de masticar.', 'patas-de-pollo'],
    ],
    trae_bajada => 'Dos premios que les encantan, para tener a la mano todo el mes.',
    llega => [
      ['patas-pollo-empaque', 'Tarro de patas de pollo Revoltosos', 'Patas de pollo', 1],
      ['codornices-bolsa-50g', 'Bolsa de codornicitas Revoltosos de 50 g', 'Codornicitas', 0],
      ['patas-pollo-producto', 'Patas de pollo deshidratadas Revoltosos', 'Así son las patas', 0],
    ],
    checks => ['Premios para todo el mes', 'Sin conservantes', 'Ideal para razas pequeñas', 'Hecho en Colombia'],
    beneficios_titulo => 'Premios para todos los días.',
    beneficios_bajada => 'Codornicitas y patas de pollo: crocantes, fáciles de masticar y con un solo ingrediente cada una.',
    beneficios => [
      ['proteina', 'Un solo ingrediente', 'Codorniz es codorniz y pata es pata. Nada más.'],
      ['textura', 'Fáciles de masticar', 'Crocantes, ideales también para perros pequeños.'],
      ['dientes', 'Ayudan a mantener los dientes', 'La masticación ayuda a reducir placa y sarro.'],
      ['aditivos', 'Sin aditivos', 'Sin conservantes, sin sal añadida, sin colorantes.'],
      ['paquete', 'Rinde todo el mes', '30 patas y una bolsa de codornicitas en un solo pedido.'],
    ],
    para_quien => ['Perros de todas las razas', 'Ideal para razas pequeñas', 'Entrenamiento'],
    uso => ['Premio diario', 'Entrenamiento', 'Para morder un rato'],
    como_darlo => [
      ['Ofrécelos como premio,', ' sin reemplazar su comida. Empieza con poco y mira cómo le caen.'],
      ['Siempre bajo supervisión', ' y con agua fresca a la mano.'],
      ['Guárdalos bien cerrados', ' en un lugar fresco y seco.'],
    ],
    preguntas => [
      ['¿Le sirve a un perro pequeño?', 'Sí. Las codornicitas y las patas son de los snacks más fáciles de masticar.'],
    ],
  },
);

# --- Íconos de beneficios (mismos trazos de la landing de codornices) ---------------
my %ICONO = (
  proteina => '<path d="M15.5 3.5a5 5 0 0 1 0 7.1l-2.8 2.8-4.1-4.1 2.8-2.8a5 5 0 0 1 4.1-3z"/><path d="M8.6 9.3L5 12.9a1.6 1.6 0 1 0 2.3 2.3 1.6 1.6 0 1 0 2.3 2.3l3.6-3.6"/>',
  novedosa => '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M18 6l-2.5 2.5M8.5 15.5L6 18"/>',
  hueso    => '<path d="M9 7l8 8"/><circle cx="6.5" cy="7.5" r="2.2"/><circle cx="8.5" cy="5" r="2.2"/><circle cx="15.5" cy="19" r="2.2"/><circle cx="18" cy="16.5" r="2.2"/>',
  dientes  => '<path d="M7 4c-2.5 0-3.5 2.5-3 5 .6 3 1.7 4 2 7 .3 2.5 1 4 2 4s1.5-2 2-4.5c.3-1.5 1-1.5 2 0s1.5 4.5 2 4.5c1 0 1.7-1.5 2-4 .3-3 1.4-4 2-7 .5-2.5-.5-5-3-5-2 0-3 1-5 1s-3-1-5-1z"/>',
  calma    => '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
  aditivos => '<circle cx="12" cy="12" r="8.5"/><path d="M6 6l12 12"/>',
  duracion => '<rect x="6" y="7" width="12" height="13" rx="2.5"/><path d="M8 4h8v3H8z"/>',
  textura  => '<path d="M4 14c2-6 14-6 16 0"/><path d="M7 14v3M12 13v4M17 14v3"/>',
  paquete  => '<path d="M3 7l9-4 9 4v10l-9 4-9-4zM3 7l9 4 9-4M12 11v10"/>',
);

# --- Utilidades ------------------------------------------------------------------
sub esc { my $s = shift // ''; $s =~ s/&/&amp;/g; $s =~ s/</&lt;/g; $s =~ s/>/&gt;/g; $s =~ s/"/&quot;/g; return $s; }
sub leer { my $f = shift; open my $h, '<:encoding(UTF-8)', $f or die "No pude leer $f: $!"; local $/; my $t = <$h>; close $h; return $t; }

# Bloques comunes tomados de la landing de codornices (pantalla de carga e íconos).
my $base = leer("$raiz/codornices/index.html");
my ($carga) = $base =~ /(<!-- Pantalla de carga -->.*?\n<\/div>\n)/s or die 'No encontré la pantalla de carga en codornices/index.html';
my ($iconos) = $base =~ /(<!-- Íconos reutilizables -->.*?<\/svg>\n)/s or die 'No encontré los íconos en codornices/index.html';

for my $p (@productos) {
  my $f600 = "$IMG/$p->{foto}-600.jpg";
  my $fgrande = "$IMG/$p->{foto}.jpg";
  my $e600 = "$IMG/" . ($p->{empaque} // "") . "-600.jpg";
  my $egrande = "$IMG/" . ($p->{empaque} // "") . ".jpg";
  my $url = "https://revoltosos.netlify.app/$p->{ruta}/";
  my $wa = 'https://wa.me/573122448276?text=' . join('%20', split / /, "Hola Revoltosos, tengo una pregunta sobre $p->{corto}");
  $wa =~ s/,/%2C/g;
  my $check = sub { '<li><svg width="18" height="18" aria-hidden="true"><use href="#i-check"/></svg>' . esc(shift) . '</li>' };
  my $beneficios = join "\n        ", map {
    '<div class="beneficio"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
    . $ICONO{$_->[0]} . '</svg><div><h3>' . esc($_->[1]) . '</h3><p>' . esc($_->[2]) . '</p></div></div>'
  } @{ $p->{beneficios} };
  my $chips = join "\n          ", map { '<li>' . esc($_) . '</li>' } @{ $p->{para_quien} };
  my $usos = join "\n          ", map { '<li>' . esc($_) . '</li>' } @{ $p->{uso} };
  my $n = 0;
  my $pasos = join "\n          ", map { $n++; '<li><span class="num">' . $n . '</span><p><strong>' . esc($_->[0]) . '</strong>' . esc($_->[1]) . '</p></li>' } @{ $p->{como_darlo} };
  my $faq = join "\n      ", map { '<details><summary>' . esc($_->[0]) . '<svg width="20" height="20" aria-hidden="true"><use href="#i-mas"/></svg></summary><p>' . esc($_->[1]) . '</p></details>' } @{ $p->{preguntas} };
  my $checks = join "\n          ", map { $check->($_) } @{ $p->{checks} };

  # Miniaturas de la galería: [archivo base, alt, (opcional) id del tamaño que muestra]
  my @minis = $p->{miniaturas} ? @{ $p->{miniaturas} } : ([$p->{foto}, $p->{alt_foto}], [$p->{empaque}, $p->{alt_empaque} . ' (así llega empacado)']);
  my $i = 0;
  my $miniaturas = join "\n          ", map {
    $i++;
    '<button type="button" aria-pressed="' . ($i == 1 ? 'true' : 'false') . '"' . ($_->[2] ? ' data-variante="' . $_->[2] . '"' : '')
    . ' data-src="' . "$IMG/$_->[0].jpg" . '" data-alt="' . esc($_->[1]) . '" aria-label="Ver foto ' . $i . '"><img src="' . "$IMG/$_->[0]-600.jpg" . '" alt="" width="64" height="64"' . ($i > 1 ? ' loading="lazy"' : '') . '></button>'
  } @minis;

  # "Así llega a tu casa": [archivo base, alt, texto, vertical (1) o cuadrada (0)]
  my @llega = $p->{llega} ? @{ $p->{llega} } : ([$p->{empaque}, $p->{alt_empaque}, 'Empacado', 1], [$p->{foto}, $p->{alt_foto}, 'Así es por dentro', 0]);
  push @llega, ['cajita-escena', 'Caja Revoltosos abierta con snacks deshidratados sobre una mesa de madera', 'Combínalo con otros snacks', 1, 'sin600'] unless $p->{llega};
  my $llega = join "\n        ", map {
    my ($base, $alt, $txt, $vertical, $sin600) = @$_;
    my $src = $sin600 ? "$IMG/$base.jpg" : "$IMG/$base-600.jpg";
    '<figure><img src="' . $src . '" width="600" height="' . ($vertical ? 800 : 600) . '" loading="lazy" alt="' . esc($alt) . '"' . ($vertical ? '' : ' style="background: #FFFFFF; object-fit: contain"') . '><figcaption>' . esc($txt) . '</figcaption></figure>'
  } @llega;

  # Combos: qué trae. [archivo base -600, cantidad, nombre, texto, ruta de su landing]
  my $trae = '';
  if ($p->{trae}) {
    my $items = join "\n        ", map {
      '<article class="caja-item"><a href="/' . $_->[4] . '/" style="display: block"><img src="' . "$IMG/$_->[0]-600.jpg" . '" width="600" height="600" loading="lazy" alt="' . esc($_->[2]) . '"></a>'
      . '<div><span class="caja-cantidad">' . esc($_->[1]) . '</span><strong>' . esc($_->[2]) . '</strong><span>' . esc($_->[3]) . '</span></div></article>'
    } @{ $p->{trae} };
    $trae = <<"TRAE";
  <!-- Qué trae el combo -->
  <section class="seccion" aria-labelledby="t-trae">
    <div class="contenedor">
      <h2 class="titulo" id="t-trae">Qué trae el combo</h2>
      <p class="bajada" style="margin-top: 8px">@{[esc($p->{trae_bajada} // 'Todo llega junto, en el mismo envío.')]}</p>
      <div class="caja-grid">
        $items
      </div>
      <a href="#comprar" class="btn btn--ancho" style="margin-top: 24px">Pedir el combo · Pagas al recibir</a>
    </div>
  </section>

TRAE
  }

  # Anatomía del snack: foto con puntos numerados. puntos: [x %, y %, título, texto]
  my $anatomia = '';
  if (my $a = $p->{anatomia}) {
    my $k = 0;
    my $puntos = join "\n        ", map { $k++; '<span class="punto" style="left: ' . $_->[0] . '%; top: ' . $_->[1] . '%" aria-hidden="true">' . $k . '</span>' } @{ $a->{puntos} };
    $k = 0;
    my $lista = join "\n          ", map { $k++; '<li><span class="num">' . $k . '</span><div><strong>' . esc($_->[2]) . '</strong><span>' . esc($_->[3]) . '</span></div></li>' } @{ $a->{puntos} };
    $anatomia = <<"ANAT";
  <!-- Anatomía del snack -->
  <section class="seccion" aria-labelledby="t-anatomia">
    <div class="contenedor anatomia-grid">
      <div class="anatomia-foto" style="background: #FFFFFF">
        <img src="$IMG/$a->{foto}.jpg" width="1000" height="1000" loading="lazy" alt="@{[esc($a->{alt})]}">
        $puntos
      </div>
      <div>
        <h2 class="titulo" id="t-anatomia">Anatomía del snack</h2>
        <p class="bajada" style="margin: 8px 0 22px">@{[esc($a->{bajada})]}</p>
        <ol class="lista-num">
          $lista
        </ol>
        <a href="#comprar" class="btn btn--ancho" style="margin-top: 22px">Pedir ahora · Pagas al recibir</a>
      </div>
    </div>
  </section>

ANAT
  }
  my $ancho = $p->{ancho} // 1254;

  my $html = <<"HTML";
<!doctype html>
<html lang="es-CO">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>@{[esc($p->{nombre})]} para perros · Revoltosos</title>
<meta name="description" content="@{[esc($p->{meta})]}">
<meta name="theme-color" content="#C2185B">
<link rel="icon" href="/assets/img/logo.jpg">
<link rel="apple-touch-icon" href="/assets/img/logo.jpg">
<link rel="canonical" href="$url">

<meta property="og:type" content="product">
<meta property="og:locale" content="es_CO">
<meta property="og:site_name" content="Revoltosos">
<meta property="og:url" content="$url">
<meta property="og:title" content="@{[esc($p->{nombre})]} · Revoltosos">
<meta property="og:description" content="@{[esc($p->{meta})]}">
<meta property="og:image" content="https://revoltosos.netlify.app$fgrande">
<meta name="twitter:card" content="summary_large_image">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Young+Serif&family=Figtree:wght\@400;500;600;700;800&display=swap">
<link rel="preload" as="image" href="$f600">
<link rel="stylesheet" href="/assets/css/landing.css?v=6">
<link rel="stylesheet" href="/assets/css/tienda.css?v=6">

<!-- Generada con herramientas/landings/generar.pl: los cambios van allá, no aquí. -->
<script>
  window.PAGINA = { tipo: 'producto', productoId: '$p->{id}', resenas: 'Otro snack' };
  try { if (sessionStorage.getItem('rv-visto')) document.documentElement.classList.add('sin-carga'); } catch (e) {}
</script>
<noscript><style>#cargando{display:none}</style></noscript>
</head>
<body>

$carga
$iconos
<div class="anuncio">Envío <b>GRATIS</b> desde <span data-envio-gratis-desde>\$70.000</span> · Pagas al recibir en casa</div>

<header class="cab">
  <div class="cab-fila">
    <a class="cab-logo" href="/" aria-label="Revoltosos, ir a la tienda"><img src="/assets/img/logo.jpg" width="150" height="150" alt=""><span>Revoltosos</span></a>
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
    <a href="#beneficios">Beneficios</a>
    <a href="#preguntas">Preguntas</a>
  </nav>
  <div class="envio-barra" data-envio-barra></div>
</header>

<main>
  <!-- 1. Compra -->
  <section class="blanco" id="comprar" data-oculta-barra style="padding: 12px 0 36px">
    <div class="contenedor compra">
      <div class="galeria-p">
        <div class="principal">
          <img src="$f600" srcset="$f600 600w, $fgrande ${ancho}w" sizes="(min-width: 860px) 520px, 90vw" width="600" height="600" fetchpriority="high" alt="@{[esc($p->{alt_foto})]}">
          <div class="sello-gira" aria-hidden="true">
            <svg class="anillo" width="92" height="92" viewBox="0 0 150 150"><defs><path id="rv-circulo" d="M75 75m-58 0a58 58 0 1 1 116 0a58 58 0 1 1-116 0"/></defs><circle cx="75" cy="75" r="73" fill="#C2185B"/><text fill="#FFFFFF" font-family="Figtree, sans-serif" font-size="13" font-weight="800" letter-spacing="2.6"><textPath href="#rv-circulo">PAGAS AL RECIBIR • SIN TARJETA • EN TU CASA •</textPath></text></svg>
            <span><svg width="24" height="24"><use href="#i-casa"/></svg></span>
          </div>
        </div>
        <div class="miniaturas" role="group" aria-label="Fotos del producto">
          $miniaturas
        </div>
      </div>

      <div class="compra-info">
        <div>
          <p class="antetitulo">@{[esc($p->{antetitulo})]}</p>
          <h1>@{[esc($p->{nombre})]}</h1>
          <p class="desc">@{[esc($p->{descripcion})]}</p>
        </div>
        <p id="compra-no-disponible" class="form-error" hidden>Este producto no está disponible por ahora. <a href="/">Mira los demás snacks</a>.</p>
        <div class="precio-grande" id="compra-precio" data-solo-disponible></div>
        <div class="aviso-gratis"><svg width="26" height="26" aria-hidden="true"><use href="#i-camion"/></svg><span><strong>Envío GRATIS desde <span data-envio-gratis-desde>\$70.000</span></strong><span>Combina snacks y no pagas envío.</span></span></div>
        <fieldset class="opciones" id="compra-opciones-caja" data-solo-disponible>
          <legend>Elige el tamaño</legend>
          <div class="opciones-lista" id="compra-opciones"></div>
        </fieldset>
        <div class="prueba-social" data-prueba-social role="status" aria-live="polite" hidden></div>
        <div class="fila-agregar" data-solo-disponible>
          <div class="cantidad" role="group" aria-label="Cantidad">
            <button type="button" id="compra-menos" aria-label="Quitar uno">−</button>
            <output id="compra-cantidad" aria-live="polite">1</output>
            <button type="button" id="compra-mas" aria-label="Agregar uno">+</button>
          </div>
          <button type="button" class="btn rv-pulso" id="compra-agregar"><svg width="20" height="20" aria-hidden="true"><use href="#i-bolsa"/></svg>Agregar al carrito</button>
        </div>
        <button type="button" class="btn btn--oscuro btn-pedir-ya" id="compra-pedir" data-solo-disponible>
          <span><span>Hacer mi pedido ahora</span><span>Hoy pagas \$0 · pagas al recibir</span></span>
          <svg width="22" height="22" aria-hidden="true"><use href="#i-flecha"/></svg>
        </button>
        <p class="nota-pedir" data-solo-disponible>¿Quieres algo más? Agrégalo al carrito y sigue mirando.</p>
        <ul class="checks">
          $checks
        </ul>
      </div>
    </div>
  </section>

  <!-- 2. Combínalo y llega gratis -->
  <section style="padding: 32px 0 8px" aria-labelledby="t-combina" hidden>
    <div class="contenedor">
      <h2 class="titulo-sec" id="t-combina" style="font-size: 28px">Combínalo y llega gratis</h2>
      <p class="bajada" style="margin: 4px 0 14px; font-size: 15px">Desde <span data-envio-gratis-desde>\$70.000</span> el envío corre por nuestra cuenta.</p>
      <div class="combina" id="combina"></div>
    </div>
  </section>

$trae$anatomia  <!-- 3. Así llega a tu casa -->
  <section class="seccion" aria-labelledby="t-llega">
    <div class="contenedor">
      <h2 class="titulo" id="t-llega">Así llega a tu casa</h2>
      <p class="bajada" style="margin: 6px 0 20px">Bien sellado, con su etiqueta y listo para premiar.</p>
      <div class="pista pista--foto" id="pista-llega">
        $llega
      </div>
      <div class="sellos-llega">
        <span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>Bien sellado</span>
        <span><svg width="18" height="18" aria-hidden="true"><use href="#i-camion"/></svg>Gratis desde <span data-envio-gratis-desde>\$70.000</span></span>
        <span><svg width="18" height="18" aria-hidden="true"><use href="#i-billete"/></svg>Pagas al recibir</span>
      </div>

      <div class="disfrutan">
        <h3>Ya los disfrutan</h3>
        <p class="bajada" style="margin: 6px 0 18px">Los peludos de nuestros clientes con sus snacks Revoltosos.</p>
        <div class="pista pista--duenos" id="pista-duenos">
          <figure><img src="/assets/img/productos/cliente-golden-bolsa.jpg" width="600" height="800" loading="lazy" alt="Golden retriever con una bolsa de snacks Revoltosos en la boca"></figure>
          <figure><video data-src="/assets/video/cliente-1.mp4" aria-label="Perro de un cliente comiendo su snack Revoltosos"></video></figure>
          <figure><img src="/assets/img/productos/cliente-perro-blanco-bolsas.jpg" width="600" height="800" loading="lazy" alt="Perro blanco sonriendo junto a sus bolsas de snacks Revoltosos"></figure>
          <figure><img src="/assets/img/productos/cliente-bulldog-bolsas.jpg" width="450" height="800" loading="lazy" alt="Bulldog francés blanco junto a sus bolsas de snacks Revoltosos"></figure>
        </div>
      </div>
      <a href="#comprar" class="btn btn--ancho rv-pulso" style="margin-top: 24px">Pedir el mío · Pagas al recibir</a>
    </div>
  </section>

  <!-- 4. Beneficios -->
  <section class="seccion beneficios" id="beneficios" aria-labelledby="t-beneficios">
    <div class="contenedor">
      <h2 class="titulo" id="t-beneficios" style="font-size: clamp(32px, 4.4vw, 54px); max-width: 15em">@{[esc($p->{beneficios_titulo})]}</h2>
      <p class="bajada">@{[esc($p->{beneficios_bajada})]}</p>
      <div class="beneficios-grid">
        $beneficios
      </div>
      <div class="cta-fila">
        <a href="#comprar" class="btn">Lo quiero · Pagas al recibir</a>
      </div>
    </div>
  </section>

  <!-- 5. Para quién / Cómo darlo -->
  <section class="seccion">
    <div class="contenedor dos-col">
      <div>
        <h2 class="titulo" style="margin-bottom: 18px">¿Para quién es?</h2>
        <ul class="chips">
          $chips
        </ul>
        <h3 class="subtitulo">Úsalo como</h3>
        <ul class="chips chips--verde">
          $usos
        </ul>
      </div>
      <div>
        <h2 class="titulo" style="margin-bottom: 18px">Cómo darlo</h2>
        <ol class="pasos">
          $pasos
        </ol>
      </div>
    </div>
  </section>

  <!-- 6. Opiniones reales (Supabase, solo las Publicadas). Si no hay, no aparece. -->
  <section class="seccion" id="opiniones" aria-labelledby="t-opiniones" hidden style="background: var(--hueso-2)">
    <div class="contenedor">
      <h2 class="titulo" id="t-opiniones">Lo que dicen sus dueños</h2>
      <p class="bajada" style="margin: 6px 0 20px">Opiniones de clientes que ya compraron, con su permiso.</p>
      <div class="pista pista--resenas" id="pista-resenas"></div>
      <div class="carrusel-nav" data-para="pista-resenas" data-tarde hidden>
        <button type="button" class="carrusel-btn" aria-label="Opinión anterior"><svg width="20" height="20" aria-hidden="true"><use href="#i-ant"/></svg></button>
        <div class="carrusel-puntos" aria-hidden="true"></div>
        <button type="button" class="carrusel-btn" aria-label="Siguiente opinión"><svg width="20" height="20" aria-hidden="true"><use href="#i-sig"/></svg></button>
      </div>
    </div>
  </section>

  <!-- 7. Pedir es así de fácil -->
  <section class="seccion-t" aria-labelledby="t-facil">
    <div class="contenedor pagas">
      <div>
        <h2 class="titulo-sec" id="t-facil">Pedir es así de fácil</h2>
        <p class="bajada" style="margin: 6px 0 22px">No pagas nada hoy: pagas en efectivo cuando llega a tu puerta.</p>
        <div class="pasos-pago">
          <div><span class="ico"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="6" y="3" width="12" height="18" rx="2"/><path d="M10 17h4"/></svg></span>Pides en 1 minuto</div>
          <svg width="18" height="18" aria-hidden="true"><use href="#i-flecha"/></svg>
          <div><span class="ico"><svg width="30" height="30" aria-hidden="true"><use href="#i-camion"/></svg></span>Te confirmamos y llega</div>
          <svg width="18" height="18" aria-hidden="true"><use href="#i-flecha"/></svg>
          <div><span class="ico"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="7" width="18" height="11" rx="2"/><circle cx="12" cy="12.5" r="2.5"/></svg></span>Ahí pagas</div>
        </div>
      </div>
      <div style="text-align: center">
        <span class="sello-goma"><span><small>REVOLTOSOS · GARANTIZADO</small><strong>Pagas al recibir</strong><em>Recibes, revisas y pagas</em></span></span>
      </div>
    </div>
  </section>

  <!-- 8. Aliados logísticos -->
  <section class="seccion-t blanco aliados" aria-labelledby="t-aliados" style="padding: 40px 0">
    <div class="contenedor">
      <p class="antetitulo" id="t-aliados" style="color: var(--tinta-2)">Nuestros aliados logísticos</p>
      <p style="margin-top: 6px">Llegamos a cualquier ciudad o municipio de Colombia.</p>
      <div class="aliados-logos">
        <div><img src="/assets/img/aliados/envia.png" width="551" height="297" alt="Envía" loading="lazy"></div>
        <div class="oscuro"><img src="/assets/img/aliados/interrapidisimo.png" width="1200" height="340" alt="Interrapidísimo" loading="lazy"></div>
      </div>
    </div>
  </section>

  <!-- 9. Preguntas frecuentes -->
  <section class="seccion" id="preguntas" style="background: var(--hueso-2)" aria-labelledby="t-faq">
    <div class="contenedor faq">
      <h2 class="titulo" id="t-faq" style="margin-bottom: 18px">Preguntas frecuentes</h2>
      $faq
      <details><summary>¿Cuánto cuesta el envío?<svg width="20" height="20" aria-hidden="true"><use href="#i-mas"/></svg></summary><p>Es gratis si tu pedido llega a <span data-envio-gratis-desde>\$70.000</span> en productos. Si es menor, el valor depende de tu ciudad y lo ves antes de confirmar el pedido.</p></details>
      <details><summary>¿Cómo pago?<svg width="20" height="20" aria-hidden="true"><use href="#i-mas"/></svg></summary><p>Pagas al recibir: le entregas el dinero a la transportadora cuando el pedido llega a tu casa. No pagas nada por adelantado.</p></details>
      <details><summary>¿Cuánto tarda el envío?<svg width="20" height="20" aria-hidden="true"><use href="#i-mas"/></svg></summary><p>Depende de tu ciudad. Cuando te escribamos por WhatsApp para confirmar el pedido te decimos el tiempo de entrega.</p></details>
    </div>
  </section>
</main>

<footer class="pie">
  <div class="contenedor pie-grid">
    <div class="pie-marca">
      <span><img src="/assets/img/logo.jpg" width="150" height="150" alt="" loading="lazy"></span>
      <span><strong>Revoltosos</strong><br><span style="font-size: 14px">Hecho en Colombia con amor</span></span>
    </div>
    <div class="pie-redes">
      <a href="https://instagram.com/revoltosos.deshidratados" target="_blank" rel="noopener"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="5"/><circle cx="12" cy="12" r="3.6"/></svg>\@revoltosos.deshidratados</a>
      <a href="https://wa.me/573122448276" target="_blank" rel="noopener"><svg width="18" height="18" aria-hidden="true"><use href="#i-whatsapp"/></svg>312 244 8276</a>
    </div>
    <div class="pie-legal">
      <span>© <span data-anio>2026</span> Revoltosos</span>
      <a href="/privacidad.html">Política de tratamiento de datos (Ley 1581 de 2012)</a>
      <a href="/privacidad.html#terminos">Términos y condiciones</a>
    </div>
  </div>
</footer>

<!-- Fijo abajo: WhatsApp + botón principal -->
<div class="fijo-abajo">
  <a class="wa-flotante" href="$wa" target="_blank" rel="noopener" aria-label="¿Dudas? Escríbenos por WhatsApp"><svg width="26" height="26" aria-hidden="true"><use href="#i-wa-lleno"/></svg></a>
  <div class="barra-t" id="barra-t">
    <button type="button" class="btn rv-meneo" data-barra-btn>Pedir ahora</button>
    <p class="ahorro-linea rv-pop" data-barra-ahorro hidden></p>
    <p><svg width="18" height="18" aria-hidden="true"><use href="#i-casa"/></svg>Pagas al recibir en tu casa · <span>no pagas nada hoy</span></p>
  </div>
</div>

<div class="cookies" id="cookies" hidden>
  <span>Usamos cookies para medir nuestros anuncios y mejorar la página. <a href="/privacidad.html">Más información</a></span>
  <button type="button" id="cookies-ok">Entendido</button>
</div>

<script src="/assets/js/tienda.js?v=9"></script>
</body>
</html>
HTML

  my $dir = "$raiz/$p->{ruta}";
  mkdir $dir unless -d $dir;
  open my $o, '>:encoding(UTF-8)', "$dir/index.html" or die "No pude escribir $dir/index.html: $!";
  print $o $html;
  close $o;
  print "  /$p->{ruta}/\n";
}
print scalar(@productos), " landings generadas.\n";
