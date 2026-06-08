import { api } from "../../lib/axiosClient";

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

function normalizeListResponse(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

export const dashboardApi = {
  async getOverview() {
    const { data } = await api.get("/dashboard/overview/");
    return data;
  },

  async getMyContent(params = {}) {
    const safeParams =
      params && typeof params === "object" && !Array.isArray(params)
        ? params
        : {};

    const { data } = await api.get("/dashboard/my-content/", {
      params: safeParams,
    });
    return normalizeListResponse(data);
  },

  async getMyPosts(params = {}) {
    const safeParams =
      params && typeof params === "object" && !Array.isArray(params)
        ? params
        : {};

    const { data } = await api.get("/news/posts/mine/", {
      params: safeParams,
    });

    return data;
  },

  async getModerationComments() {
    const { data } = await api.get("/dashboard/moderation/comments/");
    return normalizeListResponse(data);
  },

  async getCategories() {
    const { data } = await api.get("/news/categories/");
    return normalizeListResponse(data);
  },

  async getTags() {
    const { data } = await api.get("/news/tags/");
    return normalizeListResponse(data);
  },

  async getPostBySlug(slug) {
    const validSlug = assertValidSlug(slug, "getPostBySlug");
    const { data } = await api.get(`/news/posts/${validSlug}/`);
    return data;
  },

  async createPost(payload) {
    const { data } = await api.post("/news/posts/", payload, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  },

  async updatePost(slug, payload) {
    const validSlug = assertValidSlug(slug, "updatePost");
    const { data } = await api.patch(`/news/posts/${validSlug}/`, payload, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  },

  async putPost(slug, payload) {
    const validSlug = assertValidSlug(slug, "putPost");
    const { data } = await api.put(`/news/posts/${validSlug}/`, payload, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  },

  async deletePost(slug) {
    const validSlug = assertValidSlug(slug, "deletePost");
    const res = await api.delete(`/news/posts/${validSlug}/`);
    return res?.data ?? null;
  },
};
