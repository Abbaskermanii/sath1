import { apiClient } from "../apiClient";

export const newsApi = {
  async getPosts(params = {}) {
    const { data } = await apiClient.get("/news/posts/", { params });
    return data;
  },

  async getPost(slug) {
    const { data } = await apiClient.get(`/news/posts/${slug}/`);
    return data;
  },

  async createPost(payload) {
    const { data } = await apiClient.post("/news/posts/", payload);
    return data;
  },

  async updatePost(slug, payload) {
    const { data } = await apiClient.patch(`/news/posts/${slug}/`, payload);
    return data;
  },

  async deletePost(slug) {
    const { data } = await apiClient.delete(`/news/posts/${slug}/`);
    return data;
  },

  async getCategories(params = {}) {
    const { data } = await apiClient.get("/news/categories/", { params });
    return data;
  },

  async getCategory(slug) {
    const { data } = await apiClient.get(`/news/categories/${slug}/`);
    return data;
  },

  async getTags(params = {}) {
    const { data } = await apiClient.get("/news/tags/", { params });
    return data;
  },

  async getComments(params = {}) {
    const { data } = await apiClient.get("/news/comments/", { params });
    return data;
  },

  async createComment(payload) {
    const { data } = await apiClient.post("/news/comments/", payload);
    return data;
  },

  async deleteComment(id) {
    const { data } = await apiClient.delete(`/news/comments/${id}/`);
    return data;
  },
};
