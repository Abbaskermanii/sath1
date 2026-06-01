import { apiClient } from "@/app/lib/apiClient";

export const dashboardApi = {
  async getOverview() {
    const { data } = await apiClient.get("/dashboard/overview/");
    return data;
  },

  async getMyContent() {
    // مسیر را اگر در Django فرق دارد، همینجا عوض کن
    const { data } = await apiClient.get("/dashboard/my-content/");
    return data;
  },
};
