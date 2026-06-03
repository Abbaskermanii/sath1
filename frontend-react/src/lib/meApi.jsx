import { api } from "./axiosClient";

export const getMeApi = () => api.get("/accounts/me/").then(r => r.data);
export const updateProfileApi = (data) => api.patch("/accounts/me/profile/", data);
