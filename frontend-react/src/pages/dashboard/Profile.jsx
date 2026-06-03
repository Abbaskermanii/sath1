import { useEffect, useMemo, useState } from "react";
import { api } from "../../lib/axiosClient";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [account, setAccount] = useState(null);
  const [currentImage, setCurrentImage] = useState("");

  const [form, setForm] = useState({
    full_name: "",
    bio: "",
    about: "",
    country: "",
    instagram: "",
    telegram: "",
    twitter: "",
    linkedin: "",
    website: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  async function loadMe() {
    try {
      setLoading(true);
      setError("");

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
      setError("خطا در دریافت اطلاعات پروفایل");
    } finally {
      setLoading(false);
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

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
  }

  function handleRemoveSelectedImage() {
    setImageFile(null);
    setImagePreview("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      setSaving(true);

      const formData = new FormData();
      formData.append("full_name", form.full_name || "");
      formData.append("bio", form.bio || "");
      formData.append("about", form.about || "");
      formData.append("country", form.country || "");
      formData.append("instagram", form.instagram || "");
      formData.append("telegram", form.telegram || "");
      formData.append("twitter", form.twitter || "");
      formData.append("linkedin", form.linkedin || "");
      formData.append("website", form.website || "");

      if (imageFile) formData.append("image", imageFile);

      await api.patch("/accounts/me/profile/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess("پروفایل با موفقیت به‌روزرسانی شد.");
      setImageFile(null);
      await loadMe();
    } catch (err) {
      console.error("update profile error:", err);
      const data = err?.response?.data;

      const firstError =
        data?.image?.[0] ||
        data?.full_name?.[0] ||
        data?.bio?.[0] ||
        data?.about?.[0] ||
        data?.country?.[0] ||
        data?.instagram?.[0] ||
        data?.telegram?.[0] ||
        data?.twitter?.[0] ||
        data?.linkedin?.[0] ||
        data?.website?.[0] ||
        data?.detail ||
        "به‌روزرسانی پروفایل انجام نشد.";

      setError(firstError);
    } finally {
      setSaving(false);
    }
  }

  const previewSrc = useMemo(() => {
    return imagePreview || currentImage || "";
  }, [imagePreview, currentImage]);

  if (loading) {
    return (
      <div
        className="min-h-[40vh] flex items-center justify-center text-zinc-400"
        dir="rtl"
      >
        در حال بارگذاری...
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-6" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold text-white">پروفایل من</h1>
        <p className="mt-1 text-sm text-zinc-400">
          مشاهده و ویرایش اطلاعات حساب کاربری
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">اطلاعات حساب</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="rounded-xl bg-zinc-800/60 p-4">
            <div className="text-zinc-400 mb-1">نام کاربری</div>
            <div className="text-white break-all">{account?.username || "-"}</div>
          </div>

          <div className="rounded-xl bg-zinc-800/60 p-4">
            <div className="text-zinc-400 mb-1">ایمیل</div>
            <div className="text-white break-all">{account?.email || "-"}</div>
          </div>

          <div className="rounded-xl bg-zinc-800/60 p-4">
            <div className="text-zinc-400 mb-1">نقش</div>
            <div className="text-white">{account?.role || "-"}</div>
          </div>

          <div className="rounded-xl bg-zinc-800/60 p-4">
            <div className="text-zinc-400 mb-1">سطح دسترسی</div>
            <div className="text-white">
              {account?.is_superuser
                ? "Superuser"
                : account?.is_staff
                  ? "Staff"
                  : "User"}
            </div>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
      >
        <h2 className="text-lg font-semibold text-white">ویرایش پروفایل</h2>

        <div className="space-y-3">
          <label className="block text-sm text-zinc-300">تصویر پروفایل</label>

          <div className="flex flex-col md:flex-row gap-4 items-start">
            <div className="w-28 h-28 rounded-2xl overflow-hidden border border-zinc-700 bg-zinc-800 flex items-center justify-center">
              {previewSrc ? (
                <img
                  src={previewSrc}
                  alt="profile preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs text-zinc-500">بدون تصویر</span>
              )}
            </div>

            <div className="space-y-3">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-sm text-zinc-300 file:ml-4 file:rounded-lg file:border-0 file:bg-white file:px-4 file:py-2 file:text-sm file:font-bold file:text-black hover:file:bg-zinc-200"
              />

              {imageFile && (
                <div className="text-sm text-zinc-400">
                  فایل انتخاب‌شده: {imageFile.name}
                </div>
              )}

              {imageFile && (
                <button
                  type="button"
                  onClick={handleRemoveSelectedImage}
                  className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-white"
                >
                  حذف فایل انتخاب‌شده
                </button>
              )}
            </div>
          </div>
        </div>

        <div>
          <label className="block mb-2 text-sm text-zinc-300">نام کامل</label>
          <input
            type="text"
            name="full_name"
            value={form.full_name}
            onChange={handleChange}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-white"
            placeholder="نام و نام خانوادگی"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm text-zinc-300">بیو</label>
          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-white"
            placeholder="توضیح کوتاه درباره شما"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm text-zinc-300">درباره من</label>
          <textarea
            name="about"
            value={form.about}
            onChange={handleChange}
            rows={5}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-white"
            placeholder="توضیح کامل‌تر درباره شما"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm text-zinc-300">کشور</label>
          <input
            type="text"
            name="country"
            value={form.country}
            onChange={handleChange}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-white"
            placeholder="مثلاً: ایران"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 text-sm text-zinc-300">Instagram</label>
            <input
              type="text"
              name="instagram"
              value={form.instagram}
              onChange={handleChange}
              dir="ltr"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-left text-white"
              placeholder="instagram username or link"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm text-zinc-300">Telegram</label>
            <input
              type="text"
              name="telegram"
              value={form.telegram}
              onChange={handleChange}
              dir="ltr"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-left text-white"
              placeholder="@username or link"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm text-zinc-300">Twitter</label>
            <input
              type="text"
              name="twitter"
              value={form.twitter}
              onChange={handleChange}
              dir="ltr"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-left text-white"
              placeholder="twitter username or link"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm text-zinc-300">LinkedIn</label>
            <input
              type="text"
              name="linkedin"
              value={form.linkedin}
              onChange={handleChange}
              dir="ltr"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-left text-white"
              placeholder="linkedin profile link"
            />
          </div>
        </div>

        <div>
          <label className="block mb-2 text-sm text-zinc-300">وب‌سایت</label>
          <input
            type="text"
            name="website"
            value={form.website}
            onChange={handleChange}
            dir="ltr"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-left text-white"
            placeholder="https://yourwebsite.com"
          />
        </div>

        {error && (
          <div className="rounded-lg border border-red-500 bg-red-500/10 p-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-lg border border-emerald-500 bg-emerald-500/10 p-3 text-sm text-emerald-300">
            {success}
          </div>
        )}

        <div className="flex justify-start">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-white px-5 py-2.5 font-bold text-black disabled:opacity-50"
          >
            {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
          </button>
        </div>
      </form>
    </div>
  );
}
