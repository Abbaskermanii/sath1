import { api } from "../axiosClient";
import {
  normalizePost,
  normalizePosts,
  normalizeCategory,
  normalizeCategories,
  normalizeTag,
  normalizeTags,
  normalizeComment,
  normalizeComments,
  normalizeBookmark,
  normalizeBookmarks,
} from "../../lib/normalizers";

function normalizeListResponse(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

function normalizePaginatedResponse(data, itemNormalizer) {
  if (Array.isArray(data)) {
    return data.map(itemNormalizer);
  }

  if (data && Array.isArray(data.results)) {
    return {
      ...data,
      results: data.results.map(itemNormalizer),
    };
  }

  return data;
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
    return normalizePaginatedResponse(data, normalizePost);
  },

  async getPostsList(params = {}) {
    const { data } = await api.get("/news/posts/", { params });
    return normalizePosts(normalizeListResponse(data));
  },

  async getPost(slug) {
    const validSlug = assertValidSlug(slug, "getPost");
    const { data } = await api.get(`/news/posts/${validSlug}/`);
    return normalizePost(data);
  },

  async getPostBySlug(slug) {
    const validSlug = assertValidSlug(slug, "getPostBySlug");
    const { data } = await api.get(`/news/posts/${validSlug}/`);
    return normalizePost(data);
  },

  async createPost(payload) {
    const { data } = await api.post("/news/posts/", payload);
    return normalizePost(data);
  },

  async updatePost(slug, payload) {
    const validSlug = assertValidSlug(slug, "updatePost");
    const { data } = await api.patch(`/news/posts/${validSlug}/`, payload);
    return normalizePost(data);
  },

  async updatePostBySlug(slug, payload) {
    const validSlug = assertValidSlug(slug, "updatePostBySlug");
    const { data } = await api.patch(`/news/posts/${validSlug}/`, payload);
    return normalizePost(data);
  },

  async putPost(slug, payload) {
    const validSlug = assertValidSlug(slug, "putPost");
    const { data } = await api.put(`/news/posts/${validSlug}/`, payload);
    return normalizePost(data);
  },

  async deletePost(slug) {
    const validSlug = assertValidSlug(slug, "deletePost");
    const res = await api.delete(`/news/posts/${validSlug}/`);
    return res?.data ?? null;
  },

  async getRelatedPosts(slug) {
    const validSlug = assertValidSlug(slug, "getRelatedPosts");
    const { data } = await api.get(`/news/posts/${validSlug}/related/`);
    return normalizePaginatedResponse(data, normalizePost);
  },

  async getHomePosts() {
    const { data } = await api.get("/news/posts/home/");
    return normalizePaginatedResponse(data, normalizePost);
  },

  async getHomepageSections() {
    const { data } = await api.get("/news/posts/homepage_sections/");

    return {
      ...data,
      hero: normalizePosts(normalizeListResponse(data?.hero)),
      featured: normalizePosts(normalizeListResponse(data?.featured)),
      latest: normalizePosts(normalizeListResponse(data?.latest)),
      popular: normalizePosts(normalizeListResponse(data?.popular)),
      videos: normalizePosts(normalizeListResponse(data?.videos)),
      podcasts: normalizePosts(normalizeListResponse(data?.podcasts)),
      editors_pick: normalizePosts(normalizeListResponse(data?.editors_pick)),
    };
  },

  async getLatestPosts() {
    const { data } = await api.get("/news/posts/latest/");
    return normalizePaginatedResponse(data, normalizePost);
  },

  async getPopularPosts() {
    const { data } = await api.get("/news/posts/popular/");
    return normalizePaginatedResponse(data, normalizePost);
  },

  async getMyPosts(params = {}) {
    const { data } = await api.get("/news/posts/mine/", { params });
    return normalizePaginatedResponse(data, normalizePost);
  },

  async getMyPostsList(params = {}) {
    const { data } = await api.get("/news/posts/mine/", { params });
    return normalizePosts(normalizeListResponse(data));
  },

  async getPostTypes() {
    const { data } = await api.get("/news/posts/post_types/");
    return data;
  },

  // Categories
  async getCategories(params = {}) {
    const { data } = await api.get("/news/categories/", { params });
    return normalizePaginatedResponse(data, normalizeCategory);
  },

  async getCategoriesList(params = {}) {
    const { data } = await api.get("/news/categories/", { params });
    return normalizeCategories(normalizeListResponse(data));
  },

  async getCategory(slug) {
    const validSlug = assertValidSlug(slug, "getCategory");
    const { data } = await api.get(`/news/categories/${validSlug}/`);
    return normalizeCategory(data);
  },

  async getCategoryPage(slug) {
    const validSlug = assertValidSlug(slug, "getCategoryPage");
    const { data } = await api.get(`/news/categories/${validSlug}/page/`);

    return {
      ...data,
      category: data?.category ? normalizeCategory(data.category) : null,
      hero: normalizePosts(normalizeListResponse(data?.hero)),
      featured: normalizePosts(normalizeListResponse(data?.featured)),
      latest: normalizePosts(normalizeListResponse(data?.latest)),
      popular: normalizePosts(normalizeListResponse(data?.popular)),
    };
  },

  async createCategory(payload) {
    const { data } = await api.post("/news/categories/", payload);
    return normalizeCategory(data);
  },

  async updateCategory(slug, payload) {
    const validSlug = assertValidSlug(slug, "updateCategory");
    const { data } = await api.patch(`/news/categories/${validSlug}/`, payload);
    return normalizeCategory(data);
  },

  async putCategory(slug, payload) {
    const validSlug = assertValidSlug(slug, "putCategory");
    const { data } = await api.put(`/news/categories/${validSlug}/`, payload);
    return normalizeCategory(data);
  },

  async deleteCategory(slug) {
    const validSlug = assertValidSlug(slug, "deleteCategory");
    const res = await api.delete(`/news/categories/${validSlug}/`);
    return res?.data ?? null;
  },

  // Tags
  async getTags(params = {}) {
    const { data } = await api.get("/news/tags/", { params });
    return normalizePaginatedResponse(data, normalizeTag);
  },

  async getTagsList(params = {}) {
    const { data } = await api.get("/news/tags/", { params });
    return normalizeTags(normalizeListResponse(data));
  },

  async getTag(slug) {
    const validSlug = assertValidSlug(slug, "getTag");
    const { data } = await api.get(`/news/tags/${validSlug}/`);
    return normalizeTag(data);
  },

  async createTag(payload) {
    const { data } = await api.post("/news/tags/", payload);
    return normalizeTag(data);
  },

  async updateTag(slug, payload) {
    const validSlug = assertValidSlug(slug, "updateTag");
    const { data } = await api.patch(`/news/tags/${validSlug}/`, payload);
    return normalizeTag(data);
  },

  async putTag(slug, payload) {
    const validSlug = assertValidSlug(slug, "putTag");
    const { data } = await api.put(`/news/tags/${validSlug}/`, payload);
    return normalizeTag(data);
  },

  async deleteTag(slug) {
    const validSlug = assertValidSlug(slug, "deleteTag");
    const res = await api.delete(`/news/tags/${validSlug}/`);
    return res?.data ?? null;
  },

  // Comments
  async getComments(params = {}) {
    const { data } = await api.get("/news/comments/", { params });
    return normalizePaginatedResponse(data, normalizeComment);
  },

  async getCommentsList(params = {}) {
    const { data } = await api.get("/news/comments/", { params });
    return normalizeComments(normalizeListResponse(data));
  },

  async createComment(payload) {
    const { data } = await api.post("/news/comments/", payload);
    return normalizeComment(data);
  },

  async deleteComment(id) {
    const res = await api.delete(`/news/comments/${id}/`);
    return res?.data ?? null;
  },

  async getPostCommentsList(postId, params = {}) {
    if (!postId) {
      const err = new Error(`Invalid postId in getPostCommentsList: ${postId}`);
      err.code = "INVALID_POST_ID";
      throw err;
    }

    const { data } = await api.get("/news/comments/", {
      params: { post: postId, ...params },
    });

    return normalizeComments(normalizeListResponse(data));
  },

  // Bookmarks
  async getBookmarks(params = {}) {
    const { data } = await api.get("/news/bookmarks/", { params });
    return normalizePaginatedResponse(data, normalizeBookmark);
  },

  async getBookmarksList(params = {}) {
    const { data } = await api.get("/news/bookmarks/", { params });
    return normalizeBookmarks(normalizeListResponse(data));
  },

  async createBookmark(postId) {
    const { data } = await api.post("/news/bookmarks/", {
      post: postId,
    });
    return normalizeBookmark(data);
  },

  async deleteBookmark(id) {
    const res = await api.delete(`/news/bookmarks/${id}/`);
    return res?.data ?? null;
  },

  async isBookmarked(postId) {
    if (!postId) return null;

    const { data } = await api.get("/news/bookmarks/", {
      params: { post: postId, page_size: 1 },
    });

    const list = normalizeBookmarks(normalizeListResponse(data));
    return list?.[0] || null;
  },
};
