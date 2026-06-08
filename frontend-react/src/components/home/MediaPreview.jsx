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

  if (hasVideoFile) {
    return (
      <video
        src={videoFile}
        controls
        playsInline
        preload="metadata"
        poster={previewPoster || undefined}
        className={className}
      />
    );
  }

  if (hasEmbed) {
    return (
      <iframe
        src={normalizedEmbed}
        title={title || "video"}
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
        className={className}
      />
    );
  }

  if (hasImage) {
    return <img src={image} alt={title || "image"} className={className} />;
  }

  return (
    <div
      className={`flex items-center justify-center bg-neutral-100 text-sm text-neutral-500 ${className}`}
    >
      منبعی برای نمایش وجود ندارد
    </div>
  );
}
