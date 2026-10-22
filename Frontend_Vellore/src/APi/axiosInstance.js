import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env?.VITE_API_BASE_URL || 'http://localhost:5000/api',
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
      // Clear all auth data
      localStorage.removeItem('token');
      localStorage.removeItem('vendorToken');
      localStorage.removeItem('userType');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('user');
      localStorage.removeItem('currentVendor');
      localStorage.removeItem('vendorId');

      window.dispatchEvent(new Event('loginStateChanged'));

      const userType = localStorage.getItem('userType');
      if (userType === 'vendor') {
        window.location.href = '/vendor/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
