import axiosInstance from './axiosInstance';

// Fetch all banners for admin management
export const getAllBanners = async () => {
  try {
    const response = await axiosInstance.get('/banners/admin/all');
    return response.data;
  } catch (error) {
    // If auth fails or endpoint error, fallback to public active banners
    try {
      const fallback = await axiosInstance.get('/banners');
      return fallback.data;
    } catch {
      throw error.response?.data || error.message;
    }
  }
};

// Fetch single banner by ID
export const getBannerById = async (id) => {
  try {
    const response = await axiosInstance.get(`/banners/detail/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Create a new banner (supports FormData for file upload or JSON with imageUrl)
export const createBanner = async (data) => {
  try {
    const isFormData = data instanceof FormData;
    const config = isFormData
      ? { headers: { 'Content-Type': 'multipart/form-data' } }
      : {};
    const response = await axiosInstance.post('/banners/admin/create', data, config);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Update an existing banner
export const updateBanner = async (id, data) => {
  try {
    const isFormData = data instanceof FormData;
    const config = isFormData
      ? { headers: { 'Content-Type': 'multipart/form-data' } }
      : {};
    const response = await axiosInstance.put(`/banners/admin/update/${id}`, data, config);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Delete a banner
export const deleteBanner = async (id) => {
  try {
    const response = await axiosInstance.delete(`/banners/admin/delete/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Toggle active status
export const toggleBannerStatus = async (id) => {
  try {
    const response = await axiosInstance.patch(`/banners/admin/status/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Reorder banners
export const reorderBanners = async (items) => {
  try {
    const response = await axiosInstance.put('/banners/admin/reorder', { items });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const bannerApi = {
  getAllBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
  toggleBannerStatus,
  reorderBanners,
};

export default bannerApi;
