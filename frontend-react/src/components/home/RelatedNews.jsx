function RelatedNews({ news }) {
  if (!news) return null;

  return (
    <div
      className="mt-5 border-t border-neutral-300 py-8"
      dir="rtl"
    >
      <div className="mx-auto max-w-5xl px-6">
        <div className="grid grid-cols-3">
          {news.map((item, index) => (
            <div
              key={index}
              className="
                px-4 border-l border-neutral-300 last:border-0
                group
              "
            >
              {item && (
                <h3
                  className="
                    text-[15px] font-medium leading-tight text-right
                    cursor-pointer
                    transition-all duration-300 ease-out
                    group-hover:text-blue-600
                  "
                >
                  {item}
                </h3>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default RelatedNews;