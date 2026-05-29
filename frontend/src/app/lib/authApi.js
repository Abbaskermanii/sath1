import { api } from "@/app/lib/axiosClient";
import { setTokens } from "@/app/lib/tokens";

function extractAxiosErrorMessage(err) {
  const data = err?.response?.data;

  if (!data) return err?.message || "Request failed";

  // DRF: {detail:"..."} یا {field:["..."]}
  if (typeof data === "string") return data;
  if (data.detail) return data.detail;

  // اولین خطا از فیلدها
  const firstKey = Object.keys(data)[0];
  const firstVal = data[firstKey];
  if (Array.isArray(firstVal)) return `${firstKey}: ${firstVal[0]}`;
  return JSON.stringify(data);
}

export async function registerApi(payload) {
  try {
    const { data } = await api.post("/user/register/", payload);
    return data;
  } catch (err) {
    throw new Error(extractAxiosErrorMessage(err));
  }
}

// لاگین: گرفتن توکن با email/password
export async function tokenApi({ email, password }) {
  try {
    const { data } = await api.post("/user/token/", { email, password });
    setTokens({ access: data.access, refresh: data.refresh });
    return data;
  } catch (err) {
    throw new Error(extractAxiosErrorMessage(err));
  }
}

// برای سازگاری با LoginPage
export const loginApi = tokenApi;

export async function getProfile(userId) {
  const { data } = await api.get(`/user/profile/${userId}/`);
  return data;
}
