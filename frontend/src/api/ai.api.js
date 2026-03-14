import { api } from "./axios";

export const aiApi = {
  suggestDesign: (imageBase64) =>
    api.post("/ai/design-suggestions", { imageBase64 }),
};
