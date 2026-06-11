import { Link, useNavigate } from "react-router-dom";
import useMe from "../../hooks/useMe";
import { clearTokens } from "../../lib/tokens";

export default function DashboardHeader({ onMenuClick }) {
  const navigate = useNavigate();
  const { user } = useMe();

  function logout() {
    clearTokens();
    navigate("/auth", { replace: true });
  }

  return (
    <div className="sticky top-0 z-30 border-b border-zinc-800 bg-zinc-950/95 px-3 py-3 backdrop-blur sm:px-5 lg:px-6">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900 text-lg text-zinc-100 transition hover:bg-zinc-800 lg:hidden"
            aria-label="باز کردن منو"
          >
            ☰
          </button>

          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-zinc-100">
              {user ? `سلام ${user.full_name || user.email}` : "داشبورد"}
            </p>
            <p className="mt-1 truncate text-xs text-zinc-500">
              {user?.role ? `نقش: ${user.role}` : "پنل مدیریت محتوا"}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            to="/"
            className="inline-flex h-9 items-center rounded-lg border border-zinc-700 px-3 text-xs text-zinc-200 transition hover:bg-zinc-900 sm:text-sm"
          >
            رفتن به سایت
          </Link>

          <button
            type="button"
            onClick={logout}
            className="inline-flex h-9 items-center rounded-lg border border-red-800/70 bg-red-950/40 px-3 text-xs text-red-200 transition hover:bg-red-950 sm:text-sm"
          >
            خروج
          </button>
        </div>
      </div>
    </div>
  );
}
