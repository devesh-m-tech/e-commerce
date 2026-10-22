import axiosInstance from "./axiosInstance";

export const getBanners = async () => {
  try {
    const response = await axiosInstance.get('/banners');
    if (response.data && response.data.banners) {
      return response.data.banners;
    }
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  } catch (error) {
    console.warn("Failed to load hero banners from API, using fallback defaults:", error.message);
    return [];
  }
};

export const bannerApi = {
  getBanners,
};

export default bannerApi;
