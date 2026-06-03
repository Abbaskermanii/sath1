// src/layouts/DashboardLayout.jsx
import { Outlet } from "react-router-dom";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import DashboardHeader from "../components/dashboard/DashboardHeader";

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100" dir="rtl">
      <div className="flex min-h-screen">
        <DashboardSidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <DashboardHeader />

          <main className="flex-1 overflow-x-hidden p-4 sm:p-5 lg:p-6">
            <div className="mx-auto w-full max-w-6xl">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
