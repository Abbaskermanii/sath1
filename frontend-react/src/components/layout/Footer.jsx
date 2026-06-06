import { Link } from "react-router-dom";
import useCategories from "../../hooks/useCategories";

export default function SiteFooter() {
  const { categories } = useCategories(12);

  const staticColumns = [
    {
      title: "رسانه",
      links: [
        { label: "ویدیو", to: "/videos" },
        { label: "پادکست", to: "/podcasts" },
        { label: "گزارش ویژه", to: "/special-reports" },
        { label: "خبرنامه", to: "/newsletter" },
        { label: "آرشیو", to: "/archive" },
      ],
    },
    {
      title: "سرویس‌ها",
      links: [
        { label: "درباره ما", to: "/about" },
        { label: "تماس", to: "/contact" },
        { label: "تبلیغات", to: "/ads" },
        { label: "قوانین", to: "/terms" },
        { label: "حریم خصوصی", to: "/privacy" },
      ],
    },
  ];

  const categoryLinks = categories.map((category) => ({
    label: category.title,
    to: `/category/${category.slug}`,
  }));

  const columns = [
    {
      title: "دسته‌بندی‌ها",
      links: categoryLinks.slice(0, 6),
    },
    ...staticColumns,
  ];

  return (
    <footer dir="rtl" className="mt-0 bg-neutral-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="border-b border-neutral-800 pb-8">
          <Link
            to="/"
            className="block text-3xl font-extrabold tracking-tight text-right"
          >
            شاخص یک{" "}
          </Link>

          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {columns.map((col) => (
              <div key={col.title}>
                <h3 className="mb-4 text-[13px] font-extrabold text-white">
                  {col.title}
                </h3>

                <ul className="space-y-2">
                  {col.links.length > 0 ? (
                    col.links.map((link) => (
                      <li key={link.label}>
                        <Link
                          to={link.to}
                          className="text-[12px] text-neutral-400 transition hover:text-white"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))
                  ) : (
                    <li className="text-[12px] text-neutral-500">
                      موردی وجود ندارد
                    </li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 py-5 text-[11px] text-neutral-500 md:flex-row md:items-center md:justify-between">
          <p>© 2026 News Platform. All rights reserved.</p>

          <div className="flex flex-wrap gap-4">
            <Link to="/terms" className="hover:text-white">
              Terms
            </Link>

            <Link to="/privacy" className="hover:text-white">
              Privacy
            </Link>

            <Link to="/cookies" className="hover:text-white">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
