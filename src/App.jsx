import { useEffect, useMemo, useRef, useState } from "react";
import {
  BrowserRouter,
  Link,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";

import {
  getBrewingEdgeProduct,
  getBrewingEdgeProducts,
  getBuyHorecaProductUrl,
} from "./lib/shopify";

import logo from "./assets/brewing-edge-logo.png";
import heroVideo from "./assets/brewing-edge-bg.mp4";
import buyHorecaLogo from "./assets/buyhoreca-logo.svg";

import aboutImage from "./assets/brewing-edge-about.jpg";
import brandStoryImage from "./assets/brewing-edge-brand-story.jpg";
import guidesImage from "./assets/brewing-edge-guides.jpg";
import philosophyImage from "./assets/brewing-edge-philosophy.jpg";

import "./App.css";

const BUYHORECA_URL = "https://buyhoreca.com";

const BUYHORECA_CONTACT = {
  address:
    "13A St. Al Khabaisi Area - Deira - Dubai - U.A.E",
  phone: "+971 4 396 6692",
  mobile: "+971 56 533 4464",
  email: "support@buyhoreca.com",
};
function App() {
  return (
    <BrowserRouter basename="/Brewing-edge">
      <ScrollToTop />
      <RouteSEO />

      <div className="site-shell">
        <Header />

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route
            path="/product/:handle"
            element={<ProductPage />}
          />
          <Route
            path="/categories"
            element={<CategoriesPage />}
          />
          <Route path="/about" element={<AboutPage />} />
          <Route
            path="/guides"
            element={<BrewGuidesPage />}
          />
          <Route
            path="/contact"
            element={<ContactPage />}
          />
          <Route
            path="*"
            element={<NotFoundPage />}
          />
        </Routes>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

/* =========================================================
   HEADER
========================================================= */

function Header() {
  const location = useLocation();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");

  const searchRef = useRef(null);
  const searchAreaRef = useRef(null);

  const isHome = location.pathname === "/";

  useEffect(() => {
    let active = true;

    async function loadSearchProducts() {
      try {
        const data = await getBrewingEdgeProducts();

        if (active) {
          setProducts(data?.products || []);
        }
      } catch (error) {
        console.error(
          "Header search product load failed:",
          error,
        );
      }
    }

    loadSearchProducts();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (
        searchAreaRef.current &&
        !searchAreaRef.current.contains(event.target)
      ) {
        setSearchOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick,
      );
    };
  }, []);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setSearchOpen(false);
        setMenuOpen(false);
      }
    }

    document.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, []);

  const searchResults = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return [];
    }

    return products
      .filter((product) =>
        [
          product.title,
          product.productType,
          product.vendor,
          product.description,
          ...(product.tags || []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(term),
      )
      .slice(0, 6);
  }, [products, search]);

  function closeAll() {
    setMenuOpen(false);
    setSearchOpen(false);
  }

  function openSearch() {
    setSearchOpen(true);

    setTimeout(() => {
      searchRef.current?.focus();
    }, 0);
  }

  function submitSearch(event) {
    event.preventDefault();

    const term = search.trim();

    if (!term) {
      openSearch();
      return;
    }

    navigate(
      `/shop?search=${encodeURIComponent(term)}`,
    );

    closeAll();
  }

  return (
    <header
      className={`navbar ${
        isHome
          ? "navbar-home"
          : "navbar-internal"
      }`}
    >
      <div className="navbar-inner">
        <Link
          to="/"
          className="brand"
          onClick={closeAll}
          aria-label="Brewing Edge home"
        >
          <img
            src={logo}
            alt="Brewing Edge"
          />
        </Link>

        <div
          className={`nav-pill ${
            menuOpen
              ? "nav-mobile-open"
              : ""
          }`}
        >
          <nav className="nav-links">
            <Link
              to="/"
              onClick={closeAll}
            >
              Home
            </Link>

            <Link
              to="/shop"
              onClick={closeAll}
            >
              Shop
            </Link>

            <Link
              to="/categories"
              onClick={closeAll}
            >
              Categories
            </Link>

            <Link
              to="/about"
              onClick={closeAll}
            >
              About
            </Link>

            <Link
              to="/guides"
              onClick={closeAll}
            >
              Brew Guides
            </Link>

            <Link
              to="/contact"
              onClick={closeAll}
            >
              Contact
            </Link>
          </nav>

          <div
            className="header-search-wrap"
            ref={searchAreaRef}
          >
            <button
              type="button"
              className={`header-search-button ${
                searchOpen
                  ? "search-active"
                  : ""
              }`}
              onClick={openSearch}
              aria-expanded={searchOpen}
            >
              <span className="search-icon">
                ⌕
              </span>

              <span>Search</span>
            </button>

            {searchOpen && (
              <div className="global-search-panel">
                <form
                  className="global-search-form"
                  onSubmit={submitSearch}
                >
                  <span className="global-search-icon">
                    ⌕
                  </span>

                  <input
                    ref={searchRef}
                    type="search"
                    value={search}
                    placeholder="Search Brewing Edge products..."
                    onChange={(event) =>
                      setSearch(
                        event.target.value,
                      )
                    }
                    autoComplete="off"
                  />

                  {search && (
                    <button
                      type="button"
                      className="global-search-clear"
                      onClick={() =>
                        setSearch("")
                      }
                      aria-label="Clear search"
                    >
                      ×
                    </button>
                  )}
                </form>

                {search.trim() ? (
                  <div className="global-search-results">
                    {searchResults.length >
                    0 ? (
                      <>
                        {searchResults.map(
                          (product) => {
                            const image =
                              getProductImage(
                                product,
                              );

                            return (
                              <Link
                                key={
                                  product.id
                                }
                                to={`/product/${product.handle}`}
                                className="search-result"
                                onClick={
                                  closeAll
                                }
                              >
                                <div className="search-result-image">
                                  {image ? (
                                    <img
                                      src={
                                        image.url
                                      }
                                      alt={
                                        product.title
                                      }
                                    />
                                  ) : (
                                    <span>
                                      BE
                                    </span>
                                  )}
                                </div>

                                <div className="search-result-info">
                                  <strong>
                                    {
                                      product.title
                                    }
                                  </strong>

                                  <span>
                                    {product.productType ||
                                      "Brewing Edge"}
                                  </span>

                                  <b>
                                    {formatMoney(
                                      product
                                        .priceRange
                                        ?.minVariantPrice,
                                    )}
                                  </b>
                                </div>

                                <span className="search-result-arrow">
                                  →
                                </span>
                              </Link>
                            );
                          },
                        )}

                        <Link
                          to={`/shop?search=${encodeURIComponent(
                            search.trim(),
                          )}`}
                          className="search-all-results"
                          onClick={
                            closeAll
                          }
                        >
                          View all results for “
                          {search.trim()}”
                          <span>→</span>
                        </Link>
                      </>
                    ) : (
                      <div className="search-no-results">
                        <strong>
                          No exact match.
                        </strong>

                        <span>
                          Try grinder, kettle,
                          dripper, tamper or
                          coffee.
                        </span>

                        <Link
                          to={`/shop?search=${encodeURIComponent(
                            search.trim(),
                          )}`}
                          onClick={
                            closeAll
                          }
                        >
                          Search the full
                          collection →
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="search-suggestions">
                    <span>
                      Search the Brewing Edge
                      collection
                    </span>

                    <div>
                      <button
                        type="button"
                        onClick={() =>
                          setSearch(
                            "grinder",
                          )
                        }
                      >
                        Grinders
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setSearch(
                            "kettle",
                          )
                        }
                      >
                        Kettles
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setSearch(
                            "dripper",
                          )
                        }
                      >
                        Drippers
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setSearch(
                            "tamper",
                          )
                        }
                      >
                        Tampers
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <Link
            to="/shop"
            className="nav-shop-button"
            onClick={closeAll}
          >
            Shop Now
            <span>↗</span>
          </Link>
        </div>

        <button
          type="button"
          className="mobile-menu-button"
          onClick={() =>
            setMenuOpen(
              (value) => !value,
            )
          }
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}

/* =========================================================
   HOME
========================================================= */

function HomePage() {
  const [products, setProducts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadProducts() {
      try {
        const data =
          await getBrewingEdgeProducts();

        setProducts(
          data?.products || [],
        );
      } catch (err) {
        console.error(err);

        setError(
          err.message ||
            "Unable to load Brewing Edge products.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  return (
    <main className="home">
      <section className="hero">
        <video
          className="hero-video"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
        >
          <source
            src={heroVideo}
            type="video/mp4"
          />
        </video>

        <div className="hero-overlay" />

        <div className="hero-inner">
          <div className="hero-copy">
            <div className="hero-eyebrow-row">
              <span className="hero-eyebrow-line" />

              <p className="hero-eyebrow">
                PRECISION COFFEE EQUIPMENT
              </p>
            </div>

            <h1>
              Your coffee.
              <br />
              Your <span>edge.</span>
            </h1>

            <p className="hero-description">
              Precision equipment for people
              who care about consistency,
              control and the quality of every
              cup.
            </p>

            <div className="hero-actions">
              <Link
                to="/shop"
                className="primary-button"
              >
                Shop Brewing Edge
              </Link>

              <a
                href="#featured"
                className="secondary-button"
              >
                Explore Collection
              </a>
            </div>
          </div>
        </div>

        <div className="hero-bottom">
          <div className="hero-scroll">
            <span>
              SCROLL TO EXPLORE
            </span>

            <div className="scroll-line" />
          </div>
        </div>
      </section>

      <section
        className="brand-ribbon"
        aria-label="Brewing Edge brand message"
      >
        <div className="brand-ribbon-track">
          <div className="brand-ribbon-content">
            <span>
              BREWING EDGE
            </span>

            <i>✦</i>

            <span>
              BY BUYHORECA
            </span>

            <i>✦</i>

            <span>
              PRECISION COFFEE EQUIPMENT
            </span>

            <i>✦</i>

            <span>
              BREW BETTER
            </span>

            <i>✦</i>

            <span>
              BREW DIFFERENT
            </span>

            <i>✦</i>
          </div>

          <div
            className="brand-ribbon-content"
            aria-hidden="true"
          >
            <span>
              BREWING EDGE
            </span>

            <i>✦</i>

            <span>
              BY BUYHORECA
            </span>

            <i>✦</i>

            <span>
              PRECISION COFFEE EQUIPMENT
            </span>

            <i>✦</i>

            <span>
              BREW BETTER
            </span>

            <i>✦</i>

            <span>
              BREW DIFFERENT
            </span>

            <i>✦</i>
          </div>
        </div>
      </section>

      <section
        className="featured-section"
        id="featured"
      >
        <div className="featured-inner">
          <div className="featured-heading">
            <div>
              <p className="section-kicker">
                THE BREWING EDGE COLLECTION
              </p>

              <h2>
                Featured products
              </h2>

              <p className="section-description">
                Explore selected Brewing Edge
                equipment made for precise,
                consistent brewing.
              </p>
            </div>

            <Link
              to="/shop"
              className="view-all-link"
            >
              View all products
              <span>→</span>
            </Link>
          </div>

          {loading && (
            <ProductSkeletonGrid />
          )}

          {!loading && error && (
            <div className="state-box">
              <h3>
                Products couldn't be loaded.
              </h3>

              <p>{error}</p>
            </div>
          )}

          {!loading &&
            !error &&
            products.length === 0 && (
              <div className="state-box">
                <h3>
                  No Brewing Edge products
                  found.
                </h3>

                <p>
                  Make sure your products
                  are inside the Brewing Edge
                  Shopify collection.
                </p>
              </div>
            )}

          {!loading &&
            !error &&
            products.length > 0 && (
              <div className="product-grid">
                {products
                  .slice(0, 8)
                  .map(
                    (product) => (
                      <ProductCard
                        key={
                          product.id
                        }
                        product={
                          product
                        }
                      />
                    ),
                  )}
              </div>
            )}

          {!loading &&
            !error &&
            products.length > 8 && (
              <div className="shop-more">
                <Link
                  to="/shop"
                  className="primary-button dark-button"
                >
                  View All Brewing Edge
                  Products
                </Link>
              </div>
            )}
        </div>
      </section>

      <section className="trust-strip">
        <div>
          <strong>
            Brewing Edge
          </strong>

          <span>
            Precision coffee equipment
          </span>
        </div>

        <div>
          <strong>
            Curated Collection
          </strong>

          <span>
            Coffee tools and brewing gear
          </span>
        </div>

        <div>
          <strong>
            Powered by BuyHoreca
          </strong>

          <span>
            Established ecommerce
            infrastructure
          </span>
        </div>
      </section>
    </main>
  );
}

/* =========================================================
   SHOP
========================================================= */

function ShopPage() {
  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();

  const [products, setProducts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [filterOpen, setFilterOpen] =
    useState(false);

  const [sortOpen, setSortOpen] =
    useState(false);

  const searchInputRef =
    useRef(null);

  const sortRef =
    useRef(null);

  const search =
    searchParams.get(
      "search",
    ) || "";

  const category =
    searchParams.get(
      "category",
    ) || "All";

  const sort =
    searchParams.get(
      "sort",
    ) || "featured";

  const minPriceParam =
    Number(
      searchParams.get(
        "minPrice",
      ) || 0,
    );

  const maxPriceParam =
    Number(
      searchParams.get(
        "maxPrice",
      ) || 0,
    );

  useEffect(() => {
    async function loadProducts() {
      try {
        const data =
          await getBrewingEdgeProducts();

        setProducts(
          data?.products || [],
        );
      } catch (err) {
        console.error(err);

        setError(
          err.message ||
            "Unable to load products.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  useEffect(() => {
    if (
      searchParams.get(
        "focus",
      ) === "search"
    ) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 0);

      setSearchParams(
        (current) => {
          current.delete(
            "focus",
          );

          return current;
        },
        { replace: true },
      );
    }
  }, [
    searchParams,
    setSearchParams,
  ]);

  useEffect(() => {
    function handleOutsideClick(
      event,
    ) {
      if (
        sortRef.current &&
        !sortRef.current.contains(
          event.target,
        )
      ) {
        setSortOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick,
      );
    };
  }, []);

  const categories =
    useMemo(() => {
      const values =
        products
          .map(
            (product) =>
              product.productType?.trim(),
          )
          .filter(Boolean);

      return [
        "All",
        ...new Set(values),
      ];
    }, [products]);

  const maximumProductPrice =
    useMemo(() => {
      if (!products.length) {
        return 0;
      }

      return Math.ceil(
        Math.max(
          ...products.map(
            (product) =>
              Number(
                product
                  .priceRange
                  ?.maxVariantPrice
                  ?.amount || 0,
              ),
          ),
        ),
      );
    }, [products]);

  const actualMinPrice =
    Math.max(
      0,
      Math.min(
        minPriceParam,
        maximumProductPrice ||
          0,
      ),
    );

  const actualMaxPrice =
    maxPriceParam
      ? Math.min(
          maxPriceParam,
          maximumProductPrice,
        )
      : maximumProductPrice;

  const filteredProducts =
    useMemo(() => {
      let result = [
        ...products,
      ];

      if (category !== "All") {
        result =
          result.filter(
            (product) =>
              product.productType
                ?.trim()
                .toLowerCase() ===
              category.toLowerCase(),
          );
      }

      if (search.trim()) {
        const term =
          search
            .trim()
            .toLowerCase();

        result =
          result.filter(
            (product) =>
              [
                product.title,
                product.productType,
                product.vendor,
                product.description,
                ...(product.tags ||
                  []),
              ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase()
                .includes(term),
          );
      }

      if (
        maximumProductPrice >
        0
      ) {
        result =
          result.filter(
            (product) => {
              const price =
                Number(
                  product
                    .priceRange
                    ?.minVariantPrice
                    ?.amount || 0,
                );

              return (
                price >=
                  actualMinPrice &&
                price <=
                  actualMaxPrice
              );
            },
          );
      }

      if (
        sort === "name"
      ) {
        result.sort(
          (a, b) =>
            a.title.localeCompare(
              b.title,
            ),
        );
      }

      if (
        sort ===
        "price-low"
      ) {
        result.sort(
          (a, b) =>
            Number(
              a.priceRange
                .minVariantPrice
                .amount,
            ) -
            Number(
              b.priceRange
                .minVariantPrice
                .amount,
            ),
        );
      }

      if (
        sort ===
        "price-high"
      ) {
        result.sort(
          (a, b) =>
            Number(
              b.priceRange
                .minVariantPrice
                .amount,
            ) -
            Number(
              a.priceRange
                .minVariantPrice
                .amount,
            ),
        );
      }

      return result;
    }, [
      products,
      search,
      category,
      sort,
      actualMinPrice,
      actualMaxPrice,
      maximumProductPrice,
    ]);

  const sortLabels = {
    featured:
      "Featured",

    name:
      "Name",

    "price-low":
      "Price: Low to high",

    "price-high":
      "Price: High to low",
  };

  function updateSearch(
    value,
  ) {
    setSearchParams(
      (current) => {
        if (value) {
          current.set(
            "search",
            value,
          );
        } else {
          current.delete(
            "search",
          );
        }

        return current;
      },
      { replace: true },
    );
  }

  function updateCategory(
    value,
  ) {
    setSearchParams(
      (current) => {
        if (value === "All") {
          current.delete(
            "category",
          );
        } else {
          current.set(
            "category",
            value,
          );
        }

        return current;
      },
      { replace: true },
    );
  }

  function updateSort(
    value,
  ) {
    setSearchParams(
      (current) => {
        if (
          value ===
          "featured"
        ) {
          current.delete(
            "sort",
          );
        } else {
          current.set(
            "sort",
            value,
          );
        }

        return current;
      },
      { replace: true },
    );

    setSortOpen(false);
  }

  function updateMinPrice(
    value,
  ) {
    const nextMin =
      Math.min(
        Number(value),
        actualMaxPrice,
      );

    setSearchParams(
      (current) => {
        if (nextMin <= 0) {
          current.delete(
            "minPrice",
          );
        } else {
          current.set(
            "minPrice",
            String(nextMin),
          );
        }

        return current;
      },
      { replace: true },
    );
  }

  function updateMaxPrice(
    value,
  ) {
    const nextMax =
      Math.max(
        Number(value),
        actualMinPrice,
      );

    setSearchParams(
      (current) => {
        if (
          !maximumProductPrice ||
          nextMax >=
            maximumProductPrice
        ) {
          current.delete(
            "maxPrice",
          );
        } else {
          current.set(
            "maxPrice",
            String(nextMax),
          );
        }

        return current;
      },
      { replace: true },
    );
  }

  function clearAllFilters() {
    setSearchParams(
      {},
      { replace: true },
    );

    setFilterOpen(false);
    setSortOpen(false);
  }

  return (
    <main className="store-page">
      <section className="store-header">
        <div className="store-header-top">
          <div className="store-header-copy">
            <p className="section-kicker">
              THE BREWING EDGE COLLECTION
            </p>

            <h1>
              Shop the collection.
            </h1>

            <p>
              Explore the full Brewing Edge
              range of coffee equipment and
              accessories.
            </p>
          </div>

          <div className="shop-header-actions">
            <button
              type="button"
              className="header-control-button"
              onClick={() =>
                searchInputRef.current?.focus()
              }
            >
              <span className="control-icon">
                ⌕
              </span>

              Search
            </button>

            <button
              type="button"
              className={`header-control-button ${
                filterOpen
                  ? "control-active"
                  : ""
              }`}
              onClick={() =>
                setFilterOpen(
                  (value) =>
                    !value,
                )
              }
            >
              <span className="control-icon">
                ☷
              </span>

              Filter

              <span className="filter-arrow">
                {filterOpen
                  ? "−"
                  : "+"}
              </span>
            </button>
          </div>
        </div>

        <div className="shop-control-bar">
          <div className="shop-search-box">
            <span className="search-box-icon">
              ⌕
            </span>

            <input
              ref={
                searchInputRef
              }
              type="search"
              value={search}
              placeholder="Search Brewing Edge products..."
              onChange={(
                event,
              ) =>
                updateSearch(
                  event.target
                    .value,
                )
              }
            />

            {search && (
              <button
                type="button"
                className="clear-search"
                onClick={() =>
                  updateSearch(
                    "",
                  )
                }
              >
                ×
              </button>
            )}
          </div>

          <div
            className="custom-sort"
            ref={sortRef}
          >
            <button
              type="button"
              className={`custom-sort-button ${
                sortOpen
                  ? "sort-open"
                  : ""
              }`}
              onClick={() =>
                setSortOpen(
                  (value) =>
                    !value,
                )
              }
            >
              <span className="sort-label">
                SORT
              </span>

              <strong>
                {
                  sortLabels[
                    sort
                  ]
                }
              </strong>

              <span className="sort-chevron">
                {sortOpen
                  ? "⌃"
                  : "⌄"}
              </span>
            </button>

            {sortOpen && (
              <div className="sort-menu">
                {Object.entries(
                  sortLabels,
                ).map(
                  ([
                    value,
                    label,
                  ]) => (
                    <button
                      key={
                        value
                      }
                      type="button"
                      className={`sort-option ${
                        sort ===
                        value
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        updateSort(
                          value,
                        )
                      }
                    >
                      {label}
                    </button>
                  ),
                )}
              </div>
            )}
          </div>
        </div>

        {filterOpen && (
          <div className="filter-panel">
            <div className="filter-panel-header">
              <div>
                <span>
                  FILTER PRODUCTS
                </span>

                <strong>
                  Refine your selection
                </strong>
              </div>

              <button
                type="button"
                onClick={
                  clearAllFilters
                }
              >
                Clear all
              </button>
            </div>

            <div className="filter-section">
              <div className="filter-section-title">
                <strong>
                  Category
                </strong>

                <span>
                  {category ===
                  "All"
                    ? "All products"
                    : category}
                </span>
              </div>

              <div className="category-filters">
                {categories.map(
                  (item) => (
                    <button
                      key={
                        item
                      }
                      type="button"
                      className={
                        category ===
                        item
                          ? "filter-active"
                          : ""
                      }
                      onClick={() =>
                        updateCategory(
                          item,
                        )
                      }
                    >
                      {item}
                    </button>
                  ),
                )}
              </div>
            </div>

            <div className="filter-section">
              <div className="filter-section-title">
                <strong>
                  Price range
                </strong>

                <span>
                  {formatAED(
                    actualMinPrice,
                  )}{" "}
                  –{" "}
                  {formatAED(
                    actualMaxPrice,
                  )}
                </span>
              </div>

              <div className="range-slider">
                <div className="range-track" />

                <div
                  className="range-selected"
                  style={{
                    left:
                      maximumProductPrice >
                      0
                        ? `${
                            (
                              (actualMinPrice /
                                maximumProductPrice) *
                              100
                            ).toFixed(
                              2,
                            )
                          }%`
                        : "0%",

                    right:
                      maximumProductPrice >
                      0
                        ? `${
                            (
                              100 -
                              (actualMaxPrice /
                                maximumProductPrice) *
                                100
                            ).toFixed(
                              2,
                            )
                          }%`
                        : "0%",
                  }}
                />

                <input
                  type="range"
                  min="0"
                  max={
                    maximumProductPrice ||
                    1
                  }
                  value={
                    actualMinPrice
                  }
                  onChange={(
                    event,
                  ) =>
                    updateMinPrice(
                      event.target
                        .value,
                    )
                  }
                  className="range-input range-min"
                  aria-label="Minimum price"
                />

                <input
                  type="range"
                  min="0"
                  max={
                    maximumProductPrice ||
                    1
                  }
                  value={
                    actualMaxPrice
                  }
                  onChange={(
                    event,
                  ) =>
                    updateMaxPrice(
                      event.target
                        .value,
                    )
                  }
                  className="range-input range-max"
                  aria-label="Maximum price"
                />
              </div>

              <div className="price-current-values">
                <div>
                  <span>
                    Minimum
                  </span>

                  <strong>
                    {formatAED(
                      actualMinPrice,
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Maximum
                  </span>

                  <strong>
                    {formatAED(
                      actualMaxPrice,
                    )}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="store-content">
        <div className="shop-results-meta">
          <span>
            {loading
              ? "Loading..."
              : `${filteredProducts.length} products`}
          </span>

          {(search ||
            category !==
              "All" ||
            minPriceParam >
              0 ||
            maxPriceParam >
              0) && (
            <button
              type="button"
              className="clear-results"
              onClick={
                clearAllFilters
              }
            >
              Clear filters
            </button>
          )}
        </div>

        {loading && (
          <ProductSkeletonGrid />
        )}

        {!loading && error && (
          <div className="state-box">
            <h3>
              Products couldn't be loaded.
            </h3>

            <p>{error}</p>
          </div>
        )}

        {!loading &&
          !error &&
          filteredProducts.length ===
            0 && (
            <div className="state-box">
              <h3>
                No products found.
              </h3>

              <p>
                Try another search or
                adjust your filters.
              </p>

              <button
                type="button"
                className="primary-button store-reset-button"
                onClick={
                  clearAllFilters
                }
              >
                Show all products
              </button>
            </div>
          )}

        {!loading &&
          !error &&
          filteredProducts.length >
            0 && (
            <div className="product-grid">
              {filteredProducts.map(
                (product) => (
                  <ProductCard
                    key={
                      product.id
                    }
                    product={
                      product
                    }
                  />
                ),
              )}
            </div>
          )}
      </section>
    </main>
  );
}

/* =========================================================
   PRODUCT PAGE
========================================================= */

function ProductPage() {
  const { handle } =
    useParams();

  const navigate =
    useNavigate();

  const [product, setProduct] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [
    selectedImage,
    setSelectedImage,
  ] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadProduct() {
      try {
        const result =
          await getBrewingEdgeProduct(
            handle,
          );

        if (!active) {
          return;
        }

        if (!result) {
          setError(
            "Product not found.",
          );
          return;
        }

        setProduct(result);
      } catch (err) {
        if (!active) {
          return;
        }

        console.error(err);

        setError(
          err.message ||
            "Unable to load this product.",
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      active = false;
    };
  }, [handle]);

  if (loading) {
    return (
      <main className="product-page">
        <div className="product-loading">
          <div className="spinner" />

          <p>
            Loading product...
          </p>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="product-page">
        <div className="product-error">
          <p className="section-kicker">
            BREWING EDGE
          </p>

          <h1>
            Product unavailable.
          </h1>

          <p>
            {error ||
              "Product not found."}
          </p>

          <button
            type="button"
            className="primary-button"
            onClick={() =>
              navigate(
                "/shop",
              )
            }
          >
            Back to Shop
          </button>
        </div>
      </main>
    );
  }

  const images =
    product.images?.nodes
      ?.length > 0
      ? product.images
          .nodes
      : product.featuredImage
        ? [
            product.featuredImage,
          ]
        : [];

  const currentImage =
    images[
      selectedImage
    ] || images[0];

  const buyUrl =
    getBuyHorecaProductUrl(
      product,
    );

  return (
    <main className="product-page">
      <div className="product-breadcrumb">
        <Link to="/shop">
          Shop
        </Link>

        <span>/</span>

        <span>
          {product.title}
        </span>
      </div>

      <section className="product-detail">
        <div className="product-gallery">
          <div className="product-main-image">
            {currentImage ? (
              <img
                src={
                  currentImage.url
                }
                alt={
                  currentImage.altText ||
                  product.title
                }
              />
            ) : (
              <div className="product-image-fallback">
                <span>
                  BREWING EDGE
                </span>

                <strong>
                  {product.title}
                </strong>

                <small>
                  Product image
                  coming soon
                </small>
              </div>
            )}
          </div>

          {images.length >
            1 && (
            <div className="product-thumbnails">
              {images.map(
                (
                  image,
                  index,
                ) => (
                  <button
                    key={`${image.url}-${index}`}
                    type="button"
                    className={
                      selectedImage ===
                      index
                        ? "thumbnail-active"
                        : ""
                    }
                    onClick={() =>
                      setSelectedImage(
                        index,
                      )
                    }
                  >
                    <img
                      src={
                        image.url
                      }
                      alt={
                        image.altText ||
                        product.title
                      }
                    />
                  </button>
                ),
              )}
            </div>
          )}
        </div>

        <div className="product-information">
          <p className="product-kicker">
            {product.productType ||
              "BREWING EDGE"}
          </p>

          <h1>
            {product.title}
          </h1>

          <div className="product-price">
            {formatPriceRange(
              product.priceRange,
            )}
          </div>

          <div className="product-availability">
            <span
              className={
                product.availableForSale
                  ? "status-dot available-dot"
                  : "status-dot unavailable-dot"
              }
            />

            {product.availableForSale
              ? "In stock"
              : "Currently unavailable"}
          </div>

          {product.description && (
            <div className="product-description">
              <p>
                {product.description}
              </p>
            </div>
          )}

          <div className="product-actions">
            <a
              href={buyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="primary-button buy-button"
            >
              Buy on BuyHoreca →
            </a>

            <Link
              to="/shop"
              className="product-secondary-button"
            >
              Continue Shopping
            </Link>
          </div>

          <div className="product-information-list">
            <div>
              <span>
                Brand
              </span>

              <strong>
                {product.vendor ||
                  "Brewing Edge"}
              </strong>
            </div>

            <div>
              <span>
                Category
              </span>

              <strong>
                {product.productType ||
                  "Coffee Equipment"}
              </strong>
            </div>

            <div>
              <span>
                Purchase
              </span>

              <strong>
                BuyHoreca
              </strong>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

/* =========================================================
   CATEGORIES
========================================================= */

function CategoriesPage() {
  const [products, setProducts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        const data =
          await getBrewingEdgeProducts();

        setProducts(
          data?.products || [],
        );
      } catch (error) {
        console.error(
          "Categories load failed:",
          error,
        );
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  const categories =
    useMemo(() => {
      const values =
        products
          .map(
            (product) =>
              product.productType?.trim(),
          )
          .filter(Boolean);

      return [
        ...new Set(values),
      ];
    }, [products]);

  return (
    <main className="categories-page">
      <section className="categories-header">
        <p className="section-kicker">
          BREWING EDGE
        </p>

        <h1>
          Shop by category.
        </h1>

        <p>
          Explore Brewing Edge equipment
          by product type.
        </p>
      </section>

      {loading ? (
        <section className="categories-loading">
          Loading categories...
        </section>
      ) : (
        <section className="category-page-grid">
          {categories.map(
            (
              category,
              index,
            ) => (
              <Link
                key={
                  category
                }
                to={`/shop?category=${encodeURIComponent(
                  category,
                )}`}
                className="large-category-card"
              >
                <span>
                  {String(
                    index +
                      1,
                  ).padStart(
                    2,
                    "0",
                  )}
                </span>

                <div>
                  <h2>
                    {category}
                  </h2>

                  <p>
                    Explore the{" "}
                    {category.toLowerCase()}{" "}
                    collection.
                  </p>
                </div>

                <strong>
                  Explore →
                </strong>
              </Link>
            ),
          )}

          {!categories.length && (
            <div className="state-box">
              <h3>
                No categories found.
              </h3>

              <p>
                No product types are
                currently available
                in the Brewing Edge
                collection.
              </p>
            </div>
          )}
        </section>
      )}
    </main>
  );
}

/* =========================================================
   ABOUT
========================================================= */

function AboutPage() {
  useEffect(() => {
    document.title =
      "About Brewing Edge | Precision Coffee Equipment";
  }, []);

  return (
    <main className="about-page">
      <section className="about-hero">
        <div className="about-hero-copy">
          <p className="section-kicker">
            ABOUT BREWING EDGE
          </p>

          <h1>
            Built around
            <br />
            better brewing.
          </h1>

          <p>
            Brewing Edge is a coffee-focused
            collection presented through
            BuyHoreca, bringing together
            practical brewing equipment,
            coffee tools and accessories for
            people who take their coffee
            seriously.
          </p>
        </div>

        <div className="about-hero-image">
          <img
            src={aboutImage}
            alt="Brewing Edge coffee equipment"
          />
        </div>
      </section>

      <section className="about-story">
        <div className="about-story-label">
          <span>01</span>

          <strong>
            THE BRAND
          </strong>
        </div>

        <div className="about-story-copy">
          <h2>
            A focused coffee
            <br />
            collection.
          </h2>

          <p>
            Brewing Edge is presented through
            BuyHoreca as a focused selection of
            coffee and brewing equipment,
            including tools and accessories for
            different brewing workflows.
          </p>

          <p>
            BuyHoreca operates as the broader
            ecommerce platform supporting the
            collection, providing the ecommerce
            infrastructure behind the shopping
            experience.
          </p>

          <a
            href={BUYHORECA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-link"
          >
            Explore BuyHoreca →
          </a>
        </div>
      </section>

      <section className="about-values">
        <div className="about-value">
          <span>01</span>

          <h3>
            Precision
          </h3>

          <p>
            Tools chosen around consistency,
            repeatability and control.
          </p>
        </div>

        <div className="about-value">
          <span>02</span>

          <h3>
            Practical
          </h3>

          <p>
            Equipment designed to become part
            of a real brewing workflow.
          </p>
        </div>

        <div className="about-value">
          <span>03</span>

          <h3>
            Connected
          </h3>

          <p>
            A focused coffee collection
            connected to BuyHoreca's
            ecommerce infrastructure.
          </p>
        </div>
      </section>

      <section className="about-story-image-section">
        <div className="about-story-image">
          <img
            src={brandStoryImage}
            alt="Brewing Edge coffee workspace"
          />
        </div>

        <div className="about-story-image-copy">
          <p className="section-kicker">
            THE BREWING EDGE STORY
          </p>

          <h2>
            Equipment with
            <br />
            purpose.
          </h2>

          <p>
            Brewing Edge brings together coffee
            equipment and accessories selected
            around the practical needs of people
            who care about their brewing setup.
          </p>

          <p>
            This section can be expanded later
            with the official brand story,
            founder information, manufacturing
            details, certifications and other
            confirmed company information.
          </p>
        </div>
      </section>
    </main>
  );
}

/* =========================================================
   BREW GUIDES
========================================================= */

function BrewGuidesPage() {
  const guides = [
    {
      number: "01",
      category: "ESPRESSO",
      title:
        "Build a Better Espresso",
      description:
        "Learn the fundamentals of espresso preparation, from grind size and dose to extraction and consistency.",
    },

    {
      number: "02",
      category: "POUR OVER",
      title:
        "Dial In Your Pour Over",
      description:
        "Understand water temperature, grind size, pouring technique and brewing time to build a cleaner cup.",
    },

    {
      number: "03",
      category: "GRINDING",
      title:
        "Find the Right Grind",
      description:
        "Your grind size controls extraction. Learn how to adjust it for espresso, filter coffee and other brewing methods.",
    },

    {
      number: "04",
      category: "EQUIPMENT",
      title:
        "Choose the Right Gear",
      description:
        "A practical introduction to grinders, kettles, tampers, scales and other equipment used in better brewing.",
    },

    {
      number: "05",
      category: "WATER",
      title:
        "Water Matters",
      description:
        "Discover why water quality, temperature and mineral balance can affect the final cup.",
    },

    {
      number: "06",
      category: "TECHNIQUE",
      title:
        "Improve Your Brewing Routine",
      description:
        "Simple techniques and repeatable habits that help you get more consistent results every time you brew.",
    },
  ];

  useEffect(() => {
    document.title =
      "Brew Guides | Brewing Edge";

    setMeta(
      "description",
      "Coffee brewing guides from Brewing Edge covering espresso, pour over, grinding, equipment, water and brewing technique.",
    );
  }, []);

  return (
    <main className="guides-page">
      <section className="guides-hero">
        <div className="guides-hero-copy">
          <p className="section-kicker">
            BREWING EDGE
          </p>

          <h1>
            Brew better.
            <br />
            Understand more.
          </h1>

          <p>
            Practical guides for people who
            want more control over their coffee.
            Learn the fundamentals, understand
            your equipment and build a more
            consistent brewing routine.
          </p>

          <div className="guides-hero-actions">
            <a
              href="#guides"
              className="primary-button"
            >
              Explore Guides →
            </a>

            <Link
              to="/shop"
              className="product-secondary-button"
            >
              Shop Brewing Equipment
            </Link>
          </div>
        </div>

        <div className="guides-hero-image">
          <img
            src={guidesImage}
            alt="Brewing Edge pour over coffee setup"
          />
        </div>
      </section>

      <section
        className="guides-intro"
        id="guides"
      >
        <div>
          <p className="section-kicker">
            THE BASICS
          </p>

          <h2>
            Start with the
            <br />
            fundamentals.
          </h2>
        </div>

        <p>
          Great coffee is rarely about one
          expensive piece of equipment. It is
          about understanding the relationship
          between grind size, water,
          temperature, ratio, time and
          technique.
        </p>
      </section>

      <section className="guides-grid">
        {guides.map(
          (guide) => (
            <article
              key={
                guide.number
              }
              className="guide-card"
            >
              <div className="guide-card-top">
                <span>
                  {guide.number}
                </span>

                <small>
                  {guide.category}
                </small>
              </div>

              <div className="guide-card-body">
                <h3>
                  {guide.title}
                </h3>

                <p>
                  {guide.description}
                </p>
              </div>

              <button
                type="button"
                className="guide-read-button"
              >
                Guide coming soon →
              </button>
            </article>
          ),
        )}
      </section>

      <section className="guides-feature">
        <div className="guides-feature-image">
          <img
            src={
              philosophyImage
            }
            alt="Brewing Edge coffee brewing setup"
          />
        </div>

        <div className="guides-feature-copy">
          <p className="section-kicker">
            BREWING EDGE PHILOSOPHY
          </p>

          <h2>
            Consistency
            <br />
            beats guesswork.
          </h2>

          <p>
            The goal of every Brewing Edge guide
            is simple: understand what you are
            changing, why you are changing it,
            and how that change affects your cup.
          </p>

          <p>
            We will build this section out with
            detailed recipes, brewing ratios,
            equipment recommendations and
            step-by-step techniques as the
            Brewing Edge guide library grows.
          </p>

          <Link
            to="/shop"
            className="text-link"
          >
            Explore the equipment →
          </Link>
        </div>
      </section>

      <section className="guides-cta">
        <p className="section-kicker">
          READY TO BREW?
        </p>

        <h2>
          Find the equipment
          <br />
          for your workflow.
        </h2>

        <Link
          to="/shop"
          className="primary-button"
        >
          Shop Brewing Edge →
        </Link>
      </section>
    </main>
  );
}

/* =========================================================
   CONTACT
========================================================= */

function ContactPage() {
  useEffect(() => {
    document.title =
      "Contact Brewing Edge | BuyHoreca";
  }, []);

  return (
    <main className="contact-page">
      <section className="contact-header">
        <p className="section-kicker">
          CONTACT
        </p>

        <h1>
          Let's talk
          <br />
          coffee.
        </h1>

        <p>
          Brewing Edge is connected to
          BuyHoreca's UAE ecommerce operation.
          For purchasing, product support and
          business enquiries, contact the
          BuyHoreca team.
        </p>
      </section>

      <section className="contact-grid">
        <a
          href={`tel:${BUYHORECA_CONTACT.phone.replace(
            /\s/g,
            "",
          )}`}
          className="contact-card"
        >
          <span>
            PHONE
          </span>

          <strong>
            {BUYHORECA_CONTACT.phone}
          </strong>

          <small>
            Call BuyHoreca
          </small>
        </a>

        <a
          href={`tel:${BUYHORECA_CONTACT.mobile.replace(
            /\s/g,
            "",
          )}`}
          className="contact-card"
        >
          <span>
            MOBILE
          </span>

          <strong>
            {BUYHORECA_CONTACT.mobile}
          </strong>

          <small>
            Mobile enquiries
          </small>
        </a>

        <a
          href={`mailto:${BUYHORECA_CONTACT.email}`}
          className="contact-card"
        >
          <span>
            EMAIL
          </span>

          <strong>
            {BUYHORECA_CONTACT.email}
          </strong>

          <small>
            Send an enquiry
          </small>
        </a>

        <a
          href={BUYHORECA_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="contact-card"
        >
          <span>
            STORE
          </span>

          <strong>
            BuyHoreca.com
          </strong>

          <small>
            Visit parent store
          </small>
        </a>
      </section>

      <section className="contact-location">
        <div>
          <p className="section-kicker">
            LOCATION
          </p>

          <h2>
            Dubai, UAE
          </h2>

          <p>
            {BUYHORECA_CONTACT.address}
          </p>
        </div>

        <a
          href="https://www.google.com/maps/search/?api=1&query=13A+St+Al+Khabaisi+Area+Deira+Dubai+UAE"
          target="_blank"
          rel="noopener noreferrer"
          className="primary-button"
        >
          Open in Maps →
        </a>
      </section>
    </main>
  );
}

/* =========================================================
   PRODUCT CARD
========================================================= */

function ProductCard({
  product,
}) {
  const image =
    getProductImage(product);

  return (
    <article className="product-card">
      <Link
        to={`/product/${product.handle}`}
        className="product-image"
      >
        {image ? (
          <img
            src={image.url}
            alt={
              image.altText ||
              product.title
            }
            loading="lazy"
          />
        ) : (
          <div className="product-image-fallback">
            <span>
              BREWING EDGE
            </span>

            <strong>
              {product.title}
            </strong>

            <small>
              View product →
            </small>
          </div>
        )}
      </Link>

      <div className="product-content">
        <p className="product-category">
          {product.productType ||
            "Brewing Edge"}
        </p>

        <Link
          to={`/product/${product.handle}`}
          className="product-title"
        >
          {product.title}
        </Link>

        <div className="product-meta">
          <strong>
            {formatMoney(
              product.priceRange
                ?.minVariantPrice,
            )}
          </strong>

          <span
            className={
              product.availableForSale
                ? "available"
                : "unavailable"
            }
          >
            {product.availableForSale
              ? "Available"
              : "Unavailable"}
          </span>
        </div>

        <Link
          to={`/product/${product.handle}`}
          className="product-view-button"
        >
          View Product →
        </Link>
      </div>
    </article>
  );
}

/* =========================================================
   SKELETON
========================================================= */

function ProductSkeletonGrid() {
  return (
    <div className="product-grid">
      {Array.from({
        length: 8,
      }).map(
        (_, index) => (
          <div
            className="skeleton-card"
            key={index}
          >
            <div className="skeleton-image" />

            <div className="skeleton-text small" />

            <div className="skeleton-text" />

            <div className="skeleton-text price" />

            <div className="skeleton-button" />
          </div>
        ),
      )}
    </div>
  );
}

/* =========================================================
   FOOTER
========================================================= */

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-main">
        <div className="footer-brand-column">
          <Link
            to="/"
            className="footer-brewing-logo"
          >
            <img
              src={logo}
              alt="Brewing Edge"
            />
          </Link>

          <p>
            Precision coffee equipment
            for better brewing.
          </p>

          <a
            href={BUYHORECA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="footer-powered"
          >
            <span>
              Powered by
            </span>

            <img
              src={
                buyHorecaLogo
              }
              alt="BuyHoreca"
            />
          </a>
        </div>

        <div className="footer-column">
          <h3>
            Explore
          </h3>

          <Link to="/">
            Home
          </Link>

          <Link to="/shop">
            Shop
          </Link>

          <Link to="/categories">
            Categories
          </Link>

          <Link to="/about">
            About
          </Link>

          <Link to="/guides">
            Brew Guides
          </Link>

          <Link to="/contact">
            Contact
          </Link>
        </div>

        <div className="footer-column">
          <h3>
            BuyHoreca
          </h3>

          <a
            href={
              BUYHORECA_URL
            }
            target="_blank"
            rel="noopener noreferrer"
          >
            Main Store
          </a>

          <a
            href={`${BUYHORECA_URL}/pages/about-us`}
            target="_blank"
            rel="noopener noreferrer"
          >
            About BuyHoreca
          </a>

          <a
            href={`${BUYHORECA_URL}/pages/contact`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Contact
          </a>

          <a
            href={`${BUYHORECA_URL}/collections`}
            target="_blank"
            rel="noopener noreferrer"
          >
            All Collections
          </a>
        </div>

        <div className="footer-contact">
          <h3>
            Reach us
          </h3>

          <a
            href="https://www.google.com/maps/search/?api=1&query=13A+St+Al+Khabaisi+Area+Deira+Dubai+UAE"
            target="_blank"
            rel="noopener noreferrer"
          >
            {
              BUYHORECA_CONTACT.address
            }
          </a>

          <a
            href={`tel:${BUYHORECA_CONTACT.phone.replace(
              /\s/g,
              "",
            )}`}
          >
            {
              BUYHORECA_CONTACT.phone
            }
          </a>

          <a
            href={`tel:${BUYHORECA_CONTACT.mobile.replace(
              /\s/g,
              "",
            )}`}
          >
            {
              BUYHORECA_CONTACT.mobile
            }
          </a>

          <a
            href={`mailto:${BUYHORECA_CONTACT.email}`}
          >
            {
              BUYHORECA_CONTACT.email
            }
          </a>
        </div>
      </div>

      <div className="footer-bottom">
        <span>
          ©{" "}
          {new Date().getFullYear()}{" "}
          Brewing Edge
        </span>

        <span>
          A coffee-focused brand /
          collection powered by BuyHoreca
        </span>

        <a
          href={
            BUYHORECA_URL
          }
          target="_blank"
          rel="noopener noreferrer"
        >
          BuyHoreca.com →
        </a>
      </div>
    </footer>
  );
}

/* =========================================================
   404
========================================================= */

function NotFoundPage() {
  return (
    <main className="simple-page">
      <p className="section-kicker">
        404
      </p>

      <h1>
        Page not found.
      </h1>

      <p>
        The page you're looking for
        doesn't exist.
      </p>

      <Link
        to="/"
        className="primary-button"
      >
        Back Home
      </Link>
    </main>
  );
}

/* =========================================================
   SEO
========================================================= */

function RouteSEO() {
  const location =
    useLocation();

  const [product, setProduct] =
    useState(null);

  const isProduct =
    location.pathname.startsWith(
      "/product/",
    );

  const handle =
    isProduct
      ? location.pathname.split(
          "/",
        )[2]
      : null;

  useEffect(() => {
    if (!handle) {
      setProduct(null);
      return;
    }

    let active = true;

    async function loadProduct() {
      try {
        const result =
          await getBrewingEdgeProduct(
            handle,
          );

        if (active) {
          setProduct(result);
        }
      } catch {
        if (active) {
          setProduct(null);
        }
      }
    }

    loadProduct();

    return () => {
      active = false;
    };
  }, [handle]);

  useEffect(() => {
    const baseUrl =
      window.location.origin;

    let title =
      "Brewing Edge | Precision Coffee Equipment";

    let description =
      "Shop Brewing Edge coffee equipment, brewing tools and accessories powered by BuyHoreca.";

    if (
      location.pathname ===
      "/shop"
    ) {
      title =
        "Shop Brewing Edge | Coffee Equipment & Brewing Tools";

      description =
        "Explore Brewing Edge coffee equipment, grinders, kettles, drippers, tampers and brewing accessories.";
    }

    if (
      location.pathname ===
      "/categories"
    ) {
      title =
        "Brewing Edge Categories | Coffee Equipment";

      description =
        "Explore Brewing Edge coffee equipment and accessories by category.";
    }

    if (
      location.pathname ===
      "/about"
    ) {
      title =
        "About Brewing Edge | Precision Coffee Equipment";

      description =
        "Discover Brewing Edge, a focused coffee equipment collection connected to BuyHoreca's UAE ecommerce operation.";
    }

    if (
      location.pathname ===
      "/guides"
    ) {
      title =
        "Brew Guides | Brewing Edge";

      description =
        "Coffee brewing guides covering espresso, pour over, grinding, equipment, water and brewing technique.";
    }

    if (
      location.pathname ===
      "/contact"
    ) {
      title =
        "Contact Brewing Edge | BuyHoreca";

      description =
        "Contact Brewing Edge through BuyHoreca for product, purchase and business enquiries.";
    }

    if (
      product &&
      isProduct
    ) {
      title =
        `${product.title} | Brewing Edge`;

      description =
        stripHtml(
          product.description ||
            `Shop ${product.title} from Brewing Edge through BuyHoreca.`,
        ).slice(
          0,
          155,
        );
    }

    document.title =
      title;

    setMeta(
      "description",
      description,
    );

    setMeta(
      "og:title",
      title,
      "property",
    );

    setMeta(
      "og:description",
      description,
      "property",
    );

    setMeta(
      "og:type",
      "website",
      "property",
    );

    setMeta(
      "og:url",
      `${baseUrl}${location.pathname}`,
      "property",
    );

    setMeta(
      "twitter:card",
      "summary_large_image",
    );

    setMeta(
      "twitter:title",
      title,
    );

    setMeta(
      "twitter:description",
      description,
    );

    let schema =
      document.getElementById(
        "brewing-edge-schema",
      );

    if (!schema) {
      schema =
        document.createElement(
          "script",
        );

      schema.id =
        "brewing-edge-schema";

      schema.type =
        "application/ld+json";

      document.head.appendChild(
        schema,
      );
    }

    const graph = [
      {
        "@type":
          "Organization",

        "@id":
          `${baseUrl}/#organization`,

        name:
          "Brewing Edge",

        url:
          baseUrl,

        parentOrganization: {
          "@type":
            "Organization",

          name:
            "BuyHoreca",

          url:
            BUYHORECA_URL,
        },
      },

      {
        "@type":
          "WebSite",

        "@id":
          `${baseUrl}/#website`,

        name:
          "Brewing Edge",

        url:
          baseUrl,

        publisher: {
          "@id":
            `${baseUrl}/#organization`,
        },

        potentialAction: {
          "@type":
            "SearchAction",

          target: {
            "@type":
              "EntryPoint",

            urlTemplate:
              `${baseUrl}/shop?search={search_term_string}`,
          },

          "query-input":
            "required name=search_term_string",
        },
      },
    ];

    if (
      product &&
      isProduct
    ) {
      graph.push({
        "@type":
          "Product",

        name:
          product.title,

        description:
          stripHtml(
            product.description ||
              "",
          ),

        brand: {
          "@type":
            "Brand",

          name:
            product.vendor ||
            "Brewing Edge",
        },

        offers: {
          "@type":
            "Offer",

          price:
            product.priceRange
              ?.minVariantPrice
              ?.amount,

          priceCurrency:
            product.priceRange
              ?.minVariantPrice
              ?.currencyCode ||
            "AED",

          availability:
            product.availableForSale
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",

          url:
            `${baseUrl}${location.pathname}`,
        },
      });
    }

    schema.textContent =
      JSON.stringify({
        "@context":
          "https://schema.org",

        "@graph":
          graph,
      });

    let canonical =
      document.querySelector(
        'link[rel="canonical"]',
      );

    if (!canonical) {
      canonical =
        document.createElement(
          "link",
        );

      canonical.rel =
        "canonical";

      document.head.appendChild(
        canonical,
      );
    }

    canonical.href =
      `${baseUrl}${location.pathname}`;
  }, [
    location.pathname,
    product,
    isProduct,
  ]);

  return null;
}

/* =========================================================
   HELPERS
========================================================= */

function getProductImage(
  product,
) {
  if (
    product?.featuredImage?.url
  ) {
    return product.featuredImage;
  }

  if (
    product?.images?.nodes
      ?.length
  ) {
    return product.images.nodes[0];
  }

  return null;
}

function formatMoney(
  price,
) {
  if (!price) {
    return "—";
  }

  return new Intl.NumberFormat(
    "en-AE",
    {
      style:
        "currency",

      currency:
        price.currencyCode ||
        "AED",

      maximumFractionDigits: 2,
    },
  ).format(
    Number(
      price.amount,
    ),
  );
}

function formatPriceRange(
  range,
) {
  const min =
    formatMoney(
      range.minVariantPrice,
    );

  const max =
    formatMoney(
      range.maxVariantPrice,
    );

  return min === max
    ? min
    : `${min} – ${max}`;
}

function formatAED(
  amount,
) {
  return new Intl.NumberFormat(
    "en-AE",
    {
      style:
        "currency",

      currency:
        "AED",

      maximumFractionDigits: 0,
    },
  ).format(
    Number(
      amount || 0,
    ),
  );
}

function stripHtml(
  html,
) {
  if (!html) {
    return "";
  }

  const div =
    document.createElement(
      "div",
    );

  div.innerHTML =
    html;

  return (
    div.textContent ||
    div.innerText ||
    ""
  );
}

function setMeta(
  name,
  content,
  attribute = "name",
) {
  let tag =
    document.querySelector(
      `meta[${attribute}="${name}"]`,
    );

  if (!tag) {
    tag =
      document.createElement(
        "meta",
      );

    tag.setAttribute(
      attribute,
      name,
    );

    document.head.appendChild(
      tag,
    );
  }

  tag.setAttribute(
    "content",
    content,
  );
}

function ScrollToTop() {
  const {
    pathname,
  } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [pathname]);

  return null;
}

export default App;