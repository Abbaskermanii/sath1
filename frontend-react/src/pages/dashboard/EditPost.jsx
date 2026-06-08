import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { api } from "../../lib/axiosClient";
import { dashboardApi } from "../../lib/dashboard/dashboardApi";

const MAX_COVER_SIZE_MB = 5;
const MAX_VIDEO_SIZE_MB = 200;
const MAX_AUDIO_SIZE_MB = 50;

const initialForm = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  cover: "",
  category: "",
  status: "draft",
  tags: [],
  post_type: "",
  media_type: "none",
  embed_url: "",
  video_file: "",
  audio_file: "",
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

function getRelationValue(value) {
  if (value === undefined || value === null || value === "") return "";

  if (typeof value === "object") {
    return String(value?.value ?? value?.id ?? "");
  }

  return String(value);
}

function normalizeTags(tags) {
  if (!Array.isArray(tags)) return [];

  return tags
    .map((tag) => {
      if (typeof tag === "object") return tag?.id ?? tag?.value;
      return tag;
    })
    .filter((id) => id !== undefined && id !== null && id !== "")
    .map((id) => Number(id))
    .filter((id) => Number.isFinite(id));
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

export default function EditPostPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [tagsList, setTagsList] = useState([]);
  const [postTypes, setPostTypes] = useState([]);

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [pageError, setPageError] = useState("");

  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState("");

  const [videoFile, setVideoFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);

  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const selectedTagsCount = form.tags.length;

  const canSubmit = useMemo(() => {
    if (saving) return false;
    if (!form.title.trim()) return false;
    if (!form.slug.trim()) return false;
    if (!form.post_type) return false;
    if (!form.tags.length) return false;
    if (!form.cover && !coverFile) return false;
    if (form.media_type === "none" && !form.content.trim()) return false;
    return true;
  }, [form, saving, coverFile]);

  useEffect(() => {
    let mounted = true;

    async function loadPageData() {
      if (!slug || slug === "undefined" || slug === "null") {
        setPageError("اسلاگ پست نامعتبر است.");
        setPageLoading(false);
        return;
      }

      try {
        setPageLoading(true);
        setPageError("");

        const [categoriesRes, tagsRes, postTypesRes, postRes] =
          await Promise.all([
            api.get("/news/categories/"),
            api.get("/news/tags/"),
            api.get("/news/posts/post_types/"),
            dashboardApi.getPostBySlug(slug),
          ]);

        if (!mounted) return;

        const post = postRes?.data ?? postRes;

        setCategories(normalizeList(categoriesRes?.data));
        setTagsList(normalizeList(tagsRes?.data));
        setPostTypes(normalizeList(postTypesRes?.data));

        setForm({
          title: post?.title ?? "",
          slug: post?.slug ?? "",
          excerpt: post?.excerpt ?? "",
          content: post?.content ?? "",
          cover: post?.cover ?? "",
          category: getRelationValue(post?.category),
          status: post?.status ?? "draft",
          tags: normalizeTags(post?.tags),
          post_type: getRelationValue(post?.post_type),
          media_type: post?.media_type ?? "none",
          embed_url: post?.embed_url ?? "",
          video_file: post?.video_file ?? "",
          audio_file: post?.audio_file ?? "",
        });

        setCoverFile(null);
        setCoverPreview("");
        setVideoFile(null);
        setAudioFile(null);
      } catch (error) {
        console.error("Load edit page data error:", error);

        if (!mounted) return;

        const message = getApiErrorMessage(error) || "خطا در بارگذاری اطلاعات";
        setPageError(message);
        toast.error(message);
      } finally {
        if (mounted) setPageLoading(false);
      }
    }

    loadPageData();

    return () => {
      mounted = false;
    };
  }, [slug]);

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

    if (name === "slug") {
      updateForm(name, toSlug(value));
      return;
    }

    if (name === "media_type") {
      setForm((prev) => ({
        ...prev,
        media_type: value,
        embed_url: value === "none" ? "" : prev.embed_url,
        video_file: value === "video" ? prev.video_file : "",
        audio_file: value === "podcast" ? prev.audio_file : "",
      }));

      if (value !== "video") setVideoFile(null);
      if (value !== "podcast") setAudioFile(null);

      setErrors((prev) => {
        const next = { ...prev };
        delete next.media_type;
        delete next.video_file;
        delete next.audio_file;
        delete next.embed_url;
        return next;
      });

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

  function handleVideoChange(event) {
    const file = event.target.files?.[0] ?? null;
    event.target.value = "";

    setVideoFile(null);

    if (!file) return;

    const sizeMb = file.size / 1024 / 1024;
    if (sizeMb > MAX_VIDEO_SIZE_MB) {
      const message = `حجم ویدیو نباید بیشتر از ${MAX_VIDEO_SIZE_MB} مگابایت باشد.`;
      toast.error(message);
      setErrors((prev) => ({ ...prev, video_file: message }));
      return;
    }

    setVideoFile(file);

    setErrors((prev) => {
      const next = { ...prev };
      delete next.video_file;
      delete next.embed_url;
      return next;
    });
  }

  function handleAudioChange(event) {
    const file = event.target.files?.[0] ?? null;
    event.target.value = "";

    setAudioFile(null);

    if (!file) return;

    const sizeMb = file.size / 1024 / 1024;
    if (sizeMb > MAX_AUDIO_SIZE_MB) {
      const message = `حجم فایل صوتی نباید بیشتر از ${MAX_AUDIO_SIZE_MB} مگابایت باشد.`;
      toast.error(message);
      setErrors((prev) => ({ ...prev, audio_file: message }));
      return;
    }

    setAudioFile(file);

    setErrors((prev) => {
      const next = { ...prev };
      delete next.audio_file;
      delete next.embed_url;
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
    if (!form.tags.length) nextErrors.tags = "حداقل یک تگ انتخاب کنید.";

    if (!form.cover && !coverFile) {
      nextErrors.cover = "کاور برای همه پست‌ها الزامی است.";
    }

    if (form.media_type === "none" && !form.content.trim()) {
      nextErrors.content = "محتوا الزامی است.";
    }

    if (form.media_type === "video") {
      const hasCurrentVideo = Boolean(form.video_file);
      const hasNewVideo = Boolean(videoFile);
      const hasEmbed = Boolean(form.embed_url.trim());

      if (!hasCurrentVideo && !hasNewVideo && !hasEmbed) {
        nextErrors.video_file =
          "برای پست ویدیویی، فایل ویدیو یا لینک embed الزامی است.";
      }
    }

    if (form.media_type === "podcast") {
      const hasCurrentAudio = Boolean(form.audio_file);
      const hasNewAudio = Boolean(audioFile);
      const hasEmbed = Boolean(form.embed_url.trim());

      if (!hasCurrentAudio && !hasNewAudio && !hasEmbed) {
        nextErrors.audio_file =
          "برای پادکست، فایل صوتی یا لینک embed الزامی است.";
      }
    }

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
    fd.append("media_type", form.media_type);

    if (form.category) {
      fd.append("category", String(form.category));
    } else {
      fd.append("category", "");
    }

    if (form.embed_url.trim()) {
      fd.append("embed_url", form.embed_url.trim());
    }

    form.tags.forEach((tagId) => {
      fd.append("tags", String(tagId));
    });

    if (coverFile) {
      fd.append("cover", coverFile);
    }

    if (videoFile) {
      fd.append("video_file", videoFile);
    }

    if (audioFile) {
      fd.append("audio_file", audioFile);
    }

    return fd;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (saving) return;

    if (!slug || slug === "undefined" || slug === "null") {
      const message = "اسلاگ پست نامعتبر است.";
      setPageError(message);
      toast.error(message);
      return;
    }

    if (!validateForm()) return;

    const toastId = toast.loading("در حال ذخیره تغییرات...");

    try {
      setSaving(true);
      setPageError("");

      await dashboardApi.updatePost(slug, buildPayload());

      toast.update(toastId, {
        render: "پست با موفقیت بروزرسانی شد.",
        type: "success",
        isLoading: false,
        autoClose: 2500,
        closeOnClick: true,
      });

      navigate("/dashboard/posts");
    } catch (error) {
      console.error("Update post error:", error);

      const apiErrors = mapApiErrors(error);
      setErrors((prev) => ({ ...prev, ...apiErrors }));

      const message = getApiErrorMessage(error) || "خطا در ذخیره تغییرات";
      setPageError(message);

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

  if (pageLoading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center" dir="rtl">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 px-6 py-5 text-center shadow-xl">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-zinc-600 border-t-white" />
          <p className="text-sm text-zinc-400">
            در حال بارگذاری اطلاعات پست...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-10" dir="rtl">
      <div className="flex flex-col gap-3 rounded-3xl border border-zinc-800 bg-gradient-to-l from-zinc-900 to-zinc-950 p-6 shadow-2xl md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">ویرایش پست</h1>
          <p className="mt-1 text-sm text-zinc-400">
            اطلاعات پست را ویرایش کنید و پس از بررسی، تغییرات را ذخیره کنید.
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

      {pageError && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {pageError}
        </div>
      )}

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
            <Label>نوع رسانه</Label>
            <select
              name="media_type"
              value={form.media_type}
              onChange={handleChange}
              className={baseInputClass(errors.media_type)}
            >
              <option value="none">بدون رسانه</option>
              <option value="video">ویدیو</option>
              <option value="podcast">پادکست</option>
            </select>
            <FieldError message={errors.media_type} />
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
            <Label required={form.media_type === "none"}>محتوا</Label>
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

          {(form.media_type === "video" || form.media_type === "podcast") && (
            <div className="md:col-span-2">
              <Label>لینک Embed</Label>
              <input
                type="url"
                name="embed_url"
                value={form.embed_url}
                onChange={handleChange}
                placeholder="https://..."
                dir="ltr"
                className={`${baseInputClass(errors.embed_url)} text-left`}
              />
              <FieldError message={errors.embed_url} />
            </div>
          )}

          {form.media_type === "video" && (
            <div className="md:col-span-2">
              <Label>فایل ویدیو</Label>
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoChange}
                className="block w-full cursor-pointer rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-zinc-300"
              />

              <p className="mt-2 text-xs text-zinc-500">
                حداکثر حجم فایل: {MAX_VIDEO_SIZE_MB}MB
              </p>

              {form.video_file && !videoFile && (
                <div className="mt-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 text-sm text-zinc-300">
                  فایل ویدیوی فعلی موجود است.
                </div>
              )}

              {videoFile && (
                <div className="mt-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 text-sm text-zinc-300">
                  فایل جدید انتخاب شده: {videoFile.name}
                </div>
              )}

              <FieldError message={errors.video_file} />
            </div>
          )}

          {form.media_type === "podcast" && (
            <div className="md:col-span-2">
              <Label>فایل صوتی</Label>
              <input
                type="file"
                accept="audio/*"
                onChange={handleAudioChange}
                className="block w-full cursor-pointer rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-zinc-300"
              />

              <p className="mt-2 text-xs text-zinc-500">
                حداکثر حجم فایل: {MAX_AUDIO_SIZE_MB}MB
              </p>

              {form.audio_file && !audioFile && (
                <div className="mt-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 text-sm text-zinc-300">
                  فایل صوتی فعلی موجود است.
                </div>
              )}

              {audioFile && (
                <div className="mt-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 text-sm text-zinc-300">
                  فایل جدید انتخاب شده: {audioFile.name}
                </div>
              )}

              <FieldError message={errors.audio_file} />
            </div>
          )}

          <div className="md:col-span-2">
            <Label required>کاور</Label>

            <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/50 p-4 transition hover:border-zinc-500">
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
                className="block w-full cursor-pointer rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-zinc-300 file:ml-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-white file:px-4 file:py-2 file:text-sm file:font-bold file:text-black hover:border-zinc-600"
              />

              <p className="mt-2 text-xs text-zinc-500">
                کاور برای همه پست‌ها الزامی است. حداکثر حجم:{" "}
                {MAX_COVER_SIZE_MB}MB
              </p>

              {form.cover && !coverPreview && (
                <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
                  <div className="border-b border-zinc-800 p-3 text-xs text-zinc-400">
                    کاور فعلی:
                  </div>

                  <img
                    src={form.cover}
                    alt="کاور فعلی"
                    className="h-64 w-full object-cover"
                  />
                </div>
              )}

              {coverPreview && (
                <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
                  <img
                    src={coverPreview}
                    alt="پیش‌نمایش کاور جدید"
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
                      حذف کاور جدید
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
              disabled={saving}
              className="rounded-xl border border-zinc-700 px-5 py-3 text-sm font-bold text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              انصراف
            </button>

            <button
              type="submit"
              disabled={!canSubmit}
              className="rounded-xl bg-white px-6 py-3 text-sm font-black text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
