import axios from "axios";

const BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://mahalakshmi.onrender.com";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const get = async (url: string) => {
  const res = await api.get(url);
  return res.data;
};

export const post = async (url: string, data: any) => {
  const res = await api.post(url, data);
  return res.data;
};

export const put = async (url: string, data: any) => {
  const res = await api.put(url, data);
  return res.data;
};

export const del = async (url: string) => {
  const res = await api.delete(url);
  return res.data;
};
