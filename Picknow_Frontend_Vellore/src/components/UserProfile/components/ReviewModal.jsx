import { FaTimes, FaStar } from "react-icons/fa";

const ReviewModal = ({
  isOpen,
  onClose,
  productItem,
  reviewData,
  onChangeReviewData,
  onSubmit,
  isSubmitting,
}) => {
  if (!isOpen || !productItem) return null;

  const product = productItem.product || {};
  const productImage = Array.isArray(product.pImage)
    ? product.pImage[0]
    : typeof product.pImage === "string"
    ? product.pImage.split(",")[0]
    : "https://via.placeholder.com/80?text=Product";

  const getRatingFeedback = (rating) => {
    switch (rating) {
      case 1:
        return "Poor — We are sorry to hear that. Tell us what went wrong.";
      case 2:
        return "Fair — What could be improved?";
      case 3:
        return "Good — Nice! What did you like, and what could be better?";
      case 4:
        return "Very Good — Great! What did you enjoy most?";
      case 5:
        return "Excellent — Perfect! Thank you for the love!";
      default:
        return "Click a star to rate this product";
    }
  };

  return (
    <div className="profile-modal-overlay" role="dialog" aria-modal="true">
      <div className="profile-modal-card review-modal-card">
        {/* Header */}
        <div className="profile-modal-header">
          <div>
            <h3 className="profile-modal-title">Write a Review</h3>
            <p className="profile-modal-subtitle">
              Your feedback helps other shoppers make better choices
            </p>
          </div>
          <button
            type="button"
            className="profile-modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <FaTimes />
          </button>
        </div>

        {/* Product preview */}
        <div className="review-product-preview-bar">
          <img
            src={productImage}
            alt={product.pName || "Product"}
            className="review-product-thumb"
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/80?text=Product";
            }}
          />
          <div className="review-product-meta">
            <h4 className="review-product-title">{product.pName || "Product Name"}</h4>
            {product.pBrand && (
              <span className="review-product-brand">{product.pBrand}</span>
            )}
            {productItem.variantValue && (
              <span className="review-product-variant">
                Variant: {productItem.variantValue}
              </span>
            )}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="review-modal-form">
          <div className="review-stars-section">
            <label className="review-field-label">Overall Rating</label>
            <div className="review-stars-row" role="radiogroup" aria-label="Star rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`review-star-btn ${reviewData.rating >= star ? "filled" : ""}`}
                  onClick={() => onChangeReviewData("rating", star)}
                  aria-label={`${star} star`}
                >
                  <FaStar />
                </button>
              ))}
              {reviewData.rating > 0 && (
                <span className="review-rating-score">{reviewData.rating} / 5</span>
              )}
            </div>
            <p className="review-hint-text">{getRatingFeedback(reviewData.rating)}</p>
          </div>

          <div className="review-textarea-section">
            <div className="review-label-flex">
              <label htmlFor="review-text" className="review-field-label">
                Detailed Review
              </label>
              <span className="review-char-count">
                {reviewData.review?.length || 0} / 500
              </span>
            </div>
            <textarea
              id="review-text"
              rows={4}
              maxLength={500}
              placeholder="Tell us about the fabric quality, finish, color vibrancy, drape, and overall experience..."
              value={reviewData.review}
              onChange={(e) => onChangeReviewData("review", e.target.value)}
              className="profile-modern-textarea"
              required
            />
          </div>

          <div className="profile-modal-actions">
            <button
              type="button"
              className="profile-btn profile-btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="profile-btn profile-btn-primary"
              disabled={isSubmitting || !reviewData.rating || !reviewData.review.trim()}
            >
              {isSubmitting ? "Submitting Review..." : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
