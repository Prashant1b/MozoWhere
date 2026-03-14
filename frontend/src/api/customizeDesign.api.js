import { api } from "./axios";

export const customizeDesignApi = {
  create: (payload) => api.post("/customize/designs", payload),
  update: (id, payload) => api.put(`/customize/designs/${id}`, payload),
  setReady: (id) => api.post(`/customize/designs/${id}/ready`),
  finalizeAndCart: (payload) => api.post("/customize/designs/finalize-and-cart", payload),
};
