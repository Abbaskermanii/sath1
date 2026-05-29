"use client";

import { useEffect, useRef, useState } from "react";
import Navbar from "./Navbar";
import Menue from "./Menue";
import {
  Search,
  ChevronDown,
  User,
  Settings,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  clearTokens,
  getUserIdFromAccess,
  getUserNameFromAccess,
  isLoggedIn,
} from "@/app/lib/tokens";

function HeaderMenue() {
  const router = useRouter();

  const [show, setShow] = useState(true);
  const [lastScroll, setLastScroll] = useState(0);

  const [loggedIn, setLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);

  useEffect(() => {
    const currentLoggedIn = isLoggedIn();
    setLoggedIn(currentLoggedIn);

    if (currentLoggedIn) {
      setUserName(getUserNameFromAccess());
    }
  }, []);

  const handleLoginClick = () => {
    router.push("/auth");
  };

  const handleLogout = () => {
    clearTokens();
    setLoggedIn(false);
    setUserName("");
    setDropdownOpen(false);
    router.push("/");
  };

  const handleDashboard = () => {
    const userId = getUserIdFromAccess();
    setDropdownOpen(false);
    router.push(userId ? `/author/dashboard?user_id=${userId}` : "/");
  };

  const handleSettings = () => {
    setDropdownOpen(false);
    router.push("/settings");
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;

      if (currentScroll > lastScroll && currentScroll > 80) {
        setShow(false);
      } else {
        setShow(true);
      }

      setLastScroll(currentScroll);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScroll]);

  // بستن dropdown با کلیک بیرون
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      dir="rtl"
      className={`fixed top-0 left-0 w-full z-50 bg-black transition-transform duration-300 ${
        show ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <Navbar />
      <div className="flex max-w-7xl mx-auto items-center justify-between h-14 px-4">
        <h1 className="text-white text-3xl font-semibold">شاخص یک</h1>

        <div className="flex gap-3 items-center">
          <Search color="white" className="cursor-pointer" />

          {!loggedIn ? (
            <button
              type="button"
              onClick={handleLoginClick}
              className="bg-white w-28 h-8 font-medium text-[14px] rounded-md text-black hover:bg-gray-200 transition cursor-pointer"
            >
              ورود / ثبت نام
            </button>
          ) : (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 bg-white text-black px-3 h-9 rounded-md hover:bg-gray-200 transition"
              >
                <User size={18} />
                <span className="max-w-30 truncate">{userName}</span>
                <ChevronDown size={16} />
              </button>

              {dropdownOpen && (
                <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 z-50">
                  <button
                    onClick={handleDashboard}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-right hover:bg-gray-100 transition"
                  >
                    <LayoutDashboard size={16} />
                    داشبورد
                  </button>

                  <button
                    onClick={handleSettings}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-right hover:bg-gray-100 transition"
                  >
                    <Settings size={16} />
                    تنظیمات
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-right text-red-600 hover:bg-red-50 transition"
                  >
                    <LogOut size={16} />
                    خروج
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <Menue />
    </div>
  );
}

export default HeaderMenue;
