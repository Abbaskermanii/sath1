"use client";
import { useEffect, useState } from "react";
import { authApi } from "@/app/lib/auth/authApi";

export default function ProfileEditor() {
  const [form, setForm] = useState({
    full_name: "",
    bio: "",
    about: "",
    country: "",
    instagram: "",
    telegram: "",
    twitter: "",
    image: "",
  });

  useEffect(() => {
    authApi.me().then((res) => {
      if (res.profile) setForm(res.profile);
    });
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    await authApi.updateProfile(form);
    alert("پروفایل بروزرسانی شد");
  };

  return (
    <form onSubmit={handleUpdate} className="max-w-4xl space-y-6">
      <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-zinc-400 text-sm">نام کامل</label>
            <input
              className="w-full bg-zinc-950 border border-zinc-800 p-3 rounded-xl text-white"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-zinc-400 text-sm">لینک تصویر پروفایل</label>
            <input
              className="w-full bg-zinc-950 border border-zinc-800 p-3 rounded-xl text-white"
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
            />
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="text-zinc-400 text-sm">بیوگرافی کوتاه</label>
            <textarea
              className="w-full bg-zinc-950 border border-zinc-800 p-3 rounded-xl text-white"
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
            />
          </div>
        </div>
        <button
          type="submit"
          className="mt-6 bg-white text-black px-8 py-3 rounded-xl font-bold"
        >
          ذخیره تغییرات
        </button>
      </div>
    </form>
  );
}
