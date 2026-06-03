import axios from "axios";
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from "./tokens";

// eslint-disable-next-line no-undef
const baseURL = "/api";

export const api = axios.create({
  baseURL,
});

function isAuthEndpoint(url = "") {
  return (
    url.includes("/accounts/login/") ||
    url.includes("/accounts/register/") ||
    url.includes("/accounts/token/refresh/")
  );
}

api.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (!config.headers) {
    config.headers = {};
  }

  if (token && !isAuthEndpoint(config.url || "")) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config;
    const status = error?.response?.status;
    const url = originalRequest?.url || "";
    const method = originalRequest?.method || "get";
    const responseData = error?.response?.data;

    // برای دیباگ دقیق
    console.error("API ERROR:", {
      status,
      method,
      url,
      response: responseData,
    });

    // هندل کردن 403
    if (status === 403) {
      // فعلاً فقط لاگ می‌کنیم
      // اگر خواستی بعداً می‌توانیم redirect کنیم به /forbidden
      return Promise.reject(error);
    }

    // هندل کردن 401 با refresh token
    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthEndpoint(url)
    ) {
      originalRequest._retry = true;

      const refresh = getRefreshToken();

      if (!refresh) {
        clearTokens();
        if (typeof window !== "undefined") {
          window.location.assign("/auth");
        }
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(
          `${baseURL}/accounts/token/refresh/`,
          { refresh },
        );

        setTokens({ access: data.access, refresh });

        if (!originalRequest.headers) {
          originalRequest.headers = {};
        }

        originalRequest.headers.Authorization = `Bearer ${data.access}`;
        return api(originalRequest);
      } catch (refreshError) {
        clearTokens();
        if (typeof window !== "undefined") {
          window.location.assign("/auth");
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
