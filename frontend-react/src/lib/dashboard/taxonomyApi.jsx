import { api } from "../../lib/axiosClient";

function normalizeList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

export const taxonomyApi = {
  // =========================
  // Categories
  // =========================

  async listCategories(params = {}) {
    const { data } = await api.get("/news/categories/", { params });
    return normalizeList(data);
  },

  async getCategory(slug) {
    const { data } = await api.get(`/news/categories/${slug}/`);
    return data;
  },

  async getCategoryPage(slug) {
    const { data } = await api.get(`/news/categories/${slug}/page/`);
    return data;
  },

  async createCategory(payload) {
    const { data } = await api.post("/news/categories/", payload);
    return data;
  },

  async updateCategory(slug, payload) {
    const { data } = await api.patch(`/news/categories/${slug}/`, payload);
    return data;
  },

  async putCategory(slug, payload) {
    const { data } = await api.put(`/news/categories/${slug}/`, payload);
    return data;
  },

  async deleteCategory(slug) {
    const res = await api.delete(`/news/categories/${slug}/`);
    return res?.data ?? null;
  },

  // =========================
  // Tags
  // =========================

  async listTags(params = {}) {
    const { data } = await api.get("/news/tags/", { params });
    return normalizeList(data);
  },

  async getTag(slug) {
    const { data } = await api.get(`/news/tags/${slug}/`);
    return data;
  },

  async createTag(payload) {
    const { data } = await api.post("/news/tags/", payload);
    return data;
  },

  async updateTag(slug, payload) {
    const { data } = await api.patch(`/news/tags/${slug}/`, payload);
    return data;
  },

  async putTag(slug, payload) {
    const { data } = await api.put(`/news/tags/${slug}/`, payload);
    return data;
  },

  async deleteTag(slug) {
    const res = await api.delete(`/news/tags/${slug}/`);
    return res?.data ?? null;
  },
};
