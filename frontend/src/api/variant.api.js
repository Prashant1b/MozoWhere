
import { api } from "./axios";

export const variantApi = {
  listByProduct: (productId) => api.get(`/variants/product/${productId}`),

  // admin
  create: (productId, payload) => api.post(`/variants/product/${productId}`, payload),
  update: (id, payload) => api.put(`/variants/${id}`, payload),
  remove: (id) => api.delete(`/variants/${id}`),
  adminListAll: (params) => api.get(`/variants/admin/all`, { params }),
  toggleActive: (id) => api.patch(`/variants/${id}/active`),
};