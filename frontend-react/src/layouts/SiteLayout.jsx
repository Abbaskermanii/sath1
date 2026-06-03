import { Outlet } from "react-router-dom";
import HeaderMenue from "../components/layout/HeaderMenue";
import Footer from "../components/layout/Footer";

export default function SiteLayout() {
  return (
    <div className="min-h-screen flex flex-col pt-10" dir="ltr">
      <HeaderMenue />
      <main className="flex-1 pt-32">
        <div className="max-w-7xl mx-auto px-6">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
}
