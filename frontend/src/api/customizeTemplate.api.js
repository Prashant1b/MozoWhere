import { api } from "./axios";

export const customizeTemplateApi = {
  list: (params = {}) => api.get("/customize/templates", { params }),
  detail: (slug) => api.get(`/customize/templates/${slug}`),
  create: (payload) => api.post("/customize/templates", payload),
  update: (id, payload) => api.put(`/customize/templates/${id}`, payload),
  remove: (id) => api.delete(`/customize/templates/${id}`),
};
