import { Link } from 'react-router-dom'
import { ChevronLeft } from "lucide-react";

export default function SectionHeader({
  title,
  href = "#",
  actionText = "مشاهده همه",
  tabs = [],
  activeTab,
}) {
  return (
    <div
      dir="rtl"
      className="flex items-center justify-between gap-4 border-b border-neutral-300 pb-3"
    >
      <div className="flex min-w-0 items-center gap-4">
        {title && (
          <h2 className="shrink-0 text-[18px] font-extrabold leading-none text-neutral-950">
            {title}
          </h2>
        )}

        {tabs.length > 0 && (
          <div className="hidden min-w-0 items-center gap-3 overflow-x-auto md:flex">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.value || activeTab === tab.label;

              return (
                <Link
                  key={tab.value || tab.label}
                  href={tab.href || "#"}
                  className={`whitespace-nowrap text-[12px] font-medium transition ${
                    isActive
                      ? "text-red-600"
                      : "text-neutral-500 hover:text-neutral-950"
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {href && (
        <Link
          href={href}
          className="inline-flex shrink-0 items-center gap-1 text-[12px] font-semibold text-neutral-600 transition hover:gap-2 hover:text-neutral-950"
        >
          <span>{actionText}</span>
          <ChevronLeft size={14} />
        </Link>
      )}
    </div>
  );
}
