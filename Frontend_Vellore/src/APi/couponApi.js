import axiosInstance from "./axiosInstance";

export const couponApi = {
  // Public Storefront methods
  getActiveCoupons: async () => {
    try {
      const response = await axiosInstance.get("/coupon/active");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  applyCoupon: async (code, orderTotal = 0) => {
    try {
      const response = await axiosInstance.post("/coupon/apply", {
        code,
        orderTotal: Number(orderTotal) || 0,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Admin Management methods
  getAllCoupons: async () => {
    try {
      const response = await axiosInstance.get("/coupon/all");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  createCoupon: async (data) => {
    try {
      const response = await axiosInstance.post("/coupon/create", data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  updateCoupon: async (id, data) => {
    try {
      const response = await axiosInstance.put(`/coupon/update/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  deleteCoupon: async (id) => {
    try {
      const response = await axiosInstance.delete(`/coupon/delete/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default couponApi;
