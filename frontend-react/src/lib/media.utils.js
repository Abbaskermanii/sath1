export function getSafeHref(href) {
  return typeof href === "string" ? href.trim() : "";
}

export function isExternalHref(href) {
  return /^https?:\/\//i.test(getSafeHref(href));
}

export function hasValidHref(href) {
  const value = getSafeHref(href);
  return value.length > 0 && value !== "#";
}

export function normalizeEmbedUrl(url = "") {
  if (!url) return "";

  const trimmed = String(url).trim();

  const scriptSrcMatch = trimmed.match(/src=["']([^"']+)["']/i);
  const rawUrl = scriptSrcMatch ? scriptSrcMatch[1] : trimmed;

  if (!rawUrl) return "";

  if (rawUrl.includes("youtube.com/watch?v=")) {
    const videoId = rawUrl.split("v=")[1]?.split("&")[0];
    return videoId ? `https://www.youtube.com/embed/${videoId}?rel=0` : rawUrl;
  }

  if (rawUrl.includes("youtu.be/")) {
    const videoId = rawUrl.split("youtu.be/")[1]?.split("?")[0];
    return videoId ? `https://www.youtube.com/embed/${videoId}?rel=0` : rawUrl;
  }

  if (rawUrl.includes("youtube.com/embed/")) {
    return rawUrl;
  }

  const aparatEmbedMatch = rawUrl.match(/aparat\.com\/embed\/([^/?&]+)/i);
  if (aparatEmbedMatch) {
    const videoHash = aparatEmbedMatch[1];
    return `https://www.aparat.com/video/video/embed/videohash/${videoHash}/vt/frame`;
  }

  const aparatVideoMatch = rawUrl.match(/aparat\.com\/v\/([^/?&]+)/i);
  if (aparatVideoMatch) {
    const videoHash = aparatVideoMatch[1];
    return `https://www.aparat.com/video/video/embed/videohash/${videoHash}/vt/frame`;
  }

  if (rawUrl.includes("/video/video/embed/videohash/")) {
    return rawUrl;
  }

  return rawUrl;
}
