const SHOPIFY_DOMAIN = import.meta.env.VITE_SHOPIFY_STORE_DOMAIN;
const SHOPIFY_TOKEN = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN;

const API_VERSION = "2026-07";
const SHOPIFY_API_URL = `https://${SHOPIFY_DOMAIN}/api/${API_VERSION}/graphql.json`;

if (!SHOPIFY_DOMAIN) {
    throw new Error("Missing VITE_SHOPIFY_STORE_DOMAIN in .env");
}

if (!SHOPIFY_TOKEN) {
    throw new Error("Missing VITE_SHOPIFY_STOREFRONT_TOKEN in .env");
}

async function shopifyFetch(query, variables = {}) {
    const response = await fetch(SHOPIFY_API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Shopify-Storefront-Access-Token": SHOPIFY_TOKEN,
        },
        body: JSON.stringify({
            query,
            variables,
        }),
    });

    if (!response.ok) {
        throw new Error(
            `Shopify request failed with status ${response.status}.`,
        );
    }

    const result = await response.json();

    if (result.errors?.length) {
        console.error("Shopify GraphQL errors:", result.errors);

        throw new Error(
            result.errors[0]?.message || "Shopify API request failed.",
        );
    }

    return result.data;
}

const PRODUCT_FIELDS = `
  id
  title
  handle
  description
  descriptionHtml
  productType
  vendor
  availableForSale

  onlineStoreUrl

  featuredImage {
    url
    altText
    width
    height
  }

  images(first: 20) {
    nodes {
      url
      altText
      width
      height
    }
  }

  priceRange {
    minVariantPrice {
      amount
      currencyCode
    }

    maxVariantPrice {
      amount
      currencyCode
    }
  }

  options {
    name

    optionValues {
      name
    }
  }

  variants(first: 100) {
    nodes {
      id
      title
      availableForSale

      price {
        amount
        currencyCode
      }

      compareAtPrice {
        amount
        currencyCode
      }

      selectedOptions {
        name
        value
      }
    }
  }
`;

export async function getBrewingEdgeProducts() {
    const allProducts = [];

    let cursor = null;
    let hasNextPage = true;
    let collectionData = null;

    while (hasNextPage) {
        const query = `
      query BrewingEdgeCollection($after: String) {
        collection(handle: "brewing-edge") {
          id
          title
          handle

          products(first: 250, after: $after) {
            nodes {
              ${PRODUCT_FIELDS}
            }

            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      }
    `;

        const data = await shopifyFetch(query, {
            after: cursor,
        });

        const collection = data?.collection;

        if (!collection) {
            throw new Error(
                'The Shopify collection "brewing-edge" was not found.',
            );
        }

        collectionData = collection;

        allProducts.push(...collection.products.nodes);

        hasNextPage = collection.products.pageInfo.hasNextPage;
        cursor = collection.products.pageInfo.endCursor;
    }

    return {
        title: collectionData?.title || "Brewing Edge",
        handle: collectionData?.handle || "brewing-edge",
        products: allProducts,
    };
}

export async function getBrewingEdgeProduct(handle) {
    const query = `
    query BrewingEdgeProduct($handle: String!) {
      product(handle: $handle) {
        ${PRODUCT_FIELDS}

        collections(first: 20) {
          nodes {
            handle
            title
          }
        }
      }
    }
  `;

    const data = await shopifyFetch(query, {
        handle,
    });

    const product = data?.product;

    if (!product) {
        return null;
    }

    const belongsToBrewingEdge =
        product.collections.nodes.some(
            (collection) => collection.handle === "brewing-edge",
        );

    if (!belongsToBrewingEdge) {
        return null;
    }

    return product;
}

export function getBuyHorecaProductUrl(product) {
    if (product?.onlineStoreUrl) {
        return product.onlineStoreUrl;
    }

    if (product?.handle) {
        return `https://buyhoreca.com/products/${product.handle}`;
    }

    return "https://buyhoreca.com";
}