import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

function normalizeEmbedUrl(url = "") {
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

export default function SnowflakeVideoCard({ videos = [] }) {
  const safeVideos = useMemo(
    () => (Array.isArray(videos) ? videos : []),
    [videos],
  );

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index >= safeVideos.length) {
      setIndex(0);
    }
  }, [index, safeVideos.length]);

  const current = safeVideos[index];

  const next = () => {
    setIndex((prev) =>
      safeVideos.length ? (prev + 1) % safeVideos.length : 0,
    );
  };

  const prev = () => {
    setIndex((prev) =>
      safeVideos.length
        ? (prev - 1 + safeVideos.length) % safeVideos.length
        : 0,
    );
  };

  if (!current) return null;

  const embedSrc = normalizeEmbedUrl(
    current.embedUrl || current.embed_url || "",
  );

  const videoFile = current.videoFile || current.video_file || "";
  const previewImage =
    current.image ||
    current.cover ||
    current.thumbnail ||
    current.video_thumbnail ||
    current.poster ||
    "";

  const hasVideoFile = Boolean(videoFile);
  const hasEmbed = Boolean(embedSrc);
  const hasPreview = Boolean(previewImage);

  return (
    <div dir="rtl" className="mx-auto max-w-md overflow-hidden bg-white">
      <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
        <h2 className="text-lg font-bold text-gray-900">ویدیوهای امروز</h2>
      </div>

      <div className="m-4 overflow-hidden rounded-xl bg-black">
        <div className="relative aspect-video w-full bg-black">
          {hasVideoFile ? (
            <video
              key={current.id || current.slug || index}
              src={videoFile}
              controls
              playsInline
              preload="metadata"
              poster={hasPreview ? previewImage : undefined}
              className="h-full w-full object-cover"
            />
          ) : hasEmbed ? (
            <iframe
              key={current.id || current.slug || index}
              src={embedSrc}
              title={current.title || "video"}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
              className="h-full w-full"
            />
          ) : hasPreview ? (
            <img
              src={previewImage}
              alt={current.title || "video"}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full min-h-[220px] w-full items-center justify-center text-sm text-white">
              منبعی برای نمایش وجود ندارد
            </div>
          )}

          {current.duration ? (
            <div className="absolute bottom-3 right-3 z-20 rounded bg-black/70 px-2 py-1 text-xs text-white">
              {current.duration}
            </div>
          ) : null}
        </div>
      </div>

      <div className="px-5 pb-3 text-right">
        <h3 className="min-h-12 line-clamp-2 text-base font-bold leading-snug text-gray-900">
          {current.title}
        </h3>
      </div>

      <div className="flex items-center justify-between px-5 pb-5">
        <div className="flex gap-2">
          {safeVideos.map((item, i) => (
            <button
              key={item?.id || item?.slug || i}
              type="button"
              onClick={() => setIndex(i)}
              className={
                i === index
                  ? "h-2.5 w-2.5 scale-110 rounded-full bg-gray-900 transition-all duration-300"
                  : "h-2.5 w-2.5 rounded-full bg-gray-300 transition-all duration-300"
              }
              aria-label={`رفتن به اسلاید ${i + 1}`}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={prev}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 transition-all duration-300 hover:scale-105 hover:bg-gray-100"
            aria-label="قبلی"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={next}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 transition-all duration-300 hover:scale-105 hover:bg-gray-100"
            aria-label="بعدی"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
