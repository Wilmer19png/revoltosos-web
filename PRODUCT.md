# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Static HTML + CSS + vanilla JS (no build). Since 2026-10-14 it is a store: home `/`, one landing per product (`/codornices/`, `/cajita/`, generic `/producto/?p=id`), shared `assets/js/tienda.js` (catalog from Supabase, cart in localStorage, coupons, free-shipping bar, order modal). Catalog, prices, costs, stock, coupons and settings live in Supabase (migration 007) and are edited in the `/pedidos` gestor. Orders go to **Supabase** (decided 2026-10-13, replaces the Google Sheets + Apps Script plan): a `pedidos` table with RLS (only admins read/update; orders are inserted by the `crear-pedido` Edge Function, which also recalculates the price server-side), Supabase Auth email+password for the owner, a private `/pedidos` panel, and an Edge Function for the Meta Conversions API. Must stay easy to migrate later to Shopify / WooCommerce / Next.js. Deploy target: Netlify, Vercel or Hostinger. Repo: GitHub Wilmer19png/revoltosos-web (private).

## Users

Colombian pet owners (dogs mostly, also cats) arriving from Meta ads on their phone (~90 % mobile, often inside the Instagram/Facebook in-app browser). They decide fast and trust cash on delivery more than paying online.

## Product Purpose

Sell a catalog of natural dog snacks (codornices, Cajita para perros, patas, oreja, fémur…). The quail jar is **100 g** (there is no 50 g jar); there is also a **50 g bag** (price pending). Known prices: frasco 100 g $14.900, 2 frascos $26.900 (normal $29.800), Cajita $72.900. "Entre más pides, más ahorras": show normal vs. promo price and the total saved. Success = the visitor fills the order form and taps "Pagar al recibir". The order lands in Supabase, the owner confirms on WhatsApp, and the Purchase event reaches Meta (Pixel + Conversions API, deduplicated).

## Positioning

Single-ingredient whole quail, slowly dehydrated, with nothing added (no preservatives, salt or colorants). Made in Colombia. Free shipping from $70.000 in products (otherwise a per-department fee) and cash on delivery.

## Capabilities and Constraints

- Prices in COP, formatted `$20.900`. Free shipping from `ajustes.envio_gratis_desde` ($70.000); below that, `envio_base` or the department fee. Optional priority shipping +$5.000. Envía + Interrapidísimo are the carriers (API integration planned).
- Prices, sizes, costs and stock are edited in the gestor, never hard-coded. The jar render still says "50 GR" on the label; it needs a new photo or crop.
- Phone: 10 digits starting with 3, stored as `573XXXXXXXXX`.
- Store navigation: header with Tienda / product landings, cart, floating WhatsApp button. Each product landing must stand alone for ads.
- Recent-purchase notices use only real orders (first name + city). Never invent buyers, counters or stock urgency.
- Data-processing consent under Colombian Ley 1581 de 2012.
- Shipping time and how long an opened jar lasts are **unconfirmed**; don't invent them.
- Minipigs and other species stay out until the owner confirms with a vet.

## Brand Commitments

- Name: Revoltosos · Instagram @revoltosos.deshidratados · WhatsApp +57 312 244 8276.
- Existing logo: brown shield with a dog and a cat, "Proteína 100 % natural".
- Do NOT reuse the catalog's brown/orange paw-print look. Brief-pinned palette: bone #F5F1E8 / #EDE6D8, sage-olive #4F5D3A, terracotta CTA #C1652F (hover #A9541F), text #2A231D / #6B6157, mustard #D9A441 used sparingly.
- Voice: warm, concrete Spanish (Colombia). No medical claims or promises to cure anything.

## Evidence on Hand

- `Recursos página/Imagen de ChatGPT … .png`: product render of the 50 g jar (shows price 14.900).
- `Recursos página/723172613_….jpg`: logo (small).
- `Recursos página/WhatsApp Image … .jpeg`: real photo of a **100 g** jar. Owner decided not to use it (product sold is 50 g).
- The owner says they have real customer videos and reviews, but they aren't in the folder yet. Never invent names, testimonials or "best-seller" claims.

## Product Principles

1. Every page leads to the cart or "Hacer mi pedido ahora"; the order form opens on top of the page.
2. Cash on delivery and the free-shipping threshold are visible at every decision point.
3. Show the real product. AI imagery only for ambience, never for the product itself.
4. Placeholders stay clearly marked until real content arrives.

## Accessibility & Inclusion

WCAG AA contrast, real labels, visible focus, touch targets ≥ 44 px, descriptive alt text. Must work in Safari, Chrome and the Instagram/Facebook in-app browsers.
