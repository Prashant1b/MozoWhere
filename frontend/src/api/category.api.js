import { api } from "./axios";

export const categoryApi = {
  list: (params = {}) => api.get("/categories", { params }),
  create: (payload) => api.post("/categories", payload),
  update: (id, payload) => api.put(`/categories/${id}`, payload),
  remove: (id) => api.delete(`/categories/${id}`),
};
