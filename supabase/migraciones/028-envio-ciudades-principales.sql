-- Revoltosos · 028 · Envío de $15.000 a ciudades principales (2026-11-20)
-- No depende de 026 ni de 027: se puede correr cuando quieras.
-- Pégalo completo en Supabase › SQL Editor › New query › Run. Se puede correr más de una vez.
--
-- · Ciudades principales (y el área metropolitana de Medellín): $15.000.
-- · Pereira ($12.000) y Dosquebradas ($12.500) se quedan como están.
-- · El resto del país sigue en $20.000 (envio_base).
-- · Se puede cambiar después en el gestor › Ajustes › tarifas por ciudad.

update public.ajustes
set envio_base = 20000,
    envio_ciudades = coalesce(envio_ciudades, '{}'::jsonb) || jsonb_build_object(
      'Bogotá D.C.|Bogotá D.C.',                 15000,
      'Antioquia|Medellín',                      15000,
      'Antioquia|Bello',                         15000,
      'Antioquia|Itagüí',                        15000,
      'Antioquia|Envigado',                      15000,
      'Antioquia|Sabaneta',                      15000,
      'Antioquia|La Estrella',                   15000,
      'Antioquia|Caldas',                        15000,
      'Antioquia|Copacabana',                    15000,
      'Antioquia|Girardota',                     15000,
      'Antioquia|Barbosa',                       15000,
      'Valle del Cauca|Santiago de Cali',        15000,
      'Atlántico|Barranquilla',                  15000,
      'Santander|Bucaramanga',                   15000,
      'Caldas|Manizales',                        15000,
      'Quindío|Armenia',                         15000,
      'Tolima|Ibagué',                           15000,
      'Norte de Santander|San José de Cúcuta',   15000,
      'Bolívar|Cartagena de Indias',             15000,
      'Magdalena|Santa Marta',                   15000,
      'Meta|Villavicencio',                      15000,
      'Boyacá|Tunja',                            15000,
      'Huila|Neiva',                             15000,
      'Nariño|Pasto',                            15000,
      'Cauca|Popayán',                           15000
    )
where id = 1;

-- Revisión: cada ciudad con su tarifa.
select key as ciudad, value as tarifa
from public.ajustes, jsonb_each(envio_ciudades)
where id = 1
order by value, key;
