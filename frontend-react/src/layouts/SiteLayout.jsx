import { Outlet } from "react-router-dom";
import HeaderMenue from "../components/layout/HeaderMenue";
import Footer from "../components/layout/Footer";

export default function SiteLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-white" dir="ltr">
      <HeaderMenue />

      {/* 
          در موبایل (pt-24): فاصله مناسب برای هدر موبایل
          در دسکتاپ (lg:pt-[168px]): معادل مجموع pt-10 و pt-32 قبلی شما (42 واحد * 4 = 168px)
      */}
      <main className="flex-1 pt-16 lg:pt-42">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <Outlet />
        </div>
      </main>

      <Footer />
    </div>
  );
}
