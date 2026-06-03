import Stocks from "@/components/home/Stocks";
import LargNews from "@/components/home/LargNews";
import RelatedNews from "@/components/home/RelatedNews";
import MediumNews from "@/components/home/MediumNews";
import SnowflakeVideoCard from "@/components/home/SnowflakeVideoCard";
import MarketPriceFeed from "@/components/home/MarketPriceFeed";
import HotNews from "@/components/home/HotNews";
import MediumVideoNews from "@/components/home/MediumVideoNews";
import AdBox from "@/components/home/AdBox";

import LatestNewsList from "@/components/home/LatestNewsList";
import InFocusTopics from "@/components/home/InFocusTopics";
import AuthorsSection from "@/components/home/AuthorsSection";
import CategoryNewsSection from "@/components/home/CategoryNewsSection";

import { newsApi } from "@/app/lib/news/newsApi";
import { mediaApi } from "@/app/lib/media/mediaApi";
import {
  normalizeCategories,
  normalizePosts,
  normalizeTags,
  normalizeVideos,
} from "@/app/lib/normalizers";

function pickFeatured(items = []) {
  return (
    items.find((item) => item.isHero) ||
    items.find((item) => item.isFeatured) ||
    items[0] ||
    null
  );
}

function toLargeNewsData(post) {
  if (!post) {
    return {
      title: "",
      description: "",
      categoryText: "",
      categoryTitle: "",
      image: "",
    };
  }

  return {
    title: post.title,
    description: post.description,
    categoryText: post.category || "خبر",
    categoryTitle: post.homepageSectionLabel || post.category || "",
    image: post.image,
  };
}

function toMediumNewsData(post) {
  if (!post) {
    return {
      title: "",
      description: "",
      category: "",
      categoryTitle: "",
      image: "",
    };
  }

  return {
    title: post.title,
    description: post.description,
    category: post.category || "خبر",
    categoryTitle: post.homepageSectionLabel || post.category || "",
    image: post.image,
  };
}

function makeRelatedNews(posts = []) {
  return posts.slice(0, 3).map((item) => item.title);
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
    const posts = postsByCategory[index] || [];
    const featured = pickFeatured(posts);
    const stories = posts.filter((item) => item.id !== featured?.id);

    return {
      title: category.title,
      href: category.href,
      layout: layouts[index % layouts.length],
      featured,
      stories,
      sidebar: stories.slice(4, 6),
      tabs: categories.slice(0, 5).map((cat) => ({
        label: cat.title,
        value: cat.slug,
        href: cat.href,
      })),
      activeTab: category.slug,
    };
  });
}

export default async function Home() {
  let homePosts = [];
  let latestNews = [];
  let popularPosts = [];
  let categories = [];
  let tags = [];
  let videos = [];

  try {
    const [
      homeData,
      latestData,
      popularData,
      categoriesData,
      tagsData,
      videosData,
    ] = await Promise.all([
      newsApi.getHomePosts(),
      newsApi.getLatestPosts(),
      newsApi.getPopularPosts(),
      newsApi.getCategories({ ordering: "title" }),
      newsApi.getTags({ ordering: "-posts_count" }),
      mediaApi.getVideos({ ordering: "-published_at" }),
    ]);

    homePosts = normalizePosts(homeData);
    latestNews = normalizePosts(latestData);
    popularPosts = normalizePosts(popularData);
    categories = normalizeCategories(categoriesData);
    tags = normalizeTags(tagsData);
    videos = normalizeVideos(videosData);
  } catch (error) {
    console.error("Home API Error:", error);
  }

  const postsForHero = homePosts.length ? homePosts : latestNews;
  const mainPost = pickFeatured(postsForHero);
  const secondPost = postsForHero.find((item) => item.id !== mainPost?.id);

  const largeNewsData = toLargeNewsData(mainPost);
  const mediumNewsData = toMediumNewsData(secondPost || latestNews[0]);

  const relatedNewsData = makeRelatedNews(
    postsForHero.filter((item) => item.id !== mainPost?.id),
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
    href: category.href,
  }));

  const marketItems = [
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

  const authors = latestNews
    .filter((item) => item.author)
    .slice(0, 3)
    .map((item, index) => ({
      id: item.id || index,
      name: item.author,
      role: item.category || "نویسنده",
      bio: item.description || "نویسنده و تحلیلگر خبرهای روز.",
      avatar: item.image,
      href: item.href,
    }));

  const postsByCategory = await Promise.all(
    categories.slice(0, 4).map(async (category) => {
      try {
        const data = await newsApi.getPosts({
          category: category.slug,
          ordering: "-published_at",
        });

        return normalizePosts(data);
      } catch {
        return [];
      }
    }),
  );

  const categorySections = makeCategorySections(categories, postsByCategory);

  if (videos.length) {
    categorySections.push({
      title: "ویدیوهای اختصاصی",
      href: "/videos",
      layout: "video-row",
      stories: videos.slice(0, 5),
      sidebar: videos.slice(5, 8),
    });
  }

  return (
    <div className="flex justify-center bg-white home-safe">
      <main className="w-full max-w-7xl border-x border-neutral-200">
        <Stocks />

        <div className="flex flex-col border-t border-neutral-200 lg:flex-row">
          <aside className="w-full border-b border-neutral-200 lg:w-1/3 lg:border-b-0 lg:border-e">
            <div className="divide-y divide-neutral-200">
              {videoData.length > 0 && (
                <div className="p-4">
                  <SnowflakeVideoCard videos={videoData} />
                </div>
              )}

              <div className="p-4">
                <LatestNewsList items={latestNews} href="/news" />
              </div>

              <div className="p-4">
                <InFocusTopics items={inFocusItems} />
              </div>

              <div className="p-4">
                <MarketPriceFeed
                  title="آخرین قیمت بازارها"
                  filterLabel="همه بازارها"
                  items={marketItems}
                />
              </div>

              <div className="p-4">
                <HotNews items={hotNewsItems} />
              </div>
            </div>
          </aside>

          <section className="w-full lg:w-2/3">
            <LargNews {...largeNewsData} />

            <RelatedNews news={relatedNewsData} />

            <div className="flex flex-col border-t border-neutral-200 md:flex-row">
              <div className="flex-1 border-b border-neutral-200 p-6 md:border-b-0 md:border-e">
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

              {videos.length > 0 && (
                <div className="p-6">
                  <MediumVideoNews {...mediumVideoNewsData} />
                </div>
              )}
            </div>

            <div className="border-t border-neutral-200">
              {popularPosts[0] && (
                <LargNews {...toLargeNewsData(popularPosts[0])} />
              )}

              {authors.length > 0 && (
                <AuthorsSection items={authors} href="/authors" />
              )}
            </div>
          </section>
        </div>

        {categorySections.map((section) => (
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
        ))}
      </main>
    </div>
  );
}
