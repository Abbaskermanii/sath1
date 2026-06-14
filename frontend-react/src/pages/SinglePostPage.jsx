import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import { Link, useParams } from "react-router-dom";
import Plyr from "plyr";
import "plyr/dist/plyr.css";
import DOMPurify from "dompurify";
import {
  Clock3,
  Eye,
  User2,
  CalendarDays,
  Bookmark,
  BookmarkCheck,
  Copy,
  Check,
  MessageCircle,
  Share2,
  Flame,
  ArrowUp,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Play,
  Volume2,
} from "lucide-react";
import { newsApi } from "../lib/news/newsApi";
import CategoryNewsSection from "../components/home/CategoryNewsSection";
import { POST_TYPES } from "../lib/postTypes";

const COMMENTS_STEP = 4;

function FacebookSvg({ size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M13.5 21v-8.2h2.8l.4-3.2h-3.2V7.6c0-.9.3-1.6 1.6-1.6H17V3.1c-.4 0-1.4-.1-2.6-.1-2.6 0-4.4 1.6-4.4 4.5v2.1H7v3.2h3v8.2h3.5z" />
    </svg>
  );
}

function TelegramSvg({ size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M21.9 4.6c.2-1-1-1.8-1.9-1.4L2.7 10c-1.1.4-1.1 1.9 0 2.3l4.2 1.5 1.6 5.1c.3 1 1.5 1.3 2.2.6l2.3-2.2 4.6 3.4c.8.6 2 .2 2.2-.9l2.1-15.2zM9.4 13.2l8.7-6.1-6.8 7.6a1 1 0 0 0-.2.4l-.6 2.8-1.1-3.5a1 1 0 0 0-.6-.6z" />
    </svg>
  );
}

function XSvg({ size = 12 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 1200 1227"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M714 519 1160 0h-106L667 450 357 0H0l468 679L0 1227h106l409-476 328 476h357L714 519ZM569 687l-47-67L147 77h162l303 434 47 67 393 562H890L569 687Z" />
    </svg>
  );
}

function LinkedinSvg({ size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M6.94 8.5H3.56V20h3.38V8.5ZM5.25 3A1.96 1.96 0 1 0 5.3 6.9 1.96 1.96 0 0 0 5.25 3ZM20.44 13.52c0-3.45-1.84-5.06-4.3-5.06-1.98 0-2.87 1.09-3.36 1.86V8.5H9.4V20h3.38v-6.38c0-.34.02-.68.13-.92.27-.68.9-1.39 1.95-1.39 1.38 0 1.93 1.05 1.93 2.58V20h3.38v-6.48Z" />
    </svg>
  );
}

function safeArray(v) {
  return Array.isArray(v) ? v : [];
}

function extractList(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
}

function normalizeEmbedUrl(url = "") {
  if (!url) return "";

  const trimmed = String(url).trim();

  const scriptSrcMatch = trimmed.match(/src=["']([^"']+)["']/i);
  const rawUrl = scriptSrcMatch ? scriptSrcMatch[1] : trimmed;

  if (!rawUrl) return "";

  if (rawUrl.includes("youtube.com/watch?v=")) {
    const videoId = rawUrl.split("v=")[1]?.split("&")[0];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : rawUrl;
  }

  if (rawUrl.includes("youtu.be/")) {
    const videoId = rawUrl.split("youtu.be/")[1]?.split("?")[0];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : rawUrl;
  }

  if (rawUrl.includes("youtube.com/embed/")) {
    return rawUrl;
  }

  const aparatEmbedMatch = rawUrl.match(/aparat\.com\/embed\/([^/?&]+)/i);
  if (aparatEmbedMatch) {
    const videoHash = aparatEmbedMatch[1];
    return `https://www.aparat.com/video/video/embed/videohash/${videoHash}/vt/frame`;
  }

  const aparatVideoMatch = rawUrl.match(/aparat\.com\/v\/([^/?&]+)/i);
  if (aparatVideoMatch) {
    const videoHash = aparatVideoMatch[1];
    return `https://www.aparat.com/video/video/embed/videohash/${videoHash}/vt/frame`;
  }

  if (rawUrl.includes("/video/video/embed/videohash/")) {
    return rawUrl;
  }

  return rawUrl;
}

function isVideoPost(post = {}) {
  return (
    (post?.mediaType || post?.media_type || "").toLowerCase() === "video" ||
    (post?.postType || post?.post_type || "").toLowerCase() === "video" ||
    !!post?.videoFile ||
    !!post?.video_file ||
    !!post?.embedUrl ||
    !!post?.embed_url
  );
}

function isPodcastPost(post = {}) {
  return (
    (post?.mediaType || post?.media_type || "").toLowerCase() === "podcast" ||
    (post?.postType || post?.post_type || "").toLowerCase() === "podcast" ||
    !!post?.audioFile ||
    !!post?.audio_file
  );
}

function getPostImage(post = {}) {
  return (
    post?.cover ||
    post?.image ||
    post?.coverImage ||
    post?.cover_image ||
    post?.thumbnail ||
    post?.video_thumbnail ||
    post?.videoThumbnail ||
    post?.poster ||
    ""
  );
}

function getPostVideoFile(post = {}) {
  return post?.videoFile || post?.video_file || "";
}

function getPostAudioFile(post = {}) {
  return post?.audioFile || post?.audio_file || "";
}

function getPostEmbedUrl(post = {}) {
  return post?.embedUrl || post?.embed_url || "";
}

function normalizeRelatedItem(item) {
  return {
    id: item?.id,
    slug: item?.slug,
    href: item?.href || (item?.slug ? `/news/${item.slug}` : "#"),
    title: item?.title || "بدون عنوان",
    description: item?.excerpt || item?.description || "",
    cover: getPostImage(item),
    category:
      item?.category?.title || item?.categoryTitle || item?.category || "",
    isVideo: isVideoPost(item),
    duration: item?.mediaDuration || item?.media_duration || "",
  };
}

function normalizeTrendingItem(item) {
  const publishedAt =
    item?.publishedAt ||
    item?.published_at ||
    item?.createdAt ||
    item?.created_at ||
    null;

  const timeLabel = publishedAt
    ? new Date(publishedAt).toLocaleDateString("fa-IR", {
        month: "long",
        day: "numeric",
      })
    : "—";

  return {
    id: item?.id ?? Math.random(),
    href: item?.href || (item?.slug ? `/news/${item.slug}` : "#"),
    tag: item?.category?.title || item?.category || "عمومی",
    title: item?.title || "بدون عنوان",
    time: timeLabel,
    hot: (item?.views ?? item?.viewsCount ?? 0) > 1000,
  };
}

function normalizeComment(c) {
  return {
    id: c?.id ?? Date.now() + Math.random(),
    author:
      c?.author_name ||
      c?.user?.full_name ||
      c?.user?.username ||
      c?.author ||
      "کاربر",
    date:
      c?.createdAt || c?.created_at
        ? new Date(c?.createdAt || c?.created_at).toLocaleDateString("fa-IR", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "لحظاتی پیش",
    ts:
      c?.createdAt || c?.created_at
        ? new Date(c?.createdAt || c?.created_at).getTime()
        : Date.now(),
    text: c?.content || c?.text || "",
  };
}

function getApiErrorMessage(error, fallback = "خطا در بارگذاری پست.") {
  const data = error?.response?.data;
  if (!data) return error?.message || fallback;
  if (typeof data === "string") return data;
  if (data?.detail) return data.detail;
  if (data?.message) return data.message;
  if (data?.error) return data.error;
  if (typeof data === "object") {
    const firstKey = Object.keys(data)[0];
    const firstVal = data[firstKey];
    if (Array.isArray(firstVal)) return firstVal[0];
    if (typeof firstVal === "string") return firstVal;
  }
  return fallback;
}

function MediaBlock({ post }) {
  const videoRef = useRef(null);
  const audioRef = useRef(null);

  const videoFile = getPostVideoFile(post);
  const audioFile = getPostAudioFile(post);
  const safeEmbedUrl = normalizeEmbedUrl(getPostEmbedUrl(post));
  const poster = getPostImage(post);

  useEffect(() => {
    let videoPlayer;
    let audioPlayer;

    if (videoRef.current && videoFile) {
      videoPlayer = new Plyr(videoRef.current, {
        controls: [
          "play-large",
          "play",
          "progress",
          "current-time",
          "duration",
          "mute",
          "volume",
          "settings",
          "fullscreen",
        ],
        settings: ["speed", "quality"],
        ratio: "16:9",
      });
    }

    if (audioRef.current && audioFile) {
      audioPlayer = new Plyr(audioRef.current, {
        controls: [
          "play",
          "progress",
          "current-time",
          "duration",
          "mute",
          "volume",
        ],
      });
    }

    return () => {
      videoPlayer?.destroy();
      audioPlayer?.destroy();
    };
  }, [videoFile, audioFile]);

  if (isVideoPost(post)) {
    if (videoFile) {
      return (
        <section className="border-b border-neutral-200  px-4 py-5 md:px-8 md:py-8">
          <div className="mx-auto w-full max-w-5xl">
            <div className="overflow-hidden rounded-2xl ">
              <div className="aspect-video w-full [&_.plyr]:h-full [&_.plyr]:w-full [&_.plyr__video-wrapper]:h-full [&_.plyr__video-wrapper]:w-full">
                <video
                  ref={videoRef}
                  controls
                  playsInline
                  preload="metadata"
                  poster={poster || undefined}
                  className="h-full w-full object-contain"
                >
                  <source src={videoFile} type="video/mp4" />
                </video>
              </div>
            </div>
          </div>
        </section>
      );
    }

    if (safeEmbedUrl) {
      return (
        <section className="border-b border-neutral-200 px-4 py-5 md:px-8 md:py-8">
          <div className="mx-auto w-full max-w-5xl">
            <div className="aspect-video overflow-hidden rounded-2xl">
              <iframe
                src={safeEmbedUrl}
                title={post?.title || "video"}
                className="h-full w-full"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </section>
      );
    }
  }

  if (isPodcastPost(post) && audioFile) {
    return (
      <section className="border-b border-neutral-200 bg-neutral-50 px-4 py-6 md:px-8 md:py-8">
        <div className="mx-auto w-full max-w-3xl">
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm md:p-5">
            {poster && (
              <img
                src={poster}
                alt={post?.title || "podcast"}
                className="mb-4 h-48 w-full rounded-xl object-cover md:h-64"
              />
            )}

            <div className="[&_.plyr]:w-full">
              <audio ref={audioRef} controls className="w-full">
                <source src={audioFile} />
              </audio>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return null;
}

function useSinglePostData(slug) {
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [isSaved, setIsSaved] = useState(false);
  const [bookmarkId, setBookmarkId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAll = useCallback(async () => {
    if (!slug) return;

    setLoading(true);
    setCommentsLoading(true);
    setError("");
    setPost(null);
    setComments([]);
    setIsSaved(false);
    setBookmarkId(null);

    try {
      const postData = await newsApi.getPost(slug);
      if (!postData?.id) throw new Error("پستی یافت نشد.");
      setPost(postData);

      const [commentsRes, bookmarkRes] = await Promise.allSettled([
        newsApi.getPostCommentsList(postData.id),
        newsApi.isBookmarked(postData.id),
      ]);

      if (commentsRes.status === "fulfilled") {
        const commentsList = extractList(commentsRes.value);
        setComments(safeArray(commentsList).map(normalizeComment));
      } else {
        setComments([]);
      }

      if (bookmarkRes.status === "fulfilled") {
        const bookmarkValue = bookmarkRes.value;
        if (typeof bookmarkValue === "object" && bookmarkValue !== null) {
          setIsSaved(!!bookmarkValue?.id);
          setBookmarkId(bookmarkValue?.id ?? null);
        } else {
          setIsSaved(!!bookmarkValue);
          setBookmarkId(null);
        }
      } else {
        setIsSaved(false);
        setBookmarkId(null);
      }
    } catch (err) {
      setError(getApiErrorMessage(err));
      setPost(null);
    } finally {
      setLoading(false);
      setCommentsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    post,
    comments,
    setComments,
    isSaved,
    setIsSaved,
    bookmarkId,
    setBookmarkId,
    loading,
    commentsLoading,
    error,
    refresh: fetchAll,
  };
}

export default function SinglePostPage() {
  const { slug } = useParams();

  const {
    post,
    comments,
    setComments,
    isSaved,
    setIsSaved,
    bookmarkId,
    setBookmarkId,
    loading,
    commentsLoading,
    error,
    refresh,
  } = useSinglePostData(slug);

  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [showToTop, setShowToTop] = useState(false);

  const [commentText, setCommentText] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentsSort, setCommentsSort] = useState("newest");
  const [visibleCommentsCount, setVisibleCommentsCount] =
    useState(COMMENTS_STEP);

  const [relatedItems, setRelatedItems] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(false);

  const [trendingItems, setTrendingItems] = useState([]);
  const [trendingLoading, setTrendingLoading] = useState(false);

  useEffect(() => {
    setVisibleCommentsCount(COMMENTS_STEP);
  }, [slug]);

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const total = el.scrollHeight - el.clientHeight;
      const progress = total > 0 ? (el.scrollTop / total) * 100 : 0;
      setReadingProgress(Math.min(100, Math.max(0, progress)));
      setShowToTop(el.scrollTop > 500);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    let mounted = true;

    async function fetchRelated() {
      if (!post) {
        setRelatedItems([]);
        return;
      }

      setRelatedLoading(true);

      try {
        const categorySlug =
          post?.category?.slug ||
          post?.categorySlug ||
          post?.category_slug ||
          "";

        let relatedRaw;

        if (categorySlug) {
          relatedRaw = await newsApi.getPosts({
            category: categorySlug,
            ordering: "-published_at",
            page_size: 9,
          });
        } else if (typeof newsApi.getLatestPosts === "function") {
          relatedRaw = await newsApi.getLatestPosts();
        } else {
          relatedRaw = [];
        }

        const list = extractList(relatedRaw);

        const filtered = safeArray(list).filter((item) => {
          if (!item) return false;
          if (post?.id && item?.id) return item.id !== post.id;
          if (post?.slug && item?.slug) return item.slug !== post.slug;
          return item?.title !== post?.title;
        });

        const prepared = filtered.slice(0, 8).map(normalizeRelatedItem);

        if (mounted) setRelatedItems(prepared);
      } catch {
        if (mounted) setRelatedItems([]);
      } finally {
        if (mounted) setRelatedLoading(false);
      }
    }

    fetchRelated();

    return () => {
      mounted = false;
    };
  }, [post]);

  useEffect(() => {
    let mounted = true;

    async function fetchTrending() {
      setTrendingLoading(true);

      try {
        let raw;

        if (typeof newsApi.getTrendingPosts === "function") {
          raw = await newsApi.getTrendingPosts({ page_size: 5 });
        } else {
          raw = await newsApi.getPosts({
            ordering: "-views,-published_at",
            page_size: 5,
          });
        }

        const list = extractList(raw);
        const prepared = safeArray(list).slice(0, 5).map(normalizeTrendingItem);

        if (mounted) setTrendingItems(prepared);
      } catch {
        if (mounted) setTrendingItems([]);
      } finally {
        if (mounted) setTrendingLoading(false);
      }
    }

    fetchTrending();

    return () => {
      mounted = false;
    };
  }, []);

  const safeHtml = useMemo(() => {
    if (!post?.content) return "";
    return DOMPurify.sanitize(post.content, { USE_PROFILES: { html: true } });
  }, [post?.content]);

  const sortedComments = useMemo(() => {
    const arr = [...comments];
    arr.sort((a, b) => (commentsSort === "newest" ? b.ts - a.ts : a.ts - b.ts));
    return arr;
  }, [comments, commentsSort]);

  const visibleComments = useMemo(
    () => sortedComments.slice(0, visibleCommentsCount),
    [sortedComments, visibleCommentsCount],
  );

  const hasMoreComments = visibleCommentsCount < sortedComments.length;

  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("fa-IR", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";

  const readTime = (content) => {
    if (!content) return 5;

    const words = content
      .replace(/<[^>]*>/g, "")
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;

    return Math.max(1, Math.ceil(words / 200));
  };

  const formattedViews = useMemo(() => {
    const views = post?.views ?? post?.viewsCount ?? 0;
    return new Intl.NumberFormat("fa-IR").format(views);
  }, [post?.views, post?.viewsCount]);

  const postTypeLabel = useMemo(() => {
    const postTypeValue = post?.postType || post?.post_type || post?.type || "";
    return POST_TYPES.find((t) => t.value === postTypeValue)?.label || "عمومی";
  }, [post]);

  const isVideo = isVideoPost(post);
  const isPodcast = isPodcastPost(post);
  const heroImage = getPostImage(post);

  const authorName =
    post?.author?.full_name ||
    post?.author?.email ||
    post?.author_name ||
    post?.author ||
    "تحریریه";

  const publishedAt =
    post?.publishedAt ||
    post?.published_at ||
    post?.createdAt ||
    post?.created_at;

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";
  const encodedUrl = encodeURIComponent(currentUrl);
  const encodedTitle = encodeURIComponent(post?.title || "");

  const handleCopy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(currentUrl);
      } else {
        const ta = document.createElement("textarea");
        ta.value = currentUrl;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleShareNative = async () => {
    if (!navigator.share) return;

    try {
      await navigator.share({
        title: post?.title,
        text: post?.excerpt || post?.description || post?.title,
        url: currentUrl,
      });
    } catch {}
  };

  const handleToggleBookmark = async () => {
    if (!post?.id || bookmarkLoading) return;

    setBookmarkLoading(true);

    try {
      if (isSaved && bookmarkId) {
        await newsApi.deleteBookmark(bookmarkId);
        setIsSaved(false);
        setBookmarkId(null);
      } else {
        const created = await newsApi.createBookmark(post.id);
        setIsSaved(true);
        setBookmarkId(created?.id ?? null);
      }
    } catch (err) {
      if (err?.response?.status === 401) {
        alert("برای ذخیره خبر باید وارد حساب شوید.");
      } else {
        alert("عملیات ذخیره انجام نشد.");
      }
    } finally {
      setBookmarkLoading(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    const text = commentText.trim();

    if (!text || !post?.id || commentSubmitting) return;

    setCommentSubmitting(true);

    try {
      const created = await newsApi.createComment({
        post: post.id,
        content: text,
      });

      const newComment = normalizeComment(created || { content: text });

      setComments((prev) => [newComment, ...prev]);
      setCommentText("");
      setCommentsSort("newest");
      setVisibleCommentsCount((prev) => Math.max(prev, COMMENTS_STEP));
    } catch (err) {
      if (err?.response?.status === 401) {
        alert("برای ثبت دیدگاه باید وارد حساب شوید.");
      } else {
        alert("ثبت دیدگاه انجام نشد.");
      }
    } finally {
      setCommentSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center">
        در حال بارگذاری...
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="grid min-h-screen place-items-center p-6">
        <div className="max-w-xl rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <h2 className="text-xl font-bold text-red-700">
            خطا در بارگذاری خبر
          </h2>

          <p className="mt-3 text-sm text-red-600">
            {error || "محتوایی یافت نشد"}
          </p>

          <button
            type="button"
            onClick={refresh}
            className="mt-4 rounded-xl bg-red-600 px-5 py-2 text-sm font-bold text-white hover:bg-red-700"
          >
            تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  const socialLinks = [
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: <FacebookSvg size={16} />,
    },
    {
      label: "X",
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      icon: <XSvg size={12} />,
    },
    {
      label: "LinkedIn",
      href: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}`,
      icon: <LinkedinSvg size={16} />,
    },
    {
      label: "Telegram",
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      icon: <TelegramSvg size={16} />,
    },
  ];

  return (
    <div dir="rtl" className="flex justify-center bg-white">
      <div
        className="fixed left-0 top-0 z-50 h-1 transition-all duration-150"
        style={{ width: `${readingProgress}%` }}
      />

      <main className="min-h-screen w-full max-w-7xl border-x border-neutral-200">
        <div className="flex flex-col xl:flex-row">
          <aside className="hidden justify-center border-l border-neutral-200 xl:flex xl:w-[72px]">
            <div className="sticky top-24 flex h-fit flex-col items-center gap-2 py-6">
              {socialLinks.map((btn) => (
                <a
                  key={btn.label}
                  href={btn.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="grid h-9 w-9 place-items-center rounded-full border border-neutral-300 transition-all hover:bg-black hover:text-white"
                  title={btn.label}
                >
                  {btn.icon}
                </a>
              ))}

              <button
                type="button"
                onClick={handleCopy}
                className={`grid h-9 w-9 place-items-center rounded-full border transition-all ${
                  copied
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : "border-neutral-300 hover:bg-black hover:text-white"
                }`}
                title="کپی لینک"
              >
                {copied ? <Check size={15} /> : <Copy size={15} />}
              </button>

              <button
                type="button"
                onClick={handleToggleBookmark}
                disabled={bookmarkLoading}
                className={`grid h-9 w-9 place-items-center rounded-full border transition-all disabled:opacity-60 ${
                  isSaved
                    ? "border-black bg-black text-white"
                    : "border-neutral-300 hover:bg-black hover:text-white"
                }`}
                title="ذخیره"
              >
                {isSaved ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
              </button>

              {typeof navigator !== "undefined" && !!navigator.share && (
                <button
                  type="button"
                  onClick={handleShareNative}
                  className="grid h-9 w-9 place-items-center rounded-full border border-neutral-300 transition-all hover:bg-black hover:text-white"
                  title="اشتراک‌گذاری"
                >
                  <Share2 size={15} />
                </button>
              )}
            </div>
          </aside>

          <section className="w-full xl:flex-1">
            <article>
              <header className="border-b border-neutral-200 px-4 py-6 md:px-8 md:py-8">
                <div className="mx-auto max-w-4xl">
                  <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-neutral-500">
                    <span className="rounded-full border border-neutral-300 bg-neutral-100 px-3 py-1 text-xs font-bold text-neutral-700">
                      {postTypeLabel}
                    </span>

                    {isVideo && (
                      <span className="inline-flex items-center gap-1 font-bold text-red-600">
                        <Play size={14} />
                        ویدیو
                      </span>
                    )}

                    {isPodcast && (
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                        <Volume2 size={14} />
                        پادکست
                      </span>
                    )}

                    <span className="inline-flex items-center gap-1">
                      <Clock3 size={14} />
                      {readTime(post?.content)} دقیقه مطالعه
                    </span>

                    <span className="inline-flex items-center gap-1">
                      <Eye size={14} />
                      {formattedViews} بازدید
                    </span>
                  </div>

                  <h1 className="mb-4 text-2xl font-black leading-[1.55] tracking-tight text-neutral-950 md:text-4xl md:leading-[1.45]">
                    {post?.title}
                  </h1>

                  {(post?.excerpt || post?.description) && (
                    <p className="max-w-3xl whitespace-pre-wrap text-[15px] leading-8 text-neutral-600 md:text-base">
                      {post?.excerpt || post?.description}
                    </p>
                  )}

                  <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-neutral-500 md:text-sm">
                    <span className="inline-flex items-center gap-1">
                      <User2 size={15} />
                      <span className="font-bold text-neutral-900">
                        {authorName}
                      </span>
                    </span>

                    <span className="inline-flex items-center gap-1">
                      <CalendarDays size={15} />
                      {formatDate(publishedAt)}
                    </span>
                  </div>
                </div>
              </header>

              <MediaBlock post={post} />

              {!isVideo && !isPodcast && !!heroImage && (
                <figure className="border-b border-neutral-200 bg-neutral-100 px-4 py-5 md:px-8 md:py-8">
                  <div className="mx-auto w-full max-w-5xl overflow-hidden rounded-2xl bg-neutral-200">
                    <img
                      src={heroImage}
                      alt={post?.title}
                      loading="lazy"
                      className="h-auto max-h-[620px] w-full object-cover"
                    />
                  </div>
                </figure>
              )}

              <div className="border-b border-neutral-200 px-4 py-8 md:px-8 md:py-10">
                <div
                  className="
    prose prose-neutral mx-auto max-w-3xl whitespace-pre-wrap leading-8
    prose-headings:font-black
    prose-h2:mt-10 prose-h2:text-2xl
    prose-h3:mt-8 prose-h3:text-xl
    prose-p:whitespace-pre-wrap prose-p:text-[15px] prose-p:leading-[2.15] prose-p:text-neutral-800
    prose-li:text-[15px] prose-li:leading-8
    prose-a:font-bold prose-a:text-black prose-a:no-underline hover:prose-a:underline
    prose-img:mx-auto prose-img:max-h-[520px] prose-img:w-auto prose-img:max-w-full prose-img:rounded-2xl
    prose-video:mx-auto prose-video:w-full
    prose-iframe:mx-auto prose-iframe:aspect-video prose-iframe:w-full prose-iframe:rounded-2xl
    md:prose-p:text-[17px]
    md:prose-li:text-[17px]
  "
                  dangerouslySetInnerHTML={{ __html: safeHtml }}
                />
              </div>

              <section className="border-b border-neutral-200 px-4 py-8 md:px-8">
                <div className="mx-auto max-w-3xl">
                  <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <MessageCircle size={20} />
                      <h3 className="text-lg font-black md:text-xl">
                        دیدگاه‌ها
                      </h3>
                      <span className="rounded-full bg-black px-2 py-0.5 text-[10px] font-bold text-white">
                        {comments.length}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <SlidersHorizontal
                        size={14}
                        className="text-neutral-500"
                      />

                      <select
                        value={commentsSort}
                        onChange={(e) => {
                          setCommentsSort(e.target.value);
                          setVisibleCommentsCount(COMMENTS_STEP);
                        }}
                        className="rounded-lg border border-neutral-300 bg-white px-2 py-1 text-[12px] outline-none"
                      >
                        <option value="newest">جدیدترین</option>
                        <option value="oldest">قدیمی‌ترین</option>
                      </select>
                    </div>
                  </div>

                  <form onSubmit={handleCommentSubmit} className="mb-7">
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="دیدگاه خود را بنویسید..."
                      rows={4}
                      maxLength={500}
                      className="w-full resize-none rounded-xl border border-neutral-300 p-4 text-sm outline-none focus:border-black"
                    />

                    <div className="mt-2 flex items-center justify-between">
                      <span
                        className={`text-xs ${
                          commentText.length > 450
                            ? "text-red-500"
                            : "text-neutral-400"
                        }`}
                      >
                        {commentText.length} / ۵۰۰
                      </span>

                      <button
                        type="submit"
                        disabled={!commentText.trim() || commentSubmitting}
                        className="rounded-lg bg-black px-5 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {commentSubmitting ? "در حال ارسال..." : "ثبت دیدگاه"}
                      </button>
                    </div>
                  </form>

                  {commentsLoading ? (
                    <div className="text-sm text-neutral-500">
                      در حال دریافت دیدگاه‌ها...
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {visibleComments.map((c) => (
                        <article
                          key={c.id}
                          className="rounded-xl border border-neutral-200 p-4"
                        >
                          <div className="mb-2 flex items-center gap-2">
                            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-black text-xs font-bold text-white">
                              {c.author?.charAt(0) || "ک"}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-bold">
                                {c.author}
                              </p>

                              <p className="text-[11px] text-neutral-400">
                                {c.date}
                              </p>
                            </div>
                          </div>

                          <p className="whitespace-pre-wrap pr-11 text-[14px] leading-8 text-neutral-700 md:text-[15px]">
                            {c.text}
                          </p>
                        </article>
                      ))}
                    </div>
                  )}

                  <div className="mt-6 flex items-center justify-center gap-3">
                    {hasMoreComments && (
                      <button
                        type="button"
                        onClick={() =>
                          setVisibleCommentsCount(
                            (prev) => prev + COMMENTS_STEP,
                          )
                        }
                        className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-300 px-4 py-2 text-sm font-bold"
                      >
                        مشاهده بیشتر
                        <ChevronDown size={16} />
                      </button>
                    )}

                    {visibleCommentsCount > COMMENTS_STEP && (
                      <button
                        type="button"
                        onClick={() => setVisibleCommentsCount(COMMENTS_STEP)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-300 px-4 py-2 text-sm text-neutral-600"
                      >
                        نمایش کمتر
                        <ChevronUp size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </section>
            </article>
          </section>

          <aside className="hidden border-r border-neutral-200 xl:block xl:w-[320px]">
            <div className="sticky top-24 p-5">
              <div className="mb-4 flex items-center gap-2">
                <Flame size={18} />
                <h4 className="text-sm font-black tracking-wider">
                  پرخواننده‌ترین‌ها
                </h4>
              </div>

              <div className="divide-y divide-neutral-200">
                {trendingLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="animate-pulse py-3">
                      <div className="mb-2 h-3 w-16 rounded bg-neutral-200" />
                      <div className="mb-2 h-4 w-full rounded bg-neutral-200" />
                      <div className="h-3 w-20 rounded bg-neutral-200" />
                    </div>
                  ))
                ) : trendingItems.length > 0 ? (
                  trendingItems.map((a, i) => (
                    <Link
                      key={a.id}
                      to={a.href}
                      className="group flex gap-3 py-3"
                    >
                      <span className="text-2xl font-black text-neutral-200">
                        {i + 1}
                      </span>

                      <div className="min-w-0">
                        <div className="mb-1 flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-neutral-400">
                            {a.tag}
                          </span>

                          {a.hot && (
                            <span className="rounded bg-red-500 px-1.5 py-0.5 text-[9px] text-white">
                              داغ
                            </span>
                          )}
                        </div>

                        <p className="line-clamp-2 text-[13px] leading-6 text-neutral-800">
                          {a.title}
                        </p>

                        <span className="text-[11px] text-neutral-400">
                          {a.time}
                        </span>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="py-3 text-sm text-neutral-500">
                    موردی برای نمایش وجود ندارد.
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>

        <section className="border-t-2 border-black px-4 py-8 md:px-8">
          {relatedLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-56 animate-pulse rounded-xl bg-neutral-100"
                />
              ))}
            </div>
          ) : relatedItems.length > 0 ? (
            <CategoryNewsSection
              title="بیشتر بخوانید"
              href="#"
              layout="grid-4"
              stories={relatedItems}
            />
          ) : (
            <div className="rounded-xl border border-dashed border-neutral-300 p-4 text-sm text-neutral-500">
              خبر مرتبطی برای نمایش وجود ندارد.
            </div>
          )}
        </section>
      </main>

      {showToTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 left-6 z-40 grid h-11 w-11 place-items-center rounded-full bg-black text-white shadow-lg"
          title="بازگشت به بالا"
        >
          <ArrowUp size={18} />
        </button>
      )}
    </div>
  );
}
