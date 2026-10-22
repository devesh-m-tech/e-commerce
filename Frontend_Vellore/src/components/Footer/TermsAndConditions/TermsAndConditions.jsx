import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './TermsAndConditions.css';
import {
  Gavel,
  ShieldCheck,
  Scale,
  Sparkles,
  FileText,
  UserCheck,
  CreditCard,
  Truck,
  RotateCcw,
  Globe,
  Clock,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  Gem
} from 'lucide-react';

const sections = [
  { id: 1,  icon: UserCheck,     title: 'Eligibility & Account' },
  { id: 2,  icon: Gem,           title: 'Authenticity & Handloom' },
  { id: 3,  icon: FileText,      title: 'Orders, Pricing & Taxes' },
  { id: 4,  icon: CreditCard,    title: 'Payment Terms & Security' },
  { id: 5,  icon: Truck,         title: 'Shipping & Handover' },
  { id: 6,  icon: RotateCcw,     title: 'Customization & Returns' },
  { id: 7,  icon: Globe,         title: 'Permitted Use & IP Rights' },
  { id: 8,  icon: Scale,         title: 'Limitation of Liability' },
  { id: 9,  icon: ShieldCheck,   title: 'Indemnity & Guarantees' },
  { id: 10, icon: Gavel,         title: 'Governing Law & Jurisdiction' },
  { id: 11, icon: Clock,         title: 'Amendments & Updates' },
  { id: 12, icon: Phone,         title: 'Customer Concierge' },
];

const TermsAndConditions = () => {
  const [activeSection, setActiveSection] = useState(1);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(`sds-tc-${id}`);
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
            <span className="sds-bc-current">Terms & Conditions</span>
          </nav>

          <div className="sds-policy-badge">
            <Sparkles size={14} className="sds-badge-sparkle" />
            <span>Shri Deepaalaya Silks • Vellore Heritage</span>
          </div>

          <h1 className="sds-policy-title">Terms of Service & Handloom Sale</h1>
          <p className="sds-policy-subtitle">
            Welcome to the digital boutique of Shri Deepaalaya Silks. Please review these terms governing your patronage, pure silk orders, and website usage.
          </p>

          <div className="sds-policy-meta-bar">
            <div className="sds-meta-pill">
              <Clock size={14} />
              <span>Effective Date: March 2025</span>
            </div>
            <div className="sds-meta-pill">
              <Gavel size={14} />
              <span>Jurisdiction: Vellore, Tamil Nadu, India</span>
            </div>
            <div className="sds-meta-pill">
              <Gem size={14} />
              <span>Silk Mark Certified Heritage</span>
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
                <div className="sds-concierge-badge">Store Advisory</div>
                <h4>Questions on Terms?</h4>
                <p>Our Vellore boutique management is available to clarify any purchase condition.</p>
                <a href="tel:+919443212345" className="sds-concierge-btn">
                  <Phone size={14} />
                  <span>Call Store Desk</span>
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
                <Gavel size={24} />
              </div>
              <div className="sds-notice-content">
                <h3>Welcome to Shri Deepaalaya Silks</h3>
                <p>
                  These Terms and Conditions constitute a legally binding agreement between you ("Patron", "Customer", or "You") and <strong>Shri Deepaalaya Silks</strong> ("We", "Our", or "Us"), having its registered showroom at <strong>Gandhi Road, Near Fort Round, Vellore, Tamil Nadu 632004</strong>. By accessing our website, placing an order for pure silk sarees, or using any associated services, you agree to be bound by these Terms in full.
                </p>
              </div>
            </div>

            {/* Section 1 */}
            <section id="sds-tc-1" className="sds-content-card">
              <div className="sds-card-header">
                <div className="sds-card-num-badge">01</div>
                <div className="sds-card-header-text">
                  <h2>Eligibility & Account Registration</h2>
                  <p>Requirements to browse, create a boutique profile, and transact.</p>
                </div>
              </div>
              <div className="sds-card-body">
                <ul className="sds-bullet-list">
                  <li>
                    <CheckCircle2 size={16} className="sds-bullet-icon" />
                    <div><strong>Legal Age:</strong> You must be at least 18 years of age or possess legal capacity under the Indian Contract Act, 1872 to enter into binding transactions.</div>
                  </li>
                  <li>
                    <CheckCircle2 size={16} className="sds-bullet-icon" />
                    <div><strong>Account Security:</strong> You are responsible for safeguarding your login credentials, OTP codes, and password. Any transaction made through your verified mobile number or account shall be deemed authorized by you.</div>
                  </li>
                  <li>
                    <CheckCircle2 size={16} className="sds-bullet-icon" />
                    <div><strong>Accurate Details:</strong> You warrant that all shipping addresses, pincodes, contact phone numbers, and GSTIN details provided during checkout are authentic and accurate.</div>
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 2 */}
            <section id="sds-tc-2" className="sds-content-card">
              <div className="sds-card-header">
                <div className="sds-card-num-badge">02</div>
                <div className="sds-card-header-text">
                  <h2>Authenticity & Handloom Craftsmanship</h2>
                  <p>Understanding the unique nature of authentic handwoven pure silk.</p>
                </div>
              </div>
              <div className="sds-card-body">
                <p>
                  Shri Deepaalaya Silks takes immense pride in curating authentic pure silk sarees, bridal Kanchipuram weaves, Banarasi heirlooms, and tussar silks:
                </p>
                <div className="sds-feature-grid">
                  <div className="sds-feature-box">
                    <strong>Handloom Variations</strong>
                    <p>Authentic handwoven sarees carry unique artisan characteristics, subtle zari slubs, and delicate weaving nuances. These are hallmarks of pure handmade craftsmanship, not manufacturing flaws.</p>
                  </div>
                  <div className="sds-feature-box">
                    <strong>Color Representation</strong>
                    <p>We photograph every saree under calibrated studio lighting to match real-life shades. Minor photographic variations may occur due to diverse phone and monitor display calibrations.</p>
                  </div>
                  <div className="sds-feature-box">
                    <strong>Silk Mark Certification</strong>
                    <p>Our qualifying pure mulberry silk sarees are certified with the prestigious Silk Mark tag, guaranteeing 100% natural pure silk fibers.</p>
                  </div>
                  <div className="sds-feature-box">
                    <strong>Pure Zari Care</strong>
                    <p>Sarees with tested or pure zari require gentle dry cleaning and storage in breathable cotton covers away from direct dampness.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section id="sds-tc-3" className="sds-content-card">
              <div className="sds-card-header">
                <div className="sds-card-num-badge">03</div>
                <div className="sds-card-header-text">
                  <h2>Orders, Pricing & Taxes</h2>
                  <p>Order placement, GST transparency, and weaver stock availability.</p>
                </div>
              </div>
              <div className="sds-card-body">
                <ul className="sds-bullet-list">
                  <li>
                    <CheckCircle2 size={16} className="sds-bullet-icon" />
                    <div><strong>Pricing Currency & GST:</strong> All prices displayed on our website are in Indian Rupees (INR) and are inclusive of applicable Goods and Services Tax (GST) unless explicitly noted otherwise.</div>
                  </li>
                  <li>
                    <CheckCircle2 size={16} className="sds-bullet-icon" />
                    <div><strong>Limited Artisan Stock:</strong> Many of our heirloom sarees are master weaver one-of-a-kind pieces. In the rare event of simultaneous orders for a single piece, the earliest confirmed payment takes priority. If an item cannot be supplied, a 100% refund will be issued immediately.</div>
                  </li>
                  <li>
                    <CheckCircle2 size={16} className="sds-bullet-icon" />
                    <div><strong>Order Confirmation:</strong> An electronic confirmation invoice is transmitted via Email and WhatsApp upon successful gateway clearance.</div>
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 4 */}
            <section id="sds-tc-4" className="sds-content-card">
              <div className="sds-card-header">
                <div className="sds-card-num-badge">04</div>
                <div className="sds-card-header-text">
                  <h2>Payment Terms & Security</h2>
                  <p>Certified banking gateways, credit cards, UPI, and installment security.</p>
                </div>
              </div>
              <div className="sds-card-body">
                <p>We accept payment through licensed Indian and global payment gateways:</p>
                <div className="sds-rights-grid">
                  <div className="sds-right-item">
                    <strong>UPI & NetBanking:</strong>
                    <span>Instant payment confirmation via Google Pay, PhonePe, Paytm, BHIM, and all leading Indian scheduled banks.</span>
                  </div>
                  <div className="sds-right-item">
                    <strong>Debit & Credit Cards:</strong>
                    <span>Visa, MasterCard, RuPay, and American Express with 3D-Secure 2-factor OTP verification.</span>
                  </div>
                </div>
                <div className="sds-inline-note">
                  <ShieldCheck size={16} />
                  <span>All payment processing occurs via encrypted PCI-DSS compliant secure socket layers. Shri Deepaalaya Silks never accesses or stores your CVV or card pins.</span>
                </div>
              </div>
            </section>

            {/* Section 5 */}
            <section id="sds-tc-5" className="sds-content-card">
              <div className="sds-card-header">
                <div className="sds-card-num-badge">05</div>
                <div className="sds-card-header-text">
                  <h2>Shipping & Handover</h2>
                  <p>Safe logistics, insurance coverage, and title transfer.</p>
                </div>
              </div>
              <div className="sds-card-body">
                <p>
                  Orders are dispatched from our Vellore showroom via insured logistics partners (BlueDart, DTDC, India Post Speed Post). Full terms of delivery timelines, remote pincode serviceability, and packaging standards are detailed in our <Link to="/ShippingPolicy" style={{ color: '#5C132B', fontWeight: 600 }}>Shipping Policy</Link>.
                </p>
                <p>
                  Risk of loss and title for items pass to you upon successful physical delivery confirmation signed at your provided delivery address.
                </p>
              </div>
            </section>

            {/* Section 6 */}
            <section id="sds-tc-6" className="sds-content-card">
              <div className="sds-card-header">
                <div className="sds-card-num-badge">06</div>
                <div className="sds-card-header-text">
                  <h2>Customization & Return Limitations</h2>
                  <p>Special policies regarding customized tailoring and unstitched silks.</p>
                </div>
              </div>
              <div className="sds-card-body">
                <ul className="sds-bullet-list">
                  <li>
                    <CheckCircle2 size={16} className="sds-bullet-icon" />
                    <div><strong>Customized Products:</strong> Sarees with custom fall-pico done, blouse piece cut from saree, or custom tailoring performed at customer's request cannot be returned or exchanged under any circumstances.</div>
                  </li>
                  <li>
                    <CheckCircle2 size={16} className="sds-bullet-icon" />
                    <div><strong>Transit Damage / Incorrect Item:</strong> If you receive an opened parcel or a damaged item, notify our customer care within 24 hours of delivery with unboxing photos/video for prompt resolution.</div>
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 7 */}
            <section id="sds-tc-7" className="sds-content-card">
              <div className="sds-card-header">
                <div className="sds-card-num-badge">07</div>
                <div className="sds-card-header-text">
                  <h2>Permitted Use & Intellectual Property</h2>
                  <p>Protection of our handloom photographs, brand identity, and textile motifs.</p>
                </div>
              </div>
              <div className="sds-card-body">
                <p>
                  All content published on this website—including but not limited to brand logos, photography of pure silk sarees, descriptive textile copy, design motifs, graphics, and website architecture—is the proprietary intellectual property of <strong>Shri Deepaalaya Silks</strong>.
                </p>
                <p>
                  Any unauthorized downloading, reproduction, commercial scraping, or republication of our photography or catalog materials is strictly prohibited and subject to legal prosecution under the Indian Copyright Act, 1957.
                </p>
              </div>
            </section>

            {/* Section 8 */}
            <section id="sds-tc-8" className="sds-content-card">
              <div className="sds-card-header">
                <div className="sds-card-num-badge">08</div>
                <div className="sds-card-header-text">
                  <h2>Limitation of Liability</h2>
                  <p>Statutory boundaries of store liability.</p>
                </div>
              </div>
              <div className="sds-card-body">
                <p>
                  To the maximum extent permitted under applicable law, Shri Deepaalaya Silks shall not be liable for any indirect, incidental, or consequential damages resulting from courier delay beyond reasonable control, acts of God, weather disruptions, or improper dry cleaning / handling of pure silk fabrics contrary to care instructions. In all events, our total financial liability is strictly capped at the purchase amount paid by you for the specific saree or order in dispute.
                </p>
              </div>
            </section>

            {/* Section 9 */}
            <section id="sds-tc-9" className="sds-content-card">
              <div className="sds-card-header">
                <div className="sds-card-num-badge">09</div>
                <div className="sds-card-header-text">
                  <h2>Indemnity</h2>
                  <p>Customer responsibility regarding lawful website usage.</p>
                </div>
              </div>
              <div className="sds-card-body">
                <p>
                  You agree to indemnify, defend, and hold harmless Shri Deepaalaya Silks, its proprietors, affiliates, and staff from any claims, costs, or damages arising out of your violation of these Terms, unauthorized chargebacks, or misuse of payment accounts belonging to third parties.
                </p>
              </div>
            </section>

            {/* Section 10 */}
            <section id="sds-tc-10" className="sds-content-card">
              <div className="sds-card-header">
                <div className="sds-card-num-badge">10</div>
                <div className="sds-card-header-text">
                  <h2>Governing Law & Dispute Resolution</h2>
                  <p>Indian legal framework and jurisdiction.</p>
                </div>
              </div>
              <div className="sds-card-body">
                <p>
                  These Terms shall be interpreted and enforced strictly in accordance with the <strong>Laws of India</strong>. In the event of any irreconcilable dispute arising out of this agreement or your purchase, the dispute shall fall under the exclusive jurisdiction of the competent courts of <strong>Vellore, Tamil Nadu, India</strong>.
                </p>
              </div>
            </section>

            {/* Section 11 */}
            <section id="sds-tc-11" className="sds-content-card">
              <div className="sds-card-header">
                <div className="sds-card-num-badge">11</div>
                <div className="sds-card-header-text">
                  <h2>Amendments to Terms</h2>
                  <p>Regular reviews and continuous compliance.</p>
                </div>
              </div>
              <div className="sds-card-body">
                <p>
                  We reserve the right to revise or modify these Terms to accommodate evolving handloom trade regulations, digital payment protocols, or boutique expansion. Changes become effective once posted on this page with an updated "Effective Date".
                </p>
              </div>
            </section>

            {/* Section 12 — Contact */}
            <section id="sds-tc-12" className="sds-content-card sds-contact-card-wrap">
              <div className="sds-card-header">
                <div className="sds-card-num-badge">12</div>
                <div className="sds-card-header-text">
                  <h2>Store Management & Legal Concierge</h2>
                  <p>Reach out directly to our showroom management in Vellore for any contract or policy questions.</p>
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
                        <span className="sds-tile-label">Registered Showroom</span>
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
                    <strong>Legal Compliance Desk:</strong> Legal & Customer Redressal Cell, Shri Deepaalaya Silks, Gandhi Road, Vellore - 632004. Queries are handled in accordance with the Consumer Protection (E-Commerce) Rules, 2020.
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

export default TermsAndConditions;
