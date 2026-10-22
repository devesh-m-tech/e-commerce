import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './ShippingPolicy.css';
import {
  Truck,
  Package,
  Clock,
  ShieldCheck,
  MapPin,
  Sparkles,
  CreditCard,
  RotateCcw,
  AlertTriangle,
  Globe,
  Phone,
  Mail,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  FileText,
  Compass,
  Store
} from 'lucide-react';

const sections = [
  { id: 1,  icon: Compass,      title: 'Delivery Coverage & Zones' },
  { id: 2,  icon: Clock,        title: 'Timelines & Dispatch' },
  { id: 3,  icon: CreditCard,   title: 'Shipping Rates & Free Delivery' },
  { id: 4,  icon: Package,      title: 'Silk Keepsake Packaging' },
  { id: 5,  icon: ShieldCheck,  title: 'Transit Insurance' },
  { id: 6,  icon: Truck,        title: 'Real-Time Order Tracking' },
  { id: 7,  icon: Store,        title: 'Vellore Store Pickup' },
  { id: 8,  icon: Globe,        title: 'International Shipping' },
  { id: 9,  icon: AlertTriangle,title: 'Delivery Exceptions & RTO' },
  { id: 10, icon: Phone,        title: 'Dispatch & Support Contact' },
];

const ShippingPolicy = () => {
  const [activeSection, setActiveSection] = useState(1);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(`sds-sp-${id}`);
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
            <span className="sds-bc-current">Shipping & Delivery Policy</span>
          </nav>

          <div className="sds-policy-badge">
            <Sparkles size={14} className="sds-badge-sparkle" />
            <span>Shri Deepaalaya Silks • Vellore Heritage</span>
          </div>

          <h1 className="sds-policy-title">Shipping & Handloom Delivery Policy</h1>
          <p className="sds-policy-subtitle">
            Every pure silk saree is inspected with care, sealed in tamper-proof protective casing, and delivered safely to your doorstep with insured express logistics.
          </p>

          <div className="sds-policy-meta-bar">
            <div className="sds-meta-pill">
              <Clock size={14} />
              <span>Dispatch: Within 24–48 Hours</span>
            </div>
            <div className="sds-meta-pill">
              <Compass size={14} />
              <span>Coverage: Pan India & Worldwide</span>
            </div>
            <div className="sds-meta-pill">
              <ShieldCheck size={14} />
              <span>100% Insured Silk Transit</span>
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
                <div className="sds-concierge-badge">Urgent Delivery</div>
                <h4>Have an Upcoming Wedding?</h4>
                <p>Contact our dispatch desk in Vellore for priority wedding shipping routing.</p>
                <a href="tel:+919443212345" className="sds-concierge-btn">
                  <Phone size={14} />
                  <span>Call Dispatch Desk</span>
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
                <Truck size={24} />
              </div>
              <div className="sds-notice-content">
                <h3>Sacred Care from Vellore to Your Home</h3>
                <p>
                  At <strong>Shri Deepaalaya Silks</strong>, we consider each handloom saree an heirloom piece of art. From the moment your order is retrieved from our Vellore showroom vaults to the second it is handed to you by our trusted courier partners, your package is handled with premier care, insured against loss, and sealed in tamper-proof silk casing.
                </p>
              </div>
            </div>

            {/* Section 1 */}
            <section id="sds-sp-1" className="sds-content-card">
              <div className="sds-card-header">
                <div className="sds-card-num-badge">01</div>
                <div className="sds-card-header-text">
                  <h2>Delivery Coverage & Regional Zones</h2>
                  <p>Comprehensive serviceability across 27,000+ Indian postal pincodes and major global hubs.</p>
                </div>
              </div>
              <div className="sds-card-body">
                <p>We deliver across India with expedited express air and surface networks:</p>
                <div className="sds-feature-grid">
                  <div className="sds-feature-box">
                    <strong>Tamil Nadu & Bengaluru</strong>
                    <p>Express regional routing. Delivery typically within <strong>1 to 2 business days</strong> after dispatch.</p>
                  </div>
                  <div className="sds-feature-box">
                    <strong>South India (AP, TS, Kerala)</strong>
                    <p>Next-tier express transit. Delivery typically within <strong>2 to 3 business days</strong>.</p>
                  </div>
                  <div className="sds-feature-box">
                    <strong>Metro Cities & Rest of India</strong>
                    <p>Mumbai, Delhi NCR, Kolkata, Hyderabad, Pune, Ahmedabad typically delivered within <strong>3 to 5 business days</strong>.</p>
                  </div>
                  <div className="sds-feature-box">
                    <strong>Remote & Hill Districts</strong>
                    <p>Dispatched via India Post Speed Post or specialized cargo within <strong>5 to 7 business days</strong>.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2 */}
            <section id="sds-sp-2" className="sds-content-card">
              <div className="sds-card-header">
                <div className="sds-card-num-badge">02</div>
                <div className="sds-card-header-text">
                  <h2>Dispatch Timelines & Order Flow</h2>
                  <p>Step-by-step workflow from order confirmation to your doorstep.</p>
                </div>
              </div>
              <div className="sds-card-body">
                <div className="sds-security-cards">
                  <div className="sds-sec-card">
                    <div className="sds-sec-icon-circle"><CheckCircle2 size={20} /></div>
                    <h4>1. Quality Inspection</h4>
                    <p>Every saree undergoes rigorous manual inspection for pure zari weave integrity, fabric purity, and finish.</p>
                  </div>
                  <div className="sds-sec-card">
                    <div className="sds-sec-icon-circle"><Clock size={20} /></div>
                    <h4>2. Dispatch (24–48h)</h4>
                    <p>Packed in protective wraps and handed over to premium air couriers with instant AWB number generation.</p>
                  </div>
                  <div className="sds-sec-card">
                    <div className="sds-sec-icon-circle"><Truck size={20} /></div>
                    <h4>3. Doorstep Delivery</h4>
                    <p>Delivered securely with OTP or signature verification directly into your hands.</p>
                  </div>
                </div>
                <div className="sds-inline-note">
                  <Clock size={16} />
                  <span>Orders with custom fall & pico or tassel work require an additional 24 to 36 hours for precision artisan stitching.</span>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section id="sds-sp-3" className="sds-content-card">
              <div className="sds-card-header">
                <div className="sds-card-num-badge">03</div>
                <div className="sds-card-header-text">
                  <h2>Shipping Rates & Free Delivery</h2>
                  <p>Transparent pricing with zero hidden handling charges.</p>
                </div>
              </div>
              <div className="sds-card-body">
                <ul className="sds-bullet-list">
                  <li>
                    <CheckCircle2 size={16} className="sds-bullet-icon" />
                    <div><strong>Free Domestic Shipping:</strong> We provide complimentary insured standard shipping across India on all orders exceeding ₹1,999.</div>
                  </li>
                  <li>
                    <CheckCircle2 size={16} className="sds-bullet-icon" />
                    <div><strong>Nominal Standard Charge:</strong> For orders below ₹1,999, a flat insured delivery fee of ₹99 is calculated transparently at checkout.</div>
                  </li>
                  <li>
                    <CheckCircle2 size={16} className="sds-bullet-icon" />
                    <div><strong>Express Priority Shipping:</strong> Optional next-day air delivery available for select metropolitan pin codes at nominal additional rates shown at checkout.</div>
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 4 */}
            <section id="sds-sp-4" className="sds-content-card">
              <div className="sds-card-header">
                <div className="sds-card-num-badge">04</div>
                <div className="sds-card-header-text">
                  <h2>Silk Keepsake Packaging</h2>
                  <p>Royal presentation crafted to protect and honor your investment.</p>
                </div>
              </div>
              <div className="sds-card-body">
                <p>
                  A pure Kanchipuram silk saree or bridal pattu is meant to be treasured for generations. Our bespoke packaging includes:
                </p>
                <div className="sds-rights-grid">
                  <div className="sds-right-item">
                    <strong>Moisture-Resistant Inner Sleeve:</strong>
                    <span>Prevents humidity and climatic changes from affecting delicate pure zari and natural silk fibers during transit.</span>
                  </div>
                  <div className="sds-right-item">
                    <strong>Signature Keepsake Box:</strong>
                    <span>Sturdy, regal maroon & gold presentation box that doubles as a breathable wardrobe storage case.</span>
                  </div>
                  <div className="sds-right-item">
                    <strong>Silk Mark & Authenticity Certificate:</strong>
                    <span>Enclosed within the presentation sleeve validating the pure silk weave.</span>
                  </div>
                  <div className="sds-right-item">
                    <strong>Tamper-Evident Outer Polybag:</strong>
                    <span>Heavy-duty courier sheath sealed with security tape. Never accept a package if the seal is broken.</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 5 */}
            <section id="sds-sp-5" className="sds-content-card">
              <div className="sds-card-header">
                <div className="sds-card-num-badge">05</div>
                <div className="sds-card-header-text">
                  <h2>Transit Insurance & Safe Delivery Guarantee</h2>
                  <p>100% financial protection until the package is in your care.</p>
                </div>
              </div>
              <div className="sds-card-body">
                <p>
                  Every consignment dispatched by Shri Deepaalaya Silks is comprehensively insured against loss, theft, or damage in transit. In the improbable event of a package lost in transit by our courier partner, we will either dispatch an immediate replacement piece or issue a 100% full refund to your original payment method.
                </p>
              </div>
            </section>

            {/* Section 6 */}
            <section id="sds-sp-6" className="sds-content-card">
              <div className="sds-card-header">
                <div className="sds-card-num-badge">06</div>
                <div className="sds-card-header-text">
                  <h2>Real-Time Order Tracking</h2>
                  <p>Live progress tracking from dispatch to doorstep handover.</p>
                </div>
              </div>
              <div className="sds-card-body">
                <p>
                  As soon as your silk package is handed over to our courier partner (BlueDart / DTDC / Speed Post), you will receive:
                </p>
                <ul className="sds-bullet-list">
                  <li>
                    <CheckCircle2 size={16} className="sds-bullet-icon" />
                    <div><strong>WhatsApp Notification:</strong> Live tracking link with courier partner name and tracking ID.</div>
                  </li>
                  <li>
                    <CheckCircle2 size={16} className="sds-bullet-icon" />
                    <div><strong>SMS & Email Confirmation:</strong> Official dispatch docket with estimated date of arrival.</div>
                  </li>
                  <li>
                    <CheckCircle2 size={16} className="sds-bullet-icon" />
                    <div><strong>Account Order Status:</strong> Accessible 24/7 inside your "My Orders" profile on our digital store.</div>
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 7 */}
            <section id="sds-sp-7" className="sds-content-card">
              <div className="sds-card-header">
                <div className="sds-card-num-badge">07</div>
                <div className="sds-card-header-text">
                  <h2>Vellore Showroom Pickup (Click & Collect)</h2>
                  <p>Convenient in-person pickup at our flagship boutique.</p>
                </div>
              </div>
              <div className="sds-card-body">
                <p>
                  Local customers and visitors to Vellore can choose the <strong>"Store Pickup"</strong> option at checkout. Your saree will be inspected, steam-pressed, and kept ready in luxury gifting attire for collection at our showroom: <em>Gandhi Road, Near Fort Round, Vellore, Tamil Nadu 632004</em>. Please present your Order ID and photo ID upon pickup.
                </p>
              </div>
            </section>

            {/* Section 8 */}
            <section id="sds-sp-8" className="sds-content-card">
              <div className="sds-card-header">
                <div className="sds-card-num-badge">08</div>
                <div className="sds-card-header-text">
                  <h2>International Shipping</h2>
                  <p>Dressing brides and saree connoisseurs across the globe.</p>
                </div>
              </div>
              <div className="sds-card-body">
                <p>
                  We proudly ship worldwide to USA, UK, Canada, Australia, Singapore, Malaysia, UAE, and European nations via DHL Express and FedEx International.
                </p>
                <ul className="sds-bullet-list">
                  <li>
                    <CheckCircle2 size={16} className="sds-bullet-icon" />
                    <div><strong>International Timelines:</strong> 4 to 8 business days depending on customs clearance at destination.</div>
                  </li>
                  <li>
                    <CheckCircle2 size={16} className="sds-bullet-icon" />
                    <div><strong>Customs & Duties:</strong> Any import duties, local taxes, or VAT levied by the destination country are the responsibility of the recipient as per international trade laws.</div>
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 9 */}
            <section id="sds-sp-9" className="sds-content-card">
              <div className="sds-card-header">
                <div className="sds-card-num-badge">09</div>
                <div className="sds-card-header-text">
                  <h2>Delivery Exceptions & Return to Origin (RTO)</h2>
                  <p>Ensuring delivery success and handling unexpected delivery hurdles.</p>
                </div>
              </div>
              <div className="sds-card-body">
                <p>
                  Our courier partners make up to 3 delivery attempts. Please ensure your contact phone number is reachable. If a parcel is returned to our Vellore showroom due to an incorrect address, non-availability, or recipient refusal, our team will contact you to coordinate re-delivery.
                </p>
              </div>
            </section>

            {/* Section 10 — Contact */}
            <section id="sds-sp-10" className="sds-content-card sds-contact-card-wrap">
              <div className="sds-card-header">
                <div className="sds-card-num-badge">10</div>
                <div className="sds-card-header-text">
                  <h2>Dispatch Desk & Logistics Support</h2>
                  <p>Contact our dedicated fulfillment coordinators in Vellore for any delivery queries.</p>
                </div>
              </div>
              <div className="sds-card-body">
                <div className="sds-official-contact-box">
                  <div className="sds-contact-brand-title">
                    <Sparkles size={16} className="sds-sparkle-gold" />
                    <div>
                      <h3>Shri Deepaalaya Silks</h3>
                      <p>Fulfillment & Dispatch Center, Vellore</p>
                    </div>
                  </div>

                  <div className="sds-contact-details-grid">
                    <div className="sds-contact-tile">
                      <div className="sds-tile-icon"><MapPin size={18} /></div>
                      <div className="sds-tile-info">
                        <span className="sds-tile-label">Showroom & Dispatch Desk</span>
                        <span className="sds-tile-val">Gandhi Road, Near Fort Round, Vellore, Tamil Nadu 632004</span>
                      </div>
                    </div>

                    <a href="tel:+919443212345" className="sds-contact-tile sds-tile-interactive">
                      <div className="sds-tile-icon"><Phone size={18} /></div>
                      <div className="sds-tile-info">
                        <span className="sds-tile-label">Dispatch Helpline</span>
                        <span className="sds-tile-val">+91 94432 12345</span>
                      </div>
                      <ArrowRight size={14} className="sds-tile-arrow" />
                    </a>

                    <a href="mailto:care@shrideepaalayasilks.com" className="sds-contact-tile sds-tile-interactive">
                      <div className="sds-tile-icon"><Mail size={18} /></div>
                      <div className="sds-tile-info">
                        <span className="sds-tile-label">Tracking Inquiries</span>
                        <span className="sds-tile-val">care@shrideepaalayasilks.com</span>
                      </div>
                      <ArrowRight size={14} className="sds-tile-arrow" />
                    </a>

                    <div className="sds-contact-tile">
                      <div className="sds-tile-icon"><Clock size={18} /></div>
                      <div className="sds-tile-info">
                        <span className="sds-tile-label">Operating Hours</span>
                        <span className="sds-tile-val">Monday – Sunday: 9:30 AM to 9:30 PM IST</span>
                      </div>
                    </div>
                  </div>

                  <div className="sds-grievance-note">
                    <strong>Express Wedding Delivery:</strong> If you need an order delivered before an urgent muhurtham or engagement date, please inform us immediately upon placing the order with your order ID so we can flag your docket for priority air transit.
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

export default ShippingPolicy;
