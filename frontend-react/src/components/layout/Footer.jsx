import { Link } from 'react-router-dom'

export default function SiteFooter() {
  const columns = [
    {
      title: "خبرها",
      links: [
        { label: "بازارها", href: "#" },
        { label: "اقتصاد", href: "#" },
        { label: "فناوری", href: "#" },
        { label: "کسب‌وکار", href: "#" },
        { label: "جهان", href: "#" },
      ],
    },
    {
      title: "موضوعات",
      links: [
        { label: "انرژی", href: "#" },
        { label: "کریپتو", href: "#" },
        { label: "هوش مصنوعی", href: "#" },
        { label: "زندگی و کار", href: "#" },
        { label: "شهرها", href: "#" },
      ],
    },
    {
      title: "رسانه",
      links: [
        { label: "ویدیو", href: "#" },
        { label: "پادکست", href: "#" },
        { label: "گزارش ویژه", href: "#" },
        { label: "خبرنامه", href: "#" },
        { label: "آرشیو", href: "#" },
      ],
    },
    {
      title: "سرویس‌ها",
      links: [
        { label: "درباره ما", href: "#" },
        { label: "تماس", href: "#" },
        { label: "تبلیغات", href: "#" },
        { label: "قوانین", href: "#" },
        { label: "حریم خصوصی", href: "#" },
      ],
    },
  ];

  return (
    <footer dir="rtl" className="mt-0 bg-neutral-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="border-b border-neutral-800 pb-8">
          <div className=" text-3xl font-extrabold tracking-tight text-right">
            سطح یک
          </div>

          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {columns.map((col) => (
              <div key={col.title}>
                <h3 className="mb-4 text-[13px] font-extrabold text-white">
                  {col.title}
                </h3>

                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-[12px] text-neutral-400 transition hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 py-5 text-[11px] text-neutral-500 md:flex-row md:items-center md:justify-between">
          <p>© 2026 News Platform. All rights reserved.</p>

          <div className="flex flex-wrap gap-4">
            <Link href="#" className="hover:text-white">
              Terms
            </Link>
            <Link href="#" className="hover:text-white">
              Privacy
            </Link>
            <Link href="#" className="hover:text-white">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
