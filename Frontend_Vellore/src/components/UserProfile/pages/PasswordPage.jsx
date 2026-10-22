import { useState } from "react";
import { FaLock, FaKey, FaShieldAlt } from "react-icons/fa";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { toast } from "react-toastify";
import { userApi } from "../../../APi/userApi";

const PasswordPage = () => {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showVisibility, setShowVisibility] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleVisibility = (field) => {
    setShowVisibility((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleValidateAndPrompt = (e) => {
    e.preventDefault();
    if (!formData.currentPassword) {
      toast.error("Please enter your current password");
      return;
    }
    if (formData.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long");
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }
    setShowConfirmModal(true);
  };

  const handlePasswordSubmit = async () => {
    setShowConfirmModal(false);
    try {
      setIsSubmitting(true);
      await userApi.changePassword({
        oldPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      toast.success("Password changed successfully");
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      toast.error(err.message || "Failed to change password. Please verify current password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="profile-page-view password-view">
      {/* Header */}
      <div className="profile-page-header">
        <div>
          <h1 className="profile-page-title">Change Password</h1>
          <p className="profile-page-desc">
            Keep your account secure with a strong, unique password
          </p>
        </div>
      </div>

      <div className="password-card-container">
        <form onSubmit={handleValidateAndPrompt} className="password-form-card">
          {/* Current Password */}
          <div className="profile-field-group">
            <label className="profile-field-label" htmlFor="currentPassword">
              Current Password *
            </label>
            <div className="password-input-wrapper">
              <input
                id="currentPassword"
                type={showVisibility.current ? "text" : "password"}
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                placeholder="Enter current password"
                className="profile-input editing"
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => toggleVisibility("current")}
                aria-label={showVisibility.current ? "Hide password" : "Show password"}
              >
                {showVisibility.current ? <IoEyeOffOutline /> : <IoEyeOutline />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="profile-field-group">
            <label className="profile-field-label" htmlFor="newPassword">
              New Password *
            </label>
            <div className="password-input-wrapper">
              <input
                id="newPassword"
                type={showVisibility.new ? "text" : "password"}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Minimum 6 characters"
                className="profile-input editing"
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => toggleVisibility("new")}
                aria-label={showVisibility.new ? "Hide password" : "Show password"}
              >
                {showVisibility.new ? <IoEyeOffOutline /> : <IoEyeOutline />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="profile-field-group">
            <label className="profile-field-label" htmlFor="confirmPassword">
              Confirm New Password *
            </label>
            <div className="password-input-wrapper">
              <input
                id="confirmPassword"
                type={showVisibility.confirm ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat new password"
                className="profile-input editing"
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => toggleVisibility("confirm")}
                aria-label={showVisibility.confirm ? "Hide password" : "Show password"}
              >
                {showVisibility.confirm ? <IoEyeOffOutline /> : <IoEyeOutline />}
              </button>
            </div>
          </div>

          <div className="password-form-actions">
            <button
              type="submit"
              className="profile-btn profile-btn-primary"
              disabled={isSubmitting}
            >
              <FaKey />
              <span>Update Password</span>
            </button>
          </div>
        </form>

        {/* Password Security Advice */}
        <div className="password-advice-box">
          <FaShieldAlt className="advice-icon" />
          <h4 className="advice-title">Password Security Recommendations</h4>
          <ul className="advice-list">
            <li>Use at least 8 characters with a mix of letters, numbers, and symbols.</li>
            <li>Avoid using birthdays, names, or common words.</li>
            <li>Never share your account credentials with anyone.</li>
          </ul>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="profile-modal-overlay" role="dialog" aria-modal="true">
          <div className="profile-modal-card confirm-modal-card">
            <div className="confirm-modal-icon luxury">
              <FaLock />
            </div>
            <h3 className="confirm-modal-title">Confirm Password Update</h3>
            <p className="confirm-modal-message">
              Are you sure you want to update your password now? You may need to use your new
              password on your next sign-in.
            </p>
            <div className="profile-modal-actions">
              <button
                type="button"
                className="profile-btn profile-btn-secondary"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="profile-btn profile-btn-primary"
                onClick={handlePasswordSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Updating..." : "Yes, Update Password"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PasswordPage;
