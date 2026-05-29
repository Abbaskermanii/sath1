"use client";

import Image from "next/image";
import { Play, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

export default function SnowflakeVideoCard({ videos = [] }) {
  const [index, setIndex] = useState(0);

  const current = videos[index];

  const next = () => {
    setIndex((p) => (p + 1) % videos.length);
  };

  const prev = () => {
    setIndex((p) => (p - 1 + videos.length) % videos.length);
  };

  if (!current) return null;

  return (
    <div dir="rtl" className="max-w-md mx-auto bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
        <h2 className="text-lg font-bold text-gray-900">ویدیوهای امروز</h2>
      </div>

      {/* VIDEO */}
      <div className="relative m-4 rounded-xl overflow-hidden bg-black group">
        {/* IMAGE */}
        <div className="relative w-full aspect-video">
          <Image
            src={current.image}
            alt={current.title}
            fill
            className="object-cover group-hover:scale-105 transition duration-300"
          />
        </div>

        {/* GRADIENT */}
        <div className="absolute inset-0 bg-linear-to-t from-black/70 to-transparent" />

        {/* PLAY ONLY (center) */}
        <button
          onClick={next}
          className="absolute inset-0 flex items-center justify-center z-10"
        >
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:scale-110 transition">
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
        <h3 className="text-base font-bold text-gray-900 line-clamp-2 leading-snug min-h-12">
          {current.title}
        </h3>
      </div>

      {/* CONTROLS (ONLY HERE, NOT ON IMAGE) */}
      <div className="flex items-center justify-between px-5 pb-5">
        {/* DOTS */}
        <div className="flex gap-2">
          {videos.map((_, i) => (
            <span
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition ${
                i === index ? "bg-gray-900" : "bg-gray-300"
              }`}
            />
          ))}
        </div>

        {/* BUTTONS */}
        <div className="flex items-center gap-2">
          <button
            onClick={prev}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={next}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
