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

function getItemKey(item, index) {
  return item?.id || item?.slug || item?.href || item?.label || index;
}

function normalizeTopicItem(item = {}) {
  return {
    id: item?.id,
    slug: item?.slug,
    href: getSafeHref(item?.href),
    label: item?.label || item?.title || "بدون عنوان",
  };
}

export default function InFocusTopics({ title = "در کانون توجه", items = [] }) {
  if (!Array.isArray(items) || !items.length) return null;

  const normalizedItems = items.map(normalizeTopicItem);

  const baseClass = `
    group flex-shrink-0 inline-flex items-center
    rounded-full border border-neutral-300
    bg-white
    px-3 py-1.5
    text-xs sm:text-sm font-semibold
    text-neutral-800
    transition-all duration-200
    whitespace-nowrap
  `;

  const interactiveClass = `
    ${baseClass}
    hover:border-neutral-900
    hover:bg-neutral-900
    hover:text-white
    active:scale-95
  `;

  const staticClass = `${baseClass} opacity-70`;

  return (
    <section dir="rtl" className="w-full">
      {/* HEADER */}
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm sm:text-base font-extrabold text-neutral-900">
          {title}
        </h3>

        <span className="text-xs text-neutral-400">
          {normalizedItems.length} موضوع
        </span>
      </div>

      {/* MOBILE: scroll | DESKTOP: wrap */}
      <div
        className="
          flex gap-2 overflow-x-auto pb-2
          scrollbar-hide
          sm:flex-wrap sm:overflow-visible
        "
      >
        {normalizedItems.map((item, index) => {
          if (hasValidHref(item.href)) {
            if (isExternalHref(item.href)) {
              return (
                <a
                  key={getItemKey(item, index)}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={interactiveClass}
                >
                  {item.label}
                </a>
              );
            }

            return (
              <Link
                key={getItemKey(item, index)}
                to={item.href}
                className={interactiveClass}
              >
                {item.label}
              </Link>
            );
          }

          return (
            <span key={getItemKey(item, index)} className={staticClass}>
              {item.label}
            </span>
          );
        })}
      </div>
    </section>
  );
}