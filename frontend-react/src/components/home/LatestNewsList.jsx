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
      <SectionHeader title={title} href={href} />

      <div className="divide-y divide-neutral-200">
        {safeItems.map((item, index) => (
          <Clickable
            key={item.id || index}
            href={item.href || "#"}
            fallback="div"
            className="group grid grid-cols-[32px_1fr] gap-3 py-3"
          >
            {showNumbers ? (
              <div className="text-left text-[13px] font-extrabold text-neutral-400 transition group-hover:text-red-600">
                {index + 1}
              </div>
            ) : (
              <div />
            )}

            <div className="min-w-0 text-right">
              {item.category && (
                <div className="mb-1 text-[10px] font-bold uppercase tracking-wide text-red-600">
                  {item.category}
                </div>
              )}

              <h3 className="line-clamp-2 text-[13px] font-bold leading-5 text-neutral-950 transition group-hover:text-neutral-700">
                {item.title}
              </h3>

              {item.time && (
                <p className="mt-1 text-[10px] text-neutral-500">{item.time}</p>
              )}
            </div>
          </Clickable>
        ))}
      </div>

      <Clickable
        href={href}
        fallback="div"
        className="mt-2 inline-flex text-[12px] font-semibold text-neutral-600 transition hover:text-neutral-950"
      >
        بیشتر
      </Clickable>
    </section>
  );
}
