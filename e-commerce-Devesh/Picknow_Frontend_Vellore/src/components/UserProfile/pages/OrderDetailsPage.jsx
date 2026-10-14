import { Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiDownload,
  FiCheckCircle,
  FiPackage,
  FiTruck,
  FiClock,
  FiStar,
  FiXCircle,
} from "react-icons/fi";
import {
  formatProfessionalDate,
  numberFormat,
  getVoucherAmount,
  getDisplayPaymentMethod,
  getDisplayPaymentStatus,
  getStageDate,
  generateAndPrintInvoice,
} from "../utils/invoiceGenerator";

const OrderDetailsPage = ({
  order,
  onBack,
  onInitiateCancel,
  onOpenReview,
}) => {
  if (!order) return null;

  const isCancelled = order.orderStatus === "CANCELLED";
  const isDelivered = order.orderStatus === "DELIVERED";
  const canCancel = order.orderStatus === "ORDER PLACED";

  const items = order.items || [];
  const shipping = order.shippingAddress || {};

  // Calculate pricing
  const sellingPrice = items.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
    0
  );
  const voucherDiscount = getVoucherAmount(order);

  // Tracking steps
  const trackingSteps = [
    {
      key: "ORDER PLACED",
      label: "Order Placed",
      icon: FiClock,
      date: getStageDate(order, "ORDER PLACED"),
      isCompleted: true,
    },
    {
      key: "PACKED",
      label: "Packed",
      icon: FiPackage,
      date: getStageDate(order, "PACKED"),
      isCompleted: ["PACKED", "CONFIRMED", "SHIPPED", "DISPATCHED", "DELIVERED"].includes(
        order.orderStatus
      ),
    },
    {
      key: "SHIPPED",
      label: "Shipped",
      icon: FiTruck,
      date: getStageDate(order, "DISPATCHED"),
      isCompleted: ["SHIPPED", "DISPATCHED", "DELIVERED"].includes(order.orderStatus),
    },
    {
      key: "DELIVERED",
      label: "Delivered",
      icon: FiCheckCircle,
      date: getStageDate(order, "DELIVERED"),
      isCompleted: isDelivered,
    },
  ];

  return (
    <div className="profile-page-view order-details-view">
      {/* Top Back Nav */}
      <div className="order-details-top-bar">
        <button type="button" className="profile-back-link" onClick={onBack}>
          <FiArrowLeft />
          <span>Back to My Orders</span>
        </button>

        <button
          type="button"
          className="profile-btn profile-btn-outline invoice-btn"
          onClick={() => generateAndPrintInvoice(order)}
          title="Print or Download Tax Invoice"
        >
          <FiDownload />
          <span>Download Invoice</span>
        </button>
      </div>

      {/* Main Order Header Card */}
      <div className="order-details-hero-card">
        <div className="hero-meta-left">
          <span className="hero-order-id">
            ORDER #{order._id?.toUpperCase()}
          </span>
          <span className="hero-order-date">
            Placed on {formatProfessionalDate(order.createdAt)}
          </span>
        </div>
        <div className="hero-meta-right">
          <span
            className={`order-status-pill ${
              isCancelled
                ? "cancelled"
                : isDelivered
                ? "delivered"
                : "in-transit"
            }`}
          >
            {isCancelled ? "Cancelled" : order.orderStatus || "Confirmed"}
          </span>
        </div>
      </div>

      {/* Delivery Tracking Bar */}
      <div className="tracking-section-card">
        <h3 className="section-subtitle">Delivery Status</h3>
        {isCancelled ? (
          <div className="tracking-cancelled-alert">
            <FiXCircle className="cancelled-icon" />
            <div>
              <h4>Order Cancelled</h4>
              <p>
                This order was cancelled on{" "}
                {formatProfessionalDate(getStageDate(order, "CANCELLED") || order.updatedAt)}.
              </p>
            </div>
          </div>
        ) : (
          <div className="order-tracking-stepper">
            {trackingSteps.map((step, idx) => {
              const StepIcon = step.icon;
              return (
                <div
                  key={step.key}
                  className={`tracking-step ${step.isCompleted ? "completed" : "pending"}`}
                >
                  <div className="step-node">
                    <StepIcon />
                  </div>
                  <div className="step-info">
                    <span className="step-title">{step.label}</span>
                    <span className="step-date">
                      {step.isCompleted && step.date
                        ? formatProfessionalDate(step.date)
                        : step.isCompleted
                        ? "Completed"
                        : "Expected soon"}
                    </span>
                  </div>
                  {idx < trackingSteps.length - 1 && <div className="step-connector" />}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Grid: Left Items + Right Delivery & Payment */}
      <div className="order-details-grid">
        {/* Left: Products List */}
        <div className="order-products-column">
          <div className="details-card">
            <h3 className="section-subtitle">
              Order Items ({items.length})
            </h3>
            <div className="order-items-detailed-list">
              {items.map((item, idx) => {
                const product = item.product || {};
                const img = Array.isArray(product.pImage)
                  ? product.pImage[0]
                  : typeof product.pImage === "string"
                  ? product.pImage.split(",")[0]
                  : "https://via.placeholder.com/100?text=Product";

                const canReview = isDelivered && !item.reviewed;

                return (
                  <div key={idx} className="order-item-detailed-card">
                    <img
                      src={img}
                      alt={product.pName || "Product"}
                      className="item-detailed-thumb"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/100?text=Product";
                      }}
                    />
                    <div className="item-detailed-body">
                      <Link
                        to={product._id ? `/product/${product._id}` : "#"}
                        className="item-detailed-name"
                      >
                        {product.pName || "Product Unavailable"}
                      </Link>
                      {product.pBrand && (
                        <span className="item-detailed-brand">{product.pBrand}</span>
                      )}
                      {item.variantValue && (
                        <span className="item-detailed-variant">
                          Variant: {item.variantValue}
                        </span>
                      )}
                      <div className="item-detailed-price-row">
                        <span className="item-qty">Qty: {item.quantity || 1}</span>
                        <span className="item-price">{numberFormat(item.price)}</span>
                      </div>

                      {canReview && (
                        <button
                          type="button"
                          className="profile-btn profile-btn-sm profile-btn-outline review-btn"
                          onClick={() => onOpenReview(item)}
                        >
                          <FiStar />
                          <span>Rate & Review</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Address & Price Summary */}
        <div className="order-summary-column">
          {/* Shipping Address */}
          <div className="details-card address-card">
            <h3 className="section-subtitle">Delivery Address</h3>
            <div className="address-snapshot">
              <h4 className="recipient-name">{shipping.name || "Recipient"}</h4>
              <p className="recipient-address">
                {shipping.address || shipping.street || "Address line unavailable"}
              </p>
              <p className="recipient-locality">
                {shipping.city ? `${shipping.city}, ` : ""}
                {shipping.state ? `${shipping.state} ` : ""}
                {shipping.pincode ? `- ${shipping.pincode}` : ""}
              </p>
              <p className="recipient-phone">
                Phone: {shipping.mobile || shipping.contact || "N/A"}
              </p>
            </div>
          </div>

          {/* Payment & Charges Breakdown */}
          <div className="details-card pricing-card">
            <h3 className="section-subtitle">Payment Breakdown</h3>
            <div className="pricing-rows-list">
              <div className="pricing-row">
                <span>Items Subtotal</span>
                <span>{numberFormat(sellingPrice)}</span>
              </div>
              <div className="pricing-row">
                <span>Platform Convenience</span>
                <span>{numberFormat(order.platformFee || 0)}</span>
              </div>
              <div className="pricing-row">
                <span>Shipping Charges</span>
                <span>
                  {order.shippingCharges && order.shippingCharges > 0
                    ? numberFormat(order.shippingCharges)
                    : "FREE"}
                </span>
              </div>
              {voucherDiscount > 0 && (
                <div className="pricing-row discount-row">
                  <span>Wallet / Voucher Savings</span>
                  <span>-{numberFormat(voucherDiscount)}</span>
                </div>
              )}
              <div className="pricing-row total-row">
                <span>Total Amount Paid</span>
                <span className="final-highlight">
                  {numberFormat(order.finalAmount || 0)}
                </span>
              </div>
            </div>

            <div className="payment-meta-badge">
              <span className="method-label">Payment Method:</span>
              <span className="method-value">
                {getDisplayPaymentMethod(order)} ({getDisplayPaymentStatus(order)})
              </span>
            </div>

            {/* Cancel Order Action */}
            {canCancel && (
              <div className="cancel-order-action-bar">
                <button
                  type="button"
                  className="profile-btn profile-btn-danger w-full"
                  onClick={() => onInitiateCancel(order)}
                >
                  Cancel Order
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
