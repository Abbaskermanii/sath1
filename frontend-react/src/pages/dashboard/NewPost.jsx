import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/axiosClient";

function normalizeList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

function getItemTitle(item) {
  return item?.title || item?.name || item?.slug || `#${item?.id}`;
}

export default function NewPostPage() {
  const navigate = useNavigate();

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
  });

  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [pageLoading, setPageLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadInitialData() {
      try {
        setPageLoading(true);
        setError("");

        const [categoriesRes, tagsRes] = await Promise.all([
          api.get("/news/categories/"),
          api.get("/news/tags/"),
        ]);

        setCategories(normalizeList(categoriesRes?.data));
        setTagsList(normalizeList(tagsRes?.data));
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
      if (coverPreview) URL.revokeObjectURL(coverPreview);
    };
  }, [coverPreview]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function toggleTag(id) {
    const numericId = Number(id);
    if (!Number.isFinite(numericId)) return;

    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(numericId)
        ? prev.tags.filter((item) => item !== numericId)
        : [...prev.tags, numericId],
    }));
  }

  function handleCoverChange(e) {
    const file = e.target.files?.[0] ?? null;

    if (coverPreview) URL.revokeObjectURL(coverPreview);

    if (!file) {
      setCoverFile(null);
      setCoverPreview("");
      return;
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

    try {
      setLoading(true);

      const fd = new FormData();
      fd.append("title", form.title.trim());
      fd.append("excerpt", form.excerpt.trim());
      fd.append("content", form.content.trim());
      fd.append("status", form.status);

      if (form.slug.trim()) fd.append("slug", form.slug.trim().toLowerCase());
      if (form.category) fd.append("category", String(form.category));

      form.tags.forEach((tagId) => fd.append("tags", String(tagId)));

      if (coverFile) fd.append("cover", coverFile);

      await api.post("/news/posts/", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("پست با موفقیت ایجاد شد.");
      navigate("/dashboard/posts");
    } catch (err) {
      console.error("Create post error:", err);
      const data = err?.response?.data;

      let message = "خطا در ایجاد پست";
      if (typeof data === "string") message = data;
      else if (data?.slug?.[0]) message = data.slug[0];
      else if (data?.title?.[0]) message = data.title[0];
      else if (data?.content?.[0]) message = data.content[0];
      else if (data?.cover?.[0]) message = data.cover[0];
      else if (data?.category?.[0]) message = data.category[0];
      else if (data?.tags?.[0]) message = data.tags[0];
      else if (data?.detail) message = data.detail;
      else if (data && typeof data === "object") message = JSON.stringify(data);
      else if (err?.message) message = err.message;

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  if (pageLoading) {
    return (
      <div className="p-10 text-center text-zinc-500" dir="rtl">
        در حال بارگذاری...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl" dir="rtl">
      <h1 className="text-2xl font-bold">ایجاد پست جدید</h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
      >
        <div>
          <label className="block mb-2 text-sm text-zinc-300">عنوان</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-4 py-3 text-white"
            required
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
            placeholder="مثلاً: my-first-post"
            className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-4 py-3 text-white text-left"
          />
          <p className="text-xs text-zinc-500 mt-2">
            فقط حروف انگلیسی کوچک، عدد و خط تیره. اگر خالی بماند، بک‌اند خودش
            می‌سازد.
          </p>
        </div>

        <div>
          <label className="block mb-2 text-sm text-zinc-300">خلاصه</label>
          <textarea
            name="excerpt"
            value={form.excerpt}
            onChange={handleChange}
            className="w-full min-h-24 rounded-lg bg-zinc-800 border border-zinc-700 px-4 py-3 text-white"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm text-zinc-300">محتوا</label>
          <textarea
            name="content"
            value={form.content}
            onChange={handleChange}
            className="w-full min-h-48 rounded-lg bg-zinc-800 border border-zinc-700 px-4 py-3 text-white"
            required
          />
        </div>

        <div>
          <label className="block mb-2 text-sm text-zinc-300">کاور</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleCoverChange}
            className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-4 py-3 text-white"
          />
          {coverPreview && (
            <img
              src={coverPreview}
              alt="preview"
              className="mt-4 h-40 w-full rounded-lg border border-zinc-700 object-cover"
            />
          )}
          {coverFile && (
            <div className="mt-2 text-xs text-zinc-400">
              فایل انتخاب شد: {coverFile.name}
            </div>
          )}
        </div>

        <div>
          <label className="block mb-2 text-sm text-zinc-300">دسته‌بندی</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-4 py-3 text-white"
          >
            <option value="">بدون دسته‌بندی</option>
            {categories.map((cat) => (
              <option key={cat.id} value={String(cat.id)}>
                {getItemTitle(cat)}
              </option>
            ))}
          </select>
          {!categories.length && (
            <p className="mt-2 text-xs text-zinc-500">
              هیچ دسته‌بندی‌ای دریافت نشد.
            </p>
          )}
        </div>

        <div>
          <label className="block mb-2 text-sm text-zinc-300">تگ‌ها</label>
          <div className="flex flex-wrap gap-2">
            {tagsList.map((tag) => {
              const tagId = Number(tag.id);
              const active = form.tags.includes(tagId);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tagId)}
                  className={`px-3 py-2 rounded-lg border transition ${
                    active
                      ? "bg-white text-black border-white"
                      : "bg-zinc-800 text-white border-zinc-700 hover:border-zinc-500"
                  }`}
                >
                  {getItemTitle(tag)}
                </button>
              );
            })}
          </div>
          {!tagsList.length && (
            <p className="mt-2 text-xs text-zinc-500">هیچ تگی دریافت نشد.</p>
          )}
        </div>

        <div>
          <label className="block mb-2 text-sm text-zinc-300">وضعیت</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-4 py-3 text-white"
          >
            <option value="draft">پیش‌نویس</option>
            <option value="published">منتشر شده</option>
          </select>
        </div>

        {error && (
          <div className="p-3 rounded-lg border border-red-500 bg-red-500/10 text-red-300">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-white text-black px-5 py-2.5 rounded-lg font-bold disabled:opacity-50"
          >
            {loading ? "در حال ثبت..." : "ثبت پست"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/dashboard/posts")}
            className="border border-zinc-700 text-white px-5 py-2.5 rounded-lg"
          >
            انصراف
          </button>
        </div>
      </form>
    </div>
  );
}
