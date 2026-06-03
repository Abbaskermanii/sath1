export function getImageUrl(path) {
  if (!path) return "/img/placeholder.webp";

  try {
    new URL(path);

    if (typeof window === "undefined") {
      const publicUrl =
        // eslint-disable-next-line no-undef
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const internalUrl =
        // eslint-disable-next-line no-undef
        process.env.INTERNAL_API_URL || "http://backend:8000";

      return path.replace(publicUrl, internalUrl);
    }

    return path;
  } catch {
    const baseUrl =
      typeof window === "undefined"
        // eslint-disable-next-line no-undef
        ? process.env.INTERNAL_API_URL || "http://backend:8000"
        // eslint-disable-next-line no-undef
        : process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    if (path.startsWith("/")) {
      return `${baseUrl}${path}`;
    }

    return `${baseUrl}/${path}`;
  }
}
