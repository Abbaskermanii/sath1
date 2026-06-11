import { Link, useLocation } from "react-router-dom";
import useRequireAuth from "../../hooks/useRequireAuth";

const navItems = [
  { href: "/dashboard", label: "داشبورد" },
  { href: "/dashboard/posts", label: "پست‌ها" },
  { href: "/dashboard/comments", label: "کامنت‌ها" },

  { href: "/dashboard/categories", label: "دسته‌بندی‌ها", adminOnly: true },
  { href: "/dashboard/tags", label: "تگ‌ها", adminOnly: true },
  { href: "/dashboard/home-hero", label: "هیرو صفحه اصلی", adminOnly: true },
  { href: "/dashboard/ads", label: "مدیریت تبلیغات", adminOnly: true },
  { href: "/dashboard/users", label: "کاربران", adminOnly: true },

  { href: "/dashboard/profile", label: "پروفایل" },
];

export default function DashboardSidebar({ className = "", onNavigate }) {
  const { pathname } = useLocation();
  const { user } = useRequireAuth();

  const isActive = (href) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const visibleItems = navItems.filter((item) => {
    if (item.adminOnly && user?.role !== "admin") return false;
    return true;
  });

  return (
    <aside
      className={`w-64 shrink-0 flex-col border-l border-zinc-800 bg-zinc-950 ${className}`}
    >
      <div className="border-b border-zinc-800 p-5">
        <h1 className="text-base font-bold text-white">پنل مدیریت</h1>
        <p className="mt-1 text-xs text-zinc-500">CMS News Dashboard</p>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {visibleItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            onClick={onNavigate}
            className={`block rounded-lg px-3 py-2.5 text-sm transition ${
              isActive(item.href)
                ? "bg-white text-zinc-950"
                : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
