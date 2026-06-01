import { api } from "@/app/lib/axiosClient";

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
  return [];
}

export const dashboardApi = {
  async getOverview() {
    const { data } = await api.get("/dashboard/overview/");
    return data;
  },

  async getMyContent(params = {}) {
    const searchParams = new URLSearchParams();

    if (params?.type) searchParams.set("type", params.type);
    if (params?.status) searchParams.set("status", params.status);

    const query = searchParams.toString();
    const url = query
      ? `/dashboard/my-content/?${query}`
      : "/dashboard/my-content/";

    const { data } = await api.get(url);
    return normalizeListResponse(data);
  },

  async getMypost() {
    const { data } = await api.get("/news/posts/");
    return normalizeListResponse(data);
  },

  async getModerationComments() {
    const { data } = await api.get("/dashboard/moderation/comments/");
    return normalizeListResponse(data);
  },

  async getPostBySlug(slug) {
    const validSlug = assertValidSlug(slug, "getPostBySlug");
    const { data } = await api.get(
      `/news/posts/${encodeURIComponent(validSlug)}/`,
    );
    return data;
  },

  async updatePost(slug, payload) {
    const validSlug = assertValidSlug(slug, "updatePost");
    const { data } = await api.patch(
      `/news/posts/${encodeURIComponent(validSlug)}/`,
      payload,
    );
    return data;
  },

  async deletePost(slug) {
    const validSlug = assertValidSlug(slug, "deletePost");
    const res = await api.delete(
      `/news/posts/${encodeURIComponent(validSlug)}/`,
    );
    return res?.data ?? null;
  },

  async createPost(payload) {
    const { data } = await api.post("/news/posts/", payload);
    return data;
  },
};
