import { io } from "socket.io-client"

const URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://app-production-7a53.up.railway.app" ||
  "https://mahalakshmi.onrender.com"

export const socket = io(URL, {
  transports: ["websocket"],
  withCredentials: true
})
