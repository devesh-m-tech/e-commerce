import { DUMMY_CATEGORIES, DUMMY_PRODUCTS, getLocalCart, saveLocalCart } from "./dummyData";

// ── DUMMY CREDENTIALS (visible in login modal) ────────────────
export const DUMMY_CREDENTIALS = {
  email: "demo@shrideepaalaya.com",
  password: "Demo@1234",
  name: "Priya Sharma"
};

// ── DUMMY DEFAULT ADDRESS ─────────────────────────────────────
export const DUMMY_DEFAULT_ADDRESS = {
  _id: "addr_demo_1",
  name: "Priya Sharma",
  mobile: "9876543210",
  pincode: "632001",
  street: "12, Nehru Street, Anna Salai",
  locality: "Gandhi Nagar",
  city: "Vellore",
  state: "Tamil Nadu",
  type: "Home",
  isDefault: true
};

// Helper to get/save addresses from localStorage
export const getLocalAddresses = () => {
  try {
    const raw = localStorage.getItem("local_addresses") || localStorage.getItem("dummy_addresses");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  const def = [DUMMY_DEFAULT_ADDRESS];
  saveLocalAddresses(def);
  return def;
};

export const saveLocalAddresses = (addresses) => {
  try {
    localStorage.setItem("local_addresses", JSON.stringify(addresses));
    localStorage.setItem("dummy_addresses", JSON.stringify(addresses));
    const userRaw = localStorage.getItem("user");
    if (userRaw) {
      const u = JSON.parse(userRaw);
      u.addresses = addresses;
      localStorage.setItem("user", JSON.stringify(u));
    }
  } catch (e) {}
};

/** Seeds the dummy default address if no addresses exist yet */
export const seedDummyAddress = () => {
  let addresses = [];
  try {
    const raw = localStorage.getItem("local_addresses") || localStorage.getItem("dummy_addresses");
    if (raw) addresses = JSON.parse(raw);
  } catch (e) {}
  if (!Array.isArray(addresses) || addresses.length === 0) {
    addresses = [DUMMY_DEFAULT_ADDRESS];
  }
  saveLocalAddresses(addresses);

  // If user explicitly logged out, do not auto-seed token or user
  if (localStorage.getItem("userLoggedOut") === "true") {
    return;
  }

  if (!localStorage.getItem("token")) {
    localStorage.setItem("token", "mock_local_jwt_token_12345");
  }
  const userRaw = localStorage.getItem("user");
  if (!userRaw) {
    localStorage.setItem("user", JSON.stringify({
      _id: "user_demo_1",
      name: DUMMY_CREDENTIALS.name,
      email: DUMMY_CREDENTIALS.email,
      contact: "9876543210",
      walletBalance: 500,
      addresses: addresses
    }));
  } else {
    try {
      const u = JSON.parse(userRaw);
      if (!u.addresses || u.addresses.length === 0) {
        u.addresses = addresses;
        localStorage.setItem("user", JSON.stringify(u));
      }
    } catch (e) {}
  }
};

// Seed immediately on load
seedDummyAddress();

// Helper to get wishlist products from localStorage
export const getLocalWishlist = () => {
  try {
    const raw = localStorage.getItem("userWishlist");
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [];
};

export const saveLocalWishlist = (wishlistIds) => {
  try {
    localStorage.setItem("userWishlist", JSON.stringify(wishlistIds));
  } catch (e) {}
};

/**
 * Handle incoming mock requests for axios.
 * Returns { status: 200, data: ... }
 */
export const handleMockRequest = (config) => {
  const url = (config.url || "").replace(/^https?:\/\/[^/]+/, "").replace(/^\/api/, "");
  const method = (config.method || "get").toLowerCase();
  const params = config.params || {};

  // Extract query parameters from URL if present
  const [pathname, queryString] = url.split("?");
  const urlParams = new URLSearchParams(queryString || "");
  const cleanPath = pathname.startsWith("/") ? pathname : `/${pathname}`;

  // Merge params
  const getParam = (key) => params[key] || urlParams.get(key);

  console.log(`[Mock API ${method.toUpperCase()}]: ${cleanPath}`);

  // ── CATEGORIES ───────────────────────────────────────────────
  if (cleanPath === "/category/all" || cleanPath === "/category") {
    return {
      success: true,
      categories: DUMMY_CATEGORIES
    };
  }

  // /category/:id/subcategories
  const catSubMatch = cleanPath.match(/^\/category\/([^/]+)\/subcategories$/);
  if (catSubMatch) {
    const catId = catSubMatch[1];
    const cat = DUMMY_CATEGORIES.find(c => c._id === catId || c.cName.toLowerCase() === catId.toLowerCase());
    return {
      success: true,
      subCategories: cat?.subCategories || []
    };
  }

  // /category/:id/subcategories/:subId/nested
  if (cleanPath.includes("/subcategories/") && cleanPath.endsWith("/nested")) {
    return {
      success: true,
      nestedSubCategories: []
    };
  }

  // /category/:id
  const catIdMatch = cleanPath.match(/^\/category\/([^/]+)$/);
  if (catIdMatch) {
    const catId = catIdMatch[1];
    const cat = DUMMY_CATEGORIES.find(c => c._id === catId || c.cName.toLowerCase() === catId.toLowerCase()) || DUMMY_CATEGORIES[0];
    return {
      success: true,
      ...cat,
      cName: cat.cName,
      _id: cat._id
    };
  }

  // ── PRODUCTS BY CATEGORY ──────────────────────────────────────
  const prodCatMatch = cleanPath.match(/^\/product\/category\/([^/]+)$/) || cleanPath.match(/^\/products\/category\/([^/]+)$/);
  if (prodCatMatch) {
    const rawParam = decodeURIComponent(prodCatMatch[1]).toLowerCase();
    const matchedCat = DUMMY_CATEGORIES.find(c =>
      c._id.toLowerCase() === rawParam ||
      c.cName.toLowerCase() === rawParam ||
      rawParam.includes(c._id.toLowerCase()) ||
      c.cName.toLowerCase().includes(rawParam)
    );

    const filtered = DUMMY_PRODUCTS.filter(p => {
      const pCat = (p.pCategory || "").toLowerCase();
      const pSub = (p.pSubCategory || "").toLowerCase();
      if (matchedCat && pCat === matchedCat.cName.toLowerCase()) return true;
      if (pCat.includes(rawParam) || rawParam.includes(pCat)) return true;
      if (pSub.includes(rawParam) || rawParam.includes(pSub)) return true;
      if (rawParam.includes("saree") && pCat.includes("saree")) return true;
      if (rawParam.includes("jewel") && pCat.includes("jewel")) return true;
      if ((rawParam.includes("women") || rawParam.includes("dress")) && (pCat.includes("women") || pCat.includes("dress"))) return true;
      if (rawParam.includes("bridal") && (pCat.includes("bridal") || pSub.includes("bridal"))) return true;
      return false;
    });

    const results = filtered.length > 0 ? filtered : DUMMY_PRODUCTS;
    return {
      success: true,
      products: results,
      total: results.length
    };
  }

  // ── PRODUCTS BY SUBCATEGORY ──────────────────────────────────
  if (cleanPath.startsWith("/products/subcategory") || cleanPath.startsWith("/products/nested-subcategory")) {
    return {
      success: true,
      products: DUMMY_PRODUCTS,
      total: DUMMY_PRODUCTS.length
    };
  }

  // ── RELATED PRODUCTS ─────────────────────────────────────────
  const relatedMatch = cleanPath.match(/^\/products\/([^/]+)\/related$/);
  if (relatedMatch) {
    const currentId = relatedMatch[1];
    const related = DUMMY_PRODUCTS.filter(p => p._id !== currentId);
    const list = related.length > 0 ? related : DUMMY_PRODUCTS;
    return {
      success: true,
      products: list,
      relatedProducts: list
    };
  }

  // ── PRODUCT VARIANTS ─────────────────────────────────────────
  const varProdMatch = cleanPath.match(/^\/variant\/product\/([^/]+)$/);
  if (varProdMatch) {
    const prodId = varProdMatch[1];
    const prod = DUMMY_PRODUCTS.find(p => p._id === prodId) || DUMMY_PRODUCTS[0];
    return {
      success: true,
      variants: prod.variants || []
    };
  }

  const varIdMatch = cleanPath.match(/^\/variant\/([^/]+)$/);
  if (varIdMatch && !cleanPath.includes("/variant/product/")) {
    const varId = varIdMatch[1];
    for (const p of DUMMY_PRODUCTS) {
      const found = p.variants?.find(v => v._id === varId);
      if (found) return { success: true, variant: found };
    }
    return { success: true, variant: DUMMY_PRODUCTS[0].variants[0] };
  }

  // ── REVIEWS ──────────────────────────────────────────────────
  const reviewMatch = cleanPath.match(/^\/product\/([^/]+)\/reviews$/);
  if (reviewMatch) {
    if (method === "post") {
      return { success: true, message: "Review submitted successfully" };
    }
    const prodId = reviewMatch[1];
    const prod = DUMMY_PRODUCTS.find(p => p._id === prodId) || DUMMY_PRODUCTS[0];
    return {
      success: true,
      reviews: prod.pRatingsReviews || []
    };
  }

  if (cleanPath.endsWith("/canreview")) {
    return { success: true, canreview: true, canReview: true };
  }

  // ── SINGLE PRODUCT BY ID ─────────────────────────────────────
  const singleProdMatch = cleanPath.match(/^\/product\/([^/]+)$/);
  if (singleProdMatch && !cleanPath.includes("/category/") && !cleanPath.includes("/brand/")) {
    const id = singleProdMatch[1];
    const product = DUMMY_PRODUCTS.find(p => p._id === id) || DUMMY_PRODUCTS[0];
    return {
      success: true,
      product: {
        ...product,
        pImage: product.pImage
      }
    };
  }

  // ── SEARCH & SEARCH SUGGESTIONS ──────────────────────────────
  if (cleanPath === "/search" || cleanPath === "/products/search") {
    const q = (getParam("q") || getParam("query") || "").toLowerCase().trim();
    const type = getParam("type");

    let results = DUMMY_PRODUCTS;
    if (q) {
      results = DUMMY_PRODUCTS.filter(p =>
        p.pName.toLowerCase().includes(q) ||
        p.pCategory.toLowerCase().includes(q) ||
        p.pSubCategory.toLowerCase().includes(q) ||
        p.pDescription.toLowerCase().includes(q)
      );
    }
    return {
      success: true,
      results: { products: results },
      products: results,
      total: results.length
    };
  }

  if (cleanPath === "/search/suggestions") {
    const q = (getParam("query") || getParam("q") || "").toLowerCase().trim();
    const matches = DUMMY_PRODUCTS.filter(p =>
      !q || p.pName.toLowerCase().includes(q) || p.pCategory.toLowerCase().includes(q)
    );
    return {
      success: true,
      suggestions: matches.map(p => ({
        _id: p._id,
        name: p.pName,
        image: p.pImage[0],
        price: p.pPrice
      }))
    };
  }

  // ── LATEST & OFFERS ──────────────────────────────────────────
  if (cleanPath === "/products/latest") {
    return DUMMY_PRODUCTS;
  }

  if (cleanPath === "/products/offer" || cleanPath === "/all/deals") {
    return {
      success: true,
      data: DUMMY_PRODUCTS,
      products: DUMMY_PRODUCTS
    };
  }

  // ── BRANDS & GROUPS ──────────────────────────────────────────
  if (cleanPath === "/products/brand" || cleanPath === "/brand/all" || cleanPath.startsWith("/brand/")) {
    return {
      success: true,
      brands: ["Shri Deepaalaya", "Shri Deepaalaya Heritage"]
    };
  }

  if (cleanPath === "/products/group") {
    return {
      success: true,
      data: []
    };
  }

  // ── COMBOS & DEALS ───────────────────────────────────────────
  if (cleanPath.startsWith("/combo")) {
    return {
      success: true,
      combos: []
    };
  }

  // ── ALL PRODUCTS (/products) ─────────────────────────────────
  if (cleanPath === "/products" || cleanPath === "/products/") {
    const category = getParam("category");
    let list = DUMMY_PRODUCTS;

    if (category && category !== "all") {
      const catLower = category.toLowerCase();
      list = DUMMY_PRODUCTS.filter(p => {
        if (catLower.includes("dress") || catLower.includes("women")) return p.pCategory.toLowerCase() === "dresses";
        if (catLower.includes("jewel")) return p.pCategory.toLowerCase() === "jewelleries";
        return p.pCategory.toLowerCase() === catLower;
      });
    }

    return {
      success: true,
      products: list,
      total: list.length,
      totalPages: 1,
      currentPage: 1,
      totalProducts: list.length
    };
  }

  // ── CART APIS ────────────────────────────────────────────────
  if (cleanPath === "/cart/get" || cleanPath === "cart/get") {
    const cart = getLocalCart();
    return {
      success: true,
      cart
    };
  }

  if (cleanPath === "/cart/add" || cleanPath === "cart/add") {
    let body = {};
    try {
      body = typeof config.data === "string" ? JSON.parse(config.data) : (config.data || {});
    } catch (e) {}

    const cart = getLocalCart();
    const product = DUMMY_PRODUCTS.find(p => p._id === body.productId) || DUMMY_PRODUCTS[0];
    const qty = parseInt(body.quantity || 1);
    const variantId = body.variantId || product.variants?.[0]?._id;

    const existingIndex = cart.items.findIndex(item =>
      (item.product?._id || item.product) === product._id && (!variantId || item.variantId === variantId)
    );

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += qty;
    } else {
      cart.items.push({
        _id: "cart_item_" + Date.now(),
        product: {
          _id: product._id,
          pName: product.pName,
          pPrice: product.pPrice,
          pImage: product.pImage
        },
        quantity: qty,
        variantId: variantId,
        price: body.price || product.pPrice
      });
    }

    cart.totalAmount = cart.items.reduce((sum, item) => sum + (item.price || item.product.pPrice) * item.quantity, 0);
    saveLocalCart(cart);

    window.dispatchEvent(new CustomEvent("cartUpdated", { detail: { items: cart.items } }));

    return {
      success: true,
      message: "Item added to cart",
      cart
    };
  }

  if (cleanPath === "/cart/update" || cleanPath === "cart/update") {
    let body = {};
    try {
      body = typeof config.data === "string" ? JSON.parse(config.data) : (config.data || {});
    } catch (e) {}

    const cart = getLocalCart();
    const { productId, variantId, quantity } = body;

    const item = cart.items.find(i =>
      (variantId && i.variantId === variantId) || (productId && (i.product?._id || i.product) === productId)
    );

    if (item) {
      item.quantity = Math.max(1, parseInt(quantity || 1));
      cart.totalAmount = cart.items.reduce((sum, it) => sum + (it.price || it.product.pPrice) * it.quantity, 0);
      saveLocalCart(cart);
      window.dispatchEvent(new CustomEvent("cartUpdated", { detail: { items: cart.items } }));
    }

    return {
      success: true,
      message: "Cart updated",
      cart
    };
  }

  if (cleanPath.startsWith("/cart/remove") || cleanPath.startsWith("cart/remove")) {
    const cart = getLocalCart();
    const pid = getParam("productId");
    const vid = getParam("variantId");

    cart.items = cart.items.filter(item => {
      if (vid && item.variantId === vid) return false;
      if (pid && (item.product?._id || item.product) === pid) return false;
      return true;
    });

    cart.totalAmount = cart.items.reduce((sum, it) => sum + (it.price || it.product.pPrice) * it.quantity, 0);
    saveLocalCart(cart);
    window.dispatchEvent(new CustomEvent("cartUpdated", { detail: { items: cart.items } }));

    return {
      success: true,
      message: "Item removed from cart",
      cart
    };
  }

  if (cleanPath === "/cart/clear" || cleanPath === "cart/clear") {
    const emptyCart = { items: [], totalAmount: 0 };
    saveLocalCart(emptyCart);
    window.dispatchEvent(new CustomEvent("cartUpdated", { detail: { items: [] } }));
    return {
      success: true,
      message: "Cart cleared",
      cart: emptyCart
    };
  }

  // ── WISHLIST APIS ────────────────────────────────────────────
  if (cleanPath === "/user/wishlist") {
    const wishIds = getLocalWishlist();
    const wishProducts = DUMMY_PRODUCTS.filter(p => wishIds.includes(p._id));
    return {
      success: true,
      products: wishProducts,
      wishlist: { products: wishProducts }
    };
  }

  if (cleanPath.startsWith("/user/wishlist/add/")) {
    const pid = cleanPath.split("/").pop();
    const list = getLocalWishlist();
    if (!list.includes(pid)) {
      list.push(pid);
      saveLocalWishlist(list);
    }
    return { success: true, message: "Added to wishlist" };
  }

  if (cleanPath.startsWith("/user/wishlist/remove/")) {
    const pid = cleanPath.split("/").pop();
    const list = getLocalWishlist().filter(id => id !== pid);
    saveLocalWishlist(list);
    return { success: true, message: "Removed from wishlist" };
  }

  // ── AUTH & USER ──────────────────────────────────────────────
  if (cleanPath.includes("/login")) {
    let body = {};
    try { body = typeof config.data === "string" ? JSON.parse(config.data) : (config.data || {}); } catch (e) {}
    const isDemoUser = body.email === DUMMY_CREDENTIALS.email;
    const mockUser = isDemoUser
      ? { _id: "user_demo_1", name: DUMMY_CREDENTIALS.name, email: DUMMY_CREDENTIALS.email, contact: "9876543210", walletBalance: 500 }
      : { _id: "user_guest_1", name: "Guest User", email: body.email || "guest@shrideepaalaya.com", contact: "", walletBalance: 0 };
    // Seed dummy address on login
    seedDummyAddress();
    return {
      success: true,
      token: "mock_local_jwt_token_12345",
      user: mockUser
    };
  }

  if (cleanPath.includes("/register")) {
    let body = {};
    try { body = typeof config.data === "string" ? JSON.parse(config.data) : (config.data || {}); } catch (e) {}
    seedDummyAddress();
    return {
      success: true,
      token: "mock_local_jwt_token_12345",
      message: "Account created! You are now logged in.",
      activationToken: "mock_activation_token",
      user: { _id: "user_new_1", name: body.name || "New User", email: body.email || "", contact: body.contact || "", walletBalance: 0 }
    };
  }

  if (cleanPath === "/user/verify") {
    return { success: true, message: "Account verified successfully!" };
  }

  if (cleanPath === "/user/forgot-password") {
    return { success: true, message: "Reset code sent to your email" };
  }

  if (cleanPath === "/user/reset-password") {
    return { success: true, message: "Password reset successfully" };
  }

  if (cleanPath === "/user/profile") {
    const storedUser = (() => { try { return JSON.parse(localStorage.getItem("user") || "null"); } catch { return null; } })();
    const addresses = getLocalAddresses();
    const user = storedUser || { name: "Priya Sharma", email: DUMMY_CREDENTIALS.email, contact: "9876543210", walletBalance: 500 };
    user.addresses = addresses;
    return { success: true, user };
  }

  if (cleanPath === "/user/update") {
    let body = {};
    try { body = typeof config.data === "string" ? JSON.parse(config.data) : (config.data || {}); } catch (e) {}
    const addresses = getLocalAddresses();
    const updated = { ...body, addresses };
    try { localStorage.setItem("user", JSON.stringify(updated)); } catch (e) {}
    return { success: true, user: updated, message: "Profile updated" };
  }

  // ── USER BALANCE ──────────────────────────────────────────────
  if (cleanPath === "/user/balance") {
    return { success: true, data: { walletBalance: 500 } };
  }

  // ── USER ADDRESSES ────────────────────────────────────────────
  if (cleanPath === "/user/addresses" && method === "get") {
    const addresses = getLocalAddresses();
    return { success: true, addresses };
  }

  if (cleanPath === "/user/address" && method === "post") {
    let body = {};
    try { body = typeof config.data === "string" ? JSON.parse(config.data) : (config.data || {}); } catch (e) {}
    const addresses = getLocalAddresses();
    const isFirst = addresses.length === 0;
    const shouldBeDefault = body.isDefault === true || isFirst;

    if (shouldBeDefault) {
      addresses.forEach(a => { a.isDefault = false; });
    }

    const newAddr = {
      _id: "addr_" + Date.now(),
      name: body.name || DUMMY_CREDENTIALS.name,
      mobile: body.mobile || body.phone || "9876543210",
      pincode: body.pincode || "632001",
      street: body.street || body.address || "12, Nehru Street, Anna Salai",
      locality: body.locality || "Gandhi Nagar",
      city: body.city || "Vellore",
      state: body.state || "Tamil Nadu",
      type: body.type || "Home",
      isDefault: shouldBeDefault
    };

    addresses.push(newAddr);
    saveLocalAddresses(addresses);
    return { success: true, message: "Address added successfully", address: newAddr, addresses };
  }

  // /user/address/:id/default
  const addrDefaultMatch = cleanPath.match(/^\/user\/address\/([^/]+)\/default$/);
  if (addrDefaultMatch && (method === "put" || method === "patch" || method === "post")) {
    const addrId = addrDefaultMatch[1];
    const addresses = getLocalAddresses();
    addresses.forEach(a => {
      a.isDefault = a._id === addrId;
    });
    saveLocalAddresses(addresses);
    return { success: true, message: "Default address updated", addresses };
  }

  // /user/address/:id
  const addrIdMatch = cleanPath.match(/^\/user\/address\/([^/]+)$/);
  if (addrIdMatch) {
    const addrId = addrIdMatch[1];
    if (method === "put" || method === "patch") {
      let body = {};
      try { body = typeof config.data === "string" ? JSON.parse(config.data) : (config.data || {}); } catch (e) {}
      const addresses = getLocalAddresses();
      const idx = addresses.findIndex(a => a._id === addrId);
      if (idx > -1) {
        if (body.isDefault) {
          addresses.forEach(a => { a.isDefault = false; });
        }
        addresses[idx] = { ...addresses[idx], ...body };
        saveLocalAddresses(addresses);
      }
      return { success: true, message: "Address updated successfully", addresses, address: addresses[idx] };
    }
    if (method === "delete") {
      let addresses = getLocalAddresses().filter(a => a._id !== addrId);
      if (addresses.length > 0 && !addresses.some(a => a.isDefault)) {
        addresses[0].isDefault = true;
      }
      saveLocalAddresses(addresses);
      return { success: true, message: "Address deleted successfully", addresses };
    }
  }

  // ── DELIVERY FEES ────────────────────────────────────────────
  if (cleanPath === "/delivery") {
    return {
      success: true,
      data: [
        { state: "Tamil Nadu",      above500_deliveryfee: 0,  productdeliveryfee: 40, combodeliveryfee: 40 },
        { state: "Karnataka",       above500_deliveryfee: 0,  productdeliveryfee: 40, combodeliveryfee: 40 },
        { state: "Andhra Pradesh",  above500_deliveryfee: 0,  productdeliveryfee: 40, combodeliveryfee: 40 },
        { state: "Kerala",          above500_deliveryfee: 0,  productdeliveryfee: 40, combodeliveryfee: 40 },
        { state: "Maharashtra",     above500_deliveryfee: 0,  productdeliveryfee: 60, combodeliveryfee: 60 },
        { state: "Delhi",           above500_deliveryfee: 0,  productdeliveryfee: 60, combodeliveryfee: 60 },
        { state: "default",         above500_deliveryfee: 0,  productdeliveryfee: 60, combodeliveryfee: 60 }
      ]
    };
  }

  // ── RAZORPAY / PAYMENT ────────────────────────────────────────
  if (cleanPath === "/createorder") {
    let body = {};
    try { body = typeof config.data === "string" ? JSON.parse(config.data) : (config.data || {}); } catch (e) {}
    const amount = Math.round((body.amount || 100) * 100); // paisa
    return {
      success: true,
      order: {
        id: "order_mock_" + Date.now(),
        amount,
        currency: "INR",
        receipt: "receipt_mock"
      }
    };
  }

  if (cleanPath === "/paymentVerification") {
    return { status: true, success: true, message: "Payment verified" };
  }

  // ── PLACE ORDER ───────────────────────────────────────────────
  if (cleanPath === "/order/cart") {
    let body = {};
    try { body = typeof config.data === "string" ? JSON.parse(config.data) : (config.data || {}); } catch (e) {}
    const orderId = "ORD_" + Date.now();
    // Save order history to localStorage
    try {
      const orders = JSON.parse(localStorage.getItem("local_orders") || "[]");
      orders.unshift({
        _id: orderId,
        status: "Pending",
        total: body.total || 0,
        createdAt: new Date().toISOString(),
        items: body.items || []
      });
      localStorage.setItem("local_orders", JSON.stringify(orders));
    } catch (e) {}
    return { success: true, message: "Order placed successfully!", orderId };
  }

  // ── ORDERS (history) ─────────────────────────────────────────
  if (cleanPath === "/order/my" || cleanPath === "/order/user" || cleanPath.startsWith("/order/")) {
    try {
      const orders = JSON.parse(localStorage.getItem("local_orders") || "[]");
      return { success: true, orders };
    } catch (e) {
      return { success: true, orders: [] };
    }
  }

  // ── NOTIFICATIONS ────────────────────────────────────────────
  if (cleanPath === "/notification" || cleanPath === "/notifications") {
    return { success: true, notifications: [], unreadCount: 0 };
  }
  if (cleanPath.startsWith("/notification/")) {
    return { success: true, message: "Notification updated" };
  }

  // Default fallback for any other unhandled endpoint
  return {
    success: true,
    data: [],
    message: "Offline local mode response"
  };
};
