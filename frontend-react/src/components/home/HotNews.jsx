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

export default function HotNews({ items = [] }) {
  const baseClassName = `
    inline-flex items-center rounded-md
    border border-neutral-300
    bg-white px-4 py-2 text-sm text-neutral-800
    transition-all duration-200
    hover:border-neutral-800
    hover:bg-neutral-900
    hover:text-white
    hover:shadow-md
    active:scale-95
  `;

  return (
    <div dir="rtl" className="flex flex-wrap gap-2">
      {items.map((item, index) => {
        const safeHref = getSafeHref(item?.href);

        if (hasValidHref(safeHref)) {
          if (isExternalHref(safeHref)) {
            return (
              <a
                key={getItemKey(item, index)}
                href={safeHref}
                target="_blank"
                rel="noopener noreferrer"
                className={baseClassName}
              >
                {item?.label}
              </a>
            );
          }

          return (
            <Link
              key={getItemKey(item, index)}
              to={safeHref}
              className={baseClassName}
            >
              {item?.label}
            </Link>
          );
        }

        return (
          <span key={getItemKey(item, index)} className={baseClassName}>
            {item?.label}
          </span>
        );
      })}
    </div>
  );
}
