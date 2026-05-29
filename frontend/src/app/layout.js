import HeaderMenue from "@/components/layout/HeaderMenue";
import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <HeaderMenue />
        <main className="flex-1 pt-40">
          <div className="max-w-7xl mx-auto px-6">{children}</div>
        </main>
      </body>
    </html>
  );
}
