import axios from "axios";

function getAccessToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access") || localStorage.getItem("access_token");
}

function clearTokens() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api",
});

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearTokens();
    }
    return Promise.reject(error);
  },
);
