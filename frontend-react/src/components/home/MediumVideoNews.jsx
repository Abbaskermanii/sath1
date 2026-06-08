function normalizeEmbedUrl(url = "") {
  const trimmed = String(url || "").trim();
  if (!trimmed) return "";

  const srcMatch = trimmed.match(/src=["']([^"']+)["']/i);
  const rawUrl = (srcMatch ? srcMatch[1] : trimmed).trim();

  if (!rawUrl) return "";

  if (rawUrl.includes("youtube.com/watch?v=")) {
    const videoId = rawUrl.split("v=")[1]?.split("&")[0];
    return videoId
      ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`
      : rawUrl;
  }

  if (rawUrl.includes("youtu.be/")) {
    const videoId = rawUrl.split("youtu.be/")[1]?.split("?")[0];
    return videoId
      ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`
      : rawUrl;
  }

  if (rawUrl.includes("youtube.com/embed/")) {
    return rawUrl;
  }

  const aparatEmbedMatch = rawUrl.match(/aparat\.com\/embed\/([^/?&]+)/i);
  if (aparatEmbedMatch) {
    return `https://www.aparat.com/video/video/embed/videohash/${aparatEmbedMatch[1]}/vt/frame`;
  }

  const aparatVideoMatch = rawUrl.match(/aparat\.com\/v\/([^/?&]+)/i);
  if (aparatVideoMatch) {
    return `https://www.aparat.com/video/video/embed/videohash/${aparatVideoMatch[1]}/vt/frame`;
  }

  if (rawUrl.includes("/video/video/embed/videohash/")) {
    return rawUrl;
  }

  return rawUrl;
}

function getMediaSource({ videoFile, embedUrl, image }) {
  const safeVideoFile = String(videoFile || "").trim();
  const safeImage = String(image || "").trim();
  const safeEmbedUrl = normalizeEmbedUrl(embedUrl);

  if (safeVideoFile) {
    return {
      type: "video",
      src: safeVideoFile,
      poster: safeImage || undefined,
    };
  }

  if (safeEmbedUrl) {
    return {
      type: "embed",
      src: safeEmbedUrl,
    };
  }

  if (safeImage) {
    return {
      type: "image",
      src: safeImage,
    };
  }

  return {
    type: "empty",
    src: "",
  };
}

function MediumVideoNews({ title, description, embedUrl, videoFile, image }) {
  const media = getMediaSource({ videoFile, embedUrl, image });
  const mediaTitle = title || "ویدیو";

  return (
    <article className="flex w-full justify-center bg-white" dir="rtl">
      <div className="flex w-full max-w-60 flex-col space-y-4">
        <div className="relative w-full overflow-hidden rounded-2xl bg-black">
          {media.type === "video" ? (
            <video
              src={media.src}
              preload="metadata"
              playsInline
              controls
              poster={media.poster}
              className="aspect-video h-full w-full object-cover"
            />
          ) : media.type === "embed" ? (
            <div className="aspect-video w-full">
              <iframe
                src={media.src}
                title={mediaTitle}
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                className="h-full w-full border-0"
              />
            </div>
          ) : media.type === "image" ? (
            <img
              src={media.src}
              alt={mediaTitle}
              className="aspect-video h-full w-full object-cover"
            />
          ) : (
            <div className="flex aspect-video w-full items-center justify-center px-4 text-center text-sm text-white">
              ویدیویی برای نمایش وجود ندارد
            </div>
          )}
        </div>

        {(title || description) && (
          <div className="space-y-3">
            {title ? (
              <h2 className="text-sm font-bold leading-snug text-neutral-900">
                {title}
              </h2>
            ) : null}

            {description ? (
              <p className="text-xs leading-relaxed text-neutral-600">
                {description}
              </p>
            ) : null}
          </div>
        )}
      </div>
    </article>
  );
}

export default MediumVideoNews;
