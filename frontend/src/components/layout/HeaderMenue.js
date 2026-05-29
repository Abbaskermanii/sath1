"use client";

import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import Menue from "./Menue";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";

function HeaderMenue() {
  const router = useRouter();

  const [show, setShow] = useState(true);
  const [lastScroll, setLastScroll] = useState(0);

  const handleLoginClick = () => {
    router.push("/login");
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;

      if (currentScroll > lastScroll && currentScroll > 80) {
        // اسکرول به پایین → مخفی
        setShow(false);
      } else {
        // اسکرول به بالا → نمایش
        setShow(true);
      }

      setLastScroll(currentScroll);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScroll]);

  return (
    <div
      dir="rtl"
      className={`fixed top-0 left-0 w-full z-50 bg-black transition-transform duration-300 ${
        show ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <Navbar />

      <div className="flex max-w-7xl mx-auto items-center justify-between h-14">
        {/* Title */}
        <h1 className="text-white text-3xl font-semibold">شاخص یک</h1>

        {/* Actions */}
        <div className="flex gap-3 items-center">
          <Search color="white" className="cursor-pointer" />

          <button
            type="button"
            onClick={handleLoginClick}
            className="bg-white w-28 h-8 font-medium text-[14px] rounded-md text-black hover:bg-gray-200 transition cursor-pointer"
          >
            ورود / ثبت نام
          </button>
        </div>
      </div>

      <Menue />
    </div>
  );
}

export default HeaderMenue;
