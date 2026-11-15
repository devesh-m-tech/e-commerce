import axiosInstance from './axiosInstance';

// Fetch store & e-commerce configuration
export const getSettings = async () => {
  try {
    const response = await axiosInstance.get('/settings');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Update store & e-commerce configuration
export const updateSettings = async (data) => {
  try {
    const response = await axiosInstance.put('/settings', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Reset settings to factory defaults
export const resetSettings = async () => {
  try {
    const response = await axiosInstance.post('/settings/reset');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Upload hero background image file
export const uploadHeroImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append('image', file);
    const response = await axiosInstance.post('/settings/upload-hero', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
