import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiMapPin,
  FiArrowRight,
  FiCheckCircle,
  FiShield,
  FiAward,
} from "react-icons/fi";
import {
  FaHandshake,
  FaGem,
  FaAward,
  FaCrown,
  FaCertificate,
  FaLeaf,
  FaScroll,
  FaBoxOpen,
} from "react-icons/fa6";

// React Bits premium animation components
import {
  BlurText,
  ShinyText,
  CountUp,
  SpotlightCard,
  BorderBeam,
  TiltedCard,
  MagneticButton,
  InfiniteMarquee,
} from "../reactbits";

import "./AboutUs.css";

const STATS = [
  { value: "35+", label: "Years of Silk Tradition", numeric: 35, suffix: "+" },
  { value: "10,000+", label: "Brides Adorned", numeric: 10000, suffix: "+" },
  { value: "100%", label: "Pure Handloom Silks", numeric: 100, suffix: "%" },
  { value: "500+", label: "Artisan Weavers Supported", numeric: 500, suffix: "+" },
];

const WEAVING_STEPS = [
  { icon: FaLeaf, stage: "Step 01", title: "Mulberry Silk Cultivation" },
  { icon: FaGem, stage: "Step 02", title: "Pure Gold & Silver Zari Dipping" },
  { icon: FaScroll, stage: "Step 03", title: "Korvai Three-Shuttle Interlocking" },
  { icon: FaCrown, stage: "Step 04", title: "Heritage Mayil & Temple Motifs" },
  { icon: FaCertificate, stage: "Step 05", title: "Govt Certified Silk Mark" },
  { icon: FaBoxOpen, stage: "Step 06", title: "Sacred Muhurtham Bridal Box" },
];

const VALUES = [
  {
    icon: FaHandshake,
    title: "Direct Master Weaver Partnerships",
    desc: "We work directly with generational master weavers in Kanchipuram, Arani, and Banaras, eliminating middlemen to ensure fair remuneration for artisans and unmatched authenticity for you.",
    badge: "Direct from Loom",
  },
  {
    icon: FaGem,
    title: "Pure Zari & Authentic Silk Mark",
    desc: "Every bridal and festive weave is tested for zari purity and silk grain. Our silks proudly carry certified authenticity, featuring genuine silver and gold dipped thread artistry.",
    badge: "100% Certified",
  },
  {
    icon: FaAward,
    title: "Purity & Hygiene Assurance",
    desc: "Pure silks are sacred heirlooms. To preserve untouched purity and pristine condition for brides, our garments undergo multi-tier inspection before dispatch under a strict no-return policy.",
    badge: "Untouched Sacred Weaves",
  },
  {
    icon: FaCrown,
    title: "Generations of Family Trust",
    desc: "From wedding muhurthams and baby showers to temple festivals, families across South India and abroad trust Shri Deepaalaya Silks for life's most cherished milestones.",
    badge: "35+ Years Trust",
  },
];

const AboutUs = () => {
  return (
    <div className="sds-about-page">
      <main>
        {/* ── Hero Section with React Bits BlurText, ShinyText & Floating Aura ── */}
        <section className="sds-about-hero">
          <div className="sds-about-hero-backdrop-glow" aria-hidden="true" />
          <motion.div
            className="sds-about-hero-orb sds-about-hero-orb-1"
            animate={{
              y: [0, -18, 0],
              x: [0, 10, 0],
              scale: [1, 1.08, 1],
            }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            aria-hidden="true"
          />
          <motion.div
            className="sds-about-hero-orb sds-about-hero-orb-2"
            animate={{
              y: [0, 16, 0],
              x: [0, -12, 0],
              scale: [1, 1.05, 1],
            }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            aria-hidden="true"
          />

          <div className="sds-about-hero-inner">
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="sds-about-tagline-container"
            >
              <span className="sds-about-tagline-pill">
                <ShinyText text="Tradition · Craftsmanship · Elegance" speed={3.5} />
              </span>
            </motion.div>

            <h1 className="sds-about-hero-title">
              <BlurText
                text="Preserving the Royal Art of"
                delay={0.05}
                animateBy="words"
                direction="top"
                className="sds-about-hero-blur-line"
              />
              <br />
              <motion.span
                initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.8, delay: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
                className="sds-about-hero-highlight"
              >
                South Indian Handloom Silks
              </motion.span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.55 }}
              className="sds-about-hero-sub"
            >
              At <strong>Shri Deepaalaya Silks</strong>, every saree tells a story of heritage, devotion, and centuries-old weaving mastery born in the temple towns of Tamil Nadu.
            </motion.p>
          </div>
        </section>

        {/* ── Stats Strip with React Bits CountUp & SpotlightCard ── */}
        <section className="sds-about-stats-strip">
          <div className="sds-about-stats-grid">
            {STATS.map((st, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <SpotlightCard
                  className="sds-about-stat-spotlight"
                  spotlightColor="rgba(229, 184, 105, 0.28)"
                  borderColor="rgba(229, 184, 105, 0.45)"
                >
                  <div className="sds-about-stat-item">
                    <div className="sds-about-stat-value">
                      <CountUp
                        to={st.numeric}
                        suffix={st.suffix}
                        duration={2.2}
                        delay={0.15 * i}
                      />
                    </div>
                    <div className="sds-about-stat-label">{st.label}</div>
                  </div>
                </SpotlightCard>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Heritage Story Section with TiltedCard & BorderBeam ── */}
        <section className="sds-about-section">
          <div className="sds-about-story-grid">
            <motion.div
              className="sds-about-story-left"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <div className="sds-about-kicker-wrap">
                <ShinyText text="OUR HERITAGE STORY" speed={4} className="sds-about-kicker" />
              </div>
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
                <motion.div
                  className="sds-about-badge"
                  whileHover={{ scale: 1.05, y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <FiCheckCircle className="sds-about-badge-icon" /> 100% Tested Pure Silk
                </motion.div>
                <motion.div
                  className="sds-about-badge"
                  whileHover={{ scale: 1.05, y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <FiCheckCircle className="sds-about-badge-icon" /> Traditional Korvai Weaves
                </motion.div>
                <motion.div
                  className="sds-about-badge"
                  whileHover={{ scale: 1.05, y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <FiCheckCircle className="sds-about-badge-icon" /> Heirloom Bridal Trousseaus
                </motion.div>
              </div>
            </motion.div>

            {/* Sacred Promise Card with 3D TiltedCard & Traveling BorderBeam */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <TiltedCard maxTilt={8} perspective={1000} glare={true} scaleOnHover={1.02}>
                <div className="sds-about-promise-card">
                  <BorderBeam duration={7} borderWidth={2.5} colorFrom="#E5B869" colorTo="#6D1734" />
                  <motion.div
                    className="sds-about-card-icon-wrap"
                    whileHover={{ rotate: 12, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <FaAward />
                  </motion.div>
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
              </TiltedCard>
            </motion.div>
          </div>
        </section>

        {/* ── React Bits InfiniteMarquee: Handloom Weaving Process Ribbon ── */}
        <section className="sds-about-marquee-section">
          <div className="sds-about-marquee-header">
            <ShinyText text="FROM LOOM TO HEIRLOOM" speed={3.5} className="sds-about-kicker" />
            <h3 className="sds-about-marquee-title">The Sacred Handloom Journey</h3>
          </div>
          <div className="sds-about-marquee-container">
            <InfiniteMarquee speed={32} pauseOnHover={true}>
              {WEAVING_STEPS.map((step, idx) => (
                <div key={idx} className="sds-about-marquee-chip">
                  <span className="sds-about-chip-icon">
                    <step.icon />
                  </span>
                  <div className="sds-about-chip-texts">
                    <span className="sds-about-chip-stage">{step.stage}</span>
                    <span className="sds-about-chip-title">{step.title}</span>
                  </div>
                  <span className="sds-about-chip-divider">✦</span>
                </div>
              ))}
            </InfiniteMarquee>
          </div>
        </section>

        {/* ── Values Section with React Bits SpotlightCard & Staggered Motion ── */}
        <section className="sds-about-values-wrap">
          <div className="sds-about-values-inner">
            <motion.div
              className="sds-about-values-header"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6 }}
            >
              <ShinyText text="WHY DISCERNING FAMILIES CHOOSE US" speed={4} className="sds-about-kicker" />
              <h2 className="sds-about-h2" style={{ marginTop: "10px" }}>
                Purity, Provenance & Artisanal Pride
              </h2>
            </motion.div>

            <div className="sds-about-values-grid">
              {VALUES.map((val, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: idx * 0.12 }}
                >
                  <SpotlightCard
                    className="sds-about-value-spotlight-card"
                    spotlightColor="rgba(229, 184, 105, 0.22)"
                    borderColor="rgba(197, 161, 90, 0.45)"
                  >
                    <div className="sds-about-value-card-inner">
                      <div className="sds-about-value-card-top">
                        <div className="sds-about-value-icon">
                          <val.icon />
                        </div>
                        <span className="sds-about-value-pill">{val.badge}</span>
                      </div>
                      <h3 className="sds-about-value-title">{val.title}</h3>
                      <p className="sds-about-value-desc">{val.desc}</p>
                    </div>
                  </SpotlightCard>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Flagship Showroom Destination CTA with BorderBeam & MagneticButton ── */}
        <section className="sds-about-cta-section">
          <motion.div
            className="sds-about-cta-box-wrapper"
            initial={{ opacity: 0, scale: 0.96, y: 25 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <div className="sds-about-cta-box">
              <BorderBeam
                duration={10}
                borderWidth={2}
                colorFrom="#f6d365"
                colorTo="#E5B869"
              />

              <div className="sds-about-cta-text">
                <span className="sds-about-cta-kicker">
                  <ShinyText text="VISIT OUR FLAGSHIP DESTINATION" speed={3.2} />
                </span>
                <h2 className="sds-about-cta-title">
                  Experience South Indian Silks in Vellore
                </h2>
                <p className="sds-about-cta-desc">
                  Step into our Vellore showroom for personalized bridal consultations, drape trials, and private viewings of our exclusive Kanchipuram bridal archive.
                </p>
                <div className="sds-about-cta-address">
                  <FiMapPin className="sds-about-pin-pulse" /> Gandhi Road, Near Fort Round, Vellore, Tamil Nadu — 632004
                </div>
              </div>

              <div className="sds-about-cta-actions">
                <MagneticButton strength={0.28}>
                  <Link to="/products" className="sds-about-btn-gold">
                    Shop Silk Sarees
                  </Link>
                </MagneticButton>

                <MagneticButton strength={0.28}>
                  <Link to="/contact-us" className="sds-about-btn-outline">
                    Contact Showroom <FiArrowRight />
                  </Link>
                </MagneticButton>
              </div>
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  );
};

export default AboutUs;
