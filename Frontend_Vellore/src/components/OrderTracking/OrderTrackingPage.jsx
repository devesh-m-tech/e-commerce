import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  FiSearch,
  FiClock,
  FiPackage,
  FiTruck,
  FiCheckCircle,
  FiAlertCircle,
  FiMapPin,
  FiCalendar,
  FiRefreshCw,
  FiArrowRight,
} from "react-icons/fi";
import { orderApi } from "../../APi/orderApi";
import { Sparkles } from "lucide-react";
import "./OrderTrackingPage.css";

const STAGES = [
  { key: "ORDER PLACED", label: "Order Placed", icon: FiClock, desc: "We have received your order." },
  { key: "CONFIRMED", label: "Packed & Verified", icon: FiPackage, desc: "Saree inspected, packed, and invoice generated." },
  { key: "DISPATCHED", label: "Dispatched & In Transit", icon: FiTruck, desc: "Handed over to our courier partner." },
  { key: "DELIVERED", label: "Delivered", icon: FiCheckCircle, desc: "Delivered safely to your destination address." },
];

const getStageIndex = (status) => {
  const s = (status || "").toUpperCase();
  if (s === "DELIVERED") return 3;
  if (["DISPATCHED", "SHIPPED", "OUT FOR DELIVERY"].includes(s)) return 2;
  if (["CONFIRMED", "PACKED"].includes(s)) return 1;
  return 0;
};

const OrderTrackingPage = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialOrderId = searchParams.get("orderId") || searchParams.get("id") || "";

  const [orderIdentifier, setOrderIdentifier] = useState(initialOrderId);
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  const handleTrack = async (e) => {
    if (e) e.preventDefault();
    if (!orderIdentifier.trim()) {
      setError("Please enter your Order ID or Order Number");
      return;
    }

    setLoading(true);
    setError("");
    setOrder(null);

    try {
      const res = await orderApi.trackPublicOrder(orderIdentifier.trim(), phone.trim());
      if (res.success && res.order) {
        setOrder(res.order);
      } else {
        setError(res.message || "No order found matching your search. Please check your order number.");
      }
    } catch (err) {
      setError(err.message || "Could not track order. Please verify your order number and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrderId) {
      handleTrack();
    }
  }, [initialOrderId]);

  const currentStageIndex = order ? getStageIndex(order.orderStatus) : 0;
  const isCancelled = order?.orderStatus === "CANCELLED";

  return (
    <div className="sds-tracking-page">
      <main className="sds-tracking-container">
        {/* Header */}
        <div className="sds-tracking-header">
          <div className="sds-tracking-eyebrow">
            <Sparkles size={13} />
            <span>Live Dispatch Status</span>
          </div>
          <h1>Track Your Order</h1>
          <p>
            Check the real-time shipping status and estimated delivery date of your Shri Deepaalaya Silks order.
          </p>
        </div>

        {/* Search Card */}
        <div className="sds-tracking-search-card">
          <form onSubmit={handleTrack} className="sds-tracking-form-grid">
            <div className="sds-tracking-field">
              <label>
                Order ID / Number <span>*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. SDS-2024-XXXX or Order ID"
                value={orderIdentifier}
                onChange={(e) => setOrderIdentifier(e.target.value)}
              />
            </div>
            <div className="sds-tracking-field">
              <label>Registered Mobile (Optional)</label>
              <input
                type="tel"
                placeholder="10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div>
              <button
                type="submit"
                disabled={loading}
                className="sds-tracking-submit-btn"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <FiSearch size={15} /> Track
                  </>
                )}
              </button>
            </div>
          </form>

          {error && (
            <div className="sds-tracking-error">
              <FiAlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Tracking Results */}
        {order && (
          <div className="sds-tracking-result-card">
            {/* Top Bar */}
            <div className="sds-tracking-ref-banner">
              <div>
                <span className="sds-tracking-ref-title">
                  Order Reference
                </span>
                <span className="sds-tracking-order-num">
                  #{order.orderNumber || order._id}
                </span>
                {order.invoiceNumber && (
                  <span className="sds-tracking-invoice">
                    Invoice: {order.invoiceNumber}
                  </span>
                )}
              </div>
              <div>
                <span className="sds-tracking-ref-title">
                  Current Status
                </span>
                <span className="sds-tracking-status-pill">
                  {order.orderStatus}
                </span>
              </div>
            </div>

            {/* Estimated Delivery & Shipping Info */}
            <div className="sds-tracking-info-strip">
              <div className="sds-tracking-info-item">
                <div className="sds-tracking-info-icon calendar">
                  <FiCalendar size={18} />
                </div>
                <div>
                  <span className="sds-tracking-info-label">Estimated Delivery</span>
                  <span className="sds-tracking-info-val">
                    {order.deliveryDate
                      ? new Date(order.deliveryDate).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : order.estimatedDeliveryDate
                      ? new Date(order.estimatedDeliveryDate).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "Within 4-7 business days"}
                  </span>
                </div>
              </div>

              <div className="sds-tracking-info-item">
                <div className="sds-tracking-info-icon truck">
                  <FiTruck size={18} />
                </div>
                <div>
                  <span className="sds-tracking-info-label">Courier Partner</span>
                  <span className="sds-tracking-info-val">
                    {order.shippingCarrier || "Express Logistics"}
                  </span>
                  {order.trackingNumber && (
                    <span className="text-xs text-gray-500 block font-mono">
                      AWB: {order.trackingNumber}
                    </span>
                  )}
                </div>
              </div>

              <div className="sds-tracking-info-item">
                <div className="sds-tracking-info-icon map">
                  <FiMapPin size={18} />
                </div>
                <div>
                  <span className="sds-tracking-info-label">Delivery Destination</span>
                  <span className="sds-tracking-info-val">
                    {order.shippingAddress?.city || "Destination"},{" "}
                    {order.shippingAddress?.state || "India"} - {order.shippingAddress?.pincode || ""}
                  </span>
                </div>
              </div>
            </div>

            {/* Stepper Timeline */}
            {!isCancelled ? (
              <div className="sds-tracking-stepper-wrap">
                <h3 className="sds-tracking-stepper-title">
                  Shipment Progress
                </h3>
                <div className="sds-tracking-stepper-track">
                  <div className="sds-stepper-progress-bar">
                    <div
                      className="sds-stepper-progress-fill"
                      style={{ width: `${(currentStageIndex / (STAGES.length - 1)) * 100}%` }}
                    />
                  </div>

                  {STAGES.map((stage, idx) => {
                    const Icon = stage.icon;
                    const isDone = idx <= currentStageIndex;
                    const isCurrent = idx === currentStageIndex;

                    return (
                      <div
                        key={idx}
                        className={`sds-stepper-node ${isDone ? "done" : ""} ${isCurrent ? "current" : ""}`}
                      >
                        <div className="sds-stepper-circle">
                          <Icon size={18} />
                        </div>
                        <div>
                          <span className="sds-stepper-label block">
                            {stage.label}
                          </span>
                          <span className="sds-stepper-desc block">
                            {stage.desc}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-red-50/50">
                <FiAlertCircle size={32} className="text-red-500 mx-auto mb-2" />
                <h3 className="text-base font-bold text-red-800">Order Cancelled</h3>
                <p className="text-xs text-red-600 mt-1">
                  This order was cancelled. If you believe this is an error, please reach out to our support team.
                </p>
              </div>
            )}

            {/* Order Items Snapshot */}
            <div className="sds-tracking-items-box">
              <h4 className="sds-tracking-items-title">
                Items in This Shipment
              </h4>
              <div className="sds-tracking-items-list">
                {(order.items || []).map((item, idx) => (
                  <div key={idx} className="sds-tracking-item-row">
                    <div className="sds-tracking-item-left">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="sds-tracking-item-img"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      )}
                      <div>
                        <span className="sds-tracking-item-name">{item.name}</span>
                        <span className="sds-tracking-item-qty">Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <span className="sds-tracking-item-price">
                      ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              <div className="sds-tracking-footer-bar">
                <div className="sds-tracking-total-paid">
                  Total Paid: <strong>₹{(order.finalAmount || order.totalAmount || 0).toLocaleString("en-IN")}</strong> via {order.paymentMethod || "Online"}
                </div>
                {order.orderStatus === "DELIVERED" && (
                  <Link
                    to={`/exchange-request?orderId=${order._id}&orderNumber=${order.orderNumber || order._id}`}
                    className="sds-tracking-exchange-btn"
                  >
                    <FiRefreshCw size={13} /> Request Item Exchange
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default OrderTrackingPage;
