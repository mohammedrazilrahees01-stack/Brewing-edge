# Brewing Edge premium overlay

Replace the existing files with this package by extracting it over the current repository.

Updated:
- `src/App.jsx` — redesigned the homepage journey and refined all existing routes.
- `src/App.css` — new premium visual system, responsive layouts, micro-interactions, product presentation and accessibility focus states.
- `src/lib/shopify.js` — accepts either Shopify token environment variable name and includes product tags.
- `vite.config.js` — uses `/Brewing-edge/` only for GitHub Pages builds and `/` for normal hosting such as Vercel/custom domains.

The existing image/video assets are intentionally not included because they should remain untouched in your current project.


v3 change:
- Shopify integration restored to the repository's original implementation.
- ProductCard restored to the original Brewing Edge card structure and presentation.
- Premium redesign remains on the surrounding homepage/site experience.

Final production hardening:
- Added complete route-aware SEO metadata, canonical URLs, robots directives, Open Graph, Twitter cards and JSON-LD.
- Added live Shopify-aware product structured data and a dynamic Vercel sitemap endpoint.
- Added robots.txt, favicon assets, Apple touch icon, manifest and social preview image.
- Added Vercel SPA route rewrites so direct route loads work in production.
- Added edge noindex headers for shop search/filter/sort URLs to avoid faceted duplicate indexing.
- Added responsive hardening for small phones, tablets, laptops, desktops, 1440/1920/2560+ displays, landscape phones, touch devices, reduced motion and high-contrast preferences.
- Fixed Shopify image collection handling so product galleries correctly read `images.nodes` from the Storefront API.
- Kept the existing Shopify collection, pricing, availability, variants and BuyHoreca URL logic intact.
