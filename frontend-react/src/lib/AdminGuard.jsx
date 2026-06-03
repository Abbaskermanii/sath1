import useRequireAuth from "../hooks/useRequireAuth";

export default function AdminGuard({ children }) {
  const { user, loading } = useRequireAuth(["admin"]);

  if (loading) {
    return (
      <div className="p-4 text-sm text-zinc-400">در حال بررسی دسترسی...</div>
    );
  }

  if (!user) return null;

  if (user.role !== "admin") return null;

  return children;
}
