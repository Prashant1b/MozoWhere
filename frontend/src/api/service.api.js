import { api } from "./axios";

export const serviceApi = {
  listPublic: () => api.get("/services"),
  listAll: () => api.get("/services/all"),
  create: (data) => api.post("/services", data),
  update: (id, data) => api.put(`/services/${id}`, data),
  remove: (id) => api.delete(`/services/${id}`),
};
