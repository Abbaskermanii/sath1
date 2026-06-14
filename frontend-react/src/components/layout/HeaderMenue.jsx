import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import HeaderSearch from "../layout/HeaderSearch";
import Menue from "./Menue";

import {
  ChevronDown,
  User,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  Zap,
  Tag,
  ArrowLeft,
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
    { label: "مصاحبه", slug: "interview" },
    { label: "یادداشت", slug: "note" },
    { label: "خبر", slug: "news" },
    { label: "تحلیل", slug: "analysis" },
    { label: "گفتگوهای شاخص", slug: "talk" },
    { label: "گزارش", slug: "report" },
    { label: "نمودار", slug: "chart" },
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
              className="md:hidden flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-800 text-white active:scale-95 transition"
            >
              <Menu size={22} />
            </button>

            <button
              type="button"
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-white cursor-pointer"
            >
              <span className="text-2xl sm:text-3xl font-black tracking-tighter">
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
                className="hidden sm:flex items-center justify-center bg-white w-32 h-9 font-bold text-[13px] rounded-lg text-black hover:bg-gray-100 transition cursor-pointer active:scale-95"
              >
                ورود / ثبت نام
              </button>
            ) : (
              <div className="relative hidden sm:block" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2 bg-neutral-800 text-white px-3 h-9 rounded-lg hover:bg-neutral-700 transition cursor-pointer border border-white/10"
                >
                  <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center text-[10px] font-bold">
                    {user?.username?.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-28 truncate text-sm">
                    {loading ? "..." : user?.username || "کاربر"}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {dropdownOpen && (
                  <div className="absolute left-0 mt-2 w-52 bg-neutral-900 rounded-xl shadow-2xl overflow-hidden border border-white/10 z-50 animate-in fade-in slide-in-from-top-2">
                    {canAccessDashboard(user) && (
                      <button
                        type="button"
                        onClick={handleDashboard}
                        className="w-full flex items-center gap-3 px-4 py-3.5 text-sm text-right text-neutral-300 hover:bg-white/5 transition"
                      >
                        <LayoutDashboard size={16} className="text-red-500" />
                        داشبورد مدیریت
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3.5 text-sm text-right text-red-400 hover:bg-red-500/5 transition border-t border-white/5"
                    >
                      <LogOut size={16} />
                      خروج از حساب
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <Menue />
      </div>

      {/* --- MOBILE SIDEBAR --- */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] md:hidden" dir="rtl">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity"
            onClick={closeMobileMenu}
          />

          <aside className="absolute right-0 top-0 h-full w-[82%] max-w-[320px] bg-neutral-950 flex flex-col shadow-2xl border-l border-white/10 animate-in slide-in-from-right duration-300">
            {/* 1. Header Sidebar */}
            <div className="flex items-center justify-between p-5 border-b border-white/5 bg-neutral-950/50">
              <span className="text-xl font-black text-white">شاخص اول</span>
              <button
                onClick={closeMobileMenu}
                className="p-2 rounded-lg bg-neutral-800 text-neutral-400"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8">
              {/* 2. User Card */}
              <section>
                {shouldShowUserMenu ? (
                  <div className="bg-neutral-900 rounded-2xl p-4 border border-white/10 shadow-inner">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 to-red-400 flex items-center justify-center font-bold text-lg text-white shadow-lg">
                        {user?.username?.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-white text-sm truncate">
                          {user?.full_name || user?.username}
                        </h4>
                        <p className="text-[10px] text-neutral-500">
                          خوش آمدید به شاخص اول
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {canAccessDashboard(user) && (
                        <button
                          onClick={handleDashboard}
                          className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 text-[11px] font-medium text-neutral-300"
                        >
                          <LayoutDashboard size={14} /> داشبورد
                        </button>
                      )}
                      <button
                        onClick={handleLogout}
                        className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/10 text-[11px] font-medium text-red-400"
                      >
                        <LogOut size={14} /> خروج
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleLoginClick}
                    className="w-full flex items-center justify-center gap-2 bg-white text-black h-12 rounded-2xl font-bold text-sm active:scale-95 transition"
                  >
                    <User size={18} />
                    ورود یا ثبت‌نام کاربر
                  </button>
                )}
              </section>

              {/* 3. News Services (Grid) */}
              <section>
                <div className="flex items-center gap-2 mb-4 px-1 text-neutral-500">
                  <Zap size={14} className="text-yellow-500" />
                  <span className="text-[11px] font-bold uppercase tracking-widest">
                    سرویس‌های خبری
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {topMenuItems.map((item) => (
                    <NavLink
                      key={item.slug}
                      to={`/type/${item.slug}`}
                      onClick={closeMobileMenu}
                      className={({ isActive }) =>
                        `flex items-center justify-center h-11 rounded-xl text-xs font-semibold border transition-all ${
                          isActive
                            ? "bg-red-600 border-red-600 text-white shadow-lg shadow-red-600/20"
                            : "bg-neutral-900 border-white/5 text-neutral-400 hover:bg-neutral-800"
                        }`
                      }
                    >
                      {item.label}
                    </NavLink>
                  ))}
                </div>
              </section>

              {/* 4. Categories (Modern List) */}
              <section>
                <div className="flex items-center gap-2 mb-4 px-1 text-neutral-500">
                  <Tag size={14} className="text-red-500" />
                  <span className="text-[11px] font-bold uppercase tracking-widest">
                    دسته‌بندی موضوعی
                  </span>
                </div>
                <div className="space-y-1.5">
                  {categoriesLoading
                    ? [1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="h-12 w-full bg-neutral-900 animate-pulse rounded-xl"
                        />
                      ))
                    : categories.map((cat) => (
                        <NavLink
                          key={cat.slug}
                          to={`/category/${cat.slug}`}
                          onClick={closeMobileMenu}
                          className={({ isActive }) =>
                            `flex items-center justify-between px-4 h-12 rounded-xl transition-all ${
                              isActive
                                ? "bg-white text-black font-bold"
                                : "bg-neutral-900/50 text-neutral-400 hover:text-white"
                            }`
                          }
                        >
                          <span className="text-sm">{cat.title}</span>
                          <ArrowLeft size={14} className="opacity-30" />
                        </NavLink>
                      ))}
                </div>
              </section>
            </div>

            {/* 5. Footer Info */}
            <div className="p-6 border-t border-white/5 bg-neutral-950">
              <div className="flex justify-between items-center opacity-40">
                <span className="text-[10px] text-white">ShakhesAval News</span>
                <span className="text-[10px] text-white font-mono">v2.4.5</span>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

export default HeaderMenue;
