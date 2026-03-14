import { api } from "./axios";

export const cartApi = {
  getMyCart: () => api.get("/cart"),
  add: ({ variantId, quantity = 1 }) => api.post("/cart/add", { variantId, quantity }),
  addProduct: ({ productId, quantity = 1 }) => api.post("/cart/add-product", { productId, quantity }),
  addCustom: ({ designId, quantity = 1 }) => api.post("/cart/add-custom", { designId, quantity }),
  updateQty: ({ variantId, quantity }) => api.put("/cart/item", { variantId, quantity }),
  removeItem: (variantId) => api.delete(`/cart/item/${variantId}`),
  removeCustomItem: (itemId) => api.delete(`/cart/custom-item/${itemId}`),
  clear: () => api.delete("/cart/clear"),
};
