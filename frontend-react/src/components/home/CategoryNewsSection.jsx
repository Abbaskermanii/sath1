import { useState } from "react";
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

  return (
    <div className={`relative overflow-hidden bg-neutral-100 ${className}`}>
      {src && !failed ? (
        <img
          src={src}
          alt={alt || "News"}
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.05]"
        />
      ) : (
        <div className="h-full w-full bg-neutral-200" />
      )}

      {isVideo && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-active:bg-black/40 transition-colors">
          <span className="flex h-12 w-12 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-white/95 text-red-600 shadow-md">
            <Play size={20} fill="currentColor" className="ml-1" />
          </span>
        </div>
      )}

      {duration && isVideo && (
        <span className="absolute bottom-2 right-2 rounded-md bg-black/85 px-2 py-1 text-[11px] font-bold tracking-widest text-white shadow-sm">
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
      <Clickable
        href={safeItem.href}
        className="group flex flex-col gap-4 sm:flex-row sm:items-center xl:grid xl:grid-cols-[240px_minmax(0,1fr)]"
      >
        <NewsImage
          src={safeItem.cover}
          alt={safeItem.title}
          className="aspect-video w-full sm:aspect-square sm:w-[190px] xl:w-full rounded-lg shrink-0 shadow-sm"
        />
        <div className="min-w-0 flex-1 py-1">
          {safeItem.category && (
            <p className="mb-2 text-[12px] font-extrabold tracking-tight text-red-600">
              {safeItem.category}
            </p>
          )}
          <h3 className="text-xl sm:text-[22px] font-bold leading-snug tracking-tight text-neutral-950 transition group-hover:text-neutral-700">
            {safeItem.title}
          </h3>
          {safeItem.description && (
            <p className="mt-3 line-clamp-3 text-[14px] sm:text-[14.5px] leading-relaxed text-neutral-600">
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
      <Clickable href={safeItem.href} className="group block w-full">
        <NewsImage
          src={safeItem.cover}
          alt={safeItem.title}
          isVideo={Boolean(isVideo)}
          duration={isVideo ? safeItem.duration : ""}
          className="aspect-16/10 w-full rounded-lg shadow-sm"
        />
        <h3 className="mt-3 line-clamp-2 text-[15px] sm:text-[14px] font-bold leading-snug text-neutral-950 transition group-hover:text-neutral-700">
          {safeItem.title}
        </h3>
        {!titleOnly && safeItem.description && (
          <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-neutral-600">
            {safeItem.description}
          </p>
        )}
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
    <div className="w-[260px] shrink-0 snap-start sm:w-auto sm:shrink-[unset] sm:[snap-align:unset]">
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
        className="group flex sm:grid sm:grid-cols-[92px_minmax(0,1fr)] gap-3.5 rounded-xl border border-neutral-100 bg-neutral-50/50 p-3 transition hover:border-neutral-300 hover:bg-white"
      >
        <NewsImage
          src={safeItem.cover}
          alt={safeItem.title}
          className="aspect-square w-[85px] sm:w-full shrink-0 rounded-md shadow-sm"
        />
        <div className="min-w-0 flex-1 flex flex-col justify-center">
          <p className="mb-1.5 text-[10px] font-black uppercase text-neutral-500 tracking-wider">
            {label}
          </p>
          <h3 className="line-clamp-3 text-[13.5px] font-bold leading-snug text-neutral-950 transition group-hover:text-neutral-700">
            {safeItem.title}
          </h3>
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
    <article className="w-full">
      <Clickable
        href={safeItem.href}
        className="group relative block w-full overflow-hidden rounded-xl bg-black shadow-sm"
      >
        <NewsImage
          src={safeItem.cover}
          alt={safeItem.title}
          isVideo
          duration={safeItem.duration}
          className="aspect-video sm:aspect-4/5 md:aspect-5/6 w-full"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 pt-16">
          <h3 className="line-clamp-3 text-[14.5px] sm:text-[13.5px] font-bold leading-snug text-white">
            {safeItem.title}
          </h3>
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
      <Clickable
        href={safeItem.href}
        className="group flex flex-col md:flex-row md:items-start xl:grid gap-4 xl:grid-cols-[300px_minmax(0,1fr)]"
      >
        <NewsImage
          src={safeItem.cover}
          alt={safeItem.title}
          className="aspect-video md:aspect-16/10 w-full md:w-[300px] shrink-0 rounded-lg shadow-sm"
        />
        <div className="min-w-0 flex-1 py-1">
          {safeItem.category && (
            <p className="mb-2 text-[12px] font-extrabold text-red-600">
              {safeItem.category}
            </p>
          )}
          <h3 className="text-[22px] sm:text-[24px] font-black leading-tight tracking-tight text-neutral-950 transition group-hover:text-neutral-700">
            {safeItem.title}
          </h3>
          {safeItem.description && (
            <p className="mt-3 line-clamp-3 text-[14.5px] leading-relaxed text-neutral-600">
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

  const bottomItem = safeStories[0] || null;
  const listItems = safeStories.slice(1, 5);
  const sidebarItems = safeSidebar.length
    ? safeSidebar.slice(0, 2)
    : safeStories.slice(5, 7);

  const featuredWithBottom = safeFeatured
    ? {
        ...safeFeatured,
        bottomNewsTitle: bottomItem?.title || "",
        bottomNewsDescription: bottomItem?.description || "",
        bottomNewsHref: bottomItem?.href || "",
      }
    : null;

  return (
    <div className="mt-5 flex flex-col gap-6 xl:grid xl:grid-cols-[1.25fr_1fr_320px] xl:gap-5">
      {/* ستون ۱: featured */}
      <div className="min-w-0 w-full">
        <FeaturedHorizontal item={featuredWithBottom} />
      </div>

      {/* ستون ۲: لیست متنی → موبایل اسکرول افقی، دسکتاپ grid */}
      <div className="min-w-0 w-full border-t border-b border-neutral-100 py-5 xl:border-y-0 xl:border-x xl:px-5 xl:py-0">
        <TextStoryList items={listItems} columns />
      </div>

      {/* ستون ۳: sidebar → موبایل اسکرول افقی، دسکتاپ grid */}
      <HorizontalScroll smCols="2" xlCols="1">
        {sidebarItems.map((item, index) => (
          <ScrollItem key={getItemKey(item, index)}>
            <SidePromoCard item={item} />
          </ScrollItem>
        ))}
      </HorizontalScroll>
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

      {layout === "magazine" && (
        <div className="mt-5 w-full">
          <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1.35fr)_320px]">
            <MagazineFeature item={safeFeatured || safeStories[0]} />
            <div className="w-full rounded-xl border border-neutral-100 bg-neutral-50/30 p-4">
              <p className="mb-4 text-[11px] font-black uppercase tracking-wider text-neutral-500">
                مطالب بیشتر از این بخش
              </p>
              <HorizontalScroll smCols="1" className="gap-3.5">
                {(safeFeatured ? safeStories : safeStories.slice(1))
                  .slice(0, 2)
                  .map((item, index) => (
                    <ScrollItem key={getItemKey(item, index)}>
                      <SidePromoCard item={item} />
                    </ScrollItem>
                  ))}
              </HorizontalScroll>
            </div>
          </div>

          <div className="mt-6 w-full border-t border-neutral-200 sm:border-0">
            <BottomMiniLinks
              items={
                safeFeatured ? safeStories.slice(2, 6) : safeStories.slice(3, 7)
              }
            />
          </div>
        </div>
      )}
    </section>
  );
}
