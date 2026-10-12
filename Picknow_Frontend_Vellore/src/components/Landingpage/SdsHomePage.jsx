import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShieldCheck, Truck, RotateCcw, Award } from 'lucide-react';
import { productApi } from '../../APi/productApi';
import { categoryApi } from '../../APi/categoryApi';
import axiosInstance from '../../APi/axiosInstance';
import { transformImageUrl } from '../../APi/utils';
import SdsLogo from '../common/SdsLogo';
import './SdsHomePage.css';

// ── Helpers ──────────────────────────────────────────────────
const formatINR = (amount) => {
  if (!amount && amount !== 0) return '—';
  return '₹' + Number(amount).toLocaleString('en-IN');
};

const discountPct = (original, sale) => {
  if (!original || !sale || sale >= original) return null;
  return Math.round(((original - sale) / original) * 100);
};

// ── Product Card ─────────────────────────────────────────────
const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const name     = product.pName  || product.name  || 'Product';
  const imgRaw   = Array.isArray(product.pImage) ? product.pImage[0] : (product.pImage || product.image);
  const img      = transformImageUrl(imgRaw);
  const price    = product.pPrice || product.price;
  const mrp      = product.pMrp   || product.mrp;
  const inStock  = product.pStock !== 0 && product.stock !== 0;
  const discount = discountPct(mrp, price);
  const id       = product._id;

  return (
    <article
      className="sds-product-card"
      onClick={() => navigate(`/product/${id}`)}
      style={{ cursor: 'pointer' }}
      aria-label={`${name}, ${formatINR(price)}`}
    >
      <div className="sds-product-card-img-wrap">
        <img
          src={img}
          alt={name}
          className="sds-product-img"
          loading="lazy"
          width={400}
          height={533}
        />
        {discount && (
          <div className="sds-product-badge-wrap">
            <span className="sds-badge">{discount}% OFF</span>
          </div>
        )}
        {!inStock && (
          <div className="sds-product-badge-wrap" style={{ top: 'auto', bottom: 10, left: 0, right: 0, alignItems: 'center' }}>
            <span className="sds-badge" style={{ background: 'rgba(40,35,33,0.7)' }}>Out of Stock</span>
          </div>
        )}
      </div>
      <div className="sds-product-info">
        <h3 className="sds-product-name">{name}</h3>
        <div className="sds-product-price-row">
          <span className="sds-price">{formatINR(price)}</span>
          {mrp && mrp > price && (
            <span className="sds-price-original">{formatINR(mrp)}</span>
          )}
          {discount && (
            <span className="sds-price-discount">{discount}% off</span>
          )}
        </div>
      </div>
    </article>
  );
};

// Product card skeleton
const ProductSkeleton = () => (
  <div className="sds-product-card">
    <div className="sds-product-card-img-wrap">
      <div className="sds-skeleton" style={{ position: 'absolute', inset: 0 }} />
    </div>
    <div className="sds-product-info" style={{ gap: 8 }}>
      <div className="sds-skeleton" style={{ height: 14, width: '80%' }} />
      <div className="sds-skeleton" style={{ height: 14, width: '50%' }} />
      <div className="sds-skeleton" style={{ height: 12, width: '35%' }} />
    </div>
  </div>
);

// Category card skeleton
const CatSkeleton = () => (
  <div className="sds-category-card" style={{ cursor: 'default' }}>
    <div className="sds-skeleton" style={{ width: 120, height: 120, borderRadius: '50%' }} />
    <div className="sds-skeleton" style={{ height: 12, width: 80 }} />
  </div>
);

// ── Section Header ───────────────────────────────────────────
const SectionHeader = ({ eyebrow, title, viewAllPath }) => (
  <div className="sds-section-header">
    <div className="sds-section-header-left">
      {eyebrow && <span className="sds-section-label">{eyebrow}</span>}
      <h2 className="sds-section-title">{title}</h2>
    </div>
    {viewAllPath && (
      <Link to={viewAllPath} className="sds-view-all">View All</Link>
    )}
  </div>
);

// ── Trust Indicators ─────────────────────────────────────────
const TRUST_ITEMS = [
  { icon: Truck,       title: 'Free Shipping',       desc: 'On orders above ₹999 · Pan India delivery' },
  { icon: ShieldCheck, title: 'Secure Payments',     desc: 'Razorpay · UPI · All major cards accepted' },
  { icon: RotateCcw,   title: 'Easy Returns',        desc: '7-day hassle-free return policy' },
  { icon: Award,       title: 'Genuine Products',    desc: 'Handpicked, quality-assured ethnic wear' },
];

// ── Main Homepage Component ───────────────────────────────────
const SdsHomePage = () => {
  const [categories, setCategories]     = useState([]);
  const [featuredProducts, setFeatured] = useState([]);
  const [latestProducts, setLatest]     = useState([]);
  const [offerProducts, setOffers]      = useState([]);
  const [loading, setLoading]           = useState(true);
  const [email, setEmail]               = useState('');
  const [emailSent, setEmailSent]       = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [catRes, featRes, latestRes, dealsRes] = await Promise.all([
          categoryApi.getAllCategories(),
          productApi.getAllProducts(1, 8),
          productApi.getLatestProduct ? productApi.getLatestProduct() : Promise.resolve([]),
          axiosInstance.get('/search', { params: { type: 'deals', limit: 8, includeVariants: true } }),
        ]);

        const catList  = Array.isArray(catRes) ? catRes : (catRes.categories || []);
        const prodList = featRes?.products || (Array.isArray(featRes) ? featRes : []);
        const latList  = Array.isArray(latestRes) ? latestRes.slice(0, 8) : [];
        const dealList = dealsRes?.data?.results?.products || dealsRes?.data?.products || [];

        setCategories(catList.slice(0, 10));
        setFeatured(prodList.slice(0, 8));
        setLatest(latList.slice(0, 8));
        setOffers(dealList.slice(0, 4));
      } catch (err) {
        console.error('SdsHomePage: fetch error', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    // TODO: connect to newsletter API when implemented
    setEmailSent(true);
    setEmail('');
  };

  const fadeUp = {
    hidden:  { opacity: 0, y: 24 },
    visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5, ease: 'easeOut' } }),
  };

  return (
    <main id="main-content">

      {/* ── 1. HERO ─────────────────────────────────────────── */}
      <section className="sds-hero" aria-label="Hero banner">
        <div className="sds-hero-content">
          <motion.span
            className="sds-hero-eyebrow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            Handpicked · Handwoven · Heirloom
          </motion.span>

          <motion.h1
            className="sds-hero-heading"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            Timeless <strong>Elegance</strong>,<br />Woven in Tradition.
          </motion.h1>

          <motion.p
            className="sds-hero-subheading"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            Handpicked designer dresses, festive wear and heirloom jewelleries.
          </motion.p>

          <motion.div
            className="sds-hero-cta-row"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
          >
            <Link to="/category/cat_dresses" className="sds-btn sds-btn-primary">Shop Dresses</Link>
            <Link to="/category/cat_jewelleries" className="sds-btn sds-btn-secondary">Explore Jewelleries</Link>
          </motion.div>

          <div className="sds-hero-ornament" aria-hidden="true">
            <div className="sds-hero-ornament-line" />
            <div className="sds-hero-ornament-diamond" />
            <div className="sds-hero-ornament-line" />
          </div>
        </div>
      </section>

      {/* ── 2. SHOP BY CATEGORY ─────────────────────────────── */}
      <section className="sds-section" aria-label="Shop by category">
        <div className="sds-container">
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span className="sds-section-label">Browse Collections</span>
            <h2 className="sds-section-title">Shop by Category</h2>
          </div>
          <div className="sds-categories-grid">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <CatSkeleton key={i} />)
              : categories.length > 0
                ? categories.map((cat) => (
                    <Link
                      key={cat._id}
                      to={`/category/${cat._id}?name=${encodeURIComponent(cat.cName)}`}
                      className="sds-category-card"
                    >
                      <div className="sds-category-img-ring">
                        <img
                          src={cat.cImage || 'https://cdn-icons-png.flaticon.com/512/3061/3061730.png'}
                          alt={cat.cName}
                          loading="lazy"
                          width={120}
                          height={120}
                        />
                      </div>
                      <span className="sds-category-label">{cat.cName}</span>
                    </Link>
                  ))
                : (
                  // Fallback static categories
                  [
                    { label: 'Dresses',      path: '/category/cat_dresses',     emoji: '👗' },
                    { label: 'Jewelleries',  path: '/category/cat_jewelleries',  emoji: '💍' },
                    { label: 'All Products', path: '/products',                 emoji: '✨' },
                    { label: 'Offers',       path: '/deals',                    emoji: '🏷️' },
                  ].map((c) => (
                    <Link key={c.path} to={c.path} className="sds-category-card">
                      <div className="sds-category-img-ring" style={{ fontSize: '2.5rem', lineHeight: 1 }}>
                        {c.emoji}
                      </div>
                      <span className="sds-category-label">{c.label}</span>
                    </Link>
                  ))
                )
            }
          </div>
        </div>
      </section>

      <div className="sds-ornament-divider" aria-hidden="true">
        <div className="sds-ornament-gem" />
      </div>

      {/* ── 3. FEATURED PRODUCTS ─────────────────────────────── */}
      <section className="sds-section sds-section-alt" aria-label="Featured sarees and ethnic wear">
        <div className="sds-container">
          <SectionHeader
            eyebrow="Curated for You"
            title="Featured Collections"
            viewAllPath="/products"
          />
          <div className="sds-products-grid">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)
              : featuredProducts.map((p) => <ProductCard key={p._id} product={p} />)
            }
          </div>
        </div>
      </section>

      {/* ── 4. NEW ARRIVALS ──────────────────────────────────── */}
      {(loading || latestProducts.length > 0) && (
        <section className="sds-section" aria-label="New arrivals">
          <div className="sds-container">
            <SectionHeader
              eyebrow="Just In"
              title="New Arrivals"
              viewAllPath="/products?sort=newest"
            />
            <div className="sds-products-grid">
              {loading
                ? Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)
                : latestProducts.map((p) => <ProductCard key={p._id} product={p} />)
              }
            </div>
          </div>
        </section>
      )}

      {/* ── 5. OFFERS / DEALS ────────────────────────────────── */}
      {!loading && offerProducts.length > 0 && (
        <>
          <div className="sds-promo-banner">
            <div className="sds-promo-banner-text">
              <h3>Festive Season Offers</h3>
              <p>Handpicked sarees and jewellery at exclusive prices — limited time only.</p>
            </div>
            <Link to="/deals" className="sds-btn sds-btn-ghost-white">
              View All Offers
            </Link>
          </div>
          <section className="sds-section sds-section-alt" aria-label="Deals and offers">
            <div className="sds-container">
              <SectionHeader eyebrow="Limited Time" title="Special Offers" viewAllPath="/deals" />
              <div className="sds-products-grid">
                {offerProducts.map((p) => <ProductCard key={p._id} product={p} />)}
              </div>
            </div>
          </section>
        </>
      )}

      {/* ── 6. BRAND STORY ───────────────────────────────────── */}
      <section className="sds-section" aria-label="About Shri Deepaalaya Silks">
        <div className="sds-container">
          <div className="sds-brand-story">
            {/* Text */}
            <div className="sds-brand-story-text">
              <span className="sds-section-label" style={{ textAlign: 'left' }}>Our Story</span>
              <h2>Craftsmanship,<br />Passed Through Generations</h2>
              <p>
                At Shri Deepaalaya Silks, every saree tells a story of skilled artisans, traditional
                looms, and a deep love for India's rich textile heritage. We source directly from
                weavers across Tamil Nadu and beyond, ensuring that every thread is a promise of
                authenticity and quality.
              </p>
              <p>
                From bridal Kanjivaram silks to everyday cotton weaves, our collection celebrates
                the beauty of Indian ethnic fashion — for every occasion, every woman.
              </p>
              <Link to="/categories" className="sds-btn sds-btn-primary" style={{ marginTop: '1.5rem', display: 'inline-flex' }}>
                Explore All Collections
              </Link>
            </div>

            {/* Image / placeholder */}
            <div className="sds-brand-story-placeholder" aria-hidden="true">
              <SdsLogo width={160} />
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                Photography coming soon
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="sds-ornament-divider" aria-hidden="true">
        <div className="sds-ornament-gem" />
      </div>

      {/* ── 7. TRUST INDICATORS ──────────────────────────────── */}
      <section className="sds-section sds-section-alt" aria-label="Why shop with us">
        <div className="sds-container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span className="sds-section-label">Why Choose Us</span>
            <h2 className="sds-section-title">Shop with Confidence</h2>
          </div>
          <div className="sds-trust-grid">
            {TRUST_ITEMS.map((item) => (
              <div key={item.title} className="sds-trust-item">
                <div className="sds-trust-icon" aria-hidden="true">
                  <item.icon size={32} strokeWidth={1.5} />
                </div>
                <span className="sds-trust-title">{item.title}</span>
                <p className="sds-trust-desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. NEWSLETTER ────────────────────────────────────── */}
      <section className="sds-newsletter" aria-label="Newsletter subscription">
        <div className="sds-container">
          <h2>Stay in the Loop</h2>
          <p>Get early access to new collections, exclusive offers and styling tips.</p>
          {emailSent ? (
            <p style={{ color: 'var(--color-gold)', fontWeight: 600, marginTop: '1rem' }}>
              ✓ Thank you! We'll be in touch.
            </p>
          ) : (
            <form className="sds-newsletter-form" onSubmit={handleNewsletterSubmit} noValidate>
              <input
                type="email"
                className="sds-newsletter-input"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-label="Email address for newsletter"
              />
              <button type="submit" className="sds-newsletter-btn">Subscribe</button>
            </form>
          )}
        </div>
      </section>

    </main>
  );
};

export default SdsHomePage;
