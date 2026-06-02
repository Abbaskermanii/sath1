"use client";

import AdminGuard from "@/app/lib/AdminGuard";
import { useEffect, useState } from "react";
import { api } from "@/app/lib/axiosClient";

function normalizeList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

function TagsPageContent() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    slug: "",
  });

  const [editingSlug, setEditingSlug] = useState(null);

  async function loadTags() {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/news/tags/");

      setTags(normalizeList(res?.data));
    } catch (err) {
      console.error("loadTags error:", err);
      setError("خطا در دریافت تگ‌ها");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTags();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function resetForm() {
    setForm({
      title: "",
      slug: "",
    });

    setEditingSlug(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.title.trim()) {
      setError("عنوان تگ الزامی است.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        title: form.title.trim(),
      };

      if (form.slug.trim()) {
        payload.slug = form.slug.trim().toLowerCase();
      }

      if (editingSlug) {
        await api.patch(`/news/tags/${editingSlug}/`, payload);
      } else {
        await api.post("/news/tags/", payload);
      }

      resetForm();
      await loadTags();
    } catch (err) {
      console.error("save tag error:", err);

      const data = err?.response?.data;

      let message = "ذخیره تگ انجام نشد.";

      if (typeof data === "string") {
        message = data;
      } else if (data?.title?.[0]) {
        message = data.title[0];
      } else if (data?.slug?.[0]) {
        message = data.slug[0];
      } else if (data?.detail) {
        message = data.detail;
      } else if (data && typeof data === "object") {
        message = JSON.stringify(data);
      } else if (err?.message) {
        message = err.message;
      }

      setError(message);
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(tag) {
    setForm({
      title: tag.title ?? "",
      slug: tag.slug ?? "",
    });

    setEditingSlug(tag.slug);
  }

  async function handleDelete(tag) {
    const ok = window.confirm(`تگ «${tag.title}» حذف شود؟`);
    if (!ok) return;

    try {
      setError("");

      await api.delete(`/news/tags/${tag.slug}/`);

      await loadTags();
    } catch (err) {
      console.error("delete tag error:", err);

      const data = err?.response?.data;

      let message = "حذف تگ انجام نشد.";

      if (typeof data === "string") {
        message = data;
      } else if (data?.detail) {
        message = data.detail;
      } else if (data && typeof data === "object") {
        message = JSON.stringify(data);
      } else if (err?.message) {
        message = err.message;
      }

      setError(message);
    }
  }

  return (
    <div className="space-y-6 max-w-5xl" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold text-white">مدیریت تگ‌ها</h1>

        <p className="text-sm text-zinc-400 mt-1">
          ایجاد، ویرایش و حذف تگ‌های پست‌ها
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
      >
        <h2 className="text-lg font-semibold text-white">
          {editingSlug ? "ویرایش تگ" : "ایجاد تگ جدید"}
        </h2>

        <div>
          <label className="block mb-2 text-sm text-zinc-300">عنوان</label>

          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-4 py-3 text-white"
            placeholder="مثلاً: هوش مصنوعی"
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
            placeholder="مثلاً: ai"
          />

          <p className="text-xs text-zinc-500 mt-2">
            اختیاری است. اگر خالی بماند، بک‌اند ممکن است خودش تولید کند.
          </p>
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
                : "ایجاد تگ"}
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

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">لیست تگ‌ها</h2>

        {loading ? (
          <div className="text-zinc-400">در حال بارگذاری...</div>
        ) : tags.length === 0 ? (
          <div className="text-zinc-500">هنوز تگی ثبت نشده است.</div>
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
                {tags.map((tag) => (
                  <tr key={tag.id} className="border-b border-zinc-800/70">
                    <td className="py-3 px-2 text-white">{tag.title || "-"}</td>

                    <td className="py-3 px-2 text-zinc-400" dir="ltr">
                      {tag.slug || "-"}
                    </td>

                    <td className="py-3 px-2 text-zinc-300">
                      {tag.posts_count ?? 0}
                    </td>

                    <td className="py-3 px-2">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(tag)}
                          className="rounded-lg border border-zinc-700 px-3 py-1.5 text-white hover:bg-zinc-800"
                        >
                          ویرایش
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(tag)}
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

export default function TagsPage() {
  return (
    <AdminGuard>
      <TagsPageContent />
    </AdminGuard>
  );
}
