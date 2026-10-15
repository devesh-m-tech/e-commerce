import axios from 'axios';
import { handleMockRequest } from '../mockData/mockApiHandler';
import { DUMMY_PRODUCTS } from '../mockData/dummyData';

const axiosInstance = axios.create({
  baseURL: import.meta.env?.VITE_API_BASE_URL || 'http://localhost:3000 /api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Offline / Disconnected adapter for local frontend execution
axiosInstance.defaults.adapter = async (config) => {
  try {
    const mockData = handleMockRequest(config);
    return {
      data: mockData,
      status: 200,
      statusText: 'OK',
      headers: { 'content-type': 'application/json' },
      config,
      request: {}
    };
  } catch (error) {
    console.error('[Mock BaseApi Error]:', error);
    return {
      data: { success: false, message: error.message },
      status: 500,
      statusText: 'Internal Error',
      headers: {},
      config,
      request: {}
    };
  }
};

// Add request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const checkUserAccess = () => {
  const token = localStorage.getItem('token');
  const isLoggedIn = localStorage.getItem('isLoggedIn');

  if (!token || !isLoggedIn) {
    // In local demo mode, do not throw hard error
    return true;
  }
};

const transformImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http') || imagePath.startsWith('data:image')) {
    return imagePath;
  }
  const filename = imagePath.split('\\').pop().split('/').pop();
  return `http://localhost:3000 /uploads/${filename}`;
};

// Product APIs
export const productService = {
  getAllProducts: async () => {
    try {
      const response = await axiosInstance.get('/products');
      return response.data;
    } catch (error) {
      return { success: true, products: DUMMY_PRODUCTS };
    }
  },

  getProductById: async (id) => {
    try {
      const response = await axiosInstance.get(`/product/${id}`);
      return response.data;
    } catch (error) {
      const prod = DUMMY_PRODUCTS.find(p => p._id === id) || DUMMY_PRODUCTS[0];
      return { success: true, product: prod };
    }
  },

  searchProducts: (query) => axiosInstance.get('/products/search', { params: { q: query } }),
  getProductsByCategory: (categoryId) => axiosInstance.get(`/products/category/${categoryId}`)
};

// Cart APIs
export const cartService = {
  getCart: async () => {
    const response = await axiosInstance.get('/cart/get');
    return response.data;
  },

  addToCart: async (productId, quantity) => {
    const response = await axiosInstance.post('/cart/add', { productId, quantity });
    return response.data;
  },

  updateCartItem: async (productId, quantity) => {
    const response = await axiosInstance.put('/cart/update', { productId, quantity });
    return response.data;
  },

  removeFromCart: async (productId) => {
    const response = await axiosInstance.delete('/cart/remove', { params: { productId } });
    return response.data;
  },

  clearCart: () => axiosInstance.delete('/cart/clear')
};

// Auth APIs
export const authService = {
  login: async (credentials) => {
    const response = await axiosInstance.post('/login', credentials);
    return response.data;
  },

  register: async (userData) => {
    const response = await axiosInstance.post('/register', userData);
    return response.data;
  },

  logout: async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isLoggedIn');
    return { success: true };
  },

  getUserProfile: () => axiosInstance.get('/user/profile'),
  updateProfile: (userData) => axiosInstance.put('/user/update', userData)
};

// Order APIs
export const orderService = {
  createOrder: async (orderData) => {
    return { success: true, orderId: "ord_local_" + Date.now() };
  },

  getOrders: async () => {
    return { success: true, orders: [] };
  },

  getOrderById: (orderId) => axiosInstance.get(`/order/${orderId}`),
  cancelOrder: (orderId) => axiosInstance.put(`/order/${orderId}/cancel`)
};

// Category APIs
export const categoryService = {
  getAllCategories: () => axiosInstance.get('/category/all'),
  getCategoryById: (id) => axiosInstance.get(`/category/${id}`)
};

// User APIs
export const userService = {
  updatePassword: (passwordData) => axiosInstance.put('/user/password', passwordData),
  addAddress: (address) => axiosInstance.post('/user/address', address),
  updateAddress: (addressId, address) => axiosInstance.put(`/user/address/${addressId}`, address),
  deleteAddress: (addressId) => axiosInstance.delete(`/user/address/${addressId}`),
  getAddresses: () => axiosInstance.get('/user/addresses')
};

export default axiosInstance;