import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <main
      className="min-h-screen flex items-center justify-center"
      lang="fa"
      dir="rtl"
    >
      <div className="w-full">
        <Outlet />
      </div>
    </main>
  );
}
