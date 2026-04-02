import { api } from "./axios";

export const userApi = {
  profile: () => api.get("/user/profile"),
  profileStats: () => api.get("/user/profile/stats"),
  updateProfile: (data) => api.put("/user/profile", data),
  deleteAccount: () => api.delete("/user/profile/delete"),
  updatePassword: (data) => api.post("/user/updatepassword", data),
};
