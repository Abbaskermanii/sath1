import { Link, useLocation } from "react-router-dom";

const navItems = [
  { href: "/dashboard", label: "داشبورد" },
  { href: "/dashboard/posts", label: "پست‌ها" },
  { href: "/dashboard/comments", label: "کامنت‌ها" },
  { href: "/dashboard/categories", label: "دسته‌بندی‌ها" },
  { href: "/dashboard/tags", label: "تگ‌ها" },
  { href: "/dashboard/profile", label: "پروفایل" },
];

export default function DashboardSidebar() {
  const { pathname } = useLocation();

  return (
    <aside className="hidden w-64 shrink-0 border-l border-zinc-800 bg-zinc-950 lg:flex lg:flex-col">
      <div className="border-b border-zinc-800 p-5">
        <h1 className="text-base font-bold text-white">پنل مدیریت</h1>
        <p className="mt-1 text-xs text-zinc-500">CMS News Dashboard</p>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === item.href
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              to={item.href}
              className={`block rounded-lg px-3 py-2.5 text-sm transition ${
                active
                  ? "bg-white text-zinc-950"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
