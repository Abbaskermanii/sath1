"use client";

import Image from "next/image";
import { Play, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

export default function SnowflakeVideoCard({ videos = [] }) {
  const [index, setIndex] = useState(0);

  const current = videos[index];

  const next = () => setIndex((p) => (p + 1) % videos.length);
  const prev = () => setIndex((p) => (p - 1 + videos.length) % videos.length);

  if (!current) return null;

  return (
    <div dir="rtl" className="max-w-md mx-auto bg-white overflow-hidden">

      {/* HEADER */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
        <h2 className="text-lg font-bold text-gray-900">
          ویدیوهای امروز
        </h2>
      </div>

      {/* VIDEO */}
      <div className="relative m-4 rounded-xl overflow-hidden bg-black group">

        {/* IMAGE */}
        <div className="relative w-full aspect-video">
          <Image
            src={current.image}
            alt={current.title}
            fill
            className="
              object-cover
              transform-gpu
              transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]
              group-hover:scale-[1.04]
            "
          />
        </div>

        {/* GRADIENT */}
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />

        {/* PLAY BUTTON */}
        <button
          onClick={next}
          className="
            absolute inset-0 z-10 flex items-center justify-center
            transition-opacity duration-500 ease-out
            opacity-100 group-hover:opacity-100
          "
        >
          <div className="
            flex h-12 w-12 items-center justify-center
            rounded-full bg-white/90 shadow-md
            transition-all duration-500 ease-out
            hover:scale-110
          ">
            <Play className="w-6 h-6 text-red-600 ml-0.5" fill="currentColor" />
          </div>
        </button>

        {/* DURATION */}
        <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded z-20">
          {current.duration}
        </div>
      </div>

      {/* TITLE */}
      <div className="px-5 pb-3 text-right">
        <h3 className="
          text-base font-bold text-gray-900 line-clamp-2 leading-snug min-h-12
          transition-colors duration-500 ease-out
          group-hover:text-gray-700
        ">
          {current.title}
        </h3>
      </div>

      {/* CONTROLS */}
      <div className="flex items-center justify-between px-5 pb-5">

        {/* DOTS */}
        <div className="flex gap-2">
          {videos.map((_, i) => (
            <span
              key={i}
              className={`
                w-2.5 h-2.5 rounded-full
                transition-all duration-500 ease-out
                ${i === index ? "bg-gray-900 scale-110" : "bg-gray-300"}
              `}
            />
          ))}
        </div>

        {/* BUTTONS */}
        <div className="flex items-center gap-2">

          <button
            onClick={prev}
            className="
              w-8 h-8 flex items-center justify-center
              rounded-full border border-gray-300
              transition-all duration-300 ease-out
              hover:bg-gray-100 hover:scale-105
            "
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={next}
            className="
              w-8 h-8 flex items-center justify-center
              rounded-full border border-gray-300
              transition-all duration-300 ease-out
              hover:bg-gray-100 hover:scale-105
            "
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

        </div>
      </div>
    </div>
  );
}