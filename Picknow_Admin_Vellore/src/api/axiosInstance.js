import axios from 'axios';
import { handleAdminMockRequest } from './adminMockHandler';

const BASE_URL = import.meta.env?.VITE_API_URL || 'http://localhost:5000/api';
const defaultAdapter = axios.getAdapter(axios.defaults.adapter);

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 1500,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Resilient adapter: attempts real backend first, falls back to admin mock handler if backend is offline
axiosInstance.defaults.adapter = async (config) => {
  try {
    const res = await defaultAdapter(config);
    return res;
  } catch (err) {
    try {
      const mockData = handleAdminMockRequest(config);
      if (mockData) {
        return {
          data: mockData,
          status: 200,
          statusText: 'OK',
          headers: { 'content-type': 'application/json' },
          config,
          request: {}
        };
      }
    } catch (mErr) {
      // ignore
    }
    throw err;
  }
};

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized error
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${BASE_URL}/auth/refresh-token`, {
            refreshToken,
          });

          const { token } = response.data;
          localStorage.setItem('token', token);

          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        // If refresh token fails, logout user
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }

    }

    // Handle other errors
    if (error.response?.data?.message) {
      // You can handle error messages here or pass them to a notification system
      console.error('API Error:', error.response.data.message);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance; 