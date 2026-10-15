import { useState } from "react";
import {
  FaPlus,
  FaHome,
  FaBriefcase,
  FaEdit,
  FaTrash,
  FaTimes,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { userApi } from "../../../APi/userApi";

const AddressesPage = ({ user, onUserUpdated }) => {
  const addresses = user?.addresses || [];

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPincodeLoading, setIsPincodeLoading] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const initialForm = {
    type: "Home",
    name: "",
    mobile: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    isDefault: false,
    pincodeVerified: false,
  };

  const [addressForm, setAddressForm] = useState(initialForm);

  const openAddModal = () => {
    setAddressForm(initialForm);
    setIsEditing(false);
    setShowModal(true);
  };

  const openEditModal = (addr) => {
    setAddressForm({
      _id: addr._id,
      type: addr.type || "Home",
      name: addr.name || "",
      mobile: addr.mobile || "",
      street: addr.street || addr.address || "",
      city: addr.city || "",
      state: addr.state || "",
      pincode: addr.pincode || "",
      isDefault: Boolean(addr.isDefault),
      pincodeVerified: Boolean(addr.pincode && addr.pincode.length === 6),
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const fetchPincodeDetails = async (pin) => {
    if (pin.length !== 6) return;
    try {
      setIsPincodeLoading(true);
      const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const data = await res.json();
      if (data && data[0]?.Status === "Success" && data[0]?.PostOffice?.length > 0) {
        const postOffice = data[0].PostOffice[0];
        setAddressForm((prev) => ({
          ...prev,
          city: postOffice.District || postOffice.Block || "",
          state: postOffice.State || "",
          pincodeVerified: true,
        }));
        toast.info(`Detected: ${postOffice.District}, ${postOffice.State}`);
      } else {
        toast.warn("Invalid or unserviceable PIN code");
      }
    } catch (err) {
      console.error("PIN lookup error:", err);
    } finally {
      setIsPincodeLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setAddressForm((prev) => ({ ...prev, [name]: checked }));
      return;
    }
    if (name === "mobile") {
      const numeric = value.replace(/\D/g, "").slice(0, 10);
      setAddressForm((prev) => ({ ...prev, mobile: numeric }));
      return;
    }
    if (name === "pincode") {
      const pin = value.replace(/\D/g, "").slice(0, 6);
      setAddressForm((prev) => ({ ...prev, pincode: pin }));
      if (pin.length === 6) {
        fetchPincodeDetails(pin);
      }
      return;
    }
    setAddressForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitAddress = async (e) => {
    e.preventDefault();
    if (!addressForm.name.trim() || !addressForm.mobile || addressForm.mobile.length !== 10) {
      toast.error("Please enter a valid recipient name and 10-digit mobile number");
      return;
    }
    if (!addressForm.street.trim() || !addressForm.pincode || addressForm.pincode.length !== 6) {
      toast.error("Please enter street address and 6-digit postal code");
      return;
    }

    try {
      setIsSaving(true);
      if (isEditing) {
        await userApi.updateAddress(addressForm);
        toast.success("Address updated successfully");
      } else {
        await userApi.addAddress(addressForm);
        toast.success("New address added successfully");
      }
      const refreshed = await userApi.myProfile();
      if (onUserUpdated) onUserUpdated(refreshed.user);
      setShowModal(false);
      setAddressForm(initialForm);
    } catch (err) {
      toast.error(err.message || "Failed to save address");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSetDefault = async (addrId) => {
    try {
      await userApi.setDefaultAddress(addrId);
      toast.success("Default address updated");
      const refreshed = await userApi.myProfile();
      if (onUserUpdated) onUserUpdated(refreshed.user);
    } catch (err) {
      toast.error(err.message || "Failed to set default address");
    }
  };

  const handleDeleteAddress = async () => {
    if (!deleteTargetId) return;
    try {
      await userApi.deleteAddress(deleteTargetId);
      toast.success("Address removed successfully");
      const refreshed = await userApi.myProfile();
      if (onUserUpdated) onUserUpdated(refreshed.user);
    } catch (err) {
      toast.error(err.message || "Failed to delete address");
    } finally {
      setDeleteTargetId(null);
    }
  };

  const getTypeIcon = (type) => {
    if (type === "Work") return <FaBriefcase />;
    return <FaHome />;
  };

  return (
    <div className="profile-page-view addresses-view">
      {/* Header */}
      <div className="profile-page-header">
        <div>
          <h1 className="profile-page-title">Manage Addresses</h1>
          <p className="profile-page-desc">
            Add or edit delivery addresses for fast and seamless checkout
          </p>
        </div>
        <button
          type="button"
          className="profile-btn profile-btn-primary"
          onClick={openAddModal}
        >
          <FaPlus />
          <span>Add New Address</span>
        </button>
      </div>

      {/* Grid of addresses */}
      <div className="addresses-cards-grid">
        {/* Add Address Action Card */}
        <div className="add-address-dashed-card" onClick={openAddModal}>
          <div className="add-dashed-icon">
            <FaPlus />
          </div>
          <span className="add-dashed-title">Add New Delivery Address</span>
          <span className="add-dashed-desc">Save a new home, office, or gift address</span>
        </div>

        {addresses.map((addr) => (
          <article key={addr._id} className="address-item-card">
            <div className="address-card-header">
              <div className="address-type-tag">
                {getTypeIcon(addr.type)}
                <span>{addr.type || "Home"}</span>
              </div>
              {addr.isDefault && (
                <span className="default-address-pill">DEFAULT</span>
              )}
            </div>

            <div className="address-card-body">
              <h3 className="recipient-name">{addr.name}</h3>
              <p className="recipient-phone">{addr.mobile}</p>
              <p className="recipient-street">{addr.street || addr.address}</p>
              <p className="recipient-city-state">
                {addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
              </p>
            </div>

            <div className="address-card-footer">
              <div className="address-actions-left">
                <button
                  type="button"
                  className="address-action-btn edit"
                  onClick={() => openEditModal(addr)}
                >
                  <FaEdit />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  className="address-action-btn delete"
                  onClick={() => setDeleteTargetId(addr._id)}
                >
                  <FaTrash />
                  <span>Delete</span>
                </button>
              </div>

              {!addr.isDefault && (
                <button
                  type="button"
                  className="set-default-btn"
                  onClick={() => handleSetDefault(addr._id)}
                >
                  Set as Default
                </button>
              )}
            </div>
          </article>
        ))}
      </div>

      {/* Add / Edit Address Modal */}
      {showModal && (
        <div className="profile-modal-overlay" role="dialog" aria-modal="true">
          <div className="profile-modal-card address-modal-card">
            <div className="profile-modal-header">
              <div>
                <h3 className="profile-modal-title">
                  {isEditing ? "Edit Delivery Address" : "Add New Delivery Address"}
                </h3>
                <p className="profile-modal-subtitle">
                  Ensure accurate details for timely delivery of your sarees
                </p>
              </div>
              <button
                type="button"
                className="profile-modal-close-btn"
                onClick={() => setShowModal(false)}
                aria-label="Close"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmitAddress} className="address-form-modal">
              {/* Type selector */}
              <div className="form-group-type-selector">
                <label className="profile-field-label">Address Type</label>
                <div className="type-buttons-row">
                  {["Home", "Work", "Other"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      className={`type-select-btn ${addressForm.type === t ? "active" : ""}`}
                      onClick={() => setAddressForm((prev) => ({ ...prev, type: t }))}
                    >
                      {t === "Work" ? <FaBriefcase /> : <FaHome />}
                      <span>{t}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-double-grid">
                {/* Name */}
                <div className="profile-field-group">
                  <label className="profile-field-label" htmlFor="addr-name">
                    Recipient Full Name *
                  </label>
                  <input
                    id="addr-name"
                    type="text"
                    name="name"
                    value={addressForm.name}
                    onChange={handleFormChange}
                    placeholder="Enter receiver's name"
                    className="profile-input editing"
                    required
                  />
                </div>

                {/* Phone */}
                <div className="profile-field-group">
                  <label className="profile-field-label" htmlFor="addr-mobile">
                    10-Digit Mobile Number *
                  </label>
                  <input
                    id="addr-mobile"
                    type="tel"
                    name="mobile"
                    maxLength={10}
                    value={addressForm.mobile}
                    onChange={handleFormChange}
                    placeholder="e.g. 9876543210"
                    className="profile-input editing"
                    required
                  />
                </div>
              </div>

              {/* Street Address */}
              <div className="profile-field-group">
                <label className="profile-field-label" htmlFor="addr-street">
                  Flat, House No., Building, Street, Area *
                </label>
                <input
                  id="addr-street"
                  type="text"
                  name="street"
                  value={addressForm.street}
                  onChange={handleFormChange}
                  placeholder="e.g. Door No. 42, Temple View Apartments, Gandhi Road"
                  className="profile-input editing"
                  required
                />
              </div>

              <div className="form-triple-grid">
                {/* Pincode */}
                <div className="profile-field-group">
                  <label className="profile-field-label" htmlFor="addr-pincode">
                    Pincode * {isPincodeLoading && <span className="pincode-spin">Checking...</span>}
                  </label>
                  <input
                    id="addr-pincode"
                    type="text"
                    name="pincode"
                    maxLength={6}
                    value={addressForm.pincode}
                    onChange={handleFormChange}
                    placeholder="6 digits"
                    className="profile-input editing"
                    required
                  />
                </div>

                {/* City */}
                <div className="profile-field-group">
                  <label className="profile-field-label" htmlFor="addr-city">
                    City / District *
                  </label>
                  <input
                    id="addr-city"
                    type="text"
                    name="city"
                    value={addressForm.city}
                    onChange={handleFormChange}
                    placeholder="City"
                    className="profile-input editing"
                    required
                  />
                </div>

                {/* State */}
                <div className="profile-field-group">
                  <label className="profile-field-label" htmlFor="addr-state">
                    State *
                  </label>
                  <input
                    id="addr-state"
                    type="text"
                    name="state"
                    value={addressForm.state}
                    onChange={handleFormChange}
                    placeholder="State"
                    className="profile-input editing"
                    required
                  />
                </div>
              </div>

              {/* Set as Default checkbox */}
              <div className="form-checkbox-row">
                <label className="profile-checkbox-label">
                  <input
                    type="checkbox"
                    name="isDefault"
                    checked={addressForm.isDefault}
                    onChange={handleFormChange}
                  />
                  <span>Make this my default shipping address</span>
                </label>
              </div>

              <div className="profile-modal-actions">
                <button
                  type="button"
                  className="profile-btn profile-btn-secondary"
                  onClick={() => setShowModal(false)}
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="profile-btn profile-btn-primary"
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : isEditing ? "Update Address" : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTargetId && (
        <div className="profile-modal-overlay" role="dialog" aria-modal="true">
          <div className="profile-modal-card confirm-modal-card">
            <h3 className="confirm-modal-title">Delete Address?</h3>
            <p className="confirm-modal-message">
              Are you sure you want to remove this delivery address from your account?
            </p>
            <div className="profile-modal-actions">
              <button
                type="button"
                className="profile-btn profile-btn-secondary"
                onClick={() => setDeleteTargetId(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="profile-btn profile-btn-danger"
                onClick={handleDeleteAddress}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressesPage;
