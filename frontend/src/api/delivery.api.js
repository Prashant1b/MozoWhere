import { api } from "./axios";

export const deliveryApi = {
  // Public: check delivery charge for pincode
  check: (pincode) => api.get(`/delivery/check/${pincode}`),

  // Admin: list all delivery charges
  list: () => api.get("/delivery"),

  // Admin: create or update delivery charge
  upsert: (data) => api.post("/delivery", data),

  // Admin: bulk import
  bulkImport: (charges) => api.post("/delivery/bulk", { charges }),

  // Admin: delete delivery charge
  remove: (id) => api.delete(`/delivery/${id}`),
};
