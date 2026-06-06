import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import { newsApi } from "../lib/news/newsApi";
import { mediaApi } from "../lib/media/mediaApi";
import {
  normalizeCategories,
  normalizePosts,
  normalizeTags,
  normalizeVideos,
} from "../lib/normalizers";

import Stocks from "../components/home/Stocks";
import LargNews from "../components/home/LargNews";
import RelatedNews from "../components/home/RelatedNews";
import MediumNews from "../components/home/MediumNews";
import SnowflakeVideoCard from "../components/home/SnowflakeVideoCard";
import MarketPriceFeed from "../components/home/MarketPriceFeed";
import HotNews from "../components/home/HotNews";
import MediumVideoNews from "../components/home/MediumVideoNews";
import AdBox from "../components/home/AdBox";
import LatestNewsList from "../components/home/LatestNewsList";
import InFocusTopics from "../components/home/InFocusTopics";
import AuthorsSection from "../components/home/AuthorsSection";
import CategoryNewsSection from "../components/home/CategoryNewsSection";

const MARKET_ITEMS = [
  {
    id: 1,
    title: "بیت‌کوین",
    subtitle: "BTC / USDT",
    value: "۶۴٬۲۵۰",
    active: true,
  },
  {
    id: 2,
    title: "اتریوم",
    subtitle: "ETH / USDT",
    value: "۳٬۴۲۰",
    active: true,
  },
  {
    id: 3,
    title: "یورو / دلار",
    subtitle: "EUR / USD",
    value: "1.0842",
    active: true,
  },
  {
    id: 4,
    title: "طلا",
    subtitle: "XAU / USD",
    value: "۲٬۳۵۸",
    active: true,
  },
  {
    id: 5,
    title: "نفت برنت",
    subtitle: "BRENT",
    value: "۸۲.۴۰",
    active: false,
  },
  {
    id: 6,
    title: "نزدک",
    subtitle: "NASDAQ",
    value: "۱۸٬۴۳۰",
    active: false,
  },
];

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

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function uniqueByIdOrTitle(items = []) {
  const seen = new Set();

  return items.filter((item) => {
    const key =
      item?.id ?? item?.slug ?? item?.title ?? item?.name ?? item?.href;

    if (!key || seen.has(key)) return false;

    seen.add(key);
    return true;
  });
}

function pickFeatured(items = []) {
  return (
    items.find((item) => item?.isHero) ||
    items.find((item) => item?.isFeatured) ||
    items[0] ||
    null
  );
}

function isSamePost(a, b) {
  if (!a || !b) return false;

  if (a.id && b.id) return a.id === b.id;
  if (a.slug && b.slug) return a.slug === b.slug;

  return a.title === b.title;
}

function pickDifferentPost(posts = [], excludedPosts = []) {
  return (
    posts.find((post) =>
      excludedPosts.every((excluded) => !isSamePost(post, excluded)),
    ) || null
  );
}

function toLargeNewsData(post, bottomPost = null) {
  if (!post) {
    return {
      title: "محتوایی برای نمایش وجود ندارد",
      description: "",
      categoryText: "خبر",
      image: "",
      href: "#",
      bottomNewsTitle: "",
      bottomNewsDescription: "",
      bottomNewsHref: "#",
    };
  }

  return {
    title: post?.title || "بدون عنوان",
    description: post?.description || post?.excerpt || "",
    categoryText: bottomPost?.category || post?.category || "خبر",
    image: post?.image || "",
    href: post?.href || "#",
    bottomNewsTitle: bottomPost?.title || "",
    bottomNewsDescription: bottomPost?.description || bottomPost?.excerpt || "",
    bottomNewsHref: bottomPost?.href || "#",
  };
}

function toMediumNewsData(post, bottomPost = null) {
  if (!post) {
    return {
      title: "محتوایی برای نمایش وجود ندارد",
      description: "",
      categoryText: "خبر",
      image: "",
      href: "#",
      bottomNewsTitle: "",
      bottomNewsDescription: "",
      bottomNewsHref: "#",
    };
  }

  return {
    title: post?.title || "بدون عنوان",
    description: post?.description || post?.excerpt || "",
    categoryText: post?.category || "خبر",
    image: post?.image || "",
    href: post?.href || "#",
    bottomNewsTitle: bottomPost?.title || "",
    bottomNewsDescription: bottomPost?.description || bottomPost?.excerpt || "",
    bottomNewsHref: bottomPost?.href || "#",
  };
}

function makeRelatedNews(posts = []) {
  return uniqueByIdOrTitle(posts)
    .slice(0, 3)
    .map((item) => ({
      id: item?.id || item?.slug || item?.href || item?.title,
      title: item?.title || "",
      href: item?.href || "#",
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

  return categories.slice(0, 4).map((category, index) => {
    const posts = safeArray(postsByCategory[index]);
    const featured = pickFeatured(posts);

    const stories = posts.filter((item) => {
      if (!featured) return true;
      return !isSamePost(item, featured);
    });

    return {
      title: category.title || "دسته‌بندی",
      href: category.href || `/category/${category.slug}`,
      layout: layouts[index % layouts.length],
      featured,
      stories,
      sidebar: stories.slice(4, 6),
      tabs: categories.slice(0, 5).map((cat) => ({
        label: cat.title,
        value: cat.slug,
        href: cat.href || `/category/${cat.slug}`,
      })),
      activeTab: category.slug,
    };
  });
}

function HomeSkeleton() {
  return (
    <div className="flex justify-center bg-white home-safe">
      <main className="min-h-screen w-full max-w-7xl border-x border-neutral-200">
        <div className="h-14 animate-pulse border-b border-neutral-200 bg-neutral-100" />

        <div className="flex flex-col lg:flex-row">
          <div className="w-full border-b border-neutral-200 lg:w-1/3 lg:border-e lg:border-b-0">
            <div className="space-y-4 p-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-40 animate-pulse rounded-xl bg-neutral-100"
                />
              ))}
            </div>
          </div>

          <div className="w-full space-y-6 p-4 md:p-6 lg:w-2/3">
            <div className="h-96 animate-pulse rounded-2xl bg-neutral-100" />

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
    <div className="flex justify-center bg-white home-safe">
      <main className="flex min-h-screen w-full max-w-7xl items-center justify-center border-x border-neutral-200 p-6">
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
    <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-6 text-center text-sm text-neutral-500">
      {title}
    </div>
  );
}

function useHomeData(categorySlug = null) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setPageError("");

    try {
      const isCategoryPage = Boolean(categorySlug);

      const [
        homeResult,
        latestResult,
        popularResult,
        categoriesResult,
        tagsResult,
        videosResult,
      ] = await Promise.allSettled([
        isCategoryPage
          ? newsApi.getPosts({
              category: categorySlug,
              ordering: "-published_at",
            })
          : newsApi.getHomePosts(),

        isCategoryPage
          ? newsApi.getPosts({
              category: categorySlug,
              ordering: "-published_at",
            })
          : newsApi.getLatestPosts(),

        isCategoryPage
          ? newsApi.getPosts({
              category: categorySlug,
              ordering: "-views_count",
            })
          : newsApi.getPopularPosts(),

        newsApi.getCategories({ ordering: "title" }),
        newsApi.getTags({ ordering: "-posts_count" }),
        mediaApi.getVideos({ ordering: "-published_at" }),
      ]);

      const homePosts =
        homeResult.status === "fulfilled"
          ? normalizePosts(homeResult.value)
          : [];

      const latestNews =
        latestResult.status === "fulfilled"
          ? normalizePosts(latestResult.value)
          : [];

      const popularPosts =
        popularResult.status === "fulfilled"
          ? normalizePosts(popularResult.value)
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
          ? normalizeVideos(videosResult.value)
          : [];

      const baseFeedCount =
        homePosts.length +
        latestNews.length +
        popularPosts.length +
        categories.length +
        tags.length +
        videos.length;

      if (baseFeedCount === 0) {
        const firstRejected = [
          homeResult,
          latestResult,
          popularResult,
          categoriesResult,
          tagsResult,
          videosResult,
        ].find((r) => r.status === "rejected");

        if (firstRejected?.reason) {
          throw firstRejected.reason;
        }
      }

      const selectedCategory = isCategoryPage
        ? categories.find((category) => category.slug === categorySlug)
        : null;

      const sectionCategories = isCategoryPage
        ? selectedCategory
          ? [selectedCategory]
          : categories.filter((category) => category.slug === categorySlug)
        : categories.slice(0, 4);

      const postsByCategory = await Promise.all(
        sectionCategories.map(async (category) => {
          try {
            const d = await newsApi.getPosts({
              category: category.slug,
              ordering: "-published_at",
            });

            return normalizePosts(d);
          } catch {
            return [];
          }
        }),
      );

      setData({
        homePosts: safeArray(homePosts),
        latestNews: safeArray(latestNews),
        popularPosts: safeArray(popularPosts),
        categories: safeArray(categories),
        sectionCategories: safeArray(sectionCategories),
        tags: safeArray(tags),
        videos: safeArray(videos),
        postsByCategory: safeArray(postsByCategory),
        currentCategory: selectedCategory,
        isCategoryPage,
      });
    } catch (error) {
      console.error("Home API Error:", error);
      setPageError(getApiErrorMessage(error));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [categorySlug]);

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
  const { categorySlug } = useParams();
  const { data, loading, error, refresh } = useHomeData(categorySlug);

  const viewModel = useMemo(() => {
    if (!data) return null;

    const {
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
    } = data;

    const postsForHero = homePosts.length ? homePosts : latestNews;
    const mainPost = pickFeatured(postsForHero);

    const bottomPost =
      pickDifferentPost(postsForHero, [mainPost]) ||
      pickDifferentPost(latestNews, [mainPost]) ||
      pickDifferentPost(popularPosts, [mainPost]) ||
      null;

    const mediumPost =
      pickDifferentPost(postsForHero, [mainPost, bottomPost]) ||
      pickDifferentPost(latestNews, [mainPost, bottomPost]) ||
      pickDifferentPost(popularPosts, [mainPost, bottomPost]) ||
      null;

    const mediumBottomPost =
      pickDifferentPost(postsForHero, [mainPost, bottomPost, mediumPost]) ||
      pickDifferentPost(latestNews, [mainPost, bottomPost, mediumPost]) ||
      pickDifferentPost(popularPosts, [mainPost, bottomPost, mediumPost]) ||
      null;

    const largeNewsData = toLargeNewsData(mainPost, bottomPost);
    const mediumNewsData = toMediumNewsData(mediumPost, mediumBottomPost);

    const relatedNewsData = makeRelatedNews(
      uniqueByIdOrTitle([
        ...postsForHero.filter((item) => !isSamePost(item, mainPost)),
        ...latestNews.filter((item) => !isSamePost(item, mainPost)),
        ...popularPosts.filter((item) => !isSamePost(item, mainPost)),
      ]),
    );

    const videoData = videos.slice(0, 3).map((video) => ({
      id: video.id,
      image: video.image,
      title: video.title,
      duration: video.duration,
      href: video.href,
    }));

    const mediumVideoNewsData = {
      title: videos[0]?.title || "ویدیوی امروز",
      description: videos[0]?.description || "",
      suggestedLabel: "ویدیوی پیشنهادی",
      suggestedVideoThumbnail: videos[1]?.image || videos[0]?.image || "",
      suggestedVideoTitle: videos[1]?.title || videos[0]?.title || "",
      suggestedVideoHref: videos[1]?.href || videos[0]?.href || "#",
      suggestedVideoAlt: videos[1]?.title || videos[0]?.title || "ویدیو",
    };

    const inFocusItems = tags.slice(0, 7).map((tag) => ({
      id: tag.id,
      label: tag.label,
      href: tag.href,
    }));

    const hotNewsItems = categories.slice(0, 6).map((category) => ({
      id: category.id,
      label: category.title,
      href: category.href || `/category/${category.slug}`,
    }));

    const latestList = uniqueByIdOrTitle(latestNews).slice(0, 10);

    const authors = uniqueByIdOrTitle(
      latestNews
        .filter((item) => item.author || item.authorName || item.user)
        .slice(0, 10)
        .map((item, index) => {
          const authorName =
            item.authorName ||
            item.author_name ||
            item.author ||
            item.user?.name ||
            item.user?.full_name ||
            "نویسنده شاخص‌یک";

          const authorId =
            item.authorId ||
            item.author_id ||
            item.user?.id ||
            item.id ||
            index;

          return {
            id: authorId,
            name: authorName,
            role: item.category || item.categoryTitle || "نویسنده",
            bio:
              item.authorBio ||
              item.author_bio ||
              item.description ||
              item.excerpt ||
              "نویسنده و تحلیلگر خبرهای روز در شاخص‌یک.",
            avatar:
              item.authorAvatar ||
              item.author_avatar ||
              item.authorImage ||
              item.author_image ||
              item.user?.avatar ||
              item.user?.image ||
              item.user?.profile_image ||
              "",
            href: item.authorHref || item.author_href || `/authors/${authorId}`,
          };
        }),
    ).slice(0, 3);

    const categoriesForSections =
      sectionCategories?.length > 0 ? sectionCategories : categories;

    const categorySections = makeCategorySections(
      categoriesForSections,
      postsByCategory,
    ).filter((section) => section.featured || section.stories?.length);

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
      mediumNewsData,
      relatedNewsData,
      videoData,
      mediumVideoNewsData,
      inFocusItems,
      hotNewsItems,
      authors,
      categorySections,
      latestList,
      popularPosts,
      videos,
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
    mediumNewsData,
    relatedNewsData,
    videoData,
    mediumVideoNewsData,
    inFocusItems,
    hotNewsItems,
    authors,
    categorySections,
    latestList,
    popularPosts,
    videos,
  } = viewModel;

  return (
    <div className="flex justify-center bg-white home-safe">
      <main className="w-full max-w-7xl border-x border-neutral-200">
        <Stocks />

        {isCategoryPage && pageTitle && (
          <div dir="rtl" className="border-t border-neutral-200 px-6 py-5">
            <h1 className="text-2xl font-extrabold text-neutral-950">
              {pageTitle}
            </h1>
            <p className="mt-2 text-sm text-neutral-500">
              آخرین خبرها و گزارش‌های مربوط به {pageTitle}
            </p>
          </div>
        )}

        <div className="flex flex-col border-t border-neutral-200 lg:flex-row">
          <aside className="w-full border-b border-neutral-200 lg:w-1/3 lg:border-e lg:border-b-0">
            <div className="divide-y divide-neutral-200">
              {videoData.length > 0 ? (
                <div className="p-4">
                  <SnowflakeVideoCard videos={videoData} />
                </div>
              ) : (
                <div className="p-4">
                  <EmptyBlock title="ویدیویی برای نمایش وجود ندارد." />
                </div>
              )}

              <div className="p-4">
                {latestList.length > 0 ? (
                  <LatestNewsList items={latestList} href="/news" />
                ) : (
                  <EmptyBlock title="خبر جدیدی برای نمایش وجود ندارد." />
                )}
              </div>

              <div className="p-4">
                {inFocusItems.length > 0 ? (
                  <InFocusTopics items={inFocusItems} />
                ) : (
                  <EmptyBlock title="موضوع داغی برای نمایش وجود ندارد." />
                )}
              </div>

              <div className="p-4">
                <MarketPriceFeed
                  title="آخرین قیمت بازارها"
                  filterLabel="همه بازارها"
                  items={MARKET_ITEMS}
                />
              </div>

              <div className="p-4">
                {hotNewsItems.length > 0 ? (
                  <HotNews items={hotNewsItems} />
                ) : (
                  <EmptyBlock title="دسته‌بندی مهمی برای نمایش وجود ندارد." />
                )}
              </div>
            </div>
          </aside>

          <section className="w-full lg:w-2/3">
            <LargNews {...largeNewsData} />

            {relatedNewsData.length > 0 ? (
              <RelatedNews news={relatedNewsData} />
            ) : (
              <div className="border-t border-neutral-200 p-6">
                <EmptyBlock title="خبر مرتبطی برای نمایش وجود ندارد." />
              </div>
            )}

            <div className="flex flex-col border-t border-neutral-200 md:flex-row">
              <div className="flex-1 border-b border-neutral-200 p-6 md:border-e md:border-b-0">
                <MediumNews {...mediumNewsData} />

                <AdBox
                  image="/img/530x353.webp"
                  label="تبلیغ"
                  title="سرمایه‌گذاری هوشمند"
                  description="فرصت‌های ویژه بازار امروز"
                  buttonText="مشاهده بیشتر"
                  href="/"
                />
              </div>

              <div className="p-6 md:w-[320px]">
                {videos.length > 0 ? (
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
                <div className="p-6">
                  <EmptyBlock title="خبر پربازدیدی برای نمایش وجود ندارد." />
                </div>
              )}

              {authors.length > 0 && (
                <AuthorsSection items={authors} href="/authors" />
              )}
            </div>
          </section>
        </div>

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
          <div className="border-t border-neutral-200 p-6">
            <EmptyBlock title="بخشی برای نمایش اخبار دسته‌بندی‌ها وجود ندارد." />
          </div>
        )}
      </main>
    </div>
  );
}
