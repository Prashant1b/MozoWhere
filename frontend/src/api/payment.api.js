import { api } from "./axios";

export const paymentApi = {
  createRazorpayOrder: (orderId) => api.post("/payments/order", { orderId }),
  verifyRazorpayPayment: (payload) => api.post("/payments/verify", payload),
};

