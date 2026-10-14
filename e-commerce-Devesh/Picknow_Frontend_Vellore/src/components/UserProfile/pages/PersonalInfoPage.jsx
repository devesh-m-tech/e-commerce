import { useState, useEffect } from "react";
import { FaUser, FaEnvelope, FaPhone, FaEdit, FaCheck, FaTimes, FaShieldAlt } from "react-icons/fa";
import { toast } from "react-toastify";
import { userApi } from "../../../APi/userApi";

const PersonalInfoPage = ({ user, onUserUpdated }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    contact: user?.contact || "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Sync if prop updates
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        contact: user.contact || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancelEdit = () => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      contact: user?.contact || "",
    });
    setIsEditing(false);
  };

  const handleSaveSubmit = async () => {
    setShowConfirmModal(false);
    if (!formData.name?.trim()) {
      toast.error("Please enter your name");
      return;
    }
    try {
      setIsSaving(true);
      const res = await userApi.updateProfile(formData);
      const updatedUser = res.user || { ...user, ...formData };
      if (onUserUpdated) onUserUpdated(updatedUser);
      toast.success("Profile details updated successfully");
      setIsEditing(false);
    } catch (err) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="profile-page-view personal-info-view">
      <div className="profile-page-header">
        <div>
          <h1 className="profile-page-title">Personal Information</h1>
          <p className="profile-page-desc">
            Manage your personal details and contact credentials
          </p>
        </div>
        {!isEditing ? (
          <button
            type="button"
            className="profile-btn profile-btn-outline"
            onClick={() => setIsEditing(true)}
          >
            <FaEdit />
            <span>Edit Profile</span>
          </button>
        ) : (
          <button
            type="button"
            className="profile-btn profile-btn-secondary"
            onClick={handleCancelEdit}
          >
            <FaTimes />
            <span>Cancel</span>
          </button>
        )}
      </div>

      <div className="personal-info-card">
        <div className="personal-info-grid">
          {/* Full Name */}
          <div className="profile-field-group">
            <label className="profile-field-label" htmlFor="user-name">
              <FaUser className="field-icon" />
              <span>Full Name</span>
            </label>
            <input
              id="user-name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="Enter your full name"
              className={`profile-input ${isEditing ? "editing" : ""}`}
            />
          </div>

          {/* Email Address */}
          <div className="profile-field-group">
            <label className="profile-field-label" htmlFor="user-email">
              <FaEnvelope className="field-icon" />
              <span>Email Address</span>
            </label>
            <input
              id="user-email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="your.email@example.com"
              className={`profile-input ${isEditing ? "editing" : ""}`}
            />
          </div>

          {/* Phone Number */}
          <div className="profile-field-group">
            <label className="profile-field-label" htmlFor="user-contact">
              <FaPhone className="field-icon" />
              <span>Phone Number</span>
            </label>
            <input
              id="user-contact"
              type="tel"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="+91 98765 43210"
              className={`profile-input ${isEditing ? "editing" : ""}`}
            />
          </div>
        </div>

        {isEditing && (
          <div className="personal-info-actions">
            <button
              type="button"
              className="profile-btn profile-btn-primary"
              onClick={() => setShowConfirmModal(true)}
              disabled={isSaving}
            >
              <FaCheck />
              <span>{isSaving ? "Saving Changes..." : "Save Changes"}</span>
            </button>
          </div>
        )}
      </div>

      {/* Security Tip Card */}
      <div className="profile-info-banner">
        <FaShieldAlt className="banner-icon" />
        <div className="banner-text">
          <h4>Account Security</h4>
          <p>
            Your email and phone number are used for critical order notifications, delivery updates,
            and two-factor authentication. Always keep them up to date.
          </p>
        </div>
      </div>

      {/* Save Confirmation Modal */}
      {showConfirmModal && (
        <div className="profile-modal-overlay" role="dialog" aria-modal="true">
          <div className="profile-modal-card confirm-modal-card">
            <h3 className="confirm-modal-title">Save Profile Changes?</h3>
            <p className="confirm-modal-message">
              Are you sure you want to update your profile details with these changes?
            </p>
            <div className="profile-modal-actions">
              <button
                type="button"
                className="profile-btn profile-btn-secondary"
                onClick={() => setShowConfirmModal(false)}
              >
                Review
              </button>
              <button
                type="button"
                className="profile-btn profile-btn-primary"
                onClick={handleSaveSubmit}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Yes, Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalInfoPage;
