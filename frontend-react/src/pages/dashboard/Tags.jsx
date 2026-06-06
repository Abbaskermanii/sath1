// src/pages/dashboard/TagsPage.jsx

import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import AdminGuard from "../../lib/AdminGuard";
import { api } from "../../lib/axiosClient";

function normalizeList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function toSlug(value = "") {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
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

function Label({ children }) {
  return <label className="mb-2 block text-sm font-medium text-zinc-300">{children}</label>;
}

function FieldError({ message }) {
  if (!message) return null;
  return <p className="mt-2 text-xs text-red-400">{message}</p>;
}

const inputClass =
  "w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-600/40";

function TagsPageContent() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingSlug, setDeletingSlug] = useState(null);

  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const [form, setForm] = useState({
    title: "",
    slug: "",
  });

  const [editingSlug, setEditingSlug] = useState(null);

  const totalTags = useMemo(() => tags.length, [tags]);

  async function loadTags(showLoading = true) {
    try {
      if (showLoading) setLoading(true);
      setError("");

      const res = await api.get("/news/tags/");
      setTags(normalizeList(res?.data));
    } catch (err) {
      console.error("loadTags error:", err);
      const message = getApiErrorMessage(err, "خطا در دریافت تگ‌ها");
      setError(message);
      toast.error(message);
      setTags([]);
    } finally {
      if (showLoading) setLoading(false);
    }
  }

  useEffect(() => {
    loadTags();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => {
      const next = {
        ...prev,
        [name]: value,
      };

      if (name === "title") {
        const currentSlug = prev.slug?.trim();
        if (!currentSlug || currentSlug === toSlug(prev.title)) {
          next.slug = toSlug(value);
        }
      }

      return next;
    });

    setFieldErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  }

  function resetForm() {
    setForm({
      title: "",
      slug: "",
    });
    setEditingSlug(null);
    setError("");
    setFieldErrors({});
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    const title = form.title.trim();
    const slug = toSlug(form.slug);

    const nextErrors = {};

    if (!title) {
      nextErrors.title = "عنوان تگ الزامی است.";
    }

    if (form.slug.trim() && !slug) {
      nextErrors.slug = "اسلاگ واردشده معتبر نیست.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    const payload = { title };
    if (slug) payload.slug = slug;

    const toastId = toast.loading(
      editingSlug ? "در حال ذخیره تغییرات..." : "در حال ایجاد تگ...",
    );

    try {
      setSaving(true);

      if (editingSlug) {
        await api.patch(`/news/tags/${editingSlug}/`, payload);
      } else {
        await api.post("/news/tags/", payload);
      }

      resetForm();
      await loadTags(false);

      toast.update(toastId, {
        render: editingSlug ? "تگ با موفقیت ویرایش شد." : "تگ با موفقیت ایجاد شد.",
        type: "success",
        isLoading: false,
        autoClose: 2500,
        closeOnClick: true,
      });
    } catch (err) {
      console.error("save tag error:", err);

      const data = err?.response?.data || {};
      const nextFieldErrors = {
        title: Array.isArray(data?.title) ? data.title[0] : "",
        slug: Array.isArray(data?.slug) ? data.slug[0] : "",
      };

      setFieldErrors(nextFieldErrors);

      const message = getApiErrorMessage(err, "ذخیره تگ انجام نشد.");
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

  function handleEdit(tag) {
    setForm({
      title: tag?.title ?? "",
      slug: tag?.slug ?? "",
    });

    setEditingSlug(tag?.slug ?? null);
    setError("");
    setFieldErrors({});
  }

  function confirmDelete(tag) {
    toast(
      ({ closeToast }) => (
        <div dir="rtl" className="space-y-4">
          <div>
            <p className="font-bold text-white">حذف تگ</p>
            <p className="mt-1 text-sm text-zinc-300">
              آیا از حذف تگ «{tag?.title || "بدون عنوان"}» مطمئن هستید؟
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={async () => {
                closeToast();
                await handleDelete(tag);
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
        closeButton: false,
        position: "top-center",
        className: "!bg-zinc-950 !border !border-zinc-800 !rounded-2xl",
      },
    );
  }

  async function handleDelete(tag) {
    const slug = tag?.slug;

    if (!slug) {
      toast.error("اسلاگ تگ پیدا نشد.");
      return;
    }

    const toastId = toast.loading("در حال حذف تگ...");

    try {
      setDeletingSlug(slug);
      setError("");

      await api.delete(`/news/tags/${slug}/`);
      setTags((prev) => prev.filter((item) => item?.slug !== slug));

      if (editingSlug === slug) {
        resetForm();
      }

      toast.update(toastId, {
        render: "تگ با موفقیت حذف شد.",
        type: "success",
        isLoading: false,
        autoClose: 2500,
        closeOnClick: true,
      });
    } catch (err) {
      console.error("delete tag error:", err);

      const message = getApiErrorMessage(err, "حذف تگ انجام نشد.");
      setError(message);

      toast.update(toastId, {
        render: message,
        type: "error",
        isLoading: false,
        autoClose: 4500,
        closeOnClick: true,
      });
    } finally {
      setDeletingSlug(null);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-10" dir="rtl">
      <div className="flex flex-col gap-4 rounded-3xl border border-zinc-800 bg-gradient-to-l from-zinc-900 to-zinc-950 p-6 shadow-2xl md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">مدیریت تگ‌ها</h1>
          <p className="mt-1 text-sm text-zinc-400">
            ایجاد، ویرایش و حذف تگ‌های مربوط به پست‌ها
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadTags()}
          disabled={loading}
          className="rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-bold text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "در حال بروزرسانی..." : "بروزرسانی"}
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
          <p className="text-sm text-zinc-500">کل تگ‌ها</p>
          <p className="mt-2 text-2xl font-black text-white">{totalTags}</p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 md:col-span-2">
          <p className="text-sm text-zinc-500">وضعیت</p>
          <p className="mt-2 text-sm text-zinc-300">
            از این بخش می‌توانید تگ جدید بسازید، تگ موجود را ویرایش کنید یا حذف کنید.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-black text-white">
            {editingSlug ? "ویرایش تگ" : "ایجاد تگ جدید"}
          </h2>

          {editingSlug && (
            <span className="rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-300">
              در حال ویرایش
            </span>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>عنوان</Label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              className={inputClass}
              placeholder="مثلاً: هوش مصنوعی"
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
              dir="ltr"
              className={`${inputClass} text-left`}
              placeholder="مثلاً: ai"
            />
            <p className="mt-2 text-xs text-zinc-500">
              اختیاری است. اگر وارد شود، به‌صورت slug نرمال می‌شود.
            </p>
            <FieldError message={fieldErrors.slug} />
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3 border-t border-zinc-800 pt-4 sm:flex-row">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-white px-5 py-2.5 text-sm font-black text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? "در حال ذخیره..."
              : editingSlug
                ? "ذخیره تغییرات"
                : "ایجاد تگ"}
          </button>

          {editingSlug && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl border border-zinc-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-zinc-900"
            >
              انصراف
            </button>
          )}
        </div>
      </form>

      <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-black text-white">لیست تگ‌ها</h2>
          <span className="text-sm text-zinc-500">{totalTags} مورد</span>
        </div>

        {loading ? (
          <div className="flex min-h-[220px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-zinc-600 border-t-white" />
              <p className="text-sm text-zinc-400">در حال بارگذاری تگ‌ها...</p>
            </div>
          </div>
        ) : tags.length === 0 ? (
          <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/40 p-10 text-center">
            <div>
              <p className="text-lg font-bold text-white">هنوز تگی ثبت نشده است</p>
              <p className="mt-1 text-sm text-zinc-500">
                از فرم بالا اولین تگ خود را ایجاد کنید.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-right text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400">
                  <th className="px-2 py-3 font-medium">عنوان</th>
                  <th className="px-2 py-3 font-medium">اسلاگ</th>
                  <th className="px-2 py-3 font-medium">تعداد پست</th>
                  <th className="px-2 py-3 font-medium">عملیات</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-zinc-800/70">
                {tags.map((tag) => {
                  const isDeleting = deletingSlug === tag?.slug;

                  return (
                    <tr key={tag?.id || tag?.slug} className="transition hover:bg-zinc-900/70">
                      <td className="px-2 py-4 text-white">{tag?.title || "-"}</td>

                      <td className="px-2 py-4 text-zinc-400" dir="ltr">
                        {tag?.slug || "-"}
                      </td>

                      <td className="px-2 py-4 text-zinc-300">
                        {tag?.posts_count ?? 0}
                      </td>

                      <td className="px-2 py-4">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(tag)}
                            className="rounded-lg border border-zinc-700 px-3 py-2 text-xs font-bold text-white transition hover:bg-zinc-800"
                          >
                            ویرایش
                          </button>

                          <button
                            type="button"
                            onClick={() => confirmDelete(tag)}
                            disabled={isDeleting}
                            className="rounded-lg border border-red-500/30 px-3 py-2 text-xs font-bold text-red-300 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isDeleting ? "در حال حذف..." : "حذف"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TagsPage() {
  return (
    <AdminGuard>
      <TagsPageContent />
    </AdminGuard>
  );
}
