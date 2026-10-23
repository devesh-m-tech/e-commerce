import axiosInstance from './baseApi';

export const categoryApi = {
  getAllCategories: async () => {
    try {
      const response = await axiosInstance.get('/category/all');
      const list = Array.isArray(response.data) ? response.data : (response.data?.categories || []);
      return list
        .filter((c) => (c.cStatus || 'active').toLowerCase() === 'active')
        .map((c) => ({
          ...c,
          subCategories: Array.isArray(c.subCategories)
            ? c.subCategories
                .filter((s) => (s.status || 'active').toLowerCase() === 'active')
                .map((s) => ({
                  ...s,
                  subCategories: Array.isArray(s.subCategories)
                    ? s.subCategories.filter((n) => (n.status || 'active').toLowerCase() === 'active')
                    : []
                }))
            : []
        }));
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch categories' };
    }
  },
  getCategoryById: async (id) => {
    try {
      const response = await axiosInstance.get(`/category/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch category' };
    }
  },

  getSubCategories: async (categoryId) => {
    try {
      const response = await axiosInstance.get(`/category/${categoryId}/subcategories`);
      const subCats = response.data?.subCategories || (Array.isArray(response.data) ? response.data : []);
      const filtered = Array.isArray(subCats)
        ? subCats.filter((s) => (s.status || 'active').toLowerCase() === 'active')
        : [];
      return {
        ...response.data,
        subCategories: filtered
      };
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch subcategories' };
    }
  },

  getNestedSubCategories: async (categoryId, subCategoryId) => {
    try {
      const response = await axiosInstance.get(
        `/category/${categoryId}/subcategories/${subCategoryId}/nested`
      );
      const nested = response.data?.subCategories || (Array.isArray(response.data) ? response.data : []);
      const filtered = Array.isArray(nested)
        ? nested.filter((n) => (n.status || 'active').toLowerCase() === 'active')
        : [];
      return {
        ...response.data,
        subCategories: filtered
      };
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch nested subcategories' };
    }
  }
}; 