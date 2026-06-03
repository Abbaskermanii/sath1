import { Link } from "react-router-dom";

function MediumVideoNews({
  title,
  description,
  suggestedLabel,
  suggestedVideoThumbnail,
  suggestedVideoTitle,
  suggestedVideoHref,
  suggestedVideoAlt,
}) {
  const hasSuggestedVideo =
    suggestedVideoThumbnail && suggestedVideoTitle && suggestedVideoHref;

  const videoSrc =
    "https://pixie3.cdn.asset.aparat.com/aparat-short/2059588054035513344.mp4?wmsAuthSign=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbiI6InA9MjA1OTU4ODEyMjMyMjIxMDgxNlx1MDAyNnU9MTYwMTgxNzRcdTAwMjZmPTIwNTk1ODgwNTQwMzU1MTMzNDQubXA0XHUwMDI2aT0xXHUwMDI2Y3Q9d2ViIiwiZXhwIjoxNzgwMDY4MjgzLCJpc3MiOiJTYWJhIElkZWEgR1NJRyJ9.jf8ftzmJx-I1o8ayuPg6DZ3OobfDQzDCsNw5UzDanVY";

  return (
    <article className="flex w-full justify-center bg-white" dir="rtl">
      <div className="flex w-full max-w-60 flex-col space-y-4">
        <div className="relative w-full overflow-hidden rounded-2xl bg-black">
          <video
            src={videoSrc}
            preload="auto"
            playsInline
            controls
            className="h-full w-full object-cover"
          />
        </div>

        {(title || description) && (
          <div className="space-y-3">
            {title && (
              <h2 className="text-sm font-bold leading-snug text-neutral-900">
                {title}
              </h2>
            )}

            {description && (
              <p className="text-xs leading-relaxed text-neutral-600">
                {description}
              </p>
            )}
          </div>
        )}

        {hasSuggestedVideo && (
          <Link
            to={suggestedVideoHref}
            className="group block overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 transition hover:bg-neutral-100"
          >
            <div className="flex items-start gap-3 p-3">
              <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-black">
                <img
                  src={suggestedVideoThumbnail}
                  alt={suggestedVideoAlt || suggestedVideoTitle}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              <div className="min-w-0 space-y-1">
                {suggestedLabel && (
                  <div className="text-[10px] text-neutral-500">
                    {suggestedLabel}
                  </div>
                )}

                <div className="text-xs font-semibold leading-5 text-neutral-800">
                  {suggestedVideoTitle}
                </div>
              </div>
            </div>
          </Link>
        )}
      </div>
    </article>
  );
}

export default MediumVideoNews;
