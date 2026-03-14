
import { api } from "./axios";

export const authApi = {
  register: (data) => api.post("/user/register", data),
  login: (data) => api.post("/user/login", data),
  logout: () => api.post("/user/logout"),
};