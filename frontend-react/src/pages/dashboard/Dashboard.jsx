import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { dashboardApi } from "../../lib/dashboard/dashboardApi";

function getApiErrorMessage(error) {
  const data = error?.response?.data;

  if (!data) return error?.message || "خطای ناشناخته رخ داد.";
  if (typeof data === "string") return data;

  if (data.detail) return data.detail;
  if (data.message) return data.message;
  if (data.error) return data.error;

  if (typeof data === "object") {
    const firstKey = Object.keys(data)[0];
    const firstValue = data[firstKey];

    if (Array.isArray(firstValue)) return firstValue[0];
    if (typeof firstValue === "string") return firstValue;
  }

  return "خطا در دریافت اطلاعات داشبورد.";
}

function formatNumber(value) {
  const number = Number(value || 0);
  return new Intl.NumberFormat("fa-IR").format(number);
}

function Stat({ title, value, hint, color = "text-white" }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 shadow-xl transition hover:border-zinc-700">
      <p className="text-sm font-medium text-zinc-400">{title}</p>

      <p className={`mt-3 text-3xl font-black tabular-nums ${color}`}>
        {formatNumber(value)}
      </p>

      {hint ? (
        <p className="mt-3 text-xs leading-6 text-zinc-500">{hint}</p>
      ) : null}
    </div>
  );
}

function StatSkeleton() {
  return (
    <div className="h-36 animate-pulse rounded-2xl border border-zinc-800 bg-zinc-950">
      <div className="space-y-4 p-5">
        <div className="h-4 w-24 rounded bg-zinc-800" />
        <div className="h-8 w-20 rounded bg-zinc-800" />
        <div className="h-3 w-40 rounded bg-zinc-800" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  async function fetchOverview() {
    try {
      setLoading(true);

      const data = await dashboardApi.getOverview();
      setStats(data);
    } catch (error) {
      console.error("getOverview error:", error);

      setStats(null);
      toast.error(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOverview();
  }, []);

  const overview = useMemo(() => {
    const postsTotal = Number(stats?.posts?.total ?? 0);
    const videosTotal = Number(stats?.videos?.total ?? 0);
    const podcastsTotal = Number(stats?.podcasts?.total ?? 0);

    const postsViews = Number(stats?.posts?.views_sum ?? 0);
    const videosViews = Number(stats?.videos?.views_sum ?? 0);
    const podcastsListens = Number(stats?.podcasts?.listens_sum ?? 0);

    return {
      postsCount: postsTotal + videosTotal + podcastsTotal,
      pendingComments: Number(stats?.comments?.pending_total ?? 0),
      totalViews: postsViews + videosViews + podcastsListens,

      textPostsCount: postsTotal,
      videosCount: videosTotal,
      podcastsCount: podcastsTotal,

      textPostsViews: postsViews,
      videosViews,
      podcastsListens,
    };
  }, [stats]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-10" dir="rtl">
      <section className="flex flex-col gap-4 rounded-3xl border border-zinc-800 bg-gradient-to-l from-zinc-900 to-zinc-950 p-6 shadow-2xl md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">نمای کلی</h1>

          <p className="mt-2 text-sm leading-6 text-zinc-400">
            خلاصه وضعیت سایت، محتواها و فعالیت‌های مدیریتی شما.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={fetchOverview}
            disabled={loading}
            className="rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-bold text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "در حال بروزرسانی..." : "بروزرسانی"}
          </button>

          <Link
            to="/dashboard/posts/new"
            className="rounded-xl bg-white px-5 py-2.5 text-center text-sm font-black text-black transition hover:bg-zinc-200"
          >
            پست جدید
          </Link>
        </div>
      </section>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <StatSkeleton key={i} />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Stat
              title="کل محتوا"
              value={overview.postsCount}
              hint="مجموع پست‌های متنی، ویدیوها و پادکست‌ها"
              color="text-white"
            />

            <Stat
              title="کامنت‌های منتظر تایید"
              value={overview.pendingComments}
              hint="کامنت‌هایی که نیاز به بررسی دارند"
              color="text-yellow-400"
            />

            <Stat
              title="بازدید کل"
              value={overview.totalViews}
              hint="مجموع بازدید و شنیده‌شدن همه محتواها"
              color="text-green-400"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Stat
              title="پست‌های متنی"
              value={overview.textPostsCount}
              hint={`مجموع بازدید: ${formatNumber(overview.textPostsViews)}`}
              color="text-blue-400"
            />

            <Stat
              title="ویدیوها"
              value={overview.videosCount}
              hint={`مجموع بازدید: ${formatNumber(overview.videosViews)}`}
              color="text-purple-400"
            />

            <Stat
              title="پادکست‌ها"
              value={overview.podcastsCount}
              hint={`مجموع شنیده‌شدن: ${formatNumber(overview.podcastsListens)}`}
              color="text-pink-400"
            />
          </div>
        </>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5 shadow-xl">
          <p className="text-base font-black text-white">اکشن سریع</p>

          <p className="mt-2 text-sm leading-6 text-zinc-400">
            برای ساخت یا مدیریت محتوا وارد بخش پست‌ها شوید.
          </p>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/dashboard/posts/new"
              className="rounded-xl bg-white px-4 py-2.5 text-center text-sm font-black text-black transition hover:bg-zinc-200"
            >
              ایجاد پست جدید
            </Link>

            <Link
              to="/dashboard/posts"
              className="rounded-xl border border-zinc-700 px-4 py-2.5 text-center text-sm font-bold text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-900"
            >
              مدیریت پست‌ها
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5 shadow-xl">
          <p className="text-base font-black text-white">وضعیت دسترسی</p>

          <p className="mt-2 text-sm leading-6 text-zinc-400">
            شما با دسترسی مدیریت یا نویسنده وارد شده‌اید.
          </p>

          <div className="mt-5 rounded-2xl border border-green-500/20 bg-green-500/10 p-4">
            <p className="text-sm font-bold text-green-400">دسترسی فعال</p>
            <p className="mt-1 text-xs leading-6 text-green-300/80">
              امکان مشاهده، ایجاد و مدیریت محتوای داشبورد برای شما فعال است.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
