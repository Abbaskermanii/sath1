import { useMemo } from "react";

const MAX_VISIBLE_ITEMS = 5;

export default function MarketPriceFeed({
  title,
  items = [],
  loading = false,
  priceUnit = "ریال",
}) {
  const visibleItems = useMemo(() => {
    const normalizedItems = Array.isArray(items) ? items : [];
    return normalizedItems.slice(0, MAX_VISIBLE_ITEMS);
  }, [items]);

  const getDisplayValue = (item) => {
    if (item?.display_value) return item.display_value;
    if (item?.value) return item.value;
    return "-";
  };

  const getDisplayTitle = (item) => {
    if (!item?.title) return "-";

    const priceText = String(item.display_value || item.value || "").trim();
    const cleanTitle = String(item.title).replace(priceText, "").trim();

    return cleanTitle || item.title;
  };

  return (
    <section dir="rtl" className="w-full max-w-md">
      {/* HEADER */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg sm:text-xl font-extrabold text-red-600">
          {title}
        </h2>

        <span className="text-[11px] sm:text-xs text-neutral-500">
          {priceUnit}
        </span>
      </div>

      {/* LIST */}
      <div className="divide-y divide-neutral-200 rounded-xl border border-neutral-200 bg-white">
        {loading ? (
          Array.from({ length: MAX_VISIBLE_ITEMS }).map((_, index) => (
            <div
              key={index}
              className="
                flex items-center justify-between
                gap-3 py-3 px-3 animate-pulse
              "
            >
              <div className="h-4 w-20 rounded bg-neutral-200" />
              <div className="flex-1">
                <div className="h-4 w-32 rounded bg-neutral-200" />
                <div className="mt-2 h-3 w-20 rounded bg-neutral-100" />
              </div>
            </div>
          ))
        ) : visibleItems.length > 0 ? (
          visibleItems.map((item, index) => (
            <article
              key={item.id ?? item.symbol ?? `${item.title}-${index}`}
              className="
                group flex items-center justify-between
                gap-3 py-3 px-3
                transition-all duration-200
                hover:bg-neutral-50
                active:scale-[0.99]
              "
            >
              {/* TITLE */}
              <div className="min-w-0 text-right flex-1">
                <h3
                  className="
                    text-sm font-bold text-neutral-900
                    line-clamp-1
                    transition group-hover:text-neutral-700
                  "
                >
                  {getDisplayTitle(item)}
                </h3>

                {item.subtitle && (
                  <p className="mt-1 text-[11px] text-neutral-500 line-clamp-1">
                    {item.subtitle}
                  </p>
                )}
              </div>

              {/* PRICE */}
              <div className="text-left shrink-0">
                <div
                  className={`
                    text-sm font-extrabold
                    ${item.active ? "text-red-600" : "text-neutral-500"}
                  `}
                >
                  {getDisplayValue(item)}
                </div>

                {/* حالت live indicator */}
                {item.active && (
                  <div className="mt-1 flex items-center justify-end gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[10px] text-red-500">زنده</span>
                  </div>
                )}
              </div>
            </article>
          ))
        ) : (
          <div className="py-6 text-center text-sm text-neutral-500">
            موردی برای نمایش وجود ندارد.
          </div>
        )}
      </div>
    </section>
  );
}
