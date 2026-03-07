import axios from "axios";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://mahalakshmi.onrender.com/api";

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true
});
