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

function LargNews({
  title,
  description,
  image,
  categoryText,
  bottomNewsTitle,
  bottomNewsDescription,
  href = "",
  bottomNewsHref = "",
}) {
  const showBottomNews = bottomNewsTitle || bottomNewsDescription;
  const showCategoryBox = categoryText;
  const hasBox = showCategoryBox || showBottomNews;

  return (
    <article className="bg-white p-8" dir="rtl">
      <div className="mx-auto flex max-w-5xl items-stretch gap-6">
        {image && (
          <Clickable
            href={href}
            fallback="div"
            className="group aspect-16/10 w-90 shrink-0 overflow-hidden rounded-lg"
          >
            <img
              src={image}
              alt={title || "image"}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </Clickable>
        )}

        <div className="flex min-w-0 flex-1 flex-col gap-5">
          <Clickable
            href={href}
            fallback="div"
            className="group block space-y-4"
          >
            {title && (
              <h2 className="text-right text-2xl font-bold leading-tight text-neutral-900 transition-colors duration-200 group-hover:text-neutral-700">
                {title}
              </h2>
            )}

            {description && (
              <p className="text-right text-base font-medium leading-relaxed text-neutral-600 transition-colors duration-200 group-hover:text-neutral-800">
                {description}
              </p>
            )}
          </Clickable>

          {hasBox && (
            <div className="mt-2 rounded-xl border border-neutral-300 p-4">
              {showCategoryBox && (
                <div className={showBottomNews ? "mb-4" : ""}>
                  <div className="text-sm text-neutral-500">{categoryText}</div>
                </div>
              )}

              {showBottomNews && (
                <Clickable
                  href={bottomNewsHref}
                  fallback="div"
                  className={
                    showCategoryBox
                      ? "group block border-t border-neutral-200 pt-4"
                      : "group block"
                  }
                >
                  {bottomNewsTitle && (
                    <h3 className="text-sm font-bold leading-6 text-neutral-900 transition-colors duration-200 group-hover:text-neutral-700">
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
          )}
        </div>
      </div>
    </article>
  );
}

export default LargNews;