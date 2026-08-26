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
import aboutImage from "./assets/brewing-edge-about.jpg";
import brandStoryImage from "./assets/brewing-edge-brand-story.jpg";
import guidesImage from "./assets/brewing-edge-guides.jpg";
import philosophyImage from "./assets/brewing-edge-philosophy.jpg";
import "./App.css";

const BUYHORECA_URL = "https://buyhoreca.com";
const CONTACT = {
  address: "13A St. Al Khabaisi Area - Deira - Dubai - U.A.E",
  phone: "+971 4 396 6692",
  mobile: "+971 56 533 4464",
  email: "support@buyhoreca.com",
};

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

function App() {
  return (
    <BrowserRouter basename={BASE || undefined}>
      <ScrollToTop />
      <RouteSEO />
      <div className="site-shell">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/product/:handle" element={<ProductPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/guides" element={<BrewGuidesPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const inputRef = useRef(null);
  const searchWrapRef = useRef(null);

  useEffect(() => {
    let alive = true;
    getBrewingEdgeProducts()
      .then((data) => alive && setProducts(data?.products || []))
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") {
        setSearchOpen(false);
        setMenuOpen(false);
      }
    };
    const onPointer = (event) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
    };
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  const results = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return [];
    return products.filter((product) =>
      [product.title, product.productType, product.vendor, product.description]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term)
    ).slice(0, 6);
  }, [products, search]);

  const openSearch = () => {
    setSearchOpen(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const submitSearch = (event) => {
    event.preventDefault();
    const term = search.trim();
    if (!term) return openSearch();
    navigate(`/shop?search=${encodeURIComponent(term)}`);
    setSearchOpen(false);
  };

  return (
    <header className={`navbar ${location.pathname === "/" ? "navbar-home" : "navbar-internal"}`}>
      <div className="navbar-inner">
        <Link to="/" className="brand" aria-label="Brewing Edge home">
          <img src={logo} alt="Brewing Edge" />
        </Link>

        <button
          className={`mobile-menu-button ${menuOpen ? "is-open" : ""}`}
          onClick={() => setMenuOpen((value) => !value)}
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
        >
          <span /><span /><span />
        </button>

        <div className={`nav-pill ${menuOpen ? "nav-mobile-open" : ""}`}>
          <nav className="nav-links" aria-label="Primary navigation">
            <Link to="/">Home</Link>
            <Link to="/shop">Shop</Link>
            <Link to="/categories">Categories</Link>
            <Link to="/about">About</Link>
            <Link to="/guides">Brew Guides</Link>
            <Link to="/contact">Contact</Link>
          </nav>

          <div className="header-search-wrap" ref={searchWrapRef}>
            <button className="header-search-button" onClick={openSearch} aria-expanded={searchOpen}>
              <span>⌕</span><span>Search</span>
            </button>
            {searchOpen && (
              <div className="global-search-panel">
                <form className="global-search-form" onSubmit={submitSearch}>
                  <span className="global-search-icon">⌕</span>
                  <input
                    ref={inputRef}
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search the collection..."
                    type="search"
                    autoComplete="off"
                  />
                  {search && (
                    <button type="button" className="global-search-clear" onClick={() => setSearch("")} aria-label="Clear search">×</button>
                  )}
                </form>
                {search.trim() ? (
                  <div className="global-search-results">
                    {results.length ? results.map((product) => (
                      <Link key={product.id} to={`/product/${product.handle}`} className="search-result">
                        <div className="search-result-image">
                          {getProductImage(product) ? <img src={getProductImage(product).url} alt={product.title} loading="lazy" decoding="async" /> : <span>BE</span>}
                        </div>
                        <div className="search-result-info">
                          <strong>{product.title}</strong>
                          <span>{product.productType || "Brewing Edge"}</span>
                          <b>{formatMoney(product.priceRange?.minVariantPrice)}</b>
                        </div>
                        <span className="search-result-arrow">↗</span>
                      </Link>
                    )) : (
                      <div className="search-no-results">
                        <strong>No exact match.</strong>
                        <span>Try grinder, kettle, dripper or tamper.</span>
                        <Link to={`/shop?search=${encodeURIComponent(search.trim())}`}>Search the full collection →</Link>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="search-suggestions">
                    <span>Explore by craft</span>
                    <div>
                      {["grinder", "kettle", "dripper", "tamper"].map((term) => (
                        <button key={term} type="button" onClick={() => setSearch(term)}>{term}</button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <Link className="nav-shop-button" to="/shop">Shop now <span>↗</span></Link>
        </div>
      </div>
    </header>
  );
}

function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBrewingEdgeProducts()
      .then((data) => setProducts(data?.products || []))
      .catch((error) => console.error(error))
      .finally(() => setLoading(false));
  }, []);

  const featured = products.slice(0, 4);

  return (
    <main className="home">
      <section className="hero">
        <video className="hero-video" autoPlay muted loop playsInline preload="metadata" aria-hidden="true">
          <source src={heroVideo} type="video/mp4" />
        </video>
        <div className="hero-overlay" />
        <div className="hero-grain" />
        <div className="hero-inner">
          <div className="hero-copy">
            <div className="eyebrow"><span /> Precision coffee equipment</div>
            <h1>Your coffee.<br /><em>Your edge.</em></h1>
            <p>Precision equipment for people who care about consistency, control and the quality of every cup.</p>
            <div className="hero-actions">
              <Link className="button button-light" to="/shop">Shop Brewing Edge <span>↗</span></Link>
              <a className="button button-ghost" href="#story">Explore the story <span>↓</span></a>
            </div>
          </div>
        </div>
        <div className="hero-footer">
          <span>Scroll to explore</span>
          <div className="scroll-indicator"><i /></div>
          <span>Est. for the detail-obsessed</span>
        </div>
      </section>

      <section className="manifesto" id="story">
        <div className="section-shell manifesto-inner">
          <p className="eyebrow eyebrow-dark">The Brewing Edge</p>
          <h2>Good coffee is a ritual.<br /><span>Great coffee is intentional.</span></h2>
          <p className="manifesto-copy">We believe the equipment behind the cup should feel as considered as the coffee itself — precise, tactile and built around the details that matter.</p>
          <div className="manifesto-line"><span>Precision</span><i /><span>Control</span><i /><span>Craft</span></div>
        </div>
      </section>

      <EditorialStory />

      <section className="principles">
        <div className="section-shell">
          <div className="section-intro">
            <div><p className="eyebrow">The difference</p><h2>Built around<br /><em>the details.</em></h2></div>
            <p>Every choice has a purpose. Brewing Edge brings together the tools that let you control the variables between grind, extraction and the final cup.</p>
          </div>
          <div className="principle-grid">
            {[
              ["01", "Precision", "Fine control over the variables that shape your cup.", philosophyImage],
              ["02", "Consistency", "Repeat the recipe. Refine the result. Make every brew count.", aboutImage],
              ["03", "Craft", "Tools that respect the ritual and the person behind it.", brandStoryImage],
            ].map(([number, title, copy, image]) => (
              <article className="principle-card" key={number}>
                <div className="principle-image"><img src={image} alt="" loading="lazy" /></div>
                <div className="principle-meta"><span>{number}</span><span>Brewing Edge</span></div>
                <h3>{title}</h3><p>{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="collection-intro">
        <div className="collection-intro-bg" />
        <div className="section-shell collection-intro-inner">
          <p className="eyebrow">The collection</p>
          <h2>What gives you<br /><em>the edge?</em></h2>
          <p>Equipment selected for control, consistency and the way you actually brew.</p>
          <Link className="button button-light" to="/shop">Explore the collection <span>↗</span></Link>
        </div>
      </section>

      <section className="featured-products" id="featured">
        <div className="section-shell">
          <div className="section-heading-row">
            <div><p className="eyebrow eyebrow-dark">Selected equipment</p><h2>Made to <em>perform.</em></h2></div>
            <Link className="text-link dark-link" to="/shop">View all products <span>↗</span></Link>
          </div>
          {loading ? <ProductSkeletons count={4} /> : featured.length ? (
            <div className="product-grid">{featured.map((product, index) => <ProductCard key={product.id} product={product} index={index} />)}</div>
          ) : (
            <EmptyState title="The collection is loading." copy="Connect the Brewing Edge Shopify collection to reveal the equipment." />
          )}
        </div>
      </section>

      <section className="guides-feature">
        <div className="guides-image"><img src={guidesImage} alt="Brewing coffee" loading="lazy" /></div>
        <div className="guides-copy">
          <p className="eyebrow eyebrow-dark">The ritual continues</p>
          <h2>Know your brew.<br /><em>Own your edge.</em></h2>
          <p>Practical brewing knowledge, technique and equipment guidance for people who want to understand what changes the cup — and why.</p>
          <Link className="button button-dark" to="/guides">Explore Brew Guides <span>↗</span></Link>
        </div>
      </section>

      <section className="brand-close">
        <div className="section-shell">
          <p className="eyebrow">Brewing Edge by BuyHoreca</p>
          <h2>Professional equipment.<br /><em>Personal ritual.</em></h2>
          <p>Backed by BuyHoreca, built for people who care about the craft.</p>
          <div className="brand-close-actions">
            <Link className="button button-light" to="/about">Discover Brewing Edge <span>↗</span></Link>
            <a className="text-link light-link" href={BUYHORECA_URL} target="_blank" rel="noreferrer">Visit BuyHoreca <span>↗</span></a>
          </div>
        </div>
      </section>
    </main>
  );
}

function EditorialStory() {
  return (
    <section className="editorial-story">
      <div className="section-shell editorial-grid">
        <div className="editorial-image editorial-image-large"><img src={brandStoryImage} alt="Brewing Edge brand story" loading="lazy" /></div>
        <div className="editorial-copy">
          <p className="eyebrow eyebrow-dark">01 — The philosophy</p>
          <h2>Designed for people who <em>notice.</em></h2>
          <p>Brewing Edge is built around a simple idea: the right equipment should disappear into the ritual and make the difference obvious in the cup.</p>
          <Link className="text-link dark-link" to="/about">Read the story <span>↗</span></Link>
        </div>
        <div className="editorial-image editorial-image-small"><img src={philosophyImage} alt="Brewing Edge philosophy" loading="lazy" /></div>
      </div>
    </section>
  );
}

function ShopPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [params, setParams] = useSearchParams();
  const search = params.get("search") || "";
  const category = params.get("category") || "all";
  const [sort, setSort] = useState("featured");

  useEffect(() => {
    getBrewingEdgeProducts()
      .then((data) => setProducts(data?.products || []))
      .catch((err) => setError(err.message || "Unable to load the collection."))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const values = products.map((p) => p.productType).filter(Boolean);
    return ["all", ...new Set(values)];
  }, [products]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    let list = products.filter((product) => {
      const matchesSearch = !term || [product.title, product.productType, product.vendor, product.description].filter(Boolean).join(" ").toLowerCase().includes(term);
      const matchesCategory = category === "all" || product.productType === category;
      return matchesSearch && matchesCategory;
    });
    if (sort === "price-low") list = [...list].sort((a, b) => Number(a.priceRange?.minVariantPrice?.amount || 0) - Number(b.priceRange?.minVariantPrice?.amount || 0));
    if (sort === "price-high") list = [...list].sort((a, b) => Number(b.priceRange?.minVariantPrice?.amount || 0) - Number(a.priceRange?.minVariantPrice?.amount || 0));
    if (sort === "name") list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    return list;
  }, [products, search, category, sort]);

  const setCategory = (value) => {
    const next = new URLSearchParams(params);
    if (value === "all") next.delete("category"); else next.set("category", value);
    setParams(next);
  };

  return (
    <main className="internal-page">
      <PageHero eyebrow="The collection" title="Equipment with an <em>edge.</em>" copy="Explore precision coffee equipment selected for control, consistency and better brewing." />
      <section className="shop-content section-shell">
        <div className="shop-toolbar">
          <div className="category-filters" aria-label="Product categories">
            {categories.map((item) => <button className={category === item ? "active" : ""} key={item} onClick={() => setCategory(item)}>{item === "all" ? "All" : item}</button>)}
          </div>
          <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort products">
            <option value="featured">Featured</option><option value="name">Name</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option>
          </select>
        </div>
        {search && <div className="search-summary">Showing results for <strong>“{search}”</strong></div>}
        {error ? <EmptyState title="We couldn't load the collection." copy={error} /> : loading ? <ProductSkeletons count={8} /> : filtered.length ? <div className="product-grid shop-grid">{filtered.map((product, index) => <ProductCard key={product.id} product={product} index={index} />)}</div> : <EmptyState title="Nothing matched that search." copy="Try a broader term or browse the complete collection." action={<Link className="button button-dark" to="/shop">View all equipment</Link>} />}
      </section>
    </main>
  );
}

function ProductCard({ product }) {
  const image = getProductImage(product);

  return (
    <article className="product-card">
      <Link
        to={`/product/${product.handle}`}
        className="product-image"
      >
        {image ? (
          <img
            src={image.url}
            alt={image.altText || product.title}
            loading="lazy"
            decoding="async"
            width={image.width || undefined}
            height={image.height || undefined}
          />
        ) : (
          <div className="product-image-fallback">
            <span>BREWING EDGE</span>
            <strong>{product.title}</strong>
            <small>View product →</small>
          </div>
        )}
      </Link>

      <div className="product-content">
        <p className="product-category">
          {product.productType || "Brewing Edge"}
        </p>

        <Link
          to={`/product/${product.handle}`}
          className="product-title"
        >
          {product.title}
        </Link>

        <div className="product-meta">
          <strong>
            {formatMoney(product.priceRange?.minVariantPrice)}
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

function ProductSkeletons({ count }) {
  return <div className="product-grid">{Array.from({ length: count }, (_, index) => <div className="product-skeleton" key={index}><div /><span /><b /></div>)}</div>;
}

function ProductPage() {
  const { handle } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState({});

  useEffect(() => {
    setLoading(true);
    getBrewingEdgeProduct(handle)
      .then((data) => {
        setProduct(data);
        if (data?.options?.length) {
          const initial = {};
          data.options.forEach((option) => { initial[option.name] = option.optionValues?.[0]?.name; });
          setSelected(initial);
        }
      })
      .catch((err) => setError(err.message || "Unable to load this product."))
      .finally(() => setLoading(false));
  }, [handle]);

  if (loading) return <main className="internal-page"><PageHero eyebrow="Brewing Edge" title="Loading <em>product.</em>" copy="Preparing the details." /><section className="section-shell product-loading"><div className="loading-block" /></section></main>;
  if (error || !product) return <main className="internal-page"><EmptyState title="Product not found." copy={error || "This product is no longer part of the Brewing Edge collection."} action={<Link className="button button-dark" to="/shop">Back to collection</Link>} /></main>;

  const image = getProductImage(product);
  const gallery = product.images?.nodes?.length ? product.images.nodes : image ? [image] : [];
  const selectedVariant = findVariant(product.variants?.nodes || [], selected);
  const buyUrl = getBuyHorecaProductUrl(product);

  return (
    <main className="internal-page product-page">
      <div className="section-shell product-breadcrumb"><Link to="/shop">Collection</Link><span>/</span><span>{product.title}</span></div>
      <section className="section-shell product-detail">
        <div className="product-gallery">
          {gallery.slice(0, 4).map((item, index) => <div className={`gallery-item ${index === 0 ? "gallery-primary" : ""}`} key={`${item.url}-${index}`}><img src={item.url} alt={item.altText || product.title} loading={index === 0 ? "eager" : "lazy"} decoding="async" width={item.width || undefined} height={item.height || undefined} /></div>)}
        </div>
        <div className="product-detail-copy">
          <p className="eyebrow eyebrow-dark">{product.productType || "Brewing Edge equipment"}</p>
          <h1>{product.title}</h1>
          <div className="product-price">{formatMoney(selectedVariant?.price || product.priceRange?.minVariantPrice)}</div>
          <p className="product-description">{product.description}</p>

          {product.options?.map((option) => (
            <div className="option-group" key={option.name}>
              <label>{option.name}</label>
              <div className="option-values">
                {option.optionValues?.map((value) => <button key={value.name} className={selected[option.name] === value.name ? "selected" : ""} onClick={() => setSelected((current) => ({ ...current, [option.name]: value.name }))}>{value.name}</button>)}
              </div>
            </div>
          ))}

          <a className="button button-dark button-wide" href={buyUrl} target="_blank" rel="noreferrer">Shop on BuyHoreca <span>↗</span></a>
          <p className="buy-note">Secure checkout and fulfilment are handled by BuyHoreca.</p>

          <div className="product-details-list">
            <details open><summary>Product details <span>+</span></summary><div dangerouslySetInnerHTML={{ __html: product.descriptionHtml || product.description || "" }} /></details>
            <details><summary>Availability <span>+</span></summary><p>{product.availableForSale ? "Available through BuyHoreca." : "Currently unavailable. Please check back soon."}</p></details>
            <details><summary>Shipping & support <span>+</span></summary><p>For orders, delivery and product support, contact BuyHoreca directly.</p></details>
          </div>
        </div>
      </section>
    </main>
  );
}

function CategoriesPage() {
  const categories = [
    ["Espresso", "Machines, grinders and precision tools for espresso.", philosophyImage],
    ["Pour Over", "Kettles, drippers and scales for controlled extraction.", guidesImage],
    ["The Details", "The small tools that make a measurable difference.", aboutImage],
  ];
  return <main className="internal-page"><PageHero eyebrow="Explore by craft" title="Find your <em>method.</em>" copy="A considered collection, organised around the way you brew." /><section className="section-shell category-grid">{categories.map(([title, copy, image]) => <Link className="category-card" to="/shop" key={title}><img src={image} alt="" /><div><span>Explore</span><h2>{title}</h2><p>{copy}</p><b>View equipment ↗</b></div></Link>)}</section></main>;
}

function AboutPage() {
  return (
    <main className="internal-page">
      <PageHero eyebrow="The brand" title="Built around <em>the brew.</em>" copy="Brewing Edge exists for the people who care about the details between the first grind and the final sip." />
      <section className="section-shell about-lead"><div className="about-image"><img src={aboutImage} alt="Brewing Edge" /></div><div><p className="eyebrow eyebrow-dark">Our philosophy</p><h2>Precision should feel <em>natural.</em></h2><p>We believe good equipment shouldn't complicate coffee. It should give you more control, better feedback and the confidence to repeat what works.</p><p>Brewing Edge brings that philosophy into a focused collection of equipment selected for serious home brewers and professionals alike.</p></div></section>
      <section className="section-shell about-story"><div><p className="eyebrow eyebrow-dark">The edge</p><h2>Small variables.<br /><em>Big difference.</em></h2></div><img src={brandStoryImage} alt="Brewing Edge story" loading="lazy" /></section>
      <section className="brand-close"><div className="section-shell"><p className="eyebrow">Part of BuyHoreca</p><h2>Built with hospitality<br /><em>in mind.</em></h2><p>Brewing Edge is backed by the equipment expertise and support of BuyHoreca.</p><a className="button button-light" href={BUYHORECA_URL} target="_blank" rel="noreferrer">Visit BuyHoreca <span>↗</span></a></div></section>
    </main>
  );
}

function BrewGuidesPage() {
  const guides = [
    ["Dial in your grinder", "Start with grind size, then control the variables that follow.", "Grind size • Extraction", guidesImage],
    ["Build a repeatable recipe", "A simple framework for making your best cup repeatable.", "Recipe • Consistency", philosophyImage],
    ["Choose your equipment", "Understand which tools actually change the brew — and which don't.", "Equipment • Technique", aboutImage],
  ];
  return <main className="internal-page"><PageHero eyebrow="Knowledge" title="Brew with <em>intention.</em>" copy="Guides for understanding the variables, equipment and technique behind a better cup." /><section className="section-shell guides-grid">{guides.map(([title, copy, tags, image]) => <article className="guide-card" key={title}><img src={image} alt="" loading="lazy" /><div><span>{tags}</span><h2>{title}</h2><p>{copy}</p><button className="text-link dark-link" type="button">Read guide <span>↗</span></button></div></article>)}</section></main>;
}

function ContactPage() {
  return <main className="internal-page"><PageHero eyebrow="Contact" title="Let's talk <em>coffee.</em>" copy="Questions about equipment, orders or the Brewing Edge collection? We're here to help." /><section className="section-shell contact-grid"><div><p className="eyebrow eyebrow-dark">BuyHoreca</p><h2>Professional equipment.<br /><em>Real support.</em></h2><p>Brewing Edge is supported by BuyHoreca from Dubai. Reach out for product, order and hospitality equipment enquiries.</p></div><div className="contact-details"><ContactRow label="Visit" value={CONTACT.address} /><ContactRow label="Phone" value={CONTACT.phone} href={`tel:${CONTACT.phone.replace(/\s/g, "")}`} /><ContactRow label="Mobile" value={CONTACT.mobile} href={`tel:${CONTACT.mobile.replace(/\s/g, "")}`} /><ContactRow label="Email" value={CONTACT.email} href={`mailto:${CONTACT.email}`} /></div></section></main>;
}

function ContactRow({ label, value, href }) {
  return <div className="contact-row"><span>{label}</span>{href ? <a href={href}>{value} ↗</a> : <p>{value}</p>}</div>;
}

function PageHero({ eyebrow, title, copy }) {
  return <section className="page-hero"><div className="section-shell page-hero-inner"><p className="eyebrow">{eyebrow}</p><h1 dangerouslySetInnerHTML={{ __html: title }} /><p>{copy}</p></div></section>;
}

function EmptyState({ title, copy, action }) {
  return <div className="empty-state section-shell"><p className="eyebrow eyebrow-dark">Brewing Edge</p><h2>{title}</h2><p>{copy}</p>{action}</div>;
}

function Footer() {
  return <footer className="footer"><div className="section-shell"><div className="footer-top"><div><img src={logo} alt="Brewing Edge" className="footer-logo" /><p>Precision coffee equipment for people who care about the details.</p></div><div className="footer-links"><div><span>Explore</span><Link to="/shop">Shop</Link><Link to="/categories">Categories</Link><Link to="/guides">Brew Guides</Link></div><div><span>Brand</span><Link to="/about">About</Link><Link to="/contact">Contact</Link><a href={BUYHORECA_URL} target="_blank" rel="noreferrer">BuyHoreca ↗</a></div><div><span>Contact</span><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a><a href={`tel:${CONTACT.phone.replace(/\s/g, "")}`}>{CONTACT.phone}</a><p>{CONTACT.address}</p></div></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Brewing Edge</span><span>By BuyHoreca</span><span>Precision • Control • Craft</span></div></div></footer>;
}

function findVariant(variants, selected) {
  if (!variants.length) return null;
  return variants.find((variant) => variant.selectedOptions?.every((option) => selected[option.name] === option.value)) || variants[0];
}

function getProductImage(product) {
  if (product?.featuredImage?.url) return product.featuredImage;
  if (product?.images?.nodes?.length) return product.images.nodes[0];
  if (product?.images?.length) return product.images[0];
  return null;
}

function stripHtml(value) {
  if (!value) return "";
  const wrapper = document.createElement("div");
  wrapper.innerHTML = value;
  return wrapper.textContent || wrapper.innerText || "";
}

function formatMoney(money) {
  if (!money?.amount) return "—";
  try {
    return new Intl.NumberFormat("en-AE", { style: "currency", currency: money.currencyCode || "AED", maximumFractionDigits: 2 }).format(Number(money.amount));
  } catch {
    return `${money.currencyCode || "AED"} ${Number(money.amount).toFixed(2)}`;
  }
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return null;
}

function RouteSEO() {
  const location = useLocation();
  const [product, setProduct] = useState(null);

  const pathname = location.pathname || "/";
  const search = location.search || "";
  const isProduct = pathname.startsWith("/product/");
  const handle = isProduct ? pathname.split("/")[2] : null;
  const isShopQuery = pathname === "/shop" && Boolean(search);
  const knownRoutes = new Set([
    "/",
    "/shop",
    "/categories",
    "/about",
    "/guides",
    "/contact",
  ]);
  const isKnownRoute = knownRoutes.has(pathname) || isProduct;

  useEffect(() => {
    if (!handle) {
      setProduct(null);
      return undefined;
    }

    let alive = true;

    getBrewingEdgeProduct(handle)
      .then((result) => {
        if (alive) setProduct(result);
      })
      .catch(() => {
        if (alive) setProduct(null);
      });

    return () => {
      alive = false;
    };
  }, [handle]);

  useEffect(() => {
    const basePath = BASE || "";
    const origin = window.location.origin.replace(/\/$/, "");
    const cleanPath = pathname === "/" ? "/" : pathname.replace(/\/+$/, "");
    const canonicalUrl = `${origin}${basePath}${cleanPath === "/" ? "/" : cleanPath}`;
    const siteBase = `${origin}${basePath}`;

    let title = "Brewing Edge | Precision Coffee Equipment";
    let description =
      "Explore Brewing Edge coffee equipment, brewing tools and accessories through BuyHoreca — a focused collection built for better brewing.";
    let type = "website";
    let robots = "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1";
    let image = `${siteBase}/og-image.png`;

    if (pathname === "/shop") {
      title = "Shop Brewing Edge | Coffee Equipment & Brewing Tools";
      description =
        "Shop the Brewing Edge collection of coffee equipment, grinders, kettles, drippers, tampers and brewing accessories through BuyHoreca.";
    } else if (pathname === "/categories") {
      title = "Brewing Edge Categories | Coffee Equipment";
      description =
        "Explore Brewing Edge coffee equipment and brewing accessories by category, connected to the BuyHoreca ecommerce collection.";
    } else if (pathname === "/about") {
      title = "About Brewing Edge | Coffee Equipment by BuyHoreca";
      description =
        "Discover Brewing Edge, a focused coffee equipment collection created for the BuyHoreca ecommerce ecosystem.";
    } else if (pathname === "/guides") {
      title = "Coffee Brew Guides | Brewing Edge";
      description =
        "Learn espresso, pour-over, grinding, water and brewing fundamentals with Brewing Edge coffee guides.";
    } else if (pathname === "/contact") {
      title = "Contact Brewing Edge | BuyHoreca UAE";
      description =
        "Contact Brewing Edge through BuyHoreca for product, purchasing and business enquiries in the UAE.";
    } else if (product && isProduct) {
      title = `${product.title} | Brewing Edge`;
      description =
        stripHtml(product.description || `Shop ${product.title} from Brewing Edge through BuyHoreca.`)
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 160);
      type = "product";
      const productImage = getProductImage(product)?.url;
      if (productImage) image = productImage;
    }

    if (isShopQuery || !isKnownRoute || (isProduct && !product)) {
      robots = "noindex,follow";
    }

    document.title = title;

    setMeta("description", description);
    setMeta("robots", robots);
    setMeta("googlebot", robots);
    setMeta("author", "Brewing Edge by BuyHoreca");
    setMeta("theme-color", "#0a0a09");
    setMeta("format-detection", "telephone=no");
    setMeta("referrer", "strict-origin-when-cross-origin");

    setMeta("og:title", title, "property");
    setMeta("og:description", description, "property");
    setMeta("og:type", type, "property");
    setMeta("og:url", canonicalUrl, "property");
    setMeta("og:site_name", "Brewing Edge", "property");
    setMeta("og:locale", "en_AE", "property");
    setMeta("og:image", image, "property");
    setMeta("og:image:alt", `${title} — Brewing Edge`, "property");

    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", title);
    setMeta("twitter:description", description);
    setMeta("twitter:image", image);
    setMeta("twitter:image:alt", `${title} — Brewing Edge`);

    upsertLink("canonical", canonicalUrl);

    const graph = [
      {
        "@type": "Organization",
        "@id": `${siteBase}/#organization`,
        name: "Brewing Edge",
        url: siteBase,
        logo: image,
        parentOrganization: {
          "@type": "Organization",
          name: "BuyHoreca",
          url: BUYHORECA_URL,
        },
        address: {
          "@type": "PostalAddress",
          streetAddress: CONTACT.address,
          addressLocality: "Dubai",
          addressCountry: "AE",
        },
        contactPoint: [
          {
            "@type": "ContactPoint",
            telephone: CONTACT.phone,
            contactType: "customer service",
            areaServed: "AE",
            availableLanguage: ["English"],
          },
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${siteBase}/#website`,
        name: "Brewing Edge",
        url: siteBase,
        publisher: { "@id": `${siteBase}/#organization` },
      },
    ];

    if (pathname === "/") {
      graph.push({
        "@type": "WebPage",
        "@id": `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: title,
        description,
        isPartOf: { "@id": `${siteBase}/#website` },
        about: { "@id": `${siteBase}/#organization` },
      });
    } else if (pathname === "/shop" && !isShopQuery) {
      graph.push({
        "@type": "CollectionPage",
        "@id": `${canonicalUrl}#collection`,
        url: canonicalUrl,
        name: title,
        description,
        isPartOf: { "@id": `${siteBase}/#website` },
      });
    } else if (pathname === "/categories") {
      graph.push({
        "@type": "CollectionPage",
        "@id": `${canonicalUrl}#categories`,
        url: canonicalUrl,
        name: title,
        description,
        isPartOf: { "@id": `${siteBase}/#website` },
      });
    } else if (pathname === "/about" || pathname === "/guides" || pathname === "/contact") {
      graph.push({
        "@type": "WebPage",
        "@id": `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: title,
        description,
        isPartOf: { "@id": `${siteBase}/#website` },
      });
    }

    if (pathname !== "/" && isKnownRoute && !isShopQuery) {
      const labels = {
        "/shop": "Shop",
        "/categories": "Categories",
        "/about": "About",
        "/guides": "Brew Guides",
        "/contact": "Contact",
      };
      graph.push({
        "@type": "BreadcrumbList",
        "@id": `${canonicalUrl}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: siteBase || `${origin}/`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: product?.title || labels[pathname] || "Product",
            item: canonicalUrl,
          },
        ],
      });
    }

    if (product && isProduct) {
      const images = (product.images?.nodes || [])
        .map((entry) => entry?.url)
        .filter(Boolean);
      const priceMin = Number(product.priceRange?.minVariantPrice?.amount);
      const priceMax = Number(product.priceRange?.maxVariantPrice?.amount);
      const currency = product.priceRange?.minVariantPrice?.currencyCode || "AED";

      const productSchema = {
        "@type": "Product",
        "@id": `${canonicalUrl}#product`,
        name: product.title,
        description: stripHtml(product.description || "").replace(/\s+/g, " ").trim(),
        url: canonicalUrl,
        image: images.length ? images : [image],
        category: product.productType || "Coffee Equipment",
        brand: {
          "@type": "Brand",
          name: product.vendor || "Brewing Edge",
        },
      };

      if (Number.isFinite(priceMin)) {
        productSchema.offers = {
          "@type": priceMax > priceMin ? "AggregateOffer" : "Offer",
          priceCurrency: currency,
          ...(priceMax > priceMin
            ? { lowPrice: priceMin, highPrice: priceMax }
            : { price: priceMin }),
          availability: product.availableForSale
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
          url: canonicalUrl,
          seller: {
            "@type": "Organization",
            name: "BuyHoreca",
            url: BUYHORECA_URL,
          },
        };
      }

      graph.push(productSchema);
    }

    setJsonLd(graph);
  }, [pathname, search, product, isProduct, isShopQuery, isKnownRoute]);

  return null;
}

function setMeta(name, content, attribute = "name") {
  let element = document.head.querySelector(`meta[${attribute}="${name}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

function upsertLink(rel, href) {
  let element = document.head.querySelector(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement("link");
    element.rel = rel;
    document.head.appendChild(element);
  }
  element.href = href;
}

function setJsonLd(graph) {
  let element = document.head.querySelector("script[data-brewing-edge-jsonld]");
  if (!element) {
    element = document.createElement("script");
    element.type = "application/ld+json";
    element.setAttribute("data-brewing-edge-jsonld", "true");
    document.head.appendChild(element);
  }
  element.textContent = JSON.stringify({ "@context": "https://schema.org", "@graph": graph });
}

export default App;

function NotFoundPage() {
  return (
    <main className="simple-page">
      <p className="section-kicker">404</p>
      <h1>Page not found.</h1>
      <p>The page you’re looking for doesn’t exist.</p>
      <Link to="/" className="primary-button">Back Home</Link>
    </main>
  );
}
