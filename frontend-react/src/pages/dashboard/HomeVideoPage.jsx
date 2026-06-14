import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../../lib/axiosClient";
import AdminGuard from "../../lib/AdminGuard";

const SLOT_LABELS = {
  main: "ویدیوی اصلی (بزرگ)",
  top: "ویدیوی کوچک اول",
  middle: "ویدیوی کوچک دوم",
  bottom: "ویدیوی کوچک سوم",
};

const SLOT_ORDER = ["main", "top", "middle", "bottom"];

const EMPTY_SLOTS = {
  main: null,
  top: null,
  middle: null,
  bottom: null,
};

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

function mapVideoResultsToSlots(items) {
  const mapped = { ...EMPTY_SLOTS };

  if (!Array.isArray(items)) return mapped;

  items.forEach((item) => {
    if (!item?.slot || !SLOT_ORDER.includes(item.slot)) return;

    if (!item?.post_id) {
      mapped[item.slot] = null;
      return;
    }

    mapped[item.slot] = {
      id: item.post_id,
      title: item.post_title,
      slug: item.post_slug,
      status: item.post_status,
      media_type: item.post_media_type,
      post_type: item.post_type,
      published_at: item.published_at,
      cover: item.cover || null,
      video_file: item.video_file || null,
      embed_url: item.embed_url || "",
      media_duration: item.media_duration || null,
    };
  });

  return mapped;
}

function SearchBox({ slot, label, selectedPost, onSelect, onClear }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function searchPosts() {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      try {
        setSearching(true);

        const res = await api.get("/dashboard/post-search/", {
          params: {
            q: query,
            status: "published",
            media_type: "video",
          },
          signal: controller.signal,
        });

        const items = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.results)
            ? res.data.results
            : [];

        setResults(items);
      } catch (error) {
        if (error?.name !== "CanceledError" && error?.code !== "ERR_CANCELED") {
          console.error(`Search error for slot ${slot}:`, error);
        }
      } finally {
        setSearching(false);
      }
    }

    const timeout = setTimeout(searchPosts, 400);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [query, slot]);

  return (
    <div className="relative z-10 flex flex-col rounded-3xl border border-zinc-800/80 bg-zinc-900/40 p-5 shadow-lg backdrop-blur-sm transition-all hover:z-50 hover:border-rose-500/30 hover:shadow-rose-500/5 focus-within:z-50">
      <div className="mb-5 flex items-center justify-between gap-3 border-b border-zinc-800/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/10 text-sm font-black text-rose-400 shadow-inner shadow-rose-500/20">
            {SLOT_ORDER.indexOf(slot) + 1}
          </div>
          <h3 className="text-sm font-bold text-zinc-100">{label}</h3>
        </div>

        {selectedPost && (
          <button
            type="button"
            onClick={onClear}
            className="flex items-center gap-1 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400 transition-colors hover:bg-red-500/20 hover:text-red-300"
          >
            <svg
              className="h-3 w-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            حذف
          </button>
        )}
      </div>

      {selectedPost ? (
        <div className="mb-5 overflow-hidden rounded-2xl border border-rose-500/30 bg-rose-500/10 p-5 shadow-inner shadow-rose-500/5 transition-all hover:border-rose-500/50 hover:bg-rose-500/15">
          <p className="truncate text-base font-bold text-rose-100">
            {selectedPost.title}
          </p>

          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-rose-500/20 px-2 py-1 text-[10px] font-bold text-rose-300">
              شناسه: {selectedPost.id}
            </span>

            <span className="rounded-md bg-zinc-800/80 px-2 py-1 text-[10px] font-bold text-zinc-300">
              {selectedPost.media_type === "video"
                ? "ویدیو"
                : selectedPost.media_type}
            </span>

            {selectedPost.media_duration ? (
              <span className="rounded-md bg-zinc-800/80 px-2 py-1 text-[10px] font-bold text-zinc-300">
                مدت: {selectedPost.media_duration} ثانیه
              </span>
            ) : null}
          </div>

          <p
            className="mt-2 truncate text-xs font-medium text-rose-300/70"
            dir="ltr"
          >
            {selectedPost.slug}
          </p>
        </div>
      ) : (
        <div className="mb-5 flex h-24 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-zinc-800 bg-zinc-900/50 p-3 text-zinc-500 transition-colors hover:border-zinc-700">
          <svg
            className="h-6 w-6 opacity-40"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 6h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2z"
            />
          </svg>
          <span className="text-xs font-medium">ویدیویی انتخاب نشده است</span>
        </div>
      )}

      <div className="relative mt-auto">
        <svg
          className="absolute right-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="جستجوی عنوان یا اسلاگ ویدیو..."
          className="w-full rounded-xl border border-zinc-700 bg-zinc-950/80 py-3 pl-4 pr-11 text-sm text-white outline-none transition-all placeholder:text-zinc-600 focus:border-rose-500 focus:bg-zinc-900 focus:ring-4 focus:ring-rose-500/10"
          dir="rtl"
        />
      </div>

      <div className="absolute left-0 right-0 top-full z-[100] mt-2 px-5">
        {searching ? (
          <div className="flex w-full items-center justify-center rounded-xl border border-zinc-700 bg-zinc-800/95 py-4 text-sm text-zinc-400 shadow-xl backdrop-blur-md">
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-zinc-500 border-t-white" />
            در حال جستجو...
          </div>
        ) : query.trim() ? (
          results.length ? (
            <div className="custom-scrollbar max-h-60 w-full space-y-1 overflow-y-auto rounded-xl border border-zinc-700 bg-zinc-800/95 p-2 shadow-2xl backdrop-blur-md">
              {results.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelect(item);
                    setQuery("");
                    setResults([]);
                  }}
                  className="block w-full rounded-lg border border-transparent bg-transparent px-4 py-3 text-right transition-colors hover:bg-zinc-700 focus:bg-zinc-700 focus:outline-none"
                >
                  <p className="truncate text-sm font-bold text-zinc-100">
                    {item.title}
                  </p>

                  <div className="mt-1.5 flex items-center justify-between gap-3">
                    <p className="truncate text-xs text-zinc-400" dir="ltr">
                      {item.slug}
                    </p>
                    <span className="rounded bg-rose-500/15 px-2 py-1 text-[10px] font-bold text-rose-300">
                      ویدیو
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="w-full rounded-xl border border-zinc-700 bg-zinc-800/95 py-4 text-center text-sm text-zinc-400 shadow-xl backdrop-blur-md">
              ویدیویی پیدا نشد.
            </div>
          )
        ) : null}
      </div>
    </div>
  );
}

function VideoWireframe({ slots }) {
  const getSlot = (slotKey) => {
    const item = slots[slotKey];
    const isFilled = !!item;

    return {
      title: item?.title || "خالی",
      filled: isFilled,
      cover: item?.cover || null,
    };
  };

  const main = getSlot("main");
  const top = getSlot("top");
  const middle = getSlot("middle");
  const bottom = getSlot("bottom");

  return (
    <div className="sticky top-6 overflow-hidden rounded-3xl border border-zinc-800/80 bg-zinc-900/40 shadow-2xl backdrop-blur-sm">
      <div className="border-b border-zinc-800/80 bg-zinc-800/20 px-6 py-5">
        <h2 className="flex items-center gap-2 text-base font-black text-white">
          <svg
            className="h-5 w-5 text-rose-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 6h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2z"
            />
          </svg>
          شماتیک ویدیوهای صفحه اصلی
        </h2>
        <p className="mt-1.5 text-xs font-medium leading-relaxed text-zinc-400">
          چیدمان ویدیوی اصلی و سه کارت ویدیویی کوچک را از اینجا مدیریت کنید.
        </p>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-12 gap-3 rounded-2xl border border-zinc-700 bg-zinc-950/40 p-3">
          <div className="col-span-7">
            <div
              className={`relative flex h-[320px] overflow-hidden rounded-2xl border ${
                main.filled
                  ? "border-rose-500/40 bg-rose-500/10"
                  : "border-dashed border-zinc-700 bg-zinc-900/50"
              }`}
            >
              {main.cover ? (
                <img
                  src={main.cover}
                  alt={main.title}
                  className="absolute inset-0 h-full w-full object-cover opacity-35"
                />
              ) : null}

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />

              <div className="relative flex h-full w-full flex-col justify-between p-4">
                <span className="w-fit rounded-lg bg-rose-500/20 px-2 py-1 text-xs font-bold text-rose-200">
                  ویدیوی اصلی
                </span>

                <div>
                  <p className="line-clamp-3 text-sm font-black leading-7 text-white">
                    {main.title}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-5 flex flex-col gap-3">
            {[top, middle, bottom].map((item, index) => {
              const labels = ["ویدیوی اول", "ویدیوی دوم", "ویدیوی سوم"];

              return (
                <div
                  key={index}
                  className={`relative flex h-[101px] overflow-hidden rounded-2xl border ${
                    item.filled
                      ? "border-rose-500/30 bg-rose-500/10"
                      : "border-dashed border-zinc-700 bg-zinc-900/50"
                  }`}
                >
                  {item.cover ? (
                    <img
                      src={item.cover}
                      alt={item.title}
                      className="absolute inset-0 h-full w-full object-cover opacity-30"
                    />
                  ) : null}

                  <div className="absolute inset-0 bg-gradient-to-l from-black/70 to-black/30" />

                  <div className="relative flex h-full w-full flex-col justify-between p-3">
                    <span className="w-fit rounded bg-zinc-800/80 px-2 py-1 text-[10px] font-bold text-zinc-200">
                      {labels[index]}
                    </span>

                    <p className="line-clamp-2 text-xs font-bold leading-5 text-white">
                      {item.title}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function HomeVideoPageContent() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [slots, setSlots] = useState(EMPTY_SLOTS);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        setLoading(true);

        const res = await api.get("/dashboard/home-video/");
        const items = res?.data?.results || [];
        const mappedSlots = mapVideoResultsToSlots(items);

        if (!mounted) return;
        setSlots(mappedSlots);
      } catch (error) {
        console.error("Load video slots error:", error);
        toast.error(
          getApiErrorMessage(error) || "خطا در بارگذاری اسلات‌های ویدیو",
        );
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  const selectedIds = useMemo(() => {
    return SLOT_ORDER.map((slot) => slots[slot]?.id).filter(Boolean);
  }, [slots]);

  function handleSelect(slot, post) {
    const isDuplicate = selectedIds.includes(post.id);

    if (isDuplicate && slots[slot]?.id !== post.id) {
      toast.error("این ویدیو قبلاً برای یک جایگاه دیگر انتخاب شده است.");
      return;
    }

    setSlots((prev) => ({
      ...prev,
      [slot]: {
        id: post.id,
        title: post.title,
        slug: post.slug,
        status: post.status,
        media_type: post.media_type,
        post_type: post.post_type,
        published_at: post.published_at,
        cover:
          post.cover || post.image || post.thumbnail || post.poster || null,
      },
    }));
  }

  function handleClear(slot) {
    setSlots((prev) => ({
      ...prev,
      [slot]: null,
    }));
  }

  async function handleSave() {
    if (saving) return;

    const payload = {
      items: SLOT_ORDER.map((slot) => ({
        slot,
        post_id: slots[slot]?.id || null,
        is_active: !!slots[slot],
      })),
    };

    const toastId = toast.loading("در حال پردازش و ذخیره ویدیوها...");

    try {
      setSaving(true);

      const res = await api.post("/dashboard/home-video/", payload);
      const items = res?.data?.results || [];
      const mappedSlots = mapVideoResultsToSlots(items);
      setSlots(mappedSlots);

      toast.update(toastId, {
        render: "چیدمان ویدیوهای صفحه اصلی با موفقیت ذخیره شد.",
        type: "success",
        isLoading: false,
        autoClose: 3000,
        closeOnClick: true,
      });
    } catch (error) {
      console.error("Save video slots error:", error);

      toast.update(toastId, {
        render: getApiErrorMessage(error) || "خطا در ذخیره ویدیوها",
        type: "error",
        isLoading: false,
        autoClose: 5000,
        closeOnClick: true,
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center" dir="rtl">
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-zinc-800/80 bg-zinc-900/50 p-10 shadow-2xl backdrop-blur-md">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-zinc-800 border-t-rose-500" />
          <p className="text-base font-bold tracking-wide text-zinc-300">
            در حال دریافت چیدمان ویدیوها...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-24" dir="rtl">
      <div className="relative overflow-hidden rounded-3xl border border-zinc-800/80 bg-zinc-900 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 via-fuchsia-500/5 to-transparent opacity-50" />
        <div className="relative flex flex-col items-start justify-between gap-6 p-8 md:flex-row md:items-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-black tracking-tight text-white">
              مدیریت ویدیوهای صفحه اصلی
            </h1>
            <p className="text-sm font-medium text-zinc-400">
              ویدیوی اصلی و سه کارت ویدیویی کوچک را به‌صورت دستی انتخاب و مدیریت
              کنید.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="group relative flex shrink-0 items-center gap-2 overflow-hidden rounded-2xl bg-rose-500 px-8 py-3.5 text-sm font-black text-white shadow-lg shadow-rose-500/25 transition-all hover:-translate-y-0.5 hover:shadow-rose-500/40 disabled:pointer-events-none disabled:opacity-50"
          >
            <div className="absolute inset-0 translate-y-full bg-white/20 transition-transform group-hover:translate-y-0" />
            <span className="relative">
              {saving ? "در حال ذخیره..." : "ذخیره نهایی چیدمان ویدیو"}
            </span>

            {!saving && (
              <svg
                className="relative h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <SearchBox
                slot="main"
                label={SLOT_LABELS.main}
                selectedPost={slots.main}
                onSelect={(post) => handleSelect("main", post)}
                onClear={() => handleClear("main")}
              />
            </div>

            {SLOT_ORDER.filter((slot) => slot !== "main").map((slot) => (
              <SearchBox
                key={slot}
                slot={slot}
                label={SLOT_LABELS[slot]}
                selectedPost={slots[slot]}
                onSelect={(post) => handleSelect(slot, post)}
                onClear={() => handleClear(slot)}
              />
            ))}
          </div>
        </div>

        <div className="relative lg:col-span-4">
          <VideoWireframe slots={slots} />
        </div>
      </div>
    </div>
  );
}

export default function HomeVideoPage() {
  return (
    <AdminGuard>
      <HomeVideoPageContent />
    </AdminGuard>
  );
}
