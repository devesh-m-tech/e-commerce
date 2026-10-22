import axiosInstance from './axiosInstance';

export const exchangeApi = {
  // Submit new exchange request
  submitExchangeRequest: async (exchangeData) => {
    const response = await axiosInstance.post('/exchange/request', exchangeData);
    return response.data;
  },

  // Upload photo/video proof
  uploadProof: async (formData) => {
    const response = await axiosInstance.post('/exchange/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get user's exchanges
  getMyExchanges: async () => {
    const response = await axiosInstance.get('/exchange/my-exchanges');
    return response.data;
  },

  // Track exchange by order number or exchange ID
  trackExchange: async (orderIdentifier) => {
    const response = await axiosInstance.get(`/exchange/track/${orderIdentifier}`);
    return response.data;
  },
};

export default exchangeApi;
