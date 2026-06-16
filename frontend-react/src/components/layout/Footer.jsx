import { Link } from "react-router-dom";
import useCategories from "../../hooks/useCategories";

export default function SiteFooter() {
  const { categories } = useCategories(12);

  const newsLinks = [
    { label: "مصاحبه", to: "/type/interview" },
    { label: "یادداشت", to: "/type/note" },
    { label: "خبر", to: "/type/news" },
    { label: "تحلیل", to: "/type/analysis" },
    { label: "گفتگوهای شاخص", to: "/type/talk" },
    { label: "گزارش", to: "/type/report" },
    { label: "نمودار", to: "/type/chart" },
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
    {
      title: "سرویس‌های خبری",
      links: newsLinks,
    },
  ];

  return (
    <footer dir="rtl" className="mt-0 bg-neutral-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="border-b border-neutral-800 pb-8">
          <Link
            to="/"
            className="block text-3xl font-extrabold tracking-tight text-right"
          >
            شاخص اول
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

        <div className="py-5 text-[11px] text-neutral-500">
          <p>تمام حقوق این سایت متعلق به شاخص یک میباشد.</p>
        </div>
      </div>
    </footer>
  );
}
