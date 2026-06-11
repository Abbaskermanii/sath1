import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import AdminGuard from "../../lib/AdminGuard";
import { api } from "../../lib/axiosClient";

const AD_SLOTS = [
  { value: "home_medium_news", label: "خبرهای میانی صفحه اصلی" },
  { value: "home_sidebar", label: "سایدبار صفحه اصلی" },
  { value: "home_bottom", label: "پایین صفحه اصلی" },
];

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
  if (Array.isArray(data.non_field_errors)) return data.non_field_errors[0];

  if (typeof data === "object") {
    const firstKey = Object.keys(data)[0];
    const firstValue = data[firstKey];

    if (Array.isArray(firstValue)) return firstValue[0];
    if (typeof firstValue === "string") return firstValue;
  }

  return fallback;
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

const inputClass =
  "w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-600/40";

const emptyForm = {
  title: "",
  description: "",
  label: "تبلیغ",
  button_text: "مشاهده",
  href: "",
  slot: "home_medium_news",
  is_active: true,
};

function AdsPageContent() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [currentImageUrl, setCurrentImageUrl] = useState("");

  const totalAds = useMemo(() => ads.length, [ads]);
  const activeAds = useMemo(
    () => ads.filter((item) => item?.is_active).length,
    [ads],
  );

  async function loadAds(showLoading = true) {
    try {
      if (showLoading) setLoading(true);
      setError("");

      const res = await api.get("/marketing/ads/");
      setAds(normalizeList(res?.data));
    } catch (err) {
      console.error("loadAds error:", err);
      const message = getApiErrorMessage(err, "خطا در دریافت تبلیغات");
      setError(message);
      toast.error(message);
      setAds([]);
    } finally {
      if (showLoading) setLoading(false);
    }
  }

  useEffect(() => {
    loadAds();
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) {
        window.URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setFieldErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  }

  function handleImageChange(e) {
    const file = e.target.files?.[0] || null;

    if (previewUrl?.startsWith("blob:")) {
      window.URL.revokeObjectURL(previewUrl);
    }

    setImageFile(file);
    setFieldErrors((prev) => ({ ...prev, image: "" }));

    if (file) {
      const objectUrl = window.URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    } else {
      setPreviewUrl("");
    }
  }

  function resetForm() {
    if (previewUrl?.startsWith("blob:")) {
      window.URL.revokeObjectURL(previewUrl);
    }

    setForm(emptyForm);
    setEditingId(null);
    setError("");
    setFieldErrors({});
    setImageFile(null);
    setPreviewUrl("");
    setCurrentImageUrl("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    const nextErrors = {};
    const trimmedTitle = form.title.trim();
    const trimmedHref = form.href.trim();

    if (!trimmedTitle) nextErrors.title = "عنوان تبلیغ الزامی است.";
    if (!trimmedHref) nextErrors.href = "لینک مقصد الزامی است.";
    if (!form.slot) nextErrors.slot = "جایگاه تبلیغ الزامی است.";
    if (!editingId && !imageFile) nextErrors.image = "انتخاب تصویر الزامی است.";

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    const formData = new FormData();
    formData.append("title", trimmedTitle);
    formData.append("description", form.description.trim());
    formData.append("label", form.label.trim());
    formData.append("button_text", form.button_text.trim());
    formData.append("href", trimmedHref);
    formData.append("slot", form.slot);
    formData.append("is_active", form.is_active ? "true" : "false");

    if (imageFile) {
      formData.append("image", imageFile);
    }

    const isEditing = !!editingId;

    const toastId = toast.loading(
      isEditing ? "در حال ذخیره تغییرات..." : "در حال ایجاد تبلیغ...",
    );

    try {
      setSaving(true);

      if (isEditing) {
        await api.patch(`/marketing/ads/${editingId}/`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        await api.post("/marketing/ads/", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }

      resetForm();
      await loadAds(false);

      toast.update(toastId, {
        render: isEditing
          ? "تبلیغ با موفقیت ویرایش شد."
          : "تبلیغ با موفقیت ایجاد شد.",
        type: "success",
        isLoading: false,
        autoClose: 2500,
        closeOnClick: true,
      });
    } catch (err) {
      console.error("save ad error:", err);

      const data = err?.response?.data || {};
      const nextFieldErrors = {
        title: Array.isArray(data?.title) ? data.title[0] : "",
        description: Array.isArray(data?.description)
          ? data.description[0]
          : "",
        image: Array.isArray(data?.image) ? data.image[0] : "",
        label: Array.isArray(data?.label) ? data.label[0] : "",
        button_text: Array.isArray(data?.button_text)
          ? data.button_text[0]
          : "",
        href: Array.isArray(data?.href) ? data.href[0] : "",
        slot: Array.isArray(data?.slot) ? data.slot[0] : "",
        is_active: Array.isArray(data?.is_active) ? data.is_active[0] : "",
      };

      setFieldErrors(nextFieldErrors);

      const message = getApiErrorMessage(err, "ذخیره تبلیغ انجام نشد.");
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

  function handleEdit(ad) {
    if (previewUrl?.startsWith("blob:")) {
      window.URL.revokeObjectURL(previewUrl);
    }

    setForm({
      title: ad?.title ?? "",
      description: ad?.description ?? "",
      label: ad?.label ?? "تبلیغ",
      button_text: ad?.button_text ?? "مشاهده",
      href: ad?.href ?? "",
      slot: ad?.slot ?? "home_medium_news",
      is_active: !!ad?.is_active,
    });

    setEditingId(ad?.id ?? null);
    setImageFile(null);
    setPreviewUrl("");
    setCurrentImageUrl(ad?.image_url || ad?.image || "");
    setError("");
    setFieldErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function confirmDelete(ad) {
    toast(
      ({ closeToast }) => (
        <div dir="rtl" className="space-y-4">
          <div>
            <p className="font-bold text-white">حذف تبلیغ</p>
            <p className="mt-1 text-sm text-zinc-300">
              آیا از حذف تبلیغ «{ad?.title || "بدون عنوان"}» مطمئن هستید؟
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={async () => {
                closeToast();
                await handleDelete(ad);
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

  async function handleDelete(ad) {
    const id = ad?.id;

    if (!id) {
      toast.error("شناسه تبلیغ پیدا نشد.");
      return;
    }

    const toastId = toast.loading("در حال حذف تبلیغ...");

    try {
      setDeletingId(id);
      setError("");

      await api.delete(`/marketing/ads/${id}/`);
      setAds((prev) => prev.filter((item) => item?.id !== id));

      if (editingId === id) {
        resetForm();
      }

      toast.update(toastId, {
        render: "تبلیغ با موفقیت حذف شد.",
        type: "success",
        isLoading: false,
        autoClose: 2500,
        closeOnClick: true,
      });
    } catch (err) {
      console.error("delete ad error:", err);

      const message = getApiErrorMessage(err, "حذف تبلیغ انجام نشد.");
      setError(message);

      toast.update(toastId, {
        render: message,
        type: "error",
        isLoading: false,
        autoClose: 4500,
        closeOnClick: true,
      });
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-10 px-4 sm:px-0" dir="rtl">
      <div className="flex flex-col gap-4 rounded-3xl border border-zinc-800 bg-gradient-to-l from-zinc-900 to-zinc-950 p-6 shadow-2xl md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">مدیریت تبلیغات</h1>
          <p className="mt-1 text-sm text-zinc-400">
            ایجاد، ویرایش و حذف جایگاه‌های تبلیغاتی سایت
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadAds()}
          disabled={loading}
          className="rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-bold text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "در حال بروزرسانی..." : "بروزرسانی"}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
          <p className="text-sm text-zinc-500">کل تبلیغات</p>
          <p className="mt-2 text-2xl font-black text-white">{totalAds}</p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
          <p className="text-sm text-zinc-500">تبلیغات فعال</p>
          <p className="mt-2 text-2xl font-black text-green-400">{activeAds}</p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
          <p className="text-sm text-zinc-500">تبلیغات غیرفعال</p>
          <p className="mt-2 text-2xl font-black text-red-400">
            {totalAds - activeAds}
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-lg font-black text-white">
            {editingId ? "ویرایش تبلیغ" : "ایجاد تبلیغ جدید"}
          </h2>

          {editingId && (
            <span className="self-start sm:self-auto rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-300">
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
              placeholder="مثلاً: تبلیغ ویژه"
            />
            <FieldError message={fieldErrors.title} />
          </div>

          <div>
            <Label>جایگاه تبلیغ</Label>
            <select
              name="slot"
              value={form.slot}
              onChange={handleChange}
              className={inputClass}
            >
              {AD_SLOTS.map((slot) => (
                <option key={slot.value} value={slot.value}>
                  {slot.label}
                </option>
              ))}
            </select>
            <FieldError message={fieldErrors.slot} />
          </div>
        </div>

        <div>
          <Label>توضیحات</Label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            className={inputClass}
            placeholder="توضیحات تبلیغ"
          />
          <FieldError message={fieldErrors.description} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>تصویر تبلیغ</Label>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleImageChange}
              className={`${inputClass} w-full file:ml-3 file:rounded-lg file:border-0 file:bg-white file:px-3 file:py-2 file:text-sm file:font-bold file:text-black hover:file:bg-zinc-200`}
            />
            <FieldError message={fieldErrors.image} />

            {(previewUrl || currentImageUrl) && (
              <div className="mt-4">
                <p className="mb-2 text-xs text-zinc-400">
                  {previewUrl ? "پیش‌نمایش تصویر جدید" : "تصویر فعلی"}
                </p>
                <img
                  src={previewUrl || currentImageUrl}
                  alt="preview"
                  className="h-32 w-full rounded-2xl border border-zinc-800 object-cover md:w-72"
                />
              </div>
            )}
          </div>

          <div>
            <Label>لینک مقصد</Label>
            <input
              type="text"
              name="href"
              dir="ltr"
              value={form.href}
              onChange={handleChange}
              className={`${inputClass} text-left`}
              placeholder="https://example.com"
            />
            <FieldError message={fieldErrors.href} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>لیبل</Label>
            <input
              type="text"
              name="label"
              value={form.label}
              onChange={handleChange}
              className={inputClass}
              placeholder="مثلاً: تبلیغ"
            />
            <FieldError message={fieldErrors.label} />
          </div>

          <div>
            <Label>متن دکمه</Label>
            <input
              type="text"
              name="button_text"
              value={form.button_text}
              onChange={handleChange}
              className={inputClass}
              placeholder="مثلاً: مشاهده"
            />
            <FieldError message={fieldErrors.button_text} />
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 px-4 py-4">
          <input
            id="is_active"
            type="checkbox"
            name="is_active"
            checked={form.is_active}
            onChange={handleChange}
            className="h-4 w-4 rounded border-zinc-700 bg-zinc-800"
          />
          <label
            htmlFor="is_active"
            className="cursor-pointer text-sm font-medium text-white"
          >
            این تبلیغ فعال باشد
          </label>
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
            className="rounded-xl bg-white px-5 py-3 sm:py-2.5 text-sm font-black text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? "در حال ذخیره..."
              : editingId
                ? "ذخیره تغییرات"
                : "ایجاد تبلیغ"}
          </button>

          {(editingId || imageFile || previewUrl || currentImageUrl) && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl border border-zinc-700 px-5 py-3 sm:py-2.5 text-sm font-bold text-white transition hover:bg-zinc-900"
            >
              انصراف
            </button>
          )}
        </div>
      </form>

      <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-4 sm:p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-black text-white">لیست تبلیغات</h2>
          <span className="text-sm text-zinc-500">{totalAds} مورد</span>
        </div>

        {loading ? (
          <div className="flex min-h-[220px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-zinc-600 border-t-white" />
              <p className="text-sm text-zinc-400">
                در حال بارگذاری تبلیغات...
              </p>
            </div>
          </div>
        ) : ads.length === 0 ? (
          <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/40 p-6 sm:p-10 text-center">
            <div>
              <p className="text-lg font-bold text-white">
                هنوز تبلیغی ثبت نشده است
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                از فرم بالا اولین تبلیغ خود را ایجاد کنید.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* نمایش در موبایل به صورت کارت‌های زیر هم */}
            <div className="flex flex-col gap-4 lg:hidden">
              {ads.map((ad) => {
                const isDeleting = deletingId === ad?.id;
                const slotLabel =
                  AD_SLOTS.find((item) => item.value === ad?.slot)?.label ||
                  ad?.slot ||
                  "-";
                const imageSrc = ad?.image_url || ad?.image || "";

                return (
                  <div
                    key={ad?.id}
                    className="flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/30 p-4"
                  >
                    <div className="flex gap-4">
                      {imageSrc ? (
                        <img
                          src={imageSrc}
                          alt={ad?.title || "ad"}
                          className="h-16 w-24 rounded-xl border border-zinc-800 object-cover shrink-0"
                        />
                      ) : (
                        <div className="flex h-16 w-24 shrink-0 items-center justify-center rounded-xl border border-dashed border-zinc-700 text-xs text-zinc-500">
                          بدون تصویر
                        </div>
                      )}

                      <div className="flex flex-col justify-between overflow-hidden">
                        <p className="font-bold text-white truncate">
                          {ad?.title || "-"}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          {ad?.label && (
                            <span className="inline-flex rounded-md border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-300">
                              {ad.label}
                            </span>
                          )}
                          <span
                            className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                              ad?.is_active
                                ? "border-green-500/20 bg-green-500/10 text-green-400"
                                : "border-red-500/20 bg-red-500/10 text-red-400"
                            }`}
                          >
                            {ad?.is_active ? "فعال" : "غیرفعال"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs sm:text-sm text-zinc-400 bg-zinc-950/50 p-3 rounded-xl border border-zinc-800/50">
                      <p className="flex justify-between">
                        <span className="text-zinc-500">جایگاه:</span>{" "}
                        <span>{slotLabel}</span>
                      </p>
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-zinc-500 whitespace-nowrap">
                          لینک:
                        </span>
                        <a
                          href={ad?.href || "#"}
                          target="_blank"
                          rel="noreferrer"
                          dir="ltr"
                          className="truncate text-blue-400 hover:text-blue-300 text-left"
                        >
                          {ad?.href || "-"}
                        </a>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-zinc-800/50">
                      <button
                        type="button"
                        onClick={() => handleEdit(ad)}
                        className="flex-1 rounded-lg border border-zinc-700 py-2.5 text-xs font-bold text-white transition hover:bg-zinc-800"
                      >
                        ویرایش
                      </button>

                      <button
                        type="button"
                        onClick={() => confirmDelete(ad)}
                        disabled={isDeleting}
                        className="flex-1 rounded-lg border border-red-500/30 py-2.5 text-xs font-bold text-red-300 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isDeleting ? "در حال حذف..." : "حذف"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* نمایش در دسکتاپ به صورت جدول اصلی */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full min-w-[1100px] text-right text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400">
                    <th className="px-2 py-3 font-medium">تصویر</th>
                    <th className="px-2 py-3 font-medium">عنوان</th>
                    <th className="px-2 py-3 font-medium">جایگاه</th>
                    <th className="px-2 py-3 font-medium">لینک</th>
                    <th className="px-2 py-3 font-medium">وضعیت</th>
                    <th className="px-2 py-3 font-medium">عملیات</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-zinc-800/70">
                  {ads.map((ad) => {
                    const isDeleting = deletingId === ad?.id;
                    const slotLabel =
                      AD_SLOTS.find((item) => item.value === ad?.slot)?.label ||
                      ad?.slot ||
                      "-";

                    const imageSrc = ad?.image_url || ad?.image || "";

                    return (
                      <tr
                        key={ad?.id}
                        className="transition hover:bg-zinc-900/70"
                      >
                        <td className="px-2 py-4">
                          {imageSrc ? (
                            <img
                              src={imageSrc}
                              alt={ad?.title || "ad"}
                              className="h-16 w-24 rounded-xl border border-zinc-800 object-cover"
                            />
                          ) : (
                            <div className="flex h-16 w-24 items-center justify-center rounded-xl border border-dashed border-zinc-700 text-xs text-zinc-500">
                              بدون تصویر
                            </div>
                          )}
                        </td>

                        <td className="px-2 py-4 text-white">
                          <div className="space-y-1">
                            <p className="font-bold">{ad?.title || "-"}</p>
                            {ad?.label ? (
                              <span className="inline-flex rounded-lg border border-zinc-700 bg-zinc-800 px-2 py-1 text-[11px] text-zinc-300">
                                {ad.label}
                              </span>
                            ) : null}
                          </div>
                        </td>

                        <td className="px-2 py-4 text-zinc-300">{slotLabel}</td>

                        <td className="px-2 py-4 text-zinc-400" dir="ltr">
                          <a
                            href={ad?.href || "#"}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-block max-w-[280px] truncate text-blue-400 hover:text-blue-300"
                          >
                            {ad?.href || "-"}
                          </a>
                        </td>

                        <td className="px-2 py-4">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${
                              ad?.is_active
                                ? "border-green-500/20 bg-green-500/10 text-green-400"
                                : "border-red-500/20 bg-red-500/10 text-red-400"
                            }`}
                          >
                            {ad?.is_active ? "فعال" : "غیرفعال"}
                          </span>
                        </td>

                        <td className="px-2 py-4">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleEdit(ad)}
                              className="rounded-lg border border-zinc-700 px-3 py-2 text-xs font-bold text-white transition hover:bg-zinc-800"
                            >
                              ویرایش
                            </button>

                            <button
                              type="button"
                              onClick={() => confirmDelete(ad)}
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
          </>
        )}
      </div>
    </div>
  );
}

export default function AdsPage() {
  return (
    <AdminGuard>
      <AdsPageContent />
    </AdminGuard>
  );
}
