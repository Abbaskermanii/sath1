import { api } from "@/app/lib/axiosClient";


export const taxonomyApi = {
  // Categories
  listCategories: async (params = {}) => {
    const { data } = await api.get("/news/categories/", { params });
    return data;
  },
  createCategory: async (payload) => {
    const { data } = await api.post("/news/categories/", payload);
    return data;
  },
  updateCategory: async (slug, payload) => {
    const { data } = await api.patch(`/news/categories/${slug}/`, payload);
    return data;
  },
  deleteCategory: async (slug) => {
    await api.delete(`/news/categories/${slug}/`);
    return true;
  },

  // Tags
  listTags: async (params = {}) => {
    const { data } = await api.get("/news/tags/", { params });
    return data;
  },
  createTag: async (payload) => {
    const { data } = await api.post("/news/tags/", payload);
    return data;
  },
  updateTag: async (slug, payload) => {
    const { data } = await api.patch(`/news/tags/${slug}/`, payload);
    return data;
  },
  deleteTag: async (slug) => {
    await api.delete(`/news/tags/${slug}/`);
    return true;
  },
};
