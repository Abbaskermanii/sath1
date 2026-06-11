import { Link } from "react-router-dom";
import SectionHeader from "../layout/SectionHeader";

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

export default function LatestNewsList({
  title = "آخرین خبرها",
  items = [],
  href = "#",
  showNumbers = true,
  maxItems = 7,
}) {
  const safeItems = Array.isArray(items) ? items.slice(0, maxItems) : [];

  if (!safeItems.length) return null;

  return (
    <section dir="rtl" className="w-full bg-white">
      <div className="px-4 sm:px-6">
        <SectionHeader title={title} href={href} />

        <div className="divide-y divide-neutral-200">
          {safeItems.map((item, index) => (
            <Clickable
              key={item.id || index}
              href={item.href || "#"}
              fallback="div"
              className="
                group grid grid-cols-[36px_1fr] gap-3
                py-3 sm:py-4
                transition-all duration-200
                hover:bg-neutral-50
                active:scale-[0.99]
                rounded-lg px-2 -mx-2
              "
            >
              {/* NUMBER */}
              {showNumbers ? (
                <div
                  className="
                    flex items-start justify-center
                    text-sm font-extrabold
                    text-neutral-300
                    transition-all duration-200
                    group-hover:text-red-600
                  "
                >
                  {index + 1}
                </div>
              ) : (
                <div />
              )}

              {/* CONTENT */}
              <div className="min-w-0">
                {item.category && (
                  <div
                    className="
                      mb-1 text-[10px] font-bold
                      uppercase tracking-wide
                      text-red-600
                    "
                  >
                    {item.category}
                  </div>
                )}

                <h3
                  className="
                    line-clamp-2
                    text-sm sm:text-[15px]
                    font-bold leading-5
                    text-neutral-900
                    transition-colors duration-200
                    group-hover:text-neutral-700
                  "
                >
                  {item.title}
                </h3>

                {item.time && (
                  <p className="mt-1 text-[11px] text-neutral-500">
                    {item.time}
                  </p>
                )}
              </div>
            </Clickable>
          ))}
        </div>
      </div>
    </section>
  );
}
