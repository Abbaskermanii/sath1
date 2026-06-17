import { useEffect, useState } from "react";
import { getMarketItems } from "../../lib/market/marketApi";
import { Swiper, SwiperSlide } from "swiper/react";
// اضافه کردن Autoplay به ماژول‌ها
import { FreeMode, Autoplay } from "swiper/modules";

import "swiper/css";

function formatPrice(value) {
  if (!value) return "-";
  const clean = String(value).replace(/,/g, "");
  const number = parseFloat(clean);
  if (isNaN(number)) return "-";
  return new Intl.NumberFormat("fa-IR").format(number);
}

export default function Stocks() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const result = await getMarketItems();
        if (!ignore && Array.isArray(result)) {
          setItems(result);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => { ignore = true; };
  }, []);

  const data = Array.isArray(items) ? items : [];

  return (
    <div className="w-full border-y border-neutral-800 py-3">
      <div className="max-w-7xl mx-auto">
        {loading && (
          <div className="flex gap-2 px-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-neutral-800 h-8 w-32 rounded-lg" />
            ))}
          </div>
        )}

        {!loading && (
          <Swiper
            modules={[FreeMode, Autoplay]}
            spaceBetween={12}
            slidesPerView={"auto"}
            loop={true} // برای حرکت بی‌وقفه
            speed={3000} // سرعت حرکت به میلی‌ثانیه (هر چه بیشتر، حرکت آرام‌تر)
            autoplay={{
              delay: 0, // بدون تاخیر بین اسلایدها
              disableOnInteraction: false,
              pauseOnMouseEnter: true, // اگر موس روی نوار رفت، متوقف شود
            }}
            className="px-4"
          >
            {data.map((item) => (
              <SwiperSlide
                key={item.id ?? item.symbol}
                style={{ width: "140px" }}
              >
                <div className="h-9 flex items-center justify-between bg-neutral-800 border border-neutral-700 hover:border-neutral-500 transition rounded-md px-2 overflow-hidden cursor-pointer">
                  <div className="flex flex-col leading-tight overflow-hidden">
                    <span className="text-[9px] text-gray-400 whitespace-nowrap truncate">
                      {item.subtitle}
                    </span>
                    <span className="text-[11px] font-semibold text-white whitespace-nowrap truncate">
                      {item.title}
                    </span>
                  </div>
                  <span className="text-[11px] font-medium text-green-400 whitespace-nowrap">
                    {formatPrice(item.value)}
                  </span>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>
    </div>
  );
}
