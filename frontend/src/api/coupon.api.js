import { api } from "./axios";

export const couponApi = {
  list: () => api.get("/coupons"),
  create: (payload) => api.post("/coupons", payload),
  remove: (id) => api.delete(`/coupons/${id}`),
  apply: (code) => api.post("/coupons/apply", { code }),
};
