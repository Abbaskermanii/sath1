import { Link } from "react-router-dom";
import SectionHeader from "../layout/SectionHeader";

const authors = [
  {
    id: 1,
    name: "الهام رضایی",
    role: "سردبیر",
    bio: "پیگیر اخبار روز، گزارش‌های ویژه و روایت‌های دقیق از اتفاقات مهم.",
    href: "/authors/1",
    avatar: "/144x144.webp",
  },
  {
    id: 2,
    name: "محمد طاهری",
    role: "خبرنگار سیاسی",
    bio: "نویسنده تحلیل‌های کوتاه و پوشش‌دهنده رویدادهای مهم داخلی و خارجی.",
    href: "/authors/2",
    avatar: "/144x144 (1).webp",
  },
  {
    id: 3,
    name: "نسترن احمدی",
    role: "تحلیلگر اجتماعی",
    bio: "علاقه‌مند به روایت مسائل اجتماعی، فرهنگ عمومی و تغییرات سبک زندگی.",
    href: "/authors/3",
    avatar: "/144x144 (2).webp",
  },
];

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
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-neutral-200">
        <img
          src={author.avatar}
          alt={author.name}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
      </div>

      <div className="min-w-0 text-right">
        <h3 className="text-[14px] font-extrabold text-neutral-950 transition group-hover:text-red-600">
          {author.name}
        </h3>

        <p className="mt-1 text-[11px] font-medium text-neutral-500">
          {author.role}
        </p>

        <p className="mt-2 line-clamp-2 text-[12px] leading-5 text-neutral-600">
          {author.bio}
        </p>
      </div>
    </Link>
  );
}

export default function AuthorsSection() {
  return (
    <section
      dir="rtl"
      className="border-t border-neutral-300 bg-blue-50/70 p-6"
    >
      <SectionHeader
        title="نویسنده‌ها"
        href="/authors"
        actionText="همه نویسنده‌ها"
      />

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {authors.map((author) => (
          <AuthorCard key={author.id} author={author} />
        ))}
      </div>
    </section>
  );
}
