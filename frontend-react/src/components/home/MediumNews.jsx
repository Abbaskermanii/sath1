import { Link } from "react-router-dom";
import { useState } from "react";
import { Play, Volume2 } from "lucide-react";

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

function normalizeEmbedUrl(url = "") {
  if (typeof url !== "string") return "";

  const raw = url.trim();
  if (!raw) return "";

  const iframeSrcMatch = raw.match(/src=["']([^"']+)["']/i);
  const extracted = iframeSrcMatch?.[1]?.trim() || raw;

  try {
    const parsed = new URL(extracted);

    if (
      parsed.hostname.includes("youtube.com") &&
      parsed.pathname === "/watch" &&
      parsed.searchParams.get("v")
    ) {
      const videoId = parsed.searchParams.get("v");
      return `https://www.youtube.com/embed/${videoId}?rel=0`;
    }

    if (parsed.hostname === "youtu.be") {
      const id = parsed.pathname.replace(/^\/+/, "");
      return id ? `https://www.youtube.com/embed/${id}?rel=0` : "";
    }

    if (
      parsed.hostname.includes("youtube.com") &&
      parsed.pathname.startsWith("/embed/")
    ) {
      return extracted;
    }

    if (parsed.hostname.includes("aparat.com")) {
      if (parsed.pathname.startsWith("/embed/")) {
        return extracted;
      }

      const aparatShortMatch = parsed.pathname.match(/^\/v\/([^/]+)/);
      if (aparatShortMatch?.[1]) {
        return `https://www.aparat.com/video/video/embed/videohash/${aparatShortMatch[1]}/vt/frame`;
      }

      const aparatEmbedMatch = parsed.pathname.match(
        /\/video\/video\/embed\/videohash\/([^/]+)\/vt\/frame/i,
      );
      if (aparatEmbedMatch?.[1]) {
        return extracted;
      }

      return extracted;
    }

    return extracted;
  } catch {
    return "";
  }
}

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
  const resolvedImage = cover || image || "";
  const resolvedVideo = videoFile || video_file || "";
  const resolvedEmbed = normalizeEmbedUrl(embedUrl || embed_url || "");
  const resolvedAudio =
    audioFile || audio_file || podcastFile || podcast_file || "";

  if (resolvedImage) {
    return { type: "image", src: resolvedImage };
  }

  if (resolvedVideo) {
    return { type: "video", src: resolvedVideo };
  }

  if (resolvedEmbed) {
    return { type: "embed", src: resolvedEmbed };
  }

  if (resolvedAudio) {
    return { type: "audio", src: resolvedAudio };
  }

  return { type: "none", src: "" };
}

function MediaView({
  title,
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
  duration = "",
}) {
  const [imageFailed, setImageFailed] = useState(false);

  const media = getMediaSource({
    image: imageFailed ? "" : image,
    cover: imageFailed ? "" : cover,
    videoFile,
    video_file,
    embedUrl,
    embed_url,
    audioFile,
    audio_file,
    podcastFile,
    podcast_file,
  });

  if (media.type === "none") return null;

  if (media.type === "image") {
    const hasPlayableFallback = Boolean(
      videoFile ||
      video_file ||
      embedUrl ||
      embed_url ||
      audioFile ||
      audio_file ||
      podcastFile ||
      podcast_file,
    );

    const isAudioLike = Boolean(
      audioFile || audio_file || podcastFile || podcast_file,
    );

    return (
      <div className="relative overflow-hidden rounded-lg bg-neutral-100">
        <img
          src={media.src}
          alt={title || "image"}
          loading="lazy"
          onError={() => setImageFailed(true)}
          className="h-auto w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {hasPlayableFallback && (
          <>
            <div className="absolute inset-0 bg-black/10" />
            <span className="absolute inset-0 flex items-center justify-center">
              <span
                className={`flex h-11 w-11 items-center justify-center rounded-full bg-white/90 shadow ${
                  isAudioLike ? "text-neutral-800" : "text-red-600"
                }`}
              >
                {isAudioLike ? (
                  <Volume2 size={18} />
                ) : (
                  <Play size={18} fill="currentColor" />
                )}
              </span>
            </span>

            {duration && !isAudioLike && (
              <span className="absolute bottom-2 right-2 rounded bg-black/85 px-2 py-0.5 text-[11px] font-bold text-white">
                {duration}
              </span>
            )}
          </>
        )}
      </div>
    );
  }

  if (media.type === "video") {
    return (
      <div className="overflow-hidden rounded-lg bg-black">
        <video
          className="h-auto w-full"
          controls
          preload="metadata"
          playsInline
        >
          <source src={media.src} />
          مرورگر شما از پخش ویدیو پشتیبانی نمی‌کند.
        </video>
      </div>
    );
  }

  if (media.type === "embed") {
    return (
      <div className="overflow-hidden rounded-lg bg-black">
        <div className="aspect-video w-full">
          <iframe
            src={media.src}
            title={title || "Embedded media"}
            className="h-full w-full border-0"
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </div>
    );
  }

  if (media.type === "audio") {
    return (
      <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
        <div className="mb-3 flex items-center gap-2 text-neutral-700">
          <Volume2 size={18} />
          <span className="text-sm font-medium">پادکست / فایل صوتی</span>
        </div>

        <audio className="w-full" controls preload="none">
          <source src={media.src} />
          مرورگر شما از پخش صوت پشتیبانی نمی‌کند.
        </audio>
      </div>
    );
  }

  return null;
}

function BottomPodcastThumb({ src, alt }) {
  if (!src) return null;

  return (
    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-neutral-100">
      <img
        src={src}
        alt={alt || "podcast cover"}
        loading="lazy"
        className="h-full w-full object-cover"
      />

      <span className="absolute inset-0 flex items-center justify-center bg-black/15">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-neutral-800 shadow">
          <Volume2 size={14} />
        </span>
      </span>
    </div>
  );
}

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
  bottomNewsImage,
  bottomNewsCover,
  bottomNewsMediaType,
  bottomNewsAudioFile,
  bottomNewsAudio_file,
  bottomNewsPodcastFile,
  bottomNewsPodcast_file,
  duration = "",
  videoFile,
  video_file,
  embedUrl,
  embed_url,
  audioFile,
  audio_file,
  podcastFile,
  podcast_file,
}) {
  const showBottomNews = Boolean(bottomNewsTitle || bottomNewsDescription);

  const bottomIsPodcast = Boolean(
    String(bottomNewsMediaType || "").toLowerCase() === "audio" ||
    String(bottomNewsMediaType || "").toLowerCase() === "podcast" ||
    String(bottomNewsMediaType || "").toLowerCase() === "voice" ||
    String(bottomNewsMediaType || "").toLowerCase() === "sound" ||
    bottomNewsAudioFile ||
    bottomNewsAudio_file ||
    bottomNewsPodcastFile ||
    bottomNewsPodcast_file,
  );

  const bottomThumb = bottomNewsCover || bottomNewsImage || "";

  return (
    <article className="bg-white px-6" dir="rtl">
      <div className="mx-auto max-w-2xl space-y-4">
        <Clickable href={href} fallback="div" className="group block space-y-4">
          <MediaView
            title={title}
            image={image}
            cover={cover}
            videoFile={videoFile}
            video_file={video_file}
            embedUrl={embedUrl}
            embed_url={embed_url}
            audioFile={audioFile}
            audio_file={audio_file}
            podcastFile={podcastFile}
            podcast_file={podcast_file}
            duration={duration}
          />

          <div className="space-y-3">
            {categoryText && (
              <div className="text-xs text-neutral-500">{categoryText}</div>
            )}

            {title && (
              <h2 className="text-right text-base font-semibold leading-snug text-neutral-900 transition-colors duration-200 group-hover:text-neutral-700">
                {title}
              </h2>
            )}

            {description && (
              <p className="text-right text-sm leading-relaxed text-neutral-600 transition-colors duration-200 group-hover:text-neutral-800">
                {description}
              </p>
            )}
          </div>
        </Clickable>

        {showBottomNews && (
          <Clickable
            href={bottomNewsHref}
            fallback="div"
            className="group block border-t border-neutral-200 pt-4"
          >
            <div className="flex items-start gap-3">
              {bottomIsPodcast && bottomThumb ? (
                <BottomPodcastThumb src={bottomThumb} alt={bottomNewsTitle} />
              ) : null}

              <div className="min-w-0 flex-1">
                {bottomNewsTitle && (
                  <h3 className="text-sm font-semibold leading-snug text-neutral-800 transition-colors duration-200 group-hover:text-neutral-700">
                    {bottomNewsTitle}
                  </h3>
                )}

                {bottomNewsDescription && (
                  <p className="mt-2 text-sm leading-6 text-neutral-600 transition-colors duration-200 group-hover:text-neutral-800">
                    {bottomNewsDescription}
                  </p>
                )}
              </div>
            </div>
          </Clickable>
        )}
      </div>
    </article>
  );
}

export default MediumNews;
