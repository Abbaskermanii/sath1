import { Link } from "react-router-dom";

export default function AdBox({
  image,
  label = "ADS",
  title,
  description,
  buttonText = "مشاهده بیشتر",
  href = "",
}) {
  const safeHref = typeof href === "string" ? href.trim() : "";
  const isExternal = /^https?:\/\//i.test(safeHref);
  const hasLink = safeHref.length > 0 && safeHref !== "#";

  const wrapperClassName =
    "group relative flex w-full flex-row-reverse items-center gap-3 sm:gap-5 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 sm:p-5 transition hover:bg-neutral-100";

  const content = (
    <>
      <span className="absolute left-3 top-3 rounded-full bg-neutral-900 px-2 py-1 text-[10px] font-semibold tracking-[0.12em] text-white">
        {label}
      </span>

      {image && (
        <div className="relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-xl bg-neutral-200">
          <img
            src={image}
            alt={title || "Advertisement"}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col text-right">
        {title && (
          <h4 className="line-clamp-2 text-sm font-semibold leading-6 text-neutral-900">
            {title}
          </h4>
        )}

        {description && (
          <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-neutral-600">
            {description}
          </p>
        )}

        <div className="mt-3">
          <span className="inline-flex items-center text-xs font-medium text-neutral-800 transition group-hover:text-black">
            {buttonText}
            <span className="mr-1 transition-transform duration-200 group-hover:-translate-x-1">
              ←
            </span>
          </span>
        </div>
      </div>
    </>
  );

  return (
    <div className="w-full px-4 pt-6 flex justify-center">
      {hasLink ? (
        isExternal ? (
          <a
            href={safeHref}
            target="_blank"
            rel="noopener noreferrer"
            className={wrapperClassName}
          >
            {content}
          </a>
        ) : (
          <Link to={safeHref} className={wrapperClassName}>
            {content}
          </Link>
        )
      ) : (
        <div className={wrapperClassName}>{content}</div>
      )}
    </div>
  );
}
