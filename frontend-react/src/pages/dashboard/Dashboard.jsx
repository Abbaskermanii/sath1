import { useEffect, useState } from "react";
import { dashboardApi } from "../../lib/dashboard/dashboardApi";

function Stat({ title, value, hint }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
      <p className="text-xs font-medium text-zinc-400">{title}</p>
      <p className="mt-3 text-3xl font-bold text-white tabular-nums">{value}</p>
      {hint ? (
        <p className="mt-2 text-xs leading-5 text-zinc-500">{hint}</p>
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

  const postsCount = stats?.posts?.total ?? 0;
  const pendingComments = stats?.comments?.pending_total ?? 0;
  const totalViews = stats?.posts?.views_sum ?? 0;

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
        <h1 className="text-2xl font-bold text-white">نمای کلی</h1>
        <p className="mt-2 text-sm leading-6 text-zinc-400">
          خلاصه وضعیت سایت و فعالیت‌های مدیریتی
        </p>
      </section>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-lg border border-zinc-800 bg-zinc-900"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Stat
            title="کل پست‌ها"
            value={postsCount}
            hint="تعداد کل پست‌های ثبت‌شده در سیستم"
          />
          <Stat
            title="کامنت‌های منتظر تایید"
            value={pendingComments}
            hint="کامنت‌هایی که نیاز به بررسی دارند"
          />
          <Stat
            title="بازدید کل"
            value={totalViews}
            hint="مجموع بازدیدهای ثبت‌شده"
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-sm font-semibold text-zinc-200">اکشن سریع</p>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            برای ساخت یا مدیریت محتوا وارد بخش پست‌ها شوید.
          </p>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-sm font-semibold text-zinc-200">وضعیت دسترسی</p>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            شما با دسترسی مدیریت یا نویسنده وارد شده‌اید.
          </p>
        </div>
      </div>
    </div>
  );
}
