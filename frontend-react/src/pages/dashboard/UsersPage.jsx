import { useEffect, useState } from "react";
import {api} from "../../lib/axiosClient";
import AdminGuard from "../../lib/AdminGuard";

function UsersPageContent() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [next, setNext] = useState(null);
  const [previous, setPrevious] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async (url = "/accounts/admin/users/") => {
    try {
      setLoading(true);
      const res = await api.get(url);
      setUsers(res.data.results);
      setNext(res.data.next);
      setPrevious(res.data.previous);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearch = () => {
    fetchUsers(`/accounts/admin/users/?search=${search}`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("مطمئنی میخوای حذف کنی؟")) return;

    try {
      await api.delete(`/accounts/admin/users/${id}/`);
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRoleChange = async (id, role) => {
    try {
      await api.patch(`/accounts/admin/users/${id}/`, { role });
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">مدیریت کاربران</h2>

      {/* Search */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="جستجو..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 rounded w-64"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-500 text-white px-4 rounded"
        >
          جستجو
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <p>در حال بارگذاری...</p>
      ) : (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2">ID</th>
              <th>نام کاربری</th>
              <th>ایمیل</th>
              <th>نقش</th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((user) => (
              <tr key={user.id} className="border-t text-center">
                <td className="p-2">{user.id}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>

                <td>
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className="border px-2 py-1 rounded"
                  >
                    <option value="user">User</option>
                    <option value="author">Author</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>

                <td>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Pagination */}
      <div className="flex gap-2 mt-4">
        {previous && (
          <button
            onClick={() => fetchUsers(previous)}
            className="px-4 py-2 bg-gray-200 rounded"
          >
            قبلی
          </button>
        )}
        {next && (
          <button
            onClick={() => fetchUsers(next)}
            className="px-4 py-2 bg-gray-200 rounded"
          >
            بعدی
          </button>
        )}
      </div>
    </div>
  );
}

export default function UsersPage() {
  return (
    <AdminGuard>
      <UsersPageContent />
    </AdminGuard>
  );
}
