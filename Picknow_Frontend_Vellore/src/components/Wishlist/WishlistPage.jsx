import React, { useState, useEffect } from "react";
import { getWishlist, removeFromWishlist } from "../../APi/userApi";
import { productApi } from "../../APi/productApi";
import ProductCard from "../ProductPage/ProductCard";
import ModernLoader from "../Loading/ModernLoader";
import { Helmet } from "react-helmet";
import { Heart, ShoppingBag } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useSnackbar } from "notistack";
// import Footer from "../Footer/Footer"; // Removed to prevent duplication
import "./WishlistPage.css";

const WishlistPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await getWishlist();
      
      const rawProducts = response.products || 
                          response.wishlist?.products || 
                          (Array.isArray(response.wishlist) ? response.wishlist : []) ||
                          (Array.isArray(response) ? response : []);
      
      // Perform full detail fetch for each item to ensure images and prices are perfect
      const detailedItems = await Promise.all(
        rawProducts.map(async (item) => {
          try {
            const pId = item.product?._id || item._id || item.productId || item;
            if (typeof pId !== 'string' && typeof pId !== 'number') return null;
            
            const detailRes = await productApi.getProductById(pId);
            if (detailRes.success && detailRes.product) {
              const p = detailRes.product;
              
              // Ensure variants are present for price fallback in ProductCard
              if (!p.variants || p.variants.length === 0) {
                 try {
                   const variantRes = await productApi.getProductVariants(pId);
                   if (variantRes.success) p.variants = variantRes.variants;
                 } catch (e) {}
              }
              
              return p;
            }
            return item.product || item;
          } catch (err) {
            console.error("Deep fetch failed for item:", item, err);
            return item.product || item;
          }
        })
      );

      // Filter out nulls and normalize any remaining fields
      const finalItems = detailedItems.filter(Boolean).map(p => ({
        ...p,
        _id: p._id,
        pName: p.pName || p.name || "Product",
        pImage: Array.isArray(p.pImage) ? p.pImage : (p.image ? [p.image] : []),
        pPrice: p.pPrice || p.price || (p.variants?.[0]?.price) || 0,
        pPreviousPrice: p.pPreviousPrice || p.originalPrice || (p.variants?.[0]?.originalPrice) || 0
      }));

      setWishlistItems(finalItems);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (productId) => {
    try {
      const response = await removeFromWishlist(productId);
      if (response.success) {
        setWishlistItems(prev => prev.filter(item => item._id !== productId));
        enqueueSnackbar("Removed from wishlist", { variant: "success" });
        window.dispatchEvent(new CustomEvent("wishlistUpdated", { detail: { count: wishlistItems.length - 1 } }));
      }
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      enqueueSnackbar("Failed to remove item", { variant: "error" });
    }
  };

  return (
    <div className="wishlist-page-container">
      <Helmet>
        <title>My Wishlist | Shri Deepaalaya Silks</title>
      </Helmet>

      <div className="wishlist-container">
        {/* Header */}
        <div className="wishlist-header">
          <div className="wishlist-breadcrumb">
            <Link to="/">Home</Link>
            <span className="wishlist-breadcrumb-sep">/</span>
            <span>Wishlist</span>
          </div>
          <div className="wishlist-title-row">
            <div className="wishlist-title-left">
              <h1>My Wishlist</h1>
              <p>Handpicked silk sarees and jewellery curated for your special moments.</p>
            </div>
            <div className="wishlist-count-badge">
              <Heart size={14} fill="var(--color-maroon, #6D1734)" stroke="var(--color-maroon, #6D1734)" />
              {wishlistItems.length} {wishlistItems.length === 1 ? 'Piece Saved' : 'Pieces Saved'}
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="wishlist-loader-box">
            <ModernLoader />
          </div>
        ) : wishlistItems.length > 0 ? (
          <div className="wishlist-products-grid">
            {wishlistItems.map((item) => (
              <div key={item._id} className="wishlist-item-wrapper">
                <ProductCard 
                  product={item} 
                  isInitialWishlisted={true} 
                  onAddToCartSuccess={handleRemove}
                />
                <button 
                  className="remove-wish-btn" 
                  onClick={() => handleRemove(item._id)}
                  title="Remove from wishlist"
                  aria-label="Remove item"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="wishlist-empty-state">
            <div className="wishlist-empty-icon-wrap">
              <Heart size={34} strokeWidth={1.5} />
            </div>
            <h2 className="wishlist-empty-title">Your Wishlist is Empty</h2>
            <p className="wishlist-empty-desc">
              Explore our handcrafted Kanchipuram silk sarees, pure zari weaves, and heirloom bridal collections to curate your dream ensemble.
            </p>
            <div className="wishlist-empty-actions">
              <button 
                className="wishlist-empty-btn-primary" 
                onClick={() => navigate('/category/cat_silk_sarees')}
              >
                Shop Silk Sarees
              </button>
              <button 
                className="wishlist-empty-btn-secondary" 
                onClick={() => navigate('/products')}
              >
                Browse All Products
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
