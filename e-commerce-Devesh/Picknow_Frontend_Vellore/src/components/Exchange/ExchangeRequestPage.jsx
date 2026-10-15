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
        return <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full">PENDING REVIEW</span>;
      case "APPROVED":
        return <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">APPROVED — PICKUP IN PROGRESS</span>;
      case "PRODUCT_RECEIVED":
        return <span className="bg-purple-100 text-purple-800 text-xs font-bold px-3 py-1 rounded-full">ITEM RECEIVED & VERIFYING</span>;
      case "REPLACEMENT_DISPATCHED":
        return <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-3 py-1 rounded-full">REPLACEMENT SHIPPED</span>;
      case "COMPLETED":
        return <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full">EXCHANGE COMPLETED</span>;
      case "REJECTED":
        return <span className="bg-red-100 text-red-800 text-xs font-bold px-3 py-1 rounded-full">EXCHANGE DECLINED</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 text-xs font-bold px-3 py-1 rounded-full">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] flex flex-col font-sans">
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 md:py-12">
        {/* Breadcrumb & Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm text-[#6D1734] font-medium hover:underline mb-3"
          >
            <FiArrowLeft /> Back
          </button>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-serif font-bold text-gray-900">
                Exchange Portal
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Shri Deepaalaya Silks — Handpicked Silk Sarees & Heirloom Artistry
              </p>
            </div>
            {/* Policy Notice Chip */}
            <div className="bg-[#fff1f2] border border-[#fecdd3] rounded-lg p-3 max-w-md text-xs text-[#9f1239]">
              <span className="font-bold flex items-center gap-1 mb-1">
                <FiShield /> Strict No-Return & Controlled Exchange Policy
              </span>
              We do not accept monetary returns or refunds. Exchanges are permitted within 7 days of delivery for valid defects or size mismatches, subject to verification of photos, video proof, and original tags intact.
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-8 bg-white rounded-t-xl px-4 pt-2 shadow-sm">
          <button
            onClick={() => setActiveTab("submit")}
            className={`py-3 px-6 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "submit"
                ? "border-[#6D1734] text-[#6D1734] font-semibold"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <FiRefreshCw /> Submit Exchange Request
          </button>
          <button
            onClick={() => setActiveTab("track")}
            className={`py-3 px-6 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "track"
                ? "border-[#6D1734] text-[#6D1734] font-semibold"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <FiTruck /> Track Exchange Status
          </button>
        </div>

        {/* TAB 1: SUBMIT EXCHANGE */}
        {activeTab === "submit" && (
          <div>
            {submissionSuccess ? (
              <div className="bg-white rounded-xl shadow-sm border border-green-200 p-8 text-center max-w-2xl mx-auto">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiCheckCircle size={36} />
                </div>
                <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">
                  Exchange Request Submitted!
                </h2>
                <p className="text-gray-600 mb-6">
                  Your exchange request for Order{" "}
                  <strong>#{submissionSuccess.orderNumber || submissionSuccess.orderId}</strong> has been received. Our quality control team will review your photos and video proof.
                </p>
                <div className="bg-gray-50 rounded-lg p-4 text-left max-w-md mx-auto mb-6 text-sm space-y-2 border border-gray-200">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Request ID:</span>
                    <span className="font-mono font-bold text-gray-800">{submissionSuccess._id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Current Status:</span>
                    {getStatusBadge(submissionSuccess.status)}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Reason:</span>
                    <span className="font-medium text-gray-800">{submissionSuccess.reason}</span>
                  </div>
                </div>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => {
                      setTrackQuery(submissionSuccess.orderNumber || submissionSuccess._id);
                      setActiveTab("track");
                      handleTrackExchange({ preventDefault: () => {} });
                    }}
                    className="px-6 py-2.5 bg-[#6D1734] text-white rounded-lg text-sm font-medium hover:bg-[#571229] transition-colors"
                  >
                    Track This Request
                  </button>
                  <Link
                    to="/"
                    className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    Return Home
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitExchange} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Order Number */}
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-700 mb-1.5">
                      Order ID / Order Number <span className="text-red-500">*</span>
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
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#6D1734] focus:border-[#6D1734] outline-none"
                    />
                    <span className="text-[11px] text-gray-500 mt-1 block">
                      Found in your confirmation SMS / Email or in My Orders.
                    </span>
                  </div>

                  {/* Product / Item Name */}
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-700 mb-1.5">
                      Product Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kanchipuram Pure Zari Silk Saree"
                      value={formData.productName}
                      onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#6D1734] focus:border-[#6D1734] outline-none"
                    />
                  </div>

                  {/* Customer Name */}
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-700 mb-1.5">
                      Your Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Full Name"
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#6D1734] focus:border-[#6D1734] outline-none"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-700 mb-1.5">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="10-digit mobile number"
                      value={formData.customerPhone}
                      onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#6D1734] focus:border-[#6D1734] outline-none"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-700 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="email@example.com"
                      value={formData.customerEmail}
                      onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#6D1734] focus:border-[#6D1734] outline-none"
                    />
                  </div>

                  {/* Reason for Exchange */}
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-700 mb-1.5">
                      Reason for Exchange <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#6D1734] focus:border-[#6D1734] outline-none bg-white"
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
                  <div className="mb-6">
                    <label className="block text-xs font-bold uppercase text-gray-700 mb-1.5">
                      Please explain the issue in detail <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={formData.customReason}
                      onChange={(e) => setFormData({ ...formData, customReason: e.target.value })}
                      placeholder="Describe what is wrong with the delivered item..."
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#6D1734] focus:border-[#6D1734] outline-none"
                    />
                  </div>
                )}

                {/* Requested Size / Alternative Item */}
                <div className="mb-6">
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1.5">
                    Replacement Request Details
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Replacement for same saree without defect, or Size 38 blouse"
                    value={formData.requestedSizeOrItem}
                    onChange={(e) => setFormData({ ...formData, requestedSizeOrItem: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#6D1734] focus:border-[#6D1734] outline-none"
                  />
                  <span className="text-[11px] text-gray-500 mt-1 block">
                    Exchanges are permitted for same item or equivalent value subject to stock availability.
                  </span>
                </div>

                {/* MANDATORY PROOF UPLOAD SECTION */}
                <div className="border border-amber-200 bg-amber-50/50 rounded-xl p-5 mb-6">
                  <h3 className="text-sm font-bold text-amber-900 flex items-center gap-2 mb-2">
                    <FiAlertTriangle className="text-amber-600" /> Mandatory Photo & Video Proof
                  </h3>
                  <p className="text-xs text-amber-800 mb-4">
                    Per our verification policy, exchange requests must include clear photos of the item and original tags intact, along with an unboxing/defect video.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Photos Upload */}
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <label className="block text-xs font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                        <FiImage /> Photos (Defect & Tags) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handlePhotoChange}
                        className="text-xs text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#6D1734] file:text-white hover:file:bg-[#571229] cursor-pointer"
                      />
                      {photoPreviews.length > 0 && (
                        <div className="flex gap-2 mt-3 flex-wrap">
                          {photoPreviews.map((src, i) => (
                            <div key={i} className="relative w-16 h-16 rounded border overflow-hidden">
                              <img src={src} alt="preview" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => removePhoto(i)}
                                className="absolute top-0 right-0 bg-red-600 text-white rounded-bl p-0.5"
                              >
                                <FiXCircle size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Video Upload */}
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <label className="block text-xs font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                        <FiVideo /> Unboxing / Defect Video Proof
                      </label>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleVideoChange}
                        className="text-xs text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#6D1734] file:text-white hover:file:bg-[#571229] cursor-pointer"
                      />
                      {videoPreview && (
                        <div className="mt-3 relative">
                          <video src={videoPreview} controls className="w-full max-h-32 rounded bg-black" />
                          <button
                            type="button"
                            onClick={removeVideo}
                            className="text-xs text-red-600 hover:underline mt-1 block"
                          >
                            Remove Video
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Consent Checkbox */}
                <div className="mb-6">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      checked={formData.policyConsent}
                      onChange={(e) => setFormData({ ...formData, policyConsent: e.target.checked })}
                      className="mt-1 h-4 w-4 text-[#6D1734] focus:ring-[#6D1734] border-gray-300 rounded"
                    />
                    <span className="text-xs text-gray-600 leading-relaxed">
                      I acknowledge that <strong>Shri Deepaalaya Silks operates under a strict No-Return Policy</strong>. I confirm the saree/item is unused, in original fold, with tags intact. I understand this exchange request requires administrative approval and physical inspection before a replacement is shipped.
                    </span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full md:w-auto px-8 py-3 bg-[#6D1734] hover:bg-[#571229] text-white font-medium rounded-lg text-sm transition-colors shadow-md flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
            <h2 className="text-lg font-serif font-bold text-gray-900 mb-2">
              Track Your Exchange Request
            </h2>
            <p className="text-xs text-gray-600 mb-6">
              Enter your Order Number (e.g. SDS-2024-XXXX) or the Exchange Reference ID provided during submission.
            </p>

            <form onSubmit={handleTrackExchange} className="flex flex-col sm:flex-row gap-3 mb-8">
              <input
                type="text"
                required
                placeholder="Enter Order Number or Exchange ID"
                value={trackQuery}
                onChange={(e) => setTrackQuery(e.target.value)}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#6D1734] focus:border-[#6D1734] outline-none"
              />
              <button
                type="submit"
                disabled={trackingLoading}
                className="px-6 py-2.5 bg-[#6D1734] text-white font-medium rounded-lg text-sm hover:bg-[#571229] transition-colors"
              >
                {trackingLoading ? "Searching..." : "Track Status"}
              </button>
            </form>

            {trackError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-xs text-red-700 flex items-center gap-2 mb-6">
                <FiAlertTriangle /> {trackError}
              </div>
            )}

            {trackedExchange && (
              <div className="border border-gray-200 rounded-xl p-6 bg-gray-50/50">
                <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-gray-200 gap-2 mb-6">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-gray-500 font-bold block">
                      Exchange Reference ID
                    </span>
                    <span className="text-base font-mono font-bold text-gray-800">
                      {trackedExchange._id}
                    </span>
                  </div>
                  <div>{getStatusBadge(trackedExchange.status)}</div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6 text-xs">
                  <div>
                    <span className="text-gray-500 block mb-0.5">Order Number</span>
                    <span className="font-semibold text-gray-800">
                      #{trackedExchange.orderNumber || trackedExchange.orderId}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block mb-0.5">Customer Name</span>
                    <span className="font-semibold text-gray-800">{trackedExchange.customerName}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block mb-0.5">Date Requested</span>
                    <span className="font-semibold text-gray-800">
                      {new Date(trackedExchange.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block mb-0.5">Product</span>
                    <span className="font-semibold text-gray-800">
                      {trackedExchange.product?.name || "Silk Saree"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block mb-0.5">Reason</span>
                    <span className="font-semibold text-gray-800">{trackedExchange.reason}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block mb-0.5">Exchange Stage</span>
                    <span className="font-semibold text-[#6D1734]">
                      {trackedExchange.exchangeOrderStatus || "Under Admin Verification"}
                    </span>
                  </div>
                </div>

                {/* Admin Decision / Notes */}
                {trackedExchange.adminDecision?.notes && (
                  <div className="bg-white rounded-lg p-4 border border-gray-200 text-xs mb-6">
                    <span className="font-bold text-gray-800 block mb-1">
                      Store Decision / Inspection Notes:
                    </span>
                    <p className="text-gray-600">{trackedExchange.adminDecision.notes}</p>
                    {trackedExchange.adminDecision.decidedAt && (
                      <span className="text-[10px] text-gray-400 block mt-1">
                        Reviewed on {new Date(trackedExchange.adminDecision.decidedAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                )}

                {/* Timeline */}
                <div className="bg-white rounded-lg p-5 border border-gray-200">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-4">
                    Exchange Progress Lifecycle
                  </h4>
                  <div className="space-y-4 text-xs">
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                        <FiCheckCircle size={12} />
                      </div>
                      <div>
                        <span className="font-bold text-gray-800">Request Submitted with Proof</span>
                        <p className="text-gray-500">
                          {new Date(trackedExchange.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          trackedExchange.status !== "PENDING"
                            ? trackedExchange.status === "REJECTED"
                              ? "bg-red-500 text-white"
                              : "bg-green-500 text-white"
                            : "bg-gray-200 text-gray-400"
                        }`}
                      >
                        {trackedExchange.status === "REJECTED" ? (
                          <FiXCircle size={12} />
                        ) : (
                          <FiCheckCircle size={12} />
                        )}
                      </div>
                      <div>
                        <span className="font-bold text-gray-800">
                          {trackedExchange.status === "REJECTED"
                            ? "Request Declined by Store Team"
                            : "Quality Assurance & Approval"}
                        </span>
                        <p className="text-gray-500">
                          {trackedExchange.adminDecision?.decidedAt
                            ? new Date(trackedExchange.adminDecision.decidedAt).toLocaleString()
                            : "Pending verification of unboxing proof"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          ["PRODUCT_RECEIVED", "REPLACEMENT_DISPATCHED", "COMPLETED"].includes(
                            trackedExchange.status
                          )
                            ? "bg-green-500 text-white"
                            : "bg-gray-200 text-gray-400"
                        }`}
                      >
                        <FiTruck size={12} />
                      </div>
                      <div>
                        <span className="font-bold text-gray-800">
                          Item Returned to Vellore Facility
                        </span>
                        <p className="text-gray-500">
                          Physical inspection of tags and silk condition
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          ["REPLACEMENT_DISPATCHED", "COMPLETED"].includes(trackedExchange.status)
                            ? "bg-green-500 text-white"
                            : "bg-gray-200 text-gray-400"
                        }`}
                      >
                        <FiCheckCircle size={12} />
                      </div>
                      <div>
                        <span className="font-bold text-gray-800">
                          Fresh Replacement Dispatched
                        </span>
                        <p className="text-gray-500">
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
