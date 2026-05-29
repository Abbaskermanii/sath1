import { jwtDecode } from "jwt-decode";

const ACCESS_KEY = "access_token";
const REFRESH_KEY = "refresh_token";

export function setTokens({ access, refresh }) {
  if (access) localStorage.setItem(ACCESS_KEY, access);
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
}

export function getAccessToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function clearTokens() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export function getAccessPayload() {
  const token = getAccessToken();
  if (!token) return null;

  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
}

export function getUserIdFromAccess() {
  const payload = getAccessPayload();
  return payload?.user_id ?? payload?.id ?? payload?.user?.id ?? null;
}

export function getUserNameFromAccess() {
  const payload = getAccessPayload();

  return (
    payload?.full_name ||
    payload?.name ||
    payload?.username ||
    payload?.email ||
    "کاربر"
  );
}

export function isLoggedIn() {
  return !!getAccessToken();
}
