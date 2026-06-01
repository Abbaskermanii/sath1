"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "داشبورد" },
  { href: "/dashboard/posts", label: "پست‌ها" },
  { href: "/dashboard/comments", label: "کامنت‌ها" },
  { href: "/dashboard/categories", label: "دسته‌بندی‌ها" },
  { href: "/dashboard/tags", label: "تگ‌ها" },
  { href: "/dashboard/profile", label: "پروفایل" },
];

export default function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-72 hidden lg:flex flex-col border-l border-zinc-800 bg-zinc-950">
      <div className="p-5 border-b border-zinc-800">
        <h1 className="text-lg font-bold">پنل مدیریت</h1>
        <p className="text-xs text-zinc-500 mt-1">CMS News Dashboard</p>
      </div>

      <nav className="p-3 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-xl px-4 py-3 text-sm transition-colors ${
                active
                  ? "bg-white text-black"
                  : "text-zinc-300 hover:bg-zinc-900 hover:text-white"
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
