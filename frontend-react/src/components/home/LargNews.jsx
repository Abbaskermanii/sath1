import { Link } from "react-router-dom";
import MediaPreview from "./MediaPreview";
import {
  getSafeHref,
  hasValidHref,
  isExternalHref,
} from "../../lib/media.utils";

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

function LargNews({
  title,
  description,
  image,
  categoryText,
  bottomNewsTitle,
  bottomNewsDescription,
  href = "",
  bottomNewsHref = "",
  videoFile = "",
  embedUrl = "",
  poster = "",
}) {
  const showBottomNews = bottomNewsTitle || bottomNewsDescription;
  const showCategoryBox = categoryText;
  const hasBox = showCategoryBox || showBottomNews;
  const hasMedia = image || videoFile || embedUrl;

  return (
    <article className="bg-white py-6 sm:py-8" dir="rtl">
      <div className="mx-auto max-w-6xl px-4">
        <div
          className="
            flex flex-col gap-6
            md:flex-row md:items-stretch
          "
        >
          {/* MEDIA */}
          {hasMedia && (
            <Clickable
              href={href}
              fallback="div"
              className="
                group relative overflow-hidden rounded-xl
                aspect-[16/10]
                w-full
                md:w-[380px] md:shrink-0
              "
            >
              <MediaPreview
                image={image}
                title={title}
                videoFile={videoFile}
                embedUrl={embedUrl}
                poster={poster}
                className="
                  h-full w-full object-cover
                  transition-transform duration-500
                  group-hover:scale-105
                "
              />

              {/* overlay برای حرفه‌ای‌تر شدن */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 transition group-hover:opacity-100" />
            </Clickable>
          )}

          {/* CONTENT */}
          <div className="flex flex-1 flex-col justify-between gap-5">
            <Clickable
              href={href}
              fallback="div"
              className="group block space-y-3"
            >
              {title && (
                <h2
                  className="
                    text-lg font-bold leading-snug text-neutral-900
                    sm:text-xl md:text-2xl
                    transition-colors duration-200
                    group-hover:text-neutral-700
                  "
                >
                  {title}
                </h2>
              )}

              {description && (
                <p
                  className="
                    text-sm leading-relaxed text-neutral-600
                    sm:text-base
                    line-clamp-3
                    transition-colors duration-200
                    group-hover:text-neutral-800
                  "
                >
                  {description}
                </p>
              )}
            </Clickable>

            {/* BOX */}
            {hasBox && (
              <div
                className="
                  rounded-xl border border-neutral-200
                  p-4 sm:p-5
                  bg-neutral-50
                "
              >
                {showCategoryBox && (
                  <div className={showBottomNews ? "mb-4" : ""}>
                    <span className="text-xs sm:text-sm text-neutral-500">
                      {categoryText}
                    </span>
                  </div>
                )}

                {showBottomNews && (
                  <Clickable
                    href={bottomNewsHref}
                    fallback="div"
                    className={`
                      group block
                      ${showCategoryBox ? "border-t pt-4" : ""}
                    `}
                  >
                    {bottomNewsTitle && (
                      <h3
                        className="
                          text-sm font-bold text-neutral-900
                          sm:text-base
                          transition-colors duration-200
                          group-hover:text-neutral-700
                        "
                      >
                        {bottomNewsTitle}
                      </h3>
                    )}

                    {bottomNewsDescription && (
                      <p
                        className="
                          mt-2 text-xs text-neutral-600
                          sm:text-sm
                          transition-colors duration-200
                          group-hover:text-neutral-800
                        "
                      >
                        {bottomNewsDescription}
                      </p>
                    )}
                  </Clickable>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export default LargNews;
