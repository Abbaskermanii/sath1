import Link from "next/link";

export default function HotNews({ items }) {
  return (
    <div dir="rtl" className="flex flex-wrap gap-2 pt-8">
      {items.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          className="inline-flex items-center rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm text-neutral-800 transition-colors duration-200 hover:border-neutral-500 hover:bg-neutral-100 hover:text-black"
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}
