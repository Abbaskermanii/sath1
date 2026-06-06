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

export default function InFocusTopics({ title = "در کانون توجه", items = [] }) {
  if (!Array.isArray(items) || !items.length) return null;

  const linkClassName = `
    inline-flex items-center rounded-full border border-neutral-300
    bg-white px-3 py-1.5 text-[12px] font-semibold text-neutral-800
    transition hover:border-neutral-950 hover:bg-neutral-950 hover:text-white
    active:scale-95
  `;

  const staticClassName = `
    inline-flex items-center rounded-full border border-neutral-300
    bg-white px-3 py-1.5 text-[12px] font-semibold text-neutral-800
  `;

  return (
    <section dir="rtl" className="w-full">
      <h3 className="mb-3 text-[13px] font-extrabold text-neutral-950">
        {title}
      </h3>

      <div className="flex flex-wrap gap-2">
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
                  className={linkClassName}
                >
                  {item?.label}
                </a>
              );
            }

            return (
              <Link
                key={getItemKey(item, index)}
                to={safeHref}
                className={linkClassName}
              >
                {item?.label}
              </Link>
            );
          }

          return (
            <span key={getItemKey(item, index)} className={staticClassName}>
              {item?.label}
            </span>
          );
        })}
      </div>
    </section>
  );
}
