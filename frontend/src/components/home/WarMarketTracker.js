import { ChevronLeft, Info } from "lucide-react";

function WarMarketTracker({
  title = "",
  updatedAt = "",
  compareLabel = "",
  note = "",
  items = [],
  className = "",
}) {
  const color = (trend) =>
    trend === "up"
      ? "text-emerald-600"
      : trend === "down"
      ? "text-rose-600"
      : "text-neutral-700";

  const mark = (trend) =>
    trend === "up" ? "▲" : trend === "down" ? "▼" : "";

  return (
    <section
      dir="rtl"
      className={`w-full border-b border-neutral-200 pb-4 ${className}`}
    >
      {title && (
        <h3 className="text-[13px] font-extrabold leading-5 text-neutral-900">
          {title}
        </h3>
      )}

      {updatedAt && (
        <p className="mt-1 text-[10px] text-neutral-500">
          به‌روزرسانی: {updatedAt}
        </p>
      )}

      <div className="mt-3">
        {compareLabel && (
          <div className="mb-2 flex items-center justify-between text-[10px] font-medium text-neutral-500">
            <span>{compareLabel}</span>
          </div>
        )}

        <div>
          {items.map((item, index) => (
            <div
              key={item.id ?? index}
              className="
                group flex items-center justify-between gap-3
                border-t border-neutral-200 py-2
                transition-colors duration-300 ease-out
                hover:bg-neutral-50
              "
            >
              {/* LEFT */}
              <div className="flex min-w-0 items-center gap-1.5">
                <span
                  className="
                    truncate text-[11px] font-semibold text-neutral-900
                    transition-colors duration-300 ease-out
                    group-hover:text-neutral-700
                  "
                >
                  {item.label}
                </span>

                {item.hasInfo && (
                  <Info className="h-3 w-3 shrink-0 text-neutral-400 transition-colors duration-300 group-hover:text-neutral-500" />
                )}

                {item.hasArrow && (
                  <ChevronLeft className="h-3 w-3 shrink-0 text-neutral-400 transition-transform duration-300 ease-out group-hover:-translate-x-0.5" />
                )}
              </div>

              {/* RIGHT */}
              <div
                className={`shrink-0 text-left text-[11px] font-extrabold transition-all duration-300 ease-out ${color(
                  item.trend
                )}`}
              >
                <span className="inline-flex items-center gap-1">
                  {mark(item.trend) && <span>{mark(item.trend)}</span>}
                  <span>{item.value}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {note && (
        <p className="mt-3 text-[10px] leading-4 text-neutral-500">
          {note}
        </p>
      )}
    </section>
  );
}

export default WarMarketTracker;