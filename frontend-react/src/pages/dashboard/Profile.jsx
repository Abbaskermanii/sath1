import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../../lib/axiosClient";

const MAX_IMAGE_SIZE_MB = 3;

const initialForm = {
  full_name: "",
  bio: "",
  about: "",
  country: "",
  instagram: "",
  telegram: "",
  twitter: "",
  linkedin: "",
  website: "",
};

const inputClass =
  "w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-600/40";

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

function AccountInfo({ title, value, dir = "rtl" }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
      <div className="mb-1 text-xs text-zinc-500">{title}</div>
      <div className="break-all text-sm font-bold text-white" dir={dir}>
        {value || "-"}
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-10" dir="rtl">
      <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
        <div className="h-7 w-36 animate-pulse rounded bg-zinc-800" />
        <div className="mt-3 h-4 w-64 animate-pulse rounded bg-zinc-800" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-2xl border border-zinc-800 bg-zinc-950"
          />
        ))}
      </div>

      <div className="h-96 animate-pulse rounded-3xl border border-zinc-800 bg-zinc-950" />
    </div>
  );
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const [account, setAccount] = useState(null);
  const [currentImage, setCurrentImage] = useState("");

  const [form, setForm] = useState(initialForm);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  async function loadMe(showLoading = true) {
    try {
      if (showLoading) setLoading(true);

      setError("");
      setFieldErrors({});

      const res = await api.get("/accounts/me/");
      const user = res?.data;
      const profile = user?.profile || {};

      setAccount(user);
      setCurrentImage(profile.image ?? "");

      setForm({
        full_name: profile.full_name ?? user?.full_name ?? "",
        bio: profile.bio ?? "",
        about: profile.about ?? "",
        country: profile.country ?? "",
        instagram: profile.instagram ?? "",
        telegram: profile.telegram ?? "",
        twitter: profile.twitter ?? "",
        linkedin: profile.linkedin ?? "",
        website: profile.website ?? "",
      });
    } catch (err) {
      console.error("load profile error:", err);

      const message = getApiErrorMessage(err, "خطا در دریافت اطلاعات پروفایل");
      setError(message);
      toast.error(message);
    } finally {
      if (showLoading) setLoading(false);
    }
  }

  useEffect(() => {
    loadMe();
  }, []);

  useEffect(() => {
    if (!imageFile) {
      setImagePreview("");
      return;
    }

    const objectUrl = URL.createObjectURL(imageFile);
    setImagePreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile]);

  const previewSrc = useMemo(() => {
    return imagePreview || currentImage || "";
  }, [imagePreview, currentImage]);

  const canSubmit = useMemo(() => {
    return !saving && !loading;
  }, [saving, loading]);

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setFieldErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setError("");
  }

  function validateImage(file) {
    if (!file) return "";

    if (!file.type?.startsWith("image/")) {
      return "فقط فایل تصویری مجاز است.";
    }

    const maxSize = MAX_IMAGE_SIZE_MB * 1024 * 1024;

    if (file.size > maxSize) {
      return `حجم تصویر نباید بیشتر از ${MAX_IMAGE_SIZE_MB} مگابایت باشد.`;
    }

    return "";
  }

  function handleImageChange(e) {
    const file = e.target.files?.[0];

    if (!file) return;

    const message = validateImage(file);

    if (message) {
      toast.error(message);
      setFieldErrors((prev) => ({
        ...prev,
        image: message,
      }));
      e.target.value = "";
      return;
    }

    setImageFile(file);
    setFieldErrors((prev) => ({
      ...prev,
      image: "",
    }));
    setError("");
  }

  function handleRemoveSelectedImage() {
    setImageFile(null);
    setImagePreview("");

    setFieldErrors((prev) => ({
      ...prev,
      image: "",
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setFieldErrors({});

    const imageError = validateImage(imageFile);

    if (imageError) {
      setFieldErrors({ image: imageError });
      toast.error(imageError);
      return;
    }

    const toastId = toast.loading("در حال ذخیره تغییرات پروفایل...");

    try {
      setSaving(true);

      const formData = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value || "");
      });

      if (imageFile) {
        formData.append("image", imageFile);
      }

      await api.patch("/accounts/me/profile/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setImageFile(null);
      await loadMe(false);

      toast.update(toastId, {
        render: "پروفایل با موفقیت به‌روزرسانی شد.",
        type: "success",
        isLoading: false,
        autoClose: 2500,
        closeOnClick: true,
      });
    } catch (err) {
      console.error("update profile error:", err);

      const nextFieldErrors = mapApiErrors(err);
      const message = getApiErrorMessage(err, "به‌روزرسانی پروفایل انجام نشد.");

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

  if (loading) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-10" dir="rtl">
      <section className="flex flex-col gap-4 rounded-3xl border border-zinc-800 bg-gradient-to-l from-zinc-900 to-zinc-950 p-6 shadow-2xl md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">پروفایل من</h1>

          <p className="mt-2 text-sm leading-6 text-zinc-400">
            مشاهده و ویرایش اطلاعات حساب کاربری و پروفایل عمومی شما.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadMe()}
          disabled={loading || saving}
          className="rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-bold text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
          بروزرسانی اطلاعات
        </button>
      </section>

      <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-white">اطلاعات حساب</h2>
            <p className="mt-1 text-sm text-zinc-500">
              این اطلاعات از حساب کاربری شما دریافت شده‌اند.
            </p>
          </div>

          <span className="rounded-xl border border-green-500/20 bg-green-500/10 px-3 py-1.5 text-xs font-bold text-green-300">
            فعال
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <AccountInfo title="نام کاربری" value={account?.username} dir="ltr" />

          <AccountInfo title="ایمیل" value={account?.email} dir="ltr" />

          <AccountInfo title="نقش" value={account?.role} />

          <AccountInfo
            title="سطح دسترسی"
            value={
              account?.is_superuser
                ? "Superuser"
                : account?.is_staff
                  ? "Staff"
                  : "User"
            }
            dir="ltr"
          />
        </div>
      </section>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl"
      >
        <div>
          <h2 className="text-lg font-black text-white">ویرایش پروفایل</h2>
          <p className="mt-1 text-sm text-zinc-500">
            اطلاعات نمایشی، تصویر پروفایل و شبکه‌های اجتماعی خود را ویرایش کنید.
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
          <Label>تصویر پروفایل</Label>

          <div className="flex flex-col gap-5 md:flex-row md:items-start">
            <div className="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-zinc-700 bg-zinc-800">
              {previewSrc ? (
                <img
                  src={previewSrc}
                  alt="profile preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-xs text-zinc-500">بدون تصویر</span>
              )}
            </div>

            <div className="flex-1 space-y-3">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={saving}
                className="block w-full text-sm text-zinc-300 file:ml-4 file:rounded-xl file:border-0 file:bg-white file:px-4 file:py-2.5 file:text-sm file:font-black file:text-black hover:file:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
              />

              <p className="text-xs leading-6 text-zinc-500">
                فرمت‌های تصویری مجاز هستند. حداکثر حجم مجاز{" "}
                {MAX_IMAGE_SIZE_MB} مگابایت است.
              </p>

              {imageFile && (
                <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm text-zinc-300">
                  فایل انتخاب‌شده:{" "}
                  <span className="text-white" dir="ltr">
                    {imageFile.name}
                  </span>
                </div>
              )}

              <FieldError message={fieldErrors.image} />

              {imageFile && (
                <button
                  type="button"
                  onClick={handleRemoveSelectedImage}
                  disabled={saving}
                  className="rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  حذف فایل انتخاب‌شده
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <Label>نام کامل</Label>
            <input
              type="text"
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              className={inputClass}
              placeholder="نام و نام خانوادگی"
            />
            <FieldError message={fieldErrors.full_name} />
          </div>

          <div>
            <Label>کشور</Label>
            <input
              type="text"
              name="country"
              value={form.country}
              onChange={handleChange}
              className={inputClass}
              placeholder="مثلاً: ایران"
            />
            <FieldError message={fieldErrors.country} />
          </div>
        </div>

        <div>
          <Label>بیو</Label>
          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            rows={3}
            className={`${inputClass} resize-y leading-7`}
            placeholder="توضیح کوتاه درباره شما"
          />
          <FieldError message={fieldErrors.bio} />
        </div>

        <div>
          <Label>درباره من</Label>
          <textarea
            name="about"
            value={form.about}
            onChange={handleChange}
            rows={6}
            className={`${inputClass} resize-y leading-7`}
            placeholder="توضیح کامل‌تر درباره شما"
          />
          <FieldError message={fieldErrors.about} />
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
          <h3 className="text-base font-black text-white">شبکه‌های اجتماعی</h3>
          <p className="mt-1 text-sm text-zinc-500">
            نام کاربری یا لینک کامل حساب‌های خود را وارد کنید.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div>
              <Label>Instagram</Label>
              <input
                type="text"
                name="instagram"
                value={form.instagram}
                onChange={handleChange}
                dir="ltr"
                className={`${inputClass} text-left`}
                placeholder="instagram username or link"
              />
              <FieldError message={fieldErrors.instagram} />
            </div>

            <div>
              <Label>Telegram</Label>
              <input
                type="text"
                name="telegram"
                value={form.telegram}
                onChange={handleChange}
                dir="ltr"
                className={`${inputClass} text-left`}
                placeholder="@username or link"
              />
              <FieldError message={fieldErrors.telegram} />
            </div>

            <div>
              <Label>Twitter</Label>
              <input
                type="text"
                name="twitter"
                value={form.twitter}
                onChange={handleChange}
                dir="ltr"
                className={`${inputClass} text-left`}
                placeholder="twitter username or link"
              />
              <FieldError message={fieldErrors.twitter} />
            </div>

            <div>
              <Label>LinkedIn</Label>
              <input
                type="text"
                name="linkedin"
                value={form.linkedin}
                onChange={handleChange}
                dir="ltr"
                className={`${inputClass} text-left`}
                placeholder="linkedin profile link"
              />
              <FieldError message={fieldErrors.linkedin} />
            </div>
          </div>
        </div>

        <div>
          <Label>وب‌سایت</Label>
          <input
            type="text"
            name="website"
            value={form.website}
            onChange={handleChange}
            dir="ltr"
            className={`${inputClass} text-left`}
            placeholder="https://yourwebsite.com"
          />
          <FieldError message={fieldErrors.website} />
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="sticky bottom-0 -mx-6 -mb-6 flex flex-col gap-3 border-t border-zinc-800 bg-zinc-950/95 p-6 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-6 text-zinc-500">
            بعد از ذخیره، اطلاعات پروفایل دوباره از سرور دریافت می‌شود.
          </p>

          <button
            type="submit"
            disabled={!canSubmit}
            className="rounded-xl bg-white px-6 py-3 text-sm font-black text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
          </button>
        </div>
      </form>
    </div>
  );
}
