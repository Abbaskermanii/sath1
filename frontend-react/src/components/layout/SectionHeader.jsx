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
    <div dir="rtl" className="w-full border-b border-neutral-300 pb-3">
      <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="flex min-w-0 items-center justify-between gap-3">
            {title && (
              <h2 className="relative shrink-0 whitespace-nowrap text-[16px] font-extrabold leading-none text-neutral-950 sm:text-[17px] md:text-[18px]">
                {title}
                <span className="absolute -bottom-[14px] right-0 h-[2px] w-full bg-red-600 sm:-bottom-[15px]" />
              </h2>
            )}

            {href && (
              <Link
                to={href}
                className="inline-flex shrink-0 items-center gap-1 rounded-full bg-neutral-100 px-3 py-1.5 text-[11px] font-bold text-neutral-500 transition-all hover:gap-2 hover:text-red-600 sm:hidden"
              >
                <span>{actionText}</span>
                <ChevronLeft size={14} strokeWidth={2.5} />
              </Link>
            )}
          </div>
        </div>

        {href && (
          <div className="hidden shrink-0 justify-end sm:flex">
            <Link
              to={href}
              className="inline-flex shrink-0 items-center gap-1 rounded-full bg-neutral-100 px-3 py-1.5 text-[11px] font-bold text-neutral-500 transition-all hover:gap-2 hover:text-red-600 md:text-[12px] lg:bg-transparent lg:p-0"
            >
              <span>{actionText}</span>
              <ChevronLeft size={14} strokeWidth={2.5} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
