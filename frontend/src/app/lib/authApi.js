import { api } from "@/app/lib/axiosClient";
import { setTokens } from "@/app/lib/tokens";

function extractAxiosErrorMessage(err) {
  const data = err?.response?.data;
  if (!data) return err?.message || "Request failed";
  if (typeof data === "string") return data;
  if (data.detail) return data.detail;
  const k = Object.keys(data)[0];
  const v = data[k];
  if (Array.isArray(v)) return `${k}: ${v[0]}`;
  return JSON.stringify(data);
}

export async function registerApi(payload) {
  try {
    const { data } = await api.post("/accounts/register/", payload);
    return data;
  } catch (err) {
    throw new Error(extractAxiosErrorMessage(err));
  }
}

export async function loginApi(payload) {
  // طبق swagger: POST /api/accounts/login/
  // معمولاً خروجی شامل access/refresh است
  try {
    const { data } = await api.post("/accounts/login/", payload);
    if (data?.access || data?.refresh) {
      setTokens({ access: data.access, refresh: data.refresh });
    }
    return data;
  } catch (err) {
    throw new Error(extractAxiosErrorMessage(err));
  }
}

export async function refreshTokenApi(refresh) {
  try {
    const { data } = await api.post("/accounts/token/refresh/", { refresh });
    return data; // {access: "..."} معمولاً
  } catch (err) {
    throw new Error(extractAxiosErrorMessage(err));
  }
}
