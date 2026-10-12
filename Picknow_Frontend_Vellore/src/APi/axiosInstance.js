import axios from 'axios';
import { handleMockRequest } from '../mockData/mockApiHandler';

const axiosInstance = axios.create({
  baseURL: import.meta.env?.VITE_API_BASE_URL || 'http://localhost:3000 /api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Offline / Disconnected adapter for local frontend execution with dummy data
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
    console.error('[Mock API Adapter Error]:', error);
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