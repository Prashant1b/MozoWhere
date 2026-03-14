import { api } from "./axios";

export const wishlistApi = {
  get: () => api.get("/wishlist"),
  toggle: (productId) => api.post("/wishlist/toggle", { productId }),
};