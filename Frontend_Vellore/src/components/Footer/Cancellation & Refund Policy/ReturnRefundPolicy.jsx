import React, { useState } from 'react';
import './ReturnRefundPolicy.css';
import {
  FaCalendarAlt, FaShieldAlt, FaCheckCircle,
  FaExclamationTriangle, FaTruck, FaUndo,
  FaPhone, FaEnvelope, FaMapMarkerAlt,
  FaTimesCircle, FaGem, FaHandHoldingHeart
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

const sections = [
  { id: 1, icon: FaTimesCircle,        title: 'Strict No-Return & No-Refund Policy' },
  { id: 2, icon: FaTimesCircle,        title: 'Strict No-Exchange Policy' },
  { id: 3, icon: FaGem,                title: 'The Sanctity of Bridal Silks' },
  { id: 4, icon: FaHandHoldingHeart,   title: 'Authentic Handloom Characteristics' },
  { id: 5, icon: FaTruck,              title: 'Transit Safety & Delivery Protocol' },
  { id: 6, icon: FaUndo,               title: 'Pre-Dispatch Order Cancellations' },
  { id: 7, icon: FaPhone,              title: 'Store Contact & Fabric Care Assistance' },
];

const ReturnRefundPolicy = () => {
  const [activeSection, setActiveSection] = useState(null);

  const scrollTo = (id) => {
    const el = document.getElementById(`rr-section-${id}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveSection(id);
  };

  return (
    <div className="rr-page">

      {/* ── Hero ── */}
      <div className="rr-hero">
        <div className="rr-hero-inner">
          <div className="rr-hero-badge">
            <FaShieldAlt />
            <span>Shri Deepaalaya Silks • Vellore</span>
          </div>
          <h1 className="rr-hero-title">Strict No-Return & No-Exchange Policy</h1>
          <p className="rr-hero-sub">
            Each silk saree and heirloom product at Shri Deepaalaya Silks is handcrafted with exquisite precision by our master weavers. To guarantee that every patron receives a 100% brand-new, untouched creation, we maintain a strict No-Return and No-Exchange policy.
          </p>
          <div className="rr-hero-meta">
            <span className="rr-meta-chip">
              <FaCalendarAlt /> Effective: 2024–2026
            </span>
            <span className="rr-meta-chip">
              <FaTimesCircle /> No Monetary Refunds
            </span>
            <span className="rr-meta-chip">
              <FaTimesCircle /> No Exchanges Allowed
            </span>
            <span className="rr-meta-chip">
              <FaCheckCircle /> 100% Silk Mark Certified
            </span>
          </div>
        </div>
      </div>

      {/* ── Stats Strip ── */}
      <div className="rr-stats-strip">
        <div className="rr-stats-inner">
          <div className="rr-stat">
            <span className="rr-stat-value">No Returns</span>
            <span className="rr-stat-label">Strict Store Policy</span>
          </div>
          <div className="rr-stat-divider" />
          <div className="rr-stat">
            <span className="rr-stat-value">No Exchanges</span>
            <span className="rr-stat-label">Untouched Purity Standard</span>
          </div>
          <div className="rr-stat-divider" />
          <div className="rr-stat">
            <span className="rr-stat-value">100% Inspected</span>
            <span className="rr-stat-label">Pure Silk Mark Verification</span>
          </div>
          <div className="rr-stat-divider" />
          <div className="rr-stat">
            <span className="rr-stat-value">Safe Transit</span>
            <span className="rr-stat-label">Tamper-Proof Insured Shipping</span>
          </div>
        </div>
      </div>

      <div className="rr-body">
        <div className="rr-layout">

          {/* ── Sidebar TOC ── */}
          <aside className="rr-toc">
            <div className="rr-toc-card">
              <h3 className="rr-toc-title">Table of Contents</h3>
              <ul className="rr-toc-list">
                {sections.map((s) => (
                  <li key={s.id}>
                    <button
                      className={`rr-toc-btn ${activeSection === s.id ? 'active' : ''}`}
                      onClick={() => scrollTo(s.id)}
                    >
                      <span className="rr-toc-num">{s.id}.</span>
                      <span>{s.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
              <div className="rr-toc-footer">
                <Link to="/contact-us" className="rr-toc-action-btn">
                  Contact Silk Care Desk &rarr;
                </Link>
              </div>
            </div>
          </aside>

          {/* ── Content ── */}
          <main className="rr-content">

            {/* Section 1 */}
            <section id="rr-section-1" className="rr-section">
              <div className="rr-sec-header">
                <div className="rr-sec-icon-wrap danger">
                  <FaTimesCircle />
                </div>
                <div>
                  <span className="rr-sec-num">Section 1</span>
                  <h2 className="rr-sec-title">Strict No-Return & No-Refund Policy</h2>
                </div>
              </div>
              <div className="rr-sec-body">
                <p>
                  At <strong>Shri Deepaalaya Silks</strong>, every pure silk saree, tissue zari fabric, and traditional bridal heirloom is individually steamed, quality-checked, and authenticated by our master craftsmen prior to packaging and dispatch. Due to the delicate nature of pure silk, real silver/gold zari, and bridal wear sanctity, <strong>we strictly do not accept returns or issue monetary refunds under any circumstances</strong>.
                </p>
                <div className="rr-callout warning">
                  <FaExclamationTriangle className="rr-callout-icon" />
                  <div>
                    <strong>Important Notice:</strong> Orders once placed and delivered are non-refundable. All sales are final. Customers are requested to examine sizing, color nuances, motifs, and fabric descriptions carefully before placing an order.
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2 */}
            <section id="rr-section-2" className="rr-section">
              <div className="rr-sec-header">
                <div className="rr-sec-icon-wrap danger">
                  <FaTimesCircle />
                </div>
                <div>
                  <span className="rr-sec-num">Section 2</span>
                  <h2 className="rr-sec-title">Strict No-Exchange Policy</h2>
                </div>
              </div>
              <div className="rr-sec-body">
                <p>
                  In accordance with the sacred heritage of our bridal and handloom attire, <strong>we do not offer exchanges for any item</strong>, including size changes, color swaps, or alternate product selections.
                </p>
                <ul className="rr-list">
                  <li>
                    <strong>No Size or Color Exchanges:</strong> We do not accept exchanges for fit, color preference, or change of mind after delivery.
                  </li>
                  <li>
                    <strong>No Product Replacements:</strong> Because each saree is a single unique loom piece, individual swaps cannot be facilitated.
                  </li>
                  <li>
                    <strong>Untouched Hygiene & Sanctity:</strong> To uphold religious sanctity and hygiene for auspicious occasions, sarees once delivered to a patron are never restocked or re-issued.
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 3 */}
            <section id="rr-section-3" className="rr-section">
              <div className="rr-sec-header">
                <div className="rr-sec-icon-wrap primary">
                  <FaGem />
                </div>
                <div>
                  <span className="rr-sec-num">Section 3</span>
                  <h2 className="rr-sec-title">The Sanctity of Bridal & Heirloom Silks</h2>
                </div>
              </div>
              <div className="rr-sec-body">
                <p>
                  A Muhurtham silk saree is not merely attire; it is an auspicious blessing passed down through generations. Our patrons trust Shri Deepaalaya Silks because every order received is guaranteed to be:
                </p>
                <div className="rr-grid-2">
                  <div className="rr-card">
                    <h4>1. 100% Virgin Handloom</h4>
                    <p>
                      Comes directly off the master weaver's pitloom, completely unworn, untried, and unhandled by third parties.
                    </p>
                  </div>
                  <div className="rr-card">
                    <h4>2. Pure Silk Mark Certified</h4>
                    <p>
                      Affixed with the authorized National Silk Mark label certifying genuine natural mulberry and tussar silk threads.
                    </p>
                  </div>
                  <div className="rr-card">
                    <h4>3. Master Craftsman Inspected</h4>
                    <p>
                      Each meter of silk and zari undergo rigorous 3-tier physical verification before being placed in bespoke protective cases.
                    </p>
                  </div>
                  <div className="rr-card">
                    <h4>4. Sacred & Auspicious</h4>
                    <p>
                      Treated with utmost reverence so your wedding, temple visit, or festival is graced by an untouched garment.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section id="rr-section-4" className="rr-section">
              <div className="rr-sec-header">
                <div className="rr-sec-icon-wrap accent">
                  <FaHandHoldingHeart />
                </div>
                <div>
                  <span className="rr-sec-num">Section 4</span>
                  <h2 className="rr-sec-title">Authentic Handloom Characteristics</h2>
                </div>
              </div>
              <div className="rr-sec-body">
                <p>
                  Authentic handloom weaving is a human art, not a mechanized plastic output. The following characteristics are natural badges of genuine weaver craftsmanship and are celebrated hallmarks of pure silk:
                </p>
                <ul className="rr-list">
                  <li>
                    <strong>Natural Slubs & Thread Nuances:</strong> Slight variations in hand-reeled silk thread thickness or weft density reflect the rhythm of the artisan's shuttle.
                  </li>
                  <li>
                    <strong>Hand-Knotted Zari Ends:</strong> Traditional pallu and border transitions often feature hand-twisted fringe threads characteristic of authentic Kanchipuram Korvai techniques.
                  </li>
                  <li>
                    <strong>Subtle Hue Variations:</strong> Hand-dyed silk yarns can display gentle variations across daylight and warm evening lighting.
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 5 */}
            <section id="rr-section-5" className="rr-section">
              <div className="rr-sec-header">
                <div className="rr-sec-icon-wrap success">
                  <FaTruck />
                </div>
                <div>
                  <span className="rr-sec-num">Section 5</span>
                  <h2 className="rr-sec-title">Transit Safety & Delivery Protocol</h2>
                </div>
              </div>
              <div className="rr-sec-body">
                <p>
                  Every dispatch is securely packaged in weatherproof, tamper-evident security boxes and fully insured during transit through premier national air cargo partners.
                </p>
                <p>
                  In the extremely rare event that your outer shipping parcel arrives physically tampered or damaged by the courier partner, <strong>please refuse delivery from the courier agent</strong> or notify our customer support desk within 24 hours with photographs of the unopened tamper box.
                </p>
              </div>
            </section>

            {/* Section 6 */}
            <section id="rr-section-6" className="rr-section">
              <div className="rr-sec-header">
                <div className="rr-sec-icon-wrap warning">
                  <FaUndo />
                </div>
                <div>
                  <span className="rr-sec-num">Section 6</span>
                  <h2 className="rr-sec-title">Pre-Dispatch Order Cancellations</h2>
                </div>
              </div>
              <div className="rr-sec-body">
                <p>
                  Orders can be cancelled exclusively <strong>prior to shipment/dispatch</strong> (while status shows "ORDER PLACED"). Once an order has been packed and handed over to the courier partner, cancellations cannot be processed.
                </p>
              </div>
            </section>

            {/* Section 7 */}
            <section id="rr-section-7" className="rr-section">
              <div className="rr-sec-header">
                <div className="rr-sec-icon-wrap primary">
                  <FaPhone />
                </div>
                <div>
                  <span className="rr-sec-num">Section 7</span>
                  <h2 className="rr-sec-title">Store Contact & Fabric Care Assistance</h2>
                </div>
              </div>
              <div className="rr-sec-body">
                <p>
                  For styling guidance, blouse tailoring inquiries, or fabric care consultations, our silk specialists at our Vellore flagship showroom are always happy to assist you:
                </p>
                <div className="rr-contact-grid">
                  <div className="rr-contact-card">
                    <FaEnvelope className="rr-contact-icon" />
                    <strong>Email Support</strong>
                    <a href="mailto:care@shrideepaalayasilks.com">care@shrideepaalayasilks.com</a>
                    <span>Prompt reply within 24 hours</span>
                  </div>
                  <div className="rr-contact-card">
                    <FaPhone className="rr-contact-icon" />
                    <strong>Customer Care & WhatsApp</strong>
                    <a href="tel:+919443212345">+91 94432 12345</a>
                    <span>Mon – Sat, 10:00 AM – 8:00 PM</span>
                  </div>
                  <div className="rr-contact-card">
                    <FaMapMarkerAlt className="rr-contact-icon" />
                    <strong>Flagship Showroom</strong>
                    <span>Gandhi Road, Near Fort Round, Vellore, Tamil Nadu - 632004</span>
                  </div>
                </div>
              </div>
            </section>

          </main>
        </div>
      </div>
    </div>
  );
};

export default ReturnRefundPolicy;
