import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Search, X } from "lucide-react";
import useSearchPosts from "../../hooks/useSearchPosts";

function HeaderSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);

  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  const { results, loading, error } = useSearchPosts(searchTerm);

  const hasSearch = searchTerm.trim().length >= 2;

  useEffect(() => {
    if (open && inputRef.current) {
      const timer = setTimeout(() => {
        inputRef.current.focus();
      }, 120);

      return () => clearTimeout(timer);
    }
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
        setSearchTerm("");
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleToggle = () => {
    setOpen((prev) => {
      const next = !prev;
      if (!next) {
        setSearchTerm("");
      }
      return next;
    });
  };

  const handleClose = () => {
    setOpen(false);
    setSearchTerm("");
  };

  const handleResultClick = () => {
    setOpen(false);
    setSearchTerm("");
  };

  return (
    <div ref={wrapperRef} className="relative flex items-center">
      <div
        className={`flex items-center overflow-hidden rounded-full bg-white shadow-sm origin-right will-change-[width] transition-all duration-300 ease-in-out ${
          open
            ? "fixed left-4 right-4 top-20 z-[70] px-3 py-2 md:static md:w-[360px] md:left-auto md:right-auto md:top-auto"
            : "h-10 w-10 justify-center px-0 py-0"
        }`}
      >
        {!open ? (
          <button
            type="button"
            onClick={handleToggle}
            className="flex h-10 w-10 items-center justify-center text-black cursor-pointer"
            aria-label="باز کردن جستجو"
          >
            <Search size={20} />
          </button>
        ) : (
          <>
            <Search size={18} className="text-gray-500 shrink-0" />

            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="جستجو در اخبار..."
              className="mx-2 w-full bg-transparent text-sm text-black outline-none placeholder:text-gray-400"
            />

            <button
              type="button"
              onClick={handleClose}
              className="text-gray-500 hover:text-red-500 transition shrink-0 cursor-pointer"
              aria-label="بستن جستجو"
            >
              <X size={18} />
            </button>
          </>
        )}
      </div>

      {open && hasSearch && (
        <div className="fixed left-4 right-4 top-34 z-[70] max-h-[70vh] overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-2xl md:absolute md:left-auto md:right-0 md:top-12 md:w-[360px]">
          {loading && (
            <div className="space-y-3 p-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="animate-pulse">
                  <div className="mb-2 h-4 w-3/4 rounded bg-neutral-200" />
                  <div className="h-3 w-1/2 rounded bg-neutral-100" />
                </div>
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="p-4 text-sm text-red-500">{error}</div>
          )}

          {!loading && !error && results.length === 0 && (
            <div className="p-4 text-sm text-neutral-500">
              نتیجه‌ای پیدا نشد.
            </div>
          )}

          {!loading && !error && results.length > 0 && (
            <div className="max-h-[70vh] overflow-y-auto md:max-h-96">
              {results.map((post) => {
                const image =
                  post.image ||
                  post.thumbnail ||
                  post.cover ||
                  post.featured_image ||
                  post.poster;

                return (
                  <Link
                    key={post.id || post.slug}
                    to={`/news/${post.slug}`}
                    onClick={handleResultClick}
                    className="flex gap-3 border-b border-neutral-100 p-3 transition hover:bg-neutral-50 last:border-b-0"
                  >
                    {image ? (
                      <img
                        src={image}
                        alt={post.title}
                        className="h-14 w-20 rounded-md object-cover shrink-0"
                      />
                    ) : (
                      <div className="flex h-14 w-20 shrink-0 items-center justify-center rounded-md bg-neutral-100 text-xs text-neutral-400">
                        خبر
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <h4 className="line-clamp-2 text-sm font-bold text-neutral-800">
                        {post.title}
                      </h4>

                      {post.category?.title && (
                        <p className="mt-1 text-xs text-red-500">
                          {post.category.title}
                        </p>
                      )}

                      {post.excerpt && (
                        <p className="mt-1 line-clamp-1 text-xs text-neutral-500">
                          {post.excerpt}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default HeaderSearch;
