import { api } from "./axios";

export const adminUsersApi = {
  createAdmin: (payload) => api.post("/user/admin/register", payload),
};