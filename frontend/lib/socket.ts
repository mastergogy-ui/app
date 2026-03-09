import { io } from "socket.io-client"

const URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://mahalakshmi.onrender.com"

export const socket = io(URL,{
  transports:["websocket"]
})
