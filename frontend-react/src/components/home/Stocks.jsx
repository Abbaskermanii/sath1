import { useEffect, useMemo, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, FreeMode } from "swiper/modules";
import "swiper/css";

import {
  getMarketItems,
  FALLBACK_MARKET_ITEMS,
} from "../../lib/market/marketApi";

export default function Stocks() {
  const [items, setItems] = useState(FALLBACK_MARKET_ITEMS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function loadMarketItems() {
      try {
        const result = await getMarketItems();

        if (!ignore) {
          setItems(result);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadMarketItems();

    return () => {
      ignore = true;
    };
  }, []);

  const loopData = useMemo(() => {
    const visibleItems = items.filter((item) => item.active !== false);
    const safeItems =
      visibleItems.length > 0 ? visibleItems : FALLBACK_MARKET_ITEMS;

    return [...safeItems, ...safeItems];
  }, [items]);

  return (
    <div className="w-full py-4 overflow-hidden bg-transparent">
      <Swiper
        modules={[Autoplay, FreeMode]}
        loop
        slidesPerView="auto"
        spaceBetween={12}
        freeMode
        freeModeMomentum={false}
        speed={8000}
        autoplay={{
          delay: 0,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        className="[&_.swiper-wrapper]:!transition-timing-function-[linear]"
      >
        {loopData.map((item, index) => (
          <SwiperSlide
            key={`${item.id ?? item.symbol ?? item.title}-${index}`}
            style={{ width: "auto" }}
          >
            <div className="flex items-center gap-2.5 bg-neutral-800 px-5 py-2 rounded-xl whitespace-nowrap text-[12px] text-gray-200 border border-gray-800 transform-gpu will-change-transform transition-transform duration-300 ease-out hover:scale-[1.02]">
              <span className="font-semibold">{item.title}</span>
              <span className="text-gray-400">{item.value || "-"}</span>
              <span
                className={
                  item.active
                    ? "font-semibold text-green-500"
                    : "font-semibold text-red-500"
                }
              >
                {loading ? "..." : item.subtitle || item.symbol || ""}
              </span>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
