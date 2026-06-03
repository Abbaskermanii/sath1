import { useEffect, useState } from "react";
import { taxonomyApi } from "../../lib/dashboard/taxonomyApi";
import AdminGuard from "../../lib/AdminGuard";

function CategoriesPageContent() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [ordering, setOrdering] = useState("title");

  const [form, setForm] = useState({ title: "", slug: "" });
  const [editingSlug, setEditingSlug] = useState(null);

  async function loadCategories(params = {}) {
    try {
      setLoading(true);
      setError("");

      const data = await taxonomyApi.listCategories({
        search: (params.search ?? search) || undefined,
        ordering: (params.ordering ?? ordering) || undefined,
      });

      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(
        e?.response?.data?.detail ||
          e?.message ||
          "خطا در دریافت دسته‌بندی‌ها"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function resetForm() {
    setForm({ title: "", slug: "" });
    setEditingSlug(null);
  }

  async function handleApplyFilters() {
    const nextSearch = searchInput.trim();
    setSearch(nextSearch);
    await loadCategories({ search: nextSearch, ordering });
  }

  async function handleResetFilters() {
    setSearchInput("");
    setSearch("");
    setOrdering("title");
    await loadCategories({ search: "", ordering: "title" });
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.title.trim()) {
      setError("عنوان دسته‌بندی الزامی است.");
      return;
    }
    if (!form.slug.trim()) {
      setError("اسلاگ الزامی است.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim().toLowerCase(),
      };

      if (editingSlug) {
        await taxonomyApi.updateCategory(editingSlug, payload);
      } else {
        await taxonomyApi.createCategory(payload);
      }

      resetForm();
      await loadCategories();
    } catch (e) {
      const data = e?.response?.data;
      const message =
        data?.title?.[0] ||
        data?.slug?.[0] ||
        data?.detail ||
        e?.message ||
        "ذخیره دسته‌بندی انجام نشد.";
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(item) {
    setForm({ title: item.title ?? "", slug: item.slug ?? "" });
    setEditingSlug(item.slug);
  }

  async function handleDelete(item) {
    const ok = window.confirm(`دسته‌بندی «${item.title}» حذف شود؟`);
    if (!ok) return;

    try {
      setError("");
      await taxonomyApi.deleteCategory(item.slug);
      if (editingSlug === item.slug) resetForm();
      await loadCategories();
    } catch (e) {
      const data = e?.response?.data;
      setError(data?.detail || e?.message || "حذف دسته‌بندی انجام نشد.");
    }
  }

  return (
    <div className="space-y-6 max-w-5xl" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold text-white">مدیریت دسته‌بندی‌ها</h1>
        <p className="text-sm text-zinc-400 mt-1">
          ایجاد، ویرایش و حذف دسته‌بندی‌های پست‌ها
        </p>
      </div>

      {/* فیلتر */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">فیلتر و جستجو</h2>
          {(search || ordering !== "title") && (
            <span className="text-xs text-zinc-500">فیلتر فعال</span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_220px_auto_auto] gap-3">
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="جستجو بر اساس عنوان یا اسلاگ..."
            className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-4 py-3 text-white outline-none focus:border-white"
          />

          <select
            value={ordering}
            onChange={(e) => setOrdering(e.target.value)}
            className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-4 py-3 text-white outline-none focus:border-white"
          >
            <option value="title">عنوان ↑</option>
            <option value="-title">عنوان ↓</option>
            <option value="created_at">قدیمی‌تر</option>
            <option value="-created_at">جدیدتر</option>
          </select>

          <button
            onClick={handleApplyFilters}
            disabled={loading}
            className="rounded-lg bg-white px-5 py-3 font-bold text-black disabled:opacity-50"
          >
            اعمال
          </button>

          <button
            onClick={handleResetFilters}
            disabled={loading}
            className="rounded-lg border border-zinc-700 px-5 py-3 text-white disabled:opacity-50"
          >
            پاک کردن
          </button>
        </div>
      </div>

      {/* فرم */}
      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
      >
        <h2 className="text-lg font-semibold text-white">
          {editingSlug ? "ویرایش دسته‌بندی" : "ایجاد دسته‌بندی جدید"}
        </h2>

        <div>
          <label className="block mb-2 text-sm text-zinc-300">عنوان</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-4 py-3 text-white"
            placeholder="مثلاً: تکنولوژی"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm text-zinc-300">اسلاگ</label>
          <input
            type="text"
            name="slug"
            value={form.slug}
            onChange={handleChange}
            dir="ltr"
            className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-4 py-3 text-white text-left"
            placeholder="مثلاً: technology"
          />
        </div>

        {error && (
          <div className="rounded-lg border border-red-500 bg-red-500/10 p-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-white px-5 py-2.5 font-bold text-black disabled:opacity-50"
          >
            {saving
              ? "در حال ذخیره..."
              : editingSlug
              ? "ذخیره تغییرات"
              : "ایجاد دسته‌بندی"}
          </button>

          {editingSlug && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border border-zinc-700 px-5 py-2.5 text-white"
            >
              انصراف
            </button>
          )}
        </div>
      </form>

      {/* لیست */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">لیست دسته‌بندی‌ها</h2>
          <span className="text-sm text-zinc-400">تعداد: {items.length}</span>
        </div>

        {loading ? (
          <div className="text-zinc-400">در حال بارگذاری...</div>
        ) : items.length === 0 ? (
          <div className="text-zinc-500">هنوز دسته‌بندی‌ای ثبت نشده است.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400">
                  <th className="py-3 px-2">عنوان</th>
                  <th className="py-3 px-2">اسلاگ</th>
                  <th className="py-3 px-2">تعداد پست</th>
                  <th className="py-3 px-2">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.slug} className="border-b border-zinc-800/70">
                    <td className="py-3 px-2 text-white">{item.title}</td>
                    <td className="py-3 px-2 text-zinc-400" dir="ltr">
                      {item.slug}
                    </td>
                    <td className="py-3 px-2 text-zinc-300">
                      {item.posts_count ?? 0}
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(item)}
                          className="rounded-lg border border-zinc-700 px-3 py-1.5 text-white hover:bg-zinc-800"
                        >
                          ویرایش
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item)}
                          className="rounded-lg border border-red-500/50 px-3 py-1.5 text-red-300 hover:bg-red-500/10"
                        >
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CategoriesPage() {
  return (
    <AdminGuard>
      <CategoriesPageContent />
    </AdminGuard>
  );
}
