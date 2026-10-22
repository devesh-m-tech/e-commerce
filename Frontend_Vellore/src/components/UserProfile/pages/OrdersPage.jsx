import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiChevronRight,
  FiClock,
  FiPackage,
  FiArrowRight,
} from "react-icons/fi";
import { FaBoxOpen, FaCheckCircle, FaTimesCircle, FaTruck } from "react-icons/fa";
import { formatProfessionalDate, numberFormat } from "../utils/invoiceGenerator";

const OrdersPage = ({ orders = [], isLoading = false, onViewOrder }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [timeFilter, setTimeFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");

  // Filtering logic
  const filteredOrders = useMemo(() => {
    let result = [...orders];

    // Search
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (o) =>
          o._id?.toLowerCase().includes(q) ||
          o.items?.some((i) => i.product?.pName?.toLowerCase().includes(q))
      );
    }

    // Status filter
    if (statusFilter !== "All") {
      if (statusFilter === "On the way") {
        result = result.filter((o) =>
          ["ORDER PLACED", "CONFIRMED", "SHIPPED", "DISPATCHED", "PACKED"].includes(
            o.orderStatus
          )
        );
      } else if (statusFilter === "Returned") {
        result = result.filter((o) => o.returnedItems && o.returnedItems.length > 0);
      } else {
        result = result.filter(
          (o) => o.orderStatus?.toUpperCase() === statusFilter.toUpperCase()
        );
      }
    }

    // Time filter
    if (timeFilter !== "all") {
      const now = new Date();
      const currentYear = now.getFullYear();
      result = result.filter((o) => {
        const orderDate = new Date(o.createdAt);
        const diffDays = Math.floor((now - orderDate) / (1000 * 60 * 60 * 24));
        switch (timeFilter) {
          case "last7days":
            return diffDays <= 7;
          case "last30days":
            return diffDays <= 30;
          case "last3months":
            return diffDays <= 90;
          case "last6months":
            return diffDays <= 180;
          case "thisyear":
            return orderDate.getFullYear() === currentYear;
          case "lastyear":
            return orderDate.getFullYear() === currentYear - 1;
          default:
            return true;
        }
      });
    }

    // Price filter
    if (priceFilter !== "all") {
      result = result.filter((o) => {
        const amt = o.finalAmount || 0;
        switch (priceFilter) {
          case "under1000":
            return amt < 1000;
          case "1000to5000":
            return amt >= 1000 && amt < 5000;
          case "5000to10000":
            return amt >= 5000 && amt < 10000;
          case "above10000":
            return amt >= 10000;
          default:
            return true;
        }
      });
    }

    return result;
  }, [orders, searchTerm, statusFilter, timeFilter, priceFilter]);

  const getStatusBadge = (order) => {
    if (order.returnedItems && order.returnedItems.length > 0) {
      return {
        label: "Returned",
        className: "status-badge returned",
        icon: <FaBoxOpen />,
      };
    }
    const status = (order.orderStatus || "ORDER PLACED").toUpperCase();
    if (status === "DELIVERED") {
      return {
        label: "Delivered",
        className: "status-badge delivered",
        icon: <FaCheckCircle />,
      };
    }
    if (status === "CANCELLED") {
      return {
        label: "Cancelled",
        className: "status-badge cancelled",
        icon: <FaTimesCircle />,
      };
    }
    return {
      label: status === "CONFIRMED" ? "Confirmed" : "In Transit",
      className: "status-badge in-transit",
      icon: <FaTruck />,
    };
  };

  return (
    <div className="profile-page-view orders-view">
      {/* Header */}
      <div className="profile-page-header">
        <div>
          <h1 className="profile-page-title">My Orders</h1>
          <p className="profile-page-desc">
            Track, review, or download invoices for your purchases
          </p>
        </div>
        <button
          type="button"
          className="profile-btn profile-btn-outline"
          onClick={() => navigate("/products")}
        >
          <span>Continue Shopping</span>
          <FiArrowRight />
        </button>
      </div>

      {/* Filters Bar */}
      {orders.length > 0 && (
        <div className="orders-filter-bar">
          <div className="orders-search-box">
            <FiSearch className="search-box-icon" />
            <input
              type="text"
              placeholder="Search by order ID or product name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="orders-search-input"
            />
          </div>

          <div className="orders-dropdowns-row">
            {/* Status Select */}
            <div className="orders-filter-select-wrap">
              <span className="filter-select-label">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="profile-select"
              >
                <option value="All">All Orders</option>
                <option value="On the way">On The Way</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Returned">Returned</option>
              </select>
            </div>

            {/* Time Select */}
            <div className="orders-filter-select-wrap">
              <span className="filter-select-label">Period:</span>
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="profile-select"
              >
                <option value="all">Anytime</option>
                <option value="last30days">Last 30 Days</option>
                <option value="last6months">Last 6 Months</option>
                <option value="thisyear">This Year</option>
                <option value="lastyear">Last Year</option>
              </select>
            </div>

            {/* Price Select */}
            <div className="orders-filter-select-wrap">
              <span className="filter-select-label">Amount:</span>
              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
                className="profile-select"
              >
                <option value="all">All Amounts</option>
                <option value="under1000">Under ₹1,000</option>
                <option value="1000to5000">₹1,000 - ₹5,000</option>
                <option value="5000to10000">₹5,000 - ₹10,000</option>
                <option value="above10000">Above ₹10,000</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Orders List Content */}
      {isLoading ? (
        <div className="orders-skeleton-list">
          {[1, 2, 3].map((i) => (
            <div key={i} className="orders-skeleton-card" />
          ))}
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className="orders-cards-list">
          {filteredOrders.map((order) => {
            const badge = getStatusBadge(order);
            const items = order.items || [];
            const displayItems = items.slice(0, 3);
            const remainingCount = items.length - displayItems.length;

            return (
              <article
                key={order._id}
                className="order-card-modern"
                onClick={() => onViewOrder(order._id)}
              >
                {/* Card Top / Header */}
                <div className="order-card-header">
                  <div className="order-id-group">
                    <span className="order-id-tag">
                      ORDER #{order._id?.slice(-8).toUpperCase()}
                    </span>
                    <span className="order-date-tag">
                      <FiClock className="tag-icon" />
                      {formatProfessionalDate(order.createdAt)}
                    </span>
                  </div>
                  <div className={badge.className}>
                    {badge.icon}
                    <span>{badge.label}</span>
                  </div>
                </div>

                {/* Items Preview */}
                <div className="order-card-body">
                  <div className="order-items-preview-grid">
                    {displayItems.map((item, idx) => {
                      const img = Array.isArray(item.product?.pImage)
                        ? item.product.pImage[0]
                        : typeof item.product?.pImage === "string"
                        ? item.product.pImage.split(",")[0]
                        : "https://via.placeholder.com/80?text=Product";

                      return (
                        <div key={idx} className="order-item-thumb-row">
                          <img
                            src={img}
                            alt={item.product?.pName || "Product"}
                            className="order-item-thumb"
                            onError={(e) => {
                              e.target.src = "https://via.placeholder.com/80?text=Product";
                            }}
                          />
                          <div className="order-item-details">
                            <h4 className="order-item-title">
                              {item.product?.pName || "Product Name"}
                            </h4>
                            <div className="order-item-meta">
                              {item.variantValue && (
                                <span className="order-item-variant">
                                  {item.variantValue}
                                </span>
                              )}
                              <span className="order-item-qty">
                                Qty: {item.quantity || 1}
                              </span>
                              <span className="order-item-price">
                                {numberFormat(item.price)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {remainingCount > 0 && (
                      <div className="order-more-items-badge">
                        +{remainingCount} more product{remainingCount > 1 ? "s" : ""}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="order-card-footer">
                  <div className="order-total-block">
                    <span className="total-label">Total Amount</span>
                    <span className="total-amount">
                      {numberFormat(order.finalAmount || 0)}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="order-view-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewOrder(order._id);
                    }}
                  >
                    <span>View Details</span>
                    <FiChevronRight className="btn-icon" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="profile-empty-state">
          <div className="empty-state-icon">
            <FiPackage />
          </div>
          <h3 className="empty-state-title">
            {searchTerm || statusFilter !== "All"
              ? "No matching orders found"
              : "No orders placed yet"}
          </h3>
          <p className="empty-state-desc">
            {searchTerm || statusFilter !== "All"
              ? "Try adjusting your search keywords or filter options."
              : "Explore our signature collection of silk sarees and traditional weaves."}
          </p>
          <button
            type="button"
            className="profile-btn profile-btn-primary"
            onClick={() => navigate("/products")}
          >
            Start Shopping
          </button>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
