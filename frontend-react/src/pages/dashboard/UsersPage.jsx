import { useEffect, useMemo, useState } from "react";
import { api } from "../../lib/axiosClient";
import AdminGuard from "../../lib/AdminGuard";

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

  return "خطا در انجام عملیات.";
}

function baseInputClass() {
  return [
    "w-full rounded-xl border px-4 py-3 text-sm text-white outline-none transition",
    "bg-zinc-900/70 placeholder:text-zinc-600",
    "border-zinc-700 hover:border-zinc-600",
    "focus:border-white/60 focus:ring-2 focus:ring-white/10",
  ].join(" ");
}

function baseButtonClass() {
  return "rounded-xl px-4 py-2.5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50";
}

function UsersPageContent() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [next, setNext] = useState(null);
  const [previous, setPrevious] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [error, setError] = useState("");

  const hasUsers = useMemo(
    () => Array.isArray(users) && users.length > 0,
    [users],
  );

  const fetchUsers = async (url = "/accounts/admin/users/") => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get(url);
      setUsers(res?.data?.results || []);
      setNext(res?.data?.next || null);
      setPrevious(res?.data?.previous || null);
    } catch (err) {
      console.error(err);
      setError(getApiErrorMessage(err));
      setUsers([]);
      setNext(null);
      setPrevious(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearch = () => {
    const trimmed = search.trim();
    const url = trimmed
      ? `/accounts/admin/users/?search=${encodeURIComponent(trimmed)}`
      : "/accounts/admin/users/";

    fetchUsers(url);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("مطمئنی میخوای حذف کنی؟")) return;

    try {
      setActionLoadingId(`delete-${id}`);
      await api.delete(`/accounts/admin/users/${id}/`);
      await fetchUsers();
    } catch (err) {
      console.error(err);
      setError(getApiErrorMessage(err));
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRoleChange = async (id, role) => {
    try {
      setActionLoadingId(`role-${id}`);
      await api.patch(`/accounts/admin/users/${id}/`, { role });
      await fetchUsers();
    } catch (err) {
      console.error(err);
      setError(getApiErrorMessage(err));
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-10" dir="rtl">
      <div className="flex flex-col gap-3 rounded-3xl border border-zinc-800 bg-gradient-to-l from-zinc-900 to-zinc-950 p-6 shadow-2xl md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">مدیریت کاربران</h1>
          <p className="mt-1 text-sm text-zinc-400">
            کاربران را جستجو کنید، نقش آن‌ها را تغییر دهید یا حذفشان کنید.
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 px-4 py-3 text-sm text-zinc-300">
          تعداد کاربران این صفحه:{" "}
          <span className="font-black text-white">{users.length}</span>
        </div>
      </div>

      <div className="rounded-3xl border border-zinc-800 bg-zinc-950 shadow-2xl">
        <div className="border-b border-zinc-800 p-5 md:p-6">
          <div className="flex flex-col gap-3 md:flex-row">
            <input
              type="text"
              placeholder="جستجو بر اساس نام کاربری یا ایمیل..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
              className={baseInputClass()}
            />

            <button
              onClick={handleSearch}
              disabled={loading}
              className={`${baseButtonClass()} bg-white text-black hover:bg-zinc-200`}
            >
              {loading ? "در حال جستجو..." : "جستجو"}
            </button>
          </div>

          {error && (
            <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex min-h-[320px] items-center justify-center p-6">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 px-6 py-5 text-center">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-zinc-600 border-t-white" />
              <p className="text-sm text-zinc-400">
                در حال بارگذاری کاربران...
              </p>
            </div>
          </div>
        ) : !hasUsers ? (
          <div className="p-6">
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5 text-sm text-amber-300">
              هیچ کاربری برای نمایش پیدا نشد.
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-zinc-200">
                <thead className="bg-zinc-900/80 text-zinc-400">
                  <tr className="border-b border-zinc-800">
                    <th className="px-4 py-4 text-right font-bold">ID</th>
                    <th className="px-4 py-4 text-right font-bold">
                      نام کاربری
                    </th>
                    <th className="px-4 py-4 text-right font-bold">ایمیل</th>
                    <th className="px-4 py-4 text-right font-bold">نقش</th>
                    <th className="px-4 py-4 text-right font-bold">عملیات</th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((user) => {
                    const roleLoading = actionLoadingId === `role-${user.id}`;
                    const deleteLoading =
                      actionLoadingId === `delete-${user.id}`;

                    return (
                      <tr
                        key={user.id}
                        className="border-b border-zinc-800/80 transition hover:bg-zinc-900/40"
                      >
                        <td className="px-4 py-4 text-zinc-400">{user.id}</td>
                        <td className="px-4 py-4 font-semibold text-white">
                          {user.username || "-"}
                        </td>
                        <td className="px-4 py-4 text-zinc-300">
                          {user.email || "-"}
                        </td>
                        <td className="px-4 py-4">
                          <select
                            value={user.role}
                            onChange={(e) =>
                              handleRoleChange(user.id, e.target.value)
                            }
                            disabled={roleLoading || deleteLoading}
                            className="w-full min-w-32 rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none transition hover:border-zinc-600 focus:border-white/60"
                          >
                            <option value="user">User</option>
                            <option value="author">Author</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="px-4 py-4">
                          <button
                            onClick={() => handleDelete(user.id)}
                            disabled={roleLoading || deleteLoading}
                            className={`${baseButtonClass()} bg-red-500 text-white hover:bg-red-400`}
                          >
                            {deleteLoading ? "در حال حذف..." : "حذف"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-zinc-800 p-5 md:flex-row md:items-center md:justify-between">
              <p className="text-xs text-zinc-500">
                برای مشاهده نتایج بیشتر از دکمه‌های صفحه‌بندی استفاده کنید.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => fetchUsers(previous)}
                  disabled={!previous || loading}
                  className={`${baseButtonClass()} border border-zinc-700 text-zinc-200 hover:border-zinc-500 hover:bg-zinc-900`}
                >
                  قبلی
                </button>

                <button
                  onClick={() => fetchUsers(next)}
                  disabled={!next || loading}
                  className={`${baseButtonClass()} border border-zinc-700 text-zinc-200 hover:border-zinc-500 hover:bg-zinc-900`}
                >
                  بعدی
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function UsersPage() {
  return (
    <AdminGuard>
      <UsersPageContent />
    </AdminGuard>
  );
}
