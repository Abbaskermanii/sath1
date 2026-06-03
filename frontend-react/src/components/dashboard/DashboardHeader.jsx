import { Link, useNavigate } from "react-router-dom";
import useMe from "../../hooks/useMe";
import { clearTokens } from "../../lib/tokens";

export default function DashboardHeader() {
  const navigate = useNavigate();
  const { user } = useMe();

  function logout() {
    clearTokens();
    navigate("/auth", { replace: true });
  }

  return (
    <div className="sticky top-0 z-30 border-b border-zinc-800 bg-zinc-950/95 px-4 py-3 backdrop-blur sm:px-5 lg:px-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-100">
            {user ? `سلام ${user.full_name || user.email}` : "داشبورد"}
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            {user?.role ? `نقش: ${user.role}` : "پنل مدیریت محتوا"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="inline-flex h-9 items-center rounded-lg border border-zinc-700 px-3 text-sm text-zinc-200 transition hover:bg-zinc-900"
          >
            رفتن به سایت
          </Link>

          <button
            type="button"
            onClick={logout}
            className="inline-flex h-9 items-center rounded-lg border border-red-800/70 bg-red-950/40 px-3 text-sm text-red-200 transition hover:bg-red-950"
          >
            خروج
          </button>
        </div>
      </div>
    </div>
  );
}
