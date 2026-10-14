import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet";
import { toast } from "react-toastify";
import { useSnackbar } from "notistack";
import { userApi, getWishlist, removeFromWishlist } from "../../APi/userApi";
import { orderApi } from "../../APi/orderApi";
import { productApi } from "../../APi/productApi";
import { authService } from "../../APi/baseApi";
import ModernLoader from "../Loading/ModernLoader";

// Modular Sub-Pages
import PersonalInfoPage from "./pages/PersonalInfoPage";
import OrdersPage from "./pages/OrdersPage";
import OrderDetailsPage from "./pages/OrderDetailsPage";
import AddressesPage from "./pages/AddressesPage";
import PasswordPage from "./pages/PasswordPage";
import WalletPage from "./pages/WalletPage";
import WishlistPage from "./pages/WishlistPage";

// Modular UI Components
import ProfileSidebar from "./components/ProfileSidebar";
import ProfileMobileNav from "./components/ProfileMobileNav";
import ReviewModal from "./components/ReviewModal";
import CancelOrderModal from "./components/CancelOrderModal";
import LogoutModal from "./components/LogoutModal";

// Consolidated Modern Luxury Stylesheet
import "./UserProfile.css";

const UserProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();

  // Primary state
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Loading states
  const [loading, setLoading] = useState({
    profile: true,
    orders: false,
    wishlist: false,
    orderDetails: false,
  });

  // Active tab state - derive from URL or localStorage or location.state
  const getInitialTab = () => {
    if (location.state?.activeTab) return location.state.activeTab;
    const path = location.pathname.replace(/\/$/, "");
    if (path.includes("/orders")) return "orders";
    if (path.includes("/addresses")) return "addresses";
    if (path.includes("/password")) return "password";
    if (path.includes("/wallet")) return "wallet";
    if (path.includes("/wishlist")) return "wishlist";
    return localStorage.getItem("activeTab") || "profile";
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);

  // Modals state
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [cancelModalOrder, setCancelModalOrder] = useState(null);
  const [isCancellingOrder, setIsCancellingOrder] = useState(false);
  const [reviewProductItem, setReviewProductItem] = useState(null);
  const [reviewData, setReviewData] = useState({ rating: 0, review: "" });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Sync tab with URL/storage
  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    setSelectedOrder(null);
    localStorage.setItem("activeTab", tabId);
    // Smooth scroll to top of content
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Auth Guard & Load Profile
  const fetchProfile = useCallback(async () => {
    try {
      setLoading((prev) => ({ ...prev, profile: true }));
      const response = await userApi.myProfile();
      setUser(response.user);
    } catch (err) {
      toast.error(err.message || "Failed to load account profile");
    } finally {
      setLoading((prev) => ({ ...prev, profile: false }));
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const isLoggedOut = localStorage.getItem("userLoggedOut") === "true";
    if (!token || isLoggedOut) {
      toast.info("Please sign in to access your profile");
      window.dispatchEvent(new Event("openLogin"));
      navigate("/");
      return;
    }
    fetchProfile();
  }, [navigate, fetchProfile]);

  // Sync tab from external navigation (e.g. from cart or checkout)
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
      localStorage.setItem("activeTab", location.state.activeTab);
    }
  }, [location.state]);

  // Fetch orders when orders tab becomes active
  const fetchOrders = useCallback(async () => {
    try {
      setLoading((prev) => ({ ...prev, orders: true }));
      const response = await orderApi.getOrders();
      setOrders(response.orders || []);
    } catch (err) {
      toast.error(err.message || "Failed to load order history");
    } finally {
      setLoading((prev) => ({ ...prev, orders: false }));
    }
  }, []);

  useEffect(() => {
    if (activeTab === "orders") {
      fetchOrders();
    }
  }, [activeTab, fetchOrders]);

  // Fetch wishlist when wishlist tab becomes active
  const fetchWishlist = useCallback(async () => {
    try {
      setLoading((prev) => ({ ...prev, wishlist: true }));
      const response = await getWishlist();
      const rawProducts =
        response.products ||
        response.wishlist?.products ||
        (Array.isArray(response.wishlist) ? response.wishlist : []) ||
        (Array.isArray(response) ? response : []);

      const detailedItems = await Promise.all(
        rawProducts.map(async (item) => {
          try {
            const pId = item.product?._id || item._id || item.productId || item;
            if (typeof pId !== "string" && typeof pId !== "number") return null;

            const detailRes = await productApi.getProductById(pId);
            if (detailRes.success && detailRes.product) {
              const p = detailRes.product;
              if (!p.variants || p.variants.length === 0) {
                try {
                  const variantRes = await productApi.getProductVariants(pId);
                  if (variantRes.success) p.variants = variantRes.variants;
                } catch (e) {
                  // Variant fetch optional fallback
                }
              }
              return p;
            }
            return item.product || item;
          } catch (err) {
            return item.product || item;
          }
        })
      );

      const finalItems = detailedItems.filter(Boolean).map((p) => ({
        ...p,
        _id: p._id,
        pName: p.pName || p.name || "Silk Saree",
        pImage: Array.isArray(p.pImage) ? p.pImage : p.image ? [p.image] : [],
        pPrice: p.pPrice || p.price || p.variants?.[0]?.price || 0,
        pPreviousPrice:
          p.pPreviousPrice || p.originalPrice || p.variants?.[0]?.originalPrice || 0,
      }));

      setWishlistItems(finalItems);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    } finally {
      setLoading((prev) => ({ ...prev, wishlist: false }));
    }
  }, []);

  useEffect(() => {
    if (activeTab === "wishlist") {
      fetchWishlist();
    }
  }, [activeTab, fetchWishlist]);

  // View specific order details
  const handleViewOrder = async (orderId) => {
    try {
      setLoading((prev) => ({ ...prev, orderDetails: true }));
      const response = await orderApi.getOrderById(orderId);
      if (!response.success || !response.order) {
        throw new Error(response.message || "Failed to load order details");
      }

      // Process items safely
      const processedItems = (response.order.items || []).map((item) => {
        const prod = item.product || {};
        let pImage = "https://via.placeholder.com/80?text=Product";
        if (prod.pImage) {
          pImage = Array.isArray(prod.pImage)
            ? prod.pImage[0]
            : prod.pImage.split(",")[0];
        }
        return {
          ...item,
          product: {
            ...prod,
            pName: prod.pName || "Silk Saree",
            pImage: pImage,
          },
        };
      });

      setSelectedOrder({
        ...response.order,
        items: processedItems,
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      toast.error(err.message || "Failed to load order details");
    } finally {
      setLoading((prev) => ({ ...prev, orderDetails: false }));
    }
  };

  // Cancel order execution
  const handleConfirmCancelOrder = async (orderId) => {
    try {
      setIsCancellingOrder(true);
      const res = await orderApi.cancelOrder(orderId);
      if (res.success) {
        toast.success("Order cancelled successfully");
        setCancelModalOrder(null);
        fetchOrders();
        if (selectedOrder && selectedOrder._id === orderId) {
          const updated = await orderApi.getOrderById(orderId);
          setSelectedOrder(updated.order);
        }
      } else {
        toast.error(res.message || "Failed to cancel order");
      }
    } catch (err) {
      toast.error(err.message || "Failed to cancel order");
    } finally {
      setIsCancellingOrder(false);
    }
  };

  // Submit product review
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewProductItem || !reviewData.rating || !reviewData.review.trim()) {
      toast.error("Please provide both a star rating and review comments");
      return;
    }
    try {
      setIsSubmittingReview(true);
      const prodId = reviewProductItem.product?._id;
      const res = await productApi.addReview(
        prodId,
        reviewData.rating,
        reviewData.review.trim()
      );
      if (res.success) {
        toast.success("Review submitted! Thank you for your feedback.");
        setReviewProductItem(null);
        setReviewData({ rating: 0, review: "" });
        if (selectedOrder) {
          handleViewOrder(selectedOrder._id);
        }
      }
    } catch (err) {
      toast.error(err.message || "Failed to submit review");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Remove single wishlist item
  const handleRemoveWishlistItem = async (productId, variantId = null) => {
    try {
      const response = await removeFromWishlist(productId, variantId);
      if (response.success) {
        enqueueSnackbar("Item removed from wishlist", { variant: "success" });
        fetchWishlist();
        window.dispatchEvent(new CustomEvent("wishlistUpdated"));
      }
    } catch (err) {
      enqueueSnackbar(err.message || "Failed to remove item", { variant: "error" });
    }
  };

  // Clear all wishlist items
  const handleClearAllWishlist = async () => {
    if (!window.confirm("Are you sure you want to clear your entire wishlist?")) return;
    try {
      setLoading((prev) => ({ ...prev, wishlist: true }));
      await Promise.all(
        wishlistItems.map((item) => removeFromWishlist(item._id, item.variantId))
      );
      enqueueSnackbar("Wishlist cleared", { variant: "success" });
      fetchWishlist();
      window.dispatchEvent(new CustomEvent("wishlistUpdated"));
    } catch (err) {
      enqueueSnackbar("Failed to clear all items", { variant: "error" });
      fetchWishlist();
    } finally {
      setLoading((prev) => ({ ...prev, wishlist: false }));
    }
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      localStorage.setItem("userLoggedOut", "true");
      [
        "token",
        "isLoggedIn",
        "user",
        "currentUser",
        "authToken",
        "activeTab",
        "isVendor",
        "userEmail",
        "activationToken",
        "activeCartItems",
      ].forEach((key) => localStorage.removeItem(key));

      window.dispatchEvent(new Event("loginStateChanged"));

      try {
        await authService.logout();
      } catch (e) {
        // Continue clearing client storage even if server logout fails
      }

      toast.success("Signed out successfully");
      setShowLogoutModal(false);
      navigate("/");
    } catch (err) {
      setShowLogoutModal(false);
      navigate("/");
    }
  };

  if (loading.profile) {
    return (
      <div className="profile-loading-screen">
        <ModernLoader
          showTiming={false}
          animationType="wave"
          size={0.8}
          customMessage="Loading your account..."
          showProgress={true}
        />
      </div>
    );
  }

  return (
    <div className="profile-master-wrapper">
      <Helmet>
        <title>My Account | Shri Deepaalaya Silks</title>
        <meta
          name="description"
          content="Manage your personal profile, track orders, manage addresses, and check your Royal Silks wallet balance."
        />
      </Helmet>

      <div className="profile-master-container">
        {/* Desktop Luxury Sidebar */}
        <ProfileSidebar
          user={user}
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          onRequestLogout={() => setShowLogoutModal(true)}
        />

        {/* Main Content Area */}
        <main className="profile-main-viewport">
          {/* Mobile Top Navigation Tabs */}
          <ProfileMobileNav
            activeTab={activeTab}
            onSelectTab={handleSelectTab}
          />

          <div className="profile-tab-viewport">
            {/* Orders View */}
            {activeTab === "orders" &&
              (selectedOrder ? (
                <OrderDetailsPage
                  order={selectedOrder}
                  onBack={() => setSelectedOrder(null)}
                  onInitiateCancel={(ord) => setCancelModalOrder(ord)}
                  onOpenReview={(prodItem) => setReviewProductItem(prodItem)}
                />
              ) : (
                <OrdersPage
                  orders={orders}
                  isLoading={loading.orders}
                  onViewOrder={handleViewOrder}
                />
              ))}

            {/* Profile Info View */}
            {activeTab === "profile" && (
              <PersonalInfoPage
                user={user}
                onUserUpdated={(updated) => setUser(updated)}
              />
            )}

            {/* Addresses View */}
            {activeTab === "addresses" && (
              <AddressesPage
                user={user}
                onUserUpdated={(updated) => setUser(updated)}
              />
            )}

            {/* Password Security View */}
            {activeTab === "password" && <PasswordPage />}

            {/* Wallet View */}
            {activeTab === "wallet" && <WalletPage />}

            {/* Wishlist View */}
            {activeTab === "wishlist" && (
              <WishlistPage
                items={wishlistItems}
                isLoading={loading.wishlist}
                onRemoveItem={handleRemoveWishlistItem}
                onClearAll={handleClearAllWishlist}
              />
            )}
          </div>
        </main>
      </div>

      {/* Global Modals */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />

      <CancelOrderModal
        isOpen={Boolean(cancelModalOrder)}
        order={cancelModalOrder}
        onClose={() => setCancelModalOrder(null)}
        onConfirm={handleConfirmCancelOrder}
        isLoading={isCancellingOrder}
      />

      <ReviewModal
        isOpen={Boolean(reviewProductItem)}
        productItem={reviewProductItem}
        reviewData={reviewData}
        onChangeReviewData={(field, val) =>
          setReviewData((prev) => ({ ...prev, [field]: val }))
        }
        onClose={() => {
          setReviewProductItem(null);
          setReviewData({ rating: 0, review: "" });
        }}
        onSubmit={handleSubmitReview}
        isSubmitting={isSubmittingReview}
      />
    </div>
  );
};

export default UserProfile;
