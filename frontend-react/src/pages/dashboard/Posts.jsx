import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { dashboardApi } from "../../lib/dashboard/dashboardApi";

function normalizePaginatedResponse(response) {
  const data = response?.data ?? response ?? {};

  if (Array.isArray(data)) {
    return {
      items: data,
      count: data.length,
      next: null,
      previous: null,
    };
  }

  if (Array.isArray(data?.results)) {
    return {
      items: data.results,
      count: Number(data.count ?? 0),
      next: data.next ?? null,
      previous: data.previous ?? null,
    };
  }

  if (Array.isArray(data?.data)) {
    return {
      items: data.data,
      count: Number(data.count ?? data.data.length ?? 0),
      next: data.next ?? null,
      previous: data.previous ?? null,
    };
  }

  return {
    items: [],
    count: 0,
    next: null,
    previous: null,
  };
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
  }

  return "خطا در انجام عملیات.";
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

function getCategoryName(post) {
  if (!post?.category) return "—";
  if (typeof post.category === "object") return getItemTitle(post.category);
  return String(post.category);
}

function getPostTypeName(post) {
  return (
    post?.post_type_label ||
    post?.post_type_display ||
    post?.post_type_title ||
    post?.post_type ||
    "—"
  );
}

function getTagNames(post) {
  if (!Array.isArray(post?.tags) || post.tags.length === 0) return [];

  return post.tags
    .map((tag) => {
      if (typeof tag === "object") return getItemTitle(tag);
      return String(tag);
    })
    .filter(Boolean);
}

function getStatusInfo(status) {
  if (status === "published") {
    return {
      label: "منتشر شده",
      className: "bg-green-500/15 text-green-400 border-green-500/20",
    };
  }

  return {
    label: "پیش‌نویس",
    className: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  };
}

function getMediaTypeInfo(post) {
  const mediaType = String(post?.media_type || "none").toLowerCase();

  if (mediaType === "video") {
    return {
      label: "ویدیو",
      className: "bg-blue-500/15 text-blue-400 border-blue-500/20",
      value: "video",
    };
  }

  if (mediaType === "podcast" || mediaType === "audio") {
    return {
      label: "پادکست",
      className: "bg-purple-500/15 text-purple-400 border-purple-500/20",
      value: "podcast",
    };
  }

  return {
    label: "متنی",
    className: "bg-zinc-500/15 text-zinc-300 border-zinc-500/20",
    value: "text",
  };
}

function getSortableDate(post) {
  return (
    post?.created_at ||
    post?.created ||
    post?.published_at ||
    post?.updated_at ||
    post?.date ||
    null
  );
}

export default function DashboardPosts() {
  const [posts, setPosts] = useState([]);
  const [count, setCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [deletingSlug, setDeletingSlug] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [mediaFilter, setMediaFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");

  async function fetchPosts(page = 1) {
    try {
      setLoading(true);

      const safePage = Number(page) > 0 ? Number(page) : 1;
      const res = await dashboardApi.getMyPosts({ page: safePage });
      const normalized = normalizePaginatedResponse(res);

      setPosts(normalized.items);
      setCount(normalized.count);
      setCurrentPage(safePage);
    } catch (error) {
      console.error("getMyPosts error:", error);

      setPosts([]);
      setCount(0);

      toast.error(getApiErrorMessage(error) || "خطا در دریافت پست‌ها");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPosts(1);
  }, []);

  const filteredPosts = useMemo(() => {
    let result = Array.isArray(posts) ? [...posts] : [];

    if (search.trim()) {
      const q = search.trim().toLowerCase();

      result = result.filter((post) => {
        const title = String(post?.title || "").toLowerCase();
        const slug = String(post?.slug || "").toLowerCase();
        const category = String(getCategoryName(post) || "").toLowerCase();
        const tags = getTagNames(post).join(" ").toLowerCase();

        return (
          title.includes(q) ||
          slug.includes(q) ||
          category.includes(q) ||
          tags.includes(q)
        );
      });
    }

    if (statusFilter !== "all") {
      result = result.filter((post) => {
        if (statusFilter === "published") return post?.status === "published";
        if (statusFilter === "draft") return post?.status !== "published";
        return true;
      });
    }

    if (mediaFilter !== "all") {
      result = result.filter((post) => {
        const mediaType = getMediaTypeInfo(post).value;
        return mediaType === mediaFilter;
      });
    }

    result.sort((a, b) => {
      const dateA = getSortableDate(a)
        ? new Date(getSortableDate(a)).getTime()
        : 0;
      const dateB = getSortableDate(b)
        ? new Date(getSortableDate(b)).getTime()
        : 0;

      if (sortOrder === "oldest") return dateA - dateB;
      return dateB - dateA;
    });

    return result;
  }, [posts, search, statusFilter, mediaFilter, sortOrder]);

  const safePosts = filteredPosts;

  const publishedCount = useMemo(() => {
    return safePosts.filter((post) => post?.status === "published").length;
  }, [safePosts]);

  const draftCount = useMemo(() => {
    return safePosts.filter((post) => post?.status !== "published").length;
  }, [safePosts]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(count / pageSize));
  }, [count, pageSize]);

  async function handleDelete(post) {
    const slug = post?.slug;

    if (!slug) {
      toast.error("اسلاگ این پست پیدا نشد.");
      return;
    }

    toast(
      ({ closeToast }) => (
        <div dir="rtl" className="space-y-4">
          <div>
            <p className="font-bold text-white">حذف پست</p>
            <p className="mt-1 text-sm text-zinc-300">
              آیا از حذف پست «{post?.title || "بدون عنوان"}» مطمئن هستید؟
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={async () => {
                closeToast();

                const toastId = toast.loading("در حال حذف پست...");

                try {
                  setDeletingSlug(slug);

                  await dashboardApi.deletePost(slug);

                  const newCount = Math.max(0, count - 1);
                  const newTotalPages = Math.max(
                    1,
                    Math.ceil(newCount / pageSize),
                  );
                  const targetPage =
                    currentPage > newTotalPages ? newTotalPages : currentPage;

                  toast.update(toastId, {
                    render: "پست با موفقیت حذف شد.",
                    type: "success",
                    isLoading: false,
                    autoClose: 2500,
                    closeOnClick: true,
                  });

                  await fetchPosts(targetPage);
                } catch (error) {
                  console.error("deletePost error:", error);

                  toast.update(toastId, {
                    render: getApiErrorMessage(error) || "حذف پست انجام نشد.",
                    type: "error",
                    isLoading: false,
                    autoClose: 4500,
                    closeOnClick: true,
                  });
                } finally {
                  setDeletingSlug(null);
                }
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

  function handlePrevPage() {
    if (currentPage <= 1 || loading) return;
    fetchPosts(currentPage - 1);
  }

  function handleNextPage() {
    if (currentPage >= totalPages || loading) return;
    fetchPosts(currentPage + 1);
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-10" dir="rtl">
      <div className="flex flex-col gap-4 rounded-3xl border border-zinc-800 bg-gradient-to-l from-zinc-900 to-zinc-950 p-6 shadow-2xl md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">محتوای من</h1>
          <p className="mt-1 text-sm text-zinc-400">
            پست‌های خود را مدیریت، ویرایش یا حذف کنید.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={() => fetchPosts(currentPage)}
            disabled={loading}
            className="rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-bold text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "در حال بروزرسانی..." : "بروزرسانی"}
          </button>

          <Link
            to="/dashboard/posts/new"
            className="rounded-xl bg-white px-5 py-2.5 text-center text-sm font-black text-black transition hover:bg-zinc-200"
          >
            پست جدید
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
          <p className="text-sm text-zinc-500">کل پست‌ها</p>
          <p className="mt-2 text-2xl font-black text-white">{count}</p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
          <p className="text-sm text-zinc-500">نمایش در این صفحه</p>
          <p className="mt-2 text-2xl font-black text-white">
            {safePosts.length}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
          <p className="text-sm text-zinc-500">منتشر شده</p>
          <p className="mt-2 text-2xl font-black text-green-400">
            {publishedCount}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
          <p className="text-sm text-zinc-500">پیش‌نویس</p>
          <p className="mt-2 text-2xl font-black text-yellow-400">
            {draftCount}
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-4 shadow-2xl">
        <div className="grid gap-3 md:grid-cols-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجو بر اساس عنوان، اسلاگ، دسته‌بندی یا تگ..."
            className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white outline-none transition focus:border-zinc-500"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white outline-none transition focus:border-zinc-500"
          >
            <option value="all">همه وضعیت‌ها</option>
            <option value="published">منتشر شده</option>
            <option value="draft">پیش‌نویس</option>
          </select>

          <select
            value={mediaFilter}
            onChange={(e) => setMediaFilter(e.target.value)}
            className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white outline-none transition focus:border-zinc-500"
          >
            <option value="all">همه رسانه‌ها</option>
            <option value="text">متنی</option>
            <option value="video">ویدیو</option>
            <option value="podcast">پادکست</option>
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white outline-none transition focus:border-zinc-500"
          >
            <option value="newest">جدیدترین</option>
            <option value="oldest">قدیمی‌ترین</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 shadow-2xl">
        {loading ? (
          <div className="flex min-h-[320px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-zinc-600 border-t-white" />
              <p className="text-sm text-zinc-400">در حال دریافت داده‌ها...</p>
            </div>
          </div>
        ) : safePosts.length === 0 ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center p-10 text-center">
            <div className="mb-4 rounded-2xl border border-zinc-800 bg-zinc-900 px-5 py-4">
              <p className="text-lg font-bold text-white">هیچ پستی یافت نشد</p>
              <p className="mt-1 text-sm text-zinc-500">
                چیزی با فیلترهای انتخاب‌شده پیدا نشد.
              </p>
            </div>

            <Link
              to="/dashboard/posts/new"
              className="rounded-xl bg-white px-5 py-3 text-sm font-black text-black transition hover:bg-zinc-200"
            >
              ایجاد پست جدید
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] text-right">
                <thead className="border-b border-zinc-800 bg-zinc-900 text-sm text-zinc-400">
                  <tr>
                    <th className="p-4 font-medium">عنوان پست</th>
                    <th className="p-4 font-medium">دسته‌بندی</th>
                    <th className="p-4 font-medium">نوع پست</th>
                    <th className="p-4 font-medium">نوع رسانه</th>
                    <th className="p-4 font-medium">تگ‌ها</th>
                    <th className="p-4 font-medium">وضعیت</th>
                    <th className="p-4 font-medium">عملیات</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-zinc-800">
                  {safePosts.map((post, index) => {
                    const slug = post?.slug;
                    const tagNames = getTagNames(post);
                    const statusInfo = getStatusInfo(post?.status);
                    const mediaInfo = getMediaTypeInfo(post);

                    return (
                      <tr
                        key={post?.id || slug || index}
                        className="transition hover:bg-zinc-900/70"
                      >
                        <td className="p-4">
                          <div className="max-w-xs">
                            <p className="truncate font-bold text-white">
                              {post?.title || "بدون عنوان"}
                            </p>

                            {slug && (
                              <p
                                className="mt-1 truncate text-xs text-zinc-500"
                                dir="ltr"
                              >
                                {slug}
                              </p>
                            )}
                          </div>
                        </td>

                        <td className="p-4 text-sm text-zinc-300">
                          {getCategoryName(post)}
                        </td>

                        <td className="p-4 text-sm text-zinc-300">
                          {getPostTypeName(post)}
                        </td>

                        <td className="p-4">
                          <span
                            className={`inline-flex rounded-lg border px-2.5 py-1 text-xs font-bold ${mediaInfo.className}`}
                          >
                            {mediaInfo.label}
                          </span>
                        </td>

                        <td className="p-4">
                          {tagNames.length === 0 ? (
                            <span className="text-sm text-zinc-500">—</span>
                          ) : (
                            <div className="flex max-w-sm flex-wrap gap-2">
                              {tagNames.slice(0, 4).map((name, i) => (
                                <span
                                  key={`${name}-${i}`}
                                  className="rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-200"
                                >
                                  {name}
                                </span>
                              ))}

                              {tagNames.length > 4 && (
                                <span className="rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-400">
                                  +{tagNames.length - 4}
                                </span>
                              )}
                            </div>
                          )}
                        </td>

                        <td className="p-4">
                          <span
                            className={`inline-flex rounded-lg border px-2.5 py-1 text-xs font-bold ${statusInfo.className}`}
                          >
                            {statusInfo.label}
                          </span>
                        </td>

                        <td className="p-4">
                          {slug ? (
                            <div className="flex items-center gap-3">
                              <Link
                                to={`/dashboard/posts/${slug}/edit`}
                                className="rounded-lg border border-blue-500/30 px-3 py-2 text-xs font-bold text-blue-400 transition hover:bg-blue-500/10"
                              >
                                ویرایش
                              </Link>

                              <button
                                type="button"
                                onClick={() => handleDelete(post)}
                                disabled={deletingSlug === slug}
                                className="rounded-lg border border-red-500/30 px-3 py-2 text-xs font-bold text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {deletingSlug === slug
                                  ? "در حال حذف..."
                                  : "حذف"}
                              </button>
                            </div>
                          ) : (
                            <span className="rounded-lg border border-red-500/20 bg-red-500/10 px-2 py-1 text-xs text-red-300">
                              slug موجود نیست
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-zinc-800 bg-zinc-900/40 px-5 py-4 md:flex-row md:items-center md:justify-between">
              <div className="text-sm text-zinc-400">
                صفحه <span className="font-bold text-white">{currentPage}</span>{" "}
                از <span className="font-bold text-white">{totalPages}</span>
                {" | "}
                مجموع <span className="font-bold text-white">{count}</span> پست
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrevPage}
                  disabled={currentPage <= 1 || loading}
                  className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-bold text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  صفحه قبل
                </button>

                <button
                  type="button"
                  onClick={handleNextPage}
                  disabled={currentPage >= totalPages || loading}
                  className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-bold text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  صفحه بعد
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
