import { api } from "@/lib/axiosClient";

export const authorService = {
  stats: (userId) => api.get(`/author/dashboard/stats/${userId}/`).then(r => r.data),
  postList: (userId) => api.get(`/author/dashboard/post-list/${userId}/`).then(r => r.data),
  postDetail: (userId, postId) => api.get(`/author/dashboard/post-detail/${userId}/${postId}/`).then(r => r.data),
  createPost: (payload) => api.post(`/author/dashboard/post-create/`, payload).then(r => r.data),
  replyComment: (payload) => api.post(`/author/dashboard/reply-comment/`, payload).then(r => r.data),
  commentList: () => api.get(`/author/dashboard/comment-list/`).then(r => r.data),
  notiList: (userId) => api.get(`/author/dashboard/noti-list/${userId}/`).then(r => r.data),
  notiSeen: (noti_id) => api.post(`/author/dashboard/noti-mark-seen/`, { noti_id }).then(r => r.data),
};
