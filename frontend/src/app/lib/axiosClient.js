// src/app/lib/axiosClient.js
import axios from "axios";
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from "./tokens";

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const api = axios.create({ baseURL });

function isAuthEndpoint(url = "") {
  return url.includes("/accounts/login/") || url.includes("/accounts/token/refresh/") || url.includes("/accounts/register/");
}

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token && !isAuthEndpoint(config.url)) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;
    if (err.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint(originalRequest.url)) {
      originalRequest._retry = true;
      const refresh = getRefreshToken();
      if (refresh) {
        try {
          const { data } = await axios.post(`${baseURL}/accounts/token/refresh/`, { refresh });
          setTokens({ access: data.access, refresh });
          originalRequest.headers.Authorization = `Bearer ${data.access}`;
          return api(originalRequest);
        } catch (refreshErr) {
          clearTokens();
          window.location.assign("/auth");
        }
      } else {
        window.location.assign("/auth");
      }
    }
    return Promise.reject(err);
  }
);
