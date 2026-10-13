import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import { Search, ShoppingCart, Heart, User, LogOut, Menu, X, ChevronDown } from 'lucide-react';
import { useSnackbar } from 'notistack';
import { cartApi } from '../../APi/cartApi';
import { getWishlist } from '../../APi/userApi';
import { productApi } from '../../APi/productApi';
import { transformImageUrl } from '../../APi/utils';
import NotificationBell from './NotificationBell';
import SdsLogo from '../common/SdsLogo';
import './SdsNavbar.css';

// ── Helpers ──────────────────────────────────────────────────
/** Format a price in Indian numbering (e.g. ₹1,12,499) */
const formatINR = (amount) => {
  if (!amount && amount !== 0) return '';
  const num = Number(amount);
  return '₹' + num.toLocaleString('en-IN');
};

// ── Nav link configuration ───────────────────────────────────
const NAV_LINKS = [
  { label: 'Home', path: '/' },
  {
    label: 'Sarees',
    path: '/category/cat_silk_sarees',
    dropdown: [
      { label: 'All Silk Sarees', path: '/category/cat_silk_sarees' },
      { label: 'Kanchipuram Silk', path: '/category/cat_silk_sarees' },
      { label: 'Banarasi Silk', path: '/category/cat_silk_sarees' },
      { label: 'Soft Silk Sarees', path: '/category/cat_silk_sarees' },
      { label: 'Cotton & Daily Sarees', path: '/category/cat_cotton_sarees' },
    ],
  },
  {
    label: "Women's Wear",
    path: '/category/cat_womens_wear',
    dropdown: [
      { label: 'All Ethnic Wear', path: '/category/cat_womens_wear' },
      { label: 'Anarkali Suits', path: '/category/cat_womens_wear' },
      { label: 'Kurtis & Sets', path: '/category/cat_womens_wear' },
      { label: 'Designer Blouses', path: '/category/cat_womens_wear' },
    ],
  },
  {
    label: 'Jewellery',
    path: '/category/cat_jewellery',
    dropdown: [
      { label: 'All Heirloom Jewellery', path: '/category/cat_jewellery' },
      { label: 'Temple Jewellery', path: '/category/cat_jewellery' },
      { label: 'Bridal Jewellery Sets', path: '/category/cat_jewellery' },
      { label: 'Antique Gold Finish', path: '/category/cat_jewellery' },
    ],
  },
  { label: 'Bridal Collection', path: '/category/cat_bridal_wear' },
  { label: 'All Products', path: '/products' },
  { label: 'Offers', path: '/deals' },
];

// ── Mobile Drawer ────────────────────────────────────────────
const MobileDrawer = ({ isOpen, onClose, isLoggedIn, onOpenLogout }) => {
  if (!isOpen) return null;
  return createPortal(
    <AnimatePresence>
      <motion.div
        className="sds-mobile-overlay"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="sds-mobile-drawer"
          onClick={(e) => e.stopPropagation()}
          initial={{ x: '-100%' }}
          animate={{ x: 0 }}
          exit={{ x: '-100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 220 }}
        >
          {/* Header */}
          <div className="sds-drawer-header">
            <SdsLogo width={160} />
            <button className="sds-drawer-close" onClick={onClose} aria-label="Close menu">
              <X size={18} />
            </button>
          </div>

          {/* Nav links */}
          <nav className="sds-drawer-nav-list" aria-label="Mobile navigation">
            <div className="sds-drawer-section-title">Navigation</div>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="sds-drawer-nav-link"
                onClick={onClose}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Footer */}
          {isLoggedIn && (
            <div className="sds-drawer-footer">
              <button
                className="sds-drawer-logout-btn"
                onClick={() => { onClose(); onOpenLogout(); }}
              >
                <LogOut size={16} />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

// ── Logout Confirm Modal ─────────────────────────────────────
const LogoutModal = ({ onConfirm, onCancel }) =>
  createPortal(
    <motion.div
      className="sds-logout-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="sds-logout-modal"
        initial={{ scale: 0.9, y: 16 }}
        animate={{ scale: 1, y: 0 }}
      >
        <div className="sds-logo-center">
          <SdsLogo width={140} />
        </div>
        <h3>See you soon!</h3>
        <p>You are about to log out from your account. Are you sure?</p>
        <div className="sds-logout-actions">
          <button className="sds-btn sds-btn-secondary" onClick={onCancel}>Stay Here</button>
          <button className="sds-btn sds-btn-primary" onClick={onConfirm}>Yes, Log Out</button>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );

// ── Main Navbar ──────────────────────────────────────────────
const SdsNavbar = ({ isLoggedIn: propIsLoggedIn, onLogout, openLoginModal }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();

  const [isLoggedIn, setIsLoggedIn] = useState(propIsLoggedIn);
  const [username, setUsername] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [wishCount, setWishCount] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef(null);

  // Scroll handler
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch cart + wishlist counts
  const fetchCounts = useCallback(async () => {
    try {
      const [cartRes, wishRes] = await Promise.all([
        cartApi.getCart().catch(() => ({ success: true, cart: { items: [] } })),
        getWishlist().catch(() => ({ success: true, products: [] }))
      ]);
      if (cartRes?.success) setCartCount(cartRes.cart?.items?.length || 0);
      const wishArray =
        wishRes?.products ||
        wishRes?.wishlist?.products ||
        (Array.isArray(wishRes?.wishlist) ? wishRes.wishlist : []) ||
        (Array.isArray(wishRes) ? wishRes : []);
      setWishCount(wishArray.length || 0);
      const wishIds = wishArray.map((p) => p._id || p.productId || p.product?._id || p);
      localStorage.setItem('userWishlist', JSON.stringify(wishIds));
      window.dispatchEvent(new CustomEvent('wishlistSyncComplete'));
    } catch (err) {
      console.error('SdsNavbar: count fetch error', err);
    }
  }, []);

  // Auth state sync
  useEffect(() => {
    const syncAuth = () => {
      const token = localStorage.getItem('token');
      const user  = localStorage.getItem('user');
      if (token && user) {
        setIsLoggedIn(true);
        try { setUsername(JSON.parse(user).name || ''); } catch { setUsername(''); }
      } else {
        setIsLoggedIn(false);
        setUsername('');
      }
      fetchCounts();
    };
    syncAuth();
    window.addEventListener('storage', syncAuth);
    window.addEventListener('loginStateChanged', syncAuth);
    return () => {
      window.removeEventListener('storage', syncAuth);
      window.removeEventListener('loginStateChanged', syncAuth);
    };
  }, [fetchCounts, propIsLoggedIn]);

  // Cart/wishlist update events
  useEffect(() => {
    fetchCounts();
    window.addEventListener('cartUpdated', fetchCounts);
    window.addEventListener('wishlistUpdated', fetchCounts);
    return () => {
      window.removeEventListener('cartUpdated', fetchCounts);
      window.removeEventListener('wishlistUpdated', fetchCounts);
    };
  }, [fetchCounts, location.pathname]);

  // Search debounce
  useEffect(() => {
    if (searchText.length < 2) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await productApi.getSearchSuggestions(searchText);
        if (res?.data?.success) {
          const s = res.data.suggestions || {};
          setSearchResults([...(s.products || []), ...(s.combo || [])].slice(0, 10));
        } else {
          setSearchResults([]);
        }
      } catch { setSearchResults([]); }
      finally { setIsSearching(false); }
    }, 320);
    return () => clearTimeout(timer);
  }, [searchText]);

  const handleSearch = () => {
    if (!searchText.trim()) return;
    navigate(`/search?query=${encodeURIComponent(searchText)}&type=all`);
    setSearchText('');
    setSearchOpen(false);
  };

  const handleProductClick = (p) => {
    const id = p._id || p.id;
    navigate(`/product/${id}`);
    setSearchText('');
    setSearchOpen(false);
  };

  const handleLogoutConfirm = () => {
    ['user', 'token', 'isLoggedIn', 'authToken', 'activeTab', 'isVendor'].forEach((k) =>
      localStorage.removeItem(k)
    );
    setIsLoggedIn(false);
    setUsername('');
    setLogoutOpen(false);
    window.dispatchEvent(new Event('loginStateChanged'));
    enqueueSnackbar('Successfully logged out', { variant: 'success' });
    navigate('/');
    if (onLogout) onLogout(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <header>
        <nav
          className={`sds-navbar${isScrolled ? ' scrolled' : ''}`}
          role="navigation"
          aria-label="Main navigation"
        >
          <div className="sds-navbar-inner">
            {/* Hamburger (mobile) */}
            <button
              className="sds-hamburger"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
              aria-expanded={drawerOpen}
            >
              <Menu size={24} />
            </button>

            {/* Logo */}
            <Link to="/" className="sds-nav-logo" aria-label="Shri Deepaalaya Silks — home">
              <SdsLogo width={200} />
            </Link>

            {/* Center nav links (desktop) */}
            <nav className="sds-nav-links" aria-label="Site navigation">
              {NAV_LINKS.map((link) =>
                link.dropdown ? (
                  <div key={link.path} className="sds-nav-dropdown">
                    <Link
                      to={link.path}
                      className={`sds-nav-link${isActive(link.path) ? ' active' : ''}`}
                      aria-haspopup="true"
                    >
                      {link.label}
                      <span className="sds-nav-caret" aria-hidden="true">▾</span>
                    </Link>
                    <div className="sds-nav-dropdown-menu" role="menu">
                      {link.dropdown.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          className="sds-dropdown-item"
                          role="menuitem"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`sds-nav-link${isActive(link.path) ? ' active' : ''}`}
                  >
                    {link.label}
                  </Link>
                )
              )}
            </nav>

            {/* Right utilities */}
            <div className="sds-nav-utils">
              {/* Static INR label */}
              <span className="sds-currency-label" aria-label="Currency: Indian Rupee">INR</span>

              {/* Search icon (desktop opens inline; mobile uses search row) */}
              <button
                className="sds-nav-icon-btn"
                aria-label="Search"
                onClick={() => {
                  setSearchOpen((v) => !v);
                  setTimeout(() => searchRef.current?.focus(), 50);
                }}
              >
                <Search size={20} />
              </button>

              {/* Wishlist */}
              <Link to="/wishlist" className="sds-nav-icon-btn" aria-label={`Wishlist (${wishCount} items)`}>
                <Heart size={20} />
                {wishCount > 0 && (
                  <span className="sds-icon-badge" aria-hidden="true">{wishCount}</span>
                )}
              </Link>

              {/* Cart */}
              <Link to="/cart" className="sds-nav-icon-btn" aria-label={`Cart (${cartCount} items)`}>
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="sds-icon-badge" aria-hidden="true">{cartCount}</span>
                )}
              </Link>

              {/* Notifications */}
              <NotificationBell />

              {/* User / Login */}
              {isLoggedIn ? (
                <>
                  <button
                    className="sds-user-avatar"
                    onClick={() => navigate('/profile')}
                    aria-label="My account"
                    title={username || 'My account'}
                  >
                    {username.charAt(0).toUpperCase() || <User size={14} />}
                  </button>
                  <button
                    className="sds-nav-icon-btn"
                    onClick={() => setLogoutOpen(true)}
                    aria-label="Log out"
                    title="Log out"
                  >
                    <LogOut size={18} />
                  </button>
                </>
              ) : (
                <button className="sds-nav-login-btn" onClick={openLoginModal} aria-label="Login or register">
                  <User size={16} />
                  <span>Login</span>
                </button>
              )}
            </div>
          </div>

          {/* Search bar row (toggle on desktop icon click, always visible on mobile) */}
          {(searchOpen) && (
            <div className="sds-mobile-search-row" style={{ display: 'block' }}>
              <div className="sds-search-bar" style={{ position: 'relative' }}>
                <Search size={16} style={{ color: 'var(--color-gold)', flexShrink: 0 }} />
                <input
                  ref={searchRef}
                  type="search"
                  placeholder="Search silk sarees, jewellery, kurtis…"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  onFocus={() => setSearchOpen(true)}
                  aria-label="Search products"
                />
                {searchText && (
                  <button
                    onClick={() => setSearchText('')}
                    style={{ background: 'none', color: 'var(--color-text-muted)', padding: '0 4px', flexShrink: 0 }}
                    aria-label="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}

                {/* Dropdown suggestions */}
                {searchText.length >= 2 && (
                  <div className="sds-search-dropdown">
                    {searchResults.length > 0 ? (
                      searchResults.map((p) => {
                        const name  = p.name || p.pName || 'Product';
                        const image = p.image || (Array.isArray(p.pImage) ? p.pImage[0] : p.pImage);
                        const price = p.price || p.pPrice;
                        const cat   = p.category?.cName || p.category || p.pCategory?.cName || '';
                        return (
                          <div
                            key={p._id || p.id}
                            className="sds-search-result-item"
                            onClick={() => handleProductClick(p)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === 'Enter' && handleProductClick(p)}
                          >
                            <img
                              src={transformImageUrl(image)}
                              alt={name}
                              className="sds-search-result-img"
                              loading="lazy"
                            />
                            <div>
                              <span className="sds-search-result-name">{name}</span>
                              <span className="sds-search-result-cat">{cat}</span>
                            </div>
                            <span className="sds-search-result-price">{formatINR(price)}</span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="sds-search-result-item" style={{ justifyContent: 'center', color: 'var(--color-text-muted)' }}>
                        {isSearching ? 'Searching…' : 'No results found'}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Mobile search row (always shown on mobile regardless of searchOpen) */}
          <div className="sds-mobile-search-row">
            <div className="sds-search-bar">
              <Search size={16} style={{ color: 'var(--color-gold)', flexShrink: 0 }} />
              <input
                type="search"
                placeholder="Search sarees, jewellery…"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                onFocus={() => setSearchOpen(true)}
                onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
                aria-label="Search products"
              />
              {searchText && (
                <button onClick={() => setSearchText('')} aria-label="Clear" style={{ background: 'none', color: 'var(--color-text-muted)' }}>
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile drawer */}
      <MobileDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        isLoggedIn={isLoggedIn}
        onOpenLogout={() => setLogoutOpen(true)}
      />

      {/* Logout modal */}
      <AnimatePresence>
        {logoutOpen && (
          <LogoutModal
            onConfirm={handleLogoutConfirm}
            onCancel={() => setLogoutOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default SdsNavbar;
