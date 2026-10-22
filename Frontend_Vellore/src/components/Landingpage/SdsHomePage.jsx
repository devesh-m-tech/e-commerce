import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShieldCheck, Truck, CheckCircle, Award, Sparkles, ArrowRight, ChevronsRight, Flame, ChevronLeft, ChevronRight, Clock, Star, Shield } from 'lucide-react';
import { productApi } from '../../APi/productApi';
import { categoryApi } from '../../APi/categoryApi';
import { bannerApi } from '../../APi/bannerApi';
import axiosInstance from '../../APi/axiosInstance';
import { transformImageUrl } from '../../APi/utils';
import SdsLogo from '../common/SdsLogo';
import { TextType } from '../reactbits';
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
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80';
          }}
        />
        {discount && (
          <div className="sds-product-badge-wrap">
            <span className="sds-badge sds-badge-animated">{discount}% OFF</span>
          </div>
        )}
        {!inStock && (
          <div className="sds-product-badge-wrap" style={{ top: 'auto', bottom: 10, left: 0, right: 0, alignItems: 'center' }}>
            <span className="sds-badge" style={{ background: 'rgba(40,35,33,0.7)' }}>Out of Stock</span>
          </div>
        )}
        <div className="sds-product-hover-overlay" aria-hidden="true">
          <span className="sds-product-quick-btn">
            Explore Deal <ArrowRight size={13} />
          </span>
        </div>
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
  { 
    icon: Truck,
    badge: 'Express Delivery',
    title: 'Free Express Shipping',
    desc: 'Complimentary insured shipping on all orders above ₹999. Swift Pan-India dispatch with end-to-end tracking.',
    highlight: 'Dispatched in 24-48h'
  },
  { 
    icon: ShieldCheck,
    badge: '100% Encrypted',
    title: 'Secure Payments',
    desc: 'Bank-grade encrypted checkout via Razorpay, UPI, Net Banking & all major credit/debit cards.',
    highlight: 'Zero Payment Risk'
  },
  { 
    icon: CheckCircle,
    badge: 'Silk Mark Certified',
    title: '100% Authentic Silk',
    desc: 'Every Kanchipuram and Banarasi weave carries an authorized Silk Mark certifying genuine pure silk and zari.',
    highlight: 'Purity Guaranteed'
  },
  { 
    icon: Award,
    badge: 'Heritage Looms',
    title: 'Direct From Weavers',
    desc: 'Ethically sourced directly from master handloom weaving clusters across Tamil Nadu, upholding generations of art.',
    highlight: 'Artisan Crafted'
  },
];

// ── Default Hero Banners (Fallback for luxury presentation) ──
const DEFAULT_HERO_SLIDES = [
  {
    _id: 'default-1',
    title: 'Nice Summer Collection',
    subtitle: 'A Good Looking, Comfortable Traditional Collection',
    tag: 'Handloom Heritage',
    buttonText: 'SHOP THE COLLECTION',
    link: '/products',
    imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1920&q=85',
  },
  {
    _id: 'default-2',
    title: 'Pure Kanchipuram Bridal Silks',
    subtitle: 'Timeless 24K Pure Zari Heirlooms Woven for Generations',
    tag: 'Muhurtham Exclusive',
    buttonText: 'EXPLORE BRIDAL SILKS',
    link: '/products?category=cat_silk_sarees',
    imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1920&q=85',
  },
  {
    _id: 'default-3',
    title: 'Royal Banarasi & Tussar Weaves',
    subtitle: 'Exquisite Handcrafted Drapes for Festive Elegance',
    tag: 'Festive Splendour',
    buttonText: 'DISCOVER THE WEAVES',
    link: '/products',
    imageUrl: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1920&q=85',
  },
];

const heroSlideVariants = {
  enter: (dir) => ({
    x: dir > 0 ? '100%' : dir < 0 ? '-100%' : '0%',
    opacity: 0,
    scale: 1.02,
  }),
  center: {
    zIndex: 1,
    x: '0%',
    opacity: 1,
    scale: 1,
    transition: {
      x: { type: 'spring', stiffness: 280, damping: 32 },
      opacity: { duration: 0.5 },
      scale: { duration: 0.65 },
    },
  },
  exit: (dir) => ({
    zIndex: 0,
    x: dir < 0 ? '100%' : '-100%',
    opacity: 0,
    scale: 0.98,
    transition: {
      x: { type: 'spring', stiffness: 280, damping: 32 },
      opacity: { duration: 0.4 },
    },
  }),
};

// ── Main Homepage Component ───────────────────────────────────
const SdsHomePage = () => {
  const [categories, setCategories]             = useState([]);
  const [featuredProducts, setFeatured]         = useState([]);
  const [latestProducts, setLatest]             = useState([]);
  const [offerProducts, setOffers]              = useState([]);
  const [loading, setLoading]                   = useState(true);
  const [email, setEmail]                       = useState('');
  const [emailSent, setEmailSent]               = useState(false);
  const [timeLeft, setTimeLeft]                 = useState({ hours: 8, minutes: 42, seconds: 15 });
  const offersScrollRef                         = useRef(null);
  const [activeStoryImg, setActiveStoryImg]     = useState(0);

  // Hero Slider States (Managed via Admin CRUD)
  const [banners, setBanners]                   = useState(DEFAULT_HERO_SLIDES);
  const [[slideIndex, slideDirection], setSlide] = useState([0, 0]);
  const [isSliderHovered, setIsSliderHovered]   = useState(false);

  const navigate = useNavigate();

  const storyImages = [
    {
      url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
      caption: 'Pure Handloom Kanchipuram',
      desc: 'Woven with certified pure mulberry silk and pure gold korvai zari.'
    },
    {
      url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
      caption: 'Heirloom Bridal Drapes',
      desc: 'Celebrating sacred muhurthams and grand wedding receptions.'
    },
    {
      url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
      caption: 'Antique Temple Jewellery',
      desc: 'Handcrafted 22K gold-plated heirloom jewels with kemp stones.'
    }
  ];

  // Auto-switch brand story image every 5.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStoryImg((prev) => (prev + 1) % 3);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  // Real-time ticking countdown timer for Special Offers
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const scrollOffers = (direction) => {
    if (offersScrollRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      offersScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Hero Slider Navigation & Calculations
  const activeSlideCount = banners.length || 1;
  const currentBannerIndex = ((slideIndex % activeSlideCount) + activeSlideCount) % activeSlideCount;
  const activeBanner = banners[currentBannerIndex] || DEFAULT_HERO_SLIDES[0];

  const paginateSlide = useCallback((newDirection) => {
    setSlide(([curr]) => [curr + newDirection, newDirection]);
  }, []);

  const goToSlide = useCallback((targetIndex) => {
    setSlide(([curr]) => {
      const normalizedCurrent = ((curr % activeSlideCount) + activeSlideCount) % activeSlideCount;
      if (targetIndex === normalizedCurrent) return [curr, 0];
      const dir = targetIndex > normalizedCurrent ? 1 : -1;
      return [curr + (targetIndex - normalizedCurrent), dir];
    });
  }, [activeSlideCount]);

  // Autoplay hero slider every 3.5 seconds (reduced for dynamic slide transitions, paused when user hovers)
  useEffect(() => {
    if (activeSlideCount <= 1 || isSliderHovered) return;
    const interval = setInterval(() => {
      paginateSlide(1);
    }, 4000);
    return () => clearInterval(interval);
  }, [activeSlideCount, isSliderHovered, paginateSlide]);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [catRes, featRes, latestRes, dealsRes, bannersRes] = await Promise.all([
          categoryApi.getAllCategories(),
          productApi.getAllProducts(1, 8),
          productApi.getLatestProduct ? productApi.getLatestProduct() : Promise.resolve([]),
          axiosInstance.get('/search', { params: { type: 'deals', limit: 8, includeVariants: true } }),
          bannerApi.getBanners(),
        ]);

        const rawCatList = Array.isArray(catRes) ? catRes : (catRes?.categories || []);
        const rawProdList = featRes?.products || (Array.isArray(featRes) ? featRes : []);
        const rawLatList = Array.isArray(latestRes) && latestRes.length > 0 ? latestRes : rawProdList;
        const rawDealList = dealsRes?.data?.results?.products || dealsRes?.data?.products || (Array.isArray(dealsRes?.data) ? dealsRes.data : []);
        const dealList = rawDealList.length > 0 ? rawDealList : rawProdList;

        setCategories(rawCatList);
        setFeatured(rawProdList.slice(0, 8));
        setLatest(rawLatList.slice(0, 8));
        setOffers(dealList.slice(0, 8));

        if (Array.isArray(bannersRes) && bannersRes.length > 0) {
          setBanners(bannersRes);
        }
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

      {/* ── 1. HERO SLIDER (DYNAMIC SLIDE ANIMATION VIA ADMIN CRUD) ── */}
      <section
        className="sds-hero sds-hero-slider-section"
        aria-label="Hero banner carousel"
        onMouseEnter={() => setIsSliderHovered(true)}
        onMouseLeave={() => setIsSliderHovered(false)}
      >
        <AnimatePresence initial={false} custom={slideDirection}>
          <motion.div
            key={slideIndex}
            custom={slideDirection}
            variants={heroSlideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="sds-hero-slide"
          >
            {/* Background Image with Ken Burns Scale */}
            <div className="sds-hero-slide-bg" aria-hidden="true">
              <motion.img
                src={transformImageUrl(activeBanner.imageUrl)}
                alt={activeBanner.title}
                className="sds-hero-slide-bg-img"
                initial={{ scale: 1.08 }}
                animate={{ scale: 1 }}
                transition={{ duration: 7, ease: "easeOut" }}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src =
                    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1920&q=85';
                }}
              />
              <div className="sds-hero-slide-scrim" />
            </div>

            {/* Slide Foreground Content */}
            <div className="sds-hero-content">
              {activeBanner.tag && (
                <motion.div
                  className="sds-hero-tag-wrap"
                  initial={{ opacity: 0, y: -14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.15 }}
                >
                  <span className="sds-hero-tag">{activeBanner.tag}</span>
                </motion.div>
              )}

              {/* Slide Headline with React Bits Animated TextType Effect */}
              <motion.div
                className="sds-hero-text-type-wrapper"
                key={`type-${activeBanner._id || currentBannerIndex}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
              >
                <TextType
                  text={activeBanner.title || 'Nice Summer Collection'}
                  as="h1"
                  className="sds-hero-heading sds-hero-slider-heading sds-hero-typewriter-title"
                  typingSpeed={50}
                  pauseDuration={3500}
                  deletingSpeed={30}
                  deleteMode="backspace"
                  typeEffect="fade"
                  cursorStyle="bar"
                  cursorColor="#C5A15A"
                  cursorGlide={true}
                  showCursor={true}
                  loop={false}
                />
              </motion.div>

              {/* Subheading */}
              {activeBanner.subtitle && (
                <motion.p
                  className="sds-hero-subheading sds-hero-slider-subheading"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
                >
                  {activeBanner.subtitle}
                </motion.p>
              )}

              {/* CTA button matching reference luxury style */}
              <motion.div
                className="sds-hero-cta-wrap"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.48, ease: [0.16, 1, 0.3, 1] }}
              >
                <motion.div
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    to={activeBanner.link || '/products'}
                    className="sds-hero-btn-professional"
                  >
                    <span className="sds-hero-btn-text">{activeBanner.buttonText || 'SHOP THE COLLECTION'}</span>
                    <span className="sds-hero-btn-icon-wrap" aria-hidden="true">
                      <ArrowRight size={15} className="sds-hero-btn-arrow" />
                    </span>
                    <span className="sds-hero-btn-shimmer" aria-hidden="true" />
                  </Link>
                </motion.div>
              </motion.div>

              {/* Minimalist ornament below button */}
              <motion.div
                className="sds-hero-ornament"
                aria-hidden="true"
                initial={{ opacity: 0, scaleX: 0.6 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
              >
                <div className="sds-hero-ornament-line" />
                <div className="sds-hero-ornament-diamond" />
                <div className="sds-hero-ornament-line" />
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Carousel Navigation Arrows */}
        {activeSlideCount > 1 && (
          <>
            <button
              type="button"
              className="sds-hero-nav-arrow sds-hero-nav-prev"
              onClick={() => paginateSlide(-1)}
              aria-label="Previous hero banner"
            >
              <ChevronLeft size={28} />
            </button>
            <button
              type="button"
              className="sds-hero-nav-arrow sds-hero-nav-next"
              onClick={() => paginateSlide(1)}
              aria-label="Next hero banner"
            >
              <ChevronRight size={28} />
            </button>
          </>
        )}

        {/* Carousel Bottom Navigation Dots & Slide Counter */}
        {activeSlideCount > 1 && (
          <div className="sds-hero-bottom-controls" aria-label="Hero slider pagination">
            <div className="sds-hero-dots" role="tablist">
              {banners.map((b, idx) => (
                <button
                  key={b._id || idx}
                  type="button"
                  role="tab"
                  aria-selected={idx === currentBannerIndex}
                  aria-label={`Go to slide ${idx + 1}: ${b.title}`}
                  className={`sds-hero-dot ${idx === currentBannerIndex ? 'sds-hero-dot-active' : ''}`}
                  onClick={() => goToSlide(idx)}
                >
                  <span className="sds-hero-dot-fill" />
                </button>
              ))}
            </div>
            <div className="sds-hero-counter" aria-hidden="true">
              <span>0{currentBannerIndex + 1}</span>
              <span className="sds-hero-counter-div">/</span>
              <span>0{activeSlideCount}</span>
            </div>
          </div>
        )}

        {/* Floating Luxury Scroll Cue */}
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
          transition={{ duration: 0.8, delay: 1.1, ease: "easeOut" }}
        >
          <span className="sds-hero-scroll-label">EXPLORE</span>
          <div className="sds-hero-scroll-line" aria-hidden="true" />
        </motion.button>
      </section>

      {/* ── 2. SHOP BY CATEGORY (ANIMATED & CENTER ALIGNED) ── */}
      <section className="sds-section sds-category-section" id="shop-by-category" aria-label="Shop by category">
        <div className="sds-container">
          <motion.div
            className="sds-category-header-wrap"
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="sds-section-label">Browse Collections</span>
            <h2 className="sds-section-title">Shop by Category</h2>
            <div className="sds-category-header-decor" aria-hidden="true">
              <span className="sds-category-decor-line" />
              <span className="sds-category-decor-gem" />
              <span className="sds-category-decor-line" />
            </div>
          </motion.div>

          {loading ? (
            <div className="sds-categories-grid">
              {Array.from({ length: 6 }).map((_, i) => <CatSkeleton key={i} />)}
            </div>
          ) : (
            <motion.div
              className="sds-categories-grid"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.08,
                    delayChildren: 0.1,
                  },
                },
              }}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.15 }}
            >
              {categories.map((cat, idx) => (
                <motion.div
                  key={`cat-${cat._id || idx}`}
                  variants={{
                    hidden: { opacity: 0, y: 32, scale: 0.92 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      transition: {
                        type: 'spring',
                        stiffness: 280,
                        damping: 22,
                      },
                    },
                  }}
                  whileHover={{ y: -8, scale: 1.05 }}
                  whileTap={{ scale: 0.96 }}
                  className="sds-category-card-motion"
                >
                  <Link
                    to={`/category/${cat._id}?name=${encodeURIComponent(cat.cName)}`}
                    className="sds-category-card"
                  >
                    <div className="sds-category-img-ring">
                      <img
                        src={(Array.isArray(cat.cImage) ? cat.cImage[0] : cat.cImage) || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80'}
                        alt={cat.cName}
                        loading="lazy"
                        width={125}
                        height={125}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80';
                        }}
                      />
                      <span className="sds-category-hover-cue">Explore</span>
                    </div>
                    <span className="sds-category-label">{cat.cName}</span>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
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
            {/* Animated Ambient Light Orbs & Golden Shimmer */}
            <div className="sds-promo-ambient" aria-hidden="true">
              <motion.div 
                className="sds-promo-orb sds-promo-orb-1"
                animate={{
                  x: [0, 35, -25, 0],
                  y: [0, -25, 20, 0],
                  opacity: [0.35, 0.7, 0.4, 0.35],
                  scale: [1, 1.18, 0.92, 1]
                }}
                transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div 
                className="sds-promo-orb sds-promo-orb-2"
                animate={{
                  x: [0, -30, 25, 0],
                  y: [0, 20, -20, 0],
                  opacity: [0.25, 0.55, 0.35, 0.25],
                  scale: [1, 0.9, 1.15, 1]
                }}
                transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              />
              <div className="sds-promo-shimmer-sweep" />
            </div>

            <div className="sds-promo-banner-content">
              <div className="sds-promo-banner-text">
                <div className="sds-promo-badge">
                  <Flame size={13} className="sds-flame-flicker" />
                  <span>Limited Festive Season Deal</span>
                  <span className="sds-live-dot" />
                </div>
                <h3>
                  Festive Season <span className="sds-text-gold-gradient">Offers</span>
                </h3>
                <p>Handpicked sarees and jewellery at exclusive prices — limited time only.</p>
              </div>

              <div className="sds-promo-action-group">
                <Link to="/deals" className="sds-promo-cta-btn">
                  <span>View All Offers</span>
                  <span className="sds-cta-chevrons" aria-hidden="true">
                    <ChevronsRight size={18} />
                  </span>
                </Link>
              </div>
            </div>

            {/* Seamless Animated Offers Ribbon Ticker */}
            <div className="sds-promo-ticker-wrap" aria-hidden="true">
              <div className="sds-promo-ticker-track">
                {[1, 2].map((groupNum) => (
                  <div key={groupNum} className="sds-promo-ticker-group">
                    <span className="sds-ticker-item"><Sparkles size={12} /> FLAT 25% OFF ON KANCHIPURAM SILKS</span>
                    <span className="sds-ticker-bullet">•</span>
                    <span className="sds-ticker-item"><Sparkles size={12} /> TEMPLE JEWELLERY SETS FROM ₹3,499</span>
                    <span className="sds-ticker-bullet">•</span>
                    <span className="sds-ticker-item"><Sparkles size={12} /> BRIDAL LEHENGAS EXTRA 15% OFF</span>
                    <span className="sds-ticker-bullet">•</span>
                    <span className="sds-ticker-item"><Sparkles size={12} /> FREE SILK MARK CERTIFIED PURITY</span>
                    <span className="sds-ticker-bullet">•</span>
                    <span className="sds-ticker-item"><Sparkles size={12} /> FREE EXPRESS DELIVERY PAN-INDIA</span>
                    <span className="sds-ticker-bullet">•</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <section className="sds-section sds-section-alt sds-offers-section" aria-label="Deals and offers">
            <div className="sds-container">
              <div className="sds-offers-header-row">
                <div className="sds-section-header-left">
                  <div className="sds-offers-eyebrow-row">
                    <span className="sds-section-label">Limited Time</span>
                    <div className="sds-offers-countdown">
                      <Clock size={12} className="sds-clock-icon" />
                      <span className="sds-countdown-label">Ends in:</span>
                      <span className="sds-time-digits">
                        <span className="sds-time-box">{String(timeLeft.hours).padStart(2, '0')}h</span>
                        <span className="sds-time-sep">:</span>
                        <span className="sds-time-box">{String(timeLeft.minutes).padStart(2, '0')}m</span>
                        <span className="sds-time-sep">:</span>
                        <span className="sds-time-box sds-time-sec">{String(timeLeft.seconds).padStart(2, '0')}s</span>
                      </span>
                    </div>
                  </div>
                  <h2 className="sds-section-title">Special Offers</h2>
                </div>

                <div className="sds-offers-header-right">
                  <Link to="/deals" className="sds-view-all">
                    <span>View All</span>
                    <ArrowRight size={14} />
                  </Link>
                  <div className="sds-offers-nav-buttons">
                    <button 
                      type="button"
                      className="sds-nav-arrow-btn"
                      onClick={() => scrollOffers('left')}
                      aria-label="Previous offers"
                      title="Scroll left"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button 
                      type="button"
                      className="sds-nav-arrow-btn sds-nav-arrow-btn-pulse"
                      onClick={() => scrollOffers('right')}
                      aria-label="Next offers"
                      title="Scroll right"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Animated Carousel Track with Smooth Momentum Scroll */}
              <div 
                className="sds-offers-carousel-track" 
                ref={offersScrollRef}
              >
                {offerProducts.map((p, idx) => (
                  <motion.div 
                    key={p._id || idx}
                    className="sds-offer-carousel-item"
                    initial={{ opacity: 0, y: 25 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, delay: idx * 0.08, ease: "easeOut" }}
                  >
                    <ProductCard product={p} />
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {/* ── 6. BRAND STORY (ANIMATED CRAFTSMANSHIP & HERITAGE SHOWCASE) ── */}
      <section className="sds-section sds-brand-story-section" aria-label="About Shri Deepaalaya Silks">
        <div className="sds-container">
          <div className="sds-brand-story">
            {/* Left: Text & Animated Heritage Stats */}
            <motion.div 
              className="sds-brand-story-text"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.65, ease: "easeOut" }}
            >
              <div className="sds-story-eyebrow-pill">
                <Sparkles size={13} className="sds-sparkle-spin" />
                <span>Our Heritage & Craftsmanship</span>
              </div>

              <h2 className="sds-brand-story-heading">
                Craftsmanship, <br />
                <span className="sds-text-gold-gradient">Passed Through Generations</span>
              </h2>

              <p className="sds-brand-story-lead">
                At Shri Deepaalaya Silks, every saree tells a story of master artisans, heritage
                looms, and an unwavering devotion to India's finest textile traditions. We source directly from
                artisan weaving clusters across Tamil Nadu and Varanasi.
              </p>

              <p>
                From heirloom bridal Kanjivaram silks woven with pure gold korvai zari to featherlight daily cotton drapes, 
                every weave is an enduring celebration of authenticity, beauty, and grace.
              </p>

              {/* Animated Heritage Stats Counters */}
              <div className="sds-heritage-stats-grid">
                <div className="sds-stat-card">
                  <span className="sds-stat-number">35<span className="sds-stat-plus">+</span></span>
                  <span className="sds-stat-label">Years of Weaving Legacy</span>
                </div>
                <div className="sds-stat-card">
                  <span className="sds-stat-number">100<span className="sds-stat-plus">%</span></span>
                  <span className="sds-stat-label">Silk Mark Certified Purity</span>
                </div>
                <div className="sds-stat-card">
                  <span className="sds-stat-number">50K<span className="sds-stat-plus">+</span></span>
                  <span className="sds-stat-label">Delighted Celebrations</span>
                </div>
              </div>

              <div className="sds-story-actions">
                <Link to="/categories" className="sds-story-cta-btn">
                  <span>Explore All Collections</span>
                  <ArrowRight size={16} className="sds-cta-arrow-icon" />
                </Link>
                <div className="sds-story-trust-chip">
                  <ShieldCheck size={16} className="sds-shield-gold" />
                  <span>Certified Pure Handloom</span>
                </div>
              </div>
            </motion.div>

            {/* Right: Animated Showcase Visual Frame & Floating Badges */}
            <motion.div 
              className="sds-brand-story-visual-wrap"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.65, ease: "easeOut", delay: 0.15 }}
            >
              {/* Ambient Golden Glow Aura */}
              <div className="sds-story-ambient-glow" aria-hidden="true" />

              {/* Main Image Frame */}
              <div className="sds-story-image-card">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeStoryImg}
                    className="sds-story-active-image-wrap"
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                  >
                    <img 
                      src={storyImages[activeStoryImg].url} 
                      alt={storyImages[activeStoryImg].caption}
                      className="sds-story-photo"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                    <div className="sds-story-photo-gradient" />
                    
                    {/* Bottom Caption Overlay */}
                    <div className="sds-story-photo-caption">
                      <span className="sds-story-caption-title">{storyImages[activeStoryImg].caption}</span>
                      <p className="sds-story-caption-desc">{storyImages[activeStoryImg].desc}</p>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Floating Micro-Badge Top Right */}
                <motion.div 
                  className="sds-story-floating-badge sds-floating-badge-top"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Award size={18} className="sds-badge-icon-gold" />
                  <div>
                    <strong>Silk Mark Certified</strong>
                    <span>100% Pure Mulberry Silk</span>
                  </div>
                </motion.div>

                {/* Floating Micro-Badge Bottom Left */}
                <motion.div 
                  className="sds-story-floating-badge sds-floating-badge-bottom"
                  animate={{ y: [0, 8, 0] }}
                  transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                >
                  <Star size={18} className="sds-badge-icon-gold" />
                  <div>
                    <strong>Heritage Korvai Weave</strong>
                    <span>Handwoven in Kanchipuram</span>
                  </div>
                </motion.div>
              </div>

              {/* Interactive Thumbnail Switchers */}
              <div className="sds-story-thumbnail-nav">
                {storyImages.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`sds-story-thumb-btn ${activeStoryImg === i ? 'active' : ''}`}
                    onClick={() => setActiveStoryImg(i)}
                    aria-label={`View photo ${i + 1}: ${img.caption}`}
                  >
                    <span className="sds-thumb-bar" />
                    <span className="sds-thumb-label">{img.caption}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <div className="sds-ornament-divider" aria-hidden="true">
        <div className="sds-ornament-gem" />
      </div>

      {/* ── 7. TRUST INDICATORS (ANIMATED SHOP WITH CONFIDENCE) ── */}
      <section className="sds-section sds-section-alt sds-trust-section" aria-label="Why shop with us">
        <div className="sds-container">
          <motion.div 
            className="sds-trust-header"
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="sds-story-eyebrow-pill">
              <Sparkles size={13} className="sds-sparkle-spin" />
              <span>Why Choose Shri Deepaalaya Silks</span>
            </div>
            <h2 className="sds-section-title">
              Shop with <span className="sds-trust-title-accent">Unwavering Confidence</span>
            </h2>
            <p className="sds-trust-subtitle">
              Cherishing your life's grand celebrations with authentic handloom silks, fair artisan pricing, and royal hospitality.
            </p>
          </motion.div>

          <motion.div 
            className="sds-trust-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.12 }
              }
            }}
          >
            {TRUST_ITEMS.map((item) => (
              <motion.div 
                key={item.title} 
                className="sds-trust-card"
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } }
                }}
                whileHover={{ y: -8, transition: { duration: 0.25 } }}
              >
                {/* Diagonal Gleam Sweep on Hover */}
                <div className="sds-trust-card-gleam" aria-hidden="true" />

                {/* Top Badge Pill */}
                <div className="sds-trust-top-badge">
                  <span>{item.badge}</span>
                </div>

                {/* Animated Glowing Icon Orb */}
                <div className="sds-trust-icon-wrapper">
                  <div className="sds-trust-icon-halo" aria-hidden="true" />
                  <div className="sds-trust-icon-circle">
                    <item.icon size={28} strokeWidth={1.65} className="sds-trust-lucide-icon" />
                  </div>
                </div>

                {/* Text Content */}
                <h3 className="sds-trust-card-title">{item.title}</h3>
                <p className="sds-trust-card-desc">{item.desc}</p>

                {/* Bottom Highlight Tag */}
                <div className="sds-trust-highlight-tag">
                  <CheckCircle size={12} className="sds-trust-highlight-check" />
                  <span>{item.highlight}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Confidence Guarantee Ribbon */}
          <motion.div 
            className="sds-trust-guarantee-ribbon"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="sds-guarantee-item">
              <ShieldCheck size={20} className="sds-guarantee-icon" />
              <div>
                <strong>7-Day Easy Exchange</strong>
                <span>Hassle-free size & color swaps</span>
              </div>
            </div>
            <div className="sds-guarantee-sep" aria-hidden="true" />
            <div className="sds-guarantee-item">
              <Award size={20} className="sds-guarantee-icon" />
              <div>
                <strong>Silk Mark Certified</strong>
                <span>Government authorized purity tag</span>
              </div>
            </div>
            <div className="sds-guarantee-sep" aria-hidden="true" />
            <div className="sds-guarantee-item">
              <Star size={20} className="sds-guarantee-icon" />
              <div>
                <strong>Luxury Gift Packaging</strong>
                <span>Tamper-proof auspicious box</span>
              </div>
            </div>
            <div className="sds-guarantee-sep" aria-hidden="true" />
            <div className="sds-guarantee-item">
              <Sparkles size={20} className="sds-guarantee-icon" />
              <div>
                <strong>Personal Video Shopping</strong>
                <span>Live saree viewing before dispatch</span>
              </div>
            </div>
          </motion.div>
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
