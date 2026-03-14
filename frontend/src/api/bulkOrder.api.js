import { api } from "./axios";

export const bulkOrderApi = {
  create: (payload) => api.post("/bulk-orders", payload),
};

