import Image from "next/image";
import Link from "next/link";
import SectionHeader from "@/components/layout/SectionHeader";
import { Play } from "lucide-react";

function NewsImage({
  src,
  alt,
  className = "",
  isVideo = false,
  duration,
  priority = false,
}) {
  if (!src) return null;

  return (
    <div className={`relative overflow-hidden bg-neutral-200 ${className}`}>
      <Image
        src={src}
        alt={alt || "News"}
        fill
        priority={priority}
        className="object-cover transition duration-300 group-hover:scale-[1.03]"
        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 420px"
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

function FeaturedHorizontal({ item }) {
  if (!item) return null;

  return (
    <article>
      <Link
        href={item.href || "#"}
        className="group grid gap-4 sm:grid-cols-[190px_minmax(0,1fr)] xl:grid-cols-[220px_minmax(0,1fr)] items-center"
      >
        <NewsImage
          src={item.image}
          alt={item.title}
          className="aspect-3/3 w-full rounded-sm"
          priority
        />

        <div className="min-w-0">
          {item.category && (
            <p className="mb-2 text-[12px] font-extrabold uppercase tracking-tight text-red-600 ">
              {item.category}
            </p>
          )}

          <h3 className="text-[22px] font-semibold leading-[1.1] tracking-[-0.03em] text-neutral-950 transition group-hover:text-neutral-700">
            {item.title}
          </h3>

          {item.description && (
            <p className="mt-3 line-clamp-3 text-[14.5px] leading-6 text-neutral-600">
              {item.description}
            </p>
          )}
        </div>
      </Link>
    </article>
  );
}

function CompactImageCard({ item, isVideo = false }) {
  if (!item) return null;

  return (
    <article>
      <Link href={item.href || "#"} className="group block">
        <NewsImage
          src={item.image}
          alt={item.title}
          isVideo={isVideo || item.isVideo}
          duration={item.duration}
          className="aspect-[16/10] rounded-sm"
        />

        {item.category && (
          <p className="mt-2.5 text-[11px] font-extrabold text-red-600">
            {item.category}
          </p>
        )}

        <h3 className="mt-1.5 line-clamp-2 text-[14px] font-extrabold leading-5 text-neutral-950 transition group-hover:text-neutral-700">
          {item.title}
        </h3>

        {item.description && (
          <p className="mt-1 line-clamp-2 text-[12px] leading-5 text-neutral-600">
            {item.description}
          </p>
        )}
      </Link>
    </article>
  );
}

function TextStoryList({ items = [], columns = false }) {
  if (!items.length) return null;

  return (
    <div
      className={columns ? "grid gap-x-6 gap-y-4 sm:grid-cols-2" : "space-y-4"}
    >
      {items.map((item, index) => (
        <article key={item.id || index}>
          <Link href={item.href || "#"} className="group block">
            {item.category && (
              <p className="mb-1 text-[11px] font-extrabold text-red-600">
                {item.category}
              </p>
            )}

            <h3 className="line-clamp-2 text-[14px] font-extrabold leading-5 text-neutral-950 transition group-hover:text-neutral-700">
              {item.title}
            </h3>

            {item.description && (
              <p className="mt-1 line-clamp-2 text-[12px] leading-5 text-neutral-600">
                {item.description}
              </p>
            )}
          </Link>
        </article>
      ))}
    </div>
  );
}

function SidePromoCard({ item, label = "Latest" }) {
  if (!item) return null;

  return (
    <article>
      <Link
        href={item.href || "#"}
        className="group grid grid-cols-[92px_minmax(0,1fr)] gap-3 rounded-md border border-neutral-200 bg-white p-2.5 transition hover:border-neutral-400"
      >
        <NewsImage
          src={item.image}
          alt={item.title}
          className="aspect-square rounded-sm"
        />

        <div className="min-w-0">
          <p className="mb-1 text-[10px] font-extrabold uppercase text-neutral-500">
            {label}
          </p>

          <h3 className="line-clamp-3 text-[12.5px] font-extrabold leading-4.5 text-neutral-950 transition group-hover:text-neutral-700">
            {item.title}
          </h3>
        </div>
      </Link>
    </article>
  );
}

function VideoCard({ item }) {
  if (!item) return null;

  return (
    <article>
      <Link
        href={item.href || "#"}
        className="group relative block overflow-hidden rounded-md bg-black"
      >
        <NewsImage
          src={item.image}
          alt={item.title}
          isVideo
          duration={item.duration}
          className="aspect-[4/5] md:aspect-[5/6]"
        />

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent p-4 pt-12">
          <h3 className="line-clamp-3 text-[13.5px] font-extrabold leading-5 text-white">
            {item.title}
          </h3>
        </div>
      </Link>
    </article>
  );
}

function MagazineFeature({ item }) {
  if (!item) return null;

  return (
    <article>
      <Link
        href={item.href || "#"}
        className="group grid gap-4 md:grid-cols-[280px_minmax(0,1fr)]"
      >
        <NewsImage
          src={item.image}
          alt={item.title}
          className="aspect-[16/10] rounded-sm"
        />

        <div>
          {item.category && (
            <p className="mb-1.5 text-[11px] font-extrabold text-red-600">
              {item.category}
            </p>
          )}

          <h3 className="text-[24px] font-black leading-[1.1] tracking-[-0.03em] text-neutral-950 transition group-hover:text-neutral-700">
            {item.title}
          </h3>

          {item.description && (
            <p className="mt-2.5 line-clamp-3 text-[13.5px] leading-6 text-neutral-600">
              {item.description}
            </p>
          )}
        </div>
      </Link>
    </article>
  );
}

function BottomMiniLinks({ items = [] }) {
  if (!items.length) return null;

  return (
    <div className="grid gap-4 border-t border-neutral-200 pt-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, index) => (
        <article key={item.id || index}>
          <Link href={item.href || "#"} className="group block">
            <h3 className="line-clamp-2 text-[13.5px] font-extrabold leading-5 text-neutral-950 transition group-hover:text-neutral-700">
              {item.title}
            </h3>
            {item.description && (
              <p className="mt-1 line-clamp-2 text-[12px] leading-5 text-neutral-600">
                {item.description}
              </p>
            )}
          </Link>
        </article>
      ))}
    </div>
  );
}

function FourCardStrip({ stories = [] }) {
  if (!stories.length) return null;

  return (
    <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stories.slice(0, 4).map((item, index) => (
        <CompactImageCard key={item.id || index} item={item} />
      ))}
    </div>
  );
}

function MixedFeatureGrid({ featured, stories = [], sidebar = [] }) {
  return (
    <div className="mt-4 grid gap-5 xl:grid-cols-[1.25fr_1fr_320px]">
      <div className="min-w-0">
        <FeaturedHorizontal item={featured} />
      </div>

      <div className="min-w-0 border-t border-b border-neutral-200 py-4 xl:border-y-0 xl:border-x xl:px-5 xl:py-0">
        <TextStoryList items={stories.slice(0, 4)} columns />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
        {sidebar.slice(0, 2).map((item, index) => (
          <SidePromoCard key={item.id || index} item={item} />
        ))}
      </div>
    </div>
  );
}

export default function CategoryNewsSection({
  title,
  href = "#",
  layout = "feature-list-sidebar",
  featured,
  stories = [],
  sidebar = [],
  tabs = [],
  activeTab,
}) {
  const safeStories = Array.isArray(stories) ? stories : [];
  const safeSidebar = Array.isArray(sidebar) ? sidebar : [];
  const bottomStories = safeStories.slice(4, 7);

  return (
    <section
      dir="rtl"
      className="border-t border-neutral-300 bg-white px-5 py-6 sm:px-6 lg:px-7"
      aria-labelledby={`section-${title}`}
    >
      <SectionHeader
        title={title}
        href={href}
        tabs={tabs}
        activeTab={activeTab}
        titleId={`section-${title}`}
      />

      {layout === "feature-list-sidebar" && (
        <>
          <MixedFeatureGrid
            featured={featured}
            stories={safeStories}
            sidebar={safeSidebar}
          />
          <div className="mt-5">
            <BottomMiniLinks items={bottomStories} />
          </div>
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
              <VideoCard key={item.id || index} item={item} />
            ))}
          </div>

          {safeSidebar.length > 0 && (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
         
            </div>
          )}

          <div className="mt-4 flex justify-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-neutral-950" />
            <span className="h-1.5 w-1.5 rounded-full bg-neutral-300" />
          </div>
        </div>
      )}

      {layout === "magazine" && (
        <div className="mt-4">
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_300px]">
            <MagazineFeature item={featured} />

            <div className="rounded-md border border-neutral-200 p-3.5">
              <p className="mb-3 text-[11px] font-extrabold uppercase text-neutral-500">
                More from this section
              </p>

              <div className="space-y-3">
                {safeStories.slice(0, 2).map((item, index) => (
                  <SidePromoCard key={item.id || index} item={item} />
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5">
            <BottomMiniLinks items={safeStories.slice(2, 6)} />
          </div>
        </div>
      )}

     
    </section>
  );
}
