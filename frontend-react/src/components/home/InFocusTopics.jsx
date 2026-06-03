import { Link } from 'react-router-dom'

export default function InFocusTopics({
  title = "در کانون توجه",
  items = [],
}) {
  if (!Array.isArray(items) || !items.length) return null;

  return (
    <section dir="rtl" className="w-full">
      <h3 className="mb-3 text-[13px] font-extrabold text-neutral-950">
        {title}
      </h3>

      <div className="flex flex-wrap gap-2">
        {items.map((item, index) => (
          <Link
            key={item.id || index}
            href={item.href || "#"}
            className="
              inline-flex items-center rounded-full border border-neutral-300
              bg-white px-3 py-1.5 text-[12px] font-semibold text-neutral-800
              transition hover:border-neutral-950 hover:bg-neutral-950 hover:text-white
              active:scale-95
            "
          >
            {item.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
