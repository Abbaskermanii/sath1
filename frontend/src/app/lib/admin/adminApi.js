import { apiClient } from "@/app/lib/apiClient";

export const adminApi = {
  async listCategories() {
    const { data } = await apiClient.get("/categories/");
    return data;
  },
  async createCategory(payload) {
    const { data } = await apiClient.post("/categories/", payload);
    return data;
  },
  async listTags() {
    const { data } = await apiClient.get("/tags/");
    return data;
  },
};
