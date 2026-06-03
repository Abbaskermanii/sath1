import { api } from "../axiosClient";

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

export const mediaApi = {
  // Videos
  async getVideos(params = {}) {
    const { data } = await api.get("/media/videos/", { params });
    return data;
  },

  async getVideosList(params = {}) {
    const { data } = await api.get("/media/videos/", { params });
    return normalizeListResponse(data);
  },

  async getVideo(slug) {
    const validSlug = assertValidSlug(slug, "getVideo");
    const { data } = await api.get(`/media/videos/${validSlug}/`);
    return data;
  },

  async getVideoBySlug(slug) {
    const validSlug = assertValidSlug(slug, "getVideoBySlug");
    const { data } = await api.get(`/media/videos/${validSlug}/`);
    return data;
  },

  async getFeaturedVideos(params = {}) {
    const { data } = await api.get("/media/videos/", {
      params: {
        ...params,
        is_featured: true,
      },
    });

    return data;
  },

  async getFeaturedVideosList(params = {}) {
    const { data } = await api.get("/media/videos/", {
      params: {
        ...params,
        is_featured: true,
      },
    });

    return normalizeListResponse(data);
  },

  // Podcasts
  async getPodcasts(params = {}) {
    const { data } = await api.get("/media/podcasts/", { params });
    return data;
  },

  async getPodcastsList(params = {}) {
    const { data } = await api.get("/media/podcasts/", { params });
    return normalizeListResponse(data);
  },

  async getPodcast(slug) {
    const validSlug = assertValidSlug(slug, "getPodcast");
    const { data } = await api.get(`/media/podcasts/${validSlug}/`);
    return data;
  },

  async getPodcastBySlug(slug) {
    const validSlug = assertValidSlug(slug, "getPodcastBySlug");
    const { data } = await api.get(`/media/podcasts/${validSlug}/`);
    return data;
  },

  async getFeaturedPodcasts(params = {}) {
    const { data } = await api.get("/media/podcasts/", {
      params: {
        ...params,
        is_featured: true,
      },
    });

    return data;
  },

  async getFeaturedPodcastsList(params = {}) {
    const { data } = await api.get("/media/podcasts/", {
      params: {
        ...params,
        is_featured: true,
      },
    });

    return normalizeListResponse(data);
  },
};
