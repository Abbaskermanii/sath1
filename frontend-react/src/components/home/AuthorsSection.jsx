import { Link } from "react-router-dom";
import SectionHeader from "../layout/SectionHeader";

const DEFAULT_AUTHOR_AVATAR =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#fee2e2"/>
          <stop offset="45%" stop-color="#f8fafc"/>
          <stop offset="100%" stop-color="#dbeafe"/>
        </linearGradient>
      </defs>

      <rect width="144" height="144" rx="72" fill="url(#g)"/>

      <circle cx="72" cy="55" r="24" fill="#ef4444" opacity="0.92"/>

      <path
        d="M32 119c4.8-24.5 24.2-39 40-39s35.2 14.5 40 39"
        fill="#1f2937"
        opacity="0.9"
      />

      <circle cx="72" cy="72" r="68" fill="none" stroke="#ffffff" stroke-width="6" opacity="0.9"/>
    </svg>
  `);

function normalizeAuthor(author, index) {
  return {
    id: author?.id || author?.slug || index,
    name: author?.name || author?.author || "نویسنده شاخص‌یک",
    role: author?.role || author?.category || "نویسنده",
    bio:
      author?.bio ||
      author?.description ||
      author?.excerpt ||
      "نویسنده و تحلیلگر خبرهای روز در شاخص‌یک.",
    href: author?.href || author?.url || `/authors/${author?.id || index}`,
    avatar:
      author?.avatar ||
      author?.image ||
      author?.photo ||
      author?.profile_image ||
      author?.author_image ||
      "",
  };
}

function AuthorAvatar({ src, alt }) {
  return (
    <div
      className="
        relative h-16 w-16 shrink-0 overflow-hidden rounded-full
        bg-gradient-to-br from-red-100 via-white to-blue-100
        ring-2 ring-white shadow-sm
      "
    >
      <img
        src={src || DEFAULT_AUTHOR_AVATAR}
        alt={alt || "نویسنده"}
        loading="lazy"
        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        onError={(event) => {
          event.currentTarget.onerror = null;
          event.currentTarget.src = DEFAULT_AUTHOR_AVATAR;
        }}
      />
    </div>
  );
}

function AuthorCard({ author }) {
  return (
    <Link
      to={author.href}
      className="
        group flex items-center gap-4 rounded-xl border border-neutral-200
        bg-white p-4 transition hover:border-neutral-400 hover:shadow-sm
      "
      dir="rtl"
    >
      <AuthorAvatar src={author.avatar} alt={author.name} />

      <div className="min-w-0 text-right">
        <h3 className="truncate text-[14px] font-extrabold text-neutral-950 transition group-hover:text-red-600">
          {author.name}
        </h3>

        <p className="mt-1 truncate text-[11px] font-medium text-neutral-500">
          {author.role}
        </p>

        <p className="mt-2 line-clamp-2 text-[12px] leading-5 text-neutral-600">
          {author.bio}
        </p>
      </div>
    </Link>
  );
}

export default function AuthorsSection({
  items = [],
  href = "/authors",
  title = "نویسنده‌ها",
  actionText = "همه نویسنده‌ها",
}) {
  const authors = items.map(normalizeAuthor).filter((author) => author.name);

  if (!authors.length) {
    return null;
  }

  return (
    <section
      dir="rtl"
      className="border-t border-neutral-300 bg-blue-50/70 p-6"
    >
      <SectionHeader title={title} href={href} actionText={actionText} />

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {authors.slice(0, 3).map((author) => (
          <AuthorCard key={author.id} author={author} />
        ))}
      </div>
    </section>
  );
}
