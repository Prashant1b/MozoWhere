import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "https://mozowhere.onrender.com";

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});