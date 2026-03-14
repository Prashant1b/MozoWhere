
import { api } from "./axios";

export const userApi = {
  profile: () => api.get("/user/profile"),
  deleteAccount: () => api.delete("/user/profile/delete"),
  updatePassword: (data) => api.post("/user/updatepassword", data),
};