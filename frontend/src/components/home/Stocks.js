"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, FreeMode } from "swiper/modules";

import "swiper/css";

function Stocks() {
  const data = [
    { name: "Nasdaq", value: "26,656.18", change: "+1.19%", up: true },
    { name: "B500", value: "2,714.91", change: "+0.63%", up: true },
    { name: "US 10 Yr", value: "4.46", change: "+0.17%", up: true },
    { name: "Crude Oil", value: "90.45", change: "-3.66%", up: false },
    { name: "FTSE 100", value: "10,520.84", change: "+0.28%", up: true },
    { name: "Gold", value: "4,504.30", change: "-0.68%", up: false },
  ];

  const loopData = [...data, ...data];

  return (
    <div className="w-full py-4 overflow-hidden bg-transparent">

      <Swiper
        modules={[Autoplay, FreeMode]}
        loop={true}
        slidesPerView="auto"
        spaceBetween={12}
        freeMode={true}
        freeModeMomentum={false}

        // 🔥 مهم‌ترین بخش برای smooth واقعی
        speed={8000}

        autoplay={{
          delay: 0,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}

        // 🔥 جلوگیری از jerk
        className="[&_.swiper-wrapper]:transition-timing-function_linear"
      >
        {loopData.map((item, i) => (
          <SwiperSlide key={i} style={{ width: "auto" }}>
            <div
              className="
                flex items-center gap-2.5
                bg-neutral-800 px-5 py-2
                rounded-xl whitespace-nowrap
                text-[12px] text-gray-200
                border border-gray-800

                transform-gpu
                will-change-transform
                transition-all duration-300 ease-out
                hover:scale-[1.02]
              "
            >
              <span className="font-semibold">{item.name}</span>

              <span className="text-gray-400">{item.value}</span>

              <span
                className={`font-semibold ${
                  item.up ? "text-green-500" : "text-red-500"
                }`}
              >
                {item.change}
              </span>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

export default Stocks;