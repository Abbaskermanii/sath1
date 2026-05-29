export default function AuthLayout({ children }) {
  return (
    <main className="min-h-screen flex items-center justify-center ">
      <div className="w-full">{children}</div>
    </main>
  );
}
