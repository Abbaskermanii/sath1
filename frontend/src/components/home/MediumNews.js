import Image from "next/image";

function MediumNews({ title, description, image, category, categoryTitle }) {
  return (
    <article className="bg-white px-6 " dir="rtl">
      <div className="max-w-2xl mx-auto space-y-4">
        
        {/* 👇 فقط این بخش هاور میگیره */}
        <div className="group space-y-4">
          {image && (
            <div className="overflow-hidden rounded-lg">
              <Image
                src={image}
                alt={title || "image"}
                width={600}
                height={320}
                className="
                  w-full h-auto object-cover
                  transition-transform duration-300
                  group-hover:scale-105
                "
              />
            </div>
          )}

          <div className="space-y-3">
            {title && (
              <h2
                className="
                  text-base font-semibold leading-snug text-right text-neutral-900
                  transition-colors duration-200
                  group-hover:text-neutral-700
                "
              >
                {title}
              </h2>
            )}

            {description && (
              <p
                className="
                  text-sm text-neutral-600 leading-relaxed text-right
                  transition-colors duration-200
                  group-hover:text-neutral-800
                "
              >
                {description}
              </p>
            )}
          </div>
        </div>

        {/* ❌ این بخش بدون هاور */}
        {(category || categoryTitle) && (
          <div className="border border-neutral-300 rounded-xl p-3 space-y-1">
            {category && (
              <div className="text-xs text-neutral-500">{category}</div>
            )}

            {categoryTitle && (
              <div className="text-sm font-semibold text-neutral-800 leading-snug">
                {categoryTitle}
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

export default MediumNews;