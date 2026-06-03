import { useEffect, useState } from "react";
import { dashboardApi } from "../../lib/dashboard/dashboardApi";
import { api } from "../../lib/axiosClient";

export default function ModerationCommentsPage() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await dashboardApi.getModerationComments();
      setComments(res);
    } catch (err) {
      console.error("Error fetching comments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("آیا از حذف این دیدگاه اطمینان دارید؟")) return;
    try {
      await api.delete(`/news/comments/${id}/`);
      setComments((prev) => prev.filter((c) => c.id !== id));
      alert("دیدگاه با موفقیت حذف شد.");
    } catch {
      alert("خطا در حذف دیدگاه");
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.patch(`/news/comments/${id}/`, { is_approved: true });
      alert("دیدگاه تایید شد.");
      fetchComments();
    } catch (err) {
      console.error("Approve error:", err);
      alert("خطا در تایید (ممکن است متد PATCH برای این آدرس تعریف نشده باشد)");
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">مدیریت دیدگاه‌ها</h1>
        <button
          onClick={fetchComments}
          className="text-sm bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1 rounded-lg transition-colors"
        >
          بروزرسانی لیست
        </button>
      </div>

      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-zinc-500">
            در حال دریافت دیدگاه‌ها...
          </div>
        ) : comments.length === 0 ? (
          <div className="p-10 text-center text-zinc-500">
            دیدگاه جدیدی برای بررسی وجود ندارد.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-zinc-800 text-zinc-400 text-sm">
                <tr>
                  <th className="p-4">کاربر</th>
                  <th className="p-4">متن دیدگاه</th>
                  <th className="p-4">تاریخ</th>
                  <th className="p-4">وضعیت</th>
                  <th className="p-4">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {comments.map((comment) => (
                  <tr
                    key={comment.id}
                    className="hover:bg-zinc-800/30 transition-colors"
                  >
                    <td className="p-4 text-sm font-medium">
                      {comment.user?.full_name ||
                        comment.user?.email ||
                        "کاربر ناشناس"}
                    </td>
                    <td className="p-4 text-sm text-zinc-300 max-w-xs">
                      <p className="line-clamp-2">{comment.text}</p>
                    </td>
                    <td className="p-4 text-xs text-zinc-500">
                      {new Date(comment.created_at).toLocaleDateString("fa-IR")}
                    </td>
                    <td className="p-4">
                      {comment.is_approved ? (
                        <span className="text-[10px] bg-green-500/10 text-green-500 px-2 py-1 rounded-full">
                          تایید شده
                        </span>
                      ) : (
                        <span className="text-[10px] bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded-full">
                          در انتظار
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {!comment.is_approved && (
                          <button
                            onClick={() => handleApprove(comment.id)}
                            className="text-xs text-green-400 hover:underline"
                          >
                            تایید
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(comment.id)}
                          className="text-xs text-red-400 hover:underline"
                        >
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
