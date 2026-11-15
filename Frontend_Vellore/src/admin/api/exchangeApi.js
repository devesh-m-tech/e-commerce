import axiosInstance from './axiosInstance';

export const exchangeApi = {
  // Admin: Get all exchange requests with filters
  getAllExchanges: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/exchange/admin/all', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Admin: Approve or Reject exchange request
  updateExchangeStatus: async (id, data) => {
    try {
      const response = await axiosInstance.put(`/exchange/admin/${id}/status`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Admin: Update fulfillment workflow status
  updateExchangeWorkflow: async (id, data) => {
    try {
      const response = await axiosInstance.put(`/exchange/admin/${id}/workflow`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Customer or Admin: Track by order identifier
  trackExchange: async (orderIdentifier) => {
    try {
      const response = await axiosInstance.get(`/exchange/track/${orderIdentifier}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default exchangeApi;
