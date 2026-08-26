const API_VERSION = "2026-07";
const COLLECTION_HANDLE = "brewing-edge";

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function getSiteOrigin(request) {
  const configured = process.env.SITE_URL || process.env.VITE_SITE_URL;
  if (configured) return configured.replace(/\/$/, "");

  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") || "https";
  const host = forwardedHost || request.headers.get("host");

  return `${forwardedProto}://${host}`.replace(/\/$/, "");
}

async function shopifyProducts() {
  const domain = process.env.VITE_SHOPIFY_STORE_DOMAIN;
  const token = process.env.VITE_SHOPIFY_STOREFRONT_TOKEN;

  if (!domain || !token) return [];

  const products = [];
  let cursor = null;
  let hasNextPage = true;

  while (hasNextPage) {
    const query = `
      query SitemapProducts($after: String) {
        collection(handle: "${COLLECTION_HANDLE}") {
          products(first: 250, after: $after) {
            nodes {
              handle
              updatedAt
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      }
    `;

    const response = await fetch(
      `https://${domain}/api/${API_VERSION}/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token": token,
        },
        body: JSON.stringify({ query, variables: { after: cursor } }),
      },
    );

    if (!response.ok) throw new Error(`Shopify sitemap request failed: ${response.status}`);

    const result = await response.json();
    if (result.errors?.length) throw new Error(result.errors[0]?.message || "Shopify sitemap request failed");

    const collection = result.data?.collection;
    if (!collection) break;

    products.push(...(collection.products?.nodes || []));
    hasNextPage = Boolean(collection.products?.pageInfo?.hasNextPage);
    cursor = collection.products?.pageInfo?.endCursor || null;
  }

  return products;
}

export default async function handler(request, response) {
  const origin = getSiteOrigin(request);
  const staticPaths = ["/", "/shop", "/categories", "/about", "/guides", "/contact"];
  let products = [];

  try {
    products = await shopifyProducts();
  } catch (error) {
    console.error("Brewing Edge sitemap product fetch failed:", error);
  }

  const urls = staticPaths.map((path) => ({ loc: `${origin}${path}`, lastmod: null }));

  for (const product of products) {
    if (!product?.handle) continue;
    urls.push({
      loc: `${origin}/product/${encodeURIComponent(product.handle)}`,
      lastmod: product.updatedAt || null,
    });
  }

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map(({ loc, lastmod }) => `  <url><loc>${escapeXml(loc)}</loc>${lastmod ? `<lastmod>${escapeXml(lastmod)}</lastmod>` : ""}</url>`).join("\n") +
    `\n</urlset>`;

  response.setHeader("Content-Type", "application/xml; charset=utf-8");
  response.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
  response.status(200).send(body);
}
