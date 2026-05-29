import { ChevronLeft } from "lucide-react";

export default function MarketPriceFeed({ title, filterLabel, items }) {
  return (
    <section
      dir="rtl"
      className="w-full max-w-125 border-y border-neutral-300 bg-white px-4 py-4"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-[20px] font-extrabold leading-none text-red-600">
          {title}
        </h2>

        <div className="relative w-42.5 shrink-0">
          <select className="w-full appearance-none rounded-full border border-neutral-400 bg-white px-4 py-2 pr-4 pl-9 text-[13px] text-neutral-800 outline-none">
            <option>{filterLabel}</option>
            <option>کریپتو</option>
            <option>فارکس</option>
            <option>کالا</option>
            <option>شاخص‌ها</option>
          </select>

          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-700">
            ⌄
          </span>
        </div>
      </div>

      <div className="divide-y divide-neutral-200">
        {items.map((item) => (
          <article
            key={item.id}
            className="grid grid-cols-[64px_1fr] items-start gap-3 py-3"
          >
            <div
              className={`text-right text-[13px] font-bold leading-5 ${
                item.active ? "text-red-600" : "text-neutral-400"
              }`}
            >
              {item.value}
            </div>

            <div className="text-right">
              <h3 className="text-[14px] font-extrabold leading-[1.45] text-neutral-900">
                {item.title}
              </h3>

              {item.subtitle && (
                <p className="mt-1 text-[11px] leading-4 text-neutral-500">
                  {item.subtitle}
                </p>
              )}
            </div>
          </article>
        ))}
      </div>

      <div className="mt-3 flex justify-start">
        <a
          href="#"
          className="inline-flex items-center gap-1 text-[13px] text-neutral-600 transition hover:text-neutral-900"
        >
          <span>مشاهده همه</span>
          <ChevronLeft size={14} strokeWidth={2} />
        </a>
      </div>
    </section>
  );
}
