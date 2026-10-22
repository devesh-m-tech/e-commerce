import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Clock,
  Percent,
  ArrowRight,
  ShieldCheck,
  Check,
  Copy,
  Flame,
  ChevronRight,
  HelpCircle,
  Gem,
  Store
} from "lucide-react";
import Heading from "../Heading";
import { getAllDeals } from "../../APi/deals";
import "./DealsPage.css";

// Fallback authentic luxury deals if backend has no active deals or API fails
const FALLBACK_DEALS = [
  {
    _id: "deal-fallback-1",
    title: "Grand Muhurtham Bridal Pattu Celebration",
    content: "Exquisite bridal trousseau collection with celebratory savings on authentic Kanchipuram pure zari pattu and temple heirloom jewellery.",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85",
    endDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active",
    products: [
      {
        product: {
          _id: "6ad849c6726555a65e623dd4",
          pName: "Sindoor Red Grand Muhurtham Pure Kanchipuram Saree",
          pCategory: "Bridal Collection",
          pBrand: "Shri Deepaalaya Silks",
          pImage: ["https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80"]
        },
        variant: { price: 34500 },
        dealPrice: 25875,
        dealDiscount: 25
      },
      {
        product: {
          _id: "6acdb0393511971e7102aec4",
          pName: "22K Gold Finish Temple Lakshmi Choker Set",
          pCategory: "Heirloom Jewellery",
          pBrand: "Shri Deepaalaya Silks",
          pImage: ["https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80"]
        },
        variant: { price: 8999 },
        dealPrice: 6749,
        dealDiscount: 25
      },
      {
        product: {
          _id: "6acdb0393511971e7102aec7",
          pName: "Heirloom Kasu Haram Long Bridal Necklace",
          pCategory: "Heirloom Jewellery",
          pBrand: "Shri Deepaalaya Silks",
          pImage: ["https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80"]
        },
        variant: { price: 12500 },
        dealPrice: 9375,
        dealDiscount: 25
      },
      {
        product: {
          _id: "6acdb03a3511971e7102aed0",
          pName: "Royal Crimson Zardozi Bridal Lehenga",
          pCategory: "Bridal Collection",
          pBrand: "Shri Deepaalaya Silks",
          pImage: ["https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80"]
        },
        variant: { price: 48000 },
        dealPrice: 36000,
        dealDiscount: 25
      }
    ]
  },
  {
    _id: "deal-fallback-2",
    title: "Festival of Silks & Heirloom Jewellery Deal",
    content: "Special curated festive discount on authentic pure silk sarees and heirloom jewellery collections.",
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=85",
    endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active",
    products: [
      {
        product: {
          _id: "6acdb0393511971e7102aebb",
          pName: "Crimson Red Kanchipuram Pure Silk Saree",
          pCategory: "Silk Sarees",
          pBrand: "Shri Deepaalaya Silks",
          pImage: ["https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80"]
        },
        variant: { price: 28500 },
        dealPrice: 22800,
        dealDiscount: 20
      },
      {
        product: {
          _id: "6acdb0393511971e7102aebe",
          pName: "Peacock Blue Banarasi Katan Silk Saree",
          pCategory: "Silk Sarees",
          pBrand: "Shri Deepaalaya Silks",
          pImage: ["https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80"]
        },
        variant: { price: 22400 },
        dealPrice: 17920,
        dealDiscount: 20
      },
      {
        product: {
          _id: "6acdb0393511971e7102aec1",
          pName: "Pastel Mint Green Soft Silk Saree",
          pCategory: "Silk Sarees",
          pBrand: "Shri Deepaalaya Silks",
          pImage: ["https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80"]
        },
        variant: { price: 13500 },
        dealPrice: 10800,
        dealDiscount: 20
      },
      {
        product: {
          _id: "6ad849a1726555a65e623dbd",
          pName: "Golden Honey Handcrafted Tussar Silk Saree",
          pCategory: "Silk Sarees",
          pBrand: "Shri Deepaalaya Silks",
          pImage: ["https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80"]
        },
        variant: { price: 11200 },
        dealPrice: 8960,
        dealDiscount: 20
      }
    ]
  }
];

// Exclusive luxury boutique promo vouchers
const PROMO_VOUCHERS = [
  {
    code: "DEEPAALAYA10",
    badge: "Special Silk Courtesy",
    discount: "Flat 10% OFF",
    desc: "Valid on all pure Kanchipuram & Banarasi silk orders above ₹9,999",
    expiry: "Valid till Festive Season"
  },
  {
    code: "MUHURTHAM25",
    badge: "Bridal Trousseau",
    discount: "25% Festive Offer",
    desc: "Applied on complete bridal pattu saree & jewellery trousseau sets",
    expiry: "Limited Muhurtham Edition"
  },
  {
    code: "FIRSTSILK",
    badge: "Welcome Privilege",
    discount: "₹500 OFF",
    desc: "Save ₹500 on your first authentic handloom purchase above ₹2,999",
    expiry: "New Patrons Only"
  },
  {
    code: "FREESHIP",
    badge: "Complimentary Delivery",
    discount: "Free Air Shipping",
    desc: "100% Insured express door delivery across 27,000+ Indian pincodes",
    expiry: "All Eligible Orders"
  }
];

const CATEGORIES = [
  "All Offers",
  "Silk Sarees",
  "Bridal Collection",
  "Heirloom Jewellery",
  "Festive Combos"
];

const DealsPage = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All Offers");
  const [copiedCode, setCopiedCode] = useState("");
  const [timeLeft, setTimeLeft] = useState({ days: 18, hours: 14, minutes: 32, seconds: 40 });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    fetchDeals();
  }, []);

  // Real-time ticking countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (!prev) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const res = await getAllDeals();
      const rawDeals = Array.isArray(res?.deals)
        ? res.deals
        : Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
        ? res
        : [];

      // Filter active deals
      const activeDeals = rawDeals.filter(
        (d) => !d?.status || d.status === "active"
      );

      if (activeDeals.length > 0) {
        setDeals(activeDeals);
      } else {
        // Feed authentic fallback deals if backend has none
        setDeals(FALLBACK_DEALS);
      }
    } catch (err) {
      console.warn("Could not fetch deals from backend, using authentic fallback:", err);
      setDeals(FALLBACK_DEALS);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = (code) => {
    if (!code) return;
    try {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(""), 2200);
    } catch (e) {
      console.error("Clipboard copy failed:", e);
    }
  };

  const formatPrice = (price) => {
    const num = Number(price);
    if (isNaN(num)) return "₹0";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(num);
  };

  // Safe image resolver: handles Array, JSON string, or space-separated string
  const getProductImage = (product, dealImg) => {
    const fallbackImg = dealImg || "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80";
    if (!product) return fallbackImg;

    const pImg = product.pImage;
    if (Array.isArray(pImg) && pImg.length > 0 && typeof pImg[0] === "string") {
      return pImg[0];
    }
    if (typeof pImg === "string") {
      const trimmed = pImg.trim();
      if (trimmed.startsWith("[")) {
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed) && parsed[0]) return parsed[0];
        } catch (e) {}
      }
      const first = trimmed.split(/\s+/)[0];
      if (first) return first;
    }
    return fallbackImg;
  };

  // Flatten all products across active deals for display with full defensive guards
  const allDealProducts = [];
  if (Array.isArray(deals)) {
    deals.forEach((deal) => {
      if (Array.isArray(deal?.products)) {
        deal.products.forEach((dp) => {
          if (dp && dp.product && typeof dp.product === "object" && dp.product._id) {
            const prod = dp.product;
            const dealDiscount = Number(dp.dealDiscount) || 20;
            const dealPrice = Number(dp.dealPrice) || Number(prod.pPrice) || 12000;
            const origPrice = Number(dp.variant?.price) || Number(prod.pPrice) || Math.round(dealPrice / (1 - dealDiscount / 100));

            allDealProducts.push({
              dealId: deal._id || `deal-${Math.random()}`,
              dealTitle: deal.title || "Festive Silk Offer",
              dealImage: deal.image,
              dealDiscount,
              dealPrice,
              originalPrice: origPrice,
              product: prod,
              variant: dp.variant
            });
          }
        });
      }
    });
  }

  // Filter products by selected category
  const filteredProducts = allDealProducts.filter((item) => {
    if (selectedCategory === "All Offers") return true;
    const cat = String(item.product?.pCategory || "").toLowerCase();
    const title = String(item.dealTitle || "").toLowerCase();
    if (selectedCategory === "Silk Sarees") return cat.includes("silk");
    if (selectedCategory === "Bridal Collection") return cat.includes("bridal");
    if (selectedCategory === "Heirloom Jewellery") return cat.includes("jewel");
    if (selectedCategory === "Festive Combos") return cat.includes("combo") || title.includes("combo");
    return true;
  });

  const heroDeal = (Array.isArray(deals) && deals.length > 0) ? deals[0] : FALLBACK_DEALS[0];

  return (
    <>
      <Heading
        title="Exclusive Silk Deals & Festive Offers | Shri Deepaalaya Silks Vellore"
        description="Discover exclusive festive offers on pure Kanchipuram silk sarees, Banarasi katan, soft silks, and bridal heirloom jewellery at Shri Deepaalaya Silks, Vellore."
        keywords="silk saree deals, Kanchipuram discount, bridal silk offer, Shri Deepaalaya Silks deals, pure silk offers India, temple jewellery sale"
      />

      <div className="sds-deals-page">
        {/* ── Luxury Hero Header ── */}
        <header className="sds-deals-hero">
          <div className="sds-deals-hero-bg-overlay" />
          <div className="sds-deals-container">
            <nav className="sds-deals-breadcrumbs" aria-label="Breadcrumb">
              <Link to="/" className="sds-bc-link">Home</Link>
              <span className="sds-bc-sep">/</span>
              <span className="sds-bc-current">Exclusive Offers</span>
            </nav>

            <div className="sds-deals-badge">
              <Sparkles size={14} className="sds-badge-sparkle" />
              <span>Festive Weaves & Heirloom Savings • Shri Deepaalaya Silks</span>
            </div>

            <h1 className="sds-deals-title">Royal Handloom Offers & Festive Deals</h1>
            <p className="sds-deals-subtitle">
              Authentic handwoven pure silk sarees, auspicious wedding pattu, and handcrafted temple jewellery curated with limited-edition festive privileges directly from our Vellore vaults.
            </p>

            {/* Quick Stats Bar */}
            <div className="sds-deals-stats-bar">
              <div className="sds-dstat-item">
                <span className="sds-dstat-val">Up to 25% OFF</span>
                <span className="sds-dstat-lbl">Authentic Handlooms</span>
              </div>
              <div className="sds-dstat-div" />
              <div className="sds-dstat-item">
                <span className="sds-dstat-val">100% Pure Silk</span>
                <span className="sds-dstat-lbl">Silk Mark Certified</span>
              </div>
              <div className="sds-dstat-div" />
              <div className="sds-dstat-item">
                <span className="sds-dstat-val">24–48h Dispatch</span>
                <span className="sds-dstat-lbl">From Vellore Showroom</span>
              </div>
              <div className="sds-dstat-div" />
              <div className="sds-dstat-item">
                <span className="sds-dstat-val">Free Insured Air</span>
                <span className="sds-dstat-lbl">On Eligible Orders</span>
              </div>
            </div>
          </div>
        </header>

        {/* ── Main Content Container ── */}
        <main className="sds-deals-container sds-deals-main-content">

          {/* ── Featured Deal Spotlight Banner ── */}
          {heroDeal && (
            <section className="sds-spotlight-card" aria-label="Featured Offer Spotlight">
              <div className="sds-spotlight-inner">
                <div className="sds-spotlight-text">
                  <div className="sds-spotlight-tag">
                    <Flame size={14} />
                    <span>Featured Festive Deal</span>
                  </div>
                  <h2 className="sds-spotlight-title">{heroDeal.title || "Festive Pure Silk Offer"}</h2>
                  <p className="sds-spotlight-desc">{heroDeal.content || "Limited period celebratory discount on authentic pure silk weaves."}</p>

                  {/* Real-Time Countdown Timer */}
                  <div className="sds-countdown-wrap">
                    <span className="sds-countdown-label">
                      <Clock size={14} />
                      <span>Special Offer Ends In:</span>
                    </span>
                    <div className="sds-countdown-grid">
                      <div className="sds-time-box">
                        <span className="sds-time-val">{String(timeLeft?.days || 0).padStart(2, "0")}</span>
                        <span className="sds-time-sub">Days</span>
                      </div>
                      <span className="sds-time-colon">:</span>
                      <div className="sds-time-box">
                        <span className="sds-time-val">{String(timeLeft?.hours || 0).padStart(2, "0")}</span>
                        <span className="sds-time-sub">Hours</span>
                      </div>
                      <span className="sds-time-colon">:</span>
                      <div className="sds-time-box">
                        <span className="sds-time-val">{String(timeLeft?.minutes || 0).padStart(2, "0")}</span>
                        <span className="sds-time-sub">Mins</span>
                      </div>
                      <span className="sds-time-colon">:</span>
                      <div className="sds-time-box">
                        <span className="sds-time-val">{String(timeLeft?.seconds || 0).padStart(2, "0")}</span>
                        <span className="sds-time-sub">Secs</span>
                      </div>
                    </div>
                  </div>

                  <div className="sds-spotlight-actions">
                    <a href="#sds-products-grid" className="sds-spotlight-btn-primary">
                      <span>Explore Deal Products</span>
                      <ArrowRight size={16} />
                    </a>
                    <Link to="/products" className="sds-spotlight-btn-secondary">
                      <span>All Collections</span>
                    </Link>
                  </div>
                </div>

                <div className="sds-spotlight-media">
                  <img
                    src={heroDeal.image || "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85"}
                    alt={heroDeal.title || "Featured Deal"}
                    className="sds-spotlight-img"
                  />
                  <div className="sds-spotlight-ribbon">
                    <span>LIMITED EDITION</span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ── Active Deals Summary Cards ── */}
          {Array.isArray(deals) && deals.length > 0 && (
            <section className="sds-deals-summary-sec">
              <div className="sds-sec-heading">
                <span className="sds-sec-eyebrow">CELEBRATION CATALOG</span>
                <h2>Active Store Offers & Collections</h2>
                <p>Special edition packages curated by our master handloom stylists in Vellore.</p>
              </div>

              <div className="sds-summary-cards-grid">
                {deals.map((d, idx) => (
                  <div key={d?._id || idx} className="sds-deal-summary-card">
                    <div className="sds-dsc-image-wrap">
                      <img
                        src={d?.image || "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80"}
                        alt={d?.title || "Deal"}
                        className="sds-dsc-img"
                      />
                      <div className="sds-dsc-badge">
                        <Percent size={13} />
                        <span>Festive Deal</span>
                      </div>
                    </div>
                    <div className="sds-dsc-body">
                      <h3>{d?.title || "Exclusive Silk Deal"}</h3>
                      <p>{d?.content || "Special handcrafted pure silk saree discount."}</p>
                      <div className="sds-dsc-footer">
                        <span className="sds-dsc-count">
                          <Gem size={13} />
                          <span>{Array.isArray(d?.products) ? d.products.length : 4} Featured Pieces</span>
                        </span>
                        <a href="#sds-products-grid" className="sds-dsc-link">
                          <span>View Items</span>
                          <ChevronRight size={14} />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Products on Deal Grid ── */}
          <section id="sds-products-grid" className="sds-deal-products-sec">
            <div className="sds-sec-heading">
              <span className="sds-sec-eyebrow">HANDPICKED PIECES</span>
              <h2>Products with Exclusive Offer Pricing</h2>
              <p>Direct weaver prices on qualifying bridal sarees and heirloom accessories.</p>
            </div>

            {/* Category Filter Pills */}
            <div className="sds-filter-pill-bar">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`sds-cat-pill ${selectedCategory === cat ? "is-active" : ""}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Product Cards Grid */}
            {loading ? (
              <div className="sds-products-grid">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="sds-deal-prod-card sds-shimmer-card">
                    <div className="sds-shimmer-img" />
                    <div className="sds-shimmer-body">
                      <div className="sds-shimmer-line line-sm" />
                      <div className="sds-shimmer-line line-lg" />
                      <div className="sds-shimmer-line line-md" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="sds-empty-state">
                <HelpCircle size={40} className="sds-empty-icon" />
                <h3>No Products Found in this Category</h3>
                <p>Try switching to "All Offers" to view available pure silk deals.</p>
                <button
                  type="button"
                  onClick={() => setSelectedCategory("All Offers")}
                  className="sds-spotlight-btn-primary"
                >
                  View All Offers
                </button>
              </div>
            ) : (
              <div className="sds-products-grid">
                {filteredProducts.map((item, index) => {
                  const prod = item.product || {};
                  const img = getProductImage(prod, item.dealImage);
                  const discountPct = item.dealDiscount || 20;
                  const dealPrice = item.dealPrice || 12000;
                  const origPrice = item.originalPrice || Math.round(dealPrice * 1.25);
                  const savings = Math.max(0, origPrice - dealPrice);

                  return (
                    <div key={`${item.dealId}-${prod._id || index}`} className="sds-deal-prod-card">
                      <div className="sds-prod-img-box">
                        <img src={img} alt={prod.pName || "Silk Product"} className="sds-prod-img" />
                        <span className="sds-prod-discount-badge">{discountPct}% OFF</span>
                        <div className="sds-prod-deal-tag">{item.dealTitle}</div>
                      </div>

                      <div className="sds-prod-details">
                        <span className="sds-prod-category">{prod.pCategory || "Pure Silk Saree"}</span>
                        <h4 className="sds-prod-title">
                          <Link to={`/product/${prod._id}`}>{prod.pName || "Pure Silk Saree"}</Link>
                        </h4>

                        <div className="sds-prod-pricing">
                          <div className="sds-price-stack">
                            <span className="sds-deal-price">{formatPrice(dealPrice)}</span>
                            {origPrice > dealPrice && (
                              <span className="sds-orig-price">{formatPrice(origPrice)}</span>
                            )}
                          </div>
                          {savings > 0 && (
                            <span className="sds-savings-badge">Save {formatPrice(savings)}</span>
                          )}
                        </div>

                        <div className="sds-prod-actions">
                          <Link to={`/product/${prod._id}`} className="sds-prod-view-btn">
                            <span>View Piece</span>
                            <ArrowRight size={14} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* ── Exclusive Boutique Promo Vouchers ── */}
          <section className="sds-vouchers-section" aria-label="Discount Vouchers">
            <div className="sds-sec-heading">
              <span className="sds-sec-eyebrow">COUPONS & COURTESIES</span>
              <h2>Boutique Discount Codes</h2>
              <p>Apply these promotional codes at checkout for instant order privileges.</p>
            </div>

            <div className="sds-vouchers-grid">
              {PROMO_VOUCHERS.map((v) => {
                const isCopied = copiedCode === v.code;
                return (
                  <div key={v.code} className="sds-voucher-card">
                    <div className="sds-voucher-left">
                      <div className="sds-voucher-badge">{v.badge}</div>
                      <div className="sds-voucher-discount">{v.discount}</div>
                      <p className="sds-voucher-desc">{v.desc}</p>
                      <span className="sds-voucher-expiry">
                        <Clock size={12} />
                        <span>{v.expiry}</span>
                      </span>
                    </div>

                    <div className="sds-voucher-divider">
                      <div className="sds-voucher-notch-top" />
                      <div className="sds-voucher-dash-line" />
                      <div className="sds-voucher-notch-bottom" />
                    </div>

                    <div className="sds-voucher-right">
                      <span className="sds-code-label">PROMO CODE</span>
                      <div className="sds-code-val">{v.code}</div>
                      <button
                        type="button"
                        className={`sds-copy-btn ${isCopied ? "is-copied" : ""}`}
                        onClick={() => handleCopyCode(v.code)}
                      >
                        {isCopied ? (
                          <>
                            <Check size={14} />
                            <span>COPIED!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={14} />
                            <span>COPY CODE</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ── Showroom Heritage Guarantee Strip ── */}
          <section className="sds-guarantee-card">
            <div className="sds-guarantee-grid">
              <div className="sds-g-item">
                <div className="sds-g-icon-box"><Gem size={22} /></div>
                <div className="sds-g-info">
                  <strong>100% Pure Silk Mark</strong>
                  <span>Every saree comes with authentic national Silk Mark certification tag.</span>
                </div>
              </div>
              <div className="sds-g-item">
                <div className="sds-g-icon-box"><ShieldCheck size={22} /></div>
                <div className="sds-g-info">
                  <strong>Direct Weaver Pricing</strong>
                  <span>Authentic Kanchipuram master weavers with zero intermediary markups.</span>
                </div>
              </div>
              <div className="sds-g-item">
                <div className="sds-g-icon-box"><Store size={22} /></div>
                <div className="sds-g-info">
                  <strong>Vellore Flagship Vaults</strong>
                  <span>Inspected, steamed, and dispatched directly from Gandhi Road, Vellore.</span>
                </div>
              </div>
            </div>
          </section>

        </main>
      </div>
    </>
  );
};

export default DealsPage;
