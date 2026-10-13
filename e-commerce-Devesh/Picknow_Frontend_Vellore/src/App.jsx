import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { SnackbarProvider } from "notistack";
import SdsNavbar from "./components/Navbar/SdsNavbar";
import AnnouncementBar from "./components/common/AnnouncementBar";
import SdsHomePage from "./components/Landingpage/SdsHomePage";
import LoginModal from "./components/Login/LoginModal";
import ProductPage from "./components/ProductPage/ProductPage";
import CartPage from "./components/CartPage/CartPage";
import UserProfile from "./components/UserProfile/UserProfile";
import ProductDetail from "./components/ProductPage/ProductDetail";
import NewCombo from "./components/ComboOffer/NewCombo";
import ComboDetail from "./components/ComboOffer/ComboDetail";
import CategoryPage from "./components/CategoryPage/CategoryPage";
import DealsPage from "./components/DealsPage/DealsPage";
import PaymentPage from "./components/PaymentPage/PaymentPage";
import CategoryProducts from "./components/CategoryPage/CategoryProducts";
import TermsAndConditions from "./components/Footer/TermsAndConditions/TermsAndConditions";
import PrivacyPolicy from "./components/Footer/PrivacyPolicy/PrivacyPolicy";
import ShippingPolicy from "./components/Footer/ShippingPolicy/ShippingPolicy";
import ReturnRefundPolicy from "./components/Footer/Cancellation & Refund Policy/ReturnRefundPolicy";
import Refund from "./components/Footer/refund";
import SellerPage from "./components/SellerPage/SellerPage";
import SellerLogin from "./components/SellerPage/SellerLogin/SellerLogin";
import WhyChooseUs from "./components/WhyChooseUs/WhyChooseUs";
import SellerDashboard from "./components/SellerDashboard/SellerDashboard";
// import VendorRegistration from './components/VendorRegistration/VendorRegistration';

import VendorLandingPage from "./components/VendorPage/pages/LandingPage";
import NavbarVendor from "./components/VendorPage/NavbarVendor";
import RegisterForm from "./components/VendorPage/pages/RegisterForm";
import VendorDetailsForm from "./components/VendorPage/pages/VendorDetailsForm";
import PendingApproval from "./components/VendorPage/pages/PendingApproval";
import VendorDashboard from "./components/VendorPage/pages/VendorDashboard";
import LoginForm from "./components/VendorPage/pages/LoginForm";

import CheckoutPage from "./components/CartPage/CheckoutPage";
// import ComboOfferPage  from './components/ComboOfferPage/ComboOfferPage ';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import SearchResults from "./components/Search/SearchResults";
import BlogList from "./components/Blog/BlogList";
import BlogDetail from "./components/Blog/BlogDetail";
import BrandProducts from "./components/Brand/BrandProducts";
import WishlistPage from "./components/Wishlist/WishlistPage";
import SdsFooter from "./components/Footer/SdsFooter";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  // currentPage state removed — SdsHomePage is self-contained
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  const syncAuthState = () => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user") || localStorage.getItem("currentUser");
    const isLoggedOut = localStorage.getItem("userLoggedOut") === "true";
    setIsLoggedIn(Boolean(token && user && !isLoggedOut));
  };

  useEffect(() => {
    syncAuthState();
    window.addEventListener("storage", syncAuthState);
    window.addEventListener("loginStateChanged", syncAuthState);
    return () => {
      window.removeEventListener("storage", syncAuthState);
      window.removeEventListener("loginStateChanged", syncAuthState);
    };
  }, []);

  // AOS removed: replaced with Framer Motion animations in new components

  useEffect(() => {
    const handleOpenLogin = () => setIsLoginModalOpen(true);
    window.addEventListener("openLogin", handleOpenLogin);
    return () => window.removeEventListener("openLogin", handleOpenLogin);
  }, []);

  const handleLogin = (status) => {
    setIsLoggedIn(status);
    if (!status) {
      localStorage.setItem("userLoggedOut", "true");
      [
        "token",
        "user",
        "currentUser",
        "isLoggedIn",
        "authToken",
        "activeTab",
        "isVendor",
        "userEmail",
        "activationToken",
        "activeCartItems"
      ].forEach((k) => localStorage.removeItem(k));
      navigate("/");
    } else {
      localStorage.removeItem("userLoggedOut");
    }
    // Dispatch event to notify other components
    window.dispatchEvent(new Event("loginStateChanged"));
  };

  // Hide the main nav on vendor/seller-only pages
  const shouldHideNavbar = () => {
    return (
      location.pathname === "/SellerPage" ||
      location.pathname === "/SellerLogin" ||
      location.pathname.startsWith("/vendor")
    );
  };

  const handleVendorDetailsSubmit = (formData) => {
    // Handle the submission logic here
    console.log("Vendor details submitted", formData);
    // You can navigate to another page or perform other actions
  };

  // Function to check if footer should be hidden
  const shouldHideFooter = () => {
    return (
      location.pathname === "/SellerPage" ||
      location.pathname === "/SellerLogin" ||
      location.pathname.startsWith("/vendor")
    );
  };

  return (
    <SnackbarProvider maxSnack={3} autoHideDuration={3000} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
      <div className="app">
        {!shouldHideNavbar() && <AnnouncementBar />}
        {!shouldHideNavbar() && (
          <SdsNavbar
            isLoggedIn={isLoggedIn}
            onLogout={() => handleLogin(false)}
            openLoginModal={() => setIsLoginModalOpen(true)}
          />
        )}
        <LoginModal
          open={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onLoginSuccess={(status) => handleLogin(status)}
        />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<SdsHomePage />} />
            <Route path="/products" element={<ProductPage />} />
            <Route path="/combo" element={<NewCombo />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/combo/:id" element={<ComboDetail />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/categories" element={<CategoryPage />} />
            <Route path="/category/:id" element={<CategoryProducts />} />
            <Route path="/deals" element={<DealsPage />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/refund" element={<Refund />} />
            <Route
              path="/terms-and-conditions"
              element={<TermsAndConditions />}
            />
            <Route path="/PrivacyPolicy" element={<PrivacyPolicy />} />
            <Route path="/ShippingPolicy" element={<ShippingPolicy />} />
            <Route
              path="/ReturnRefundPolicy"
              element={<ReturnRefundPolicy />}
            />
            <Route path="/SellerLogin" element={<SellerLogin />} />
            <Route path="/SellerPage" element={<SellerPage />} />
            <Route path="/WhyChooseUs" element={<WhyChooseUs />} />
            <Route path="SellerDashboard" element={<SellerDashboard />} />
            <Route
              path="/vendor/register"
              element={<RegisterForm onRegister={handleLogin} />}
            />
            <Route path="/vendor" element={<VendorLandingPage />} />
            <Route path="/NavbarVendor" element={<VendorLandingPage />} />
            <Route
              path="/vendor/pending-approval"
              element={<PendingApproval />}
            />
            <Route
              path="/vendor/details"
              element={
                <VendorDetailsForm onSubmit={handleVendorDetailsSubmit} />
              }
            />
            <Route path="/vendor/dashboard" element={<VendorDashboard />} />
            <Route path="/vendor/login" element={<LoginForm />} />
            <Route path="/CheckoutPage" element={<CheckoutPage />} />
            <Route path="/blog" element={<BlogList />} />
            <Route path="/blog/:canonicalUrl" element={<BlogDetail />} />
            <Route path="/brand/:brandId" element={<BrandProducts />} />
            <Route path="/brands" element={<BrandProducts />} />
            <Route path="/wishlist" element={<WishlistPage />} />
          </Routes>
        </div>
        {!shouldHideFooter() && <SdsFooter />}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </SnackbarProvider>
  );
};

export default App;
