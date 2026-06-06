import { Link } from "react-router-dom";
import SectionHeader from "../layout/SectionHeader";
import { Play } from "lucide-react";

const FALLBACK_IMAGE = "/images/placeholder.svg";

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
    cover: item.cover || item.image || FALLBACK_IMAGE,
    category: item.category || "",
    duration: item.duration || "",
    isVideo: Boolean(item.isVideo),
    bottomNewsTitle: item.bottomNewsTitle || "",
    bottomNewsDescription: item.bottomNewsDescription || "",
    bottomNewsHref: item.bottomNewsHref || "",
  };
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

  if (!hasValidHref(safeHref)) {
    const Tag = fallback;
    return <Tag className={className}>{children}</Tag>;
  }

  if (isExternalHref(safeHref)) {
    return (
      <a
        href={safeHref}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {children}
      </a>
    );
  }

  return (
    <Link to={safeHref} className={className}>
      {children}
    </Link>
  );
}

function NewsImage({ src, alt, className = "", isVideo = false, duration }) {
  const safeSrc = src || FALLBACK_IMAGE;

  return (
    <div className={`relative overflow-hidden bg-neutral-200 ${className}`}>
      <img
        src={safeSrc}
        alt={alt || "News"}
        loading="lazy"
        onError={(e) => {
          e.currentTarget.src = FALLBACK_IMAGE;
        }}
        className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
      />

      {isVideo && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/15">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-red-600 shadow">
            <Play size={18} fill="currentColor" />
          </span>
        </div>
      )}

      {duration && (
        <span className="absolute bottom-2 right-2 rounded bg-black/85 px-2 py-0.5 text-[11px] font-bold text-white">
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
      className="group mt-4 block border-t border-neutral-200 pt-4"
    >
      {title && (
        <h4 className="text-sm font-bold leading-6 text-neutral-900 transition-colors duration-200 group-hover:text-neutral-700">
          {title}
        </h4>
      )}

      {description && (
        <p className="mt-2 text-sm leading-6 text-neutral-600 transition-colors duration-200 group-hover:text-neutral-800">
          {description}
        </p>
      )}
    </Clickable>
  );
}

function FeaturedHorizontal({ item }) {
  if (!item) return null;
  const safeItem = normalizeItem(item);

  return (
    <article>
      <Clickable
        href={safeItem.href}
        className="group grid items-center gap-4 sm:grid-cols-[190px_minmax(0,1fr)] xl:grid-cols-[220px_minmax(0,1fr)]"
      >
        <NewsImage
          src={safeItem.cover}
          alt={safeItem.title}
          className="aspect-3/3 w-full rounded-sm"
        />

        <div className="min-w-0">
          {safeItem.category && (
            <p className="mb-2 text-[12px] font-extrabold tracking-tight text-red-600">
              {safeItem.category}
            </p>
          )}

          <h3 className="text-[22px] font-semibold leading-[1.1] tracking-[-0.03em] text-neutral-950 transition group-hover:text-neutral-700">
            {safeItem.title}
          </h3>

          {safeItem.description && (
            <p className="mt-3 line-clamp-3 text-[14.5px] leading-6 text-neutral-600">
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
  const safeItem = normalizeItem(item);

  return (
    <article>
      <Clickable href={safeItem.href} className="group block">
        <NewsImage
          src={safeItem.cover}
          alt={safeItem.title}
          isVideo={isVideo || safeItem.isVideo}
          duration={safeItem.duration}
          className="aspect-16/10 rounded-sm"
        />

        <h3 className="mt-2.5 line-clamp-2 text-[14px] font-extrabold leading-5 text-neutral-950 transition group-hover:text-neutral-700">
          {safeItem.title}
        </h3>

        {!titleOnly && safeItem.description && (
          <p className="mt-1 line-clamp-2 text-[12px] leading-5 text-neutral-600">
            {safeItem.description}
          </p>
        )}
      </Clickable>
    </article>
  );
}

function TextStoryList({ items = [], columns = false }) {
  if (!items.length) return null;

  return (
    <div
      className={columns ? "grid gap-x-6 gap-y-4 sm:grid-cols-2" : "space-y-4"}
    >
      {items.map((item, index) => {
        const safeItem = normalizeItem(item);

        return (
          <article key={getItemKey(safeItem, index)}>
            <Clickable href={safeItem.href} className="group block">
              {safeItem.category && (
                <p className="mb-1 text-[11px] font-extrabold text-red-600">
                  {safeItem.category}
                </p>
              )}

              <h3 className="line-clamp-2 text-[14px] font-extrabold leading-5 text-neutral-950 transition group-hover:text-neutral-700">
                {safeItem.title}
              </h3>

              {safeItem.description && (
                <p className="mt-1 line-clamp-2 text-[12px] leading-5 text-neutral-600">
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
  const safeItem = normalizeItem(item);

  return (
    <article>
      <Clickable
        href={safeItem.href}
        className="group grid grid-cols-[92px_minmax(0,1fr)] gap-3 rounded-md border border-neutral-200 bg-white p-2.5 transition hover:border-neutral-400"
      >
        <NewsImage
          src={safeItem.cover}
          alt={safeItem.title}
          className="aspect-square rounded-sm"
        />

        <div className="min-w-0">
          <p className="mb-1 text-[10px] font-extrabold uppercase text-neutral-500">
            {label}
          </p>

          <h3 className="line-clamp-3 text-[12.5px] font-extrabold leading-4.5 text-neutral-950 transition group-hover:text-neutral-700">
            {safeItem.title}
          </h3>
        </div>
      </Clickable>
    </article>
  );
}

function VideoCard({ item }) {
  if (!item) return null;
  const safeItem = normalizeItem({ ...item, isVideo: true });

  return (
    <article>
      <Clickable
        href={safeItem.href}
        className="group relative block overflow-hidden rounded-md bg-black"
      >
        <NewsImage
          src={safeItem.cover}
          alt={safeItem.title}
          isVideo
          duration={safeItem.duration}
          className="aspect-4/5 md:aspect-5/6"
        />

        <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black via-black/70 to-transparent p-4 pt-12">
          <h3 className="line-clamp-3 text-[13.5px] font-extrabold leading-5 text-white">
            {safeItem.title}
          </h3>
        </div>
      </Clickable>
    </article>
  );
}

function MagazineFeature({ item }) {
  if (!item) return null;
  const safeItem = normalizeItem(item);

  return (
    <article>
      <Clickable
        href={safeItem.href}
        className="group grid gap-4 md:grid-cols-[280px_minmax(0,1fr)]"
      >
        <NewsImage
          src={safeItem.cover}
          alt={safeItem.title}
          className="aspect-16/10 rounded-sm"
        />

        <div>
          {safeItem.category && (
            <p className="mb-1.5 text-[11px] font-extrabold text-red-600">
              {safeItem.category}
            </p>
          )}

          <h3 className="text-[24px] font-black leading-[1.1] tracking-[-0.03em] text-neutral-950 transition group-hover:text-neutral-700">
            {safeItem.title}
          </h3>

          {safeItem.description && (
            <p className="mt-2.5 line-clamp-3 text-[13.5px] leading-6 text-neutral-600">
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
    <div className="grid gap-4 border-t border-neutral-200 pt-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, index) => {
        const safeItem = normalizeItem(item);

        return (
          <article key={getItemKey(safeItem, index)}>
            <Clickable href={safeItem.href} className="group block">
              <h3 className="line-clamp-2 text-[13.5px] font-extrabold leading-5 text-neutral-950 transition group-hover:text-neutral-700">
                {safeItem.title}
              </h3>
              {safeItem.description && (
                <p className="mt-1 line-clamp-2 text-[12px] leading-5 text-neutral-600">
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

function FourCardStrip({ stories = [] }) {
  if (!stories.length) return null;

  return (
    <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stories.slice(0, 4).map((item, index) => (
        <CompactImageCard key={getItemKey(item, index)} item={item} titleOnly />
      ))}
    </div>
  );
}

function MixedFeatureGrid({ featured, stories = [], sidebar = [] }) {
  const safeFeatured = featured ? normalizeItem(featured) : null;
  const safeStories = Array.isArray(stories) ? stories.map(normalizeItem) : [];
  const safeSidebar = Array.isArray(sidebar) ? sidebar.map(normalizeItem) : [];

  const bottomItem = safeStories[0] || null;
  const listItems = bottomItem
    ? safeStories.slice(1, 5)
    : safeStories.slice(0, 4);

  const featuredWithBottom = safeFeatured
    ? {
        ...safeFeatured,
        bottomNewsTitle: bottomItem?.title || "",
        bottomNewsDescription: bottomItem?.description || "",
        bottomNewsHref: bottomItem?.href || "",
      }
    : null;

  return (
    <div className="mt-4 grid gap-5 xl:grid-cols-[1.25fr_1fr_320px]">
      <div className="min-w-0">
        <FeaturedHorizontal item={featuredWithBottom} />
      </div>

      <div className="min-w-0 border-t border-b border-neutral-200 py-4 xl:border-y-0 xl:border-x xl:px-5 xl:py-0">
        <TextStoryList items={listItems} columns />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
        {safeSidebar.slice(0, 2).map((item, index) => (
          <SidePromoCard key={getItemKey(item, index)} item={item} />
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
      ? safeStories.slice(5, 8)
      : safeStories.slice(4, 7);

  return (
    <section
      dir="rtl"
      className="border-t border-neutral-300 bg-white px-5 py-6 sm:px-6 lg:px-7"
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
            <div className="mt-5">
              <BottomMiniLinks items={bottomStories} />
            </div>
          )}
        </>
      )}

      {layout === "grid-4" && (
        <>
          <FourCardStrip stories={safeStories} />
          {safeStories.length > 4 && (
            <div className="mt-5">
              <BottomMiniLinks items={safeStories.slice(4, 7)} />
            </div>
          )}
        </>
      )}

      {layout === "video-row" && (
        <div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
            {safeStories.slice(0, 5).map((item, index) => (
              <VideoCard key={getItemKey(item, index)} item={item} />
            ))}
          </div>

          {safeSidebar.length > 0 && (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {safeSidebar.slice(0, 3).map((item, index) => (
                <SidePromoCard
                  key={getItemKey(item, index)}
                  item={item}
                  label="ویدیوی بیشتر"
                />
              ))}
            </div>
          )}

          {safeStories.length > 0 && (
            <div className="mt-4 flex justify-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-neutral-950" />
              <span className="h-1.5 w-1.5 rounded-full bg-neutral-300" />
            </div>
          )}
        </div>
      )}

      {layout === "magazine" && (
        <div className="mt-4">
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_300px]">
            <MagazineFeature item={safeFeatured || safeStories[0]} />

            <div className="rounded-md border border-neutral-200 p-3.5">
              <p className="mb-3 text-[11px] font-extrabold uppercase text-neutral-500">
                مطالب بیشتر از این بخش
              </p>

              <div className="space-y-3">
                {(safeFeatured ? safeStories : safeStories.slice(1))
                  .slice(0, 2)
                  .map((item, index) => (
                    <SidePromoCard key={getItemKey(item, index)} item={item} />
                  ))}
              </div>
            </div>
          </div>

          <div className="mt-5">
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
