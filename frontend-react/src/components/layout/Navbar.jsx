import { NavLink } from "react-router-dom";

export default function Navbar() {
  const menuItems = [
    { label: "مصاحبه", slug: "interview" },
    { label: "یادداشت", slug: "note" },
    { label: "خبر", slug: "news" },
    { label: "تحلیل", slug: "analysis" },
    { label: "گفتگوهای شاخص", slug: "talk" },
    { label: "گزارش", slug: "report" },
    { label: "نمودار", slug: "chart" },
  ];

  return (
    <div className="hidden bg-black h-12 md:block" dir="rtl">
      <div className="max-w-7xl mx-auto pt-3 flex">
        <ul className="flex text-amber-50 text-xs font-semibold divide-x divide-gray-600">
          {menuItems.map((item) => (
            <li key={item.slug} className="px-5">
              <NavLink
                to={`/type/${item.slug}`}
                className={({ isActive }) => {
                  const baseClasses =
                    "cursor-pointer transition-all duration-200 pb-1";

                  // رفتارهای ظاهری در حالت اکتیو بودن
                  if (isActive) {
                    return `${baseClasses} text-white border-b-2 border-white`;
                  }

                  // ظاهر در حالت عادی و غیراکتیو
                  return item.label === "گفتگوهای شاخص"
                    ? `${baseClasses} text-yellow-400 hover:text-yellow-350`
                    : `${baseClasses} text-amber-50 hover:text-white`;
                }}
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
