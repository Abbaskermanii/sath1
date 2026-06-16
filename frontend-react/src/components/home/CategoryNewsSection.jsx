import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SectionHeader from "../layout/SectionHeader";
import { Play } from "lucide-react";

function makeSafeId(value) {
  return String(value || "section")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-آ-ی]/g, "");
}

function getItemKey(item, index) {
  return item?.id || item?.slug || item?.href || item?.title || index;
}

function normalizeItem(item = {}) {
  return {
    id: item.id,
    slug: item.slug,
    href: item.href || "",
    title: item.title || "بدون عنوان",
    description: item.description || item.excerpt || "",
    cover: item.cover || item.image || "",
    category: item.category || item.categoryTitle || "",
    duration: item.duration || item.media_duration || "",
    isVideo: Boolean(item.isVideo),
    mediaType: item.mediaType || item.media_type || item.post_type || "",
    audioFile: item.audioFile || item.audio_file || "",
    podcastFile: item.podcastFile || item.podcast_file || "",
    bottomNewsTitle: item.bottomNewsTitle || "",
    bottomNewsDescription: item.bottomNewsDescription || "",
    bottomNewsHref: item.bottomNewsHref || "",
  };
}

function isAudioLikeItem(item = {}) {
  const mediaType = String(item.mediaType || "").toLowerCase();
  return (
    mediaType === "audio" ||
    mediaType === "podcast" ||
    mediaType === "voice" ||
    mediaType === "sound" ||
    Boolean(item.audioFile) ||
    Boolean(item.podcastFile)
  );
}

function sanitizeNonVisualMediaItem(item = {}) {
  return { ...item, isVideo: false, duration: "" };
}

function getSafeHref(href) {
  return typeof href === "string" ? href.trim() : "";
}

function isExternalHref(href) {
  return /^https?:\/\//i.test(getSafeHref(href));
}

function hasValidHref(href) {
  const value = getSafeHref(href);
  return value.length > 0 && value !== "#";
}

function Clickable({ href, className = "", children, fallback = "div" }) {
  const safeHref = getSafeHref(href);
  const touchClasses = "active:opacity-80 transition-opacity duration-200";
  const finalClassName = `${className} ${touchClasses}`.trim();

  if (!hasValidHref(safeHref)) {
    const Tag = fallback;
    return <Tag className={finalClassName}>{children}</Tag>;
  }

  if (isExternalHref(safeHref)) {
    return (
      <a
        href={safeHref}
        target="_blank"
        rel="noopener noreferrer"
        className={finalClassName}
      >
        {children}
      </a>
    );
  }

  return (
    <Link to={safeHref} className={finalClassName}>
      {children}
    </Link>
  );
}

function NewsImage({ src, alt, className = "", isVideo = false, duration }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-neutral-100 ring-1 ring-neutral-200/80 ${className}`}
    >
      {src && !failed ? (
        <img
          src={src}
          alt={alt || "News"}
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200">
          <span className="text-xs font-bold text-neutral-400">بدون تصویر</span>
        </div>
      )}

      {isVideo && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 transition-colors group-hover:bg-black/20 group-active:bg-black/30">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/95 text-red-600 shadow-lg ring-1 ring-black/10 sm:h-14 sm:w-14">
            <Play size={22} fill="currentColor" className="ml-1" />
          </span>
        </div>
      )}

      {duration && isVideo && (
        <span className="absolute bottom-3 right-3 rounded-lg bg-black/85 px-2.5 py-1 text-[11px] font-black tracking-widest text-white shadow-sm">
          {duration}
        </span>
      )}
    </div>
  );
}

function BottomInlineNews({ title, description, href = "" }) {
  if (!title && !description) return null;

  return (
    <Clickable
      href={href}
      className="group mt-4 block border-t border-neutral-100 pt-4"
    >
      {title && (
        <h4 className="text-[14px] sm:text-sm font-bold leading-6 text-neutral-900 transition-colors duration-200 group-hover:text-neutral-700">
          {title}
        </h4>
      )}
      {description && (
        <p className="mt-1.5 text-[13px] sm:text-sm leading-6 text-neutral-600 transition-colors duration-200 group-hover:text-neutral-800">
          {description}
        </p>
      )}
    </Clickable>
  );
}

function FeaturedHorizontal({ item }) {
  if (!item) return null;
  const safeItem = sanitizeNonVisualMediaItem(normalizeItem(item));

  return (
    <article className="w-full">
      <Clickable href={safeItem.href} className="group block w-full">
        <NewsImage
          src={safeItem.cover}
          alt={safeItem.title}
          className="aspect-[16/10] w-full shadow-sm"
        />

        <div className="mt-4 min-w-0">
          {safeItem.category && (
            <p className="mb-2 text-[12px] font-black tracking-tight text-red-600">
              {safeItem.category}
            </p>
          )}

          <h3 className="text-[21px] font-black leading-8 tracking-tight text-neutral-950 transition group-hover:text-red-700 sm:text-[24px] sm:leading-9">
            {safeItem.title}
          </h3>

          {safeItem.description && (
            <p className="mt-3 line-clamp-3 text-[14px] leading-7 text-neutral-600 sm:text-[15px]">
              {safeItem.description}
            </p>
          )}
        </div>
      </Clickable>

      <BottomInlineNews
        href={safeItem.bottomNewsHref}
        title={safeItem.bottomNewsTitle}
        description={safeItem.bottomNewsDescription}
      />
    </article>
  );
}

function CompactImageCard({ item, isVideo = false, titleOnly = false }) {
  if (!item) return null;

  const safeItem = isVideo
    ? normalizeItem(item)
    : sanitizeNonVisualMediaItem(normalizeItem(item));

  return (
    <article className="w-full">
      <Clickable
        href={safeItem.href}
        className="group block w-full rounded-2xl transition hover:bg-neutral-50"
      >
        <NewsImage
          src={safeItem.cover}
          alt={safeItem.title}
          isVideo={Boolean(isVideo)}
          duration={isVideo ? safeItem.duration : ""}
          className="aspect-[16/10] w-full shadow-sm"
        />

        <div className="pt-3">
          {safeItem.category && (
            <p className="mb-1.5 text-[11px] font-black text-red-600">
              {safeItem.category}
            </p>
          )}

          <h3 className="line-clamp-2 text-[15px] font-black leading-6 text-neutral-950 transition group-hover:text-red-700 sm:text-[15.5px] sm:leading-7">
            {safeItem.title}
          </h3>

          {!titleOnly && safeItem.description && (
            <p className="mt-2 line-clamp-2 text-[13.5px] leading-6 text-neutral-600">
              {safeItem.description}
            </p>
          )}
        </div>
      </Clickable>
    </article>
  );
}

// ── HorizontalScroll: wrapper مشترک برای تمام ردیف‌های اسکرول افقی در موبایل ──
function HorizontalScroll({
  children,
  smCols,
  lgCols,
  xlCols,
  className = "",
}) {
  const gridCols = [
    smCols && `sm:grid-cols-${smCols}`,
    lgCols && `lg:grid-cols-${lgCols}`,
    xlCols && `xl:grid-cols-${xlCols}`,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={`flex w-full snap-x snap-mandatory overflow-x-auto gap-4 pb-4 px-4 -mx-4 sm:mx-0 sm:px-0 sm:grid sm:overflow-visible sm:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${gridCols} ${className}`}
    >
      {children}
    </div>
  );
}

function ScrollItem({ children }) {
  return (
    <div className="w-[280px] shrink-0 snap-start sm:w-auto sm:shrink-[unset] sm:[snap-align:unset]">
      {children}
    </div>
  );
}

// ── TextStoryList: موبایل → اسکرول افقی، دسکتاپ → grid ──
function TextStoryList({ items = [], columns = false }) {
  if (!items.length) return null;

  if (columns) {
    return (
      <HorizontalScroll smCols="2" lgCols="2">
        {items.map((item, index) => {
          const safeItem = sanitizeNonVisualMediaItem(normalizeItem(item));
          return (
            <ScrollItem key={getItemKey(safeItem, index)}>
              <article className="min-w-0">
                <Clickable href={safeItem.href} className="group block">
                  {safeItem.category && (
                    <p className="mb-1 text-[11px] font-extrabold text-red-600">
                      {safeItem.category}
                    </p>
                  )}
                  <h3 className="line-clamp-2 text-[15px] sm:text-[14px] font-bold leading-snug text-neutral-950 transition group-hover:text-neutral-700">
                    {safeItem.title}
                  </h3>
                  {safeItem.description && (
                    <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-neutral-600">
                      {safeItem.description}
                    </p>
                  )}
                </Clickable>
              </article>
            </ScrollItem>
          );
        })}
      </HorizontalScroll>
    );
  }

  return (
    <div className="flex flex-col space-y-5">
      {items.map((item, index) => {
        const safeItem = sanitizeNonVisualMediaItem(normalizeItem(item));
        return (
          <article key={getItemKey(safeItem, index)} className="min-w-0">
            <Clickable href={safeItem.href} className="group block">
              {safeItem.category && (
                <p className="mb-1 text-[11px] font-extrabold text-red-600">
                  {safeItem.category}
                </p>
              )}
              <h3 className="line-clamp-2 text-[15px] sm:text-[14px] font-bold leading-snug text-neutral-950 transition group-hover:text-neutral-700">
                {safeItem.title}
              </h3>
              {safeItem.description && (
                <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-neutral-600">
                  {safeItem.description}
                </p>
              )}
            </Clickable>
          </article>
        );
      })}
    </div>
  );
}

function SidePromoCard({ item, label = "جدید" }) {
  if (!item) return null;
  const safeItem = sanitizeNonVisualMediaItem(normalizeItem(item));

  return (
    <article className="w-full">
      <Clickable
        href={safeItem.href}
        className="group block overflow-hidden rounded-2xl border border-neutral-100 bg-white p-3 shadow-sm transition hover:border-neutral-300 hover:shadow-md"
      >
        <NewsImage
          src={safeItem.cover}
          alt={safeItem.title}
          className="aspect-[16/10] w-full rounded-xl"
        />

        <div className="pt-3">
          <p className="mb-1.5 text-[10px] font-black uppercase tracking-wider text-red-600">
            {label}
          </p>

          <h3 className="line-clamp-3 text-[14px] font-black leading-6 text-neutral-950 transition group-hover:text-red-700">
            {safeItem.title}
          </h3>

          {safeItem.description && (
            <p className="mt-1.5 line-clamp-2 text-[12.5px] leading-6 text-neutral-600">
              {safeItem.description}
            </p>
          )}
        </div>
      </Clickable>
    </article>
  );
}

function VideoCard({ item }) {
  if (!item) return null;

  const normalized = normalizeItem({ ...item, isVideo: true });
  if (isAudioLikeItem(item)) return null;

  const safeItem = { ...normalized, isVideo: true };

  return (
    <article className="h-full w-full">
      <Clickable
        href={safeItem.href}
        className="group flex h-full min-h-[310px] flex-col overflow-hidden rounded-2xl border border-neutral-100 bg-white p-3 shadow-sm transition hover:border-neutral-300 hover:shadow-md"
      >
        <NewsImage
          src={safeItem.cover}
          alt={safeItem.title}
          isVideo
          duration={safeItem.duration}
          className="aspect-[16/10] w-full shrink-0 rounded-xl"
        />

        <div className="flex flex-1 flex-col pt-3">
          <p className="mb-1.5 text-[10px] font-black uppercase tracking-wider text-red-600">
            ویدیو
          </p>

          <h3 className="line-clamp-1 min-h-[28px] text-[14.5px] font-black leading-7 text-neutral-950 transition group-hover:text-red-700 sm:text-[15px]">
            {safeItem.title}
          </h3>

          {safeItem.description ? (
            <p className="mt-2 line-clamp-2 min-h-[48px] text-[13px] leading-6 text-neutral-600">
              {safeItem.description}
            </p>
          ) : (
            <div className="mt-2 min-h-[48px]" />
          )}
        </div>
      </Clickable>
    </article>
  );
}

function MagazineFeature({ item }) {
  if (!item) return null;
  const safeItem = sanitizeNonVisualMediaItem(normalizeItem(item));

  return (
    <article className="w-full">
      <Clickable href={safeItem.href} className="group block w-full">
        <NewsImage
          src={safeItem.cover}
          alt={safeItem.title}
          className="aspect-[16/10] w-full shadow-sm"
        />

        <div className="mt-4 min-w-0">
          {safeItem.category && (
            <p className="mb-2 text-[12px] font-black text-red-600">
              {safeItem.category}
            </p>
          )}

          <h3 className="text-[22px] font-black leading-8 tracking-tight text-neutral-950 transition group-hover:text-red-700 sm:text-[26px] sm:leading-10">
            {safeItem.title}
          </h3>

          {safeItem.description && (
            <p className="mt-3 line-clamp-3 text-[14.5px] leading-7 text-neutral-600 sm:text-[15px]">
              {safeItem.description}
            </p>
          )}
        </div>
      </Clickable>
    </article>
  );
}

function BottomMiniLinks({ items = [] }) {
  if (!items.length) return null;

  return (
    <HorizontalScroll
      smCols="2"
      lgCols="3"
      className="pt-5 sm:border-t sm:border-neutral-200"
    >
      {items.map((item, index) => {
        const safeItem = sanitizeNonVisualMediaItem(normalizeItem(item));
        return (
          <ScrollItem key={getItemKey(safeItem, index)}>
            <article className="min-w-0">
              <Clickable href={safeItem.href} className="group block">
                <h3 className="line-clamp-2 text-[14.5px] sm:text-[13.5px] font-bold leading-snug text-neutral-950 transition group-hover:text-neutral-700">
                  {safeItem.title}
                </h3>
                {safeItem.description && (
                  <p className="mt-1.5 line-clamp-2 text-[12.5px] leading-relaxed text-neutral-600">
                    {safeItem.description}
                  </p>
                )}
              </Clickable>
            </article>
          </ScrollItem>
        );
      })}
    </HorizontalScroll>
  );
}

function FourCardStrip({ stories = [] }) {
  if (!stories.length) return null;

  return (
    <HorizontalScroll smCols="2" lgCols="4" className="mt-5">
      {stories.slice(0, 4).map((item, index) => (
        <ScrollItem key={getItemKey(item, index)}>
          <CompactImageCard item={item} titleOnly isVideo={false} />
        </ScrollItem>
      ))}
    </HorizontalScroll>
  );
}

// ── طراحی دقیقاً مشابه بلومبرگ (تایپوگرافی هماهنگ، راست‌چین و پرتر) ──
function MixedFeatureGrid({ featured, stories = [], sidebar = [] }) {
  const safeFeatured = featured
    ? sanitizeNonVisualMediaItem(normalizeItem(featured))
    : null;
  const safeStories = Array.isArray(stories)
    ? stories.map((item) => sanitizeNonVisualMediaItem(normalizeItem(item)))
    : [];
  const safeSidebar = Array.isArray(sidebar)
    ? sidebar.map((item) => sanitizeNonVisualMediaItem(normalizeItem(item)))
    : [];

  const actualFeatured = safeFeatured || safeStories[0];
  // برای پرتر شدن ظاهر، ۳ خبر در ستون وسط و ۲ خبر در کارت‌های کناری نمایش می‌دهیم
  const listItems = safeFeatured
    ? safeStories.slice(0, 3)
    : safeStories.slice(1, 4);
  const sidebarItems = safeSidebar.length
    ? safeSidebar.slice(0, 2)
    : safeFeatured
      ? safeStories.slice(3, 5)
      : safeStories.slice(4, 6);

  return (
    <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-x-8 gap-y-10 items-start">
      {/* ستون اول: خبر اصلی (۶ ستون) - تصویر با گوشه تیز و تیتر بسیار بزرگ */}
      {actualFeatured && (
        <div className="lg:col-span-6 min-w-0 w-full">
          <Clickable
            href={actualFeatured.href}
            className="group flex flex-col sm:flex-row gap-5 w-full"
          >
            {/* تصویر در راست (RTL) */}
            <div className="w-full sm:w-1/2 flex flex-col">
              <div className="aspect-[4/3] w-full bg-neutral-100 overflow-hidden">
                <img
                  src={actualFeatured.cover}
                  alt={actualFeatured.title}
                  className="w-full h-full object-cover transition duration-500 group-hover:scale-[1.02] rounded-2xl"
                  loading="lazy"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
            </div>
            {/* تیتر و توضیحات در چپ */}
            <div className="w-full sm:w-1/2 sm:pt-1 flex flex-col justify-center">
              <h1 className="text-[26px] sm:text-[22px] font-semibold text-neutral-950 leading-[1.3] tracking-tight group-hover:text-red-700 transition-colors">
                {actualFeatured.title}
              </h1>

              {/* این بخش برای نمایش excerpt (توضیحات) اضافه شده است */}
              {actualFeatured.description && (
                <p className="mt-3 line-clamp-3 text-[14px] leading-7 text-neutral-600 sm:text-[15px]">
                  {actualFeatured.description}
                </p>
              )}
            </div>
          </Clickable>
        </div>
      )}

      {/* ستون دوم: اخبار متنی میانی (۳ ستون) - خطوط جداکننده نازک */}
      <div className="lg:col-span-3 flex flex-col justify-start min-w-0 w-full h-full sm:border-l border-neutral-200/60 sm:pl-8">
        {listItems.map((item, idx) => (
          <div
            key={getItemKey(item, idx)}
            className={`py-4 flex-1 ${idx !== 0 ? "border-t border-neutral-200/80" : "pt-0"}`}
          >
            <Clickable
              href={item.href}
              className="group block h-full flex flex-col justify-center"
            >
              <h3 className="text-[16px] font-semibold text-neutral-900 leading-[1.4] group-hover:text-red-700 transition-colors line-clamp-4">
                {item.title}
              </h3>
            </Clickable>
          </div>
        ))}
      </div>

      {/* ستون سوم: کارت‌های خبرنامه (۳ ستون) - کادر با گوشه گرد، عکس مربعی کنار متن */}
      <div className="lg:col-span-3 flex flex-col gap-4 min-w-0 w-full">
        {sidebarItems.map((item, idx) => (
          <Clickable
            key={getItemKey(item, idx)}
            href={item.href}
            className="group flex flex-row items-center gap-3.5 p-3.5 border border-neutral-200 rounded-2xl hover:border-neutral-300 hover:shadow-sm transition-all bg-white"
          >
            {/* عکس مربعی */}
            <div className="w-[4.5rem] h-[4.5rem] shrink-0 overflow-hidden bg-neutral-100 rounded-lg">
              <img
                src={item.cover}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                loading="lazy"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </div>
            {/* متن کنار عکس */}
            <div className="flex flex-col min-w-0 justify-center">
              <span className="text-[11.5px] text-neutral-600 mb-1 line-clamp-1">
                خبرنامه: {item.category || "فناوری"}
              </span>
              <h4 className="text-[14.5px] font-bold text-neutral-950 leading-snug group-hover:text-red-700 transition-colors line-clamp-3">
                {item.title}
              </h4>
            </div>
          </Clickable>
        ))}
      </div>
    </div>
  );
}

export default function CategoryNewsSection({
  title,
  href = "",
  layout = "feature-list-sidebar",
  featured,
  stories = [],
  sidebar = [],
  tabs = [],
  activeTab,
}) {
  const safeFeatured = featured ? normalizeItem(featured) : null;
  const safeStories = Array.isArray(stories) ? stories.map(normalizeItem) : [];
  const safeSidebar = Array.isArray(sidebar) ? sidebar.map(normalizeItem) : [];

  const sectionId = `section-${makeSafeId(title)}`;

  const bottomStories =
    layout === "feature-list-sidebar"
      ? safeStories.slice(6, 9)
      : safeStories.slice(4, 7);

  const videoStories = safeStories.filter(
    (item) => item.isVideo && !isAudioLikeItem(item),
  );
  const videoSidebar = safeSidebar.filter(
    (item) => item.isVideo && !isAudioLikeItem(item),
  );

  return (
    <section
      dir="rtl"
      className="w-full border-t border-neutral-200 bg-white px-4 py-6 sm:px-6 sm:py-8 lg:px-8 overflow-hidden"
      aria-labelledby={sectionId}
    >
      <SectionHeader
        title={title}
        href={href}
        tabs={tabs}
        activeTab={activeTab}
        titleId={sectionId}
      />

      {layout === "feature-list-sidebar" && (
        <>
          <MixedFeatureGrid
            featured={safeFeatured}
            stories={safeStories}
            sidebar={safeSidebar}
          />
          {bottomStories.length > 0 && (
            <div className="mt-6 w-full border-t border-neutral-200 sm:border-0">
              <BottomMiniLinks items={bottomStories} />
            </div>
          )}
        </>
      )}

      {layout === "grid-4" && (
        <>
          <FourCardStrip stories={safeStories} />
          {safeStories.length > 4 && (
            <div className="mt-6 w-full border-t border-neutral-200 sm:border-0">
              <BottomMiniLinks items={safeStories.slice(4, 7)} />
            </div>
          )}
        </>
      )}

      {layout === "video-row" && (
        <div className="w-full">
          <HorizontalScroll smCols="2" lgCols="4" xlCols="5" className="mt-5">
            {videoStories.slice(0, 5).map((item, index) => (
              <ScrollItem key={getItemKey(item, index)}>
                <VideoCard item={item} />
              </ScrollItem>
            ))}
          </HorizontalScroll>

          {videoSidebar.length > 0 && (
            <HorizontalScroll smCols="2" lgCols="3" className="mt-6">
              {videoSidebar.slice(0, 3).map((item, index) => (
                <ScrollItem key={getItemKey(item, index)}>
                  <SidePromoCard
                    item={sanitizeNonVisualMediaItem(item)}
                    label="ویدیوی بیشتر"
                  />
                </ScrollItem>
              ))}
            </HorizontalScroll>
          )}

          {videoStories.length > 0 && (
            <div className="mt-6 flex justify-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-neutral-800" />
              <span className="h-2 w-2 rounded-full bg-neutral-300" />
            </div>
          )}
        </div>
      )}

      {layout === "magazine" &&
        (() => {
          const allItems = safeFeatured
            ? [safeFeatured, ...safeStories]
            : safeStories;

          if (allItems.length === 0) return null;

          const mainItem = allItems[0] ? normalizeItem(allItems[0]) : null;
          const rightColItems = allItems.slice(1, 5).map(normalizeItem);
          const leftColItems = allItems.slice(5, 9).map(normalizeItem);

          return (
            <div className="mt-6 w-full">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* ستون راست: ۴ خبر با عکس مربعی کوچک (عرض: 3 از 12) */}
                <div className="lg:col-span-3 flex flex-col gap-6">
                  <div className="flex flex-col gap-5">
                    {rightColItems.map((item, index) => (
                      <Clickable
                        key={getItemKey(item, index)}
                        href={item.href}
                        className="group flex items-center gap-3"
                      >
                        {item.cover && (
                          <div className="shrink-0 w-[70px] h-[70px] overflow-hidden rounded bg-neutral-100">
                            <img
                              src={item.cover}
                              alt={item.title}
                              className="object-cover w-full h-full transition-opacity duration-300 group-hover:opacity-80"
                            />
                          </div>
                        )}
                        <h4 className="text-[13px] font-bold leading-[1.6] text-neutral-800 group-hover:text-red-700 transition-colors line-clamp-3">
                          {item.title}
                        </h4>
                      </Clickable>
                    ))}
                  </div>
                </div>

                {/* ستون وسط: خبر اصلی با عکس کم‌ارتفاع‌تر (عرض: 6 از 12) */}
                <div className="lg:col-span-6 flex flex-col gap-6 lg:border-l lg:border-r border-neutral-200 lg:px-6">
                  {mainItem && (
                    <Clickable
                      href={mainItem.href}
                      className="group flex flex-col gap-4"
                    >
                      {mainItem.cover && (
                        <div className="w-full aspect-[2/1] sm:h-56 overflow-hidden rounded-md bg-neutral-100">
                          <img
                            src={mainItem.cover}
                            alt={mainItem.title}
                            className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                          />
                        </div>
                      )}
                      <div>
                        {mainItem.category && (
                          <span className="mb-2 block text-[12px] font-black uppercase text-red-600">
                            {mainItem.category}
                          </span>
                        )}
                        <h2 className="text-[22px] sm:text-[26px] font-black leading-[1.4] text-neutral-900 group-hover:text-red-700 transition-colors">
                          {mainItem.title}
                        </h2>
                        {mainItem.description && (
                          <p className="mt-3 text-[14px] leading-relaxed text-neutral-600 line-clamp-3">
                            {mainItem.description}
                          </p>
                        )}
                      </div>
                    </Clickable>
                  )}
                </div>

                {/* ستون چپ: ۴ خبر با عکس‌های مستطیلی (عرض: 3 از 12) */}
                <div className="lg:col-span-3 flex flex-col gap-6">
                  <div className="grid grid-cols-2 gap-5">
                    {leftColItems.map((item, index) => (
                      <Clickable
                        key={getItemKey(item, index)}
                        href={item.href}
                        className="group flex flex-col gap-3"
                      >
                        {item.cover && (
                          <div className="w-full aspect-[16/9] overflow-hidden rounded bg-neutral-100">
                            <img
                              src={item.cover}
                              alt={item.title}
                              className="object-cover w-full h-full transition-opacity duration-300 group-hover:opacity-80"
                            />
                          </div>
                        )}
                        <h4 className="text-[14px] font-bold leading-[1.6] text-neutral-900 group-hover:text-red-700 transition-colors line-clamp-2">
                          {item.title}
                        </h4>
                      </Clickable>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
    </section>
  );
}
