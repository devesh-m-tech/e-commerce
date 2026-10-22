import { FaTimes, FaExclamationTriangle } from "react-icons/fa";

const CancelOrderModal = ({
  isOpen,
  order,
  onClose,
  onConfirm,
  isLoading,
}) => {
  if (!isOpen || !order) return null;

  return (
    <div className="profile-modal-overlay" role="dialog" aria-modal="true">
      <div className="profile-modal-card confirm-modal-card">
        <button
          type="button"
          className="profile-modal-close-btn"
          onClick={onClose}
          aria-label="Close"
        >
          <FaTimes />
        </button>

        <div className="confirm-modal-icon warning">
          <FaExclamationTriangle />
        </div>

        <h3 className="confirm-modal-title">Cancel Order?</h3>
        <p className="confirm-modal-message">
          Are you sure you want to cancel order{" "}
          <strong>#{order._id?.slice(-8).toUpperCase()}</strong>? This action cannot be
          undone. Any amount paid will be refunded according to our refund policy.
        </p>

        <div className="profile-modal-actions">
          <button
            type="button"
            className="profile-btn profile-btn-secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            Keep Order
          </button>
          <button
            type="button"
            className="profile-btn profile-btn-danger"
            onClick={() => onConfirm(order._id)}
            disabled={isLoading}
          >
            {isLoading ? "Cancelling..." : "Yes, Cancel Order"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelOrderModal;
