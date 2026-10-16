import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShieldCheck, Truck, CheckCircle, Award, Sparkles, ArrowRight } from 'lucide-react';
import { productApi } from '../../APi/productApi';
import { categoryApi } from '../../APi/categoryApi';
import axiosInstance from '../../APi/axiosInstance';
import { transformImageUrl } from '../../APi/utils';
import SdsLogo from '../common/SdsLogo';
import { DUMMY_CATEGORIES, DUMMY_PRODUCTS } from '../../mockData/dummyData';
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

// ── Kinetic Letter-by-Letter Animation Component ─────────────
const AnimatedWord = ({ word, isBold = false, baseDelay = 0 }) => {
  return (
    <span className={`sds-animated-word ${isBold ? 'sds-word-bold' : 'sds-word-regular'}`}>
      {word.split('').map((char, index) => {
        const charDelay = baseDelay + index * 0.038;
        return (
          <span key={index} className="sds-char-envelope">
            <motion.span
              className="sds-char"
              initial={{ y: '135%', opacity: 0, rotateZ: 4, filter: 'blur(3px)' }}
              animate={{ y: '0%', opacity: 1, rotateZ: 0, filter: 'blur(0px)' }}
              transition={{
                duration: 0.85,
                delay: charDelay,
                ease: [0.16, 1, 0.3, 1],
              }}
              whileHover={{
                y: -10,
                color: '#C5A15A',
                scale: 1.15,
                transition: { type: 'spring', stiffness: 500, damping: 10 },
              }}
            >
              {char}
            </motion.span>
          </span>
        );
      })}
    </span>
  );
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
  { icon: CheckCircle, title: '100% Authentic',      desc: 'Silk Mark Certified & pure handloom' },
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

        const rawCatList = Array.isArray(catRes) ? catRes : (catRes?.categories || []);
        const catList = rawCatList.length > 0 ? rawCatList : DUMMY_CATEGORIES;

        const rawProdList = featRes?.products || (Array.isArray(featRes) ? featRes : []);
        const prodList = rawProdList.length > 0 ? rawProdList : DUMMY_PRODUCTS;

        const rawLatList = Array.isArray(latestRes) && latestRes.length > 0 ? latestRes : prodList;
        const latList = rawLatList.slice(0, 8);

        const rawDealList = dealsRes?.data?.results?.products || dealsRes?.data?.products || [];
        const dealList = rawDealList.length > 0 ? rawDealList : prodList.slice(0, 4);

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
        {/* Subtle Ambient Light Shimmer */}
        <div className="sds-hero-ambient" aria-hidden="true">
          <motion.div
            className="sds-hero-orb sds-hero-orb-1"
            animate={{
              x: [0, 20, -15, 0],
              y: [0, -15, 10, 0],
              scale: [1, 1.08, 0.98, 1],
              opacity: [0.22, 0.42, 0.28, 0.22]
            }}
            transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="sds-hero-orb sds-hero-orb-2"
            animate={{
              x: [0, -20, 15, 0],
              y: [0, 15, -20, 0],
              scale: [1, 0.95, 1.06, 1],
              opacity: [0.18, 0.38, 0.25, 0.18]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
        </div>

        <div className="sds-hero-content">
          {/* Headline matching reference image with kinetic letter animation */}
          <h1 className="sds-hero-heading" aria-label="Nice Summer Collection">
            <AnimatedWord word="Nice" isBold={false} baseDelay={0.06} />
            <span className="sds-word-space">&nbsp;</span>
            <AnimatedWord word="Summer" isBold={true} baseDelay={0.22} />
            <span className="sds-word-space">&nbsp;</span>
            <AnimatedWord word="Collection" isBold={false} baseDelay={0.46} />
          </h1>

          {/* Subheading matching reference image */}
          <motion.p
            className="sds-hero-subheading"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.82, ease: [0.16, 1, 0.3, 1] }}
          >
            A Good Looking, Comfortable Traditional Collection
          </motion.p>

          {/* Single solid dark rectangular CTA button matching reference image */}
          <motion.div
            className="sds-hero-cta-wrap"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.98, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div
              whileHover={{ y: -2, scale: 1.015 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link to="/products" className="sds-hero-btn-editorial">
                <span>SHOP THE COLLECTION</span>
                <span className="sds-btn-reflection" />
              </Link>
            </motion.div>
          </motion.div>

          {/* Minimalist ornament below button */}
          <motion.div
            className="sds-hero-ornament"
            aria-hidden="true"
            initial={{ opacity: 0, scaleX: 0.6 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.8, delay: 1.15, ease: "easeOut" }}
          >
            <div className="sds-hero-ornament-line" />
            <div className="sds-hero-ornament-diamond" />
            <div className="sds-hero-ornament-line" />
          </motion.div>
        </div>

        {/* Floating Luxury Scroll Cue Anchored at Bottom of Full Viewport Fold */}
        <motion.button
          className="sds-hero-scroll-cue"
          onClick={() => {
            const nextEl = document.getElementById('shop-by-category');
            if (nextEl) {
              nextEl.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          aria-label="Scroll down to browse categories"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.35, ease: "easeOut" }}
        >
          <span className="sds-hero-scroll-label">EXPLORE</span>
          <div className="sds-hero-scroll-line" aria-hidden="true" />
        </motion.button>
      </section>

      {/* ── 2. SHOP BY CATEGORY ─────────────────────────────── */}
      <section className="sds-section" id="shop-by-category" aria-label="Shop by category">
        <div className="sds-container">
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
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
                    { label: 'Silk Sarees',       path: '/category/cat_silk_sarees',    emoji: '🥻' },
                    { label: 'Bridal Collection', path: '/category/cat_bridal_wear',    emoji: '👑' },
                    { label: "Women's Wear",      path: '/category/cat_womens_wear',    emoji: '✨' },
                    { label: 'Jewellery',         path: '/category/cat_jewellery',      emoji: '💎' },
                    { label: 'Cotton Sarees',     path: '/category/cat_cotton_sarees',  emoji: '🌸' },
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
