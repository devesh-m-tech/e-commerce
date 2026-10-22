import { useNavigate } from "react-router-dom";
import { FaHeart, FaTrash, FaShoppingBag } from "react-icons/fa";
import ProductCard from "../../ProductPage/ProductCard";

const WishlistPage = ({
  items = [],
  isLoading = false,
  onRemoveItem,
  onClearAll,
}) => {
  const navigate = useNavigate();

  return (
    <div className="profile-page-view wishlist-view">
      {/* Header */}
      <div className="profile-page-header">
        <div>
          <h1 className="profile-page-title">My Wishlist</h1>
          <p className="profile-page-desc">
            Saved items you love ({items.length} {items.length === 1 ? "item" : "items"})
          </p>
        </div>
        {items.length > 0 && (
          <button
            type="button"
            className="profile-btn profile-btn-outline danger"
            onClick={onClearAll}
            title="Clear all saved items"
          >
            <FaTrash />
            <span>Clear Wishlist</span>
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="wishlist-grid-skeleton">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="wishlist-card-skeleton" />
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className="wishlist-cards-grid">
          {items.map((product) => (
            <div key={product._id} className="wishlist-product-item-wrap">
              <ProductCard
                product={product}
                isInitialWishlisted={true}
                onAddToCartSuccess={() => onRemoveItem(product._id)}
              />
              <button
                type="button"
                className="wishlist-quick-remove-btn"
                onClick={() => onRemoveItem(product._id, product.variantId)}
                title="Remove from Wishlist"
                aria-label="Remove from Wishlist"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="profile-empty-state">
          <div className="empty-state-icon">
            <FaHeart />
          </div>
          <h3 className="empty-state-title">Your wishlist is empty</h3>
          <p className="empty-state-desc">
            Explore our curated catalog of pure silks, bridal wear, and festive collections to save
            your favorites.
          </p>
          <button
            type="button"
            className="profile-btn profile-btn-primary"
            onClick={() => navigate("/products")}
          >
            <FaShoppingBag />
            <span>Start Exploring</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
