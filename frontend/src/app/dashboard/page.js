"use client";

import { useEffect, useState } from "react";
import { dashboardApi } from "@/app/lib/dashboard/dashboardApi";

function Stat({ title, value, hint }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 transition-colors hover:border-zinc-700">
      <p className="text-zinc-400 text-[13px]">{title}</p>
      <p className="mt-2 text-4xl font-bold text-white tabular-nums">{value}</p>
      {hint ? (
        <p className="mt-2 text-[12px] text-zinc-500 leading-5">{hint}</p>
      ) : null}
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi
      .getOverview()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const posts = stats?.posts_count ?? 0;
  const pending = stats?.pending_comments ?? 0;
  const views = stats?.total_views ?? 0;

  return (
    <div className="space-y-6" dir="rtl">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">نمای کلی</h1>
        <p className="mt-2 text-[13px] text-zinc-400 leading-6">
          خلاصه‌ی وضعیت سایت و فعالیت‌ها
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-[130px] rounded-2xl border border-zinc-800 bg-zinc-900 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          <Stat
            title="کل پست‌ها"
            value={posts}
            hint="تعداد کل پست‌های منتشرشده/ذخیره‌شده"
          />
          <Stat
            title="کامنت‌های منتظر تایید"
            value={pending}
            hint="نیاز به بررسی توسط ادمین/نویسنده"
          />
          <Stat
            title="بازدید کل"
            value={views}
            hint="مجموع بازدیدها (طبق گزارش سیستم)"
          />
        </div>
      )}

      {/* یه بخش ساده برای اکشن‌ها */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-sm text-zinc-300 font-semibold">اکشن سریع</p>
          <p className="mt-1 text-[13px] text-zinc-400">
            از منوی سمت راست وارد بخش پست‌ها شوید.
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-sm text-zinc-300 font-semibold">وضعیت دسترسی</p>
          <p className="mt-1 text-[13px] text-zinc-400">
            اگر نقش شما author/admin باشد، همه بخش‌ها فعال است.
          </p>
        </div>
      </div>
    </div>
  );
}
