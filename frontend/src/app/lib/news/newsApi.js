import { api } from "@/app/lib/axiosClient";

function normalizeListResponse(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

function assertValidSlug(slug, fnName = "apiCall") {
  const normalizedSlug = typeof slug === "string" ? slug.trim() : slug;

  if (
    !normalizedSlug ||
    normalizedSlug === "undefined" ||
    normalizedSlug === "null"
  ) {
    const err = new Error(`Invalid slug in ${fnName}: ${slug}`);
    err.code = "INVALID_SLUG";
    throw err;
  }

  return normalizedSlug;
}

export const newsApi = {
  // Posts
  async getPosts(params = {}) {
    const { data } = await api.get("/news/posts/", { params });
    return data;
  },

  async getPostsList(params = {}) {
    const { data } = await api.get("/news/posts/", { params });
    return normalizeListResponse(data);
  },

  async getPost(slug) {
    const validSlug = assertValidSlug(slug, "getPost");
    const { data } = await api.get(`/news/posts/${validSlug}/`);
    return data;
  },

  async getPostBySlug(slug) {
    const validSlug = assertValidSlug(slug, "getPostBySlug");
    const { data } = await api.get(`/news/posts/${validSlug}/`);
    return data;
  },

  async createPost(payload) {
    const { data } = await api.post("/news/posts/", payload);
    return data;
  },

  async updatePost(slug, payload) {
    const validSlug = assertValidSlug(slug, "updatePost");
    const { data } = await api.patch(`/news/posts/${validSlug}/`, payload);
    return data;
  },

  async updatePostBySlug(slug, payload) {
    const validSlug = assertValidSlug(slug, "updatePostBySlug");
    const { data } = await api.patch(`/news/posts/${validSlug}/`, payload);
    return data;
  },

  async putPost(slug, payload) {
    const validSlug = assertValidSlug(slug, "putPost");
    const { data } = await api.put(`/news/posts/${validSlug}/`, payload);
    return data;
  },

  async deletePost(slug) {
    const validSlug = assertValidSlug(slug, "deletePost");
    const res = await api.delete(`/news/posts/${validSlug}/`);
    return res?.data ?? null;
  },

  async getRelatedPosts(slug) {
    const validSlug = assertValidSlug(slug, "getRelatedPosts");
    const { data } = await api.get(`/news/posts/${validSlug}/related/`);
    return data;
  },

  async getHomePosts() {
    const { data } = await api.get("/news/posts/home/");
    return data;
  },

  async getHomepageSections() {
    const { data } = await api.get("/news/posts/homepage_sections/");
    return data;
  },

  async getLatestPosts() {
    const { data } = await api.get("/news/posts/latest/");
    return data;
  },

  async getPopularPosts() {
    const { data } = await api.get("/news/posts/popular/");
    return data;
  },

  async getMyPosts(params = {}) {
    const { data } = await api.get("/news/posts/mine/", { params });
    return data;
  },

  async getMyPostsList(params = {}) {
    const { data } = await api.get("/news/posts/mine/", { params });
    return normalizeListResponse(data);
  },

  async getPostTypes() {
    const { data } = await api.get("/news/posts/post_types/");
    return data;
  },

  // Categories
  async getCategories(params = {}) {
    const { data } = await api.get("/news/categories/", { params });
    return data;
  },

  async getCategoriesList(params = {}) {
    const { data } = await api.get("/news/categories/", { params });
    return normalizeListResponse(data);
  },

  async getCategory(slug) {
    const validSlug = assertValidSlug(slug, "getCategory");
    const { data } = await api.get(`/news/categories/${validSlug}/`);
    return data;
  },

  async getCategoryPage(slug) {
    const validSlug = assertValidSlug(slug, "getCategoryPage");
    const { data } = await api.get(`/news/categories/${validSlug}/page/`);
    return data;
  },

  async createCategory(payload) {
    const { data } = await api.post("/news/categories/", payload);
    return data;
  },

  async updateCategory(slug, payload) {
    const validSlug = assertValidSlug(slug, "updateCategory");
    const { data } = await api.patch(`/news/categories/${validSlug}/`, payload);
    return data;
  },

  async putCategory(slug, payload) {
    const validSlug = assertValidSlug(slug, "putCategory");
    const { data } = await api.put(`/news/categories/${validSlug}/`, payload);
    return data;
  },

  async deleteCategory(slug) {
    const validSlug = assertValidSlug(slug, "deleteCategory");
    const res = await api.delete(`/news/categories/${validSlug}/`);
    return res?.data ?? null;
  },

  // Tags
  async getTags(params = {}) {
    const { data } = await api.get("/news/tags/", { params });
    return data;
  },

  async getTagsList(params = {}) {
    const { data } = await api.get("/news/tags/", { params });
    return normalizeListResponse(data);
  },

  async getTag(slug) {
    const validSlug = assertValidSlug(slug, "getTag");
    const { data } = await api.get(`/news/tags/${validSlug}/`);
    return data;
  },

  async createTag(payload) {
    const { data } = await api.post("/news/tags/", payload);
    return data;
  },

  async updateTag(slug, payload) {
    const validSlug = assertValidSlug(slug, "updateTag");
    const { data } = await api.patch(`/news/tags/${validSlug}/`, payload);
    return data;
  },

  async putTag(slug, payload) {
    const validSlug = assertValidSlug(slug, "putTag");
    const { data } = await api.put(`/news/tags/${validSlug}/`, payload);
    return data;
  },

  async deleteTag(slug) {
    const validSlug = assertValidSlug(slug, "deleteTag");
    const res = await api.delete(`/news/tags/${validSlug}/`);
    return res?.data ?? null;
  },

  // Comments
  async getComments(params = {}) {
    const { data } = await api.get("/news/comments/", { params });
    return data;
  },

  async getCommentsList(params = {}) {
    const { data } = await api.get("/news/comments/", { params });
    return normalizeListResponse(data);
  },

  async createComment(payload) {
    const { data } = await api.post("/news/comments/", payload);
    return data;
  },

  async deleteComment(id) {
    const res = await api.delete(`/news/comments/${id}/`);
    return res?.data ?? null;
  },

  // Bookmarks
  async getBookmarks(params = {}) {
    const { data } = await api.get("/news/bookmarks/", { params });
    return data;
  },

  async getBookmarksList(params = {}) {
    const { data } = await api.get("/news/bookmarks/", { params });
    return normalizeListResponse(data);
  },

  async createBookmark(postId) {
    const { data } = await api.post("/news/bookmarks/", {
      post: postId,
    });
    return data;
  },

  async deleteBookmark(id) {
    const res = await api.delete(`/news/bookmarks/${id}/`);
    return res?.data ?? null;
  },
};
