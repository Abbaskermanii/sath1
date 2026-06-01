"use client";
import { useEffect, useState } from "react";
import { dashboardApi } from "@/app/lib/dashboard/dashboardApi";
import Link from "next/link";

export default function DashboardPosts() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.getMyContent()
      .then(res => setData(res.posts || res)) // بسته به ساختار خروجی
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">محتوای من</h1>
        <Link href="/dashboard/posts/new" className="bg-white text-black px-4 py-2 rounded-lg font-bold">پست جدید</Link>
      </div>

      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-zinc-800 text-zinc-400 text-sm">
            <tr>
              <th className="p-4">عنوان پست</th>
              <th className="p-4">وضعیت</th>
              <th className="p-4">تاریخ</th>
              <th className="p-4">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {data.map((post) => (
              <tr key={post.slug} className="hover:bg-zinc-800/50">
                <td className="p-4 font-medium">{post.title}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs ${post.status === 'published' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    {post.status}
                  </span>
                </td>
                <td className="p-4 text-zinc-500 text-sm">{post.created_at}</td>
                <td className="p-4">
                  <Link href={`/dashboard/posts/${post.slug}/edit`} className="text-blue-400 hover:underline">ویرایش</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <div className="p-10 text-center text-zinc-500">در حال دریافت داده‌ها...</div>}
      </div>
    </div>
  );
}
