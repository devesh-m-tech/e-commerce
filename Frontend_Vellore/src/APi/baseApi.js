import axiosInstance from './axiosInstance';

export const transformImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http') || imagePath.startsWith('data:image')) {
    return imagePath;
  }
  const filename = imagePath.split('\\').pop().split('/').pop();
  return `http://localhost:5000/uploads/${filename}`;
};

// Product APIs
export const productService = {
  getAllProducts: async (page = 1, limit = 20) => {
    const response = await axiosInstance.get(`/products?page=${page}&limit=${limit}&includeVariants=true`);
    return response.data;
  },

  getProductById: async (id) => {
    const response = await axiosInstance.get(`/product/${id}`);
    return response.data;
  },

  searchProducts: (query) => axiosInstance.get('/products/search', { params: { q: query } }).then(res => res.data),
  getProductsByCategory: (categoryId) => axiosInstance.get(`/product/category/${categoryId}`).then(res => res.data)
};

// Cart APIs
export const cartService = {
  getCart: async () => {
    const response = await axiosInstance.get('/cart/get');
    return response.data;
  },

  addToCart: async (productId, quantity, variantId = null) => {
    const response = await axiosInstance.post('/cart/add', { productId, quantity, variantId });
    return response.data;
  },

  updateCartItem: async (productId, quantity) => {
    const response = await axiosInstance.put('/cart/update', { productId, quantity });
    return response.data;
  },

  removeFromCart: async (productId, variantId = null) => {
    const params = variantId ? { variantId } : { productId };
    const response = await axiosInstance.delete('/cart/remove', { params });
    return response.data;
  },

  clearCart: () => axiosInstance.delete('/cart/clear')
};

// Auth APIs
export const authService = {
  login: async (credentials) => {
    const response = await axiosInstance.post('/user/login', credentials);
    return response.data;
  },

  register: async (userData) => {
    const response = await axiosInstance.post('/user/register', userData);
    return response.data;
  },

  logout: async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    return { success: true };
  },

  getUserProfile: () => axiosInstance.get('/user/profile'),
  updateProfile: (userData) => axiosInstance.put('/user/update', userData)
};

// Order APIs
export const orderService = {
  createOrder: async (orderData) => {
    const response = await axiosInstance.post('/order/cart', orderData);
    return response.data;
  },

  getOrders: async () => {
    const response = await axiosInstance.get('/order/orders');
    return response.data;
  },

  getOrderById: (orderId) => axiosInstance.get(`/order/${orderId}`).then(res => res.data),
  cancelOrder: (orderId) => axiosInstance.post(`/order/${orderId}/cancel`).then(res => res.data)
};

// Category APIs
export const categoryService = {
  getAllCategories: () =>
    axiosInstance.get('/category/all').then((res) => {
      const list = Array.isArray(res.data) ? res.data : (res.data?.categories || []);
      return list.filter((c) => (c.cStatus || 'active').toLowerCase() === 'active');
    }),
  getCategoryById: (id) => axiosInstance.get(`/category/${id}`).then((res) => res.data)
};

// User APIs
export const userService = {
  updatePassword: (passwordData) => axiosInstance.put('/user/change-password', passwordData),
  addAddress: (address) => axiosInstance.post('/user/address', address),
  updateAddress: (addressId, address) => axiosInstance.put(`/user/address/${addressId}`, address),
  deleteAddress: (addressId) => axiosInstance.delete(`/user/address/${addressId}`),
  getAddresses: () => axiosInstance.get('/user/addresses')
};

export default axiosInstance;
