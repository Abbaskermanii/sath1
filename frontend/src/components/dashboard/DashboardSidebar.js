"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import useMe from "@/app/hooks/useMe";

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { me } = useMe();

  const isAdmin = me?.role === "admin";

  const items = [
    { href: "/dashboard", label: "نمای کلی" },
    { href: "/dashboard/posts", label: "پست‌ها" },
    { href: "/dashboard/comments", label: "کامنت‌ها" },
  ];

  const adminItems = [
    { href: "/dashboard/categories", label: "دسته‌بندی‌ها" },
    { href: "/dashboard/tags", label: "تگ‌ها" },
  ];

  const all = isAdmin ? [...items, ...adminItems] : items;

  return (
    <nav className="rounded-2xl border border-zinc-800 bg-zinc-900 p-3">
      <div className="px-2 py-2 text-[12px] text-zinc-400" dir="rtl">
        منو
      </div>

      <ul className="space-y-1">
        {all.map((it) => {
          const active = pathname === it.href;
          return (
            <li key={it.href}>
              <Link
                href={it.href}
                className={[
                  "block rounded-xl px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-white/5 text-white border border-zinc-700"
                    : "text-zinc-300 hover:bg-white/5 hover:text-white border border-transparent",
                ].join(" ")}
              >
                {it.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
