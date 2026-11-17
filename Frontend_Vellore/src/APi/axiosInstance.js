import axios from 'axios';
import { API_URL } from '../config/envConfig.js';

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor: Attach authorization header
axiosInstance.interceptors.request.use(
  (config) => {
    const userType = localStorage.getItem('userType');
    let token = null;

    if (userType === 'vendor') {
      token = localStorage.getItem('vendorToken');
    } else {
      token = localStorage.getItem('token');
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Handle multipart/form-data: let the browser/axios set boundary
    if (config.headers['Content-Type'] === 'multipart/form-data') {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle authentication expiry
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const userType = localStorage.getItem('userType');
      // Do NOT clear session if admin or super_admin is logged in
      if (userType === 'admin' || userType === 'super_admin') {
        return Promise.reject(error);
      }

      // Clear customer auth data
      localStorage.removeItem('token');
      localStorage.removeItem('vendorToken');
      localStorage.removeItem('userType');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('user');
      localStorage.removeItem('currentVendor');
      localStorage.removeItem('vendorId');

      window.dispatchEvent(new Event('loginStateChanged'));

      if (userType === 'vendor') {
        window.location.href = '/vendor/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
