import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

/* ========================= EMBED (ثابت) ========================= */
function normalizeEmbedUrl(url = "") {
  if (!url) return "";
  const trimmed = String(url).trim();
  const match = trimmed.match(/src=["']([^"']+)["']/i);
  const raw = match ? match[1] : trimmed;
  if (!raw) return "";
  if (raw.includes("youtube.com/watch?v=")) {
    const id = raw.split("v=")[1]?.split("&")[0];
    return id ? `https://www.youtube.com/embed/${id}?rel=0` : raw;
  }
  if (raw.includes("youtu.be/")) {
    const id = raw.split("youtu.be/")[1]?.split("?")[0];
    return id ? `https://www.youtube.com/embed/${id}?rel=0` : raw;
  }
  if (raw.includes("youtube.com/embed/")) return raw;
  const aparatMatch = raw.match(/aparat\.com\/v\/([^/?&]+)/i);
  if (aparatMatch) {
    return `https://www.aparat.com/video/video/embed/videohash/${aparatMatch[1]}/vt/frame`;
  }
  return raw;
}

export default function SnowflakeVideoCard({ videos = [], mode = "widget" }) {
  const safeVideos = useMemo(
    () => (Array.isArray(videos) ? videos.slice(0, 10) : []),
    [videos],
  );

  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // اتو اسلاید (Auto-slide)
  useEffect(() => {
    if (isPlaying || safeVideos.length <= 1) return;

    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % safeVideos.length);
    }, 3000); // 🚀 تغییر از 5000 به 3000 (هر 3 ثانیه ورق می‌خورد)

    return () => clearInterval(timer);
  }, [isPlaying, safeVideos.length]);

  const current = safeVideos[index];

  const next = () => {
    setIsPlaying(false);
    setIndex((p) => (p + 1) % safeVideos.length);
  };

  const prev = () => {
    setIsPlaying(false);
    setIndex((p) => (p - 1 + safeVideos.length) % safeVideos.length);
  };

  if (!current) return null;

  const embedSrc = normalizeEmbedUrl(
    current.embedUrl || current.embed_url || "",
  );
  const videoFile = current.videoFile || current.video_file || "";
  const preview =
    current.image || current.cover || current.thumbnail || current.poster || "";
  const isWidget = mode === "widget";

  return (
    <section
      dir="rtl"
      className={`w-full ${isWidget ? "max-w-md mx-auto" : "max-w-5xl mx-auto"}`}
    >
      <div className="flex items-center justify-between border-b px-4 py-3 sm:px-5">
        <h2 className="text-base sm:text-lg font-bold text-gray-900">
          ویدیوهای امروز
        </h2>
      </div>

      <div
        className={`relative bg-black ${isWidget ? "m-3 rounded-xl" : "my-6 rounded-2xl"}`}
      >
        <div className="relative aspect-video">
          {!isPlaying && preview && (
            <>
              <img
                src={preview}
                className="h-full w-full object-cover"
                alt="thumbnail"
              />
              <button
                onClick={() => setIsPlaying(true)}
                className="absolute inset-0 flex items-center justify-center"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur">
                  ▶
                </span>
              </button>
            </>
          )}
          {isPlaying && videoFile && (
            <video
              src={videoFile}
              controls
              autoPlay
              className="h-full w-full"
            />
          )}
          {isPlaying && !videoFile && embedSrc && (
            <iframe
              src={embedSrc}
              className="h-full w-full"
              allowFullScreen
              title="video"
            />
          )}
        </div>
      </div>

      <div className="px-4 sm:px-5 text-right">
        <h3 className="text-sm sm:text-base lg:text-lg font-bold leading-snug line-clamp-2 text-gray-900 mb-4">
          {current.title}
        </h3>
      </div>

      <div className="flex flex-col gap-4 px-4 pb-5 sm:px-5">
        <div className="flex justify-center gap-2">
          {safeVideos.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setIndex(i);
                setIsPlaying(false);
              }}
              className={`transition-all duration-300 ${i === index ? "w-3 h-3 bg-gray-900 scale-110 rounded-full" : "w-2.5 h-2.5 bg-gray-300 rounded-full"}`}
            />
          ))}
        </div>
        <div className="flex justify-between">
          <button
            onClick={prev}
            className="flex h-9 w-9 items-center justify-center rounded-full border hover:bg-gray-100"
          >
            <ChevronRight size={18} />
          </button>
          <button
            onClick={next}
            className="flex h-9 w-9 items-center justify-center rounded-full border hover:bg-gray-100"
          >
            <ChevronLeft size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
