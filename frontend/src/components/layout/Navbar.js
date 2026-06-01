"use client";

import { ChevronDown } from "lucide-react";

export default function Navbar() {
  return (
    <div className="bg-black h-12" dir="rtl">
      <div className="max-w-7xl mx-auto pt-3 flex">
        <ul className="flex text-amber-50 text-xs font-semibold divide-x divide-gray-600">
          <li className="flex gap-1 pl-5 cursor-pointer hover:text-white">
            شرکت بلومبرگ و محصولات آن
            <ChevronDown size={16} />
          </li>

          <li className="px-5 cursor-pointer hover:text-white">
            درخواست دمو ترمینال بلومبرگ
          </li>

          <li className="px-5 text-amber-400 cursor-pointer hover:text-amber-300">
            ورود از راه دور بلومبرگ Anywhere
          </li>

          <li className="pr-5 cursor-pointer hover:text-white">
            پشتیبانی مشتریان بلومبرگ
          </li>
        </ul>
      </div>
    </div>
  );
}
