import axiosInstance from './axiosInstance';

export const getWhatsAppStatus = async () => {
  try {
    const response = await axiosInstance.get('/admin/whatsapp/status');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getWhatsAppLogs = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/admin/whatsapp/logs', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const exportWhatsAppLogsCsv = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/admin/whatsapp/logs/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const resendWhatsAppMessage = async (messageId) => {
  try {
    const response = await axiosInstance.post(`/admin/whatsapp/resend/${messageId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const resendOrderInvoice = async (orderId) => {
  try {
    const response = await axiosInstance.post(`/admin/whatsapp/resend-order-invoice/${orderId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const sendTestWhatsAppMessage = async (data) => {
  try {
    const response = await axiosInstance.post('/admin/whatsapp/test', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
