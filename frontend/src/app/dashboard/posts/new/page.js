"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/app/lib/axiosClient";

export default function NewPostPage() {
  const router = useRouter();

  const [categories, setCategories] = useState([]);
  const [tagsList, setTagsList] = useState([]);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    category: "",
    status: "draft",
    tags: [],
    published_at: "",
  });

  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [pageLoading, setPageLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadInitialData() {
      try {
        const [categoriesRes, tagsRes] = await Promise.all([
          api.get("/news/categories/"),
          api.get("/news/tags/"),
        ]);

        setCategories(
          Array.isArray(categoriesRes?.data) ? categoriesRes.data : [],
        );
        setTagsList(Array.isArray(tagsRes?.data) ? tagsRes.data : []);
      } catch (err) {
        console.error("loadInitialData error:", err);
        setError("خطا در بارگذاری دسته‌بندی‌ها و تگ‌ها");
      } finally {
        setPageLoading(false);
      }
    }

    loadInitialData();
  }, []);

  useEffect(() => {
    return () => {
      if (coverPreview) {
        URL.revokeObjectURL(coverPreview);
      }
    };
  }, [coverPreview]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function toggleTag(id) {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(id)
        ? prev.tags.filter((item) => item !== id)
        : [...prev.tags, id],
    }));
  }

  function handleCoverChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (coverPreview) {
      URL.revokeObjectURL(coverPreview);
    }

    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.title.trim()) {
      setError("عنوان الزامی است.");
      return;
    }

    if (!form.content.trim()) {
      setError("محتوا الزامی است.");
      return;
    }

    setLoading(true);

    try {
      const fd = new FormData();

      fd.append("title", form.title.trim());
      fd.append("excerpt", form.excerpt.trim());
      fd.append("content", form.content.trim());
      fd.append("status", form.status);

      if (form.slug.trim()) {
        fd.append("slug", form.slug.trim().toLowerCase());
      }

      if (form.category) {
        fd.append("category", String(form.category));
      }

      form.tags.forEach((tagId) => {
        fd.append("tags", String(tagId));
      });

      if (form.published_at) {
        const iso = new Date(form.published_at).toISOString();
        fd.append("published_at", iso);
      }

      if (coverFile) {
        fd.append("cover", coverFile);
      }

      await api.post("/news/posts/", fd, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("پست با موفقیت ایجاد شد.");
      router.push("/dashboard/posts");
    } catch (err) {
      console.error("Create post error:", err);

      const data = err?.response?.data;

      if (typeof data === "string") {
        setError(data);
      } else if (data?.slug?.[0]) {
        setError(data.slug[0]);
      } else if (data?.title?.[0]) {
        setError(data.title[0]);
      } else if (data?.content?.[0]) {
        setError(data.content[0]);
      } else if (data?.detail) {
        setError(data.detail);
      } else if (data && typeof data === "object") {
        setError(JSON.stringify(data));
      } else {
        setError("خطا در ایجاد پست");
      }
    } finally {
      setLoading(false);
    }
  }

  if (pageLoading) {
    return (
      <div className="p-6 text-white" dir="rtl">
        در حال بارگذاری...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 text-white" dir="rtl">
      <h1 className="text-2xl font-bold mb-6">ایجاد پست جدید</h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
      >
        <div>
          <label className="block mb-2">عنوان</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700"
            required
          />
        </div>

        <div>
          <label className="block mb-2">اسلاگ</label>
          <input
            type="text"
            name="slug"
            value={form.slug}
            onChange={handleChange}
            dir="ltr"
            placeholder="مثلاً: my-first-post"
            className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700 text-left"
          />
          <p className="text-xs text-zinc-500 mt-2">
            فقط حروف انگلیسی کوچک، عدد و خط تیره. اگر خالی بماند، بک‌اند خودش
            می‌سازد.
          </p>
        </div>

        <div>
          <label className="block mb-2">خلاصه</label>
          <textarea
            name="excerpt"
            value={form.excerpt}
            onChange={handleChange}
            rows={3}
            className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700"
          />
        </div>

        <div>
          <label className="block mb-2">محتوا</label>
          <textarea
            name="content"
            value={form.content}
            onChange={handleChange}
            rows={8}
            className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700"
            required
          />
        </div>

        <div>
          <label className="block mb-2">کاور</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleCoverChange}
            className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700"
          />
          {coverPreview && (
            <img
              src={coverPreview}
              alt="preview"
              className="mt-4 w-64 h-40 object-cover rounded-lg border border-zinc-700"
            />
          )}
        </div>

        <div>
          <label className="block mb-2">دسته‌بندی</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700"
          >
            <option value="">بدون دسته‌بندی</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-2">تگ‌ها</label>
          <div className="flex flex-wrap gap-2">
            {tagsList.map((tag) => {
              const active = form.tags.includes(tag.id);

              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`px-3 py-2 rounded-lg border ${
                    active
                      ? "bg-white text-black border-white"
                      : "bg-zinc-800 text-white border-zinc-700"
                  }`}
                >
                  {tag.title}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block mb-2">وضعیت</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700"
          >
            <option value="draft">پیش‌نویس</option>
            <option value="published">منتشر شده</option>
          </select>
        </div>

        <div>
          <label className="block mb-2">تاریخ انتشار</label>
          <input
            type="datetime-local"
            name="published_at"
            value={form.published_at}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700"
          />
        </div>

        {error && (
          <div className="p-3 rounded-lg border border-red-500 bg-red-500/10 text-red-300">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-lg bg-white text-black font-bold disabled:opacity-50"
          >
            {loading ? "در حال ثبت..." : "ثبت پست"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/dashboard/posts")}
            className="px-6 py-3 rounded-lg border border-zinc-700 text-white"
          >
            انصراف
          </button>
        </div>
      </form>
    </div>
  );
}
