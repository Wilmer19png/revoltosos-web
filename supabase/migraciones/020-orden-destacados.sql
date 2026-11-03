-- Revoltosos · migración 020: productos destacados primero en la tienda
--
-- Húmero de cerdo, codornicitas, oreja de cerdo, patas de pollo y paleta de cerdo
-- encabezan el catálogo (orden 1 a 5). Los demás siguen del más barato al más caro,
-- según su tamaño más económico. Se puede volver a correr sin problema.

with destacados(id, orden) as (
  values ('humero-cerdo', 1), ('codornices', 2), ('oreja-cerdo', 3), ('patas-pollo', 4), ('paleta-cerdo', 5)
),
resto as (
  select p.id, 5 + row_number() over (order by min(v.precio) nulls last, p.orden, p.id) as orden
  from public.productos p
  left join public.variantes v on v.producto_id = p.id and v.precio > 0
  where p.id not in (select id from destacados)
  group by p.id, p.orden
)
update public.productos p
set orden = n.orden
from (select * from destacados union all select * from resto) n
where p.id = n.id;
