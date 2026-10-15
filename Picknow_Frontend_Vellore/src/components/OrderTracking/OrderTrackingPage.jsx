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
    <div className="min-h-screen bg-[#faf8f5] flex flex-col font-sans">
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-2">
            Track Your Order
          </h1>
          <p className="text-sm text-gray-600 max-w-lg mx-auto">
            Check the real-time shipping status and estimated delivery date of your Shri Deepaalaya Silks order.
          </p>
        </div>

        {/* Search Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <form onSubmit={handleTrack} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-6">
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                Order ID / Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. SDS-2024-XXXX or Order ID"
                value={orderIdentifier}
                onChange={(e) => setOrderIdentifier(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#6D1734] focus:border-[#6D1734] outline-none"
              />
            </div>
            <div className="sm:col-span-4">
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                Registered Mobile (Optional)
              </label>
              <input
                type="tel"
                placeholder="10-digit mobile"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#6D1734] focus:border-[#6D1734] outline-none"
              />
            </div>
            <div className="sm:col-span-2 flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#6D1734] hover:bg-[#571229] text-white font-medium rounded-lg text-sm transition-colors flex items-center justify-center gap-2 shadow"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <FiSearch /> Track
                  </>
                )}
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-4 p-3.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
              <FiAlertCircle className="shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Tracking Results */}
        {order && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Top Bar */}
            <div className="bg-[#6D1734] text-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs uppercase tracking-wider text-rose-200 block font-semibold">
                  Order Reference
                </span>
                <span className="text-lg font-mono font-bold">
                  #{order.orderNumber || order._id}
                </span>
                {order.invoiceNumber && (
                  <span className="text-xs text-rose-100 block">
                    Invoice: {order.invoiceNumber}
                  </span>
                )}
              </div>
              <div className="text-left sm:text-right">
                <span className="text-xs uppercase tracking-wider text-rose-200 block font-semibold">
                  Current Status
                </span>
                <span className="inline-block bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold uppercase mt-0.5">
                  {order.orderStatus}
                </span>
              </div>
            </div>

            {/* Estimated Delivery & Shipping Info */}
            <div className="p-6 border-b border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50/50">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-rose-100 text-[#6D1734] flex items-center justify-center shrink-0">
                  <FiCalendar size={16} />
                </div>
                <div>
                  <span className="text-xs text-gray-500 block font-medium">Estimated Delivery</span>
                  <span className="text-sm font-bold text-gray-800">
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

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
                  <FiTruck size={16} />
                </div>
                <div>
                  <span className="text-xs text-gray-500 block font-medium">Courier Partner</span>
                  <span className="text-sm font-bold text-gray-800">
                    {order.shippingCarrier || "Express Logistics"}
                  </span>
                  {order.trackingNumber && (
                    <span className="text-xs text-gray-500 block font-mono">
                      AWB: {order.trackingNumber}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <FiMapPin size={16} />
                </div>
                <div>
                  <span className="text-xs text-gray-500 block font-medium">Delivery Destination</span>
                  <span className="text-sm font-bold text-gray-800">
                    {order.shippingAddress?.city || "Destination"},{" "}
                    {order.shippingAddress?.state || "India"} - {order.shippingAddress?.pincode || ""}
                  </span>
                </div>
              </div>
            </div>

            {/* Stepper Timeline */}
            {!isCancelled ? (
              <div className="p-6 md:p-8">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-6">
                  Shipment Progress
                </h3>
                <div className="relative">
                  {/* Line connecting stages */}
                  <div className="hidden sm:block absolute top-5 left-8 right-8 h-0.5 bg-gray-200 -z-0">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${(currentStageIndex / (STAGES.length - 1)) * 100}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                    {STAGES.map((stage, idx) => {
                      const Icon = stage.icon;
                      const isDone = idx <= currentStageIndex;
                      const isCurrent = idx === currentStageIndex;

                      return (
                        <div key={idx} className="flex sm:flex-col items-center text-left sm:text-center gap-4 sm:gap-2 relative z-10">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold transition-colors ${
                              isDone
                                ? "bg-emerald-500 text-white shadow-md ring-4 ring-emerald-50"
                                : "bg-gray-100 text-gray-400 border border-gray-300"
                            }`}
                          >
                            <Icon size={18} />
                          </div>
                          <div>
                            <span
                              className={`text-xs block font-bold ${
                                isCurrent ? "text-[#6D1734]" : isDone ? "text-gray-800" : "text-gray-400"
                              }`}
                            >
                              {stage.label}
                            </span>
                            <span className="text-[11px] text-gray-500 block mt-0.5">
                              {stage.desc}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
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
            <div className="p-6 border-t border-gray-100 bg-gray-50/30">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">
                Items in This Shipment
              </h4>
              <div className="space-y-3">
                {(order.items || []).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs bg-white p-3 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-10 h-10 rounded object-cover border"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      )}
                      <div>
                        <span className="font-semibold text-gray-800 block">{item.name}</span>
                        <span className="text-gray-500">Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <span className="font-bold text-gray-900">
                      ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-200">
                <div className="text-xs text-gray-500">
                  Total Paid: <strong className="text-gray-900">₹{(order.finalAmount || order.totalAmount || 0).toLocaleString("en-IN")}</strong> via {order.paymentMethod || "Online"}
                </div>
                {order.orderStatus === "DELIVERED" && (
                  <Link
                    to={`/exchange-request?orderId=${order._id}&orderNumber=${order.orderNumber || order._id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-xs font-medium rounded-lg transition-colors"
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
