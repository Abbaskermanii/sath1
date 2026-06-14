import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../../lib/axiosClient";
import AdminGuard from "../../lib/AdminGuard";

const SLOT_LABELS = {
  main: "خبر اصلی (بزرگ)",
  top_left: "خبر زیرین اصلی",
  bottom_left: "مرتبط (راست)",
  bottom_center: "مرتبط (وسط)",
  bottom_right: "مرتبط (چپ)",
};

const SLOT_ORDER = [
  "main",
  "top_left",
  "bottom_left",
  "bottom_center",
  "bottom_right",
];

const EMPTY_SLOTS = {
  main: null,
  top_left: null,
  bottom_left: null,
  bottom_center: null,
  bottom_right: null,
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

function mapHeroResultsToSlots(items) {
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
    // اضافه شدن focus-within:z-50 و hover:z-50 برای حل مشکل رفتن زیر بقیه المان‌ها
    <div className="relative z-10 flex flex-col rounded-3xl border border-zinc-800/80 bg-zinc-900/40 p-5 shadow-lg backdrop-blur-sm transition-all hover:z-50 hover:border-indigo-500/30 hover:shadow-indigo-500/5 focus-within:z-50">
      <div className="mb-5 flex items-center justify-between gap-3 border-b border-zinc-800/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 text-sm font-black text-indigo-400 shadow-inner shadow-indigo-500/20">
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
        <div className="mb-5 flex flex-col justify-center overflow-hidden rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 shadow-inner shadow-emerald-500/5 transition-all hover:border-emerald-500/50 hover:bg-emerald-500/15">
          <p className="truncate text-base font-bold text-emerald-100">
            {selectedPost.title}
          </p>
          <div className="mt-2.5 flex items-center gap-3">
            <span className="rounded-md bg-emerald-500/20 px-2 py-1 text-[10px] font-bold text-emerald-300">
              شناسه: {selectedPost.id}
            </span>
            <p
              className="truncate text-xs font-medium text-emerald-300/70"
              dir="ltr"
            >
              {selectedPost.slug}
            </p>
          </div>
        </div>
      ) : (
        <div className="mb-5 flex h-22.5 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-zinc-800 bg-zinc-900/50 p-3 text-zinc-500 transition-colors hover:border-zinc-700">
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span className="text-xs font-medium">پستی انتخاب نشده است</span>
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
          placeholder="جستجوی عنوان یا اسلاگ..."
          className="w-full rounded-xl border border-zinc-700 bg-zinc-950/80 py-3 pl-4 pr-11 text-sm text-white outline-none transition-all placeholder:text-zinc-600 focus:border-indigo-500 focus:bg-zinc-900 focus:ring-4 focus:ring-indigo-500/10"
          dir="rtl"
        />
      </div>

      {/* بخش نتایج - z-index بالا */}
      <div className="absolute left-0 right-0 top-full z-[100] mt-2 px-5">
        {searching ? (
          <div className="flex w-full items-center justify-center rounded-xl border border-zinc-700 bg-zinc-800/95 py-4 text-sm text-zinc-400 shadow-xl backdrop-blur-md">
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-zinc-500 border-t-white" />
            در حال جستجو...
          </div>
        ) : query.trim() ? (
          results.length ? (
            <div className="max-h-60 w-full space-y-1 overflow-y-auto rounded-xl border border-zinc-700 bg-zinc-800/95 p-2 shadow-2xl backdrop-blur-md custom-scrollbar">
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
                  <p
                    className="mt-1.5 truncate text-xs text-zinc-400"
                    dir="ltr"
                  >
                    {item.slug}
                  </p>
                </button>
              ))}
            </div>
          ) : (
            <div className="w-full rounded-xl border border-zinc-700 bg-zinc-800/95 py-4 text-center text-sm text-zinc-400 shadow-xl backdrop-blur-md">
              پستی پیدا نشد.
            </div>
          )
        ) : null}
      </div>
    </div>
  );
}

function HeroWireframe({ slots }) {
  const getSlotDetails = (slotKey) => {
    const isFilled = !!slots[slotKey];
    return {
      title: slots[slotKey]?.title || "خالی",
      bgClass: isFilled
        ? "bg-indigo-50/90 text-indigo-900"
        : "bg-zinc-50 text-zinc-400",
      borderClass: isFilled
        ? "border-indigo-300"
        : "border-zinc-200 border-dashed",
    };
  };

  const main = getSlotDetails("main");
  const topLeft = getSlotDetails("top_left");
  const bLeft = getSlotDetails("bottom_left");
  const bCenter = getSlotDetails("bottom_center");
  const bRight = getSlotDetails("bottom_right");

  return (
    <div className="sticky top-6 overflow-hidden rounded-3xl border border-zinc-800/80 bg-zinc-900/40 shadow-2xl backdrop-blur-sm">
      <div className="border-b border-zinc-800/80 bg-zinc-800/20 px-6 py-5">
        <h2 className="text-base font-black text-white flex items-center gap-2">
          <svg
            className="w-5 h-5 text-indigo-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
            />
          </svg>
          شماتیک چیدمان سایت
        </h2>
        <p className="mt-1.5 text-xs font-medium text-zinc-400 leading-relaxed">
          نمای کلی از جایگاه قرارگیری اخبار در صفحه اصلی.
        </p>
      </div>

      <div className="p-6">
        <div className="flex flex-col overflow-hidden rounded-2xl border border-zinc-700 bg-white shadow-inner">
          {/* Main Container */}
          <div
            className={`relative flex h-[220px] w-full flex-col justify-between border-b border-zinc-300 p-4 transition-colors ${main.bgClass}`}
          >
            <div className="flex w-full items-start justify-between">
              <span className="rounded-md bg-zinc-200/80 px-2 py-1 text-xs font-bold text-zinc-600 shadow-sm">
                خبر اصلی
              </span>
            </div>

            <div className="px-2 pb-16 text-center text-sm font-black leading-snug">
              {main.title}
            </div>

            {/* Inner Sub-News */}
            <div
              className={`absolute bottom-4 left-4 right-16 rounded-xl border p-3 shadow-md transition-colors ${topLeft.bgClass === "bg-indigo-50/90 text-indigo-900" ? "bg-white border-indigo-200" : "bg-white border-zinc-200"}`}
            >
              <div className="mb-1.5 flex items-center justify-between border-b border-zinc-100 pb-1.5">
                <span className="text-[10px] font-bold text-zinc-400">
                  خبر زیرین
                </span>
              </div>
              <span className="block truncate pl-2 text-xs font-bold text-zinc-800">
                {topLeft.title}
              </span>
            </div>
          </div>

          {/* Related News Container - Grid Layout */}
          <div className="grid grid-cols-3 divide-x divide-x-reverse divide-zinc-200 bg-zinc-50">
            {/* bottom_right (Leftmost visually) */}
            <div
              className={`flex h-28 flex-col items-center justify-between p-3 text-center transition-colors hover:bg-zinc-100 ${bRight.bgClass}`}
            >
              <span className="rounded bg-zinc-200/50 px-1.5 py-0.5 text-[9px] font-bold text-zinc-500">
                مرتبط چپ
              </span>
              <span className="mt-auto w-full text-[11px] font-bold leading-tight line-clamp-2">
                {bRight.title}
              </span>
            </div>

            {/* bottom_center (Center visually) */}
            <div
              className={`flex h-28 flex-col items-center justify-between p-3 text-center transition-colors hover:bg-zinc-100 ${bCenter.bgClass}`}
            >
              <span className="rounded bg-zinc-200/50 px-1.5 py-0.5 text-[9px] font-bold text-zinc-500">
                مرتبط وسط
              </span>
              <span className="mt-auto w-full text-[11px] font-bold leading-tight line-clamp-2">
                {bCenter.title}
              </span>
            </div>

            {/* bottom_left (Rightmost visually) */}
            <div
              className={`flex h-28 flex-col items-center justify-between p-3 text-center transition-colors hover:bg-zinc-100 ${bLeft.bgClass}`}
            >
              <span className="rounded bg-zinc-200/50 px-1.5 py-0.5 text-[9px] font-bold text-zinc-500">
                مرتبط راست
              </span>
              <span className="mt-auto w-full text-[11px] font-bold leading-tight line-clamp-2">
                {bLeft.title}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HomeHeroPageContent() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [slots, setSlots] = useState(EMPTY_SLOTS);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        setLoading(true);

        const res = await api.get("/dashboard/home-hero/");
        const items = res?.data?.results || [];
        const mappedSlots = mapHeroResultsToSlots(items);

        if (!mounted) return;

        setSlots(mappedSlots);
      } catch (error) {
        console.error("Load hero slots error:", error);
        toast.error(getApiErrorMessage(error) || "خطا در بارگذاری اسلات‌ها");
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
      toast.error("این خبر قبلاً برای یک جایگاه دیگر انتخاب شده است.");
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

    const toastId = toast.loading("در حال پردازش و ذخیره...");

    try {
      setSaving(true);

      const res = await api.post("/dashboard/home-hero/", payload);

      const items = res?.data?.results || [];
      const mappedSlots = mapHeroResultsToSlots(items);
      setSlots(mappedSlots);

      toast.update(toastId, {
        render: "تغییرات صفحه اصلی با موفقیت ذخیره شد.",
        type: "success",
        isLoading: false,
        autoClose: 3000,
        closeOnClick: true,
      });
    } catch (error) {
      console.error("Save hero slots error:", error);

      toast.update(toastId, {
        render: getApiErrorMessage(error) || "خطا در ذخیره تغییرات",
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
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-zinc-800 border-t-indigo-500" />
          <p className="text-base font-bold tracking-wide text-zinc-300">
            در حال دریافت چیدمان...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-24" dir="rtl">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-3xl border border-zinc-800/80 bg-zinc-900 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent opacity-50" />
        <div className="relative flex flex-col items-start justify-between gap-6 p-8 md:flex-row md:items-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-white tracking-tight">
              مدیریت هیرو صفحه اصلی
            </h1>
            <p className="text-sm font-medium text-zinc-400">
              ۵ خبر مهم و طلایی صفحه اصلی را انتخاب و چیدمان کنید. شماتیک سمت چپ
              به شما کمک می‌کند.
            </p>
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="group relative flex shrink-0 items-center gap-2 overflow-hidden rounded-2xl bg-indigo-500 px-8 py-3.5 text-sm font-black text-white shadow-lg shadow-indigo-500/25 transition-all hover:-translate-y-0.5 hover:shadow-indigo-500/40 disabled:pointer-events-none disabled:opacity-50"
          >
            <div className="absolute inset-0 translate-y-full bg-white/20 transition-transform group-hover:translate-y-0" />
            <span className="relative">
              {saving ? "در حال ذخیره..." : "ذخیره نهایی چیدمان"}
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
            {/* Main slot */}
            <div className="md:col-span-2">
              <SearchBox
                slot="main"
                label={SLOT_LABELS["main"]}
                selectedPost={slots["main"]}
                onSelect={(post) => handleSelect("main", post)}
                onClear={() => handleClear("main")}
              />
            </div>

            {/* Secondary slots */}
            {SLOT_ORDER.filter((s) => s !== "main").map((slot) => (
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

        {/* Wireframe Preview Sidebar */}
        <div className="relative lg:col-span-4">
          <HeroWireframe slots={slots} />
        </div>
      </div>
    </div>
  );
}

export default function HomeHeroPage() {
  return (
    <AdminGuard>
      <HomeHeroPageContent />
    </AdminGuard>
  );
}
