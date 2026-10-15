import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaPhone,
  FaLocationDot,
  FaEnvelope,
  FaWhatsapp,
} from 'react-icons/fa6';
import SdsLogo from '../common/SdsLogo';
import './SdsFooter.css';

const SOCIAL_LINKS = [
  // NOTE: Replace hrefs with client's actual social URLs
  { href: '#', icon: FaFacebookF,  label: 'Facebook — Shri Deepaalaya Silks' },
  { href: '#', icon: FaInstagram,  label: 'Instagram — Shri Deepaalaya Silks' },
  { href: '#', icon: FaYoutube,    label: 'YouTube — Shri Deepaalaya Silks' },
  { href: '#', icon: FaWhatsapp,   label: 'WhatsApp — Shri Deepaalaya Silks' },
];

const QUICK_LINKS = [
  { name: 'All Silk Sarees',    path: '/category/cat_silk_sarees' },
  { name: 'Bridal Collection',  path: '/category/cat_bridal_wear' },
  { name: "Women's Wear",       path: '/category/cat_womens_wear' },
  { name: 'Heirloom Jewellery', path: '/category/cat_jewellery' },
  { name: 'Track Order',        path: '/order-tracking' },
  { name: 'Exchange Request',   path: '/exchange-request' },
  { name: 'About Us',           path: '/about-us' },
  { name: 'Contact Showroom',   path: '/contact-us' },
];

const POLICY_LINKS = [
  { name: 'No-Return & Exchange Policy', path: '/no-return-exchange-policy' },
  { name: 'Shipping Policy',             path: '/ShippingPolicy' },
  { name: 'Privacy Policy',              path: '/PrivacyPolicy' },
  { name: 'Terms & Conditions',          path: '/terms-and-conditions' },
];

const CONTACT_INFO = [
  { icon: FaPhone,       text: '+91 94432 12345', href: 'tel:+919443212345', label: 'Phone' },
  { icon: FaEnvelope,    text: 'care@shrideepaalayasilks.com', href: 'mailto:care@shrideepaalayasilks.com', label: 'Email' },
  { icon: FaLocationDot, text: 'Gandhi Road, Near Fort Round, Vellore, Tamil Nadu 632004', href: null, label: 'Address' },
];

const SdsFooter = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="sds-footer" role="contentinfo" aria-label="Site footer">

      {/* ── Top strip: logo + social ── */}
      <div className="sds-footer-top">
        <div className="sds-footer-inner">
          <div className="sds-footer-top-left">
            <SdsLogo width={180} />
            <p className="sds-footer-tagline">
              Timeless elegance, woven in tradition.
            </p>
          </div>
          <div className="sds-footer-social-row">
            {SOCIAL_LINKS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                className="sds-social-btn"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
              >
                <s.icon aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main grid ── */}
      <div className="sds-footer-main">
        <div className="sds-footer-inner sds-footer-grid">

          {/* About */}
          <section className="sds-footer-col">
            <h3 className="sds-footer-heading">About Us</h3>
            <p className="sds-footer-about-text">
              Shri Deepaalaya Silks is your trusted destination for handpicked silk sarees,
              designer ethnic wear and traditional jewellery — curated directly from India's
              finest weavers and artisans.
            </p>
          </section>

          {/* Quick Links */}
          <section className="sds-footer-col">
            <h3 className="sds-footer-heading">Collections</h3>
            <ul className="sds-footer-links">
              {QUICK_LINKS.map((l) => (
                <li key={l.path}>
                  <Link to={l.path} className="sds-footer-link">{l.name}</Link>
                </li>
              ))}
            </ul>
          </section>

          {/* Policies */}
          <section className="sds-footer-col">
            <h3 className="sds-footer-heading">Policy & Legal</h3>
            <ul className="sds-footer-links">
              {POLICY_LINKS.map((l) => (
                <li key={l.path}>
                  <Link to={l.path} className="sds-footer-link">{l.name}</Link>
                </li>
              ))}
            </ul>
          </section>

          {/* Contact */}
          <section className="sds-footer-col">
            <h3 className="sds-footer-heading">Contact Us</h3>
            <div className="sds-footer-contact">
              {CONTACT_INFO.map((c) => (
                <div key={c.label} className="sds-contact-row">
                  <div className="sds-contact-icon" aria-hidden="true"><c.icon /></div>
                  <div className="sds-contact-text">
                    {c.href ? (
                      <a href={c.href} className="sds-contact-link">{c.text}</a>
                    ) : (
                      <address className="sds-contact-address">{c.text}</address>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="sds-footer-bottom">
        <div className="sds-footer-inner sds-footer-bottom-inner">
          <p className="sds-footer-copyright">
            © {year} Shri Deepaalaya Silks. All rights reserved.
          </p>
          <div className="sds-footer-bottom-links">
            <Link to="/PrivacyPolicy"        className="sds-footer-bottom-link">Privacy</Link>
            <span className="sds-footer-bottom-sep">·</span>
            <Link to="/terms-and-conditions" className="sds-footer-bottom-link">Terms</Link>
            <span className="sds-footer-bottom-sep">·</span>
            <Link to="/ShippingPolicy"       className="sds-footer-bottom-link">Shipping</Link>
          </div>
        </div>
      </div>

    </footer>
  );
};

export default SdsFooter;
