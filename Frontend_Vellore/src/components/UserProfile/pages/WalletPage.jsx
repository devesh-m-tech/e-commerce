import { useState, useEffect } from "react";
import {
  FaWallet,
  FaPlus,
  FaArrowDown,
  FaArrowUp,
  FaTimes,
  FaCoins,
  FaCheckCircle,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { userApi } from "../../../APi/userApi";
import { formatProfessionalDate, numberFormat } from "../utils/invoiceGenerator";

const WalletPage = () => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [modalData, setModalData] = useState({
    code: "",
    pass: "",
    amount: "500",
  });

  const fetchWallet = async () => {
    try {
      setIsLoading(true);
      const [balRes, txnRes] = await Promise.allSettled([
        userApi.getWalletBalance(),
        userApi.getWalletTransactions(),
      ]);

      if (balRes.status === "fulfilled" && balRes.value) {
        setBalance(balRes.value.walletBalance || 0);
      }
      if (txnRes.status === "fulfilled" && txnRes.value) {
        setTransactions(txnRes.value.data || []);
      }
    } catch (err) {
      console.error("Wallet load error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    const amt = parseFloat(modalData.amount);
    if (!amt || amt <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      setIsSubmitting(true);
      if (modalData.code && modalData.pass) {
        await userApi.addMoneyWithCodePass({
          code: modalData.code.trim(),
          pass: modalData.pass.trim(),
          amount: amt,
        });
        toast.success("Wallet credited with Code & Pass voucher");
      } else {
        await userApi.addMoneyToWallet(amt);
        toast.success(`₹${amt} added to Royal Silks Wallet successfully`);
      }
      setShowAddModal(false);
      setModalData({ code: "", pass: "", amount: "500" });
      fetchWallet();
    } catch (err) {
      toast.error(err.message || "Failed to add money to wallet");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTxnDescription = (txn) => {
    if (txn.orderId) {
      return txn.type === "credit"
        ? `Refund for Order #${txn.orderId.slice(-8).toUpperCase()}`
        : `Payment for Order #${txn.orderId.slice(-8).toUpperCase()}`;
    }
    if (txn.description) {
      return txn.description;
    }
    return txn.type === "credit" ? "Wallet Top-Up / Gift Credit" : "Store Purchase";
  };

  return (
    <div className="profile-page-view wallet-view">
      {/* Header */}
      <div className="profile-page-header">
        <div>
          <h1 className="profile-page-title">Royal Silks Wallet</h1>
          <p className="profile-page-desc">
            Use instant wallet credits for 1-click checkout and seamless order refunds
          </p>
        </div>
        <button
          type="button"
          className="profile-btn profile-btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          <FaPlus />
          <span>Add Money</span>
        </button>
      </div>

      {/* Luxury Balance Card */}
      <div className="wallet-hero-card">
        <div className="wallet-hero-shine" />
        <div className="wallet-hero-content">
          <div className="wallet-badge-row">
            <span className="wallet-brand-title">Shri Deepaalaya Silks</span>
            <div className="wallet-chip-icon">
              <FaCoins />
            </div>
          </div>

          <div className="wallet-balance-row">
            <span className="balance-label">Available Balance</span>
            <h2 className="balance-number">
              {isLoading ? "..." : numberFormat(balance)}
            </h2>
          </div>

          <div className="wallet-footer-row">
            <span className="wallet-type">Prepaid Store Wallet</span>
            <button
              type="button"
              className="wallet-quick-add-btn"
              onClick={() => setShowAddModal(true)}
            >
              <FaPlus /> Top-up Balance
            </button>
          </div>
        </div>
      </div>

      {/* Transaction History Section */}
      <div className="wallet-transactions-section">
        <h3 className="section-subtitle">Transaction History</h3>

        {isLoading ? (
          <div className="txn-skeleton-list">
            {[1, 2, 3].map((i) => (
              <div key={i} className="txn-skeleton-row" />
            ))}
          </div>
        ) : transactions.length > 0 ? (
          <div className="txn-cards-list">
            {transactions.map((txn, idx) => {
              const isCredit = txn.type === "credit";
              return (
                <div key={txn._id || idx} className={`txn-item-card ${txn.type}`}>
                  <div className={`txn-icon-node ${txn.type}`}>
                    {isCredit ? <FaArrowDown /> : <FaArrowUp />}
                  </div>

                  <div className="txn-info-meta">
                    <h4 className="txn-title">{getTxnDescription(txn)}</h4>
                    <div className="txn-sub-meta">
                      <span className="txn-id">
                        TXN#{txn._id ? txn._id.slice(-8).toUpperCase() : `00${idx + 1}`}
                      </span>
                      <span className="txn-dot">•</span>
                      <span className="txn-date">
                        {formatProfessionalDate(txn.createdAt || new Date())}
                      </span>
                    </div>
                  </div>

                  <div className="txn-amount-meta">
                    <span className={`txn-amount ${txn.type}`}>
                      {isCredit ? "+" : "−"}
                      {numberFormat(txn.amount)}
                    </span>
                    <span className="txn-status-pill">
                      <FaCheckCircle /> Completed
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="profile-empty-state">
            <div className="empty-state-icon">
              <FaWallet />
            </div>
            <h3 className="empty-state-title">No transactions yet</h3>
            <p className="empty-state-desc">
              Your wallet credits, gift card redemptions, and refund histories will appear here.
            </p>
          </div>
        )}
      </div>

      {/* Add Money Modal */}
      {showAddModal && (
        <div className="profile-modal-overlay" role="dialog" aria-modal="true">
          <div className="profile-modal-card wallet-modal-card">
            <div className="profile-modal-header">
              <div>
                <h3 className="profile-modal-title">Add Money to Wallet</h3>
                <p className="profile-modal-subtitle">
                  Choose a top-up amount or redeem with a voucher code
                </p>
              </div>
              <button
                type="button"
                className="profile-modal-close-btn"
                onClick={() => setShowAddModal(false)}
                aria-label="Close"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="wallet-modal-form">
              {/* Quick Amount Chips */}
              <div className="quick-amount-section">
                <label className="profile-field-label">Quick Amount</label>
                <div className="chips-grid">
                  {[250, 500, 1000, 2000, 5000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      className={`amount-chip ${
                        Number(modalData.amount) === amt ? "active" : ""
                      }`}
                      onClick={() =>
                        setModalData((prev) => ({ ...prev, amount: String(amt) }))
                      }
                    >
                      ₹{amt.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount input */}
              <div className="profile-field-group">
                <label className="profile-field-label" htmlFor="custom-amount">
                  Custom Top-up Amount (₹) *
                </label>
                <input
                  id="custom-amount"
                  type="number"
                  min="1"
                  value={modalData.amount}
                  onChange={(e) =>
                    setModalData((prev) => ({ ...prev, amount: e.target.value }))
                  }
                  placeholder="Enter amount"
                  className="profile-input editing"
                  required
                />
              </div>

              {/* Optional Code & Pass */}
              <div className="voucher-expand-box">
                <span className="voucher-box-title">Have a Gift Voucher or Code?</span>
                <div className="form-double-grid">
                  <div className="profile-field-group">
                    <label className="profile-field-label" htmlFor="voucher-code">
                      Voucher Code (Optional)
                    </label>
                    <input
                      id="voucher-code"
                      type="text"
                      value={modalData.code}
                      onChange={(e) =>
                        setModalData((prev) => ({ ...prev, code: e.target.value }))
                      }
                      placeholder="e.g. SILK2026"
                      className="profile-input editing"
                    />
                  </div>
                  <div className="profile-field-group">
                    <label className="profile-field-label" htmlFor="voucher-pass">
                      Voucher Passcode (Optional)
                    </label>
                    <input
                      id="voucher-pass"
                      type="password"
                      value={modalData.pass}
                      onChange={(e) =>
                        setModalData((prev) => ({ ...prev, pass: e.target.value }))
                      }
                      placeholder="Passcode"
                      className="profile-input editing"
                    />
                  </div>
                </div>
              </div>

              <div className="profile-modal-actions">
                <button
                  type="button"
                  className="profile-btn profile-btn-secondary"
                  onClick={() => setShowAddModal(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="profile-btn profile-btn-primary"
                  disabled={isSubmitting || !modalData.amount}
                >
                  {isSubmitting ? "Processing..." : `Add ₹${modalData.amount || 0}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletPage;
