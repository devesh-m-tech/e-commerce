import { FaSignOutAlt, FaTimes } from "react-icons/fa";

const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

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

        <div className="confirm-modal-icon luxury">
          <FaSignOutAlt />
        </div>

        <h3 className="confirm-modal-title">Sign Out of Your Account?</h3>
        <p className="confirm-modal-message">
          Are you sure you want to log out? You can sign back in anytime to access your
          orders, wishlist, and wallet balance.
        </p>

        <div className="profile-modal-actions">
          <button
            type="button"
            className="profile-btn profile-btn-secondary"
            onClick={onClose}
          >
            Stay Signed In
          </button>
          <button
            type="button"
            className="profile-btn profile-btn-primary"
            onClick={onConfirm}
          >
            Yes, Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;
