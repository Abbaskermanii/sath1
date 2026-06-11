import { normalizeEmbedUrl } from "../../lib/media.utils";

export default function MediaPreview({
  image,
  title,
  videoFile = "",
  embedUrl = "",
  className = "",
  poster = "",
}) {
  const normalizedEmbed = normalizeEmbedUrl(embedUrl);

  const hasVideoFile = Boolean(videoFile);
  const hasEmbed = Boolean(normalizedEmbed);
  const hasImage = Boolean(image);
  const previewPoster = poster || image || "";

  return (
    <div
      className={`
        relative overflow-hidden rounded-lg
        bg-neutral-100
        aspect-[16/9]
        ${className}
      `}
    >
      {/* VIDEO FILE */}
      {hasVideoFile && (
        <video
          src={videoFile}
          controls
          playsInline
          preload="metadata"
          poster={previewPoster || undefined}
          className="h-full w-full object-cover"
        />
      )}

      {/* EMBED */}
      {!hasVideoFile && hasEmbed && (
        <iframe
          src={normalizedEmbed}
          title={title || "video"}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          className="h-full w-full"
        />
      )}

      {/* IMAGE */}
      {!hasVideoFile && !hasEmbed && hasImage && (
        <img
          src={image}
          alt={title || "image"}
          loading="lazy"
          className="
            h-full w-full object-cover
            transition-transform duration-500
            hover:scale-105
          "
        />
      )}

      {/* EMPTY STATE */}
      {!hasVideoFile && !hasEmbed && !hasImage && (
        <div className="flex h-full w-full items-center justify-center text-sm text-neutral-500">
          منبعی برای نمایش وجود ندارد
        </div>
      )}

      {/* VIDEO OVERLAY (برای UX بهتر) */}
      {(hasVideoFile || hasEmbed) && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="rounded-full bg-black/60 p-3 text-white text-sm backdrop-blur">
            ▶
          </div>
        </div>
      )}
    </div>
  );
}
