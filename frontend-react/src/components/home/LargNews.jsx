function LargNews({ title, description, image, categoryText, categoryTitle }) {
  return (
    <article className="bg-white p-8" dir="rtl">
      <div className="mx-auto flex max-w-5xl items-stretch gap-6 group">
        {image && (
          <div className="aspect-16/10 w-90 shrink-0 overflow-hidden rounded-lg">
            <img
              src={image}
              alt={title || "image"}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col gap-5">
          <div className="space-y-4">
            {title && (
              <h2
                className="
                  text-right text-2xl font-bold leading-tight text-neutral-900
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
                  text-right text-base font-medium leading-relaxed text-neutral-600
                  transition-colors duration-200
                  group-hover:text-neutral-800
                "
              >
                {description}
              </p>
            )}
          </div>

          {(categoryText || categoryTitle) && (
            <div className="mt-2 rounded-xl border border-neutral-300 p-4">
              {categoryText && (
                <div className="mb-2 text-sm text-neutral-500">
                  {categoryText}
                </div>
              )}

              {categoryTitle && (
                <div className="text-sm font-semibold text-neutral-800">
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

export default LargNews;
