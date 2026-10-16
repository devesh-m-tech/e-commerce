import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import { Search, ShoppingCart, Heart, User, LogOut, Menu, X, ArrowRight, ChevronRight, Sparkles, Tag, Palette, Folder, Mic, MicOff } from 'lucide-react';
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

/** Map color names to representative luxury HEX swatches */
const getColorHex = (name = '') => {
  const n = String(name).toLowerCase();
  if (n.includes('red') || n.includes('crimson') || n.includes('ruby')) return '#8B1834';
  if (n.includes('maroon') || n.includes('burgundy')) return '#6D1734';
  if (n.includes('blue') || n.includes('peacock') || n.includes('sapphire')) return '#0B4F6C';
  if (n.includes('navy')) return '#1B263B';
  if (n.includes('green') || n.includes('mint') || n.includes('emerald')) return '#1E5E3A';
  if (n.includes('olive')) return '#556B2F';
  if (n.includes('gold') || n.includes('yellow') || n.includes('mustard') || n.includes('zari')) return '#C5A15A';
  if (n.includes('pink') || n.includes('rose') || n.includes('magenta') || n.includes('rani')) return '#C25975';
  if (n.includes('orange') || n.includes('rust') || n.includes('copper')) return '#C3522C';
  if (n.includes('peach') || n.includes('coral')) return '#E07A5F';
  if (n.includes('purple') || n.includes('violet') || n.includes('lavender')) return '#6A3D73';
  if (n.includes('white') || n.includes('ivory') || n.includes('cream')) return '#EFE7DA';
  if (n.includes('black') || n.includes('charcoal')) return '#282321';
  if (n.includes('silver') || n.includes('grey') || n.includes('gray')) return '#A8A29E';
  return '#C5A15A';
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
  { label: 'About Us', path: '/about-us' },
  { label: 'Offers', path: '/deals' },
];

const DRAWER_HELP_LINKS = [
  { label: 'Track Order', path: '/order-tracking' },
  { label: 'Exchange Request', path: '/exchange-request' },
  { label: 'Contact Us', path: '/contact-us' },
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
            <div className="sds-drawer-section-title">Collections</div>
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

            <div className="sds-drawer-section-title" style={{ marginTop: '12px' }}>Customer Care</div>
            {DRAWER_HELP_LINKS.map((link) => (
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
  const [categorySuggestions, setCategorySuggestions] = useState([]);
  const [colorSuggestions, setColorSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const searchRef = useRef(null);
  const navRef = useRef(null);
  const recognitionRef = useRef(null);

  // Scroll handler
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keep --sds-navbar-height dynamically synced for sticky elements underneath
  useEffect(() => {
    const updateNavHeight = () => {
      if (navRef.current) {
        const h = navRef.current.getBoundingClientRect().height;
        if (h > 0) {
          document.documentElement.style.setProperty('--sds-navbar-height', `${Math.round(h)}px`);
        }
      }
    };
    updateNavHeight();
    window.addEventListener('resize', updateNavHeight);
    return () => window.removeEventListener('resize', updateNavHeight);
  }, [isScrolled]);

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
      const isLoggedOut = localStorage.getItem('userLoggedOut') === 'true';
      const token = localStorage.getItem('token');
      const user  = localStorage.getItem('user') || localStorage.getItem('currentUser');
      if (token && user && !isLoggedOut) {
        setIsLoggedIn(true);
        try {
          const parsed = typeof user === 'string' ? JSON.parse(user) : user;
          setUsername(parsed.name || '');
        } catch {
          setUsername('');
        }
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
    if (searchText.length < 2) {
      setSearchResults([]);
      setCategorySuggestions([]);
      setColorSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await productApi.getSearchSuggestions(searchText);
        const data = res?.data || res;
        if (data?.success) {
          const s = data.suggestions || {};
          setSearchResults([...(s.products || []), ...(s.combo || [])].slice(0, 8));
          setCategorySuggestions(s.categories || []);
          setColorSuggestions(s.colors || []);
        } else {
          setSearchResults([]);
          setCategorySuggestions([]);
          setColorSuggestions([]);
        }
      } catch {
        setSearchResults([]);
        setCategorySuggestions([]);
        setColorSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 280);
    return () => clearTimeout(timer);
  }, [searchText]);

  // Close search overlay on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && searchOpen) {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen]);

  // Close search overlay on route change
  useEffect(() => {
    setSearchOpen(false);
  }, [location.pathname]);

  // Auto-focus input when search panel opens
  useEffect(() => {
    if (searchOpen) {
      const t = setTimeout(() => searchRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
  }, [searchOpen]);

  const handleSearch = (term = searchText) => {
    if (!term || !term.trim()) return;
    const clean = term.trim();
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    navigate(`/products?q=${encodeURIComponent(clean)}`);
    setSearchText('');
    setSearchOpen(false);
  };

  // ── Voice Search via Web Speech API ────────────────────────────
  const toggleVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      enqueueSnackbar('Voice search requires Chrome, Edge, or Safari browser. Please type your search.', {
        variant: 'info'
      });
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-IN'; // Optimized for Indian English & saree keywords

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const heard = finalTranscript || interimTranscript;
        if (heard) {
          setSearchText(heard);
        }

        if (finalTranscript && finalTranscript.trim()) {
          setTimeout(() => {
            handleSearch(finalTranscript.trim());
          }, 350);
        }
      };

      recognition.onerror = (event) => {
        console.warn('Voice search error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          enqueueSnackbar('Microphone permission denied. Please allow microphone access in your browser.', {
            variant: 'warning'
          });
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error('Speech recognition error:', err);
      setIsListening(false);
    }
  };

  // Stop voice recognition when search panel closes or unmounts
  useEffect(() => {
    if (!searchOpen && recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [searchOpen, isListening]);

  const handleCategorySuggestionClick = (cat) => {
    const catName = typeof cat === 'string' ? cat : cat.name || cat.categoryName;
    navigate(`/products?category=${encodeURIComponent(catName)}`);
    setSearchText('');
    setSearchOpen(false);
  };

  const handleColorSuggestionClick = (color) => {
    const colorName = typeof color === 'string' ? color : color.name;
    navigate(`/products?q=${encodeURIComponent(colorName)}`);
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
    localStorage.setItem('userLoggedOut', 'true');
    ['user', 'currentUser', 'token', 'isLoggedIn', 'authToken', 'activeTab', 'isVendor', 'userEmail', 'activationToken', 'activeCartItems'].forEach((k) =>
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
          ref={navRef}
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
                          key={`${item.path}-${item.label}`}
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
              {/* Search toggle */}
              <button
                className={`sds-nav-icon-btn${searchOpen ? ' active' : ''}`}
                aria-label={searchOpen ? "Close search" : "Search"}
                aria-expanded={searchOpen}
                onClick={() => setSearchOpen((v) => !v)}
              >
                {searchOpen ? <X size={20} /> : <Search size={20} />}
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

          {/* ── Luxury Animated Search Panel ── */}
          <AnimatePresence>
            {searchOpen && (
              <motion.div
                className="sds-search-panel-wrapper"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="sds-search-panel-inner">
                  {/* Search Input Box */}
                  <div className={`sds-search-input-box ${isListening ? 'sds-voice-active' : ''}`}>
                    <Search size={20} className="sds-search-box-icon" />
                    <input
                      ref={searchRef}
                      type="search"
                      placeholder={
                        isListening
                          ? "Listening... Speak now (பேசுங்கள்)..."
                          : "Search by product name, color, or collection (e.g. Kanchipuram, Red, Jewellery)…"
                      }
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      aria-label="Search products"
                      className="sds-search-box-input"
                    />

                    {/* Luxury Voice Search Button */}
                    <button
                      type="button"
                      onClick={toggleVoiceSearch}
                      className={`sds-search-voice-btn ${isListening ? 'listening' : ''}`}
                      title={isListening ? 'Listening... Click to stop (பேசலாம்)' : 'Voice Search (பேசி தேடலாம்)'}
                      aria-label="Voice search"
                    >
                      {isListening ? (
                        <span className="sds-voice-listening-wrap">
                          <Mic size={17} className="sds-mic-pulse" />
                        </span>
                      ) : (
                        <Mic size={17} />
                      )}
                    </button>

                    {searchText && (
                      <button
                        type="button"
                        onClick={() => setSearchText("")}
                        className="sds-search-box-clear"
                        aria-label="Clear search text"
                      >
                        <X size={16} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setSearchOpen(false)}
                      className="sds-search-box-close"
                      aria-label="Close search"
                    >
                      <span className="sds-search-esc-tag">ESC</span>
                      <X size={18} />
                    </button>
                  </div>

                  {/* Active Voice Listening Banner */}
                  {isListening && (
                    <motion.div
                      className="sds-voice-status-banner"
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                    >
                      <span className="sds-voice-pulse-dot" />
                      <span className="sds-voice-status-text">
                        Listening... Speak product name, color, or style (e.g. <em>"Kanchipuram Silk Saree"</em>, <em>"Bridal Red"</em>, <em>"Temple Jewellery"</em>)
                      </span>
                      <button
                        type="button"
                        onClick={toggleVoiceSearch}
                        className="sds-voice-stop-btn"
                        aria-label="Stop voice search"
                      >
                        Stop
                      </button>
                    </motion.div>
                  )}

                  {/* Trending suggestions when search is empty */}
                  {!searchText && (
                    <motion.div
                      className="sds-search-trending-row"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05, duration: 0.2 }}
                    >
                      <span className="sds-trending-label">Trending Searches:</span>
                      <div className="sds-trending-tags">
                        {[
                          "Kanchipuram Silk",
                          "Bridal Sarees",
                          "Temple Jewellery",
                          "Banarasi Silk",
                          "Soft Silk Sarees",
                          "Pure Zari Weaves",
                        ].map((term) => (
                          <button
                            key={term}
                            type="button"
                            className="sds-trending-tag"
                            onClick={() => handleSearch(term)}
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Search Results Dropdown List ("Dropdown Wise") */}
                  {searchText.length >= 2 && (
                    <motion.div
                      className="sds-search-dropdown-menu"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.18 }}
                    >
                      {isSearching ? (
                        <div className="sds-dropdown-status-row">
                          <span className="sds-search-spinner" /> Searching royal collections for "{searchText}"…
                        </div>
                      ) : (searchResults.length > 0 || categorySuggestions.length > 0 || colorSuggestions.length > 0) ? (
                        <div className="sds-dropdown-scroll-body">
                          {/* 1. Collections & Categories Dropdown List */}
                          {categorySuggestions.length > 0 && (
                            <div className="sds-dropdown-section">
                              <div className="sds-dropdown-section-header">
                                <Folder size={13} className="sds-dropdown-section-icon" />
                                <span>Collections & Categories</span>
                              </div>
                              <div className="sds-dropdown-list">
                                {categorySuggestions.map((cat, idx) => {
                                  const catName = cat.name || cat.categoryName || cat;
                                  return (
                                    <div
                                      key={`cat-${idx}`}
                                      className="sds-dropdown-item sds-dropdown-cat-item"
                                      onClick={() => handleCategorySuggestionClick(cat)}
                                      role="button"
                                      tabIndex={0}
                                      onKeyDown={(e) => e.key === "Enter" && handleCategorySuggestionClick(cat)}
                                    >
                                      <div className="sds-dropdown-item-main">
                                        <Tag size={13} className="sds-dropdown-subicon" />
                                        <span className="sds-dropdown-item-title">{catName}</span>
                                      </div>
                                      <span className="sds-dropdown-item-badge">
                                        in Collections <ChevronRight size={13} />
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* 2. Color Shades Dropdown List */}
                          {colorSuggestions.length > 0 && (
                            <div className="sds-dropdown-section">
                              <div className="sds-dropdown-section-header">
                                <Palette size={13} className="sds-dropdown-section-icon" />
                                <span>Colors & Shades</span>
                              </div>
                              <div className="sds-dropdown-list">
                                {colorSuggestions.map((col, idx) => {
                                  const colName = col.name || col;
                                  return (
                                    <div
                                      key={`col-${idx}`}
                                      className="sds-dropdown-item sds-dropdown-color-item"
                                      onClick={() => handleColorSuggestionClick(col)}
                                      role="button"
                                      tabIndex={0}
                                      onKeyDown={(e) => e.key === "Enter" && handleColorSuggestionClick(col)}
                                    >
                                      <div className="sds-dropdown-item-main">
                                        <span
                                          className="sds-dropdown-color-swatch"
                                          style={{ backgroundColor: getColorHex(colName) }}
                                        />
                                        <span className="sds-dropdown-item-title">{colName}</span>
                                      </div>
                                      <span className="sds-dropdown-item-badge">
                                        Filter by Shade <ChevronRight size={13} />
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* 3. Products Dropdown List */}
                          {searchResults.length > 0 && (
                            <div className="sds-dropdown-section">
                              <div className="sds-dropdown-section-header">
                                <Sparkles size={13} className="sds-dropdown-section-icon" />
                                <span>Handcrafted Sarees & Jewellery ({searchResults.length})</span>
                              </div>
                              <div className="sds-dropdown-product-list">
                                {searchResults.map((p) => {
                                  const name = p.name || p.pName || "Silk Saree";
                                  const image = p.image || (Array.isArray(p.pImage) ? p.pImage[0] : p.pImage);
                                  const price = p.price || p.pPrice;
                                  const cat = p.category?.cName || p.category || p.pCategory?.cName || p.pCategory || "";
                                  const color = p.color || "";
                                  return (
                                    <div
                                      key={p._id || p.id}
                                      className="sds-dropdown-product-row"
                                      onClick={() => handleProductClick(p)}
                                      role="button"
                                      tabIndex={0}
                                      onKeyDown={(e) => e.key === "Enter" && handleProductClick(p)}
                                    >
                                      <img
                                        src={transformImageUrl(image)}
                                        alt={name}
                                        className="sds-dropdown-product-thumb"
                                        loading="lazy"
                                      />
                                      <div className="sds-dropdown-product-info">
                                        <h5 className="sds-dropdown-product-title">{name}</h5>
                                        <div className="sds-dropdown-product-tags">
                                          {cat && <span className="sds-dropdown-tag-cat">{cat}</span>}
                                          {color && (
                                            <span className="sds-dropdown-tag-color">
                                              <span
                                                className="sds-dropdown-tag-color-dot"
                                                style={{ backgroundColor: getColorHex(color) }}
                                              />
                                              {color}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      <div className="sds-dropdown-product-price-col">
                                        <span className="sds-dropdown-product-price">{formatINR(price)}</span>
                                        <ChevronRight size={15} className="sds-dropdown-arrow-icon" />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Dropdown Footer: See all results */}
                          <div
                            className="sds-dropdown-footer-row"
                            onClick={() => handleSearch(searchText)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === "Enter" && handleSearch(searchText)}
                          >
                            <div className="sds-dropdown-footer-left">
                              <Search size={14} className="sds-dropdown-footer-icon" />
                              <span>
                                View all matching results for <strong>"{searchText}"</strong>
                              </span>
                            </div>
                            <div className="sds-dropdown-footer-right">
                              <span>Search Catalog</span>
                              <ArrowRight size={14} />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="sds-dropdown-empty-state">
                          <div className="sds-dropdown-empty-icon-wrap">
                            <Search size={22} />
                          </div>
                          <div className="sds-dropdown-empty-text">
                            <h4>No royal pieces found matching "{searchText}"</h4>
                            <p>
                              Try searching by <strong>Product Name</strong> (e.g. Kanchipuram, Banarasi), <strong>Color</strong> (e.g. Red, Blue, Gold, Green), or <strong>Collection</strong> (e.g. Silk Sarees, Temple Jewellery).
                            </p>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      </header>

      {/* Backdrop overlay when search is open */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            className="sds-search-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setSearchOpen(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

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
