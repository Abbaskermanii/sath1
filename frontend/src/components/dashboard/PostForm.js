"use client";
import { useEffect, useState } from "react";
import { newsApi } from "@/app/lib/news/newsApi";
import { useRouter } from "next/navigation";

export default function PostForm({ initialData = null, isEdit = false }) {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: initialData?.title || "",
    excerpt: initialData?.excerpt || "",
    content: initialData?.content || "",
    cover: initialData?.cover || "",
    category: initialData?.category?.id || "",
    tags: initialData?.tags?.map((t) => t.id) || [],
    status: initialData?.status || "draft",
    published_at: initialData?.published_at || new Date().toISOString(),
  });

  useEffect(() => {
    newsApi.getCategories().then(setCategories);
    newsApi.getTags().then(setTags);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        await newsApi.updatePost(initialData.slug, form);
      } else {
        await newsApi.createPost(form);
      }
      router.push("/dashboard/posts");
      router.refresh();
    } catch (err) {
      alert("خطا در ذخیره سازی");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 lg:grid-cols-3 gap-6"
    >
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 space-y-4">
          <input
            className="w-full bg-zinc-950 border border-zinc-800 p-3 rounded-xl text-white outline-none focus:border-blue-500"
            placeholder="عنوان مقاله..."
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <textarea
            className="w-full bg-zinc-950 border border-zinc-800 p-3 rounded-xl text-white outline-none h-32"
            placeholder="خلاصه کوتاه..."
            value={form.excerpt}
            onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
          />
          <textarea
            className="w-full bg-zinc-950 border border-zinc-800 p-3 rounded-xl text-white outline-none h-96"
            placeholder="متن کامل مقاله (Markdown یا HTML)..."
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 space-y-4">
          <h3 className="text-white font-bold">تنظیمات انتشار</h3>

          <select
            className="w-full bg-zinc-950 border border-zinc-800 p-2 rounded-lg text-white"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option value="draft">پیش‌نویس</option>
            <option value="published">انتشار عمومی</option>
          </select>

          <div className="space-y-2">
            <label className="text-zinc-400 text-sm">تصویر کاور (URL)</label>
            <input
              className="w-full bg-zinc-950 border border-zinc-800 p-2 rounded-lg text-white text-xs"
              value={form.cover}
              onChange={(e) => setForm({ ...form, cover: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-zinc-400 text-sm">دسته‌بندی</label>
            <select
              className="w-full bg-zinc-950 border border-zinc-800 p-2 rounded-lg text-white"
              value={form.category}
              onChange={(e) =>
                setForm({ ...form, category: parseInt(e.target.value) })
              }
            >
              <option value="">انتخاب کنید</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all disabled:opacity-50"
        >
          {loading
            ? "در حال پردازش..."
            : isEdit
              ? "بروزرسانی نهایی"
              : "انتشار پست جدید"}
        </button>
      </div>
    </form>
  );
}
