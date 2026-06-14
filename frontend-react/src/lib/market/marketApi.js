import { api } from "../axiosClient";

function normalizeMarketItems(data) {

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
}

export async function getMarketItems() {
  try {
    const response = await api.get("markets/");
    return normalizeMarketItems(response.data);
  } catch (error) {
    console.error("Failed to fetch market items:", error);
    return [];
  }
}
