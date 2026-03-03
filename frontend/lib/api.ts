import axios from 'axios';

export const api = axios.create({
baseURL: "https://mahalakshmi.onrender.com/api"
  withCredentials: true
});
