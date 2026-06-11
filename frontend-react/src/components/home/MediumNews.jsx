import { Link } from "react-router-dom";
import { useState } from "react";
import { Play, Volume2 } from "lucide-react";

/* ========================= LINK ========================= */
function getSafeHref(href) {
  return typeof href === "string" ? href.trim() : "";
}

function isExternalHref(href) {
  return /^https?:\/\//i.test(getSafeHref(href));
}

function hasValidHref(href) {
  const value = getSafeHref(href);
  return value.length > 0 && value !== "#";
}

function Clickable({ href, className = "", children, fallback = "div" }) {
  const safeHref = getSafeHref(href);

  if (!hasValidHref(safeHref)) {
    const Tag = fallback;
    return <Tag className={className}>{children}</Tag>;
  }

  if (isExternalHref(safeHref)) {
    return (
      <a
        href={safeHref}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {children}
      </a>
    );
  }

  return (
    <Link to={safeHref} className={className}>
      {children}
    </Link>
  );
}

/* ========================= EMBED ========================= */
function normalizeEmbedUrl(url = "") {
  try {
    const raw = String(url || "").trim();
    if (!raw) return "";

    const match = raw.match(/src=["']([^"']+)["']/i);
    const extracted = match?.[1] || raw;

    const u = new URL(extracted);

    if (u.hostname.includes("youtube.com") && u.pathname === "/watch") {
      const id = u.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}?rel=0` : "";
    }

    if (u.hostname === "youtu.be") {
      return `https://www.youtube.com/embed/${u.pathname.slice(1)}?rel=0`;
    }

    if (u.pathname.startsWith("/embed/")) return extracted;

    if (u.hostname.includes("aparat.com")) {
      const m = u.pathname.match(/\/v\/([^/]+)/);
      if (m) {
        return `https://www.aparat.com/video/video/embed/videohash/${m[1]}/vt/frame`;
      }
    }

    return extracted;
  } catch {
    return "";
  }
}

/* ========================= MEDIA RESOLVER ========================= */
function getMediaSource({
  image,
  cover,
  videoFile,
  video_file,
  embedUrl,
  embed_url,
  audioFile,
  audio_file,
  podcastFile,
  podcast_file,
}) {
  const img = cover || image || "";
  const video = videoFile || video_file || "";
  const embed = normalizeEmbedUrl(embedUrl || embed_url || "");
  const audio = audioFile || audio_file || podcastFile || podcast_file || "";

  // ✅ FIXED priority
  if (video) return { type: "video", src: video };
  if (embed) return { type: "embed", src: embed };
  if (audio) return { type: "audio", src: audio };
  if (img) return { type: "image", src: img };

  return { type: "none" };
}

/* ========================= MEDIA VIEW ========================= */
function MediaView(props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [imgFail, setImgFail] = useState(false);

  const media = getMediaSource({
    ...props,
    image: imgFail ? "" : props.image,
    cover: imgFail ? "" : props.cover,
  });

  if (media.type === "none") return null;

  const preview = props.cover || props.image;

  return (
    <div className="relative overflow-hidden rounded-xl bg-black aspect-video group">
      {/* PREVIEW */}
      {!isPlaying && preview && (
        <>
          <img
            src={preview}
            onError={() => setImgFail(true)}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />

          {media.type !== "image" && (
            <button
              onClick={() => setIsPlaying(true)}
              className="absolute inset-0 flex items-center justify-center"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur">
                {media.type === "audio" ? <Volume2 /> : <Play fill="white" />}
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
          className="h-full w-full object-cover"
        />
      )}

      {/* EMBED */}
      {media.type === "embed" && isPlaying && (
        <iframe src={media.src} className="h-full w-full" allowFullScreen />
      )}

      {/* AUDIO */}
      {media.type === "audio" && (
        <div className="flex h-full w-full flex-col justify-center p-4">
          <audio controls className="w-full">
            <source src={media.src} />
          </audio>
        </div>
      )}
    </div>
  );
}

/* ========================= MAIN ========================= */
function MediumNews({
  title,
  description,
  image,
  cover,
  categoryText,
  href = "",
  bottomNewsTitle,
  bottomNewsDescription,
  bottomNewsHref = "",
}) {
  return (
    <article className="bg-white px-4 sm:px-6" dir="rtl">
      <div className="mx-auto max-w-2xl space-y-4">
        <Clickable href={href} className="group block space-y-4">
          <MediaView title={title} image={image} cover={cover} />

          <div className="space-y-2">
            {categoryText && (
              <span className="text-xs text-neutral-500">{categoryText}</span>
            )}

            <h2 className="text-base sm:text-lg font-bold text-neutral-900 group-hover:text-neutral-700">
              {title}
            </h2>

            {description && (
              <p className="text-sm text-neutral-600 line-clamp-2">
                {description}
              </p>
            )}
          </div>
        </Clickable>

        {bottomNewsTitle && (
          <Clickable
            href={bottomNewsHref}
            className="group block border-t pt-4"
          >
            <h3 className="text-sm font-semibold text-neutral-800 group-hover:text-neutral-700">
              {bottomNewsTitle}
            </h3>

            {bottomNewsDescription && (
              <p className="mt-2 text-sm text-neutral-600">
                {bottomNewsDescription}
              </p>
            )}
          </Clickable>
        )}
      </div>
    </article>
  );
}

export default MediumNews;
