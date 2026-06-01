"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import useMe from "@/app/hooks/useMe";
import { clearTokens } from "@/app/lib/tokens";

export default function DashboardHeader() {
  const router = useRouter();
  const { me } = useMe();

  function logout() {
    clearTokens();
    router.replace("/auth");
  }

  return (
    <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-3 sm:p-4">
      <div className="text-sm text-zinc-300" dir="rtl">
        {me ? `سلام ${me.full_name || me.email}` : "داشبورد"}
        <div className="text-[12px] text-zinc-500 mt-1">
          {me?.role ? `نقش: ${me.role}` : " "}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href="/"
          className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 hover:bg-white/5 transition-colors"
        >
          رفتن به سایت
        </Link>

        <button
          onClick={logout}
          className="rounded-xl border border-red-900/60 bg-red-950/40 px-3 py-2 text-sm text-red-200 hover:bg-red-950/60 transition-colors"
        >
          خروج
        </button>
      </div>
    </header>
  );
}
