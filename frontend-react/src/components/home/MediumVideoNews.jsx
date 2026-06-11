import { useState } from "react";
import { Play } from "lucide-react";

/* =========================
   EMBED NORMALIZER
========================= */
function normalizeEmbedUrl(url = "") {
  const trimmed = String(url || "").trim();
  if (!trimmed) return "";

  const srcMatch = trimmed.match(/src=["']([^"']+)["']/i);
  const rawUrl = (srcMatch ? srcMatch[1] : trimmed).trim();
  if (!rawUrl) return "";

  // YouTube (watch)
  if (rawUrl.includes("youtube.com/watch?v=")) {
    const videoId = rawUrl.split("v=")[1]?.split("&")[0];
    return videoId ? `https://www.youtube.com/embed/${videoId}?rel=0` : rawUrl;
  }

  // YouTube (short)
  if (rawUrl.includes("youtu.be/")) {
    const videoId = rawUrl.split("youtu.be/")[1]?.split("?")[0];
    return videoId ? `https://www.youtube.com/embed/${videoId}?rel=0` : rawUrl;
  }

  // Already embed
  if (rawUrl.includes("youtube.com/embed/")) return rawUrl;

  // Aparat embed
  const aparatEmbedMatch = rawUrl.match(/aparat\.com\/embed\/([^/?&]+)/i);
  if (aparatEmbedMatch) {
    return `https://www.aparat.com/video/video/embed/videohash/${aparatEmbedMatch[1]}/vt/frame`;
  }

  // Aparat normal
  const aparatVideoMatch = rawUrl.match(/aparat\.com\/v\/([^/?&]+)/i);
  if (aparatVideoMatch) {
    return `https://www.aparat.com/video/video/embed/videohash/${aparatVideoMatch[1]}/vt/frame`;
  }

  if (rawUrl.includes("/video/video/embed/videohash/")) return rawUrl;

  return rawUrl;
}

/* =========================
   MEDIA RESOLVER
========================= */
function getMediaSource({ videoFile, embedUrl, image }) {
  const safeVideoFile = String(videoFile || "").trim();
  const safeImage = String(image || "").trim();
  const safeEmbedUrl = normalizeEmbedUrl(embedUrl);

  // priority: video > embed > image
  if (safeVideoFile) {
    return { type: "video", src: safeVideoFile };
  }

  if (safeEmbedUrl) {
    return { type: "embed", src: safeEmbedUrl };
  }

  if (safeImage) {
    return { type: "image", src: safeImage };
  }

  return { type: "empty", src: "" };
}

/* =========================
   MAIN COMPONENT
========================= */
function MediumVideoNews({ title, description, embedUrl, videoFile, image }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const media = getMediaSource({ videoFile, embedUrl, image });

  return (
    <article className="w-full bg-white" dir="rtl">
      <div className="mx-auto max-w-md px-4 sm:px-0 space-y-4">
        {/* ================= MEDIA ================= */}
        <div className="relative overflow-hidden rounded-2xl bg-black aspect-video group">
          {/* PREVIEW */}
          {!isPlaying && (
            <>
              {image ? (
                <img
                  src={image}
                  alt={title || "preview"}
                  loading="lazy"
                  className="
                    h-full w-full object-cover
                    transition duration-500
                    group-hover:scale-105
                  "
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-white text-sm">
                  بدون پیش‌نمایش
                </div>
              )}

              {/* PLAY BUTTON */}
              {media.type !== "image" && media.type !== "empty" && (
                <button
                  onClick={() => setIsPlaying(true)}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <span
                    className="
                    flex h-14 w-14 items-center justify-center
                    rounded-full bg-black/70 text-white
                    backdrop-blur
                    transition group-hover:scale-110
                  "
                  >
                    <Play size={22} fill="white" />
                  </span>
                </button>
              )}
            </>
          )}

          {/* VIDEO */}
          {media.type === "video" && isPlaying && (
            <video
              src={media.src}
              controls
              autoPlay
              playsInline
              className="h-full w-full object-cover"
            />
          )}

          {/* EMBED */}
          {media.type === "embed" && isPlaying && (
            <iframe
              src={media.src}
              title={title || "video"}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              className="h-full w-full border-0"
            />
          )}

          {/* EMPTY */}
          {media.type === "empty" && (
            <div className="flex h-full w-full items-center justify-center text-white text-sm">
              ویدیویی برای نمایش وجود ندارد
            </div>
          )}
        </div>

        {/* ================= CONTENT ================= */}
        {(title || description) && (
          <div className="space-y-2">
            {title && (
              <h2
                className="
                text-sm sm:text-base font-bold
                text-neutral-900 leading-snug
              "
              >
                {title}
              </h2>
            )}

            {description && (
              <p
                className="
                text-xs sm:text-sm
                text-neutral-600 leading-relaxed
              "
              >
                {description}
              </p>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

export default MediumVideoNews;
