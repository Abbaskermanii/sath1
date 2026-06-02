import Link from "next/link";
import SectionHeader from "@/components/layout/SectionHeader";

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
          <Link
            key={item.id || index}
            href={item.href || "#"}
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
          </Link>
        ))}
      </div>

      <Link
        href={href}
        className="mt-2 inline-flex text-[12px] font-semibold text-neutral-600 transition hover:text-neutral-950"
      >
        بیشتر
      </Link>
    </section>
  );
}
