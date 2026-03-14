import { api } from "./axios";

export const adminApi = {
  listOrders: () => api.get("/admin/orders"),
  getOrderDetail: (id) => api.get(`/admin/orders/${id}`),
  updateOrderStatus: (id, orderStatus) =>
    api.put(`/admin/orders/${id}/status`, { orderStatus }),
  listBulkOrders: () => api.get("/bulk-orders"),
  updateBulkOrderStatus: (id, status) => api.patch(`/bulk-orders/${id}/status`, { status }),

  // User management
  listUsers: () => api.get("/admin/users"),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  toggleCodBlock: (id) => api.patch(`/admin/users/${id}/cod-block`),
};
