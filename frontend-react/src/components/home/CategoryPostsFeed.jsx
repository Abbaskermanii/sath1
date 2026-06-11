import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { newsApi } from "../../lib/news/newsApi";
import { normalizePosts } from "../../lib/normalizers";

// ... (توابع کمکی بدون تغییر باقی می‌مانند)
function getApiErrorMessage(
  error,
  fallback = "خطا در دریافت اخبار این دسته‌بندی",
) {
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

function uniqueByIdOrTitle(items = []) {
  const seen = new Set();
  return items.filter((item, index) => {
    const key =
      item?.id ?? item?.slug ?? item?.href ?? item?.title ?? `item-${index}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function toPersianDigits(value) {
  return String(value).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
}

function formatRelativeTime(dateValue) {
  if (!dateValue) return "";
  const now = new Date();
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60000));
  if (diffMinutes < 60) return `${toPersianDigits(diffMinutes)} دقیقه پیش`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${toPersianDigits(diffHours)} ساعت پیش`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${toPersianDigits(diffDays)} روز پیش`;
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

function buildPageNumbers(currentPage, totalPages) {
  if (totalPages <= 1) return [1];
  const pages = new Set([1, totalPages]);
  for (let i = currentPage - 1; i <= currentPage + 1; i += 1) {
    if (i > 1 && i < totalPages) pages.add(i);
  }
  return [...pages].sort((a, b) => a - b);
}

function extractPaginatedPostsResponse(raw) {
  const data = raw?.data ?? raw ?? {};
  const rawResults = Array.isArray(data?.results)
    ? data.results
    : Array.isArray(data)
      ? data
      : [];
  const normalizedItems = normalizePosts(rawResults);
  return {
    items: uniqueByIdOrTitle(normalizedItems),
    count: Number(data?.count ?? rawResults.length ?? 0),
    next: data?.next ?? null,
    previous: data?.previous ?? null,
  };
}

function CategoryFeedCard({ item }) {
  const href = item?.href || "#";
  const title = item?.title || "بدون عنوان";
  const image =
    item?.image ||
    item?.thumbnail ||
    item?.featured_image ||
    item?.cover ||
    item?.photo ||
    "";
  const publishedAt =
    item?.publishedAt ||
    item?.published_at ||
    item?.createdAt ||
    item?.created_at;
  const timeText = formatRelativeTime(publishedAt);

  return (
    <article className="group h-full overflow-hidden rounded-2xl border border-neutral-200/90 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition duration-200 hover:-translate-y-[1px] hover:border-neutral-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
      <Link to={href} className="flex h-full gap-3 p-3 sm:gap-3.5 sm:p-3.5">
        <div className="shrink-0">
          <div className="relative h-[82px] w-[108px] overflow-hidden rounded-xl bg-neutral-100 sm:h-[88px] sm:w-[118px]">
            {image ? (
              <img
                src={image}
                alt={title}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.04]"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[10px] text-neutral-400">
                بدون تصویر
              </div>
            )}
          </div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-between">
          <h3 className="line-clamp-2 text-[14px] font-bold leading-5 text-neutral-900 sm:text-[15px] sm:leading-6">
            {title}
          </h3>
          <div className="mt-2 flex items-center gap-2 text-[11px] text-neutral-500">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="truncate">{timeText}</span>
          </div>
        </div>
      </Link>
    </article>
  );
}

function FeedSkeleton({ pageSize = 6 }) {
  return (
    <div className="flex w-full gap-3 overflow-x-auto pb-4 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible">
      {Array.from({ length: pageSize }).map((_, index) => (
        <div key={index} className="snap-start shrink-0 w-[260px] sm:w-auto">
          <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white p-3 shadow-[0_1px_2px_rgba(0,0,0,0.03)] sm:p-3.5">
            <div className="flex gap-3">
              <div className="h-[82px] w-[108px] animate-pulse rounded-xl bg-neutral-100 sm:h-[88px] sm:w-[118px]" />
              <div className="flex min-w-0 flex-1 flex-col justify-between">
                <div className="space-y-2">
                  <div className="h-4 w-[88%] animate-pulse rounded bg-neutral-100" />
                  <div className="h-4 w-[68%] animate-pulse rounded bg-neutral-100" />
                </div>
                <div className="mt-3 h-3 w-24 animate-pulse rounded bg-neutral-100" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CategoryPostsFeed({
  categorySlug,
  pageSize = 6,
  isCategoryPage = true,
}) {
  const [items, setItems] = useState([]);
  const [count, setCount] = useState(0);
  const [next, setNext] = useState(null);
  const [previous, setPrevious] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  const totalPages = useMemo(() => {
    if (!count || !pageSize) return 1;
    return Math.max(1, Math.ceil(count / pageSize));
  }, [count, pageSize]);

  const fetchPage = useCallback(
    async (pageNumber) => {
      if (!categorySlug) return;
      const safePage = Math.max(1, pageNumber);
      setLoading(true);
      setPageError("");
      try {
        const raw = await newsApi.getPosts({
          category: categorySlug,
          ordering: "-published_at",
          page: safePage,
          page_size: pageSize,
        });
        const paginated = extractPaginatedPostsResponse(raw);
        setItems(paginated.items);
        setCount(paginated.count);
        setNext(paginated.next);
        setPrevious(paginated.previous);
        setPage(safePage);
      } catch (error) {
        const message = getApiErrorMessage(error);
        if (
          typeof message === "string" &&
          message.toLowerCase().includes("invalid page")
        ) {
          try {
            const fallbackRaw = await newsApi.getPosts({
              category: categorySlug,
              ordering: "-published_at",
              page: 1,
              page_size: pageSize,
            });
            const fallbackPaginated =
              extractPaginatedPostsResponse(fallbackRaw);
            setItems(fallbackPaginated.items);
            setCount(fallbackPaginated.count);
            setNext(fallbackPaginated.next);
            setPrevious(fallbackPaginated.previous);
            setPage(1);
            setPageError("");
            return;
          } catch (fallbackError) {
            setPageError(getApiErrorMessage(fallbackError));
            setItems([]);
          }
        } else {
          setPageError(message);
          setItems([]);
        }
      } finally {
        setLoading(false);
      }
    },
    [categorySlug, pageSize],
  );

  useEffect(() => {
    if (!isCategoryPage || !categorySlug) return;
    setItems([]);
    setCount(0);
    setNext(null);
    setPrevious(null);
    setPage(1);
    setPageError("");
    fetchPage(1);
  }, [fetchPage, categorySlug, isCategoryPage]);

  const pageNumbers = useMemo(
    () => buildPageNumbers(page, totalPages),
    [page, totalPages],
  );

  if (!isCategoryPage || !categorySlug) return null;

  return (
    <section className="py-4 sm:py-5" dir="rtl">
      <div className="rounded-[22px] border border-neutral-200 bg-gradient-to-b from-neutral-50 to-white p-3 sm:p-4 lg:p-5">
        {loading ? (
          <FeedSkeleton pageSize={Math.min(pageSize, 6)} />
        ) : pageError ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-red-100 bg-white px-4 py-8 text-center">
            <p className="text-sm text-red-600">{pageError}</p>
            <button
              type="button"
              onClick={() => fetchPage(page)}
              className="mt-4 rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
            >
              تلاش مجدد
            </button>
          </div>
        ) : items.length > 0 ? (
          <>
            {/* کانتینر اصلی با تغییر به اسلایدر در موبایل */}
            <div className="flex w-full gap-3 overflow-x-auto pb-4 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible">
              {items.map((item) => (
                <div
                  key={item?.id || item?.slug || item?.href || item?.title}
                  className="snap-start shrink-0 w-[260px] sm:w-auto"
                >
                  <CategoryFeedCard item={item} />
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1 || loading || !previous}
                  onClick={() => {
                    if (page > 1) fetchPage(page - 1);
                  }}
                  className="rounded-full border border-neutral-300 bg-white px-3.5 py-2 text-xs font-medium text-neutral-700 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  قبلی
                </button>
                {pageNumbers.map((pageNumber, index) => {
                  const prevPageNumber = pageNumbers[index - 1];
                  const hasGap =
                    typeof prevPageNumber === "number" &&
                    pageNumber - prevPageNumber > 1;
                  return (
                    <div key={pageNumber} className="flex items-center gap-2">
                      {hasGap && (
                        <span className="px-1 text-xs text-neutral-400">
                          ...
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          if (
                            !loading &&
                            pageNumber >= 1 &&
                            pageNumber <= totalPages &&
                            pageNumber !== page
                          )
                            fetchPage(pageNumber);
                        }}
                        className={`min-w-[38px] rounded-full px-3.5 py-2 text-xs font-semibold transition ${page === pageNumber ? "bg-neutral-900 text-white shadow-sm" : "border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100"}`}
                      >
                        {toPersianDigits(pageNumber)}
                      </button>
                    </div>
                  );
                })}
                <button
                  type="button"
                  disabled={page >= totalPages || loading || !next}
                  onClick={() => {
                    if (page < totalPages) fetchPage(page + 1);
                  }}
                  className="rounded-full border border-neutral-300 bg-white px-3.5 py-2 text-xs font-medium text-neutral-700 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  بعدی
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-neutral-300 bg-white px-4 py-10 text-center text-sm text-neutral-500">
            خبری برای این دسته‌بندی پیدا نشد.
          </div>
        )}
      </div>
    </section>
  );
}
