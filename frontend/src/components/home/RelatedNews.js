function RelatedNews({ news }) {
  if (!news) return null;

  return (
    <div className="mt-5 pt-8 pb-8 border-t border-neutral-300" dir="rtl">
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-3">
          {news.map((item, index) => (
            <div
              key={index}
              className="px-4 border-l border-neutral-300 last:border-0"
            >
              {item && (
                <h3 className="text-[15px] font-medium leading-tight text-right hover:text-blue-600 transition-colors">
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
