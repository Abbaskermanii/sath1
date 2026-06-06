import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { api } from "../../lib/axiosClient";

const MAX_COVER_SIZE_MB = 5;

const initialForm = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  category: "",
  status: "draft",
  tags: [],
  post_type: "",
};

function normalizeList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.data)) return data.data;

  if (data && typeof data === "object") {
    return Object.entries(data).map(([value, label]) => ({
      value,
      label,
    }));
  }

  return [];
}

function getItemTitle(item) {
  return (
    item?.title ||
    item?.name ||
    item?.label ||
    item?.slug ||
    `#${item?.id ?? "-"}`
  );
}

function getOptionValue(item) {
  return String(item?.value ?? item?.id ?? "");
}

function toSlug(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

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

    return "لطفاً اطلاعات وارد شده را بررسی کنید.";
  }

  return "خطا در انجام عملیات.";
}

function mapApiErrors(error) {
  const data = error?.response?.data;
  const result = {};

  if (!data || typeof data !== "object" || Array.isArray(data)) return result;

  Object.entries(data).forEach(([key, value]) => {
    if (Array.isArray(value)) result[key] = value[0];
    else if (typeof value === "string") result[key] = value;
  });

  return result;
}

function FieldError({ message }) {
  if (!message) return null;

  return <p className="mt-1.5 text-xs text-red-400">{message}</p>;
}

function Label({ children, required }) {
  return (
    <label className="mb-2 block text-sm font-medium text-zinc-300">
      {children}
      {required && <span className="mr-1 text-red-400">*</span>}
    </label>
  );
}

function baseInputClass(hasError) {
  return [
    "w-full rounded-xl border px-4 py-3 text-sm text-white outline-none transition",
    "bg-zinc-900/70 placeholder:text-zinc-600",
    "focus:border-white/60 focus:ring-2 focus:ring-white/10",
    hasError
      ? "border-red-500/70 focus:border-red-400"
      : "border-zinc-700 hover:border-zinc-600",
  ].join(" ");
}

export default function NewPostPage() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [tagsList, setTagsList] = useState([]);
  const [postTypes, setPostTypes] = useState([]);

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState("");

  const [pageLoading, setPageLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const selectedTagsCount = form.tags.length;

  const canSubmit = useMemo(() => {
    return (
      form.title.trim() &&
      form.slug.trim() &&
      form.post_type &&
      form.content.trim() &&
      form.tags.length > 0 &&
      !submitting
    );
  }, [form, submitting]);

  useEffect(() => {
    let mounted = true;

    async function loadInitialData() {
      try {
        setPageLoading(true);

        const [categoriesRes, tagsRes, postTypesRes] = await Promise.all([
          api.get("/news/categories/"),
          api.get("/news/tags/"),
          api.get("/news/posts/post_types/"),
        ]);

        if (!mounted) return;

        setCategories(normalizeList(categoriesRes?.data));
        setTagsList(normalizeList(tagsRes?.data));
        setPostTypes(normalizeList(postTypesRes?.data));
      } catch (error) {
        console.error("Load initial data error:", error);
        toast.error(
          getApiErrorMessage(error) || "خطا در بارگذاری اطلاعات اولیه",
        );
      } finally {
        if (mounted) setPageLoading(false);
      }
    }

    loadInitialData();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (coverPreview) URL.revokeObjectURL(coverPreview);
    };
  }, [coverPreview]);

  function updateForm(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));

    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }

  function handleChange(event) {
    const { name, value } = event.target;

    if (name === "title") {
      setForm((prev) => ({
        ...prev,
        title: value,
        slug: prev.slug ? prev.slug : toSlug(value),
      }));

      setErrors((prev) => {
        const next = { ...prev };
        delete next.title;
        delete next.slug;
        return next;
      });

      return;
    }

    if (name === "slug") {
      updateForm(name, toSlug(value));
      return;
    }

    updateForm(name, value);
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

    setErrors((prev) => {
      if (!prev.tags) return prev;
      const next = { ...prev };
      delete next.tags;
      return next;
    });
  }

  function removeCover() {
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setCoverFile(null);
    setCoverPreview("");

    setErrors((prev) => {
      const next = { ...prev };
      delete next.cover;
      return next;
    });
  }

  function handleCoverChange(event) {
    const file = event.target.files?.[0] ?? null;
    event.target.value = "";

    removeCover();

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      const message = "فقط فایل تصویری مجاز است.";
      toast.error(message);
      setErrors((prev) => ({ ...prev, cover: message }));
      return;
    }

    const sizeMb = file.size / 1024 / 1024;

    if (sizeMb > MAX_COVER_SIZE_MB) {
      const message = `حجم تصویر نباید بیشتر از ${MAX_COVER_SIZE_MB} مگابایت باشد.`;
      toast.error(message);
      setErrors((prev) => ({ ...prev, cover: message }));
      return;
    }

    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));

    setErrors((prev) => {
      const next = { ...prev };
      delete next.cover;
      return next;
    });
  }

  function validateForm() {
    const nextErrors = {};

    if (!form.title.trim()) nextErrors.title = "عنوان الزامی است.";

    if (!form.slug.trim()) {
      nextErrors.slug = "اسلاگ الزامی است.";
    } else if (!/^[a-z0-9_-]+(?:-[a-z0-9_-]+)*$/.test(form.slug.trim())) {
      nextErrors.slug =
        "اسلاگ فقط می‌تواند شامل حروف انگلیسی، عدد، خط تیره یا آندرلاین باشد.";
    }

    if (!form.post_type) nextErrors.post_type = "قالب پست الزامی است.";
    if (!form.content.trim()) nextErrors.content = "محتوا الزامی است.";
    if (!form.tags.length) nextErrors.tags = "حداقل یک تگ انتخاب کنید.";

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      toast.error("لطفاً خطاهای فرم را اصلاح کنید.");
      return false;
    }

    return true;
  }

  function buildPayload() {
    const fd = new FormData();

    fd.append("title", form.title.trim());
    fd.append("slug", toSlug(form.slug));
    fd.append("excerpt", form.excerpt.trim());
    fd.append("content", form.content.trim());
    fd.append("status", form.status);
    fd.append("post_type", form.post_type);

    if (form.category) fd.append("category", String(form.category));

    form.tags.forEach((tagId) => fd.append("tags", String(tagId)));

    if (coverFile) fd.append("cover", coverFile);

    return fd;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (submitting) return;
    if (!validateForm()) return;

    const toastId = toast.loading("در حال ایجاد پست...");

    try {
      setSubmitting(true);

      await api.post("/news/posts/", buildPayload(), {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.update(toastId, {
        render: "پست با موفقیت ایجاد شد.",
        type: "success",
        isLoading: false,
        autoClose: 2500,
        closeOnClick: true,
      });

      navigate("/dashboard/posts");
    } catch (error) {
      console.error("Create post error:", error);

      const apiErrors = mapApiErrors(error);
      setErrors((prev) => ({ ...prev, ...apiErrors }));

      toast.update(toastId, {
        render: getApiErrorMessage(error) || "خطا در ایجاد پست",
        type: "error",
        isLoading: false,
        autoClose: 4500,
        closeOnClick: true,
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (pageLoading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center" dir="rtl">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 px-6 py-5 text-center shadow-xl">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-zinc-600 border-t-white" />
          <p className="text-sm text-zinc-400">در حال بارگذاری اطلاعات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-10" dir="rtl">
      <div className="flex flex-col gap-3 rounded-3xl border border-zinc-800 bg-gradient-to-l from-zinc-900 to-zinc-950 p-6 shadow-2xl md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">ایجاد پست جدید</h1>
          <p className="mt-1 text-sm text-zinc-400">
            اطلاعات پست را وارد کنید و پس از بررسی، آن را ذخیره کنید.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/dashboard/posts")}
          className="rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-900"
        >
          بازگشت به لیست پست‌ها
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 shadow-2xl"
      >
        <div className="grid gap-6 p-5 md:grid-cols-2 md:p-7">
          <div className="space-y-5 md:col-span-2">
            <div>
              <Label required>عنوان</Label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="مثلاً: معرفی قابلیت‌های جدید سایت"
                className={baseInputClass(errors.title)}
                autoFocus
              />
              <FieldError message={errors.title} />
            </div>

            <div>
              <Label required>اسلاگ</Label>
              <input
                type="text"
                name="slug"
                value={form.slug}
                onChange={handleChange}
                dir="ltr"
                placeholder="my-first-post"
                className={`${baseInputClass(errors.slug)} text-left`}
              />
              <p className="mt-1.5 text-xs text-zinc-500">
                آدرس یکتا برای پست؛ بهتر است کوتاه و انگلیسی باشد.
              </p>
              <FieldError message={errors.slug} />
            </div>
          </div>

          <div>
            <Label required>قالب پست</Label>
            <select
              name="post_type"
              value={form.post_type}
              onChange={handleChange}
              className={baseInputClass(errors.post_type)}
            >
              <option value="">انتخاب قالب...</option>
              {postTypes.map((item) => (
                <option key={getOptionValue(item)} value={getOptionValue(item)}>
                  {getItemTitle(item)}
                </option>
              ))}
            </select>
            {!postTypes.length && (
              <p className="mt-1.5 text-xs text-amber-400">
                هیچ قالبی از سرور دریافت نشد.
              </p>
            )}
            <FieldError message={errors.post_type} />
          </div>

          <div>
            <Label>دسته‌بندی</Label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className={baseInputClass(errors.category)}
            >
              <option value="">بدون دسته‌بندی</option>
              {categories.map((cat) => (
                <option key={cat.id} value={String(cat.id)}>
                  {getItemTitle(cat)}
                </option>
              ))}
            </select>
            <FieldError message={errors.category} />
          </div>

          <div>
            <Label>وضعیت</Label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className={baseInputClass(errors.status)}
            >
              <option value="draft">پیش‌نویس</option>
              <option value="published">منتشر شده</option>
            </select>
            <FieldError message={errors.status} />
          </div>

          <div className="md:col-span-2">
            <Label>خلاصه</Label>
            <textarea
              name="excerpt"
              value={form.excerpt}
              onChange={handleChange}
              placeholder="خلاصه‌ای کوتاه برای نمایش در کارت خبر..."
              className={`${baseInputClass(errors.excerpt)} min-h-24 resize-y leading-7`}
            />
            <div className="mt-1.5 flex justify-between text-xs text-zinc-500">
              <FieldError message={errors.excerpt} />
              <span>{form.excerpt.length} کاراکتر</span>
            </div>
          </div>

          <div className="md:col-span-2">
            <Label required>محتوا</Label>
            <textarea
              name="content"
              value={form.content}
              onChange={handleChange}
              placeholder="متن کامل پست را وارد کنید..."
              className={`${baseInputClass(errors.content)} min-h-56 resize-y leading-8`}
            />
            <div className="mt-1.5 flex justify-between text-xs text-zinc-500">
              <FieldError message={errors.content} />
              <span>{form.content.length} کاراکتر</span>
            </div>
          </div>

          <div className="md:col-span-2">
            <Label>کاور</Label>

            <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/50 p-4 transition hover:border-zinc-500">
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
                className="block w-full cursor-pointer rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-zinc-300 file:ml-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-white file:px-4 file:py-2 file:text-sm file:font-bold file:text-black hover:border-zinc-600"
              />

              <p className="mt-2 text-xs text-zinc-500">
                فرمت تصویر مجاز است. حداکثر حجم: {MAX_COVER_SIZE_MB}MB
              </p>

              {coverPreview && (
                <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
                  <img
                    src={coverPreview}
                    alt="پیش‌نمایش کاور"
                    className="h-64 w-full object-cover"
                  />

                  <div className="flex flex-col gap-2 border-t border-zinc-800 p-3 text-xs text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
                    <span className="truncate">
                      فایل انتخاب شده: {coverFile?.name}
                    </span>

                    <button
                      type="button"
                      onClick={removeCover}
                      className="rounded-lg border border-red-500/40 px-3 py-2 text-red-300 transition hover:bg-red-500/10"
                    >
                      حذف کاور
                    </button>
                  </div>
                </div>
              )}

              <FieldError message={errors.cover} />
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="mb-2 flex items-center justify-between">
              <Label required>تگ‌ها</Label>
              <span className="text-xs text-zinc-500">
                {selectedTagsCount} تگ انتخاب شده
              </span>
            </div>

            {tagsList.length ? (
              <div className="flex flex-wrap gap-2 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-3">
                {tagsList.map((tag) => {
                  const tagId = Number(tag.id);
                  const active = form.tags.includes(tagId);

                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tagId)}
                      className={[
                        "rounded-xl border px-3 py-2 text-sm transition",
                        active
                          ? "border-white bg-white text-black shadow-lg shadow-white/10"
                          : "border-zinc-700 bg-zinc-900 text-zinc-200 hover:border-zinc-500 hover:bg-zinc-800",
                      ].join(" ")}
                    >
                      {getItemTitle(tag)}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-300">
                هیچ تگی از سرور دریافت نشد.
              </div>
            )}

            <FieldError message={errors.tags} />
          </div>
        </div>

        <div className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-zinc-800 bg-zinc-950/95 p-5 backdrop-blur md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-zinc-500">
            فیلدهای ستاره‌دار الزامی هستند.
          </p>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate("/dashboard/posts")}
              disabled={submitting}
              className="rounded-xl border border-zinc-700 px-5 py-3 text-sm font-bold text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              انصراف
            </button>

            <button
              type="submit"
              disabled={!canSubmit}
              className="rounded-xl bg-white px-6 py-3 text-sm font-black text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "در حال ثبت..." : "ثبت پست"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
