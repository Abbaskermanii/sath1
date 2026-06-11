import { Link } from "react-router-dom";
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
      className="flex flex-col gap-4 border-b border-neutral-300 pb-3 md:flex-row md:items-center md:justify-between"
    >
      <div className="flex min-w-0 items-center gap-4">
        {/* عنوان بخش */}
        {title && (
          <h2 className="shrink-0 text-[16px] md:text-[18px] font-extrabold leading-none text-neutral-950 relative">
            {title}
            {/* خط زیر عنوان برای موبایل جهت تفکیک بصری بهتر */}
            <span className="absolute -bottom-[13px] right-0 h-[2px] w-full bg-red-600 md:hidden"></span>
          </h2>
        )}

        {/* تب‌ها - در موبایل اسکرول افقی می‌شوند */}
        {tabs.length > 0 && (
          <div className="flex min-w-0 items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {tabs.map((tab) => {
              const isActive =
                activeTab === tab.value || activeTab === tab.label;

              return (
                <Link
                  key={tab.value || tab.label}
                  to={tab.href || "#"}
                  className={`whitespace-nowrap text-[11px] md:text-[13px] font-bold transition-all px-2 py-1 rounded-lg ${
                    isActive
                      ? "text-red-600 bg-red-50 md:bg-transparent"
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

      {/* دکمه اکشن (مشاهده همه) */}
      {href && (
        <div className="flex justify-end md:block">
          <Link
            to={href}
            className="inline-flex shrink-0 items-center gap-1 text-[11px] md:text-[12px] font-bold text-neutral-500 transition-all hover:gap-2 hover:text-red-600 bg-neutral-100 md:bg-transparent px-3 py-1.5 md:p-0 rounded-full"
          >
            <span>{actionText}</span>
            <ChevronLeft size={14} strokeWidth={2.5} />
          </Link>
        </div>
      )}
    </div>
  );
}
