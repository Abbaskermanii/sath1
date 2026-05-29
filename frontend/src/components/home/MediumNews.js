import Image from "next/image";

function MediumNews({ title, description, image, category, categoryTitle }) {
  return (
    <article className="bg-white px-6 py-5" dir="rtl">
      <div className="max-w-2xl mx-auto space-y-4">
        {image && (
          <Image
            src={image}
            alt={title || "image"}
            width={600}
            height={320}
            className="w-full h-auto rounded-lg shadow-sm object-cover"
          />
        )}

        <div className="space-y-3">
          {title && (
            <h2 className="text-base font-semibold leading-snug text-right">
              {title}
            </h2>
          )}

          {description && (
            <p className="text-sm text-neutral-600 leading-relaxed text-right">
              {description}
            </p>
          )}

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
      </div>
    </article>
  );
}

export default MediumNews;
