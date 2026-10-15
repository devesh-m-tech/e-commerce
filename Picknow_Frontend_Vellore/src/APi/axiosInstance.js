import axios from 'axios';
import { handleMockRequest } from '../mockData/mockApiHandler';

const defaultAdapter = axios.getAdapter(axios.defaults.adapter);

const axiosInstance = axios.create({
  baseURL: import.meta.env?.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Dual-mode adapter: attempts real backend first, seamlessly falls back to mock handler if offline/unreachable
axiosInstance.defaults.adapter = async (config) => {
  // If explicitly requested mock mode via env
  if (import.meta.env?.VITE_USE_MOCK === 'true') {
    const mockData = handleMockRequest(config);
    return {
      data: mockData,
      status: 200,
      statusText: 'OK',
      headers: { 'content-type': 'application/json' },
      config,
      request: {}
    };
  }

  try {
    const response = await defaultAdapter(config);

    // If backend returns 200 OK but database has 0 products or 0 categories (unseeded DB),
    // gracefully provide mock data so the store UI never appears completely empty.
    if (response?.data) {
      const urlStr = config.url || '';
      const isProductReq = urlStr.includes('/product') || urlStr.includes('/search');
      const isCategoryReq = urlStr.includes('/category');

      const isEmptyProducts = isProductReq && (
        (Array.isArray(response.data.products) && response.data.products.length === 0) ||
        (Array.isArray(response.data.results?.products) && response.data.results.products.length === 0) ||
        (Array.isArray(response.data.data) && response.data.data.length === 0)
      );

      const isEmptyCategories = isCategoryReq && (
        (Array.isArray(response.data.categories) && response.data.categories.length === 0) ||
        (Array.isArray(response.data) && response.data.length === 0)
      );

      if (isEmptyProducts || isEmptyCategories) {
        try {
          const mockData = handleMockRequest(config);
          if (mockData !== undefined) {
            return {
              data: mockData,
              status: 200,
              statusText: 'OK',
              headers: { 'content-type': 'application/json' },
              config,
              request: {}
            };
          }
        } catch (e) {
          // ignore mock errors and return real response
        }
      }
    }

    return response;
  } catch (error) {
    // If backend is not running or network request failed, gracefully fall back to local dataset
    try {
      const mockData = handleMockRequest(config);
      if (mockData !== undefined) {
        return {
          data: mockData,
          status: 200,
          statusText: 'OK',
          headers: { 'content-type': 'application/json' },
          config,
          request: {}
        };
      }
    } catch (mockErr) {
      // Fall through to throw original network error
    }
    throw error;
  }
};

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Get the appropriate token based on user type
    const userType = localStorage.getItem('userType');
    let token;

    if (userType === 'vendor') {
      token = localStorage.getItem('vendorToken');
    } else {
      token = localStorage.getItem('token');
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Handle multipart/form-data
    if (config.headers['Content-Type'] === 'multipart/form-data') {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear all auth data
      localStorage.removeItem('token');
      localStorage.removeItem('vendorToken');
      localStorage.removeItem('userType');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('currentVendor');
      localStorage.removeItem('vendorId');

      // Redirect based on user type
      const userType = localStorage.getItem('userType');
      if (userType === 'vendor') {
        window.location.href = '/vendor/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;