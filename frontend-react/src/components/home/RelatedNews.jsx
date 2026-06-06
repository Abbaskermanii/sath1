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

function RelatedNews({ news = [] }) {
  const safeNews = Array.isArray(news) ? news.filter(Boolean) : [];

  if (!safeNews.length) return null;

  return (
    <div className="mt-5 border-t border-neutral-300 py-8" dir="rtl">
      <div className="mx-auto max-w-5xl px-6">
        <div className="grid grid-cols-3">
          {safeNews.map((item, index) => {
            const title = typeof item === "string" ? item : item?.title || "";
            const href = typeof item === "string" ? "#" : item?.href || "#";

            return (
              <div
                key={item?.id || index}
                className="group border-l border-neutral-300 px-4 last:border-0"
              >
                {title && (
                  <Clickable href={href} fallback="div" className="block">
                    <h3
                      className="
                        cursor-pointer text-right text-[15px] font-medium leading-tight
                        transition-all duration-300 ease-out
                        group-hover:text-blue-600
                      "
                    >
                      {title}
                    </h3>
                  </Clickable>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default RelatedNews;
