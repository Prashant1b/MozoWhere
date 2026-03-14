import { api } from "./axios";

export const productApi = {
  list: (params = {}) => api.get("/products", { params }),
  getById: (id) => api.get(`/products/id/${id}`),

  create: (payload) => api.post("/products", payload),
  update: (id, payload) => api.put(`/products/${id}`, payload),
  remove: (id) => api.delete(`/products/${id}`),
  getBySlug: (slug) => api.get(`/products/${slug}`),
  detail: (slug) => api.get(`/products/${slug}/detail`),
};