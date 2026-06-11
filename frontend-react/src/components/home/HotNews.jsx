import { Link } from "react-router-dom";
import { Play } from "lucide-react";

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

function getItemKey(item, index) {
  return item?.id || item?.slug || item?.href || item?.label || index;
}

function isAudioLikeItem(item = {}) {
  const mediaType = String(
    item?.mediaType || item?.media_type || item?.post_type || "",
  ).toLowerCase();

  return (
    mediaType === "audio" ||
    mediaType === "podcast" ||
    mediaType === "voice" ||
    Boolean(item?.audioFile) ||
    Boolean(item?.audio_file) ||
    Boolean(item?.podcastFile) ||
    Boolean(item?.podcast_file)
  );
}

function isVideoItem(item = {}) {
  if (isAudioLikeItem(item)) return false;

  const mediaType = String(
    item?.mediaType || item?.media_type || item?.post_type || "",
  ).toLowerCase();

  return (
    item?.isVideo === true ||
    mediaType === "video" ||
    Boolean(item?.videoFile) ||
    Boolean(item?.video_file) ||
    Boolean(item?.embedUrl) ||
    Boolean(item?.embed_url)
  );
}

function HotNewsItem({ item, className }) {
  const safeHref = getSafeHref(item?.href);
  const showVideoIndicator = isVideoItem(item);

  const content = (
    <>
      <span className="whitespace-nowrap">{item?.label}</span>

      {showVideoIndicator && (
        <span
          className="mr-1 inline-flex items-center text-red-500 group-hover:text-white"
          aria-label="خبر ویدیویی"
          title="خبر ویدیویی"
        >
          <Play size={14} fill="currentColor" />
        </span>
      )}
    </>
  );

  if (hasValidHref(safeHref)) {
    if (isExternalHref(safeHref)) {
      return (
        <a
          href={safeHref}
          target="_blank"
          rel="noopener noreferrer"
          className={className}
        >
          {content}
        </a>
      );
    }

    return (
      <Link to={safeHref} className={className}>
        {content}
      </Link>
    );
  }

  return <span className={className}>{content}</span>;
}

export default function HotNews({ items = [] }) {
  const baseClassName = `
    group flex-shrink-0 inline-flex items-center gap-1
    rounded-full
    border border-neutral-300
    bg-white
    px-3 py-1.5
    text-xs sm:text-sm
    text-neutral-800
    transition-all duration-200
    hover:border-neutral-800
    hover:bg-neutral-900
    hover:text-white
    active:scale-95
    whitespace-nowrap
  `;

  return (
    <div dir="rtl" className="w-full">
      {/* موبایل: اسکرول افقی */}
      <div
        className="
          flex gap-2 overflow-x-auto pb-2
          scrollbar-hide
          sm:flex-wrap sm:overflow-visible
        "
      >
        {items.map((item, index) => (
          <HotNewsItem
            key={getItemKey(item, index)}
            item={item}
            className={baseClassName}
          />
        ))}
      </div>
    </div>
  );
}
