import { useState } from "react";
import { Outlet } from "react-router-dom";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import DashboardHeader from "../components/dashboard/DashboardHeader";

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100" dir="rtl">
      <div className="flex min-h-screen">
        <DashboardSidebar className="hidden lg:flex" />

        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              aria-label="بستن منو"
              className="absolute inset-0 bg-black/60"
              onClick={() => setSidebarOpen(false)}
            />

            <div className="relative z-10 h-full w-72 max-w-[85vw]">
              <DashboardSidebar
                className="flex h-full"
                onNavigate={() => setSidebarOpen(false)}
              />
            </div>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />

          <main className="flex-1 overflow-x-hidden px-3 py-4 sm:px-5 lg:px-6">
            <div className="mx-auto w-full max-w-6xl">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
