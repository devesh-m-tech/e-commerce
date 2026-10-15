import React from "react";
import { Link } from "react-router-dom";
import {
  FiMapPin,
  FiArrowRight,
  FiCheckCircle,
} from "react-icons/fi";
import { FaHandshake, FaGem, FaAward } from "react-icons/fa6";
import { GiTempleDoor } from "react-icons/gi";
import "./AboutUs.css";

const STATS = [
  { value: "35+", label: "Years of Silk Tradition" },
  { value: "10,000+", label: "Brides Adorned" },
  { value: "100%", label: "Pure Handloom Silks" },
  { value: "500+", label: "Artisan Weavers Supported" },
];

const VALUES = [
  {
    icon: FaHandshake,
    title: "Direct Master Weaver Partnerships",
    desc: "We work directly with generational master weavers in Kanchipuram, Arani, and Banaras, eliminating middlemen to ensure fair remuneration for artisans and unmatched authenticity for you.",
  },
  {
    icon: FaGem,
    title: "Pure Zari & Authentic Silk Mark",
    desc: "Every bridal and festive weave is tested for zari purity and silk grain. Our silks proudly carry certified authenticity, featuring genuine silver and gold dipped thread artistry.",
  },
  {
    icon: FaAward,
    title: "Purity & Hygiene Assurance",
    desc: "Pure silks are sacred heirlooms. To preserve untouched purity and pristine condition for brides, our garments undergo multi-tier inspection before dispatch under a strict no-return policy.",
  },
  {
    icon: FaHandshake,
    title: "Generations of Family Trust",
    desc: "From wedding muhurthams and baby showers to temple festivals, families across South India and abroad trust Shri Deepaalaya Silks for life's most cherished milestones.",
  },
];

const AboutUs = () => {
  return (
    <div className="sds-about-page">
      <main>
        {/* ── Hero Section ── */}
        <section className="sds-about-hero">
          <div className="sds-about-hero-inner">
            <span className="sds-about-tagline">
              Tradition · Craftsmanship · Elegance
            </span>
            <h1 className="sds-about-hero-title">
              Preserving the Royal Art of <br />
              <span>South Indian Handloom Silks</span>
            </h1>
            <p className="sds-about-hero-sub">
              At <strong>Shri Deepaalaya Silks</strong>, every saree tells a story of heritage, devotion, and centuries-old weaving mastery born in the temple towns of Tamil Nadu.
            </p>
          </div>
        </section>

        {/* ── Stats Strip ── */}
        <section className="sds-about-stats-strip">
          <div className="sds-about-stats-grid">
            {STATS.map((st, i) => (
              <div key={i} className="sds-about-stat-item">
                <div className="sds-about-stat-value">{st.value}</div>
                <div className="sds-about-stat-label">{st.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Heritage Story Section ── */}
        <section className="sds-about-section">
          <div className="sds-about-story-grid">
            <div className="sds-about-story-left">
              <span className="sds-about-kicker">Our Heritage Story</span>
              <h2 className="sds-about-h2">
                From Historic Vellore to Discerning Homes Worldwide
              </h2>
              <p className="sds-about-p">
                Founded with a reverence for authentic South Indian textiles, <strong>Shri Deepaalaya Silks</strong> began as a family-run sanctuary for authentic Kanchipuram and pure mulberry silks in Vellore.
              </p>
              <p className="sds-about-p">
                Every thread in our boutique is chosen with purpose. Handcrafted on traditional wooden looms by artisan families who have practiced their craft for generations, our silks feature timeless motifs: <em>Mayil</em> (peacock), <em>Yali</em> (mythical guardian), <em>Rudraksham</em>, and <em>Manga</em> (mango), all woven with genuine gold and silver zari.
              </p>
              <div className="sds-about-badges">
                <div className="sds-about-badge">
                  <FiCheckCircle className="sds-about-badge-icon" /> 100% Tested Pure Silk
                </div>
                <div className="sds-about-badge">
                  <FiCheckCircle className="sds-about-badge-icon" /> Traditional Korvai Weaves
                </div>
                <div className="sds-about-badge">
                  <FiCheckCircle className="sds-about-badge-icon" /> Heirloom Bridal Trousseaus
                </div>
              </div>
            </div>

            <div className="sds-about-promise-card">
              <div className="sds-about-card-icon-wrap">
                <FaAward />
              </div>
              <h3 className="sds-about-card-title">
                The Sacred Bridal Muhurtham Promise
              </h3>
              <p className="sds-about-card-text">
                A bride’s wedding saree is sacred. It is passed down through generations as an heirloom of blessing and beauty. We treat every order with the sanctity it deserves — carefully steamed, quality-inspected, and packaged with premium breathable saree covers.
              </p>
              <div className="sds-about-card-callout">
                <strong>Our Purity Standard:</strong>
                Because each creation is an authentic, delicate handloom masterpiece, we maintain a strict <strong>No-Return Policy</strong> to guarantee that every garment you receive is brand-new, untouched, and pristine. Verified transit damages or manufacturing flaws are supported under our controlled 7-day exchange program.
              </div>
            </div>
          </div>
        </section>

        {/* ── Values Section ── */}
        <section className="sds-about-values-wrap">
          <div className="sds-about-values-inner">
            <div className="sds-about-values-header">
              <span className="sds-about-kicker">Why Discerning Families Choose Us</span>
              <h2 className="sds-about-h2" style={{ marginTop: '8px' }}>
                Purity, Provenance & Artisanal Pride
              </h2>
            </div>

            <div className="sds-about-values-grid">
              {VALUES.map((val, idx) => (
                <div key={idx} className="sds-about-value-card">
                  <div className="sds-about-value-icon">
                    <val.icon />
                  </div>
                  <h3 className="sds-about-value-title">{val.title}</h3>
                  <p className="sds-about-value-desc">{val.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Showroom Destination CTA ── */}
        <section className="sds-about-cta-section">
          <div className="sds-about-cta-box">
            <div className="sds-about-cta-text">
              <span className="sds-about-cta-kicker">Visit Our Flagship Destination</span>
              <h2 className="sds-about-cta-title">
                Experience South Indian Silks in Vellore
              </h2>
              <p className="sds-about-cta-desc">
                Step into our Vellore showroom for personalized bridal consultations, drape trials, and private viewings of our exclusive Kanchipuram bridal archive.
              </p>
              <div className="sds-about-cta-address">
                <FiMapPin /> Gandhi Road, Near Fort Round, Vellore, Tamil Nadu — 632004
              </div>
            </div>

            <div className="sds-about-cta-actions">
              <Link to="/category/cat_silk_sarees" className="sds-about-btn-gold">
                Shop Silk Sarees
              </Link>
              <Link to="/contact-us" className="sds-about-btn-outline">
                Contact Showroom <FiArrowRight />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AboutUs;
