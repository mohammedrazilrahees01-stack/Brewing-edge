# Brewing Edge production hardening

This overlay keeps the existing Shopify product source of truth and adds production SEO/routing/responsive hardening.

## Shopify
- Existing Storefront API variables remain unchanged.
- Products continue to come from the `brewing-edge` Shopify collection.
- Prices, availability, images, variants and BuyHoreca product URLs remain dynamic.

## SEO
- Dynamic per-route title and meta description.
- Canonical URL generated from the active production origin and route.
- Robots directives with large image/snippet/video previews.
- Search/filter/sort shop URLs are `noindex, follow` at the Vercel edge.
- Open Graph and Twitter metadata.
- Organization, WebSite, WebPage, CollectionPage, BreadcrumbList and Product JSON-LD.
- Product structured data uses live Shopify price, currency, availability and images.
- Dynamic `/sitemap.xml` includes static pages and live Shopify product URLs.
- `/robots.txt` references the sitemap and excludes only the internal API path.
- Favicon, Apple touch icon, web manifest and social preview image.

## Routing / hosting
- Vite uses `/` for normal/Vercel production and `/Brewing-edge/` for GitHub Actions builds.
- Vercel rewrites support direct loading/reloading of React Router routes.
- `/sitemap.xml` is rewritten to the Vercel function that generates the live sitemap.
- Security/referrer/permissions headers are configured in `vercel.json`.

## Responsive hardening
- Small phones down to 320px.
- Large phones and tablets.
- Laptop/desktop widths.
- 1440px, 1920px and 2560px+ displays.
- Landscape phone layouts.
- Touch devices and hover-capable devices.
- Reduced motion and high-contrast preferences.
- Safe-area support for modern iOS devices.
- Keyboard/focus states retained for desktop and TV browsers.
- Print fallback.

## Before production
1. Keep the existing Shopify environment variables in Vercel.
2. Optionally set `SITE_URL` to the final custom domain after it is connected.
3. Deploy a Vercel preview first.
4. Test `/`, `/shop`, `/categories`, `/about`, `/guides`, `/contact` and at least one `/product/<handle>` directly in a fresh browser tab.
5. Verify `https://YOUR-DOMAIN/robots.txt` and `https://YOUR-DOMAIN/sitemap.xml` return valid responses.
6. After the final domain is live, add it to Google Search Console and submit `/sitemap.xml`.
7. Run Google's Rich Results Test / URL Inspection against representative product pages and the homepage.
