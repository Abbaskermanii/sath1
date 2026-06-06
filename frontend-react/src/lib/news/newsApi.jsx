import { api } from "../axiosClient";
// فرض می‌کنیم normalizePost در فایل دیگری مثل ../lib/normalizers قرار دارد
import { normalizePost } from "../../lib/normalizers";

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
    // اینجا هم اگر خواستی دیتا را نرمالایز کنی، می‌توانی normalizePosts را صدا بزنی
    // return normalizePosts(data);
    return data;
  },

  async getPostsList(params = {}) {
    const { data } = await api.get("/news/posts/", { params });
    // اینجا هم اگر خواستی دیتا را نرمالایز کنی، می‌توانی normalizePosts را صدا بزنی
    // return normalizePosts(data);
    return normalizeListResponse(data);
  },

  async getPost(slug) {
    const validSlug = assertValidSlug(slug, "getPost");
    const { data } = await api.get(`/news/posts/${validSlug}/`);
    // **** اینجا دیتا را نرمالایز کن ****
    return normalizePost(data);
  },

  async getPostBySlug(slug) {
    const validSlug = assertValidSlug(slug, "getPostBySlug");
    const { data } = await api.get(`/news/posts/${validSlug}/`);
    // **** اینجا هم دیتا را نرمالایز کن ****
    return normalizePost(data);
  },

  async createPost(payload) {
    const { data } = await api.post("/news/posts/", payload);
    return data; // یا normalizePost(data) اگر لازم باشد
  },

  async updatePost(slug, payload) {
    const validSlug = assertValidSlug(slug, "updatePost");
    const { data } = await api.patch(`/news/posts/${validSlug}/`, payload);
    return data; // یا normalizePost(data) اگر لازم باشد
  },

  async updatePostBySlug(slug, payload) {
    const validSlug = assertValidSlug(slug, "updatePostBySlug");
    const { data } = await api.patch(`/news/posts/${validSlug}/`, payload);
    return data; // یا normalizePost(data) اگر لازم باشد
  },

  async putPost(slug, payload) {
    const validSlug = assertValidSlug(slug, "putPost");
    const { data } = await api.put(`/news/posts/${validSlug}/`, payload);
    return data; // یا normalizePost(data) اگر لازم باشد
  },

  async deletePost(slug) {
    const validSlug = assertValidSlug(slug, "deletePost");
    const res = await api.delete(`/news/posts/${validSlug}/`);
    return res?.data ?? null;
  },

  async getRelatedPosts(slug) {
    const validSlug = assertValidSlug(slug, "getRelatedPosts");
    const { data } = await api.get(`/news/posts/${validSlug}/related/`);
    // **** اگر نیاز بود، اینجا هم normalizePosts را صدا بزن ****
    return data;
  },

  async getHomePosts() {
    const { data } = await api.get("/news/posts/home/");
    // **** اگر نیاز بود، اینجا هم normalizePosts را صدا بزن ****
    return data;
  },

  async getHomepageSections() {
    const { data } = await api.get("/news/posts/homepage_sections/");
    return data;
  },

  async getLatestPosts() {
    const { data } = await api.get("/news/posts/latest/");
    // **** اگر نیاز بود، اینجا هم normalizePosts را صدا بزن ****
    return data;
  },

  async getPopularPosts() {
    const { data } = await api.get("/news/posts/popular/");
    // **** اگر نیاز بود، اینجا هم normalizePosts را صدا بزن ****
    return data;
  },

  async getMyPosts(params = {}) {
    const { data } = await api.get("/news/posts/mine/", { params });
    // **** اگر نیاز بود، اینجا هم normalizePosts را صدا بزن ****
    return data;
  },

  async getMyPostsList(params = {}) {
    const { data } = await api.get("/news/posts/mine/", { params });
    // **** اینجا هم normalizePosts را صدا بزن ****
    return normalizeListResponse(data);
  },

  async getPostTypes() {
    const { data } = await api.get("/news/posts/post_types/");
    return data;
  },

  // Categories
  async getCategories(params = {}) {
    const { data } = await api.get("/news/categories/", { params });
    return data; // یا normalizeCategories(data)
  },

  async getCategoriesList(params = {}) {
    const { data } = await api.get("/news/categories/", { params });
    return normalizeListResponse(data); // یا normalizeCategories(data)
  },

  async getCategory(slug) {
    const validSlug = assertValidSlug(slug, "getCategory");
    const { data } = await api.get(`/news/categories/${validSlug}/`);
    return data; // یا normalizeCategory(data)
  },

  async getCategoryPage(slug) {
    const validSlug = assertValidSlug(slug, "getCategoryPage");
    const { data } = await api.get(`/news/categories/${validSlug}/page/`);
    // **** این تابع معمولا لیستی از پست‌ها را برمی‌گرداند ****
    // **** پس بهتر است از normalizePosts استفاده کنی ****
    if (data.hero) data.hero = normalizeListResponse(data.hero);
    if (data.featured) data.featured = normalizeListResponse(data.featured);
    if (data.latest) data.latest = normalizeListResponse(data.latest);
    if (data.popular) data.popular = normalizeListResponse(data.popular);
    // data.category هم نیاز به نرمالایز دارد
    // eslint-disable-next-line no-undef
    if (data.category) data.category = normalizeCategory(data.category);
    return data;
  },

  async createCategory(payload) {
    const { data } = await api.post("/news/categories/", payload);
    return data; // یا normalizeCategory(data)
  },

  async updateCategory(slug, payload) {
    const validSlug = assertValidSlug(slug, "updateCategory");
    const { data } = await api.patch(`/news/categories/${validSlug}/`, payload);
    return data; // یا normalizeCategory(data)
  },

  async putCategory(slug, payload) {
    const validSlug = assertValidSlug(slug, "putCategory");
    const { data } = await api.put(`/news/categories/${validSlug}/`, payload);
    return data; // یا normalizeCategory(data)
  },

  async deleteCategory(slug) {
    const validSlug = assertValidSlug(slug, "deleteCategory");
    const res = await api.delete(`/news/categories/${validSlug}/`);
    return res?.data ?? null;
  },

  // Tags
  async getTags(params = {}) {
    const { data } = await api.get("/news/tags/", { params });
    return data; // یا normalizeTags(data)
  },

  async getTagsList(params = {}) {
    const { data } = await api.get("/news/tags/", { params });
    return normalizeListResponse(data); // یا normalizeTags(data)
  },

  async getTag(slug) {
    const validSlug = assertValidSlug(slug, "getTag");
    const { data } = await api.get(`/news/tags/${validSlug}/`);
    return data; // یا normalizeTag(data)
  },

  async createTag(payload) {
    const { data } = await api.post("/news/tags/", payload);
    return data; // یا normalizeTag(data)
  },

  async updateTag(slug, payload) {
    const validSlug = assertValidSlug(slug, "updateTag");
    const { data } = await api.patch(`/news/tags/${validSlug}/`, payload);
    return data; // یا normalizeTag(data)
  },

  async putTag(slug, payload) {
    const validSlug = assertValidSlug(slug, "putTag");
    const { data } = await api.put(`/news/tags/${validSlug}/`, payload);
    return data; // یا normalizeTag(data)
  },

  async deleteTag(slug) {
    const validSlug = assertValidSlug(slug, "deleteTag");
    const res = await api.delete(`/news/tags/${validSlug}/`);
    return res?.data ?? null;
  },

  // Comments
  async getComments(params = {}) {
    const { data } = await api.get("/news/comments/", { params });
    return data; // یا normalizeComments(data)
  },

  async getCommentsList(params = {}) {
    const { data } = await api.get("/news/comments/", { params });
    return normalizeListResponse(data); // یا normalizeComments(data)
  },

  async createComment(payload) {
    const { data } = await api.post("/news/comments/", payload);
    return data; // یا normalizeComment(data)
  },

  async deleteComment(id) {
    const res = await api.delete(`/news/comments/${id}/`);
    return res?.data ?? null;
  },

  // Bookmarks
  async getBookmarks(params = {}) {
    const { data } = await api.get("/news/bookmarks/", { params });
    return data; // یا normalizeBookmarks(data)
  },

  async getBookmarksList(params = {}) {
    const { data } = await api.get("/news/bookmarks/", { params });
    return normalizeListResponse(data); // یا normalizeBookmarks(data)
  },

  async createBookmark(postId) {
    const { data } = await api.post("/news/bookmarks/", {
      post: postId,
    });
    return data; // یا normalizeBookmark(data)
  },

  async deleteBookmark(id) {
    const res = await api.delete(`/news/bookmarks/${id}/`);
    return res?.data ?? null;
  },

  async getPostCommentsList(postId, params = {}) {
    if (!postId) {
      const err = new Error(`Invalid postId in getPostCommentsList: ${postId}`);
      err.code = "INVALID_POST_ID";
      throw err;
    }

    const { data } = await api.get("/news/comments/", {
      params: { post: postId, ...params }, // ✅ مطابق بک‌اند DRF شما
    });
    return normalizeListResponse(data);
  },

  // Bookmarks
  async isBookmarked(postId) {
    if (!postId) return null;
    const { data } = await api.get("/news/bookmarks/", {
      params: { post: postId, page_size: 1 },
    });
    const list = normalizeListResponse(data);
    return list?.[0] || null;
  },
};
