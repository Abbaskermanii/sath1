import { Link } from "react-router-dom";

/* ========================= HELPERS ========================= */
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

/* ========================= CLICKABLE ========================= */
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

/* ========================= MAIN ========================= */
function RelatedNews({ news = [] }) {
  const safeNews = Array.isArray(news) ? news.filter(Boolean) : [];

  if (!safeNews.length) return null;

  return (
    <section
      className="mt-6 border-t border-neutral-300 py-6 sm:py-8"
      dir="rtl"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
      

        {/* GRID */}
        <div
          className="
            grid gap-4
            grid-cols-1
            sm:grid-cols-2
            lg:grid-cols-3
          "
        >
          {safeNews.map((item, index) => {
            const title = typeof item === "string" ? item : item?.title || "";
            const href = typeof item === "string" ? "#" : item?.href || "#";

            return (
              <Clickable
                key={item?.id || index}
                href={href}
                fallback="div"
                className="
                  group block rounded-lg border border-neutral-200
                  bg-white p-4
                  transition-all duration-300
                  hover:border-neutral-900
                  hover:bg-neutral-50
                  hover:shadow-sm
                  active:scale-[0.98]
                "
              >
                <h3
                  className="
                    text-right text-[14px] sm:text-[15px]
                    font-semibold leading-relaxed
                    text-neutral-900
                    transition-colors duration-200
                    group-hover:text-neutral-700
                  "
                >
                  {title}
                </h3>
              </Clickable>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default RelatedNews;
