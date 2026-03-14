import { api } from "./axios";

export const ordersApi = {
  createFromCart: (shippingAddress, paymentMethod, couponCode) =>
    api.post("/orders", { shippingAddress, paymentMethod, couponCode }),
  confirmCod: (orderId) => api.post(`/orders/${orderId}/cod`),
  myOrders: (page = 1, limit = 10) => api.get(`/orders?page=${page}&limit=${limit}`),
  getById: (id) => api.get(`/orders/${id}`),
};
