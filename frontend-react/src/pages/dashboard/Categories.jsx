import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { taxonomyApi } from "../../lib/dashboard/taxonomyApi";
import AdminGuard from "../../lib/AdminGuard";

const initialForm = {
  title: "",
  slug: "",
};

const inputClass =
  "w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-600/40 disabled:cursor-not-allowed disabled:opacity-50";

function toSlug(value = "") {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^\w\u0600-\u06FF\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function getApiErrorMessage(error, fallback = "عملیات انجام نشد.") {
  const data = error?.response?.data;

  if (!data) return error?.message || fallback;
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

  return fallback;
}

function mapApiErrors(error) {
  const data = error?.response?.data;

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return {};
  }

  const errors = {};

  Object.entries(data).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      errors[key] = value[0];
    } else if (typeof value === "string") {
      errors[key] = value;
    }
  });

  return errors;
}

function Label({ children }) {
  return (
    <label className="mb-2 block text-sm font-medium text-zinc-300">
      {children}
    </label>
  );
}

function FieldError({ message }) {
  if (!message) return null;

  return <p className="mt-2 text-xs text-red-400">{message}</p>;
}

function CategorySkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((item) => (
        <div
          key={item}
          className="h-16 animate-pulse rounded-xl border border-zinc-800 bg-zinc-900"
        />
      ))}
    </div>
  );
}

function CategoriesPageContent() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [ordering, setOrdering] = useState("title");

  const [form, setForm] = useState(initialForm);
  const [editingSlug, setEditingSlug] = useState(null);

  const hasActiveFilters = useMemo(() => {
    return Boolean(search) || ordering !== "title";
  }, [search, ordering]);

  const totalPostsCount = useMemo(() => {
    return items.reduce((sum, item) => sum + Number(item.posts_count || 0), 0);
  }, [items]);

  async function loadCategories(params = {}, showLoading = true) {
    try {
      if (showLoading) setLoading(true);

      setError("");

      const data = await taxonomyApi.listCategories({
        search: (params.search ?? search) || undefined,
        ordering: (params.ordering ?? ordering) || undefined,
      });

      setItems(normalizeList(data));
    } catch (err) {
      console.error("load categories error:", err);

      const message = getApiErrorMessage(err, "خطا در دریافت دسته‌بندی‌ها");
      setError(message);
      toast.error(message);
    } finally {
      if (showLoading) setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function resetForm() {
    setForm(initialForm);
    setEditingSlug(null);
    setFieldErrors({});
    setError("");
  }

  async function handleApplyFilters() {
    const nextSearch = searchInput.trim();

    setSearch(nextSearch);
    await loadCategories({
      search: nextSearch,
      ordering,
    });
  }

  async function handleResetFilters() {
    setSearchInput("");
    setSearch("");
    setOrdering("title");

    await loadCategories({
      search: "",
      ordering: "title",
    });
  }

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => {
      const next = {
        ...prev,
        [name]: value,
      };

      if (name === "title" && !editingSlug) {
        next.slug = toSlug(value);
      }

      if (name === "slug") {
        next.slug = toSlug(value);
      }

      return next;
    });

    setFieldErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setError("");
  }

  function validateForm() {
    const errors = {};

    if (!form.title.trim()) {
      errors.title = "عنوان دسته‌بندی الزامی است.";
    }

    if (!form.slug.trim()) {
      errors.slug = "اسلاگ الزامی است.";
    }

    const normalizedSlug = toSlug(form.slug);

    if (form.slug.trim() && !normalizedSlug) {
      errors.slug = "اسلاگ معتبر نیست.";
    }

    return errors;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setFieldErrors({});

    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      toast.error("لطفاً خطاهای فرم را برطرف کنید.");
      return;
    }

    const toastId = toast.loading(
      editingSlug
        ? "در حال ذخیره تغییرات دسته‌بندی..."
        : "در حال ایجاد دسته‌بندی..."
    );

    try {
      setSaving(true);

      const payload = {
        title: form.title.trim(),
        slug: toSlug(form.slug),
      };

      if (editingSlug) {
        await taxonomyApi.updateCategory(editingSlug, payload);
      } else {
        await taxonomyApi.createCategory(payload);
      }

      resetForm();
      await loadCategories({}, false);

      toast.update(toastId, {
        render: editingSlug
          ? "دسته‌بندی با موفقیت ویرایش شد."
          : "دسته‌بندی با موفقیت ایجاد شد.",
        type: "success",
        isLoading: false,
        autoClose: 2500,
        closeOnClick: true,
      });
    } catch (err) {
      console.error("save category error:", err);

      const nextFieldErrors = mapApiErrors(err);
      const message = getApiErrorMessage(err, "ذخیره دسته‌بندی انجام نشد.");

      setFieldErrors(nextFieldErrors);
      setError(message);

      toast.update(toastId, {
        render: message,
        type: "error",
        isLoading: false,
        autoClose: 4500,
        closeOnClick: true,
      });
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(item) {
    setForm({
      title: item.title ?? "",
      slug: item.slug ?? "",
    });

    setEditingSlug(item.slug);
    setFieldErrors({});
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function handleDelete(item) {
    toast(
      ({ closeToast }) => (
        <div className="space-y-4" dir="rtl">
          <div>
            <p className="font-bold text-white">حذف دسته‌بندی</p>

            <p className="mt-2 text-sm leading-6 text-zinc-300">
              آیا از حذف دسته‌بندی{" "}
              <span className="font-bold text-red-300">«{item.title}»</span>{" "}
              مطمئن هستید؟
            </p>

            {Number(item.posts_count || 0) > 0 && (
              <p className="mt-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-2 text-xs leading-6 text-yellow-200">
                این دسته‌بندی دارای {item.posts_count} پست است. اگر بک‌اند اجازه
                حذف ندهد، عملیات ناموفق خواهد شد.
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={async () => {
                closeToast();

                const toastId = toast.loading("در حال حذف دسته‌بندی...");

                try {
                  setError("");

                  await taxonomyApi.deleteCategory(item.slug);

                  if (editingSlug === item.slug) {
                    resetForm();
                  }

                  await loadCategories({}, false);

                  toast.update(toastId, {
                    render: "دسته‌بندی با موفقیت حذف شد.",
                    type: "success",
                    isLoading: false,
                    autoClose: 2500,
                    closeOnClick: true,
                  });
                } catch (err) {
                  console.error("delete category error:", err);

                  const message = getApiErrorMessage(
                    err,
                    "حذف دسته‌بندی انجام نشد."
                  );

                  setError(message);

                  toast.update(toastId, {
                    render: message,
                    type: "error",
                    isLoading: false,
                    autoClose: 4500,
                    closeOnClick: true,
                  });
                }
              }}
              className="rounded-lg bg-red-500 px-3 py-2 text-xs font-bold text-white transition hover:bg-red-600"
            >
              بله، حذف شود
            </button>

            <button
              type="button"
              onClick={closeToast}
              className="rounded-lg border border-zinc-600 px-3 py-2 text-xs font-bold text-zinc-200 transition hover:bg-zinc-800"
            >
              انصراف
            </button>
          </div>
        </div>
      ),
      {
        autoClose: false,
        closeOnClick: false,
        draggable: false,
      }
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-10" dir="rtl">
      <section className="flex flex-col gap-4 rounded-3xl border border-zinc-800 bg-gradient-to-l from-zinc-900 to-zinc-950 p-6 shadow-2xl md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">
            مدیریت دسته‌بندی‌ها
          </h1>

          <p className="mt-2 text-sm leading-6 text-zinc-400">
            ایجاد، ویرایش، جستجو و حذف دسته‌بندی‌های پست‌ها.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadCategories()}
          disabled={loading || saving}
          className="rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-bold text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
          بروزرسانی
        </button>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
          <p className="text-sm text-zinc-500">کل دسته‌بندی‌ها</p>
          <p className="mt-2 text-2xl font-black text-white">{items.length}</p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
          <p className="text-sm text-zinc-500">مجموع پست‌ها</p>
          <p className="mt-2 text-2xl font-black text-white">
            {totalPostsCount}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
          <p className="text-sm text-zinc-500">وضعیت فیلتر</p>
          <p
            className={`mt-2 text-sm font-bold ${
              hasActiveFilters ? "text-yellow-300" : "text-green-300"
            }`}
          >
            {hasActiveFilters ? "فیلتر فعال است" : "بدون فیلتر"}
          </p>
        </div>
      </section>

      <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-white">فیلتر و جستجو</h2>
            <p className="mt-1 text-sm text-zinc-500">
              دسته‌بندی‌ها را بر اساس عنوان یا اسلاگ جستجو کنید.
            </p>
          </div>

          {hasActiveFilters && (
            <span className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-3 py-1.5 text-xs font-bold text-yellow-300">
              فیلتر فعال
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_220px_auto_auto]">
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleApplyFilters();
              }
            }}
            placeholder="جستجو بر اساس عنوان یا اسلاگ..."
            className={inputClass}
          />

          <select
            value={ordering}
            onChange={(e) => setOrdering(e.target.value)}
            className={inputClass}
          >
            <option value="title">عنوان ↑</option>
            <option value="-title">عنوان ↓</option>
            <option value="created_at">قدیمی‌تر</option>
            <option value="-created_at">جدیدتر</option>
          </select>

          <button
            type="button"
            onClick={handleApplyFilters}
            disabled={loading}
            className="rounded-xl bg-white px-5 py-3 text-sm font-black text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            اعمال
          </button>

          <button
            type="button"
            onClick={handleResetFilters}
            disabled={loading}
            className="rounded-xl border border-zinc-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            پاک کردن
          </button>
        </div>
      </section>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl"
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-black text-white">
              {editingSlug ? "ویرایش دسته‌بندی" : "ایجاد دسته‌بندی جدید"}
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              عنوان و اسلاگ دسته‌بندی را وارد کنید.
            </p>
          </div>

          {editingSlug && (
            <span className="rounded-xl border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-xs font-bold text-blue-300">
              در حال ویرایش
            </span>
          )}
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <Label>عنوان</Label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              disabled={saving}
              className={inputClass}
              placeholder="مثلاً: تکنولوژی"
            />
            <FieldError message={fieldErrors.title} />
          </div>

          <div>
            <Label>اسلاگ</Label>
            <input
              type="text"
              name="slug"
              value={form.slug}
              onChange={handleChange}
              disabled={saving}
              dir="ltr"
              className={`${inputClass} text-left`}
              placeholder="technology"
            />
            <FieldError message={fieldErrors.slug} />
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-white px-5 py-3 text-sm font-black text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
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
              disabled={saving}
              className="rounded-xl border border-zinc-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              انصراف
            </button>
          )}
        </div>
      </form>

      <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-white">لیست دسته‌بندی‌ها</h2>
            <p className="mt-1 text-sm text-zinc-500">
              دسته‌بندی‌های ثبت‌شده در سیستم.
            </p>
          </div>

          <span className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-300">
            تعداد: {items.length}
          </span>
        </div>

        {loading ? (
          <CategorySkeleton />
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/40 p-10 text-center">
            <p className="text-sm text-zinc-400">
              هنوز دسته‌بندی‌ای ثبت نشده است.
            </p>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-4 rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-zinc-800"
              >
                حذف فیلترها
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-right text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400">
                  <th className="px-3 py-4 font-medium">عنوان</th>
                  <th className="px-3 py-4 font-medium">اسلاگ</th>
                  <th className="px-3 py-4 font-medium">تعداد پست</th>
                  <th className="px-3 py-4 font-medium">عملیات</th>
                </tr>
              </thead>

              <tbody>
                {items.map((item) => (
                  <tr
                    key={item.slug}
                    className="border-b border-zinc-800/70 transition hover:bg-zinc-900/60"
                  >
                    <td className="px-3 py-4">
                      <div className="font-bold text-white">
                        {item.title || "-"}
                      </div>
                    </td>

                    <td className="px-3 py-4">
                      <code
                        className="rounded-lg border border-zinc-800 bg-zinc-900 px-2 py-1 text-xs text-zinc-300"
                        dir="ltr"
                      >
                        {item.slug || "-"}
                      </code>
                    </td>

                    <td className="px-3 py-4 text-zinc-300">
                      {item.posts_count ?? 0}
                    </td>

                    <td className="px-3 py-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(item)}
                          disabled={saving}
                          className="rounded-xl border border-zinc-700 px-3 py-2 text-xs font-bold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          ویرایش
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(item)}
                          disabled={saving}
                          className="rounded-xl border border-red-500/40 px-3 py-2 text-xs font-bold text-red-300 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
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
      </section>
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
