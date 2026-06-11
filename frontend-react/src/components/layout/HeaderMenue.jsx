import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import HeaderSearch from "../layout/HeaderSearch";
import Menue from "./Menue";

import {
  ChevronDown,
  User,
  Settings,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  Home,
  Search,
} from "lucide-react";

import { clearTokens, isLoggedIn } from "../../lib/tokens";
import useMe from "../../hooks/useMe";
import useCategories from "../../hooks/useCategories";
import { canAccessDashboard } from "../../lib/authApi";

function HeaderMenue() {
  const navigate = useNavigate();

  const [show, setShow] = useState(true);
  const [lastScroll, setLastScroll] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [mounted, setMounted] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  const dropdownRef = useRef(null);

  const { user, loading } = useMe();
  const { categories, loading: categoriesLoading } = useCategories(10);

  const topMenuItems = [
    "مصاحبه",
    "یادداشت",
    "خبر",
    "تحلیل",
    "گفتگوهای شاخص",
    "گزارش",
    "نمودار",
  ];

  useEffect(() => {
    setMounted(true);
    setLoggedIn(isLoggedIn());
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const handleLoginClick = () => {
    closeMobileMenu();
    navigate("/auth");
  };

  const handleLogout = () => {
    clearTokens();
    setLoggedIn(false);
    setDropdownOpen(false);
    closeMobileMenu();
    navigate("/");
  };

  const handleDashboard = () => {
    setDropdownOpen(false);
    closeMobileMenu();
    navigate("/dashboard");
  };

  const handleSettings = () => {
    setDropdownOpen(false);
    closeMobileMenu();
    navigate("/settings");
  };

  const shouldShowUserMenu = mounted && loggedIn;

  return (
    <>
      <div
        dir="rtl"
        className={`fixed top-0 left-0 w-full z-50 bg-black transition-transform duration-300 ${
          show ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <Navbar />

        <div className="flex max-w-7xl mx-auto items-center justify-between h-16 md:h-18 px-4 md:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-800 text-white"
              aria-label="باز کردن منو"
            >
              <Menu size={24} />
            </button>

            <button
              type="button"
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-white cursor-pointer shrink-0"
            >
              <span className="text-2xl sm:text-3xl md:text-4xl font-extrabold">
                شاخص اول
              </span>
            </button>
          </div>

          <div className="flex gap-2 md:gap-3 items-center">
            <HeaderSearch />

            {!shouldShowUserMenu ? (
              <button
                type="button"
                onClick={handleLoginClick}
                className="hidden sm:block bg-white w-28 h-8 font-medium text-[14px] rounded-md text-black hover:bg-gray-200 transition cursor-pointer"
              >
                ورود / ثبت نام
              </button>
            ) : (
              <div className="relative hidden sm:block" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2 bg-white text-black px-3 h-9 rounded-md hover:bg-gray-200 transition cursor-pointer"
                >
                  <User size={18} />
                  <span className="max-w-30 truncate">
                    {loading
                      ? "..."
                      : user?.username || user?.full_name || "کاربر"}
                  </span>
                  <ChevronDown size={16} />
                </button>

                {dropdownOpen && (
                  <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 z-50">
                    {canAccessDashboard(user) && (
                      <button
                        type="button"
                        onClick={handleDashboard}
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm text-right hover:bg-gray-100 transition cursor-pointer"
                      >
                        <LayoutDashboard size={16} />
                        داشبورد
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleSettings}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm text-right hover:bg-gray-100 transition cursor-pointer"
                    >
                      <Settings size={16} />
                      تنظیمات
                    </button>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm text-right text-red-600 hover:bg-red-50 transition cursor-pointer"
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

      {/* Mobile Mega Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] md:hidden" dir="rtl">
          {/* Backdrop with Blur */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
            onClick={closeMobileMenu}
          />

          {/* Menu Content */}
          <aside className="absolute right-0 top-0 h-full w-[85%] max-w-[340px] flex flex-col bg-neutral-900 text-white shadow-2xl transition-transform duration-300 ease-out border-l border-white/10">
            {/* Header of Menu */}
            <div className="flex items-center justify-between px-5 py-5 border-b border-white/5 bg-neutral-900/50 backdrop-blur-md sticky top-0 z-20">
              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-tighter text-white">
                  شاخص اول
                </span>
                <span className="text-[10px] text-neutral-400 font-medium">
                  نخستین مرجع تحلیل و خبر
                </span>
              </div>
              <button
                onClick={closeMobileMenu}
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Scrollable Area */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar pb-10">
              {/* 1. User Section Card */}
              <div className="px-4 py-6">
                {shouldShowUserMenu ? (
                  <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-2xl p-4 border border-white/10 shadow-xl">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center font-bold text-lg border-2 border-white/20">
                          {user?.username?.charAt(0) || <User size={20} />}
                        </div>
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-neutral-900 rounded-full"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">
                          {user?.full_name || user?.username || "کاربر گرامی"}
                        </p>
                        <p className="text-[11px] text-neutral-400 truncate">
                          خوش آمدید
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {canAccessDashboard(user) && (
                        <button
                          onClick={handleDashboard}
                          className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-[12px] transition"
                        >
                          <LayoutDashboard size={16} className="text-red-500" />
                          داشبورد
                        </button>
                      )}
                      <button
                        onClick={handleSettings}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-[12px] transition"
                      >
                        <Settings size={16} className="text-neutral-400" />
                        تنظیمات
                      </button>
                      <button
                        onClick={handleLogout}
                        className="col-span-2 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-[12px] text-red-400 transition mt-1"
                      >
                        <LogOut size={16} />
                        خروج از حساب
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleLoginClick}
                    className="w-full group relative overflow-hidden rounded-2xl bg-white p-4 transition-all hover:scale-[0.98]"
                  >
                    <div className="relative z-10 flex items-center justify-center gap-2 font-bold text-black">
                      <User size={18} />
                      <span>ورود یا ثبت نام</span>
                    </div>
                  </button>
                )}
              </div>

              {/* 2. Quick Access Grid */}
              <div className="px-4 mb-8">
                <h3 className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest mb-4 px-1">
                  دسترسی سریع
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <NavLink
                    to="/"
                    onClick={closeMobileMenu}
                    className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-neutral-800/40 border border-white/5 hover:bg-neutral-800 transition"
                  >
                    <Home size={20} className="text-blue-400" />
                    <span className="text-[10px] font-medium">خانه</span>
                  </NavLink>
                  <div className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-neutral-800/40 border border-white/5">
                    <Search size={20} className="text-amber-400" />
                    <span className="text-[10px] font-medium">جستجو</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-neutral-800/40 border border-white/5">
                    <div className="w-5 h-5 rounded bg-yellow-500 flex items-center justify-center text-[10px] text-black font-black">
                      !
                    </div>
                    <span className="text-[10px] font-medium">مهم‌ترین‌ها</span>
                  </div>
                </div>
              </div>

              {/* 3. Main Sections (The Navbar items) */}
              <div className="px-4 mb-8">
                <h3 className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest mb-3 px-1">
                  سرویس‌های خبری
                </h3>
                <div className="flex flex-wrap gap-2">
                  {topMenuItems.map((item) => (
                    <button
                      key={item}
                      className={`px-4 py-2 rounded-full text-xs font-medium border border-white/5 transition-all ${
                        item === "گفتگوهای شاخص"
                          ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                          : "bg-neutral-800/50 text-neutral-300 hover:bg-neutral-700"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Categories Section */}
              <div className="px-4">
                <h3 className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest mb-3 px-1">
                  دسته‌بندی موضوعی
                </h3>
                <nav className="space-y-1">
                  {categoriesLoading
                    ? [1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="h-12 w-full bg-white/5 animate-pulse rounded-xl"
                        />
                      ))
                    : categories.map((category) => (
                        <NavLink
                          key={category.id || category.slug}
                          to={`/category/${category.slug}`}
                          onClick={closeMobileMenu}
                          className={({ isActive }) =>
                            `flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-200 group ${
                              isActive
                                ? "bg-red-600 text-white shadow-lg shadow-red-600/20"
                                : "hover:bg-white/5 text-neutral-400 hover:text-white"
                            }`
                          }
                        >
                          <span className="text-sm font-semibold">
                            {category.title}
                          </span>
                          <ChevronDown
                            size={14}
                            className="-rotate-90 opacity-40 group-hover:opacity-100 transition-opacity"
                          />
                        </NavLink>
                      ))}
                </nav>
              </div>
            </div>

            {/* Footer of Menu */}
            <div className="p-5 border-t border-white/5 bg-neutral-900/80 backdrop-blur-md">
              <div className="flex items-center justify-between text-[10px] text-neutral-500">
                <span>نسخه 2.4.0</span>
                <div className="flex gap-3">
                  <span className="hover:text-white transition cursor-pointer">
                    درباره ما
                  </span>
                  <span className="hover:text-white transition cursor-pointer">
                    تماس
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

export default HeaderMenue;
