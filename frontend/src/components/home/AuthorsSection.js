import Image from "next/image";
import Link from "next/link";
import SectionHeader from "@/components/layout/SectionHeader";

function AuthorCard({ author }) {
  return (
    <Link
      href={author.href || "#"}
      className="
        group flex items-center gap-4 rounded-xl border border-neutral-200
        bg-white p-4 transition hover:border-neutral-400 hover:shadow-sm
      "
      dir="rtl"
    >
      {author.avatar && (
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-neutral-200">
          <Image
            src={author.avatar}
            alt={author.name || "Author"}
            fill
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        </div>
      )}

      <div className="min-w-0 text-right">
        <h3 className="text-[14px] font-extrabold text-neutral-950 transition group-hover:text-red-600">
          {author.name}
        </h3>

        {author.role && (
          <p className="mt-1 text-[11px] font-medium text-neutral-500">
            {author.role}
          </p>
        )}

        {author.bio && (
          <p className="mt-2 line-clamp-2 text-[12px] leading-5 text-neutral-600">
            {author.bio}
          </p>
        )}
      </div>
    </Link>
  );
}

export default function AuthorsSection({
  title = "نویسنده‌ها",
  items = [],
  href = "#",
}) {
  const safeItems = Array.isArray(items) ? items : [];

  if (!safeItems.length) return null;

  return (
    <section dir="rtl" className="border-t border-neutral-300 bg-blue-50/70 p-6">
      <SectionHeader title={title} href={href} actionText="همه نویسنده‌ها" />

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {safeItems.map((author, index) => (
          <AuthorCard key={author.id || index} author={author} />
        ))}
      </div>
    </section>
  );
}
