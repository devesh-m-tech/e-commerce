import React, { useState } from 'react';
import './ReturnRefundPolicy.css';
import {
  FaCalendarAlt, FaInfoCircle, FaShieldAlt, FaCheckCircle,
  FaExclamationTriangle, FaTruck, FaUndo,
  FaPhone, FaEnvelope, FaMapMarkerAlt,
  FaTimesCircle, FaExchangeAlt
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

const sections = [
  { id: 1, icon: FaTimesCircle,    title: 'Strict No-Return & No-Refund Policy' },
  { id: 2, icon: FaCheckCircle,    title: 'Controlled Exchange Eligibility (7 Days)' },
  { id: 3, icon: FaExclamationTriangle, title: 'Mandatory Proof & Tags Requirement' },
  { id: 4, icon: FaShieldAlt,      title: 'Non-Exchangeable Categories' },
  { id: 5, icon: FaExchangeAlt,    title: 'Step-by-Step Exchange Process' },
  { id: 6, icon: FaTruck,          title: 'Reverse Pickup & Verification' },
  { id: 7, icon: FaUndo,           title: 'Pre-Dispatch Order Cancellations' },
  { id: 8, icon: FaPhone,          title: 'Store Contact & Assistance' },
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
            <span>Shri Deepaalaya Silks</span>
          </div>
          <h1 className="rr-hero-title">No-Return & Controlled Exchange Policy</h1>
          <p className="rr-hero-sub">
            Each silk saree and heirloom product at Shri Deepaalaya Silks is handcrafted with exquisite precision. Please review our strict no-return and transparent exchange guidelines before purchase.
          </p>
          <div className="rr-hero-meta">
            <span className="rr-meta-chip">
              <FaCalendarAlt /> Effective: 2024–2025
            </span>
            <span className="rr-meta-chip">
              <FaTimesCircle /> No Monetary Refunds
            </span>
            <span className="rr-meta-chip">
              <FaCheckCircle /> 7-Day Controlled Exchange
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
            <span className="rr-stat-value">7 Days</span>
            <span className="rr-stat-label">Exchange Request Window</span>
          </div>
          <div className="rr-stat-divider" />
          <div className="rr-stat">
            <span className="rr-stat-value">Mandatory</span>
            <span className="rr-stat-label">Photos & Video Proof</span>
          </div>
          <div className="rr-stat-divider" />
          <div className="rr-stat">
            <span className="rr-stat-value">100% Inspected</span>
            <span className="rr-stat-label">Pure Silk Verification</span>
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
                <Link to="/exchange-request" className="rr-toc-action-btn">
                  Open Exchange Portal &rarr;
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
                  At <strong>Shri Deepaalaya Silks</strong>, every pure silk saree, tissue zari fabric, and traditional heirloom creation is inspected individually by our master weavers prior to packaging and dispatch. Due to the delicate nature of pure silk, hand-woven zari, and custom bridal sarees, <strong>we strictly do not accept returns or issue monetary refunds under any circumstances</strong>.
                </p>
                <div className="rr-callout warning">
                  <FaExclamationTriangle className="rr-callout-icon" />
                  <div>
                    <strong>Important Notice:</strong> Orders once placed and delivered are non-refundable. All sales are final. Customers are requested to examine sizing, color swatches, and fabric descriptions carefully before placing an order.
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2 */}
            <section id="rr-section-2" className="rr-section">
              <div className="rr-sec-header">
                <div className="rr-sec-icon-wrap primary">
                  <FaCheckCircle />
                </div>
                <div>
                  <span className="rr-sec-num">Section 2</span>
                  <h2 className="rr-sec-title">Controlled Exchange Eligibility (7 Days)</h2>
                </div>
              </div>
              <div className="rr-sec-body">
                <p>
                  While returns are not permitted, we provide a structured <strong>Controlled Exchange Policy</strong> within <strong>7 days</strong> of delivery strictly for eligible criteria:
                </p>
                <ul className="rr-list">
                  <li>
                    <strong>Manufacturing Flaws:</strong> Significant weave defect, torn fabric, or damaged zari thread identified upon unboxing.
                  </li>
                  <li>
                    <strong>Incorrect Item Received:</strong> Delivery of an item that differs completely in SKU, design, or color from the order confirmation.
                  </li>
                  <li>
                    <strong>Size Mismatch:</strong> In garments with ready stitching (e.g. readymade blouses or kurtis), an exchange for a different size of the exact same design is permitted subject to stock availability.
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 3 */}
            <section id="rr-section-3" className="rr-section">
              <div className="rr-sec-header">
                <div className="rr-sec-icon-wrap accent">
                  <FaExclamationTriangle />
                </div>
                <div>
                  <span className="rr-sec-num">Section 3</span>
                  <h2 className="rr-sec-title">Mandatory Proof & Tags Requirement</h2>
                </div>
              </div>
              <div className="rr-sec-body">
                <p>
                  To prevent misuse and protect authentic artisan silk, exchange requests must satisfy the following strict criteria:
                </p>
                <div className="rr-grid-2">
                  <div className="rr-card">
                    <h4>1. Continuous Unboxing Video</h4>
                    <p>
                      An uncut video starting from showing the sealed outer parcel label, opening the package, and revealing the defect or error.
                    </p>
                  </div>
                  <div className="rr-card">
                    <h4>2. Original Tags & Folds</h4>
                    <p>
                      The product must be in its original pristine fold with all silk authenticity tags, price tags, and packaging intact and untampered.
                    </p>
                  </div>
                  <div className="rr-card">
                    <h4>3. Unused & Unworn</h4>
                    <p>
                      Items must not have been worn, washed, ironed, perfumed, or altered in any manner (no fall/pico stitching performed).
                    </p>
                  </div>
                  <div className="rr-card">
                    <h4>4. 7-Day Window</h4>
                    <p>
                      The exchange request must be initiated through our portal within 7 calendar days from the courier delivery timestamp.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section id="rr-section-4" className="rr-section">
              <div className="rr-sec-header">
                <div className="rr-sec-icon-wrap neutral">
                  <FaShieldAlt />
                </div>
                <div>
                  <span className="rr-sec-num">Section 4</span>
                  <h2 className="rr-sec-title">Non-Exchangeable Categories</h2>
                </div>
              </div>
              <div className="rr-sec-body">
                <p>
                  The following items are completely ineligible for exchanges:
                </p>
                <ul className="rr-list">
                  <li>Customized, tailored, or altered sarees (including sarees with Fall & Pico stitched or blouse fabric cut).</li>
                  <li>Sarees purchased during Clearance, Festive Flash Sales, or marked as "Final Sale".</li>
                  <li>Subtle natural variations in handloom texture, slubs, or hand-spun zari threads (these are hallmarks of genuine handwoven craftsmanship, not defects).</li>
                  <li>Minor color variations arising from digital screen resolutions or photography lighting.</li>
                </ul>
              </div>
            </section>

            {/* Section 5 */}
            <section id="rr-section-5" className="rr-section">
              <div className="rr-sec-header">
                <div className="rr-sec-icon-wrap info">
                  <FaExchangeAlt />
                </div>
                <div>
                  <span className="rr-sec-num">Section 5</span>
                  <h2 className="rr-sec-title">Step-by-Step Exchange Process</h2>
                </div>
              </div>
              <div className="rr-sec-body">
                <ol className="rr-steps">
                  <li>
                    <strong>Step 1 — Submit Request Online:</strong> Go to the <Link to="/exchange-request" style={{ color: '#6D1734', fontWeight: 'bold' }}>Exchange Portal</Link> or click "Request Exchange" under your delivered order in My Orders.
                  </li>
                  <li>
                    <strong>Step 2 — Upload Verification Proof:</strong> Upload clear photographs of the product, the defect area, tags, and the unboxing video proof.
                  </li>
                  <li>
                    <strong>Step 3 — Administrative Review:</strong> Our quality assurance team will examine the uploaded evidence within 24–48 business hours.
                  </li>
                  <li>
                    <strong>Step 4 — Reverse Pickup:</strong> Upon approval, our courier partner will collect the item from your delivery address.
                  </li>
                  <li>
                    <strong>Step 5 — Physical Verification & Replacement:</strong> Once received at our Vellore facility and verified, a fresh replacement piece will be dispatched immediately.
                  </li>
                </ol>
              </div>
            </section>

            {/* Section 6 */}
            <section id="rr-section-6" className="rr-section">
              <div className="rr-sec-header">
                <div className="rr-sec-icon-wrap success">
                  <FaTruck />
                </div>
                <div>
                  <span className="rr-sec-num">Section 6</span>
                  <h2 className="rr-sec-title">Reverse Pickup & Verification</h2>
                </div>
              </div>
              <div className="rr-sec-body">
                <p>
                  Reverse pickup is arranged free of charge for approved manufacturing defects or wrong item deliveries. Please ensure the saree is securely packed in its original box with all accompanying certificates and invoices. If reverse pickup is unserviceable at your pincode, our support team will guide you through standard insured dispatch.
                </p>
              </div>
            </section>

            {/* Section 7 */}
            <section id="rr-section-7" className="rr-section">
              <div className="rr-sec-header">
                <div className="rr-sec-icon-wrap warning">
                  <FaUndo />
                </div>
                <div>
                  <span className="rr-sec-num">Section 7</span>
                  <h2 className="rr-sec-title">Pre-Dispatch Order Cancellations</h2>
                </div>
              </div>
              <div className="rr-sec-body">
                <p>
                  Orders can be cancelled exclusively <strong>prior to shipment/dispatch</strong> (while status shows "ORDER PLACED"). Once an order has been packed and handed over to the courier partner, cancellations cannot be processed.
                </p>
              </div>
            </section>

            {/* Section 8 */}
            <section id="rr-section-8" className="rr-section">
              <div className="rr-sec-header">
                <div className="rr-sec-icon-wrap primary">
                  <FaPhone />
                </div>
                <div>
                  <span className="rr-sec-num">Section 8</span>
                  <h2 className="rr-sec-title">Store Contact & Assistance</h2>
                </div>
              </div>
              <div className="rr-sec-body">
                <p>
                  For assistance regarding your exchange request or questions on fabric care, our dedicated customer desk is available:
                </p>
                <div className="rr-contact-grid">
                  <div className="rr-contact-card">
                    <FaEnvelope className="rr-contact-icon" />
                    <strong>Email Support</strong>
                    <a href="mailto:care@shrideepaalayasilks.com">care@shrideepaalayasilks.com</a>
                    <span>Response within 24 hours</span>
                  </div>
                  <div className="rr-contact-card">
                    <FaPhone className="rr-contact-icon" />
                    <strong>Customer Care & WhatsApp</strong>
                    <a href="tel:+919443212345">+91 94432 12345</a>
                    <span>Mon – Sat, 10:00 AM – 8:00 PM</span>
                  </div>
                  <div className="rr-contact-card">
                    <FaMapMarkerAlt className="rr-contact-icon" />
                    <strong>Store Address</strong>
                    <span>Gandhi Road, Vellore, Tamil Nadu - 632004</span>
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