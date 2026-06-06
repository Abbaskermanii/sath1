import { Link } from "react-router-dom";

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

function MediumNews({
  title,
  description,
  image,
  categoryText,
  href = "",
  bottomNewsTitle,
  bottomNewsDescription,
  bottomNewsHref = "",
}) {
  const showBottomNews = bottomNewsTitle || bottomNewsDescription;

  return (
    <article className="bg-white px-6" dir="rtl">
      <div className="mx-auto max-w-2xl space-y-4">
        <Clickable href={href} fallback="div" className="group block space-y-4">
          {image && (
            <div className="overflow-hidden rounded-lg">
              <img
                src={image}
                alt={title || "image"}
                className="h-auto w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          )}

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
          </Clickable>
        )}
      </div>
    </article>
  );
}

export default MediumNews;
