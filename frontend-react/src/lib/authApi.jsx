import { api } from "./axiosClient";
import { setTokens } from "./tokens";

function extractAxiosErrorMessage(err) {
  const data = err?.response?.data;

  if (!data) return err?.message || "Request failed";
  if (typeof data === "string") return data;
  if (data.detail) return data.detail;

  const firstKey = Object.keys(data)[0];
  const firstValue = data[firstKey];

  if (Array.isArray(firstValue)) return `${firstKey}: ${firstValue[0]}`;
  if (typeof firstValue === "string") return `${firstKey}: ${firstValue}`;

  return JSON.stringify(data);
}

export async function registerApi(payload) {
  try {
    const { data } = await api.post("/accounts/register/", payload);
    return data;
  } catch (err) {
    throw new Error(extractAxiosErrorMessage(err), { cause: err });
  }
}

export async function loginApi(payload) {
  try {
    const { data } = await api.post("/accounts/login/", payload);

    if (data?.access && data?.refresh) {
      setTokens({
        access: data.access,
        refresh: data.refresh,
      });
    }

    return data;
  } catch (err) {
    throw new Error(extractAxiosErrorMessage(err), { cause: err });
  }
}

export async function refreshTokenApi(refresh) {
  try {
    const { data } = await api.post("/accounts/token/refresh/", { refresh });
    return data;
  } catch (err) {
    throw new Error(extractAxiosErrorMessage(err), { cause: err });
  }
}

export function canAccessDashboard(user) {
  if (!user) return false;
  return user.role === "admin" || user.role === "author";
}
