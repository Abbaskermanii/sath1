"use client";

import { useRef, useState, useEffect } from "react";
import { Play, Pause } from "lucide-react";

function MediumVideoNews({
  title,
  description,
  video,
  category,
  categoryTitle,
  duration,
}) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // 👇 گرفتن فریم اول ویدیو
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    const handleLoaded = () => {
      vid.currentTime = 0.1; // 👈 مهم
      setIsReady(true);
    };

    vid.addEventListener("loadeddata", handleLoaded);

    return () => {
      vid.removeEventListener("loadeddata", handleLoaded);
    };
  }, []);

  const handlePlayToggle = async () => {
    const vid = videoRef.current;
    if (!vid) return;

    try {
      if (vid.paused) {
        await vid.play();
        setIsPlaying(true);
      } else {
        vid.pause();
        setIsPlaying(false);
      }
    } catch (err) {
      console.error("Video error:", err);
    }
  };

  return (
    <article className="w-full bg-white pt-8" dir="rtl">
      <div className="space-y-4">
        {video && (
          <div className="relative w-full overflow-hidden rounded-2xl bg-black">
            <div className="relative h-120">
              <video
                ref={videoRef}
                src={video}
                className="h-full w-full object-cover"
                preload="metadata"
                playsInline
                muted // 👈 مهم برای بعضی مرورگرها
                onClick={handlePlayToggle}
                onEnded={() => setIsPlaying(false)}
              />

              {/* overlay */}
              <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent" />

              {/* play button */}
              <button
                type="button"
                onClick={handlePlayToggle}
                className="absolute inset-0 z-10 flex items-center justify-center"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-md transition hover:scale-110">
                  {isPlaying ? (
                    <Pause className="h-5 w-5 text-red-600" />
                  ) : (
                    <Play className="h-5 w-5 text-red-600" fill="currentColor" />
                  )}
                </div>
              </button>

              {duration && (
                <div className="absolute bottom-3 left-3 z-20 rounded bg-black/70 px-2 py-1 text-[10px] text-white">
                  {duration}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="space-y-3">
          {title && (
            <h2 className="line-clamp-2 text-sm font-bold leading-snug text-neutral-900">
              {title}
            </h2>
          )}

          {description && (
            <p className="line-clamp-3 text-xs leading-relaxed text-neutral-600">
              {description}
            </p>
          )}

          {(category || categoryTitle) && (
            <div className="space-y-1 rounded-xl border border-neutral-200 bg-neutral-50/50 p-3">
              {category && (
                <div className="text-[10px] text-neutral-500">
                  {category}
                </div>
              )}

              {categoryTitle && (
                <div className="text-xs font-semibold leading-snug text-neutral-800">
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

export default MediumVideoNews;