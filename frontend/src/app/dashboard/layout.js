"use client";

import useRequireAuth from "@/app/hooks/useRequireAuth";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";

export default function DashboardLayout({ children }) {
  const { user, loading } = useRequireAuth(["admin", "author"]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-300">
          در حال بارگذاری...
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen bg-black text-white" dir="rtl">
      {/* بک‌گراند خیلی ملایم مثل لاگین */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(at_75%_15%,rgba(129,140,248,0.10),transparent_45%)]" />

      <div className="relative min-h-screen p-3 sm:p-4">
        <div className="grid min-h-[calc(100vh-24px)] sm:min-h-[calc(100vh-32px)] grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden">
          {/* محتوا (چپ) */}
          <section className="order-2 lg:order-1 lg:col-span-9 bg-zinc-900/50 p-4 sm:p-6">
            <div className="space-y-4">
              <DashboardHeader />
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 sm:p-6">
                {children}
              </div>
            </div>
          </section>

          {/* سایدبار (راست) */}
          <aside className="order-1 lg:order-2 lg:col-span-3 bg-zinc-950 p-3 sm:p-4 lg:p-6 border-b lg:border-b-0 lg:border-r border-zinc-800">
            <div className="space-y-4">
              {/* هدر سایدبار */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[11px] text-zinc-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  پنل مدیریت
                </div>

                <h2 className="mt-4 text-lg font-bold leading-tight text-white">
                  مدیریت محتوا
                  <br />
                  ساده و سریع
                </h2>

                <p className="mt-2 text-[12px] text-zinc-400 leading-6">
                  ابزارهای نویسنده/ادمین اینجاست.
                </p>
              </div>

              <DashboardSidebar />
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
