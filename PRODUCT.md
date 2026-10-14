# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Static HTML + CSS + vanilla JS in a single `index.html` (product data in a `PRODUCT = {...}` object). Orders go to **Supabase** (decided 2026-10-13, replaces the Google Sheets + Apps Script plan): a `pedidos` table with RLS (only admins read/update; orders are inserted by the `crear-pedido` Edge Function, which also recalculates the price server-side), Supabase Auth email+password for the owner, a private `/pedidos` panel, and an Edge Function for the Meta Conversions API. Must stay easy to migrate later to Shopify / WooCommerce / Next.js. Deploy target: Netlify, Vercel or Hostinger. Repo: GitHub Wilmer19png/revoltosos-web (private).

## Users

Colombian pet owners (dogs mostly, also cats) arriving from Meta ads on their phone (~90 % mobile, often inside the Instagram/Facebook in-app browser). They decide fast and trust cash on delivery more than paying online.

## Product Purpose

Sell one product, Codornices deshidratadas, 50 g jar (≈ 30 pieces): 1 jar $14.900 COP, promo 2 jars $26.900 (prices changed again 2026-10-14; was 20.900/29.900). No 3-jar option (price change 2026-10-13). Success = the visitor fills the order form and taps "Pagar al recibir". The order lands in Supabase, the owner confirms on WhatsApp, and the Purchase event reaches Meta (Pixel + Conversions API, deduplicated).

## Positioning

Single-ingredient whole quail, slowly dehydrated, with nothing added (no preservatives, salt or colorants). Made in Colombia. Free shipping to all of Colombia and cash on delivery.

## Capabilities and Constraints

- Prices in COP, formatted `$20.900`. Free shipping always. Optional priority shipping +$5.000.
- Bundles: 1 jar $14.900, 2 jars $26.900 (promo). Catalog lists only 50 g ($14.900) and 100 g ($26.900, same as 2×50 g). Keep configurable in `PRODUCT`. The product render image has the old price 14.900 printed on it; it needs a new render or crop.
- Phone: 10 digits starting with 3, stored as `573XXXXXXXXX`.
- No navigation menu and no links out of the page, except Instagram/WhatsApp/legal links in the footer.
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

1. One action per page: the order form. Everything else supports it.
2. Free shipping and cash on delivery are visible at every decision point.
3. Show the real product. AI imagery only for ambience, never for the product itself.
4. Placeholders stay clearly marked until real content arrives.

## Accessibility & Inclusion

WCAG AA contrast, real labels, visible focus, touch targets ≥ 44 px, descriptive alt text. Must work in Safari, Chrome and the Instagram/Facebook in-app browsers.
