import axios from "axios";

const BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://mahalakshmi.onrender.com";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});
