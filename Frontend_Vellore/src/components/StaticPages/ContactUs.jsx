import React, { useState } from "react";
import {
  FiMapPin,
  FiPhone,
  FiMail,
  FiClock,
  FiSend,
  FiCheckCircle,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { useSnackbar } from "notistack";
import "./ContactUs.css";

const ContactUs = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "Bridal Sarees Inquiry",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      enqueueSnackbar("Thank you! Your message has been sent to our Vellore store team.", {
        variant: "success",
      });
    }, 800);
  };

  return (
    <div className="sds-contact-page">
      <main className="sds-contact-container">
        {/* Hero */}
        <div className="sds-contact-hero">
          <span className="sds-contact-kicker">Get in Touch</span>
          <h1 className="sds-contact-title">Contact Shri Deepaalaya Silks</h1>
          <p className="sds-contact-sub">
            Have questions about a particular weave, custom bridal orders, or store visits? Our silk connoisseurs are here to assist you.
          </p>
        </div>

        <div className="sds-contact-grid">
          {/* Left Column: Store Info Cards */}
          <div className="sds-contact-info-col">
            <div className="sds-contact-card">
              <h2 className="sds-contact-card-title">Store Location</h2>
              <div className="sds-contact-details">
                <div className="sds-contact-item">
                  <div className="sds-contact-item-icon pin">
                    <FiMapPin />
                  </div>
                  <div className="sds-contact-item-content">
                    <span className="sds-contact-item-label">Vellore Flagship Store</span>
                    <p className="sds-contact-item-desc">
                      Gandhi Road, Near Fort Round,<br />
                      Vellore, Tamil Nadu — 632004, India
                    </p>
                  </div>
                </div>

                <div className="sds-contact-item">
                  <div className="sds-contact-item-icon phone">
                    <FiPhone />
                  </div>
                  <div className="sds-contact-item-content">
                    <span className="sds-contact-item-label">Direct Phone & WhatsApp</span>
                    <a href="tel:+919443212345" className="sds-contact-item-link">
                      +91 94432 12345
                    </a>
                    <a
                      href="https://wa.me/919443212345?text=Hello%20Shri%20Deepaalaya%20Silks"
                      target="_blank"
                      rel="noreferrer"
                      className="sds-contact-wa-link"
                    >
                      <FaWhatsapp /> Chat on WhatsApp
                    </a>
                  </div>
                </div>

                <div className="sds-contact-item">
                  <div className="sds-contact-item-icon mail">
                    <FiMail />
                  </div>
                  <div className="sds-contact-item-content">
                    <span className="sds-contact-item-label">Email Correspondence</span>
                    <a href="mailto:care@shrideepaalayasilks.com" className="sds-contact-item-link">
                      care@shrideepaalayasilks.com
                    </a>
                  </div>
                </div>

                <div className="sds-contact-item">
                  <div className="sds-contact-item-icon clock">
                    <FiClock />
                  </div>
                  <div className="sds-contact-item-content">
                    <span className="sds-contact-item-label">Showroom Timings</span>
                    <p className="sds-contact-item-desc">
                      Monday – Saturday: 10:00 AM – 8:30 PM<br />
                      Sunday: 11:00 AM – 7:00 PM
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Policy Reminder */}
            <div className="sds-contact-policy-alert">
              <strong>Looking to Exchange an Item?</strong>
              Please note our store follows a Strict No-Return Policy. If you received a damaged item or weave flaw, please submit a request directly through our{" "}
              <a href="/exchange-request">Online Exchange Portal</a> with video proof within 7 days of delivery.
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="sds-contact-form-card">
            {submitted ? (
              <div className="sds-contact-success">
                <div className="sds-contact-success-icon">
                  <FiCheckCircle />
                </div>
                <h3 className="sds-contact-card-title" style={{ border: 'none', margin: 0 }}>
                  Inquiry Received
                </h3>
                <p className="sds-contact-sub" style={{ fontSize: '13.5px' }}>
                  Our master silk associates will get back to your contact details within 12–24 business hours.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({
                      name: "",
                      email: "",
                      phone: "",
                      subject: "Bridal Sarees Inquiry",
                      message: "",
                    });
                  }}
                  className="sds-contact-submit-btn"
                  style={{ marginTop: '14px' }}
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="sds-contact-form">
                <h2 className="sds-contact-card-title">Send Us an Inquiry</h2>

                <div className="sds-form-row-2">
                  <div className="sds-form-group">
                    <label className="sds-form-label">
                      Full Name <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Your name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="sds-form-input"
                    />
                  </div>

                  <div className="sds-form-group">
                    <label className="sds-form-label">
                      Mobile Number <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="10-digit mobile"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="sds-form-input"
                    />
                  </div>
                </div>

                <div className="sds-form-group">
                  <label className="sds-form-label">Email Address</label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="sds-form-input"
                  />
                </div>

                <div className="sds-form-group">
                  <label className="sds-form-label">Inquiry Nature</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="sds-form-select"
                  >
                    <option value="Bridal Sarees Inquiry">Bridal & Muhurtham Silk Sarees</option>
                    <option value="Custom Orders">Custom Wedding Orders & Trousseau</option>
                    <option value="Store Visit">Showroom Appointment / Drape Trial</option>
                    <option value="Heirloom Jewellery">Heirloom & Temple Jewellery Inquiry</option>
                    <option value="General Inquiry">General / Order Status Query</option>
                  </select>
                </div>

                <div className="sds-form-group">
                  <label className="sds-form-label">
                    Message / Special Requests <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <textarea
                    required
                    placeholder="Tell us about the colors, weaves, muhurtham dates, or questions you have…"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="sds-form-textarea"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="sds-contact-submit-btn"
                >
                  {submitting ? "Sending..." : (
                    <>
                      <FiSend /> Send Inquiry
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ContactUs;
