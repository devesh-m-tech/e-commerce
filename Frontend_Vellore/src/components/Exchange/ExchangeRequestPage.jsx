import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiUpload,
  FiCheckCircle,
  FiAlertTriangle,
  FiVideo,
  FiImage,
  FiClock,
  FiTruck,
  FiShield,
  FiRefreshCw,
  FiXCircle,
} from "react-icons/fi";
import { useSnackbar } from "notistack";
import { exchangeApi } from "../../APi/exchangeApi";
import "./ExchangeRequestPage.css";

const REASONS = [
  "Size Mismatch / Fitting Issue",
  "Damaged on Delivery",
  "Defective Weave / Fabric Flaw",
  "Incorrect Item Received",
  "Color Differs Significantly from Description",
  "Other Inspection Issue",
];

const ExchangeRequestPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  // Query params pre-fill (if clicked from OrderDetailsPage)
  const searchParams = new URLSearchParams(location.search);
  const initialOrderId = searchParams.get("orderId") || "";
  const initialOrderNumber = searchParams.get("orderNumber") || "";
  const initialProductId = searchParams.get("productId") || "";
  const initialProductName = searchParams.get("productName") || "";
  const initialVariantId = searchParams.get("variantId") || "";

  const [activeTab, setActiveTab] = useState("submit"); // 'submit' | 'track'

  // Submission Form State
  const [formData, setFormData] = useState({
    orderId: initialOrderId,
    orderNumber: initialOrderNumber,
    productId: initialProductId,
    productName: initialProductName,
    variantId: initialVariantId,
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    reason: REASONS[0],
    customReason: "",
    requestedSizeOrItem: "",
    policyConsent: false,
  });

  const [photos, setPhotos] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(null);

  // Tracking State
  const [trackQuery, setTrackQuery] = useState(initialOrderNumber || initialOrderId || "");
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackedExchange, setTrackedExchange] = useState(null);
  const [trackError, setTrackError] = useState("");

  // Auto-fill logged in user info if available
  useEffect(() => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const u = JSON.parse(userStr);
        setFormData((prev) => ({
          ...prev,
          customerName: prev.customerName || u.name || "",
          customerEmail: prev.customerEmail || u.email || "",
          customerPhone: prev.customerPhone || u.mobile || u.phone || "",
        }));
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // Handle Photo selection
  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length + photos.length > 5) {
      enqueueSnackbar("Maximum 5 photos allowed", { variant: "warning" });
      return;
    }
    const newPhotos = [...photos, ...files];
    setPhotos(newPhotos);

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPhotoPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removePhoto = (index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle Video selection
  const handleVideoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        enqueueSnackbar("Video file size must be under 50MB", { variant: "error" });
        return;
      }
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const removeVideo = () => {
    setVideoFile(null);
    setVideoPreview("");
  };

  // Submit Exchange Request
  const handleSubmitExchange = async (e) => {
    e.preventDefault();

    if (!formData.orderId && !formData.orderNumber) {
      enqueueSnackbar("Please enter your Order ID or Order Number", { variant: "error" });
      return;
    }

    if (!formData.customerPhone || !formData.customerName) {
      enqueueSnackbar("Please provide your Name and Contact Phone number", { variant: "error" });
      return;
    }

    if (photos.length === 0) {
      enqueueSnackbar("At least 1 photo proof showing the defect/tag is required", { variant: "error" });
      return;
    }

    if (!formData.policyConsent) {
      enqueueSnackbar("Please accept the Shri Deepaalaya Silks Exchange Policy terms", { variant: "warning" });
      return;
    }

    setSubmitting(true);
    try {
      // 1. Upload files first
      let uploadedPhotoUrls = [];
      let uploadedVideoUrl = "";

      const uploadForm = new FormData();
      photos.forEach((photo) => uploadForm.append("photos", photo));
      if (videoFile) {
        uploadForm.append("video", videoFile);
      }

      const uploadRes = await exchangeApi.uploadProof(uploadForm);
      if (uploadRes.success) {
        uploadedPhotoUrls = uploadRes.photos || [];
        uploadedVideoUrl = uploadRes.video || "";
      }

      // 2. Submit exchange record
      const exchangePayload = {
        orderId: formData.orderId || formData.orderNumber,
        orderNumber: formData.orderNumber || formData.orderId,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        product: {
          name: formData.productName || "Saree / Jewelry Item",
          productId: formData.productId || undefined,
        },
        variantId: formData.variantId || undefined,
        reason: formData.reason === "Other Inspection Issue" && formData.customReason ? formData.customReason : formData.reason,
        requestedSizeOrItem: formData.requestedSizeOrItem,
        photos: uploadedPhotoUrls,
        video: uploadedVideoUrl,
      };

      const result = await exchangeApi.submitExchangeRequest(exchangePayload);
      if (result.success) {
        setSubmissionSuccess(result.exchange);
        enqueueSnackbar("Exchange request submitted successfully for admin review!", { variant: "success" });
      } else {
        throw new Error(result.message || "Failed to submit exchange request");
      }
    } catch (err) {
      console.error(err);
      enqueueSnackbar(err.message || "Error submitting exchange request", { variant: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  // Track Exchange Request
  const handleTrackExchange = async (e) => {
    e.preventDefault();
    if (!trackQuery.trim()) {
      enqueueSnackbar("Please enter an Order Number or Exchange ID to track", { variant: "warning" });
      return;
    }

    setTrackingLoading(true);
    setTrackError("");
    setTrackedExchange(null);

    try {
      const res = await exchangeApi.trackExchange(trackQuery.trim());
      if (res.success && res.exchange) {
        setTrackedExchange(res.exchange);
      } else {
        setTrackError("No exchange request found matching this Order Number or Exchange ID. Please verify your details.");
      }
    } catch (err) {
      setTrackError(err.message || "Could not retrieve exchange tracking details");
    } finally {
      setTrackingLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "PENDING":
        return <span className="sds-status-badge pending">PENDING REVIEW</span>;
      case "APPROVED":
        return <span className="sds-status-badge approved">APPROVED — PICKUP IN PROGRESS</span>;
      case "PRODUCT_RECEIVED":
        return <span className="sds-status-badge received">ITEM RECEIVED & VERIFYING</span>;
      case "REPLACEMENT_DISPATCHED":
        return <span className="sds-status-badge dispatched">REPLACEMENT SHIPPED</span>;
      case "COMPLETED":
        return <span className="sds-status-badge completed">EXCHANGE COMPLETED</span>;
      case "REJECTED":
        return <span className="sds-status-badge rejected">EXCHANGE DECLINED</span>;
      default:
        return <span className="sds-status-badge pending">{status}</span>;
    }
  };

  return (
    <div className="sds-exchange-page">
      <main className="sds-exchange-container">
        {/* Breadcrumb & Header */}
        <div className="sds-exchange-header-wrapper mb-6">
          <button
            onClick={() => navigate(-1)}
            className="sds-exchange-back-btn"
          >
            <FiArrowLeft /> Back
          </button>
          <div className="sds-exchange-header">
            <div className="sds-exchange-title-group">
              <h1>
                Exchange Portal
              </h1>
              <p>
                Shri Deepaalaya Silks — Handpicked Silk Sarees & Heirloom Artistry
              </p>
            </div>
            {/* Policy Notice Chip */}
            <div className="sds-exchange-policy-box">
              <strong>
                <FiShield /> Strict No-Return & Controlled Exchange Policy
              </strong>
              We do not accept monetary returns or refunds. Exchanges are permitted within 7 days of delivery for valid defects or size mismatches, subject to verification of photos, video proof, and original tags intact.
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="sds-exchange-tabs">
          <button
            onClick={() => setActiveTab("submit")}
            className={`sds-exchange-tab-btn ${activeTab === "submit" ? "active" : ""}`}
          >
            <FiRefreshCw /> Submit Exchange Request
          </button>
          <button
            onClick={() => setActiveTab("track")}
            className={`sds-exchange-tab-btn ${activeTab === "track" ? "active" : ""}`}
          >
            <FiTruck /> Track Exchange Status
          </button>
        </div>

        {/* TAB 1: SUBMIT EXCHANGE */}
        {activeTab === "submit" && (
          <div>
            {submissionSuccess ? (
              <div className="sds-exchange-card" style={{ textAlign: "center", maxWidth: "680px", margin: "0 auto" }}>
                <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#DCFCE7", color: "#15803D", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <FiCheckCircle size={36} />
                </div>
                <h2 style={{ fontFamily: "var(--font-serif, 'Playfair Display', serif)", fontSize: "1.75rem", fontWeight: 700, color: "#1A1615", margin: "0 0 8px 0" }}>
                  Exchange Request Submitted!
                </h2>
                <p style={{ color: "#6B5F5A", fontSize: "14px", lineHeight: "1.6", margin: "0 0 24px 0" }}>
                  Your exchange request for Order{" "}
                  <strong>#{submissionSuccess.orderNumber || submissionSuccess.orderId}</strong> has been received. Our quality control team in Vellore will review your photos and video proof.
                </p>
                <div style={{ background: "#FCFBF9", borderRadius: "8px", border: "1px solid #EDE2D2", padding: "16px 20px", textAlign: "left", maxWidth: "460px", margin: "0 auto 24px", fontSize: "13px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ color: "#7B7268" }}>Request ID:</span>
                    <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#1A1615" }}>{submissionSuccess._id}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ color: "#7B7268" }}>Current Status:</span>
                    {getStatusBadge(submissionSuccess.status)}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#7B7268" }}>Reason:</span>
                    <span style={{ fontWeight: 600, color: "#1A1615" }}>{submissionSuccess.reason}</span>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
                  <button
                    onClick={() => {
                      setTrackQuery(submissionSuccess.orderNumber || submissionSuccess._id);
                      setActiveTab("track");
                      handleTrackExchange({ preventDefault: () => {} });
                    }}
                    className="sds-exchange-submit-btn"
                    style={{ width: "auto", padding: "11px 24px" }}
                  >
                    Track This Request
                  </button>
                  <Link
                    to="/"
                    style={{ padding: "11px 22px", borderRadius: "6px", background: "#F5EFE6", color: "#4A403B", fontSize: "13px", fontWeight: 600, textDecoration: "none", display: "inline-flex", alignItems: "center" }}
                  >
                    Return Home
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitExchange} className="sds-exchange-card">
                <h3 className="sds-exchange-section-title">1. Order & Customer Verification</h3>
                <div className="sds-exchange-grid-2">
                  {/* Order Number */}
                  <div className="sds-exchange-field">
                    <label>
                      Order ID / Order Number <span>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. SDS-2024-XXXX or Mongo Order ID"
                      value={formData.orderNumber || formData.orderId}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          orderId: e.target.value,
                          orderNumber: e.target.value,
                        })
                      }
                    />
                    <span style={{ fontSize: "11px", color: "#8C827A" }}>
                      Found in your confirmation SMS / Email or in My Orders.
                    </span>
                  </div>

                  {/* Product / Item Name */}
                  <div className="sds-exchange-field">
                    <label>
                      Product Name <span>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kanchipuram Pure Zari Silk Saree"
                      value={formData.productName}
                      onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                    />
                  </div>

                  {/* Customer Name */}
                  <div className="sds-exchange-field">
                    <label>
                      Your Full Name <span>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Customer Name"
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    />
                  </div>

                  {/* Phone */}
                  <div className="sds-exchange-field">
                    <label>
                      Phone Number <span>*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="10-digit mobile number"
                      value={formData.customerPhone}
                      onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                    />
                  </div>

                  {/* Email */}
                  <div className="sds-exchange-field">
                    <label>Email Address</label>
                    <input
                      type="email"
                      placeholder="email@example.com"
                      value={formData.customerEmail}
                      onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                    />
                  </div>

                  {/* Reason for Exchange */}
                  <div className="sds-exchange-field">
                    <label>
                      Reason for Exchange <span>*</span>
                    </label>
                    <select
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    >
                      {REASONS.map((r, i) => (
                        <option key={i} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Custom explanation if Other */}
                {formData.reason === "Other Inspection Issue" && (
                  <div className="sds-exchange-field" style={{ marginBottom: "20px" }}>
                    <label>
                      Please explain the issue in detail <span>*</span>
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={formData.customReason}
                      onChange={(e) => setFormData({ ...formData, customReason: e.target.value })}
                      placeholder="Describe what is wrong with the delivered item..."
                    />
                  </div>
                )}

                {/* Requested Size / Alternative Item */}
                <div className="sds-exchange-field" style={{ marginBottom: "24px" }}>
                  <label>Replacement Request Details</label>
                  <input
                    type="text"
                    placeholder="e.g., Replacement for same saree without defect, or Size 38 blouse"
                    value={formData.requestedSizeOrItem}
                    onChange={(e) => setFormData({ ...formData, requestedSizeOrItem: e.target.value })}
                  />
                  <span style={{ fontSize: "11px", color: "#8C827A" }}>
                    Exchanges are permitted for same item or equivalent value subject to stock availability.
                  </span>
                </div>

                {/* MANDATORY PROOF UPLOAD SECTION */}
                <h3 className="sds-exchange-section-title" style={{ marginTop: "28px" }}>
                  2. Mandatory Photo & Video Proof
                </h3>
                <p style={{ fontSize: "12.5px", color: "#7B6F68", marginBottom: "16px", lineHeight: "1.5" }}>
                  Per our strict inspection policy, exchange requests must include clear photos of the item with the original Shri Deepaalaya Silks tags intact, along with an unboxing/defect video.
                </p>

                <div className="sds-exchange-grid-2">
                  {/* Photos Upload */}
                  <div>
                    <label className="sds-exchange-upload-box" style={{ display: "block" }}>
                      <div className="sds-exchange-upload-icon">
                        <FiImage size={24} />
                      </div>
                      <p>Upload Photos (Defect & Tags) *</p>
                      <span>Click to select high-resolution images</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handlePhotoChange}
                        style={{ display: "none" }}
                      />
                    </label>

                    {photoPreviews.length > 0 && (
                      <div className="sds-exchange-previews">
                        {photoPreviews.map((src, i) => (
                          <div key={i} className="sds-preview-cell">
                            <img src={src} alt="proof-preview" />
                            <button
                              type="button"
                              onClick={() => removePhoto(i)}
                              className="sds-preview-remove-btn"
                              title="Remove photo"
                            >
                              <FiXCircle size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Video Upload */}
                  <div>
                    <label className="sds-exchange-upload-box" style={{ display: "block" }}>
                      <div className="sds-exchange-upload-icon">
                        <FiVideo size={24} />
                      </div>
                      <p>Unboxing / Defect Video Proof</p>
                      <span>Recommended for accelerated verification</span>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleVideoChange}
                        style={{ display: "none" }}
                      />
                    </label>

                    {videoPreview && (
                      <div style={{ position: "relative", marginBottom: "16px" }}>
                        <video src={videoPreview} controls style={{ width: "100%", maxHeight: "140px", borderRadius: "6px", background: "#000" }} />
                        <button
                          type="button"
                          onClick={removeVideo}
                          style={{ fontSize: "11px", color: "#DC2626", background: "none", border: "none", cursor: "pointer", marginTop: "4px", padding: 0 }}
                        >
                          Remove Video
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Consent Checkbox */}
                <div className="sds-exchange-consent">
                  <input
                    type="checkbox"
                    required
                    id="policyConsent"
                    checked={formData.policyConsent}
                    onChange={(e) => setFormData({ ...formData, policyConsent: e.target.checked })}
                  />
                  <label htmlFor="policyConsent" style={{ cursor: "pointer" }}>
                    I acknowledge that <strong>Shri Deepaalaya Silks operates under a strict No-Return Policy</strong>. I confirm the saree/item is completely unused, in its pristine original fold, with tags intact. I understand this exchange request requires administrative approval and physical inspection at the Vellore facility before a replacement is shipped.
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="sds-exchange-submit-btn"
                >
                  {submitting ? (
                    <>
                      <div style={{ width: "16px", height: "16px", border: "2px solid #ffffff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                      Uploading Proof & Submitting...
                    </>
                  ) : (
                    "Submit Exchange Request"
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* TAB 2: TRACK EXCHANGE STATUS */}
        {activeTab === "track" && (
          <div className="sds-exchange-track-box">
            <h2 style={{ fontFamily: "var(--font-serif, 'Playfair Display', serif)", fontSize: "1.35rem", fontWeight: 700, color: "#1A1615", margin: "0 0 6px 0" }}>
              Track Your Exchange Request
            </h2>
            <p style={{ fontSize: "13px", color: "#6B5F5A", margin: "0 0 20px 0" }}>
              Enter your Order Number (e.g. SDS-2024-XXXX) or the Exchange Reference ID provided during submission.
            </p>

            <form onSubmit={handleTrackExchange} className="sds-exchange-track-form">
              <input
                type="text"
                required
                placeholder="Enter Order Number or Exchange ID"
                value={trackQuery}
                onChange={(e) => setTrackQuery(e.target.value)}
              />
              <button
                type="submit"
                disabled={trackingLoading}
                className="sds-exchange-track-btn"
              >
                {trackingLoading ? "Searching..." : "Track Status"}
              </button>
            </form>

            {trackError && (
              <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "6px", padding: "12px 16px", color: "#991B1B", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
                <FiAlertTriangle /> {trackError}
              </div>
            )}

            {trackedExchange && (
              <div style={{ border: "1px solid #EDE2D2", borderRadius: "10px", padding: "24px", background: "#FCFBF9" }}>
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #EDE2D2", paddingBottom: "16px", gap: "12px", marginBottom: "20px" }}>
                  <div>
                    <span style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", color: "#8C827A", fontWeight: 700, display: "block" }}>
                      Exchange Reference ID
                    </span>
                    <span style={{ fontSize: "1rem", fontFamily: "monospace", fontWeight: 700, color: "#1A1615" }}>
                      {trackedExchange._id}
                    </span>
                  </div>
                  <div>{getStatusBadge(trackedExchange.status)}</div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "24px", fontSize: "13px" }}>
                  <div>
                    <span style={{ color: "#7B7268", display: "block", fontSize: "11px", textTransform: "uppercase", fontWeight: 600 }}>Order Number</span>
                    <span style={{ fontWeight: 700, color: "#1A1615" }}>
                      #{trackedExchange.orderNumber || trackedExchange.orderId}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: "#7B7268", display: "block", fontSize: "11px", textTransform: "uppercase", fontWeight: 600 }}>Customer Name</span>
                    <span style={{ fontWeight: 600, color: "#1A1615" }}>{trackedExchange.customerName}</span>
                  </div>
                  <div>
                    <span style={{ color: "#7B7268", display: "block", fontSize: "11px", textTransform: "uppercase", fontWeight: 600 }}>Date Requested</span>
                    <span style={{ fontWeight: 600, color: "#1A1615" }}>
                      {new Date(trackedExchange.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: "#7B7268", display: "block", fontSize: "11px", textTransform: "uppercase", fontWeight: 600 }}>Product</span>
                    <span style={{ fontWeight: 600, color: "#1A1615" }}>
                      {trackedExchange.product?.name || "Silk Saree"}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: "#7B7268", display: "block", fontSize: "11px", textTransform: "uppercase", fontWeight: 600 }}>Reason</span>
                    <span style={{ fontWeight: 600, color: "#1A1615" }}>{trackedExchange.reason}</span>
                  </div>
                  <div>
                    <span style={{ color: "#7B7268", display: "block", fontSize: "11px", textTransform: "uppercase", fontWeight: 600 }}>Exchange Stage</span>
                    <span style={{ fontWeight: 700, color: "var(--color-maroon, #6D1734)" }}>
                      {trackedExchange.exchangeOrderStatus || "Under Admin Verification"}
                    </span>
                  </div>
                </div>

                {/* Admin Decision / Notes */}
                {trackedExchange.adminDecision?.notes && (
                  <div style={{ background: "#ffffff", borderRadius: "8px", padding: "16px", border: "1px solid #EDE2D2", fontSize: "13px", marginBottom: "20px" }}>
                    <span style={{ fontWeight: 700, color: "#1A1615", display: "block", marginBottom: "4px" }}>
                      Store Decision / Inspection Notes:
                    </span>
                    <p style={{ color: "#6B5F5A", margin: 0 }}>{trackedExchange.adminDecision.notes}</p>
                    {trackedExchange.adminDecision.decidedAt && (
                      <span style={{ fontSize: "11px", color: "#8C827A", display: "block", marginTop: "6px" }}>
                        Reviewed on {new Date(trackedExchange.adminDecision.decidedAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                )}

                {/* Timeline */}
                <div style={{ background: "#ffffff", borderRadius: "8px", padding: "20px", border: "1px solid #EDE2D2" }}>
                  <h4 style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#4A403B", margin: "0 0 16px 0" }}>
                    Exchange Progress Lifecycle
                  </h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px", fontSize: "13px" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                      <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: "#15803D", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "2px" }}>
                        <FiCheckCircle size={14} />
                      </div>
                      <div>
                        <span style={{ fontWeight: 700, color: "#1A1615" }}>Request Submitted with Proof</span>
                        <p style={{ margin: "2px 0 0 0", color: "#7B7268", fontSize: "12px" }}>
                          {new Date(trackedExchange.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                      <div
                        style={{
                          width: "22px",
                          height: "22px",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          marginTop: "2px",
                          background: trackedExchange.status !== "PENDING"
                            ? trackedExchange.status === "REJECTED"
                              ? "#DC2626"
                              : "#15803D"
                            : "#E5E7EB",
                          color: trackedExchange.status !== "PENDING" ? "#ffffff" : "#9CA3AF"
                        }}
                      >
                        {trackedExchange.status === "REJECTED" ? (
                          <FiXCircle size={14} />
                        ) : (
                          <FiCheckCircle size={14} />
                        )}
                      </div>
                      <div>
                        <span style={{ fontWeight: 700, color: "#1A1615" }}>
                          {trackedExchange.status === "REJECTED"
                            ? "Request Declined by Store Team"
                            : "Quality Assurance & Approval"}
                        </span>
                        <p style={{ margin: "2px 0 0 0", color: "#7B7268", fontSize: "12px" }}>
                          {trackedExchange.adminDecision?.decidedAt
                            ? new Date(trackedExchange.adminDecision.decidedAt).toLocaleString()
                            : "Pending verification of unboxing proof"}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                      <div
                        style={{
                          width: "22px",
                          height: "22px",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          marginTop: "2px",
                          background: ["PRODUCT_RECEIVED", "REPLACEMENT_DISPATCHED", "COMPLETED"].includes(trackedExchange.status)
                            ? "#15803D"
                            : "#E5E7EB",
                          color: ["PRODUCT_RECEIVED", "REPLACEMENT_DISPATCHED", "COMPLETED"].includes(trackedExchange.status) ? "#ffffff" : "#9CA3AF"
                        }}
                      >
                        <FiTruck size={14} />
                      </div>
                      <div>
                        <span style={{ fontWeight: 700, color: "#1A1615" }}>
                          Item Returned to Vellore Facility
                        </span>
                        <p style={{ margin: "2px 0 0 0", color: "#7B7268", fontSize: "12px" }}>
                          Physical inspection of tags and silk condition
                        </p>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                      <div
                        style={{
                          width: "22px",
                          height: "22px",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          marginTop: "2px",
                          background: ["REPLACEMENT_DISPATCHED", "COMPLETED"].includes(trackedExchange.status)
                            ? "#15803D"
                            : "#E5E7EB",
                          color: ["REPLACEMENT_DISPATCHED", "COMPLETED"].includes(trackedExchange.status) ? "#ffffff" : "#9CA3AF"
                        }}
                      >
                        <FiCheckCircle size={14} />
                      </div>
                      <div>
                        <span style={{ fontWeight: 700, color: "#1A1615" }}>
                          Fresh Replacement Dispatched
                        </span>
                        <p style={{ margin: "2px 0 0 0", color: "#7B7268", fontSize: "12px" }}>
                          Replacement item shipped back to customer address
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default ExchangeRequestPage;
