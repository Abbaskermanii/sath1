export function getAccessToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access");
}

export function getRefreshToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("refresh");
}

export function setTokens({ access, refresh }) {
  if (typeof window === "undefined") return;

  if (access) localStorage.setItem("access", access);
  if (refresh) localStorage.setItem("refresh", refresh);
}

export function clearTokens() {
  if (typeof window === "undefined") return;

  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
}

export function isLoggedIn() {
  return !!getAccessToken();
}

function parseJwt(token) {
  try {
    if (!token) return null;

    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");

    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);

    const json =
      typeof window !== "undefined"
        ? decodeURIComponent(
            Array.prototype.map
              .call(
                atob(padded),
                (c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2),
              )
              .join(""),
          )
        : atob(padded);

    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function getUserIdFromAccess() {
  const payload = parseJwt(getAccessToken());
  return payload?.user_id ?? payload?.id ?? payload?.sub ?? null;
}

export function getUserNameFromAccess() {
  const payload = parseJwt(getAccessToken());
  return payload?.username ?? payload?.name ?? payload?.email ?? null;
}
