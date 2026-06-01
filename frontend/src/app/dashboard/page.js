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
      .then((res) => {
        console.log("Overview Data:", res); // برای اطمینان در کنسول
        setStats(res);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // استخراج مقادیر بر اساس ساختار واقعی API (خروجی Swagger)
  const postsCount = stats?.posts?.total ?? 0;
  const pendingComments = stats?.comments?.pending_total ?? 0;
  const totalViews = stats?.posts?.views_sum ?? 0;

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
              className="h-32.5 rounded-2xl border border-zinc-800 bg-zinc-900 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          <Stat
            title="کل پست‌ها"
            value={postsCount}
            hint="تعداد کل پست‌های منتشرشده/ذخیره‌شده"
          />
          <Stat
            title="کامنت‌های منتظر تایید"
            value={pendingComments}
            hint="نیاز به بررسی توسط ادمین/نویسنده"
          />
          <Stat
            title="بازدید کل"
            value={totalViews}
            hint="مجموع بازدیدها (طبق گزارش سیستم)"
          />
        </div>
      )}

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
            شما با دسترسی مدیریت/نویسنده وارد شده‌اید.
          </p>
        </div>
      </div>
    </div>
  );
}
