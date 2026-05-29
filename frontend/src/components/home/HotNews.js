import Link from "next/link";

export default function HotNews({ items }) {
  return (
    <div dir="rtl" className="flex flex-wrap gap-2">
      {items.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          className="
            inline-flex items-center rounded-md
            border border-neutral-300
            bg-white px-4 py-2 text-sm text-neutral-800

            transition-all duration-200

            hover:border-neutral-800
            hover:bg-neutral-900
            hover:text-white
            hover:shadow-md

            active:scale-95
          "
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}