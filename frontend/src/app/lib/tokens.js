export function getAccessToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access") || localStorage.getItem("access_token");
}

export function getRefreshToken() {
  if (typeof window === "undefined") return null;
  return (
    localStorage.getItem("refresh") || localStorage.getItem("refresh_token")
  );
}

export function setTokens({ access, refresh }) {
  if (typeof window === "undefined") return;

  if (access) {
    localStorage.setItem("access", access);
    localStorage.setItem("access_token", access);
  }

  if (refresh) {
    localStorage.setItem("refresh", refresh);
    localStorage.setItem("refresh_token", refresh);
  }
}

export function clearTokens() {
  if (typeof window === "undefined") return;

  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

export function isLoggedIn() {
  return !!getAccessToken();
}

function parseJwt(token) {
  try {
    if (!token) return null;
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );

    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function getAccessPayload() {
  const token = getAccessToken();
  return parseJwt(token);
}

export function getUserIdFromAccess() {
  const payload = getAccessPayload();
  return payload?.user_id ?? payload?.id ?? payload?.sub ?? null;
}

export function getUserNameFromAccess() {
  const payload = getAccessPayload();
  return (
    payload?.username ??
    payload?.name ??
    payload?.full_name ??
    payload?.email ??
    null
  );
}

export function getUserRoleFromAccess() {
  const payload = getAccessPayload();
  return payload?.role ?? null;
}
