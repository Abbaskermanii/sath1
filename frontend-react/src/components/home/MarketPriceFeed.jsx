import { useMemo, useState, useEffect } from "react";

const FILTER_OPTIONS = [
  { value: "all", label: "همه بازارها" },
  { value: "crypto", label: "کریپتو" },
  { value: "forex", label: "فارکس" },
  { value: "commodity", label: "کالا" },
  { value: "index", label: "شاخص‌ها" },
];

const MAX_VISIBLE_ITEMS = 5;

export default function MarketPriceFeed({
  title,
  filterLabel = "همه بازارها",
  items = [],
  loading = false,
}) {
  const initialFilter =
    FILTER_OPTIONS.find((item) => item.label === filterLabel)?.value || "all";

  const [selectedFilter, setSelectedFilter] = useState(initialFilter);

  useEffect(() => {
    const nextFilter =
      FILTER_OPTIONS.find((item) => item.label === filterLabel)?.value || "all";
    setSelectedFilter(nextFilter);
  }, [filterLabel]);

  const visibleItems = useMemo(() => {
    const normalizedItems = Array.isArray(items) ? items : [];

    const filtered =
      selectedFilter === "all"
        ? normalizedItems
        : normalizedItems.filter((item) => item.type === selectedFilter);

    return filtered.slice(0, MAX_VISIBLE_ITEMS);
  }, [items, selectedFilter]);

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
    <section dir="rtl" className="w-full max-w-125">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-[20px] font-extrabold leading-none text-red-600">
          {title}
        </h2>

        <div className="relative w-42.5 shrink-0">
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="w-full appearance-none rounded-full border border-neutral-400 bg-white px-4 py-2 pr-4 pl-9 text-[13px] text-neutral-800 outline-none"
          >
            {FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-700">
            ⌄
          </span>
        </div>
      </div>

      <div className="divide-y divide-neutral-200">
        {loading ? (
          Array.from({ length: MAX_VISIBLE_ITEMS }).map((_, index) => (
            <div
              key={index}
              className="grid grid-cols-[88px_1fr] items-start gap-3 py-3 animate-pulse"
            >
              <div className="h-4 w-18 rounded bg-neutral-200" />
              <div>
                <div className="h-4 w-28 rounded bg-neutral-200" />
                <div className="mt-2 h-3 w-20 rounded bg-neutral-100" />
              </div>
            </div>
          ))
        ) : visibleItems.length > 0 ? (
          visibleItems.map((item, index) => (
            <article
              key={item.id ?? item.symbol ?? `${item.title}-${index}`}
              className="group grid grid-cols-[88px_1fr] items-start gap-3 py-3 transition-all duration-200 hover:bg-neutral-50"
            >
              <div
                className={`text-right text-[13px] font-bold leading-5 transition-colors duration-200 ${
                  item.active
                    ? "text-red-600 group-hover:text-red-700"
                    : "text-neutral-400 group-hover:text-neutral-600"
                }`}
              >
                {getDisplayValue(item)}
              </div>

              <div className="text-right">
                <h3 className="text-[14px] font-extrabold leading-[1.45] text-neutral-900 transition-colors duration-200 group-hover:text-neutral-700">
                  {getDisplayTitle(item)}
                </h3>

                {item.subtitle && (
                  <p className="mt-1 text-[11px] leading-4 text-neutral-500 transition-colors duration-200 group-hover:text-neutral-700">
                    {item.subtitle}
                  </p>
                )}
              </div>
            </article>
          ))
        ) : (
          <div className="py-6 text-center text-sm text-neutral-500">
            موردی برای این فیلتر وجود ندارد.
          </div>
        )}
      </div>
    </section>
  );
}
