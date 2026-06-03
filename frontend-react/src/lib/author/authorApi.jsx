import { apiClient } from "@/app/lib/apiClient";

export const authorApi = {
  async listMyPosts() {
    const { data } = await apiClient.get("/posts/me/");
    return data;
  },
  async createPost(payload) {
    const { data } = await apiClient.post("/posts/", payload);
    return data;
  },
};
