import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './PrivacyPolicy.css';
import {
  ShieldCheck,
  Lock,
  Eye,
  Database,
  Cookie,
  Globe,
  BellRing,
  FileText,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Sparkles,
  ArrowRight
} from 'lucide-react';

const sections = [
  { id: 1,  icon: Database,    title: 'Information We Collect' },
  { id: 2,  icon: FileText,    title: 'How We Use Your Data' },
  { id: 3,  icon: Lock,        title: 'Payment & Data Security' },
  { id: 4,  icon: ShieldCheck, title: 'Sharing & Disclosures' },
  { id: 5,  icon: Clock,       title: 'Data Retention' },
  { id: 6,  icon: Eye,         title: 'Your Privacy Rights' },
  { id: 7,  icon: Cookie,      title: 'Cookies & Preferences' },
  { id: 8,  icon: Globe,       title: 'Cross-Border Protection' },
  { id: 9,  icon: BellRing,    title: 'Policy Updates' },
  { id: 10, icon: Phone,       title: 'Grievance & Contact' },
];

const PrivacyPolicy = () => {
  const [activeSection, setActiveSection] = useState(1);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(`sds-pp-${id}`);
    if (el) {
      const headerOffset = 110;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setActiveSection(id);
    }
  };

  return (
    <div className="sds-policy-page">
      {/* ── Luxury Header Hero ── */}
      <header className="sds-policy-hero">
        <div className="sds-policy-hero-bg-overlay" />
        <div className="sds-policy-container">
          <nav className="sds-policy-breadcrumbs" aria-label="Breadcrumb">
            <Link to="/" className="sds-bc-link">Home</Link>
            <span className="sds-bc-sep">/</span>
            <span className="sds-bc-current">Privacy Policy</span>
          </nav>

          <div className="sds-policy-badge">
            <Sparkles size={14} className="sds-badge-sparkle" />
            <span>Shri Deepaalaya Silks • Vellore Heritage</span>
          </div>

          <h1 className="sds-policy-title">Privacy & Data Protection Policy</h1>
          <p className="sds-policy-subtitle">
            Your trust is as sacred as our handloom silk heritage. Learn how we collect, safeguard, and respect your personal information when you shop with us.
          </p>

          <div className="sds-policy-meta-bar">
            <div className="sds-meta-pill">
              <Clock size={14} />
              <span>Effective Date: March 2025</span>
            </div>
            <div className="sds-meta-pill">
              <ShieldCheck size={14} />
              <span>DPDP Act 2023 Compliant</span>
            </div>
            <div className="sds-meta-pill">
              <MapPin size={14} />
              <span>Vellore Flagship Store</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Layout ── */}
      <main className="sds-policy-body">
        <div className="sds-policy-container sds-policy-grid-layout">
          
          {/* ── Sticky Table of Contents ── */}
          <aside className="sds-policy-sidebar">
            <div className="sds-toc-card">
              <div className="sds-toc-header">
                <FileText size={16} />
                <span>On This Page</span>
              </div>
              <nav className="sds-toc-nav" aria-label="Table of contents">
                {sections.map((sec) => {
                  const isActive = activeSection === sec.id;
                  return (
                    <button
                      key={sec.id}
                      type="button"
                      className={`sds-toc-link ${isActive ? 'is-active' : ''}`}
                      onClick={() => scrollTo(sec.id)}
                    >
                      <span className="sds-toc-num">{String(sec.id).padStart(2, '0')}</span>
                      <span className="sds-toc-label">{sec.title}</span>
                      <ChevronRight size={14} className="sds-toc-arrow" />
                    </button>
                  );
                })}
              </nav>

              {/* Sidebar Quick Concierge Card */}
              <div className="sds-sidebar-concierge">
                <div className="sds-concierge-badge">Boutique Assistance</div>
                <h4>Have Privacy Inquiries?</h4>
                <p>Our dedicated grievance officer at Vellore is ready to assist you.</p>
                <a href="mailto:care@shrideepaalayasilks.com" className="sds-concierge-btn">
                  <Mail size={14} />
                  <span>Email Care Team</span>
                </a>
              </div>
            </div>
          </aside>

          {/* ── Content Sections ── */}
          <article className="sds-policy-content">
            
            {/* Notice Callout */}
            <div className="sds-policy-notice-card">
              <div className="sds-notice-gold-bar" />
              <div className="sds-notice-icon-wrapper">
                <ShieldCheck size={24} />
              </div>
              <div className="sds-notice-content">
                <h3>Our Heritage Commitment to Your Privacy</h3>
                <p>
                  At <strong>Shri Deepaalaya Silks</strong>, located in Vellore, Tamil Nadu, we value the trust you place in our pure silk collections and digital boutique. This Privacy Policy details our solemn commitment to collecting only essential information, protecting your personal records with high-grade digital security, and ensuring absolute transparency under the <strong>Digital Personal Data Protection (DPDP) Act, 2023</strong> and related Indian privacy statutes.
                </p>
              </div>
            </div>

            {/* Section 1 */}
            <section id="sds-pp-1" className="sds-content-card">
              <div className="sds-card-header">
                <div className="sds-card-num-badge">01</div>
                <div className="sds-card-header-text">
                  <h2>Information We Collect</h2>
                  <p>Transparent categorization of records gathered when you browse or order pure silk sarees.</p>
                </div>
              </div>
              <div className="sds-card-body">
                <p>
                  When you visit our online store, browse handloom collections, place an order, or contact our saree stylists, we may collect:
                </p>
                <div className="sds-feature-grid">
                  <div className="sds-feature-box">
                    <strong>Personal Identity Details</strong>
                    <p>Full legal name, billing and delivery addresses, primary phone number, and verified email address.</p>
                  </div>
                  <div className="sds-feature-box">
                    <strong>Silk Order & Customization</strong>
                    <p>Selected pure silk sarees, zari preferences, blouse stitch sizing, gift wrapping notes, and order history.</p>
                  </div>
                  <div className="sds-feature-box">
                    <strong>Payment Information</strong>
                    <p>Transaction references, payment method (UPI, NetBanking, Card), securely processed by RBI-licensed gateways. We never store raw card credentials.</p>
                  </div>
                  <div className="sds-feature-box">
                    <strong>Technical & Device Data</strong>
                    <p>IP address, browser type, device identifiers, and regional delivery preferences for accurate pin code courier availability.</p>
                  </div>
                </div>
                <div className="sds-inline-note">
                  <AlertCircle size={16} />
                  <span>We do not knowingly collect personal information from minors under 18 years of age without parental guidance.</span>
                </div>
              </div>
            </section>

            {/* Section 2 */}
            <section id="sds-pp-2" className="sds-content-card">
              <div className="sds-card-header">
                <div className="sds-card-num-badge">02</div>
                <div className="sds-card-header-text">
                  <h2>How We Use Your Data</h2>
                  <p>Purposeful utilization focused solely on delivering authentic handloom silk experiences.</p>
                </div>
              </div>
              <div className="sds-card-body">
                <p>We utilize your data strictly for legitimate fulfillment and boutique styling purposes:</p>
                <ul className="sds-bullet-list">
                  <li>
                    <CheckCircle2 size={16} className="sds-bullet-icon" />
                    <div><strong>Order Fulfillment:</strong> Processing pure silk weaves, custom saree fall-pico services, tamper-proof packaging, and express dispatch.</div>
                  </li>
                  <li>
                    <CheckCircle2 size={16} className="sds-bullet-icon" />
                    <div><strong>Order Updates & Tracking:</strong> Providing live WhatsApp, SMS, and Email status alerts with courier tracking numbers.</div>
                  </li>
                  <li>
                    <CheckCircle2 size={16} className="sds-bullet-icon" />
                    <div><strong>Customer & Bridal Concierge:</strong> Answering styling inquiries, bridal trousseau consultations, and order assistance.</div>
                  </li>
                  <li>
                    <CheckCircle2 size={16} className="sds-bullet-icon" />
                    <div><strong>Store Experience Improvements:</strong> Enhancing our website speed, navigation, and regional delivery efficiency across India and overseas.</div>
                  </li>
                  <li>
                    <CheckCircle2 size={16} className="sds-bullet-icon" />
                    <div><strong>Statutory Compliance:</strong> Generating GST tax invoices and complying with Indian taxation and accounting mandates.</div>
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 3 */}
            <section id="sds-pp-3" className="sds-content-card">
              <div className="sds-card-header">
                <div className="sds-card-num-badge">03</div>
                <div className="sds-card-header-text">
                  <h2>Payment & Data Security</h2>
                  <p>Rigorous multi-layer defenses to keep your financial and personal data fortified.</p>
                </div>
              </div>
              <div className="sds-card-body">
                <p>
                  At Shri Deepaalaya Silks, protecting your transaction integrity is paramount:
                </p>
                <div className="sds-security-cards">
                  <div className="sds-sec-card">
                    <div className="sds-sec-icon-circle"><Lock size={20} /></div>
                    <h4>PCI-DSS Level 1 Gateway</h4>
                    <p>All online payments are processed through certified gateways with end-to-end tokenization.</p>
                  </div>
                  <div className="sds-sec-card">
                    <div className="sds-sec-icon-circle"><ShieldCheck size={20} /></div>
                    <h4>256-Bit SSL Encryption</h4>
                    <p>Every page interaction and checkout request is encrypted using industry-standard SSL certificates.</p>
                  </div>
                  <div className="sds-sec-card">
                    <div className="sds-sec-icon-circle"><CheckCircle2 size={20} /></div>
                    <h4>Restricted Internal Access</h4>
                    <p>Customer shipping data is restricted exclusively to authorized packing and customer care teams in Vellore.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section id="sds-pp-4" className="sds-content-card">
              <div className="sds-card-header">
                <div className="sds-card-num-badge">04</div>
                <div className="sds-card-header-text">
                  <h2>Sharing & Disclosures</h2>
                  <p>Our strict policy: We do NOT sell, rent, or trade your personal records.</p>
                </div>
              </div>
              <div className="sds-card-body">
                <p>
                  We only share minimal required data with trusted operational partners under strict confidentiality agreements:
                </p>
                <ul className="sds-bullet-list">
                  <li>
                    <CheckCircle2 size={16} className="sds-bullet-icon" />
                    <div><strong>Logistics & Courier Partners:</strong> Premium couriers (BlueDart, DTDC, India Post Speed Post, DHL Express) receive your name, address, and mobile number solely to deliver your handloom parcels safely.</div>
                  </li>
                  <li>
                    <CheckCircle2 size={16} className="sds-bullet-icon" />
                    <div><strong>Payment Processors:</strong> RBI-licensed banking gateways to securely authenticate transactions and process authorized refunds.</div>
                  </li>
                  <li>
                    <CheckCircle2 size={16} className="sds-bullet-icon" />
                    <div><strong>Legal Mandates:</strong> Disclosures made only when legally obligated by court orders, lawful government notices, or to safeguard against fraudulent transactions.</div>
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 5 */}
            <section id="sds-pp-5" className="sds-content-card">
              <div className="sds-card-header">
                <div className="sds-card-num-badge">05</div>
                <div className="sds-card-header-text">
                  <h2>Data Retention</h2>
                  <p>Retaining your information only for lawful periods necessary to serve your shopping journey.</p>
                </div>
              </div>
              <div className="sds-card-body">
                <p>
                  We store customer accounts and invoice records in accordance with Indian commercial and taxation laws (typically 7-8 years for statutory GST accounts). Once records have fulfilled their legal, warranty, and accounting obligations, they are securely purged or anonymized.
                </p>
              </div>
            </section>

            {/* Section 6 */}
            <section id="sds-pp-6" className="sds-content-card">
              <div className="sds-card-header">
                <div className="sds-card-num-badge">06</div>
                <div className="sds-card-header-text">
                  <h2>Your Privacy Rights</h2>
                  <p>Empowering you with complete control over your personal data.</p>
                </div>
              </div>
              <div className="sds-card-body">
                <p>Under the DPDP Act 2023, you hold the following statutory rights:</p>
                <div className="sds-rights-grid">
                  <div className="sds-right-item">
                    <strong>Right to Access:</strong>
                    <span>You may request a copy of the personal information we hold in your boutique profile.</span>
                  </div>
                  <div className="sds-right-item">
                    <strong>Right to Correction:</strong>
                    <span>Easily update incorrect phone numbers, delivery addresses, or personal names.</span>
                  </div>
                  <div className="sds-right-item">
                    <strong>Right to Erasure:</strong>
                    <span>Request deletion of your account and personal history, subject to statutory tax record retention requirements.</span>
                  </div>
                  <div className="sds-right-item">
                    <strong>Right to Opt-Out:</strong>
                    <span>Unsubscribe from festive silk announcements or promotional messages at any time.</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 7 */}
            <section id="sds-pp-7" className="sds-content-card">
              <div className="sds-card-header">
                <div className="sds-card-num-badge">07</div>
                <div className="sds-card-header-text">
                  <h2>Cookies & Digital Preferences</h2>
                  <p>Ensuring smooth cart sessions and personalized silk styling suggestions.</p>
                </div>
              </div>
              <div className="sds-card-body">
                <p>
                  Our digital store utilizes essential session cookies to remember your bag items, preserve your wishlist of favorite Kanchipuram and Banarasi sarees, and maintain secure authentication states. You can control or clear cookie settings within your web browser preferences at any moment.
                </p>
              </div>
            </section>

            {/* Section 8 */}
            <section id="sds-pp-8" className="sds-content-card">
              <div className="sds-card-header">
                <div className="sds-card-num-badge">08</div>
                <div className="sds-card-header-text">
                  <h2>Cross-Border Data Protection</h2>
                  <p>Safeguarding diaspora saree lovers worldwide.</p>
                </div>
              </div>
              <div className="sds-card-body">
                <p>
                  When international shoppers place an order from abroad, your personal information is stored securely in India in compliance with Indian privacy laws and recognized international data transfer benchmarks.
                </p>
              </div>
            </section>

            {/* Section 9 */}
            <section id="sds-pp-9" className="sds-content-card">
              <div className="sds-card-header">
                <div className="sds-card-num-badge">09</div>
                <div className="sds-card-header-text">
                  <h2>Policy Updates</h2>
                  <p>Periodic revisions to stay aligned with legal standards and boutique enhancements.</p>
                </div>
              </div>
              <div className="sds-card-body">
                <p>
                  We may periodically refresh this policy to reflect new regulatory requirements or digital services. Changes will be updated directly on this page with a fresh "Effective Date".
                </p>
              </div>
            </section>

            {/* Section 10 — Grievance & Contact */}
            <section id="sds-pp-10" className="sds-content-card sds-contact-card-wrap">
              <div className="sds-card-header">
                <div className="sds-card-num-badge">10</div>
                <div className="sds-card-header-text">
                  <h2>Grievance Officer & Store Contact</h2>
                  <p>Reach out directly to our store management in Vellore for any privacy concerns.</p>
                </div>
              </div>
              <div className="sds-card-body">
                <div className="sds-official-contact-box">
                  <div className="sds-contact-brand-title">
                    <Sparkles size={16} className="sds-sparkle-gold" />
                    <div>
                      <h3>Shri Deepaalaya Silks</h3>
                      <p>Heritage Pure Silk Sarees & Bridal Trousseau</p>
                    </div>
                  </div>

                  <div className="sds-contact-details-grid">
                    <div className="sds-contact-tile">
                      <div className="sds-tile-icon"><MapPin size={18} /></div>
                      <div className="sds-tile-info">
                        <span className="sds-tile-label">Showroom Address</span>
                        <span className="sds-tile-val">Gandhi Road, Near Fort Round, Vellore, Tamil Nadu 632004</span>
                      </div>
                    </div>

                    <a href="tel:+919443212345" className="sds-contact-tile sds-tile-interactive">
                      <div className="sds-tile-icon"><Phone size={18} /></div>
                      <div className="sds-tile-info">
                        <span className="sds-tile-label">Customer Helpline</span>
                        <span className="sds-tile-val">+91 94432 12345</span>
                      </div>
                      <ArrowRight size={14} className="sds-tile-arrow" />
                    </a>

                    <a href="mailto:care@shrideepaalayasilks.com" className="sds-contact-tile sds-tile-interactive">
                      <div className="sds-tile-icon"><Mail size={18} /></div>
                      <div className="sds-tile-info">
                        <span className="sds-tile-label">Official Email</span>
                        <span className="sds-tile-val">care@shrideepaalayasilks.com</span>
                      </div>
                      <ArrowRight size={14} className="sds-tile-arrow" />
                    </a>

                    <div className="sds-contact-tile">
                      <div className="sds-tile-icon"><Clock size={18} /></div>
                      <div className="sds-tile-info">
                        <span className="sds-tile-label">Showroom Timings</span>
                        <span className="sds-tile-val">Monday – Sunday: 9:30 AM to 9:30 PM IST</span>
                      </div>
                    </div>
                  </div>

                  <div className="sds-grievance-note">
                    <strong>Privacy Grievance Officer:</strong> Store Manager, Shri Deepaalaya Silks, Gandhi Road, Vellore. We strive to acknowledge privacy grievances within 48 business hours and resolve them within statutory timeframes.
                  </div>
                </div>
              </div>
            </section>

          </article>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
