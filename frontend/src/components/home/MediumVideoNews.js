"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef, useState, useEffect, useCallback } from "react";
import { Play, Pause } from "lucide-react";

function MediumVideoNews({
  title,
  description,
  video,
  duration,
  videoAriaLabelPlay = "پخش ویدیو",
  videoAriaLabelPause = "توقف ویدیو",
  suggestedLabel,
  suggestedVideoThumbnail,
  suggestedVideoTitle,
  suggestedVideoHref,
  suggestedVideoDuration,
  suggestedVideoAlt,
  suggestedVideoAriaLabel = "مشاهده ویدیوی پیشنهادی",
}) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false); // 👈 اضافه شد

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setIsPlaying(false);

    vid.addEventListener("play", onPlay);
    vid.addEventListener("pause", onPause);
    vid.addEventListener("ended", onEnded);

    return () => {
      vid.removeEventListener("play", onPlay);
      vid.removeEventListener("pause", onPause);
      vid.removeEventListener("ended", onEnded);
    };
  }, []);

  const toggle = useCallback(async () => {
    const vid = videoRef.current;
    if (!vid) return;

    try {
      if (vid.paused) await vid.play();
      else vid.pause();
    } catch (error) {
      console.error("Video play/pause failed:", error);
    }
  }, []);

  const hasSuggestedVideo =
    suggestedVideoThumbnail && suggestedVideoTitle && suggestedVideoHref;

  const showControl = isHovered || !isPlaying;
  // اگر پلی نیست همیشه نشان بده، اگر پلی هست فقط موقع hover

  return (
    <article className="flex w-full justify-center bg-white" dir="rtl">
      <div className="flex w-full max-w-60 flex-col space-y-4">

        {video && (
          <div
            className="relative w-full overflow-hidden rounded-2xl bg-black"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="relative aspect-9/16 w-full">
              <video
                ref={videoRef}
                src={video}
                playsInline
                preload="metadata"
                controls={false}
                onClick={toggle}
                className="h-full w-full object-cover"
              />

              <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />

              {/* 👇 دکمه کنترل */}
              <button
                type="button"
                onClick={toggle}
                aria-label={isPlaying ? videoAriaLabelPause : videoAriaLabelPlay}
                className={`absolute inset-0 z-10 flex items-center justify-center transition-opacity duration-200 ${showControl ? "opacity-100" : "opacity-0 pointer-events-none"
                  }`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-md transition-transform duration-150 ease-out hover:scale-110 active:scale-95">
                  {isPlaying ? (
                    <Pause className="h-5 w-5 text-red-600" />
                  ) : (
                    <Play className="h-5 w-5 text-red-600" fill="currentColor" />
                  )}
                </div>
              </button>

              {duration && (
                <div className="absolute bottom-3 left-3 rounded bg-black/70 px-2 py-1 text-[10px] text-white">
                  {duration}
                </div>
              )}
            </div>
          </div>
        )}

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
            href={suggestedVideoHref}
            className="group block overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 transition hover:bg-neutral-100"
          >
            <div className="flex items-start gap-3 p-3">
              <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-black">
                <Image
                  src={suggestedVideoThumbnail}
                  alt={suggestedVideoAlt || suggestedVideoTitle}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
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