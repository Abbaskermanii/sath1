import axios from "axios";
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from "@/app/lib/tokens";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!BASE_URL) {
  // کمک می‌کند سریع بفهمی env ست نشده
  // (در production می‌تونی حذفش کنی)
  console.warn("NEXT_PUBLIC_API_BASE_URL is not set");
}

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// کلاینت جدا برای refresh (بدون اینترسپتورهای api)
const refreshClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// مسیرهایی که نباید Bearer بخورند
function isAuthEndpoint(url = "") {
  return (
    url.includes("/user/token/") ||
    url.includes("/user/token/refresh/") ||
    url.includes("/user/register/")
  );
}

let isRefreshing = false;
let refreshQueue = [];

function resolveQueue(error, accessToken = null) {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(accessToken);
  });
  refreshQueue = [];
}

api.interceptors.request.use(
  (config) => {
    if (typeof window === "undefined") return config;

    const url = config?.url || "";
    if (isAuthEndpoint(url)) return config;

    const token = getAccessToken();
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    const originalRequest = error?.config;

    // اگر request نداریم یا 401 نیست
    if (!originalRequest || status !== 401) {
      return Promise.reject(error);
    }

    // روی auth endpointها رفرش نکن که loop نشود
    if (isAuthEndpoint(originalRequest?.url || "")) {
      return Promise.reject(error);
    }

    // جلوگیری از loop
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    // SSR
    if (typeof window === "undefined") {
      return Promise.reject(error);
    }

    const refresh = getRefreshToken();
    if (!refresh) {
      clearTokens();
      window.location.assign("/auth/login");
      return Promise.reject(error);
    }

    // اگر refresh در جریان است، این درخواست را صف کن
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({ resolve, reject });
      }).then((newAccess) => {
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return api(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { data } = await refreshClient.post("/user/token/refresh/", {
        refresh,
      });

      const newAccess = data?.access;
      if (!newAccess) throw new Error("No access token returned from refresh");

      setTokens({ access: newAccess, refresh });

      resolveQueue(null, newAccess);

      originalRequest.headers = originalRequest.headers ?? {};
      originalRequest.headers.Authorization = `Bearer ${newAccess}`;
      return api(originalRequest);
    } catch (refreshError) {
      resolveQueue(refreshError, null);
      clearTokens();
      window.location.assign("/auth/login");
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
