"use client";

export default function Menue() {
  return (
    <div className="bg-neutral-800" dir="rtl">
      <ul className="max-w-7xl mx-auto flex gap-6 text-white text-sm font-md py-4">
        <li className="cursor-pointer hover:text-gray-300">پخش زنده</li>
        <li className="cursor-pointer hover:text-gray-300">بازارها</li>
        <li className="cursor-pointer hover:text-gray-300">مالی</li>
        <li className="cursor-pointer hover:text-gray-300">اقتصاد</li>
        <li className="cursor-pointer hover:text-gray-300">صنایع</li>
        <li className="cursor-pointer hover:text-gray-300">فناوری</li>
        <li className="cursor-pointer hover:text-gray-300">سیاست</li>
        <li className="cursor-pointer hover:text-gray-300">هفته‌نامه بیزینس</li>
        <li className="cursor-pointer hover:text-gray-300">دیدگاه</li>
        <li className="cursor-pointer hover:text-gray-300">ویدیو</li>
        <li className="cursor-pointer hover:text-gray-300">بیشتر</li>
      </ul>
    </div>
  );
}
