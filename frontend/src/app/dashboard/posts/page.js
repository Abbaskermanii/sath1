"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { dashboardApi } from "@/app/lib/dashboard/dashboardApi";

export default function DashboardPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingSlug, setDeletingSlug] = useState(null);

  const safePosts = useMemo(() => {
    return Array.isArray(posts) ? posts : [];
  }, [posts]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await dashboardApi.getMyContent({ type: "post" });
      console.log("getMyContent raw response =>", res);

      const onlyPosts = Array.isArray(res)
        ? res.filter((item) => item?.type === "post")
        : [];

      setPosts(onlyPosts);
    } catch (err) {
      console.error("getMyContent error:", err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const getCategoryName = (post) => {
    if (!post?.category) return "-";

    if (typeof post.category === "object") {
      return (
        post.category.name || post.category.title || post.category.slug || "-"
      );
    }

    return String(post.category);
  };

  const getTagNames = (post) => {
    if (!Array.isArray(post?.tags) || post.tags.length === 0) return [];

    return post.tags
      .map((tag) => {
        if (typeof tag === "object") {
          return tag?.name || tag?.title || tag?.slug || null;
        }
        return String(tag);
      })
      .filter(Boolean);
  };

  const handleDelete = async (post) => {
    const slug = post?.slug;

    if (!slug) {
      alert("slug این پست پیدا نشد. خروجی my-content را در console چک کن.");
      return;
    }

    const ok = window.confirm("آیا از حذف این پست مطمئن هستید؟");
    if (!ok) return;

    try {
      setDeletingSlug(slug);
      await dashboardApi.deletePost(slug);
      setPosts((prev) => prev.filter((p) => p.slug !== slug));
      alert("پست با موفقیت حذف شد.");
    } catch (err) {
      console.error("deletePost error:", err);
      alert(err?.message || "حذف پست انجام نشد.");
    } finally {
      setDeletingSlug(null);
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">محتوای من</h1>

        <Link
          href="/dashboard/posts/new"
          className="bg-white text-black px-4 py-2 rounded-lg font-bold"
        >
          پست جدید
        </Link>
      </div>

      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-zinc-500">
            در حال دریافت داده‌ها...
          </div>
        ) : safePosts.length === 0 ? (
          <div className="p-10 text-center text-zinc-500">
            هیچ پستی یافت نشد
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-zinc-800 text-zinc-400 text-sm">
                <tr>
                  <th className="p-4">عنوان پست</th>
                  <th className="p-4">دسته‌بندی</th>
                  <th className="p-4">تگ‌ها</th>
                  <th className="p-4">وضعیت</th>
                  <th className="p-4">عملیات</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-zinc-800">
                {safePosts.map((post, idx) => {
                  const slug = post?.slug;
                  const categoryName = getCategoryName(post);
                  const tagNames = getTagNames(post);

                  return (
                    <tr key={post?.id || idx} className="hover:bg-zinc-800/50">
                      <td className="p-4 font-medium">{post?.title || "-"}</td>

                      <td className="p-4 text-zinc-200">{categoryName}</td>

                      <td className="p-4">
                        {tagNames.length === 0 ? (
                          <span className="text-zinc-500 text-sm">—</span>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {tagNames.map((name, i) => (
                              <span
                                key={`${post?.id || idx}-tag-${i}`}
                                className="px-2 py-1 rounded bg-zinc-800 text-zinc-200 text-xs"
                              >
                                {name}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            post?.status === "published"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-yellow-500/20 text-yellow-400"
                          }`}
                        >
                          {post?.status === "published"
                            ? "منتشر شده"
                            : "پیش‌نویس"}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-4">
                          {slug ? (
                            <>
                              <Link
                                href={`/dashboard/posts/${slug}/edit`}
                                className="text-blue-400 hover:underline"
                              >
                                ویرایش
                              </Link>

                              <button
                                onClick={() => handleDelete(post)}
                                disabled={deletingSlug === slug}
                                className="text-red-400 hover:underline disabled:opacity-50"
                              >
                                {deletingSlug === slug
                                  ? "در حال حذف..."
                                  : "حذف"}
                              </button>
                            </>
                          ) : (
                            <span className="text-xs text-red-400">
                              slug موجود نیست
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
