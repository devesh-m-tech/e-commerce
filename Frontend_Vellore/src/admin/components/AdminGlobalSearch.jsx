import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Box,
  InputBase,
  Paper,
  Typography,
  Chip,
  IconButton,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Button,
  ClickAwayListener,
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  ViewCarousel as ViewCarouselIcon,
  Inventory as InventoryIcon,
  Category as CategoryIcon,
  ShoppingCart as ShoppingCartIcon,
  Settings as SettingsIcon,
  People as PeopleIcon,
  ArrowForward as ArrowForwardIcon,
  Edit as EditIcon,
  Launch as LaunchIcon,
  FlashOn as FlashOnIcon,
  Assessment as AssessmentIcon,
  Storefront as StorefrontIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getAllBanners } from '../api/bannerApi';
import { productApi } from '../api/productApi';
import { categoryApi } from '../api/categoryApi';
import { fetchOrders } from '../api/dashboardApi';
import { SERVER_URL } from '../../config/envConfig.js';

const BACKEND_BASE = SERVER_URL;

const resolveImage = (img) => {
  if (!img) return '';
  if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('data:image')) {
    return img;
  }
  const clean = img.replace(/\\/g, '/');
  return clean.startsWith('/') ? `${BACKEND_BASE}${clean}` : `${BACKEND_BASE}/${clean}`;
};

const STATIC_PAGES = [
  { name: 'Dashboard', path: '/', icon: <StorefrontIcon fontSize="small" />, category: 'PAGE' },
  { name: 'Hero Banners (Homepage Slider)', path: '/banners', icon: <ViewCarouselIcon fontSize="small" />, category: 'PAGE' },
  { name: 'Products & Inventory', path: '/products', icon: <InventoryIcon fontSize="small" />, category: 'PAGE' },
  { name: 'Categories & Subcategories', path: '/categories', icon: <CategoryIcon fontSize="small" />, category: 'PAGE' },
  { name: 'Orders Management', path: '/orders', icon: <ShoppingCartIcon fontSize="small" />, category: 'PAGE' },
  { name: 'Combo Offers', path: '/combo-offers', icon: <FlashOnIcon fontSize="small" />, category: 'PAGE' },
  { name: 'Deals & Discounts', path: '/deals', icon: <FlashOnIcon fontSize="small" />, category: 'PAGE' },
  { name: 'Vendors / Artisans', path: '/vendors', icon: <PeopleIcon fontSize="small" />, category: 'PAGE' },
  { name: 'Reports & Analytics', path: '/reports', icon: <AssessmentIcon fontSize="small" />, category: 'PAGE' },
  { name: 'Store Settings & Policies', path: '/settings', icon: <SettingsIcon fontSize="small" />, category: 'PAGE' },
];

const AdminGlobalSearch = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [banners, setBanners] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const inputRef = useRef(null);

  // Pre-load or fetch on focus
  const loadSearchData = useCallback(async () => {
    if (dataLoaded) return;
    setLoading(true);
    try {
      const [bannersRes, productsRes, categoriesRes, ordersRes] = await Promise.allSettled([
        getAllBanners(),
        productApi.getAllProducts(1, 100),
        categoryApi.getAllCategories(),
        fetchOrders()
      ]);

      if (bannersRes.status === 'fulfilled') {
        const raw = bannersRes.value;
        setBanners(Array.isArray(raw) ? raw : raw?.banners || []);
      }
      if (productsRes.status === 'fulfilled') {
        const raw = productsRes.value;
        setProducts(Array.isArray(raw?.products) ? raw.products : Array.isArray(raw) ? raw : []);
      }
      if (categoriesRes.status === 'fulfilled') {
        const raw = categoriesRes.value;
        setCategories(Array.isArray(raw?.categories) ? raw.categories : Array.isArray(raw) ? raw : []);
      }
      if (ordersRes.status === 'fulfilled') {
        const raw = ordersRes.value;
        setOrders(Array.isArray(raw?.orders) ? raw.orders : []);
      }
      setDataLoaded(true);
    } catch (err) {
      console.warn('AdminGlobalSearch: Error prefetching data', err);
    } finally {
      setLoading(false);
    }
  }, [dataLoaded]);

  // Keyboard shortcut Ctrl+K or / to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
        loadSearchData();
      } else if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [loadSearchData]);

  const handleFocus = () => {
    setIsOpen(true);
    loadSearchData();
  };

  const handleClear = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  // Filtered Results
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return {
        banners: [],
        products: [],
        categories: [],
        orders: [],
        pages: STATIC_PAGES.slice(0, 5),
        isEmpty: true,
      };
    }

    const matchedBanners = banners.filter((b) =>
      (b.title && b.title.toLowerCase().includes(q)) ||
      (b.subtitle && b.subtitle.toLowerCase().includes(q)) ||
      (b.tag && b.tag.toLowerCase().includes(q)) ||
      'hero banner'.includes(q)
    );

    const matchedProducts = products.filter((p) =>
      (p.pName && p.pName.toLowerCase().includes(q)) ||
      (p.pSku && p.pSku.toLowerCase().includes(q)) ||
      (p.pDescription && p.pDescription.toLowerCase().includes(q))
    );

    const matchedCategories = categories.filter((c) =>
      (c.cName && c.cName.toLowerCase().includes(q)) ||
      (c.name && c.name.toLowerCase().includes(q))
    );

    const matchedOrders = orders.filter((o) =>
      (o._id && o._id.toLowerCase().includes(q)) ||
      (o.shippingAddress?.fullName && o.shippingAddress.fullName.toLowerCase().includes(q)) ||
      (o.orderStatus && o.orderStatus.toLowerCase().includes(q))
    );

    const matchedPages = STATIC_PAGES.filter((p) =>
      p.name.toLowerCase().includes(q)
    );

    const totalCount =
      matchedBanners.length +
      matchedProducts.length +
      matchedCategories.length +
      matchedOrders.length +
      matchedPages.length;

    return {
      banners: matchedBanners.slice(0, 4),
      products: matchedProducts.slice(0, 6),
      categories: matchedCategories.slice(0, 4),
      orders: matchedOrders.slice(0, 3),
      pages: matchedPages.slice(0, 4),
      totalCount,
      isEmpty: false,
    };
  }, [query, banners, products, categories, orders]);

  const handleSelect = (action) => {
    setIsOpen(false);
    setQuery('');
    action();
  };

  return (
    <ClickAwayListener onClickAway={() => setIsOpen(false)}>
      <Box sx={{ position: 'relative', width: { xs: '180px', sm: '260px', md: '360px', lg: '420px' } }}>
        {/* Search Bar Input */}
        <Paper
          component="form"
          onSubmit={(e) => e.preventDefault()}
          elevation={0}
          sx={{
            display: 'flex',
            alignItems: 'center',
            bgcolor: 'rgba(255, 255, 255, 0.12)',
            borderRadius: '24px',
            border: isOpen ? '1.5px solid #F4D086' : '1px solid rgba(197, 161, 90, 0.4)',
            boxShadow: isOpen ? '0 0 12px rgba(244, 208, 134, 0.35)' : 'none',
            transition: 'all 0.25s ease',
            px: 1.5,
            py: 0.3,
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.18)',
              borderColor: '#F4D086',
            },
          }}
        >
          <SearchIcon sx={{ color: '#F4D086', fontSize: 20, mr: 1 }} />
          <InputBase
            inputRef={inputRef}
            placeholder="Search products, banners, pages..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={handleFocus}
            sx={{
              flex: 1,
              color: '#FFFFFF',
              fontSize: '0.85rem',
              '& input::placeholder': {
                color: 'rgba(255, 255, 255, 0.65)',
                opacity: 1,
              },
            }}
          />
          {loading && <CircularProgress size={16} sx={{ color: '#F4D086', mr: 0.5 }} />}
          {query ? (
            <IconButton size="small" onClick={handleClear} sx={{ color: 'rgba(255, 255, 255, 0.8)', p: 0.3 }}>
              <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>
          ) : (
            <Chip
              label="Ctrl K"
              size="small"
              sx={{
                height: 18,
                fontSize: '0.62rem',
                fontWeight: 700,
                bgcolor: 'rgba(0, 0, 0, 0.25)',
                color: '#F4D086',
                border: '1px solid rgba(197, 161, 90, 0.3)',
                borderRadius: '4px',
                display: { xs: 'none', md: 'inline-flex' },
                cursor: 'pointer',
              }}
            />
          )}
        </Paper>

        {/* Live Instant Dropdown Results */}
        {isOpen && (
          <Paper
            elevation={10}
            sx={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: 0,
              right: 0,
              width: { xs: '300px', sm: '380px', md: '460px', lg: '500px' },
              maxWidth: '95vw',
              bgcolor: '#FFFDF9',
              borderRadius: '12px',
              border: '1.5px solid #C5A15A',
              boxShadow: '0 16px 40px rgba(40, 10, 20, 0.25)',
              zIndex: 1400,
              maxHeight: '520px',
              overflowY: 'auto',
              overflowX: 'hidden',
              animation: 'fadeIn 0.2s ease',
            }}
          >
            {/* Header info */}
            <Box sx={{ px: 2, py: 1.2, bgcolor: '#FAF7F2', borderBottom: '1px solid #EDE2D2', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#6D1734', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                {results.isEmpty ? 'Quick Navigation & Shortcuts' : `Search Results (${results.totalCount || 0})`}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {results.isEmpty ? 'Type to search everything' : 'Click item to open & update'}
              </Typography>
            </Box>

            {/* If searching with zero results */}
            {!results.isEmpty && results.totalCount === 0 && (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <SearchIcon sx={{ fontSize: 40, color: '#C5A15A', mb: 1, opacity: 0.6 }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#282321' }}>
                  No matches found for "{query}"
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                  Try searching by product name, banner title, category, or order number.
                </Typography>
              </Box>
            )}

            <List disablePadding>
              {/* 1. HERO BANNERS SECTION */}
              {results.banners.length > 0 && (
                <>
                  <Box sx={{ px: 2, pt: 1.5, pb: 0.5 }}>
                    <Chip
                      icon={<ViewCarouselIcon sx={{ fontSize: '14px !important', color: '#6D1734 !important' }} />}
                      label="HERO BANNERS"
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.66rem',
                        fontWeight: 800,
                        bgcolor: 'rgba(109, 23, 52, 0.1)',
                        color: '#6D1734',
                        border: '1px solid rgba(109, 23, 52, 0.25)',
                      }}
                    />
                  </Box>
                  {results.banners.map((banner) => (
                    <ListItem
                      key={banner._id}
                      disablePadding
                      secondaryAction={
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<EditIcon sx={{ fontSize: '13px !important' }} />}
                          onClick={() => handleSelect(() => navigate(`/banners?edit=${banner._id}`))}
                          sx={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            borderColor: '#C5A15A',
                            color: '#6D1734',
                            py: 0.3,
                            px: 1,
                            mr: 1,
                            '&:hover': {
                              bgcolor: 'rgba(197, 161, 90, 0.15)',
                              borderColor: '#6D1734',
                            },
                          }}
                        >
                          Edit
                        </Button>
                      }
                    >
                      <ListItemButton
                        onClick={() => handleSelect(() => navigate(`/banners?edit=${banner._id}`))}
                        sx={{ py: 1, px: 2, '&:hover': { bgcolor: '#FBF9F5' } }}
                      >
                        <ListItemAvatar sx={{ minWidth: 50 }}>
                          <Avatar
                            variant="rounded"
                            src={resolveImage(banner.imageUrl)}
                            sx={{ width: 42, height: 42, bgcolor: '#420D1E', border: '1px solid #EDE2D2' }}
                          >
                            <ViewCarouselIcon sx={{ color: '#F4D086' }} />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 700, color: '#282321' }} noWrap>
                                {banner.title || 'Untitled Banner'}
                              </Typography>
                              <Chip
                                label={banner.isActive ? 'Active' : 'Hidden'}
                                size="small"
                                sx={{
                                  height: 16,
                                  fontSize: '0.6rem',
                                  fontWeight: 700,
                                  bgcolor: banner.isActive ? 'rgba(46, 125, 50, 0.12)' : 'rgba(0, 0, 0, 0.08)',
                                  color: banner.isActive ? '#2e7d32' : '#666',
                                }}
                              />
                            </Box>
                          }
                          secondary={
                            <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                              {banner.tag || 'Handloom Heritage'} • Order #{banner.order || 1}
                            </Typography>
                          }
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                  <Divider sx={{ my: 1, borderColor: '#EDE2D2' }} />
                </>
              )}

              {/* 2. PRODUCTS SECTION */}
              {results.products.length > 0 && (
                <>
                  <Box sx={{ px: 2, pt: 1, pb: 0.5 }}>
                    <Chip
                      icon={<InventoryIcon sx={{ fontSize: '14px !important', color: '#1565c0 !important' }} />}
                      label="PRODUCTS"
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.66rem',
                        fontWeight: 800,
                        bgcolor: 'rgba(21, 101, 192, 0.1)',
                        color: '#1565c0',
                        border: '1px solid rgba(21, 101, 192, 0.25)',
                      }}
                    />
                  </Box>
                  {results.products.map((product) => {
                    const img = Array.isArray(product.pImage) ? product.pImage[0] : product.pImage;
                    return (
                      <ListItem
                        key={product._id}
                        disablePadding
                        secondaryAction={
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<EditIcon sx={{ fontSize: '13px !important' }} />}
                            onClick={() => handleSelect(() => navigate(`/products?search=${encodeURIComponent(product.pName || '')}&edit=${product._id}`))}
                            sx={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              borderColor: '#C5A15A',
                              color: '#6D1734',
                              py: 0.3,
                              px: 1,
                              mr: 1,
                              '&:hover': {
                                bgcolor: 'rgba(197, 161, 90, 0.15)',
                                borderColor: '#6D1734',
                              },
                            }}
                          >
                            Edit
                          </Button>
                        }
                      >
                        <ListItemButton
                          onClick={() => handleSelect(() => navigate(`/products?search=${encodeURIComponent(product.pName || '')}&edit=${product._id}`))}
                          sx={{ py: 1, px: 2, '&:hover': { bgcolor: '#FBF9F5' } }}
                        >
                          <ListItemAvatar sx={{ minWidth: 50 }}>
                            <Avatar
                              variant="rounded"
                              src={resolveImage(img)}
                              sx={{ width: 42, height: 42, bgcolor: '#f0f0f0', border: '1px solid #EDE2D2' }}
                            >
                              <InventoryIcon sx={{ color: '#C5A15A' }} />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography variant="body2" sx={{ fontWeight: 700, color: '#282321' }} noWrap>
                                {product.pName || 'Product'}
                              </Typography>
                            }
                            secondary={
                              <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                                ₹{product.pPrice || product.price || 0} • Stock: {product.pStock ?? product.stock ?? 'N/A'} • {product.pSku ? `SKU: ${product.pSku}` : 'Silk saree'}
                              </Typography>
                            }
                          />
                        </ListItemButton>
                      </ListItem>
                    );
                  })}
                  <Divider sx={{ my: 1, borderColor: '#EDE2D2' }} />
                </>
              )}

              {/* 3. CATEGORIES SECTION */}
              {results.categories.length > 0 && (
                <>
                  <Box sx={{ px: 2, pt: 1, pb: 0.5 }}>
                    <Chip
                      icon={<CategoryIcon sx={{ fontSize: '14px !important', color: '#e65100 !important' }} />}
                      label="CATEGORIES"
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.66rem',
                        fontWeight: 800,
                        bgcolor: 'rgba(230, 81, 0, 0.1)',
                        color: '#e65100',
                        border: '1px solid rgba(230, 81, 0, 0.25)',
                      }}
                    />
                  </Box>
                  {results.categories.map((cat) => (
                    <ListItem key={cat._id} disablePadding>
                      <ListItemButton
                        onClick={() => handleSelect(() => navigate(`/categories?search=${encodeURIComponent(cat.cName || cat.name || '')}`))}
                        sx={{ py: 0.8, px: 2, '&:hover': { bgcolor: '#FBF9F5' } }}
                      >
                        <ListItemIcon sx={{ minWidth: 36, color: '#e65100' }}>
                          <CategoryIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#282321' }}>
                              {cat.cName || cat.name}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="caption" color="text.secondary">
                              Category • Manage products & subcategories
                            </Typography>
                          }
                        />
                        <ArrowForwardIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                  <Divider sx={{ my: 1, borderColor: '#EDE2D2' }} />
                </>
              )}

              {/* 4. ORDERS SECTION */}
              {results.orders.length > 0 && (
                <>
                  <Box sx={{ px: 2, pt: 1, pb: 0.5 }}>
                    <Chip
                      icon={<ShoppingCartIcon sx={{ fontSize: '14px !important', color: '#2e7d32 !important' }} />}
                      label="ORDERS"
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.66rem',
                        fontWeight: 800,
                        bgcolor: 'rgba(46, 125, 50, 0.1)',
                        color: '#2e7d32',
                        border: '1px solid rgba(46, 125, 50, 0.25)',
                      }}
                    />
                  </Box>
                  {results.orders.map((order) => (
                    <ListItem key={order._id} disablePadding>
                      <ListItemButton
                        onClick={() => handleSelect(() => navigate(`/orders?search=${encodeURIComponent(order._id)}`))}
                        sx={{ py: 0.8, px: 2, '&:hover': { bgcolor: '#FBF9F5' } }}
                      >
                        <ListItemIcon sx={{ minWidth: 36, color: '#2e7d32' }}>
                          <ShoppingCartIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#282321' }}>
                              Order #{order._id.substring(order._id.length - 8).toUpperCase()} • ₹{order.finalAmount || order.totalAmount || 0}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="caption" color="text.secondary">
                              Customer: {order.shippingAddress?.fullName || 'Patron'} • Status: {order.orderStatus || 'Pending'}
                            </Typography>
                          }
                        />
                        <ArrowForwardIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                  <Divider sx={{ my: 1, borderColor: '#EDE2D2' }} />
                </>
              )}

              {/* 5. PAGES & MODULES SECTION */}
              {results.pages.length > 0 && (
                <>
                  <Box sx={{ px: 2, pt: 1, pb: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: '0.04em', textTransform: 'uppercase', fontSize: '0.65rem' }}>
                      {results.isEmpty ? 'Shortcuts' : 'Pages & Sections'}
                    </Typography>
                  </Box>
                  {results.pages.map((p) => (
                    <ListItem key={p.path} disablePadding>
                      <ListItemButton
                        onClick={() => handleSelect(() => navigate(p.path))}
                        sx={{ py: 0.7, px: 2, '&:hover': { bgcolor: '#FBF9F5' } }}
                      >
                        <ListItemIcon sx={{ minWidth: 34, color: '#6D1734' }}>
                          {p.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="body2" sx={{ fontWeight: 500, color: '#282321', fontSize: '0.82rem' }}>
                              {p.name}
                            </Typography>
                          }
                        />
                        <LaunchIcon sx={{ fontSize: 14, color: 'rgba(0,0,0,0.35)' }} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </>
              )}
            </List>

            {/* Footer hint */}
            <Box sx={{ p: 1.2, bgcolor: '#FAF7F2', borderTop: '1px solid #EDE2D2', textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                Tip: Press <kbd style={{ background: '#eee', padding: '1px 5px', borderRadius: '3px' }}>Ctrl + K</kbd> anywhere to quickly open search
              </Typography>
            </Box>
          </Paper>
        )}
      </Box>
    </ClickAwayListener>
  );
};

export default AdminGlobalSearch;
