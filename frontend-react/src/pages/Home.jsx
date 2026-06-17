import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import CategoryPostsFeed from "../components/home/CategoryPostsFeed";
import { newsApi } from "../lib/news/newsApi";
import { useMarketData } from "../hooks/useMarketData";
import { api } from "../lib/axiosClient";
import {
  normalizeCategories,
  normalizePosts,
  normalizeTags,
} from "../lib/normalizers";

import Stocks from "../components/home/Stocks";
import LargNews from "../components/home/LargNews";
import RelatedNews from "../components/home/RelatedNews";
import SnowflakeVideoCard from "../components/home/SnowflakeVideoCard";
import MarketPriceFeed from "../components/home/MarketPriceFeed";
import HotNews from "../components/home/HotNews";
import MediumVideoNews from "../components/home/MediumVideoNews";
import AdBox from "../components/home/AdBox";
import LatestNewsList from "../components/home/LatestNewsList";
import InFocusTopics from "../components/home/InFocusTopics";
import AuthorsSection from "../components/home/AuthorsSection";
import CategoryNewsSection from "../components/home/CategoryNewsSection";

const HERO_SLOT_ORDER = [
  "main",
  "top_left",
  "bottom_left",
  "bottom_center",
  "bottom_right",
];

const VIDEO_SLOT_ORDER = ["main", "top", "middle", "bottom"];

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function getPostTitle(post) {
  return post?.title || post?.post_title || "بدون عنوان";
}

function getPostSlug(post) {
  return post?.slug || post?.post_slug || "";
}

function getPostHref(post) {
  const slug = getPostSlug(post);

  return post?.href || (slug ? `/news/${slug}` : "#");
}

function getPostDescription(post) {
  return (
    post?.description ||
    post?.excerpt ||
    post?.summary ||
    post?.post_description ||
    post?.post_excerpt ||
    post?.post_summary ||
    ""
  );
}

function getPostTypeText(post) {
  return (
    post?.post_type_label ||
    post?.media_type_label ||
    post?.type_label ||
    post?.postTypeLabel ||
    post?.mediaTypeLabel ||
    post?.post_type ||
    post?.media_type ||
    post?.type ||
    ""
  );
}

function getPostCategoryTitle(post) {
  const category = post?.category;

  if (typeof category === "string") return category;
  if (category?.title) return category.title;
  if (category?.name) return category.name;

  return (
    post?.categoryTitle ||
    post?.category_title ||
    post?.categoryName ||
    post?.category_name ||
    getPostTypeText(post) ||
    "خبر"
  );
}

function getPostAuthorName(post) {
  const author = post?.author;

  if (typeof author === "string") return author;
  if (author?.full_name) return author.full_name;
  if (author?.name) return author.name;
  if (author?.first_name || author?.last_name) {
    return `${author.first_name || ""} ${author.last_name || ""}`.trim();
  }
  if (author?.email) return author.email;

  return (
    post?.authorName ||
    post?.author_name ||
    post?.user?.full_name ||
    post?.user?.name ||
    "نویسنده شاخص‌یک"
  );
}

function getPostAuthorId(post, fallback = 0) {
  return (
    post?.authorId ||
    post?.author_id ||
    post?.author?.id ||
    post?.user?.id ||
    fallback
  );
}

function getPostAuthorAvatar(post) {
  return (
    post?.authorAvatar ||
    post?.author_avatar ||
    post?.authorImage ||
    post?.author_image ||
    post?.author?.avatar ||
    post?.author?.image ||
    post?.author?.profile_image ||
    post?.user?.avatar ||
    post?.user?.image ||
    post?.user?.profile_image ||
    ""
  );
}

function getPostImage(post) {
  return (
    post?.image ||
    post?.cover ||
    post?.cover_image ||
    post?.coverImage ||
    post?.thumbnail ||
    post?.featured_image ||
    post?.featuredImage ||
    post?.poster ||
    post?.poster_image ||
    post?.posterImage ||
    post?.banner ||
    ""
  );
}

function getPostEmbedUrl(post) {
  return post?.embedUrl || post?.embed_url || "";
}

function getPostVideoFile(post) {
  return post?.videoFile || post?.video_file || "";
}

function getPostAudioFile(post) {
  return post?.audioFile || post?.audio_file || "";
}

function getPostPodcastFile(post) {
  return post?.podcastFile || post?.podcast_file || "";
}

function isVideoPost(post) {
  return (
    post?.media_type === "video" ||
    post?.post_media_type === "video" ||
    post?.post_type === "video" ||
    !!post?.video_file ||
    !!post?.videoFile ||
    !!post?.embed_url ||
    !!post?.embedUrl
  );
}

function isAudioPost(post) {
  return (
    post?.media_type === "audio" ||
    post?.media_type === "podcast" ||
    post?.post_media_type === "audio" ||
    post?.post_media_type === "podcast" ||
    post?.post_type === "audio" ||
    post?.post_type === "podcast" ||
    post?.post_type === "voice" ||
    post?.post_type === "sound" ||
    !!post?.audio_file ||
    !!post?.audioFile ||
    !!post?.podcast_file ||
    !!post?.podcastFile
  );
}

function getVideoPoster(post) {
  return (
    post?.video_thumbnail ||
    post?.videoThumbnail ||
    post?.thumbnail ||
    post?.poster ||
    post?.poster_image ||
    post?.posterImage ||
    ""
  );
}

function getPostVisual(post) {
  if (!post) return "";

  const image = getPostImage(post);
  if (image) return image;

  if (isVideoPost(post)) {
    const poster = getVideoPoster(post);
    if (poster) return poster;
  }

  return "";
}

function getPostIdentity(item) {
  return (
    item?.id ??
    item?.post_id ??
    item?.slug ??
    item?.post_slug ??
    item?.href ??
    item?.title ??
    item?.post_title ??
    null
  );
}

function normalizePostForDisplay(post) {
  if (!post) return null;

  const title = getPostTitle(post);
  const slug = getPostSlug(post);
  const href = getPostHref(post);
  const description = getPostDescription(post);
  const categoryTitle = getPostCategoryTitle(post);
  const typeText = getPostTypeText(post);
  const authorName = getPostAuthorName(post);

  return {
    ...post,
    id: post?.id || post?.post_id || slug || title,
    post_id: post?.post_id || post?.id,
    title,
    post_title: title,
    slug,
    post_slug: slug,
    href,
    description,
    excerpt: post?.excerpt || post?.post_excerpt || description,
    summary: post?.summary || post?.post_summary || description,
    image: getPostImage(post),
    cover: getPostVisual(post),
    category: categoryTitle,
    categoryTitle,
    category_title: categoryTitle,
    typeText,
    postTypeText: typeText,
    author: authorName,
    authorName,
    author_name: authorName,
    embedUrl: getPostEmbedUrl(post),
    embed_url: getPostEmbedUrl(post),
    videoFile: getPostVideoFile(post),
    video_file: getPostVideoFile(post),
    audioFile: getPostAudioFile(post),
    audio_file: getPostAudioFile(post),
    podcastFile: getPostPodcastFile(post),
    podcast_file: getPostPodcastFile(post),
    isVideo: isVideoPost(post),
    isAudio: isAudioPost(post),
  };
}

function uniqueByIdOrTitle(items = []) {
  const seen = new Set();

  return safeArray(items).filter((item) => {
    const key = getPostIdentity(item);

    if (!key || seen.has(key)) return false;

    seen.add(key);
    return true;
  });
}

function pickFeatured(items = []) {
  return (
    items.find((item) => item?.isHero || item?.is_hero) ||
    items.find((item) => item?.isFeatured || item?.is_featured) ||
    items[0] ||
    null
  );
}

function isSamePost(a, b) {
  if (!a || !b) return false;

  const aId = a.id || a.post_id;
  const bId = b.id || b.post_id;
  const aSlug = a.slug || a.post_slug;
  const bSlug = b.slug || b.post_slug;
  const aTitle = a.title || a.post_title;
  const bTitle = b.title || b.post_title;

  if (aId && bId) return aId === bId;
  if (aSlug && bSlug) return aSlug === bSlug;

  return Boolean(aTitle && bTitle && aTitle === bTitle);
}

function pickDifferentPost(posts = [], excludedPosts = []) {
  return (
    safeArray(posts).find((post) =>
      excludedPosts.every((excluded) => !isSamePost(post, excluded)),
    ) || null
  );
}

function filterUniquePosts(
  items = [],
  excludedPosts = [],
  usedKeys = new Set(),
) {
  return uniqueByIdOrTitle(safeArray(items)).filter((item) => {
    const key = getPostIdentity(item);

    if (!key) return false;
    if (usedKeys.has(key)) return false;

    return excludedPosts.every((excluded) => !isSamePost(item, excluded));
  });
}

function takePosts(
  items = [],
  count,
  usedKeys = new Set(),
  excludedPosts = [],
) {
  const selected = [];

  for (const item of safeArray(items)) {
    const key = getPostIdentity(item);

    if (!key) continue;
    if (usedKeys.has(key)) continue;
    if (excludedPosts.some((excluded) => isSamePost(item, excluded))) continue;

    selected.push(item);
    usedKeys.add(key);

    if (selected.length >= count) break;
  }

  return selected;
}

function mapVideoResults(results) {
  const mapped = {
    main: null,
    top: null,
    middle: null,
    bottom: null,
  };

  if (!Array.isArray(results)) return mapped;

  results.forEach((item) => {
    if (!item?.slot || !VIDEO_SLOT_ORDER.includes(item.slot)) return;

    if (!item?.post_id || item?.is_active === false) {
      mapped[item.slot] = null;
      return;
    }

    mapped[item.slot] = normalizePostForDisplay({
      id: item.post_id,
      post_id: item.post_id,
      title: item.post_title || "بدون عنوان",
      post_title: item.post_title || "بدون عنوان",
      slug: item.post_slug || "",
      post_slug: item.post_slug || "",
      media_type: item.post_media_type || "video",
      post_media_type: item.post_media_type || "video",
      post_type: item.post_type || "",
      post_type_label: item.post_type_label || "",
      media_type_label: item.media_type_label || "",
      published_at: item.published_at || "",
      cover: item.cover || "",
      image: item.cover || "",
      href: item.post_slug ? `/news/${item.post_slug}` : "#",
      description:
        item.post_description || item.post_excerpt || item.post_summary || "",
      excerpt: item.post_excerpt || item.post_summary || "",
      summary: item.post_summary || item.post_excerpt || "",
      embed_url: item.embed_url || "",
      video_file: item.video_file || "",
      media_duration: item.media_duration || null,
    });
  });

  return mapped;
}

function mapHeroResults(results) {
  const mapped = {
    main: null,
    top_left: null,
    bottom_left: null,
    bottom_center: null,
    bottom_right: null,
  };

  if (!Array.isArray(results)) return mapped;

  results.forEach((item) => {
    if (!item?.slot || !HERO_SLOT_ORDER.includes(item.slot)) return;

    if (!item?.post_id || item?.is_active === false) {
      mapped[item.slot] = null;
      return;
    }

    mapped[item.slot] = normalizePostForDisplay({
      id: item.post_id,
      post_id: item.post_id,
      title: item.post_title || "بدون عنوان",
      post_title: item.post_title || "بدون عنوان",
      slug: item.post_slug || "",
      post_slug: item.post_slug || "",
      status: item.post_status || "",
      media_type: item.post_media_type || "none",
      post_media_type: item.post_media_type || "none",
      post_type: item.post_type || "",
      post_type_label: item.post_type_label || "",
      media_type_label: item.media_type_label || "",
      published_at: item.published_at || "",
      cover: item.cover || "",
      image: item.cover || "",
      href: item.post_slug ? `/news/${item.post_slug}` : "#",
      description:
        item.post_description || item.post_excerpt || item.post_summary || "",
      excerpt: item.post_excerpt || item.post_summary || "",
      summary: item.post_summary || item.post_excerpt || "",
      category: item.category || item.category_title || "",
      categoryTitle:
        item.category_title ||
        item.category?.title ||
        item.category?.name ||
        "",
      category_title:
        item.category_title ||
        item.category?.title ||
        item.category?.name ||
        "",
      video_file: item.video_file || "",
      embed_url: item.embed_url || "",
      audio_file: item.audio_file || "",
      podcast_file: item.podcast_file || "",
    });
  });

  return mapped;
}

function toLargeNewsData(post, bottomPost = null) {
  if (!post) {
    return {
      title: "محتوایی برای نمایش وجود ندارد",
      description: "",
      categoryText: "خبر",
      typeText: "",
      image: "",
      cover: "",
      href: "#",
      bottomNewsTitle: "",
      bottomNewsDescription: "",
      bottomNewsHref: "#",
      embedUrl: "",
      videoFile: "",
      audioFile: "",
      podcastFile: "",
      isVideo: false,
    };
  }

  return {
    title: getPostTitle(post),
    description: getPostDescription(post),
    categoryText: getPostCategoryTitle(post),
    typeText: getPostTypeText(post),
    image: getPostImage(post),
    cover: getPostVisual(post),
    href: getPostHref(post),
    bottomNewsTitle: bottomPost ? getPostTitle(bottomPost) : "",
    bottomNewsDescription: bottomPost ? getPostDescription(bottomPost) : "",
    bottomNewsHref: bottomPost ? getPostHref(bottomPost) : "#",
    embedUrl: getPostEmbedUrl(post),
    videoFile: getPostVideoFile(post),
    audioFile: getPostAudioFile(post),
    podcastFile: getPostPodcastFile(post),
    isVideo: isVideoPost(post),
  };
}

function makeRelatedNews(posts = []) {
  return uniqueByIdOrTitle(posts)
    .slice(0, 3)
    .map((item) => ({
      id: item?.id || item?.post_id || getPostSlug(item) || getPostTitle(item),
      title: getPostTitle(item),
      href: getPostHref(item),
      typeText: getPostTypeText(item),
      category: getPostCategoryTitle(item),
    }))
    .filter((item) => item.title);
}

function makeCategorySections(categories = [], postsByCategory = []) {
  const layouts = [
    "grid-4",
    "feature-list-sidebar",
    "magazine",
    "grid-4",
    "feature-list-sidebar",
  ];

  return safeArray(categories).map((category, index) => {
    const layout = layouts[index % layouts.length];
    const categoryPosts = safeArray(postsByCategory[index])
      .slice(0, 8)
      .map(normalizePostForDisplay)
      .filter(Boolean);

    return {
      title: category?.title || "دسته‌بندی",
      href: category?.href || `/category/${category?.slug || ""}`,
      layout,
      featured: categoryPosts[0] || null,
      stories: categoryPosts,
      sidebar: categoryPosts.slice(4, 8),
      tabs: safeArray(categories).map((cat) => ({
        label: cat?.title,
        value: cat?.slug,
        href: cat?.href || `/category/${cat?.slug || ""}`,
      })),
      activeTab: category?.slug,
    };
  });
}

function getApiErrorMessage(
  error,
  fallback = "خطا در دریافت اطلاعات صفحه اصلی",
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

function HomeSkeleton() {
  return (
    <div className="flex justify-center bg-white home-safe overflow-hidden w-full">
      <main className="min-h-screen w-full max-w-7xl border-x border-neutral-200 overflow-hidden">
        <div className="h-14 animate-pulse border-b border-neutral-200 bg-neutral-100" />

        <div className="flex flex-col lg:flex-row">
          <div className="w-full border-b border-neutral-200 lg:w-1/3 lg:border-e lg:border-b-0">
            <div className="space-y-4 p-3 sm:p-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-32 sm:h-40 animate-pulse rounded-xl bg-neutral-100"
                />
              ))}
            </div>
          </div>

          <div className="w-full min-w-0 space-y-6 p-4 sm:p-6 lg:w-2/3">
            <div className="h-72 sm:h-96 animate-pulse rounded-2xl bg-neutral-100" />
            <div className="grid gap-4 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-24 animate-pulse rounded-xl bg-neutral-100"
                />
              ))}
            </div>
            <div className="h-72 animate-pulse rounded-2xl bg-neutral-100" />
          </div>
        </div>
      </main>
    </div>
  );
}

function HomeError({ message, onRetry }) {
  return (
    <div className="flex justify-center bg-white home-safe overflow-hidden w-full">
      <main className="flex min-h-screen w-full max-w-7xl items-center justify-center border-x border-neutral-200 p-6 overflow-hidden">
        <div className="w-full max-w-xl rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <h2 className="text-xl font-bold text-red-700">
            خطا در بارگذاری صفحه
          </h2>

          <p className="mt-3 text-sm leading-7 text-red-600">{message}</p>

          <button
            type="button"
            onClick={onRetry}
            className="mt-5 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white hover:bg-red-700"
          >
            تلاش مجدد
          </button>
        </div>
      </main>
    </div>
  );
}

function EmptyBlock({ title }) {
  return (
    <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-4 sm:p-6 text-center text-sm text-neutral-500">
      {title}
    </div>
  );
}

function mapVideoPosts(posts = []) {
  return safeArray(posts)
    .map(normalizePostForDisplay)
    .filter(Boolean)
    .map((post) => ({
      ...post,
      duration: post?.media_duration || "",
      isVideo: isVideoPost(post),
    }));
}

function useHomeData(categorySlug = null, postType = null) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setPageError("");

    try {
      const isCategoryPage = Boolean(categorySlug);
      const isTypePage = Boolean(postType);
      const isFiltered = isCategoryPage || isTypePage;

      const baseQuery = {
        category: categorySlug || undefined,
        post_type: postType || undefined,
      };

      const [
        heroResult,
        videoSlotsResult,
        homeResult,
        latestResult,
        popularResult,
        categoriesResult,
        tagsResult,
        videosResult,
        adsResult,
      ] = await Promise.allSettled([
        newsApi.getHomeHero(),
        newsApi.getHomeVideo(),

        isFiltered
          ? newsApi.getPosts({
              ...baseQuery,
              ordering: "-published_at",
            })
          : newsApi.getHomePosts(),

        isFiltered
          ? newsApi.getPosts({
              ...baseQuery,
              ordering: "-published_at",
            })
          : newsApi.getLatestPosts(),

        isFiltered
          ? newsApi.getPosts({
              ...baseQuery,
              ordering: "-views_count",
            })
          : newsApi.getPopularPosts(),

        newsApi.getCategories({ ordering: "title" }),
        newsApi.getTags({ ordering: "-posts_count" }),

        newsApi.getPosts({
          media_type: "video",
          post_type: postType || undefined,
          ordering: "-published_at",
        }),

        api
          .get("/marketing/public-ads/")
          .then((res) => res.data)
          .catch(() => ({})),
      ]);

      const heroSlots =
        heroResult.status === "fulfilled"
          ? mapHeroResults(heroResult.value?.results || [])
          : {
              main: null,
              top_left: null,
              bottom_left: null,
              bottom_center: null,
              bottom_right: null,
            };

      const videoSlots =
        videoSlotsResult.status === "fulfilled"
          ? mapVideoResults(videoSlotsResult.value?.results || [])
          : {
              main: null,
              top: null,
              middle: null,
              bottom: null,
            };

      const homePosts =
        homeResult.status === "fulfilled"
          ? normalizePosts(homeResult.value).map(normalizePostForDisplay)
          : [];

      const latestNews =
        latestResult.status === "fulfilled"
          ? normalizePosts(latestResult.value).map(normalizePostForDisplay)
          : [];

      const popularPosts =
        popularResult.status === "fulfilled"
          ? normalizePosts(popularResult.value).map(normalizePostForDisplay)
          : [];

      const categories =
        categoriesResult.status === "fulfilled"
          ? normalizeCategories(categoriesResult.value)
          : [];

      const tags =
        tagsResult.status === "fulfilled"
          ? normalizeTags(tagsResult.value)
          : [];

      const videos =
        videosResult.status === "fulfilled"
          ? mapVideoPosts(normalizePosts(videosResult.value))
          : [];

      const ads =
        adsResult.status === "fulfilled" && adsResult.value
          ? adsResult.value
          : {};

      const selectedCategory = isCategoryPage
        ? categories.find((c) => c.slug === categorySlug)
        : null;

      const sectionCategories = isCategoryPage
        ? selectedCategory
          ? [selectedCategory]
          : []
        : categories;

      const postsByCategory = await Promise.all(
        sectionCategories.map(async (category) => {
          try {
            const d = await newsApi.getPosts({
              category: category.slug,
              post_type: postType || undefined,
              ordering: "-published_at",
            });

            return normalizePosts(d).map(normalizePostForDisplay);
          } catch {
            return [];
          }
        }),
      );

      setData({
        heroSlots,
        videoSlots,
        homePosts: homePosts.filter(Boolean),
        latestNews: latestNews.filter(Boolean),
        popularPosts: popularPosts.filter(Boolean),
        categories,
        sectionCategories,
        tags,
        videos,
        postsByCategory,
        currentCategory: selectedCategory,
        isCategoryPage,
        isTypePage,
        postType,
        ads,
      });
    } catch (error) {
      console.error("Home API Error:", error);
      setPageError(getApiErrorMessage(error));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [categorySlug, postType]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    data,
    loading,
    error: pageError,
    refresh: fetchAll,
  };
}

export default function Home() {
  const { categorySlug, postType } = useParams();
  const { data, loading, error, refresh } = useHomeData(categorySlug, postType);
  const { marketItems, marketLoading } = useMarketData();

  const viewModel = useMemo(() => {
    if (!data) return null;

    const {
      heroSlots,
      videoSlots,
      homePosts,
      latestNews,
      popularPosts,
      categories,
      sectionCategories,
      tags,
      videos,
      postsByCategory,
      currentCategory,
      isCategoryPage,
      ads,
    } = data;

    const postsForHero = homePosts.length ? homePosts : latestNews;

    const mainPost = isCategoryPage
      ? pickFeatured(postsForHero) || null
      : heroSlots?.main || pickFeatured(postsForHero) || null;

    const topLeftPost = isCategoryPage
      ? pickDifferentPost(postsForHero, [mainPost]) || null
      : heroSlots?.top_left ||
        pickDifferentPost(postsForHero, [mainPost]) ||
        null;

    const bottomLeftPost = isCategoryPage
      ? pickDifferentPost(postsForHero, [mainPost, topLeftPost]) || null
      : heroSlots?.bottom_left ||
        pickDifferentPost(postsForHero, [mainPost, topLeftPost]) ||
        null;

    const bottomCenterPost = isCategoryPage
      ? pickDifferentPost(postsForHero, [
          mainPost,
          topLeftPost,
          bottomLeftPost,
        ]) || null
      : heroSlots?.bottom_center ||
        pickDifferentPost(postsForHero, [
          mainPost,
          topLeftPost,
          bottomLeftPost,
        ]) ||
        null;

    const bottomRightPost = isCategoryPage
      ? pickDifferentPost(postsForHero, [
          mainPost,
          topLeftPost,
          bottomLeftPost,
          bottomCenterPost,
        ]) || null
      : heroSlots?.bottom_right ||
        pickDifferentPost(postsForHero, [
          mainPost,
          topLeftPost,
          bottomLeftPost,
          bottomCenterPost,
        ]) ||
        null;

    const largeNewsData = toLargeNewsData(mainPost, topLeftPost);

    const heroRelatedPosts = [
      bottomLeftPost,
      bottomCenterPost,
      bottomRightPost,
    ].filter(Boolean);

    const excludedForRelated = [
      mainPost,
      topLeftPost,
      bottomLeftPost,
      bottomCenterPost,
      bottomRightPost,
    ].filter(Boolean);

    const fallbackRelatedPosts = uniqueByIdOrTitle([
      ...postsForHero.filter((item) =>
        excludedForRelated.every((excluded) => !isSamePost(item, excluded)),
      ),
      ...latestNews.filter((item) =>
        excludedForRelated.every((excluded) => !isSamePost(item, excluded)),
      ),
      ...popularPosts.filter((item) =>
        excludedForRelated.every((excluded) => !isSamePost(item, excluded)),
      ),
    ]);

    const relatedNewsData = makeRelatedNews([
      ...heroRelatedPosts,
      ...fallbackRelatedPosts,
    ]);

    const mediumMainPost = pickDifferentPost(postsForHero, excludedForRelated);
    const mediumBottomPost = pickDifferentPost(postsForHero, [
      ...excludedForRelated,
      mediumMainPost,
    ]);

    const mainVideo = videoSlots?.main || null;

    // 🚀 اصلاح منطق ویدیوها: انتخاب دقیق ۳ اسلات هیرو و ترکیب با لیست ویدیوها تا ۱۰ عدد
    const heroVideos = [
      heroSlots?.main,
      heroSlots?.top_left,
      heroSlots?.bottom_left,
    ].filter((post) => post && isVideoPost(post));

    const rawVideos = videos || [];

    const combinedVideos = [
      ...heroVideos,
      ...rawVideos.filter((v) => !heroVideos.some((hv) => isSamePost(hv, v))),
    ];

    const videoData = combinedVideos.slice(0, 10).map((video) => ({
      id: video.id || video.post_id || getPostSlug(video),
      image: getPostVisual(video),
      title: getPostTitle(video),
      duration: video.media_duration || "",
      href: getPostHref(video),
      embedUrl: getPostEmbedUrl(video),
      videoFile: getPostVideoFile(video),
      typeText: getPostTypeText(video),
      category: getPostCategoryTitle(video),
      isVideo: true,
    }));

    const mediumVideoNewsData = mainVideo
      ? {
          title: getPostTitle(mainVideo),
          description: getPostDescription(mainVideo),
          suggestedLabel: getPostTypeText(mainVideo) || "ویدیوی پیشنهادی",
          suggestedVideoThumbnail: getPostVisual(mainVideo),
          suggestedVideoTitle: getPostTitle(mainVideo),
          suggestedVideoHref: getPostHref(mainVideo),
          suggestedVideoAlt: getPostTitle(mainVideo),
          embedUrl: getPostEmbedUrl(mainVideo),
          videoFile: getPostVideoFile(mainVideo),
          image: getPostVisual(mainVideo),
          href: getPostHref(mainVideo),
          typeText: getPostTypeText(mainVideo),
          category: getPostCategoryTitle(mainVideo),
          isVideo: true,
        }
      : null;

    const normalPostPool = uniqueByIdOrTitle([
      ...homePosts,
      ...latestNews,
      ...popularPosts,
    ]).filter((post) => !isVideoPost(post));

    const normalMediumPost = pickDifferentPost(normalPostPool, [
      ...excludedForRelated,
      mediumMainPost,
      mediumBottomPost,
    ]);

    const normalLargeItem = normalMediumPost
      ? {
          title: getPostTitle(normalMediumPost),
          description: getPostDescription(normalMediumPost),
          category: getPostCategoryTitle(normalMediumPost),
          typeText: getPostTypeText(normalMediumPost),
          cover: getPostVisual(normalMediumPost),
          href: getPostHref(normalMediumPost),
        }
      : null;

    const inFocusItems = tags.slice(0, 7).map((tag) => ({
      id: tag.id,
      title: tag.title,
      slug: tag.slug,
      href: tag.href || `/tags/${tag.slug}`,
    }));

    const hotNewsItems = uniqueByIdOrTitle([...popularPosts, ...videos])
      .slice(0, 6)
      .map((item) => ({
        id: item.id || item.post_id || getPostSlug(item),
        label: getPostTitle(item),
        href: getPostHref(item),
        isVideo: isVideoPost(item),
        mediaType: item.media_type || item.post_type || "",
        typeText: getPostTypeText(item),
        category: getPostCategoryTitle(item),
        videoFile: getPostVideoFile(item),
        embedUrl: getPostEmbedUrl(item),
      }));

    const latestList = uniqueByIdOrTitle(latestNews)
      .slice(0, 10)
      .map(normalizePostForDisplay)
      .filter(Boolean);

    const authors = uniqueByIdOrTitle(
      latestNews
        .filter((item) => item.author || item.authorName || item.user)
        .slice(0, 10)
        .map((item, index) => {
          const authorId = getPostAuthorId(item, index);

          return {
            id: authorId,
            name: getPostAuthorName(item),
            role: getPostCategoryTitle(item),
            bio:
              item.authorBio ||
              item.author_bio ||
              getPostDescription(item) ||
              "نویسنده و تحلیلگر خبرهای روز در شاخص‌یک.",
            avatar: getPostAuthorAvatar(item),
            href: item.authorHref || item.author_href || `/authors/${authorId}`,
          };
        }),
    ).slice(0, 3);

    const categoriesForSections =
      sectionCategories?.length > 0 ? sectionCategories : categories;

    const categorySections = makeCategorySections(
      categoriesForSections,
      postsByCategory,
    ).filter((section) => {
      return (
        section.featured || section.stories?.length || section.sidebar?.length
      );
    });

    if (!isCategoryPage && videos.length) {
      categorySections.push({
        title: "ویدیوهای اختصاصی",
        href: "/videos",
        layout: "video-row",
        stories: videos.slice(0, 5),
        sidebar: videos.slice(5, 8),
      });
    }

    return {
      pageTitle: isCategoryPage ? currentCategory?.title || "دسته‌بندی" : null,
      isCategoryPage,
      largeNewsData,
      relatedNewsData,
      videoData,
      mediumVideoNewsData,
      normalLargeItem,
      inFocusItems,
      hotNewsItems,
      authors,
      categorySections,
      latestList,
      popularPosts,
      videos,
      ads,
    };
  }, [data]);

  if (loading) {
    return <HomeSkeleton />;
  }

  if (error && !data) {
    return <HomeError message={error} onRetry={refresh} />;
  }

  if (!viewModel) {
    return null;
  }

  const {
    pageTitle,
    isCategoryPage,
    largeNewsData,
    relatedNewsData,
    videoData,
    mediumVideoNewsData,
    normalLargeItem,
    inFocusItems,
    hotNewsItems,
    authors,
    categorySections,
    latestList,
    popularPosts,
    ads,
  } = viewModel;

  return (
    <div className="flex justify-center bg-white home-safe overflow-hidden w-full">
      <main className="w-full max-w-7xl border-x border-neutral-200 overflow-hidden">
        <Stocks />

        {isCategoryPage && pageTitle && (
          <div
            dir="rtl"
            className="border-t border-neutral-200 px-4 py-5 sm:px-6"
          >
            <h1 className="text-2xl font-extrabold text-neutral-950">
              {pageTitle}
            </h1>
            <p className="mt-2 text-sm text-neutral-500">
              آخرین خبرها و گزارش‌های مربوط به {pageTitle}
            </p>
          </div>
        )}

        <div className="flex flex-col-reverse border-t border-neutral-200 lg:flex-row">
          <aside className="w-full min-w-0 border-b border-neutral-200 lg:w-1/3 lg:border-e lg:border-b-0">
            <div className="divide-y divide-neutral-200">
              <div className="space-y-4 p-3 sm:p-4">
                {ads?.home_bottom && (
                  <AdBox
                    image={ads.home_bottom.image_url || ads.home_bottom.image}
                    label={ads.home_bottom.label || "تبلیغ"}
                    title={ads.home_bottom.title}
                    description={ads.home_bottom.description}
                    buttonText={ads.home_bottom.button_text}
                    href={ads.home_bottom.href}
                  />
                )}

                {Array.isArray(videoData) && videoData.length > 0 ? (
                  <SnowflakeVideoCard videos={videoData} />
                ) : (
                  <EmptyBlock title="ویدیویی برای نمایش وجود ندارد." />
                )}
              </div>

              <div className="p-3 sm:p-4">
                {latestList.length > 0 ? (
                  <LatestNewsList items={latestList} href="/news" />
                ) : (
                  <EmptyBlock title="خبر جدیدی برای نمایش وجود ندارد." />
                )}
              </div>

              {ads?.home_sidebar && (
                <div className="p-3 sm:p-4">
                  <AdBox
                    image={ads.home_sidebar.image_url || ads.home_sidebar.image}
                    label={ads.home_sidebar.label || "تبلیغ"}
                    title={ads.home_sidebar.title}
                    description={ads.home_sidebar.description}
                    buttonText={ads.home_sidebar.button_text}
                    href={ads.home_sidebar.href}
                  />
                </div>
              )}

              <div className="p-3 sm:p-4">
                {inFocusItems.length > 0 ? (
                  <InFocusTopics items={inFocusItems} />
                ) : (
                  <EmptyBlock title="موضوع داغی برای نمایش وجود ندارد." />
                )}
              </div>

              <div className="p-3 sm:p-4">
                <MarketPriceFeed
                  title="قیمت بازارها"
                  filterLabel="همه بازارها"
                  items={marketItems}
                  loading={marketLoading}
                />
              </div>

              <div className="p-3 sm:p-4">
                {hotNewsItems.length > 0 ? (
                  <HotNews items={hotNewsItems} />
                ) : (
                  <EmptyBlock title="دسته‌بندی مهمی برای نمایش وجود ندارد." />
                )}
              </div>
            </div>
          </aside>

          <section className="w-full min-w-0 lg:w-2/3">
            <LargNews {...largeNewsData} />

            {relatedNewsData.length > 0 ? (
              <RelatedNews news={relatedNewsData} />
            ) : (
              <div className="border-t border-neutral-200 p-4 sm:p-6">
                <EmptyBlock title="خبر مرتبطی برای نمایش وجود ندارد." />
              </div>
            )}

            <div className="flex flex-col border-t border-neutral-200 md:flex-row">
              <div className="flex-1 border-b border-neutral-200 p-4 sm:p-6 md:border-e md:border-b-0">
                {normalLargeItem ? (
                  <Link
                    to={normalLargeItem.href}
                    className="group flex flex-col gap-4"
                  >
                    {normalLargeItem.cover && (
                      <div className="aspect-[2/1] w-full overflow-hidden rounded-md bg-neutral-100 sm:h-56">
                        <img
                          src={normalLargeItem.cover}
                          alt={normalLargeItem.title}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      </div>
                    )}

                    <div dir="rtl">
                      {(normalLargeItem.category ||
                        normalLargeItem.typeText) && (
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          {normalLargeItem.category && (
                            <span className="block text-[12px] font-black uppercase text-red-600">
                              {normalLargeItem.category}
                            </span>
                          )}

                          {normalLargeItem.typeText &&
                            normalLargeItem.typeText !==
                              normalLargeItem.category && (
                              <span className="rounded-full bg-neutral-100 px-2 py-1 text-[11px] font-bold text-neutral-500">
                                {normalLargeItem.typeText}
                              </span>
                            )}
                        </div>
                      )}

                      <h2 className="text-[22px] font-black leading-[1.4] text-neutral-900 transition-colors group-hover:text-red-700 sm:text-[26px]">
                        {normalLargeItem.title}
                      </h2>

                      {normalLargeItem.description && (
                        <p className="mt-3 line-clamp-3 text-[14px] leading-relaxed text-neutral-600">
                          {normalLargeItem.description}
                        </p>
                      )}
                    </div>
                  </Link>
                ) : (
                  <EmptyBlock title="خبری برای نمایش وجود ندارد." />
                )}

                {ads?.home_medium_news && (
                  <AdBox
                    image={
                      ads.home_medium_news.image_url ||
                      ads.home_medium_news.image
                    }
                    label={ads.home_medium_news.label || "تبلیغ"}
                    title={ads.home_medium_news.title}
                    description={ads.home_medium_news.description}
                    buttonText={ads.home_medium_news.button_text}
                    href={ads.home_medium_news.href}
                  />
                )}
              </div>

              <div className="h-full w-full min-w-0 p-4 sm:p-6 md:w-[320px]">
                {mediumVideoNewsData ? (
                  <MediumVideoNews {...mediumVideoNewsData} />
                ) : (
                  <EmptyBlock title="ویدیوی ویژه‌ای برای نمایش وجود ندارد." />
                )}
              </div>
            </div>

            <div className="border-t border-neutral-200">
              {popularPosts[0] ? (
                <LargNews
                  {...toLargeNewsData(
                    popularPosts[0],
                    pickDifferentPost(popularPosts, [popularPosts[0]]),
                  )}
                />
              ) : (
                <div className="p-4 sm:p-6">
                  <EmptyBlock title="خبر پربازدیدی برای نمایش وجود ندارد." />
                </div>
              )}

              {authors.length > 0 && (
                <AuthorsSection items={authors} href="/authors" />
              )}
            </div>
          </section>
        </div>

        <div className="w-full min-w-0">
          {categorySections.length > 0 ? (
            categorySections.map((section) => (
              <CategoryNewsSection
                key={section.title}
                title={section.title}
                href={section.href}
                layout={section.layout}
                featured={section.featured}
                stories={section.stories}
                sidebar={section.sidebar}
                tabs={section.tabs}
                activeTab={section.activeTab}
              />
            ))
          ) : (
            <div className="border-t border-neutral-200 p-4 sm:p-6">
              <EmptyBlock title="بخشی برای نمایش اخبار دسته‌بندی‌ها وجود ندارد." />
            </div>
          )}
        </div>

        {isCategoryPage && categorySlug && (
          <CategoryPostsFeed
            isCategoryPage={isCategoryPage}
            categorySlug={categorySlug}
            pageSize={12}
          />
        )}
      </main>
    </div>
  );
}
